# Chat Spec

## Feature Name
Chat Interface — Document Q&A Conversation

## Description
The chat interface is the core product experience. Users upload a PDF or DOCX contract, ask natural-language questions, and receive AI-generated answers from an Azure AI Agent. Each question–answer pair is saved in Supabase. The interface is a three-panel layout: sidebar (session history), center (conversation), right panel (document preview + execution steps). Responses are returned as a complete message (no streaming in MVP).

---

## User Flow

1. User clicks "New Chat" (sidebar or home view) → new session created in Supabase → chat view switches on
2. User optionally uploads a PDF or DOCX (paperclip button in composer) → file parsed client-side
3. User types a question in the composer → hits Enter or Send button
4. Optimistic user message appears immediately
5. User message saved to Supabase `messages` table
6. If first message in session: session title auto-generated (first 55 chars) and PATCHed to DB
7. Right panel execution steps animate: Parsing → Sending → Waiting → Processing → Completed
8. `POST /api/chat` called with `{ contractText, userMessage, sessionId }`
9. Server calls Azure AI Agent thread API, polls until complete
10. AI response returned and saved to `messages` table
11. Response appears in chat
12. Feedback widget appears below the assistant message
13. User submits star rating (optional comment) → `POST /api/feedback`
14. "Thanks for your feedback" replaces the widget

Reopen flow:
1. User clicks a past session in the sidebar
2. Messages cleared immediately (no stale flash)
3. `getMessages(sessionId)` fetches full history
4. All messages render
5. User can continue conversation immediately

---

## Shared Context State — CRITICAL

Document content must be available when the user sends a message. It lives in `app/dashboard/page.tsx`:

| State | Type | Owner | Notes |
|---|---|---|---|
| `contractText` | `string` | `DashboardPage` | Full parsed text, sent to Azure with every message |
| `filename` | `string` | `DashboardPage` | Shown in file chip; passed to right panel |
| `previewUrl` | `string` | `DashboardPage` | Blob URL for PDF iframe; passed to right panel |
| `fileType` | `string` | `DashboardPage` | MIME type; controls preview mode |
| `docxText` | `string` | `DashboardPage` | First 4000 chars of DOCX for right panel text preview |

`FileUpload` component owns nothing — it fires `onFileLoaded(text, name, url, type)` and the parent stores everything.

When a new session is selected: `contractText`, `filename`, `previewUrl`, `fileType`, `docxText` are all cleared (document is not reloaded from a past session — user must re-attach if needed).

---

## Message Rendering

### User messages
- Alignment: right (`flex justify-end`)
- Max-width: 75%
- Background: `var(--an-accent-subtle)` = `rgba(217,119,87,0.15)`
- Border: `1px solid rgba(217,119,87,0.20)`
- Border-radius: `12px 12px 4px 12px`
- Padding: `px-4 py-3`
- Font: 14px, `text-an-fg-base`

### Assistant messages
- Alignment: left (`flex items-start gap-3`)
- No bubble background
- Prefix: 16px coral dot (`w-4 h-4 rounded-full bg-an-accent flex-shrink-0 mt-1`)
- Text: 14px, `text-an-fg-base`, `whitespace-pre-wrap`
- Full max-width within 680px column

### Timestamps
- Below each bubble: `text-[11px] text-an-fg-muted`
- Format:
  - Same day: `HH:MM` (e.g. "14:32")
  - Previous days: `MMM D, HH:MM` (e.g. "Jun 10, 14:32")

### Loading indicator
- Shown while `isLoading === true`
- Three bouncing dots: `w-1.5 h-1.5 rounded-full bg-an-fg-muted animate-bounce` with staggered delay (0ms, 150ms, 300ms)
- Prefixed by coral dot (same as assistant prefix)

---

## Execution Steps (Right Panel)

The `executionSteps` state drives the right panel's step trace. Managed in `DashboardPage.handleSend()`:

| Step # | Label | Transition timing |
|---|---|---|
| 1 | Parsing document | Set to `done` immediately (parsing already complete before send) |
| 2 | Sending to Azure | Set to `active` before fetch starts |
| 3 | Waiting for response | Set to `active` after fetch begins |
| 4 | Processing result | Set to `active` after response received |
| 5 | Completed | Set to `done` after message saved |

On error: the currently `active` step is set to `error`.
After response, all previous steps are set to `done`.
Steps are cleared (empty array) when no request is in flight (panel reverts to preview or checklist).

