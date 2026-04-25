# Stylyf CLI v1.0 Release Plan

## Intent

Stylyf v1.0 turns the current v0.5 scaffold compiler into a production-grade
baseline generator for standalone SolidStart apps.

This is not a backwards-compatible grammar migration. The public IR becomes
`SpecV10`, examples move to `version: "1.0"`, and stale v0.4/v0.5 naming is
removed instead of preserved behind adapters. Generated apps must remain
ordinary source trees with no runtime dependency on this repo or on
`@depths/stylyf-cli`.

The 21 changes below correspond exactly to the v0.5 review:

- 6 correctness/security fixes.
- 10 production-grade scaffold enhancements.
- 5 CLI ergonomics enhancements.

Each item should land as its own commit. The branch should preserve all
intermediate commits; never squash merge this work.

## Current Codebase Seams

Primary source seams:

- Public spec types and grammar: `packages/stylyf-cli/src/spec/types.ts`.
- Public validation: `packages/stylyf-cli/src/spec/validate.ts`.
- Explicit chunk composition: `packages/stylyf-cli/src/spec/compose.ts`.
- Intent expansion: `packages/stylyf-cli/src/compiler/expand.ts`.
- Private generated app IR: `packages/stylyf-cli/src/compiler/generated-app.ts`.
- Generation plan: `packages/stylyf-cli/src/compiler/plan.ts`.
- Project emission: `packages/stylyf-cli/src/generators/generate.ts`.
- Generated project package/config: `packages/stylyf-cli/src/generators/project.ts`.
- Backend generation: `packages/stylyf-cli/src/generators/backend/*`.
- Search/introspection: `packages/stylyf-cli/src/search/index.ts`.
- Intro/docs generation: `packages/stylyf-cli/src/generators/intro.ts`.
- Source-owned UI inventory: `packages/stylyf-source/src/lib/registry.ts`.
- Bundled manifest build: `scripts/build-stylyf-cli-manifests.ts`.
- Package verification: `scripts/verify-stylyf-cli-package.mjs`.

Supporting generated assets:

- `packages/stylyf-cli/src/manifests/generated/assembly-registry.json`.
- `packages/stylyf-cli/src/manifests/generated/theme-grammar.json`.
- `packages/stylyf-cli/src/assets/source`.

## Release Discipline

After each implementation commit:

1. Re-read the relevant section of this plan and the changed source seams.
2. Run the leanest useful validation for that commit.
3. Prefer generated-app validation over source-only assumptions.
4. Commit and push before starting the next item.

Minimum checkpoints:

- Type/package changes: `npm run cli:build`.
- Generator/package changes: `npm run cli:verify-pack`.
- Landing changes, if any: `npm --prefix apps/landing run check` and build.
- Final release gate: `npm run cli:build`, `npm run cli:verify-pack`,
  `npm run build`, and `npm run check`.

## Commit-by-Commit Plan

### 0. Planning Baseline

Commit message: `docs: plan stylyf cli v1 release`

Scope:

- Track `REVIEW_v0_5.md`.
- Add this `V1_0_RELEASE_PLAN.md`.

Validation:

- Markdown-only commit; no build required.

### 1. Fix CMS/Admin Route Protection

Commit message: `fix: protect admin surfaces independent of shell`

Addresses review fix 1.

Problem:

- `shellForSurface` currently maps `content-index` and `content-detail` to
  `marketing-shell` before considering admin/editor audience.
- `protectedRoutes` then drops marketing-shell routes.
- This can make `/admin/content` visually admin-scoped but absent from auth
  middleware protection.

Implementation:

- In `compiler/expand.ts`, make shell selection audience-first:
  admin/editor/user surfaces must use the app fallback shell unless explicitly
  overridden.
- Compute route protection only from `route.access`, never from shell id.
- Make explicit route defaults conservative: if `route.access` is omitted,
  derive from an explicit public marketing route only when the route declares
  public access or audience through a surface; otherwise default to `user`.
- Add a verify-pack CMS case that asserts `/admin/content` appears in generated
  middleware/protection outputs.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 2. Promote Public Grammar to SpecV10

Commit message: `feat: promote public spec grammar to v1`

