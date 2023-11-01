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
from functools import cached_property
from typing import Generic, List, Optional, TypeVar

from beanie import Document, PydanticObjectId
from beanie.odm.operators.find.comparison import In
from pydantic import BaseModel, EmailStr
from pymongo import IndexModel

from ..users.dtos import User


class ProjectCreate(BaseModel):
    """The schema for creating a project"""

    # external_id is the id in an external project allocation service
    ext_id: str
    user_emails: List[str] = []
    qpu_seconds: int = 0


class ProjectRead(BaseModel):
    """The schema for viewing a project as non admin"""

    id: PydanticObjectId
    ext_id: str
    qpu_seconds: int = 0
    is_active: bool = True

    class Config:
        orm_mode = True


class ProjectAdminView(ProjectRead):
    """The schema for viewing a project as an admin"""

    user_emails: List[str] = []

    class Config:
        orm_mode = True


class ProjectUpdate(BaseModel):
    """The schema for updating a project"""

    user_emails: Optional[List[str]]
    qpu_seconds: Optional[int]


class Project(ProjectCreate, Document):
    is_active: bool = True

    class Settings:
        name = "auth_projects"
        indexes = [
            IndexModel("ext_id", unique=True),
        ]

    @cached_property
    async def user_ids(self):
        """The list of user_ids for this Project"""
        records = (
            await User.find(In(User.email, self.user_emails))
            .project(_IdOnlyDocument)
            .to_list()
        )
        return [record.id for record in records]


ITEM = TypeVar("ITEM")


class ProjectListResponse(BaseModel, Generic[ITEM]):
    """The response when sending paginated data"""

    skip: int = 0
    limit: Optional[int] = None
    data: List[ITEM] = []


class _IdOnlyDocument(BaseModel):
    id: PydanticObjectId
