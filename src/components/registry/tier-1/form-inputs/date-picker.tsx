import { CalendarDays } from "lucide-solid";
import { Show, createMemo, createSignal, createUniqueId, mergeProps, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";
import { Calendar } from "~/components/registry/tier-1/form-inputs/calendar";
import { formatDate, type CalendarValue } from "~/components/registry/tier-1/form-inputs/calendar-utils";

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
  pill: "rounded-full",
} as const;

const controlSizeClasses = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

type DatePickerMode = "single" | "range";

export type DatePickerProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "size"> & {
  class?: string;
  defaultOpen?: boolean;
  defaultValue?: CalendarValue;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  invalid?: boolean;
  label?: JSX.Element;
  mode?: DatePickerMode;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: CalendarValue) => void;
  radius?: FieldRadius;
  size?: FieldSize;
  value?: CalendarValue;
};

function formatDisplay(value: CalendarValue) {
  if (Array.isArray(value)) {
    return `${formatDate(value[0]) || "Start"} - ${formatDate(value[1]) || "End"}`;
  }

  return formatDate(value as Date | undefined);
}

export function DatePicker(userProps: DatePickerProps) {
  const props = mergeProps(
    {
      defaultOpen: false,
      defaultValue: undefined,
      invalid: false,
      mode: "single" as const,
      radius: "lg" as const,
      size: "md" as const,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "class",
    "defaultOpen",
    "defaultValue",
    "description",
    "errorMessage",
    "id",
    "invalid",
    "label",
    "mode",
    "onOpenChange",
    "onValueChange",
    "radius",
    "required",
    "size",
    "value",
  ]);

  const [internalValue, setInternalValue] = createSignal<CalendarValue>(local.defaultValue);
  const [open, setOpen] = createSignal(local.defaultOpen);
  const currentValue = createMemo(() => local.value ?? internalValue());
  const baseId = local.id ?? createUniqueId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const describedBy = [local.description ? descriptionId : undefined, local.invalid && local.errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;

  const setOpenState = (next: boolean) => {
    setOpen(next);
    local.onOpenChange?.(next);
  };

  const commit = (next: CalendarValue) => {
    if (local.value === undefined) {
      setInternalValue(next);
    }

    local.onValueChange?.(next);

    if (local.mode === "single" || (Array.isArray(next) && next[0] && next[1])) {
      setOpenState(false);
    }
  };

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
      <div class="relative">
        <div
          class={cn(
            "group relative flex w-full items-center border bg-background text-foreground shadow-inset transition-[border-color,box-shadow,background-color,color]",
            "hover:border-primary/18 focus-within:border-primary/48 focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/24",
            local.invalid && "border-destructive/52 ring-2 ring-destructive/14",
            others.disabled && "cursor-not-allowed bg-muted/70 opacity-70",
            frameSizeClasses[local.size],
            frameRadiusClasses[local.radius],
            "pr-2",
          )}
        >
          <input
            id={baseId}
            readOnly
            value={formatDisplay(currentValue())}
            placeholder={local.mode === "range" ? "Choose a date range" : "Choose a date"}
            class={cn(
              "w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/90 disabled:cursor-not-allowed",
              controlSizeClasses[local.size],
            )}
            aria-describedby={describedBy}
            aria-invalid={local.invalid ? true : undefined}
            {...others}
          />
          <button
            type="button"
            class="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
            aria-label="Toggle date picker"
            onClick={() => setOpenState(!open())}
          >
            <CalendarDays class="size-4" />
          </button>
        </div>

        <Show when={open()}>
          <div class="absolute left-0 top-[calc(100%+0.65rem)] z-20 w-full min-w-[20rem] max-w-[26rem]">
            <Calendar
              label={local.mode === "range" ? "Date range" : "Date"}
              mode={local.mode}
              value={currentValue()}
              onValueChange={commit}
              class={cn("ui-popover p-4")}
            />
          </div>
        </Show>
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
