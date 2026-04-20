import { Check, ChevronDown, CircleX, LoaderCircle } from "lucide-solid";
import { For, Show, createMemo, createSignal, createUniqueId, mergeProps, onCleanup, splitProps } from "solid-js";
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
  pill: "rounded-full",
} as const;

const controlSizeClasses = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
} as const;

export type ComboboxOption = {
  description?: string;
  disabled?: boolean;
  label: string;
  value: string;
};

export type ComboboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onInput"> & {
  class?: string;
  defaultInputValue?: string;
  defaultSelectedValue?: string;
  description?: JSX.Element;
  emptyMessage?: JSX.Element;
  errorMessage?: JSX.Element;
  inputValue?: string;
  invalid?: boolean;
  label?: JSX.Element;
  loading?: boolean;
  onInputValueChange?: (value: string) => void;
  onSelectedValueChange?: (value: string | undefined) => void;
  options?: ComboboxOption[];
  radius?: FieldRadius;
  size?: FieldSize;
  selectedValue?: string;
};

const defaultOptions: ComboboxOption[] = [
  { value: "syd", label: "Stylyf Design System", description: "Shared primitives and tokens" },
  { value: "ops", label: "Operations Hub", description: "Queues, inboxes, and escalations" },
  { value: "docs", label: "Docs Workspace", description: "Knowledge base authoring" },
  { value: "growth", label: "Growth Campaigns", description: "Experiments and landing pages" },
];

export function Combobox(userProps: ComboboxProps) {
  const props = mergeProps(
    {
      autoComplete: "off",
      defaultInputValue: "",
      defaultSelectedValue: undefined,
      emptyMessage: "No matching options.",
      invalid: false,
      loading: false,
      options: defaultOptions,
      radius: "lg" as const,
      size: "md" as const,
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "class",
    "defaultInputValue",
    "defaultSelectedValue",
    "description",
    "emptyMessage",
    "errorMessage",
    "id",
    "inputValue",
    "invalid",
    "label",
    "loading",
    "onFocus",
    "onInputValueChange",
    "onSelectedValueChange",
    "options",
    "radius",
    "required",
    "size",
    "selectedValue",
  ]);

  const [internalInputValue, setInternalInputValue] = createSignal(local.defaultInputValue);
  const [internalSelectedValue, setInternalSelectedValue] = createSignal<string | undefined>(local.defaultSelectedValue);
  const [open, setOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(0);
  const baseId = local.id ?? createUniqueId();
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;
  const describedBy = [local.description ? descriptionId : undefined, local.invalid && local.errorMessage ? errorId : undefined]
    .filter(Boolean)
    .join(" ") || undefined;
  const inputValue = createMemo(() => local.inputValue ?? internalInputValue());
  const selectedValue = createMemo(() => local.selectedValue ?? internalSelectedValue());
  const listboxId = `${baseId}-listbox`;
  let rootRef: HTMLDivElement | undefined;

  const filteredOptions = createMemo(() => {
    const query = inputValue().trim().toLowerCase();

    if (!query) {
      return local.options;
    }

    return local.options.filter(option => [option.label, option.description ?? ""].join(" ").toLowerCase().includes(query));
  });

  const commitInput = (next: string) => {
    if (local.inputValue === undefined) {
      setInternalInputValue(next);
    }

    local.onInputValueChange?.(next);
  };

  const commitSelection = (value: string | undefined) => {
    if (local.selectedValue === undefined) {
      setInternalSelectedValue(value);
    }

    local.onSelectedValueChange?.(value);
  };

  const choose = (value: string) => {
    const option = local.options.find(entry => entry.value === value);
    if (!option) return;
    commitSelection(value);
    commitInput(option.label);
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
        <div
          class={cn(
            "group relative flex w-full items-center border bg-background text-foreground shadow-inset transition-[border-color,box-shadow,background-color,color]",
            "hover:border-primary/18 focus-within:border-primary/48 focus-within:bg-card focus-within:ring-2 focus-within:ring-ring/24",
            local.invalid && "border-destructive/52 ring-2 ring-destructive/14",
            others.disabled && "cursor-not-allowed bg-muted/70 opacity-70",
            others.readOnly && "bg-muted/40",
            frameSizeClasses[local.size],
            frameRadiusClasses[local.radius],
            "pr-2",
          )}
        >
          <input
            id={baseId}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={open() ? listboxId : undefined}
            aria-expanded={open()}
            aria-describedby={describedBy}
            aria-activedescendant={open() ? `${listboxId}-option-${highlightedIndex()}` : undefined}
            aria-invalid={local.invalid ? true : undefined}
            class={cn(
              "w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/90 disabled:cursor-not-allowed",
              controlSizeClasses[local.size],
            )}
            value={inputValue()}
            onFocus={event => {
              const onFocus = local.onFocus as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined;
              onFocus?.(event);
              setOpen(true);
            }}
            onInput={event => {
              commitInput(event.currentTarget.value);
              setOpen(true);
              setHighlightedIndex(0);
            }}
            onKeyDown={event => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setOpen(true);
                setHighlightedIndex(index => Math.min(index + 1, Math.max(filteredOptions().length - 1, 0)));
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setOpen(true);
                setHighlightedIndex(index => Math.max(index - 1, 0));
              }

              if (event.key === "Enter" && open() && filteredOptions()[highlightedIndex()]) {
                event.preventDefault();
                choose(filteredOptions()[highlightedIndex()]!.value);
              }

              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            {...others}
          />

          <Show when={inputValue().length > 0}>
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
              onClick={() => {
                commitInput("");
                commitSelection(undefined);
                setOpen(false);
              }}
              aria-label="Clear combobox"
            >
              <CircleX class="size-4" />
            </button>
          </Show>

          <Show when={local.loading} fallback={<ChevronDown class="mr-1 size-4 shrink-0 text-muted-foreground" />}>
            <LoaderCircle class="mr-1 size-4 shrink-0 animate-spin text-muted-foreground" />
          </Show>
        </div>

        <Show when={open()}>
          <div class="ui-popover absolute inset-x-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden">
            <div role="listbox" id={listboxId} class="max-h-72 overflow-auto p-2">
              <Show
                when={filteredOptions().length}
                fallback={<div class="rounded-lg px-3 py-3 text-sm text-muted-foreground">{local.emptyMessage}</div>}
              >
                <For each={filteredOptions()}>
                  {(option, index) => (
                    <button
                      id={`${listboxId}-option-${index()}`}
                      type="button"
                      role="option"
                      aria-selected={selectedValue() === option.value}
                      disabled={option.disabled}
                      class={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg px-3 py-3 text-left transition",
                        highlightedIndex() === index()
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                      onMouseEnter={() => setHighlightedIndex(index())}
                      onMouseDown={event => event.preventDefault()}
                      onClick={() => choose(option.value)}
                    >
                      <span class="min-w-0">
                        <span class="block text-sm font-semibold text-current">{option.label}</span>
                        <Show when={option.description}>
                          <span class="mt-1 block text-sm leading-6 text-muted-foreground">{option.description}</span>
                        </Show>
                      </span>
                      <Check class={cn("size-4 shrink-0 text-primary", selectedValue() === option.value ? "opacity-100" : "opacity-0")} />
                    </button>
                  )}
                </For>
              </Show>
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
