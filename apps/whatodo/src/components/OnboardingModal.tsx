"use client";

import { useState, useEffect } from "react";
import { X, Smile, ChevronRight } from "lucide-react";
import { useUserStore } from "@/hooks/useUserStore";

const EMOJI_LIST = ["🙋", "🧑‍💻", "✈️", "🍁", "🏕️", "🎒", "🌊", "🍜", "⛷️", "🦫"];

export default function OnboardingModal() {
  const { nickname, setNickname, hydrated } = useUserStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🙋");
  const [step, setStep] = useState<"intro" | "name">("intro");

  useEffect(() => {
    if (hydrated && !nickname) {
      const dismissed = sessionStorage.getItem("onboarding_dismissed");
      if (!dismissed) setOpen(true);
    }
  }, [hydrated, nickname]);

  const handleDismiss = () => {
    sessionStorage.setItem("onboarding_dismissed", "1");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setNickname(`${selectedEmoji} ${trimmed}`);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleDismiss} />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        <button onClick={handleDismiss} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors">
          <X size={18} className="text-slate-400" />
        </button>

        {step === "intro" ? (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🍁</div>
              <h2 className="text-xl font-black text-slate-900 mb-1">캐나다가자에 오신 걸 환영해요!</h2>
              <p className="text-sm text-slate-500">워홀러·여행자를 위한 캐나다 8개 도시 가이드</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-2xl">
                <span className="text-xl mt-0.5">📍</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">무료 장소 탐색</div>
                  <div className="text-xs text-slate-500">돈 없이도 즐길 수 있는 숨은 명소</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-2xl">
                <span className="text-xl mt-0.5">💬</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">워홀러 커뮤니티</div>
                  <div className="text-xs text-slate-500">후기, Q&A, 장소 제보 모두 가능</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl">
                <span className="text-xl mt-0.5">🏆</span>
                <div>
                  <div className="font-bold text-slate-900 text-sm">미션 & 뱃지</div>
                  <div className="text-xs text-slate-500">방문 기록하고 포인트 모아보세요</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("name")}
              className="w-full py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}
            >
              닉네임 설정하고 시작하기 <ChevronRight size={18} />
            </button>
            <button onClick={handleDismiss} className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors">
              나중에 설정할게요
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">{selectedEmoji}</div>
              <h2 className="text-xl font-black text-slate-900 mb-1">닉네임을 정해주세요</h2>
              <p className="text-sm text-slate-500">커뮤니티에서 사용할 이름이에요</p>
            </div>

            {/* Emoji picker */}
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-500 mb-2">아이콘 선택</p>
              <div className="flex gap-2 flex-wrap">
                {EMOJI_LIST.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setSelectedEmoji(e)}
                    className={`text-2xl w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                      selectedEmoji === e ? "bg-orange-100 ring-2 ring-orange-400 scale-110" : "hover:bg-slate-100"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                autoFocus
                type="text"
                placeholder="닉네임 입력 (2~12자)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                minLength={2}
                maxLength={12}
                required
                className="w-full border-2 border-slate-200 focus:border-orange-400 rounded-2xl px-4 py-3 text-sm outline-none transition-colors mb-3"
              />
              <div className="text-right text-xs text-slate-400 -mt-2 mb-3">{input.length}/12</div>

              {input.trim().length >= 2 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 text-center">
                  <span className="font-black text-slate-900">{selectedEmoji} {input.trim()}</span> 으로 시작할게요!
                </div>
              )}

              <button
                type="submit"
                disabled={input.trim().length < 2}
                className="w-full py-3 rounded-2xl font-black text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}
              >
                시작하기 🎉
              </button>
            </form>
          </>
        )}

        {/* 데이터 저장 안내 */}
        <p className="text-center text-xs text-slate-400 mt-3">
          🔒 데이터는 이 기기에만 저장돼요 · 로그인 없이 사용 가능
        </p>
      </div>
    </div>
  );
}
