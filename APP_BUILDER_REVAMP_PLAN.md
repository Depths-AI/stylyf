# Stylyf App Builder Revamp Plan

## Purpose

This plan rewires the v1.1 internal builder around the intended authoring experience:

1. User logs in.
2. User lands on a clean dashboard with existing projects and one clear create action.
3. Creating a project asks only for a project name.
4. The server derives everything else: slug, workspace, GitHub repo, initial spec path, status, preview port, and agent session bookkeeping.
5. The project editor is a clean AI app-building workbench:
   - chat interface over Codex
   - iframe preview of the generated app
   - visible Stylyf IR panes for key editable app structure
   - timeline for commands, webknife runs, commits, pushes, and errors
6. New projects get an empty standalone workspace with a dedicated injected `AGENTS.md`.
7. The injected project `AGENTS.md` forces the project Codex session to exhaust Stylyf CLI IR/search/generation paths before raw source edits.
8. Webknife validates UI by screenshot and interaction artifacts, not trust-me code review.
9. Every accepted iteration becomes a git commit followed by auto-push.
10. Deployment remains manual after dev review.

The failure mode we are explicitly correcting: a coding agent must not jump straight into hand-editing generated app source while Stylyf CLI can still express the change through IR.

## Research Grounding

- Codex CLI can run locally and inspect/edit/run code in a selected directory, with ChatGPT-account authentication supported by the official CLI setup: https://developers.openai.com/codex/cli
- Codex loads project instructions from `AGENTS.md` along the working directory hierarchy, with more specific project-local instructions included in the agent prompt: https://developers.openai.com/codex/guides/agents-md
- Codex non-interactive mode supports JSONL event output, command/tool/file-change events, `codex exec resume --last`, and broad automation via `--sandbox danger-full-access` / approval settings in controlled environments: https://developers.openai.com/codex/noninteractive
- Codex interactive resume exists as `codex resume --last`; current installed CLI does not expose a literal `--yolo` flag, so the builder must use configurable "YOLO" flags that map locally to `--dangerously-bypass-approvals-and-sandbox` or `codex exec --sandbox danger-full-access --ask-for-approval never`: https://developers.openai.com/codex/cli/reference
- Codex App Server is the richer long-term seam for embedded product UX: JSON-RPC over stdio/websocket, thread/turn events, approvals, and streaming agent activity: https://developers.openai.com/codex/app-server
- GitHub CLI is already authenticated on the VPS and can create PRs/repos and operate from local git workspaces with explicit flags: https://cli.github.com/manual/
- SolidStart file routing and server functions are aligned with our generated app approach; route files own UI/API surfaces, and `"use server"` functions keep privileged work server-only: https://docs.solidjs.com/solid-start/building-your-application/routing and https://docs.solidjs.com/solid-start/reference/server/use-server
- Supabase SSR auth requires cookie-backed sessions instead of browser local storage for server-rendered apps; service role credentials must stay server-only: https://supabase.com/docs/guides/auth/server-side
- Supabase RLS must stay enabled for public tables; service-role/admin operations can bypass RLS only from backend code and never from the browser: https://supabase.com/docs/guides/database/postgres/row-level-security
- AWS SDK v3 presigned URL helpers are the correct object-storage seam for S3-compatible Tigris upload/download/delete flows: https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-s3.html
- Webknife is intended to create repeatable UI artifacts under `.webknife/`, including screenshots, interactions, console/page errors, request failures, typecheck/lint/test outputs, a11y/perf audits, and UI review reports: https://www.npmjs.com/package/@depths/webknife

## Current Codebase Findings

