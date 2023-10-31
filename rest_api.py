# This code is part of Tergite
#
# (C) Copyright Miroslav Dobsicek 2020
# (C) Copyright Simon Genne, Arvid Holmqvist, Bashar Oumari, Jakob Ristner,
#               Björn Rosengren, and Jakob Wik 2022 (BSc project)
# (C) Copyright Fabian Forslund, Niklas Botö 2022
# (C) Copyright Abdullah-Al Amin 2022, 2023
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.
import logging

from fastapi import FastAPI, Body, HTTPException, status
from uuid import uuid4, UUID
from datetime import datetime
import pymongo
import settings

# Imports for Webgui
import functools
from fastapi.middleware.cors import CORSMiddleware
from api.routers import devices
from api.services import service
from mongodb_dependency import MongoDbDep

# settings
BCC_MACHINE_ROOT_URL = settings.BCC_MACHINE_ROOT_URL
DB_MACHINE_ROOT_URL = settings.DB_MACHINE_ROOT_URL
DB_NAME = settings.DB_NAME


# application
app = FastAPI(
    title="Main Service Server",
    description="A frontend to all our quantum backends",
    version="0.0.1",
)


# ------------ Sorting templates ------------ #
REGSORT = {"key_or_list": "timelog.REGISTERED", "direction": pymongo.DESCENDING}


# ------------ Helper functions ------------ #
def new_timestamp():
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"


async def retrieve_using_tag(search_filter: dict, collection: object, /) -> dict:
    document = await collection.find_one(search_filter, {"_id": 0})
    if document is None:
        return f"No documents matching the filter '{search_filter}' were found in the '{collection}' collection."
    else:
        return document


async def retrieve_ordered_subset(
    collection: object, /, *, nlast: int = 10, **order
) -> list:
    db_cursor = collection.find({}, {"_id": 0})
    if order:
        db_cursor.sort(**order)
    if nlast >= 0:
        db_cursor.limit(nlast)

    response = []
    async for backend in db_cursor:
        response.append(backend)

    return response


def create_new_documents(collection: str, *, unique_key: str = None) -> callable:
    def decorator(function: callable) -> callable:
        @functools.wraps(function)
        async def wrapper(*args, **kwargs):
            # FIXME: get the database from the args passed to the function
            db = kwargs.get("db")
            col = db[collection]
            documents, response_content = function(*args, **kwargs)
            filtered_documents = list()
            for doc in documents:
                # if you specify a unique key
                if unique_key is not None:
                    # and there is no document in collection with that key
                    if not await col.count_documents({unique_key: doc[unique_key]}):
                        # then insert that document
                        filtered_documents.append(doc)
                    else:
                        print(f"document with '{unique_key}':'{doc[unique_key]}' is already present in the '{collection}' collection")
                else:
                    filtered_documents.append(doc)
                
                timestamp = new_timestamp()
                doc.update({"timelog": {"REGISTERED": timestamp, "LAST_UPDATED":timestamp}})

            if len(filtered_documents):
                result = await col.insert_many(filtered_documents)
                if result.acknowledged and len(result.inserted_ids) == len(
                    filtered_documents
                ):
                    print(
                        f"Inserted {len(filtered_documents)} document(s) into the '{collection}' collection."
                    )
                    return response_content
                else:
                    return {"message": "Server failed insertion of the documents."}
            else:
                print(f"Inserted 0 document(s) into the '{collection}' collection.")
                return response_content

        return wrapper

    return decorator


def update_documents(collection: str) -> callable:
    def decorator(function: callable) -> callable:
        @functools.wraps(function)
        async def wrapper(*args, **kwargs):
            # FIXME: get the database from the args passed to the function
            db = kwargs.get("db")
            col = db[collection]
            db_filter, update, response_content = function(*args, **kwargs)
            update_ts = new_timestamp()
            result_up = await col.update_many(db_filter, update)
            result_lu = await col.update_many(
                db_filter, {"$set": {"timelog.LAST_UPDATED": update_ts}}
            )

            if (
                result_up.acknowledged
                and result_lu.acknowledged
                and (result_up.matched_count == result_lu.matched_count)
            ):
                print(
                    f"Updated {result_lu.modified_count} document(s) in the '{collection}' collection."
                )
                return response_content
            else:
                return {"message": "Server failed to update the documents."}

        return wrapper

    return decorator


# ------------ GET OPERATIONS ------------ #
@app.get("/")
async def root():
    return "Welcome to the MSS machine"


@app.get("/backends")
async def read_backends(db: MongoDbDep):
    return await retrieve_ordered_subset(db.backends, nlast=-1, **REGSORT)


@app.get("/calibrations")
async def read_calibrations(db: MongoDbDep, nlast: int = 10):
    return await retrieve_ordered_subset(db.calibrations, nlast=nlast, **REGSORT)


@app.get("/jobs")
async def read_jobs(db: MongoDbDep, nlast: int = 10):
    return await retrieve_ordered_subset(db.jobs, nlast=nlast, **REGSORT)


@app.get("/backends/{backend_name}")
async def read_backend(db: MongoDbDep, backend_name: str):
    return await retrieve_using_tag({"name": backend_name}, db.backends)


@app.get("/rng/{job_id}")
async def read_rng(db: MongoDbDep, job_id: UUID):
    return await retrieve_using_tag({"job_id": str(job_id)}, db["rng"])


@app.get("/calibrations/{job_id}")
async def read_calibration(db: MongoDbDep, job_id: UUID):
    return await retrieve_using_tag({"job_id": str(job_id)}, db.calibrations)


