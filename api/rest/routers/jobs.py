# This code is part of Tergite
#
# (C) Copyright Miroslav Dobsicek 2020
# (C) Copyright Simon Genne, Arvid Holmqvist, Bashar Oumari, Jakob Ristner,
#               Björn Rosengren, and Jakob Wik 2022 (BSc project)
# (C) Copyright Fabian Forslund, Niklas Botö 2022
# (C) Copyright Abdullah-Al Amin 2022
# (C) Copyright Martin Ahindura 2023
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.
import logging
from uuid import UUID

from fastapi import APIRouter, Body, HTTPException
from fastapi import status as http_status

from api.rest.dependencies import (
    CurrentLaxProjectDep,
    CurrentStrictProjectDep,
    MongoDbDep,
)
from services import quantum_jobs as jobs_service
from utils import mongodb as mongodb_utils

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}")
async def read_job(db: MongoDbDep, project: CurrentLaxProjectDep, job_id: UUID):
    """Gets the job for the given job_id"""
    try:
        return await jobs_service.get_one(db, job_id=job_id)
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )


@router.get("/{job_id}/result")
async def read_job_result(db: MongoDbDep, project: CurrentLaxProjectDep, job_id: UUID):
    """Gets the job result for the given job_id"""
    try:
        return await jobs_service.get_job_result(db, job_id=job_id)
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )
    except KeyError:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job of id {job_id} has no result",
        )


@router.get("/{job_id}/download_url")
async def read_job_download_url(
    db: MongoDbDep, project: CurrentLaxProjectDep, job_id: UUID
):
    """Gets the job download_url for the given job_id"""
    try:
        return await jobs_service.get_job_download_url(db, job_id=job_id)
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )
    except KeyError:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job of id {job_id} has no download_url",
        )


@router.post("")
async def create_job(
    db: MongoDbDep, project: CurrentStrictProjectDep, backend: str = "pingu"
):
    """Creates a job in the given backend"""
    return await jobs_service.create_job(db, backend=backend)


@router.get("")
async def read_jobs(db: MongoDbDep, project: CurrentLaxProjectDep, nlast: int = 10):
    """Gets the latest jobs only upto the given nlast records"""
    return await jobs_service.get_latest_many(db, limit=nlast)


@router.put("/{job_id}/result")
async def update_job_result(
    db: MongoDbDep, project: CurrentStrictProjectDep, job_id: UUID, memory: list
):
    """Updates the result of the job with the given memory object"""
    try:
        await jobs_service.update_job_result(db, job_id=job_id, memory=memory)
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )

    return "OK"


@router.put("/{job_id}/status")
async def update_job_status(
    db: MongoDbDep,
    project: CurrentStrictProjectDep,
    job_id: UUID,
    status: str = Body(..., max_length=10),
):
    """Updates the status of the job of the given job id"""
    try:
        await jobs_service.update_job_status(db, job_id=job_id, status=status)
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )

    return "OK"


@router.put("/{job_id}/download_url")
async def update_job_download_url(
    db: MongoDbDep,
    project: CurrentStrictProjectDep,
    job_id: UUID,
    url: str = Body(..., max_length=140),
):
    """Updates the download_url of the job of the given job id"""
    try:
        await jobs_service.update_job_download_url(db, job_id=job_id, url=url)
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )

    return "OK"


# FIXME: the event name might need to be an enum
# FIXME: the method used here probably needs to be a POST
@router.post("/{job_id}/timelog")
async def update_timelog_entry(
    db: MongoDbDep,
    project: CurrentStrictProjectDep,
    job_id: UUID,
    event_name: str = Body(..., max_legth=10),
):
    """Refreshes the timelog of the given event of the job of the given job id"""
    try:
        await jobs_service.refresh_timelog_entry(
            db, job_id=job_id, event_name=event_name
        )
    except mongodb_utils.DocumentNotFoundError as exp:
        logging.error(exp)
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail=f"job id {job_id} not found",
        )

    return "OK"
