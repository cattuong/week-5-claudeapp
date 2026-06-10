# Dashboard Layout — App Shell

## Description

The dashboard is the primary app shell. It has three fixed panels side-by-side: a left sidebar (256px) showing session history and navigation, a center flex-1 area showing the active chat, and a right panel (304px) showing execution steps and document preview. The layout fills the full viewport height with no scroll on the shell itself — each panel scrolls independently.

---

## Layout

```
┌──────────────┬─────────────────────────┬─────────────────┐
│  Sidebar     │  Chat Area (flex-1)      │  Right Panel    │
│  256px       │                          │  304px          │
│  bg-subtle   │  bg-base                 │  bg-subtle      │
│              │  max-w-[680px] centered  │                 │
│  New chat    │  MessageList             │  Execution steps│
│  Sessions    │  ─────────────           │  Document prev. │
│  ──────────  │  Composer (pinned btm)   │                 │
│  User/Logout │                          │                 │
└──────────────┴─────────────────────────┴─────────────────┘
```

| Zone | Width | Background | Border |
|---|---|---|---|
| Sidebar | 256px fixed | `bg-an-bg-subtle` | `border-r border-an-border` |
| Center | `flex-1` | `bg-an-bg-base` | none |
| Right panel | 304px fixed | `bg-an-bg-subtle` | `border-l border-an-border` |

---

## State Architecture

All shared state lives in `app/dashboard/page.tsx` (the client component):

| State | Type | Why at top level |
|---|---|---|
| `userId` | `string` | Needed by all routes and feedback |
| `userEmail` | `string` | Displayed in sidebar footer |
| `sessions` | `Session[]` | Sidebar renders list; page manages mutations |
| `activeSessionId` | `string \| null` | Sidebar highlights active; chat loads messages for it |
| `messages` | `Message[]` | Passed to MessageList |
| `contractText` | `string` | Sent to `/api/chat` with every message |
| `contractFileName` | `string` | Displayed in file chip + right panel header |
| `contractPreview` | `{ url: string; type: string; filename: string } \| null` | Passed to right panel for iframe / text preview |
| `isLoading` | `boolean` | Composer disabled state + loading indicator |
| `steps` | `Step[]` | Drives RightPanel execution steps list |

Key callbacks passed down as props:

| Callback | Signature | What it does |
|---|---|---|
| `onNewChat` | `() => void` | POST `/api/sessions`, prepend to sessions, clear messages, set activeSessionId |
| `onSelectSession` | `(id: string) => void` | Set activeSessionId, fetch messages from `/api/sessions/[id]/messages` |
| `onFileLoaded` | `(text, filename, previewUrl, fileType) => void` | Update contractText, contractFileName, contractPreview in state |
| `onSend` | `(userMessage: string) => void` | Optimistically add user message, POST `/api/chat`, add assistant message |
| `onFeedbackSubmit` | `(sessionId: string) => void` | No state change needed — feedback component self-hides |

---

## Home / Default View

When `activeSessionId` is `null`:
- Center panel shows an empty state: "Start a new conversation" heading + "New chat" button
- Right panel shows execution steps section only (empty/waiting state)

---

## Sidebar (`components/Sidebar.tsx`)

Props:
```ts
{
  userId: string
  userEmail: string
  sessions: Session[]
  activeSessionId: string | null
  onNewChat: () => void
  onSelectSession: (id: string) => void
}
```

Layout (flex-col, h-full):

**Top section** (p-4, border-b):
- "LegalGraph" label — `text-body font-medium text-an-fg-base`
- "New chat" button — full width, coral accent, `Plus` icon (16px), `h-9`

**Middle section** (flex-1, overflow-y-auto, py-2):
- Session list — each item:
  - Height 36px, px-3, rounded-md
  - Title: `text-body-sm text-an-fg-subtle` truncated to 1 line
  - Date: `text-caption text-an-fg-muted` right-aligned (e.g. `Jun 10`)
  - Hover: `bg-an-bg-surface text-an-fg-base`
  - Active: `bg-an-bg-elevated text-an-fg-base`
  - Click → `onSelectSession(session.id)`

