import re
import os
import uuid
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from pathlib import Path
import jwt
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

# --- PASSWORD HASHING (PBKDF2-HMAC-SHA256) ---

def hash_password(password: str) -> str:
    """Hash password using salted PBKDF2-HMAC-SHA256."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    )
    return f"pbkdf2:sha256:100000${salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    if not hashed_password or not plain_password:
        return False
    try:
        parts = hashed_password.split("$")
        if len(parts) != 3:
            return False
        salt = parts[1]
        expected_hash = parts[2]
        computed_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100_000,
        )
        return hmac.compare_digest(computed_key.hex(), expected_hash)
    except Exception:
        return False

# --- JWT TOKENS ---

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    settings = get_settings()
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None
