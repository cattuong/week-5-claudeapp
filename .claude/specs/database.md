# Database — LegalGraph Schema

## Description

Database provider: **Supabase** (PostgreSQL). Authentication is custom — do not use Supabase Auth or the `auth.users` table. All tables are created manually via the Supabase SQL editor. The Supabase JS client is initialized in `lib/supabase.ts` and consumed by helper functions in `lib/db.ts`. API routes call `lib/db.ts` functions only — they never import the supabase client directly.

---

## Tables

### `users`
Stores registered users. Passwords are stored as bcrypt hashes.

```sql
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);
```

### `sessions`
Each session is one contract review conversation. A user can have many sessions.

```sql
create table sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade not null,
  title      text not null,
  created_at timestamptz default now()
);
```

### `messages`
Stores every message in a session (both user and assistant turns).

```sql
create table messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz default now()
);
```

### `feedback`
One feedback record per assistant message. Rating is 1–5 stars.

```sql
create table feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade not null,
  session_id uuid references sessions(id) on delete cascade not null,
  rating     int not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now()
);
```

---

## Environment Variables

| Variable | Value | Where to find it | Required |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kyytadcbulkclwotqztl.supabase.co` | Supabase dashboard → Project Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase dashboard → Project Settings → API → Project API keys → `anon public` | Yes |

Both must be set in `.env` before running `npm run dev`.

---

## Client Initialization

`lib/supabase.ts` creates and exports a single shared client:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

`lib/db.ts` imports `supabase` from `lib/supabase.ts` and exposes typed helper functions. API routes import from `lib/db.ts` only — never from `lib/supabase.ts` directly.

Do NOT initialize the client inside each helper function — use the shared export.

---

## Helper Functions

All functions in `lib/db.ts`:

| Function | Parameters | Returns | Table |
|---|---|---|---|
| `getUser(email)` | `email: string` | `User \| null` | `users` |
| `createUser(email, passwordHash)` | `email: string, passwordHash: string` | `User` | `users` |
| `createSession(userId, title)` | `userId: string, title: string` | `Session` | `sessions` |
| `getSessions(userId)` | `userId: string` | `Session[]` | `sessions` |
| `createMessage(sessionId, role, content)` | `sessionId: string, role: string, content: string` | `Message` | `messages` |
| `getMessages(sessionId)` | `sessionId: string` | `Message[]` | `messages` |
| `createFeedback(userId, sessionId, rating, comment)` | `userId: string, sessionId: string, rating: number, comment: string` | `Feedback` | `feedback` |

Each function throws on Supabase error (`.error` truthy). API routes catch and convert to HTTP error responses.

Return types are plain objects matching the table row shape:
- `User`: `{ id, email, password_hash, created_at }`
- `Session`: `{ id, user_id, title, created_at }`
- `Message`: `{ id, session_id, role, content, created_at }`
- `Feedback`: `{ id, user_id, session_id, rating, comment, created_at }`

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| `createUser` with duplicate email | Supabase throws unique constraint error; `signup` route catches and returns 409 |
| `getUser` with unknown email | Returns `null` (use `.maybeSingle()` not `.single()`) |
| Parent record deleted | `on delete cascade` removes all child rows automatically |
| Env vars missing | `createClient` called with `undefined!` — throws at runtime; set both vars in `.env` before starting |
| Supabase query error | Function throws; calling route catches, logs, returns 500 |
