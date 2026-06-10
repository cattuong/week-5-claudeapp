# Feedback — Post-Response Rating

## Description

After every assistant response, a star rating form appears below the assistant bubble. The user can rate the response 1–5 stars and optionally add a comment. On submission the rating and comment are saved to the `feedback` table in Supabase. The form is replaced by a confirmation message. If the user does not rate, the form stays visible for the session (no forced dismiss).

---

## User Flow

1. Assistant message appears in the chat
2. `FeedbackForm` renders immediately below the assistant bubble
3. User clicks 1–5 stars (required)
4. User optionally types a comment (max 200 chars)
5. User clicks "Submit"
6. Client POSTs `{ userId, sessionId, rating, comment }` to `/api/feedback`
7. On success: form is replaced by "Thanks for your feedback" (`text-caption text-an-fg-muted`)
8. On error: show "Could not save feedback. Please try again." in `text-an-error`
9. One FeedbackForm per assistant message — each tracks its own submitted state independently

---

## DB Schema

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

## API Route

### `POST /api/feedback`

**Request body:**
```ts
{
  userId: string
  sessionId: string
  rating: number      // 1–5
  comment: string     // may be empty string
}
```

**Response:**

| Status | Body | Condition |
|---|---|---|
| `200` | `{ ok: true }` | Saved |
| `400` | `{ error: 'Missing required fields' }` | userId, sessionId, or rating missing |
| `500` | `{ error: 'Server error' }` | Unexpected error |

---

## Component — `FeedbackForm`

**File:** `components/FeedbackForm.tsx`

**Props:**
```ts
{
  userId: string
  sessionId: string
  onSubmit?: () => void   // optional callback — called after successful save
}
```

**Local state:**
- `rating: number` (0 = not selected)
- `comment: string`
- `submitted: boolean`
- `error: string`
- `isSubmitting: boolean`

**Rendering:**

When `submitted === false`:
```
[★ ★ ★ ★ ★]  (star icons, coral when selected, muted when not)
[Optional comment textarea, max 200 chars]
[Submit button]  — disabled when rating === 0 or isSubmitting
```

When `submitted === true`:
```
Thanks for your feedback
```

**Star interaction:**
- Render 5 `Star` icons from Lucide React (16px, stroke 1.5)
- On hover: fill stars up to hovered index (coral, `text-an-accent`)
- On click: set `rating` to clicked index (1–5)
- Selected stars: `fill-an-accent text-an-accent`
- Unselected: `text-an-fg-muted`

**Layout:**
- Container: `mt-3 pl-6` (aligns with assistant message text, below the coral dot)
- Stars: `flex gap-1 mb-2`
- Textarea: `w-full text-body-sm bg-an-bg-surface border border-an-border rounded-md p-2 text-an-fg-base placeholder:text-an-fg-muted resize-none` — 3 rows
- Submit: `mt-2 h-8 px-3 bg-an-accent hover:bg-an-accent-hover text-white text-label rounded-md transition-colors disabled:opacity-50`
- Confirmation: `text-caption text-an-fg-muted mt-2 pl-6`

---

## Integration in MessageList

`MessageList` renders a `FeedbackForm` after each assistant message:

```tsx
{message.role === 'assistant' && (
  <FeedbackForm
    userId={userId}
    sessionId={sessionId}
    key={`feedback-${message.id}`}
  />
)}
```

Each `FeedbackForm` is keyed by message ID so they maintain independent submitted state. When messages are reloaded (session switch), all forms reset to unsubmitted.

---

## Design

- Stars use `cursor-pointer` and `transition-colors duration-100`
- Comment textarea character counter: `text-caption text-an-fg-muted text-right` showing `{comment.length}/200`
- Submit button disabled + `opacity-50` when no star selected
- Error text: `text-caption text-an-error mt-1`
- The form is visually lightweight — it should not draw attention away from the conversation

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| User submits without selecting a star | Submit button stays disabled — client prevents submission |
| User submits, API returns error | Show error text, form stays visible, user can retry |
| User does not submit feedback | Form stays visible; no automatic dismiss or timeout |
| Session switches | All FeedbackForms reset (unmounted and remounted with new messages) |
| Comment exceeds 200 chars | `maxLength={200}` on textarea prevents over-entry |
| Multiple feedbacks on same session | Each is a separate row in the `feedback` table — no uniqueness constraint per session |
