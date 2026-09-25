from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import math
import json
import os
from pathlib import Path
from app.core.logging import get_logger

logger = get_logger("storage.vector")

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    dot = sum(a * b for a, b in zip(v1, v2))
    return max(0.0, min(1.0, dot))

class BaseVectorStore(ABC):
    @abstractmethod
    async def add_documents(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ):
        pass

    @abstractmethod
    async def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 4,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def delete(self, ids: List[str]):
        pass

    @abstractmethod
    async def delete_by_document_id(self, document_id: str):
        pass

class MemoryVectorStore(BaseVectorStore):
    """Zero-dependency, persistent JSON-backed vector store for local development."""

    def __init__(self, persist_path: str = "./data/chroma/vector_index.json"):
        self.persist_path = persist_path
        self._entries: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self):
        if os.path.exists(self.persist_path):
            try:
                with open(self.persist_path, "r", encoding="utf-8") as f:
                    self._entries = json.load(f)
                logger.info(f"Loaded {len(self._entries)} vector records from {self.persist_path}")
            except Exception as e:
                logger.warning(f"Could not load vector store from {self.persist_path}: {e}")
                self._entries = {}

    def _save(self):
        try:
            os.makedirs(os.path.dirname(self.persist_path), exist_ok=True)
            with open(self.persist_path, "w", encoding="utf-8") as f:
                json.dump(self._entries, f)
        except Exception as e:
            logger.error(f"Failed to persist vector store: {e}")

    async def add_documents(
        self,
        ids: List[str],
        embeddings: List[List[float]],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ):
        for doc_id, emb, text, meta in zip(ids, embeddings, documents, metadatas):
            self._entries[doc_id] = {
                "id": doc_id,
                "embedding": emb,
                "document": text,
                "metadata": meta,
            }
        self._save()

    async def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 4,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        scored = []
        for doc_id, record in self._entries.items():
            meta = record.get("metadata", {})
            if filter_dict:
                match = all(meta.get(k) == v for k, v in filter_dict.items())
                if not match:
                    continue

            sim = cosine_similarity(query_embedding, record["embedding"])
            scored.append({
                "id": doc_id,
                "content": record["document"],
                "metadata": meta,
                "score": sim,
            })

        # Sort by similarity descending
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    async def delete(self, ids: List[str]):
        for doc_id in ids:
            self._entries.pop(doc_id, None)
        self._save()

    async def delete_by_document_id(self, document_id: str):
        to_delete = [
            doc_id for doc_id, rec in self._entries.items()
            if rec.get("metadata", {}).get("document_id") == document_id
        ]
        await self.delete(to_delete)

def get_vector_store() -> BaseVectorStore:
    """Factory returning configured vector store instance."""
    return MemoryVectorStore()
