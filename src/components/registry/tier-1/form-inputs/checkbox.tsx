import { Check, Minus } from "lucide-solid";
import { Show, createEffect, createSignal, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";
import { createFieldAria, type FieldRadius, type FieldSize } from "~/components/registry/tier-1/form-inputs/field";

type CheckboxTone = "soft" | "outline" | "solid";

const indicatorSizes = {
  sm: "size-4.5",
  md: "size-5",
  lg: "size-5.5",
} as const;

const labelSizes = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

export type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> & {
  checked?: boolean;
  class?: string;
  defaultChecked?: boolean;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  indeterminate?: boolean;
  invalid?: boolean;
  label?: JSX.Element;
  onCheckedChange?: (checked: boolean) => void;
  radius?: FieldRadius;
  size?: FieldSize;
  tone?: CheckboxTone;
};

export function Checkbox(userProps: CheckboxProps) {
  const props = mergeProps(
    {
      defaultChecked: false,
      invalid: false,
      radius: "md" as const,
      size: "md" as const,
      tone: "soft" as const,
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
    "indeterminate",
    "invalid",
    "label",
    "onCheckedChange",
    "radius",
    "required",
    "size",
    "tone",
  ]);

  const [internalChecked, setInternalChecked] = createSignal(local.defaultChecked);
  const checked = () => local.checked ?? internalChecked();
  const aria = createFieldAria({
    description: local.description,
    errorMessage: local.errorMessage,
    id: local.id,
    invalid: local.invalid,
  });
  let ref: HTMLInputElement | undefined;

  createEffect(() => {
    if (ref) {
      ref.indeterminate = Boolean(local.indeterminate && !checked());
    }
  });

  const commit = (next: boolean) => {
    if (local.checked === undefined) {
      setInternalChecked(next);
    }

    local.onCheckedChange?.(next);
  };

  return (
    <label class={cn("flex items-start gap-3", others.disabled && "opacity-70", local.class)} for={aria.inputId}>
      <span class="relative mt-0.5">
        <input
          ref={ref}
          id={aria.inputId}
          type="checkbox"
          class="peer sr-only"
          checked={checked()}
          aria-describedby={aria.describedBy}
          aria-invalid={local.invalid ? true : undefined}
          onChange={event => commit(event.currentTarget.checked)}
          {...others}
        />
        <span
          class={cn(
            "inline-flex items-center justify-center border transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring/18",
            indicatorSizes[local.size],
            local.radius === "md" && "rounded-md",
            local.radius === "lg" && "rounded-lg",
            local.radius === "pill" && "rounded-full",
            local.tone === "soft" &&
              "border-accent/35 bg-accent text-accent-foreground peer-checked:border-primary/25 peer-checked:bg-primary peer-checked:text-primary-foreground",
            local.tone === "outline" &&
              "border-border bg-background text-primary peer-checked:border-primary/35 peer-checked:bg-accent peer-checked:text-accent-foreground",
            local.tone === "solid" && "border-primary/15 bg-primary text-primary-foreground",
            local.invalid && "border-destructive/45 ring-2 ring-destructive/12",
          )}
        >
          <Show when={local.indeterminate && !checked()} fallback={<Check class="size-3.5 opacity-0 transition peer-checked:opacity-100" />}>
            <Minus class="size-3.5" />
          </Show>
        </span>
      </span>

      <span class="min-w-0">
        <Show when={local.label}>
          <span class={cn("block font-semibold tracking-[-0.01em] text-foreground", labelSizes[local.size])}>
            {local.label}
          </span>
        </Show>
        <Show when={local.description}>
          <span id={aria.descriptionId} class="mt-1 block text-sm leading-6 text-muted-foreground">
            {local.description}
          </span>
        </Show>
        <Show when={local.invalid && local.errorMessage}>
          <span id={aria.errorId} class="mt-1 block text-sm font-medium leading-6 text-destructive">
            {local.errorMessage}
          </span>
        </Show>
      </span>
    </label>
  );
}
