import pytest
import os
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.database import init_db

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    await init_db()

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["backend"] == "online"
    assert data["database"] == "connected"

@pytest.mark.asyncio
async def test_conversations_crud():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create
        create_res = await ac.post("/api/v1/conversations", json={"title": "Test Chat", "model": "mock-gpt"})
        assert create_res.status_code == 201
        conv_data = create_res.json()
        conv_id = conv_data["id"]
        assert conv_data["title"] == "Test Chat"

        # List
        list_res = await ac.get("/api/v1/conversations")
        assert list_res.status_code == 200
        assert any(c["id"] == conv_id for c in list_res.json())

        # Update
        patch_res = await ac.patch(f"/api/v1/conversations/{conv_id}", json={"title": "Updated Title", "is_pinned": True})
        assert patch_res.status_code == 200
        assert patch_res.json()["title"] == "Updated Title"
        assert patch_res.json()["is_pinned"] is True

        # Delete
        del_res = await ac.delete(f"/api/v1/conversations/{conv_id}")
        assert del_res.status_code == 204

@pytest.mark.asyncio
async def test_chat_with_mock_provider():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        chat_res = await ac.post(
            "/api/v1/chat",
            json={
                "message": "Calculate 25 * 4",
                "provider": "mock",
                "model": "mock-gpt",
                "use_rag": False,
                "use_tools": True,
            }
        )
        assert chat_res.status_code == 200
        data = chat_res.json()
        assert "conversation_id" in data
        assert "message_id" in data
        assert len(data["content"]) > 0

@pytest.mark.asyncio
async def test_memory_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create memory
        create_res = await ac.post(
            "/api/v1/memory",
            json={"content": "I prefer dark mode and clean architecture", "memory_type": "preference", "importance": 0.9}
        )
        assert create_res.status_code == 201
        mem_id = create_res.json()["id"]

        # List
        list_res = await ac.get("/api/v1/memory")
        assert list_res.status_code == 200
        assert any(m["id"] == mem_id for m in list_res.json())

        # Delete
        del_res = await ac.delete(f"/api/v1/memory/{mem_id}")
        assert del_res.status_code == 204

@pytest.mark.asyncio
async def test_models_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/models")
        assert res.status_code == 200
        data = res.json()
        assert "models" in data
        assert len(data["models"]) > 0
