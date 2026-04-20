import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-solid";
import { Show, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

export const buttonFrameVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap border font-semibold tracking-[-0.01em]",
    "transition-[transform,background-color,border-color,color,box-shadow,opacity] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "data-[loading=true]:cursor-progress data-[pending=true]:cursor-progress data-[pressed=true]:translate-y-px data-[current=true]:ring-2 data-[current=true]:ring-primary/18",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-9 gap-2 px-3.5 text-[0.92rem] [&_svg]:size-4",
        md: "h-10 gap-2.5 px-4 text-sm [&_svg]:size-4.5",
        lg: "h-12 gap-3 px-5 text-[0.98rem] [&_svg]:size-5",
      },
      density: {
        comfortable: "",
        compact: "gap-2 px-3 text-[0.82rem] uppercase tracking-[0.12em]",
      },
      radius: {
        md: "rounded-lg",
        lg: "rounded-xl",
        pill: "rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      density: "comfortable",
      radius: "lg",
      fullWidth: false,
    },
  },
);

const toneMatrix = {
  destructive: {
    solid:
      "border-destructive/30 bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-px hover:border-destructive/45 hover:bg-destructive/92",
    soft: "border-destructive/28 bg-destructive/10 text-destructive hover:border-destructive/36 hover:bg-destructive/14",
    outline: "border-destructive/32 bg-background text-destructive hover:border-destructive/42 hover:bg-destructive/8",
    ghost: "border-transparent bg-transparent text-destructive hover:bg-destructive/10 hover:text-destructive",
  },
  primary: {
    solid:
      "border-primary/25 bg-primary text-primary-foreground shadow-soft hover:-translate-y-px hover:border-primary/38 hover:bg-primary/92",
    soft: "border-accent/38 bg-accent text-accent-foreground hover:border-accent/52 hover:bg-accent/88",
    outline: "border-input bg-background text-foreground hover:border-primary/35 hover:bg-accent/55",
    ghost: "border-transparent bg-transparent text-foreground hover:bg-accent/55 hover:text-foreground",
  },
  neutral: {
    solid: "border-border/75 bg-card text-card-foreground shadow-soft hover:-translate-y-px hover:border-border hover:bg-popover",
    soft: "border-border/70 bg-muted text-foreground hover:border-border/90 hover:bg-card",
    outline: "border-input bg-background text-foreground hover:border-border hover:bg-muted/70",
    ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-background hover:text-foreground",
  },
  highlight: {
    solid: "border-secondary/35 bg-secondary text-secondary-foreground shadow-soft hover:-translate-y-px hover:border-secondary/50 hover:bg-secondary/92",
    soft: "border-secondary/32 bg-secondary/14 text-secondary-foreground hover:border-secondary/46 hover:bg-secondary/18",
    outline: "border-secondary/35 bg-background text-secondary-foreground hover:bg-secondary/10",
    ghost: "border-transparent bg-transparent text-secondary-foreground hover:bg-secondary/10",
  },
} as const;

const pressedMatrix = {
  destructive:
    "data-[pressed=true]:border-destructive/45 data-[pressed=true]:bg-destructive data-[pressed=true]:text-destructive-foreground",
  default:
    "data-[pressed=true]:border-primary/35 data-[pressed=true]:bg-primary data-[pressed=true]:text-primary-foreground data-[pressed=true]:shadow-none",
} as const;

export type ActionIntent = "primary" | "neutral" | "highlight";
export type ActionTone = "solid" | "soft" | "outline" | "ghost";
export type ActionSize = NonNullable<VariantProps<typeof buttonFrameVariants>["size"]>;
export type ActionDensity = NonNullable<VariantProps<typeof buttonFrameVariants>["density"]>;
export type ActionRadius = NonNullable<VariantProps<typeof buttonFrameVariants>["radius"]>;

export type ButtonStyleProps = VariantProps<typeof buttonFrameVariants> & {
  destructive?: boolean;
  intent?: ActionIntent;
  tone?: ActionTone;
};

export function buttonToneClasses(options: {
  destructive?: boolean;
  intent?: ActionIntent;
  tone?: ActionTone;
  pressedTone?: boolean;
}) {
  const palette = options.destructive
    ? toneMatrix.destructive[options.tone ?? "solid"]
    : toneMatrix[options.intent ?? "primary"][options.tone ?? "solid"];

  return cn(
    palette,
    options.pressedTone ? (options.destructive ? pressedMatrix.destructive : pressedMatrix.default) : undefined,
    "data-[pending=true]:opacity-85",
  );
}

export function buttonDisabledState(props: {
  disabled?: boolean;
  loading?: boolean;
  pending?: boolean;
}) {
  return Boolean(props.disabled || props.loading || props.pending);
}

type ActionVisualProps = {
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  children?: JSX.Element;
  loading?: boolean;
  pending?: boolean;
  loadingLabel?: string;
};

export function ActionContent(props: ActionVisualProps) {
  const busyLabel = () => {
    if (props.loading) return props.loadingLabel ?? "Working";
    if (props.pending) return "Pending";
    return props.children;
  };

  return (
    <>
      <Show when={props.loading || props.pending} fallback={props.leftIcon}>
        <LoaderCircle class="animate-spin" />
      </Show>
      <span>{busyLabel()}</span>
      <Show when={!props.loading && !props.pending}>{props.rightIcon}</Show>
    </>
  );
}

export type ButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  ButtonStyleProps & {
    children?: JSX.Element;
    class?: string;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
    loading?: boolean;
    pending?: boolean;
    loadingLabel?: string;
  };

export function Button(userProps: ButtonProps) {
  const props = mergeProps(
    {
      type: "button" as const,
      children: "Button",
      intent: "primary" as const,
      tone: "solid" as const,
      size: "md" as const,
      density: "comfortable" as const,
      radius: "pill" as const,
      fullWidth: false,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "leftIcon",
    "rightIcon",
    "loading",
    "pending",
    "loadingLabel",
    "intent",
    "tone",
    "destructive",
    "size",
    "density",
    "radius",
    "fullWidth",
  ]);

  const unavailable = () => buttonDisabledState(local);

  return (
    <button
      class={cn(
        buttonFrameVariants({
          size: local.size,
          density: local.density,
          radius: local.radius,
          fullWidth: local.fullWidth,
        }),
        buttonToneClasses({
          intent: local.intent,
          tone: local.tone,
          destructive: local.destructive,
        }),
        local.class,
      )}
      disabled={unavailable()}
      aria-busy={local.loading || local.pending ? true : undefined}
      data-current="false"
      data-loading={local.loading ? "true" : "false"}
      data-pending={local.pending ? "true" : "false"}
      data-pressed="false"
      {...others}
    >
      <ActionContent
        leftIcon={local.leftIcon}
        rightIcon={local.rightIcon}
        loading={local.loading}
        pending={local.pending}
        loadingLabel={local.loadingLabel}
      >
        {local.children}
      </ActionContent>
    </button>
  );
}
