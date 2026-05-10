"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { places, categories, cities, type Category, type City } from "@/data/places";
import PlaceCard from "@/components/PlaceCard";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as Category | null;
  const initialCity = (searchParams.get("city") as City | null) ?? "toronto";

  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "score" | "rating">("default");
  const [showFilters, setShowFilters] = useState(false);

  const cityPlaces = useMemo(() => places.filter((p) => p.city === selectedCity), [selectedCity]);

  const filtered = useMemo(() => {
    let result = cityPlaces.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.includes(search));
      const matchCat = !selectedCategory || p.category === selectedCategory;
      const matchPrice = priceFilter === null || p.priceLevel === priceFilter;
      const matchFree = !freeOnly || p.isFree === true;
      const matchHidden = !hiddenOnly || p.tags.some((t) => t.includes("히든") || t.includes("hidden"));
      return matchSearch && matchCat && matchPrice && matchFree && matchHidden;
    });
    if (sortBy === "score") result = [...result].sort((a, b) => (b.recommendScore ?? 0) - (a.recommendScore ?? 0));
    if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    return result;
  }, [search, cityPlaces, selectedCategory, priceFilter, freeOnly, hiddenOnly, sortBy]);

  const priceLabels = ["무료", "$", "$$", "$$$"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="py-12 px-4"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🍁 토론토 탐색</h1>
          <p className="text-blue-200 text-sm mb-4">
            워홀러를 위한 토론토 알짜 장소 — 한인 맛집부터 히든 카페까지
          </p>

          {/* City tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
            {cities.map((city) => (
              <button
                key={city.id}
                disabled={city.comingSoon}
                onClick={() => {
                  if (!city.comingSoon) {
                    setSelectedCity(city.id);
                    setSelectedCategory(null);
                  }
                }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                  selectedCity === city.id
                    ? "bg-white text-slate-900 border-white"
                    : city.comingSoon
                    ? "bg-white/5 text-white/30 border-white/10 cursor-not-allowed"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                )}
              >
                <span>{city.emoji}</span>
                {city.label}
                {city.comingSoon && (
                  <span className="text-xs opacity-60">준비중</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <SearchBar
            value={search}
            onChange={setSearch}
            onFilterToggle={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
          />

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 space-y-4">
              {/* 무료 토글 */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFreeOnly(!freeOnly)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                    freeOnly ? "bg-green-400 text-white border-green-400" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  )}
                >
                  {freeOnly ? "✅" : "🆓"} 무료만 보기
                </button>
                <button
                  onClick={() => setHiddenOnly(!hiddenOnly)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                    hiddenOnly ? "border-transparent text-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  )}
                  style={hiddenOnly ? { background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderColor: "transparent" } : {}}
                >
                  🕵️ 히든 스팟만
                </button>
              </div>
              {/* 가격대 */}
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase mb-2">가격대</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setPriceFilter(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-sm font-semibold transition-all",
                      priceFilter === null ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    전체
                  </button>
                  {priceLabels.map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setPriceFilter(priceFilter === i ? null : i)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-sm font-semibold transition-all",
                        priceFilter === i ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {/* 정렬 */}
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase mb-2">정렬</p>
                <div className="flex gap-2 flex-wrap">
                  {(["default", "score", "rating"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-sm font-semibold transition-all",
                        sortBy === s ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
                      )}
                    >
                      {s === "default" ? "기본순" : s === "score" ? "⭐ 추천순" : "🌟 평점순"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                !selectedCategory
                  ? "text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              style={!selectedCategory ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
            >
              전체 ({cityPlaces.length})
            </button>
            {categories.map((cat) => {
              const count = cityPlaces.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    selectedCategory === cat.id
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                  style={selectedCategory === cat.id ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                  <span className={cn("text-xs", selectedCategory === cat.id ? "text-white/70" : "text-slate-400")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-500 text-sm">
            <span className="font-bold text-slate-900">{filtered.length}개</span> 장소 발견
            {freeOnly && <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">🆓 무료만</span>}
            {hiddenOnly && <span className="ml-2 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">🕵️ 히든만</span>}
          </p>
          {(selectedCategory || priceFilter !== null || search || freeOnly || hiddenOnly || sortBy !== "default") && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPriceFilter(null);
                setSearch("");
                setFreeOnly(false);
                setHiddenOnly(false);
                setSortBy("default");
              }}
              className="flex items-center gap-1 text-sm text-orange-600 font-semibold hover:underline"
            >
              <X size={14} />
              필터 초기화
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-500 text-lg font-semibold mb-2">검색 결과가 없어요</p>
            <p className="text-slate-400 text-sm">다른 키워드나 카테고리로 검색해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">로딩 중...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
