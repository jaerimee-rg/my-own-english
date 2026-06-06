import { test, expect } from "@playwright/test";

test("links a web manifest and serves it", async ({ page, request }) => {
  await page.goto("/");
  const href = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  expect(href).toBeTruthy();

  const res = await request.get(href!);
  expect(res.ok()).toBeTruthy();
  const manifest = await res.json();
  expect(manifest.name).toBe("My Own English");
  expect(manifest.display).toBe("standalone");
});
