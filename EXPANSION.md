# Stylyf Expansion Guide

## Purpose

Stylyf v0.2.0 completes the baseline full-stack scaffold:

- frontend shell, routes, layouts, styling, and UI composition
- portable backend path:
  - Better Auth
  - Drizzle
  - Postgres or SQLite/libsql
- hosted backend path:
  - Supabase Auth
  - Supabase SDK data access
- shared object storage path:
  - S3-compatible storage through AWS SDK v3 presigned URLs

That is enough to get a real app off the ground. It is not yet enough to make
basic SaaS building consistently 50% easier for coding agents across product
families such as:

- internal CRUD and admin apps
- customer-facing dashboards and account apps
- marketplace and catalog systems
- collaboration, review, and media-rich tools

The next step is to remove the heaviest remaining repeatable work without
introducing runtime magic or opaque frameworks. The target stays the same:

- shallow JSON IR
- generated explicit source files
- ordinary SolidStart apps
- no runtime dependency on Stylyf

This document defines the cleanest expansion path from the current codebase,
with one explicit constraint:

> v0.3 must optimize for generalized repeatable app mechanics, not for one
> narrow SaaS niche.

## Current Seams In The Codebase

Stylyf already has strong expansion seams. We should build on those, not around
them.

### IR seams

- [packages/stylyf-cli/src/ir/schema.ts](./packages/stylyf-cli/src/ir/schema.ts)
- [packages/stylyf-cli/src/ir/types.ts](./packages/stylyf-cli/src/ir/types.ts)
- [packages/stylyf-cli/src/ir/validate.ts](./packages/stylyf-cli/src/ir/validate.ts)

This is where new DSL surfaces belong.

### Generator seams

- [packages/stylyf-cli/src/generators/generate.ts](./packages/stylyf-cli/src/generators/generate.ts)
- [packages/stylyf-cli/src/generators/backend](./packages/stylyf-cli/src/generators/backend)
- [packages/stylyf-cli/src/generators/templates.ts](./packages/stylyf-cli/src/generators/templates.ts)
- [packages/stylyf-cli/src/templates](./packages/stylyf-cli/src/templates)

This is where the new source-emission work belongs.

### Search and intro seams

- [packages/stylyf-cli/src/manifests/backend.ts](./packages/stylyf-cli/src/manifests/backend.ts)
- [packages/stylyf-cli/src/manifests/catalog.ts](./packages/stylyf-cli/src/manifests/catalog.ts)
- [packages/stylyf-cli/src/generators/intro.ts](./packages/stylyf-cli/src/generators/intro.ts)
- [packages/stylyf-cli/README.md](./packages/stylyf-cli/README.md)

This is where discoverability and agent self-orientation need to expand.

### Current backend seams

- portable branch:
  - [packages/stylyf-cli/src/generators/backend/auth.ts](./packages/stylyf-cli/src/generators/backend/auth.ts)
  - [packages/stylyf-cli/src/generators/backend/database.ts](./packages/stylyf-cli/src/generators/backend/database.ts)
  - [packages/stylyf-cli/src/generators/backend/auth-schema.ts](./packages/stylyf-cli/src/generators/backend/auth-schema.ts)
- hosted branch:
  - [packages/stylyf-cli/src/generators/backend/supabase.ts](./packages/stylyf-cli/src/generators/backend/supabase.ts)
- shared storage:
  - [packages/stylyf-cli/src/generators/backend/storage.ts](./packages/stylyf-cli/src/generators/backend/storage.ts)
- server/API scaffolds:
  - [packages/stylyf-cli/src/generators/backend/server-functions.ts](./packages/stylyf-cli/src/generators/backend/server-functions.ts)
  - [packages/stylyf-cli/src/generators/backend/api-routes.ts](./packages/stylyf-cli/src/generators/backend/api-routes.ts)

This matters because Stylyf already has the right architectural split. v0.3
should extend these branches symmetrically instead of inventing a third model.

## Guardrails Against Niche Drift

