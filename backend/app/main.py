import time
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.logging import setup_logging, get_logger
from app.core.exceptions import PersonalGPTException
from app.db.database import init_db
from app.api.router import api_router

setup_logging()
logger = get_logger("main")
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info(f"Initializing {settings.APP_NAME} in [{settings.APP_ENV}] mode...")
    
    # Ensure required directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
    os.makedirs("./data/backups", exist_ok=True)
    
    # Initialize database tables
    await init_db()
    
    logger.info(f"{settings.APP_NAME} backend is ready on {settings.BACKEND_HOST}:{settings.BACKEND_PORT}")
    yield
    # Shutdown actions
    logger.info(f"Shutting down {settings.APP_NAME}...")

app = FastAPI(
    title="PersonalGPT API",
    description="Private, Modular, Extensible Personal AI Platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Observability Middleware: Request timing
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = (time.perf_counter() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    return response

# Custom Domain Exception Handler
@app.exception_handler(PersonalGPTException)
async def personalgpt_exception_handler(request: Request, exc: PersonalGPTException):
    logger.warning(f"Domain exception on {request.url.path}: {exc.message} (status: {exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "details": exc.details,
        }
    )

# Generic Uncaught Exception Handler
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected internal server error occurred.",
        }
    )

# Include API Router
app.include_router(api_router)

# Mount Frontend Production Build (Unifying Frontend and Backend)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

# Locate frontend dist directory (works from repo root or backend dir)
possible_dist_dirs = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("./frontend/dist").resolve(),
    Path("../frontend/dist").resolve(),
]
frontend_dist = next((p for p in possible_dist_dirs if p.exists() and (p / "index.html").exists()), None)

if frontend_dist:
    logger.info(f"Serving unified frontend from {frontend_dist}")
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="static_assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
            return JSONResponse(status_code=404, content={"message": "Not Found"})
        target_file = frontend_dist / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(
            frontend_dist / "index.html",
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )
else:
    logger.warning("Frontend dist directory not found. Access API documentation at /docs.")
    @app.get("/", include_in_schema=False)
    async def root():
        return RedirectResponse(url="/docs")
