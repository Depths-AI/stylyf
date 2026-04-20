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
    soft: "border-accent/35 bg-accent text-accent-foreground",
    solid: "border-primary/30 bg-primary text-primary-foreground",
  },
  danger: {
    soft: "border-destructive/30 bg-destructive/10 text-destructive",
    solid: "border-destructive/35 bg-destructive text-destructive-foreground",
  },
  neutral: {
    soft: "border-border/70 bg-card text-card-foreground",
    solid: "border-border/80 bg-foreground text-background",
  },
  success: {
    soft: "border-success/30 bg-success/10 text-success",
    solid: "border-success/35 bg-success text-success-foreground",
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
