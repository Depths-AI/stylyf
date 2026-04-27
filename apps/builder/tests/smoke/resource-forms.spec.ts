import { expect, test } from "@playwright/test";

const formRoutes = [
  {
    "path": "/projects/new",
    "page": "resource-create",
    "resource": "projects"
  },
  {
    "path": "/projects/sample-id/edit",
    "page": "resource-edit",
    "resource": "projects"
  },
  {
    "path": "/agent-events/new",
    "page": "resource-create",
    "resource": "agent_events"
  },
  {
    "path": "/agent-events/sample-id/edit",
    "page": "resource-edit",
    "resource": "agent_events"
  }
] as const;

for (const route of formRoutes) {
  test(`resource form route ${route.path} responds without a server error`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status() ?? 0).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
}
