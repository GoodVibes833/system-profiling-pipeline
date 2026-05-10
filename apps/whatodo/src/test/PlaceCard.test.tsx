import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PlaceCard from "@/components/PlaceCard";
import type { Place } from "@/data/places";

const mockToggleWishlist = vi.fn();
const mockToggleVisited = vi.fn();

vi.mock("@/hooks/useUserStore", () => ({
  useUserStore: () => ({
    wishlist: [],
    visited: [],
    toggleWishlist: mockToggleWishlist,
    toggleVisited: mockToggleVisited,
    hydrated: true,
  }),
}));

const MOCK_PLACE: Place = {
  id: "test-place-1",
  name: "테스트 카페",
  nameEn: "Test Cafe",
  city: "toronto",
  category: "카페",
  neighborhood: "켄싱턴",
  shortDesc: "아는 사람만 아는 숨은 카페",
  description: "조용하고 아늑한 히든 카페입니다.",
  tags: ["히든카페", "조용한", "아늑한"],
  tips: ["평일 오전이 한적해요"],
  image: "https://via.placeholder.com/400x300",
  lat: 43.6534,
  lng: -79.4009,
  rating: 4.7,
  priceLevel: 1,
  address: "123 Test St, Toronto",
  indoorOutdoor: "indoor",
  featured: false,
  isFree: false,
  recommendScore: 4,
  lastUpdated: "2024-01-01",
};

const MOCK_FEATURED_PLACE: Place = {
  ...MOCK_PLACE,
  id: "test-place-2",
  name: "유명 관광지",
  nameEn: "Famous Spot",
  tags: ["유명한", "관광지"],
  featured: true,
  category: "관광",
};

const MOCK_FREE_PLACE: Place = {
  ...MOCK_PLACE,
  id: "test-place-3",
  name: "무료 공원",
  nameEn: "Free Park",
  tags: ["자연", "무료"],
  category: "자연",
  priceLevel: 0,
  isFree: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PlaceCard — 기본 렌더링", () => {
  it("장소 이름이 표시된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.getByText("테스트 카페")).toBeInTheDocument();
  });

  it("neighborhood가 표시된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.getByText("켄싱턴")).toBeInTheDocument();
  });

  it("rating이 표시된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.getByText("4.7")).toBeInTheDocument();
  });

  it("shortDesc가 표시된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.getByText("아는 사람만 아는 숨은 카페")).toBeInTheDocument();
  });
});

describe("PlaceCard — 히든 배지", () => {
  it("히든 태그가 있으면 '🕵️ 히든' 배지가 표시된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.getByText("🕵️ 히든")).toBeInTheDocument();
  });

  it("히든 태그가 없고 featured이면 '✨ 추천' 배지가 표시된다", () => {
    render(<PlaceCard place={MOCK_FEATURED_PLACE} />);
    expect(screen.getByText(/추천/)).toBeInTheDocument();
    expect(screen.queryByText(/🕵️/)).not.toBeInTheDocument();
  });

  it("히든도 featured도 아니면 배지가 없다", () => {
    const plain = { ...MOCK_PLACE, tags: ["조용한"], featured: false };
    render(<PlaceCard place={plain} />);
    expect(screen.queryByText(/🕵️/)).not.toBeInTheDocument();
    expect(screen.queryByText(/추천/)).not.toBeInTheDocument();
  });
});

describe("PlaceCard — 무료 배지", () => {
  it("isFree=true이면 '🆓 무료' 배지가 표시된다", () => {
    render(<PlaceCard place={MOCK_FREE_PLACE} />);
    expect(screen.getByText("🆓 무료")).toBeInTheDocument();
  });

  it("isFree=false이면 '🆓 무료' 배지가 없다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.queryByText("🆓 무료")).not.toBeInTheDocument();
  });
});

describe("PlaceCard — 인터랙션", () => {
  it("위시리스트 버튼 클릭 시 toggleWishlist가 호출된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    const wishBtn = screen.getByTitle("가고싶다");
    fireEvent.click(wishBtn);
    expect(mockToggleWishlist).toHaveBeenCalledWith("test-place-1");
  });

  it("방문 버튼 클릭 시 toggleVisited가 호출된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    const visitBtn = screen.getByTitle("다녀왔다");
    fireEvent.click(visitBtn);
    expect(mockToggleVisited).toHaveBeenCalledWith("test-place-1");
  });
});

describe("PlaceCard — 태그", () => {
  it("처음 2개 태그가 표시된다", () => {
    render(<PlaceCard place={MOCK_PLACE} />);
    expect(screen.getByText("#히든카페")).toBeInTheDocument();
    expect(screen.getByText("#조용한")).toBeInTheDocument();
    expect(screen.queryByText("#아늑한")).not.toBeInTheDocument();
  });
});
