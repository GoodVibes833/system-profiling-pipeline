"use client";

import { useMemo } from "react";
import { places } from "@/data/places";
import PlaceCard from "@/components/PlaceCard";
import { useUserStore } from "@/hooks/useUserStore";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, hydrated } = useUserStore();

  const wishlistPlaces = useMemo(() => {
    return places.filter((p) => wishlist.includes(p.id));
  }, [wishlist]);

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
            <Heart size={24} className="text-red-500 fill-red-500" />
            가고싶다
          </h1>
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {wishlistPlaces.length}개
          </span>
        </div>

        {wishlistPlaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🤔</div>
            <p className="text-slate-500 text-lg font-semibold mb-2">아직 저장한 장소가 없어요</p>
            <p className="text-slate-400 text-sm mb-6">마음에 드는 장소를 지도에서 찾아 하트를 눌러보세요</p>
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
            {wishlistPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
