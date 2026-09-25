from typing import Dict, Any
from app.ai.tools.base import BaseTool
from app.ai.rag.retriever import KnowledgeRetriever

class KnowledgeSearchTool(BaseTool):
    name = "knowledge_search"
    description = "Perform semantic retrieval from the user's private knowledge base."
    parameters = {
        "query": {"type": "string", "description": "The search query to retrieve relevant documents for"}
    }

    def __init__(self, retriever: KnowledgeRetriever = None):
        self.retriever = retriever or KnowledgeRetriever()

    async def execute(self, **kwargs) -> Dict[str, Any]:
        query = kwargs.get("query", "").strip()
        if not query:
            return {"error": "Empty query", "status": "failed"}

        results = await self.retriever.retrieve(query, top_k=3)
        return {
            "query": query,
            "results_count": len(results),
            "results": [
                {
                    "content": r["content"],
                    "filename": r.get("metadata", {}).get("filename", ""),
                    "score": r.get("score", 0.0),
                }
                for r in results
            ],
            "status": "success",
        }
