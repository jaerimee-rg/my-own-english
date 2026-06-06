-- My Own English — initial schema (Phase 1)
-- Single-user app, but every row is still scoped to auth.uid() with RLS enabled.

-- ── phrases ────────────────────────────────────────────────────────────────
create table if not exists public.phrases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  english     text not null,
  korean      text not null,
  note        text,
  apparatus   text,            -- 소도구: ribbon/hoop/ball/clubs/rope/floor
  situation   text,            -- 수업 상황: greeting/warmup/instruction/praise/correction/closing
  level       text,            -- 난이도: beginner/intermediate/advanced
  is_favorite boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists phrases_user_idx on public.phrases (user_id, created_at desc);

-- ── tags (free-form) ───────────────────────────────────────────────────────
create table if not exists public.tags (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name    text not null,
  unique (user_id, name)
);

create table if not exists public.phrase_tags (
  phrase_id uuid not null references public.phrases (id) on delete cascade,
  tag_id    uuid not null references public.tags (id) on delete cascade,
  primary key (phrase_id, tag_id)
);

-- ── images (for image-matching study) ──────────────────────────────────────
create table if not exists public.images (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  phrase_id  uuid references public.phrases (id) on delete set null,
  url        text not null,
  caption    text,
  created_at timestamptz not null default now()
);

-- ── study progress (scores / streaks for game mode) ────────────────────────
create table if not exists public.study_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade default auth.uid(),
  phrase_id       uuid not null references public.phrases (id) on delete cascade,
  mode            text not null,
  score           integer not null default 0,
  streak          integer not null default 0,
  last_studied_at timestamptz not null default now()
);
create index if not exists study_progress_user_idx on public.study_progress (user_id, phrase_id);

-- ── conversations (AI practice) ────────────────────────────────────────────
create table if not exists public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  scenario   text,
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  created_at      timestamptz not null default now()
);
create index if not exists conversation_messages_conv_idx
  on public.conversation_messages (conversation_id, created_at);

-- ── updated_at trigger for phrases ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists phrases_set_updated_at on public.phrases;
create trigger phrases_set_updated_at
  before update on public.phrases
  for each row execute function public.set_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.phrases               enable row level security;
alter table public.tags                  enable row level security;
alter table public.phrase_tags           enable row level security;
alter table public.images                enable row level security;
alter table public.study_progress        enable row level security;
alter table public.conversations         enable row level security;
alter table public.conversation_messages enable row level security;

-- Owner-only policies (user_id = auth.uid())
create policy "own phrases"        on public.phrases
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own tags"           on public.tags
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own images"         on public.images
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own study_progress" on public.study_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own conversations"  on public.conversations
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Join-table / child policies (scoped through their parent's owner)
create policy "own phrase_tags" on public.phrase_tags
  for all using (
    exists (select 1 from public.phrases p where p.id = phrase_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.phrases p where p.id = phrase_id and p.user_id = auth.uid())
  );

create policy "own conversation_messages" on public.conversation_messages
  for all using (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid())
  );
