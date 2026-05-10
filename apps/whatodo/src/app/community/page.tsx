"use client";

import { useState } from "react";
import { MessageSquare, Star, Send, X, MapPin, PlusCircle, ThumbsUp, Share2, MapPinPlus, HelpCircle, BookOpen } from "lucide-react";
import { places, cities } from "@/data/places";
import { useUserStore, type Review } from "@/hooks/useUserStore";
import { cn } from "@/lib/utils";

type CommunityTab = "reviews" | "questions" | "suggest";

interface Question {
  id: string;
  nickname: string;
  city: string;
  content: string;
  date: string;
  likes: number;
  answers: number;
}

interface Suggestion {
  id: string;
  nickname: string;
  city: string;
  placeName: string;
  placeDesc: string;
  category: string;
  date: string;
  likes: number;
}

const DEMO_QUESTIONS: Question[] = [
  { id: "q1", nickname: "밴쿠버왕초보", city: "vancouver", content: "스탠리파크 자전거 렌탈 어디서 하면 가장 저렴해요? 혼자 가도 괜찮을까요?", date: "2024-05-08", likes: 12, answers: 5 },
  { id: "q2", nickname: "토론토워홀러", city: "toronto", content: "노스욕 H-Mart 근처에 저렴한 한식당 추천해줄 수 있나요?", date: "2024-05-07", likes: 8, answers: 3 },
  { id: "q3", nickname: "몬트리올새내기", city: "montreal", content: "몬트리올 겨울 영하 30도 실화인가요..? 어떻게 버텼어요? 꿀팁 알려주세요", date: "2024-05-06", likes: 24, answers: 11 },
];

const DEMO_SUGGESTIONS: Suggestion[] = [
  { id: "s1", nickname: "밴쿠버고수", city: "vancouver", placeName: "Jericho Beach", placeDesc: "키칠라노 옆 숨은 해변. 거의 사람 없고 일몰이 장난 아님", category: "자연", date: "2024-05-08", likes: 18 },
  { id: "s2", nickname: "토론토맛집탐험가", city: "toronto", placeName: "코리안 BBQ 후기", placeDesc: "노스욕 신규 오픈 삼겹살집 진짜 맛있음", category: "맛집", date: "2024-05-07", likes: 9 },
];

