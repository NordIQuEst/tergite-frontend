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
"""Entry point for the users submodule of the auth module"""
import re
from typing import Dict, Optional, Sequence, Tuple, Union

from fastapi import APIRouter, Depends
from fastapi_users import FastAPIUsers, models
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
)
from fastapi_users.jwt import SecretType
from fastapi_users.manager import UserManagerDependency
from fastapi_users_db_beanie import BeanieUserDatabase
from httpx_oauth.oauth2 import BaseOAuth2

import settings

from . import exc, routers
from .authenticator import UserAuthenticator
from .database import UserDatabase
from .dtos import ID, UP, CurrentUserDependency, OAuthAccount, User
from utils.config import UserRole
from .manager import UserManager
from .strategy import CustomJWTStrategy
from .validators import EmailRegexValidator, Validator

_AUTH_EMAIL_REGEX_MAP: Dict[str, Tuple[str, Union[re.RegexFlag, int]]] = {
    f"{client['name']}": (client.get("email_regex", ".*"), 0)
    for client in settings.OAUTH2_CLIENTS_CONFS
}

_AUTH_ROLES_MAP: Dict[str, Optional[Sequence[str]]] = {
    client["name"]: client.get("roles", None)
    for client in settings.OAUTH2_CLIENTS_CONFS
}


def get_jwt_header_backend(
    login_url: str,
    jwt_secret: str,
    lifetime_seconds: int = 3600,
) -> AuthenticationBackend:
    """Creates an auth backend that uses JWT in bearer header to handle auth."""
    bearer_transport = BearerTransport(tokenUrl=login_url)

    def get_jwt_strategy() -> CustomJWTStrategy:
        return CustomJWTStrategy(secret=jwt_secret, lifetime_seconds=lifetime_seconds)

    return AuthenticationBackend(
        name="jwt",
        transport=bearer_transport,
        get_strategy=get_jwt_strategy,
    )


def get_jwt_cookie_backend(
    jwt_secret: str,
    cookie_name: str,
    cookie_domain: Optional[str] = None,
    cookie_max_age: Optional[int] = None,
) -> AuthenticationBackend:
    """Creates an auth backend that uses JWT in cookie to handle auth."""
    transport = CookieTransport(
        cookie_name=cookie_name,
        cookie_domain=cookie_domain,
        cookie_max_age=cookie_max_age,
    )

    def get_jwt_strategy() -> CustomJWTStrategy:
        lifetime_seconds = cookie_max_age if cookie_max_age is not None else 3600
        return CustomJWTStrategy(secret=jwt_secret, lifetime_seconds=lifetime_seconds)

    return AuthenticationBackend(
        name="jwt-cookie",
        transport=transport,
        get_strategy=get_jwt_strategy,
    )


async def get_user_db():
    """Dependency injector of the users database"""
    yield UserDatabase(_AUTH_ROLES_MAP)


async def get_email_validator() -> Validator:
    """Dependency injector of the email validators"""
    yield EmailRegexValidator(_AUTH_EMAIL_REGEX_MAP)


async def get_user_manager(
    user_db: BeanieUserDatabase = Depends(get_user_db),
    email_validator: Validator = Depends(get_email_validator),
):
    """Dependency injector for UserManager"""
    yield UserManager(user_db, email_validator=email_validator)


class UserBasedAuth(FastAPIUsers[models.UP, models.ID]):
    authenticator: UserAuthenticator

    def __init__(
        self,
        get_user_manager_dep: UserManagerDependency[models.UP, models.ID],
        auth_backends: Sequence[AuthenticationBackend],
    ):
        super().__init__(get_user_manager, auth_backends)
        self.authenticator = UserAuthenticator(auth_backends, get_user_manager_dep)
        self.get_user_manager = get_user_manager_dep
        self.current_user = self.authenticator.current_user
        self.current_user_id = self.authenticator.current_user_id

    def get_oauth_router(
        self,
        oauth_client: BaseOAuth2,
        backend: AuthenticationBackend,
        state_secret: SecretType,
        redirect_url: Optional[str] = None,
        associate_by_email: bool = False,
        is_verified_by_default: bool = False,
    ) -> APIRouter:
        return routers.get_oauth_router(
            oauth_client,
            backend,
            self.get_user_manager,
            state_secret,
            redirect_url,
            associate_by_email,
            is_verified_by_default,
        )
