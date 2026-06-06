import { test, expect } from "@playwright/test";

test("study shows mode menu and opens flashcards", async ({ page }) => {
  await page.goto("/study");
  await expect(page.getByRole("heading", { name: "학습" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /플래시카드/ }),
  ).toBeVisible();

  await page.getByRole("button", { name: /플래시카드/ }).click();
  await expect(
    page.getByRole("heading", { name: "플래시카드" }),
  ).toBeVisible();
  // With no backend configured, loading settles into the deck's empty state.
  await expect(page.getByText(/학습할 문장이 없어요/)).toBeVisible({
    timeout: 20000,
  });
});
