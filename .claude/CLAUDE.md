# Claude Instructions

Read these files before doing anything else:
- @skills/rules/rules.md
- @skills/design/design.md
- /reference/design-system.md
- /reference/plan.md

## Current State

- Specs: complete in /specs/ (auth, chat, dashboard, database, file-upload,
  azure-integration, feedback)
- Plan: complete in /reference/plan.md
- Implementation: not started — project is a bare Vite + React scaffold
- Design system: complete in /reference/design-system.md
- Azure endpoint: template in /reference/azure-endpoint.md (fill in env vars)

## Session Flow

1. ~~Use @skills/specs/specs.md to generate all feature specs~~ — DONE
2. ~~Generate plan~~ — DONE, see /reference/plan.md
3. Use @skills/implementation/implementation.md to build the app
   - Follow /reference/plan.md phases in order (Phase 1 through 9)
   - Read /reference/design-system.md before writing any UI code
   - Read /reference/azure-endpoint.md before writing /api/chat/route.ts
4. Use @skills/testing/testing.md to test all flows

## Key References

| File | Purpose |
|---|---|
| /reference/plan.md | Phased build plan — follow exactly |
| /reference/design-system.md | All colors, fonts, dimensions, component specs |
| /reference/azure-endpoint.md | Azure AI client setup and /api/chat implementation |
| /specs/*.md | Feature specs for each area |
| /skills/rules/rules.md | Tech stack and hard rules |

## Before Starting Implementation

Confirm these are ready:
- [ ] Supabase project URL and anon key (for .env.local)
- [ ] Azure project endpoint and agent ID (for .env.local)
- [ ] `az login` run in terminal

