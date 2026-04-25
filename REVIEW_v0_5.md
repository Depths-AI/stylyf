# Stylyf CLI v0.5 Review

## Scope

This review covers the source-owned CLI package and its bundled source inventory:

- `packages/stylyf-cli/src`
- `packages/stylyf-cli/src/templates`
- `packages/stylyf-cli/src/manifests/generated`
- `packages/stylyf-cli/examples`
- `packages/stylyf-cli/README.md`
- `packages/stylyf-source/src`
- repo-level CLI build, sync, and package verification scripts

The generated `packages/stylyf-cli/dist` tree is treated as build output, not as the source of truth.

## Current Architecture

Stylyf v0.5 is structurally sound as an agent-operated scaffolding compiler:

- The CLI entrypoint is small and command-dispatched through `src/index.ts`.
- Public authoring is a validated JSON spec in `src/spec/types.ts` and `src/spec/validate.ts`.
- `stylyf compose` merges explicit additive spec fragments without directory magic.
- `expandSpecToGeneratedApp` maps the public spec into a private app model.
- `generateFrontendDraftFromApp` emits a standalone SolidStart app with no runtime dependency on this repo.
- `packages/stylyf-source` remains the source-owned UI inventory and styling grammar.
- `scripts/verify-stylyf-cli-package.mjs` verifies the packed CLI outside the repo and checks core archetypes.

The package is no longer just a frontend generator. It now covers app shells, routes, page shells, layout primitives, registry UI, theme grammar, Better Auth + Drizzle, Supabase, Tigris/S3-compatible storage, resource forms, resource policies, attachments, workflows, generated server modules, API routes, and handoff docs.

## Highest-Priority Findings

### 1. Protected CMS admin content routes can accidentally become public

`cmsSiteExpansion` declares `/admin/content` as an admin audience route, but with `kind: "content-index"`:

- `packages/stylyf-cli/src/compiler/kinds/cms-site.ts:44`

`shellForSurface` maps all `content-index` and `content-detail` surfaces to `marketing-shell`, regardless of audience:

- `packages/stylyf-cli/src/compiler/expand.ts:352`

`protectedRoutes` then excludes every marketing-shell route from middleware protection:

- `packages/stylyf-cli/src/compiler/expand.ts:291`

This combination means an admin-intended CMS content index can be generated with `access: "user"` but omitted from auth middleware because it used a marketing shell. This is the most important correctness/security issue to fix.

Recommended fix:

- Make `shellForSurface` branch on audience before kind.
- Never derive auth protection from shell choice.
- Compute protection solely from explicit `route.access`.
- Add a verify-pack assertion that generated CMS `/admin/content` is protected.

### 2. The public package version is v0.5, but the public DSL still identifies as v0.4

The package is `0.5.0`, but the public spec type, validator, examples, command copy, intro, manifests, and README are still v0.4-branded:

- `packages/stylyf-cli/src/spec/types.ts:194`
- `packages/stylyf-cli/src/spec/validate.ts:678`
- `packages/stylyf-cli/src/index.ts:27`

This is not inherently wrong if the DSL really is `SpecV04`, but it weakens cold-start clarity for agents because v0.5 shipped meaningful DSL and composition depth.

Recommended fix:

- Split package version from spec version intentionally.
- Either rename the current grammar to `SpecV05`, or explicitly document: "Stylyf CLI v0.5 uses stable SpecV04 grammar."
- Add a `stylyf version --json` or `stylyf intro --topic versions` output showing package version, supported spec versions, and default generated stack.

### 3. Component and layout props are too weakly validated

`ComponentSpec.props` is `Record<string, unknown>`, and layout props only validate primitive values:

- `packages/stylyf-cli/src/spec/types.ts:117`
- `packages/stylyf-cli/src/spec/validate.ts:122`
- `packages/stylyf-cli/src/spec/validate.ts:147`

The bundled intro example uses `props: { columns: 2 }` for `grid`, but the generated `Grid` template expects `cols`, not `columns`:

- `packages/stylyf-cli/src/generators/intro.ts:351`
- `packages/stylyf-cli/src/templates/layouts/grid.tsx.tpl:25`

This is exactly the kind of drift that makes agent composition feel expressive but not reliably production-grade.

Recommended fix:

- Add a source-owned prop contract manifest for layouts and registry components.
- Validate layout prop names and obvious prop value domains at spec validation time.
- Teach `stylyf search` and `stylyf intro --topic composition` to surface valid props.
- Convert common aliases such as `columns -> cols` only if the alias is explicitly owned and documented.

### 4. Route/page generation is static and not data-bound enough

Routes render sections and components, but the composition model cannot yet express data dependencies, route params, query state, form action bindings, async resources, empty/error states, or slot-level wiring.

Current route rendering is mostly static JSX:

