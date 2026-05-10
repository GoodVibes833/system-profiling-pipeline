import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VisitedPage from "@/app/visited/page";

vi.mock("@/hooks/useUserStore", () => ({
  useUserStore: () => ({
    visited: ["test-place-1", "test-place-2"],
    points: 10,
    completedMissions: ["first-visit"],
    earnedBadges: ["first-step"],
    hydrated: true,
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/visited",
}));

describe("VisitedPage", () => {
  it("페이지 제목이 표시된다", () => {
    render(<VisitedPage />);
    expect(screen.getByText("다녀왔어요")).toBeInTheDocument();
  });

  it("통계 카드가 표시된다", () => {
    render(<VisitedPage />);
    expect(screen.getByText("방문 장소")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // visited count
    expect(screen.getByText("포인트")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("획득 배지")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
