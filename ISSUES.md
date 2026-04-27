# Stylyf Dogfood Issues

This file tracks issues discovered while dogfooding Stylyf against real app work. The goal is to preserve scaffold-level defects and product gaps so they can be fixed in the CLI/source layer instead of being forgotten as one-off generated app patches.

## 2026-04-27: Builder Baseline Generation

### Generated Supabase env check includes Better Auth-only comparison

- **Context:** `apps/builder` was generated from a hosted Supabase Stylyf spec.
- **Symptom:** `npm run builder:check` failed in `apps/builder/src/lib/env.check.ts` with TS2367 because the generated `requiredEnv` union could never equal `"BETTER_AUTH_URL"`.
- **Local fix:** Removed the Better Auth-only URL guard from the generated builder app.
- **Likely source fix:** Update the CLI env-check generator so Better Auth-only env names are only emitted or compared when `app.auth.provider === "better-auth"`.
- **Status:** Locally patched in generated builder app. CLI generator still needs hardening.

### Generated empty workflow definitions narrow to `never`

- **Context:** `apps/builder` has resources but no workflows.
- **Symptom:** `npm run builder:check` failed in `apps/builder/src/lib/resources.ts` because `workflowDefinitions` was emitted as `[] as const`, causing `workflow.name` access inside `Object.fromEntries(workflowDefinitions.map(...))` to narrow to `never`.
- **Local fix:** Added an explicit `WorkflowDefinition` type and emitted `workflowDefinitions` as `readonly WorkflowDefinition[]`.
- **Likely source fix:** Update the CLI resource generator to type empty generated definition arrays when downstream helper code maps over them.
- **Status:** Locally patched in generated builder app. CLI generator still needs hardening.
