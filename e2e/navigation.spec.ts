import { test, expect } from "@playwright/test";

test("home shows app title and quick links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("My Own English")).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: /문장집/ }),
  ).toBeVisible();
});

test("bottom nav moves between sections", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("navigation").getByRole("link", { name: /학습/ }).click();
  await expect(page).toHaveURL(/\/study$/);
  await expect(
    page.getByRole("heading", { name: "학습" }),
  ).toBeVisible();

  await page.getByRole("navigation").getByRole("link", { name: /대화/ }).click();
  await expect(page).toHaveURL(/\/conversation$/);
  await expect(
    page.getByRole("heading", { name: "대화 연습" }),
  ).toBeVisible();
});