The main risk in v0.3 is not technical feasibility. The current stack supports
the right abstractions well. The real risk is letting the DSL drift into one
product genre.

To prevent that, every new abstraction should pass this test:

### Broadness Test

A v0.3 feature is core only if it is obviously useful for all four families:

1. internal CRUD/admin apps
2. customer-facing SaaS/dashboard apps
3. marketplace/catalog/resource apps
4. collaboration/media/review apps

If a feature is mainly useful for only one family, it should be:

- an optional recipe
- a later specialization
- or left out of the core expansion set

### Language Test

Core IR should prefer generalized mechanics:

- `resource`
- `relation`
- `ownership`
- `visibility`
- `policy`
- `mutation`
- `attachment`
- `workflow`
- `event`
- `notification`

Core IR should avoid product-genre language such as:

- `post`
- `roast`
- `review thread`
- `feed item`
- `creator`

Those can be built later as named recipes on top of broader primitives.

### Security Test

Any abstraction that crosses auth, data, or storage must generate secure
defaults, not just convenient defaults:

- route and server protection
- owner/workspace scoping
- request-scoped Supabase clients for normal user flows
- RLS where applicable
- server-owned presigned storage
- no raw object-store credentials in browser code

## Guiding Principles For Expansion

1. Expand the DSL only where the abstraction removes obviously repeatable work.
2. Prefer resource, relation, and policy grammar over deeper generic
   programming DSLs.
3. Generate explicit source, SQL, helpers, middleware, and policies. Do not
   hide behavior behind runtime registries.
4. Keep the portable and hosted branches parallel where possible, but do not
   force artificial sameness where the provider models genuinely differ.
5. Keep object storage presigned and server-controlled in both branches.
6. Use SolidStart-native primitives for reads, writes, sessions, middleware,
   and server logic.
7. Treat Supabase RLS and Better Auth/Drizzle ownership checks as first-class
   generated security layers, not optional afterthoughts.

## The Top 5 Heavy Lifters For v0.3

These are the five expansions that most directly increase Stylyf’s usefulness
across broad SaaS categories rather than only niche content products.

## 1. Ownership And Policy Scaffolds

### Why This Is A Heavy Lifter

This is the single biggest gap between “baseline scaffold” and “serious SaaS.”

Almost every real app repeats some combination of:

- owner-scoped resources
- team or workspace membership
- public/private visibility
- authenticated-only write access
- admin override
- “my records” vs “shared records”

Today, Stylyf scaffolds auth and data access, but not enough of the policy
layer that sits between them.

### What We Should Add

Add a first-class `policy` / `ownership` surface to the IR.

Example direction:

```json
{
  "resource": "records",
  "ownership": {
    "model": "user",
    "ownerField": "owner_id"
  },
  "access": {
    "read": "owner-or-public",
    "create": "user",
    "update": "owner",
    "delete": "owner"
  }
}
```

We should support a small, explicit vocabulary:

- ownership models:
  - `user`
  - `workspace`
  - `none`
- access presets:
  - `public`
  - `user`
  - `owner`
  - `owner-or-public`
  - `workspace-member`
  - `admin`

### Clean Fit In The Current Codebase

- extend [packages/stylyf-cli/src/ir/schema.ts](./packages/stylyf-cli/src/ir/schema.ts)
- drive generated guards in:
  - [packages/stylyf-cli/src/generators/backend/server-functions.ts](./packages/stylyf-cli/src/generators/backend/server-functions.ts)
  - [packages/stylyf-cli/src/generators/backend/api-routes.ts](./packages/stylyf-cli/src/generators/backend/api-routes.ts)
- add policy helpers in:
  - portable branch auth/data helpers
  - hosted Supabase auth/data helpers

### Provider-Specific Output

Portable path:

- generate ownership-aware query filters and mutation guards
- generate helper functions for:
  - `requireUser`
  - `requireOwner`
  - `requireWorkspaceMember`
- where relevant, generate transaction-safe ownership checks

Hosted path:

