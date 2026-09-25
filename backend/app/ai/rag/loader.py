import os
from pathlib import Path
from typing import Dict, Any, List
from app.core.exceptions import DocumentProcessingException
from app.core.logging import get_logger

logger = get_logger("rag.loader")

class DocumentLoader:
    """Extracts raw text and metadata from various file formats."""

    @staticmethod
    def load(file_path: str) -> List[Dict[str, Any]]:
        path = Path(file_path)
        if not path.exists():
            raise DocumentProcessingException(path.name, "File does not exist")

        ext = path.suffix.lower().lstrip('.')
        try:
            if ext == "txt" or ext == "md":
                return DocumentLoader._load_text(path)
            elif ext == "pdf":
                return DocumentLoader._load_pdf(path)
            elif ext == "docx":
                return DocumentLoader._load_docx(path)
            elif ext == "csv":
                return DocumentLoader._load_csv(path)
            else:
                raise DocumentProcessingException(path.name, f"Unsupported file extension: {ext}")
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            raise DocumentProcessingException(path.name, str(e))

    @staticmethod
    def _load_text(path: Path) -> List[Dict[str, Any]]:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return [{"content": content, "metadata": {"page": 1, "filename": path.name}}]

    @staticmethod
    def _load_pdf(path: Path) -> List[Dict[str, Any]]:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                pages.append({"content": text, "metadata": {"page": i + 1, "filename": path.name}})
        if not pages:
            pages = [{"content": "", "metadata": {"page": 1, "filename": path.name}}]
        return pages

    @staticmethod
    def _load_docx(path: Path) -> List[Dict[str, Any]]:
        import docx
        doc = docx.Document(str(path))
        text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        return [{"content": text, "metadata": {"page": 1, "filename": path.name}}]

    @staticmethod
    def _load_csv(path: Path) -> List[Dict[str, Any]]:
        import csv
        rows = []
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.reader(f)
            for r in reader:
                rows.append(", ".join(r))
        return [{"content": "\n".join(rows), "metadata": {"page": 1, "filename": path.name}}]
