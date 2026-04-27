import { expect, test } from "@playwright/test";

const routes = [
  {
    "path": "/",
    "access": "user",
    "title": "Projects"
  },
  {
    "path": "/projects",
    "access": "user",
    "title": "Projects"
  },
  {
    "path": "/projects/new",
    "access": "user",
    "title": "New project"
  },
  {
    "path": "/projects/sample-id/edit",
    "access": "user",
    "title": "Edit Project"
  },
  {
    "path": "/agent-events",
    "access": "user",
    "title": "Agent events"
  },
  {
    "path": "/agent-events/new",
    "access": "user",
    "title": "Create Agent event"
  },
  {
    "path": "/agent-events/sample-id/edit",
    "access": "user",
    "title": "Edit Agent event"
  },
  {
    "path": "/settings",
    "access": "user",
    "title": "Settings"
  },
  {
    "path": "/projects/sample-id",
    "access": "user",
    "title": "Project workbench"
  }
] as const;

for (const route of routes) {
  test(`route ${route.path} responds without a server error`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status() ?? 0).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
}
