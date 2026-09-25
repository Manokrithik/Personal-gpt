import os
from pathlib import Path
from typing import Dict, Any, List
from app.ai.tools.base import BaseTool
from app.core.config import get_settings

class FileSearchTool(BaseTool):
    name = "file_search"
    description = "Search through indexed user documents by keyword or filename."
    parameters = {
        "keyword": {"type": "string", "description": "The search term or filename to find"}
    }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        keyword = kwargs.get("keyword", "").lower().strip()
        settings = get_settings()
        upload_dir = Path(settings.UPLOAD_DIR)
        
        matches = []
        if upload_dir.exists():
            for f in upload_dir.iterdir():
                if f.is_file() and keyword in f.name.lower():
                    matches.append({
                        "filename": f.name,
                        "size_bytes": f.stat().st_size,
                    })
        return {
            "keyword": keyword,
            "match_count": len(matches),
            "files": matches,
            "status": "success",
        }