- `packages/stylyf-cli/src/generators/generate.ts:374`
- `packages/stylyf-cli/src/generators/generate.ts:421`

This is fine for first drafts, but production-quality SaaS scaffolds need the generated UI to be wired to generated resources by default.

Recommended fix:

- Add a `bindings` layer to route/section/component specs.
- Support `resource.list`, `resource.detail`, `resource.create`, `resource.update`, `workflow.transition`, and `attachment.lifecycle` bindings.
- Generate `createAsync`, `query`, `action`, `useSubmission`, loading, empty, and error states from that binding layer.
- Keep components pure; put all wiring in generated routes/page shells.

### 5. Auth and policy concepts are present but not fully realized

The spec includes `actors`, `ownership`, `access`, and workflow transition actors, but `actors` is mostly descriptive and role-backed auth is intentionally fail-closed for admin paths.

This is safe, but it means "admin", "editor", and "workspace-member" can generate code that needs substantial follow-up before it is genuinely production-ready.

Recommended fix:

- Add a first-class `roles` / `memberships` policy module scaffold.
- Generate optional workspace membership tables and helper functions when `ownership: "workspace"` or actor kinds require it.
- Add explicit generated docs explaining which policies are fully wired and which fail closed.
- For Supabase, generate RLS policy variants from the same policy model and add test SQL fixtures.

### 6. Generated API routes are placeholders, not production contracts

The API route templates prove file generation works, but they do not yet encode request/response schemas, input validation, auth scopes beyond public/user, idempotency, webhook signature verification, or error normalization.

Examples:

- `packages/stylyf-cli/src/templates/api-routes/json.ts.tpl`
- `packages/stylyf-cli/src/templates/api-routes/webhook.ts.tpl`
- `packages/stylyf-cli/src/templates/api-routes/presign-upload.ts.tpl`

Recommended fix:

- Add an API contract DSL with request schema, response schema, auth, rate limit intent, and webhook signature provider.
- Emit validation helpers and consistent JSON error helpers.
- Emit an `openapi.json` or similar machine-readable API summary for generated endpoints.
- Keep placeholder routes available, but mark them as draft explicitly.

## Production-Quality Scaffolding Enhancements

### A. Add a generated test harness to every emitted app

Current repo-level smoke testing is strong, but generated apps do not receive their own durable test harness by default.

Add generated files:

- `tests/smoke/auth.spec.ts`
- `tests/smoke/routes.spec.ts`
- `tests/smoke/resource-forms.spec.ts`
- `playwright.config.ts`
- `src/lib/test/factories.ts`

Generated scripts:

- `test`
- `test:e2e`
- `test:smoke`
- `test:types`

This would let a downstream agent immediately verify route protection, login page rendering, CRUD forms, attachment intents, and public routes after generation.

### B. Emit production env profiles, not only `.env.example`

`src/lib/env.ts` and `.env.example` are useful, but production scaffolds need environment profiles and deployment checks.

Add generated files:

- `.env.local.example`
- `.env.production.example`
- `src/lib/env.server.ts`
- `src/lib/env.public.ts`
- `src/lib/env.check.ts`

Add commands:

- `npm run env:check`
- `npm run preflight`

The generated preflight should verify required secrets, base URL consistency, database mode, storage credentials, and auth URL shape without starting the app.

### C. Add schema-level constraints and migrations beyond basic columns

Current resource fields map into database columns, and `database.schema` can add tables. Production scaffolds need more schema expressiveness.

Add DSL support for:

- indexes
- compound unique constraints
- default values
- foreign keys
- check constraints
- cascade behavior
- soft-delete fields
- audit fields
- timestamps with update triggers

This should compile to both Drizzle schema and Supabase SQL from one source-owned model.

### D. Generate seed data and factories

Most app scaffolds need credible local data immediately.

Add DSL support:

- `fixtures`
- `seed`
- object-level fake data intent
- relationship-aware factories

Generated files:

- `src/lib/server/seed.ts`
- `scripts/seed.ts`
- `tests/factories/*.ts`

This makes internal tools, CMS sites, and free SaaS tools far easier to inspect visually and interactively after generation.

### E. Make the component inventory more machine-operable

The assembly registry has 70 components and includes snippets, descriptions, style params, state params, import paths, and local dependencies. It does not yet expose enough structured prop-level data for precise composition.

Add manifest fields:

- `props`
- `requiredProps`
- `slots`
- `events`
- `controlledState`
- `defaultDataShape`
- `recommendedBindings`
- `a11yNotes`
- `compositionExamples`

Then make `stylyf search` capable of returning "safe composition payloads" an agent can paste into spec chunks without guessing.

### F. Add navigation and shell semantics to the DSL

Current surfaces imply routes, but navigation is mostly shell-template placeholder content.

Add DSL support for:

