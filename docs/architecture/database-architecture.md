# Database Architecture

## 1. Schema Design

PersonalGPT utilizes SQLAlchemy async ORM with Alembic migrations. It is configured to run out-of-the-box on SQLite (`sqlite+aiosqlite`) for frictionless local developer onboarding, and PostgreSQL (`postgresql+asyncpg`) for production containerized deployments.

### Entity Relationship Diagram

```
+--------------------+
|       Users        |
+--------------------+
| id (UUID, PK)      |
| username (str)     |
| email (str)        |
| created_at         |
+---------+----------+
          |
    +-----+---------------------------------------+
    |                                             |
    v                                             v
+-------------------------+             +-------------------------+
|      Conversations      |             |         Memories        |
+-------------------------+             +-------------------------+
| id (UUID, PK)           |             | id (UUID, PK)           |
| user_id (UUID, FK)      |             | user_id (UUID, FK)      |
| title (str)             |             | content (text)          |
| model (str)             |             | memory_type (str)       |
| is_pinned (bool)        |             | importance (float)      |
| created_at (timestamp)  |             | created_at (timestamp)  |
| updated_at (timestamp)  |             +-------------------------+
+------------+------------+
             |
             v
+-------------------------+             +-------------------------+
|        Messages         |             |        Documents        |
+-------------------------+             +-------------------------+
| id (UUID, PK)           |             | id (UUID, PK)           |
| conversation_id (FK)    |             | user_id (UUID, FK)      |
| role (user/assistant)   |             | filename (str)          |
| content (text)          |             | file_type (str)         |
| model (str)             |             | file_size (int)         |
| token_usage (json)      |             | status (str)            |
| citations (json)        |             | created_at (timestamp)  |
| created_at (timestamp)  |             +------------+------------+
+-------------------------+                          |
                                                     v
                                        +-------------------------+
                                        |     DocumentChunks      |
                                        +-------------------------+
                                        | id (UUID, PK)           |
                                        | document_id (UUID, FK)  |
                                        | chunk_index (int)       |
                                        | content (text)          |
                                        | embedding_id (str)      |
                                        | metadata (json)         |
                                        +-------------------------+
```

## 2. Indexes & Performance
- Index on `conversations(updated_at DESC)` for high-throughput sidebar listing.
- Index on `messages(conversation_id, created_at ASC)` for deterministic message replay.
- Index on `memories(user_id, memory_type)` for memory filtering.
- Index on `documents(user_id, status)` for knowledge library status queries.
