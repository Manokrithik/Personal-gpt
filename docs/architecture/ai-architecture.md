# AI & LLM Architecture

## 1. Provider Independence Pattern

PersonalGPT enforces a strict adapter pattern for all language model interactions. Neither route handlers nor service layers instantiate provider clients directly.

```python
class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict], **kwargs) -> str:
        """Non-streaming generation."""
        pass

    @abstractmethod
    async def stream(self, messages: list[dict], **kwargs) -> AsyncIterator[str]:
        """Streaming token generation via SSE."""
        pass

    @abstractmethod
    async def list_models(self) -> list[dict]:
        """Query available models."""
        pass
```

### Concrete Adapters
1. **`OllamaProvider`**: Communicates with local Ollama daemon (`http://localhost:11434` or Docker network). No API keys required. Zero external telemetry.
2. **`OpenAIProvider`**: Communicates with OpenAI-compatible endpoints (`/v1/chat/completions`) using secure server-side environment keys.
3. **`GeminiProvider`**: Direct Google Gemini API adapter.
4. **`MockProvider`**: Deterministic mock provider for CI/CD test suites requiring zero external networking or API keys.

## 2. Response Pipeline

When a user submits a prompt, PersonalGPT processes the request through the following pipeline:

```
User Prompt
     │
     ▼
Input Sanitizer & Context Manager (Retrieve last N turns)
     │
     ├─► Long-Term Memory Retriever (Search top-K relevant memories)
     │
     ├─► RAG Knowledge Retriever (Vector search top-K relevant document chunks)
     │
     ├─► Tool Router / Planner (Evaluate whether tools are required)
     │       │
     │       ├─► If Tool Required: Execute safely -> Format Tool Result
     │
     ▼
Prompt Assembly (System Prompt + Memory + Context + Citations + Tools)
     │
     ▼
LLM Provider Router (Ollama / OpenAI / Gemini / Mock)
     │
     ▼
SSE Stream (Tokens streamed chunk-by-chunk to UI)
     │
     ▼
Persistence (Save Assistant Turn + Trigger Async Memory Extraction)
```
