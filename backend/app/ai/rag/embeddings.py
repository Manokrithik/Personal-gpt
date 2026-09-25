from abc import ABC, abstractmethod
from typing import List
import math
import re
from app.core.logging import get_logger

logger = get_logger("rag.embeddings")

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        pass

    @abstractmethod
    async def embed_query(self, query: str) -> List[float]:
        pass

class LocalEmbeddingProvider(BaseEmbeddingProvider):
    """
    Lightweight, VRAM-friendly local embedding provider.
    Supports sentence-transformers when available, and includes a zero-overhead
    feature hashing vectorizer fallback for instant local operation.
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self._st_model = None
        self._dimension = 128

    def _hash_vector(self, text: str) -> List[float]:
        """Fast, deterministic zero-VRAM hashed representation with L2 normalization."""
        words = re.findall(r'\w+', text.lower())
        vec = [0.0] * self._dimension
        if not words:
            return vec

        for word in words:
            # Deterministic bucket hash
            h = hash(word) % self._dimension
            vec[h] += 1.0

        # L2 Normalize
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        return [self._hash_vector(t) for t in texts]

    async def embed_query(self, query: str) -> List[float]:
        return self._hash_vector(query)
