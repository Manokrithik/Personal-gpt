from typing import Dict, Any, List
import uuid
from app.ai.rag.loader import DocumentLoader
from app.ai.rag.splitter import DocumentSplitter
from app.ai.rag.embeddings import BaseEmbeddingProvider, LocalEmbeddingProvider
from app.storage.vector_storage import BaseVectorStore, get_vector_store
from app.db.repositories.document_repository import DocumentRepository
from app.core.logging import get_logger

logger = get_logger("rag.pipeline")

class RAGPipeline:
    def __init__(
        self,
        document_repo: DocumentRepository,
        vector_store: BaseVectorStore = None,
        embedding_provider: BaseEmbeddingProvider = None,
    ):
        self.document_repo = document_repo
        self.vector_store = vector_store or get_vector_store()
        self.embedding_provider = embedding_provider or LocalEmbeddingProvider()
        self.splitter = DocumentSplitter()

    async def ingest_document(self, document_id: str, file_path: str):
        try:
            logger.info(f"Starting ingestion for document {document_id} from {file_path}")
            
            # 1. Load document
            pages = DocumentLoader.load(file_path)
            
            # 2. Split into chunks
            raw_chunks = self.splitter.split_documents(pages)
            if not raw_chunks:
                raw_chunks = [{
                    "chunk_index": 0,
                    "content": "Empty document content.",
                    "metadata": {"filename": file_path, "page": 1, "chunk_index": 0}
                }]

            # 3. Generate embeddings
            texts = [c["content"] for c in raw_chunks]
            embeddings = await self.embedding_provider.embed_texts(texts)

            # 4. Prepare records for Vector Store & DB
            chunk_ids = [f"{document_id}_{c['chunk_index']}" for c in raw_chunks]
            metadatas = [
                {
                    **c.get("metadata", {}),
                    "document_id": document_id,
                    "chunk_index": c["chunk_index"],
                }
                for c in raw_chunks
            ]

            await self.vector_store.add_documents(
                ids=chunk_ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas,
            )

            # 5. Persist chunks in SQL DB
            db_chunks = [
                {
                    "chunk_index": c["chunk_index"],
                    "content": c["content"],
                    "embedding_reference": chunk_ids[i],
                    "extra_metadata": metadatas[i],
                }
                for i, c in enumerate(raw_chunks)
            ]
            await self.document_repo.add_chunks(document_id, db_chunks)

            # 6. Mark ready
            await self.document_repo.update_status(document_id, "ready")
            logger.info(f"Ingestion succeeded for document {document_id}: {len(db_chunks)} chunks indexed.")

        except Exception as e:
            logger.error(f"Ingestion failed for document {document_id}: {e}", exc_info=True)
            await self.document_repo.update_status(document_id, "failed", error_message=str(e))
            raise