export default function CommunityPage() {
  const { reviews, addReview, nickname, setNickname, hydrated, points, earnedBadges } = useUserStore();
  const [tab, setTab] = useState<CommunityTab>("reviews");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [selectedCity, setSelectedCity] = useState("toronto");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [suggestName, setSuggestName] = useState("");
  const [suggestDesc, setSuggestDesc] = useState("");
  const [suggestCategory, setSuggestCategory] = useState("자연");
  const [suggestCity, setSuggestCity] = useState("toronto");
  const [localNickname, setLocalNickname] = useState(nickname || "");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>(DEMO_QUESTIONS);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEMO_SUGGESTIONS);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const cityPlaces = places.filter((p) => p.city === selectedCity);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaceId || !content.trim() || !localNickname.trim()) return;
    const place = places.find((p) => p.id === selectedPlaceId);
    if (!place) return;
    if (localNickname !== nickname) setNickname(localNickname);
    addReview({ placeId: selectedPlaceId, placeName: place.name, content: content.trim(), rating, nickname: localNickname.trim() });
    setContent(""); setSelectedPlaceId(""); setRating(5); setShowReviewForm(false);
    setSubmitted("review"); setTimeout(() => setSubmitted(null), 3000);
  };

  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionContent.trim() || !localNickname.trim()) return;
    if (localNickname !== nickname) setNickname(localNickname);
    const newQ: Question = { id: `q${Date.now()}`, nickname: localNickname.trim(), city: selectedCity, content: questionContent.trim(), date: new Date().toISOString().slice(0, 10), likes: 0, answers: 0 };
    setQuestions([newQ, ...questions]);
    setQuestionContent(""); setShowQuestionForm(false);
    setSubmitted("question"); setTimeout(() => setSubmitted(null), 3000);
  };

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim() || !suggestDesc.trim() || !localNickname.trim()) return;
    if (localNickname !== nickname) setNickname(localNickname);
    const newS: Suggestion = { id: `s${Date.now()}`, nickname: localNickname.trim(), city: suggestCity, placeName: suggestName.trim(), placeDesc: suggestDesc.trim(), category: suggestCategory, date: new Date().toISOString().slice(0, 10), likes: 0 };
    setSuggestions([newS, ...suggestions]);
    setSuggestName(""); setSuggestDesc(""); setShowSuggestForm(false);
    setSubmitted("suggest"); setTimeout(() => setSubmitted(null), 3000);
  };

  const toggleLike = (id: string, type: "q" | "s") => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
    if (type === "q") setQuestions(qs => qs.map(q => q.id === id ? { ...q, likes: q.likes + (likedItems.has(id) ? -1 : 1) } : q));
    if (type === "s") setSuggestions(ss => ss.map(s => s.id === id ? { ...s, likes: s.likes + (likedItems.has(id) ? -1 : 1) } : s));
  };

  const handleShare = () => {
    const url = window.location.origin;
    if (navigator.share) { navigator.share({ title: "캐나다가자 커뮤니티", url }); }
    else { navigator.clipboard.writeText(url); setSubmitted("share"); setTimeout(() => setSubmitted(null), 2000); }
  };

  const tabs = [
    { id: "reviews" as CommunityTab, label: "후기", icon: BookOpen, count: hydrated ? reviews.length + 3 : 3 },
    { id: "questions" as CommunityTab, label: "Q&A", icon: HelpCircle, count: questions.length },
    { id: "suggest" as CommunityTab, label: "장소제보", icon: MapPinPlus, count: suggestions.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="py-8 px-4" style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-300" />
              <h1 className="text-2xl font-black text-white">커뮤니티</h1>
            </div>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-xl text-white text-xs font-bold hover:bg-white/20 transition-all">
              <Share2 size={13} /> 앱 공유
            </button>
          </div>
          <p className="text-blue-200 text-sm mb-4">워홀러·여행자 8개 도시 실시간 커뮤니티</p>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl py-2">
              <div className="text-white font-black">{places.length}</div>
              <div className="text-blue-200 text-xs">등록 장소</div>
            </div>
            <div className="bg-white/10 rounded-xl py-2">
              <div className="text-white font-black">{hydrated ? reviews.length + DEMO_QUESTIONS.length : DEMO_QUESTIONS.length}</div>
              <div className="text-blue-200 text-xs">커뮤니티 글</div>
            </div>
            <div className="bg-white/10 rounded-xl py-2">
              <div className="text-white font-black">8</div>
              <div className="text-blue-200 text-xs">커버 도시</div>
            </div>
          </div>

          {hydrated && nickname && (
            <div className="mt-3 bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
                {nickname[0].toUpperCase()}
              </div>
              <div className="text-white text-xs font-bold">{nickname}</div>
              <div className="text-blue-200 text-xs ml-auto">⭐ {points}pt · 뱃지 {earnedBadges.length}개</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 py-2">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all",
                tab === id ? "text-white" : "text-slate-500 hover:bg-slate-50")}
              style={tab === id ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}>
              <Icon size={14} />
              {label}
              <span className={cn("text-xs", tab === id ? "text-white/70" : "text-slate-400")}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Toast */}
        {submitted && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-semibold">
            {submitted === "review" && "✅ 후기 등록 완료! +10pt 획득"}
            {submitted === "question" && "✅ 질문 등록 완료! 빠른 답변이 달릴 거예요"}
            {submitted === "suggest" && "✅ 장소 제보 완료! 검토 후 앱에 추가될 수 있어요 🎉"}
            {submitted === "share" && "🔗 링크가 복사됐어요! 친구에게 공유해보세요"}
          </div>
        )}

        {/* ───── REVIEWS TAB ───── */}
        {tab === "reviews" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-slate-900">최근 후기</p>
              <button onClick={() => setShowReviewForm(!showReviewForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
                <Send size={13} /> 후기 쓰기
              </button>
            </div>
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-slate-900 text-sm">후기 작성</span>
                  <button type="button" onClick={() => setShowReviewForm(false)}><X size={16} className="text-slate-400" /></button>
                </div>
                <NicknameInput value={localNickname} onChange={setLocalNickname} />
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">도시</label>
                  <select value={selectedCity} onChange={e => { setSelectedCity(e.target.value); setSelectedPlaceId(""); }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white mb-2">
                    {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                  <select value={selectedPlaceId} onChange={e => setSelectedPlaceId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" required>
                    <option value="">장소 선택</option>
                    {cityPlaces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">평점</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setRating(n)} className="transition-transform hover:scale-110">
                        <Star size={22} className={n <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="솔직한 후기 (10자 이상)" value={content} onChange={e => setContent(e.target.value)}
                  rows={3} required minLength={10} maxLength={300}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none mb-1" />
                <div className="text-right text-xs text-slate-400 mb-3">{content.length}/300</div>
                <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>등록하기 ✍️</button>
              </form>
            )}
            {!hydrated ? <div className="text-center py-12 text-slate-400">로딩 중...</div> :
              reviews.length === 0 ? <EmptyState emoji="💬" title="첫 번째 후기를 남겨보세요!" sub="후기를 쓰면 +10pt를 드려요" /> :
              <div className="flex flex-col gap-3">
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            }
          </>
        )}

        {/* ───── Q&A TAB ───── */}
        {tab === "questions" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-slate-900">질문 & 답변</p>
              <button onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
                <PlusCircle size={13} /> 질문하기
              </button>
            </div>
            {/* 커뮤니티 참여 유도 배너 */}
            <div className="mb-4 p-4 rounded-2xl border border-orange-100 bg-orange-50">
              <div className="text-sm font-bold text-orange-700 mb-1">💡 캐나다 생활 궁금한 게 있나요?</div>
              <div className="text-xs text-orange-600">교통, 알바, 비자, 맛집, 날씨... 뭐든 물어보세요! 선배 워홀러들이 답해줘요. 답변하면 미션 포인트도 드려요 ⭐</div>
            </div>
            {showQuestionForm && (
              <form onSubmit={handleQuestionSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-slate-900 text-sm">질문 작성</span>
                  <button type="button" onClick={() => setShowQuestionForm(false)}><X size={16} className="text-slate-400" /></button>
                </div>
                <NicknameInput value={localNickname} onChange={setLocalNickname} />
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">관련 도시</label>
                  <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white">
                    {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                </div>
                <textarea placeholder="궁금한 것을 자유롭게 물어보세요!" value={questionContent} onChange={e => setQuestionContent(e.target.value)}
                  rows={3} required minLength={5} maxLength={500}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none mb-3" />
                <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>질문 올리기 🙋</button>
              </form>
            )}
            <div className="flex flex-col gap-3">
              {questions.map(q => {
                const city = cities.find(c => c.id === q.city);
                return (
                  <div key={q.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}>
                        {q.nickname[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-sm">{q.nickname}</span>
                          {city && <span className="text-xs text-slate-400">{city.emoji} {city.label}</span>}
                          <span className="text-xs text-slate-400 ml-auto">{q.date}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed mb-2">{q.content}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleLike(q.id, "q")} className={cn("flex items-center gap-1 text-xs font-semibold transition-colors", likedItems.has(q.id) ? "text-orange-500" : "text-slate-400 hover:text-orange-400")}>
                            <ThumbsUp size={12} /> {q.likes + (likedItems.has(q.id) ? 1 : 0)}
                          </button>
                          <span className="text-xs text-blue-500 font-semibold">💬 답변 {q.answers}개</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ───── SUGGEST TAB ───── */}
        {tab === "suggest" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-slate-900">장소 제보</p>
              <button onClick={() => setShowSuggestForm(!showSuggestForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
                <MapPinPlus size={13} /> 제보하기
              </button>
            </div>
            <div className="mb-4 p-4 rounded-2xl border border-blue-100 bg-blue-50">
              <div className="text-sm font-bold text-blue-700 mb-1">📍 여기도 추가해주세요!</div>
              <div className="text-xs text-blue-600">아직 앱에 없는 숨은 명소, 한식당, 꿀팁 장소를 제보해주세요. 채택된 제보는 앱에 정식 등록되고 제보자 닉네임이 크레딧에 올라가요!</div>
            </div>
            {showSuggestForm && (
              <form onSubmit={handleSuggestSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-slate-900 text-sm">장소 제보</span>
                  <button type="button" onClick={() => setShowSuggestForm(false)}><X size={16} className="text-slate-400" /></button>
                </div>
                <NicknameInput value={localNickname} onChange={setLocalNickname} />
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">도시</label>
                    <select value={suggestCity} onChange={e => setSuggestCity(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white">
                      {cities.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">카테고리</label>
                    <select value={suggestCategory} onChange={e => setSuggestCategory(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white">
                      {["자연","관광","맛집","카페","액티비티","쇼핑","야경"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">장소 이름</label>
                  <input value={suggestName} onChange={e => setSuggestName(e.target.value)} required maxLength={50} placeholder="장소 이름 (영어/한국어 모두 OK)"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div className="mb-3">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">간단한 설명 & 추천 이유</label>
                  <textarea value={suggestDesc} onChange={e => setSuggestDesc(e.target.value)} required minLength={10} maxLength={300} rows={3} placeholder="왜 추천하나요? 가격, 위치, 꿀팁 등..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>제보 올리기 📍</button>
              </form>
            )}
            <div className="flex flex-col gap-3">
              {suggestions.map(s => {
                const city = cities.find(c => c.id === s.city);
                return (
                  <div key={s.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0 bg-emerald-100">📍</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-black text-slate-900 text-sm">{s.placeName}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{s.category}</span>
                          {city && <span className="text-xs text-slate-400">{city.emoji} {city.label}</span>}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-1">{s.placeDesc}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">by {s.nickname} · {s.date}</span>
                          <button onClick={() => toggleLike(s.id, "s")} className={cn("flex items-center gap-1 text-xs font-semibold transition-colors ml-auto", likedItems.has(s.id) ? "text-orange-500" : "text-slate-400 hover:text-orange-400")}>
                            <ThumbsUp size={12} /> {s.likes + (likedItems.has(s.id) ? 1 : 0)}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NicknameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-bold text-slate-500 mb-1 block">닉네임</label>
      <input type="text" placeholder="닉네임" value={value} onChange={e => onChange(e.target.value)} required maxLength={20}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors" />
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const place = places.find((p) => p.id === review.placeId);
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}>
          {review.nickname[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-bold text-slate-900 text-sm">{review.nickname}</span>
            <span className="text-xs text-slate-400">{review.date}</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} size={11} className={n <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />)}</div>
            <div className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={9} />{review.placeName}</div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
          {place?.image && <img src={place.image} alt={place.name} className="mt-2 rounded-xl w-full h-28 object-cover" />}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-2">{emoji}</div>
      <p className="font-bold text-slate-600 text-sm mb-1">{title}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  );
}
