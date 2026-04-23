# Monorepo Refactor Plan

## Goal

Reshape the repo into a clean monorepo where:

- `@depths/stylyf-cli` remains the primary shipped product
- the current SolidStart web app is replaced by a small static landing page
- the painstakingly built SolidJS component inventory remains intact as the CLI's source-owned asset library
- CLI generation, asset syncing, manifest building, and packaging continue to work without changing the generated app contract

The key constraint is: **do not disturb the CLI's logic or bundled inventory** while removing the old public registry-showcase surface.

## Current Seams

The current repo has three concerns mixed together at the root:

1. the published CLI package at `packages/stylyf-cli`
2. the source-owned component inventory in `src/components/registry` plus supporting metadata in `src/lib/*`
3. a SolidStart app in the repo root that currently serves as both:
   - the old public showcase site
   - the local authoring surface for the component inventory

The CLI build currently depends on root app files directly:

- `scripts/build-stylyf-cli-manifests.ts`
  - imports `src/lib/registry.ts`
  - imports `src/lib/theme-system.ts`
  - reads `src/app.css`
- `scripts/sync-stylyf-cli-assets.ts`
  - copies `src/components/registry`
  - copies `src/lib/cn.ts`
  - copies `src/app.css`

That means we should **not** simply delete or move the root app first. We need a stable internal source package before we slim the public web surface.

## Target Shape

```text
/
  apps/
    landing/               # lean public marketing site for Stylyf CLI
  packages/
    stylyf-cli/            # published npm package
    stylyf-source/         # internal source-owned component inventory + style grammar
  scripts/                 # repo-level orchestration and verification
  package.json             # workspace root only
```

### Why this shape

- `packages/stylyf-cli` stays focused on the published product.
- `apps/landing` becomes a simple app that explains the CLI and links out to GitHub/npm.
- `packages/stylyf-source` becomes the single source of truth for:
  - component inventory
  - registry metadata
  - theme grammar source CSS
  - shared source files the CLI bundles into generated apps

This prevents the landing page from being coupled to the source asset library and keeps the monorepo clean.

## Step 1: Establish Workspace Structure And Extract Source Assets

### Intent

Create the monorepo foundation and move the source-owned component library into an internal package without changing the public app yet.

### Changes

- add npm workspaces at the root
- convert the root package into a workspace orchestrator
- create `packages/stylyf-source`
- move the CLI-owned source assets and metadata into that package, including:
  - `src/components/registry`
  - `src/lib/registry.ts`
  - `src/lib/registry-previews.ts`
  - `src/lib/registry-source.ts`
  - `src/lib/theme-system.ts`
  - `src/lib/registry-visuals.ts`
  - `src/lib/cn.ts`
  - `src/app.css`
- update repo scripts to source from `packages/stylyf-source` instead of root `src/*`
- update any TypeScript pathing needed for repo scripts

### Validation

- `npm run cli:build`
- `npm run cli:verify-pack`
- confirm the bundled CLI manifests/assets still generate from the new source package

### Commit boundary

One commit: workspace foundation + extracted source package.

## Step 2: Relocate The SolidStart App Into `apps/landing`

### Intent

Move the actual web app runtime out of the repo root and into `apps/landing`, but keep the site behavior broadly intact for one step so the move stays low-risk.

### Changes

- create `apps/landing`
- move current app runtime files there:
  - `app.config.ts`
  - `src/app.tsx`
  - `src/entry-client.tsx`
  - `src/entry-server.tsx`
  - `src/routes/*`
  - `src/global.d.ts`
  - any app-only components still needed by the temporary site shell
- give `apps/landing` its own:
  - `package.json`
  - `tsconfig.json`
  - app config
- update root scripts like `dev`, `build`, `preview`, `check` to delegate to `apps/landing`

### Validation

- `npm --prefix apps/landing run build`
- `npm --prefix apps/landing run check`
- root alias scripts still work

### Commit boundary

One commit: app moved into `apps/landing`, still working.

## Step 3: Replace The Showcase With A Lean Static Landing Page

### Intent

Remove the old component showcase as the public product surface and replace it with a minimal marketing page for the CLI.

### Changes

- remove registry-showcase specific app code from `apps/landing`
- build a small static single-page landing page that covers:
  - what Stylyf is
  - what it generates
  - the two backend modes
  - why agents use it
  - primary CTA to GitHub
  - secondary CTA to npm
- keep styling aligned with the existing design language, but slim and static
- remove now-unused showcase-only components and webknife tours tied to the old registry app

### Validation

- `npm --prefix apps/landing run build`
- sanity-check the rendered page locally
- verify there are no stale imports from removed registry-showcase files

### Commit boundary

One commit: landing page replaces showcase app.

## Step 4: Docs, Scripts, And Verification Cleanup

### Intent

Finish the monorepo so the structure is coherent for both maintainers and future automation.

### Changes

- update root `README.md` to describe the monorepo clearly
- update `packages/stylyf-cli/README.md` and any package metadata if paths changed
- update script docs and local development commands
- clean or remove stale files such as:
  - old deployment notes that only apply to the former showcase site
  - obsolete webknife flows
  - stale root app references in docs
- ensure publish and verification flows still work from the monorepo root

### Validation

- `npm run cli:build`
- `npm run cli:verify-pack`
- `npm --prefix apps/landing run build`
- quick repo-wide grep for stale root-app assumptions

### Commit boundary

One commit: docs/build cleanup and final monorepo verification.

## Guardrails

- Do not make `apps/landing` the source of truth for CLI-bundled assets.
- Do not change the generated app contract while doing this refactor.
- Prefer path and package relocation over logic rewrites.
- Keep the internal source library broad and reusable even if the public web app becomes tiny.
- Validate the CLI package after each structural step, not only at the end.

## Success Criteria

The refactor is successful when:

- the repo reads like a proper monorepo
- the landing page is a small static marketing app
- the CLI still bundles the existing SolidJS inventory cleanly
- `@depths/stylyf-cli` build and pack verification still pass
- root docs describe the CLI-first product honestly
