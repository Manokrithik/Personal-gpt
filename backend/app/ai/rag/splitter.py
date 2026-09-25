from typing import List, Dict, Any

class DocumentSplitter:
    """Splits text into chunks preserving sentence/word structure and overlap."""

    def __init__(self, chunk_size: int = 600, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split_documents(self, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks: List[Dict[str, Any]] = []
        global_idx = 0

        for doc in documents:
            text = doc["content"]
            meta = doc.get("metadata", {})
            
            if not text.strip():
                continue

            words = text.split()
            if not words:
                continue

            # Approximate words per chunk (avg word length ~5 chars + space)
            words_per_chunk = max(20, self.chunk_size // 6)
            overlap_words = max(5, self.chunk_overlap // 6)

            start = 0
            while start < len(words):
                end = min(start + words_per_chunk, len(words))
                chunk_text = " ".join(words[start:end])

                chunks.append({
                    "chunk_index": global_idx,
                    "content": chunk_text,
                    "metadata": {
                        **meta,
                        "chunk_index": global_idx,
                    }
                })
                global_idx += 1

                if end == len(words):
                    break
                start += max(1, words_per_chunk - overlap_words)

        return chunks