Addresses review fix 2.

Implementation:

- Rename `StylyfSpecV04` to `StylyfSpecV10`.
- Rename `validateSpecV04` and `readSpecV04` to v1 equivalents.
- Require `version: "1.0"` everywhere.
- Update `CLI_VERSION` and package version to `1.0.0`.
- Update command copy in `index.ts`, `new`, `validate`, `plan`, `compose`,
  `generate`, `intro`, examples, README, and verify-pack fixtures.
- Do not keep compatibility for `version: "0.4"`.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 3. Add Source-Owned Composition Prop Contracts

Commit message: `feat: add source-owned composition prop contracts`

Addresses review fix 3.

Implementation:

- Add a prop contract manifest source, likely
  `packages/stylyf-cli/src/manifests/props.ts`, for layout nodes and registry
  components.
- Cover layout props first: `stack`, `row`, `column`, `grid`, `split`,
  `panel`, `section`, `toolbar`, `content-frame`.
- Include prop name, type, enum/domain where useful, default, description, and
  safe example.
- Add explicit alias support only where source-owned and documented. The known
  first alias is `grid.props.columns -> grid.props.cols`.
- Extend `scripts/build-stylyf-cli-manifests.ts` so generated registry entries
  can expose machine-operable prop metadata without guessing from TSX.

Validation:

- `npm run cli:build`.
- Search output manually for grid/layout prop metadata.

### 4. Enforce Deep Prop Validation

Commit message: `fix: validate composition props deeply`

Addresses review fix 3.

Implementation:

- In `spec/validate.ts`, validate layout prop names and value domains from the
  prop contract manifest.
- Validate component props when a component has a contract.
- Normalize documented aliases during composition/validation before expansion,
  or reject unsupported aliases with a precise error.
- Update the intro composition example to use `cols`, not `columns`, unless the
  alias is intentionally shown as an alias.
- Add failing/pass fixtures to verify-pack for unsupported layout props and the
  grid alias.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 5. Add Route Binding DSL

Commit message: `feat: add route binding grammar`

Addresses review fix 4.

Implementation:

- Add v1 route/section/component binding types:
  `resource.list`, `resource.detail`, `resource.create`, `resource.update`,
  `workflow.transition`, and `attachment.lifecycle`.
- Keep bindings at route/page-shell level, not inside pure registry
  components.
- Extend `GeneratedApp` IR with normalized `bindings`.
- Validate binding references against declared objects, flows, media, and
  generated server modules.
- Extend `stylyf plan --resolved` to show binding targets.

Validation:

- `npm run cli:build`.
- Add verify-pack assertions that bindings survive spec -> plan -> app IR.

### 6. Generate Data-Bound Routes

Commit message: `feat: generate data-bound page routes`

Addresses review fix 4.

Implementation:

- Teach `generators/generate.ts` to import generated server queries/actions
  for bound routes.
- Generate SolidStart route code using `createAsync`, route params,
  action submissions, loading states, empty states, and error fallbacks.
- Keep registry components pure; pass only data/result props where supported by
  contracts, otherwise wrap with generated route-level presentation.
- Ensure list/detail/create/update routes use generated resource functions by
  default when a resource is present.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 7. Add Roles and Membership Policy Model

Commit message: `feat: add roles and membership policy model`

Addresses review fix 5.

Implementation:

- Add v1 `policies` grammar for roles, memberships, workspace ownership,
  and actor mapping.
- Materialize workspace membership tables when `ownership: "workspace"` or
  actor kinds require them.
- Generate helper functions for `requireRole`, `requireWorkspaceMember`, and
  `requireOwner`.
- Make admin/editor semantics explicit and fail closed unless the spec wires
  roles/membership tables.

Validation:

- `npm run cli:build`.
- Generated portable app should include membership schema/helpers when needed.

### 8. Emit Supabase RLS From the Policy Model

Commit message: `feat: generate supabase policies from roles`

Addresses review fix 5.

Implementation:

- Compile the same `policies` model into Supabase SQL.
- Generate membership table SQL, indexes, and RLS policies.
- Keep fail-closed SQL for unresolved admin policies.
- Add SQL comments that distinguish generated baseline policies from app-owned
  business hardening.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 9. Add API Contract DSL

