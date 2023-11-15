# This code is part of Tergite
#
# (C) Copyright Miroslav Dobsicek 2021
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.
import logging
import re
from typing import Dict, Tuple

from starlette.config import Config
from starlette.datastructures import URL, CommaSeparatedStrings

# NOTE: shell env variables take precedence over the configuration file
config = Config(".env")

APP_SETTINGS = config("APP_SETTINGS", cast=str, default="production")
IS_AUTH_ENABLED = config("IS_AUTH_ENABLED", cast=bool, default=True)

_logger_level = logging.DEBUG
_bcc_machine_root_url_env = "BCC_MACHINE_ROOT_URL"
_db_machine_root_url_env = "DB_MACHINE_ROOT_URL"
_is_production = APP_SETTINGS == "production"

if not IS_AUTH_ENABLED and _is_production:
    raise ValueError(
        "'IS_AUTH_ENABLED' environment variable has been set to false in production."
    )

if _is_production:
    _logger_level = logging.INFO

if APP_SETTINGS == "test":
    _bcc_machine_root_url_env = "TEST_BCC_MACHINE_ROOT_URL"
    _db_machine_root_url_env = "TEST_DB_MACHINE_ROOT_URL"

BCC_MACHINE_ROOT_URL = config(_bcc_machine_root_url_env, cast=URL)
DB_MACHINE_ROOT_URL = config(_db_machine_root_url_env, cast=URL)
DB_NAME = config("DB_NAME", cast=str)
WS_PORT = config("WS_PORT", cast=int)
MSS_PORT = config("MSS_PORT", cast=int)
DATETIME_PRECISION = config("DATETIME_PRECISION", cast=str, default="auto")
root_logger = logging.getLogger()
root_logger.setLevel(_logger_level)

# auth
TERGITE_CLIENT_NAME = "github"
TERGITE_CLIENT_ID = config("TERGITE_CLIENT_ID", cast=str, default=None)
TERGITE_CLIENT_SECRET = config("TERGITE_CLIENT_SECRET", cast=str, default=None)
TERGITE_COOKIE_REDIRECT_URI = config(
    "TERGITE_COOKIE_REDIRECT_URI", cast=str, default=None
)

CHALMERS_CLIENT_NAME = "chalmers"
CHALMERS_CLIENT_ID = config("CHALMERS_CLIENT_ID", cast=str, default=None)
CHALMERS_CLIENT_SECRET = config("CHALMERS_CLIENT_SECRET", cast=str, default=None)
CHALMERS_COOKIE_REDIRECT_URI = config(
    "CHALMERS_COOKIE_REDIRECT_URI", cast=str, default=None
)

PUHURI_CLIENT_NAME = "puhuri"
PUHURI_CLIENT_ID = config("PUHURI_CLIENT_ID", cast=str, default=None)
PUHURI_CLIENT_SECRET = config("PUHURI_CLIENT_SECRET", cast=str, default=None)
PUHURI_CONFIG_ENDPOINT = config("PUHURI_CONFIG_ENDPOINT", cast=str, default=None)
PUHURI_COOKIE_REDIRECT_URI = config(
    "PUHURI_COOKIE_REDIRECT_URI", cast=str, default=None
)

JWT_SECRET = config("JWT_SECRET", cast=str, default=None)
JWT_TTL = config("JWT_TTL", cast=int, default=3600)
COOKIE_DOMAIN = config("COOKIE_DOMAIN", cast=str, default=None)
COOKIE_NAME = config("COOKIE_NAME", cast=str, default="tergiteauth")

AUTH_EMAIL_REGEX_MAP: Dict[str, Tuple[str, re.RegexFlag]] = {
    TERGITE_CLIENT_NAME: (config("TERGITE_EMAIL_REGEX", cast=str, default=".*"), 0),
    CHALMERS_CLIENT_NAME: (config("CHALMERS_EMAIL_REGEX", cast=str, default=".*"), 0),
    PUHURI_CLIENT_NAME: (config("PUHURI_EMAIL_REGEX", cast=str, default=".*"), 0),
}

AUTH_ROLES_MAP = {
    TERGITE_CLIENT_NAME: config(
        "TERGITE_ROLES", cast=CommaSeparatedStrings, default=None
    ),
    CHALMERS_CLIENT_NAME: config(
        "CHALMERS_ROLES", cast=CommaSeparatedStrings, default=None
    ),
    PUHURI_CLIENT_NAME: config(
        "PUHURI_ROLES", cast=CommaSeparatedStrings, default=None
    ),
}
