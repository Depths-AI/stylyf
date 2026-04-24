# Stylyf Composition Review

## Purpose

This review analyzes the current Stylyf CLI codebase after v0.4 with one question in mind:

How can Stylyf keep abstracting repetitive SolidStart code generation while becoming expressive enough for coding agents to compose surfaces, routes, API endpoints, server functions, resources, workflows, and UI layout at incrementally deeper levels?

The short answer: v0.4 gave Stylyf the right clean foundation, but the public DSL is now substantially narrower than the compiler and generator underneath it. The private app IR already contains much of the expressive power we want. The next improvement should not undo v0.4. It should expose the existing power in explicit, layered authoring levels.

## End-To-End Source Reading Scope

Reviewed source areas:

- `packages/stylyf-cli/src/commands/*`
- `packages/stylyf-cli/src/spec/*`
- `packages/stylyf-cli/src/compiler/*`
- `packages/stylyf-cli/src/compiler/kinds/*`
- `packages/stylyf-cli/src/generators/*`
- `packages/stylyf-cli/src/generators/backend/*`
- `packages/stylyf-cli/src/templates/**/*`
- `packages/stylyf-cli/src/manifests/*`
- `packages/stylyf-cli/src/search/*`
- `packages/stylyf-cli/examples/v0.4/*`
- `packages/stylyf-cli/package.json`
- `packages/stylyf-cli/scripts/build.mjs`
- `packages/stylyf-source/src/lib/*`
- `packages/stylyf-source/src/components/registry/**/*` through component exports, props, registry metadata, and generated assembly manifest
- `packages/stylyf-source/src/app.css`
- bundled CLI source asset seams under `packages/stylyf-cli/src/assets/source/src`

## High-Level Assessment

v0.4 is directionally correct. It made the public contract clear: author a `SpecV04`, compile into a private app model, emit standalone SolidStart source. That is much cleaner than asking the agent to directly write a giant low-level app IR up front.

The problem is that the current public spec stops too early. It exposes app kind, backend mode, media mode, objects, flows, and coarse surfaces. It does not expose the deeper composition layers that the compiler already understands:

- route shell selection
- page shell selection
- route-level section trees
- layout nodes and layout props
- registry component selection
- registry component props/items/variants
- explicit API routes
- explicit server modules
- explicit resource access policy
- explicit resource relations
- explicit table names
- explicit attachment bucket aliases/metadata tables
- workflow field, transition actor, emitted events, and notification audience
- env extras
- database schema extras

So the system is not underpowered internally. The bottleneck is the public authoring surface and validation layer.

## Where The Restriction Comes From

### Public Spec Is Much Smaller Than Private IR

`packages/stylyf-cli/src/spec/types.ts` defines `StylyfSpecV04` as:

- `app`
- `backend`
- `media`
- `experience`
- `actors`
- `objects`
- `flows`
- `surfaces`

That is clean, but it intentionally hides the private `AppIR` in `packages/stylyf-cli/src/compiler/generated-app.ts`.

The private `AppIR` is much richer. It already has:

- `routes: RouteIR[]`
- `RouteIR.sections`
- `SectionIR`
- `LayoutNodeIR`
- `ComponentRefIR`
- `env`
- `database.schema`
- `resources.access`
- `resources.relations`
- `resources.attachments`
- `workflows.transitions`
- `auth.protect`
- `storage`
- `apis`
- `server`

The current DSL therefore compresses too much intent into too few knobs.

### Validator Rejects Deeper Composition

`packages/stylyf-cli/src/spec/validate.ts` uses `hasOnlyKeys` throughout. This is good for contract discipline, but right now it rejects the exact fields that would let agents operate at deeper complexity.

Examples:

- `SurfaceSpec` only allows `name`, `kind`, `object`, `path`, `audience`.
- `ObjectSpec` only allows `name`, `label`, `purpose`, `ownership`, `visibility`, `fields`, `media`.
- `FlowSpec` only allows `name`, `object`, `kind`, `states`, `transitions`.
- top-level spec does not allow `routes`, `apis`, `server`, `env`, or direct composition chunks.

That makes the DSL safe but too closed.

### Surface Expansion Is Hard-Coded

