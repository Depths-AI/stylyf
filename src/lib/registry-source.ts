import { starterSourceFor, targetPath, type RegistryItem } from "~/lib/registry";

const registryComponentSources = import.meta.glob("../components/registry/**/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const routeSources = import.meta.glob("../routes/**/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

function sourceKeyFor(item: RegistryItem) {
  return targetPath(item).replace(/^src\//, "../");
}

export function sourceFor(item: RegistryItem) {
  const key = sourceKeyFor(item);

  return routeSources[key] ?? registryComponentSources[key] ?? starterSourceFor(item);
}
