import pytest
from app.store import store

@pytest.fixture(autouse=True)
def reset_store_state_before_each_test():
    store.reset_to_seed()
    yield
    store.reset_to_seed()
