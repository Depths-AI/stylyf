# Webknife

Stylyf uses `@depths/webknife` as a local UI iteration tool against the app's
own dev server.

Core loop:

```bash
npm run dev:ui
npm run ui:shot
npm run ui:interact
npm run ui:review
```

Configuration lives in [`webknife.config.json`](./webknife.config.json). The
default scripted flow lives in
[`webknife/registry-smoke.yaml`](./webknife/registry-smoke.yaml).

Artifacts are written to `.webknife/` and ignored by git.

The selectors used for automation are app-level selectors only:

- `data-sidebar-cluster`
- `data-sidebar-component`
- `data-registry-card`
- `data-pane-trigger`

Those selectors belong to the demo/catalog shell. They are not added to the
registry primitives themselves.
