import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("홈페이지가 로드된다", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/오늘 뭐하지/);
  });

  test("네비게이션 링크가 표시된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("지도")).toBeVisible();
    await expect(page.getByText("탐색")).toBeVisible();
    await expect(page.getByText("가고싶다")).toBeVisible();
    await expect(page.getByText("다녀왔어요")).toBeVisible();
  });

  test("탐색 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByText("탐색").click();
    await expect(page).toHaveURL(/explore/);
    await expect(page.getByText(/장소 발견/)).toBeVisible();
  });

  test("가고싶다 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByText("가고싶다").click();
    await expect(page).toHaveURL(/wishlist/);
    await expect(page.getByText("가고싶다")).toBeVisible();
  });

  test("다녀왔어요 페이지로 이동한다", async ({ page }) => {
    await page.goto("/");
    await page.getByText("다녀왔어요").click();
    await expect(page).toHaveURL(/visited/);
    await expect(page.getByText("다녀왔어요")).toBeVisible();
  });
});
