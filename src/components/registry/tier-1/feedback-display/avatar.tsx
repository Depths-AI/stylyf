import { Match, Show, Switch, createMemo, createSignal, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

export type AvatarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> & {
  alt?: string;
  class?: string;
  fallback?: JSX.Element;
  shape?: "circle" | "rounded";
  size?: "lg" | "md" | "sm";
  src?: string;
  status?: "offline" | "online";
};

export function Avatar(userProps: AvatarProps) {
  const props = mergeProps({ alt: "Stylyf user", shape: "circle" as const, size: "md" as const, status: undefined }, userProps);
  const [local, others] = splitProps(props, ["alt", "class", "fallback", "shape", "size", "src", "status"]);
  const [failed, setFailed] = createSignal(false);
  const initials = createMemo(() =>
    local.alt
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join("") || "ST",
  );

  const sizeClass = () =>
    ({
      sm: "size-10 text-sm",
      md: "size-12 text-base",
      lg: "size-16 text-lg",
    })[local.size];

  return (
    <div class={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-border/70 bg-panel shadow-soft", sizeClass(), local.shape === "circle" ? "rounded-full" : "rounded-[1.1rem]", local.class)} {...others}>
      <Switch fallback={<span class="font-semibold tracking-[0.08em] text-foreground">{local.fallback ?? initials()}</span>}>
        <Match when={local.src && !failed()}>
          <img src={local.src} alt={local.alt} class="size-full object-cover" onError={() => setFailed(true)} />
        </Match>
      </Switch>
      <Show when={local.status}>
        <span
          class={cn(
            "absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-panel",
            local.status === "online" ? "bg-emerald-400" : "bg-muted",
          )}
        />
      </Show>
    </div>
  );
}
