import os
import json
import tempfile
import pytest

# We expect JsonStore to be importable from app.store
from app.store import JsonStore

def test_store_initializes_with_seed_data_when_file_missing():
    with tempfile.TemporaryDirectory() as tmpdir:
        store_path = os.path.join(tmpdir, "store.json")
        assert not os.path.exists(store_path)

        store = JsonStore(store_path)
        
        # Verify initial seed data
        vehicles = store.get_all("vehicles")
        customers = store.get_all("customers")
        rentals = store.get_all("rentals")

        assert len(vehicles) == 5
        assert len(customers) == 3
        assert len(rentals) == 0

        # Verify file was written to disk
        assert os.path.exists(store_path)
        with open(store_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            assert len(data["vehicles"]) == 5
            assert len(data["customers"]) == 3

def test_store_crud_lifecycle():
    with tempfile.TemporaryDirectory() as tmpdir:
        store_path = os.path.join(tmpdir, "store.json")
        store = JsonStore(store_path)

        # 1. Insert
        new_customer = {
            "id": "CUST-999",
            "name": "Budi Santoso",
            "phone": "08123456789",
            "license_number": "SIM-999",
            "status": "Active"
        }
        inserted = store.insert("customers", new_customer)
        assert inserted["id"] == "CUST-999"

        # 2. Get by ID
        fetched = store.get_by_id("customers", "CUST-999")
        assert fetched is not None
        assert fetched["name"] == "Budi Santoso"

        # 3. Update
        updated = store.update("customers", "CUST-999", {"status": "Blacklisted"})
        assert updated is not None
        assert updated["status"] == "Blacklisted"
        assert updated["name"] == "Budi Santoso"

        # 4. Persistence verification (reload store from same file)
        reloaded_store = JsonStore(store_path)
        persisted = reloaded_store.get_by_id("customers", "CUST-999")
        assert persisted is not None
        assert persisted["status"] == "Blacklisted"

        # 5. Delete
        deleted = store.delete("customers", "CUST-999")
        assert deleted is True
        assert store.get_by_id("customers", "CUST-999") is None
