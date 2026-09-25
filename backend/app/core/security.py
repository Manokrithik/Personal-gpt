import re
import os
import uuid
from pathlib import Path
from app.core.exceptions import SecurityException
from app.core.config import get_settings

SAFE_FILENAME_RE = re.compile(r'[^a-zA-Z0-9_\-\.]')

def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent directory traversal and dangerous characters."""
    base = os.path.basename(filename)
    clean = SAFE_FILENAME_RE.sub('_', base)
    if not clean:
        clean = f"doc_{uuid.uuid4().hex[:8]}"
    return clean

def validate_file_upload(filename: str, file_size: int):
    """Validate uploaded file extension and size constraints."""
    settings = get_settings()
    ext = Path(filename).suffix.lstrip('.').lower()
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise SecurityException(
            f"File extension '{ext}' is not permitted. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise SecurityException(
            f"File size ({file_size / (1024*1024):.1f}MB) exceeds maximum allowed {settings.MAX_UPLOAD_SIZE_MB}MB."
        )
