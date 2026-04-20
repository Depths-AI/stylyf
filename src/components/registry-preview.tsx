import type { Component } from "solid-js";
import { PreviewShell } from "~/components/preview-shell";
import {
  BreadcrumbPreview,
  ButtonPreview,
  IconButtonPreview,
  LinkButtonPreview,
  PaginationPreview,
  ToggleGroupPreview,
  TogglePreview,
} from "~/components/registry/tier-1/actions-navigation/demos";
import type { RegistryItem } from "~/lib/registry";

const implementedPreviewBySlug: Record<string, Component<{ item: RegistryItem }>> = {
  button: ButtonPreview,
  "icon-button": IconButtonPreview,
  "link-button": LinkButtonPreview,
  toggle: TogglePreview,
  "toggle-group": ToggleGroupPreview,
  breadcrumb: BreadcrumbPreview,
  pagination: PaginationPreview,
};

export function RegistryPreview(props: { item: RegistryItem }) {
  const Preview = implementedPreviewBySlug[props.item.slug];

  if (Preview) {
    return <Preview item={props.item} />;
  }

  return <PreviewShell item={props.item} />;
}
