"use client";

import { useEffect, useState } from "react";
import { X, CalendarDays, Send, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

interface InviteModalProps {
  placeId: string;
  placeName: string;
  onClose: () => void;
}

function buildGcalUrl(title: string, date: string, location: string) {
  const d = date.replace(/-/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`[캐나다가자] ${title} 방문`)}&dates=${d}/${d}&details=${encodeURIComponent(`캐나다가자 앱에서 초대한 장소: ${location}`)}&location=${encodeURIComponent(location)}`;
}

export default function InviteModal({ placeId, placeName, onClose }: InviteModalProps) {
  const [myId, setMyId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
  const [proposedDate, setProposedDate] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) { setLoading(false); return; }
      setMyId(userId);

      const { data: rawFriendships } = await (supabase.from("friendships") as any)
        .select("*")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

      const friendIds = ((rawFriendships ?? []) as any[]).map((f: any) =>
        f.requester_id === userId ? f.receiver_id : f.requester_id
      );

      if (friendIds.length > 0) {
        const { data: profiles } = await (supabase.from("profiles") as any)
          .select("*")
          .in("id", friendIds);
        setFriends(((profiles ?? []) as unknown) as Profile[]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSend = async () => {
    if (!myId || !selectedFriend || !proposedDate) return;
    setSending(true);
    await (supabase.from("invites") as any).insert({
      inviter_id: myId,
      invitee_id: selectedFriend.id,
      place_id: placeId,
      place_name: placeName,
      proposed_date: proposedDate,
      message: message.trim() || null,
    });
    setSent(true);
    setSending(false);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-black text-slate-900 text-lg">친구 초대</h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[240px]">{placeName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={24} className="text-green-500" />
            </div>
            <p className="font-black text-slate-800">초대를 보냈어요!</p>
            <p className="text-sm text-slate-400 text-center">
              {selectedFriend?.nickname}님이 수락하면 알림이 와요
            </p>
            {proposedDate && (
              <a
                href={buildGcalUrl(placeName, proposedDate, placeName)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
              >
                <CalendarDays size={15} /> 구글 캘린더에 추가
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              닫기
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !myId ? (
          <p className="text-center text-slate-400 text-sm py-8">로그인이 필요해요</p>
        ) : friends.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">초대할 친구가 없어요. 친구를 먼저 추가해보세요!</p>
        ) : (
          <div className="space-y-4">
            {/* 친구 선택 */}
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">함께할 친구</p>
              <div className="flex flex-wrap gap-2">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFriend(selectedFriend?.id === f.id ? null : f)}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl text-sm font-bold border-2 transition-all"
                    style={selectedFriend?.id === f.id
                      ? { borderColor: "#e85d26", background: "rgba(232,93,38,0.08)", color: "#e85d26" }
                      : { borderColor: "#e2e8f0", background: "white", color: "#64748b" }}
                  >
                    <span>{f.avatar_emoji}</span>
                    {f.nickname}
                  </button>
                ))}
              </div>
            </div>

            {/* 날짜 선택 */}
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">날짜 제안</p>
              <input
                type="date"
                min={todayStr}
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:border-[#e85d26] transition-colors"
              />
            </div>

            {/* 메시지 */}
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">메시지 (선택)</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="같이 가자! 여기 진짜 맛있어 😋"
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#e85d26] transition-colors resize-none"
              />
            </div>

            {/* 전송 버튼 */}
            <button
              onClick={handleSend}
              disabled={!selectedFriend || !proposedDate || sending}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)" }}
            >
              <Send size={15} />
              {sending ? "전송 중..." : "초대 보내기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
