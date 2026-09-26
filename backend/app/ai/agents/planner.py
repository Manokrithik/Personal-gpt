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
        if any(k in text for k in ["what time is it", "current time", "what is today's date", "what day is today", "what date is it"]):
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

        # "image of ...", "generate image: ..."
        direct_match = re.search(r'^(?:generate\s+)?image(?:\s+of|:)\s+(.+)', prompt, re.IGNORECASE)
        if direct_match:
            candidate = direct_match.group(1).strip()
            candidate = re.sub(r'[\.\?\!]+$', '', candidate).strip()
            if candidate:
                return {"tool": "image_generation", "arguments": {"prompt": candidate}}

        return None

