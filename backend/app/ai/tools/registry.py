from typing import Dict, List, Any, Optional
from app.ai.tools.base import BaseTool
from app.ai.tools.calculator import CalculatorTool
from app.ai.tools.date_time import DateTimeTool
from app.ai.tools.file_search import FileSearchTool
from app.ai.tools.knowledge_search import KnowledgeSearchTool
from app.ai.tools.image_generation import ImageGenerationTool
from app.ai.tools.web_search import WebSearchTool
from app.core.logging import get_logger

logger = get_logger("tools.registry")

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_defaults()

    def _register_defaults(self):
        self.register(CalculatorTool())
        self.register(DateTimeTool())
        self.register(FileSearchTool())
        self.register(KnowledgeSearchTool())
        self.register(ImageGenerationTool())
        self.register(WebSearchTool())

    def register(self, tool: BaseTool):
        self._tools[tool.name] = tool
        logger.debug(f"Registered tool: {tool.name}")

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters,
            }
            for t in self._tools.values()
        ]

    def get_tools_description_text(self) -> str:
        lines = []
        for t in self._tools.values():
            params = ", ".join([f"{k}: {v.get('type')}" for k, v in t.parameters.items()])
            lines.append(f"- Tool: `{t.name}`({params}) -> {t.description}")
        return "\n".join(lines)

    async def execute(self, name: str, **kwargs) -> Dict[str, Any]:
        tool = self.get_tool(name)
        if not tool:
            return {"error": f"Tool '{name}' is not registered", "status": "failed"}
        try:
            return await tool.execute(**kwargs)
        except Exception as e:
            logger.error(f"Error executing tool {name}: {e}", exc_info=True)
            return {"error": str(e), "status": "failed"}

_registry = None

def get_tool_registry() -> ToolRegistry:
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
    return _registry
