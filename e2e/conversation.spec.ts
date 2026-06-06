import { test, expect } from "@playwright/test";

test("conversation: pick scenario and get a reply", async ({ page }) => {
  await page.goto("/conversation");
  await expect(page.getByRole("heading", { name: "대화 연습" })).toBeVisible();

  await page.getByText("자유 대화").click();
  await expect(page.getByRole("heading", { name: "자유 대화" })).toBeVisible();

  await page.getByLabel("메시지").fill("Hello!");
  await page.getByRole("button", { name: "전송" }).click();

  // User message echoes; assistant responds (preview notice without API key).
  await expect(page.getByText("Hello!")).toBeVisible();
  await expect(page.getByText(/ANTHROPIC_API_KEY|미리보기/)).toBeVisible({
    timeout: 15000,
  });
});
