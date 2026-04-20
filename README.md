# Stylyf

Stylyf is a source-owned SolidJS component registry project for building a
serious application and marketing UI system on top of SolidStart and Tailwind
CSS v4. The repo is meant to produce open code artifacts, not a sealed package
library. Every primitive, composition, and route-ready block should remain
inspectable, editable, and directly owned by the product team that adopts it.

The project is organized around a three-tier registry model:

1. Tier 1 establishes the foundational primitives. These are the most stable
   pieces in the system and define interaction, accessibility, and override
   contracts.
2. Tier 2 assembles those primitives into product-agnostic compositions such as
   field systems, navigation shells, data views, and workflow containers.
3. Tier 3 turns the lower tiers into opinionated blocks and route-ready modules
   for authentication, app workspaces, settings, marketing, docs, and trust
   surfaces.

The registry is intended to follow a few hard principles:

1. Styling is controlled globally through Tailwind CSS v4 theme variables and
   CSS custom properties so the entire registry can shift brand, density, tone,
   and surface language from a central system.
2. Component APIs should favor slot and anatomy composition over oversized prop
   bags. State should be explicit, inspectable, and styleable through semantic
   attributes and data-state hooks.
3. Solid-specific ergonomics matter. Prop forwarding, hydration-safe IDs,
   explicit portals, and disciplined state control are part of the design of
   the registry, not implementation details to bolt on later.
4. Tier 3 blocks are templates with a point of view. They should be strong
   enough to drop into real routes while still being composed from the lower
   tiers instead of bypassing them.

The canonical handoff specification for the registry lives in
[solidjs_registry_handoff_spec.md](./solidjs_registry_handoff_spec.md). That
document defines the intended scope, component catalog, design standards, and
implementation waves for the project.

Stylyf exists to make a SolidJS registry feel like a real design and product
system from the start: structured, themed, source-owned, and ready for gradual
promotion from empty shell to stable implementation.
