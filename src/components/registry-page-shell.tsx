import type { JSX } from "solid-js";
import { RegistryComponentShell } from "~/components/registry-component-shell";
import type { RegistryItem } from "~/lib/registry";

type RegistryPageShellProps = {
  item: RegistryItem;
  children?: JSX.Element;
};

export function RegistryPageShell(props: RegistryPageShellProps) {
  return (
    <main class="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section class="rounded-[2rem] border border-border/70 bg-panel/92 px-6 py-8 shadow-soft backdrop-blur-sm lg:px-8">
        <div class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">{props.item.tierLabel}</div>
        <div class="mt-4 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="max-w-3xl">
            <h1 class="text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">{props.item.name}</h1>
            <p class="mt-4 text-base leading-7 text-muted">{props.item.description}</p>
          </div>
          <div class="rounded-full border border-border/70 bg-background px-4 py-2 text-sm text-muted">
            {props.item.clusterLabel}
          </div>
        </div>
      </section>

      <RegistryComponentShell item={props.item}>{props.children}</RegistryComponentShell>
    </main>
  );
}
