import { Title } from "@solidjs/meta";
import { For, Show, createMemo, createSignal } from "solid-js";
import { Layers3, Orbit } from "lucide-solid";
import { RegistryCard } from "~/components/registry-card";
import { RegistrySidebar } from "~/components/registry-sidebar";
import { registryClusters, registryCounts, type RegistryClusterSection } from "~/lib/registry";

function matchesCluster(cluster: RegistryClusterSection, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return cluster;
  }

  const matchesClusterLabel = [
    cluster.title,
    cluster.description,
    cluster.tierLabel,
    cluster.tierTitle,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);

  const items = cluster.items.filter(item => {
    const haystack = [
      item.name,
      item.description,
      item.pattern,
      item.notes,
      item.registryShape,
      item.clusterLabel,
      ...item.styleParams,
      ...item.stateParams,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  if (matchesClusterLabel && items.length === 0) {
    return cluster;
  }

  return {
    ...cluster,
    items,
  };
}

export default function Home() {
  const [query, setQuery] = createSignal("");

  const filteredClusters = createMemo(() =>
    registryClusters
      .map(cluster => matchesCluster(cluster, query()))
      .filter(cluster => cluster.items.length),
  );

  const visibleComponentCount = createMemo(() =>
    filteredClusters().reduce((sum, cluster) => sum + cluster.items.length, 0),
  );

  return (
    <main id="library" class="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <Title>Stylyf | Registry</Title>

      <section class="relative overflow-hidden rounded-[2rem] border border-border/70 bg-panel/92 px-6 py-7 shadow-soft backdrop-blur-sm sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div class="pointer-events-none absolute inset-0 bg-linear-to-br from-accent/18 via-transparent to-highlight/16" />
        <div class="relative grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:items-end">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              <Orbit class="size-3.5" />
              <span>Cluster-first registry demo</span>
            </div>
            <h1 class="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              One scrollable section per cluster, one subsection per component.
            </h1>
            <p class="mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
              The demo app is structured as a single vertical registry page. Each cluster is a section. Each component
              inside that cluster is rendered as its own subsection with the same review contract: name, description,
              style params, state params, actual display, source display, and copy action.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div class="rounded-[1.5rem] border border-border/70 bg-background/92 p-5 shadow-inset">
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Clusters</div>
              <div class="mt-2 text-3xl font-semibold tracking-tight text-foreground">{registryClusters.length}</div>
              <div class="mt-2 text-sm text-muted">Role-based sections across all three tiers.</div>
            </div>
            <div class="rounded-[1.5rem] border border-border/70 bg-background/92 p-5 shadow-inset">
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Components</div>
              <div class="mt-2 text-3xl font-semibold tracking-tight text-foreground">{registryCounts.total}</div>
              <div class="mt-2 text-sm text-muted">Each one rendered with the same preview and source contract.</div>
            </div>
            <div class="rounded-[1.5rem] border border-border/70 bg-background/92 p-5 shadow-inset">
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Current view</div>
              <div class="mt-2 text-3xl font-semibold tracking-tight text-foreground">{visibleComponentCount()}</div>
              <div class="mt-2 text-sm text-muted">Visible after cluster and component filtering.</div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        <RegistrySidebar
          clusters={filteredClusters()}
          query={query()}
          totalComponents={visibleComponentCount()}
          onQueryInput={setQuery}
        />

        <div class="space-y-8">
          <Show
            when={filteredClusters().length}
            fallback={
              <section class="rounded-[1.8rem] border border-border/70 bg-panel/92 p-8 shadow-soft">
                <div class="max-w-xl">
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">No matches</div>
                  <h2 class="mt-3 text-2xl font-semibold tracking-tight text-foreground">The current filter hides every cluster.</h2>
                  <p class="mt-3 text-sm leading-6 text-muted">
                    Try a cluster term like <code class="rounded bg-background px-1.5 py-0.5">navigation</code> or a
                    component/state term like <code class="rounded bg-background px-1.5 py-0.5">dialog</code> or{" "}
                    <code class="rounded bg-background px-1.5 py-0.5">loading</code>.
                  </p>
                </div>
              </section>
            }
          >
            <For each={filteredClusters()}>
              {cluster => (
                <section id={cluster.id} class="scroll-mt-28 space-y-5">
                  <header class="rounded-[1.8rem] border border-border/70 bg-panel/92 p-6 shadow-soft backdrop-blur-sm lg:p-7">
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                          <span>{cluster.tierLabel}</span>
                          <span class="text-border">/</span>
                          <span>{cluster.tierTitle}</span>
                        </div>
                        <div class="mt-3 flex items-center gap-3">
                          <Layers3 class="size-5 text-accent-strong" />
                          <h2 class="text-3xl font-semibold tracking-tight text-foreground">{cluster.title}</h2>
                        </div>
                        <p class="mt-3 max-w-3xl text-sm leading-6 text-muted">{cluster.description}</p>
                      </div>
                      <div class="rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted">
                        {cluster.items.length} components
                      </div>
                    </div>
                  </header>

                  <div class="space-y-5">
                    <For each={cluster.items}>{item => <RegistryCard item={item} />}</For>
                  </div>
                </section>
              )}
            </For>
          </Show>
        </div>
      </section>
    </main>
  );
}
