**SolidJS + SolidStart Rich Component Registry**

*Standalone handoff specification for a shadcn-like, Tailwind CSS v4,
slot-composable registry*

Prepared for developer storyboarding and registry implementation • 20
Apr 2026

**Repository intent:** Stylyf is intended to become a source-owned SolidJS
registry for serious application and marketing UI. The point of the
repository is not to ship a sealed package, but to maintain open code
artifacts that product teams can inspect, copy, adapt, and promote from
empty shell to stable implementation over time.

**Scope:** This specification proposes a three-tier registry with 38
Tier 1 primitives, 37 Tier 2 generic compositions, and 63 Tier 3
application and marketing blocks. The registry should be broad enough to
cover real product surfaces, but disciplined enough that every item still
fits inside a coherent design and implementation system.

**Target stack:** SolidJS + SolidStart, TypeScript-first component
authoring, Tailwind CSS v4 theme variables and utilities,
twMerge-compatible override merging, and a headless primitive layer
where accessibility-heavy interaction patterns require it.

**Design intent:** The registry should compose upward in strict layers:
stable primitives at Tier 1, reusable product-agnostic compositions at
Tier 2, and opinionated route-ready blocks at Tier 3. Stateful behavior
should surface through explicit slots, state props, semantic attributes,
and data-state styling hooks rather than hidden magic or opaque internal
machines.

**Implementation stance:** The registry should be built shell-first and
stabilized in waves. Empty shells are valid when they establish naming,
file ownership, anatomy intent, route footprint, and styling/state
contracts clearly enough for later implementation sweeps. Promotion to
stable should happen only after accessibility, keyboard behavior,
responsive behavior, and override ergonomics are validated.

**Recommended implementation standards**

> **•** Treat the registry as open code distribution. Prefer registry:ui
> for stable primitives, registry:block for multi-file patterns,
> registry:page for route-ready pages, registry:hook for reusable
> behavior, and registry:lib for helpers and cn()/variants utilities.
>
> **•** Anchor styling on Tailwind CSS v4 theme variables and CSS custom
> properties. Keep color, radius, shadow, spacing, and typography tokens
> centrally defined so registry items theme cleanly across light/dark
> brands.
>
> **•** Use a strict class contract: base recipe + variants + consumer
> class override. Recommended shape is a small variant helper plus
> twMerge conflict resolution so downstream teams can safely override
> padding, color, layout, and state classes.
>
> **•** Prefer slot/anatomy APIs over giant prop bags. Multi-part
> components should expose obvious parts such as Root, Label, Trigger,
> Content, Item, Header, Footer, Empty, and Actions.
>
> **•** Support controlled and uncontrolled state where it is
> meaningful. Every interactive surface should clearly document
> value/defaultValue, open/defaultOpen, checked/defaultChecked,
> selected/defaultSelected, and onChange/onOpenChange style hooks.
>
> **•** Standardize state styling through data-\* attributes and
> ARIA/semantic states. This is especially important for dialog,
> popover, select, tabs, accordion, menu, combobox, and disclosure
> patterns.
>
> **•** Keep Solid-specific ergonomics first-class:
> splitProps/mergeProps for prop forwarding, createUniqueId for
> hydration-safe ids, Portal for overlays, and context only when
> composition genuinely benefits from shared state.
>
> **•** Tier 3 components should be registry templates, not
> hard-to-maintain universal APIs. Keep them strongly named,
> purpose-specific, and built from Tier 1 + Tier 2 parts with thin glue
> logic.
>
> **•** Write storyboard coverage for all public variants and critical
> states: default, hover, focus-visible, pressed, active, disabled,
> invalid, loading, empty, error, success, selected, open/closed, dirty,
> and responsive collapse cases.
>
> **•** Validate interactive patterns against WAI-ARIA APG expectations
> and keyboard behavior before promoting a component from experimental
> to stable.

**Legend used in the tables**

> **• Style params:** Mostly visual or structural knobs: intent, tone,
> size, density, shape, radius, width, placement, orientation, chrome,
> icon treatment, emphasis, and motion preset.
>
> **• State params:** Behavioral states or inputs the storyboard must
> cover: open/closed, selected, highlighted, focused, invalid, dirty,
> loading, pending, dragged, sorted, filtered, current step, and
> success/error outcomes.
>
> **• Registry shape:** Shorthand for the likely primary item type(s):
> registry:ui, registry:block, registry:page, registry:hook,
> registry:lib, or common combinations like block + page or ui + hook.

**Tier 1 - Foundational primitives**

Stable building blocks. These should be the most API-disciplined, most
documented, and most heavily tested assets in the registry.

