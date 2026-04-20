import { LoaderCircle, Plus } from "lucide-solid";
import { mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";
import {
  type ActionDensity,
  type ActionIntent,
  type ActionRadius,
  type ActionSize,
  type ActionTone,
  buttonDisabledState,
  buttonFrameVariants,
  buttonToneClasses,
} from "~/components/registry/tier-1/actions-navigation/button";

type IconButtonShape = "square" | "round" | "pill";

const shapeClasses: Record<IconButtonShape, string> = {
  square: "rounded-[1rem]",
  round: "rounded-full",
  pill: "rounded-[1.35rem]",
};

const sizeClasses: Record<ActionSize, string> = {
  sm: "size-9 px-0",
  md: "size-10 px-0",
  lg: "size-12 px-0",
};

export type IconButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  class?: string;
  children?: JSX.Element;
  density?: ActionDensity;
  destructive?: boolean;
  intent?: ActionIntent;
  label?: string;
  loading?: boolean;
  pending?: boolean;
  pressed?: boolean;
  radius?: ActionRadius;
  shape?: IconButtonShape;
  size?: ActionSize;
  tone?: ActionTone;
};

export function IconButton(userProps: IconButtonProps) {
  const props = mergeProps(
    {
      type: "button" as const,
      intent: "neutral" as const,
      tone: "soft" as const,
      size: "md" as const,
      density: "comfortable" as const,
      shape: "round" as const,
      label: "Icon button",
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "density",
    "destructive",
    "intent",
    "label",
    "loading",
    "pending",
    "pressed",
    "radius",
    "shape",
    "size",
    "tone",
    "type",
  ]);

  const unavailable = () => buttonDisabledState(local);

  return (
    <button
      type={local.type ?? "button"}
      class={cn(
        buttonFrameVariants({
          size: local.size,
          density: local.density,
          radius: local.radius ?? "pill",
          fullWidth: false,
        }),
        sizeClasses[local.size],
        shapeClasses[local.shape],
        "gap-0",
        buttonToneClasses({
          intent: local.intent,
          tone: local.tone,
          destructive: local.destructive,
          pressedTone: true,
        }),
        local.class,
      )}
      disabled={unavailable()}
      aria-busy={local.loading || local.pending ? true : undefined}
      aria-label={local.label}
      aria-pressed={local.pressed ? true : undefined}
      data-current="false"
      data-loading={local.loading ? "true" : "false"}
      data-pending={local.pending ? "true" : "false"}
      data-pressed={local.pressed ? "true" : "false"}
      {...others}
    >
      {local.loading || local.pending ? <LoaderCircle class="animate-spin" /> : local.children ?? <Plus />}
    </button>
  );
}