Commit message: `feat: add api contract grammar`

Addresses review fix 6.

Implementation:

- Extend `ApiRouteSpec` with request schema, response schema, auth, rate-limit
  intent, idempotency intent, and webhook signature provider.
- Add schema primitives reusable by API routes and forms.
- Validate method/type/schema combinations.
- Do not retain placeholder-only API route semantics as the default; mark
  draft routes explicitly when schema is omitted.

Validation:

- `npm run cli:build`.
- Verify invalid API schema combinations fail validation.

### 10. Generate Contracted API Routes

Commit message: `feat: generate contracted api routes`

Addresses review fix 6.

Implementation:

- Emit request parsing and validation helpers.
- Emit normalized JSON success/error helpers.
- Emit webhook signature verification stubs with safe fail-closed defaults.
- Emit idempotency/rate-limit TODOs as explicit generated contracts where
  provider details are not configured.
- Emit a machine-readable API summary such as `src/api.contracts.json` or
  `openapi.json`.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 11. Generate Test Harness

Commit message: `feat: generate app smoke test harness`

Addresses scaffold enhancement A.

Implementation:

- Generated files:
  `playwright.config.ts`, `tests/smoke/routes.spec.ts`,
  `tests/smoke/auth.spec.ts`, `tests/smoke/resource-forms.spec.ts`, and
  `src/lib/test/factories.ts`.
- Generated scripts: `test`, `test:e2e`, `test:smoke`, `test:types`.
- Tests should be provider-aware and safe when env is absent: static route and
  unauthenticated behavior checks can run without cloud credentials.

Validation:

- `npm run cli:build`.
- Generate one app with `--no-install` and inspect package/test files.
- Full verify-pack once package cost is acceptable.

### 12. Generate Production Env Profiles and Preflight

Commit message: `feat: generate env profiles and preflight`

Addresses scaffold enhancement B.

Implementation:

- Split env generation into:
  `.env.local.example`, `.env.production.example`,
  `src/lib/env.server.ts`, `src/lib/env.public.ts`, and
  `src/lib/env.check.ts`.
- Keep `src/lib/env.ts` only if it is a thin re-export.
- Add `npm run env:check` and `npm run preflight`.
- Validate base URLs, auth URLs, DB mode, required secrets, storage endpoint,
  and public/server exposure.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 13. Add Schema Constraints and Migration Expressiveness

Commit message: `feat: add database constraint grammar`

Addresses scaffold enhancement C.

Implementation:

- Extend database/resource fields with indexes, compound unique constraints,
  defaults, foreign keys, check constraints, cascade behavior, soft deletes,
  audit fields, and timestamp update semantics.
- Compile the model into Drizzle and Supabase SQL.
- Ensure relation-derived constraints are not duplicated.

Validation:

- `npm run cli:build`.
- Generated Drizzle schema and Supabase SQL should include representative
  constraints in verify-pack fixtures.

### 14. Generate Seed Data and Factories

Commit message: `feat: generate seed data and factories`

Addresses scaffold enhancement D.

Implementation:

- Add DSL support for `fixtures` / `seed` / fake data intent.
- Generate `src/lib/server/seed.ts`, `scripts/seed.ts`, and
  `tests/factories/*.ts`.
- Keep seed execution explicit; never auto-run seed scripts during generation.
- Make factories resource- and relation-aware.

Validation:

- `npm run cli:build`.
- Generated app should typecheck after install.

### 15. Make Component Inventory Machine-Operable

Commit message: `feat: enrich component inventory contracts`

Addresses scaffold enhancement E.

Implementation:

- Extend assembly registry entries with `props`, `requiredProps`, `slots`,
  `events`, `controlledState`, `defaultDataShape`, `recommendedBindings`,
  `a11yNotes`, and `compositionExamples`.
- Prefer source-owned metadata from `stylyf-source` registry records over
  brittle TSX parsing.
- Ensure `stylyf search --json` returns safe composition payloads.

Validation:

- `npm run cli:build`.
- Inspect generated `assembly-registry.json` for representative components.

