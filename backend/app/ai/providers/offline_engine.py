import asyncio
import random
import re
from typing import List, Dict, Any, AsyncIterator

JOKES = [
    (
        "Why do programmers prefer dark mode?\n\n"
        "👉 **Because light attracts bugs!** 🐛"
    ),
    (
        "There are only 10 types of people in the world:\n\n"
        "👉 **Those who understand binary, and those who don't.** 😄"
    ),
    (
        "Why did the database administrator leave his spouse?\n\n"
        "👉 **Because they had too many one-to-many relationships!** 📊"
    ),
    (
        "A SQL query walks into a bar, strolls up to two tables and asks:\n\n"
        "👉 *'Can I join you?'* 🍻"
    ),
    (
        "How do you comfort a JavaScript bug?\n\n"
        "👉 **You console it!** `console.log('there, there')` 🫂"
    ),
    (
        "Why was the computer cold?\n\n"
        "👉 **It left its Windows open!** 🪟❄️"
    ),
    (
        "An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, wine, liquor..."
    ),
    (
        "Why do Java programmers wear glasses?\n\n"
        "👉 **Because they don't C#!** 👓"
    )
]

TOPICS = {
    "quantum": (
        "### ⚛️ Quantum Computing in Simple Terms\n\n"
        "Traditional computers use **bits** (0 or 1)—like a light switch that is either OFF or ON.\n\n"
        "Quantum computers use **qubits** (quantum bits), which utilize two strange laws of quantum physics:\n\n"
        "1. **Superposition**: A qubit can be in a state of 0, 1, or *both simultaneously* until measured. Imagine a spinning coin—while in motion, it is both heads and tails.\n"
        "2. **Entanglement**: Qubits can become fundamentally linked across distance. The state of one instantly dictates the state of another.\n"
        "3. **Quantum Interference**: Quantum algorithms cancel out incorrect paths and amplify the correct solution.\n\n"
        "#### Why does it matter?\n"
        "While a classical computer must check every combination one by one, a quantum computer can evaluate an exponential number of possibilities simultaneously. "
        "This unlocks breakthroughs in molecular simulation for medicine, logistics optimization, and advanced cryptography."
    ),
    "rag": (
        "### 📚 Retrieval-Augmented Generation (RAG)\n\n"
        "**RAG** connects large language models to your private documents without retraining the model.\n\n"
        "Here is the 3-step pipeline used inside MUmu AI:\n"
        "1. **Ingest & Chunk**: Documents (PDF, Word, Text, Markdown) are split into semantically coherent text chunks.\n"
        "2. **Vector Index**: Each chunk is converted into high-dimensional numerical vectors (embeddings) stored in our local vector database.\n"
        "3. **Search & Ground**: When you ask a question, MUmu AI retrieves the top matching passages and feeds them into the prompt with source citations."
    ),
    "mumu_ai": (
        "### 🛡️ About MUmu AI\n\n"
        "**MUmu AI** is an advanced, multimodal, and private AI platform designed for high performance.\n\n"
        "- **Multimodal Vision & Camera**: Live camera scanning and visual problem solving in neat, step-by-step clarity.\n"
        "- **AI Image Generation**: Direct on-demand image creation from text descriptions based on your needs.\n"
        "- **Dual-Tier Memory**: Tracks your immediate conversation window while extracting persistent long-term preferences.\n"
        "- **Local Vector Store**: Built-in RAG engine for document search without external cloud dependencies.\n"
        "- **Safe Agent Tools**: Accurate arithmetic evaluator, live date/time, and intelligent planning.\n"
        "- **Provider Agnostic**: Seamlessly switches between Google Gemini, local Ollama models, and cloud APIs."
    )
}

