from pathlib import Path

def format_file_size(size_bytes: int) -> str:
    """Format bytes into readable human-friendly size."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lstrip('.').lower()
