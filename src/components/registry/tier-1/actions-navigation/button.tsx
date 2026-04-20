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
    "data-[loading=true]:cursor-progress data-[pending=true]:cursor-progress data-[pressed=true]:translate-y-px data-[current=true]:ring-2 data-[current=true]:ring-accent/20",
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
        md: "rounded-[1rem]",
        lg: "rounded-[1.2rem]",
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
      radius: "pill",
      fullWidth: false,
    },
  },
);

const toneMatrix = {
  destructive: {
    solid:
      "border-rose-500/35 bg-rose-600 text-white shadow-soft hover:-translate-y-px hover:border-rose-400/40 hover:bg-rose-500",
    soft: "border-rose-500/20 bg-rose-500/12 text-rose-300 hover:border-rose-400/30 hover:bg-rose-500/18",
    outline: "border-rose-500/30 bg-background text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/10",
    ghost: "border-transparent bg-transparent text-rose-300 hover:bg-rose-500/10 hover:text-rose-200",
  },
  primary: {
    solid:
      "border-foreground/10 bg-foreground text-background shadow-soft hover:-translate-y-px hover:border-foreground/20 hover:bg-foreground/92",
    soft: "border-accent/20 bg-accent/12 text-accent-strong hover:border-accent/35 hover:bg-accent/18",
    outline: "border-border/80 bg-background text-foreground hover:border-accent/35 hover:bg-accent/7",
    ghost: "border-transparent bg-transparent text-foreground hover:bg-background hover:text-foreground",
  },
  neutral: {
    solid: "border-border/75 bg-panel text-foreground shadow-soft hover:-translate-y-px hover:border-border hover:bg-background",
    soft: "border-border/65 bg-muted-soft text-foreground hover:border-border/90 hover:bg-panel",
    outline: "border-border/80 bg-background text-foreground hover:border-border hover:bg-muted-soft/70",
    ghost: "border-transparent bg-transparent text-muted hover:bg-background hover:text-foreground",
  },
  highlight: {
    solid: "border-highlight/30 bg-highlight text-ink shadow-soft hover:-translate-y-px hover:border-highlight/45 hover:bg-highlight/92",
    soft: "border-highlight/25 bg-highlight/14 text-highlight-strong hover:border-highlight/40 hover:bg-highlight/18",
    outline: "border-highlight/30 bg-background text-highlight-strong hover:bg-highlight/10",
    ghost: "border-transparent bg-transparent text-highlight-strong hover:bg-highlight/10",
  },
} as const;

const pressedMatrix = {
  destructive: "data-[pressed=true]:border-rose-400/50 data-[pressed=true]:bg-rose-500 data-[pressed=true]:text-white",
  default:
    "data-[pressed=true]:border-accent/35 data-[pressed=true]:bg-foreground data-[pressed=true]:text-background data-[pressed=true]:shadow-none",
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
