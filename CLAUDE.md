@AGENTS.md

# My Own English — 프로젝트 가이드

리듬체조 선생님 전용 영어 학습 웹앱. 상세 요구사항은 [docs/requirements.md](./docs/requirements.md) 참고.

## 태스크 관리 규칙

구현 작업은 **항상 [docs/tasks.md](./docs/tasks.md)** 를 기준으로 진행한다.

1. **추가**: 새로 구현해야 할 작업이 생기면, 코드 작성 전에 먼저 `docs/tasks.md`에
   해당 태스크를 `[ ]` 항목으로 추가한다. 알맞은 Phase 아래에 넣고, 없으면 새 섹션을 만든다.
2. **진행 표시**: 작업을 시작하면 해당 항목을 `[~]`(진행 중)로 바꾼다.
3. **완료 체크**: 작업이 끝나면 해당 항목을 `[x]`로 체크한다.
   체크는 실제로 동작이 검증된 뒤에만 한다(빌드/실행/테스트 확인).
4. **로그**: 의미 있는 변경은 `docs/tasks.md` 하단 "진행 로그"에 날짜와 함께 한 줄 남긴다.
5. 한 번에 여러 작업을 하면 끝나는 대로 각각 체크한다. 미완료 항목은 절대 체크하지 않는다.

상태 표기: `[ ]` 예정 · `[~]` 진행 중 · `[x]` 완료

## 빌드 자동화 워크플로우

Phase 단위 빌드는 `.claude/workflows/myown-build-phase.mjs` 워크플로우로 수행한다.
사이클: 구현 → 테스트 작성·실행 → 코드 리뷰 → Playwright UI 테스트 → 버그 수정(반복) → 배포(GitHub→Vercel + Supabase).
실행: `Workflow(name: "myown-build-phase", args: { phase: "Phase 1", deploy: true })`.

## 기술 스택
- Next.js (App Router) + TypeScript + Tailwind CSS (모바일 우선)
- Supabase (Postgres + Auth + Storage, RLS) — `@supabase/ssr`
- OpenAI API (gpt-4.1-nano) — AI 문장 제안·대화 (`OPENAI_API_KEY`)
- 테스트: Vitest + React Testing Library / Playwright(UI)
- Vercel 배포

> 주의: 이 프로젝트의 Next.js는 최신 버전으로 학습 데이터와 다를 수 있다. 코드 작성 전
> `node_modules/next/dist/docs/` 의 관련 가이드를 확인할 것 (AGENTS.md 참고).
