# Legal Contract Review App — Blueprint & Implementation Plan

**Project:** AI Document Assistant (week-5-claudeapp)  
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase · Azure AI Agent  
**Status:** Scaffold complete — this plan covers remaining features to match the PRD

---

## Overview

The project scaffold is already in place (auth pages, three-panel dashboard shell, chat API route, file parsing). This plan covers what's missing:

- Dashboard KPI cards + activity feed (home view)
- Feedback widget (star rating + comment after every AI response)
- Full session management (pin, rename, delete, search, filter)
- Right panel execution steps + DOCX text preview
- Missing API routes (sessions PATCH/DELETE, dashboard stats, feedback POST)
- Complete Supabase SQL schema

---

## 1. Database Schema

Run this SQL in the Supabase SQL editor before starting the app.

```sql
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Users (custom auth — no Supabase Auth)
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  created_at    timestamptz default now()
);

-- Sessions
create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  title      text not null default 'New conversation',
  status     text not null default 'idle'
             check (status in ('idle','processing','completed','error')),
  pinned     boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists sessions_user_id_updated_at on sessions(user_id, updated_at desc);

-- Auto-update updated_at trigger
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
  created_at timestamptz default now()
);
create index if not exists messages_session_id_created_at on messages(session_id, created_at asc);

-- Feedback
create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz default now()
);
create index if not exists feedback_user_id on feedback(user_id);
```

---

## 2. App Architecture

### Route / View Structure

```
/ (landing)         → links to /login and /signup
/login              → light mode auth page
/signup             → light mode auth page
/dashboard          → authenticated; two sub-views:
    view=home       → KPI cards + activity feed + recent chats
    view=chat       → 3-panel layout (sidebar | chat | right panel)
```

### Three-Panel Chat Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Sidebar 256px  │  ChatArea flex-1 (max-width 680px content) │  RightPanel 304px  │
│  bg-subtle      │  bg-base                                   │  bg-subtle         │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Files to Create

| File | Purpose |
|---|---|
| `app/api/sessions/[id]/route.ts` | PATCH (rename, pin, status) + DELETE session |
| `app/api/dashboard/route.ts` | GET KPI stats for dashboard home |
| `app/api/feedback/route.ts` | POST feedback rating + comment |
| `components/DashboardHome.tsx` | KPI card grid + activity feed + recent chats |
| `components/KpiCard.tsx` | Single KPI metric card with loading skeleton |
| `components/FeedbackWidget.tsx` | 1–5 star rating + optional comment form |
| `components/ConfirmDialog.tsx` | Modal for delete confirmation |

---

## 4. Files to Modify

| File | Changes |
|---|---|
| `app/dashboard/page.tsx` | Add `view` state (home/chat), execution steps state, route to DashboardHome |
| `components/Sidebar.tsx` | Search input, filter tabs, pin/rename/delete context menu, status icons |
| `components/RightPanel.tsx` | Execution steps view, DOCX text preview |
| `components/MessageList.tsx` | Render FeedbackWidget after each assistant message |
| `components/MessageBubble.tsx` | Add HH:MM timestamps |
| `lib/db.ts` | Add updateSession, deleteSession, getDashboardStats, getRecentActivity |

---

## 5. New API Routes

### `PATCH /api/sessions/[id]`
- Headers: `x-user-id`
- Body: `{ title?: string, pinned?: boolean, status?: string }`
- Verifies `user_id` matches before update
- Returns updated session row

### `DELETE /api/sessions/[id]`
- Headers: `x-user-id`
- Deletes session (cascades to messages + feedback)
- Returns `{ success: true }`

### `GET /api/dashboard?userId=`
- Returns:
  ```ts
  {
    totalSessions: number
    todaySessions: number
    totalMessages: number
    weekMessages: number
    activeSessions: number
    pinnedCount: number
    avgRating: number | null
    failedSessions: number
  }
  ```
- Derived from existing tables on read (no analytics table)

### `POST /api/feedback`
- Body: `{ userId, sessionId, rating, comment? }`
- Inserts into `feedback` table
- Returns `{ id }`

