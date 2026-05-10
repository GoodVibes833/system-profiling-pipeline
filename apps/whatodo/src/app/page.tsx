"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">지도 불러오는 중...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="fixed inset-0 top-16">
      <MapView />
    </div>
  );
}
