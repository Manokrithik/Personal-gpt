# Contributing to PersonalGPT

Thank you for your interest in contributing to PersonalGPT!

## Architecture Guidelines

1. **Modular Architecture**: Never write provider-specific logic inside UI components or API routes. Always implement or extend the corresponding adapter (`LLMProvider`, `VectorStore`, `Tool`, `MemoryManager`).
2. **Type Safety & Validation**:
   - Backend: Python 3.11+ type hints, Pydantic v2 schemas.
   - Frontend: TypeScript strict mode, Zod/typed interfaces.
3. **No Bloat**: Evaluate any new dependency before adding. Keep dependencies lightweight and compatible with personal laptops.
4. **Testing**: Add unit tests in `backend/tests/` for any new service, repository, or tool.

## Development Workflow

1. Fork & branch from `main`:
   ```bash
   git checkout -b feature/my-cool-feature
   ```
2. Commit with conventional commit messages:
   - `feat: add ...`
   - `fix: resolve ...`
   - `docs: update ...`
   - `test: add tests for ...`
3. Run test suites:
   ```bash
   pytest
   npm test
   ```
4. Open a Pull Request.
