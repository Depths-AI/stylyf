# Stylyf v0.3 Implementation Plan

## Purpose

Stylyf v0.2.0 gives us a strong full-stack scaffold:

- SolidStart app shell, routes, layouts, styling, and registry composition
- portable backend path:
  - Better Auth
  - Drizzle
  - Postgres or SQLite/libsql
- hosted backend path:
  - Supabase Auth
  - Supabase SDK data access
- shared object storage:
  - AWS SDK v3 / S3-compatible presigned flows

v0.3 is the next layer. The goal is not “more codegen” in the abstract. The
goal is to remove the heaviest remaining repeatable app mechanics so that a
coding agent can stand up broad SaaS products with materially less bespoke
glue work while preserving explicit source-owned apps.

This plan is grounded in:

- the current Stylyf seams in `packages/stylyf-cli`
- the generalized expansion goals in [EXPANSION.md](./EXPANSION.md)
- the expected impact targets in
  [V0_3_IMPACT_STRESS_TEST.md](./V0_3_IMPACT_STRESS_TEST.md)
- the current official docs for SolidStart, Better Auth, Drizzle, Supabase,
  and AWS S3 presign flows

## Scope Boundary

v0.3 should optimize for generalized repeatable app mechanics, not one product
genre.

Core abstractions should stay framed around:

- resources
- relations
- ownership
- access policy
- attachments
- workflows
- events
- notifications
- forms and mutations

Core abstractions should avoid niche-first language such as posts, feeds,
ratings, roasts, or creator-specific workflows.

## Current Codebase Seams

### IR

- `packages/stylyf-cli/src/ir/types.ts`
- `packages/stylyf-cli/src/ir/schema.ts`
- `packages/stylyf-cli/src/ir/validate.ts`

### Generator orchestration

- `packages/stylyf-cli/src/generators/generate.ts`
- `packages/stylyf-cli/src/generators/project.ts`

### Portable backend path

- `packages/stylyf-cli/src/generators/backend/auth.ts`
- `packages/stylyf-cli/src/generators/backend/database.ts`
- `packages/stylyf-cli/src/generators/backend/auth-schema.ts`
- `packages/stylyf-cli/src/generators/backend/server-functions.ts`
- `packages/stylyf-cli/src/generators/backend/api-routes.ts`

### Hosted backend path

- `packages/stylyf-cli/src/generators/backend/supabase.ts`

### Shared storage path

- `packages/stylyf-cli/src/generators/backend/storage.ts`

### Operator surfaces

- `packages/stylyf-cli/src/manifests/backend.ts`
- `packages/stylyf-cli/src/search/index.ts`
- `packages/stylyf-cli/src/generators/intro.ts`
- `packages/stylyf-cli/README.md`

## Implementation Order

The steps below are intentionally ordered so we stabilize the shared contract
first, then wire both backend branches symmetrically, then harden the operator
surface and verification.

## Step 1. IR Foundations And Operator Surface

### Goal

Introduce the v0.3 vocabulary without changing runtime semantics prematurely.

This step defines the shallow DSL for:

- `resources`
- `workflows`
- embedded:
  - ownership
  - access policy
  - relations
  - attachments

It also teaches the CLI’s operator-facing surfaces about those concepts so a
fresh coding agent can discover and use them before the later generator steps
land.

### Deliverables

- extend IR types
- extend JSON schema
- extend runtime validation
- extend search/manifests with v0.3 concepts
- extend `stylyf intro`
- extend package README
- add at least one validation-only example IR that exercises the new surface

### Validation

- `npm run cli:build`
- `node packages/stylyf-cli/dist/bin.js intro`
- `node packages/stylyf-cli/dist/bin.js search ownership policy resource --limit 8`
- `node packages/stylyf-cli/dist/bin.js validate --ir <new-v0.3-example>`

## Step 2. Resource Recipe Generation

### Goal

Make `resources` useful, not just declarative.

Resource recipes should generate:

- table/schema output
- list/detail/create/edit/delete server surfaces
- baseline route/page shells where requested
- resource-aware registry composition defaults

### Deliverables

Portable branch:

- derive Drizzle schema/table helpers from `resources`
- generate resource query/action modules
- emit portable resource helper files

Hosted branch:

- derive `supabase/schema.sql` from `resources`
- generate Supabase SDK query/mutation helpers
- keep request-scoped clients as the default for user-path operations

Cross-cutting:

- support relations:
  - belongs-to
  - has-many
  - many-to-many

### Validation

- generate one portable app from resource-first IR
- generate one hosted app from resource-first IR
- `npm install`
- `npm run check`
- `npm run build`

## Step 3. Ownership And Policy Scaffolds

### Goal

Turn auth + data into secure app mechanics:

- owner-scoped resources
- workspace-scoped resources
- public/private visibility
- route/API/server defaults that align with resource policy

### Deliverables

Portable branch:

- generated ownership guard helpers
- generated query filters and mutation guards
- transaction-safe ownership checks where writes span multiple operations

Hosted branch:

- generated `supabase/policies.sql`
- generated `alter table ... enable row level security`
- ownership-aware policies using `auth.uid()`
- explicit query filters in generated code as a companion to RLS

Cross-cutting:

- keep existing `auth.protect` route/API/server surface
- add resource-driven policy helpers without breaking current v0.2 apps

### Validation

