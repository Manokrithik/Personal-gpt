import pytest
from app.ai.rag.splitter import DocumentSplitter
from app.ai.rag.embeddings import LocalEmbeddingProvider
from app.storage.vector_storage import MemoryVectorStore, cosine_similarity

def test_document_splitter():
    splitter = DocumentSplitter(chunk_size=100, chunk_overlap=20)
    sample_text = "PersonalGPT is a modular and private AI assistant. " * 15
    docs = [{"content": sample_text, "metadata": {"filename": "test.txt", "page": 1}}]
    
    chunks = splitter.split_documents(docs)
    assert len(chunks) > 1
    assert "chunk_index" in chunks[0]
    assert chunks[0]["metadata"]["filename"] == "test.txt"

@pytest.mark.asyncio
async def test_local_embeddings():
    embedder = LocalEmbeddingProvider()
    vec1 = await embedder.embed_query("quantum computing research")
    vec2 = await embedder.embed_query("quantum computing physics")
    vec3 = await embedder.embed_query("chocolate chip cookies recipe")

    assert len(vec1) > 0
    sim_related = cosine_similarity(vec1, vec2)
    sim_unrelated = cosine_similarity(vec1, vec3)

    assert sim_related > sim_unrelated

@pytest.mark.asyncio
async def test_vector_store_operations():
    store = MemoryVectorStore(persist_path="./tests/fixtures/test_vector.json")
    await store.add_documents(
        ids=["doc1_0"],
        embeddings=[[1.0, 0.0, 0.0]],
        documents=["FastAPI is a modern web framework."],
        metadatas=[{"filename": "frameworks.txt", "document_id": "doc1"}]
    )

    results = await store.similarity_search(query_embedding=[1.0, 0.0, 0.0], top_k=1)
    assert len(results) == 1
    assert "FastAPI" in results[0]["content"]

    await store.delete_by_document_id("doc1")
    empty_results = await store.similarity_search(query_embedding=[1.0, 0.0, 0.0], top_k=1)
    assert len(empty_results) == 0
