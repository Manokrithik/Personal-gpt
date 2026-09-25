from typing import List, Dict, Optional, Any
from app.ai.prompts.system_prompts import DEFAULT_SYSTEM_PROMPT, RAG_SYSTEM_PROMPT

class PromptManager:
    def __init__(self, base_system_prompt: str = DEFAULT_SYSTEM_PROMPT):
        self.base_system_prompt = base_system_prompt

    def build_system_message(
        self,
        memories: Optional[List[Dict[str, Any]]] = None,
        rag_context: Optional[str] = None,
        tool_results: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, str]:
        system_parts = [self.base_system_prompt.strip()]

        # Inject User Long-Term Memories
        if memories and len(memories) > 0:
            memory_lines = ["\n[User Long-Term Memory Profile]:"]
            for m in memories:
                content = m.get("content", "")
                mtype = m.get("memory_type", "fact")
                memory_lines.append(f"- ({mtype.upper()}): {content}")
            system_parts.append("\n".join(memory_lines))

        # Inject RAG Knowledge Documents
        if rag_context and rag_context.strip():
            system_parts.append("\n" + RAG_SYSTEM_PROMPT.format(rag_context=rag_context.strip()))

        # Inject Tool Observations
        if tool_results and len(tool_results) > 0:
            tool_lines = ["\n[Recent Tool Execution Results]:"]
            for tr in tool_results:
                tool_lines.append(f"Tool `{tr['tool']}` output: {tr['output']}")
            system_parts.append("\n".join(tool_lines))

        return {
            "role": "system",
            "content": "\n\n".join(system_parts)
        }

    def assemble_messages(
        self,
        system_message: Dict[str, str],
        history: List[Dict[str, str]],
        current_user_message: str
    ) -> List[Dict[str, str]]:
        messages = [system_message]
        messages.extend(history)
        messages.append({"role": "user", "content": current_user_message})
        return messages
