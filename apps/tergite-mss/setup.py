# This code is part of Tergite
#
# (C) Copyright Miroslav Dobsicek 2021
# (C) Copyright Abdullah-Al Amin 2021
# (C) Copyright Martin Ahindura 2023
#
# This code is licensed under the Apache License, Version 2.0. You may
# obtain a copy of this license in the LICENSE.txt file in the root directory
# of this source tree or at http://www.apache.org/licenses/LICENSE-2.0.
#
# Any modifications or derivative works of this code must retain this
# copyright notice, and modified files need to carry a notice indicating
# that they have been altered from the originals.

from pathlib import Path

import setuptools

_ROOT_DIRECTORY = Path(__file__).parent

with open(_ROOT_DIRECTORY / "requirements.txt", mode="r") as _f:
    _ALL_REQUIREMENTS = _f.readlines()

    # extract non-dev dependencies
    _DEV_DEPS_START = len(_ALL_REQUIREMENTS)
    try:
        _DEV_DEPS_START = _ALL_REQUIREMENTS.index("# dev-dependencies")
    except ValueError:
        pass

    REQUIREMENTS = _ALL_REQUIREMENTS[:_DEV_DEPS_START]

_README = (_ROOT_DIRECTORY / "README.md").read_text()


setuptools.setup(
    name="tergite-mss",
    version="2024.12.1",
    author="Miroslav Dobsicek",
    maintainer="Chalmers Next Labs AB",
    maintainer_email="quantum.nextlabs@chalmers.se",
    author_email="dobsicek@chalmers.se",
    description="the public API for the WACQT quantum computer",
    long_description=_README,
    long_description_content_type="text/markdown",
    url="https://github.com/tergite/tergite-mss",
    packages=setuptools.find_packages(exclude=["archive*", "dev*", "docs*", "tests*"]),
    python_requires=">=3.8",
    include_package_data=True,
    license="Apache 2.0",
    install_requires=REQUIREMENTS,
    classifiers=[
        "Programming Language :: Python :: 3.8",
        "Operating System :: OS Independent",
    ],
)