`packages/stylyf-cli/src/compiler/expand.ts` maps each surface kind into fixed route output:

- `dashboard` always emits `dashboardSections()`
- `list` always emits `page-header`, `filter-toolbar`, `data-table-shell`, `detail-panel`
- `settings` always emits `settings-panel`, `settings-row`
- `landing` always emits `page-header`, `empty-state`
- `tool` always emits `form-section`, `progress`, `toast`

The generated result looks coherent, but it feels templatized because the agent cannot say:

- use a split layout here
- replace `data-table-shell` with `data-list`
- add `bulk-action-bar`
- add a `wizard-shell` after this form
- make this surface `docs-shell`
- make this public route use `content-frame` plus `tabs`
- add a page-specific toolbar
- use a component with specific props/items

The generator can render these things. The public spec cannot ask for them.

### Commands Enforce The Narrow Surface

`generate`, `plan`, and `validate` explicitly reject `--ir`, `--print-resolved`, and `--write-resolved`. That made sense for v0.4 cleanup, but it removed the agent’s ability to inspect or layer the resolved model.

We do not need to bring back “author raw giant IR as the main path.” But we should restore resolved-plan visibility and controlled additive composition.

## Existing Power We Are Not Exposing

### UI Composition

`packages/stylyf-cli/src/generators/generate.ts` already renders:

- app shells
- page shells
- route files
- nested layout nodes
- registry components
- registry component props
- registry component variants
- registry component items

The relevant internal primitives already exist:

- `ComponentRefIR`
- `LayoutNodeIR`
- `SectionIR`
- `RouteIR.sections`
- `renderComponentNode`
- `renderLayoutNode`
- `renderSection`

This is the most important seam. It means a richer DSL can be implemented mostly by exposing and validating composition fields, not by inventing a new rendering engine.

### Component Inventory

The source package and generated assembly manifest expose 70 components across:

- Actions & Navigation
- Form Inputs & Selection
- Disclosure & Overlay
- Feedback & Display
- Form Systems
- Information & States
- Data Views
- Navigation & Workflow

The generator can resolve component references by id, slug, label, export name, and `clusterDirectory/slug`.

Current gap: the manifest has style/state parameter descriptions, but not strict prop schemas. That limits how safely an agent can generate component props without checking source. The next layer should add a lightweight component prop contract per component or per component family.

### Backend Composition

The private backend model is far richer than the public spec:

- `ApiRouteIR` supports explicit API route generation.
- `ServerModuleIR` supports query/action generation.
- resource materialization derives DB schema, server modules, forms, policies, and attachments.
- Supabase and portable branches both generate resource server modules.
- workflow generation emits transition actions, events, notifications, and policies.
- attachment generation emits presign/confirm/replace/delete lifecycles.
- env generation supports `app.env.extras`, but public spec cannot provide it.

The next DSL should expose explicit backend additions without forcing agents to write full bespoke server code.

## Important Incidental Findings

These are not the main composition-design issue, but they matter before we build more on top:

- `materializeAppForGeneration` duplicates derived server modules because it calls `.flatMap(resource => deriveServerModules(resource))` twice in succession.
- portable workspace-member create generation declares `const workspaceId = input.${workspaceField};` twice.
- `flowToWorkflow` ignores `transition.actor` from the public flow spec and always emits `actor: "owner"`.
- `actors` are validated but not currently used in expansion.
- `hasGeneratedForms` returns true for every resource because it checks `formableFields(resource).length >= 0`.
- `renderGeneratedLoginRoute` appears to emit one extra closing fragment line.
- app kind defaults are useful, but surface override behavior is replacement-by-map-key, not a clearly documented additive/remove/replace operation.

These should be fixed as part of the same revamp or immediately before it, because deeper composition will make these seams more visible.

## Recommended Direction

Keep `SpecV04` as the level-one intent DSL, but introduce explicit layered composition fields. The agent should be able to start small and then drill down only where needed.

### Level 0: Preset

Current:

```bash
stylyf new internal-tool --name "Acme Ops" --backend portable --media rich
```

This remains unchanged.

### Level 1: Intent Spec

Current v0.4 shape:

