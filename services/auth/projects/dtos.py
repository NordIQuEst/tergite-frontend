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
"""Data Transfer Objects for the projects submodule in the auth service"""
from typing import List, Optional

import pymongo
from beanie import Document
from fastapi_users_db_beanie.access_token import BeanieBaseAccessToken
from pydantic import BaseModel
from pymongo import IndexModel


class ProjectCreate(BaseModel):
    """The schema for creating a project"""

    # external_id is the id in an external project allocation service
    ext_id: str
    user_ids: List[str] = []
    qpu_seconds: int = 0


class ProjectUpdate(BaseModel):
    """The schema for updating a project"""

    user_ids: Optional[List[str]]
    qpu_seconds: Optional[int]


class Project(ProjectCreate, Document):
    is_active: bool = True

    class Settings:
        name = "auth_projects"
        indexes = [
            IndexModel("ext_id", unique=True),
        ]


class AppTokenCreate(BaseModel):
    """The payload passed when generating an app token"""

    title: str
    project_ext_id: str
    lifespan_seconds: int


class AppToken(BeanieBaseAccessToken, AppTokenCreate, Document):
    """App token stored in the database"""

    class Settings(BeanieBaseAccessToken.Settings):
        name = "auth_app_tokens"
        indexes = BeanieBaseAccessToken.Settings.indexes + [
            IndexModel(
                [("project_ext_id", pymongo.ASCENDING), ("user_id", pymongo.ASCENDING)],
            ),
        ]
