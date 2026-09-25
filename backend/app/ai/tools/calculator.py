import ast
import operator
from typing import Dict, Any
from app.ai.tools.base import BaseTool

# Safe mathematical operators
SAFE_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}

def safe_eval_ast(node):
    if isinstance(node, ast.Constant):  # numbers
        return node.value
    elif isinstance(node, ast.BinOp):
        left = safe_eval_ast(node.left)
        right = safe_eval_ast(node.right)
        op = SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = safe_eval_ast(node.operand)
        op = SAFE_OPS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported unary operator: {type(node.op).__name__}")
        return op(operand)
    else:
        raise ValueError(f"Unsupported AST node: {type(node).__name__}")

class CalculatorTool(BaseTool):
    name = "calculator"
    description = "Perform safe, precise mathematical calculations. Accepts arithmetic expressions like '((12 * 4) + 15) / 3'."
    parameters = {
        "expression": {"type": "string", "description": "The mathematical expression to evaluate"}
    }

    async def execute(self, **kwargs) -> Dict[str, Any]:
        expr = kwargs.get("expression", "").strip()
        if not expr:
            return {"error": "No expression provided"}
        try:
            tree = ast.parse(expr, mode='eval')
            result = safe_eval_ast(tree.body)
            return {"expression": expr, "result": result, "status": "success"}
        except ZeroDivisionError:
            return {"expression": expr, "error": "Division by zero", "status": "failed"}
        except Exception as e:
            return {"expression": expr, "error": f"Invalid expression: {str(e)}", "status": "failed"}
