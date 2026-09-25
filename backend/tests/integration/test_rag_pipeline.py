import pytest
import io
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_document_upload_and_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create a sample document file
        doc_content = b"PersonalGPT includes built-in retrieval-augmented generation (RAG) for indexing PDF, DOCX, TXT, and Markdown documents."
        files = {
            "file": ("rag_feature_guide.txt", io.BytesIO(doc_content), "text/plain")
        }

        # Upload
        upload_res = await ac.post("/api/v1/documents/upload", files=files)
        assert upload_res.status_code == 201
        doc_data = upload_res.json()
        assert doc_data["status"] == "ready"
        doc_id = doc_data["id"]

        # List
        list_res = await ac.get("/api/v1/documents")
        assert list_res.status_code == 200
        assert any(d["id"] == doc_id for d in list_res.json())

        # Search
        search_res = await ac.post("/api/v1/search", json={"query": "RAG indexing documents", "top_k": 2})
        assert search_res.status_code == 200
        results = search_res.json()
        assert len(results) > 0
        assert "retrieval-augmented generation" in results[0]["content"]

        # Delete document
        del_res = await ac.delete(f"/api/v1/documents/{doc_id}")
        assert del_res.status_code == 204
