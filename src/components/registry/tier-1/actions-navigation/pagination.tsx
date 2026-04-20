import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-solid";
import { For, Show, createMemo, createSignal, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";
import { buttonFrameVariants, buttonToneClasses } from "~/components/registry/tier-1/actions-navigation/button";

type PaginationToken = number | "ellipsis";

function buildRange(currentPage: number, pageCount: number, siblingCount: number, showEdges: boolean) {
  const numbers = new Set<number>();
  const start = Math.max(1, currentPage - siblingCount);
  const end = Math.min(pageCount, currentPage + siblingCount);

  for (let page = start; page <= end; page += 1) {
    numbers.add(page);
  }

  if (showEdges) {
    numbers.add(1);
    numbers.add(pageCount);
  }

  const sorted = Array.from(numbers).sort((left, right) => left - right);
  const tokens: PaginationToken[] = [];

  sorted.forEach((value, index) => {
    const previous = sorted[index - 1];

    if (previous && value - previous > 1) {
      tokens.push("ellipsis");
    }

    tokens.push(value);
  });

  return tokens;
}

export type PaginationProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & {
  class?: string;
  compact?: boolean;
  defaultPage?: number;
  disabled?: boolean;
  onPageChange?: (page: number) => void;
  page?: number;
  pageCount?: number;
  siblingCount?: number;
  showEdges?: boolean;
  summary?: boolean;
};

export function Pagination(userProps: PaginationProps) {
  const props = mergeProps(
    {
      compact: false,
      defaultPage: 3,
      pageCount: 9,
      siblingCount: 1,
      showEdges: true,
      summary: true,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "class",
    "compact",
    "defaultPage",
    "disabled",
    "onPageChange",
    "page",
    "pageCount",
    "showEdges",
    "siblingCount",
    "summary",
  ]);

  const [internalPage, setInternalPage] = createSignal(local.defaultPage);
  const page = createMemo(() => {
    const raw = local.page ?? internalPage();
    return Math.min(Math.max(raw, 1), local.pageCount);
  });

  const tokens = createMemo(() => buildRange(page(), local.pageCount, local.siblingCount, local.showEdges));

  const commit = (nextPage: number) => {
    const clamped = Math.min(Math.max(nextPage, 1), local.pageCount);

    if (local.page === undefined) {
      setInternalPage(clamped);
    }

    local.onPageChange?.(clamped);
  };

  const basePageButton =
    "min-w-10 px-0 data-[current=true]:border-accent/35 data-[current=true]:bg-foreground data-[current=true]:text-background data-[current=true]:shadow-soft";

  return (
    <nav
      aria-label="Pagination"
      class={cn("flex flex-col gap-3 text-sm", local.class)}
      {...others}
    >
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="button"
          class={cn(
            buttonFrameVariants({ size: local.compact ? "sm" : "md", density: "comfortable", radius: "pill" }),
            buttonToneClasses({ intent: "neutral", tone: "outline" }),
          )}
          disabled={local.disabled || page() <= 1}
          onClick={() => commit(page() - 1)}
        >
          <ChevronLeft class="size-4" />
          <span>Previous</span>
        </button>

        <div class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-panel p-1.5 shadow-inset">
          <For each={tokens()}>
            {token => (
              <Show
                when={token !== "ellipsis"}
                fallback={
                  <span class="inline-flex h-10 min-w-10 items-center justify-center text-muted" aria-hidden="true">
                    <MoreHorizontal class="size-4" />
                  </span>
                }
              >
                <button
                  type="button"
                  class={cn(
                    buttonFrameVariants({
                      size: local.compact ? "sm" : "md",
                      density: "comfortable",
                      radius: "pill",
                    }),
                    buttonToneClasses({ intent: "neutral", tone: "ghost" }),
                    basePageButton,
                  )}
                  aria-current={page() === token ? "page" : undefined}
                  data-current={page() === token ? "true" : "false"}
                  data-loading="false"
                  data-pending="false"
                  data-pressed="false"
                  disabled={local.disabled}
                  onClick={() => commit(token as number)}
                >
                  {token}
                </button>
              </Show>
            )}
          </For>
        </div>

        <button
          type="button"
          class={cn(
            buttonFrameVariants({ size: local.compact ? "sm" : "md", density: "comfortable", radius: "pill" }),
            buttonToneClasses({ intent: "neutral", tone: "outline" }),
          )}
          disabled={local.disabled || page() >= local.pageCount}
          onClick={() => commit(page() + 1)}
        >
          <span>Next</span>
          <ChevronRight class="size-4" />
        </button>
      </div>

      <Show when={local.summary}>
        <div class="text-sm text-muted">
          Page <span class="font-semibold text-foreground">{page()}</span> of{" "}
          <span class="font-semibold text-foreground">{local.pageCount}</span>
        </div>
      </Show>
    </nav>
  );
}
