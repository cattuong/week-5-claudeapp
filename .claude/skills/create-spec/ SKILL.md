---
name: create-spec
description: >
  Generates detailed spec files for any app based on the planning document
  at /blueprint/app-plan.md. Use this skill whenever the user asks to:
  - Generate specs
  - Create spec files
  - Use the specs skill
  Trigger this skill immediately when the user says "use specs skill"
  or "generate specs" — even casually.
  Only trigger after /blueprint/app-plan.md exists.
---

# Create Spec Skill

Your job is to read the planning document and generate one spec file per
feature using the templates in the reference folder as structural guides.

Do every step in order. Do not skip any step.

---

## Step 1 — Read Context Files

Before writing anything, read these files:
- @skills/rules/rules.md
- @skills/design/design.md
- /blueprint/app-plan.md
- All templates in the reference folder

If /blueprint/app-plan.md does not exist, stop and tell the user:
app-plan.md not found. Please run "use planning skill" first.

---

## Step 2 — Create /specs Folder

Create a /specs folder in the project root if it does not exist.

---

## Step 3 — Generate Spec Files

Read /blueprint/app-plan.md and identify all distinct features and modules
described in the plan.

For each feature:
1. Pick the closest matching template from the reference folder as a
   structural guide (auth → auth-spec-template, database → database-spec-template,
   dashboard/layout → dashboard-spec-template, chat/messaging →
   chat-spec-template, AI/external API → ai-integration-spec-template,
   file handling → file-upload-spec-template, feedback → feedback-spec-template).
   For features with no close match, use the closest template as a structural
   reference and adapt the sections to fit.
2. Generate one spec file in /specs/ named after the feature
   (e.g. specs/auth.md, specs/payments.md, specs/notifications.md).
3. Fill every section of the template with details from /blueprint/app-plan.md.
   Do not invent features or details that are not in the plan.
   Do not leave any section empty — if the plan is silent on a section,
   derive it from context or note "to be determined".

The number and names of spec files depend entirely on the plan.
Do not assume a fixed set of features.

---

## Step 4 — Confirm Completion

Tell the user:
All spec files have been generated in /specs based on /blueprint/app-plan.md.
List the files created. Then say: Ready for implementation planning.
Say "use planning skill" to continue.

---

## Notes
- Always base spec content on /blueprint/app-plan.md — do not invent features
- Fill every section of each template — do not leave any section empty
- Do not write any code — specs are documentation only
- Templates are structural guides only — adapt section names if needed
