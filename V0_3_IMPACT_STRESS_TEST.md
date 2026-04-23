# Stylyf v0.3 Impact Stress Test

## Purpose

This document is a reality check for the expected impact of the proposed Stylyf
v0.3 expansion.

It exists so that once the v0.3 work lands, we can measure the outcome against
explicit expectations instead of relying on optimistic memory.

The core questions are:

1. If Stylyf grows from v0.2.0 into the planned v0.3 shape, how much
   additional work does it remove for a coding agent building actual products?
2. Does the v0.3 expansion help broad SaaS categories, or does it accidentally
   optimize for a narrow niche?

This is evaluated in agentic turns, not wall-clock time.

## Current Baseline

Stylyf v0.2.0 already removes a large amount of:

- frontend shell setup
- route generation
- page shell composition
- global styling and theming
- registry UI assembly
- backend baseline wiring
  - portable path: Better Auth + Drizzle + Postgres/SQLite
  - hosted path: Supabase Auth + Supabase SDK data
- object storage baseline via AWS SDK v3 / presigned URLs
- server/API route scaffolding

The main work still left to the agent is:

- ownership and authorization logic
- repeated resource CRUD structure
- upload metadata lifecycle
- form plumbing
- workflow state transitions
- event and notification consistency
- policy consistency across the app

That is exactly what the revised v0.3 items target.

## The Proposed v0.3 Expansion

The working v0.3 expansion set is:

1. ownership and policy scaffolds
2. resource and relation recipes
3. asset and attachment lifecycle patterns
4. form, mutation, and validation recipes
5. workflow, event, and notification primitives

This is not just “more scaffolding.” It is the part of the scaffold that starts
to absorb product-grade repeatable logic while staying broad across app types.

## Archetypes

We use four app archetypes for the estimate:

1. simple SPA / landing / docs / utility
2. standard authenticated CRUD app
3. resource-centric app with uploads and collaboration
4. sophisticated multi-role, media-capable SaaS

These are intentionally broad. v0.3 should help all of them, not just the most
social or content-heavy ones.

## Estimated Turn Impact

| Archetype | Without Stylyf | With v0.2 | With v0.3 | v0.2 reduction | v0.3 reduction |
|---|---:|---:|---:|---:|---:|
| 1. Simple SPA / docs / utility | `8–15` | `2–5` | `2–4` | `65–80%` | `75–85%` |
| 2. Standard auth CRUD app | `20–35` | `8–15` | `5–10` | `50–65%` | `65–80%` |
| 3. Resource-centric app with uploads and collaboration | `35–60` | `18–32` | `10–20` | `40–55%` | `65–75%` |
| 4. Sophisticated multi-role, media-capable SaaS | `60–110` | `35–70` | `20–40` | `30–45%` | `55–70%` |

## Why These Numbers Are Plausible

## 1. Simple SPA / Docs / Utility

### Why v0.2 is already strong

This category is mostly:

- page structure
- layout rhythm
- shell composition
- theme setup
- content surfaces

Stylyf v0.2 already automates most of that.

### Why v0.3 only moves it a little

The new v0.3 work is mostly backend and product-logic heavy:

- ownership
- resources
- asset lifecycle
- forms
- workflows

Simple SPAs do not need much of that.

### Stress test

If v0.3 claims major extra gains here, that would be suspicious. The ceiling is
already near reached in v0.2.

## 2. Standard Authenticated CRUD App

### Why v0.2 helps

v0.2 already removes:

- auth wiring
- DB wiring
- route/page shells
- server/API scaffolding

### Why v0.3 should help much more

CRUD apps repeat these patterns constantly:

- owned resources
- list/detail/create/edit/delete
- forms
- access control
- simple status workflows

This is exactly where resource recipes and policy scaffolds should compress
turns.

### Stress test

If v0.3 still requires the agent to hand-build most of:

- resource schema-to-surface mapping
- CRUD route generation
- ownership checks
- create/edit form scaffolds
- status transition plumbing

then the estimated savings are too optimistic.

## 3. Resource-Centric App With Uploads And Collaboration

### Why v0.2 helps, but not enough

v0.2 gets the app to a serious baseline, but still leaves a lot of bespoke work
for:

- upload metadata
- asset linkage
- review/approval states
- activity surfaces
- user- and workspace-scoped access rules

### Why v0.3 should be a major jump

