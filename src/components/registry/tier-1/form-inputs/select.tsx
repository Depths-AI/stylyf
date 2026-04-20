import { Check, ChevronDown } from "lucide-solid";
import { For, Show, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, splitProps } from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";

type FieldRadius = "md" | "lg" | "pill";
type FieldSize = "sm" | "md" | "lg";

export type SelectOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type SelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "size" | "onChange"> & {
  class?: string;
  defaultValue?: string;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  invalid?: boolean;
  label?: JSX.Element;
  onValueChange?: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  radius?: FieldRadius;
  size?: FieldSize;
  value?: string;
};

const defaultOptions: SelectOption[] = [
  { value: "design", label: "Design system" },
  { value: "admin", label: "Admin workspace" },
  { value: "marketing", label: "Marketing site" },
  { value: "docs", label: "Documentation hub" },
];

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

export function Select(userProps: SelectProps) {
  const props = mergeProps(
    {
      defaultValue: "",
      invalid: false,
      options: defaultOptions,
      placeholder: "Choose a surface",
      radius: "lg" as const,
      size: "md" as const,
      value: undefined,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "class",
    "defaultValue",
    "description",
    "errorMessage",
    "id",
    "invalid",
    "label",
    "onValueChange",
    "options",
    "placeholder",
    "radius",
    "required",
    "size",
    "value",
  ]);

  const baseId = local.id ?? createUniqueId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const listboxId = `${baseId}-listbox`;
  const describedBy = [local.description ? descriptionId : undefined, local.invalid && local.errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  const [internalValue, setInternalValue] = createSignal(local.defaultValue);
  const [open, setOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(0);
  const currentValue = createMemo(() => local.value ?? internalValue());
  const selectedOption = createMemo(() => local.options.find(option => option.value === currentValue()));
  let rootRef: HTMLDivElement | undefined;

  const commit = (next: string) => {
    if (local.value === undefined) {
      setInternalValue(next);
    }

    local.onValueChange?.(next);
    setOpen(false);
  };

  if (typeof document !== "undefined") {
    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef && !rootRef.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    onCleanup(() => document.removeEventListener("pointerdown", handlePointerDown));
  }

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

      <div class="relative" ref={rootRef}>
        <input type="hidden" name={others.name} value={currentValue()} />
        <button
          id={baseId}
          type="button"
          aria-haspopup="listbox"
          aria-controls={open() ? listboxId : undefined}
          aria-expanded={open()}
          aria-describedby={describedBy}
          aria-invalid={local.invalid ? true : undefined}
          class={cn(
            "group relative flex w-full items-center border bg-background text-foreground shadow-inset transition-[border-color,box-shadow,background-color,color]",
            "hover:border-primary/18 focus-visible:border-primary/48 focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/24",
            local.invalid && "border-destructive/52 ring-2 ring-destructive/14",
            others.disabled && "cursor-not-allowed bg-muted/70 opacity-70",
            frameSizeClasses[local.size],
            frameRadiusClasses[local.radius],
          )}
          disabled={others.disabled}
          onClick={() => {
            setOpen(current => !current);
            setHighlightedIndex(Math.max(local.options.findIndex(option => option.value === currentValue()), 0));
          }}
          onKeyDown={event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setHighlightedIndex(index => {
                const delta = event.key === "ArrowDown" ? 1 : -1;
                return Math.min(Math.max(index + delta, 0), local.options.length - 1);
              });
            }

            if ((event.key === "Enter" || event.key === " ") && open()) {
              event.preventDefault();
              const option = local.options[highlightedIndex()];
              if (option && !option.disabled) {
                commit(option.value);
              }
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        >
          <span
            class={cn(
              "min-w-0 flex-1 truncate text-left",
              controlSizeClasses[local.size],
              !selectedOption() && "text-muted-foreground",
            )}
          >
            {selectedOption()?.label ?? local.placeholder}
          </span>
          <ChevronDown class={cn("size-4 shrink-0 text-muted-foreground transition", open() && "rotate-180")} />
        </button>

        <Show when={open()}>
          <div class="ui-popover absolute inset-x-0 top-[calc(100%+0.65rem)] z-20 overflow-hidden">
            <div id={listboxId} role="listbox" class="max-h-72 overflow-auto p-2">
              <For each={local.options}>
                {(option, index) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={currentValue() === option.value}
                    disabled={option.disabled}
                    class={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition",
                      highlightedIndex() === index()
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      option.disabled && "cursor-not-allowed opacity-50",
                    )}
                    onMouseEnter={() => setHighlightedIndex(index())}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => {
                      if (!option.disabled) {
                        commit(option.value);
                      }
                    }}
                  >
                    <span class="text-sm font-semibold text-current">{option.label}</span>
                    <Check class={cn("size-4 shrink-0 text-primary", currentValue() === option.value ? "opacity-100" : "opacity-0")} />
                  </button>
                )}
              </For>
            </div>
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