### 16. Add Navigation and Shell Semantics

Commit message: `feat: add navigation shell grammar`

Addresses scaffold enhancement F.

Implementation:

- Add DSL support for primary nav, secondary nav, route groups, breadcrumbs,
  user menu, command menu entries, and visibility by auth/role.
- Generate shell props/config files consumed by app shell templates.
- Avoid disconnected page islands by deriving nav from routes when explicit nav
  is absent.

Validation:

- `npm run cli:build`.
- Generated internal-tool and CMS apps should show coherent nav config.

### 17. Add Route Metadata and SEO Primitives

Commit message: `feat: add route metadata grammar`

Addresses scaffold enhancement G.

Implementation:

- Add route/surface metadata for title, description, canonical, robots,
  OpenGraph, and structured-data intent.
- Generate SolidStart metadata code in routes.
- Produce public-site defaults for landing/content routes and private noindex
  defaults for authenticated app routes.

Validation:

- `npm run cli:build`.
- Generated routes should include provider-appropriate metadata.

### 18. Harden Object Storage Policy and Lifecycle

Commit message: `feat: add storage policy lifecycle knobs`

Addresses scaffold enhancement H.

Implementation:

- Extend media/storage grammar with max file size, allowed content types,
  key prefixes, expiration windows, private/public object policy, and
  lifecycle/delete semantics.
- Enforce these in generated presign/confirm/replace/delete routes.
- Keep all raw storage credentials server-only.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

### 19. Generate Observability and Health Baseline

Commit message: `feat: generate observability baseline`

Addresses scaffold enhancement I.

Implementation:

- Generate health/readiness routes that check configured DB/storage/auth
  dependencies without leaking secrets.
- Generate minimal structured logging helpers.
- Generate a `SECURITY_NOTES.md` and `OPERATIONS.md` section that reflects the
  actual chosen backend path.

Validation:

- `npm run cli:build`.
- Generated API health route should be present in verify-pack outputs.

### 20. Add Opt-In Deployment Profiles

Commit message: `feat: add deployment profile scaffolds`

Addresses scaffold enhancement J.

Implementation:

- Add explicit deployment profile grammar for none/node/docker/systemd/caddy
  style outputs.
- Keep deployment generation opt-in and source-only.
- Emit minimal deployment notes/files without bespoke state scripts.
- Do not make this repo's live deployment shape the default for generated
  apps.

Validation:

- `npm run cli:build`.
- Verify generated apps omit deployment files by default and include them only
  when requested.

### 21. Add CLI Doctor, Inspect, Explain, Deep Validate, and Dry Run

Commit message: `feat: add v1 operator ergonomics commands`

Addresses CLI enhancements 1-5.

Implementation:

- Add `stylyf doctor` for package/runtime/dependency/env sanity.
- Add `stylyf inspect component <id>` for prop contracts, slots, examples,
  bindings, and source path.
- Add `stylyf compose --explain` to report explicit merge decisions.
- Add `stylyf validate --deep` for cross-reference, prop, policy, binding,
  schema, and generated-contract checks.
- Add `stylyf generate --dry-run` to show files, operations, and dependency
  plan without writing.
- Update intro/README to teach the v1 operator loop.

Validation:

- `npm run cli:build`.
- `npm run cli:verify-pack`.

## Final Release Gate

After all 21 implementation commits:

1. Run `npm run cli:build`.
2. Run `npm run cli:verify-pack`.
3. Run `npm run build`.
4. Run `npm run check`.
5. Run `npm --prefix packages/stylyf-cli publish --access public --dry-run`.
6. Open and merge a PR without squash.
7. Publish with `npm --prefix packages/stylyf-cli publish --access public`.
8. Create a GitHub release for `v1.0.0`.

## Bloat-Cutting Rules

- Delete stale v0.4/v0.5 naming rather than layering aliases.
- Remove obsolete docs/examples when v1 docs replace them.
- Prefer one source-owned contract over duplicate heuristics.
- Keep generated apps explicit and boring; no runtime magic, no hidden remote
  dependency, no repo-relative imports.
- Keep templates small by moving repeated generated logic into generated
  helper modules inside the emitted app.
