# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point — unless the user asks otherwise.

---

## SUB-AGENT POLICY

- Use sub-agents for any change touching more than one file, or any task that can run in parallel.
- Act as a coordinator only — do not implement features yourself when sub-agents can do it.
- Model selection: always use mid-tier models — do not use premium models.
- Always spawn parallel sub-agents for independent changes to save time.
- If a sub-agent fails, stop and report the failure to the user before continuing — do not silently retry or work around it.

---

## PLANNING MODE

- Always ask clarifying questions before planning — never assume design, tech stack, or features.
- Use sub-agents to research and review different aspects of the plan before presenting it to the user.
- Do not write any code in planning mode.

---

## CHANGE / EDIT MODE

- Identify which changes are independent and can run in parallel — use sub-agents for those.
- After completing any feature (large or small), always run:
  - Lint
  - Type check
  - Build (e.g. `next build`)
- If any of the above fail, do not mark the task complete — fix the issue or escalate to the user.
- If a change cannot be safely made without breaking existing functionality, stop and ask the user.

---

## DATABASE SCHEMA CHANGES

- After every schema change, always run the Drizzle **generate** and **migrate** commands in that order.
- **NEVER run `drizzle push`.**
- For all ID columns not related to BetterAuth, use randomly generated UUIDs.

---

## TESTING

- Never assume changes work — always test after implementing.
- Use any testing tools, libraries, MCP tools, or skills available in the project.
- Minimum bar: run a smoke test even if no test framework exists.
- If no testing tools are available at all, ask the user whether to skip testing before proceeding — do not skip silently.

---

## UI DESIGN

- Always follow the design system when creating or modifying components or pages.
- Design system reference: `@DESIGN.md`
- **If `DESIGN.md` is missing or appears outdated, ask the user before touching any UI** — do not guess or invent styles.

---

## VERSION CONTROL

- After lint, type check, and build all pass, ask the user whether to stage/commit the changes.
- Do not auto-commit without explicit user confirmation.
- Use clear, descriptive commit messages that reflect what changed and why.