---

## 6. Dashboard Home View

### `components/DashboardHome.tsx`

```
Header row:  "Dashboard"  +  [New Chat] button (top-right, coral accent)

KPI Grid (3 columns, gap-4, responsive):
  Total sessions        | Sessions today       | Total messages
  Messages this week    | Active sessions      | Pinned chats
  Avg feedback rating   | Failed sessions

Recent Activity Feed (below KPIs):
  50 most recent events, each row: [icon] [label]  [relative time]
  Event types:
    - session_created  → FileText icon, "Started a new session: <title>"
    - message_sent     → MessageSquare icon, "Asked a question"
    - feedback_submitted → Star icon, "Rated a response X/5"
  "Load more" link if >50 results

Recent Chats section:
  Last 5 sessions as cards:
    title (truncated) | status chip | date | [Open] button
```

### `components/KpiCard.tsx`

Props: `{ label: string, value: string | number | null, loading: boolean }`

- While loading: render skeleton div (same height/width as the value)
- On error or null: show `--`
- Style: `bg-an-bg-surface border border-an-border rounded-lg p-4`
- Value: `text-[28px] font-medium text-an-fg-base`
- Label: `text-[12px] text-an-fg-subtle uppercase tracking-wide`

---

## 7. Sidebar Enhancements

### Search
- `<input>` above session list, placeholder "Search…"
- Client-side filter on `session.title` (case-insensitive)
- Composes with active filter tab

### Filter Tabs
```
All | Pinned | Recent | Processing | Completed | Error
```
- `All`: no filter
- `Pinned`: `session.pinned === true`
- `Recent`: `session.updated_at` within last 7 days
- `Processing / Completed / Error`: filter by `session.status`
- Active tab: `text-an-fg-base` with bottom border in accent color

### Session Context Menu
- Triggered by `…` button (visible on row hover)
- Menu items:
  - **Pin / Unpin** → `PATCH /api/sessions/[id]` `{ pinned: !current }`
  - **Rename** → replace title with inline `<input>`, confirm on Enter or blur → `PATCH { title }`
  - **Delete** → open `<ConfirmDialog>` → `DELETE /api/sessions/[id]` → remove from local state

### Status Icons (Lucide, 14px, 1.5px stroke)
| Status | Icon | Color |
|---|---|---|
| `idle` | `Circle` | `an-fg-muted` |
| `processing` | `Loader2` (spin) | `an-accent` |
| `completed` | `CheckCircle2` | `an-success` |
| `error` | `AlertCircle` | `an-error` |

### Pinned Section
- Sessions with `pinned: true` floated to top
- Visual divider "Pinned" label above pinned group

---

## 8. Right Panel — Execution Steps

### `executionSteps` prop type
```ts
type StepStatus = 'pending' | 'active' | 'done' | 'error'
type ExecutionStep = { label: string; status: StepStatus }
```

### Steps (in order)
1. Parsing document
2. Sending to Azure
3. Waiting for response
4. Processing result
5. Completed

### Step Icons
| Status | Icon | Color |
|---|---|---|
| `pending` | `Circle` | `an-fg-muted` |
| `active` | `Loader2` (animate-spin) | `an-accent` |
| `done` | `CheckCircle2` | `an-success` |
| `error` | `XCircle` | `an-error` |

### Panel state logic
- **No file, idle** → show status checklist (existing behavior)
- **Request in-flight** → show execution steps (override everything)
- **PDF loaded, idle** → show PDF iframe preview
- **DOCX loaded, idle** → show plain text preview in scrollable `<pre>`, truncated at 4000 chars with "… (preview truncated)" notice

### Driving steps from `app/dashboard/page.tsx`
```ts
// in handleSend():
setExecutionSteps([
  { label: 'Parsing document', status: 'done' },      // by the time user sends, file is already parsed
  { label: 'Sending to Azure', status: 'active' },
  { label: 'Waiting for response', status: 'pending' },
  { label: 'Processing result', status: 'pending' },
  { label: 'Completed', status: 'pending' },
])
// after fetch starts:
setExecutionSteps(s => s.map((step, i) => i === 1 ? {...step, status:'done'} : i === 2 ? {...step, status:'active'} : step))
// after response:
setExecutionSteps(s => s.map((step, i) => i <= 3 ? {...step, status:'done'} : {...step, status:'done'}))
// on error: set last active step to 'error'
```

