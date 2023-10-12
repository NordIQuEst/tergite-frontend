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

"""FastAPIUsers-inspired logic for managing users"""
from typing import Optional

from beanie import PydanticObjectId
from fastapi.requests import Request
from fastapi_users import BaseUserManager, models
from fastapi_users.db import BaseUserDatabase
from fastapi_users.password import PasswordHelperProtocol
from fastapi_users.types import DependencyCallable
from fastapi_users_db_beanie import ObjectIDIDMixin

from .dtos import User
from .validators import EmailRegexValidator, Validator


class UserManager(ObjectIDIDMixin, BaseUserManager[User, PydanticObjectId]):
    def __init__(
        self,
        user_db: BaseUserDatabase[models.UP, models.ID],
        password_helper: Optional[PasswordHelperProtocol] = None,
        email_validator: Optional[Validator] = None,
    ):
        super().__init__(user_db=user_db, password_helper=password_helper)
        self.__email_validator = (
            email_validator if email_validator else EmailRegexValidator()
        )

    async def oauth_callback(
        self,
        oauth_name: str,
        access_token: str,
        account_id: str,
        account_email: str,
        expires_at: Optional[int] = None,
        refresh_token: Optional[str] = None,
        request: Optional[Request] = None,
        *,
        associate_by_email: bool = False,
        is_verified_by_default: bool = False,
    ) -> models.UOAP:
        await self.__email_validator.validate(account_email, oauth_name=oauth_name)
        return await super().oauth_callback(
            oauth_name,
            access_token,
            account_id,
            account_email,
            expires_at,
            refresh_token,
            request,
            associate_by_email=associate_by_email,
            is_verified_by_default=is_verified_by_default,
        )


UserManagerDependency = DependencyCallable[UserManager]
