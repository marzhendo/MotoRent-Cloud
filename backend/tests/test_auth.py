import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.store import store

@pytest.mark.asyncio
async def test_admin_seed_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "email": "admin@motorent.cloud",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == "admin"
        assert data["user"]["email"] == "admin@motorent.cloud"

@pytest.mark.asyncio
async def test_customer_seed_login_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/auth/login", json={
            "email": "andi@motorent.cloud",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["role"] == "customer"
        assert data["user"]["customer_id"] == "CUST-001"

@pytest.mark.asyncio
async def test_login_invalid_credentials_fails():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Wrong password
        resp_wrong_pw = await client.post("/api/auth/login", json={
            "email": "admin@motorent.cloud",
            "password": "wrongpassword"
        })
        assert resp_wrong_pw.status_code == 401

        # Non-existent user
        resp_not_found = await client.post("/api/auth/login", json={
            "email": "unknown@motorent.cloud",
            "password": "somepassword"
        })
        assert resp_not_found.status_code == 401

@pytest.mark.asyncio
async def test_customer_registration_flow_and_linked_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        reg_payload = {
            "email": "budi.santoso@gmail.com",
            "password": "securepassword123",
            "name": "Budi Santoso",
            "phone": "081999888777",
            "license_number": "SIM-A-998877"
        }
        response = await client.post("/api/auth/register", json=reg_payload)
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        user = data["user"]
        assert user["email"] == "budi.santoso@gmail.com"
        assert user["name"] == "Budi Santoso"
        assert user["role"] == "customer"
        assert user["customer_id"] is not None
        assert user["customer_id"].startswith("CUST-")

        # Verify Customer profile was created in store
        linked_cust = store.get_by_id("customers", user["customer_id"])
        assert linked_cust is not None
        assert linked_cust["name"] == "Budi Santoso"
        assert linked_cust["license_number"] == "SIM-A-998877"
        assert linked_cust["status"] == "Active"

        # Verify duplicate registration fails
        dup_resp = await client.post("/api/auth/register", json=reg_payload)
        assert dup_resp.status_code == 400
        assert "already registered" in dup_resp.json()["detail"].lower()

@pytest.mark.asyncio
async def test_auth_me_profile_resolution():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login to get token
        login_resp = await client.post("/api/auth/login", json={
            "email": "admin@motorent.cloud",
            "password": "admin123"
        })
        token = login_resp.json()["access_token"]

        # 2. Call /api/auth/me with valid Bearer token
        me_resp = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "admin@motorent.cloud"
        assert me_data["role"] == "admin"

        # 3. Call /api/auth/me without token -> 401
        me_no_token = await client.get("/api/auth/me")
        assert me_no_token.status_code == 401

        # 4. Call /api/auth/me with invalid token -> 401
        me_invalid_token = await client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.jwt.signature"})
        assert me_invalid_token.status_code == 401
