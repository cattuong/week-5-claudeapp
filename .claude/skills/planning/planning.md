---
name: generate-plan
description: >
  Reads all /specs files and generates a phased implementation plan
  saved as plan.md in the project root.
  Use this skill whenever the user asks to:
  - Create a plan for the app
  - Generate a build plan
  - Plan the implementation
  - Use the planning skill
  Trigger this skill immediately when the user says "create plan",
  "generate plan", or "use planning skill".
  Only trigger after specs have been generated.
---

# Generate Plan Skill

Your job is to read all spec files and produce a phased plan.md that the
implementation skill will follow step by step.

Do every step in order. Do not skip any step.

---

## Step 1 — Read All Context

Read these files before writing anything:
- @agent.md
- @design.md
- specs/database.md
- specs/auth.md
- specs/dashboard.md
- specs/chat.md
- specs/file-upload.md
- specs/azure-integration.md
- specs/feedback.md

If any spec file is missing, stop and tell the user:
Specs not found. Please run "use specs skill" first.

---

## Step 2 — Write plan.md

Write this file to the project root:

```markdown
# Implementation Plan

## Phase 1 — Project Setup
- Initialise Next.js 14 with TypeScript and Tailwind CSS
- Install dependencies:
  npm install @supabase/supabase-js @azure/identity @azure/ai-projects pdfjs-dist mammoth
- Create .env.local with:
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
- Create /lib/supabase.ts Supabase client

## Phase 2 — Database Setup
- Run all SQL from specs/database.md in Supabase SQL editor
- Create tables: users, sessions, messages, feedback
- Create /lib/db.ts with helper functions for each table

## Phase 3 — Auth Pages
- /app/signup/page.tsx
- /app/login/page.tsx
- /app/api/auth/signup/route.ts — insert into users table
- /app/api/auth/login/route.ts — query users table, compare hash
- Store user id in localStorage on login
- Redirect to /dashboard on success

## Phase 4 — Dashboard Layout
- /app/dashboard/layout.tsx — three panel layout
- /components/Sidebar.tsx — 260px left panel
- /components/RightPanel.tsx — 320px right panel
- Apply exact dimensions and colors from @design.md

## Phase 5 — Chat Interface
- /components/ChatArea.tsx
- /components/MessageList.tsx
- /components/MessageBubble.tsx
- /components/InputBar.tsx
- Wire new chat and session history to Supabase

## Phase 6 — File Upload + Azure Integration
- /components/FileUploadButton.tsx
- /lib/fileParser.ts — pdfjs-dist and mammoth parsers
- /app/api/chat/route.ts — call Azure with contractText + userMessage
- Use