from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.document_service import DocumentService
from app.schemas.document import DocumentSearchRequest, DocumentSearchResult

router = APIRouter(tags=["Search"])

@router.post("/search", response_model=List[DocumentSearchResult])
async def search_knowledge(request: DocumentSearchRequest, db: AsyncSession = Depends(get_db)):
    """Semantic vector search across indexed knowledge base chunks."""
    service = DocumentService(db)
    return await service.search(request.query, top_k=request.top_k)