**Bottom section** (p-4, border-t, mt-auto):
- User email — `text-body-sm text-an-fg-subtle` truncated
- "Log out" ghost button → `localStorage.clear()`, `router.push('/login')`

**Search:** not included in v1.

**Session item actions (v1):** single click to select only. Rename/delete/pin deferred to v2.

---

## Right Panel (`components/RightPanel.tsx`)

Props:
```ts
{
  steps: { label: string; status: 'pending' | 'running' | 'completed' | 'error' }[]
  contractPreview: { url: string; type: string; filename: string } | null
  contractText?: string
}
```

Layout (flex-col, h-full, p-6, gap-6, overflow-y-auto):

**Execution steps section:**
- Heading "Execution steps" — `text-title text-an-fg-base`
- Each step: flex row, gap-2
  - `completed` → `Check` icon (16px, `text-an-success`)
  - `running` → `Loader2` icon (16px, `text-an-accent`, `animate-spin`)
  - `pending` → `Circle` icon (16px, `text-an-fg-muted`)
  - `error` → `X` icon (16px, `text-an-error`)
  - Label: `text-body-sm text-an-fg-subtle`
- When no steps: show "Waiting for activity…" in `text-caption text-an-fg-muted`

**Document preview section** (shown when `contractPreview` is not null):
- Section heading: filename in `text-body-sm text-an-fg-subtle` truncated
- PDF (`application/pdf`): `<iframe src={contractPreview.url} className="w-full h-56 rounded-md border border-an-border" />`
- DOCX: `<pre className="text-mono text-an-fg-subtle overflow-y-auto max-h-56 whitespace-pre-wrap">{contractText?.slice(0, 4000)}{contractText && contractText.length > 4000 ? '\n… (preview truncated)' : ''}</pre>`

---

## Center Panel Switching

| Condition | Component rendered |
|---|---|
| `activeSessionId === null` | Empty state — centered prompt + "New chat" CTA |
| `activeSessionId !== null` | `<ChatArea />` with messages, composer, file attach |

When switching sessions: immediately clear `messages` state, then fetch new messages. Never show stale messages from a previous session.

---

## Azure Connect Banner

Displayed at the top of the center panel (above the chat area) when the user is not connected to Azure:
- Fetched on mount via `GET /api/auth/status` → `{ connected: boolean }`
- If `connected: false`: show dismissable yellow/warning banner
  - Text: "Connect your Microsoft account to enable AI contract analysis"
  - "Connect" button → navigates to `/api/auth/microsoft`
  - Dismiss (×) hides banner for the session (no persistence needed)
- If `connected: true`: no banner

---

## Components

| Component | Path | Responsibility |
|---|---|---|
| Dashboard page | `app/dashboard/page.tsx` | All shared state, callbacks, layout composition |
| Dashboard layout | `app/dashboard/layout.tsx` | Auth guard, 3-panel shell, imports Sidebar + RightPanel |
| Sidebar | `components/Sidebar.tsx` | Session list, new chat, logout |
| RightPanel | `components/RightPanel.tsx` | Execution steps + document preview |
| ChatArea | `components/ChatArea.tsx` | Composer, file attach, message list wrapper |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No sessions on first load | Sidebar shows empty middle section; center shows "Start a new conversation" |
| Sessions fail to load | Log error, show empty sidebar (no crash) |
| User clicks session while another is loading | Immediately clear messages, cancel in-flight request if possible, load new session |
| Active session deleted (v2) | Clear activeSessionId, show empty center panel |
| Very long session title | Truncated with CSS `truncate` (single line, ellipsis) |
| userId missing on mount | Layout redirects to `/login` before rendering any children |
