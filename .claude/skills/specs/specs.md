---
name: generate-specs
description: >
  Generates detailed technical spec files for every feature of the legal
  contract review app into a /specs folder.
  Use this skill whenever the user asks to:
  - Generate specs for the app
  - Create feature specs
  - Document what needs to be built
  - Use the specs skill
  Trigger this skill immediately when the user says "generate specs",
  "create specs", or "use specs skill" — even casually.
---

# Generate Specs Skill

Your job is to read the design system and agent rules, then generate one
detailed spec file per feature into a /specs folder.

Do every step in order. Do not skip any step.

---

## Step 1 — Read Context Files

Before writing anything, read these files:
- @agent.md — for tech stack, rules, and Supabase instructions
- @design.md — for layout, colors, and component rules

Confirm you understand both before moving forward.

---

## Step 2 — Create /specs folder

Create a /specs folder in the project root if it does not exist.

---

## Step 3 — Write specs/database.md

```markdown
# Database Spec

## Table: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

## Table: sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP DEFAULT now()
);

## Table: messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT,
  created_at TIMESTAMP DEFAULT now()
);

## Table: feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES sessions(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Step 4 — Write specs/auth.md

```markdown
# Auth Spec

## Feature
Signup and Login using a custom users table.
DO NOT use Supabase built-in auth under any circumstance.

## Signup Flow
- User enters email and password
- Check users table — if email already exists return error
- Hash the password before storing
- Insert new row into users table
- Redirect to /dashboard

## Login Flow
- User enters email and password
- Query users table by email
- Compare hashed password
- If match: save user id in localStorage, redirect to /dashboard
- If no match: show error message

## API Routes
- POST /api/auth/signup
- POST /api/auth/login

## Components
- SignupPage, LoginPage, AuthForm, AuthInput, AuthButton

## Edge Cases
- Duplicate email on signup
- Wrong password on login
- Empty fields
- User does not exist
```

---

## Step 5 — Write specs/dashboard.md

```markdown
# Dashboard Spec

## Feature
Main app layout shown after login. Three panel layout.

## Layout
- Left Sidebar 260px fixed:
    - New Chat button at top
    - List of previous chat sessions
    - User profile at bottom
- Center Panel flex-1:
    - Chat interface
    - Message input bar at bottom
    - Attachment button in input bar
- Right Panel 320px fixed:
    - Shows execution plan steps
    - Updates as Claude works through each phase
    - Mimics Cowork layout

## Components
- DashboardLayout, Sidebar, ChatArea, RightPanel
- NewChatButton, SessionListItem, UserProfile

## Edge Cases
- No chats yet — show empty state in sidebar
- Right panel empty before any action starts
```

---

## Step 6 — Write specs/chat.md

```markdown
# Chat Spec

## Feature
Full chat interface with session management and message history.

## Flow
1. User types message in input bar
2. If file uploaded — parse text and include as contractText
3. Send contractText + userMessage to /api/chat
4. Show loading state while waiting for Azure response
5. Display assistant response in chat bubble
6. Save both user message and assistant message to messages table
7. Show FeedbackForm after every assistant response

## DB Tables Used
- sessions: one row per conversation
- messages: one row per message with role user or assistant

## New Chat
- Click New Chat in sidebar
- Create new row in sessions table
- Clear current chat area
- Add new session to sidebar list

## Previous Chats
- Load all sessions for logged-in user from sessions table
- Click a session in sidebar to load its messages

## Components
- ChatArea, MessageList, MessageBubble, InputBar
- AttachmentButton, LoadingIndicator

## Edge Cases
- Empty message — do not send
- Azure timeout — show error message
- No file uploaded — send only userMessage with empty contractText
```

---

## Step 7 — Write specs/file-upload.md

```markdown
# File Upload Spec

## Feature
Upload a PDF or DOCX contract file and parse it to plain text.

## Flow
1. User clicks attachment button in input bar
2. File picker opens — accept .pdf and .docx only
3. Parse file to plain text:
   - PDF: use pdfjs-dist
   - DOCX: use mammoth
4. Store parsed text in component state
5. Show file name as badge in input bar
6. When user sends message — include parsed text as contractText

## Libraries
- pdfjs-dist for PDF parsing
- mammoth for DOCX parsing

## Components
- FileUploadButton, FilePreviewBadge

## Edge Cases
- Unsupported file type — show error
- File too large over 10MB — show warning
- Parse failure — show error, allow retry
- User removes file — clear contractText from state
```

---

## Step 8 — Write specs/azure-integration.md

```markdown
# Azure Integration Spec

## Feature
Call Azure AI agent endpoint with contract text and user message.

## Auth
Use DefaultAzureCredential from @azure/identity.
User must run az login in terminal before starting the app.
Never use API keys. Never call Azure from the client side.

## API Route
POST /api/chat

## Request Body
{
  contractText: string,
  userMessage: string
}

## How to Call inside /api/chat/route.ts
- Import DefaultAzureCredential