import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.store import store

@pytest.mark.asyncio
async def test_create_rental_success_and_vehicle_marked_rented():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Check vehicle is Available
        veh = store.get_by_id("vehicles", "VEH-003")
        assert veh["status"] == "Available"
        daily_rate = veh["daily_rate"]

        # 2. Book rental for 3 days
        payload = {
            "customer_id": "CUST-001",
            "vehicle_id": "VEH-003",
            "duration_days": 3
        }
        response = await client.post("/api/rentals", json=payload)
        assert response.status_code == 201
        data = response.json()

        assert data["id"].startswith("RENT-")
        assert data["customer_id"] == "CUST-001"
        assert data["vehicle_id"] == "VEH-003"
        assert data["duration_days"] == 3
        assert data["daily_rate_snapshot"] == daily_rate
        assert data["total_cost"] == 3 * daily_rate
        assert data["rental_status"] == "Ongoing"
        assert "rented_at" in data
        assert "expected_return_at" in data

        # 3. Verify vehicle status was atomically changed to 'Rented' in store
        updated_veh = store.get_by_id("vehicles", "VEH-003")
        assert updated_veh["status"] == "Rented"

@pytest.mark.asyncio
async def test_create_rental_rejects_blacklisted_customer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # CUST-003 is Blacklisted in seed data
        payload = {
            "customer_id": "CUST-003",
            "vehicle_id": "VEH-001",
            "duration_days": 2
        }
        response = await client.post("/api/rentals", json=payload)
        assert response.status_code == 400
        assert "blacklisted" in response.json()["detail"].lower()

@pytest.mark.asyncio
async def test_create_rental_rejects_non_available_vehicle():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Temporarily mark VEH-004 as Maintenance
        store.update("vehicles", "VEH-004", {"status": "Maintenance"})

        payload = {
            "customer_id": "CUST-001",
            "vehicle_id": "VEH-004",
            "duration_days": 1
        }
        response = await client.post("/api/rentals", json=payload)
        assert response.status_code == 400
        assert "available" in response.json()["detail"].lower()

        # Revert
        store.update("vehicles", "VEH-004", {"status": "Available"})

@pytest.mark.asyncio
async def test_create_rental_prevents_double_booking():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Ensure clean state
        store.update("customers", "CUST-002", {"status": "Active"})
        store.update("vehicles", "VEH-005", {"status": "Available"})

        # First booking succeeds
        payload = {
            "customer_id": "CUST-002",
            "vehicle_id": "VEH-005",
            "duration_days": 2
        }
        resp1 = await client.post("/api/rentals", json=payload)
        assert resp1.status_code == 201

        # Second booking for the same vehicle must be rejected
        resp2 = await client.post("/api/rentals", json=payload)
        assert resp2.status_code == 400
        assert "already rented" in resp2.json()["detail"].lower() or "available" in resp2.json()["detail"].lower()

@pytest.mark.asyncio
async def test_get_rentals_list_and_filters():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a rental first
        create_payload = {
            "customer_id": "CUST-002",
            "vehicle_id": "VEH-002",
            "duration_days": 2
        }
        create_resp = await client.post("/api/rentals", json=create_payload)
        assert create_resp.status_code == 201

        # Get all
        response = await client.get("/api/rentals")
        assert response.status_code == 200
        rentals = response.json()
        assert len(rentals) >= 1

        # Filter by status
        resp_ongoing = await client.get("/api/rentals?status=Ongoing")
        assert resp_ongoing.status_code == 200
        assert all(r["rental_status"] == "Ongoing" for r in resp_ongoing.json())

        # Filter by customer_id
        resp_cust = await client.get("/api/rentals?customer_id=CUST-002")
        assert resp_cust.status_code == 200
        assert all(r["customer_id"] == "CUST-002" for r in resp_cust.json())

@pytest.mark.asyncio
async def test_return_rental_lifecycle_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create a rental
        create_resp = await client.post("/api/rentals", json={
            "customer_id": "CUST-001",
            "vehicle_id": "VEH-001",
            "duration_days": 2
        })
        assert create_resp.status_code == 201
        rental_id = create_resp.json()["id"]

        # Vehicle must be Rented
        assert store.get_by_id("vehicles", "VEH-001")["status"] == "Rented"

        # 2. Return the vehicle
        return_resp = await client.post(f"/api/rentals/{rental_id}/return")
        assert return_resp.status_code == 200
        data = return_resp.json()
        assert data["rental_status"] == "Completed"
        assert data["returned_at"] is not None

        # 3. Vehicle must be automatically restored to Available
        assert store.get_by_id("vehicles", "VEH-001")["status"] == "Available"

        # 4. Attempting to return again must fail (HTTP 400)
        double_return = await client.post(f"/api/rentals/{rental_id}/return")
        assert double_return.status_code == 400

@pytest.mark.asyncio
async def test_cancel_rental_lifecycle_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Create a rental
        create_resp = await client.post("/api/rentals", json={
            "customer_id": "CUST-001",
            "vehicle_id": "VEH-002",
            "duration_days": 1
        })
        assert create_resp.status_code == 201
        rental_id = create_resp.json()["id"]

        # Vehicle must be Rented
        assert store.get_by_id("vehicles", "VEH-002")["status"] == "Rented"

        # 2. Cancel the rental
        cancel_resp = await client.post(f"/api/rentals/{rental_id}/cancel")
        assert cancel_resp.status_code == 200
        assert cancel_resp.json()["rental_status"] == "Canceled"

        # 3. Vehicle must be restored to Available
        assert store.get_by_id("vehicles", "VEH-002")["status"] == "Available"
