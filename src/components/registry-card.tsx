import { Dynamic } from "solid-js/web";
import { For, Show, createEffect, createSignal } from "solid-js";
import type { Component } from "solid-js";
import { ArrowRight } from "lucide-solid";
import { CopyButton } from "~/components/copy-button";
import { PreviewShell } from "~/components/preview-shell";
import { Skeleton } from "~/components/registry/tier-1/feedback-display/skeleton";
import { cn } from "~/lib/cn";
import { targetPath, type RegistryItem } from "~/lib/registry";
import { loadSourceFor } from "~/lib/registry-source";

type RegistryPane = "preview" | "source";

function pillTone(index: number) {
  const tones = [
    "border-accent/30 bg-accent/10 text-accent-strong",
    "border-highlight/30 bg-highlight/12 text-highlight-strong",
    "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  ];

  return tones[index % tones.length];
}

function PreviewPlaceholder() {
  return (
    <div class="space-y-4">
      <div class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        <span>Deferred preview</span>
        <span class="text-border">/</span>
        <span>Loading on demand</span>
      </div>
      <div class="rounded-[1.5rem] border border-border/70 bg-panel p-5 shadow-soft">
        <div class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div class="space-y-3">
            <Skeleton shape="line" width="10rem" height="0.85rem" />
            <Skeleton width="100%" height="4rem" />
            <Skeleton width="82%" height="3rem" />
          </div>
          <div class="space-y-3 rounded-[1.2rem] border border-border/70 bg-background p-4">
            <Skeleton shape="line" width="8rem" height="0.8rem" />
            <Skeleton width="100%" height="1rem" />
            <Skeleton width="90%" height="1rem" />
            <Skeleton width="64%" height="1rem" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcePlaceholder(props: { loading: boolean }) {
  return (
    <div>
      <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {props.loading ? "Loading source" : "Source on demand"}
      </div>
      <div class="mt-1 text-sm text-foreground">
        {props.loading ? "Fetching the current source file." : "Open this tab to fetch the live source without front-loading every file."}
      </div>
      <div class="mt-4 space-y-3 rounded-[1.2rem] border border-border/70 bg-ink px-4 py-4">
        <Skeleton width="20%" height="0.8rem" class="bg-white/8 border-white/10" />
        <Skeleton width="88%" height="0.8rem" class="bg-white/8 border-white/10" />
        <Skeleton width="74%" height="0.8rem" class="bg-white/8 border-white/10" />
        <Skeleton width="94%" height="0.8rem" class="bg-white/8 border-white/10" />
        <Skeleton width="60%" height="0.8rem" class="bg-white/8 border-white/10" />
      </div>
    </div>
  );
}

export function RegistryCard(props: {
  item: RegistryItem;
  previewComponent?: Component<{ item: RegistryItem }>;
  previewReady: boolean;
}) {
  const [activePane, setActivePane] = createSignal<RegistryPane>("preview");
  const [source, setSource] = createSignal<string>();
  const [sourceStatus, setSourceStatus] = createSignal<"idle" | "loading" | "ready" | "error">("idle");

  createEffect(() => {
    if (activePane() !== "source" || sourceStatus() !== "idle") {
      return;
    }

    setSourceStatus("loading");
    void loadSourceFor(props.item)
      .then(value => {
        setSource(value);
        setSourceStatus("ready");
      })
      .catch(() => {
        setSourceStatus("error");
      });
  });

  const sourceReady = () => sourceStatus() === "ready" && Boolean(source());
  const sourceValue = () => source() ?? "";

  return (
    <article
      id={props.item.slug}
      data-registry-card={props.item.slug}
      class="scroll-mt-28 rounded-[1.8rem] border border-border/70 bg-panel/92 p-6 shadow-soft backdrop-blur-sm lg:p-7"
    >
      <div class="flex flex-col gap-6">
        <header class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
              <span>{props.item.tierLabel}</span>
              <span class="text-border">/</span>
              <span>{props.item.clusterLabel}</span>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <h3 class="text-2xl font-semibold tracking-tight text-foreground">{props.item.name}</h3>
              <span class="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted">
                {props.item.registryShape}
              </span>
            </div>
            <p class="mt-3 max-w-3xl text-sm leading-6 text-muted">{props.item.description}</p>
          </div>

          <div class="flex items-center gap-3">
            <CopyButton
              value={sourceValue()}
              disabled={!sourceReady()}
              label={sourceStatus() === "loading" ? "Loading source" : "Copy source"}
            />
            <a
              href={`#${props.item.slug}`}
              class="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-muted transition hover:border-accent/50 hover:text-foreground"
            >
              <span>Deep link</span>
              <ArrowRight class="size-3.5" />
            </a>
          </div>
        </header>

        <div class="grid gap-4 lg:grid-cols-2">
          <div class="rounded-[1.4rem] border border-border/70 bg-background p-4">
            <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Style params</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <For each={props.item.styleParams}>
                {(param, index) => (
                  <span class={cn("rounded-full border px-3 py-1 text-xs", pillTone(index()))}>{param}</span>
                )}
              </For>
            </div>
          </div>

          <div class="rounded-[1.4rem] border border-border/70 bg-background p-4">
            <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">State params</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <Show
                when={props.item.stateParams.length}
                fallback={
                  <span class="rounded-full border border-border/70 bg-panel px-3 py-1 text-xs text-muted">
                    No special state contract
                  </span>
                }
              >
                <For each={props.item.stateParams}>
                  {(param, index) => (
                    <span class={cn("rounded-full border px-3 py-1 text-xs", pillTone(index() + 1))}>{param}</span>
                  )}
                </For>
              </Show>
            </div>
          </div>
        </div>

        <section class="rounded-[1.5rem] border border-border/70 bg-background-subtle p-5 shadow-inset">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="inline-flex rounded-full border border-border/70 bg-panel p-1">
              <button
                type="button"
                onClick={() => setActivePane("preview")}
                data-pane-trigger="preview"
                class={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  activePane() === "preview"
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground",
                )}
              >
                Actual display
              </button>
              <button
                type="button"
                onClick={() => setActivePane("source")}
                data-pane-trigger="source"
                class={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  activePane() === "source"
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground",
                )}
              >
                Source code
              </button>
            </div>

            <Show when={activePane() === "source"}>
              <div class="flex items-center gap-3">
                <div class="hidden text-sm text-muted sm:block">{targetPath(props.item)}</div>
                <CopyButton
                  value={sourceValue()}
                  disabled={!sourceReady()}
                  label={sourceStatus() === "loading" ? "Loading source" : "Copy source"}
                />
              </div>
            </Show>
          </div>

          <div class="mt-5">
            <Show
              when={activePane() === "preview"}
              fallback={
                <Show
                  when={sourceReady()}
                  fallback={<SourcePlaceholder loading={sourceStatus() === "loading"} />}
                >
                  <div>
                    <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Live source</div>
                    <div class="mt-1 text-sm text-foreground">{targetPath(props.item)}</div>
                    <pre class="mt-4 max-h-[30rem] overflow-auto rounded-[1.2rem] border border-border/70 bg-ink px-4 py-4 text-[12px] leading-6 text-ink-foreground">
                      <code>{sourceValue()}</code>
                    </pre>
                  </div>
                </Show>
              }
            >
              <Show when={props.previewReady} fallback={<PreviewPlaceholder />}>
                <Show when={props.previewComponent} fallback={<PreviewShell item={props.item} />}>
                  {PreviewComponent => <Dynamic component={PreviewComponent()} item={props.item} />}
                </Show>
              </Show>
            </Show>
          </div>
        </section>
      </div>
    </article>
  );
}
