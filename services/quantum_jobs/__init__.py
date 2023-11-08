# This code is part of Tergite
#
# (C) Copyright Miroslav Dobsicek 2020
# (C) Copyright Simon Genne, Arvid Holmqvist, Bashar Oumari, Jakob Ristner,
#               Björn Rosengren, and Jakob Wik 2022 (BSc project)
# (C) Copyright Fabian Forslund, Niklas Botö 2022
# (C) Copyright Abdullah-Al Amin 2022
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.
#
# Refactored by Martin Ahindura on 2023-11-08
import logging
from typing import Any, Dict
from uuid import UUID, uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

import settings
from utils import mongodb as mongodb_utils
from utils.date_time import get_current_timestamp

from .dtos import CreatedJobResponse


async def get_one(db: AsyncIOMotorDatabase, job_id: UUID):
    """Gets a job by job_id

    Args:
        db: the mongo database from where to get the job
        job_id: the `job_id` of the job to be returned

    Raises:
        utils.mongodb.DocumentNotFoundError: No documents matching the filter '{search_filter}'
           were found in the '{collection}' collection.

    Returns:
        the job as a dict
    """
    return await mongodb_utils.find_one(db.jobs, {"job_id": str(job_id)})


async def get_job_result(db: AsyncIOMotorDatabase, job_id: UUID) -> Dict[str, Any]:
    """Retrieves the result of the job of the given job_id

    Args:
        db: the mongo database from where to get the job
        job_id: the `job_id` of the job to be returned

    Raises:
        utils.mongodb.DocumentNotFoundError: No documents matching the filter '{search_filter}'
           were found in the '{collection}' collection.
        KeyError: 'result'

    Returns:
        the result as a dict
    """
    document = await get_one(db, job_id=job_id)

    # helper printout with first 5 outcomes
    # FIXME: Probably come up with a standard schema for jobs
    print("Measurement results:")
    memory = document["result"]["memory"]
    for experiment_memory in memory:
        s = str(experiment_memory[:5])
        if experiment_memory[5:6]:
            s = s.replace("]", ", ...]")
        print(s)

    return document["result"]


async def get_job_download_url(db: AsyncIOMotorDatabase, job_id: UUID):
    """Retrieves the download url of the job of the given job_id

    Args:
        db: the mongo database from where to get the job
        job_id: the `job_id` of the job to be returned

    Raises:
        utils.mongodb.DocumentNotFoundError: No documents matching the filter '{search_filter}'
           were found in the '{collection}' collection.
        KeyError: 'download_url'

    Returns:
        the result as a dict
    """
    document = await get_one(db, job_id=job_id)
    return document["download_url"]


async def create_job(db: AsyncIOMotorDatabase, backend: str) -> CreatedJobResponse:
    """Creates a new job for the given backend

    Args:
        db: the mongo database from where to create the job
        backend: the backend where the job is to run

    Returns:
        the created job details
    """
    job_id = uuid4()
    logging.info(f"Creating new job with id: {job_id}")

    document = {"job_id": str(job_id), "status": "REGISTERING", "backend": backend}

    await mongodb_utils.insert_one(collection=db.jobs, document=document)
    return {
        "job_id": str(job_id),
        "upload_url": str(settings.BCC_MACHINE_ROOT_URL) + "/jobs",
    }


async def get_latest_many(db: AsyncIOMotorDatabase, limit: int = 10):
    """Retrieves the latest jobs up to the given limit

    Args:
        db: the mongo database from where to get the jobs
        limit: maximum number of records to return
    """
    return await mongodb_utils.find_all(
        db.jobs, limit=limit, **mongodb_utils.LATEST_FIRST_SORT
    )


async def update_job_result(db: AsyncIOMotorDatabase, job_id: UUID, memory: list):
    """Updates the memory part of the result of the job of the given job_id

    Args:
        db: the mongo database from where to get the job
        job_id: the job id of the job
        memory: the new memory data to insert into the result of job

    Returns:
        the number of documents that were modified

    Raises:
        ValueError: server failed updating documents
        DocumentNotFoundError: no documents matching {"job_id": job_id} were found
    """
    return await mongodb_utils.update_many(
        db.jobs,
        _filter={"job_id": str(job_id)},
        payload={"result": {"memory": memory}},
    )


# FIXME: the status might be better modelled as an enum
async def update_job_status(db: AsyncIOMotorDatabase, job_id: UUID, status: str):
    """Updates the memory part of the result of the job of the given job_id

    Args:
        db: the mongo database from where to get the job
        job_id: the job id of the job
        status: the new status of the job

    Returns:
        the number of documents that were modified

    Raises:
        ValueError: server failed updating documents
        DocumentNotFoundError: no documents matching {"job_id": job_id} were found
    """
    return await mongodb_utils.update_many(
        db.jobs,
        _filter={"job_id": str(job_id)},
        payload={"status": status},
    )


async def update_job_download_url(db: AsyncIOMotorDatabase, job_id: UUID, url: str):
    """Updates the download_url the job of the given job_id

    Args:
        db: the mongo database from where to get the job
        job_id: the job id of the job
        url: the new download url of the job

    Returns:
        the number of documents that were modified

    Raises:
        ValueError: server failed updating documents
        DocumentNotFoundError: no documents matching {"job_id": job_id} were found
    """
    return await mongodb_utils.update_many(
        db.jobs,
        _filter={"job_id": str(job_id)},
        payload={"download_url": url},
    )


async def refresh_timelog_entry(
    db: AsyncIOMotorDatabase, job_id: UUID, event_name: str
):
    """Updates the timelog the job of the given job_id to the current timestamp

    Args:
        db: the mongo database from where to get the job
        job_id: the job id of the job
        event_name: the name of the event whose timelog is to be refreshed

    Returns:
        the number of documents that were modified

    Raises:
        ValueError: server failed updating documents
        DocumentNotFoundError: no documents matching {"job_id": job_id} were found
    """
    timestamp = get_current_timestamp()
    return await mongodb_utils.update_many(
        db.jobs,
        _filter={"job_id": str(job_id)},
        payload={"timelog." + event_name: timestamp},
    )
