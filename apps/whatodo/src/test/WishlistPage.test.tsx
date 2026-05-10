import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import WishlistPage from "@/app/wishlist/page";

vi.mock("@/hooks/useUserStore", () => ({
  useUserStore: () => ({
    wishlist: ["test-place-1"],
    hydrated: true,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/wishlist",
}));

describe("WishlistPage", () => {
  it("페이지 제목이 표시된다", () => {
    render(<WishlistPage />);
    expect(screen.getByText("가고싶다")).toBeInTheDocument();
  });

  it("저장한 장소 수가 표시된다", () => {
    render(<WishlistPage />);
    expect(screen.getByText("1개")).toBeInTheDocument();
  });

  it("장소 탐색 링크가 표시된다", () => {
    render(<WishlistPage />);
    expect(screen.getByText("장소 탐색하러 가기")).toBeInTheDocument();
  });
});
