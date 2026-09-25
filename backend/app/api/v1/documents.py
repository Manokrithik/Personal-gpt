from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.document_service import DocumentService
from app.schemas.document import DocumentSchema

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentSchema])
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all knowledge base documents with processing status."""
    service = DocumentService(db)
    return await service.list_documents()

@router.post("/upload", response_model=DocumentSchema, status_code=status.HTTP_201_CREATED)
async def upload_document(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """Upload and index a document (PDF, TXT, MD, DOCX, CSV) into the RAG vector store."""
    service = DocumentService(db)
    return await service.upload_and_process(file)

@router.get("/{document_id}", response_model=DocumentSchema)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details for a single document."""
    service = DocumentService(db)
    return await service.get_document(document_id)

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    """Delete document, uploaded file, and all corresponding vector embeddings."""
    service = DocumentService(db)
    await service.delete_document(document_id)