- generate `supabase/policies.sql`
- enable RLS on generated tables
- emit baseline policies using `auth.uid()`
- keep service-role/admin client out of normal user-path CRUD
- still emit explicit query filters in generated code for performance, even
  when RLS exists

### Why The Docs Support This

- SolidStart middleware and request-scoped data (`event.locals`) fit generated
  authz and route protection well
- Supabase’s own auth and security model strongly centers on RLS and `auth.uid()`
- Supabase’s RLS docs explicitly recommend also adding explicit filters in
  queries for better plans and performance
- Drizzle now has explicit Postgres RLS support and policy representation
- Better Auth’s Organization plugin gives the portable branch a clean path to
  workspace/team ownership

### Expected Impact

This one expansion alone would materially reduce the hardest repetitive code in
auth-gated SaaS apps of almost every kind.

## 2. Resource And Relation Recipes

### Why This Is A Heavy Lifter

A huge amount of product work is repeated resource-system work:

- list
- detail
- create
- edit
- delete
- filters
- ownership
- relations
- attachments

We already have pieces of this:

- page shells
- server query/action templates
- API route templates
- schema generation

But the resource itself is not yet first-class, and cross-resource relations
are not yet modeled clearly enough.

### What We Should Add

Introduce a `resources` layer in the IR and let routes/pages/server/API derive
from it.

Example direction:

```json
{
  "resources": [
    {
      "name": "records",
      "title": "Records",
      "fields": [
        { "name": "name", "type": "varchar" },
        { "name": "status", "type": "varchar" }
      ],
      "relations": [
        { "kind": "belongs-to", "target": "workspace", "field": "workspace_id" }
      ],
      "views": ["table", "detail", "form"],
      "ownership": {
        "model": "user",
        "ownerField": "owner_id"
      }
    }
  ]
}
```

Then derive:

- schema
- CRUD server modules
- CRUD API routes
- page shells
- forms
- filters
- section compositions

### Clean Fit In The Current Codebase

- IR: add `resources` and `relations`
- manifests: add `resource-recipe` catalog entries
- generators:
  - database schema generation becomes resource-aware
  - server/API generation becomes resource-aware
  - route generation can synthesize resource index/detail/create/edit pages

This should not replace the existing lower-level fields immediately. It should
sit above them and compile down to the current primitives.

### Provider-Specific Output

Portable path:

- Drizzle schema, relations, and migrations
- resource repositories / server queries / actions
- transactions for multi-step create/update/delete flows

Hosted path:

- `supabase/schema.sql`
- resource-specific Supabase CRUD modules using the request-scoped client
- generated SQL shape that maps cleanly to Supabase auth and RLS patterns

### Why The Docs Support This

- SolidStart’s read/write model maps cleanly to list/detail queries and
  create/update/delete actions
- Drizzle relations and transactions fit naturally around resource-centric data
- Supabase SDK data access is simplest when wrapped around explicit resources

### Expected Impact

This is likely the biggest breadth saver after policy. It turns Stylyf from
“good scaffold generator” into a real product assembly line.

## 3. Asset And Attachment Lifecycle Patterns

### Why This Is A Heavy Lifter

Stylyf already handles the bucket side well. The repetitive work that remains
is the app-side metadata and lifecycle:

- asset table
- owner linkage
- MIME / size / key / status
- pending upload vs confirmed upload
- public/private visibility
- replacement and soft delete
- attachment to a domain resource

For many modern apps, not just media-focused ones, this work repeats
constantly. Logos, avatars, documents, exports, evidence files, designs, and
attachments all need the same baseline mechanics.

### What We Should Add

Introduce an `assets` or `attachments` recipe layer.

Example direction:

```json
{
  "storage": {
    "provider": "s3",
    "mode": "presigned-put",
    "bucketAlias": "uploads"
  },
  "assets": [
    {
      "name": "record_assets",
      "attachTo": "records",
      "ownership": "user",
      "variants": ["original", "preview"],
      "fields": ["alt", "caption", "visibility"]
    }
  ]
}
```

### Generated Output

