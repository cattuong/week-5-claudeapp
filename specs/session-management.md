# Session Management Spec

## Feature Name
Session Management — Sidebar Search, Filter, Pin, Rename, Delete

## Description
The left sidebar provides full management of chat sessions. Users can search by title, filter by status or pinned state, pin/unpin sessions, rename sessions inline, and delete sessions with a confirmation dialog. All mutations are applied optimistically to local state and persisted via PATCH/DELETE API routes. Sessions are sorted: pinned first, then by `updated_at` descending within each group.

---

## User Flow

### Search
1. User types in the search input above the session list
2. Session list filters in real-time (case-insensitive title match)
3. Search composes with the active filter tab

### Filter Tabs
1. User clicks a tab: `All | Pinned | Recent | Processing | Completed | Error`
2. Session list updates immediately
3. Search and filter both apply simultaneously

### Pin / Unpin
1. User hovers a session row → context action icons appear
2. User clicks the Pin icon → `session.pinned` toggled optimistically in local state
3. `PATCH /api/sessions/[id]` called with `{ action: 'pin', pinned: true/false }`
4. Pinned sessions float to the top of the list
5. Pinned section shows a "Pinned" divider label above pinned items

### Rename
1. User hovers a session row → Pencil icon appears
2. User clicks Pencil → title replaced with `<input autoFocus>` showing current title
3. User edits the title
4. Confirms with `Enter` or `blur` → if non-empty: optimistic update + `PATCH { action: 'rename', title }`
5. Cancels with `Escape` → input dismissed, original title restored

### Delete
1. User hovers a session row → Trash icon appears
2. User clicks Trash → `<ConfirmDialog>` appears
3. Dialog: "Delete this conversation? This cannot be undone." + [Cancel] [Delete]
4. [Cancel] → dialog closes, nothing changes
5. [Delete] → session removed from local state immediately; `DELETE /api/sessions/[id]` called
6. If deleted session was active: `activeSessionId` cleared, view switches to home

---

## Component: `components/Sidebar.tsx`

**Props:**
```ts
{
  sessions: Session[]
  activeSessionId: string | null
  onNewChat: () => void
  onSelectSession: (id: string) => void
  onGoHome: () => void
  onLogout: () => void
  onRenameSession: (id: string, title: string) => void
  onPinSession: (id: string, pinned: boolean) => void
  onDeleteSession: (id: string) => void
  userId: string
}
```

**Internal state:**
```ts
search: string                                         // search input value
filter: 'all'|'pinned'|'recent'|'processing'|'completed'|'error'
renamingId: string | null                              // which session is in rename mode
renameValue: string                                    // current rename input value
deletingId: string | null                              // which session shows confirm dialog
hoveringId: string | null                              // which session row is hovered
```

**Filtering + sorting logic:**
```ts
const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
const filtered = sessions
  .filter(s => {
    if (filter === 'pinned') return s.pinned
    if (filter === 'recent') return new Date(s.updated_at).getTime() > oneWeekAgo
    if (filter === 'processing') return s.status === 'processing'
    if (filter === 'completed') return s.status === 'completed'
    if (filter === 'error') return s.status === 'error'
    return true
  })
  .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.updated_at.localeCompare(a.updated_at)
  })
```

**Layout (top to bottom):**
```
Logo / "Document AI" button → onGoHome
[New Chat] button
[Search input]
[Filter tabs row: All | Pinned | Recent | Processing | Completed | Error]
[Session list — scrollable]
  [Pinned sessions if any, preceded by "Pinned" divider]
  [Remaining sessions]
[User footer: userId prefix + Logout]
```

---

## Session Row Layout

```
[Status icon 14px]  [Title truncated]              [Updated time]
                                        (hover: [Pin] [Rename] [Delete] icons)
```

**Status icon mapping (Lucide, 14px, strokeWidth 1.5):**

| Status | Icon | Color |
|---|---|---|
| `idle` | `MessageSquare` | `text-an-fg-muted` |
| `processing` | `Loader2` | `text-an-warning`, `animate-spin` |
| `completed` | `CheckCircle` | `text-[var(--an-success)]` |
| `error` | `AlertCircle` | `text-[var(--an-error)]` |

