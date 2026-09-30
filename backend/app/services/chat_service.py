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

    async def _resolve_conversation(self, req: ChatRequest, user_id: Optional[str] = None) -> tuple[str, str]:
        if req.conversation_id:
            conv = await self.conv_repo.get_by_id(req.conversation_id, load_messages=False)
            if conv:
                if user_id and conv.user_id and conv.user_id != user_id:
                    conv = None
                elif not user_id and conv.user_id is not None:
                    conv = None
                elif user_id and conv.user_id is None:
                    conv.user_id = user_id
                    await self.session.commit()

            if conv:
                conv_model = req.model or conv.model or "personalgpt-pro"
                return conv.id, conv_model
        
        # Create new conversation with title derived from user message
        title = req.message[:30] + ("..." if len(req.message) > 30 else "")
        model = req.model or await self.settings_repo.get("selected_model", "personalgpt-pro")
        conv = await self.conv_repo.create(title=title, model=model, user_id=user_id)
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

    async def process_chat(self, req: ChatRequest, user_id: Optional[str] = None) -> ChatResponse:
        conv_id, model = await self._resolve_conversation(req, user_id=user_id)
        
        # 1. Save user turn with image if provided
        user_msg = req.message or ("Scan and analyze this image." if req.image_data else "")
        user_meta = {"image_data": req.image_data, "image_mime_type": req.image_mime_type} if req.image_data else None

        await self.msg_repo.create(
            conversation_id=conv_id,
            role="user",
            content=user_msg,
            model=model,
            extra_metadata=user_meta,
        )
        await self.conv_repo.touch(conv_id)

        # 2. Context History
        recent_msgs = await self.msg_repo.get_recent_messages(conv_id, limit=self.config.SHORT_TERM_MESSAGE_LIMIT)
        history = self.memory_manager.short_term.select_context_messages(recent_msgs[:-1])

        # 3. Memories
        memories = []
        if req.use_memory and self.config.ENABLE_MEMORY:
            memories = await self.memory_manager.get_relevant_memories(user_msg)

        # 4. RAG
        citations = []
        rag_context = ""
        if req.use_rag and self.config.ENABLE_RAG:
            search_results = await self.retriever.retrieve(user_msg, top_k=4)
            if search_results:
                citations = self.retriever.format_citations(search_results)
                rag_context = self.retriever.format_context_string(search_results)

        # 5. Tools & Agents
        tool_results = []
        if req.use_tools and self.config.ENABLE_TOOLS and not req.image_data:
            agent_eval = await self.agent_manager.evaluate_and_execute(user_msg)
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
            current_user_message=user_msg,
        )

        provider_name = req.provider or await self.settings_repo.get("selected_provider", self.config.LLM_PROVIDER)
        if req.image_data and provider_name != "gemini":
            provider_name = "gemini"
            model = "gemini-3.8-flash"

        # Seamless fallback if OpenAI is requested but no key is configured
        if provider_name == "openai":
            openai_key = await self.settings_repo.get("openai_api_key") or self.config.OPENAI_API_KEY
            if not openai_key:
                logger.info("OpenAI requested but no API key configured. Seamlessly routing to Gemini.")
                provider_name = "gemini"
                model = "gemini-3.8-flash"

        await self._ensure_provider_keys(provider_name)
        provider = self.registry.get_provider(provider_name)

        assistant_content = await provider.generate(
            assembled_messages,
            model=model,
            temperature=req.temperature or 0.7,
            image_data=req.image_data,
            image_mime_type=req.image_mime_type,
        )

        # If web_search was executed, ensure sources & URL links are included in both response and citations
        web_search_res = next((tr for tr in tool_results if tr.get("tool") == "web_search"), None)
        if web_search_res:
            out = web_search_res.get("output", {})
            md_sources = out.get("markdown_sources", "")
            links = out.get("links", [])
            for idx, l in enumerate(links[:6]):
                citations.append(ChatCitation(
                    document_id=f"web_{idx}",
                    filename=l.get("source", "Web"),
                    chunk_index=idx,
                    content=l.get("title", ""),
                    similarity_score=1.0,
                    url=l.get("url", "")
                ))
            if md_sources and "Sources &" not in assistant_content and "http" not in assistant_content:
                assistant_content = f"{assistant_content.rstrip()}\n\n{md_sources}"
            elif md_sources and md_sources.strip() not in assistant_content and "Sources & Verified Links" not in assistant_content:
                assistant_content = f"{assistant_content.rstrip()}\n\n{md_sources}"

        # If image_generation tool was called, guarantee the image is at the very beginning of the response
        if tool_results and any(tr.get("tool") == "image_generation" for tr in tool_results):
            img_res = next((tr for tr in tool_results if tr.get("tool") == "image_generation"), None)
            if img_res:
                img_md = img_res.get("output", {}).get("markdown", "")
                if img_md and img_md not in assistant_content:
                    assistant_content = f"{img_md}\n\n---\n\n{assistant_content}"


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

    async def stream_chat(self, req: ChatRequest, user_id: Optional[str] = None) -> AsyncIterator[str]:
        conv_id, model = await self._resolve_conversation(req, user_id=user_id)

        # Save user turn with image if provided
        user_msg = req.message or ("Scan and analyze this image." if req.image_data else "")
        user_meta = {"image_data": req.image_data, "image_mime_type": req.image_mime_type} if req.image_data else None

        await self.msg_repo.create(
            conversation_id=conv_id,
            role="user",
            content=user_msg,
            model=model,
            extra_metadata=user_meta,
        )
        await self.conv_repo.touch(conv_id)

        # Context History
        recent_msgs = await self.msg_repo.get_recent_messages(conv_id, limit=self.config.SHORT_TERM_MESSAGE_LIMIT)
        history = self.memory_manager.short_term.select_context_messages(recent_msgs[:-1])

        # Memories
        memories = []
        if req.use_memory and self.config.ENABLE_MEMORY:
            memories = await self.memory_manager.get_relevant_memories(user_msg)

        # RAG
        citations = []
        rag_context = ""
        if req.use_rag and self.config.ENABLE_RAG:
            search_results = await self.retriever.retrieve(user_msg, top_k=4)
            if search_results:
                citations = self.retriever.format_citations(search_results)
                rag_context = self.retriever.format_context_string(search_results)

        # Tools & Agents
        tool_results = []
        collected_content = []
        if req.use_tools and self.config.ENABLE_TOOLS and not req.image_data:
            agent_eval = await self.agent_manager.evaluate_and_execute(user_msg)
            if agent_eval:
                tool_results.append(agent_eval)
                tool_name = agent_eval["tool"]
                # For image generation, stream the image markdown immediately at the very beginning!
                if tool_name == "image_generation":
                    out = agent_eval.get("output", {})
                    img_md = out.get("markdown", "")
                    if img_md:
                        notification = f"{img_md}\n\n---\n\n"
                        collected_content.append(notification)
                        yield f"data: {json.dumps({'delta': notification, 'done': False})}\n\n"

        # Assemble Prompts
        system_msg = self.prompt_manager.build_system_message(
            memories=memories,
            rag_context=rag_context,
            tool_results=tool_results,
        )
        assembled_messages = self.prompt_manager.assemble_messages(
            system_message=system_msg,
            history=history,
            current_user_message=user_msg,
        )

        provider_name = req.provider or await self.settings_repo.get("selected_provider", self.config.LLM_PROVIDER)
        if req.image_data and provider_name != "gemini":
            provider_name = "gemini"
            model = "gemini-3.8-flash"

        # Seamless fallback if OpenAI is requested but no key is configured
        if provider_name == "openai":
            openai_key = await self.settings_repo.get("openai_api_key") or self.config.OPENAI_API_KEY
            if not openai_key:
                logger.info("OpenAI requested in stream but no API key configured. Seamlessly routing to Gemini.")
                provider_name = "gemini"
                model = "gemini-3.8-flash"

        await self._ensure_provider_keys(provider_name)
        provider = self.registry.get_provider(provider_name)

        # Web search citation collection
        web_search_res = next((tr for tr in tool_results if tr.get("tool") == "web_search"), None)
        md_sources = ""
        if web_search_res:
            out = web_search_res.get("output", {})
            md_sources = out.get("markdown_sources", "")
            links = out.get("links", [])
            for idx, l in enumerate(links[:6]):
                citations.append(ChatCitation(
                    document_id=f"web_{idx}",
                    filename=l.get("source", "Web"),
                    chunk_index=idx,
                    content=l.get("title", ""),
                    similarity_score=1.0,
                    url=l.get("url", "")
                ))

        try:
            async for token in provider.stream(
                assembled_messages,
                model=model,
                temperature=req.temperature or 0.7,
                image_data=req.image_data,
                image_mime_type=req.image_mime_type,
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

        # If web search returned sources and they were not included in the response, stream them now
        if md_sources and "Sources &" not in full_content and "http" not in full_content:
            extra_links = f"\n\n{md_sources}"
            collected_content.append(extra_links)
            full_content += extra_links
            yield f"data: {json.dumps({'delta': extra_links, 'done': False})}\n\n"
        elif md_sources and md_sources.strip() not in full_content and "Sources & Verified Links" not in full_content:
            extra_links = f"\n\n{md_sources}"
            collected_content.append(extra_links)
            full_content += extra_links
            yield f"data: {json.dumps({'delta': extra_links, 'done': False})}\n\n"

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