- `packages/stylyf-cli` already has the required app-assembly surface: `intro`, `search`, `inspect`, `new`, `compose`, `validate`, `plan`, and `generate`.
- `packages/stylyf-cli` v1.0.1 is published and installed as `stylyf`; `@depths/webknife` v0.1.0 is published as `webknife`.
- `apps/builder` was generated from `apps/builder/stylyf.spec.json`, but the current spec over-exposes implementation fields on `projects`: `slug`, `status`, `workspacePath`, `previewUrl`, `githubRepoFullName`, and `lastPushedSha`.
- `agent_events` was generated as a standalone CRUD resource, but the product needs a project-scoped timeline, not a top-level CRUD app section.
- `packages/stylyf-builder-core` exists but is still a primitive process/workspace package. It has workspace creation, allowlisted commands, redaction, port allocation, and early Codex adapter abstractions.
- The worktree currently contains partial UI and form edits. They should not be committed as-is. The next implementation pass should either supersede them cleanly or deliberately revert the pieces that conflict with this plan.
- `ISSUES.md` already records scaffold/product issues discovered during this dogfood pass. Every new scaffold defect found during the revamp must be appended there.

## Product Contract

### Login

- Email/password auth only for v1.1.
- Manual team onboarding in Supabase.
- Login screen must feel like an internal product surface, not a generated CRUD card.
- Post-login redirect goes to dashboard.

### Dashboard

- Show existing projects as cards/rows with:
  - name
  - status
  - last activity
  - preview state
  - repo state
  - open workbench action
- Empty state must be confident and simple.
- Primary CTA: `Create project`.

### Create Project

- User-facing form asks exactly one required field:
  - `name`
- Optional v1.1 stretch:
  - a second freeform `brief` box can exist only inside the workbench chat after project creation, not in the initial create form.
- Server-side behavior:
  - derive slug
  - create Supabase project row
  - create local workspace
  - initialize git repository
  - create empty `app/`, `specs/`, `logs/`, `.webknife/`, `screenshots/`
  - write project-local `AGENTS.md`
  - write initial `README.md`
  - create private GitHub repo under Depths AI if GitHub is enabled
  - set remote
  - commit bootstrap files
  - push bootstrap commit
  - redirect to `/projects/:id`

### Workbench

The workbench must be the real product:

- Left/primary pane: chat with Codex.
- Center/right pane: iframe preview.
- Right/secondary rail: activity timeline, checks, screenshots, git events, and approvals.
- Optional editable panes:
  - Brief
  - Style
  - App Kind
  - Routes/Pages
  - Data Objects
  - API Endpoints
  - Media
  - Raw IR
- Panes write explicit Stylyf spec chunks. The hidden server should merge chunks using `stylyf compose`; it should not maintain irreproducible builder-only design state.

## Agent Operating Contract

Every project workspace must receive a generated `AGENTS.md` with these rules:

- You are building a standalone SolidStart app in this workspace.
- Use `stylyf intro` first when project context is missing.
- Use `stylyf search` and `stylyf inspect` before choosing components.
- Use `stylyf new`, `stylyf compose`, `stylyf validate`, `stylyf plan`, and `stylyf generate` for initial and iterative structure changes.
- Prefer modifying explicit spec chunks in `specs/` over raw TSX/CSS edits.
- Only hand-edit generated code when:
  - Stylyf cannot express the requested behavior,
  - a bug exists in emitted code,
  - or local product polish requires hand refinement after IR generation.
- Before every hand-edit, record why the CLI/IR path is insufficient in `handoff.md` or a builder event.
- Run `npm run check` and `npm run build` after structural changes.
- Use `webknife shot`, `webknife interact`, and `webknife ui:review` for UI validation.
- Keep media assets in Tigris/S3-compatible storage via presigned URL flows; do not store variable-sized blobs in Postgres.
- Commit after accepted iterations and push immediately.

## Codex Harness Strategy

### v1.1 Implementation

Use a pragmatic two-layer adapter:

- First adapter: `codex exec --json` and `codex exec resume --last --json`.
- Configurable flags:
  - default controlled local mode: `--sandbox danger-full-access --ask-for-approval never`
  - if the local CLI supports a literal `--yolo`, allow an env override such as `CODEX_RUN_FLAGS="--yolo"`
  - for the installed CLI today, equivalent raw mode is `--dangerously-bypass-approvals-and-sandbox`