- local portable smoke app:
  - auth works
  - owner-only CRUD works
  - cross-user mutation is blocked
- hosted smoke app:
  - RLS file generated
  - request-scoped queries align with ownership

## Step 4. Asset And Attachment Lifecycle Patterns

### Goal

Make storage useful for real apps rather than just emitting a presign helper.

### Deliverables

- attachment DSL from Step 1 becomes real generated source
- generated asset metadata schema/table output
- generated upload-intent and confirm/attach server flows
- generated delete and replace flows
- generated storage metadata helpers for both backend modes
- keep storage server-owned and presigned in both branches

### Validation

- portable app:
  - local metadata lifecycle works
- hosted app:
  - presign + attach + delete flow works with Supabase + Tigris

## Step 5. Form, Mutation, And Validation Recipes

### Goal

Remove the repeated “wire the same create/edit flow again” work.

### Deliverables

- resource-driven create/edit form scaffolds
- generated input types and server mutation helpers
- generated field-level error display baselines
- generated form surfaces for common resource pages

Important constraint:

- stay close to SolidStart’s server functions and router `action` model
- avoid hiding app writes behind a separate runtime abstraction

### Validation

- generated create/edit flows compile and build
- action/query invalidation behaves correctly
- forms remain ordinary editable source

## Step 6. Workflow, Event, And Notification Primitives

### Goal

Support generic lifecycle mechanics across app types.

### Deliverables

- workflow field and transition generation
- transition-aware mutation helpers
- baseline event log schema/source
- notification rule scaffolds:
  - in-app first
  - email hooks only as optional output

Important boundary:

- keep this broad:
  - approvals
  - publishing
  - invitations
  - review state changes
  - onboarding steps

### Validation

- generated workflow example with:
  - status transitions
  - event entries
  - notification records

## Step 7. Operator Surfaces, Search, And Examples

### Goal

Make the expanded system usable by a fresh coding agent without reopening the
repo source tree repeatedly.

### Deliverables

- extend `stylyf intro`
- extend README
- extend bundled search index
- add at least two v0.3-first example IRs:
  - portable
  - hosted

### Validation

- `stylyf search` finds resource/policy/attachment/workflow recipes cleanly
- `stylyf intro` is sufficient for a cold-start operator to draft valid IR

## Step 8. Dogfood, Security Review, And Pack Verification

### Goal

Close the loop on the impact claims in
[V0_3_IMPACT_STRESS_TEST.md](./V0_3_IMPACT_STRESS_TEST.md).

### Deliverables

- dogfood at least two broad archetypes using v0.3-first IR
- verify generated apps still:
  - install cleanly
  - build cleanly
  - do not import this repo
  - do not import `@depths/stylyf-cli` at runtime
- re-run packaged verification outside the repo
- re-review secure defaults across:
  - Better Auth + Drizzle path
  - Supabase path
  - Tigris/S3 path

### Validation

- `npm run cli:verify-pack`
- generated portable app build
- generated hosted app build
- targeted runtime smoke tests for:
  - auth
  - owner-scoped CRUD
  - presigned upload lifecycle

## Success Criteria

v0.3 is ready when all of the following are true:

1. A fresh coding agent can read `stylyf intro` and write valid v0.3 IR without
   reopening large parts of the CLI source tree.
2. `resources`, `ownership`, `attachments`, and `workflows` produce explicit
   generated source in both backend branches.
3. Generated defaults are secure enough that the agent does not need to rewrite
   the auth/data/storage baseline just to make the app safe.
4. The v0.3 features feel useful across all four archetypes in
   [V0_3_IMPACT_STRESS_TEST.md](./V0_3_IMPACT_STRESS_TEST.md), not just one
   niche.
5. Packaged verification remains green and generated apps stay standalone.

## Why This Order

This order reflects the actual dependency chain in the current codebase:

- the IR and validation layer must stabilize first
- both backend branches need a shared semantic contract before generation can
  stay parallel
- attachments build on both resource and policy work
- forms build on resources and actions
- workflows build on resources, policy, and mutation surfaces
- only after all of that does dogfooding meaningfully test the real v0.3 impact

## Key References

- SolidStart `"use server"`:
  https://docs.solidjs.com/solid-start/reference/server/use-server
- Solid Router `createAsync`:
  https://docs.solidjs.com/solid-router/reference/data-apis/create-async
- Solid Router `action`:
  https://docs.solidjs.com/solid-router/reference/data-apis/action
- Better Auth email/password:
  https://www.better-auth.com/docs/authentication/email-password
- Better Auth organization plugin:
  https://www.better-auth.com/docs/plugins/organization
- Better Auth email OTP plugin:
  https://better-auth.com/docs/plugins/email-otp
- Drizzle relations:
  https://orm.drizzle.team/docs/relations-schema-declaration
- Drizzle transactions:
  https://orm.drizzle.team/docs/transactions
- Drizzle RLS:
  https://orm.drizzle.team/docs/rls
- Supabase Auth overview:
  https://supabase.com/docs/guides/auth
- Supabase signup:
  https://supabase.com/docs/client/auth-signup
- Supabase OTP sign-in:
  https://supabase.com/docs/reference/javascript/auth-signinwithotp
- Supabase RLS:
  https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API security:
  https://supabase.com/docs/guides/api/securing-your-api
- AWS SDK v3 S3 presign guidance:
  https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-s3.html