Portable path:

- asset tables through Drizzle
- server actions:
  - create upload intent
  - confirm upload
  - delete asset
- owner-aware asset queries

Hosted path:

- asset tables in `supabase/schema.sql`
- Supabase data modules for asset metadata
- Tigris/AWS helpers stay shared

Shared:

- object key conventions
- metadata record shape
- presign handshake
- optional confirm/finalize flow
- safe delete helpers

### Clean Fit In The Current Codebase

- extend [packages/stylyf-cli/src/generators/backend/storage.ts](./packages/stylyf-cli/src/generators/backend/storage.ts)
- add resource-linked asset generation into:
  - database generator
  - Supabase SQL generator
  - server/API generators

### Why The Docs Support This

- AWS SDK v3 presign flow remains the right object-store substrate
- AWS guidance still favors SigV4 presigning and standard S3 request signing
- Tigris works cleanly via S3-compatible endpoints
- Supabase SSR guidance supports server-owned token/cookie flows, so storage
  access should continue to stay app-controlled instead of browser-keyed

### Expected Impact

This is the key unlock for upload-backed apps in general. Without it, any app
with attachments still requires too much bespoke plumbing.

## 4. Form, Mutation, And Validation Recipes

### Why This Is A Heavy Lifter

A lot of product work is still repetitive create/edit plumbing:

- field mapping
- defaults
- create vs edit forms
- validation and error return shapes
- action wiring
- optimistic or success-state updates

Stylyf already generates UI, routes, and backend operations. It should now
bridge them more directly.

### What We Should Add

Add a generated form recipe layer that derives from resource and field schema.

Example direction:

```json
{
  "resources": [
    {
      "name": "records",
      "forms": {
        "create": true,
        "edit": true
      }
    }
  ]
}
```

Generated output:

- `CreateRecordForm`
- `EditRecordForm`
- field rendering from schema type
- wired server actions / API calls
- standard error/success display
- baseline server-side validation shape

### Clean Fit In The Current Codebase

- build on page shell generation
- use the existing component inventory:
  - `TextField`
  - `TextArea`
  - `Select`
  - `Checkbox`
  - `RadioGroup`
  - `Switch`
  - `DatePicker`
  - form-system compositions
- add form-specific generators instead of inventing a giant runtime form engine

### Why The Docs Support This

- SolidStart server functions and data APIs are the right mutation primitive
- request-scoped server mutations align cleanly with generated auth/policy
  checks
- Supabase hosted mode and portable mode both map well to explicit
  create/update/delete mutations

### Expected Impact

This is a high-frequency saver across almost every product category. It will not
solve advanced validation design, but it will remove a large amount of boring
first-pass mutation code.

## 5. Workflow, Event, And Notification Primitives

### Why This Is A Heavy Lifter

The fifth heavy lifter should stay broad.

The previous candidate for this slot was “interaction and feed primitives,” but
that leans too quickly toward social/community products. The broader repeated
mechanic across SaaS apps is:

- workflow state transitions
- status-driven progression
- invite/accept flows
- review/approve/reject flows
- audit and activity events
- user-visible notifications

These show up in:

- internal admin products
- customer onboarding flows
- submission/review systems
- operations dashboards
- collaboration products

### What We Should Add

Introduce optional workflow and event recipes.

Example direction:

```json
{
  "workflows": [
    {
      "name": "record_review",
      "resource": "records",
      "states": ["draft", "submitted", "approved", "archived"],
      "transitions": [
        { "from": "draft", "to": "submitted", "actor": "owner" },
        { "from": "submitted", "to": "approved", "actor": "admin" }
      ],
      "events": true,
      "notifications": true
    }
  ]
}
```

Generated output should include:

- schema / SQL for workflow state and event log
- server functions / API endpoints for legal transitions
- baseline UI blocks:
  - status badge and transition actions
  - activity/event list
  - notification preference surface where relevant

Comments, ratings, bookmarks, and richer interaction systems can later be built
as optional recipes on top of this broader event model.

