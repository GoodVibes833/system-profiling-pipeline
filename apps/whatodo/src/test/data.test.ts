import { describe, it, expect } from "vitest";
import { places, cities, categories } from "@/data/places";

const REQUIRED_FIELDS = [
  "id", "name", "nameEn", "city", "category", "neighborhood",
  "shortDesc", "description", "tags", "tips", "image",
  "lat", "lng", "rating", "priceLevel", "address",
] as const;

describe("places 데이터 무결성", () => {
  it("places 배열이 비어있지 않다", () => {
    expect(places.length).toBeGreaterThan(0);
  });

  it("모든 place에 필수 필드가 있다", () => {
    for (const place of places) {
      for (const field of REQUIRED_FIELDS) {
        expect(place[field], `${place.id} missing field: ${field}`).toBeDefined();
      }
    }
  });

  it("모든 place ID가 고유하다", () => {
    const ids = places.map((p) => p.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("모든 place의 rating은 0~5 범위다", () => {
    for (const place of places) {
      expect(place.rating, `${place.id} invalid rating`).toBeGreaterThanOrEqual(0);
      expect(place.rating, `${place.id} invalid rating`).toBeLessThanOrEqual(5);
    }
  });

  it("모든 place의 priceLevel은 0~3 범위다", () => {
    for (const place of places) {
      expect(place.priceLevel, `${place.id} invalid priceLevel`).toBeGreaterThanOrEqual(0);
      expect(place.priceLevel, `${place.id} invalid priceLevel`).toBeLessThanOrEqual(3);
    }
  });

  it("모든 place의 city는 유효한 City 타입이다", () => {
    const validCities = cities.map((c) => c.id);
    for (const place of places) {
      expect(validCities, `${place.id} invalid city: ${place.city}`).toContain(place.city);
    }
  });

  it("모든 place의 category는 유효한 Category 타입이다", () => {
    const validCats = categories.map((c) => c.id);
    for (const place of places) {
      expect(validCats, `${place.id} invalid category: ${place.category}`).toContain(place.category);
    }
  });

  it("모든 place의 lat/lng는 캐나다 범위 내다", () => {
    for (const place of places) {
      expect(place.lat, `${place.id} lat out of range`).toBeGreaterThan(42);
      expect(place.lat, `${place.id} lat out of range`).toBeLessThan(60);
      expect(place.lng, `${place.id} lng out of range`).toBeGreaterThan(-141);
      expect(place.lng, `${place.id} lng out of range`).toBeLessThan(-52);
    }
  });

  it("모든 place의 tags는 배열이다", () => {
    for (const place of places) {
      expect(Array.isArray(place.tags), `${place.id} tags is not array`).toBe(true);
    }
  });

  it("모든 place의 tips는 배열이다", () => {
    for (const place of places) {
      expect(Array.isArray(place.tips), `${place.id} tips is not array`).toBe(true);
    }
  });

  it("토론토에 히든 스팟이 있다", () => {
    const hiddenToronto = places.filter(
      (p) =>
        p.city === "toronto" &&
        p.tags.some((t) => t.includes("히든") || t.includes("hidden"))
    );
    expect(hiddenToronto.length).toBeGreaterThan(0);
  });

  it("8개 도시 모두 place가 있다", () => {
    const cityIds = cities.map((c) => c.id);
    for (const cityId of cityIds) {
      const count = places.filter((p) => p.city === cityId).length;
      expect(count, `${cityId} has no places`).toBeGreaterThan(0);
    }
  });
});

describe("cities 데이터 무결성", () => {
  it("cities 배열이 비어있지 않다", () => {
    expect(cities.length).toBeGreaterThan(0);
  });

  it("모든 city에 id, label, emoji가 있다", () => {
    for (const city of cities) {
      expect(city.id).toBeDefined();
      expect(city.label).toBeDefined();
      expect(city.emoji).toBeDefined();
    }
  });
});

describe("categories 데이터 무결성", () => {
  it("categories 배열이 비어있지 않다", () => {
    expect(categories.length).toBeGreaterThan(0);
  });

  it("모든 category에 id, label, emoji, color가 있다", () => {
    for (const cat of categories) {
      expect(cat.id).toBeDefined();
      expect(cat.label).toBeDefined();
      expect(cat.emoji).toBeDefined();
      expect(cat.color).toBeDefined();
    }
  });
});
