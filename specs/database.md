# Database Spec

## Feature Name
Supabase PostgreSQL Schema — Users, Sessions, Messages, Feedback

## Description
The app uses Supabase (PostgreSQL) as its database. All tables use UUIDs as primary keys. Authentication is custom — no Supabase Auth. Passwords are hashed with bcryptjs (10 rounds) and stored in the `users` table. Session state, chat history, and feedback ratings are all persisted in Supabase. Document file content is never stored — it is parsed client-side and sent only in API request payloads.

---

## Tables

### `users`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, `gen_random_uuid()` | Auto-generated |
| email | TEXT | NOT NULL, UNIQUE | Login identifier |
| password_hash | TEXT | NOT NULL | bcryptjs 10 rounds |
| created_at | TIMESTAMPTZ | NOT NULL, default `now()` | — |

### `sessions`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, `gen_random_uuid()` | Auto-generated |
| user_id | UUID | NOT NULL, FK → users.id CASCADE DELETE | Owner |
| title | TEXT | NOT NULL, default `'New conversation'` | First 55 chars of first user message |
| status | TEXT | NOT NULL, default `'idle'`, CHECK IN (`idle`,`processing`,`completed`,`error`) | Updated by chat API route |
| pinned | BOOLEAN | NOT NULL, default `false` | User-controlled via sidebar |
| created_at | TIMESTAMPTZ | NOT NULL, default `now()` | — |
| updated_at | TIMESTAMPTZ | NOT NULL, default `now()` | Auto-updated via trigger on every message |

### `messages`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, `gen_random_uuid()` | Auto-generated |
| session_id | UUID | NOT NULL, FK → sessions.id CASCADE DELETE | Parent session |
| role | TEXT | NOT NULL, CHECK IN (`user`,`assistant`) | Sender type |
| content | TEXT | NOT NULL | Full message text |
| created_at | TIMESTAMPTZ | NOT NULL, default `now()` | — |

### `feedback`
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | UUID | PK, `gen_random_uuid()` | Auto-generated |
| user_id | UUID | NOT NULL, FK → users.id CASCADE DELETE | Who rated |
| session_id | UUID | NOT NULL, FK → sessions.id CASCADE DELETE | Which session |
| rating | INTEGER | NOT NULL, CHECK BETWEEN 1 AND 5 | Star rating |
| comment | TEXT | nullable | Optional free-text |
| created_at | TIMESTAMPTZ | NOT NULL, default `now()` | — |

---

## Complete SQL

```sql
create extension if not exists "pgcrypto";

-- Users
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- Sessions
create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  title      text not null default 'New conversation',
  status     text not null default 'idle'
             check (status in ('idle','processing','completed','error')),
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sessions_user_id_updated_at on sessions(user_id, updated_at desc);

create or replace function update_sessions_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger sessions_updated_at_trigger
before update on sessions
for each row execute procedure update_sessions_updated_at();

-- Messages
create table if not exists messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_session_id_created_at on messages(session_id, created_at asc);

-- Feedback
create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now()
);
create index if not exists feedback_user_id on feedback(user_id);
```

---

## Indexes
- `sessions_user_id_updated_at` on `sessions(user_id, updated_at desc)` — used by `getSessions()` (most recent first per user)
- `messages_session_id_created_at` on `messages(session_id, created_at asc)` — used by `getMessages()` (chronological)
- `feedback_user_id` on `feedback(user_id)` — used by KPI avg rating query

## Triggers
- `sessions_updated_at_trigger` — `BEFORE UPDATE` on `sessions`, sets `updated_at = now()` automatically

## Cascade Deletes
- Deleting a `user` cascades to `sessions`, which cascades to `messages` and `feedback`
- Deleting a `session` cascades to `messages` and `feedback`

## Important Notes
- No Supabase Row-Level Security (RLS) configured for MVP; enforce in v1.0 before public launch
- Document content is never stored — only sent transiently in `/api/chat` request body
- `sessions.updated_at` is updated by the `createMessage` DB helper (in addition to the trigger) to ensure sidebar sort order reflects latest message time
