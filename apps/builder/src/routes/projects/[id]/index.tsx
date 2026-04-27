import { Link, Meta, Title } from "@solidjs/meta";
import { ErrorBoundary, Show } from "solid-js";
import { createAsync, useParams } from "@solidjs/router";
import { SidebarAppShell } from "~/components/shells/app/sidebar-app";
import { GeneratedNavigation } from "~/components/generated-navigation";
import { ResourceDetailPageShell } from "~/components/shells/page/resource-detail";
import { Stack } from "~/components/layout/stack";
import { DetailPanel } from "~/components/registry/data-views/detail-panel";
import { EmptyState } from "~/components/registry/information-states/empty-state";
import { ErrorState } from "~/components/registry/information-states/error-state";
import { LoadingState } from "~/components/registry/information-states/loading-state";
import { PageHeader } from "~/components/registry/information-states/page-header";
import { getProjects } from "~/lib/server/queries/projects-detail";

export default function ProjectsIdRoute() {
  const params = useParams();
  const projectData = createAsync(() => getProjects(params.id ?? ""));
  return (
    <>
      <Title>Project workbench</Title>
      <Meta name="description" content="Project workbench private app surface for Stylyf Builder." />
      <Meta name="robots" content="noindex" />
      <Meta property="og:title" content="Project workbench" />
      <Meta property="og:description" content="Project workbench private app surface for Stylyf Builder." />
      <SidebarAppShell title="Stylyf Builder" navigation={<GeneratedNavigation shell="sidebar-app" />}>
        <ResourceDetailPageShell title="Project workbench">
          <ErrorBoundary fallback={(error) => <ErrorState title="Unable to load record" detail={error instanceof Error ? error.message : String(error)} />}>
            <Show when={projectData() !== undefined} fallback={<LoadingState title="Loading project" description="Fetching this generated resource record." />}>
              <Show when={projectData()} fallback={<EmptyState eyebrow="Not found" title="Project not found" description="The requested record was not returned by the generated detail query." />}>
              <Stack>
                <PageHeader />
                <DetailPanel />
              </Stack>
              </Show>
            </Show>
          </ErrorBoundary>
        </ResourceDetailPageShell>
      </SidebarAppShell>
    </>
  );
}
