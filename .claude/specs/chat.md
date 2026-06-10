# Chat Interface — Contract Q&A Conversation

## Description

The chat interface lets users ask questions about an uploaded contract. The user sends a message (optionally with a contract attached), the app sends both the contract text and the question to the Azure AI agent via `/api/chat`, and the response is displayed as an assistant bubble. Every assistant response is followed by a feedback form. Conversation history is persisted in Supabase `messages` and `sessions` tables and reloaded when a session is selected. Responses are returned whole (not streamed).

---

## User Flow

1. User clicks "New chat" in the sidebar → a new session is created via POST `/api/sessions`
2. (Optional) User attaches a PDF or DOCX → file is parsed client-side, `contractText` stored in dashboard state
3. User types a question in the composer and clicks send (or presses Enter)
4. User message bubble appears immediately (optimistic)
5. Composer is disabled, `isLoading = true`; right panel step "Sending to AI…" set to `running`
6. Client POSTs `{ contractText, userMessage, sessionId }` to `/api/chat`
7. On success: assistant bubble appears; step "Response received" set to `completed`
8. `FeedbackForm` appears below the assistant bubble
9. User rates and optionally comments → feedback saved, form replaced by "Thanks for your feedback"
10. Composer re-enabled
11. User can ask follow-up questions in the same session (contract text re-sent each time)

---

## Shared Context State — CRITICAL

`contractText` must be included with every message sent to `/api/chat`. It is:

- **Owned by:** `app/dashboard/page.tsx` (the top-level client component)
- **Set by:** `onFileLoaded` callback, called from `ChatArea` after file parsing
- **Passed to:** `ChatArea` via props (to display the filename chip)
- **Sent by:** `handleSend` in dashboard page — read directly from state, not from ChatArea

When the session changes (`onSelectSession`): `contractText` is NOT cleared — the user's uploaded file persists across session switches within the same page load. The file chip remains visible.

---

## Message Rendering

All message content is plain text in v1. No markdown rendering.

**User messages:** right-aligned, capped at 75% width, accent-tinted bubble  
**Assistant messages:** left-aligned, full width (up to 680px), no bubble — text directly on background

**Timestamps:**
- Format: `HH:MM` using `toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })`
- Position: below each bubble, right-aligned for user / left-aligned for assistant
- Color: `text-caption text-an-fg-muted`
- Show full date (`Jun 10, 14:32`) for messages older than today

---

## Message Bubble Styling

**User bubble:**
```
align: right (ml-auto), max-w-[75%]
background: bg-an-accent-subtle
border: 1px solid rgba(217,119,87,0.20)
border-radius: 12px 12px 4px 12px
padding: 12px 16px
font: text-body text-an-fg-base
```

**Assistant bubble:**
```
align: left (mr-auto), max-w-full (up to 680px container)
background: none
border: none
Prefix: small coral circle dot (8px, bg-an-accent, rounded-full, mt-1, shrink-0)
font: text-body text-an-fg-base
```

---

## Components

| Component | Owns state | Props | Callbacks |
|---|---|---|---|
| `app/dashboard/page.tsx` | sessions, messages, contractText, isLoading, steps, activeSessionId | — | onNewChat, onSelectSession, onFileLoaded, onSend |
| `components/ChatArea.tsx` | none | messages, contractFileName, isLoading, userId, sessionId | onSend(msg), onFileLoaded(text, name, previewUrl, fileType) |
| `components/MessageList.tsx` | none | messages, userId, sessionId | onFeedbackSubmit |
| `components/MessageBubble.tsx` | none | role, content, createdAt | — |
| `components/FeedbackForm.tsx` | submitted (local) | userId, sessionId | onSubmit |

---

## Props

### `ChatArea`
```ts
{
  messages: Message[]
  contractFileName: string
  isLoading: boolean
  userId: string
  sessionId: string | null
  onSend: (message: string) => void
  onFileLoaded: (text: string, filename: string, previewUrl: string, fileType: string) => void
}
```

### `MessageList`
```ts
{
  messages: Message[]
  userId: string
  sessionId: string
  onFeedbackSubmit: (sessionId: string) => void
}
```

### `MessageBubble`
```ts
{
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
```

---

## Optimistic Updates

1. On `handleSend(userMessage)`:
   - Immediately append `{ id: 'optimistic-' + Date.now(), role: 'user', content: userMessage, createdAt: new Date().toISOString() }` to `messages` state
2. POST user message to `/api/messages` (persists to DB)
3. POST to `/api/chat` — on response:
   - Append real assistant message to `messages` state
   - POST assistant message to `/api/messages`
4. On error: remove the optimistic message, show error toast or inline error text

---

## API Route

### `POST /api/chat`
**Request body:**
```ts
{
  contractText: string    // empty string if no file attached
  userMessage: string
  sessionId: string
}
```

**Success response:**
```ts
{ content: string }       // assistant's reply text
```

**Error responses:**
```ts
{ error: 'Not connected' }   // 401 — azure_token cookie missing
{ error: 'AI error' }        // 500 — Azure run failed or timed out
```

---

## History Loading

When `onSelectSession(id)` is called:
1. **Immediately** set `messages = []` (never show stale history)
2. Set `isLoading = true`
3. GET `/api/sessions/[id]/messages`
4. Set `messages = data`, `isLoading = false`
5. On error: set `messages = []`, show error text in center panel

---

## Auto-Generated Session Titles

After the first successful AI response in a new session:
- Rename the session title to the first 55 characters of the user's message + `…` if longer
- PATCH `/api/sessions/[id]` with `{ title: newTitle }`
- Update the session in local `sessions` state immediately (optimistic)
- Only runs when the session title is still `'New session'` (default)

---

## Right Panel Steps

Steps pushed to `steps` state during a send cycle:

| Step | Trigger |
|---|---|
| "Parsing document" → `completed` | After file is parsed (set when file loads, not on send) |
| "Sending to AI…" → `running` | When POST /api/chat starts |
| "Waiting for response…" → `running` | Same — replace "Sending" step or add as next |
| "Response received" → `completed` | When response arrives |
| "Error" → `error` | If /api/chat returns non-200 |

On "New chat", clear all steps and reset to `[]`.

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| User sends without a file | `contractText = ''` sent to API; Azure agent responds to question alone |
| Empty message submitted | Button disabled (textarea empty); Enter does nothing |
| User switches session mid-request | Loading state cleared; new session messages load; previous request response ignored |
| Azure returns 401 | Show banner "Please connect your Microsoft account" in center panel |
| Azure times out (60s) | Route returns 500; client shows "AI request timed out. Please try again." |
| Very long response | Full text displayed; no truncation in the UI |
| No active session | "New chat" must be clicked first; send button disabled when `sessionId === null` |
