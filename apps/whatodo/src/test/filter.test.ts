import { describe, it, expect } from "vitest";
import { places } from "@/data/places";

const HIDDEN_TAGS = ["히든", "hidden", "숨은명소", "히든카페", "히든맛집", "히든바"];

function isHiddenPlace(tags: string[]) {
  return tags.some((t) => HIDDEN_TAGS.some((h) => t.includes(h)));
}

function filterPlaces(opts: {
  city?: string;
  category?: string | null;
  priceLevel?: number | null;
  hiddenOnly?: boolean;
  search?: string;
  freeOnly?: boolean;
}) {
  return places.filter((p) => {
    if (opts.city && p.city !== opts.city) return false;
    if (opts.category && p.category !== opts.category) return false;
    if (opts.priceLevel !== undefined && opts.priceLevel !== null && p.priceLevel !== opts.priceLevel) return false;
    if (opts.freeOnly && p.priceLevel !== 0) return false;
    if (opts.hiddenOnly && !isHiddenPlace(p.tags)) return false;
    if (opts.search) {
      const q = opts.search.toLowerCase();
      const hit =
        p.name.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });
}

describe("필터 로직 — 도시", () => {
  it("toronto 필터가 토론토 장소만 반환한다", () => {
    const result = filterPlaces({ city: "toronto" });
    expect(result.every((p) => p.city === "toronto")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("vancouver 필터가 밴쿠버 장소만 반환한다", () => {
    const result = filterPlaces({ city: "vancouver" });
    expect(result.every((p) => p.city === "vancouver")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("필터 로직 — 카테고리", () => {
  it("맛집 카테고리 필터가 올바르게 동작한다", () => {
    const result = filterPlaces({ category: "맛집" });
    expect(result.every((p) => p.category === "맛집")).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("카테고리 null이면 전체 반환한다", () => {
    const all = filterPlaces({});
    const withNull = filterPlaces({ category: null });
    expect(withNull.length).toBe(all.length);
  });
});

describe("필터 로직 — 가격", () => {
  it("무료(0) 필터가 priceLevel=0 장소만 반환한다", () => {
    const result = filterPlaces({ priceLevel: 0 });
    expect(result.every((p) => p.priceLevel === 0)).toBe(true);
  });

  it("freeOnly=true가 무료 장소만 반환한다", () => {
    const result = filterPlaces({ freeOnly: true });
    expect(result.every((p) => p.priceLevel === 0)).toBe(true);
  });
});

describe("필터 로직 — 히든 스팟", () => {
  it("hiddenOnly=true가 히든 태그 있는 장소만 반환한다", () => {
    const result = filterPlaces({ hiddenOnly: true });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => isHiddenPlace(p.tags))).toBe(true);
  });

  it("hiddenOnly=false면 전체 반환한다", () => {
    const all = filterPlaces({});
    const result = filterPlaces({ hiddenOnly: false });
    expect(result.length).toBe(all.length);
  });

  it("isHiddenPlace가 히든 태그를 올바르게 감지한다", () => {
    expect(isHiddenPlace(["히든카페", "분위기좋은"])).toBe(true);
    expect(isHiddenPlace(["hidden", "맛있는"])).toBe(true);
    expect(isHiddenPlace(["숨은명소"])).toBe(true);
    expect(isHiddenPlace(["관광", "유명한"])).toBe(false);
  });
});

describe("필터 로직 — 검색", () => {
  it("이름으로 검색이 된다", () => {
    const first = places[0];
    const result = filterPlaces({ search: first.name.slice(0, 3) });
    expect(result.some((p) => p.id === first.id)).toBe(true);
  });

  it("빈 검색어는 모두 통과한다", () => {
    const all = filterPlaces({});
    const result = filterPlaces({ search: "" });
    expect(result.length).toBe(all.length);
  });
});

describe("필터 로직 — 복합 조건", () => {
  it("도시 + 카테고리 복합 필터가 동작한다", () => {
    const result = filterPlaces({ city: "toronto", category: "맛집" });
    expect(result.every((p) => p.city === "toronto" && p.category === "맛집")).toBe(true);
  });

  it("도시 + 히든 복합 필터가 동작한다", () => {
    const result = filterPlaces({ city: "toronto", hiddenOnly: true });
    expect(
      result.every((p) => p.city === "toronto" && isHiddenPlace(p.tags))
    ).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
