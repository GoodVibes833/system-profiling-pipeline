"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { places as allPlaces, categories, type Place } from "@/data/places";
import { useGeolocation } from "@/hooks/useGeolocation";
import { X, MapPin, Star, Globe, ExternalLink, Navigation, SlidersHorizontal, List, Map, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

const categoryIcons: Record<string, string> = {
  "맛집": "🍽️", "관광": "🏛️", "액티비티": "🎯", "쇼핑": "🛍️",
  "자연": "🌿", "야경": "🌃", "카페": "☕", "스포츠": "⚽",
};

const priceLabels = ["무료", "$", "$$", "$$$"];
const DEFAULT_CENTER: [number, number] = [43.6532, -79.3832]; // 토론토 기본값

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function createMarkerIcon(emoji: string, checked = false) {
  const border = checked ? "#22c55e" : "#e85d26";
  const bg = checked ? "#f0fdf4" : "white";
  return L.divIcon({
    html: `<div style="width:36px;height:36px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2.5px solid ${border};cursor:pointer;">${emoji}</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const { lat: userLat, lng: userLng, loading: geoLoading } = useGeolocation();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [checkedIn, setCheckedIn] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try { return new Set(JSON.parse(localStorage.getItem("checkedIn") || "[]")); } catch { return new Set(); }
  });

  const center: [number, number] = userLat && userLng ? [userLat, userLng] : DEFAULT_CENTER;

  const filtered = useMemo(() => {
    const base = allPlaces.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false;
      if (selectedPrice !== null && p.priceLevel !== selectedPrice) return false;
      return true;
    });
    if (userLat && userLng) {
      return base
        .map((p) => ({ ...p, _dist: calcDistance(userLat, userLng, p.lat, p.lng) }))
        .sort((a, b) => a._dist - b._dist);
    }
    return base.map((p) => ({ ...p, _dist: undefined as number | undefined }));
  }, [selectedCategory, selectedPrice, userLat, userLng]);

  const toggleCheckIn = useCallback((id: string) => {
    setCheckedIn((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("checkedIn", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const flyToPlace = useCallback((place: Place) => {
    if (mapRef.current) {
      mapRef.current.flyTo([place.lat, place.lng], 16, { duration: 0.8 });
      setSelectedPlace(place);
    }
  }, []);

  const flyToUser = useCallback(() => {
    if (mapRef.current && userLat && userLng) {
      mapRef.current.flyTo([userLat, userLng], 15, { duration: 0.8 });
    }
  }, [userLat, userLng]);

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center, zoom: 13, zoomControl: false, attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Fly to user when location arrives
  useEffect(() => {
    if (mapRef.current && userLat && userLng) {
      mapRef.current.setView([userLat, userLng], 14);
    }
  }, [userLat, userLng]);

  // User marker
  useEffect(() => {
    if (!mapRef.current) return;
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    if (userLat && userLng) {
      const icon = L.divIcon({
        html: '<div style="width:20px;height:20px;background:#4285F4;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
        className: "", iconSize: [20, 20], iconAnchor: [10, 10],
      });
      userMarkerRef.current = L.marker([userLat, userLng], { icon }).addTo(mapRef.current).bindPopup("<b>📍 현재 위치</b>");
    }
  }, [userLat, userLng]);

  // Place markers
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    filtered.forEach((place) => {
      const cat = categories.find((c) => c.id === place.category);
      const icon = createMarkerIcon(cat?.emoji ?? "📍", checkedIn.has(place.id));
      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(mapRef.current!)
        .on("click", () => setSelectedPlace(place));
      marker.bindTooltip(place.name, { offset: [0, -20], direction: "top" });
      markersRef.current.push(marker);
    });
  }, [filtered, checkedIn]);

  return (
    <div className="relative w-full h-full flex flex-col">

      {/* ── Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md shadow-sm">

        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {geoLoading ? "📡 위치 찾는 중..." : userLat ? `📍 내 주변 ${filtered.length}곳` : "📍 토론토 기준"}
            </p>
            <h2 className="font-black text-slate-900 text-base leading-tight">
              {selectedCategory
                ? `${categoryIcons[selectedCategory]} ${selectedCategory} 모아보기`
                : "🤔 오늘 뭐하지?"}
            </h2>
          </div>
          {/* 지도/리스트 토글 */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("map")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={viewMode === "map" ? { background: "linear-gradient(135deg,#e85d26,#f5a623)", color: "white" } : { color: "#64748b" }}
            >
              <Map size={13} /> 지도
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={viewMode === "list" ? { background: "linear-gradient(135deg,#e85d26,#f5a623)", color: "white" } : { color: "#64748b" }}
            >
              <List size={13} /> 목록
            </button>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex items-center gap-2 px-3 pb-2.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600"
          >
            <SlidersHorizontal size={12} /> 필터
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={selectedCategory === cat.id
                ? { background: "linear-gradient(135deg,#e85d26,#f5a623)", color: "white" }
                : { background: "#f1f5f9", color: "#64748b" }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Expanded price filter */}
        {showFilters && (
          <div className="px-3 pb-3 flex gap-2 border-t border-slate-100 pt-2">
            {priceLabels.map((label, i) => (
              <button
                key={i}
                onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                className="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={selectedPrice === i ? { background: "#1e3a5f", color: "white" } : { background: "#f1f5f9", color: "#64748b" }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Map view ── */}
      {viewMode === "map" && (
        <>
          <div ref={mapContainerRef} className="absolute inset-0 z-0" />

          {/* My location button */}
          <div className="absolute bottom-6 right-4 z-10">
            {!geoLoading && userLat && (
              <button
                onClick={flyToUser}
                className="w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center border border-slate-200"
              >
                <Navigation size={18} style={{ color: "#4285F4" }} />
              </button>
            )}
          </div>

          {/* Bottom sheet: selected place */}
          {selectedPlace && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl p-5 pb-safe-or-8 max-h-[55vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xl">{categoryIcons[selectedPlace.category] ?? "📍"}</span>
                    <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{selectedPlace.name}</h3>
                    {checkedIn.has(selectedPlace.id) && (
                      <span className="shrink-0 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ 갔었음</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-slate-600">{selectedPlace.rating}</span>
                    <span>·</span>
                    <span>{priceLabels[selectedPlace.priceLevel]}</span>
                    <span>·</span>
                    <span>{selectedPlace.neighborhood}</span>
                    {(selectedPlace as Place & { _dist?: number })._dist !== undefined && (
                      <><span>·</span><span className="text-orange-500 font-bold">{formatDist((selectedPlace as Place & { _dist?: number })._dist!)}</span></>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedPlace(null)} className="shrink-0 p-1.5 rounded-xl bg-slate-100">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {selectedPlace.image && (
                <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-36 object-cover rounded-2xl mb-3" />
              )}
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{selectedPlace.shortDesc}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => toggleCheckIn(selectedPlace.id)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all"
                  style={checkedIn.has(selectedPlace.id)
                    ? { background: "#f0fdf4", color: "#16a34a", border: "1.5px solid #86efac" }
                    : { background: "#f1f5f9", color: "#64748b" }}
                >
                  {checkedIn.has(selectedPlace.id) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {checkedIn.has(selectedPlace.id) ? "갔었음 ✓" : "갔었음"}
                </button>
                <Link
                  href={`/place/${selectedPlace.id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)" }}
                >
                  <MapPin size={14} /> 자세히
                </Link>
                {selectedPlace.officialWebsite && (
                  <a href={selectedPlace.officialWebsite} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-700">
                    <Globe size={14} /> 공식
                  </a>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(selectedPlace.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-700"
                >
                  <ExternalLink size={14} /> Maps
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── List view ── */}
      {viewMode === "list" && (
        <div className="absolute inset-0 overflow-y-auto bg-slate-50" style={{ paddingTop: showFilters ? "150px" : "120px" }}>
          <div className="px-4 pb-8 flex flex-col gap-3">
            {filtered.map((place) => {
              const dist = (place as Place & { _dist?: number })._dist;
              const isChecked = checkedIn.has(place.id);
              return (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex gap-0"
                  style={isChecked ? { borderColor: "#86efac" } : {}}
                >
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-24 h-24 object-cover shrink-0"
                    onClick={() => { setViewMode("map"); flyToPlace(place); }}
                  />
                  <div className="flex-1 p-3 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-sm">{categoryIcons[place.category] ?? "📍"}</span>
                          <h3 className="font-black text-slate-900 text-sm leading-tight truncate">{place.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 flex-wrap">
                          <Star size={10} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-slate-600">{place.rating}</span>
                          <span>·</span>
                          <span>{priceLabels[place.priceLevel]}</span>
                          {dist !== undefined && (
                            <><span>·</span><span className="text-orange-500 font-bold">{formatDist(dist)}</span></>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{place.shortDesc}</p>
                      </div>
                      <button
                        onClick={() => toggleCheckIn(place.id)}
                        className="shrink-0 mt-0.5"
                        title="갔었음"
                      >
                        {isChecked
                          ? <CheckCircle2 size={22} className="text-green-500" />
                          : <Circle size={22} className="text-slate-300" />}
                      </button>
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <Link
                        href={`/place/${place.id}`}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg text-white"
                        style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)" }}
                      >
                        자세히
                      </Link>
                      <button
                        onClick={() => { setViewMode("map"); flyToPlace(place); }}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600"
                      >
                        지도에서 보기
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}