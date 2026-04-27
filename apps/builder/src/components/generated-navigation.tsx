import { For, Show } from "solid-js";
import { SidebarNav } from "~/components/registry/navigation-workflow/sidebar-nav";
import { cn } from "~/lib/cn";

export const navigationConfig = {
  "primary": [
    {
      "label": "Projects",
      "href": "/",
      "auth": "user"
    },
    {
      "label": "New Project",
      "href": "/projects/new",
      "auth": "user"
    },
    {
      "label": "Settings",
      "href": "/settings",
      "auth": "user"
    }
  ],
  "secondary": [],
  "userMenu": [
    {
      "label": "Sign out",
      "href": "/api/auth/sign-out",
      "auth": "user"
    }
  ],
  "commandMenu": [
    {
      "label": "Projects",
      "href": "/",
      "group": "App",
      "auth": "user",
      "command": true
    },
    {
      "label": "Projects",
      "href": "/projects",
      "group": "App",
      "auth": "user",
      "command": true
    },
    {
      "label": "New project",
      "href": "/projects/new",
      "group": "App",
      "auth": "user",
      "command": true
    },
    {
      "label": "Agent events",
      "href": "/agent-events",
      "group": "App",
      "auth": "user",
      "command": true
    },
    {
      "label": "Create Agent event",
      "href": "/agent-events/new",
      "group": "App",
      "auth": "user",
      "command": true
    },
    {
      "label": "Settings",
      "href": "/settings",
      "group": "App",
      "auth": "user",
      "command": true
    }
  ]
} as const;

const sidebarGroups = [
  {
    "label": "Navigation",
    "items": [
      {
        "label": "Projects",
        "href": "/",
        "auth": "user"
      },
      {
        "label": "New Project",
        "href": "/projects/new",
        "auth": "user"
      },
      {
        "label": "Settings",
        "href": "/settings",
        "auth": "user"
      }
    ]
  }
] as const;

export function GeneratedNavigation(props: { class?: string; shell?: "sidebar-app" | "topbar-app" | "docs-shell" | "marketing-shell" }) {
  if (props.shell === "sidebar-app" || props.shell === "docs-shell") {
    return <SidebarNav title="Stylyf Builder" groups={sidebarGroups as any} class={props.class} />;
  }

  return (
    <div class={cn("flex flex-wrap items-center gap-2 text-sm", props.class)}>
      <For each={navigationConfig.primary}>
        {item => (
          <a
            href={item.href}
            class="rounded-[var(--radius-md)] px-3 py-2 text-muted-foreground transition hover:bg-muted-soft hover:text-foreground"
          >
            {item.label}
          </a>
        )}
      </For>
      <Show when={(navigationConfig.primary as readonly unknown[]).length === 0}>
        <span class="text-muted-foreground">No navigation items generated.</span>
      </Show>
    </div>
  );
}
