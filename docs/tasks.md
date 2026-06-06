# My Own English — 구현 태스크 리스트

> 규칙: 구현해야 할 작업이 생기면 이 문서에 태스크로 추가하고, 완료되면 `[x]`로 체크한다.
> 자세한 운영 규칙은 [CLAUDE.md](../CLAUDE.md#태스크-관리-규칙) 참고.
>
> 상태 표기: `[ ]` 예정 · `[x]` 완료 · `[~]` 진행 중
> 최종 수정: 2026-06-06

요구사항 출처: [requirements.md](./requirements.md)

## 자동화 워크플로우

각 Phase는 `.claude/workflows/myown-build-phase.mjs` 워크플로우로 진행한다.
한 Phase당 다음 사이클을 자동 수행: **구현 → 테스트 코드 작성·실행 → 코드 리뷰(3관점) → Playwright UI 테스트 → 버그 수정(최대 3회 반복) → 로컬 검증 → GitHub 푸시(→ Vercel 자동 배포) + Supabase 마이그레이션 반영**.

실행: `Workflow(name: "myown-build-phase", args: { phase: "Phase 1", deploy: true })` — Phase 단위로 한 단계씩.

### 인프라 현황
- GitHub: `jaerimee-rg/my-own-english` (origin 연결됨)
- Vercel 팀: `JR's projects`
- Supabase Org: `jaerimee-rg's Org` (무료 티어 $0/월)

---

## Phase 0 — 프로젝트 셋업
- [x] Next.js (App Router, TypeScript) 프로젝트 초기화 — Next 16.2.7 / React 19.2.4
- [x] Tailwind CSS 설정 (모바일 우선) — Tailwind v4
- [x] 테스트 프레임워크 설정 (Vitest + React Testing Library, `npm test`)
- [x] Playwright 설정 (UI 테스트, `npm run e2e`, 모바일 뷰포트)
- [~] Supabase 프로젝트 생성 + 연결 — 클라이언트(`@supabase/ssr`) 배선 완료. **호스팅 프로젝트 생성은 MCP read-only 모드로 차단됨 → 사용자 조치 필요**
- [x] 환경변수 관리 (`.env.local`, `.env.example`)
- [~] Vercel 프로젝트 링크 — GitHub 푸시까지 완료, **Vercel↔GitHub 연결은 사용자 확인 필요**
- [x] 기본 레이아웃/네비게이션(홈·문장집·학습·대화·설정)

## Phase 1 — 인증 + 문장집(Phrasebook)
- [ ] Supabase Auth 단일 계정 로그인(이메일/매직링크)
- [~] DB 스키마 작성: phrases, tags, phrase_tags, images, study_progress, conversations — `supabase/migrations/0001_init.sql` 작성 완료, **적용 대기(Supabase 접근 후)**
- [~] RLS 정책(본인 데이터만 접근) — 마이그레이션에 포함, 적용 대기
- [x] 도메인 상수·타입 정의(소도구/상황/난이도) — `src/lib/phrases/`
- [~] 문장 CRUD (영어/한국어/메모) — repo(`repo.ts`)+UI(폼·카드·페이지) 작성, 단위/E2E 통과. **실 DB 영속화 검증은 Supabase 연결 후**
- [x] 분류 입력: 소도구·상황·난이도 (자유 태그는 Phase 1 후반)
- [x] 목록 검색·필터·정렬, 즐겨찾기 — `filter.ts` + UI, 테스트 통과
- [x] TTS 발음 듣기(Web Speech API) 공통 컴포넌트 — `tts.ts` + `SpeakButton`

## Phase 2 — 학습 모드(Study)
- [ ] 학습 범위 선택(분류 기준)
- [x] 플래시카드 모드 — `FlashcardDeck` + 학습 페이지 모드 메뉴, 단위/E2E 통과
- [x] 퀴즈 모드 — 객관식(뜻→영어), `QuizMode` + `quiz.ts`, 점수·결과, 테스트 통과
- [x] 퀴즈 모드 — 빈칸 채우기: `BlankQuizMode` + 퀴즈 유형 선택, 테스트 통과
- [ ] 이미지/그림 연결 모드 (이미지 업로드 포함) — Supabase Storage 필요(대기)
- [x] 게임형 — 점수·뱃지·보상: `GameMode` + `game.ts`(스트릭/뱃지/점수), 테스트 통과
- [~] study_progress 저장(점수·스트릭) — 세션 로컬 점수 동작, 영속화는 Supabase 후

## Phase 3 — AI 기능
- [ ] Claude API 연동(서버 라우트, 키 관리)
- [ ] 문장 AI 제안(한국어 → 영어 + 뉘앙스/예시)
- [ ] AI 대화 연습 — 상황 선택형 시나리오
- [ ] AI 대화 연습 — 자유 대화 + 표현 교정/피드백
- [ ] 대화 기록 저장(conversations, conversation_messages)
- [ ] AI 호출 비용/길이 제한

## Phase 4 — 다듬기
- [ ] 모바일 UX 정리(터치·반응형 점검)
- [ ] PWA(홈 화면 추가, 아이콘)
- [ ] 디자인·애니메이션 다듬기
- [ ] 비용/성능 최적화
- [ ] 배포 점검 및 최종 QA

---

## 진행 로그
- 2026-06-06: 요구사항 v1.0 확정, 태스크 리스트 초기 작성.
- 2026-06-06: 빌드 워크플로우(`myown-build-phase`) 작성. Phase 0 직접 구현 — Next 16/React 19 스캐폴드, Tailwind v4, Vitest+RTL, Playwright, 모바일 하단 네비 + 5개 페이지. 단위 4/4·빌드·E2E 2/2 통과. Supabase 호스팅 생성/Vercel 링크는 사용자 조치 대기.
- 2026-06-06: Phase 1 백엔드 비의존 구현 — TTS(발음), 문장 검색/필터, 유효성검사, 데이터 액세스(repo), PhraseForm/PhraseCard/문장집 페이지. 단위 30/30·빌드·E2E 4/4 통과. 인증·실 DB 영속화는 Supabase 접근 후.
