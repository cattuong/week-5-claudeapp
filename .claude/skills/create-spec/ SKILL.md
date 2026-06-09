---
name: create-spec
description: >
  Generates detailed spec files for the legal contract review app
  using templates from the reference folder.
  Use this skill whenever the user asks to:
  - Generate specs
  - Create spec files
  - Use the specs skill
  Trigger this skill immediately when the user says "use specs skill"
  or "generate specs" — even casually.
  Only trigger after /blueprint/app-plan.md exists.
---

# Create Spec Skill

Your job is to read the planning file and generate one spec file per
feature using the templates in the reference folder.

Do every step in order. Do not skip any step.

---

## Step 1 — Read Context Files

Before writing anything, read these files:
- @skills/rules/rules.md
- refrence/design.md
- /blueprint/app-plan.md
- All templates in the reference folder

If /blueprint/app-plan.md does not exist, stop and tell the user:
app-plan.md not found. Please run "use planning skill" first.

---

## Step 2 — Create /specs folder

Create a /specs folder in the project root if it does not exist.

---

## Step 3 — Generate Spec Files

Using the templates in the reference folder and the plan in
/blueprint/app-plan.md, generate these files in /specs:

- specs/database.md — use reference/database-spec-template.md
- specs/auth.md — use reference/auth-spec-template.md
- specs/dashboard.md — use reference/dashboard-spec-template.md
- specs/chat.md — use reference/chat-spec-template.md
- specs/file-upload.md — use reference/file-upload-spec-template.md
- specs/azure-integration.md — use reference/azure-integration-spec-template.md
- specs/feedback.md — use reference/feedback-spec-template.md

Fill each template with details from /blueprint/app-plan.md.

---

## Step 4 — Confirm Completion

Tell the user:
All spec files have been generated in /specs based on /blueprint/app-plan.md.
Ready for implementation planning. Say "use planning skill" to continue.

---

## Notes
- Always base spec content on /blueprint/app-plan.md — do not invent features
- Fill every section of each template — do not leave any section empty
- Do not write any code — specs are documentation only