from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
import os
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("db")
settings = get_settings()

# Ensure local data directory exists for SQLite
if "sqlite" in settings.DATABASE_URL:
    db_file_path = settings.DATABASE_URL.replace("sqlite+aiosqlite:///", "")
    db_dir = os.path.dirname(db_file_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

engine_kwargs = {
    "echo": False,
    "future": True,
}

if "sqlite" in settings.DATABASE_URL:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing database session to FastAPI endpoints."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """Create tables if they do not exist and ensure schema is up to date."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Safe migration for user auth columns in SQLite
        from sqlalchemy import text
        for col_def in [
            "ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN display_name VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN avatar_color VARCHAR(20)",
        ]:
            try:
                await conn.execute(text(col_def))
            except Exception:
                pass
    logger.info("Database schema verified and initialized.")
