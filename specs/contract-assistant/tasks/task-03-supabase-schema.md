# Task 03: Supabase Schema

## Status

complete

## Wave

1

## Description

Create the Supabase PostgreSQL migration SQL that defines the two core tables — `chat_sessions` and `messages` — along with Row Level Security (RLS) policies that ensure users can only access their own data. This task produces a single SQL file. Running it is a manual step (see `action-required.md`). The schema is the ground truth for all subsequent tasks that interact with the database.

## Dependencies

**Depends on:** None (Wave 1)
**Blocks:** task-04-supabase-client-auth, task-06-edge-function

**Context from dependencies:** None — this is a Wave 1 foundation task.

## Files to Create

- `supabase/migrations/001_initial_schema.sql` — full schema with tables, indexes, RLS policies, and triggers

## Technical Details

### Schema Design

**`chat_sessions` table** — one row per user conversation. Stores the contract text (extracted once per session) and the Azure AI thread ID (created once per session).

**`messages` table** — one row per message exchanged. Stores role (`user` or `assistant`), content text, and a reference to the session. RLS is applied via a subquery join to `chat_sessions` to avoid duplicating `user_id` on the messages table.

### Implementation Steps

1. Create the directory: `supabase/migrations/`

2. Create `supabase/migrations/001_initial_schema.sql` with this exact SQL:

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- chat_sessions
-- ============================================================
create table public.chat_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  title            text not null default 'New chat',
  contract_text    text,
  azure_thread_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger chat_sessions_updated_at
  before update on public.chat_sessions
  for each row execute function public.set_updated_at();

-- Index for sidebar session list (ordered by updated_at desc)
create index idx_chat_sessions_user_updated
  on public.chat_sessions(user_id, updated_at desc);

-- ============================================================
-- messages
-- ============================================================
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now()
);

-- Index for loading message history in order
create index idx_messages_session_created
  on public.messages(session_id, created_at asc);

-- ============================================================
-- Row Level Security
-- ============================================================

-- chat_sessions: users see only their own rows
alter table public.chat_sessions enable row level security;

create policy "users_own_sessions"
  on public.chat_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- messages: users see only messages in their own sessions
alter table public.messages enable row level security;

create policy "users_own_messages"
  on public.messages
  for all
  using (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  )
  with check (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  );
```

### Running the Migration

**Option A — Supabase CLI (preferred):**
```bash
supabase db push
```

**Option B — Supabase Dashboard:**
1. Open your Supabase project → SQL Editor
2. Paste the full SQL file contents
3. Click "Run"

## Acceptance Criteria

- [ ] `supabase/migrations/001_initial_schema.sql` exists and is valid SQL
- [ ] After running the migration, both `chat_sessions` and `messages` tables exist in the `public` schema
- [ ] RLS is enabled on both tables
- [ ] Attempting to query `chat_sessions` as an unauthenticated request returns zero rows (not an error)
- [ ] The `updated_at` trigger fires on UPDATE to `chat_sessions`
- [ ] Indexes on `(user_id, updated_at desc)` and `(session_id, created_at asc)` exist

## Notes

- `messages` does NOT have a `user_id` column — user isolation is enforced via the subquery join to `chat_sessions`. This avoids data duplication and keeps inserts simpler.
- The Edge Function (task-06) uses the Supabase **service role** key to bypass RLS when inserting messages server-side (so it can write both user and assistant messages). The service role key is never exposed to the frontend.
- `contract_text` is nullable — a session can exist before a contract is uploaded.
- `azure_thread_id` is nullable — it is set when the first message is sent (the Edge Function creates the Azure thread on first send).
