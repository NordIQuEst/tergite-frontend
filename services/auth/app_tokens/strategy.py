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
"""FastAPIUsers-specific definition of AppTokens Strategy"""
import secrets

from beanie import PydanticObjectId
from fastapi_users.authentication.strategy import DatabaseStrategy

from . import exc
from .database import AppTokenDatabase
from .dtos import AppTokenCreate


class AppTokenStrategy(DatabaseStrategy):
    """Strategy that handles app tokens"""

    database: AppTokenDatabase

    def __init__(self, database: AppTokenDatabase):
        super().__init__(database)

    async def write_token(
        self, payload: AppTokenCreate, user_id: PydanticObjectId
    ) -> str:
        token_dict = payload.dict()
        token_dict["token"] = secrets.token_urlsafe()
        token_dict["user_id"] = user_id
        access_token = await self.database.create(token_dict)
        return access_token.token

    async def destroy_token(
        self, token: str, user_id: PydanticObjectId, **filters
    ) -> None:
        """Destroys a given token.

        Args:
            token: the token to destroy
            user_id: the id of the user this token should belong to
            filters: other key-value filters to identify the token

        Raises:
            HTTPException: Forbidden 403 if token is not user's
                or token does not exist or is expired already
        """
        filters["user_id"] = user_id
        access_token = await self.database.get_by_token(token, **filters)
        if access_token is None:
            raise exc.AppTokenNotFound()

        await self.database.delete(access_token)
