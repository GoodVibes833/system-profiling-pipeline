import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUserStore } from "@/hooks/useUserStore";

describe("useUserStore", () => {
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
    vi.spyOn(window.localStorage, "getItem").mockImplementation((key) => storage[key] ?? null);
    vi.spyOn(window.localStorage, "setItem").mockImplementation((key, value) => {
      storage[key] = value;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("초기 상태는 빈 위시리스트와 방문 목록이다", () => {
    const { result } = renderHook(() => useUserStore());
    expect(result.current.wishlist).toEqual([]);
    expect(result.current.visited).toEqual([]);
    expect(result.current.hydrated).toBe(true);
  });

  it("toggleWishlist가 장소를 위시리스트에 추가한다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.toggleWishlist("place-1"));
    expect(result.current.wishlist).toContain("place-1");
  });

  it("toggleWishlist가 이미 있는 장소를 제거한다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.toggleWishlist("place-1"));
    act(() => result.current.toggleWishlist("place-1"));
    expect(result.current.wishlist).not.toContain("place-1");
  });

  it("toggleVisited가 장소를 방문 목록에 추가한다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.toggleVisited("place-1"));
    expect(result.current.visited).toContain("place-1");
  });

  it("toggleVisited가 이미 방문한 장소를 제거한다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.toggleVisited("place-1"));
    act(() => result.current.toggleVisited("place-1"));
    expect(result.current.visited).not.toContain("place-1");
  });

  it("setNickname이 닉네임을 설정한다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.setNickname("🙋 Alex"));
    expect(result.current.nickname).toBe("🙋 Alex");
  });

  it("localStorage에 상태가 저장된다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.toggleWishlist("place-1"));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "cangaza_user",
      expect.stringContaining("place-1")
    );
  });

  it("미션 완료 시 포인트가 적립된다", () => {
    const { result } = renderHook(() => useUserStore());
    act(() => result.current.toggleVisited("place-1"));
    // first-visit 미션: 1개 방문 시 10점
    expect(result.current.points).toBeGreaterThan(0);
    expect(result.current.completedMissions).toContain("first-visit");
  });
});
