from datetime import datetime
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

        # Inject Real-Time Temporal Anchor
        now = datetime.now()
        temporal_context = (
            f"[Current Real-Time Temporal Context]:\n"
            f"- Today's Date: {now.strftime('%A, %B %d, %Y')}\n"
            f"- Day of the Week: {now.strftime('%A')}\n"
            f"- Current Local Time: {now.strftime('%I:%M %p')}\n"
            f"- Current Year: {now.year}\n"
            f"CRITICAL TEMPORAL RULE: You must always ground questions about today, the current date, the day of the week, year, and current time in this exact real-time context. Never state past pretraining dates."
        )
        system_parts.append(temporal_context)

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
            tool_lines = [
                "\n[Live Real-Time Tool Execution Results]:",
                "CRITICAL INSTRUCTION: You MUST strictly prioritize and base your response on the live tool results below whenever answering about current events, leaders, office holders, sports fixtures, dates, or factual data. Do not contradict these verified live results."
            ]
            for tr in tool_results:
                tool_name = tr.get("tool", "")
                output = tr.get("output", {})
                if tool_name == "web_search" and isinstance(output, dict):
                    summary = output.get("summary", "")
                    md_sources = output.get("markdown_sources", "")
                    sources_template = md_sources if md_sources else "### 🌐 Sources & Verified Links\n- [Source Title](URL)"
                    tool_lines.append(
                        f"Web Search Results for '{output.get('query', '')}':\n{summary}\n\n"
                        f"MANDATORY CITATION INSTRUCTION:\n"
                        f"1. You MUST incorporate the verified latest updates above into your response.\n"
                        f"2. You MUST provide clickable markdown URL links for your sources at the end of your response, formatted exactly like:\n"
                        f"{sources_template}"
                    )
                elif tool_name == "date_time" and isinstance(output, dict):
                    tool_lines.append(f"Date & Time: {output.get('summary', str(output))}")
                else:
                    tool_lines.append(f"Tool `{tool_name}` output: {output}")
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
