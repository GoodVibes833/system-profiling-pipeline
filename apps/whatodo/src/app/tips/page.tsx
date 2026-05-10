"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { tips } from "@/data/places";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  교통: "bg-blue-100 text-blue-700",
  생활: "bg-green-100 text-green-700",
  알바: "bg-purple-100 text-purple-700",
  음식: "bg-orange-100 text-orange-700",
  날씨: "bg-cyan-100 text-cyan-700",
  비용: "bg-yellow-100 text-yellow-700",
};

const categoryEmoji: Record<string, string> = {
  전체: "📋",
  교통: "🚇",
  생활: "🏠",
  알바: "💼",
  음식: "🛒",
  날씨: "🧊",
  비용: "💰",
};

const allCategories = ["전체", "생활", "알바", "비용", "교통", "음식", "날씨"] as const;
type TipCategory = (typeof allCategories)[number];

export default function TipsPage() {
  const [selectedCat, setSelectedCat] = useState<TipCategory>("전체");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tips.filter((tip) => {
      const matchCat = selectedCat === "전체" || tip.category === selectedCat;
      const matchSearch =
        !search ||
        tip.title.includes(search) ||
        tip.content.includes(search) ||
        tip.category.includes(search);
      return matchCat && matchSearch;
    });
  }, [selectedCat, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className="py-12 px-4"
        style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">💡</div>
          <h1 className="text-3xl font-black text-white mb-2">워홀러 생존 꿀팁</h1>
          <p className="text-blue-200 text-sm leading-relaxed mb-6">
            은행 계좌부터 SIN 번호, 자취방, 알바까지
            <br />토론토 워홀 첫 달 생존 가이드
          </p>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 max-w-md mx-auto">
            <Search size={16} className="text-white/60 shrink-0" />
            <input
              type="text"
              placeholder="꿀팁 검색..."
              className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-white/60 hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {allCategories.map((cat) => {
              const count = cat === "전체" ? tips.length : tips.filter((t) => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    selectedCat === cat
                      ? "text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                  style={selectedCat === cat ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
                >
                  <span>{categoryEmoji[cat]}</span>
                  {cat}
                  <span className={cn("text-xs", selectedCat === cat ? "text-white/70" : "text-slate-400")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-slate-500 text-sm mb-5">
          <span className="font-black text-slate-900">{filtered.length}개</span>의 꿀팁
          {search && <span className="ml-2 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">"{search}" 검색 결과</span>}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-500 font-semibold mb-1">검색 결과가 없어요</p>
            <p className="text-slate-400 text-sm">다른 키워드로 검색해보세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filtered.map((tip, i) => (
              <div
                key={tip.id}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl shrink-0 mt-0.5">{tip.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-full",
                          categoryColors[tip.category] ?? "bg-slate-100 text-slate-600"
                        )}
                      >
                        {tip.category}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">#{i + 1}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-lg mb-2 leading-tight">
                      {tip.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{tip.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div
          className="mt-10 rounded-3xl p-8 text-white text-center"
          style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}
        >
          <div className="text-3xl mb-3">🍁</div>
          <h3 className="font-black text-xl mb-2">더 궁금한 점 있으세요?</h3>
          <p className="text-white/80 text-sm">
            지속적으로 꿀팁을 업데이트하고 있어요. 토론토에서 즐거운 시간 보내세요!
          </p>
        </div>
      </div>
    </div>
  );
}