- Store thread/session id from JSONL events when available.
- Persist stdout/stderr/event JSONL paths in project logs.
- Surface event stream into `agent_events`.

### v1.1 Later Hardening

- Replace or augment `codex exec` with `codex app-server` once the basic workbench loop is sound.
- Use App Server for richer streamed UI, approvals, and session continuity.
- Keep the app-server adapter behind the same internal `BuilderAgentAdapter` interface.

## Stylyf-First Iteration Loop

For every user chat turn:

1. Builder creates a normalized task packet:
   - project name
   - user prompt
   - current active Stylyf spec
   - selected IR pane state
   - latest validation/build/webknife status
   - explicit "use Stylyf first" contract
2. Codex receives the packet inside the project workspace.
3. Codex must attempt one of:
   - create/update spec chunk
   - run `stylyf compose`
   - run `stylyf validate`
   - run `stylyf plan --resolved`
   - run `stylyf generate`
4. If Codex chooses raw edits, it must record the reason.
5. Builder runs checks:
   - `npm install` only when package manifest changed or generation created a new app
   - `npm run check`
   - `npm run build`
   - webknife screenshot/interact pass for key pages
6. Builder updates iframe preview by starting/restarting local dev server.
7. Builder creates a commit and pushes after accepted progress.

## Preview Strategy

- Generated app dev servers bind to `127.0.0.1`.
- Builder allocates a stable per-project port and stores it.
- The iframe source uses a builder-authenticated proxy route, not a raw public port.
- In local development, direct localhost iframe URLs are acceptable.
- Preview lifecycle:
  - stopped
  - starting
  - running
  - crashed
  - stale after code changes
- Timeline records preview start/stop/crash logs.

## Database Shape

The existing Supabase schema should be revised toward these product objects:

- `profiles`: authenticated team members.
- `projects`: user-visible project metadata plus server-owned lifecycle fields.
- `project_briefs`: versioned brief text/JSON.
- `stylyf_specs`: versioned full specs and active spec pointer.
- `stylyf_spec_chunks`: explicit additive IR chunks created from GUI panes/chat.
- `agent_sessions`: Codex session/thread metadata.
- `agent_events`: project-scoped events only.
- `commands`: command execution metadata with log paths, not raw huge output.
- `preview_processes`: preview port/pid/status.
- `webknife_runs`: artifact paths and summary JSON only.
- `git_events`: repo/commit/push state.
- `asset_pointers`: object storage pointers for uploaded artifacts/screenshots/media when needed.

No variable-sized binary assets go into Postgres. Large logs, screenshots, and media go to filesystem or Tigris with DB pointers.

## UI Direction

The builder should feel closer to Lovable/Bolt/v0 in workflow, but with our own sober internal control-plane taste:

- Minimal dashboard.
- One-field create.
- Workbench with chat and live preview as the center of gravity.
- IR panes are advanced but inviting.
- Logs/checks are visible but not the first thing a non-technical user sees.
- Command/status feedback must be plain English:
  - "Drafting app structure"
  - "Validating Stylyf spec"
  - "Generating source"
  - "Running typecheck"
  - "Taking screenshots"
  - "Committing and pushing"
- Avoid showing raw implementation fields in primary UX.

## Commit-by-Commit Revamp Plan

### Commit 1: Plan and Worktree Triage

- Add this plan.
- Audit current uncommitted partial UI edits.
- Decide which partial edits survive.
- Avoid committing the partial UI rewrite as product work until the workflow architecture is in place.
- Validation: `git diff --stat`, no functional validation expected.

### Commit 2: Builder Core Project Bootstrap Contract

- Extend `packages/stylyf-builder-core` with a first-class project bootstrap function:
  - create workspace
  - write directory skeleton
  - write project `AGENTS.md`
  - write `README.md`
  - initialize git
  - optionally create/link GitHub repo
  - bootstrap commit and push
