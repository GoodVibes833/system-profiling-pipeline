"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";
import { Trophy, MapPin, Star, Crown, Medal, Users } from "lucide-react";
import Link from "next/link";

type RankTab = "points" | "visits" | "badges";

const DEMO_PROFILES: Profile[] = [
  { id: "1", nickname: "밴쿠버고수", avatar_emoji: "🦁", points: 2850, visit_count: 34, badges: ["탐험가", "미식가", "사진작가"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "2", nickname: "토론토러버", avatar_emoji: "🐻", points: 2400, visit_count: 28, badges: ["탐험가", "미식가"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "3", nickname: "오타와여행자", avatar_emoji: "🦊", points: 1900, visit_count: 22, badges: ["탐험가"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "4", nickname: "캘거리워홀러", avatar_emoji: "🐺", points: 1550, visit_count: 18, badges: ["탐험가", "후기왕"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "5", nickname: "빅토리아마니아", avatar_emoji: "🦋", points: 1200, visit_count: 14, badges: ["탐험가"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "6", nickname: "위니펙여행자", avatar_emoji: "🦬", points: 980, visit_count: 11, badges: ["미식가"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "7", nickname: "몬트리올러버", avatar_emoji: "🐱", points: 720, visit_count: 8, badges: [], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
  { id: "8", nickname: "에드먼턴탐험가", avatar_emoji: "🐨", points: 540, visit_count: 6, badges: ["탐험가"], visited_places: [], wishlist_places: [], show_visits_to_friends: true, created_at: "", updated_at: "", last_visit_at: null },
];

export default function RankingPage() {
  const [tab, setTab] = useState<RankTab>("points");
  const [profiles, setProfiles] = useState<Profile[]>(DEMO_PROFILES);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .order("points", { ascending: false })
          .limit(50);

        if (data && data.length > 0) {
          setProfiles(data as Profile[]);
          if (userId) {
            setMyProfile((data as Profile[]).find((p) => p.id === userId) ?? null);
          }
        }
      } catch {
        // Supabase 미설정 시 데모 데이터 유지
      }
      setLoading(false);
    };
    load();
  }, []);

  const sorted = [...profiles].sort((a, b) => {
    if (tab === "points") return b.points - a.points;
    if (tab === "visits") return b.visit_count - a.visit_count;
    return b.badges.length - a.badges.length;
  });

  const myRank = myProfile
    ? sorted.findIndex((p) => p.id === myProfile.id) + 1
    : null;

  const tabs: { key: RankTab; label: string; icon: React.ReactNode }[] = [
    { key: "points", label: "포인트", icon: <Star size={14} /> },
    { key: "visits", label: "방문 수", icon: <MapPin size={14} /> },
    { key: "badges", label: "뱃지 수", icon: <Medal size={14} /> },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={18} className="text-yellow-400 fill-yellow-400" />;
    if (rank === 2) return <Trophy size={18} className="text-slate-400 fill-slate-300" />;
    if (rank === 3) return <Trophy size={18} className="text-amber-600 fill-amber-500" />;
    return <span className="text-sm font-black text-slate-400 w-[18px] text-center">{rank}</span>;
  };

  const getValue = (p: Profile) => {
    if (tab === "points") return `${p.points.toLocaleString()}pt`;
    if (tab === "visits") return `${p.visit_count}곳`;
    return `${p.badges.length}개`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] text-white pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={28} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-2xl font-black">리더보드</h1>
          </div>
          <p className="text-slate-300 text-sm">실시간 캐나다가자 랭킹</p>

          {/* 내 순위 카드 */}
          {myProfile && myRank && (
            <div className="mt-5 bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{myProfile.avatar_emoji}</span>
              <div className="flex-1">
                <p className="font-black text-white">{myProfile.nickname}</p>
                <p className="text-xs text-slate-300">내 순위: {tab === "points" ? "포인트" : tab === "visits" ? "방문수" : "뱃지"} #{myRank}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-yellow-400 text-lg">{getValue(myProfile)}</p>
              </div>
            </div>
          )}

          {!myProfile && (
            <Link
              href="/profile"
              className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-2xl p-3 text-sm text-slate-200 transition-colors"
            >
              <Users size={16} />
              <span>로그인하면 내 순위를 볼 수 있어요</span>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-1">
        {/* 탭 */}
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-1 mb-4 mt-4 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? "bg-[#1e3a5f] text-white shadow"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* TOP 3 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {sorted.slice(0, 3).map((p, i) => {
            const rank = i + 1;
            const sizes = ["w-20 h-20", "w-16 h-16", "w-16 h-16"];
            const textSizes = ["text-3xl", "text-2xl", "text-2xl"];
            const orders = [1, 0, 2]; // 2위-1위-3위 순서
            return (
              <div
                key={p.id}
                style={{ order: orders[i] }}
                className={`flex flex-col items-center gap-1 ${rank === 1 ? "mt-0" : "mt-4"}`}
              >
                <div className={`${sizes[i]} rounded-full bg-white shadow-md border-2 ${rank === 1 ? "border-yellow-400" : rank === 2 ? "border-slate-300" : "border-amber-500"} flex items-center justify-center ${textSizes[i]}`}>
                  {p.avatar_emoji}
                </div>
                <div className="flex items-center gap-1">
                  {getRankIcon(rank)}
                </div>
                <p className="text-xs font-black text-slate-800 text-center leading-tight">{p.nickname}</p>
                <p className="text-xs font-bold text-[#e85d26]">{getValue(p)}</p>
              </div>
            );
          })}
        </div>

        {/* 4위 이하 리스트 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">불러오는 중...</div>
          ) : (
            sorted.slice(3).map((p, i) => {
              const rank = i + 4;
              const isMe = myProfile?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0 ${isMe ? "bg-orange-50" : ""}`}
                >
                  <span className="text-sm font-black text-slate-400 w-6 text-center">{rank}</span>
                  <span className="text-xl">{p.avatar_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isMe ? "text-[#e85d26]" : "text-slate-800"}`}>
                      {p.nickname} {isMe && <span className="text-xs">(나)</span>}
                    </p>
                    {p.badges.length > 0 && (
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {p.badges.slice(0, 2).map((b) => (
                          <span key={b} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{b}</span>
                        ))}
                        {p.badges.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{p.badges.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="font-black text-[#1e3a5f] text-sm">{getValue(p)}</p>
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          🔒 방문 인증은 장소당 1회, 어뷰징 감지 시 자동 제한됩니다
        </p>
      </div>
    </div>
  );
}
