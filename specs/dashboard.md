# Dashboard Spec

## Feature Name
Dashboard — Home View & App Shell

## Description
The dashboard is the post-login screen. It has two sub-views controlled by a `view` state in `app/dashboard/page.tsx`:

- **Home view** (`view = 'home'`): KPI card grid + recent activity feed + recent chats list. Shown on first load and after returning from chat.
- **Chat view** (`view = 'chat'`): Three-panel layout (Sidebar | ChatArea | RightPanel). Shown when a session is active.

The dashboard is the only authenticated route. Auth guard checks `localStorage.getItem('userId')` on mount; missing value redirects to `/login`.

---

## Layout

### Home View
```
┌────────────────────────────────────────────────────────┐
│  Sidebar 256px (always visible)  │  Main content flex-1 │
│                                  │  bg-an-bg-base        │
│                                  │  px-8 py-8            │
│                                  │                       │
│                                  │  "Overview" heading   │
│                                  │  KPI grid (3 col)     │
│                                  │  Activity feed        │
│                                  │  Recent chats         │
└────────────────────────────────────────────────────────┘
```

### Chat View (3-panel)
```
┌────────────────────────────────────────────────────────────────┐
│  Sidebar 256px  │  ChatArea flex-1 (680px max content)  │  RightPanel 304px  │
│  bg-an-bg-subtle│  bg-an-bg-base                        │  bg-an-bg-subtle   │
└────────────────────────────────────────────────────────────────┘
```

---

## State Architecture

All state lives in `app/dashboard/page.tsx` (root of the authenticated shell):

| State | Type | Purpose |
|---|---|---|
| `userId` | `string \| null` | From localStorage; used in all DB/API calls |
| `view` | `'home' \| 'chat'` | Controls which sub-view is rendered |
| `sessions` | `Session[]` | Full session list, used by Sidebar and home recent chats |
| `activeSessionId` | `string \| null` | Currently selected session |
| `messages` | `Message[]` | Messages for the active session |
| `contractText` | `string` | Parsed document text (sent to Azure) |
| `filename` | `string` | Displayed in file chip and right panel header |
| `previewUrl` | `string` | Blob URL for PDF iframe preview |
| `fileType` | `string` | MIME type; controls right panel preview mode |
| `docxText` | `string` | First 4000 chars of DOCX text for right panel |
| `isLoading` | `boolean` | True while awaiting Azure response |
| `executionSteps` | `ExecutionStep[]` | Drives right panel step animation |
| `isConnected` | `boolean` | Whether `azure_token` cookie is present |
| `kpi` | `KpiData \| null` | Dashboard KPI values |
| `activity` | `ActivityEvent[]` | Recent activity feed events |
| `kpiLoading` | `boolean` | Skeleton state for KPI cards |
| `pendingFeedbackMessageId` | `string \| null` | Which assistant message needs a feedback widget |

**Callbacks passed to children:**

| Callback | Passed to | Purpose |
|---|---|---|
| `handleNewChat` | Sidebar, HomeView | Create session, switch to chat view |
| `handleSelectSession(id)` | Sidebar, HomeView | Load messages, switch to chat view |
| `handleGoHome` | Sidebar | Return to home view, reload KPIs |
| `handleLogout` | Sidebar | Clear localStorage, redirect to /login |
| `handleSend(message)` | ChatArea | Send message, drive execution steps, get AI response |
| `handleFileLoaded(text, name, url, type)` | ChatArea | Store file state |
| `handleRenameSession(id, title)` | Sidebar | Optimistic rename + PATCH API |
| `handlePinSession(id, pinned)` | Sidebar | Optimistic pin + PATCH API |
| `handleDeleteSession(id)` | Sidebar | Optimistic delete + DELETE API |
| `handleFeedbackDismiss` | ChatArea → MessageList | Clear pendingFeedbackMessageId |

---

## Home View

### Component: `components/HomeView.tsx` (new)

Props: `{ kpi: KpiData | null, activity: ActivityEvent[], loading: boolean, sessions: Session[], onNewChat: () => void, onSelectSession: (id: string) => void }`

### KPI Card Grid

13 KPI cards in a 3-column CSS grid (`grid grid-cols-3 gap-4`), responsive to 2 columns below 768px:

