import { Link, Meta, Title } from "@solidjs/meta";
import { SidebarAppShell } from "~/components/shells/app/sidebar-app";
import { GeneratedNavigation } from "~/components/generated-navigation";
import { SettingsPageShell } from "~/components/shells/page/settings";
import { Stack } from "~/components/layout/stack";
import { SettingsPanel } from "~/components/registry/form-systems/settings-panel";
import { SettingsRow } from "~/components/registry/form-systems/settings-row";

export default function SettingsRoute() {
  return (
    <>
      <Title>Settings</Title>
      <Meta name="description" content="Settings private app surface for Stylyf Builder." />
      <Meta name="robots" content="noindex" />
      <Meta property="og:title" content="Settings" />
      <Meta property="og:description" content="Settings private app surface for Stylyf Builder." />
      <SidebarAppShell title="Stylyf Builder" navigation={<GeneratedNavigation shell="sidebar-app" />}>
        <SettingsPageShell title="Settings">
        <Stack>
          <SettingsPanel />
          <SettingsRow />
        </Stack>
        </SettingsPageShell>
      </SidebarAppShell>
    </>
  );
}
