from typing import List, Optional, Dict, Any
from sqlalchemy import select, delete, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.document import Document, DocumentChunk

class DocumentRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_documents(self, user_id: Optional[str] = None) -> List[Document]:
        query = select(Document).order_by(Document.created_at.desc()).options(selectinload(Document.chunks))
        if user_id:
            query = query.where(Document.user_id == user_id)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, document_id: str) -> Optional[Document]:
        query = select(Document).where(Document.id == document_id).options(selectinload(Document.chunks))
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def create(
        self,
        filename: str,
        file_type: str,
        file_size: int,
        file_path: str,
        user_id: Optional[str] = None,
        extra_metadata: Optional[Dict[str, Any]] = None,
    ) -> Document:
        doc = Document(
            filename=filename,
            file_type=file_type,
            file_size=file_size,
            file_path=file_path,
            status="processing",
            user_id=user_id,
            extra_metadata=extra_metadata,
        )
        self.session.add(doc)
        await self.session.commit()
        await self.session.refresh(doc)
        return doc

    async def update_status(self, document_id: str, status: str, error_message: Optional[str] = None):
        query = (
            update(Document)
            .where(Document.id == document_id)
            .values(status=status, error_message=error_message)
        )
        await self.session.execute(query)
        await self.session.commit()

    async def add_chunks(self, document_id: str, chunks_data: List[Dict[str, Any]]):
        for item in chunks_data:
            chunk = DocumentChunk(
                document_id=document_id,
                chunk_index=item["chunk_index"],
                content=item["content"],
                embedding_reference=item.get("embedding_reference"),
                extra_metadata=item.get("extra_metadata"),
            )
            self.session.add(chunk)
        await self.session.commit()

    async def get_chunks_for_document(self, document_id: str) -> List[DocumentChunk]:
        query = select(DocumentChunk).where(DocumentChunk.document_id == document_id).order_by(DocumentChunk.chunk_index.asc())
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def delete(self, document_id: str) -> Optional[Document]:
        doc = await self.get_by_id(document_id)
        if doc:
            await self.session.delete(doc)
            await self.session.commit()
        return doc
