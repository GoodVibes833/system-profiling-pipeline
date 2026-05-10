"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, MapPin } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { messages, friendProfile, loading, sendMessage } = useRealtimeChat(
    user?.id,
    userId
  );

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    await sendMessage(input.trim());
    setInput("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="text-5xl">🔒</div>
        <p className="text-slate-600 font-semibold">로그인이 필요해요</p>
        <Link href="/" className="px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
          style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)" }}>
          홈으로
        </Link>
      </div>
    );
  }

  const groupedMessages = messages.reduce<{ date: string; msgs: typeof messages }[]>(
    (acc, msg) => {
      const date = formatDate(msg.created_at);
      const last = acc[acc.length - 1];
      if (last && last.date === date) last.msgs.push(msg);
      else acc.push({ date, msgs: [msg] });
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 transition-all">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="text-2xl">{friendProfile?.avatar_emoji ?? "🙂"}</div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-sm truncate">
            {friendProfile?.nickname ?? "..."}
          </p>
          <p className="text-xs text-slate-400">1:1 채팅</p>
        </div>
        <Link
          href={`/friends/${userId}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
        >
          <MapPin size={12} /> 방문장소
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <div className="text-5xl">💬</div>
            <p className="text-sm font-medium">첫 메시지를 보내보세요!</p>
            <p className="text-xs">
              {friendProfile?.nickname ?? "친구"}님과의 대화를 시작해요
            </p>
          </div>
        )}

        {groupedMessages.map(({ date, msgs }) => (
          <div key={date}>
            {/* Date divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium shrink-0">{date}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {msgs.map((msg, i) => {
              const isMe = msg.sender_id === user.id;
              const prevMsg = msgs[i - 1];
              const showAvatar = !isMe && (i === 0 || prevMsg?.sender_id !== msg.sender_id);

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {!isMe && (
                    <div className="w-8 shrink-0">
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base">
                          {friendProfile?.avatar_emoji ?? "🙂"}
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[72%]`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "text-white rounded-br-sm"
                          : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm shadow-sm"
                      }`}
                      style={isMe ? { background: "linear-gradient(135deg,#e85d26,#f5a623)" } : {}}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                      {formatTime(msg.created_at)}
                      {isMe && (
                        <span className="ml-1">{msg.read ? "읽음" : "•"}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-slate-100 px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 min-h-[44px] flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
              style={{ maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#e85d26,#f5a623)" }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 text-center">
          Enter로 전송 · Shift+Enter 줄바꿈
        </p>
      </div>
    </div>
  );
}
