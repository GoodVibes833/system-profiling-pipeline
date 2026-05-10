"use client";

import { useState, useMemo } from "react";
import { MapPin, Star, X } from "lucide-react";
import { places, categories, type Place } from "@/data/places";
import { cn } from "@/lib/utils";

export default function MapPage() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = selectedCategory
    ? places.filter((p) => p.category === selectedCategory)
    : places;

  const priceLabels = ["무료", "$", "$$", "$$$"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="py-10 px-4"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-1">🗺️ 지도로 보기</h1>
          <p className="text-blue-200 text-sm">
            동네별로 토론토 장소들을 한눈에 확인해요
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                !selectedCategory ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
              style={!selectedCategory ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  selectedCategory === cat.id ? "text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
                style={selectedCategory === cat.id ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Map placeholder + real interactive map note */}
        <div className="mb-8 rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100">
          <div
            className="relative h-80 flex items-center justify-center overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #e8f4f8 0%, #dbeafe 50%, #e0f2fe 100%)",
            }}
          >
            {/* Toronto simplified map visual */}
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, #94a3b8 0px, transparent 1px, transparent 40px, #94a3b8 41px),
                  repeating-linear-gradient(90deg, #94a3b8 0px, transparent 1px, transparent 40px, #94a3b8 41px)
                `,
              }}
            />
            {/* Place dots */}
            {filtered.map((place) => {
              const x = ((place.lng - (-79.55)) / ((-79.2) - (-79.55))) * 100;
              const y = ((place.lat - 43.58) / (43.72 - 43.58)) * 100;
              const catInfo = categories.find((c) => c.id === place.category);
              return (
                <button
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className="absolute w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-black shadow-lg hover:scale-125 transition-transform z-10"
                  style={{
                    left: `${Math.max(5, Math.min(90, x))}%`,
                    bottom: `${Math.max(5, Math.min(90, y))}%`,
                    background:
                      selectedPlace?.id === place.id
                        ? "#e85d26"
                        : "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
                    boxShadow:
                      selectedPlace?.id === place.id
                        ? "0 0 0 3px rgba(232,93,38,0.4)"
                        : undefined,
                  }}
                  title={place.name}
                >
                  {catInfo?.emoji ?? "📍"}
                </button>
              );
            })}

            {/* Ontario Lake label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-medium">
              온타리오 호수 ↓
            </div>
            {/* Toronto label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-bold bg-white/80 px-3 py-1 rounded-full">
              🍁 토론토 다운타운
            </div>
          </div>

          <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-center gap-3">
            <span className="text-xl">ℹ️</span>
            <p className="text-sm text-amber-700">
              핀을 클릭하면 장소 정보를 볼 수 있어요. 실제 위치 기반 인터랙티브 지도예요.
            </p>
          </div>
        </div>

        {/* Selected Place Card */}
        {selectedPlace && (
          <div className="mb-8 bg-white rounded-2xl p-5 border border-slate-100 shadow-lg flex gap-4 items-start">
            <img
              src={selectedPlace.image}
              alt={selectedPlace.name}
              className="w-24 h-24 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-slate-900 text-lg">{selectedPlace.name}</h3>
                <button onClick={() => setSelectedPlace(null)} className="shrink-0 p-1 hover:bg-slate-100 rounded-lg">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="flex items-center gap-2 my-1">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-slate-600">{selectedPlace.rating}</span>
                <span className="text-xs text-slate-400">• {selectedPlace.neighborhood}</span>
                <span className="text-xs text-slate-400">• {priceLabels[selectedPlace.priceLevel]}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
                {selectedPlace.shortDesc}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{selectedPlace.description}</p>
              {selectedPlace.tips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-black text-amber-700 mb-1">💡 꿀팁</p>
                  <ul className="flex flex-col gap-1">{selectedPlace.tips.map((t,i)=>(<li key={i} className="text-xs text-slate-500">• {t}</li>))}</ul>
                </div>
              )}
              <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedPlace.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-orange-600 hover:underline">🗺️ 구글 지도에서 보기 →</a>
            </div>
          </div>
        )}

        {/* List View */}
        <h2 className="text-xl font-black text-slate-900 mb-4">
          📍 {selectedCategory ?? "전체"} 장소 목록
          <span className="text-base font-normal text-slate-400 ml-2">({filtered.length}개)</span>
        </h2>

        <div className="flex flex-col gap-3">
          {filtered.map((place) => {
            const catInfo = categories.find((c) => c.id === place.category);
            return (
              <button
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className={cn(
                  "text-left bg-white rounded-2xl p-4 border transition-all flex items-center gap-4 hover:shadow-md",
                  selectedPlace?.id === place.id
                    ? "border-orange-300 shadow-md"
                    : "border-slate-100"
                )}
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm">{catInfo?.emoji}</span>
                    <span className="font-bold text-slate-900 text-sm">{place.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={11} className="text-slate-400" />
                    <span className="text-xs text-slate-400">{place.neighborhood}</span>
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-slate-500 font-semibold">{place.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{place.shortDesc}</p>
                </div>
                <span className="text-xs text-slate-300 font-semibold shrink-0">
                  {priceLabels[place.priceLevel]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
