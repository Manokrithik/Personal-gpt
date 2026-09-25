import re
from typing import Optional, Dict, Any, List
from app.core.logging import get_logger

logger = get_logger("memory.long_term")

# Heuristic extraction patterns for fast local detection without burning inference
PREFERENCE_PATTERNS = [
    (r"(?:i prefer|i like|i love)\s+(.+)", "preference", 0.8),
    (r"(?:my name is|call me)\s+([A-Za-z0-9_ ]+)", "fact", 0.9),
    (r"(?:my goal is|i want to learn|i am learning)\s+(.+)", "goal", 0.7),
    (r"(?:always|never|make sure to)\s+(.+)", "instruction", 0.85),
    (r"(?:i am working on|my project is)\s+(.+)", "project", 0.75),
]

class LongTermMemoryManager:
    """Detects, extracts, and manages persistent user memories."""

    def extract_candidate(self, text: str) -> Optional[Dict[str, Any]]:
        text_lower = text.strip().lower()

        for pattern, mtype, score in PREFERENCE_PATTERNS:
            match = re.search(pattern, text_lower, re.IGNORECASE)
            if match:
                extracted = match.group(0).strip()
                # Clean up punctuation
                extracted = re.sub(r'[\.\!\?]+$', '', extracted)
                return {
                    "content": extracted,
                    "memory_type": mtype,
                    "importance": score,
                    "source": "pattern_extraction",
                }
        return None

    def is_duplicate(self, candidate_content: str, existing_memories: List[Any]) -> bool:
        norm_candidate = candidate_content.strip().lower()
        for mem in existing_memories:
            mem_text = mem.content.strip().lower() if hasattr(mem, 'content') else mem.get('content', '').lower()
            if norm_candidate in mem_text or mem_text in norm_candidate:
                return True
        return False
