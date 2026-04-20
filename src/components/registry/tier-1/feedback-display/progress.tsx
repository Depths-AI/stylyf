import { Show, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

export type ProgressProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  animated?: boolean;
  class?: string;
  indeterminate?: boolean;
  label?: JSX.Element;
  max?: number;
  striped?: boolean;
  tone?: "accent" | "danger" | "highlight";
  value?: number;
};

const toneClasses = {
  accent: "bg-primary text-primary-foreground",
  danger: "bg-destructive text-destructive-foreground",
  highlight: "bg-secondary text-secondary-foreground",
} as const;

export function Progress(userProps: ProgressProps) {
  const props = mergeProps(
    {
      animated: false,
      indeterminate: false,
      label: "Progress",
      max: 100,
      striped: false,
      tone: "accent" as const,
      value: 64,
    },
    userProps,
  );

  const [local, others] = splitProps(props, ["animated", "class", "indeterminate", "label", "max", "striped", "tone", "value"]);
  const safeValue = () => Math.min(local.max, Math.max(0, local.value));
  const percent = () => `${(safeValue() / local.max) * 100}%`;

  return (
    <div class={cn("space-y-3", local.class)} {...others}>
      <div class="flex items-center justify-between gap-3 text-sm">
        <div class="font-medium text-foreground">{local.label}</div>
        <Show when={!local.indeterminate}>
          <div class="text-muted-foreground">{Math.round((safeValue() / local.max) * 100)}%</div>
        </Show>
      </div>
      <div class="overflow-hidden rounded-full border border-border/70 bg-background p-1">
        <div
          role="progressbar"
          aria-label={typeof local.label === "string" ? local.label : undefined}
          aria-valuemax={local.indeterminate ? undefined : local.max}
          aria-valuemin={local.indeterminate ? undefined : 0}
          aria-valuenow={local.indeterminate ? undefined : safeValue()}
          class={cn(
            "h-3 rounded-full transition-[width,transform] duration-300",
            toneClasses[local.tone],
            local.striped &&
              "bg-[linear-gradient(135deg,transparent_0,transparent_35%,rgba(255,255,255,0.22)_35%,rgba(255,255,255,0.22)_50%,transparent_50%,transparent_85%,rgba(255,255,255,0.22)_85%,rgba(255,255,255,0.22)_100%)] bg-[length:18px_18px]",
            local.animated && local.striped && "animate-[pulse_1.8s_ease-in-out_infinite]",
            local.indeterminate && "w-2/5 animate-[pulse_1.4s_ease-in-out_infinite]",
          )}
          style={local.indeterminate ? { transform: "translateX(60%)" } : { width: percent() }}
        />
      </div>
    </div>
  );
}