class OfflineEngine:
    """Intelligent fallback and offline conversational reasoning engine."""

    @classmethod
    def _extract_user_query(cls, messages: List[Dict[str, str]]) -> str:
        for m in reversed(messages):
            if m.get("role") == "user":
                return m.get("content", "").strip()
        return ""

    @classmethod
    def _extract_rag_context(cls, messages: List[Dict[str, str]]) -> str:
        for m in messages:
            if m.get("role") == "system":
                content = m.get("content", "")
                if "RETRIEVED KNOWLEDGE CONTEXT" in content:
                    return content
        return ""

    @classmethod
    def _extract_tool_results(cls, messages: List[Dict[str, str]]) -> str:
        for m in messages:
            if m.get("role") == "system":
                content = m.get("content", "")
                if "[Recent Tool Execution Results]:" in content:
                    return content.split("[Recent Tool Execution Results]:")[-1].strip()
        return ""

    @classmethod
    def generate_response(cls, messages: List[Dict[str, str]]) -> str:
        query = cls._extract_user_query(messages)
        query_lower = query.lower()
        rag_context = cls._extract_rag_context(messages)
        tool_results_text = cls._extract_tool_results(messages)

        # 0. Tool results if agent tool was executed
        if tool_results_text:
            if "image_generation" in tool_results_text:
                url_match = re.search(r"'(?:image_url|url)':\s*'([^']+)'", tool_results_text)
                prompt_match = re.search(r"'prompt':\s*'([^']+)'", tool_results_text)
                prompt_desc = prompt_match.group(1) if prompt_match else "your requested artwork"
                if url_match:
                    image_url = url_match.group(1)
                    return (
                        f"### 🎨 MUmu AI Image Studio\n\n"
                        f"Here is your generated image based on your needs:\n\n"
                        f"![{prompt_desc}]({image_url})\n\n"
                        f"#### 📋 Step-by-Step Overview:\n"
                        f"1. **Concept**: Rendered artwork focusing on *\"{prompt_desc}\"*.\n"
                        f"2. **Aesthetics**: High-resolution generation with rich color harmonies and detailed composition.\n"
                        f"3. **Actions**: Click the image to view in full resolution or use the download button to save it locally."
                    )
            elif "calculator" in tool_results_text and "'result':" in tool_results_text:
                res_match = re.search(r"'result':\s*([0-9\.\-]+)", tool_results_text)
                exp_match = re.search(r"'expression':\s*'([^']+)'", tool_results_text)
                if res_match and exp_match:
                    return f"### 🧮 Calculation Result\n\n**{exp_match.group(1)} = {res_match.group(1)}**\n\nThe calculation was completed step-by-step using the built-in mathematical engine."
                elif res_match:
                    return f"### 🧮 Calculation Result\n\n**Result: {res_match.group(1)}**"
            elif "clock" in tool_results_text or "time" in tool_results_text.lower():
                time_match = re.search(r"'(?:current_time|time)':\s*'([^']+)'", tool_results_text)
                if time_match:
                    return f"### 🕒 Live Clock\n\n**Current Date & Time:** `{time_match.group(1)}`"
            return f"### ⚙️ Tool Execution Output\n\n{tool_results_text}\n\nOperation completed successfully."

        # 1. Direct Image Generation query fallback
        img_match = re.search(r'(?:generate|create|draw|paint|render)\s+(?:an?\s+)?(?:image|picture|photo|artwork)?(?:\s+of)?\s+(.+)', query, re.IGNORECASE)
        if img_match and not any(k in query_lower for k in ["code", "function", "table", "diagram", "chart"]):
            raw_prompt = img_match.group(1).strip()
            import urllib.parse
            encoded = urllib.parse.quote(raw_prompt)
            seed = random.randint(100000, 999999)
            fallback_img_url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&nologo=true&seed={seed}"
            return (
                f"### 🎨 MUmu AI Image Studio\n\n"
                f"Here is your generated image based on your needs:\n\n"
                f"![{raw_prompt}]({fallback_img_url})\n\n"
                f"#### 📋 Step-by-Step Overview:\n"
                f"1. **Concept**: Visualized the scene: *\"{raw_prompt}\"*.\n"
                f"2. **Styling**: Rendered at 1024×1024 resolution with vibrant contrast and lighting.\n"
                f"3. **Actions**: You can expand, download, or ask me for creative style variations."
            )

        # 2. RAG query response if context was retrieved
        if rag_context and any(kw in query_lower for kw in ["document", "file", "uploaded", "summary", "read", "according"]):
            return (
                f"### 📄 Based on Your Ingested Documents\n\n"
                f"I reviewed the matching passages from your personal knowledge base regarding **\"{query}\"**:\n\n"
                f"{rag_context[:800]}...\n\n"
                f"*(Source citations are attached above)*"
            )

        # 3. Jokes and humor
        if any(w in query_lower for w in ["joke", "funny", "humor", "make me laugh", "pun"]):
            joke = random.choice(JOKES)
            return (
                f"Here is a joke for you! 😄\n\n"
                f"{joke}\n\n"
                f"Hope that brightened your day! Want to hear another one?"
            )

        # 4. Quantum computing
        if "quantum" in query_lower:
            return TOPICS["quantum"]

        # 5. RAG / Vector search explanation
        if "rag" in query_lower or "retrieval augmented" in query_lower:
            return TOPICS["rag"]

        # 6. MUmu AI / Who are you
        if any(w in query_lower for w in ["who are you", "what are you", "what can you do", "features", "mumu", "personalgpt"]):
            return TOPICS["mumu_ai"]

        # 7. Python / Programming
        if "python" in query_lower and any(w in query_lower for w in ["what is", "why", "code", "learn", "how"]):
            return (
                "### 🐍 Python Programming\n\n"
                "**Python** is a high-level, interpreted, general-purpose programming language renowned for its clean readability and versatility.\n\n"
                "Key strengths:\n"
                "- **Readable Syntax**: Uses clean indentation instead of braces.\n"
                "- **Dominant in AI & Data**: Standard platform for PyTorch, TensorFlow, Pandas, and FastAPI.\n"
                "- **Batteries Included**: Comprehensive standard library for networking, math, file I/O, and concurrency.\n\n"
                "```python\n"
                "# Example: A clean generator function in Python\n"
                "def stream_numbers(n: int):\n"
                "    for i in range(n):\n"
                "        yield i ** 2\n"
                "\n"
                "print(list(stream_numbers(5)))  # [0, 1, 4, 9, 16]\n"
                "```\n\n"
                "Would you like an example or code snippet for a specific task?"
            )

        # 8. Greetings
        if re.match(r"^(hi|hello|hey|greetings|good morning|good evening|good afternoon)\b", query_lower):
            return (
                f"👋 **Hello!** I'm **MUmu AI**, your intelligent multimodal personal AI assistant.\n\n"
                f"I am ready to help you with:\n"
                f"- **Camera Scan & Search** (instant visual search and neat step-by-step explanations)\n"
                f"- **AI Image Generation** (tell me what image to generate based on your needs)\n"
                f"- **Questions & Explanations** (math, science, coding, analysis)\n"
                f"- **Agent Tools** (live clock, accurate calculations, knowledge search)\n"
                f"- **Long-term Memory** (I remember your preferences and key details)\n\n"
                f"What would you like to explore today?"
            )

        # 9. General conversational answer
        return (
            f"I processed your query: **\"{query}\"**.\n\n"
            f"Here is a thoughtful, step-by-step overview:\n\n"
            f"- **1. Core Concept**: In evaluating \"{query}\", the priority is identifying the exact requirements and desired outcomes.\n"
            f"- **2. Recommendations**: You can ask me to dive deeper into any specific aspect, generate artwork, scan an image with your camera, write code, or analyze documents.\n\n"
            f"Feel free to ask a follow-up or specify your exact goal!"
        )

    @classmethod
    async def stream_response(cls, messages: List[Dict[str, str]]) -> AsyncIterator[str]:
        text = cls.generate_response(messages)
        # Add subtle footer note about local engine
        footer = (
            "\n\n---\n"
            "> 💡 *Operating on MUmu AI Built-in Engine. "
            "To connect neural models like Llama 3.2, launch Ollama (`ollama serve`) or add an API key in Settings.*"
        )
        full_text = text + footer
        words = full_text.split(" ")
        for i, word in enumerate(words):
            await asyncio.sleep(0.015)
            yield word + (" " if i < len(words) - 1 else "")

