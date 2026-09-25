import os
import sys
import uvicorn
from pathlib import Path

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"
sys.path.insert(0, str(backend_dir))

def main():
    print("=" * 60)
    print("  PersonalGPT — Unified Private AI Workstation (Full-Stack)")
    print("=" * 60)
    print("  Web Application UI : http://localhost:8000")
    print("  API Documentation  : http://localhost:8000/docs")
    print("  Health Endpoint    : http://localhost:8000/api/v1/health")
    print("=" * 60)
    print("Starting server... Press CTRL+C to quit.\n")

    os.chdir(str(backend_dir))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
    main()
