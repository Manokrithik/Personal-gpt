import pytest
from app.ai.providers.mock import MockProvider
from app.ai.providers.registry import ProviderRegistry

@pytest.mark.asyncio
async def test_mock_provider_generate():
    provider = MockProvider()
    response = await provider.generate([{"role": "user", "content": "Hello PersonalGPT"}])
    assert "PersonalGPT (Mock)" in response
    assert "Hello PersonalGPT" in response

@pytest.mark.asyncio
async def test_mock_provider_stream():
    provider = MockProvider()
    tokens = []
    async for chunk in provider.stream([{"role": "user", "content": "How are you?"}]):
        tokens.append(chunk)

    full_text = "".join(tokens)
    assert len(tokens) > 1
    assert "PersonalGPT" in full_text

def test_provider_registry_fallback():
    registry = ProviderRegistry()
    unknown_provider = registry.get_provider("non_existent_provider")
    assert isinstance(unknown_provider, MockProvider)