---

## 9. Feedback Widget

### `components/FeedbackWidget.tsx`

Props:
```ts
{
  messageId: string
  sessionId: string
  userId: string
  onSubmit: (messageId: string) => void
}
```

UI:
- 5 `Star` icons (Lucide), filled on hover and selection
- Optional `<textarea>` placeholder "Optional comment…"
- [Submit feedback] button (ghost style)
- After submit: replace with `<p className="text-[12px] text-an-fg-muted">Thanks for your feedback</p>`

Flow:
1. User clicks a star → sets `rating` state
2. Optionally types a comment
3. Clicks Submit → `POST /api/feedback { userId, sessionId, rating, comment }`
4. On success: call `onSubmit(messageId)` → parent adds messageId to `submittedFeedbackIds` Set → widget unmounts

### `components/MessageList.tsx` change

```tsx
// After each assistant MessageBubble:
{msg.role === 'assistant' && !submittedFeedbackIds.has(msg.id) && (
  <FeedbackWidget
    messageId={msg.id}
    sessionId={sessionId}
    userId={userId}
    onSubmit={id => setSubmittedFeedbackIds(prev => new Set(prev).add(id))}
  />
)}
```

---

## 10. Message Timestamps

### `components/MessageBubble.tsx` change

```ts
function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
```

---

## 11. Auto-Generated Session Titles

In `app/dashboard/page.tsx` `handleSend()`:

```ts
const currentTitle = sessions.find(s => s.id === activeSessionId)?.title
if (currentTitle === 'New conversation') {
  const title = userMessage.slice(0, 55) + (userMessage.length > 55 ? '…' : '')
  // Optimistic local update:
  setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title } : s))
  // Persist:
  await fetch(`/api/sessions/${activeSessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({ title }),
  })
}
```

---

## 12. `lib/db.ts` Additions

```ts
export async function updateSession(id: string, userId: string, fields: Partial<{ title: string, pinned: boolean, status: string }>) { ... }
export async function deleteSession(id: string, userId: string) { ... }
export async function getDashboardStats(userId: string): Promise<DashboardStats> { ... }
export async function getRecentActivity(userId: string, limit = 50): Promise<ActivityEvent[]> { ... }
```

---

## 13. User Flow (End-to-End)

```
/signup → create account → /dashboard (home view)
  → See KPI cards (all -- until data)
  → Click "New Chat" → chat view (3-panel)
  → Upload PDF/DOCX → right panel shows preview
  → Type question + send → execution steps animate
  → AI response appears → feedback widget shown
  → Submit rating → "Thanks for your feedback"
  → Back to home → KPIs updated
  → Hover session → pin/rename/delete
  → Search box filters list
  → Filter tabs scope by status
  → Logout → /login
```

---

## 14. Verification Checklist

- [ ] `npm run dev` — no TypeScript errors
- [ ] Signup → redirected to dashboard
- [ ] Dashboard home shows KPI card grid and empty activity feed
- [ ] "New Chat" → chat view with 3 panels
- [ ] Upload PDF → right panel shows iframe preview
- [ ] Upload DOCX → right panel shows text preview (truncated at 4000 chars)
- [ ] Send message → execution steps animate → response arrives
- [ ] After assistant response → feedback widget appears
- [ ] Submit rating → "Thanks for your feedback"; row in Supabase `feedback` table
- [ ] Hover session → `…` menu → pin/rename/delete all work
- [ ] Rename session → persisted in Supabase
- [ ] Delete session → removed from sidebar; Supabase row deleted
- [ ] Search box filters sessions in real time
- [ ] Filter tabs correctly scope the session list
- [ ] Back to home → KPI values reflect new session/messages/feedback
- [ ] Logout → localStorage cleared → redirect to /login
