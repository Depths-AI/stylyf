import { Check, CirclePlay, Palette, Sparkles } from "lucide-solid";
import { For, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { cn } from "~/lib/cn";
import {
  applyThemeState,
  defaultThemeState,
  readThemeStateFromDocument,
  subscribeThemeState,
  syncThemeFromStorage,
  themePresets,
  type ThemeDensity,
  type ThemeMode,
  type ThemeRadius,
  type ThemeSpacing,
  type ThemeState,
} from "~/lib/theme-system";

const modes: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const densities: { label: string; value: ThemeDensity }[] = [
  { label: "Comfortable", value: "comfortable" },
  { label: "Compact", value: "compact" },
];

const radii: { label: string; value: ThemeRadius }[] = [
  { label: "Balanced", value: "balanced" },
  { label: "Soft", value: "soft" },
  { label: "Round", value: "round" },
];

const spacings: { label: string; value: ThemeSpacing }[] = [
  { label: "Tight", value: "tight" },
  { label: "Balanced", value: "balanced" },
  { label: "Airy", value: "airy" },
];

function SegmentedControl<T extends string>(props: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div class="space-y-3">
      <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{props.label}</div>
      <div class="ui-pillbar inline-flex flex-wrap p-1">
        <For each={props.options}>
          {option => (
            <button
              type="button"
              onClick={() => props.onChange(option.value)}
              data-theme-segment={option.value}
              class={cn(
                "rounded-full px-3 py-2 text-sm font-medium transition",
                props.value === option.value
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}

export function ThemeStudio() {
  const [state, setState] = createSignal<ThemeState>(defaultThemeState);

  onMount(() => {
    setState(syncThemeFromStorage());

    const unsubscribe = subscribeThemeState(nextState => {
      setState(nextState);
    });

    onCleanup(unsubscribe);
  });

  const updateTheme = (next: Partial<ThemeState>) => {
    setState(applyThemeState({ ...readThemeStateFromDocument(), ...next }));
  };

  const activePreset = createMemo(() => themePresets.find(preset => preset.id === state().preset) ?? themePresets[0]);

  const semanticSwatches = [
    { label: "Background", token: "bg-background" },
    { label: "Card", token: "bg-card" },
    { label: "Popover", token: "bg-popover" },
    { label: "Primary", token: "bg-primary" },
    { label: "Secondary", token: "bg-secondary" },
    { label: "Accent", token: "bg-accent" },
    { label: "Destructive", token: "bg-destructive" },
    { label: "Ring", token: "bg-ring" },
  ];

  return (
    <section
      id="theme-studio"
      class="ui-shell relative overflow-hidden p-6 lg:p-7"
    >
      <div class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/12" />

      <div class="relative grid gap-6 xl:grid-cols-[minmax(340px,0.9fr)_minmax(0,1.1fr)]">
        <div class="space-y-6">
          <header>
            <div class="ui-pillbar inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <Palette class="size-3.5" />
              <span>Theme studio</span>
            </div>
            <h2 class="mt-4 text-3xl font-semibold tracking-tight text-foreground">Global tokens first, component variants second.</h2>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              The registry now uses a semantic token contract modeled after the current shadcn guidance: app surfaces,
              cards, popovers, primary/secondary actions, accent surfaces, destructive states, ring color, radius, and
              density are all controlled at the root. The preview below swaps whole presets like a lightweight internal
              theme editor.
            </p>
          </header>

          <SegmentedControl label="Mode" options={modes} value={state().mode} onChange={mode => updateTheme({ mode })} />

          <div class="space-y-3">
            <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Preset</div>
            <div class="grid gap-3">
              <For each={themePresets}>
                {preset => (
                  <button
                    type="button"
                    onClick={() => updateTheme({ preset: preset.id })}
                    data-theme-preset-option={preset.id}
                    class={cn(
                      "rounded-[var(--radius-xl)] border p-4 text-left transition",
                      state().preset === preset.id
                        ? "border-primary/45 bg-card shadow-soft"
                        : "border-border/80 bg-background hover:border-primary/30 hover:bg-card",
                    )}
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <span>{preset.label}</span>
                          {state().preset === preset.id ? <Check class="size-4 text-primary" /> : null}
                        </div>
                        <p class="mt-1 text-sm leading-6 text-muted-foreground">{preset.description}</p>
                      </div>
                      <div class="flex gap-2">
                        <For each={preset.swatches}>
                          {swatch => (
                            <span
                              class="size-6 rounded-full border border-border/70 shadow-xs"
                              style={{ background: swatch }}
                              aria-hidden="true"
                            />
                          )}
                        </For>
                      </div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="grid gap-5 xl:grid-cols-3">
            <SegmentedControl
              label="Density"
              options={densities}
              value={state().density}
              onChange={density => updateTheme({ density })}
            />
            <SegmentedControl
              label="Spacing"
              options={spacings}
              value={state().spacing}
              onChange={spacing => updateTheme({ spacing })}
            />
            <SegmentedControl
              label="Radius"
              options={radii}
              value={state().radius}
              onChange={radius => updateTheme({ radius })}
            />
          </div>
        </div>

        <div class="space-y-5">
          <div class="ui-shell-muted p-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Active preset</div>
                <div class="mt-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Sparkles class="size-4 text-primary" />
                  <span>{activePreset().label}</span>
                </div>
                <p class="mt-1 text-sm text-muted-foreground">{activePreset().description}</p>
              </div>

              <div class="ui-pillbar flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                <CirclePlay class="size-3.5 text-primary" />
                <span>{state().mode} / {state().density} / {state().spacing} / {state().radius}</span>
              </div>
            </div>

            <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <For each={semanticSwatches}>
                {swatch => (
                  <div class="ui-shell-muted p-3">
                    <div class={cn("h-12 rounded-[var(--radius-lg)] border border-border/70", swatch.token)} />
                    <div class="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{swatch.label}</div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <section class="ui-card p-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Application preview</div>
                  <h3 class="mt-2 text-xl font-semibold tracking-tight text-card-foreground">Registry command surface</h3>
                </div>
                <div class="ui-pillbar px-3 py-1.5 text-xs text-popover-foreground">
                  palette live
                </div>
              </div>

              <div class="mt-5 space-y-4">
                <div class="ui-popover p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div class="text-sm font-semibold text-popover-foreground">Create registry item</div>
                      <div class="mt-1 text-sm text-muted-foreground">Use semantic tokens and export source-owned code.</div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button class="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-soft">
                        Primary action
                      </button>
                      <button class="inline-flex h-10 items-center rounded-full border border-border bg-secondary px-4 text-sm font-medium text-secondary-foreground">
                        Secondary
                      </button>
                      <button class="inline-flex h-10 items-center rounded-full bg-destructive px-4 text-sm font-medium text-destructive-foreground">
                        Destructive
                      </button>
                    </div>
                  </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="ui-shell-muted p-4">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Status lane</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span class="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">Accent</span>
                      <span class="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">Secondary</span>
                      <span class="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Primary</span>
                    </div>
                  </div>

                  <div class="ui-code px-4 py-4 text-ink-foreground">
                    <div class="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-foreground/60">Code surface</div>
                    <pre class="mt-3 overflow-hidden text-[12px] leading-6">
                      <code>{`<button class="bg-primary text-primary-foreground" />`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            <section class="ui-shell-muted p-5">
              <div class="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Token notes</div>
              <ul class="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  <span class="font-medium text-foreground">Semantic pairs:</span> every emphasis lane keeps a matching
                  foreground token for readable contrast.
                </li>
                <li>
                  <span class="font-medium text-foreground">Root parameters:</span> preset, mode, density, and radius
                  all live on the document root via data attributes.
                </li>
                <li>
                  <span class="font-medium text-foreground">Preview scope:</span> this studio changes only app-layer
                  tokens and shell surfaces. Component logic stays pure.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
