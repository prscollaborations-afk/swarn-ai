import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "healthy"
    assert data["data"]["service"] == "Aabhushan AI API"

@pytest.mark.asyncio
async def test_presets_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/presets")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    catalog = res["data"]
    assert "skin_tone" in catalog
    assert len(catalog["skin_tone"]) == 6
    assert "face_shape" in catalog
    assert len(catalog["face_shape"]) == 5
    assert "age_group" in catalog
    assert len(catalog["age_group"]) == 4
    assert "region" in catalog
    assert len(catalog["region"]) == 8
    assert "outfit" in catalog
    assert len(catalog["outfit"]) == 12
