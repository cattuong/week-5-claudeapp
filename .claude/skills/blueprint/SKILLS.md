---
name: create-plan
description: >
  Creates a detailed app plan and saves it to /blueprint/app-plan.md.
  Use this skill whenever the user asks to:
  - Plan the app
  - Create a plan
  - Use the planning skill
  - Think through the app before building
  Trigger this skill immediately when the user says "use planning skill"
  or "create a plan" — even casually.
  Always trigger before the specs skill runs.
---

# Create Plan Skill

Your job is to read the agent rules and design system, ask the user about
their app, then write a detailed plan to /blueprint/app-plan.md.

Do every step in order. Do not skip any step.

---

## Step 1 — Read Context Files

Before doing anything, read these files:
- @skills/rules/rules.md
- refrence/design.md

---

## Step 2 — Understand the App

Read the user's app description and make sure you understand:
- What the app does
- Who the user is
- What pages and flows exist
- What data needs to be stored
- How Azure is used
- How Supabase is used

---

## Step 3 — Write /blueprint/app-plan.md

Write a detailed plan covering all of the following sections:

```markdown
# App Plan

## App Overview
What the app does and who it is for.

## Tech Stack
List all technologies, libraries, and services used.

## Pages
List every page in the app with its route and purpose.

## User Flows
Describe every user flow step by step:
- Signup flow
- Login flow
- New chat flow
- File upload and send message flow
- View previous chat flow
- Submit feedback flow

## Database Tables
List all tables with their columns and relationships.

## API Routes
List all API routes with method, path, and purpose.

## Components
List all components grouped by page or feature.

## Azure Integration
Describe how the Azure AI agent is called, what is sent, and what is returned.

## File Parsing
Describe how PDF and DOCX files are parsed before sending to Azure.

## Environment Variables
List all environment variables needed.

## Build Phases
Break the build into ordered phases that the implementation skill will follow.
```

---

## Step 4 — Confirm Completion

Tell the user:
app-plan.md has been created in the /blueprint folder.
Ready to generate specs. Say "use specs skill" to continue.

---

## Notes
- Base the plan entirely on what the user described
- Do not invent features that were not mentioned
- Be detailed enough that specs and implementation can follow without asking questions
- blueprint/app-plan.md is the single source of truth for all skills that follow