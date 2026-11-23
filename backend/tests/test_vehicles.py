import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.store import store

@pytest.mark.asyncio
async def test_create_vehicle_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "model_name": "Honda PCX 160",
            "category": "Motor",
            "plate_number": "R 7788 XY",
            "daily_rate": 130000,
            "status": "Available"
        }
        response = await client.post("/api/vehicles", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["model_name"] == "Honda PCX 160"
        assert data["id"].startswith("VEH-")
        assert data["category"] == "Motor"
        assert data["daily_rate"] == 130000
        assert data["status"] == "Available"

@pytest.mark.asyncio
async def test_create_vehicle_validation_invalid_rate_fails():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "model_name": "Yamaha Mio",
            "category": "Motor",
            "plate_number": "R 1111 AB",
            "daily_rate": -50000,
            "status": "Available"
        }
        response = await client.post("/api/vehicles", json=payload)
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_get_all_vehicles_and_filters():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # All vehicles
        response = await client.get("/api/vehicles")
        assert response.status_code == 200
        vehicles = response.json()
        assert len(vehicles) >= 5

        # Filter by category: Mobil
        resp_mobil = await client.get("/api/vehicles?category=Mobil")
        assert resp_mobil.status_code == 200
        mobils = resp_mobil.json()
        assert all(v["category"] == "Mobil" for v in mobils)
        assert any(v["model_name"] == "Toyota Avanza 1.5G" for v in mobils)

        # Filter by category: Motor
        resp_motor = await client.get("/api/vehicles?category=Motor")
        assert resp_motor.status_code == 200
        motors = resp_motor.json()
        assert all(v["category"] == "Motor" for v in motors)

        # Filter by status: Available
        resp_avail = await client.get("/api/vehicles?status=Available")
        assert resp_avail.status_code == 200
        assert all(v["status"] == "Available" for v in resp_avail.json())

@pytest.mark.asyncio
async def test_get_vehicle_by_id_and_not_found():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Success
        response = await client.get("/api/vehicles/VEH-001")
        assert response.status_code == 200
        assert response.json()["model_name"] == "Yamaha NMAX 155"

        # Not found
        resp_404 = await client.get("/api/vehicles/VEH-9999")
        assert resp_404.status_code == 404

@pytest.mark.asyncio
async def test_update_vehicle_details_and_status():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        update_payload = {
            "daily_rate": 125000,
            "status": "Maintenance"
        }
        response = await client.put("/api/vehicles/VEH-001", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["daily_rate"] == 125000
        assert data["status"] == "Maintenance"

        # Revert back to Available
        await client.put("/api/vehicles/VEH-001", json={"daily_rate": 120000, "status": "Available"})

@pytest.mark.asyncio
async def test_delete_vehicle_guard_when_rented():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create temp vehicle
        veh_resp = await client.post("/api/vehicles", json={
            "model_name": "Suzuki Ertiga",
            "category": "Mobil",
            "plate_number": "R 4444 ZZ",
            "daily_rate": 350000,
            "status": "Rented"
        })
        veh_id = veh_resp.json()["id"]

        # Insert ongoing rental tying this vehicle
        store.insert("rentals", {
            "id": "RENT-TEST-VEH",
            "customer_id": "CUST-001",
            "vehicle_id": veh_id,
            "duration_days": 3,
            "total_cost": 1050000,
            "rental_status": "Ongoing"
        })

        # Attempt to delete should fail with 400
        del_resp = await client.delete(f"/api/vehicles/{veh_id}")
        assert del_resp.status_code == 400
        assert "rented" in del_resp.json()["detail"].lower()

        # Clean up rental and set status back to Available
        store.delete("rentals", "RENT-TEST-VEH")
        await client.put(f"/api/vehicles/{veh_id}", json={"status": "Available"})

        # Now deletion succeeds
        del_success = await client.delete(f"/api/vehicles/{veh_id}")
        assert del_success.status_code == 200

@pytest.mark.asyncio
async def test_vehicle_extended_attributes_seats_transmission_image():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check seed vehicle VEH-001 has extended attributes
        response = await client.get("/api/vehicles/VEH-001")
        assert response.status_code == 200
        data = response.json()
        assert data["seats"] == 2
        assert data["transmission"] == "Matic"
        assert "/vehicles/yamaha-nmax" in data["image_url"]

        # Create custom vehicle with custom seats and transmission
        new_veh = {
            "model_name": "Toyota Innova Zenix",
            "category": "Mobil",
            "plate_number": "B 9999 INN",
            "daily_rate": 600000,
            "status": "Available",
            "seats": 8,
            "transmission": "Matic",
            "image_url": "/vehicles/placeholder.svg"
        }
        create_resp = await client.post("/api/vehicles", json=new_veh)
        assert create_resp.status_code == 201
        created = create_resp.json()
        assert created["seats"] == 8
        assert created["transmission"] == "Matic"
        assert created["image_url"] == "/vehicles/placeholder.svg"

        # Clean up
        await client.delete(f"/api/vehicles/{created['id']}")
