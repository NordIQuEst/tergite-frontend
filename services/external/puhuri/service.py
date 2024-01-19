# This code is part of Tergite
#
# (C) Copyright Martin Ahindura 2023
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.
"""Service for synchronizing with Puhuri, an HPC resource allocation management service

See: https://puhuri.neic.no/SDK%20guide/allocation-management-sp/#getting-a-list-of-resource-allocations

polling is to be done using apscheduler

This client is useful to enable the following user stories
- Puhuri project admin can create new projects that have QAL 9000 offering indirectly in MSS (polling every few minutes or so)
- Puhuri project admin can add new users to a project indirectly in QAL 9000 if that project has a QAL 9000 offering
- Puhuri project admin can order for new QPU seconds for the QAL 9000 and be allocated the same extra QPU seconds in QAL 9000 indirectly
- Puhuri project admin can view the QPU seconds left in their project since QAL 9000 updates Puhuri of per-project 
    resource usage at a given interval or the moment an experiment is done
"""
import asyncio
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from apscheduler.schedulers.base import BaseScheduler
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorCollection, AsyncIOMotorDatabase
from pymongo import UpdateOne
from pymongo.errors import DuplicateKeyError
from waldur_client import ComponentUsage, WaldurClient

import settings
from utils.logging import err_logger
from utils.mongodb import get_mongodb

from ...auth.projects.dtos import PROJECT_DB_COLLECTION, Project, ProjectSource
from .dtos import (
    INTERNAL_USAGE_COLLECTION,
    PUHURI_USAGE_COLLECTION,
    REQUEST_FAILURES_COLLECTION,
    InternalJobResourceUsage,
    PuhuriComponent,
    PuhuriFailedRequest,
    PuhuriJobResourceUsage,
    PuhuriResource,
)
from .exc import ResourceNotFoundError
from .utils import (
    approve_pending_orders,
    extract_project_metadata,
    get_accounting_component,
    get_default_component,
    get_plan_periods,
    get_project_resources,
    get_qpu_seconds,
    send_component_usages,
)

# FIXME: To handle usage-based projects, we might need to add a flag like is_prepaid
#   on the project model in the database such that authentication does not fail for
#   projects that have is_prepaid as False

# FIXME: Also to total up a project's qpu_seconds after retrieving data from puhuri,
#   we might need to sum up the "limit" properties.

# FIXME: Question: How does one get the remaining amount of resource from a limit-based
#   resource in puhuri?


