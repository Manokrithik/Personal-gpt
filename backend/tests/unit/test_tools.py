import pytest
from app.ai.tools.calculator import CalculatorTool
from app.ai.tools.date_time import DateTimeTool
from app.ai.tools.file_search import FileSearchTool

@pytest.mark.asyncio
async def test_calculator_basic_operations():
    calc = CalculatorTool()
    res = await calc.execute(expression="2 + 3 * 4")
    assert res["status"] == "success"
    assert res["result"] == 14

@pytest.mark.asyncio
async def test_calculator_parentheses_and_division():
    calc = CalculatorTool()
    res = await calc.execute(expression="(100 - 20) / 4")
    assert res["status"] == "success"
    assert res["result"] == 20.0

@pytest.mark.asyncio
async def test_calculator_division_by_zero():
    calc = CalculatorTool()
    res = await calc.execute(expression="10 / 0")
    assert res["status"] == "failed"
    assert "Division by zero" in res["error"]

@pytest.mark.asyncio
async def test_calculator_security_prevents_code_injection():
    calc = CalculatorTool()
    res = await calc.execute(expression="__import__('os').system('ls')")
    assert res["status"] == "failed"
    assert "Invalid expression" in res["error"]

@pytest.mark.asyncio
async def test_datetime_tool():
    tool = DateTimeTool()
    res = await tool.execute()
    assert res["status"] == "success"
    assert "current_date" in res
    assert "current_time" in res
    assert "day_of_week" in res
