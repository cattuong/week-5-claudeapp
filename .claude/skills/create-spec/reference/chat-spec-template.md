# Chat Spec

## Feature Name
Chat Interface

## Description
Full chat interface where user types a question, optionally attaches a contract file, and gets a response from the Azure AI agent.

## User Flow
- User types a message in the input bar
- If a file is attached the parsed text is included as contractText
- Message and contractText sent to /api/chat
- Loading state shown while waiting
- Azure response displayed as assistant bubble
- Both messages saved to messages table
- Feedback form appears below assistant response

## DB Schema
- sessions (id, user_id, title, created_at)
- messages (id, session_id, role, content, created_at)

## API Routes
- POST /api/chat

## Components
- ChatArea
- MessageList
- MessageBubble
- InputBar
- AttachmentButton
- LoadingIndicator

## Edge Cases
- Empty message — do not send
- No file attached — send empty contractText
- Azure timeout — show error
- Session not found — create new session