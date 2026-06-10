# Chat / Messaging Spec Template

Use this template to write the chat or messaging spec for any app after planning.
Replace all guidance text with real content from your app plan.

---

## Feature Name
Name this feature clearly. Example: "Chat Interface", "Messaging", "Conversation View", "Comment Thread".

---

## Description
Describe:
- What the interface does (who sends messages, what responds — another user, an AI, a bot, a system)
- How responses are generated (AI model, push from another user, webhook, queue)
- Whether responses stream token-by-token or are returned whole
- How conversation history is stored and reloaded across sessions

---

## User Flow
Document every step from the user's perspective:
- How a new conversation is started (button, auto-create, first message triggers creation)
- Any prerequisite step before sending (select a context, attach a file, pick a recipient)
- What happens immediately on send (optimistic message appears, loading state shows)
- How the response arrives (streamed live, single response, async notification)
- What UI appears after a response (feedback form, suggested replies, action buttons)
- How the user returns to a previous conversation (list item, link, search result)
- What "reopen" looks like: full history renders, user can continue immediately

---

## Shared Context State — CRITICAL
If data must travel with every message (e.g. a selected document, a thread ID, a chosen model):
- Document exactly what that data is (name, type)
- Which component OWNS that state (must be a parent, never the input component)
- How it flows down to the message input as props
- What happens to it when the conversation changes (cleared, preserved, or replaced)

If no shared context is needed, note that here.

---

## Message Rendering
Describe how each message type is displayed:
- **Sender's own messages**: alignment, background, border, border-radius
- **Other party's messages**: alignment, background, style (bubble vs. no bubble)
- **System messages** (if any): appearance, placement
- Whether markdown or rich text is rendered (and which library)
- Special rendering: code blocks (monospace, background), tables, links, images
- Long messages: truncate with "read more", or render fully?

**Message Timestamps**
- Whether each message shows a timestamp
- Format (e.g. `HH:MM`, relative "2m ago", or both)
- Placement (below bubble, inline, shown on hover)
- Whether to show full date for older messages

---

## Streaming Responses (if applicable)
If responses arrive token-by-token rather than all at once:

**Server side**
- Response format: Server-Sent Events (SSE), WebSocket, chunked transfer
- Frame format for content chunks (e.g. `data: "token"\n\n`)
- Final frame format to signal completion and pass any metadata (e.g. message ID)
- When the message is persisted to the database (after stream completes, not per token)

**Client side**
- How the stream is consumed (`ReadableStream` reader, EventSource, WebSocket)
- How partial content is displayed as it arrives (in a temporary bubble)
- Cursor or typing indicator shown while streaming
- What happens on connection drop (show partial content + error, offer retry)
- How the temporary streaming bubble transitions to a persisted message

**Fallback**
- If streaming is unavailable or fails, fall back to a single-response fetch

---

## Conversation History
- How all messages are persisted (which table, when saved — immediately or after confirmation)
- Auto-save behavior: when is the message saved without any manual action?
- Reopen behavior: what API call fetches history, in what order, with what limit
- Whether the user can continue after reopening without any extra step
- How errors in history loading are surfaced (inline message, retry button)

---

## Infinite Scroll / Pagination (if applicable)
For conversations that can grow very long:
- How many messages are loaded initially (e.g. last 50)
- How older messages are loaded (scroll to top triggers fetch)
- API param for pagination (e.g. `?limit=50&before={messageId}`)
- How scroll position is preserved when older messages are prepended
- Loading indicator placement and style
- Stopping condition (fewer results than the page size = no more history)

---

## Message Bubble Styling
Document the visual design for each message type:
- Sender bubble: alignment, background color token, border, border-radius (each corner)
- Other party bubble: same breakdown
- No-bubble treatment (text on plain background): describe prefix or indicator used instead
- Padding, max-width, font size and color

---

## Components

List every component this feature requires:

| Component | Responsibility | Key props |
|---|---|---|
| [MessageContainer] | Scrollable list of messages + streaming bubble | messages, streamingContent, isStreaming |
| [MessageBubble] | Single persisted message | role, content, createdAt |
| [MessageInput] | Text input, file attach, send button | onSend, isLoading, disabled |
| [FeedbackForm] | Optional rating/reaction after a message | onSubmit |

Document for each: what state it owns (if any), what callbacks it exposes.

---

## Optimistic Updates
Describe the flow for sending a message:
- When the optimistic message appears (immediately on send, before API confirms)
- What temporary ID it uses (e.g. `optimistic-{timestamp}`)
- How it is replaced once the API responds (swap by ID)
- How it is rolled back if the request fails (removed from state, error shown)
- Whether the streaming bubble is also treated as optimistic

---

## API Route

### `POST /api/[messages-endpoint]`
**Request body fields:** document each one (session/thread/conversation ID, message text, any context)
**Success response:** which fields are returned (message ID, role, content, timestamp, etc.)
**Streaming response:** document the SSE frame format if applicable
**Error response:** format and status codes

### `GET /api/[messages-endpoint]?[params]`
**Params:** conversation/thread ID, pagination cursor, limit
**Response:** array of message objects, in what order

---

## History Loading
- When messages are cleared (immediately when a new conversation is selected — prevent flash of old content)
- Which API is called and with what params
- What is shown while loading (skeleton rows, spinner, empty state)
- On error: show inline error message with a retry action — never silently swallow it

---

## Auto-Generated Titles (if applicable)
If conversation titles are generated from the first message:
- When the rename triggers (after first response, or after first message)
- What the title is derived from (first N chars of message, AI summary, user input)
- Max length and truncation character
- Guard condition: only rename if the title is still the default (never overwrite a manual rename)
- How it is persisted (which API call)
- How the UI updates (optimistic local state)

---

## Edge Cases
Document the important failure and boundary cases — tailor to your feature:
- User switches conversations while a response is in flight (cancel the request)
- No context attached when one is required (prevent send, show inline guidance)
- Send fails (roll back optimistic message, show error, allow retry)
- Empty or whitespace-only message submitted (disable send button)
- Very long response (render fully, let the list scroll — no truncation)
- Stream connection drops mid-response (show partial text + error indicator)
- Session with a very large message history (initial load cap + pagination handles it)
