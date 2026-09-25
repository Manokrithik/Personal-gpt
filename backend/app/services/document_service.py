from typing import List, Dict, Any, Optional
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentSchema, DocumentSearchResult
from app.storage.file_storage import FileStorage
from app.storage.vector_storage import get_vector_store
from app.ai.rag.pipeline import RAGPipeline
from app.ai.rag.retriever import KnowledgeRetriever
from app.core.exceptions import NotFoundException
from app.core.logging import get_logger

logger = get_logger("service.document")

class DocumentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = DocumentRepository(session)
        self.file_storage = FileStorage()
        self.vector_store = get_vector_store()
        self.pipeline = RAGPipeline(self.repo, self.vector_store)
        self.retriever = KnowledgeRetriever(self.vector_store)

    async def list_documents(self) -> List[DocumentSchema]:
        docs = await self.repo.list_documents()
        result = []
        for d in docs:
            schema = DocumentSchema.model_validate(d)
            schema.chunks_count = len(d.chunks) if d.chunks else 0
            result.append(schema)
        return result

    async def get_document(self, document_id: str) -> DocumentSchema:
        doc = await self.repo.get_by_id(document_id)
        if not doc:
            raise NotFoundException("Document", document_id)
        schema = DocumentSchema.model_validate(doc)
        schema.chunks_count = len(doc.chunks) if doc.chunks else 0
        return schema

    async def upload_and_process(self, file: UploadFile) -> DocumentSchema:
        # 1. Save file locally
        filename, file_path, file_size = await self.file_storage.save_upload(file)
        file_type = file.filename.split('.')[-1].lower() if '.' in file.filename else "unknown"

        # 2. Create document record in database
        doc = await self.repo.create(
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            file_path=file_path,
        )

        # 3. Process document through RAG pipeline (extract, chunk, embed, store)
        try:
            await self.pipeline.ingest_document(doc.id, file_path)
            # Reload updated document
            updated_doc = await self.repo.get_by_id(doc.id)
            schema = DocumentSchema.model_validate(updated_doc)
            schema.chunks_count = len(updated_doc.chunks) if updated_doc.chunks else 0
            return schema
        except Exception as e:
            logger.error(f"Error during RAG ingestion for doc {doc.id}: {e}")
            updated_doc = await self.repo.get_by_id(doc.id)
            return DocumentSchema.model_validate(updated_doc)

    async def delete_document(self, document_id: str) -> bool:
        doc = await self.repo.get_by_id(document_id)
        if not doc:
            raise NotFoundException("Document", document_id)

        # 1. Remove file from disk
        self.file_storage.delete_file(doc.file_path)

        # 2. Remove chunks from Vector Store
        await self.vector_store.delete_by_document_id(document_id)

        # 3. Delete from DB
        await self.repo.delete(document_id)
        return True

    async def search(self, query: str, top_k: int = 4) -> List[DocumentSearchResult]:
        results = await self.retriever.retrieve(query, top_k=top_k)
        formatted = []
        for r in results:
            meta = r.get("metadata", {})
            formatted.append(
                DocumentSearchResult(
                    document_id=meta.get("document_id", ""),
                    filename=meta.get("filename", ""),
                    chunk_index=meta.get("chunk_index", 0),
                    content=r.get("content", ""),
                    score=r.get("score", 0.0),
                    metadata=meta,
                )
            )
        return formatted
