import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.core.config import get_settings
from app.core.security import sanitize_filename, validate_file_upload
from app.core.logging import get_logger

logger = get_logger("storage.file")

class FileStorage:
    def __init__(self, base_dir: str = None):
        settings = get_settings()
        self.base_dir = Path(base_dir or settings.UPLOAD_DIR)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload_file: UploadFile) -> tuple[str, str, int]:
        """Save uploaded file securely with UUID prefix and return (filename, local_path, size)."""
        safe_name = sanitize_filename(upload_file.filename)
        unique_name = f"{uuid.uuid4().hex[:8]}_{safe_name}"
        dest_path = self.base_dir / unique_name

        size = 0
        with open(dest_path, "wb") as buffer:
            while content := await upload_file.read(1024 * 1024):
                size += len(content)
                buffer.write(content)

        # Validate security constraints
        validate_file_upload(safe_name, size)
        logger.info(f"Saved file {safe_name} ({size} bytes) to {dest_path}")
        return safe_name, str(dest_path), size

    def delete_file(self, file_path: str):
        path = Path(file_path)
        if path.exists() and path.is_file():
            try:
                path.unlink()
                logger.info(f"Deleted file at {file_path}")
            except Exception as e:
                logger.error(f"Error deleting file {file_path}: {e}")
