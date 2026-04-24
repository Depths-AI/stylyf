import type { AppKind, AppShellId, AuthAccess, BackendMode, FieldType, FlowKind, LayoutNodeId, MediaMode, PageShellId, SurfaceKind } from "./types.js";

export const appKinds = ["generic", "internal-tool", "cms-site", "free-saas-tool"] as const satisfies readonly AppKind[];
export const backendModes = ["portable", "hosted"] as const satisfies readonly BackendMode[];
export const mediaModes = ["none", "basic", "rich"] as const satisfies readonly MediaMode[];
export const fieldTypes = [
  "short-text",
  "long-text",
  "rich-text",
  "number",
  "boolean",
  "date",
  "datetime",
  "status",
  "slug",
  "json",
] as const satisfies readonly FieldType[];
export const flowKinds = ["crud", "approval", "publishing", "onboarding", "saved-results"] as const satisfies readonly FlowKind[];
export const surfaceKinds = [
  "dashboard",
  "list",
  "detail",
  "create",
  "edit",
  "settings",
  "landing",
  "content-index",
  "content-detail",
  "tool",
] as const satisfies readonly SurfaceKind[];

export const actorKinds = ["public", "user", "member", "admin", "editor", "owner"] as const;
export const ownershipModels = ["none", "user", "workspace"] as const;
export const visibilityModes = ["private", "public", "mixed"] as const;
export const attachmentKinds = ["file", "image", "video", "audio", "document"] as const;
export const themes = ["amber", "emerald", "pearl", "opal"] as const;
export const themeModes = ["light", "dark", "system"] as const;
export const densities = ["compact", "comfortable", "relaxed"] as const;
export const spacings = ["tight", "balanced", "airy"] as const;
export const radii = ["edge", "trim", "soft", "mellow"] as const;
export const audiences = ["public", "user", "admin", "editor"] as const;
export const portableDatabases = ["sqlite", "postgres"] as const;
export const appShells = ["sidebar-app", "topbar-app", "docs-shell", "marketing-shell"] as const satisfies readonly AppShellId[];
export const pageShells = [
  "dashboard",
  "resource-index",
  "resource-detail",
  "resource-create",
  "resource-edit",
  "settings",
  "auth",
  "blank",
] as const satisfies readonly PageShellId[];
export const layoutNodes = ["stack", "row", "column", "grid", "split", "panel", "section", "toolbar", "content-frame"] as const satisfies readonly LayoutNodeId[];
export const authAccessLevels = ["public", "user"] as const satisfies readonly AuthAccess[];
