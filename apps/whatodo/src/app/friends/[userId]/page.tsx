"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, PlaceVisit } from "@/lib/database.types";
import { ArrowLeft, MapPin, Star, EyeOff, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FriendProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [visits, setVisits] = useState<PlaceVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const myId = sessionData.session?.user?.id;

      const { data: profileData } = await (supabase.from("profiles") as any)
        .select("*")
        .eq("id", userId)
        .single();

      setProfile((profileData as unknown) as Profile);

      if (myId && profileData) {
        const { data: friendship } = await (supabase.from("friendships") as any)
          .select("*")
          .eq("status", "accepted")
          .or(`requester_id.eq.${myId},receiver_id.eq.${myId}`)
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
          .limit(1)
          .single();

        const friendConfirmed = !!friendship;
        setIsFriend(friendConfirmed);

        if (friendConfirmed && ((profileData as unknown) as Profile).show_visits_to_friends) {
          const { data: visitData } = await (supabase.from("place_visits") as any)
            .select("*")
            .eq("user_id", userId)
            .order("visited_at", { ascending: false });
          setVisits(((visitData as unknown) as PlaceVisit[]) ?? []);
        }
      }

      setLoading(false);
    };
    load();
  }, [userId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">불러오는 중...</div>;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="font-bold">사용자를 찾을 수 없어요</p>
        <Link href="/friends" className="text-[#e85d26] text-sm font-bold">← 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#0f2040] text-white pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/friends" className="flex items-center gap-2 text-slate-300 text-sm mb-4 hover:text-white transition-colors">
            <ArrowLeft size={16} /> 친구 목록
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{profile.avatar_emoji}</span>
            <div>
              <h1 className="text-2xl font-black">{profile.nickname}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-300">
                <span className="flex items-center gap-1"><MapPin size={12} /> {profile.visit_count}곳</span>
                <span className="flex items-center gap-1"><Star size={12} /> {profile.points.toLocaleString()}pt</span>
              </div>
            </div>
          </div>

          {/* Chat button */}
          {isFriend && (
            <div className="mt-4">
              <Link
                href={`/friends/chat/${userId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)" }}
              >
                <MessageCircle size={15} /> 메시지 보내기
              </Link>
            </div>
          )}

          {profile.badges.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {profile.badges.map((b) => (
                <span key={b} className="text-xs bg-white/15 text-white px-2.5 py-1 rounded-full font-bold">🏅 {b}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5">
        {!isFriend ? (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-center">
            <EyeOff size={32} className="text-amber-300 mx-auto mb-2" />
            <p className="font-black text-amber-700">친구가 아니에요</p>
            <p className="text-sm text-amber-500 mt-1">친구 관계에서만 방문 장소를 볼 수 있어요</p>
          </div>
        ) : !profile.show_visits_to_friends ? (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 text-center">
            <EyeOff size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="font-black text-slate-500">비공개 설정 중</p>
            <p className="text-sm text-slate-400 mt-1">이 친구는 방문 장소를 비공개로 설정했어요</p>
          </div>
        ) : (
          <div>
            <h2 className="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-[#e85d26]" />
              방문한 장소 ({visits.length}곳)
            </h2>
            {visits.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">아직 방문 기록이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {visits.map((v) => (
                  <Link
                    key={v.id}
                    href={`/place/${v.place_id}`}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-orange-200 transition-colors"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg">
                      📍
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm">{v.place_name}</p>
                      <p className="text-xs text-slate-400">{v.city} · {new Date(v.visited_at).toLocaleDateString("ko-KR")}</p>
                      {v.note && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">&ldquo;{v.note}&rdquo;</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
