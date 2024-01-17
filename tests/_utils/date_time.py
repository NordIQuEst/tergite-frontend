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
"""Test utilities for datetime"""
from datetime import datetime, timedelta, timezone

from utils import date_time


def is_not_older_than(timestamp_str: str, seconds: int) -> bool:
    """Checks that the timestamp string is not older than the given number of seconds

    Args:
        timestamp_str: the timestamp string
        seconds: the number of seconds that timestamp should not be older than

    Returns:
        True if timestamp str is not older than the given seconds
    """
    return date_time.parse_datetime_string(timestamp_str) - datetime.now(
        tz=timezone.utc
    ) <= timedelta(seconds=seconds)
