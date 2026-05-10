import { test, expect } from "@playwright/test";

test.describe("Explore Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/explore");
  });

  test("도시 탭이 표시된다", async ({ page }) => {
    await expect(page.getByText("토론토")).toBeVisible();
    await expect(page.getByText("밴쿠버")).toBeVisible();
  });

  test("카테고리 필터가 표시된다", async ({ page }) => {
    await expect(page.getByText("맛집")).toBeVisible();
    await expect(page.getByText("카페")).toBeVisible();
    await expect(page.getByText("관광")).toBeVisible();
  });

  test("검색어 입력 시 필터링된다", async ({ page }) => {
    const searchInput = page.getByPlaceholder("장소, 음식, 태그 검색...");
    await searchInput.fill("카페");
    await page.waitForTimeout(300); // debounce 없으므로 즉시 반영
    const resultText = page.getByText(/개 장소 발견/);
    await expect(resultText).toBeVisible();
  });

  test("필터 버튼 토글이 동작한다", async ({ page }) => {
    const filterBtn = page.getByLabel("필터");
    await filterBtn.click();
    await expect(page.getByText("무료만 보기")).toBeVisible();
    await filterBtn.click();
    await expect(page.getByText("무료만 보기")).not.toBeVisible();
  });

  test("무료 필터 적용 시 결과가 줄어든다", async ({ page }) => {
    const initialCount = await page.getByText(/\d+개 장소 발견/).textContent();
    await page.getByLabel("필터").click();
    await page.getByText("무료만 보기").click();
    const filteredCount = await page.getByText(/\d+개 장소 발견/).textContent();
    expect(filteredCount).not.toBe(initialCount);
  });

  test("필터 초기화 버튼이 동작한다", async ({ page }) => {
    await page.getByLabel("필터").click();
    await page.getByText("무료만 보기").click();
    await page.getByText("필터 초기화").click();
    await expect(page.getByText("무료만 보기")).not.toBeVisible();
  });
});