- Add command result event types that can be saved by the app.
- Validation:
  - `npm run builder-core:check`
  - `npm run builder-core:smoke`

### Commit 3: Dedicated Project AGENTS.md Generator

- Add a source-owned AGENTS template in builder core.
- Include Stylyf-first rules, webknife loop, git/push expectations, and raw-edit escalation rules.
- Include exact command examples:
  - `stylyf intro --topic operator`
  - `stylyf search "<intent>"`
  - `stylyf compose --base specs/base.json --with specs/*.chunk.json --output stylyf.spec.json`
  - `stylyf validate --spec stylyf.spec.json`
  - `stylyf plan --spec stylyf.spec.json --resolved`
  - `stylyf generate --spec stylyf.spec.json --target app`
  - `webknife shot <preview-url> --ci --json`
  - `webknife interact <preview-url> --steps <file> --ci --json`
- Validation:
  - snapshot or text smoke to verify generated AGENTS includes all required commands.

### Commit 4: Supabase Schema Revision for Builder Workbench

- Replace CRUD-oriented schema with project/workbench schema.
- Make `agent_events` project-scoped.
- Add `stylyf_spec_chunks`.
- Add command/webknife/git/preview tables as needed.
- Ensure RLS permits authenticated users to access only their projects unless admin.
- Keep service-role operations server-only.
- Produce SQL for the user to run if schema changes require Supabase dashboard execution.
- Stop at this commit if user intervention is needed to run SQL.
- Validation:
  - SQL static review
  - app typecheck after generated types/helpers update

### Commit 5: Server Actions for One-Field Project Create

- Replace generic project create action with a product action:
  - input: `name`
  - derive slug/status
  - insert project
  - create workspace
  - inject AGENTS
  - initialize git/repo if configured
  - write timeline events
  - redirect to workbench
- Hide all lifecycle fields from create UX.
- Validation:
  - `npm run builder:check`
  - local create action smoke with test user if env is present

### Commit 6: Dashboard UX Rewrite

- Replace generic resource index with a clean project dashboard.
- Remove standalone `agent_events` navigation from primary UI.
- Project cards/rows should lead to workbench.
- Empty state should have one CTA.
- Validation:
  - `npm run builder:check`
  - webknife screenshot of dashboard empty and populated states where possible

### Commit 7: Create Project UX Rewrite

- Replace resource-create shell with one-field create screen.
- Make copy non-technical and confident.
- Do not ask for brief, repo, slug, status, or workspace.
- Validation:
  - `npm run builder:check`
  - webknife interaction: login -> dashboard -> create project form

### Commit 8: Workbench Layout Foundation

- Implement workbench shell:
  - chat pane
  - preview iframe pane
  - activity/checks rail
  - IR tabs/panes
- This commit can use static placeholder data and existing DB rows.
- Validation:
  - `npm run builder:check`
  - webknife screenshot at 1440x1000 and mobile-ish width

### Commit 9: Stylyf IR Pane Model

- Add server/client model for editable IR chunks:
  - brief chunk
  - style chunk
  - routes/pages chunk
  - data objects chunk
  - APIs chunk
  - media chunk
  - raw chunk
- Add merge action using `stylyf compose`.
- Add validate/plan actions using `stylyf validate` and `stylyf plan`.
- Validation:
  - generated chunk fixtures
  - compose/validate smoke in a test workspace

### Commit 10: Codex Exec Adapter Integration

- Wire builder app to `packages/stylyf-builder-core` Codex exec adapter.
- Prefer `codex exec --json` for turns and `codex exec resume --last --json` for continuation.
- Store JSONL events and summaries.
- Make yolo flags configurable through env.
- Ensure redaction before persistence.
- Validation:
  - adapter smoke with a harmless prompt in a temp git repo
  - event persistence smoke

### Commit 11: Chat UX and Turn Lifecycle