This archetype is where the top 5 expansion items line up directly with the app
shape:

- policy scaffolds
- resource recipes
- asset lifecycle
- form generation
- workflow/event primitives

### Stress test

If after v0.3 the agent still spends many turns hand-writing:

- asset metadata tables and attach flows
- ownership-aware list/detail filters
- review/approval transitions
- activity/event recording
- notification plumbing for lifecycle changes

then Stylyf is not yet delivering the expected jump for this category.

## 4. Sophisticated Multi-Role, Media-Capable SaaS

### Why v0.2 still leaves a lot of work

This category adds:

- more nuanced policy
- richer lifecycle logic
- more stateful workflows
- media handling
- role or workspace concepts
- more edge cases

### Why v0.3 still matters a lot

Even here, large chunks are repetitive:

- base ownership and authz
- resource CRUD
- upload metadata
- standard forms
- workflow transitions and event logs

So the reduction is not as dominant in percentage terms, but it is large in
absolute turns saved.

### Stress test

If the scaffold still only accelerates baseline setup, and not actual product
mechanics, then this category will remain too expensive and the v0.3 goal will
not be met.

## Broadness Stress Test

The v0.3 thesis fails if the gains only show up in one narrow product family.

After implementation, we should explicitly test whether the same abstractions
help all of these:

1. internal admin app
- owned resources
- role-based access
- approvals or status workflows

2. customer-facing SaaS dashboard
- accounts, settings, uploads, notifications

3. marketplace or catalog app
- resources with attachments, visibility, ownership, review states

4. collaboration or review product
- shared resources, events, notifications, richer attachment use

If one or more of the top 5 only feels natural in one family, that expansion is
too genre-shaped and should be reconsidered.

## What Could Make These Estimates Wrong

The main failure modes are:

1. The DSL becomes too deep
- If the new IR becomes hard to write or reason about, the gains collapse.

2. The generated source is too generic
- If the output is technically scaffolded but still requires major rewrites, the
  turn savings will not materialize.

3. Portable and hosted branches drift too far apart
- If the abstractions no longer map cleanly to both backend modes, maintenance
  cost will eat the benefit.

4. Policy generation is too weak or too risky
- If generated access defaults are insecure, agents will need to rewrite them.
- If generated access defaults are too conservative and block common flows,
  agents will also need to rewrite them.

5. Asset lifecycle remains bucket-only
- Without metadata and attach flows, upload-backed apps still require too much
  custom work.

6. Workflow primitives are too narrow
- If they only fit moderation or social products, they are not broad enough for
  v0.3 core status.

7. Provider-specific constraints leak into the IR
- If the DSL starts reading like Supabase-only or Better-Auth-only config, the
  abstraction has gone too low-level.

## What Would Validate The v0.3 Thesis

The v0.3 thesis is validated if, after implementation, we can generate and
finish one app from each of the following families with materially fewer turns
than v0.2:

- dashboard/admin CRUD app
- upload-backed resource app
- workflow-heavy SaaS app
- collaboration/review app

And specifically, the agent should no longer need to hand-assemble most of:

- ownership checks
- resource CRUD route/server patterns
- create/edit forms
- upload metadata plumbing
- workflow transitions and event logging
- baseline notification or activity surfaces

## What To Measure Once v0.3 Lands

For each archetype, measure:

1. turns to first serious deliverable from a blank prompt
2. turns spent on pure baseline setup
3. turns spent on policy/ownership rewrites
4. turns spent on CRUD boilerplate
5. turns spent on upload/asset plumbing
6. turns spent on workflow/event mechanics

This matters because “turns saved” should come specifically from the new
expansion items, not from unrelated prompt variance.

## Predicted Outcome

My current expectation is:

- v0.2 is already enough to make categories 1 and 2 clearly easier
- v0.3 should materially move categories 2 through 4
- if implemented cleanly, v0.3 makes the claim “basic SaaS building becomes at
  least 50% easier for coding agents” believable for categories 2 through 4

That is the benchmark this branch should be held against.

## Decision Use

This document should be used in two ways:

1. before implementation
- as the justification for why the v0.3 top 5 are worth building

2. after implementation
- as the benchmark to check whether the branch actually moved the needle

If post-v0.3 dogfooding does not support these ranges, then the next release
should prioritize whichever of the top 5 underperformed in real usage rather
than expanding the DSL breadth further.
