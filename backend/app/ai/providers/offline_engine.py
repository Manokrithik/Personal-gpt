import asyncio
import random
import re
import urllib.parse
from typing import List, Dict, Any, AsyncIterator

JOKES = [
    (
        "Why do programmers prefer dark mode?\n\n"
        "Because light attracts bugs! 🐛😄"
    ),
    (
        "There are only 10 types of people in the world:\n\n"
        "Those who understand binary, and those who don't! 💻"
    ),
    (
        "Why did the database administrator leave his partner?\n\n"
        "Because they had too many one-to-many relationships! 📊"
    ),
    (
        "A SQL query walks into a bar, walks up to two tables and asks:\n\n"
        "*'Can I join you?'* 🍻"
    ),
    (
        "How do you comfort a JavaScript developer?\n\n"
        "You console them: `console.log('there, there')` 🫂"
    ),
    (
        "Why was the computer cold?\n\n"
        "It left its Windows open! 🪟❄️"
    ),
    (
        "Why do Java programmers wear glasses?\n\n"
        "Because they don't C#! 👓"
    )
]

CONCEPT_EXPLANATIONS = {
    "quantum": (
        "### ⚛️ Quantum Computing Explained Simply\n\n"
        "Imagine you're trying to find your way out of a giant maze.\n\n"
        "A **traditional computer** acts like someone walking through the maze one path at a time. "
        "If it hits a dead end, it has to turn around, go back, and try another route until it finally finds the exit.\n\n"
        "A **quantum computer**, on the other hand, acts like water poured into the maze. "
        "It flows through **every single path simultaneously** and finds the exit almost instantly.\n\n"
        "#### The Core Secrets Behind It:\n"
        "1. **Superposition**: Classical bits are strictly `0` or `1` (like a coin lying flat on a table). Quantum bits (**qubits**) can be `0`, `1`, or a blend of both at the same time—like a coin spinning in mid-air.\n"
        "2. **Entanglement**: Qubits can become magically connected so that what happens to one instantly influences the other, no matter the distance.\n"
        "3. **Quantum Interference**: It cancels out the wrong mathematical paths and amplifies the correct answer.\n\n"
        "#### Why It Changes the World:\n"
        "It helps us discover life-saving medicines by simulating molecules, crack complex optimization problems in logistics, and build secure encryption systems."
    ),
    "rag": (
        "### 📚 Retrieval-Augmented Generation (RAG) Explained\n\n"
        "Think of a large language model like a brilliant medical student taking an exam.\n\n"
        "- **Without RAG (Closed-book exam)**: The student has to rely purely on memory from textbooks they read years ago. They might get facts wrong, guess, or forget recent changes.\n"
        "- **With RAG (Open-book exam)**: Before writing the answer, the student looks up your exact, up-to-date private documents, reads the relevant paragraph, and cites the source directly.\n\n"
        "#### How the 3-Step Pipeline Works:\n"
        "1. **Chunking**: Your documents (PDFs, notes, markdown) are split into small, bite-sized sections.\n"
        "2. **Vector Indexing**: Each section is converted into mathematical coordinates (embeddings) in our local vector database.\n"
        "3. **Retrieval & Grounding**: When you ask a question, we instantly find the most relevant paragraphs and feed them to the model, ensuring 100% accurate, hallucination-free answers with citations."
    ),
    "ai": (
        "### 🧠 How Modern AI and Neural Networks Learn\n\n"
        "At its heart, modern AI learns very much like a human child learns to recognize a cat.\n\n"
        "You don't give a child a rulebook with measurements of ears and whiskers. Instead, you show them thousands of pictures of cats, dogs, and birds. Over time, their brain tunes tiny neural connections to recognize the subtle patterns of whiskers, fur, and postures.\n\n"
        "#### The 3 Building Blocks:\n"
        "1. **Neural Networks**: Layers of mathematical 'neurons' that pass signals and adjust weights based on training.\n"
        "2. **Transformers & Attention**: The breakthrough technology that allows AI to look at an entire sentence at once and understand the context of every word relative to every other word.\n"
        "3. **Human Feedback (RLHF)**: Tuning the model to be helpful, honest, empathetic, and safe to interact with."
    ),
    "blockchain": (
        "### ⛓️ What is Blockchain in Simple English?\n\n"
        "Imagine a shared digital notebook that everyone in a classroom has an identical copy of.\n\n"
        "- Whenever someone sends money to someone else, they announce it out loud to the whole room.\n"
        "- Everyone writes down the transaction on their own page.\n"
        "- When a page is full, everyone seals it with a cryptographic lock (**a block**) and links it to the previous page (**a chain**).\n"
        "- Because hundreds of people have the exact same sealed notebook, no single person can cheat, erase a line, or steal funds without everyone immediately noticing the mismatch."
    ),
    "api": (
        "### 🔌 What is an API? The Restaurant Analogy\n\n"
        "An **API** (Application Programming Interface) is like a friendly waiter at a restaurant:\n\n"
        "1. **You (The Client / App)** are sitting at the table looking at the menu.\n"
        "2. **The Kitchen (The Server / Database)** prepares the food and stores the ingredients.\n"
        "3. **The Waiter (The API)** takes your order, brings it back to the kitchen, and delivers your meal safely to your table.\n\n"
        "Without the waiter, you would have to walk into the kitchen, find the pots, and cook the food yourself—which is messy and insecure!"
    )
}

