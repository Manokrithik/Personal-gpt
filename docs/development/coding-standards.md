# Coding Standards

## Python Backend
- Type annotations required on all function arguments and returns.
- Pydantic models for all incoming/outgoing payloads.
- Async I/O for all database, network, and file calls.
- Domain exceptions extending `PersonalGPTException` rather than raising raw HTTPExceptions in service layers.
- No global mutable state.

## Frontend
- React 18 functional components with TypeScript strict typing.
- Modular stores via Zustand; never a monolithic single state store.
- Tailwind CSS with semantic design tokens and dark mode support.
- Lucide React iconography.
- Centralized API clients in `frontend/src/services/`.