async def update_internal_project_list(
    api_client: Optional[WaldurClient] = None,
    api_uri: str = settings.PUHURI_WALDUR_API_URI,
    api_access_token: str = settings.PUHURI_WALDUR_CLIENT_TOKEN,
    db_url: str = f"{settings.DB_MACHINE_ROOT_URL}",
    db_name: str = settings.DB_NAME,
    db_collection: str = PROJECT_DB_COLLECTION,
    provider_uuid: str = settings.PUHURI_PROVIDER_UUID,
):
    """Updates the projects list in this app with the latest projects in puhuri

    This is typically run in the background if puhuri synchronization is enabled via the
    `IS_PUHURI_SYNC_ENABLED` environment flag.

    Args:
        api_client: Puhuri Waldur client for accessing the Puhuri Waldur server API
        api_uri: the URI to the Puhuri Waldur server API
        api_access_token: the access token to be used to access the Waldur server API
        db_url: the mongodb URI to the database where projects are stored
        db_name: the name of the database where the projects are stored
        db_collection: the name of the collection where the projects are stored
        provider_uuid: the unique ID of the service provider associated with this app in puhuri

    Raises:
        WaldurClientException: error making request
        pydantic.error_wrappers.ValidationError: {} validation error for ResourceAllocation ...
    """
    try:
        db: AsyncIOMotorDatabase = get_mongodb(url=db_url, name=db_name)
        collection = db[db_collection]
        if api_client is None:
            api_client = WaldurClient(api_url=api_uri, access_token=api_access_token)

        resource_filter = {"provider_uuid": provider_uuid, "state": "Creating"}
        loop = asyncio.get_event_loop()

        new_resources = await loop.run_in_executor(
            None,
            api_client.filter_marketplace_resources,
            resource_filter,
        )
        project_metadata = extract_project_metadata(new_resources)
        new_projects = [
            Project(
                ext_id=item.uuid,
                source=ProjectSource.PUHURI,
                qpu_seconds=await get_qpu_seconds(client=api_client, metadata=item),
                is_active=False,
                resource_ids=item.resource_uuids,
            )
            for item in project_metadata
        ]

        responses = await asyncio.gather(
            *(
                collection.update_one(
                    {
                        "ext_id": project.ext_id,
                        # a guard to ensure projects whose order approvals keep
                        # failing do not have their qpu_seconds incremented indefinitely
                        # NOTE: this may fail with a Conflict Error if any of the resource_ids
                        #   already exists in the project. You might need to resolve this manually
                        "resource_ids": {"$nin": project.resource_ids},
                    },
                    {
                        "$set": {
                            "source": ProjectSource.PUHURI.value,
                            "is_active": project.is_active,
                        },
                        "$inc": {
                            "qpu_seconds": project.qpu_seconds,
                        },
                        "$addToSet": {"resource_ids": {"$each": project.resource_ids}},
                    },
                    upsert=True,
                )
                for project in new_projects
            ),
            return_exceptions=True,
        )

        updated_projects = [
            new_projects[index]
            for index, resp in enumerate(responses)
            if not isinstance(resp, Exception)
        ]

        resource_project_map = {
            resource_uuid: project.ext_id
            for project in updated_projects
            for resource_uuid in project.resource_ids
        }

        # responses is a list of Dict[resource_uuid, str]
        # Note that we are filtering by resource UUID, not project UUID, because there is a chance
        # that a project could have added new resources while we were still processing the
        # current ones
        responses = await asyncio.gather(
            *(
                approve_pending_orders(
                    client=api_client,
                    provider_uuid=provider_uuid,
                    resource_uuid=resource_uuid,
                )
                for resource_uuid in resource_project_map.keys()
            ),
            return_exceptions=True,
        )

        approved_resource_uuid_maps = [
            resp for resp in responses if isinstance(resp, dict)
        ]
        approved_resources = {
            item["resource_uuid"]: True for item in approved_resource_uuid_maps
        }

        # approved projects are those that have all their resources approved
        approved_project_ids = [
            metadata.uuid
            for metadata in project_metadata
            if all(
                approved_resources.get(resource_uuid)
                for resource_uuid in metadata.resource_uuids
            )
        ]

        # reactivate the updated projects that were fully approved
        await collection.bulk_write(
            [
                UpdateOne({"ext_id": ext_id}, {"$set": {"is_active": True}})
                for ext_id in approved_project_ids
            ]
        )

    except Exception as exp:
        err_logger.error(
            f"error update_internal_project_list: {exp.__class__.__name__}: {exp}"
        )
        raise exp


