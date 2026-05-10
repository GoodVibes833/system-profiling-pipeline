"use client";

import { useState } from "react";
import { Trophy, Star, Lock, CheckCircle2, ChevronRight, Flame } from "lucide-react";
import { missions, badges, type MissionCategory } from "@/data/missions";
import { useUserStore } from "@/hooks/useUserStore";
import { cn } from "@/lib/utils";

const categoryColors: Record<MissionCategory, string> = {
  관광: "bg-blue-100 text-blue-700",
  맛집: "bg-orange-100 text-orange-700",
  액티비티: "bg-purple-100 text-purple-700",
  한식: "bg-red-100 text-red-700",
  자연: "bg-emerald-100 text-emerald-700",
  커뮤니티: "bg-pink-100 text-pink-700",
};

const difficultyColors = {
  쉬움: "text-green-600 bg-green-50",
  보통: "text-yellow-600 bg-yellow-50",
  어려움: "text-red-600 bg-red-50",
};

export default function MissionsPage() {
  const { completedMissions, earnedBadges, points, visited, hydrated } = useUserStore();
  const [tab, setTab] = useState<"missions" | "badges">("missions");

  const completedCount = completedMissions.length;
  const totalPoints = points;
  const progress = Math.round((completedCount / missions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="py-10 px-4" style={{ background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)" }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={22} className="text-yellow-400" />
            <h1 className="text-2xl font-black text-white">미션 & 뱃지</h1>
          </div>
          <p className="text-blue-200 text-sm mb-6">미션을 완료하면 포인트와 뱃지를 받아요!</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{hydrated ? totalPoints : "-"}</div>
              <div className="text-blue-200 text-xs mt-0.5">포인트</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{hydrated ? completedCount : "-"}<span className="text-sm text-blue-300">/{missions.length}</span></div>
              <div className="text-blue-200 text-xs mt-0.5">미션 완료</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl font-black text-white">{hydrated ? earnedBadges.length : "-"}<span className="text-sm text-blue-300">/{badges.length}</span></div>
              <div className="text-blue-200 text-xs mt-0.5">뱃지 획득</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1.5">
              <span>전체 진행도</span>
              <span>{hydrated ? progress : 0}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${hydrated ? progress : 0}%`, background: "linear-gradient(90deg, #f5a623, #e85d26)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 py-2">
          {(["missions", "badges"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                tab === t
                  ? "text-white"
                  : "text-slate-500 hover:bg-slate-50"
              )}
              style={tab === t ? { background: "linear-gradient(135deg, #e85d26, #f5a623)" } : {}}
            >
              {t === "missions" ? "🎯 미션" : "🏅 뱃지"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === "missions" && (
          <div className="flex flex-col gap-3">
            {missions.map((mission) => {
              const done = hydrated && completedMissions.includes(mission.id);
              const badge = badges.find((b) => b.id === mission.badge);
              return (
                <div
                  key={mission.id}
                  className={cn(
                    "bg-white rounded-2xl p-5 border transition-all",
                    done ? "border-green-200 bg-green-50/50" : "border-slate-100 shadow-sm"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0",
                      done ? "bg-green-100" : "bg-slate-100"
                    )}>
                      {done ? "✅" : mission.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-black text-slate-900">{mission.title}</span>
                        {done && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">완료!</span>}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{mission.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", categoryColors[mission.category])}>
                          {mission.category}
                        </span>
                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", difficultyColors[mission.difficulty])}>
                          {mission.difficulty}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-600">
                          <Star size={11} className="fill-amber-400 text-amber-400" />
                          {mission.points}pt
                        </span>
                        {badge && (
                          <span className="text-xs text-slate-400">
                            뱃지: {badge.emoji} {badge.name}
                          </span>
                        )}
                      </div>
                      {!done && (
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                          <Flame size={11} className="text-orange-400" />
                          힌트: {mission.hint}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {done
                        ? <CheckCircle2 size={22} className="text-green-500" />
                        : <Lock size={18} className="text-slate-300" />
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "badges" && (
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => {
              const earned = hydrated && earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "rounded-2xl p-5 border text-center transition-all",
                    earned ? `${badge.color} border-transparent shadow-sm` : "bg-white border-slate-100 opacity-50"
                  )}
                >
                  <div className="text-4xl mb-2">{earned ? badge.emoji : "🔒"}</div>
                  <div className="font-black text-sm mb-1">{badge.name}</div>
                  <div className="text-xs opacity-70">{badge.description}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