| # | Label | Source field | Sub-label |
|---|---|---|---|
| 1 | Total sessions | `kpi.totalSessions` | "all time" |
| 2 | Active sessions | `kpi.activeSessions` | "in progress" |
| 3 | Completed | `kpi.completedSessions` | "reviews finished" |
| 4 | Errors | `kpi.errorSessions` | "failed sessions" |
| 5 | Pinned | `kpi.pinnedSessions` | "bookmarked" |
| 6 | Total messages | `kpi.totalMessages` | "sent and received" |
| 7 | Your messages | `kpi.userMessages` | "questions asked" |
| 8 | AI responses | `kpi.assistantMessages` | "answers generated" |
| 9 | Avg per session | `kpi.avgMessagesPerSession` | "messages/session" |
| 10 | Avg rating | `kpi.avgFeedbackRating?.toFixed(1) ?? '--'` | `X ratings` |
| 11 | Feedback count | `kpi.feedbackCount` | "total ratings" |
| 12 | Sessions today | `kpi.sessionsToday` | "started today" |
| 13 | Messages this week | `kpi.messagesThisWeek` | "last 7 days" |

Loading state: `animate-pulse` skeleton div (same card dimensions) while `kpiLoading === true`.
Error / null state: show `--` as the value.

### KPI Card Component: `components/KpiCard.tsx` (new)

Props: `{ label: string, value: string | number | null, sub?: string, loading?: boolean }`

Style:
- Container: `bg-an-bg-surface border border-an-border rounded-lg p-4`
- Label: `text-[11px] text-an-fg-muted uppercase tracking-wide mb-2`
- Value: `text-[24px] font-medium text-an-fg-base leading-none mb-1`
- Sub-label: `text-[12px] text-an-fg-subtle`

### Recent Activity Feed

Below KPI grid. Section heading: "Recent activity" (`text-[12px] uppercase tracking-wide text-an-fg-subtle mb-3`).

Up to 50 events, each row:
```
[Icon 14px]  [Label text]  [relative time right-aligned]
             [Session title, muted, 11px]
```

Event types and icons (Lucide, 14px, strokeWidth 1.5):

| Event type | Icon | Label format |
|---|---|---|
| `session_created` | `MessageSquare` | `Started "{{title}}"` |
| `message_sent` | `Send` | `Message sent` |
| `feedback_submitted` | `Star` | `Feedback submitted` |
| `session_completed` | `CheckCircle` | `Completed "{{title}}"` |
| `session_error` | `AlertCircle` | `Error in "{{title}}"` |

Relative time format:
- < 1 min → "just now"
- < 60 min → "Xm ago"
- < 24h → "Xh ago"
- < 48h → "yesterday"
- older → `toLocaleDateString()`

Empty state: centered `<p>` — "No activity yet."

### Recent Chats

Below activity feed. Last 5 sessions as horizontal cards:
- Title (truncated, 13px)
- Status chip (pill, 11px uppercase): idle/processing/completed/error
- Updated date (`toLocaleDateString()`)
- [Open] button → calls `onSelectSession(id)`

---

## API Routes

### `GET /api/dashboard?userId={uuid}`

Returns:
```ts
{
  kpi: {
    totalSessions: number
    activeSessions: number
    completedSessions: number
    errorSessions: number
    pinnedSessions: number
    totalMessages: number
    userMessages: number
    assistantMessages: number
    avgMessagesPerSession: number
    avgFeedbackRating: number | null
    feedbackCount: number
    sessionsToday: number
    messagesThisWeek: number
  }
  activity: ActivityEvent[]  // last 50, sorted by created_at desc
}
```

- Derives all data from `sessions`, `messages`, `feedback` tables
- No dedicated analytics table
- Called on dashboard mount and when returning to home view

### `PATCH /api/sessions/[id]`

Body variants:
- `{ action: 'rename', title: string }` → updates `sessions.title`
- `{ action: 'pin', pinned: boolean }` → updates `sessions.pinned`
- `{ action: 'status', status: string }` → updates `sessions.status` (called from chat route)

Returns: `{ session: Session }` with `200`.

### `DELETE /api/sessions/[id]`

Returns: `{ ok: true }` with `200`. Cascades to messages + feedback.

---

## Components

| Component | File | Responsibility |
|---|---|---|
| DashboardPage | `app/dashboard/page.tsx` | Root state, view routing, all handlers |
| HomeView | `components/HomeView.tsx` | KPI grid + activity feed + recent chats |
| KpiCard | `components/KpiCard.tsx` | Single metric card with skeleton |
| Sidebar | `components/Sidebar.tsx` | Session list, nav, search, filters |
| ChatArea | `components/ChatArea.tsx` | Chat interface (chat view only) |
| RightPanel | `components/RightPanel.tsx` | Preview + execution steps (chat view only) |

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No sessions yet | KPI cards show `0` or `--`; activity feed shows empty state |
| KPI API fails | Cards show `--`; no crash |
| User deletes the active session | Clear `activeSessionId`, switch to home view |
| User returns to home mid-load | Abort pending message (not implemented in MVP — navigating away leaves the request in flight) |
| Very large activity feed (>50) | Cap at 50; "Load more" link shown (v1.1) |
| Session status still `processing` on load | Sidebar shows spinner icon; user can re-select to check for completion |