| **Component** | **Description**                                       | **Design pattern / parts**                                | **Style params**                                            | **State params**                                     | **Registry shape** | **Notes**                                      |
|---------------|-------------------------------------------------------|-----------------------------------------------------------|-------------------------------------------------------------|------------------------------------------------------|--------------------|------------------------------------------------|
| Button        | Primary action trigger.                               | Single-root action; supports left/right icon and asChild. | intent, size, density, tone, radius, fullWidth, destructive | disabled, loading, pending                           | registry:ui        | Base primitive for every CTA.                  |
| IconButton    | Compact action for icon-only affordances.             | Button variant with required accessible label.            | intent, size, shape, ghost/solid, tooltip pairing           | disabled, loading, pressed                           | registry:ui        | Require aria-label when no text.               |
| LinkButton    | Button visual treatment on link/navigation semantics. | Anchor or router-link root with button recipes.           | intent, size, underline, external badge                     | disabled, current, pending nav                       | registry:ui        | Use for navigation, not mutations.             |
| TextField     | Single-line text entry.                               | Root, Label, Input, Description, ErrorMessage.            | size, density, radius, tone, prefix/suffix, clearable       | disabled, readOnly, invalid, focused, dirty          | registry:ui        | Use native input semantics.                    |
| TextArea      | Multi-line text entry.                                | Same field shell as TextField with textarea control.      | size, minRows, maxRows, autoResize, resizeHandle            | disabled, readOnly, invalid, focused                 | registry:ui        | Share field shell tokens.                      |
| NumberField   | Text entry with numeric stepping.                     | Input plus increment/decrement controls.                  | size, control placement, align, suffix/prefix               | disabled, invalid, min/max reached, scrubbing        | ui + hook          | Prefer machine logic over raw number input UX. |
| OTPField      | One-time code entry.                                  | Grouped slots with hidden aggregate value.                | size, gap, masked, mono, cell shape                         | disabled, invalid, complete, focusedIndex            | registry:ui        | Useful for auth and verification.              |
| Checkbox      | Multi-select boolean control.                         | Indicator, label, description.                            | size, tone, checkbox shape, emphasis                        | checked, unchecked, indeterminate, disabled, invalid | registry:ui        | Support indeterminate state.                   |
| RadioGroup    | Mutually exclusive selection set.                     | Root, Item, Indicator, Label, Description.                | size, card/inline, gap, emphasis                            | checked, focused, disabled, invalid                  | registry:ui        | Arrow-key navigation required.                 |
| Switch        | Immediate on/off toggle.                              | Thumb and track with optional label row.                  | size, tone, label placement, icon thumb                     | checked, unchecked, disabled, invalid                | registry:ui        | Use for instant settings.                      |
| Toggle        | Two-state pressed button.                             | Single button with pressed styling.                       | intent, size, shape, iconOnly                               | pressed, disabled                                    | registry:ui        | For formatting/stateful actions.               |
| ToggleGroup   | Exclusive or multi-select pressed set.                | Group plus item parts.                                    | intent, size, density, segmented/card layout                | pressed items, disabled, rovingFocus                 | registry:ui        | Supports single or multiple mode.              |
| Select        | Closed-choice picker.                                 | Trigger, Value, Icon, Content, Item, Group.               | size, width, placement, searchable badge                    | open, closed, highlighted, selected, invalid         | registry:ui        | Use for finite lists.                          |
| Combobox      | Searchable option picker.                             | Input, listbox/grid popup, clear button.                  | size, debounce, chip mode, async affordances                | open, loading, highlighted, selected, empty, invalid | ui + hook          | Needed for typeahead and async search.         |
| CommandMenu   | Keyboard-first command surface.                       | Dialog/Popover shell plus search, groups, items.          | size, density, shortcut lane, icon treatment                | open, loading, empty, highlighted                    | registry:ui        | Foundation for global cmd-k.                   |
| Slider        | Continuous range input.                               | Track, range, thumb(s), marks.                            | size, orientation, marks, thumb label                       | disabled, dragging, min/max, invalid                 | registry:ui        | Support single and range modes.                |
| Progress      | Read-only progress feedback.                          | Track plus indicator plus label slots.                    | size, tone, striped, animated                               | indeterminate, complete, error                       | registry:ui        | For long-running work.                         |
| Badge         | Small status/category label.                          | Inline pill with optional icon or remove control.         | tone, emphasis, size, removable                             | selected, removable, disabled                        | registry:ui        | Use for status and metadata.                   |
| Avatar        | Identity surface.                                     | Image, fallback, status dot.                              | size, shape, border, group overlap                          | loading, fallback, online/offline                    | registry:ui        | Always safe fallback path.                     |
| Tabs          | Parallel content sections.                            | Root, List, Trigger, Content.                             | orientation, size, underline/pill/card                      | active, disabled, manual/automatic activation        | registry:ui        | Follow APG tab pattern.                        |
| Accordion     | Progressive disclosure stack.                         | Item, Trigger, Content.                                   | size, icon position, divider/card mode                      | open, closed, disabled                               | registry:ui        | Support single/multiple mode.                  |
| Collapsible   | Simple show-hide region.                              | Trigger and Content with retained state.                  | density, inline/card shell, icon                            | open, closed, disabled                               | registry:ui        | Lighter than accordion.                        |
| Dialog        | Blocking modal surface.                               | Portal, Overlay, Content, Header, Footer.                 | size, placement, padding, tone, motion preset               | open, closing, busy, destructive confirm             | registry:ui        | Trap focus and restore on close.               |
| AlertDialog   | High-risk confirmation modal.                         | Dialog specialization with decision emphasis.             | tone, icon, button order, severity                          | open, busy                                           | registry:ui        | For destructive or irreversible actions.       |
| Drawer        | Edge-anchored modal panel.                            | Portal, Overlay, Content, Header, Footer.                 | side, width, handle, backdrop, motion                       | open, dragging, closing, busy                        | registry:ui        | Use on mobile and contextual edit.             |
| Popover       | Anchored non-modal surface.                           | Trigger, Content, Arrow, Close.                           | size, placement, offset, shadow, padding                    | open, closed, positioned                             | registry:ui        | For rich inline overlays.                      |
| Tooltip       | Supplementary hover/focus hint.                       | Trigger and Content.                                      | size, placement, delay, maxWidth                            | open, delayed, disabled                              | registry:ui        | Never hide required information in tooltip.    |
| DropdownMenu  | Action menu from trigger.                             | Trigger, Content, Item, CheckboxItem, Sub.                | size, placement, inset, shortcut lane                       | open, highlighted, checked, disabled                 | registry:ui        | Keyboard menu semantics required.              |
| ContextMenu   | Right-click or long-press menu.                       | Context trigger region plus menu parts.                   | size, placement, shortcut lane                              | open, highlighted, checked, disabled                 | registry:ui        | Use same menu item anatomy.                    |
| Menubar       | Desktop-style application menu.                       | Root, Menu, Trigger, Content, Item.                       | density, chrome, shortcut lane                              | open, highlighted, disabled                          | registry:ui        | Use only for app-like IA.                      |
| Toast         | Transient notification.                               | Provider, Viewport, Root, Title, Action.                  | tone, placement, action slot, dismiss style                 | open, closing, paused, swipe                         | ui + hook          | Non-blocking feedback.                         |
| Skeleton      | Loading placeholder shape.                            | Rect/text/circle recipes.                                 | shape, width, height, shimmer, radius                       | loading                                              | registry:ui        | Use layout-faithful placeholders.              |
| Separator     | Visual divider.                                       | Horizontal/vertical rule with optional label.             | orientation, inset, tone, spacing                           | \-                                                   | registry:ui        | Keep semantic role minimal.                    |
| Calendar      | Date grid primitive.                                  | Header, nav, month grid, day cell.                        | size, range/single, week numbers, compact                   | selected, highlighted, disabled, outsideMonth        | registry:ui        | Needed for date-based flows.                   |
| DatePicker    | Date field plus calendar overlay.                     | Field shell + popover/dialog calendar.                    | size, format, presets, timezone hint                        | open, invalid, selected, range-start/end             | block + ui         | Wrap Calendar into field UX.                   |
| Table         | Semantic table scaffold.                              | Table, Head, Body, Row, Cell, Caption.                    | density, zebra, sticky header, numeric alignment            | selected, sorted, hover, loading                     | registry:ui        | Keep raw table separate from data grid.        |
| Breadcrumb    | Hierarchical navigation trail.                        | List, Item, Separator, Current.                           | size, truncation, icon separator                            | current, overflowed                                  | registry:ui        | Support collapsed middle items.                |
| Pagination    | Paged navigation controls.                            | Prev, pages, next, summary.                               | size, compact/full, show edges                              | current, disabled                                    | registry:ui        | Expose controlled paging state.                |