```json
{
  "version": "0.4",
  "app": { "name": "Atlas", "kind": "generic" },
  "backend": { "mode": "portable", "portable": { "database": "sqlite" } },
  "media": { "mode": "basic" },
  "objects": [],
  "flows": [],
  "surfaces": []
}
```

This should stay as the recommended cold-start path.

### Level 2: Surface Composition

Extend `SurfaceSpec` so a surface can optionally specify:

```ts
type SurfaceSpec = {
  name: string;
  kind: SurfaceKind;
  object?: string;
  path?: string;
  audience?: "public" | "user" | "admin" | "editor";
  shell?: AppShellId;
  page?: PageShellId;
  title?: string;
  sections?: SectionSpec[];
};
```

This would let agents keep the high-level surface model but override composition where the current template feels wrong.

Example:

```json
{
  "name": "Review Queue",
  "kind": "list",
  "object": "submissions",
  "path": "/review",
  "audience": "admin",
  "page": "resource-index",
  "sections": [
    {
      "layout": "toolbar",
      "children": [
        { "component": "search-field", "props": { "placeholder": "Search submissions" } },
        { "component": "filter-toolbar" },
        { "component": "sort-menu" }
      ]
    },
    {
      "layout": "split",
      "props": { "ratio": "2:1" },
      "children": [
        { "component": "data-table-shell" },
        { "component": "detail-panel" }
      ]
    }
  ]
}
```

This is the highest-value change. It unlocks the component suite without making the user author a full app IR.

### Level 3: Explicit Routes

Add a top-level `routes` field for routes that are not naturally described as CRUD/content/tool surfaces.

```ts
type RouteSpec = {
  path: string;
  shell?: AppShellId;
  page?: PageShellId;
  title?: string;
  access?: "public" | "user";
  resource?: string;
  sections?: SectionSpec[];
};
```

Routes should coexist with surfaces:

- `surfaces` are semantic route recipes.
- `routes` are explicit page compositions.

This avoids overloading `SurfaceKind` forever.

### Level 4: Backend Endpoints And Server Modules

Expose controlled versions of `ApiRouteIR` and `ServerModuleIR`:

```ts
type ApiSpec = {
  name: string;
  path: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  type: "json" | "webhook" | "presign-upload";
  auth?: "public" | "user";
};

type ServerSpec = {
  name: string;
  type: "query" | "action";
  resource?: string;
  auth?: "public" | "user";
};
```

This gives agents a clean way to generate common API/server files without bespoke coding.

### Level 5: Resource Deepening

Extend `ObjectSpec` with the private resource fields that are already supported:

```ts
type ObjectSpec = {
  name: string;
  label?: string;
  purpose?: string;
  table?: string;
  ownership?: "none" | "user" | "workspace";
  visibility?: "private" | "public" | "mixed";
  access?: ResourceAccessSpec;
  fields?: FieldSpec[];
  relations?: RelationSpec[];
  media?: MediaAttachmentSpec[];
};
```

This would allow:

- public read but user create
- owner update/delete
- workspace-member access
- custom table names
- belongs-to and has-many relation generation
- generated relation modules

The resource generator already has most of this. The public spec just cannot express it.

### Level 6: Workflow Deepening

Extend flows so transition metadata is not discarded:

```ts
type FlowTransitionSpec = {
  name: string;
  from: string | string[];
  to: string;
  actor?: ResourceAccessPreset;
  emits?: string[];
  notifies?: WorkflowNotificationAudience[];
};

type FlowSpec = {
  name: string;
  object: string;
  kind: FlowKind;
  field?: string;
  states?: string[];
  transitions?: FlowTransitionSpec[];
};
```

This aligns public flow intent with the workflow generator’s real capabilities.

### Level 7: Env Extras

Expose `env.extras` in the public spec:

```json
{
  "env": {
    "extras": [
      {
        "name": "OPENAI_API_KEY",
        "exposure": "server",
        "required": false,
        "description": "Optional server-side model key."
      }
    ]
  }
}
```

This is common repeatable scaffolding and fits Stylyf’s mission.

## Proposed Public Types

Add these public spec types rather than exposing raw `AppIR`:

