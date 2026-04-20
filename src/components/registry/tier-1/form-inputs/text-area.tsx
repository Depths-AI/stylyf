import { Show, createEffect, createMemo, createSignal, createUniqueId, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

type FieldRadius = "md" | "lg" | "pill";
type FieldSize = "sm" | "md" | "lg";

const frameSizeClasses = {
  sm: "min-h-10 gap-2.5 px-3",
  md: "min-h-11 gap-3 px-3.5",
  lg: "min-h-13 gap-3.5 px-4.5",
} as const;

const frameRadiusClasses = {
  md: "rounded-lg",
  lg: "rounded-xl",
  pill: "rounded-[1.75rem]",
} as const;

const controlSizeClasses = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

export type TextAreaProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue"> & {
  autoResize?: boolean;
  class?: string;
  defaultValue?: string;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  invalid?: boolean;
  label?: JSX.Element;
  maxRows?: number;
  minRows?: number;
  onValueChange?: (value: string) => void;
  radius?: FieldRadius;
  resizeHandle?: "none" | "vertical" | "both";
  size?: FieldSize;
  value?: string;
};

export function TextArea(userProps: TextAreaProps) {
  const props = mergeProps(
    {
      autoResize: false,
      defaultValue: "",
      invalid: false,
      maxRows: 8,
      minRows: 4,
      radius: "lg" as const,
      resizeHandle: "vertical" as const,
      size: "md" as const,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "autoResize",
    "class",
    "defaultValue",
    "description",
    "errorMessage",
    "id",
    "invalid",
    "label",
    "maxRows",
    "minRows",
    "onInput",
    "onValueChange",
    "radius",
    "required",
    "resizeHandle",
    "size",
    "value",
  ]);

  const [internalValue, setInternalValue] = createSignal(local.defaultValue);
  const currentValue = createMemo(() => local.value ?? internalValue());
  const baseId = local.id ?? createUniqueId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const describedBy = [local.description ? descriptionId : undefined, local.invalid && local.errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  let ref: HTMLTextAreaElement | undefined;

  const commit = (next: string) => {
    if (local.value === undefined) {
      setInternalValue(next);
    }

    local.onValueChange?.(next);
  };

  createEffect(() => {
    if (!local.autoResize || !ref || typeof window === "undefined") {
      return;
    }

    ref.style.height = "0px";
    const lineHeight = Number.parseFloat(window.getComputedStyle(ref).lineHeight || "24");
    const minHeight = lineHeight * local.minRows;
    const maxHeight = lineHeight * local.maxRows;
    ref.style.height = `${Math.min(Math.max(ref.scrollHeight, minHeight), maxHeight)}px`;
  });

  return (
    <div class={cn("space-y-2.5", local.class)}>
      <Show when={local.label}>
        <div class="flex items-center gap-2">
          <label for={baseId} class="text-sm font-semibold tracking-[-0.01em] text-foreground">
            {local.label}
          </label>
          <Show when={local.required}>
            <span class="text-xs font-medium uppercase tracking-[0.2em] text-primary">Required</span>
          </Show>
        </div>
      </Show>
      <div
        class={cn(
          "group relative flex w-full items-start border bg-background text-foreground shadow-inset transition-[border-color,box-shadow,background-color,color]",
          "hover:border-primary/18 focus-within:border-primary/48 focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/24",
          local.invalid && "border-destructive/52 ring-2 ring-destructive/14",
          others.disabled && "cursor-not-allowed bg-muted/70 opacity-70",
          others.readOnly && "bg-muted/40",
          frameSizeClasses[local.size],
          frameRadiusClasses[local.radius],
          "py-3",
        )}
      >
        <textarea
          ref={ref}
          id={baseId}
          class={cn(
            "w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/90 disabled:cursor-not-allowed",
            controlSizeClasses[local.size],
            "min-h-[6rem] resize-y leading-6",
            local.resizeHandle === "none" && "resize-none",
            local.resizeHandle === "both" && "resize",
          )}
          aria-describedby={describedBy}
          aria-invalid={local.invalid ? true : undefined}
          rows={local.minRows}
          value={currentValue()}
          onInput={event => {
            const onInput = local.onInput as JSX.EventHandler<HTMLTextAreaElement, InputEvent> | undefined;
            onInput?.(event);

            if (event.defaultPrevented) {
              return;
            }

            commit(event.currentTarget.value);
          }}
          {...others}
        />
      </div>
      <Show when={local.description}>
        <div id={descriptionId} class="text-sm leading-6 text-muted-foreground">
          {local.description}
        </div>
      </Show>
      <Show when={local.invalid && local.errorMessage}>
        <div id={errorId} class="text-sm font-medium leading-6 text-destructive">
          {local.errorMessage}
        </div>
      </Show>
    </div>
  );
}
