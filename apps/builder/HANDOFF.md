# Stylyf Handoff

Generated app: Stylyf Builder
App kind: internal-tool

## Backend

- mode: hosted
- auth: supabase
- data: supabase sdk
- storage: tigris/s3-compatible

## Generated Routes

- `/` -> `src/routes/index.tsx`
- `/projects` -> `src/routes/projects/index.tsx`
- `/projects/new` -> `src/routes/projects/new.tsx`
- `/projects/:id/edit` -> `src/routes/projects/[id]/edit.tsx`
- `/agent-events` -> `src/routes/agent-events/index.tsx`
- `/agent-events/new` -> `src/routes/agent-events/new.tsx`
- `/agent-events/:id/edit` -> `src/routes/agent-events/[id]/edit.tsx`
- `/settings` -> `src/routes/settings.tsx`
- `/projects/:id` -> `src/routes/projects/[id]/index.tsx`

## Generated Resources

- `projects`
- `agent_events`

## Generated Workflows

- none

## Source Ownership

This generated app is ordinary source code. It does not import this repo and does not depend on `@depths/stylyf-cli` at runtime.

Keep editing the emitted app directly after generation. Treat `stylyf.spec.json` and `stylyf.plan.json` as the generation record.
