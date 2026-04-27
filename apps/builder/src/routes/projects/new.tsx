import { Link, Meta, Title } from "@solidjs/meta";
import { SidebarAppShell } from "~/components/shells/app/sidebar-app";
import { GeneratedNavigation } from "~/components/generated-navigation";
import { ResourceCreatePageShell } from "~/components/shells/page/resource-create";
import { ProjectsForm } from "~/components/resource-forms/projects-form";
export default function ProjectsNewRoute() {
  return (
    <>
      <Title>New project</Title>
      <Meta name="description" content="New project private app surface for Stylyf Builder." />
      <Meta name="robots" content="noindex" />
      <Meta property="og:title" content="New project" />
      <Meta property="og:description" content="New project private app surface for Stylyf Builder." />
      <SidebarAppShell title="Stylyf Builder" navigation={<GeneratedNavigation shell="sidebar-app" />}>
        <ResourceCreatePageShell title="New project" description="Create a new project using the generated resource form scaffold.">
          <ProjectsForm mode="create" />
        </ResourceCreatePageShell>
      </SidebarAppShell>
    </>
  );
}