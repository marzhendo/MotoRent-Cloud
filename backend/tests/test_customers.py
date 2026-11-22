import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.store import store

@pytest.mark.asyncio
async def test_create_customer_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "name": "Rian Hidayat",
            "phone": "081299887766",
            "license_number": "SIM-A-998877",
            "status": "Active"
        }
        response = await client.post("/api/customers", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Rian Hidayat"
        assert data["license_number"] == "SIM-A-998877"
        assert data["id"].startswith("CUST-")
        assert data["status"] == "Active"

@pytest.mark.asyncio
async def test_create_customer_validation_empty_license_fails():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "name": "Invalid Customer",
            "phone": "081299887766",
            "license_number": "   ",
            "status": "Active"
        }
        response = await client.post("/api/customers", json=payload)
        assert response.status_code == 422 or response.status_code == 400

@pytest.mark.asyncio
async def test_get_all_customers_and_filter():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Get all
        response = await client.get("/api/customers")
        assert response.status_code == 200
        customers = response.json()
        assert len(customers) >= 3

        # Filter by status: Active
        resp_active = await client.get("/api/customers?status=Active")
        assert resp_active.status_code == 200
        active_list = resp_active.json()
        assert all(c["status"] == "Active" for c in active_list)

        # Filter by status: Blacklisted
        resp_bl = await client.get("/api/customers?status=Blacklisted")
        assert resp_bl.status_code == 200
        bl_list = resp_bl.json()
        assert any(c["id"] == "CUST-003" for c in bl_list)

@pytest.mark.asyncio
async def test_get_customer_by_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/customers/CUST-001")
        assert response.status_code == 200
        assert response.json()["name"] == "Andi Pratama"

        # Not found
        resp_404 = await client.get("/api/customers/CUST-9999")
        assert resp_404.status_code == 404

@pytest.mark.asyncio
async def test_update_customer_status_and_phone():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        update_payload = {
            "phone": "08999999999",
            "status": "Blacklisted"
        }
        response = await client.put("/api/customers/CUST-002", json=update_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "08999999999"
        assert data["status"] == "Blacklisted"

@pytest.mark.asyncio
async def test_delete_customer_guard_when_active_rental_exists():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create a temporary customer
        cust_resp = await client.post("/api/customers", json={
            "name": "Temporer Rental",
            "phone": "0811111111",
            "license_number": "SIM-C-11111",
            "status": "Active"
        })
        cust_id = cust_resp.json()["id"]

        # Insert a simulated ongoing rental for this customer
        store.insert("rentals", {
            "id": "RENT-TEST-001",
            "customer_id": cust_id,
            "vehicle_id": "VEH-001",
            "duration_days": 2,
            "total_cost": 240000,
            "rental_status": "Ongoing"
        })

        # Attempt to delete should fail with 400
        del_resp = await client.delete(f"/api/customers/{cust_id}")
        assert del_resp.status_code == 400
        assert "ongoing rental" in del_resp.json()["detail"].lower()

        # Clean up rental
        store.delete("rentals", "RENT-TEST-001")

        # Now deletion succeeds
        del_success = await client.delete(f"/api/customers/{cust_id}")
        assert del_success.status_code == 200
