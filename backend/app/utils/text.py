import re

def truncate_text(text: str, max_chars: int = 150) -> str:
    """Cleanly truncate text with ellipsis."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars].rstrip() + "..."

def extract_keywords(text: str) -> list[str]:
    """Extract search words from text."""
    words = re.findall(r'\b[a-zA-Z0-9_-]{3,}\b', text.lower())
    return list(set(words))