**Tier 2 - Generic derived compositions**

Composable, product-agnostic patterns built from Tier 1 primitives.
These should still be reusable across many domains without embedding
product-specific wording or IA.

| **Component**        | **Description**                            | **Design pattern / parts**                           | **Style params**                                | **State params**                        | **Registry shape** | **Notes**                                    |
|----------------------|--------------------------------------------|------------------------------------------------------|-------------------------------------------------|-----------------------------------------|--------------------|----------------------------------------------|
| FieldRow             | Canonical field wrapper for forms.         | Label + control + description + error lane.          | gap, label width, required mark, inline/stacked | invalid, disabled, busy                 | registry:block     | Build once; every field composes through it. |
| FieldsetCard         | Grouped form controls in a framed section. | Header, body, footer actions.                        | padding, border, heading size, tone             | disabled subtree, dirty                 | registry:block     | Great for settings surfaces.                 |
| FormSection          | Large grouped form region.                 | Section header plus field groups and actions.        | spacing, columns, divider mode                  | submitting, valid, invalid, dirty       | registry:block     | Works with client or server validation.      |
| SearchField          | Reusable search input with affordances.    | TextField + icon + clear + submit slots.             | size, width, placeholder tone, shortcut badge   | focused, loading, hasValue              | registry:block     | Used across tables and pages.                |
| FilterToolbar        | Query/filter/action toolbar.               | Search, filters, chips, view controls, bulk actions. | density, wrap mode, sticky, compact             | dirty filters, selection count, busy    | registry:block     | Backbone of list pages.                      |
| SortMenu             | Lightweight ordering control.              | Button/Select + current sort summary.                | size, icon, compact/full label                  | open, active sort, disabled             | registry:block     | Often paired with FilterToolbar.             |
| PageHeader           | Page identity and primary actions.         | Eyebrow, title, description, actions, meta.          | size, align, sticky, divider                    | busy, stale data, readonly              | registry:block     | Use on almost every route.                   |
| SectionHeader        | Subsection title block.                    | Title, description, actions, anchor link.            | size, divider, muted/strong tone                | \-                                      | registry:block     | Keeps long pages structured.                 |
| InlineEditableField  | Read mode that turns into edit mode.       | Display view, trigger, editor, save/cancel actions.  | dense/comfortable, highlight on hover           | editing, saving, invalid, readonly      | block + hook       | Useful in profile/settings screens.          |
| StatCard             | Single KPI surface.                        | Label, value, delta, sparkline, footer.              | tone, size, icon placement, accent level        | loading, positive/negative/neutral      | registry:block     | Base for dashboards.                         |
| StatGrid             | Responsive metric collection.              | Grid of StatCards with shared scale.                 | columns, gap, card chrome                       | loading, empty                          | registry:block     | Use for analytics headers.                   |
| EmptyState           | No-data and first-run surface.             | Icon/illustration, title, text, actions.             | size, illustration style, align                 | empty, firstRun, filteredEmpty          | registry:block     | One component, many contexts.                |
| ErrorState           | Recoverable failure surface.               | Icon, summary, detail, retry action.                 | tone, compact/full, bordered                    | retrying                                | registry:block     | For route, card, and widget scope.           |
| LoadingState         | Non-skeleton loading module.               | Spinner/progress + message + optional cancel.        | tone, compact/full                              | loading, cancellable                    | registry:block     | For indeterminate waits.                     |
| DataList             | Opinionated vertical list.                 | Header, rows, row actions, footer.                   | density, dividers, card/list mode               | loading, empty, selected row            | registry:block     | Simpler than a table.                        |
| DataTableShell       | Table page wrapper.                        | Toolbar, table, selection bar, pagination.           | density, sticky controls, bordered/chrome       | loading, empty, selection, sync         | registry:block     | No row logic; just shell.                    |
| ColumnVisibilityMenu | Table/display field chooser.               | Dropdown of toggles with reset.                      | size, icon, grouping                            | open, selected count                    | registry:block     | Pairs with data table.                       |
| BulkActionBar        | Context bar for selected items.            | Selection count, actions, clear selection.           | tone, sticky/floating, compact                  | visible, busy                           | registry:block     | For multi-row actions.                       |
| DetailPanel          | Companion view for selected record.        | Header, body sections, actions.                      | side placement, width, tabs/sections            | open, loading, dirty                    | registry:block     | Often docked beside tables.                  |
| ActivityFeed         | Chronological event stream.                | Feed, item, actor, content, meta.                    | density, connectors, avatar mode                | loading, unread, collapsed              | registry:block     | Use for audits and timelines.                |
| Timeline             | Temporal milestone presentation.           | Rail, item, marker, content.                         | density, vertical/horizontal, compact           | active, completed, upcoming             | registry:block     | For onboarding and history.                  |
| NotificationList     | In-app inbox pattern.                      | Groups, items, filters, action row.                  | density, card/list mode                         | unread, selected, loading               | registry:block     | Can back both page and popover.              |
| CommentThread        | Discussion and annotation pattern.         | Thread, comment, composer, reply chain.              | density, avatar size, attachment lane           | replying, editing, sending              | registry:block     | Use for collaboration UIs.                   |
| Stepper              | Linear progress navigator.                 | Steps, connectors, labels, optional actions.         | orientation, size, icon/badge markers           | current, complete, error, disabled      | registry:block     | For multi-step workflows.                    |
| WizardShell          | Multi-step transactional container.        | Header, progress, step body, footer actions.         | size, sticky footer, side summary               | currentStep, pending, invalid, complete | registry:block     | Tier-2 base for tier-3 flows.                |
| SidebarNav           | Generic app side navigation.               | Groups, items, badges, collapse rail.                | width, density, icon mode, compact labels       | active, expanded, collapsed             | registry:block     | Basis for dashboard sidebars.                |
| TopNavBar            | Generic top-level navigation bar.          | Brand, nav, search, actions, profile.                | height, centered/split, glass/solid             | active route, scrolled, menu open       | registry:block     | Basis for marketing/app nav.                 |
| AppHeader            | Contextual app workspace header.           | Breadcrumbs, title, tabs, actions.                   | height, sticky, border, compact                 | syncing, stale, readonly                | registry:block     | Pairs with SidebarNav.                       |
| SettingsRow          | Standard settings item layout.             | Label, description, control, meta/help.              | density, inset, borderless/card                 | disabled, invalid, pending              | registry:block     | Critical for settings consistency.           |
| SettingsPanel        | Reusable settings subsection card.         | Header, body rows, footer actions.                   | padding, divider, heading scale                 | dirty, saving, readonly                 | registry:block     | Wraps SettingsRows.                          |
| PricingCard          | Plan/commercial offer card.                | Plan title, price, features, CTA, badge.             | tone, emphasis, featured state                  | featured, disabled CTA                  | registry:block     | Use on SaaS pricing pages.                   |
| FeatureCard          | Marketing feature unit.                    | Icon/media, title, copy, CTA.                        | chrome, icon frame, orientation                 | hovered                                 | registry:block     | Basis for grids and bento layouts.           |
| TestimonialCard      | Quote/social proof unit.                   | Quote, author, role, avatar/logo.                    | alignment, quote mark, compact/full             | \-                                      | registry:block     | For marketing/social proof.                  |
| FAQList              | Question-answer disclosure group.          | Accordion plus search/filter hook.                   | density, divided/card, default-open behavior    | open items, filtered                    | registry:block     | Tier-2 generic FAQ pattern.                  |
| FileUploader         | Drag/drop file ingestion shell.            | Dropzone, file list, status, actions.                | size, dashed/solid zone, compact/full           | dragging, uploading, error, complete    | block + hook       | Foundation for import flows.                 |
| MediaUploader        | Image/video oriented uploader.             | Dropzone, preview grid, crop/replace slots.          | thumb ratio, grid density, overlay controls     | uploading, cropping, failed             | block + hook       | For avatars, banners, gallery content.       |
| AuthCardShell        | Opinionated auth container.                | Branding, title, body, legal footer.                 | maxWidth, visual side, card chrome              | submitting, error, success              | registry:block     | Base for login/signup variants.              |