async def update_internal_user_list(
    api_uri: str = settings.PUHURI_WALDUR_API_URI,
    api_access_token: str = settings.PUHURI_WALDUR_CLIENT_TOKEN,
    db_url: str = f"{settings.DB_MACHINE_ROOT_URL}",
    db_name: str = settings.DB_NAME,
    db_collection: str = PROJECT_DB_COLLECTION,
    provider_uuid: str = settings.PUHURI_PROVIDER_UUID,
):
    """Updates the user email list in each project in this app using the user list in puhuri

    This is usually run in the background if puhuri synchronization is enabled via the
    `IS_PUHURI_SYNC_ENABLED` environment flag.

    Args:
        api_uri: the URI to the Puhuri Waldur server API
        api_access_token: the access token to be used to access the Waldur server API
        db_url: the mongodb URI to the database where projects are stored
        db_name: the name of the database where the projects are stored
        db_collection: the name of the collection where the projects are stored
        provider_uuid: the unique ID of the service provider associated with this app in puhuri

    Raises:
        WaldurClientException: error making request
        pydantic.error_wrappers.ValidationError: {} validation error for ResourceAllocation ...
    """
    try:
        db: AsyncIOMotorDatabase = get_mongodb(url=db_url, name=db_name)
        collection = db[db_collection]
        api_client = WaldurClient(api_url=api_uri, access_token=api_access_token)
        loop = asyncio.get_event_loop()

        approved_resources = await loop.run_in_executor(
            None,
            api_client.filter_marketplace_resources,
            {"provider_uuid": provider_uuid, "state": "OK"},
        )

        tasks = (
            loop.run_in_executor(
                None,
                api_client.marketplace_resource_get_team,
                resource["uuid"],
            )
            for resource in approved_resources
        )
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # get the map of projects and their user emails
        projects_user_emails_map: Dict[str, List[str]] = {}
        for index, user_list in enumerate(results):
            project_id = approved_resources[index]["project_uuid"]

            if isinstance(user_list, list):
                emails = projects_user_emails_map.setdefault(project_id, [])
                emails.extend([user["email"] for user in user_list])

        # update the user lists of the projects that had user emails
        await collection.bulk_write(
            [
                UpdateOne(
                    {
                        "ext_id": project_id,
                        "source": ProjectSource.PUHURI.value,
                    },
                    {"$set": {"user_emails": list(set(user_list))}},
                )
                for project_id, user_list in projects_user_emails_map.items()
            ]
        )

        # delete the user lists of pre-existing projects that had no user emails
        # This ensures that users who have been removed from the puhuri side are also
        # removed from this application
        await collection.update_many(
            {
                "source": ProjectSource.PUHURI.value,
                "ext_id": {"$nin": list(projects_user_emails_map.keys())},
            },
            {"$set": {"user_emails": []}},
        )

    except Exception as exp:
        err_logger.error(
            f"error update_internal_user_list: {exp.__class__.__name__}: {exp}"
        )
        raise exp


async def update_internal_resource_allocation(
    api_uri: str = settings.PUHURI_WALDUR_API_URI,
    api_access_token: str = settings.PUHURI_WALDUR_CLIENT_TOKEN,
    db_url: str = f"{settings.DB_MACHINE_ROOT_URL}",
    db_name: str = settings.DB_NAME,
    db_collection: str = PROJECT_DB_COLLECTION,
    provider_uuid: str = settings.PUHURI_PROVIDER_UUID,
):
    """Updates this app's project's resource allocation using puhuri's resource allocations

    This is usually run in the background if puhuri synchronization is enabled via the
    `IS_PUHURI_SYNC_ENABLED` environment flag.

    Args:
        api_uri: the URI to the Puhuri Waldur server API
        api_access_token: the access token to be used to access the Waldur server API
        db_url: the mongodb URI to the database where projects are stored
        db_name: the name of the database where the projects are stored
        db_collection: the name of the collection where the projects are stored
        provider_uuid: the unique ID of the service provider associated with this app in puhuri

    Raises:
        WaldurClientException: error making request
        pydantic.error_wrappers.ValidationError: {} validation error for ResourceAllocation ...
    """
    try:
        db: AsyncIOMotorDatabase = get_mongodb(url=db_url, name=db_name)
        collection = db[db_collection]
        api_client = WaldurClient(api_url=api_uri, access_token=api_access_token)
        loop = asyncio.get_event_loop()

        approved_resources = await loop.run_in_executor(
            None,
            api_client.filter_marketplace_resources,
            {"provider_uuid": provider_uuid, "state": "OK"},
        )

        projects_metadata = extract_project_metadata(approved_resources)
        approved_projects: List[Project] = [
            Project(
                ext_id=item.uuid,
                source=ProjectSource.PUHURI,
                qpu_seconds=await get_qpu_seconds(client=api_client, metadata=item),
                is_active=True,
                resource_ids=item.resource_uuids,
            )
            for item in projects_metadata
        ]

        responses = await asyncio.gather(
            *(
                collection.update_one(
                    {
                        "ext_id": project.ext_id,
                        # a guard to ensure projects that no resource is ignored
                        # NOTE: this may fail with a Conflict Error if any of the resource_ids
                        #   does not already exist in the project i.e. it is newly allocated.
                        #   This must be resolved by the routine that extracts new resources/projects or
                        #   You might need to resolve this manually
                        "resource_ids": {"$in": project.resource_ids},
                    },
                    {
                        "$set": {
                            "source": ProjectSource.PUHURI.value,
                            "is_active": project.is_active,
                            "qpu_seconds": project.qpu_seconds,
                        },
                    },
                )
                for project in approved_projects
            ),
            return_exceptions=True,
        )

        errors = [resp for resp in responses if not isinstance(resp, Exception)]
        if len(errors) > 0:
            raise Exception(f"errors updating existing projects: {errors}")
    except Exception as exp:
        err_logger.error(
            f"error update_internal_resource_allocation: {exp.__class__.__name__}: {exp}"
        )
        raise exp


