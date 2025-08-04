import sys
import os
from fastapi.testclient import TestClient
import pytest

# Add the src directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from main import app
from db.database import get_db
from .database import override_get_db, setup_database, teardown_database

# Override the original get_db dependency with the test version
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def session_setup_teardown():
    """
    This fixture sets up the database before any tests in this module run,
    and tears it down after they are all done.
    """
    setup_database()
    yield
    teardown_database()


def test_create_and_read_organization():
    """
    Tests creating an organization and then retrieving it to ensure it was created correctly.
    """
    # 1. Create the organization
    response = client.post("/organizations/", json={"name": "Test Corp"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["name"] == "Test Corp"
    assert "id" in data
    org_id = data["id"]

    # 2. Retrieve the organization by its ID
    response = client.get(f"/organizations/{org_id}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["name"] == "Test Corp"
    assert data["id"] == org_id


def test_read_organizations():
    """
    Tests the endpoint for listing all organizations.
    """
    # We already created one organization in the previous test.
    response = client.get("/organizations/")
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Test Corp"


def test_read_nonexistent_organization():
    """
    Tests that requesting a non-existent organization returns a 404 error.
    """
    import uuid
    non_existent_id = uuid.uuid4()
    response = client.get(f"/organizations/{non_existent_id}")
    assert response.status_code == 404
