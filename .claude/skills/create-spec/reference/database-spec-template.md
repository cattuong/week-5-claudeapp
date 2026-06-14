# Database Schema

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK, `gen_random_uuid()` |
| email | TEXT | Unique |
| password_hash | TEXT | bcryptjs, 10 rounds |
| created_at | TIMESTAMPTZ | `now()` |

**`sessions`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, cascade delete |
| title | TEXT | AI-generated; first 55 chars of first user message |
| status | TEXT | `'idle'`, `'processing'`, `'completed'`, `'error'` |
| pinned | BOOLEAN | Default `false` |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | Updated on every new message |

**`messages`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK → sessions.id, cascade delete |
| role | TEXT | `'user'` or `'assistant'` |
| content | TEXT | Full message text |
| created_at | TIMESTAMPTZ | — |

**`feedback`**
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, cascade delete |
| session_id | UUID | FK → sessions.id, cascade delete |
| rating | INTEGER | 1–5 |
| comment | TEXT | Optional |
| created_at | TIMESTAMPTZ | — |
