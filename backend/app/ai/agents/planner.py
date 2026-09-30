import re
from typing import Optional, Dict, Any
from app.ai.tools.registry import ToolRegistry, get_tool_registry

class ToolPlanner:
    """Evaluates user requests and determines if a registered tool should be called."""

    def __init__(self, tool_registry: Optional[ToolRegistry] = None):
        self.tool_registry = tool_registry or get_tool_registry()

    def plan_tool_call(self, prompt: str) -> Optional[Dict[str, Any]]:
        text = prompt.strip().lower()

        # 1. Date & Time intent
        date_time_patterns = [
            r'\b(?:what\s+is\s+)?(?:the\s+)?day\s+today\b',
            r'\bwhat\s+day\s+is\s+(?:it\s+)?(?:today)?\b',
            r'\bwhich\s+day\s+is\s+(?:it\s+)?(?:today)?\b',
            r'\bwhat\s+is\s+(?:today\'?s|the)\s+date\b',
            r'\bwhat\s+date\s+is\s+(?:it\s+)?(?:today)?\b',
            r'\btoday\'?s\s+date\b',
            r'\bwhat\s+is\s+today\b',
            r'\bwhat\s+day\b',
            r'\bwhat\s+time\s+is\s+it\b',
            r'\bwhat\s+is\s+(?:the\s+)?current\s+time\b',
            r'\bwhat\s+is\s+the\s+time\b',
            r'\bcurrent\s+(?:time|date|day)\b',
            r'\btell\s+me\s+(?:the\s+)?(?:time|date|day)\b',
        ]
        if any(re.search(pat, text, re.IGNORECASE) for pat in date_time_patterns):
            return {"tool": "date_time", "arguments": {}}

        # 2. Calculator arithmetic intent: e.g. "calculate 25 * 40", "what is 144 / 12", "solve 500 + 350"
        calc_match = re.search(r'(?:calculate|what is|solve|compute)\s+([0-9\+\-\*\/\(\)\.\s\^]+)', text)
        if calc_match:
            expr = calc_match.group(1).strip()
            # Verify contains at least one operator
            if any(op in expr for op in ['+', '-', '*', '/', '^', '%']):
                return {"tool": "calculator", "arguments": {"expression": expr}}

        # 3. File search intent: "find file xyz", "search for document abc"
        search_match = re.search(r'(?:find file|search document|look for file)\s+([a-zA-Z0-9_\-\.]+)', text)
        if search_match:
            keyword = search_match.group(1).strip()
            return {"tool": "file_search", "arguments": {"keyword": keyword}}

        # 4. Image Generation intent: "generate an image of...", "create a picture of...", "draw a..."
        img_match = re.search(
            r'(?:generate|create|make|draw|paint|render|produce|design)\s+(?:an?\s+|the\s+)?(?:image|picture|photo|illustration|drawing|artwork|graphic|render|portrait|wallpaper|avatar)(?:\s+(?:of|showing|depicting|with|for))?\s*(.+)',
            prompt,
            re.IGNORECASE
        )
        if img_match:
            img_prompt = img_match.group(1).strip()
            img_prompt = re.sub(r'[\.\?\!]+$', '', img_prompt).strip()
            if img_prompt:
                return {"tool": "image_generation", "arguments": {"prompt": img_prompt}}

        # "draw a ...", "paint a ..." (excluding diagrams/charts/conclusions)
        draw_match = re.search(r'^(?:please\s+)?(?:draw|paint|illustrate)\s+(?:me\s+)?(?:an?\s+|the\s+)?([a-zA-Z0-9\s,\-\'\"]+)', prompt, re.IGNORECASE)
        if draw_match:
            candidate = draw_match.group(1).strip()
            candidate = re.sub(r'[\.\?\!]+$', '', candidate).strip()
            if not any(excluded in candidate.lower() for excluded in ["conclusion", "flowchart", "diagram", "table", "graph", "chart"]):
                if candidate:
                    return {"tool": "image_generation", "arguments": {"prompt": candidate}}

        # 5. Web Search / Real-time Lookups on ANY Questions or Information Inquiries
        # Exclude trivial greetings or single-word conversational fillers
        conversational_fillers = {
            "hi", "hello", "hey", "hola", "yo", "sup", "good morning", "good evening", 
            "good afternoon", "howdy", "thanks", "thank you", "bye", "goodbye", "ok", 
            "okay", "cool", "great", "nice", "awesome", "help"
        }
        if text in conversational_fillers:
            return None

        # Don't trigger web search for pure boilerplate code writing (unless asking about latest releases)
        is_pure_code_request = (
            any(k in text for k in ["write code", "write a function", "write a script", "debug this snippet", "implement a class", "solve this equation"])
            and not any(u in text for u in ["latest", "update", "new in", "release", "version", "2025", "2026"])
        )
        if is_pure_code_request:
            return None

        is_question = (
            text.endswith("?")
            or any(re.match(r'^(?:please\s+)?(?:can you\s+)?(?:could you\s+)?(?:tell me\s+)?' + qw + r'\b', text)
                   for qw in [r"who", r"what", r"when", r"where", r"why", r"how", r"which", r"is", r"are", r"was", r"were", r"can", r"could", r"will", r"would", r"does", r"did", r"has", r"have"])
        )

        web_search_patterns = [
            # Political / Leadership / Governance
            r'\b(?:cm|chief\s+minister|pm|prime\s+minister|president|governor|minister|mla|mp|mayor|leader|ruler|party|election)\b',
            # Who is / Who are / Who won / Who leads / Who is the
            r'\bwho\s+(?:is|are|was|won|leads|became|holds)\b',
            # Current / Live / Latest / Trends
            r'\b(?:current|currently|present|latest|breaking\s+news|recent|recently|trending|today\'?s?|tomorrow\'?s?|updates?)\b',
            # Recent or current years
            r'\b(?:202[4-9]|203[0-9])\b',
            # Sports / Fixtures / Schedules / Scores
            r'\b(?:when\s+is|schedule|match|odi|t20|test\s+match|cricket|football|fifa|ipl|vs|versus|who\s+won|score|fixture|tournament|series|championship)\b',
            # News / Politics / Economy / Markets / Weather / Tech
            r'\b(?:news|headlines|budget|gold\s+price|silver\s+price|stock\s+price|weather|release|version|launch|announcement)\b',
            # Search / Lookup commands
            r'\b(?:search(?:\s+for|\s+web)?|look\s+up|google|find\s+out|check\s+(?:the\s+)?latest)\b',
        ]

        has_query_keywords = any(re.search(pat, text, re.IGNORECASE) for pat in web_search_patterns)

        if is_question or has_query_keywords:
            clean_q = re.sub(r'^(?:please\s+)?(?:can you\s+)?(?:could you\s+)?(?:tell me\s+)?(?:search(?:\s+for)?|look up|find out|check(?:\s+the\s+latest)?(?:\s+updates?\s+(?:on|about))?)?\s*', '', prompt, flags=re.IGNORECASE)
            clean_q = clean_q.strip().rstrip('?.!')
            if len(clean_q) > 2:
                return {"tool": "web_search", "arguments": {"query": clean_q}}

        return None

