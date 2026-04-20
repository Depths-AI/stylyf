import { mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { X } from "lucide-solid";
import { cn } from "~/lib/cn";

export type BadgeProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children" | "ref"> & {
  children?: JSX.Element;
  class?: string;
  emphasis?: "soft" | "solid";
  icon?: JSX.Element;
  onRemove?: () => void;
  removable?: boolean;
  selected?: boolean;
  size?: "md" | "sm";
  tone?: "accent" | "danger" | "neutral" | "success";
};

const toneStyles = {
  accent: {
    soft: "border-accent/25 bg-accent/10 text-accent-strong",
    solid: "border-accent/30 bg-accent text-ink",
  },
  danger: {
    soft: "border-rose-500/25 bg-rose-500/12 text-rose-300",
    solid: "border-rose-500/35 bg-rose-500 text-white",
  },
  neutral: {
    soft: "border-border/70 bg-panel text-foreground",
    solid: "border-border/80 bg-foreground text-background",
  },
  success: {
    soft: "border-emerald-400/25 bg-emerald-400/12 text-emerald-300",
    solid: "border-emerald-400/35 bg-emerald-500 text-white",
  },
} as const;

export function Badge(userProps: BadgeProps) {
  const props = mergeProps(
    { emphasis: "soft" as const, removable: false, selected: false, size: "sm" as const, tone: "neutral" as const },
    userProps,
  );
  const [local, others] = splitProps(props, ["children", "class", "emphasis", "icon", "onRemove", "removable", "selected", "size", "tone"]);

  return (
    <span
      class={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium tracking-[-0.01em]",
        local.size === "sm" ? "min-h-7 px-3 text-xs" : "min-h-8 px-3.5 text-sm",
        toneStyles[local.tone][local.emphasis],
        local.selected && "ring-2 ring-ring/20",
        local.class,
      )}
      data-selected={local.selected ? "true" : "false"}
      {...others}
    >
      {local.icon ? <span class="inline-flex">{local.icon}</span> : null}
      <span>{local.children ?? "Badge"}</span>
      {local.removable ? (
        <button
          type="button"
          aria-label="Remove badge"
          class="inline-flex size-4 items-center justify-center rounded-full bg-background/18 transition hover:bg-background/28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          onClick={() => local.onRemove?.()}
        >
          <X class="size-3" />
        </button>
      ) : null}
    </span>
  );
}
