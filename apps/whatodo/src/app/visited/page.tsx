"use client";

import { useMemo } from "react";
import { places } from "@/data/places";
import PlaceCard from "@/components/PlaceCard";
import { useUserStore } from "@/hooks/useUserStore";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VisitedPage() {
  const { visited, points, completedMissions, earnedBadges, hydrated } = useUserStore();

  const visitedPlaces = useMemo(() => {
    return places.filter((p) => visited.includes(p.id));
  }, [visited]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        로딩 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-xl hover:bg-slate-200 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={24} className="text-green-500" />
            다녀왔어요
          </h1>
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {visitedPlaces.length}개
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">방문 장소</p>
            <p className="text-2xl font-black text-slate-900">{visitedPlaces.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">포인트</p>
            <p className="text-2xl font-black text-orange-500">{points}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">획득 배지</p>
            <p className="text-2xl font-black text-purple-500">{earnedBadges.length}</p>
          </div>
        </div>

        {visitedPlaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-slate-500 text-lg font-semibold mb-2">아직 방문한 장소가 없어요</p>
            <p className="text-slate-400 text-sm mb-6">지도에서 장소를 찾아 체크인 해보세요</p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}
            >
              장소 탐색하러 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visitedPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
