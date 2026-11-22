import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_api_info_endpoint_returns_telemetry():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/info")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "instance_id" in data
        assert data["service"] == "MotoRent-Cloud API"
        assert "uptime_seconds" in data
        assert isinstance(data["uptime_seconds"], (int, float))

@pytest.mark.asyncio
async def test_x_instance_id_header_injected_on_all_responses():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/info")
        assert "x-instance-id" in response.headers
        assert len(response.headers["x-instance-id"]) > 0

@pytest.mark.asyncio
async def test_root_endpoint_redirects_or_welcomes():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert "MotoRent" in response.json().get("message", "")
