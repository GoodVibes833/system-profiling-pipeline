"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Friendship, FriendshipRow } from "@/lib/database.types";
import { Users, Search, UserPlus, Check, X, MapPin, Eye, EyeOff, ChevronRight, MessageCircle, CalendarCheck } from "lucide-react";
import Link from "next/link";

type FriendTab = "friends" | "requests" | "search" | "messages" | "invites";

interface FriendWithProfile extends Friendship {
  friend: Profile;
}

export default function FriendsPage() {
  const [tab, setTab] = useState<FriendTab>("friends");
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingReceived, setPendingReceived] = useState<FriendWithProfile[]>([]);
  const [pendingSent, setPendingSent] = useState<FriendWithProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [receivedInvites, setReceivedInvites] = useState<any[]>([]);
  const [inviteActionLoading, setInviteActionLoading] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) { setLoading(false); return; }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setMyProfile((profile as unknown) as Profile);

    const { data: rawFriendships } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    const friendships = ((rawFriendships ?? []) as unknown) as FriendshipRow[];
    if (friendships.length === 0) { setLoading(false); return; }

    const friendIds = friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.requester_id === userId ? f.receiver_id : f.requester_id));

    const receivedIds = friendships
      .filter((f) => f.status === "pending" && f.receiver_id === userId)
      .map((f) => f.requester_id);

    const sentIds = friendships
      .filter((f) => f.status === "pending" && f.requester_id === userId)
      .map((f) => f.receiver_id);

    const allIds = [...new Set([...friendIds, ...receivedIds, ...sentIds])];
    if (allIds.length === 0) { setLoading(false); return; }

    const { data: rawProfiles } = await supabase.from("profiles").select("*").in("id", allIds);
    const profileMap = Object.fromEntries(
      (((rawProfiles ?? []) as unknown) as Profile[]).map((p) => [p.id, p])
    );

    setFriends(
      friendships
        .filter((f) => f.status === "accepted")
        .map((f) => ({
          ...f,
          friend: profileMap[f.requester_id === userId ? f.receiver_id : f.requester_id],
        }))
        .filter((f) => f.friend) as FriendWithProfile[]
    );

    setPendingReceived(
      friendships
        .filter((f) => f.status === "pending" && f.receiver_id === userId)
        .map((f) => ({ ...f, friend: profileMap[f.requester_id] }))
        .filter((f) => f.friend) as FriendWithProfile[]
    );

    setPendingSent(
      friendships
        .filter((f) => f.status === "pending" && f.requester_id === userId)
        .map((f) => ({ ...f, friend: profileMap[f.receiver_id] }))
        .filter((f) => f.friend) as FriendWithProfile[]
    );

    // 받은 초대 로드
    const { data: inviteData } = await (supabase.from("invites") as any)
      .select("*")
      .eq("invitee_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setReceivedInvites((inviteData as any[]) ?? []);

    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !myProfile) return;
    setSearching(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("nickname", `%${searchQuery.trim()}%`)
      .neq("id", myProfile.id)
      .limit(10);
    setSearchResults((data as Profile[]) ?? []);
    setSearching(false);
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!myProfile) return;
    setActionLoading(targetId);
    await (supabase.from("friendships") as any).insert({ requester_id: myProfile.id, receiver_id: targetId });
    await loadData();
    setActionLoading(null);
  };

  const respondToRequest = async (friendshipId: string, status: "accepted" | "rejected") => {
    setActionLoading(friendshipId);
    await (supabase.from("friendships") as any).update({ status }).eq("id", friendshipId);
    await loadData();
    setActionLoading(null);
  };

  const togglePrivacy = async () => {
    if (!myProfile) return;
    await (supabase.from("profiles") as any)
      .update({ show_visits_to_friends: !myProfile.show_visits_to_friends })
      .eq("id", myProfile.id);
    setMyProfile((p) => p ? { ...p, show_visits_to_friends: !p.show_visits_to_friends } : p);
  };

  if (!loading && !myProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-4">
        <Users size={48} className="text-slate-300" />
        <p className="text-slate-500 font-bold text-lg">로그인이 필요해요</p>
        <p className="text-slate-400 text-sm text-center">친구 기능은 구글 로그인 후 이용할 수 있어요</p>
        <Link href="/profile" className="px-6 py-3 bg-[#e85d26] text-white font-black rounded-2xl text-sm">
          로그인하러 가기
        </Link>
      </div>
    );
  }

  const respondToInvite = async (inviteId: string, status: "accepted" | "declined") => {
    setInviteActionLoading(inviteId);
    await (supabase.from("invites") as any).update({ status }).eq("id", inviteId);
    setReceivedInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
    setInviteActionLoading(null);
  };

  const tabs: { key: FriendTab; label: string; badge?: number }[] = [
    { key: "friends", label: "친구", badge: friends.length },
    { key: "requests", label: "요청", badge: pendingReceived.length },
    { key: "messages", label: "메시지" },
    { key: "invites", label: "초대", badge: receivedInvites.length },
    { key: "search", label: "찾기" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* 헤더 */}
      <div className="bg-gradient-to-br from-[#e85d26] to-[#c94d1a] text-white pt-12 pb-6 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Users size={24} />
            <h1 className="text-2xl font-black">친구</h1>
          </div>
          <p className="text-orange-100 text-sm">함께 탐험하는 캐나다 여행</p>

          {myProfile && (
            <button
              onClick={togglePrivacy}
              className="mt-4 flex items-center gap-2 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-2 text-xs font-bold transition-colors"
            >
              {myProfile.show_visits_to_friends ? <Eye size={14} /> : <EyeOff size={14} />}
              {myProfile.show_visits_to_friends ? "내 방문 장소 친구에게 공개 중" : "내 방문 장소 비공개 중"}
              <span className="ml-auto opacity-60">탭하여 변경</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4">
        {/* 탭 */}
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-100 p-1 mb-4 gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 relative flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === t.key ? "bg-[#e85d26] text-white shadow" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
              {t.badge != null && t.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/30 text-white" : "bg-[#e85d26] text-white"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 친구 목록 */}
        {tab === "friends" && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-sm">불러오는 중...</div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <Users size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold">아직 친구가 없어요</p>
                <p className="text-slate-300 text-sm mt-1">친구 찾기에서 닉네임으로 검색해보세요</p>
                <button
                  onClick={() => setTab("search")}
                  className="mt-4 px-5 py-2.5 bg-[#e85d26] text-white text-sm font-black rounded-2xl"
                >
                  친구 찾기
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map(({ friend, id: fid }) => (
                  <div key={fid} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                    <span className="text-2xl">{friend.avatar_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm">{friend.nickname}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {friend.visit_count}곳</span>
                        <span>⭐ {friend.points.toLocaleString()}pt</span>
                        {friend.badges.length > 0 && <span>🏅 {friend.badges.length}개</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/friends/chat/${friend.id}`}
                        className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors"
                        title="메시지"
                      >
                        <MessageCircle size={14} className="text-[#e85d26]" />
                      </Link>
                      {friend.show_visits_to_friends ? (
                        <Link href={`/friends/${friend.id}`} className="flex items-center gap-1 text-xs text-[#e85d26] font-bold">
                          보기 <ChevronRight size={12} />
                        </Link>
                      ) : (
                        <EyeOff size={14} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 친구 요청 */}
        {tab === "requests" && (
          <div className="flex flex-col gap-4">
            {pendingReceived.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-1">받은 요청</h3>
                <div className="flex flex-col gap-2">
                  {pendingReceived.map(({ friend, id: fid }) => (
                    <div key={fid} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                      <span className="text-2xl">{friend.avatar_emoji}</span>
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">{friend.nickname}</p>
                        <p className="text-xs text-slate-400">친구 요청을 보냈어요</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(fid, "accepted")}
                          disabled={actionLoading === fid}
                          className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => respondToRequest(fid, "rejected")}
                          disabled={actionLoading === fid}
                          className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingSent.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 px-1">보낸 요청</h3>
                <div className="flex flex-col gap-2">
                  {pendingSent.map(({ friend, id: fid }) => (
                    <div key={fid} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                      <span className="text-2xl">{friend.avatar_emoji}</span>
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">{friend.nickname}</p>
                        <p className="text-xs text-slate-400">승인 대기 중...</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-600 font-bold px-2 py-1 rounded-full">대기중</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingReceived.length === 0 && pendingSent.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 font-bold">친구 요청이 없어요</p>
              </div>
            )}
          </div>
        )}

        {/* 메시지 탭 */}
        {tab === "messages" && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                <MessageCircle size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="font-bold">친구가 없어요</p>
                <p className="text-xs mt-1">친구를 추가하면 메시지를 보낼 수 있어요</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map(({ friend, id: fid }) => (
                  <Link
                    key={fid}
                    href={`/friends/chat/${friend.id}`}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:border-orange-200 transition-colors"
                  >
                    <span className="text-2xl">{friend.avatar_emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm">{friend.nickname}</p>
                      <p className="text-xs text-slate-400">메시지 보내기</p>
                    </div>
                    <MessageCircle size={16} className="text-[#e85d26] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 초대 탭 */}
        {tab === "invites" && (
          <div>
            {receivedInvites.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarCheck size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-sm">받은 초대가 없어요</p>
                <p className="text-xs mt-1">친구가 장소 방문을 제안하면 여기 표시돼요</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {receivedInvites.map((inv) => {
                  const inviterFriend = friends.find((f) => f.friend.id === inv.inviter_id);
                  return (
                    <div key={inv.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="font-black text-slate-800 text-sm">{inv.place_name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {inviterFriend ? `${inviterFriend.friend.avatar_emoji} ${inviterFriend.friend.nickname}` : "친구"}님의 초대
                          </p>
                        </div>
                        <span className="text-xs bg-orange-50 text-orange-600 font-bold px-2 py-1 rounded-full shrink-0">
                          📅 {new Date(inv.proposed_date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {inv.message && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 mb-3 leading-relaxed">
                          &ldquo;{inv.message}&rdquo;
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToInvite(inv.id, "accepted")}
                          disabled={inviteActionLoading === inv.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}
                        >
                          <Check size={14} /> 수락
                        </button>
                        <button
                          onClick={() => respondToInvite(inv.id, "declined")}
                          disabled={inviteActionLoading === inv.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                          <X size={14} /> 거절
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 친구 검색 */}
        {tab === "search" && (
          <div>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="닉네임으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#e85d26] transition-colors"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-3 bg-[#e85d26] text-white font-black rounded-2xl text-sm hover:bg-[#c94d1a] transition-colors disabled:opacity-50"
              >
                {searching ? "..." : "검색"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="flex flex-col gap-2">
                {searchResults.map((p) => {
                  const alreadyFriend = friends.some((f) => f.friend.id === p.id);
                  const sentRequest = pendingSent.some((f) => f.friend.id === p.id);
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                      <span className="text-2xl">{p.avatar_emoji}</span>
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm">{p.nickname}</p>
                        <p className="text-xs text-slate-400">{p.visit_count}곳 방문 · {p.points.toLocaleString()}pt</p>
                      </div>
                      {alreadyFriend ? (
                        <span className="text-xs bg-emerald-100 text-emerald-600 font-bold px-2 py-1 rounded-full">친구</span>
                      ) : sentRequest ? (
                        <span className="text-xs bg-amber-100 text-amber-600 font-bold px-2 py-1 rounded-full">대기중</span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(p.id)}
                          disabled={actionLoading === p.id}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#e85d26] text-white text-xs font-black rounded-xl hover:bg-[#c94d1a] transition-colors disabled:opacity-50"
                        >
                          <UserPlus size={12} />
                          추가
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searching && (
              <div className="text-center py-8 text-slate-400 text-sm">
                &ldquo;{searchQuery}&rdquo; 닉네임을 찾을 수 없어요
              </div>
            )}

            <div className="mt-6 bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-xs font-black text-amber-700 mb-1">🔒 개인정보 보호</p>
              <p className="text-xs text-amber-600">닉네임으로만 검색 가능해요. 방문 장소는 상대방이 공개 설정 시에만 볼 수 있어요.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
