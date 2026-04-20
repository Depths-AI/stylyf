import { Check, X } from "lucide-solid";
import { Show, createSignal, createUniqueId, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

type FieldSize = "sm" | "md" | "lg";

type SwitchTone = "soft" | "solid" | "outline";
type SwitchLabelPlacement = "end" | "start";

const trackSizes = {
  sm: "h-7 w-12",
  md: "h-9 w-15",
  lg: "h-10 w-17",
} as const;

const thumbSizes = {
  sm: "size-5 data-[checked=true]:translate-x-5",
  md: "size-7 data-[checked=true]:translate-x-[1.625rem]",
  lg: "size-8 data-[checked=true]:translate-x-7",
} as const;

export type SwitchProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "size"> & {
  checked?: boolean;
  class?: string;
  defaultChecked?: boolean;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  invalid?: boolean;
  label?: JSX.Element;
  labelPlacement?: SwitchLabelPlacement;
  onCheckedChange?: (checked: boolean) => void;
  size?: FieldSize;
  tone?: SwitchTone;
};

export function Switch(userProps: SwitchProps) {
  const props = mergeProps(
    {
      defaultChecked: false,
      invalid: false,
      labelPlacement: "end" as const,
      size: "md" as const,
      tone: "soft" as const,
      type: "button" as const,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "checked",
    "class",
    "defaultChecked",
    "description",
    "errorMessage",
    "id",
    "invalid",
    "label",
    "labelPlacement",
    "onCheckedChange",
    "onClick",
    "size",
    "tone",
    "type",
  ]);

  const [internalChecked, setInternalChecked] = createSignal(local.defaultChecked);
  const checked = () => local.checked ?? internalChecked();
  const baseId = local.id ?? createUniqueId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const describedBy = [local.description ? descriptionId : undefined, local.invalid && local.errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  const commit = (next: boolean) => {
    if (local.checked === undefined) {
      setInternalChecked(next);
    }

    local.onCheckedChange?.(next);
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    const onClick = local.onClick as JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined;
    onClick?.(event);

    if (event.defaultPrevented || others.disabled) {
      return;
    }

    commit(!checked());
  };

  return (
    <div
      class={cn(
        "flex items-start gap-3",
        local.labelPlacement === "start" && "flex-row-reverse justify-end",
        others.disabled && "opacity-70",
        local.class,
      )}
    >
      <button
        id={baseId}
        type={local.type}
        role="switch"
        aria-checked={checked()}
        aria-describedby={describedBy}
        aria-invalid={local.invalid ? true : undefined}
        onClick={handleClick}
        class={cn(
          "relative inline-flex shrink-0 items-center rounded-full border shadow-inset transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/24",
          trackSizes[local.size],
          local.tone === "soft" &&
            "border-accent/35 bg-accent data-[checked=true]:border-primary/18 data-[checked=true]:bg-primary",
          local.tone === "outline" &&
            "border-border/70 bg-background data-[checked=true]:border-primary/35 data-[checked=true]:bg-accent",
          local.tone === "solid" && "border-primary/10 bg-primary text-primary-foreground",
          local.invalid && "border-destructive/52 ring-2 ring-destructive/14",
        )}
        data-checked={checked() ? "true" : "false"}
        disabled={others.disabled}
        {...others}
      >
        <span
          class={cn(
            "ml-1 inline-flex items-center justify-center rounded-full bg-background text-foreground shadow-soft transition-transform",
            thumbSizes[local.size],
          )}
          data-checked={checked() ? "true" : "false"}
        >
          <Show when={checked()} fallback={<X class="size-3 text-muted-foreground" />}>
            <Check class="size-3" />
          </Show>
        </span>
      </button>

      <div class="min-w-0">
        <Show when={local.label}>
          <label for={baseId} class="block text-sm font-semibold tracking-[-0.01em] text-foreground">
            {local.label}
          </label>
        </Show>
        <Show when={local.description}>
          <div id={descriptionId} class="mt-1 text-sm leading-6 text-muted-foreground">
            {local.description}
          </div>
        </Show>
        <Show when={local.invalid && local.errorMessage}>
          <div id={errorId} class="mt-1 text-sm font-medium leading-6 text-destructive">
            {local.errorMessage}
          </div>
        </Show>
      </div>
    </div>
  );
}
