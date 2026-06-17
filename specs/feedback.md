# Feedback Spec

## Feature Name
Feedback Widget — Post-Response Star Rating

## Description
After every assistant message, a feedback widget appears inline below the message bubble. The user can rate the response 1–5 stars and optionally add a free-text comment. The rating is saved to the Supabase `feedback` table. The widget auto-dismisses 1.5 seconds after submission. Feedback data is used for monitoring AI quality (avg rating shown in the dashboard KPI cards).

---

## User Flow

1. AI response appears in the chat
2. `pendingFeedbackMessageId` is set in `DashboardPage` to the new assistant message's ID
3. `MessageList` renders `<FeedbackWidget>` below the matching assistant message
4. User hovers over stars — they fill in accent color on hover
5. User clicks a star — rating is set; comment textarea appears
6. User optionally types a comment
7. User clicks [Submit] — `POST /api/feedback` is called
8. On success: widget shows "Thanks for your feedback." for 1.5s, then dismisses
9. `onDismiss()` is called → `pendingFeedbackMessageId` cleared in `DashboardPage`
10. Widget unmounts
11. User can click [Skip] at any time → immediate dismiss, no data saved

---

## Component: `components/FeedbackWidget.tsx`

**Props:**
```ts
{
  userId: string
  sessionId: string
  messageId: string
  onDismiss: () => void
}
```

**Internal state:**
```ts
rating: number          // 0 = not selected, 1-5 = selected
hoverRating: number     // 0 = no hover
comment: string         // optional text
submitted: boolean      // true after successful POST
loading: boolean        // true while POST in flight
```

**Layout:**
```
[Indent to match assistant message]
  ┌──────────────────────────────────────┐
  │ Was this response helpful?           │
  │ ★ ★ ★ ★ ★                           │
  │ [textarea if rating > 0]             │
  │ [Submit] [Skip]                      │
  └──────────────────────────────────────┘
```

After submit:
```
[Indent]
  Thanks for your feedback.
```

**Star rendering:**
- 5 `Star` icons (Lucide), `size={16}`, `strokeWidth={1.5}`
- Filled when `n <= (hoverRating || rating)`: `style={{ color: 'var(--an-accent)', fill: 'var(--an-accent)' }}`
- Unfilled: `style={{ color: 'var(--an-fg-muted)', fill: 'transparent' }}`

**Submit handler:**
```ts
async function handleSubmit() {
  if (rating === 0 || loading) return
  setLoading(true)
  try {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId, sessionId, messageId,
        rating,
        comment: comment.trim() || undefined,
      }),
    })
    setSubmitted(true)
    setTimeout(onDismiss, 1500)
  } catch {
    // silent fail — do not block the user
    onDismiss()
  } finally {
    setLoading(false)
  }
}
```

**Skip:** Calls `onDismiss()` immediately — no API call, no error state.

---

## Component Integration: `components/MessageList.tsx`

`MessageList` receives `pendingFeedbackMessageId` and `onFeedbackDismiss` as props.

After each assistant `MessageBubble`, check:
```tsx
{msg.role === 'assistant' && msg.id === pendingFeedbackMessageId && (
  <FeedbackWidget
    userId={userId}
    sessionId={activeSessionId}
    messageId={msg.id}
    onDismiss={onFeedbackDismiss}
  />
)}
```

Only the **most recent** assistant message shows the feedback widget (controlled by `pendingFeedbackMessageId`). Past messages do not show it — no "rate this old message" retroactively.

---

## API Route: `POST /api/feedback`

**File:** `app/api/feedback/route.ts`

**Request body:**
```ts
{
  userId: string
  sessionId: string
  messageId: string
  rating: number          // integer 1-5
  comment?: string        // optional
}
```

**Validation:**
- `userId`, `sessionId`, `messageId`, `rating` all required — `400` if missing
- `rating` must be integer 1–5 — `400` if out of range

**DB operation:** `createFeedback(userId, sessionId, rating, comment)` — inserts into `feedback` table

**Response:**

| Status | Body | Condition |
|---|---|---|
| 201 | `{ feedback: { id, ... } }` | Success |
| 400 | `{ error: "Missing required fields." }` | Required field absent |
| 400 | `{ error: "Rating must be 1–5." }` | Invalid rating value |
| 500 | `{ error: "Could not save feedback." }` | DB error |

---

## DB Schema

Table: `feedback` (see `specs/database.md`)

| Column | Notes |
|---|---|
| `id` | UUID PK |
| `user_id` | FK → users.id |
| `session_id` | FK → sessions.id |
| `rating` | INTEGER 1–5 |
| `comment` | TEXT nullable |
| `created_at` | TIMESTAMPTZ |

Note: `message_id` is not stored in the MVP `feedback` table schema. The widget is triggered by message ID but the feedback row links only to `session_id`. This is sufficient for MVP quality monitoring. If per-message feedback retrieval is needed in v1.1, add `message_id UUID FK → messages.id` column.

---

## Design

- Container: `bg-an-bg-surface border border-an-border rounded-lg p-3`
- Indented to align with assistant message text (same `pl-7` as assistant bubble indent)
- Entrance animation: `an-fade-in` CSS class
- Star buttons: no border, `cursor-pointer`, gap-1 between stars
- Comment textarea: `resize-none`, `h-16`, `text-[12px]`, `bg-an-bg-elevated border border-an-border rounded p-2`
- Submit button: `h-7 px-3 bg-an-accent text-white rounded text-[12px]`, disabled when `rating === 0` or `loading`
- Skip button: `h-7 px-3 border border-an-border text-an-fg-subtle rounded text-[12px] hover:text-an-fg-base`
- Submitted state: `text-[12px] text-an-fg-subtle` — "Thanks for your feedback."

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| User clicks Submit without selecting a star | Submit button is disabled (`rating === 0`); no action |
| User clicks Skip | `onDismiss()` called; no API call; widget removed |
| API call fails | Silent fail; `onDismiss()` called; widget removed; no crash |
| User switches sessions before submitting | `pendingFeedbackMessageId` cleared on session switch → widget disappears |
| Rating submitted twice for same message | Not prevented in MVP (no unique constraint on `session_id + message_id`); duplicate rows may appear in feedback table |
| Widget appears mid-scroll | Auto-scroll in `MessageList` scrolls to bottom after each new message → widget is visible |