**Tier 3 - Specialized blocks and route-ready modules**

Purpose-built flows, layouts, and site/admin sections. These are
intentionally opinionated, but should still compose from lower tiers
instead of bypassing them.

| **Component**               | **Description**                          | **Design pattern / parts**                            | **Style params**                              | **State params**                          | **Registry shape** | **Notes**                          |
|-----------------------------|------------------------------------------|-------------------------------------------------------|-----------------------------------------------|-------------------------------------------|--------------------|------------------------------------|
| LoginBasic                  | Minimal email/password login page.       | AuthCardShell + TextField + Button.                   | brand treatment, split/centered, compact/full | submitting, invalid, locked-out           | block + page       | Default auth entry.                |
| LoginSplit                  | Login with visual side panel.            | AuthCardShell with hero/support content.              | image/illustration side, theme contrast       | submitting, invalid                       | block + page       | Good for enterprise/SaaS.          |
| LoginMagicLink              | Passwordless login flow.                 | Email field + send-link status states.                | brand treatment, security note, compact/full  | sending, sent, resend cooldown            | block + page       | Useful for low-friction auth.      |
| SignupBasic                 | Simple account creation page.            | AuthCardShell with name/email/password fields.        | brand treatment, legal copy, compact/full     | submitting, invalid, success              | block + page       | Default self-serve signup.         |
| SignupInvite                | Invite-accept signup page.               | Prefilled org/email plus password/profile fields.     | readonly invite fields, org badge             | validating invite, expired, submitting    | block + page       | For B2B team onboarding.           |
| SignupWorkspace             | Account plus workspace creation flow.    | WizardShell with account and team steps.              | step layout, illustration, summary card       | currentStep, pending, invalid, success    | block + page       | Good first-run SaaS flow.          |
| ForgotPassword              | Password reset request page.             | Email field + confirmation state.                     | compact/full, help text emphasis              | sending, sent, rate-limited               | block + page       | Keep low-complexity.               |
| ResetPassword               | Set new password page.                   | Password + confirm + strength lane.                   | brand treatment, strength meter style         | submitting, invalid, expired token        | block + page       | Use server action feedback.        |
| VerifyEmail                 | Email verification status page.          | Status panel with retry/change-email actions.         | tone, illustration, compact/full              | checking, verified, expired               | block + page       | Works post-signup.                 |
| OTPVerify                   | 6-digit verification step.               | OTPField + resend + support actions.                  | cell style, mono font, compact/full           | focusedIndex, complete, resend cooldown   | block + page       | Reusable in auth and security.     |
| TwoFactorSetup              | Enable 2FA onboarding.                   | QR, secret fallback, OTP verify, backup code slots.   | layout, emphasis, warning callouts            | loading secret, verifying, enabled        | block + page       | Security-critical journey.         |
| TwoFactorChallenge          | 2FA challenge page.                      | OTPField plus backup-method switcher.                 | brand treatment, alt-method layout            | submitting, invalid, locked               | block + page       | For step-up auth.                  |
| DashboardSidebarSimple      | Standard product sidebar shell.          | SidebarNav + AppHeader + content frame.               | width, density, icon mode, section badges     | collapsed, active route                   | block + page       | Default internal app shell.        |
| DashboardSidebarCollapsible | Sidebar with rail collapse behavior.     | SidebarNav with icon rail and tooltips.               | rail width, collapse breakpoint               | collapsed, hovered rail, active           | block + page       | Great for dense tools.             |
| DashboardSidebarWorkspace   | Workspace/team switcher sidebar.         | SidebarNav + workspace switcher + user menu.          | workspace badge style, nested groups          | active workspace, collapsed               | block + page       | For multi-tenant SaaS.             |
| DashboardTopbarOnly         | Top-nav dashboard shell.                 | AppHeader + tabs + page content.                      | header density, sticky behavior               | active tab, sync status                   | block + page       | For lighter products.              |
| AnalyticsOverview           | KPI + charts + recent activity layout.   | StatGrid + chart cards + table shell.                 | card chrome, chart density, spacing           | loading, empty, filtered                  | block + page       | Generic analytics home.            |
| RevenueDashboard            | Commercial metrics dashboard.            | StatGrid + revenue chart + invoices list.             | financial tone, delta emphasis                | loading, filtered                         | block + page       | Revenue/admin flavor.              |
| ProjectsDashboard           | Project and task overview.               | List cards + activity + due-date widgets.             | compact/comfortable, priority accents         | loading, empty, filtered                  | block + page       | Good for PM tools.                 |
| CRMWorkspace                | Sales/customer dashboard.                | Pipeline summary + account list + detail pane.        | density, avatar use, badge intensity          | loading, selected record                  | block + page       | CRM-style operational workspace.   |
| SupportInbox                | Ticket/support operations page.          | FilterToolbar + table/list + conversation detail.     | density, queue badges, SLA emphasis           | loading, selection, syncing               | block + page       | Great for helpdesk products.       |
| MembersDirectory            | Team members management page.            | Search + filter + table/cards + detail drawer.        | card/table mode, role badge style             | loading, selection, invite pending        | block + page       | Shared admin page.                 |
| BillingSettings             | Billing management page.                 | Plan summary + payment methods + invoices.            | commercial tone, highlighted plan card        | loading, updating, payment failure        | block + page       | Common SaaS admin page.            |
| ProfileSettings             | User profile settings page.              | Avatar editor + personal info + preferences.          | field density, avatar prominence              | dirty, saving, success                    | block + page       | Essential account page.            |
| SecuritySettings            | Password/session/security controls page. | SettingsPanels + session list + 2FA card.             | warning tone, severity accents                | saving, revoking, enabled                 | block + page       | Security-focused IA.               |
| TeamSettings                | Workspace/team admin page.               | Members, roles, invites, defaults sections.           | density, role-chip style                      | saving, invite pending                    | block + page       | Multi-tenant admin.                |
| NotificationSettings        | Channel and category preferences page.   | SettingsRows grouped by product area.                 | toggle density, quiet/compact mode            | dirty, saving                             | block + page       | Works for app + email prefs.       |
| APIKeysPage                 | API key management page.                 | Table/list + create dialog + secret reveal flow.      | mono key style, danger emphasis               | creating, revealing, revoking             | block + page       | Developer-focused admin.           |
| AuditLogPage                | Operational audit history page.          | FilterToolbar + table + detail panel.                 | dense table, diff view style                  | loading, filtered                         | block + page       | Enterprise requirement.            |
| UsageMeterPanel             | Quota and usage summary block.           | Stat cards + progress + upsell CTA.                   | warning/healthy tone, compact/full            | near limit, over limit                    | registry:block     | Can live in settings or dashboard. |
| PlanUpgradePanel            | Upgrade and upsell block.                | Pricing comparison + CTA + feature deltas.            | featured plan treatment, badge tone           | current, recommended                      | registry:block     | Drop into billing/settings.        |
| InviteMembersDialogBlock    | Team invite modal block.                 | Dialog + email chip input + role select.              | dialog size, chip density                     | submitting, invalid, sent                 | registry:block     | Common admin task block.           |
| CreateProjectFlow           | New project creation wizard.             | WizardShell with naming/template/privacy steps.       | stepper size, summary aside                   | currentStep, invalid, creating            | block + page       | Reusable creation flow.            |
| ImportDataWizard            | CSV/API import journey.                  | WizardShell + uploader + mapping + review.            | table density, mapping chrome                 | uploading, mapping, validating, importing | block + page       | High-value B2B workflow.           |
| OnboardingChecklist         | First-run progress module.               | Checklist + progress + CTAs.                          | card chrome, compact/full                     | completed items, dismissed                | registry:block     | Useful on dashboard home.          |
| EmptyWorkspace              | First project/team empty page.           | Hero-like empty state with setup actions.             | illustration scale, CTA emphasis              | empty, loading templates                  | block + page       | First-run SaaS block.              |
| SearchResultsPage           | Global search results layout.            | Search header + grouped results + filters.            | group chrome, keyboard hint lane              | loading, empty, selected                  | block + page       | Works with cmd-k deep link.        |
| ActivityInboxPage           | Actionable activity center.              | NotificationList + filters + detail drawer.           | density, unread emphasis                      | loading, selection, unread-only           | block + page       | Operations/home feed page.         |
| NavbarSimple                | Lightweight marketing navigation.        | Brand, primary links, CTA, mobile sheet.              | height, cta emphasis, sticky/glass            | mobile open, active link                  | registry:block     | Good default marketing nav.        |
| NavbarProductMega           | Marketing nav with rich dropdowns.       | TopNavBar + mega panels + badges.                     | panel width, promo lane, glass/solid          | open section, active link                 | registry:block     | For product-heavy websites.        |
| NavbarDocs                  | Documentation-oriented navigation.       | Brand, docs tabs, search, version switcher.           | height, compact/full, border style            | active section, mobile open               | registry:block     | For docs or help centers.          |
| HeroSaaS                    | Main product hero section.               | Heading, subcopy, CTA pair, social proof, screenshot. | alignment, media ratio, accent intensity      | \-                                        | registry:block     | Default SaaS landing hero.         |
| HeroDocs                    | Documentation/index hero.                | Title, search, quick links, version/meta.             | compact/full, muted/strong tone               | \-                                        | registry:block     | For docs home pages.               |
| HeroWaitlist                | Early-access signup hero.                | Heading + value prop + inline form.                   | layout, image placement, urgency tone         | submitting, success                       | registry:block     | Launch/waitlist page hero.         |
| LogoCloud                   | Customer or partner logos section.       | Responsive logo grid/rail.                            | mono/color mode, density, heading treatment   | \-                                        | registry:block     | Social proof section.              |
| FeatureGridBento            | Feature highlight section.               | Mixed card sizes with media/text.                     | grid density, card chrome, icon style         | hovered                                   | registry:block     | High-richness marketing block.     |
| FeatureComparison           | Plan/feature comparison section.         | Sticky column table/cards hybrid.                     | density, highlight current plan               | current plan, hover                       | registry:block     | Pairs with pricing.                |
| PricingSection              | Pricing plans section.                   | PricingCards + billing toggle + FAQ link.             | featured plan, toggle style, card density     | monthly/yearly, current plan              | registry:block     | Commercial landing section.        |
| FAQSection                  | Landing page FAQ block.                  | SectionHeader + FAQList + support CTA.                | density, background band, CTA style           | filtered, open items                      | registry:block     | Marketing-ready FAQ.               |
| TestimonialsSection         | Quotes/social proof section.             | Grid/carousel of TestimonialCards.                    | carousel/grid mode, card chrome               | autoplay paused, active slide             | registry:block     | For marketing pages.               |
| CTASection                  | Strong conversion section.               | Heading, support copy, CTA(s), trust note.            | background band, contrast, compact/full       | \-                                        | registry:block     | Reusable final page section.       |
| FooterSimple                | Compact site footer.                     | Link columns, socials, legal row.                     | density, divider, minimal/full                | \-                                        | registry:block     | For simple sites.                  |
| FooterProduct               | Rich product footer.                     | Multi-column links, CTA, socials, locale.             | density, heading tone, top promo band         | \-                                        | registry:block     | For larger product sites.          |
| FooterDocs                  | Documentation footer.                    | Doc links, community links, version/legal.            | compact/full, border style                    | \-                                        | registry:block     | Docs/help-center footer.           |
| NewsletterSection           | Newsletter signup block.                 | Inline or card email capture pattern.                 | compact/full, background band                 | submitting, success, invalid              | registry:block     | Reusable growth section.           |
| ContactSalesSection         | Sales/contact conversion section.        | Form + trust copy + calendar/contact options.         | layout, field density, enterprise tone        | submitting, success, invalid              | registry:block     | B2B lead capture section.          |
| BlogIndexHeader             | Blog listing intro block.                | Title, category chips, featured article slot.         | compact/full, chip style                      | active category                           | registry:block     | Editorial listing top section.     |
| DocsSidebarLayout           | Documentation app shell.                 | Sidebar tree + content header + right TOC.            | density, width, sticky rails                  | active page, collapsed nav                | block + page       | Docs/knowledge base layout.        |
| DocsArticleHeader           | Docs article intro block.                | Eyebrow, title, metadata, actions.                    | compact/full, meta density                    | \-                                        | registry:block     | For article pages.                 |
| DocsPaginationFooter        | Prev/next article block.                 | Two-card footer nav with labels.                      | compact/full, border/card mode                | disabled edge                             | registry:block     | Docs article continuation.         |
| ChangelogTimelinePage       | Release/changelog page.                  | Timeline + grouped release notes.                     | density, badge tone, sticky year nav          | active version, filtered                  | block + page       | Docs/marketing crossover page.     |
| CareersListing              | Jobs index section.                      | Role cards/table + filters + CTA.                     | card/table mode, compact/full                 | filtered, empty                           | block + page       | Company marketing block.           |
| StatusPageSummary           | Operational status/incident page.        | Current status hero + component list + incidents.     | severity tone, compact/full                   | degraded, outage, resolved                | block + page       | Useful for SaaS trust pages.       |

