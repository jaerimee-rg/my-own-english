import { test, expect } from "@playwright/test";

test("phrases page renders header and add flow", async ({ page }) => {
  await page.goto("/phrases");

  await expect(page.getByRole("heading", { name: "문장집" })).toBeVisible();
  await expect(page.getByRole("button", { name: "+ 추가" })).toBeVisible();

  // Opening the form and submitting empty shows validation.
  await page.getByRole("button", { name: "+ 추가" }).click();
  await expect(page.getByLabel("영어 문장")).toBeVisible();
  await page.getByRole("button", { name: "저장" }).click();
  await expect(page.getByText("영어 문장을 입력해 주세요.")).toBeVisible();
});

test("phrases page exposes search and category filters", async ({ page }) => {
  await page.goto("/phrases");
  await expect(page.getByLabel("검색")).toBeVisible();
  await expect(page.getByLabel("소도구 필터")).toBeVisible();
  await expect(page.getByLabel("난이도 필터")).toBeVisible();
});
