---
name: implement-app
description: >
  Builds the complete legal contract app end to end by following plan.md
  and all /specs files. Uses /loop to execute each phase and show live
  progress. Installs dependencies and runs the app automatically.
  Use this skill whenever the user asks to:
  - Build the app
  - Implement the application
  - Start coding
  - Use the implementation skill
  Trigger this skill immediately when the user says "implement",
  "build the app", or "use implementation skill".
  Only trigger after plan.md exists.
---

# Implementation Skill

Your job is to build the complete legal contract app phase by phase following
plan.md. Use /loop to track and show progress after each phase.

Do every step in order. Do not skip any step.

---

## Step 1 — Read All Context

Before writing any code, read:
- /knowledge/azure-endpoint.md
- All files in /specs/
- refrence/design.md
- skills

---

## Step 2 — Execute Phases Using /loop

Use /loop to go through each phase in plan.md.
After each phase completes, update the right panel with the phase name and status.

---

### Phase 1 — Project Setup
- Initialise Next.js 14 with TypeScript and Tailwind
- Install all dependencies
- Create .env.local template
- Create /lib/supabase.ts

---

### Phase 2 — Database
- Write /lib/db.ts with helper functions:
  - getUser(email)
  - createUser(email, passwordHash)
  - createSession(userId, title)
  - getSessions(userId)
  - createMessage(sessionId, role, content)
  - getMessages(sessionId)
  - createFeedback(userId, sessionId, rating, comment)

---

### Phase 3 — Auth
- Write /app/signup/page.tsx
- Write /app/login/page.tsx
- Write /app/api/auth/signup/route.ts
  - Check users table for existing email
  - Hash password with bcrypt
  - Insert into users table
- Write /app/api/auth/login/route.ts
  - Query users table by email
  - Compare hashed password
  - Return user id on success
- Use @design.md colors and styles for all auth UI

---

### Phase 4 — Dashboard Layout
- Write /app/dashboard/layout.tsx
  - Left sidebar 260px
  - Center flex-1
  - Right panel 320px
- Write /components/Sidebar.tsx
  - New Chat button at top
  - Session list in middle
  - User profile at bottom
- Write /components/RightPanel.tsx
  - Shows phase completion steps
  - Updates after each action
- Apply exact colors, fonts, spacing from @design.md

---

### Phase 5 — Chat Interface
- Write /components/ChatArea.tsx
- Write /components/MessageList.tsx
- Write /components/MessageBubble.tsx
  - User bubble: right aligned, accent background
  - Assistant bubble: left