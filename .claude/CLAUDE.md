# Claude Instructions

Read these files before doing anything else:
- @skills/rules/rules.md
- @skills/design/design.md
- /knowledge/design-system.md
- /knowledge/plan.md

## Current State

- Specs: complete in /specs/ (auth, chat, dashboard, database, file-upload,
  azure-integration, feedback)
- Plan: complete in /knowledge/plan.md
- Implementation: not started — project is a bare Vite + React scaffold
- Design system: complete in /knowledge/design-system.md
- Azure endpoint: template in /knowledge/azure-endpoint.md (fill in env vars)

## Session Flow

1. ~~Use @skills/specs/specs.md to generate all feature specs~~ — DONE
2. ~~Generate plan~~ — DONE, see /knowledge/plan.md
3. Use @skills/implementation/implementation.md to build the app
   - Follow /knowledge/plan.md phases in order (Phase 1 through 9)
   - Read /knowledge/design-system.md before writing any UI code
4. Use @skills/testing/testing.md to test all flows

## Key References

| File | Purpose |
|---|---|
| /knowledge/plan.md | Phased build plan — follow exactly |
| /knowledge/design-system.md | All colors, fonts, dimensions, component specs |
| /knowledge/azure-endpoint.md | Azure AI client setup and /api/chat implementation |
| /specs/*.md | Feature specs for each area |
| /skills/rules/rules.md | Tech stack and hard rules |

## Before Starting Implementation

Confirm these are ready:
- [ ] Supabase project URL and anon key (for .env)
- [ ]  make sure all the cred should be .env file