- primary nav
- secondary nav
- route groups
- breadcrumbs
- user menu
- command menu entries
- nav visibility by auth state/role

This would make generated apps feel like coherent products instead of disconnected pages.

### G. Add route metadata and SEO primitives

Generated routes set a simple `<Title>`, but production sites need route-level metadata.

Add DSL support:

- `meta.title`
- `meta.description`
- `meta.robots`
- `meta.openGraph`
- canonical path
- sitemap inclusion

This matters especially for `cms-site`, `free-saas-tool`, and public `generic` apps.

### H. Add object storage policy and lifecycle knobs

Storage currently generates presigned PUT and delete helpers. Production object handling needs more guardrails.

Add DSL support:

- max file size
- allowed content types
- object key strategy
- visibility mode
- retention policy
- replacement policy
- moderation hook
- image derivative intent

Generated code should reject disallowed content types before presigning and should store size/type metadata consistently.

### I. Add observability and operational health scaffolds

Generated apps should include production basics:

- `/api/health`
- `/api/ready`
- structured error responses
- server logging helper
- request id helper
- global error boundary
- not-found route

This is highly reusable and not domain-specific.

### J. Add deployment profiles as optional generated artifacts

Stylyf should not become a deployment platform, but production-quality scaffolds benefit from standard deployment files.

Add optional profiles:

- `node-server`
- `docker`
- `systemd-caddy`
- `vercel-like`

Generated artifacts can include `Dockerfile`, `.dockerignore`, `Caddyfile.example`, `systemd` examples, and deployment preflight docs. Keep this opt-in so the core app remains clean.

## CLI Ergonomics Enhancements

### 1. Add `stylyf doctor`

`doctor` should inspect:

- CLI package version
- Node version
- npm version
- valid spec file
- generated plan
- target directory conflicts
- env completeness
- generated app package install/build readiness

This would reduce downstream debugging turns substantially.

### 2. Add `stylyf inspect component <id>`

The current search command is useful but too broad for exact composition. Add an inspect command that returns:

- import path
- export name
- props
- slot expectations
- example JSON component node
- known dependencies

### 3. Add `stylyf compose --explain`

Current merge behavior is deterministic but not transparent enough when specs get deeper.

`--explain` should report:

- added objects
- replaced objects
- merged fields
- replaced routes
- added routes
- prop conflicts
- unknown refs

### 4. Add `stylyf validate --deep`

Deep validation should verify:

- component ids exist in assembly registry
- layout prop names match layout contracts
- component prop names match component contracts
- route paths do not collide unexpectedly
- auth-protected surfaces are actually middleware-protected
- object schemas have primary keys
- workflows reference valid states and fields
- API routes do not collide with auth or attachment routes

### 5. Add `stylyf generate --dry-run`

The current `plan` command shows files, but a dry-run should include:

- exact file paths
- overwrite risk
- dependency additions
- post-generate commands
- generated warnings

## Validation Gaps

The current verification is valuable:

- package build
- package tarball contents
- installed binary outside repo
- archetype generation
- generated app no-repo-import assertions

The next validation layer should add:

- generated app `npm install`
- generated app `npm run check`
- generated app `npm run build`
- Playwright screenshots for at least one portable app and one hosted app shell
- explicit protected-route redirect checks
- CMS admin protection regression check
- layout prop validation regression check
- `stylyf compose` conflict/explain checks

The existing `scripts/smoke-stylyf-generated-app.sh` already does a heavier portable runtime smoke. It should become part of release cadence when VPS/package-install constraints allow it.

## Concrete v0.6 Candidate Plan

If the goal is to push generated apps closer to production quality without becoming product-specific, the highest-leverage sequence is:

1. Fix auth protection derivation and CMS admin shell/access behavior.
2. Introduce source-owned prop contracts for layouts and registry components.
3. Add deep validation for component refs, layout props, route collisions, and protected route coverage.
4. Add route/resource data binding DSL for generated queries/actions/forms/loading/error states.
5. Add generated test harness and `stylyf doctor`.
6. Add richer database constraints, indexes, defaults, and seed/factory generation.
7. Add API contract schemas and normalized error helpers.
8. Add storage policy knobs for file size, content type, visibility, retention, and lifecycle.
9. Add navigation semantics and route metadata.
10. Add opt-in deployment profiles and production preflight docs.

## Bottom Line

Stylyf v0.5 has the right compiler architecture and enough breadth to scaffold real full-stack SolidStart app drafts. The next jump is not adding niche app kinds. The next jump is making the existing generalized mechanics stricter, more data-bound, more testable, and more production-aware.

The highest-value direction is a "deep validation + binding + generated test harness" release. That would preserve the compact DSL while making the emitted app far more reliable for an agent to continue from without rediscovering route wiring, policy holes, component props, or smoke-test setup by hand.
