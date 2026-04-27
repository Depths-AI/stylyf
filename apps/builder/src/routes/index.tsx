import { Link, Meta, Title } from "@solidjs/meta";
import { ErrorBoundary, Show } from "solid-js";
import { createAsync } from "@solidjs/router";
import { SidebarAppShell } from "~/components/shells/app/sidebar-app";
import { GeneratedNavigation } from "~/components/generated-navigation";
import { ResourceIndexPageShell } from "~/components/shells/page/resource-index";
import { Stack } from "~/components/layout/stack";
import { DataTableShell } from "~/components/registry/data-views/data-table-shell";
import { DetailPanel } from "~/components/registry/data-views/detail-panel";
import { FilterToolbar } from "~/components/registry/form-systems/filter-toolbar";
import { EmptyState } from "~/components/registry/information-states/empty-state";
import { ErrorState } from "~/components/registry/information-states/error-state";
import { LoadingState } from "~/components/registry/information-states/loading-state";
import { PageHeader } from "~/components/registry/information-states/page-header";
import { listProjects } from "~/lib/server/queries/projects-list";

export default function IndexRoute() {
  const projectsRows = createAsync(() => listProjects());
  return (
    <>
      <Title>Projects</Title>
      <Meta name="description" content="Projects private app surface for Stylyf Builder." />
      <Meta name="robots" content="noindex" />
      <Meta property="og:title" content="Projects" />
      <Meta property="og:description" content="Projects private app surface for Stylyf Builder." />
      <SidebarAppShell title="Stylyf Builder" navigation={<GeneratedNavigation shell="sidebar-app" />}>
        <ResourceIndexPageShell title="Projects">
          <ErrorBoundary fallback={(error) => <ErrorState title="Unable to load records" detail={error instanceof Error ? error.message : String(error)} />}>
            <Show when={projectsRows() !== undefined} fallback={<LoadingState title="Loading projects" description="Fetching the latest generated resource data." />}>
              <Show when={(projectsRows()?.length ?? 0) > 0} fallback={<EmptyState eyebrow="No records" title="No projects yet" description="Create your first record or adjust the generated query filters." />}>
              <Stack>
                <PageHeader title="Projects" description="Manage projects records." />
                <FilterToolbar />
                <DataTableShell />
                <DetailPanel />
              </Stack>
              </Show>
            </Show>
          </ErrorBoundary>
        </ResourceIndexPageShell>
      </SidebarAppShell>
    </>
  );
}
