# Chat / Messaging Spec Template

Use this template to write the chat or messaging spec for your app after planning.
Each section below tells you what to document — replace all guidance text with
real content from your app plan.

---

## Feature Name
The name for this feature. Example: "Chat Interface" or "Conversation View".

---

## Description
Describe:
- What the messaging interface does (who sends messages, who or what responds)
- How responses are generated or retrieved (AI, another user, a service)
- Whether responses are streamed or returned whole
- How conversation history is persisted across sessions

---

## User Flow
Document every step from the user's perspective:
- How the user starts a new conversation
- Any setup required before sending (e.g. attach a file, select a context)
- What happens when the user sends a message (immediate feedback, loading state)
- How the response arrives and is displayed
- Any post-response UI elements (feedback form, follow-up suggestions)
- What happens when the user switches sessions or starts a new one

---

## Shared Context State — CRITICAL
If any data must be included with every message (e.g. an uploaded document, a selected record):
- Document what that data is
- Which component OWNS that state (must be a parent, not the chat input)
- How it is passed down to the chat components as props
- What happens to it when the session changes

If there is no shared context, note that here and skip this section.

---

## Message Rendering
Describe how each type of message is displayed:
- User messages: alignment, styling, text rendering (plain text or formatted)
- Assistant/other messages: alignment, styling, text rendering
- If markdown is rendered: what library is used and what elements need custom styling
- Any special rendering for code blocks, tables, links, etc.

---

## Message Bubble Styling
Describe the visual design of message bubbles:
- User bubble: alignment, background, border, border-radius
- Other bubble: alignment, background, border, border-radius
- Sender label: avatar, name display, position

---

## Components
List every component in the chat feature:
- Component name and what it renders
- What state it owns (if any)
- What props it receives
- What callbacks it exposes

---

## Props
For the main chat container and input components, document:
- Every prop: name, type, what it is for
- Which props carry the shared context from the parent
- Which callbacks bubble events up to the parent

---

## Optimistic Updates
Describe the message flow for sending:
- When the optimistic message appears
- What ID it uses temporarily
- How it is replaced when the real response arrives
- How it is replaced if the request fails

---

## API Route
Document the chat API route:
- Method and path
- All fields in the request body
- All fields in the success response
- Error response format

---

## History Loading
Describe what happens when a session is loaded:
- When messages are cleared (must be immediately, before fetching)
- What API is called to fetch history
- How errors are surfaced to the user (never swallow them silently)

---

## Edge Cases
Cover every important failure or edge case:
- User switches sessions mid-request
- No context attached
- Message send fails
- Empty message submitted
- Very long responses
- Loading state behavior
