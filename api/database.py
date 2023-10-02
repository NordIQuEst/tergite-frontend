# This code is part of Tergite
#
# (C) Copyright Simon Genne, Arvid Holmqvist, Bashar Oumari, Jakob Ristner,
#               Björn Rosengren, and Jakob Wik 2022 (BSc project)
# (C) Copyright Abdullah-Al Amin 2022
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.
import logging
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient


# Code section deletes entries from data base
# Used for test purposes
"""
async def do_delete_one():
    n = await collection.count_documents({})
    print('%s documents before calling delete_one()' % n)
    result = await collection.delete_many({})
    print('%s documents after' % (await collection.count_documents({})))

loop = client.get_io_loop()
loop.run_until_complete(do_delete_one())"""

_CONNECTIONS = {}


def get_mongodb(url: str, name: str) -> AsyncIOMotorDatabase:
    """Returns a mongo db which can be used to get collections

    https://fastapi.tiangolo.com/advanced/settings/#lru_cache-technical-details
    lru_cache memoizes the function

    Args:
        url: the mongo db url
        name: the name of the mongo database

    Returns:
        a AsyncIOMotorDatabase instance that can be used to extract collections
    """
    global _CONNECTIONS

    try:
        client = _CONNECTIONS[url]
        if client.io_loop.is_closed():
            client.close()
            logging.debug(f"New mongo db connection at {datetime.utcnow().isoformat()}")
            client = AsyncIOMotorClient(url, tz_aware=True)
    except KeyError:
        logging.debug(f"New mongo db connection at {datetime.utcnow().isoformat()}")
        client = AsyncIOMotorClient(url, tz_aware=True)

    _CONNECTIONS[url] = client
    return client[name]
