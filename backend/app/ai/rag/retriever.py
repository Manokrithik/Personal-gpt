from typing import List, Dict, Any, Optional
from app.ai.rag.embeddings import BaseEmbeddingProvider, LocalEmbeddingProvider
from app.storage.vector_storage import BaseVectorStore, get_vector_store
from app.schemas.chat import ChatCitation

class KnowledgeRetriever:
    def __init__(
        self,
        vector_store: Optional[BaseVectorStore] = None,
        embedding_provider: Optional[BaseEmbeddingProvider] = None,
    ):
        self.vector_store = vector_store or get_vector_store()
        self.embedding_provider = embedding_provider or LocalEmbeddingProvider()

    async def retrieve(
        self,
        query: str,
        top_k: int = 4,
        similarity_threshold: float = 0.05
    ) -> List[Dict[str, Any]]:
        query_embedding = await self.embedding_provider.embed_query(query)
        results = await self.vector_store.similarity_search(query_embedding, top_k=top_k)
        
        filtered = [r for r in results if r.get("score", 0.0) >= similarity_threshold]
        return filtered

    def format_citations(self, search_results: List[Dict[str, Any]]) -> List[ChatCitation]:
        citations = []
        for r in search_results:
            meta = r.get("metadata", {})
            citations.append(
                ChatCitation(
                    document_id=meta.get("document_id", "unknown"),
                    filename=meta.get("filename", "unknown"),
                    chunk_index=meta.get("chunk_index", 0),
                    content=r.get("content", ""),
                    page=meta.get("page"),
                    similarity_score=r.get("score"),
                )
            )
        return citations

    def format_context_string(self, search_results: List[Dict[str, Any]]) -> str:
        blocks = []
        for i, r in enumerate(search_results, 1):
            meta = r.get("metadata", {})
            filename = meta.get("filename", "document")
            page = meta.get("page", 1)
            blocks.append(f"[{i}] File: {filename} (Page {page}):\n{r.get('content', '')}")
        return "\n\n".join(blocks)
