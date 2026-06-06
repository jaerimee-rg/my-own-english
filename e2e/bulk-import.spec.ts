import { test, expect } from "@playwright/test";

test("bulk import: paste, analyze, preview rows", async ({ page }) => {
  await page.goto("/phrases");

  await page.getByRole("button", { name: "일괄" }).click();
  await expect(
    page.getByRole("heading", { name: "문장 일괄 추가" }),
  ).toBeVisible();

  await page
    .getByLabel("일괄 입력")
    .fill("Point your toes. - 발끝을 펴세요.\nGreat job! - 잘했어요!");
  await page.getByRole("button", { name: /분석/ }).click();

  // Parser (local fallback works without auth) finds two pairs.
  await expect(page.getByLabel("영어 1")).toHaveValue("Point your toes.", {
    timeout: 15000,
  });
  await expect(page.getByLabel("한국어 2")).toHaveValue("잘했어요!");
  await expect(
    page.getByRole("button", { name: /2개 문장 저장/ }),
  ).toBeVisible();
});