async def save_job_resource_usage(
    db: AsyncIOMotorDatabase,
    job_id: str,
    project_id: str,
    qpu_seconds: float,
    db_collection: str = INTERNAL_USAGE_COLLECTION,
):
    """Saves the given job resource usage

    This is usually called after resource usage is reported to MSS
    by BCC.

    It may be later sent to an external resource monitoring service.

    Args:
        db: the mongodb client to the database where job resource usages are stored
        job_id: the ID of the given job
        project_id: the id of the project whose usage is to be reported
        qpu_seconds: the qpu seconds used
        db_collection: the name of the collection where the job resource usages are stored
    """
    usage = InternalJobResourceUsage(
        job_id=job_id,
        project_id=project_id,
        created_on=datetime.now(tz=timezone.utc),
        qpu_seconds=qpu_seconds,
    )
    try:
        await db[db_collection].insert_one(usage.dict())
    except DuplicateKeyError:
        # ignore duplicate entries
        pass


async def post_resource_usages(
    api_uri: str = settings.PUHURI_WALDUR_API_URI,
    api_access_token: str = settings.PUHURI_WALDUR_CLIENT_TOKEN,
    db_url: str = f"{settings.DB_MACHINE_ROOT_URL}",
    db_name: str = settings.DB_NAME,
    raw_usages_collection: str = INTERNAL_USAGE_COLLECTION,
    usages_collection: str = PUHURI_USAGE_COLLECTION,
    failures_collection: str = REQUEST_FAILURES_COLLECTION,
    projects_collection: str = PROJECT_DB_COLLECTION,
    provider_uuid: str = settings.PUHURI_PROVIDER_UUID,
):
    """Sends the resource usages for the current month over to Puhuri

    Remember that Puhuri expects only one usage report per resource per month
    Thus we need to aggregate the PuhuriJobResourceUsage's first

    Args:
        api_uri: the URI to the Puhuri Waldur server API
        api_access_token: the access token to be used to access the Waldur server API
        db_url: the mongodb URI to the database where resource usages are stored
        db_name: the name of the database where the resource usages are stored
        raw_usages_collection: the name of the collection where the raw job resource usages are stored
        usages_collection: the name of the collection where the job resource usages are stored
        failures_collection: the name of the collection where the failed puhuri requests are stored
        projects_collection: the name of the collection where the projects are stored
        provider_uuid: the unique ID of the service provider associated with this app in puhuri
    """
    try:
        now = datetime.now(tz=timezone.utc)
        db: AsyncIOMotorDatabase = get_mongodb(url=db_url, name=db_name)
        usage_col = db[usages_collection]
        raw_usage_col = db[raw_usages_collection]
        failures_col = db[failures_collection]
        client = WaldurClient(api_url=api_uri, access_token=api_access_token)

        # ensure that all the provider's pending orders are accounted for.
        # This ensures that all resources that we will query later have 'plan periods'.
        await update_internal_project_list(
            api_client=client,
            api_uri=api_uri,
            api_access_token=api_access_token,
            db_url=db_url,
            db_name=db_name,
            db_collection=projects_collection,
            provider_uuid=provider_uuid,
        )

        # prepare any unprocessed resource usages for posting
        errors = await _prepare_resource_usages(
            api_client=client,
            raw_collection=raw_usage_col,
            final_collection=usage_col,
            provider_uuid=provider_uuid,
        )
        if len(errors) > 0:
            # log the errors silently and continue with the successful ones
            err_logger.error(f"errors preparing resource usages: {errors}")

        pipeline = [
            {"$match": {"month": now.month, "year": now.year}},
            {
                "$group": {
                    "_id": {
                        "plan_period_uuid": "$plan_period_uuid",
                        "component_type": "$component_type",
                    },
                    "amount": {"$sum": "$component_amount"},
                    "qpu_seconds": {"$sum": "$qpu_seconds"},
                },
            },
        ]

        db_cursor = usage_col.aggregate(pipeline)
        tasks = [
            send_component_usages(
                client,
                plan_period_uuid=item["_id"]["plan_period_uuid"],
                usages=[
                    ComponentUsage(
                        type=item["_id"]["component_type"],
                        amount=item["amount"],
                        description=f"{item['qpu_seconds']} QPU seconds",
                    )
                ],
            )
            async for item in db_cursor
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # save any errors
        failures = [
            item.dict() for item in results if isinstance(item, PuhuriFailedRequest)
        ]
        if len(failures) > 0:
            await failures_col.insert_many(failures)

    except Exception as exp:
        err_logger.error(f"error post_resource_usages: {exp.__class__.__name__}: {exp}")
        raise exp


def register_background_tasks(
    scheduler: BaseScheduler,
    poll_interval: float = settings.PUHURI_POLL_INTERVAL,
):
    """Registers the background tasks for the puhuri service on the given scheduler

    Args:
        scheduler: the scheduler to run the tasks in the background
        poll_interval: the interval at which puhuri is to be polled in seconds. default is 900 (15 minutes)
    """
    scheduler.add_job(
        update_internal_project_list,
        "interval",
        seconds=poll_interval,
    )

    scheduler.add_job(
        update_internal_user_list,
        "interval",
        seconds=poll_interval,
    )

    scheduler.add_job(
        update_internal_resource_allocation,
        "interval",
        seconds=poll_interval,
    )

    scheduler.add_job(
        post_resource_usages,
        "interval",
        seconds=poll_interval,
    )


async def on_startup(db: AsyncIOMotorDatabase):
    """Runs init operations when the application is starting up"""
    await init_beanie(
        database=db,
        document_models=[
            PuhuriFailedRequest,
            PuhuriJobResourceUsage,
            InternalJobResourceUsage,
        ],
    )


async def _prepare_resource_usages(
    api_client: WaldurClient,
    raw_collection: AsyncIOMotorCollection,
    final_collection: AsyncIOMotorCollection,
    provider_uuid: str,
):
    """Processes the raw resource usages into puhuri resource usage records and saves them

    Args:
        api_client: Puhuri Waldur client for accessing the Puhuri Waldur server API
        raw_collection: the mongodb collection with the raw internal job resource usages
        final_collection: the mongodb collection where the processed job resource usages are stored
        provider_uuid: the unique ID of the service provider associated with this app in puhuri

    Raises:
        WaldurClientException: error making request
        pydantic.error_wrappers.ValidationError: {} validation error for ResourceAllocation ...

    Returns:
        dictionary of job_ids and exceptions
    """
    max_cache_length = 100
    resource_cache: Dict[str, List[PuhuriResource]] = {}
    # a cache for components to avoid querying for same component
    # more than once
    components_cache: Dict[Tuple[str, str], PuhuriComponent] = {}
    errors: Dict[str, str] = {}

    unprocessed_usages = raw_collection.find({"is_processed": False})

    async for usage in unprocessed_usages:
        project_id = usage["project_id"]
        job_id = usage["job_id"]
        qpu_seconds = usage["qpu_seconds"]
        created_on = usage["created_on"]
        month = created_on.month
        year = created_on.year

        try:
            resources = resource_cache[project_id]
        except KeyError:
            try:
                resources = await get_project_resources(
                    api_client,
                    provider_uuid=provider_uuid,
                    project_uuid=project_id,
                )
            except Exception as exp:
                # save error
                errors[job_id] = str(exp)
                continue

            if len(resource_cache) < max_cache_length:
                # Just a limit not to overwhelm the memory
                resource_cache[project_id] = resources

        if len(resources) == 0:
            errors[job_id] = repr(
                ResourceNotFoundError(f"no resource found for project: {project_id}")
            )
            continue

        # the resource whose usage is to be updated
        selected_resource: Optional[PuhuriResource] = None
        # the accounting component to use when send resource usage.
        # Note: project -> many resources -> each with an (accounting) plan
        #           -> each with multiple (accounting) components
        # Note: the limit-based resources have a dictionary of "limits" with keys as the "internal names" or
        #   "types" of the components
        #   and the values as the maximum amount for that component. This amount is in units of that component
        #   e.g. 10 for one component, might mean 10 days, while for another it might mean 10 minutes depending
        #   on the 'measurement_unit' of that component.
        #   We will select the component whose limit (in seconds) >= the usage
        selected_component: Optional[PuhuriComponent] = None

        usage_based_resources = []
        limit_based_resources = []

        for item in resources:
            if item.has_limits:
                limit_based_resources.append(item)
            else:
                usage_based_resources.append(item)

        if len(limit_based_resources) == 0:
            selected_resource = resources[0]

        try:
            for resource in limit_based_resources:
                # offering_uuid = resource.offering_uuid

                for comp_type, comp_amount in resource.limits.items():
                    component = await get_accounting_component(
                        client=api_client,
                        offering_uuid=resource.offering_uuid,
                        component_type=comp_type,
                        cache=components_cache,
                    )

                    unit_value = component.measured_unit.to_seconds()
                    limit_in_seconds = comp_amount * unit_value

                    # select resource which has at least one limit (or purchased QPU seconds)
                    # greater or equal to the seconds to be reported.
                    if limit_in_seconds >= qpu_seconds:
                        selected_resource = resource
                        selected_component = component
                        break

                if selected_resource is not None:
                    break

        except Exception as exp:
            # save error and continue with the next usage
            errors[job_id] = str(exp)
            continue

        # if there is no selected resource yet, get the first usage-based resource
        #  and resort to the first limit-based resource only if there is no usage-based resource
        if selected_resource is None:
            try:
                selected_resource = usage_based_resources[0]
            except IndexError:
                selected_resource = limit_based_resources[0]

        if selected_component is None:
            selected_component = await get_default_component(
                api_client, offering_uuid=selected_resource.offering_uuid
            )

        plan_periods = await get_plan_periods(
            client=api_client,
            resource_uuid=selected_resource.uuid,
            month_year=(month, year),
        )
        # get the last plan period in the month, assuming that it is the latest
        plan_period = plan_periods[-1]

        component_amount = selected_component.measured_unit.from_seconds(qpu_seconds)
        processed_usage = PuhuriJobResourceUsage(
            job_id=job_id,
            created_on=created_on,
            month=month,
            year=year,
            plan_period_uuid=plan_period.uuid,
            component_type=selected_component.type,
            component_amount=component_amount,
            qpu_seconds=qpu_seconds,
        )
        try:
            await final_collection.insert_one(processed_usage.dict())
            await raw_collection.update_one(
                {"job_id": job_id}, {"$set": {"is_processed": True}}
            )
        except Exception as exp:
            # save error
            errors[job_id] = str(exp)

    return errors
