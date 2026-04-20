import { ArrowRight, Bell, Bookmark, Bold, ChevronRight, Filter, Home, LayoutGrid, Plus, Settings, Sparkles } from "lucide-solid";
import { createSignal } from "solid-js";
import type { JSX } from "solid-js";
import type { RegistryItem } from "~/lib/registry";
import { Breadcrumb } from "~/components/registry/tier-1/actions-navigation/breadcrumb";
import { Button } from "~/components/registry/tier-1/actions-navigation/button";
import { IconButton } from "~/components/registry/tier-1/actions-navigation/icon-button";
import { LinkButton } from "~/components/registry/tier-1/actions-navigation/link-button";
import { Pagination } from "~/components/registry/tier-1/actions-navigation/pagination";
import { Toggle } from "~/components/registry/tier-1/actions-navigation/toggle";
import { ToggleGroup } from "~/components/registry/tier-1/actions-navigation/toggle-group";

function DemoFrame(props: { children: JSX.Element; item: RegistryItem; title: string }) {
  return (
    <div class="space-y-4">
      <div class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        <span>{props.title}</span>
        <span class="text-border">/</span>
        <span>{props.item.name}</span>
      </div>
      <div class="rounded-[1.5rem] border border-border/70 bg-panel p-5 shadow-soft">
        {props.children}
      </div>
    </div>
  );
}

export function ButtonPreview(props: { item: RegistryItem }) {
  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div class="space-y-3">
          <div class="flex flex-wrap gap-3">
            <Button leftIcon={<Sparkles />}>Primary action</Button>
            <Button intent="neutral" tone="outline">Secondary</Button>
            <Button intent="highlight" tone="soft" rightIcon={<ArrowRight />}>
              Highlighted
            </Button>
            <Button destructive>Delete record</Button>
          </div>
          <div class="flex flex-wrap gap-3">
            <Button loading>Syncing</Button>
            <Button pending intent="neutral" tone="soft">Pending</Button>
            <Button size="lg" radius="lg" rightIcon={<ChevronRight />}>Continue flow</Button>
          </div>
        </div>
        <div class="rounded-[1.25rem] border border-dashed border-border/70 bg-background p-4">
          <div class="text-xs uppercase tracking-[0.22em] text-muted">Contract focus</div>
          <p class="mt-3 text-sm leading-6 text-foreground">
            Base recipe plus variant overrides, explicit loading and pending state, and icon placement without hiding
            button semantics.
          </p>
        </div>
      </div>
    </DemoFrame>
  );
}

export function IconButtonPreview(props: { item: RegistryItem }) {
  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="flex flex-wrap items-center gap-3">
        <IconButton label="Create" intent="primary" tone="solid">
          <Plus />
        </IconButton>
        <IconButton label="Notifications" tone="soft">
          <Bell />
        </IconButton>
        <IconButton label="Saved" tone="outline" pressed>
          <Bookmark />
        </IconButton>
        <IconButton label="Settings" tone="ghost" size="lg" shape="square">
          <Settings />
        </IconButton>
        <IconButton label="Syncing" loading tone="soft" />
      </div>
    </DemoFrame>
  );
}

export function LinkButtonPreview(props: { item: RegistryItem }) {
  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="flex flex-wrap gap-3">
        <LinkButton href="/login-basic" intent="primary" tone="solid">Login route</LinkButton>
        <LinkButton href="/pricing-section" intent="highlight" tone="soft" current>
          Active section
        </LinkButton>
        <LinkButton href="https://solidjs.com" external tone="outline">
          Solid docs
        </LinkButton>
        <LinkButton href="/docs-sidebar-layout" tone="ghost" underline pending>
          Pending nav
        </LinkButton>
      </div>
    </DemoFrame>
  );
}

export function TogglePreview(props: { item: RegistryItem }) {
  const [muted, setMuted] = createSignal(false);

  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="flex flex-wrap gap-3">
        <Toggle pressed={muted()} onPressedChange={setMuted} leftIcon={<Bold />}>
          Mute alerts
        </Toggle>
        <Toggle defaultPressed tone="outline">Bookmarked</Toggle>
        <Toggle tone="ghost" pending>Pending</Toggle>
      </div>
    </DemoFrame>
  );
}

export function ToggleGroupPreview(props: { item: RegistryItem }) {
  const [selection, setSelection] = createSignal<string | undefined>("grid");
  const [filters, setFilters] = createSignal<string[]>(["active"]);

  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="space-y-5">
        <ToggleGroup value={selection()} onValueChange={value => setSelection(value as string | undefined)} label="View mode">
          <ToggleGroup.Item value="grid">
            <LayoutGrid />
            <span>Grid</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="list">
            <Filter />
            <span>List</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="board">
            <Sparkles />
            <span>Board</span>
          </ToggleGroup.Item>
        </ToggleGroup>

        <ToggleGroup
          mode="multiple"
          value={filters()}
          onValueChange={value => setFilters((value as string[]) ?? [])}
          label="Quick filters"
          layout="card"
          tone="outline"
          fullWidth
        >
          <ToggleGroup.Item value="active">Active</ToggleGroup.Item>
          <ToggleGroup.Item value="starred">Starred</ToggleGroup.Item>
          <ToggleGroup.Item value="assigned">Assigned</ToggleGroup.Item>
        </ToggleGroup>
      </div>
    </DemoFrame>
  );
}

export function BreadcrumbPreview(props: { item: RegistryItem }) {
  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="space-y-5">
        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/">
                <Home class="size-4" />
                <span>Home</span>
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/dashboard-sidebar-simple">Workspace</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Current>Members</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>

        <Breadcrumb>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Collapsed />
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href="/security-settings">Security</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Current>Sessions</Breadcrumb.Current>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Breadcrumb>
      </div>
    </DemoFrame>
  );
}

export function PaginationPreview(props: { item: RegistryItem }) {
  const [page, setPage] = createSignal(5);

  return (
    <DemoFrame item={props.item} title="Live primitive">
      <div class="space-y-5">
        <Pagination page={page()} onPageChange={setPage} pageCount={12} />
        <Pagination defaultPage={2} pageCount={7} compact showEdges={false} summary={false} />
      </div>
    </DemoFrame>
  );
}
