import { expect, test } from "@playwright/test";

test("login route renders the generated auth form", async ({ page }) => {
  const response = await page.goto("/login");
  expect(response?.status() ?? 0).toBeLessThan(500);
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});
