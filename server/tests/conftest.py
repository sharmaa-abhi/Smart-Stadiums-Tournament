import pytest
from fastapi.testclient import TestClient
from server.app.main import app
from server.app.db.database import engine, Base

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables before running tests and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
