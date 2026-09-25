from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.dialects.sqlite import insert as sqlite_upsert
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.settings import UserSettings
from datetime import datetime, timezone

class SettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> Dict[str, Any]:
        query = select(UserSettings)
        result = await self.session.execute(query)
        rows = result.scalars().all()
        return {row.key: row.value for row in rows}

    async def get(self, key: str, default: Any = None) -> Any:
        query = select(UserSettings).where(UserSettings.key == key)
        result = await self.session.execute(query)
        setting = result.scalar_one_or_none()
        return setting.value if setting else default

    async def set(self, key: str, value: Any):
        setting = await self.session.get(UserSettings, key)
        if setting:
            setting.value = value
            setting.updated_at = datetime.now(timezone.utc)
        else:
            setting = UserSettings(key=key, value=value)
            self.session.add(setting)
        await self.session.commit()
