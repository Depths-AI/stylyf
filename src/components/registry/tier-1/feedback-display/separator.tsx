import { Show, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

export type SeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> & {
  class?: string;
  label?: JSX.Element;
  orientation?: "horizontal" | "vertical";
  tone?: "accent" | "default";
};

export function Separator(userProps: SeparatorProps) {
  const props = mergeProps({ label: undefined, orientation: "horizontal" as const, tone: "default" as const }, userProps);
  const [local, others] = splitProps(props, ["class", "label", "orientation", "tone"]);

  return (
    <div
      role="separator"
      aria-orientation={local.orientation}
      class={cn(
        "flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-muted",
        local.orientation === "vertical" ? "h-full flex-col" : "w-full",
        local.class,
      )}
      {...others}
    >
      <div class={cn("bg-border", local.orientation === "vertical" ? "h-full w-px" : "h-px flex-1", local.tone === "accent" && "bg-accent/35")} />
      <Show when={local.label}>
        <span>{local.label}</span>
        <div class={cn("bg-border", local.orientation === "vertical" ? "h-full w-px" : "h-px flex-1", local.tone === "accent" && "bg-accent/35")} />
      </Show>
    </div>
  );
}
