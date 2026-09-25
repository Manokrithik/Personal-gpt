import pytest
from app.ai.memory.short_term import ShortTermContextManager
from app.ai.memory.long_term import LongTermMemoryManager
from app.db.models.message import Message

def test_short_term_context_sliding_window():
    mgr = ShortTermContextManager(max_tokens=50, message_limit=3)
    msgs = [
        Message(id="1", conversation_id="c1", role="user", content="Hello 1"),
        Message(id="2", conversation_id="c1", role="assistant", content="Hi there 1"),
        Message(id="3", conversation_id="c1", role="user", content="Hello 2"),
        Message(id="4", conversation_id="c1", role="assistant", content="Hi there 2"),
        Message(id="5", conversation_id="c1", role="user", content="Latest query"),
    ]
    selected = mgr.select_context_messages(msgs)
    assert len(selected) <= 3
    assert selected[-1]["content"] == "Latest query"

def test_long_term_memory_extraction():
    mgr = LongTermMemoryManager()
    
    # Preference match
    cand = mgr.extract_candidate("I prefer TypeScript over Python for web development")
    assert cand is not None
    assert cand["memory_type"] == "preference"
    assert "prefer typescript" in cand["content"]

    # Instruction match
    cand = mgr.extract_candidate("Always respond using bullet points")
    assert cand is not None
    assert cand["memory_type"] == "instruction"

    # Non-memory statement
    cand_none = mgr.extract_candidate("What is the weather outside today?")
    assert cand_none is None

def test_long_term_memory_duplicate_detection():
    mgr = LongTermMemoryManager()
    existing = [{"content": "i prefer dark mode"}]
    assert mgr.is_duplicate("I prefer dark mode", existing) is True
    assert mgr.is_duplicate("My name is John", existing) is False
