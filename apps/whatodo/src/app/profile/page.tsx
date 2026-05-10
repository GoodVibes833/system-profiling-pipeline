"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, CheckCircle2, Star, MapPin, Trophy, Edit2, Check, Download, Upload, Trash2, RefreshCw } from "lucide-react";
import { places, type Place } from "@/data/places";
import { badges } from "@/data/missions";
import { useUserStore } from "@/hooks/useUserStore";
import { cn } from "@/lib/utils";

type Tab = "wishlist" | "visited" | "badges";

export default function ProfilePage() {
  const { wishlist, visited, earnedBadges, points, completedMissions, nickname, setNickname, hydrated } = useUserStore();
  const [tab, setTab] = useState<Tab>("visited");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(nickname);

  const wishlistPlaces = places.filter((p) => wishlist.includes(p.id));
  const visitedPlaces = places.filter((p) => visited.includes(p.id));
  const myBadges = badges.filter((b) => earnedBadges.includes(b.id));

  const saveName = () => {
    if (nameInput.trim()) setNickname(nameInput.trim());
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Header */}
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
              {hydrated && nickname
                ? (nickname.length <= 2 ? nickname[0] : nickname.split(" ")[0])
                : "?"}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveName()}
                    className="bg-white/20 text-white placeholder:text-white/50 rounded-xl px-3 py-1.5 text-sm outline-none border border-white/30 w-40"
                    placeholder="닉네임 입력"
                  />
                  <button onClick={saveName} className="text-white">
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-xl">
                    {hydrated && nickname ? nickname : "닉네임 설정해요"}
                  </span>
                  <button onClick={() => { setNameInput(nickname); setEditingName(true); }}>
                    <Edit2 size={14} className="text-white/60 hover:text-white" />
                  </button>
                </div>
              )}
              <div className="text-blue-200 text-sm mt-0.5">캐나다가자 멤버</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: "포인트", value: hydrated ? points : "-", icon: "⭐" },
              { label: "방문", value: hydrated ? visited.length : "-", icon: "✅" },
              { label: "위시", value: hydrated ? wishlist.length : "-", icon: "❤️" },
              { label: "미션", value: hydrated ? completedMissions.length : "-", icon: "🏆" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl py-3">
                <div className="text-lg">{s.icon}</div>
                <div className="text-white font-black text-lg leading-none mt-0.5">{s.value}</div>
                <div className="text-blue-200 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 py-2">
          {([
            { id: "visited", label: `✅ 다녀왔다 (${hydrated ? visitedPlaces.length : 0})` },
            { id: "wishlist", label: `❤️ 가고싶다 (${hydrated ? wishlistPlaces.length : 0})` },
            { id: "badges", label: `🏅 뱃지 (${hydrated ? myBadges.length : 0})` },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                tab === t.id ? "text-white" : "text-slate-500 hover:bg-slate-50"
              )}
              style={tab === t.id ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!hydrated ? (
          <div className="text-center py-16 text-slate-400">로딩 중...</div>
        ) : (
          <>
            {tab === "visited" && (
              visitedPlaces.length === 0 ? (
                <EmptyState emoji="✅" title="아직 방문한 곳이 없어요" sub="장소 카드의 ✅ 버튼을 눌러 방문을 기록해요" />
              ) : (
                <div className="flex flex-col gap-3">
                  {visitedPlaces.map((p) => <PlaceRow key={p.id} place={p} type="visited" />)}
                </div>
              )
            )}
            {tab === "wishlist" && (
              wishlistPlaces.length === 0 ? (
                <EmptyState emoji="❤️" title="위시리스트가 비어있어요" sub="장소 카드의 ❤️ 버튼을 눌러 담아두세요" />
              ) : (
                <div className="flex flex-col gap-3">
                  {wishlistPlaces.map((p) => <PlaceRow key={p.id} place={p} type="wishlist" />)}
                </div>
              )
            )}
            {tab === "badges" && (
              myBadges.length === 0 ? (
                <EmptyState emoji="🏅" title="아직 획득한 뱃지가 없어요" sub="미션을 완료하면 뱃지를 받아요!" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {myBadges.map((badge) => (
                    <div key={badge.id} className={cn("rounded-2xl p-5 text-center border-transparent shadow-sm", badge.color)}>
                      <div className="text-4xl mb-2">{badge.emoji}</div>
                      <div className="font-black text-sm mb-1">{badge.name}</div>
                      <div className="text-xs opacity-70">{badge.description}</div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/missions"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
            <Trophy size={15} />
            미션 보러가기
          </Link>
        </div>

        {/* 데이터 관리 섹션 */}
        {hydrated && <DataManagement />}
      </div>
    </div>
  );
}

function PlaceRow({ place, type }: { place: Place; type: "visited" | "wishlist" }) {
  return (
    <Link href={`/place/${place.id}`}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3 items-center card-hover">
      <img src={place.image} alt={place.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-slate-900 text-sm">{place.name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-slate-500">{place.rating}</span>
          <span className="text-xs text-slate-300">·</span>
          <MapPin size={10} className="text-slate-400" />
          <span className="text-xs text-slate-400">{place.neighborhood}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{place.shortDesc}</p>
      </div>
      {type === "visited"
        ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
        : <Heart size={18} className="text-red-400 fill-red-400 shrink-0" />
      }
    </Link>
  );
}

function EmptyState({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="font-bold text-slate-600 mb-1">{title}</p>
      <p className="text-sm text-slate-400">{sub}</p>
    </div>
  );
}

function DataManagement() {
  const [msg, setMsg] = useState<string | null>(null);

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 3000);
  };

  const handleExport = () => {
    try {
      const data = localStorage.getItem("cangaza_user");
      if (!data) { showMsg("저장된 데이터가 없어요"); return; }
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cangaza_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showMsg("✅ 데이터가 다운로드됐어요!");
    } catch {
      showMsg("❌ 내보내기 실패");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (typeof parsed !== "object" || !parsed.nickname) throw new Error();
        localStorage.setItem("cangaza_user", JSON.stringify(parsed));
        showMsg("✅ 데이터를 불러왔어요! 새로고침 하세요.");
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        showMsg("❌ 올바른 파일이 아니에요");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (!confirm("정말 모든 데이터(방문 기록, 위시리스트, 후기)를 초기화할까요?")) return;
    localStorage.removeItem("cangaza_user");
    sessionStorage.removeItem("onboarding_dismissed");
    showMsg("🗑️ 초기화 완료. 새로고침 후 온보딩이 다시 표시돼요.");
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleReOnboard = () => {
    sessionStorage.removeItem("onboarding_dismissed");
    window.location.reload();
  };

  return (
    <div className="mt-8 border border-slate-200 rounded-2xl p-4 bg-white">
      <h3 className="font-black text-slate-800 text-sm mb-1">데이터 관리</h3>
      <p className="text-xs text-slate-400 mb-4">방문 기록·위시리스트는 이 기기에 저장돼요. 기기 변경 시 백업을 사용하세요.</p>

      {msg && (
        <div className="mb-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold">{msg}</div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-2">
        <button onClick={handleExport}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
          <Download size={13} /> 데이터 내보내기
        </button>
        <label className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer">
          <Upload size={13} /> 데이터 가져오기
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleReOnboard}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
          <RefreshCw size={13} /> 온보딩 다시보기
        </button>
        <button onClick={handleReset}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
          <Trash2 size={13} /> 데이터 초기화
        </button>
      </div>
    </div>
  );
}
