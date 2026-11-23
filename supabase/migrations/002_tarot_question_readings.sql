-- ============================================
-- 질문 타로 / 개발자 모드 데이터를 Supabase 에 저장
--   - tarot_admins        : 개발자 모드(전체 답변 조회·검토, 카드 해석 보완) 권한
--   - tarot_question_readings : 질문 · 뽑은 카드 · 규칙 엔진 답변 · AI 답변 · 피드백 · 검토
--   - tarot_card_overrides    : 개발자가 보완한 카드 해석 (모든 사용자 답변에 반영)
--
-- 사전 설정: Dashboard → Authentication → Sign In / Providers → "Allow anonymous sign-ins" 켜기
--   (비로그인 방문자도 익명 계정(auth.uid())을 받아 자기 답변을 저장합니다)
-- 실행: Dashboard → SQL Editor 에 붙여 넣고 실행
-- ============================================

/* ───────── 관리자 ───────── */

create table if not exists public.tarot_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.tarot_admins enable row level security;

drop policy if exists "tarot_admins select self" on public.tarot_admins;
create policy "tarot_admins select self" on public.tarot_admins
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.tarot_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.tarot_admins where user_id = auth.uid());
$$;

grant execute on function public.tarot_is_admin() to anon, authenticated;

-- 관리자 등록 예시 (개발자 모드 화면에 표시되는 내 계정 ID 로 실행):
-- insert into public.tarot_admins (user_id) values ('00000000-0000-0000-0000-000000000000');

/* ───────── 질문 타로 답변 ───────── */

create table if not exists public.tarot_question_readings (
  id              text primary key,
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  question        text not null check (char_length(question) <= 500),
  category        text not null,
  spread          text not null,
  cards           jsonb not null,                       -- [{ key, position }]
  result          jsonb not null,                       -- 규칙 엔진 답변 (ReadingResult)
  engine_version  int  not null,
  ai_result       jsonb,                                -- OpenAI 답변 (ReadingResult)
  ai_model        text,
  ai_created_at   timestamptz,
  user_feedback   text check (user_feedback in ('up', 'down')),
  review          jsonb not null default '{"status":"new"}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists tarot_question_readings_user_idx    on public.tarot_question_readings (user_id, created_at desc);
create index if not exists tarot_question_readings_created_idx on public.tarot_question_readings (created_at desc);

alter table public.tarot_question_readings enable row level security;

drop policy if exists "tarot_question_readings insert own" on public.tarot_question_readings;
create policy "tarot_question_readings insert own" on public.tarot_question_readings
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "tarot_question_readings select own or admin" on public.tarot_question_readings;
create policy "tarot_question_readings select own or admin" on public.tarot_question_readings
  for select to authenticated
  using (user_id = auth.uid() or public.tarot_is_admin());

-- 검토·답변 교체·삭제는 관리자만 (본인은 아래 RPC 로 피드백/AI 답변만 수정)
drop policy if exists "tarot_question_readings update admin" on public.tarot_question_readings;
create policy "tarot_question_readings update admin" on public.tarot_question_readings
  for update to authenticated
  using (public.tarot_is_admin())
  with check (public.tarot_is_admin());

drop policy if exists "tarot_question_readings delete admin" on public.tarot_question_readings;
create policy "tarot_question_readings delete admin" on public.tarot_question_readings
  for delete to authenticated
  using (public.tarot_is_admin());

-- 본인 답변의 👍/👎
create or replace function public.tarot_set_reading_feedback(p_id text, p_feedback text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_feedback is not null and p_feedback not in ('up', 'down') then
    raise exception 'invalid feedback';
  end if;
  update public.tarot_question_readings
     set user_feedback = p_feedback
   where id = p_id and user_id = auth.uid();
end;
$$;

-- 본인 답변에 AI 답변 저장 (한 번만)
create or replace function public.tarot_set_reading_ai(p_id text, p_result jsonb, p_model text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.tarot_question_readings
     set ai_result = p_result, ai_model = p_model, ai_created_at = now()
   where id = p_id and user_id = auth.uid() and ai_result is null;
end;
$$;

-- 익명 계정으로 남긴 답변을 로그인한 계정으로 옮기기
create or replace function public.tarot_claim_guest_readings(p_guest_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    return;
  end if;
  if not exists (select 1 from auth.users u where u.id = p_guest_id and u.is_anonymous) then
    return;
  end if;

  -- 질문 타로
  update public.tarot_question_readings
     set user_id = auth.uid()
   where user_id = p_guest_id;

  -- 오늘의 타로 (000_tarot_base_schema.sql)
  update public.tarot_readings
     set user_id = auth.uid(), guest_id = null
   where user_id is null and guest_id = p_guest_id::text;
end;
$$;

revoke execute on function public.tarot_set_reading_feedback(text, text) from public;
revoke execute on function public.tarot_set_reading_ai(text, jsonb, text) from public;
revoke execute on function public.tarot_claim_guest_readings(uuid) from public;
grant execute on function public.tarot_set_reading_feedback(text, text) to authenticated;
grant execute on function public.tarot_set_reading_ai(text, jsonb, text) to authenticated;
grant execute on function public.tarot_claim_guest_readings(uuid) to authenticated;

/* ───────── 카드 해석 보완 ───────── */

create table if not exists public.tarot_card_overrides (
  card_key     text primary key,
  summary      text,
  by_category  jsonb not null default '{}'::jsonb,      -- { love: "...", career: "..." }
  updated_at   timestamptz not null default now(),
  updated_by   uuid default auth.uid() references auth.users(id) on delete set null
);

alter table public.tarot_card_overrides enable row level security;

drop policy if exists "tarot_card_overrides select all" on public.tarot_card_overrides;
create policy "tarot_card_overrides select all" on public.tarot_card_overrides
  for select to anon, authenticated
  using (true);

drop policy if exists "tarot_card_overrides write admin" on public.tarot_card_overrides;
create policy "tarot_card_overrides write admin" on public.tarot_card_overrides
  for all to authenticated
  using (public.tarot_is_admin())
  with check (public.tarot_is_admin());
