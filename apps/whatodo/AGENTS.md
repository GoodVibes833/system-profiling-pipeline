# 캐나다가자 — 개발 진행 상황

## 프로젝트 개요
- **앱명**: 캐나다가자
- **스택**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + lucide-react + Supabase
- **포트**: 3001
- **디자인 토큰**: Primary #e85d26 / Secondary #1e3a5f / Accent #f5a623

---

## 도시 & 장소 데이터 (122개)

| 도시 | 개수 | 상태 |
|------|------|------|
| 토론토 | 46 | 완료 (히든 스팟 12개 추가) |
| 밴쿠버 | 22 | 완료 |
| 캘거리 | 14 | 완료 |
| 몬트리올 | 14 | 완료 |
| 오타와 | 10 | 완료 |
| 빅토리아 | 10 | 완료 |
| 에드먼턴 | 10 | 완료 |
| 위니펙 | 8 | 완료 |

---

## Supabase 소셜 기능

### 완료
- [x] Supabase 클라이언트 (`src/lib/supabase.ts`)
- [x] DB 타입 정의 (`src/lib/database.types.ts`)
- [x] Auth 훅 (`src/hooks/useSupabaseAuth.ts`)
- [x] 구글 로그인 모달 (`src/components/LoginModal.tsx`)
- [x] OAuth 콜백 라우트 (`src/app/auth/callback/route.ts`)
- [x] DB 스키마 SQL (`supabase_schema.sql`) — profiles, friendships, place_visits, invites, messages + RLS + Realtime
- [x] 랭킹 리더보드 (`/ranking`) — 데모 데이터 fallback
- [x] 친구 목록/요청/검색 (`/friends`)
- [x] 친구 방문장소 피드 (`/friends/[userId]`)
- [x] 실시간 채팅 훅 (`src/hooks/useRealtimeChat.ts`)
- [x] Navbar에 랭킹/친구 링크

### 완료 (추가)
- [x] 실시간 채팅 페이지 (`/friends/chat/[userId]`) — 날짜 구분선, 읽음 표시, Enter 전송
- [x] 친구 방문장소 피드에 채팅 버튼 추가 (`/friends/[userId]`)
- [x] 친구 메인에 메시지 탭 (친구별 채팅 바로가기) + 초대 탭 (수락/거절) 통합

- [x] 친구 초대 생성 UI (`InviteButton` + `InviteModal`) — 장소 상세 페이지에서 친구 선택·날짜 제안·메시지 전송
- [x] 초대 전송 후 구글 캘린더 추가 링크 (`buildGcalUrl`) — 수락 후 구글 캘린더 바로가기

### 진행 중
- (없음 — 모든 소셜 기능 완료)

### 사용자 직접 필요
- [ ] Supabase 프로젝트 생성 (supabase.com)
- [ ] `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
- [ ] SQL Editor에서 `supabase_schema.sql` 실행
- [ ] Authentication → Providers → Google 활성화

---

## 페이지 구조

| 경로 | 설명 | 상태 |
|------|------|------|
| `/` | **전체화면 지도 메인** — Leaflet + 도시탭 + 필터칩(카테고리/실내외/가격) + 바텀시트 + 내위치 | 완료 |
| `/explore` | 도시 탭 + 카테고리/가격 필터 + 검색 (기존 홈 콘텐츠 통합) | 완료 |
| `/map` | 레거시 지도 (목록형) | 완료 |
| `/tips` | 워홀러 꿀팁 | 완료 |
| `/place/[id]` | 장소 상세 (bestSeason, sourceLinks, officialWebsite 표시) | 완료 |
| `/community` | 커뮤니티 | 완료 |
| `/missions` | 미션 | 완료 |
| `/profile` | 프로필 | 완료 |
| `/ranking` | 랭킹 리더보드 (포인트/방문수/뱃지 3탭) | 완료 |
| `/hidden` | 히든 스팟 전용 페이지 — 도시탭 + 카테고리필터 + 검색 | 완료 |
| `/friends` | 친구 목록/요청/검색 + 공개·비공개 | 완료 |
| `/friends/[userId]` | 친구 방문장소 피드 | 완료 |
| `/friends/chat/[userId]` | 1:1 실시간 채팅 (날짜 구분·읽음표시·Enter전송) | 완료 |

---

## 핵심 파일

```
src/
├── data/
│   ├── places.ts          — 메인 데이터 + 토론토 장소 (1324줄)
│   ├── vancouver.ts       — 밴쿠버 장소
│   ├── calgary.ts         — 캘거리/밴프 장소
│   ├── montreal.ts        — 몬트리올 장소
│   ├── ottawa.ts          — 오타와 장소
│   ├── victoria.ts        — 빅토리아 장소
│   ├── edmonton.ts        — 에드먼턴 장소
│   └── winnipeg.ts        — 위니펙 장소
├── lib/
│   ├── supabase.ts        — Supabase 클라이언트
│   ├── database.types.ts  — DB 타입 (Profile, Friendship, PlaceVisit, Invite, Message)
│   └── utils.ts           — 유틸 (cn)
├── hooks/
│   ├── useSupabaseAuth.ts — Auth 훅
│   ├── useRealtimeChat.ts — 실시간 채팅 훅
│   └── useUserStore.ts    — Zustand 유저 스토어
├── components/
│   ├── Navbar.tsx         — 네비게이션 바
│   ├── PlaceCard.tsx      — 장소 카드
│   ├── LoginModal.tsx     — 구글 로그인 모달
│   ├── InviteButton.tsx   — 장소 상세 초대 버튼 (client)
│   └── InviteModal.tsx    — 친구 초대 모달 (친구 선택·날짜·메시지·gcal 링크)
└── app/
    ├── auth/callback/route.ts  — OAuth 콜백
    ├── ranking/page.tsx        — 랭킹 페이지
    ├── friends/
    │   ├── page.tsx            — 친구 메인
    │   ├── [userId]/page.tsx   — 친구 방문장소
    │   └── chat/[userId]/page.tsx — 채팅
    └── place/[id]/page.tsx     — 장소 상세
```

---

## 테스트

- **프레임워크**: Vitest + @testing-library/react (jsdom)
- **실행**: `npm test` (vitest run) | `npm run test:watch` (watch mode)
- **테스트 파일**:
  - `src/test/data.test.ts` — 데이터 무결성 (16 tests): ID 유니크, rating 범위, 좌표 범위, 히든 스팟 존재 등
  - `src/test/filter.test.ts` — 필터 로직 (13 tests): 도시/카테고리/가격/히든/검색/복합 필터
  - `src/test/PlaceCard.test.tsx` — 컴포넌트 통합 (13 tests): 렌더링, 배지, 인터랙션
- **현재 상태**: 42/42 통과 ✅

---

## 알려진 이슈
- `write_to_file` 도구가 JSX `</` 문자를 JSON 종료로 오인식 → 대형 JSX 파일 생성 시 `run_command` + heredoc 또는 수동 생성 필요
- Tailwind v4 `@theme` 규칙 린트 경고 (무시 가능)
- IDE에서 `Cannot find module './edmonton'` 등 오탐지 (tsc 통과)
- Supabase `.env.local` 미설정 시 앱 크래시 → `src/lib/supabase.ts`에서 방어 처리 완료 (placeholder 사용, 콘솔 경고)
