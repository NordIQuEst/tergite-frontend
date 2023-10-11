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

"""Definition of the FastAPIUsers-specific Database adapter for users"""
from typing import Any, Dict, Optional, Sequence

from fastapi_users_db_beanie import BeanieUserDatabase

from ..users.dtos import OAuthAccount, User, UserRole


class UserDatabase(BeanieUserDatabase):
    def __init__(self, user_roles_config: Dict[str, Optional[Sequence[str]]] = None):
        super().__init__(
            user_model=User,
            oauth_account_model=OAuthAccount,
        )
        self.__roles_map = user_roles_config if user_roles_config else {}

    async def add_oauth_account(self, user: User, create_dict: Dict[str, Any]) -> User:
        try:
            oauth_name = create_dict["oauth_name"]
            user_roles = self.__roles_map[oauth_name]
            user.roles.update({UserRole(v) for v in user_roles if v})
        except (KeyError, TypeError):
            pass

        return await super().add_oauth_account(user, create_dict)
