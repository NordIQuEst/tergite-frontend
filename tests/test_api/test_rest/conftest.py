from typing import Dict

from tests._utils.env import (
    TEST_DB_NAME,
    TEST_MONGODB_URL,
    TEST_PUHURI_CONFIG_ENDPOINT,
    setup_test_env,
)

# Set up the test environment before any other imports are made
setup_test_env()

import httpx
import pymongo.database
import pytest
from fastapi.testclient import TestClient

from tests._utils.auth import TEST_APP_TOKEN_STRING, init_test_auth
from tests._utils.fixtures import load_json_fixture

_PUHURI_OPENID_CONFIG = load_json_fixture("puhuri_openid_config.json")


@pytest.fixture
def mock_puhuri(respx_mock):
    respx_mock.get(TEST_PUHURI_CONFIG_ENDPOINT).mock(
        return_value=httpx.Response(status_code=200, json=_PUHURI_OPENID_CONFIG)
    )
    yield respx_mock


@pytest.fixture
def db(mock_puhuri) -> pymongo.database.Database:
    """The mongo db instance for testing"""
    mongo_client = pymongo.MongoClient(TEST_MONGODB_URL)
    database = mongo_client[TEST_DB_NAME]

    yield database
    # clean up
    mongo_client.drop_database(TEST_DB_NAME)


@pytest.fixture
def app_token_header() -> Dict[str, str]:
    """the auth header for the client"""
    yield {"Authorization": f"Bearer {TEST_APP_TOKEN_STRING}"}


@pytest.fixture
def client(db) -> TestClient:
    """A test client for fast api"""
    from rest_api import app

    init_test_auth(db)
    yield TestClient(app)
