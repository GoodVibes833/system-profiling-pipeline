"use client";

import { useState } from "react";
import { MapPin, Star, Heart, CheckCircle2, Clock, Globe, DollarSign, Lightbulb, CalendarDays, ExternalLink, ChevronDown } from "lucide-react";
import { Place, categories } from "@/data/places";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/hooks/useUserStore";

interface PlaceCardProps {
  place: Place;
  className?: string;
}

const priceLabels = ["무료", "$", "$$", "$$$"];

export default function PlaceCard({ place, className }: PlaceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryInfo = categories.find((c) => c.id === place.category);
  const { wishlist, visited, toggleWishlist, toggleVisited, hydrated } = useUserStore();

  const isWished = hydrated && wishlist.includes(place.id);
  const isVisited = hydrated && visited.includes(place.id);
  const isHidden = place.tags.some((t) => t.includes("히든") || t.includes("hidden"));

  return (
    <div className={cn("block group relative", className)}>
      {/* Action buttons — outside Link to prevent nested <a> */}
      <div className="absolute top-3 right-3 z-20 flex gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); toggleVisited(place.id); }}
          title={isVisited ? "방문 취소" : "다녀왔다"}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all",
            isVisited ? "bg-green-500 text-white" : "bg-white/90 text-slate-400 hover:text-green-500"
          )}
        >
          <CheckCircle2 size={15} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(place.id); }}
          title={isWished ? "위시리스트 제거" : "가고싶다"}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all",
            isWished ? "bg-red-500 text-white" : "bg-white/90 text-slate-400 hover:text-red-500"
          )}
        >
          <Heart size={15} />
        </button>
      </div>

      <div
        onClick={() => setExpanded(!expanded)}
        className={cn(
        "rounded-2xl overflow-hidden bg-white shadow-sm border cursor-pointer transition-all",
        isVisited ? "border-green-200" : "border-slate-100",
        expanded ? "ring-2 ring-orange-200" : "card-hover"
      )}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {isHidden && !isVisited && (
            <div className="absolute top-3 left-3">
              <span className="tag-pill text-white text-xs"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                🕵️ 히든
              </span>
            </div>
          )}

          {!isHidden && place.featured && !isVisited && (
            <div className="absolute top-3 left-3">
              <span className="tag-pill text-white text-xs"
                style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
                ✨ 추천
              </span>
            </div>
          )}

          {isVisited && (
            <div className="absolute top-3 left-3">
              <span className="tag-pill text-white text-xs bg-green-500">
                ✓ 다녀왔어요
              </span>
            </div>
          )}

          <div className="absolute top-3 right-12">
            <span className={cn("tag-pill", categoryInfo?.color ?? "bg-gray-100 text-gray-700")}>
              {categoryInfo?.emoji} {place.category}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            <Star size={13} className="text-yellow-400 fill-yellow-400" />
            <span className="text-white text-xs font-semibold">{place.rating}</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
              {place.name}
            </h3>
            <span className="text-sm font-semibold text-slate-400 shrink-0">
              {priceLabels[place.priceLevel]}
            </span>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <MapPin size={12} className="text-slate-400" />
            <span className="text-xs text-slate-400">{place.neighborhood}</span>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {place.shortDesc}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-wrap gap-1">
              {place.isFree && (
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                  🆓 무료
                </span>
              )}
              {place.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            {place.recommendScore && (
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: place.recommendScore }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xs">★</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center justify-center mt-2 text-slate-400"><ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} /></div>
        </div>
        {expanded && <div className="px-4 pb-5 border-t border-slate-100 pt-4"><p className="text-sm text-slate-500">{place.description}</p></div>}
      </div>
    </div>
  );
}
