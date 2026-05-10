import { test, expect } from "@playwright/test";

test.describe("Wishlist & Visited", () => {
  test("빈 위시리스트 상태를 보여준다", async ({ page }) => {
    await page.goto("/wishlist");
    await expect(page.getByText("아직 저장한 장소가 없어요")).toBeVisible();
    await expect(page.getByText("장소 탐색하러 가기")).toBeVisible();
  });

  test("빈 방문 목록 상태를 보여준다", async ({ page }) => {
    await page.goto("/visited");
    await expect(page.getByText("아직 방문한 장소가 없어요")).toBeVisible();
    await expect(page.getByText("장소 탐색하러 가기")).toBeVisible();
  });

  test("탐색 링크로 이동한다", async ({ page }) => {
    await page.goto("/wishlist");
    await page.getByText("장소 탐색하러 가기").click();
    await expect(page).toHaveURL(/explore/);
  });
});