@app.get("/jobs/{job_id}")
async def read_job(db: MongoDbDep, job_id: UUID):
    return await retrieve_using_tag({"job_id": str(job_id)}, db.jobs)


@app.get("/jobs/{job_id}/result")
async def read_job_result(db: MongoDbDep, job_id: UUID):
    try:
        # NOTE: This may raise KeyError
        document = await retrieve_using_tag({"job_id": str(job_id)}, db.jobs)

        # helper printout with first 5 outcomes
        print("Measurement results:")
        memory = document["result"]["memory"]
        for experiment_memory in memory:
            s = str(experiment_memory[:5])
            if experiment_memory[5:6]:
                s = s.replace("]", ", ...]")
            print(s)

        return document["result"]
    except KeyError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"job of id {job_id} has no result",
        )


@app.get("/jobs/{job_id}/download_url")
async def read_job_download_url(db: MongoDbDep, job_id: UUID):
    try:
        # NOTE: This may raise KeyError: download_url might not exist
        document = await retrieve_using_tag({"job_id": str(job_id)}, db.jobs)
        print(document["download_url"])
        return document["download_url"]
    except KeyError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"job of id {job_id} has no download_url",
        )


# ------------ CREATE OPERATIONS ------------ #


@app.post("/jobs")
@create_new_documents(collection="jobs")
def create_job_document(db: MongoDbDep, backend: str = "pingu"):
    job_id = uuid4()
    print(f"Creating new job with id: {job_id}")
    documents = [{"job_id": str(job_id), "status": "REGISTERING", "backend": backend}]
    response_content = {
        "job_id": str(job_id),
        "upload_url": str(BCC_MACHINE_ROOT_URL) + "/jobs",
    }
    return documents, response_content


@app.put("/backends")
@create_new_documents(collection="backend_test", unique_key="name")
def create_backend_document(db: MongoDbDep, backend_dict: dict):
    if "name" not in backend_dict.keys():
        return [], "Backend needs to have a name"

    return [backend_dict], "OK"


@app.put("/backends/{collection}")
async def create_update_backend(db: MongoDbDep, collection: str, backend_dict: dict):
    backend_col = db[collection]
    backened_log = db["backend_log"]
    doc = backend_dict
    timestamp = new_timestamp()
    doc.update({"timelog": {"REGISTERED": timestamp, "LAST_UPDATED":timestamp}}) 
    #there is no document in collection with that key
    if not await backend_col.find_one({}, {'name': doc['name']}):
        # then insert that document
        result = await backend_col.insert_one(doc)
        if result.acknowledged: 
            print(
                f"Inserted '{doc['name']}' document into the '{collection}' collection."
            )
        else:
            print(
                f" Could not insert '{doc['name']}' document into the '{collection}' collection."
            )
    else:
        print(f"document is already present in the '{collection}' collection")
        # update the document anyway
        result = await backend_col.update_one({"name": str(doc["name"])}, {"$set":doc})
        if result.acknowledged: 
            print(
                f"Updated the '{doc['name']}' backend in '{collection}' collection"
            )
    # read the backend after any modification
    current_backend =  await backend_col.find_one({'name':doc['name']})
    del current_backend['_id']
    # write for log
    result = await backened_log.insert_one(current_backend)
    if result.acknowledged: 
            print(
                f"Log created for the '{doc['name']}' backend in 'backend_log' collection"
            )
    else:
        print(
                f" Could not insert document into the 'backend_log' collection."
            )
    return "OK" 


@app.post("/calibrations")
@create_new_documents(collection="calibrations")
def create_calibration_documents(db: MongoDbDep, documents: list):
    return documents, "OK"


@app.post("/random")
@create_new_documents(collection="rng")
def create_rng_documents(db: MongoDbDep, documents: list):
    """
    Store documents containing batches of random numbers.
    One document is one batch of random numbers requested by a user.

    Document schema: {
        job_id : str,   # id of the job, queued by the user
        numbers : list, # the random integers
        N : int,        # how many integers did the user request
        width : int     # how many bits is the integer, 32, 64, etc.
    }
    """
    return documents, "OK"


# ------------ UPDATE OPERATIONS ------------ #


@app.put("/backends/update/{backend_name}")
@update_documents(collection="backend_test")
def update_backend_document(db: MongoDbDep, backend_name, items_to_update: dict):
    return {"name": str(backend_name)}, {"$set":items_to_update}, "OK"


@app.put("/jobs/{job_id}/result")
@update_documents(collection="jobs")
def update_job_result(db: MongoDbDep, job_id: UUID, memory: list):
    return {"job_id": str(job_id)}, {"$set": {"result": {"memory": memory}}}, "OK"


@app.put("/jobs/{job_id}/status")
@update_documents(collection="jobs")
def update_job_status(
    db: MongoDbDep, job_id: UUID, status: str = Body(..., max_length=10)
):
    return {"job_id": str(job_id)}, {"$set": {"status": status}}, "OK"


@app.put("/jobs/{job_id}/download_url")
@update_documents(collection="jobs")
def update_job_download_url(
    db: MongoDbDep, job_id: UUID, url: str = Body(..., max_length=140)
):
    return {"job_id": str(job_id)}, {"$set": {"download_url": url}}, "OK"


# This should probably be a PUT method as well. The decision depends on the wider context.
@app.post("/jobs/{job_id}/timelog")
@update_documents(collection="jobs")
def update_timelog_entry(
    db: MongoDbDep, job_id: UUID, event_name: str = Body(..., max_legth=10)
):
    timestamp = new_timestamp()
    return {"job_id": str(job_id)}, {"$set": {"timelog." + event_name: timestamp}}, "OK"


# Webgui Public services

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    await service.on_startup()


app.include_router(devices.router)
