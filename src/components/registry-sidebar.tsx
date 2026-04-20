import { For, Show } from "solid-js";
import { ChevronDown, Search } from "lucide-solid";
import { cn } from "~/lib/cn";
import type { RegistryClusterSection } from "~/lib/registry";

type RegistrySidebarProps = {
  clusters: RegistryClusterSection[];
  onClusterIntent?: (clusterId: string) => void;
  onComponentIntent?: (clusterId: string) => void;
  query: string;
  totalComponents: number;
  onQueryInput: (value: string) => void;
};

export function RegistrySidebar(props: RegistrySidebarProps) {
  return (
    <aside class="ui-shell p-4 lg:sticky lg:top-24">
      <div class="ui-shell-muted flex items-center gap-3 px-4 py-3">
        <Search class="size-4 text-muted-foreground" />
        <input
          value={props.query}
          onInput={event => props.onQueryInput(event.currentTarget.value)}
          type="search"
          placeholder="Search clusters or components"
          class="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div class="ui-shell-muted mt-4 px-4 py-4">
        <div class="flex items-center justify-between gap-3">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Navigation</div>
            <div class="mt-1 text-lg font-semibold text-foreground">{props.clusters.length} clusters</div>
          </div>
          <div class="ui-pillbar px-3 py-1 text-xs text-muted-foreground">
            {props.totalComponents} components
          </div>
        </div>
        <p class="mt-3 text-sm leading-6 text-muted-foreground">
          One scrollable section per cluster, with each component nested as a subsection inside it.
        </p>
      </div>

      <nav class="mt-4 space-y-3">
        <For each={props.clusters}>
          {cluster => (
            <details open class="group rounded-[var(--radius-xl)] border border-border/80 bg-background px-4 py-3">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{cluster.tierLabel}</div>
                  <a
                    href={`#${cluster.id}`}
                    data-sidebar-cluster={cluster.id}
                    onMouseEnter={() => props.onClusterIntent?.(cluster.id)}
                    onFocus={() => props.onClusterIntent?.(cluster.id)}
                    onPointerDown={() => props.onClusterIntent?.(cluster.id)}
                    class="mt-1 block truncate text-sm font-semibold text-foreground hover:text-accent-strong"
                  >
                    {cluster.title}
                  </a>
                </div>
                <div class="flex items-center gap-3">
                  <span class="ui-pillbar px-3 py-1 text-xs text-muted-foreground">
                    {cluster.items.length}
                  </span>
                  <ChevronDown class="size-4 text-muted-foreground transition group-open:rotate-180" />
                </div>
              </summary>

              <div class="mt-3 space-y-1 border-t border-border/70 pt-3">
                <For each={cluster.items}>
                  {item => (
                    <a
                      href={`#${item.slug}`}
                      data-sidebar-component={item.slug}
                      onMouseEnter={() => props.onComponentIntent?.(cluster.id)}
                      onFocus={() => props.onComponentIntent?.(cluster.id)}
                      onPointerDown={() => props.onComponentIntent?.(cluster.id)}
                      class={cn(
                        "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted-soft hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30",
                      )}
                    >
                      <span class="truncate">{item.name}</span>
                      <Show when={item.registryShape.includes("page")}>
                        <span class="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]">
                          page
                        </span>
                      </Show>
                    </a>
                  )}
                </For>
              </div>
            </details>
          )}
        </For>
      </nav>
    </aside>
  );
}
