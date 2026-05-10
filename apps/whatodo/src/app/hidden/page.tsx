"use client";

import { useState, useMemo } from "react";
import { Search, X, MapPin } from "lucide-react";
import { places, cities, type City } from "@/data/places";
import PlaceCard from "@/components/PlaceCard";
import { cn } from "@/lib/utils";

const HIDDEN_TAGS = ["히든", "hidden", "숨은명소", "히든카페", "히든맛집", "히든바"];

function isHiddenPlace(tags: string[]) {
  return tags.some((t) => HIDDEN_TAGS.some((h) => t.includes(h)));
}

export default function HiddenPage() {
  const [selectedCity, setSelectedCity] = useState<City>("toronto");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const availableCities = cities.filter((c) => !c.comingSoon);

  const allHidden = useMemo(
    () => places.filter((p) => isHiddenPlace(p.tags)),
    []
  );

  const cityHidden = useMemo(
    () => allHidden.filter((p) => p.city === selectedCity),
    [allHidden, selectedCity]
  );

  const cats = useMemo(() => {
    const set = new Set(cityHidden.map((p) => p.category));
    return Array.from(set);
  }, [cityHidden]);

  const filtered = useMemo(() => {
    return cityHidden.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDesc.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.includes(search));
      const matchCat = !selectedCat || p.category === selectedCat;
      return matchSearch && matchCat;
    });
  }, [cityHidden, search, selectedCat]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div
        className="py-14 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3b0764, #6b21a8, #7c3aed)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 80%, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🕵️</span>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">히든 스팟 지도</h1>
              <p className="text-purple-200 text-sm mt-0.5">아는 사람만 아는 캐나다 숨은 명소</p>
            </div>
          </div>
          <p className="text-purple-100/80 text-sm max-w-lg leading-relaxed mb-6">
            Reddit, BlogTO, 네이버 블로그에서 현지인들이 추천한 진짜 히든 스팟만 모았어요.
            관광객은 모르는, 살아봐야 알 수 있는 곳들이에요. 🗺️
          </p>

          {/* Stats */}
          <div className="flex gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20">
              <span className="text-white font-black text-lg">{allHidden.length}</span>
              <span className="text-purple-200 text-xs ml-1.5">전체 히든 스팟</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/20">
              <span className="text-white font-black text-lg">{cityHidden.length}</span>
              <span className="text-purple-200 text-xs ml-1.5">이 도시</span>
            </div>
          </div>

          {/* City tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
            {availableCities.map((city) => (
              <button
                key={city.id}
                onClick={() => { setSelectedCity(city.id); setSelectedCat(null); }}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                  selectedCity === city.id
                    ? "bg-white text-purple-900 border-white"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                )}
              >
                <span>{city.emoji}</span>
                {city.label}
                <span className={cn("text-xs", selectedCity === city.id ? "text-purple-400" : "text-white/50")}>
                  {allHidden.filter((p) => p.city === city.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
            <Search size={18} className="text-white/60 shrink-0" />
            <input
              type="text"
              placeholder="히든 스팟 검색..."
              className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} className="text-white/60 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category filter */}
      {cats.length > 0 && (
        <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSelectedCat(null)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  !selectedCat
                    ? "text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                style={!selectedCat ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" } : {}}
              >
                전체 ({cityHidden.length})
              </button>
              {cats.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                  className={cn(
                    "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    selectedCat === cat
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                  style={selectedCat === cat ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" } : {}}
                >
                  {cat} ({cityHidden.filter((p) => p.category === cat).length})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {cityHidden.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-slate-500 text-lg font-semibold mb-2">이 도시의 히든 스팟을 모으는 중이에요</p>
            <p className="text-slate-400 text-sm">곧 업데이트될 예정이에요!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={15} className="text-purple-500" />
              <p className="text-slate-500 text-sm">
                <span className="font-black text-slate-900">{filtered.length}개</span>의 히든 스팟 발견
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