- Implement chat submit in workbench.
- Show turn states:
  - queued
  - running
  - needs attention
  - checks running
  - committed/pushed
  - failed
- Render agent messages, command summaries, and next suggested action.
- Validation:
  - `npm run builder:check`
  - local prompt smoke against a project workspace

### Commit 12: Preview Manager

- Add preview process lifecycle:
  - allocate port
  - run generated app dev server
  - stop/restart
  - detect crash
  - store preview status
- Add iframe route/pane.
- For local development, allow direct localhost iframe.
- For production, prepare authenticated proxy path but keep external deployment manual.
- Validation:
  - start preview for a generated app
  - webknife shot through preview URL

### Commit 13: Webknife Review Loop

- Add actions to run:
  - screenshot
  - interaction scripts
  - ui review
  - typecheck/build via webknife or npm commands
- Store artifact paths and summaries.
- Render latest screenshots in workbench.
- Validation:
  - run webknife against a local preview
  - inspect screenshots manually before continuing

### Commit 14: GitHub Repo and Push Automation

- Make GitHub creation/push path explicit and recoverable:
  - `gh auth status` preflight
  - `gh repo create Depths-AI/<slug> --private`
  - remote set
  - commit
  - push
- Auto-push after accepted iterations.
- Record `git_events`.
- Never squash internal builder work.
- Validation:
  - dry-run or test repo creation flag path if available
  - git local smoke at minimum

### Commit 15: Visual Polish Pass with Webknife

- Start local builder server.
- Use webknife screenshots for:
  - login
  - dashboard empty
  - dashboard with projects
  - create project
  - workbench idle
  - workbench running
  - workbench with screenshots/checks
- Iterate until the product feels like an AI app builder, not CRUD admin.
- Validation:
  - attach/inspect artifacts locally
  - `npm run builder:check`
  - `npm run builder:build`

### Commit 16: Dogfood the Builder with a Real Project

- Use the builder to create a small sample app.
- Confirm:
  - project create asks only for name
  - AGENTS.md is injected
  - Codex session uses Stylyf first
  - generated app appears in iframe
  - webknife captures screenshots
  - git commit and push happen
- Append all scaffold/product defects to `ISSUES.md`.
- Validation:
  - generated app `npm run check`
  - generated app `npm run build`
  - webknife screenshots

### Commit 17: Documentation and Operations

- Update builder handoff/operations docs.
- Document env keys by name only.
- Document global tool requirement:
  - `npm i -g @depths/stylyf-cli@latest @depths/webknife@latest @openai/codex@latest`
- Document Codex auth assumption:
  - one controlled VPS Codex login for v1.1
- Document GitHub assumption:
  - `gh` logged in with repo/org permissions.
- Validation:
  - docs review
  - no secrets printed

### Commit 18: Final Sanity and Deployment Prep

- Run:
  - `npm run builder-core:check`
  - `npm run builder-core:smoke`
  - `npm run builder:check`
  - `npm run builder:build`
  - webknife smoke screenshots
- Prepare clean deployment refresh only after screenshots are acceptable.
- Commit final fixes.

## Non-Goals for This Revamp

- No multi-tenant Codex identity model.
- No per-user ChatGPT subscription delegation.
- No automatic production deployment of generated apps.
- No broad no-code visual editor.
- No storing large artifacts in Postgres.
- No replacing Stylyf CLI with raw agent coding as the normal path.

## Definition of Done

- A non-technical user can log in, see projects, create a project by entering only a name, and land in a workbench.
- A new workspace contains a dedicated AGENTS.md that tells Codex how to use Stylyf and Webknife.
- Codex turns are routed through a controlled server harness.
- The app visibly uses Stylyf IR/spec chunks for iterative composition.
- The preview iframe works locally.
- Webknife artifacts are generated and visible enough for review.
- Git commit and push are part of the accepted iteration lifecycle.
- `ISSUES.md` captures scaffold defects found during dogfooding.
- The builder UI has been checked through screenshots, not assumed from code.
