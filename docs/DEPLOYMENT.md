# 배포 가이드 (Deployment)

현재 코드는 GitHub(`jwchoi684/my-own-english`)에 있고, 매 푸시마다 GitHub Actions가
**lint · 단위테스트 · 빌드 · E2E**를 실행합니다. 아래만 채우면 Vercel·Supabase가 연결됩니다.

## 1. Supabase
1. https://supabase.com 에서 프로젝트 생성 (또는 MCP read-only 해제 후 자동 생성)
2. `supabase/migrations/0001_init.sql` 적용 (대시보드 SQL Editor에 붙여넣기 또는 `supabase db push`)
3. Project Settings → API 에서 **Project URL**, **anon public key** 복사

## 2. Vercel
**옵션 A — 대시보드 Git 연동 (가장 쉬움)**
1. https://vercel.com → Add New → Project → `jwchoi684/my-own-english` Import
2. Environment Variables 에 아래 추가 후 Deploy
3. 이후 푸시마다 자동 배포

**옵션 B — GitHub Actions 자동 배포**
GitHub 저장소 → Settings → Secrets and variables → Actions 에 추가:
- `VERCEL_TOKEN` (https://vercel.com/account/tokens)
- `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (`vercel link` 후 `.vercel/project.json`)

→ 다음 푸시부터 `.github/workflows/ci.yml`의 deploy 잡이 Vercel 프로덕션에 배포합니다.

## 3. 환경 변수 (Vercel + 로컬 `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...          # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # Supabase anon public key
ANTHROPIC_API_KEY=sk-ant-...          # AI 대화·문장 제안 (server only)
```
값이 없으면 앱은 "미리보기 모드"로 동작합니다(데이터 저장·AI 비활성).