**Hover actions (appear on `mouseEnter`, disappear on `mouseLeave`):**
- Pin icon (`Pin` / `PinOff`) — always shown when row is hovered; `PinOff` if already pinned
- Pencil icon (`Pencil`) — triggers inline rename
- Trash icon (`Trash2`) — opens confirm dialog

**Active session state:** `bg-an-bg-elevated text-an-fg-base`
**Default state:** `text-an-fg-subtle hover:bg-an-bg-surface hover:text-an-fg-base`
**Row height:** `h-9`, `px-3`, `rounded-md`

---

## Confirm Dialog Component: `components/ConfirmDialog.tsx`

```ts
type Props = {
  title: string
  message: string
  confirmLabel: string   // "Delete"
  onConfirm: () => void
  onCancel: () => void
}
```

Layout: fixed overlay (`fixed inset-0 z-50`), centered card:
```
bg-an-bg-elevated border border-an-border rounded-lg p-4 w-56 shadow-lg
  "Delete this conversation?"     (text-[13px] fg-base)
  "This cannot be undone."        (text-[12px] fg-muted)
  [Cancel]  [Delete]              (ghost + danger buttons)
```

- [Cancel]: ghost, calls `onCancel`
- [Delete]: `bg-[var(--an-error)]` tinted, `text-[var(--an-error)]`, calls `onConfirm`
- Clicking backdrop: calls `onCancel`

---

## API Routes

### `PATCH /api/sessions/[id]`

**File:** `app/api/sessions/[id]/route.ts`

| Action | Body | DB call |
|---|---|---|
| rename | `{ action: 'rename', title: string }` | `UPDATE sessions SET title = $1 WHERE id = $2` |
| pin | `{ action: 'pin', pinned: boolean }` | `UPDATE sessions SET pinned = $1 WHERE id = $2` |
| status | `{ action: 'status', status: string }` | `UPDATE sessions SET status = $1 WHERE id = $2` |

Validation:
- `rename`: title must be non-empty string, max 200 chars
- `pin`: pinned must be boolean
- `status`: must be one of `idle/processing/completed/error`

Response: `{ session: Session }` with `200`, or `{ error }` with `400/500`.

### `DELETE /api/sessions/[id]`

**File:** same route file, exported `DELETE` function

- Calls `deleteSession(id)` from `lib/db.ts`
- Returns `{ ok: true }` with `200`
- Cascades delete to `messages` and `feedback`

---

## `lib/db.ts` Functions Required

```ts
updateSessionTitle(id: string, title: string): Promise<Session>
updateSessionPin(id: string, pinned: boolean): Promise<Session>
updateSessionStatus(id: string, status: string): Promise<Session>
deleteSession(id: string): Promise<void>
```

---

## Filter Tabs Design

Row of pill buttons above the session list. All tabs visible, scrollable horizontally if overflow.

| Tab | Label | Style when active |
|---|---|---|
| `all` | All | `bg-an-accent text-white` |
| `pinned` | Pinned | same |
| `recent` | Recent | same |
| `processing` | Processing | same |
| `completed` | Completed | same |
| `error` | Error | same |

Inactive: `bg-an-bg-surface text-an-fg-subtle hover:text-an-fg-base`
Height: `h-6`, padding: `px-2`, border-radius: `rounded`, font: `text-[11px] font-medium`

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| Search returns no results | "No conversations" empty state shown |
| Filter + search both active, no results | Same empty state |
| User renames to empty string | Rename cancelled on blur; original title restored |
| Delete fails on server | Session removed from UI optimistically; error not surfaced in MVP |
| Pin fails on server | Optimistic state applied; error not surfaced in MVP |
| User deletes active session | `activeSessionId` cleared, view switches to home |
| Very long session title | Truncated with `truncate` CSS class; tooltip not required in MVP |
| 0 sessions | "No conversations yet" placeholder shown |
| Session in `processing` state on load | Spinner icon shown; user can re-select to check |