Step icon mapping:
- `pending` → `Circle` muted
- `active` → `Loader2` animate-spin, accent color
- `done` → `CheckCircle2` success color
- `error` → `XCircle` error color

---

## Conversation History

- Every user message is saved to Supabase BEFORE the `/api/chat` request (auto-save on send)
- Every assistant response is saved after the Azure response returns
- On session select: call `getMessages(sessionId)` to fetch full history in ascending `created_at` order
- Messages cleared immediately when a new session is selected (before fetch resolves)
- Session `updated_at` is updated whenever a message is created (via `createMessage()` helper)

---

## API Route

### `POST /api/chat`

**Request body:**
```ts
{
  contractText: string    // full parsed document text (can be empty string if no file)
  userMessage: string     // user's question
  sessionId: string       // active session UUID
}
```

**Server flow:**
1. Read `azure_token` from HTTP-only cookie — return `401` if missing
2. Update session status to `processing` in Supabase
3. `POST {AZURE_AGENT_ENDPOINT_URL}/threads?api-version=2025-05-01` — create thread
4. `POST /threads/{id}/messages` — add combined message: `"Document content:\n\n{contractText}\n\nUser question: {userMessage}"`
5. `POST /threads/{id}/runs` with `assistant_id: AZURE_AGENT_ID` — start run
6. Poll `GET /threads/{id}/runs/{runId}` every 1s until `status === 'completed'` or `'failed'`
7. `GET /threads/{id}/messages` — retrieve assistant reply
8. Update session status to `completed`
9. Return `{ content: string, sessionId: string }`

**Error responses:**
| Status | Body | Condition |
|---|---|---|
| 401 | `{ error: "Not connected" }` | No azure_token cookie |
| 400 | `{ error: "Message is required." }` | Empty userMessage |
| 500 | `{ error: "..." }` | Azure call failed or run status is 'failed' |

On `401`: client redirects to `/api/auth/microsoft`.

**API version:** Always `2025-05-01`. Other versions return `BadRequest`.

---

## Auto-Generated Session Titles

- Triggered on first user message if `session.title === 'New conversation'`
- Title = `userMessage.slice(0, 55) + (userMessage.length > 55 ? '…' : '')`
- Applied optimistically to local `sessions` state
- Persisted via `PATCH /api/sessions/{id}` with `{ action: 'rename', title }`

---

## Components

| Component | File | Responsibility | Key props |
|---|---|---|---|
| ChatArea | `components/ChatArea.tsx` | Composer, file attachment trigger, message list | `messages`, `isLoading`, `onSend`, `onFileLoaded`, `filename`, `activeSessionId`, `isConnected`, `userId`, `pendingFeedbackMessageId`, `onFeedbackDismiss` |
| MessageList | `components/MessageList.tsx` | Scrollable message list, auto-scroll, feedback widget placement | `messages`, `isLoading`, `userId`, `activeSessionId`, `pendingFeedbackMessageId`, `onFeedbackDismiss` |
| MessageBubble | `components/MessageBubble.tsx` | Single message render | `message: Message` |
| FeedbackWidget | `components/FeedbackWidget.tsx` | Star rating + comment form | `messageId`, `sessionId`, `userId`, `onDismiss` |
| FileUpload | `components/FileUpload.tsx` | Hidden input, PDF/DOCX parsing | `inputRef`, `onFileLoaded` |

---

## Optimistic Updates

- On send: user message added immediately with `id: 'optimistic-{timestamp}'`
- On success: optimistic message replaced with the Supabase-persisted message (swap by ID)
- On failure: optimistic message removed; error state (not yet surfaced in UI — silent in MVP)

---

## Edge Cases

| Scenario | Behavior |
|---|---|
| No document attached | `contractText = ''`; question sent without document context; Azure responds from training data only |
| User switches sessions during a request | Request continues in background; response arrives after session switch (may save to wrong session in edge case — acceptable in MVP) |
| Azure 401 (token expired) | Client redirected to `/api/auth/microsoft` to reconnect |
| Azure run fails | Session status set to `error`; last execution step shows `XCircle` |
| Empty message submitted | Send button disabled when `input.trim() === ''` |
| Very long response | Rendered fully; no truncation; list auto-scrolls to bottom |
| No active session when send called | Guard: `if (!activeSessionId) return` |
| Message list empty | "Upload a document and ask a question to get started." centered placeholder |
