import { Italic, List, Rows3 } from "lucide-solid";
import {
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import type { JSX } from "solid-js";
import { cn } from "~/lib/cn";
import {
  type ActionDensity,
  type ActionIntent,
  type ActionRadius,
  type ActionSize,
  type ActionTone,
  buttonFrameVariants,
  buttonToneClasses,
} from "~/components/registry/tier-1/actions-navigation/button";

type ToggleGroupMode = "single" | "multiple";
type ToggleGroupLayout = "segmented" | "card";
type ToggleGroupOrientation = "horizontal" | "vertical";

type RegisteredItem = {
  disabled: boolean;
  ref: HTMLButtonElement;
  value: string;
};

type ToggleGroupContextValue = {
  destructive: () => boolean | undefined;
  density: () => ActionDensity | undefined;
  disabled: () => boolean | undefined;
  firstFocusableValue: () => string | undefined;
  focusSibling: (currentValue: string, next: 1 | -1 | "start" | "end") => void;
  focusedValue: () => string | undefined;
  fullWidth: () => boolean | undefined;
  intent: () => ActionIntent | undefined;
  isPressed: (value: string) => boolean;
  layout: () => ToggleGroupLayout;
  mode: () => ToggleGroupMode;
  orientation: () => ToggleGroupOrientation;
  radius: () => ActionRadius | undefined;
  registerItem: (item: RegisteredItem) => void;
  setFocusedValue: (value?: string) => void;
  size: () => ActionSize | undefined;
  tone: () => ActionTone | undefined;
  toggleValue: (value: string) => void;
  unregisterItem: (value: string) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue>();

function normalizeValues(mode: ToggleGroupMode, value: string | string[] | undefined) {
  if (mode === "multiple") {
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value.length ? [value[0]] : [];
  }

  return value ? [value] : [];
}

function defaultToggleGroupChildren() {
  return (
    <>
      <ToggleGroupItem value="grid">
        <Rows3 />
        <span>Grid</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="list">
        <List />
        <span>List</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="notes">
        <Italic />
        <span>Notes</span>
      </ToggleGroupItem>
    </>
  );
}

export type ToggleGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "value"> & {
  allowEmptySelection?: boolean;
  children?: JSX.Element;
  class?: string;
  defaultValue?: string | string[];
  density?: ActionDensity;
  destructive?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  intent?: ActionIntent;
  label?: string;
  layout?: ToggleGroupLayout;
  mode?: ToggleGroupMode;
  onValueChange?: (value: string | string[] | undefined) => void;
  orientation?: ToggleGroupOrientation;
  radius?: ActionRadius;
  size?: ActionSize;
  tone?: ActionTone;
  value?: string | string[];
};

function ToggleGroupRoot(userProps: ToggleGroupProps) {
  const props = mergeProps(
    {
      allowEmptySelection: false,
      layout: "segmented" as const,
      label: "Toggle group",
      mode: "single" as const,
      orientation: "horizontal" as const,
      size: "md" as const,
      density: "comfortable" as const,
      radius: "pill" as const,
      intent: "neutral" as const,
      tone: "soft" as const,
      fullWidth: false,
      defaultValue: "grid",
    },
    userProps,
  );

  const [local, others] = splitProps(props, [
    "allowEmptySelection",
    "children",
    "class",
    "defaultValue",
    "density",
    "destructive",
    "disabled",
    "fullWidth",
    "intent",
    "label",
    "layout",
    "mode",
    "onValueChange",
    "orientation",
    "radius",
    "size",
    "tone",
    "value",
  ]);

  const [internalValue, setInternalValue] = createSignal<string | string[] | undefined>(local.defaultValue);
  const [focusedValue, setFocusedValue] = createSignal<string | undefined>();
  const [items, setItems] = createSignal<RegisteredItem[]>([]);

  const selectedValues = createMemo(() => normalizeValues(local.mode, local.value ?? internalValue()));
  const enabledItems = createMemo(() => items().filter(item => !item.disabled));
  const firstFocusableValue = createMemo(() => enabledItems()[0]?.value);

  const currentTabStop = createMemo(() => focusedValue() ?? selectedValues()[0] ?? firstFocusableValue());

  const commit = (next: string[]) => {
    const nextValue = local.mode === "multiple" ? next : next[0];

    if (local.value === undefined) {
      setInternalValue(local.mode === "multiple" ? next : nextValue);
    }

    local.onValueChange?.(local.mode === "multiple" ? next : nextValue);
  };

  const toggleValue = (value: string) => {
    const current = selectedValues();

    if (local.mode === "multiple") {
      commit(current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
      return;
    }

    if (current[0] === value) {
      commit(local.allowEmptySelection ? [] : current);
      return;
    }

    commit([value]);
  };

  const registerItem = (item: RegisteredItem) => {
    setItems(items => {
      const next = items.filter(entry => entry.value !== item.value);
      next.push(item);
      return next;
    });
  };

  const unregisterItem = (value: string) => {
    setItems(items => items.filter(item => item.value !== value));
  };

  const focusSibling = (currentValue: string, next: 1 | -1 | "start" | "end") => {
    const focusable = enabledItems();

    if (!focusable.length) {
      return;
    }

    const index = focusable.findIndex(item => item.value === currentValue);

    if (next === "start") {
      focusable[0]?.ref.focus();
      return;
    }

    if (next === "end") {
      focusable.at(-1)?.ref.focus();
      return;
    }

    const currentIndex = index === -1 ? 0 : index;
    const targetIndex = (currentIndex + next + focusable.length) % focusable.length;
    focusable[targetIndex]?.ref.focus();
  };

  createEffect(() => {
    if (!items().some(item => item.value === currentTabStop())) {
      setFocusedValue(firstFocusableValue());
    }
  });

  const context: ToggleGroupContextValue = {
    destructive: () => local.destructive,
    density: () => local.density,
    disabled: () => local.disabled,
    firstFocusableValue,
    focusSibling,
    focusedValue: currentTabStop,
    fullWidth: () => local.fullWidth,
    intent: () => local.intent,
    isPressed: value => selectedValues().includes(value),
    layout: () => local.layout,
    mode: () => local.mode,
    orientation: () => local.orientation,
    radius: () => local.radius,
    registerItem,
    setFocusedValue,
    size: () => local.size,
    tone: () => local.tone,
    toggleValue,
    unregisterItem,
  };

  return (
    <ToggleGroupContext.Provider value={context}>
      <div
        role="toolbar"
        aria-label={local.label}
        aria-orientation={local.orientation}
        class={cn(
          "inline-flex gap-2",
          local.layout === "segmented"
            ? cn(
                "rounded-xl border border-border/70 bg-card p-1.5 shadow-inset",
                local.orientation === "vertical" && "flex-col",
                local.fullWidth && "w-full",
              )
            : cn("flex-wrap", local.orientation === "vertical" && "flex-col", local.fullWidth && "w-full"),
          local.class,
        )}
        {...others}
      >
        {local.children ?? defaultToggleGroupChildren()}
      </div>
    </ToggleGroupContext.Provider>
  );
}

export type ToggleGroupItemProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "value"> & {
  children?: JSX.Element;
  class?: string;
  value: string;
};

export function ToggleGroupItem(userProps: ToggleGroupItemProps) {
  const context = useContext(ToggleGroupContext);

  if (!context) {
    throw new Error("ToggleGroup.Item must be used within ToggleGroup.");
  }

  const props = mergeProps({ type: "button" as const }, userProps);
  const [local, others] = splitProps(props, ["children", "class", "value", "disabled", "onClick", "onKeyDown", "onFocus", "type"]);
  let ref: HTMLButtonElement | undefined;

  const unavailable = () => Boolean(context.disabled() || local.disabled);
  const pressed = () => context.isPressed(local.value);

  createEffect(() => {
    if (ref) {
      context.registerItem({
        disabled: unavailable(),
        ref,
        value: local.value,
      });
    }
  });

  onCleanup(() => context.unregisterItem(local.value));

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = event => {
    const onKeyDown = local.onKeyDown as JSX.EventHandler<HTMLButtonElement, KeyboardEvent> | undefined;
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const horizontal = context.orientation() === "horizontal";

    if ((horizontal && event.key === "ArrowRight") || (!horizontal && event.key === "ArrowDown")) {
      event.preventDefault();
      context.focusSibling(local.value, 1);
      return;
    }

    if ((horizontal && event.key === "ArrowLeft") || (!horizontal && event.key === "ArrowUp")) {
      event.preventDefault();
      context.focusSibling(local.value, -1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      context.focusSibling(local.value, "start");
    }

    if (event.key === "End") {
      event.preventDefault();
      context.focusSibling(local.value, "end");
    }
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    const onClick = local.onClick as JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined;
    onClick?.(event);

    if (event.defaultPrevented || unavailable()) {
      return;
    }

    context.toggleValue(local.value);
  };

  return (
    <button
      ref={ref}
      type={local.type ?? "button"}
      class={cn(
        buttonFrameVariants({
          size: context.size(),
          density: context.density(),
          radius: context.layout() === "segmented" ? "pill" : context.radius(),
          fullWidth: context.fullWidth(),
        }),
        buttonToneClasses({
          intent: context.intent(),
          tone: context.layout() === "segmented" ? "ghost" : context.tone(),
          destructive: context.destructive(),
          pressedTone: true,
        }),
        context.layout() === "segmented" &&
          "border-transparent shadow-none hover:bg-accent data-[pressed=true]:border-primary/20 data-[pressed=true]:bg-background",
        local.class,
      )}
      disabled={unavailable()}
      aria-pressed={pressed()}
      data-current="false"
      data-loading="false"
      data-pending="false"
      data-pressed={pressed() ? "true" : "false"}
      tabIndex={context.focusedValue() === local.value ? 0 : -1}
      onClick={handleClick}
      onFocus={event => {
        context.setFocusedValue(local.value);
        const onFocus = local.onFocus as JSX.EventHandler<HTMLButtonElement, FocusEvent> | undefined;
        onFocus?.(event);
      }}
      onKeyDown={handleKeyDown}
      {...others}
    >
      {local.children ?? local.value}
    </button>
  );
}

export const ToggleGroup = Object.assign(ToggleGroupRoot, {
  Item: ToggleGroupItem,
});