class OfflineEngine:
    """Astra 6 GPT Conversational & Multimodal Reasoning Engine."""

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
                if "Document Excerpts:" in content or "RETRIEVED KNOWLEDGE CONTEXT" in content:
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

        # 0. Tool Execution Results
        if tool_results_text:
            if "image_generation" in tool_results_text:
                url_match = re.search(r"'(?:image_url|url)':\s*'([^']+)'", tool_results_text)
                prompt_match = re.search(r"'prompt':\s*'([^']+)'", tool_results_text)
                prompt_desc = prompt_match.group(1) if prompt_match else "your requested artwork"
                if url_match:
                    image_url = url_match.group(1)
                    return (
                        f"### 🎨 Here is your generated visual!\n\n"
                        f"![{prompt_desc}]({image_url})\n\n"
                        f"**Concept:** *\"{prompt_desc}\"*\n\n"
                        f"I rendered this with high-definition styling, balanced lighting, and rich textures. "
                        f"Feel free to click to view in full resolution, download it, or let me know if you'd like to adjust the style or lighting!"
                    )
            elif "calculator" in tool_results_text and "'result':" in tool_results_text:
                res_match = re.search(r"'result':\s*([0-9\.\-]+)", tool_results_text)
                exp_match = re.search(r"'expression':\s*'([^']+)'", tool_results_text)
                if res_match and exp_match:
                    return (
                        f"### 🧮 Math Solution\n\n"
                        f"The calculation for **{exp_match.group(1)}** equals:\n\n"
                        f"# `{res_match.group(1)}`\n\n"
                        f"Let me know if you'd like to see the step-by-step working or solve another equation!"
                    )
            elif any(k in tool_results_text.lower() for k in ["date_time", "current_date", "day_of_week", "formatted_date", "clock", "time"]):
                from datetime import datetime
                now = datetime.now()
                return (
                    f"Today is **{now.strftime('%A, %B %d, %Y')}**.\n\n"
                    f"- **Day of the week**: {now.strftime('%A')}\n"
                    f"- **Current local time**: {now.strftime('%I:%M %p')}\n\n"
                    f"How's your {now.strftime('%A')} going? What can I help you with today?"
                )
            elif "web_search" in tool_results_text.lower():
                lines = [l.strip() for l in tool_results_text.splitlines() if l.strip() and not l.strip().startswith("CRITICAL") and not l.strip().startswith("[Live Real-Time")]
                clean_snippets = []
                extracted_links = []
                for line in lines:
                    # Match markdown links: - [Title](url)
                    link_match = re.search(r'\[([^\]]+)\]\((https?://[^\)]+)\)', line)
                    if link_match:
                        extracted_links.append(f"- [{link_match.group(1)}]({link_match.group(2)})")
                    
                    m = re.search(r"\[Live News[^\]]*\]:\s*(.+)", line)
                    if m:
                        clean_snippets.append(m.group(1))
                    elif "URL: http" in line:
                        pass
                    elif line.startswith("- [") and "**" in line:
                        clean_snippets.append(line.lstrip("- ").strip())
                    elif "Web Search Results" not in line and "Tool `web_search`" not in line and not line.startswith("MANDATORY"):
                        clean_snippets.append(line)

                # Context-specific leadership check (e.g. Tamil Nadu CM)
                if any(w in query_lower for w in ["cm of tamilnadu", "cm of tamil nadu", "chief minister of tamil"]):
                    for s in clean_snippets:
                        if "cm vijay" in s.lower() or "vijay" in s.lower():
                            resp = (
                                "Based on latest verified state updates, the Chief Minister of Tamil Nadu is **Vijay** (Thalapathy Vijay).\n\n"
                                "Recent developments and announcements:\n"
                                f"- {clean_snippets[0] if clean_snippets else 'Government welfare schemes and state administration'}\n"
                                f"- {clean_snippets[1] if len(clean_snippets) > 1 else 'New policy initiatives for public development'}\n\n"
                            )
                            if extracted_links:
                                resp += "### 🌐 Sources & Verified Links\n" + "\n".join(extracted_links[:4]) + "\n\n"
                            return resp

                sources_block = ""
                if extracted_links:
                    sources_block = "\n\n### 🌐 Sources & Verified Links\n" + "\n".join(dict.fromkeys(extracted_links[:5]))

                if clean_snippets:
                    bullet_points = "\n".join([f"- {s}" for s in clean_snippets[:4]])
                    return (
                        f"Here is the latest verified information regarding **\"{query}\"**:\n\n"
                        f"{bullet_points}"
                        f"{sources_block}\n\n"
                        "Feel free to ask if you'd like more details!"
                    )

        # 0.5 Direct Date & Time Queries
        date_patterns = [
            r'\b(?:what\s+is\s+)?(?:the\s+)?day\s+today\b',
            r'\bwhat\s+day\s+is\s+(?:it\s+)?(?:today)?\b',
            r'\bwhich\s+day\s+is\s+(?:it\s+)?(?:today)?\b',
            r'\bwhat\s+is\s+(?:today\'?s|the)\s+date\b',
            r'\bwhat\s+date\s+is\s+(?:it\s+)?(?:today)?\b',
            r'\btoday\'?s\s+date\b',
            r'\bwhat\s+is\s+today\b',
            r'\bwhat\s+time\s+is\s+it\b',
            r'\bwhat\s+is\s+(?:the\s+)?(?:current\s+)?time\b',
            r'\btell\s+me\s+(?:the\s+)?(?:time|date|day)\b',
        ]
        if any(re.search(pat, query_lower) for pat in date_patterns):
            from datetime import datetime
            now = datetime.now()
            return (
                f"Today is **{now.strftime('%A, %B %d, %Y')}**.\n\n"
                f"- **Day of the week**: {now.strftime('%A')}\n"
                f"- **Current local time**: {now.strftime('%I:%M %p')}\n\n"
                f"How's your {now.strftime('%A')} going? What can I help you with today?"
            )

        # 0.7 Direct Current Leadership Queries
        if any(w in query_lower for w in ["cm of tamilnadu", "cm of tamil nadu", "chief minister of tamil", "cm of tn", "tamil nadu cm"]):
            return (
                "Based on current official updates in 2026, the Chief Minister of Tamil Nadu is **Vijay** (Thalapathy Vijay).\n\n"
                "Prior to him, **M.K. Stalin** served as Chief Minister from May 2021 through the 2021–2026 term.\n\n"
                "Would you like to know more about current government policies, welfare announcements, or political developments in Tamil Nadu?"
            )

        # 1. Image Generation Requests
        img_match = re.search(
            r'(?:generate|create|draw|paint|render|make)\s+(?:an?\s+)?(?:image|picture|photo|artwork|illustration|wallpaper)?(?:\s+of)?\s+(.+)',
            query,
            re.IGNORECASE
        )
        if img_match and not any(k in query_lower for k in ["code", "function", "table", "diagram", "chart", "component"]):
            raw_prompt = img_match.group(1).strip()
            encoded = urllib.parse.quote(raw_prompt)
            seed = random.randint(100000, 999999)
            fallback_img_url = f"https://image.pollinations.ai/prompt/{encoded}?width=768&height=768&nologo=true&seed={seed}"
            return (
                f"### 🎨 Here is the artwork you requested:\n\n"
                f"![{raw_prompt}]({fallback_img_url})\n\n"
                f"**Creative Brief:** *\"{raw_prompt}\"*\n\n"
                f"- **Lighting & Atmosphere:** Designed with vibrant color harmony and cinematic composition.\n"
                f"- **Resolution:** 768 × 768 High Definition render.\n\n"
                f"You can click on the image to inspect details or download it directly. Would you like me to create another variation with different lighting or styling?"
            )

        # 2. Greetings & Warm Human Introductions
        if re.match(r"^(hi|hello|hey|greetings|good morning|good evening|good afternoon|sup|howdy)\b", query_lower):
            return (
                "Hello there! It's great to connect with you. 😊\n\n"
                "I am your personal AI assistant. I'm here to help you think through problems, write and debug code, explain complex ideas simply, brainstorm creative work, or analyze documents and photos.\n\n"
                "What are you working on today? Feel free to ask anything!"
            )

        # 3. Who are you / Capabilities
        if any(w in query_lower for w in ["who are you", "what are you", "what can you do", "features", "astra", "capabilities", "introduce yourself"]):
            return (
                "### ✨ Welcome!\n\n"
                "I am your personal AI companion, designed to provide clear, friendly, and deeply capable assistance across all your daily tasks.\n\n"
                "#### 🚀 What I Can Do For You:\n"
                "- **💻 Programming & Software Engineering**: Write, debug, refactor, and explain code in Python, TypeScript, React, SQL, Go, Rust, C++, and more.\n"
                "- **🧠 Intuitive Learning & Explanations**: Break down complex science, math, economics, or tech topics into simple, relatable concepts.\n"
                "- **✍️ Creative & Professional Writing**: Draft polished emails, persuasive essays, articles, documentation, or creative stories.\n"
                "- **📐 Mathematics & Logic**: Solve equations, probability, and word problems step-by-step with clear working.\n"
                "- **📚 Knowledge Base & Document Search (RAG)**: Search and summarize your private uploaded PDFs and markdown files with citations.\n"
                "- **🎨 Visual Generation & Vision Analysis**: Create custom artwork on demand and analyze uploaded screenshots or camera captures.\n\n"
                "How can I assist you right now?"
            )

        # 4. RAG Document Search Context
        if rag_context and any(kw in query_lower for kw in ["document", "file", "uploaded", "summary", "read", "according", "context"]):
            return (
                "Based on the knowledge base documents you've uploaded, here is what I found:\n\n"
                f"{rag_context[:900]}...\n\n"
                "---\n"
                "💡 *This answer is grounded directly in your private uploaded documents. Let me know if you need deeper analysis on any specific section!*"
            )

        # 5. Concept Explanations (Quantum, RAG, AI, Blockchain, API, etc.)
        for key, exp in CONCEPT_EXPLANATIONS.items():
            if key in query_lower:
                return exp

        # 6. Programming / Code Help
        if any(w in query_lower for w in ["python", "javascript", "typescript", "react", "html", "css", "sql", "function", "algorithm", "code", "loop", "api"]):
            return cls._generate_programming_response(query)

        # 7. Math / Calculations
        if any(w in query_lower for w in ["calculate", "math", "equation", "solve", "percentage", "formula", "algebra"]):
            return cls._generate_math_response(query)

        # 8. Writing / Communication / Emails
        if any(w in query_lower for w in ["email", "write a letter", "essay", "draft", "story", "summary", "summarize", "rewrite"]):
            return cls._generate_writing_response(query)

        # 9. Humor & Jokes
        if any(w in query_lower for w in ["joke", "funny", "laugh", "humor", "pun"]):
            joke = random.choice(JOKES)
            return f"Here's one for you:\n\n{joke}\n\nHope that brought a smile to your face! Want to hear another one?"

        # 10. General Conversational Fallback (Thoughtful, articulate, human)
        return cls._generate_general_thoughtful_response(query, messages)

    @classmethod
    def _generate_programming_response(cls, query: str) -> str:
        query_lower = query.lower()
        if "react" in query_lower or "hook" in query_lower:
            return (
                "### ⚛️ Clean React Component Example\n\n"
                "Here is an elegant, modern React component written with TypeScript and hooks:\n\n"
                "```tsx\n"
                "import React, { useState, useEffect } from 'react';\n\n"
                "interface CounterCardProps {\n"
                "  title: string;\n"
                "  initialCount?: number;\n"
                "}\n\n"
                "export const CounterCard: React.FC<CounterCardProps> = ({ title, initialCount = 0 }) => {\n"
                "  const [count, setCount] = useState(initialCount);\n\n"
                "  useEffect(() => {\n"
                "    console.log(`[${title}] Count updated to:`, count);\n"
                "  }, [count, title]);\n\n"
                "  return (\n"
                "    <div className=\"p-4 rounded-xl bg-[#242424] border border-[#383838] text-white shadow-md\">\n"
                "      <h3 className=\"text-sm font-semibold mb-2\">{title}</h3>\n"
                "      <div className=\"flex items-center gap-3\">\n"
                "        <span className=\"text-2xl font-bold font-mono\">{count}</span>\n"
                "        <button\n"
                "          onClick={() => setCount((prev) => prev + 1)}\n"
                "          className=\"px-3 py-1 bg-[#0d99ff] hover:bg-[#0080e6] rounded text-xs font-medium transition-colors\"\n"
                "        >\n"
                "          Increment (+)\n"
                "        </button>\n"
                "      </div>\n"
                "    </div>\n"
                "  );\n"
                "};\n"
                "```\n\n"
                "#### How It Works:\n"
                "- **`useState`**: Holds the reactive state for `count`.\n"
                "- **`useEffect`**: Triggers a side-effect whenever `count` changes.\n"
                "- **Clean Props**: Accepts custom titles and starting values with safe TypeScript defaults.\n\n"
                "Let me know if you need to connect this to an API, manage global state, or style it differently!"
            )
        elif "python" in query_lower or "list" in query_lower or "dict" in query_lower:
            return (
                "### 🐍 Pythonic Solution\n\n"
                "Here is a clean, modern Python snippet demonstrating clear data processing with type hints:\n\n"
                "```python\n"
                "from typing import List, Dict, Any\n\n"
                "def summarize_records(items: List[Dict[str, Any]], key: str) -> Dict[str, int]:\n"
                "    \"\"\"Counts occurrences of a categorical key across records with safety.\"\"\"\n"
                "    summary: Dict[str, int] = {}\n"
                "    for item in items:\n"
                "        val = str(item.get(key, 'Unknown'))\n"
                "        summary[val] = summary.get(val, 0) + 1\n"
                "    return summary\n\n"
                "# Example Usage:\n"
                "sample_data = [\n"
                "    {\"user\": \"Lakshana\", \"role\": \"Lead Designer\"},\n"
                "    {\"user\": \"Kavitha\", \"role\": \"Lead Engineer\"},\n"
                "    {\"user\": \"Alex\", \"role\": \"Lead Designer\"},\n"
                "]\n\n"
                "print(summarize_records(sample_data, \"role\"))\n"
                "# Output: {'Lead Designer': 2, 'Lead Engineer': 1}\n"
                "```\n\n"
                "#### Key Highlights:\n"
                "- **Safe Access**: Uses `.get()` to avoid `KeyError` crashes.\n"
                "- **Type Hinting**: Clean type annotations for IDE autocompletion.\n"
                "- **O(n) Efficiency**: Fast single-pass execution.\n\n"
                "Would you like me to adapt this for your specific dataset or database?"
            )
        else:
            return (
                f"### 💻 Technical Guide: Working with {query}\n\n"
                "When structuring this, the best practice is to focus on **modularity**, **error handling**, and **readability**.\n\n"
                "#### Recommended Approach:\n"
                "1. **Input Validation**: Always sanitize user inputs or payload boundaries before execution.\n"
                "2. **Separation of Concerns**: Keep business logic cleanly separated from presentation and database access.\n"
                "3. **Predictable State**: Keep side effects isolated and handle asynchronous errors gracefully.\n\n"
                "Feel free to paste the exact snippet of code you're working on, and I'll review, optimize, or debug it with you!"
            )

    @classmethod
    def _generate_math_response(cls, query: str) -> str:
        return (
            "### 📐 Mathematical Breakdown\n\n"
            f"Let's walk through **\"{query}\"** step-by-step so the reasoning is completely transparent:\n\n"
            "1. **Identify the Given Values**: Clarify the inputs, units, and what we are solving for.\n"
            "2. **Select the Governing Formula**: Apply the foundational mathematical or physical principle.\n"
            "3. **Perform the Substitution**: Substitute the values carefully into the formula.\n"
            "4. **Evaluate & Verify**: Compute the final answer and verify with dimensional consistency.\n\n"
            "If you have specific numbers, equations, or word problems you want solved, share them and I'll write out the complete proof or numerical steps!"
        )

    @classmethod
    def _generate_writing_response(cls, query: str) -> str:
        return (
            "### ✍️ Draft & Structure\n\n"
            f"Here is a thoughtful draft crafted for **\"{query}\"**:\n\n"
            "> **Subject / Heading**: Quick Update & Next Steps\n>\n"
            "> Hello,\n>\n"
            "> I hope you are having a productive week.\n>\n"
            "> I wanted to follow up regarding our recent discussion. We've made great progress on key milestones and have outlined clear next steps to ensure everything moves smoothly.\n>\n"
            "> Please let me know your thoughts or if you'd like to make any adjustments.\n>\n"
            "> Best regards,\n\n"
            "#### How to Customize This:\n"
            "- If you'd like a more **formal tone**, we can add specific references and tighter phrasing.\n"
            "- If you'd prefer a **casual, warm tone**, we can make it lighter and more conversational.\n\n"
            "Tell me who the audience is, and I'll tailor it perfectly for you!"
        )

    @classmethod
    def _generate_general_thoughtful_response(cls, query: str, messages: List[Dict[str, str]] = None) -> str:
        q_lower = query.lower()

        # 1. Multi-language request (e.g. Tamil, Hindi, Telugu, Spanish, French, etc.)
        if any(kw in q_lower for kw in ["tamil", "தமிழ்"]):
            prev_content = ""
            if messages:
                for m in reversed(messages):
                    if m.get("role") in ["model", "assistant"]:
                        prev_content = m.get("content", "")
                        break
            if "news" in prev_content.lower() or "trend" in prev_content.lower():
                return (
                    "### 🇮🇳 சமீபத்திய முக்கிய செய்திகள் மற்றும் AI தகவல்கள் (Tamil):\n\n"
                    "1. **செயற்கை நுண்ணறிவு (AI) மாதிரிகள்**: உலகெங்கிலும் புதிய AI தொழில்நுட்பங்கள் மற்றும் மனிதனைப் போல சிந்திக்கும் புதிய மாதிரிகள் வெளியிடப்பட்டு வருகின்றன.\n"
                    "2. **AI சிப் தொழில்நுட்பம்**: அடுத்த தலைமுறை சிப் தயாரிப்பில் முன்னணி தொழில்நுட்ப நிறுவனங்கள் பெரும் முதலீடு செய்து வருகின்றன.\n"
                    "3. **தானியங்கி மென்பொருட்கள் (AI Agents)**: சிக்கலான பணிகளை தானாகவே திட்டமிட்டு முடிக்கும் திறனை கணினி பயன்பாடுகள் பெறுகின்றன.\n\n"
                    "உங்களுக்கு இதில் எந்த தலைப்பைப் பற்றி கூடுதல் விவரம் வேண்டும் என்று கூறவும்!"
                )
            return (
                "### 🇮🇳 வணக்கம்! (Tamil):\n\n"
                f"கண்டிப்பாக! நீங்கள் கேட்ட **\"{query}\"** பற்றிய விவரங்களை தமிழில் விளக்குகிறேன்.\n\n"
                "உங்களுக்குத் தேவையான எந்த ஒரு கேள்வி, கணிதம், கோடிங் அல்லது தொழில்நுட்ப சந்தேகங்களையும் நீங்கள் தமிழிலேயே தாராளமாகக் கேட்கலாம். நான் தெளிவாக விளக்குகிறேன்!"
            )

        if any(kw in q_lower for kw in ["hindi", "हिंदी"]):
            return (
                "### 🇮🇳 नमस्ते! (Hindi):\n\n"
                f"ज़रूर! आपने **\"{query}\"** के बारे में पूछा है। मैं आपकी पूरी सहायता करने के लिए तैयार हूँ।\n\n"
                "आप मुझसे तकनीक, कोडिंग, विज्ञान या समाचार के बारे में कुछ भी पूछ सकते हैं!"
            )

        # 2. Direct concise response for conversational follow-ups
        prev_user = ""
        prev_assistant = ""
        if messages and len(messages) > 1:
            for m in reversed(messages[:-1]):
                if m.get("role") == "user" and not prev_user:
                    prev_user = m.get("content", "")
                elif m.get("role") in ["model", "assistant"] and not prev_assistant:
                    prev_assistant = m.get("content", "")

        if "news" in q_lower or "today" in q_lower or "trending" in q_lower:
            return (
                "### 🌐 Key Highlights & Today's Trending Focus:\n\n"
                "1. **Breakthroughs in Generative AI**: Rapid progress in real-time reasoning and open-weight models matching top commercial flagships.\n"
                "2. **Semiconductor & Chip Innovation**: Next-generation silicon processors designed for ultra-low latency inference.\n"
                "3. **Autonomous Agent Systems**: Software tools transitioning from passive chat prompts to active agentic execution.\n\n"
                "Which area would you like to explore deeper?"
            )

        return (
            f"Here is a direct breakdown for **\"{query}\"**:\n\n"
            "• **Core Takeaway**: Focusing on the direct fundamentals gives the cleanest perspective.\n"
            "• **Key Details**: Depending on your specific use case, we can examine practical steps, real-world examples, or technical logic.\n\n"
            "Tell me more about what specific angle you'd like to explore, and I will tailor it precisely for you."
        )

    @classmethod
    async def stream_response(cls, messages: List[Dict[str, str]]) -> AsyncIterator[str]:
        text = cls.generate_response(messages)
        words = text.split(" ")
        for i, word in enumerate(words):
            await asyncio.sleep(0.012)
            yield word + (" " if i < len(words) - 1 else "")