```ts
type ComponentSpec = {
  component: string;
  variant?: string;
  props?: Record<string, unknown>;
  items?: Record<string, unknown>[];
};

type LayoutSpec = {
  layout: "stack" | "row" | "column" | "grid" | "split" | "panel" | "section" | "toolbar" | "content-frame";
  props?: Record<string, string | number | boolean>;
  children?: Array<LayoutSpec | ComponentSpec | string>;
};

type SectionSpec = {
  id?: string;
  layout: LayoutSpec["layout"];
  props?: LayoutSpec["props"];
  children: Array<LayoutSpec | ComponentSpec | string>;
};
```

This is essentially the existing route composition IR, but renamed as public spec types and validated against the component/layout catalogs.

## Merge And Incremental Disclosure

We should bring back additive composition, but explicitly, not by directory magic.

Recommended command shape:

```bash
stylyf compose \
  --base stylyf.spec.json \
  --with surfaces.review.json \
  --with backend.webhooks.json \
  --output stylyf.composed.json
```

Recommended JSON chunk shape:

```json
{
  "extends": "0.4",
  "merge": {
    "surfaces": [
      { "name": "Review Queue", "kind": "list", "object": "submissions", "path": "/review" }
    ],
    "apis": [
      { "name": "incomingWebhook", "path": "/api/incoming", "method": "POST", "type": "webhook" }
    ]
  }
}
```

Merge semantics should be explicit:

- arrays of named/path-addressable things merge by stable key
- `replace` replaces a keyed thing
- `remove` deletes a keyed thing
- `merge` deep-merges a keyed thing
- conflicts should be reported by `stylyf plan`

This keeps agents conscious of what they are composing.

## Search And Intro Improvements

The current search endpoint is useful, but deeper composition requires richer guidance:

- search results should show valid component ids for `ComponentSpec.component`
- search results should show known prop names and examples, not just style/state prose
- `intro --topic spec` should be layered: minimal, surfaces, routes, resources, backend, composition chunks
- `intro --topic components` should list component ids by cluster with minimal prop examples
- `intro --topic layout` should explain `SectionSpec` and `LayoutSpec`
- `intro --topic api` should explain `ApiSpec` and `ServerSpec`

The agent should not have to reread the component source to know whether `DataList` wants `items`, or whether `TextField` supports `prefix`, `suffix`, `clearable`, `invalid`, and `errorMessage`.

## Implementation Strategy

Recommended sequence:

1. Fix the incidental generator bugs listed above.
2. Add public `ComponentSpec`, `LayoutSpec`, `SectionSpec`, `RouteSpec`, `ApiSpec`, `ServerSpec`, `EnvSpec`, `AccessSpec`, and `RelationSpec` types.
3. Extend validation with recursive layout/component checks.
4. Map `surface.sections` into `RouteIR.sections`, falling back to existing defaults when omitted.
5. Add top-level `routes` and merge them after expanded surfaces.
6. Add top-level `apis`, `server`, and `env` passthrough into `AppIR`.
7. Extend `ObjectSpec` to carry table/access/relations into `ResourceIR`.
8. Extend `FlowSpec` to preserve actor/emits/notifies/field.
9. Add `stylyf compose` for explicit additive chunks.
10. Add `stylyf plan --resolved` or equivalent so agents can inspect the resolved app model without authoring raw private IR.
11. Harden README and `intro` around layered complexity.
12. Expand smoke fixtures to include one app for each depth: minimal, surface-composed, explicit-route, backend-endpoint, workflow/media-heavy.

## Recommended Guardrail

Do not make raw `AppIR` the public API again. Instead expose public spec types that intentionally map to `AppIR`.

That gives us the best of both worlds:

- v0.4’s clean, stable foundation
- much richer composition when the agent needs it
- no return to one giant fragile JSON blob as the default
- no runtime magic
- generated apps remain ordinary checked-in source

## Bottom Line

The current v0.4 surface is too restrictive for Stylyf’s mission. It is excellent for generating a first coherent scaffold, but it blocks the agent from using the full component suite and backend machinery as Lego blocks.

The encouraging part: the codebase is already much closer to the desired system than the public DSL suggests. The renderer, templates, backend generators, manifests, and private IR have the right seams. The next version should expose those seams through layered, validated composition instead of asking agents to choose between a tiny template spec and bespoke hand-coded app work.
