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
"""Exceptions specific to the Puhuri service"""
from utils.exc import BaseMssException


class ResourceNotFoundError(BaseMssException):
    """Exception raised when a resource is not found in Puhuri"""


class ComponentNotFoundError(BaseMssException):
    """Exception raised when a component is not found"""


class UsageSubmissionError(BaseMssException):
    """Exception raised when usage submission fails"""
