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
