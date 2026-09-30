from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.db.models.user import User
from app.core.security import hash_password, verify_password
from app.core.logging import get_logger

logger = get_logger("repositories.user")

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        stmt = select(User).where(User.username == username.strip().lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        if not email:
            return None
        stmt = select(User).where(User.email == email.strip().lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(
        self,
        username: str,
        password: str,
        email: Optional[str] = None,
        display_name: Optional[str] = None,
        avatar_color: str = "#0d99ff"
    ) -> User:
        clean_username = username.strip().lower()
        clean_email = email.strip().lower() if email else None
        
        user = User(
            username=clean_username,
            email=clean_email,
            hashed_password=hash_password(password),
            display_name=display_name.strip() if display_name else clean_username.capitalize(),
            avatar_color=avatar_color or "#0d99ff"
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        logger.info(f"User created successfully: {user.username} (id: {user.id})")
        return user

    async def authenticate(self, username_or_email: str, plain_password: str) -> Optional[User]:
        clean_id = username_or_email.strip().lower()
        
        # 1. Lookup by username first
        stmt = select(User).where(User.username == clean_id)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()

        # 2. If not found by username, try looking up by email
        if not user:
            stmt = select(User).where(User.email == clean_id)
            result = await self.session.execute(stmt)
            user = result.scalars().first()

        if not user:
            return None

        # If user has no password set (e.g. legacy default user), let them log in and set one
        if not user.hashed_password:
            user.hashed_password = hash_password(plain_password)
            await self.session.commit()
            return user

        if verify_password(plain_password, user.hashed_password):
            return user

        return None

    async def get_or_create_default_user(self) -> User:
        """Ensure at least one owner/designer account exists for immediate local use."""
        stmt = select(User).limit(1)
        result = await self.session.execute(stmt)
        user = result.scalar_one_or_none()
        if user:
            return user

        default_user = User(
            username="owner",
            display_name="Designer Admin",
            email="admin@personalgpt.local",
            hashed_password=hash_password("admin123"),
            avatar_color="#0d99ff"
        )
        self.session.add(default_user)
        await self.session.commit()
        await self.session.refresh(default_user)
        return default_user
