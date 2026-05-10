import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, Clock, Globe, DollarSign, Lightbulb, Tag, CalendarDays, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { places, categories } from "@/data/places";
import { cn } from "@/lib/utils";
import InviteButton from "@/components/InviteButton";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return places.map((p) => ({ id: p.id }));
}

export default async function PlaceDetailPage({ params }: Props) {
  const { id } = await params;
  const place = places.find((p) => p.id === id);

  if (!place) notFound();

  const catInfo = categories.find((c) => c.id === place.category);
  const priceLabels = ["무료", "$", "$$", "$$$"];
  const related = places
    .filter((p) => p.id !== place.id && (p.category === place.category || p.neighborhood === place.neighborhood))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Image */}
      <div className="relative h-80 md:h-[420px] overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all"
          >
            <ArrowLeft size={14} />
            뒤로가기
          </Link>
        </div>

        {place.tags.some((t) => t.includes("히든") || t.includes("hidden")) ? (
          <div className="absolute top-4 right-4">
            <span
              className="tag-pill text-white text-xs"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              🕵️ 히든 스팟
            </span>
          </div>
        ) : place.featured && (
          <div className="absolute top-4 right-4">
            <span
              className="tag-pill text-white text-xs"
              style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}
            >
              ✨ 추천 장소
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("tag-pill text-xs", catInfo?.color ?? "bg-gray-100 text-gray-700")}>
                {catInfo?.emoji} {place.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1 leading-tight">
              {place.name}
            </h1>
            <p className="text-white/70 text-sm">{place.nameEn}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Hidden Spot Banner */}
        {place.tags.some((t) => t.includes("히든") || t.includes("hidden")) && (
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">🕵️</span>
            <div>
              <p className="font-black text-purple-900 text-sm mb-0.5">아는 사람만 아는 히든 스팟이에요!</p>
              <p className="text-xs text-purple-500">현지인과 블로거들이 추천하는 숨은 명소입니다. 방문 전 영업 여부를 꼭 확인하세요.</p>
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">평점</span>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                <span className="font-black text-slate-900">{place.rating}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">가격대</span>
              <div className="flex items-center gap-1">
                <DollarSign size={16} className="text-green-500" />
                <span className="font-black text-slate-900">{priceLabels[place.priceLevel]}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">동네</span>
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-orange-500" />
                <span className="font-bold text-slate-700 text-sm">{place.neighborhood}</span>
              </div>
            </div>
            {place.openHours && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-semibold uppercase">운영시간</span>
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-blue-500" />
                  <span className="font-bold text-slate-700 text-xs leading-tight">{place.openHours}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-6">
          <h2 className="font-black text-slate-900 text-lg mb-3">소개</h2>
          <p className="text-slate-600 leading-relaxed text-sm">{place.description}</p>
        </div>

        {/* Tips */}
        {place.tips.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-6">
            <h2 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-amber-500" />
              방문 꿀팁
            </h2>
            <ul className="flex flex-col gap-3">
              {place.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black"
                    style={{ background: "linear-gradient(135deg, #e85d26, #f5a623)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-700 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Address & Links */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
          <h2 className="font-black text-slate-900 text-lg mb-4">위치 & 링크</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-700">{place.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(place.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 hover:underline font-medium mt-0.5 block"
                >
                  구글 지도에서 보기 →
                </a>
              </div>
            </div>
            {place.website && (
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-blue-500 shrink-0" />
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  공식 웹사이트 방문
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Best Season */}
        {place.bestSeason && (
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays size={18} className="text-emerald-600" />
              <h2 className="font-black text-slate-900 text-base">언제 가면 좋을까요?</h2>
            </div>
            <p className="text-sm text-emerald-800 font-semibold">{place.bestSeason}</p>
          </div>
        )}

        {/* Official Website CTA */}
        {place.officialWebsite && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-6 flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-black text-blue-900 mb-0.5">운영시간·요금은 공식 사이트에서 꼭 확인하세요!</p>
              <p className="text-xs text-blue-600 mb-2">정보가 변경됐을 수 있어요. 방문 전 공식 홈페이지를 확인하는 게 가장 정확해요.</p>
              <a
                href={place.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Globe size={12} /> 공식 홈페이지 바로가기 <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

        {/* Source Links */}
        {place.sourceLinks && place.sourceLinks.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-6">
            <h2 className="font-black text-slate-900 text-base mb-3 flex items-center gap-2">
              <ExternalLink size={16} className="text-slate-500" />
              참고 링크
            </h2>
            <div className="flex flex-col gap-2">
              {place.sourceLinks.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-orange-700 transition-colors text-sm text-slate-600 font-medium group"
                >
                  <span className="text-base">{getLinkEmoji(src.label)}</span>
                  <span className="flex-1">{src.label}</span>
                  <ExternalLink size={12} className="text-slate-300 group-hover:text-orange-400" />
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">* 외부 링크로 이동해요. 링크가 변경됐을 수 있어요.</p>
          </div>
        )}

        {/* Last Updated */}
        {place.lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
            <RefreshCw size={11} />
            <span>정보 마지막 확인: <strong className="text-slate-500">{place.lastUpdated}</strong> · 실제 정보와 다를 수 있으니 방문 전 공식 사이트를 확인하세요.</span>
          </div>
        )}

        {/* Invite Friend */}
        <div className="mb-6">
          <InviteButton placeId={place.id} placeName={place.name} />
        </div>

        {/* Tags */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-slate-400" />
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-full font-medium hover:border-orange-300 hover:text-orange-600 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Places */}
        {related.length > 0 && (
          <div>
            <h2 className="font-black text-slate-900 text-xl mb-4">비슷한 장소</h2>
            <div className="flex flex-col gap-3">
              {related.map((p) => {
                const relCat = categories.find((c) => c.id === p.category);
                return (
                  <Link
                    key={p.id}
                    href={`/place/${p.id}`}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-4 items-center card-hover"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm">{relCat?.emoji}</span>
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-slate-500">{p.rating}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{p.neighborhood}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.shortDesc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getLinkEmoji(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("네이버") || l.includes("naver")) return "🟢";
  if (l.includes("reddit")) return "🟠";
  if (l.includes("tripadvisor") || l.includes("트립어드바이저")) return "🟡";
  if (l.includes("공식") || l.includes("official")) return "🔵";
  if (l.includes("유튜브") || l.includes("youtube")) return "🔴";
  if (l.includes("인스타") || l.includes("instagram")) return "🟣";
  if (l.includes("블로그") || l.includes("blog")) return "📝";
  if (l.includes("위키") || l.includes("wiki")) return "📖";
  return "🔗";
}
