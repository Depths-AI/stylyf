# @depths/stylyf-cli

Stylyf is an agent-operated scaffolding compiler for SolidStart.

Its job is to let a coding agent describe the intended app in a small v0.4
spec, inspect the generation plan, generate a real source tree, and then keep
iterating inside that emitted app without redoing repetitive setup work by hand.

The generated app is a separate destination project. It does not import from
this repo and does not depend on `@depths/stylyf-cli` at runtime.

## What Stylyf Generates

- app shell, route files, page shells, layout wrappers, and copied registry UI
- theme system, global styling, and emitted app-owned CSS
- backend capability files for either supported backend path
- explicit source files for auth, data, storage, API routes, and server modules
- resource-driven app mechanics when `resources` and `workflows` are used

## Two Backend Paths

### Portable

- `better-auth + drizzle + postgres/sqlite + s3-compatible storage`
- best when you want provider-agnostic auth/data control
- best when you want Better Auth plugins or Drizzle schema ownership
- best when you want easy local SQLite smoke testing

### Hosted

- `supabase auth + supabase data sdk + tigris-compatible s3 storage`
- best when you want the fastest managed deployment path
- best when you are comfortable treating Supabase as both the auth and data platform

In both paths, storage remains presigned-URL based, so the browser never
receives raw object-storage credentials.

## Install

```bash
npm install -g @depths/stylyf-cli
```

or:

```bash
npx @depths/stylyf-cli --help
```

## Start Here

Use the layered intro:

```bash
stylyf intro
stylyf intro --topic dsl
stylyf intro --topic portable
stylyf intro --topic hosted
stylyf intro --topic examples
stylyf intro --topic full
```

Use search when you need a component, shell, layout, backend snippet, or
capability reminder:

```bash
stylyf search dashboard filters table
stylyf search upload attachment presign
stylyf search auth session route protection
```

## Canonical Starting Points

Use `stylyf new` to create a small v0.4 spec:

```bash
stylyf new internal-tool --name "Acme Ops" --backend portable --media rich --output stylyf.spec.json
stylyf validate --spec stylyf.spec.json
stylyf plan --spec stylyf.spec.json
stylyf generate --spec stylyf.spec.json --target ./my-app
```

## Minimal Composition Flow

1. choose the backend path
2. define the app frame: `name`, `shell`, `theme`
3. define routes and page composition
4. add `resources` and `workflows` when you want resource-driven mechanics
5. validate the spec
6. generate into a clean target directory
7. move into the emitted app and keep developing there

## Minimal Spec Shape

```json
{
  "version": "0.4",
  "app": {
    "name": "Atlas",
    "kind": "internal-tool"
  },
  "backend": {
    "mode": "portable",
    "portable": {
      "database": "sqlite"
    }
  },
  "media": {
    "mode": "rich"
  },
  "objects": [
    {
      "name": "records",
      "ownership": "user",
      "fields": [
        { "name": "title", "type": "short-text", "required": true },
        { "name": "status", "type": "status", "options": ["draft", "review", "published"] }
      ]
    }
  ]
}
```

## Portable Quick Sketch

```json
{
  "database": {
    "dialect": "sqlite",
    "migrations": "drizzle-kit"
  },
  "auth": {
    "provider": "better-auth",
    "mode": "session",
    "features": {
      "emailPassword": true
    }
  },
  "storage": {
    "provider": "s3",
    "mode": "presigned-put",
    "bucketAlias": "uploads"
  }
}
```

## Hosted Quick Sketch

```json
{
  "database": {
    "provider": "supabase"
  },
  "auth": {
    "provider": "supabase",
    "mode": "session",
    "features": {
      "emailPassword": true,
      "emailOtp": true
    }
  },
  "storage": {
    "provider": "s3",
    "mode": "presigned-put",
    "bucketAlias": "uploads"
  }
}
```

## v0.3 App Mechanics Layer

When you want more than just raw backend primitives, Stylyf supports:

- `resources`
- `ownership`
- `access`
- `relations`
- `attachments`
- `workflows`

That generalized layer drives:

- schema output
- CRUD server modules
- resource form scaffolds
- ownership/policy helpers
- attachment metadata and presign flows
- workflow actions, event logs, and notification surfaces

## Hosted Apply Checklist

For the hosted Supabase path:

1. fill in `.env` with the Supabase and S3/Tigris values
2. apply `supabase/schema.sql`
3. review and apply `supabase/policies.sql`
4. only then treat hosted CRUD/runtime testing as representative

## What Stylyf Still Expects The Agent To Decide

- product-specific domain rules and business logic
- final authorization and role design beyond the bundled presets
- final Supabase RLS shape for production-grade hosted apps
- email delivery wiring for OTP or notification delivery
- storage retention, moderation, and lifecycle policy beyond the generated baseline

## Where To Drill Deeper

- `stylyf intro --topic dsl`
- `stylyf intro --topic portable`
- `stylyf intro --topic hosted`
- `stylyf intro --topic components`
- `stylyf intro --topic examples`
- `stylyf intro --topic generated-output`
- `stylyf intro --topic full`

Also see:

- [examples/README.md](./examples/README.md)
