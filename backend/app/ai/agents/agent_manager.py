from typing import Dict, Any, List, Optional
from app.ai.agents.planner import ToolPlanner
from app.ai.agents.executor import ToolExecutor
from app.ai.tools.registry import get_tool_registry

class AgentManager:
    def __init__(self):
        self.registry = get_tool_registry()
        self.planner = ToolPlanner(self.registry)
        self.executor = ToolExecutor(self.registry)

    async def evaluate_and_execute(self, user_prompt: str) -> Optional[Dict[str, Any]]:
        plan = self.planner.plan_tool_call(user_prompt)
        if not plan:
            return None

        result = await self.executor.execute_plan(plan)
        return result
