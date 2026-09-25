from typing import Dict, Any, Optional
from app.ai.tools.registry import ToolRegistry, get_tool_registry
from app.core.logging import get_logger

logger = get_logger("agent.executor")

class ToolExecutor:
    def __init__(self, tool_registry: Optional[ToolRegistry] = None):
        self.tool_registry = tool_registry or get_tool_registry()

    async def execute_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        tool_name = plan.get("tool")
        arguments = plan.get("arguments", {})
        logger.info(f"Agent executing tool: {tool_name} with arguments: {arguments}")
        
        result = await self.tool_registry.execute(tool_name, **arguments)
        return {
            "tool": tool_name,
            "arguments": arguments,
            "output": result,
        }
