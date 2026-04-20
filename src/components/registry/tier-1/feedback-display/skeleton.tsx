import { mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

export type SkeletonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "ref"> & {
  class?: string;
  height?: string;
  shimmer?: boolean;
  shape?: "circle" | "line" | "rect";
  width?: string;
};

export function Skeleton(userProps: SkeletonProps) {
  const props = mergeProps({ height: "1rem", shimmer: true, shape: "rect" as const, width: "100%" }, userProps);
  const [local, others] = splitProps(props, ["class", "height", "shimmer", "shape", "width"]);

  return (
    <div
      class={cn(
        "relative overflow-hidden border border-border/70 bg-muted-soft",
        local.shape === "circle" ? "rounded-full" : local.shape === "line" ? "rounded-full" : "rounded-[1rem]",
        local.shimmer && "before:absolute before:inset-0 before:animate-[pulse_1.6s_ease-in-out_infinite] before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent",
        local.class,
      )}
      style={{ height: local.height, width: local.width }}
      aria-hidden="true"
      {...others}
    />
  );
}
