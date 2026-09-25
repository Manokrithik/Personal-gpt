import os
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

def run_backup():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path("./data/backups") / f"backup_{timestamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)

    # 1. Backup SQLite Database
    db_file = Path("./data/personalgpt.db")
    if db_file.exists():
        dest_db = backup_dir / "personalgpt.db"
        shutil.copy2(db_file, dest_db)
        print(f"Backed up database to {dest_db}")

    # 2. Backup Vector Store Index
    vector_file = Path("./data/chroma/vector_index.json")
    if vector_file.exists():
        dest_vector = backup_dir / "vector_index.json"
        shutil.copy2(vector_file, dest_vector)
        print(f"Backed up vector store index to {dest_vector}")

    # 3. Backup Uploaded Documents
    uploads_dir = Path("./data/uploads")
    if uploads_dir.exists():
        dest_uploads = backup_dir / "uploads"
        shutil.copytree(uploads_dir, dest_uploads, dirs_exist_ok=True)
        print(f"Backed up uploads to {dest_uploads}")

    print(f"\nPersonalGPT Backup successfully completed: {backup_dir.resolve()}")

if __name__ == "__main__":
    run_backup()