**Suggested implementation order**

> **•** Wave 1: Tier 1 interaction-critical primitives - Button,
> TextField, Select, Combobox, Checkbox, RadioGroup, Switch, Tabs,
> Accordion, Dialog, Drawer, Popover, DropdownMenu, CommandMenu, Toast,
> Table, Calendar.
>
> **•** Wave 2: Tier 2 shells that unlock product assembly - FieldRow,
> FormSection, SearchField, FilterToolbar, PageHeader, EmptyState,
> ErrorState, StatCard, DataTableShell, SidebarNav, TopNavBar,
> WizardShell, AuthCardShell.
>
> **•** Wave 3: Tier 3 commercial and app blocks - Login variants,
> Signup variants, dashboard sidebars, analytics overview, settings
> pages, marketing navbars, hero sections, pricing, FAQ, footer
> families, docs layouts.
>
> **•** Promote only after storyboard review covers responsive behavior,
> focus-visible behavior, keyboard path, empty/loading/error states, and
> Tailwind override ergonomics.

**Reference appendix**

> **1. SolidJS docs - Overview / TypeScript / splitProps / mergeProps /
> createUniqueId / Portal -** https://docs.solidjs.com/
>
> **2. SolidStart docs - Overview / Getting Started / CSS and styling /
> router preload -** https://docs.solidjs.com/solid-start
>
> **3. SolidJS npm package metadata -**
> https://www.npmjs.com/package/solid-js
>
> **4. @solidjs/start npm package metadata -**
> https://www.npmjs.com/package/@solidjs/start
>
> **5. shadcn/ui - Introduction -** https://ui.shadcn.com/docs
>
> **6. shadcn/ui - Registry introduction, registry.json,
> registry-item.json -** https://ui.shadcn.com/docs/registry
>
> **7. shadcn/ui - Components and Blocks -**
> https://ui.shadcn.com/docs/components and https://ui.shadcn.com/blocks
>
> **8. shadcn/ui - Tailwind CSS v4 migration notes -**
> https://ui.shadcn.com/docs/tailwind-v4
>
> **9. Tailwind CSS v4 blog, @theme docs, and state variants docs -**
> https://tailwindcss.com/blog/tailwindcss-v4 ;
> https://tailwindcss.com/docs/theme ;
> https://tailwindcss.com/docs/hover-focus-and-other-states
>
> **10. Class Variance Authority docs and package metadata -**
> https://cva.style/ ; https://cva.style/docs/getting-started/variants ;
> https://cva.style/docs/getting-started/typescript
>
> **11. tailwind-merge package metadata and repository -**
> https://www.npmjs.com/package/tailwind-merge ;
> https://github.com/dcastil/tailwind-merge
>
> **12. Kobalte docs - introduction, styling, polymorphism, text-field,
> select -** https://kobalte.dev/
>
> **13. Corvu docs - introduction, installation, styling, dynamic
> components, dialog -** https://corvu.dev/docs/
>
> **14. Radix UI docs - composition and slot utility -**
> https://www.radix-ui.com/primitives/docs/guides/composition ;
> https://www.radix-ui.com/primitives/docs/utilities/slot
>
> **15. WAI-ARIA Authoring Practices Guide and pattern index -**
> https://www.w3.org/WAI/ARIA/apg/ ;
> https://www.w3.org/WAI/ARIA/apg/patterns/
