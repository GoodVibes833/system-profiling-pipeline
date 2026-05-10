import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/hooks/useUserStore", () => ({
  useUserStore: () => ({ nickname: "", hydrated: true }),
}));

describe("Navbar", () => {
  it("로고 텍스트가 표시된다", () => {
    render(<Navbar />);
    expect(screen.getByText("오늘")).toBeInTheDocument();
    expect(screen.getByText("뭐하지?")).toBeInTheDocument();
  });

  it("모든 네비게이션 링크가 표시된다", () => {
    render(<Navbar />);
    expect(screen.getByText("지도")).toBeInTheDocument();
    expect(screen.getByText("탐색")).toBeInTheDocument();
    expect(screen.getByText("가고싶다")).toBeInTheDocument();
    expect(screen.getByText("다녀왔어요")).toBeInTheDocument();
  });

  it("가고싶다 링크가 /wishlist를 가리킨다", () => {
    render(<Navbar />);
    const wishlistLink = screen.getByText("가고싶다").closest("a");
    expect(wishlistLink).toHaveAttribute("href", "/wishlist");
  });

  it("다녀왔어요 링크가 /visited를 가리킨다", () => {
    render(<Navbar />);
    const visitedLink = screen.getByText("다녀왔어요").closest("a");
    expect(visitedLink).toHaveAttribute("href", "/visited");
  });
});
