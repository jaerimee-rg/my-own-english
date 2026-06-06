import { test, expect } from "@playwright/test";

test("login page renders the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
  await expect(page.getByLabel("이메일")).toBeVisible();
  await expect(page.getByLabel("비밀번호")).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
});

test("settings shows a login entry when signed out", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "설정" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "로그인" }),
  ).toBeVisible({ timeout: 15000 });
});