### Clean Fit In The Current Codebase

- the UI side already has strong seeds in the registry:
  - `ActivityFeed`
  - `NotificationList`
  - `Timeline`
  - `Stepper`
- the backend side can grow through:
  - resource-aware generated schema
  - action/query templates
  - policy-aware transition helpers

### Provider-Specific Output

Portable path:

- Drizzle tables + queries/actions + transaction-safe transitions

Hosted path:

- Supabase SQL + SDK-backed query/action modules
- RLS-aware event access patterns

### Why The Docs Support This

- SolidStart server functions are well-suited for explicit state transitions
- Drizzle transactions fit state changes plus event recording
- Supabase RLS and auth context fit user-scoped event and notification reads
- Better Auth organization/team support fits workspace-scoped workflow actors

### Expected Impact

This keeps the fifth slot broad enough to help many SaaS categories while still
unlocking collaboration and activity-rich products later.

## Why These Five And Not Others

There are other valid expansion targets:

- deployment profiles
- billing adapters
- analytics/event pipelines
- content moderation pipelines
- specialized social primitives

But the top 5 above are heavier lifters because they:

- compound across almost every SaaS app
- directly reduce bespoke logic, not just setup
- fit our current architecture cleanly
- raise both productivity and consistency

And importantly, they stay broad enough to help more than one product genre.

## Recommended v0.3 Implementation Order

1. Ownership and policy scaffolds
2. Resource and relation recipes
3. Asset and attachment lifecycle patterns
4. Form, mutation, and validation recipes
5. Workflow, event, and notification primitives

That order matters.

Why:

- policy is the security foundation
- resources and relations are the structural backbone
- asset lifecycle depends on resources and policies
- forms ride on top of resources and mutations
- workflows become dramatically easier once resources and policies exist

## What v0.3 Should Explicitly Avoid

To keep the expansion clean, v0.3 should avoid:

- deep nested DSLs
- runtime plugin systems in generated apps
- “admin panel generator” style abstraction that hides app code
- provider-specific magic leaking into the IR everywhere
- generating policies that silently over-grant access
- browser-side raw object storage credentials
- product-genre-first naming in the core DSL

## Definition Of Success For v0.3

Stylyf v0.3 is successful if a coding agent can scaffold a basic SaaS product
with:

- auth
- owned resources
- relations
- CRUD surfaces
- upload-backed assets
- baseline policy enforcement
- status-driven workflows and event logs

and reach a serious first deliverable in roughly half the turns previously
required.

That is the right threshold for this expansion wave.

## Source References

These references matter most for the expansion path above:

- SolidStart `"use server"`:
  - https://docs.solidjs.com/solid-start/reference/server/use-server
- SolidStart middleware:
  - https://docs.solidjs.com/solid-start/advanced/middleware
- Better Auth introduction and options:
  - https://www.better-auth.com/docs
  - https://better-auth.com/docs/reference/options
- Better Auth organization plugin:
  - https://better-auth.com/docs/plugins/organization
- Better Auth email/password:
  - https://www.better-auth.com/docs/authentication/email-password
- Better Auth email OTP:
  - https://better-auth.com/docs/plugins/email-otp
- Drizzle relations:
  - https://orm.drizzle.team/docs/relations-schema-declaration
- Drizzle transactions:
  - https://orm.drizzle.team/docs/transactions
- Drizzle Postgres row-level security:
  - https://orm.drizzle.team/docs/rls
- Supabase auth:
  - https://supabase.com/docs/guides/auth
- Supabase advanced SSR auth guidance:
  - https://supabase.com/docs/guides/auth/server-side/advanced-guide
  - https://supabase.com/docs/guides/auth/server-side/sveltekit
- Supabase RLS:
  - https://supabase.com/docs/guides/database/postgres/row-level-security
  - https://supabase.com/docs/guides/api/securing-your-api
- AWS SDK / S3 baseline:
  - https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-s3.html
  - https://docs.aws.amazon.com/boto3/latest/guide/s3-presigned-urls.html
