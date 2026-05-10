export type MissionDifficulty = "쉬움" | "보통" | "어려움";
export type MissionCategory = "관광" | "맛집" | "액티비티" | "한식" | "자연" | "커뮤니티";

export interface Mission {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: MissionCategory;
  difficulty: MissionDifficulty;
  points: number;
  requiredPlaceIds?: string[];
  badge: string;
  hint: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

export const badges: Badge[] = [
  { id: "toronto-starter", name: "토론토 입문자", emoji: "🌱", description: "처음으로 장소를 방문했어요", color: "bg-green-100 text-green-700" },
  { id: "cn-conqueror", name: "CN 정복자", emoji: "🗼", description: "CN 타워를 정복했어요", color: "bg-blue-100 text-blue-700" },
  { id: "foodie", name: "토론토 미식가", emoji: "🍜", description: "맛집 5곳을 방문했어요", color: "bg-orange-100 text-orange-700" },
  { id: "korean-heart", name: "한식 애정러", emoji: "🇰🇷", description: "한식당을 3곳 방문했어요", color: "bg-red-100 text-red-700" },
  { id: "nature-lover", name: "자연 탐험가", emoji: "🌿", description: "자연·공원 스팟 3곳을 방문했어요", color: "bg-emerald-100 text-emerald-700" },
  { id: "activity-king", name: "액티비티 킹", emoji: "🏄", description: "액티비티 미션 3개를 완료했어요", color: "bg-purple-100 text-purple-700" },
  { id: "waterfront-walker", name: "워터프론트 워커", emoji: "🌊", description: "워터프론트 스팟을 모두 방문했어요", color: "bg-cyan-100 text-cyan-700" },
  { id: "toronto-master", name: "토론토 마스터", emoji: "👑", description: "모든 추천 장소를 방문했어요!", color: "bg-yellow-100 text-yellow-700" },
  { id: "community-star", name: "커뮤니티 스타", emoji: "⭐", description: "후기를 3개 이상 작성했어요", color: "bg-pink-100 text-pink-700" },
  { id: "cherry-blossom", name: "벚꽃 헌터", emoji: "🌸", description: "하이파크 벚꽃을 봤어요", color: "bg-pink-100 text-pink-700" },
];

export const missions: Mission[] = [
  {
    id: "first-visit",
    title: "첫 발걸음",
    description: "어떤 장소든 처음으로 '다녀왔다'에 추가하세요",
    emoji: "👣",
    category: "관광",
    difficulty: "쉬움",
    points: 50,
    badge: "toronto-starter",
    hint: "아무 장소나 방문하고 '다녀왔다'를 눌러보세요!",
  },
  {
    id: "cn-tower-visit",
    title: "CN 타워 정복",
    description: "토론토의 상징, CN 타워를 직접 방문하세요",
    emoji: "🗼",
    category: "관광",
    difficulty: "쉬움",
    points: 100,
    requiredPlaceIds: ["cn-tower"],
    badge: "cn-conqueror",
    hint: "토론토 다운타운의 상징적인 타워예요",
  },
  {
    id: "korean-food-3",
    title: "한식 3종 세트",
    description: "한식당을 3곳 방문하세요",
    emoji: "🍱",
    category: "한식",
    difficulty: "보통",
    points: 150,
    badge: "korean-heart",
    hint: "노스욕 한인타운에 한식당이 많아요",
  },
  {
    id: "waterfront-trio",
    title: "워터프론트 트리오",
    description: "토론토 아일랜드, 패들보딩, 온타리오 플레이스를 모두 방문하세요",
    emoji: "🌊",
    category: "액티비티",
    difficulty: "보통",
    points: 200,
    requiredPlaceIds: ["toronto-islands", "paddleboard-humber", "ontario-place"],
    badge: "waterfront-walker",
    hint: "온타리오 호수 주변 스팟들을 탐험해요",
  },
  {
    id: "foodie-5",
    title: "토론토 미식 탐험",
    description: "맛집 카테고리 장소 5곳을 방문하세요",
    emoji: "🍽️",
    category: "맛집",
    difficulty: "보통",
    points: 200,
    badge: "foodie",
    hint: "St. Lawrence Market부터 시작해보세요",
  },
  {
    id: "nature-3",
    title: "자연 탐험가",
    description: "자연·공원 스팟을 3곳 방문하세요",
    emoji: "🌿",
    category: "자연",
    difficulty: "보통",
    points: 150,
    badge: "nature-lover",
    hint: "하이파크, 토론토 아일랜드, 스카버러 블러프스를 가보세요",
  },
  {
    id: "cherry-blossom",
    title: "벚꽃 헌터",
    description: "하이파크의 벚꽃을 봤다고 표시하세요 (4~5월 한정!)",
    emoji: "🌸",
    category: "자연",
    difficulty: "쉬움",
    points: 120,
    requiredPlaceIds: ["high-park"],
    badge: "cherry-blossom",
    hint: "4월 말~5월 초에 하이파크를 방문하세요",
  },
  {
    id: "activity-3",
    title: "액티비티 마니아",
    description: "액티비티 카테고리 미션을 3개 완료하세요",
    emoji: "🏄",
    category: "액티비티",
    difficulty: "어려움",
    points: 300,
    badge: "activity-king",
    hint: "패들보딩, 아이스링크, 블루제이스 등을 도전해요",
  },
  {
    id: "write-review-3",
    title: "커뮤니티 기여자",
    description: "후기를 3개 이상 작성하세요",
    emoji: "✍️",
    category: "커뮤니티",
    difficulty: "쉬움",
    points: 100,
    badge: "community-star",
    hint: "커뮤니티 탭에서 후기를 작성해보세요",
  },
  {
    id: "toronto-master",
    title: "토론토 마스터",
    description: "추천 장소(featured) 전부를 방문하세요",
    emoji: "👑",
    category: "관광",
    difficulty: "어려움",
    points: 500,
    badge: "toronto-master",
    hint: "⭐ 추천 표시된 장소들을 모두 방문해요",
  },
];
