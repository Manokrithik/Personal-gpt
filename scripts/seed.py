import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.db.database import AsyncSessionLocal, init_db
from app.db.repositories.conversation_repository import ConversationRepository
from app.db.repositories.message_repository import MessageRepository
from app.db.repositories.memory_repository import MemoryRepository

async def seed():
    await init_db()
    async with AsyncSessionLocal() as session:
        conv_repo = ConversationRepository(session)
        msg_repo = MessageRepository(session)
        mem_repo = MemoryRepository(session)

        # Seed welcome conversation
        conv = await conv_repo.create(
            title="Getting Started with PersonalGPT",
            model="llama3.2:1b"
        )
        await msg_repo.create(
            conversation_id=conv.id,
            role="assistant",
            content="Welcome to **PersonalGPT**! Your private, modular AI assistant is ready.\n\n- Upload documents in the Knowledge tab to ask questions with RAG citations.\n- Manage local and cloud models in the Models tab.\n- Configure your privacy, temperature, and memory preferences in Settings."
        )

        # Seed initial user preference memory
        await mem_repo.create(
            content="User prefers clear markdown formatting and concise explanations",
            memory_type="preference",
            importance=0.9,
            source="system_seed"
        )

    print("PersonalGPT database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
