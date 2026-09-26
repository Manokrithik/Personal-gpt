import json
import asyncio
from typing import AsyncIterator, Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.repositories.conversation_repository import ConversationRepository
from app.db.repositories.message_repository import MessageRepository
from app.db.repositories.memory_repository import MemoryRepository
from app.db.repositories.settings_repository import SettingsRepository
from app.schemas.chat import ChatRequest, ChatResponse, ChatCitation, StreamChunk
from app.ai.providers.registry import get_provider_registry
from app.ai.prompts.prompt_manager import PromptManager
from app.ai.memory.memory_manager import MemoryManager
from app.ai.rag.retriever import KnowledgeRetriever
from app.ai.agents.agent_manager import AgentManager
from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger("service.chat")

class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.conv_repo = ConversationRepository(session)
        self.msg_repo = MessageRepository(session)
        self.memory_repo = MemoryRepository(session)
        self.settings_repo = SettingsRepository(session)
        self.config = get_settings()
        
        self.registry = get_provider_registry()
        self.prompt_manager = PromptManager()
        self.memory_manager = MemoryManager(self.memory_repo)
        self.retriever = KnowledgeRetriever()
        self.agent_manager = AgentManager()

    async def _resolve_conversation(self, req: ChatRequest) -> tuple[str, str]:
        if req.conversation_id:
            conv = await self.conv_repo.get_by_id(req.conversation_id, load_messages=False)
            if conv:
                conv_model = req.model or conv.model
                if self.config.LLM_PROVIDER == "gemini" and not conv_model.lower().startswith("gemini"):
                    conv_model = "gemini-1.5-flash"
                return conv.id, conv_model
        
        # Create new conversation with title derived from user message
        title = req.message[:30] + ("..." if len(req.message) > 30 else "")
        model = req.model or await self.settings_repo.get("selected_model", self.config.effective_default_model)
        if self.config.LLM_PROVIDER == "gemini" and not model.lower().startswith("gemini"):
            model = "gemini-1.5-flash"
        conv = await self.conv_repo.create(title=title, model=model)
        return conv.id, model

    async def _ensure_provider_keys(self, provider_name: str):
        if provider_name.lower() == "gemini":
            gemini_key = await self.settings_repo.get("gemini_api_key") or self.config.GEMINI_API_KEY
            if gemini_key:
                prov = self.registry.get_provider("gemini")
                if hasattr(prov, "api_key"):
                    prov.api_key = gemini_key
        elif provider_name.lower() == "openai":
            openai_key = await self.settings_repo.get("openai_api_key") or self.config.OPENAI_API_KEY
            if openai_key:
                prov = self.registry.get_provider("openai")
                if hasattr(prov, "api_key"):
                    prov.api_key = openai_key

    async def process_chat(self, req: ChatRequest) -> ChatResponse:
        conv_id, model = await self._resolve_conversation(req)
        
        # 1. Save user turn
        await self.msg_repo.create(
            conversation_id=conv_id,
            role="user",
            content=req.message,
            model=model,
        )
        await self.conv_repo.touch(conv_id)

        # 2. Context History
        recent_msgs = await self.msg_repo.get_recent_messages(conv_id, limit=self.config.SHORT_TERM_MESSAGE_LIMIT)
        history = self.memory_manager.short_term.select_context_messages(recent_msgs[:-1])

        # 3. Memories
        memories = []
        if req.use_memory and self.config.ENABLE_MEMORY:
            memories = await self.memory_manager.get_relevant_memories(req.message)

        # 4. RAG
        citations = []
        rag_context = ""
        if req.use_rag and self.config.ENABLE_RAG:
            search_results = await self.retriever.retrieve(req.message, top_k=4)
            if search_results:
                citations = self.retriever.format_citations(search_results)
                rag_context = self.retriever.format_context_string(search_results)

        # 5. Tools & Agents
        tool_results = []
        if req.use_tools and self.config.ENABLE_TOOLS:
            agent_eval = await self.agent_manager.evaluate_and_execute(req.message)
            if agent_eval:
                tool_results.append(agent_eval)

        # 6. Assemble Prompts
        system_msg = self.prompt_manager.build_system_message(
            memories=memories,
            rag_context=rag_context,
            tool_results=tool_results,
        )
        assembled_messages = self.prompt_manager.assemble_messages(
            system_message=system_msg,
            history=history,
            current_user_message=req.message,
        )

        # 7. Select Provider & Generate
        provider_name = req.provider or await self.settings_repo.get("selected_provider", self.config.LLM_PROVIDER)
        await self._ensure_provider_keys(provider_name)
        provider = self.registry.get_provider(provider_name)

        
        assistant_content = await provider.generate(
            assembled_messages,
            model=model,
            temperature=req.temperature or 0.7,
        )

        # 8. Save assistant message
        citation_dicts = [c.model_dump() for c in citations] if citations else None
        saved_msg = await self.msg_repo.create(
            conversation_id=conv_id,
            role="assistant",
            content=assistant_content,
            model=model,
            citations=citation_dicts,
            extra_metadata={"tool_results": tool_results} if tool_results else None,
        )
        await self.conv_repo.touch(conv_id)

        # 9. Trigger memory extraction in background
        if req.use_memory and self.config.ENABLE_MEMORY:
            asyncio.create_task(self.memory_manager.maybe_extract_and_save(req.message))

        return ChatResponse(
            conversation_id=conv_id,
            message_id=saved_msg.id,
            role="assistant",
            content=assistant_content,
            model=model,
            citations=citations,
            tool_calls=tool_results,
        )

    async def stream_chat(self, req: ChatRequest) -> AsyncIterator[str]:
        conv_id, model = await self._resolve_conversation(req)

        # Save user turn
        await self.msg_repo.create(
            conversation_id=conv_id,
            role="user",
            content=req.message,
            model=model,
        )
        await self.conv_repo.touch(conv_id)

        # Context History
        recent_msgs = await self.msg_repo.get_recent_messages(conv_id, limit=self.config.SHORT_TERM_MESSAGE_LIMIT)
        history = self.memory_manager.short_term.select_context_messages(recent_msgs[:-1])

        # Memories
        memories = []
        if req.use_memory and self.config.ENABLE_MEMORY:
            memories = await self.memory_manager.get_relevant_memories(req.message)

        # RAG
        citations = []
        rag_context = ""
        if req.use_rag and self.config.ENABLE_RAG:
            search_results = await self.retriever.retrieve(req.message, top_k=4)
            if search_results:
                citations = self.retriever.format_citations(search_results)
                rag_context = self.retriever.format_context_string(search_results)

        # Tools & Agents
        tool_results = []
        if req.use_tools and self.config.ENABLE_TOOLS:
            agent_eval = await self.agent_manager.evaluate_and_execute(req.message)
            if agent_eval:
                tool_results.append(agent_eval)
                # Yield immediate tool notification chunk
                tool_name = agent_eval["tool"]
                notification = f"⚙️ *Executed tool `{tool_name}`...*\n\n"
                payload = json.dumps({"delta": notification, "done": False})
                yield f"data: {payload}\n\n"

        # Assemble Prompts
        system_msg = self.prompt_manager.build_system_message(
            memories=memories,
            rag_context=rag_context,
            tool_results=tool_results,
        )
        assembled_messages = self.prompt_manager.assemble_messages(
            system_message=system_msg,
            history=history,
            current_user_message=req.message,
        )

        provider_name = req.provider or await self.settings_repo.get("selected_provider", self.config.LLM_PROVIDER)
        await self._ensure_provider_keys(provider_name)
        provider = self.registry.get_provider(provider_name)

        collected_content = []
        try:
            async for token in provider.stream(
                assembled_messages,
                model=model,
                temperature=req.temperature or 0.7
            ):
                collected_content.append(token)
                chunk_data = json.dumps({"delta": token, "done": False})
                yield f"data: {chunk_data}\n\n"

        except Exception as e:
            logger.error(f"Error in LLM stream: {e}", exc_info=True)
            err_msg = f"\n\n*[Error: {str(e)}]*"
            collected_content.append(err_msg)
            yield f"data: {json.dumps({'delta': err_msg, 'done': False})}\n\n"

        full_content = "".join(collected_content)

        # Save assistant message
        citation_dicts = [c.model_dump() for c in citations] if citations else None
        saved_msg = await self.msg_repo.create(
            conversation_id=conv_id,
            role="assistant",
            content=full_content,
            model=model,
            citations=citation_dicts,
            extra_metadata={"tool_results": tool_results} if tool_results else None,
        )
        await self.conv_repo.touch(conv_id)

        # Trigger memory extraction in background
        if req.use_memory and self.config.ENABLE_MEMORY:
            asyncio.create_task(self.memory_manager.maybe_extract_and_save(req.message))

        # Send final SSE message with metadata
        final_payload = {
            "done": True,
            "conversation_id": conv_id,
            "message_id": saved_msg.id,
            "citations": citation_dicts,
            "tool_calls": tool_results,
        }
        yield f"data: {json.dumps(final_payload)}\n\n"
