-- ============================================
-- 타로 기본 테이블 (001, 002 보다 먼저 실행)
--   - tarot_cards    : 카드 정보 (001_insert_tarot_cards.sql 이 데이터를 넣음)
--   - tarot_readings : 오늘의 타로 기록 (src/services/tarotService.ts)
--
-- 비로그인 방문자는 Supabase 익명 계정으로 접속하므로
-- guest_id 에는 익명 계정의 auth.uid() 가 문자열로 저장됩니다.
-- ============================================

/* ───────── 카드 ───────── */

create table if not exists public.tarot_cards (
  card_id                serial primary key,          -- 001 의 setval('tarot_cards_card_id_seq') 와 짝
  card_name              text not null,
  card_name_ko           text not null,
  card_type              text not null check (card_type in ('major', 'minor')),
  card_suit              text check (card_suit in ('wands', 'cups', 'swords', 'pentacles')),
  card_number            int,
  card_image_url         text not null,
  card_meaning_upright   text not null,
  card_meaning_reversed  text,
  created_at             timestamptz not null default now()
);

alter table public.tarot_cards enable row level security;

drop policy if exists "tarot_cards select all" on public.tarot_cards;
create policy "tarot_cards select all" on public.tarot_cards
  for select to anon, authenticated
  using (true);
-- 쓰기 정책 없음 → 카드 데이터는 SQL Editor(관리자)에서만 수정

/* ───────── 오늘의 타로 기록 ───────── */

create table if not exists public.tarot_readings (
  reading_id           uuid primary key default gen_random_uuid(),
  user_id              uuid references auth.users(id) on delete cascade,
  guest_id             text,
  card_id              int not null references public.tarot_cards(card_id),
  question_type        text not null check (question_type in ('today', 'love', 'career', 'money', 'general')),
  is_reversed          boolean not null default false,
  is_paid              boolean not null default false,
  reading_result       text,
  deep_reading_result  text,
  created_at           timestamptz not null default now(),
  check (user_id is not null or guest_id is not null)
);

create index if not exists tarot_readings_user_idx  on public.tarot_readings (user_id, created_at desc);
create index if not exists tarot_readings_guest_idx on public.tarot_readings (guest_id, created_at desc);

alter table public.tarot_readings enable row level security;

-- 본인 기록: 로그인 계정(user_id) 또는 익명 계정(guest_id = auth.uid())
drop policy if exists "tarot_readings select own" on public.tarot_readings;
create policy "tarot_readings select own" on public.tarot_readings
  for select to authenticated
  using (user_id = auth.uid() or (user_id is null and guest_id = auth.uid()::text));

drop policy if exists "tarot_readings insert own" on public.tarot_readings;
create policy "tarot_readings insert own" on public.tarot_readings
  for insert to authenticated
  with check (user_id = auth.uid() or (user_id is null and guest_id = auth.uid()::text));

-- '저장하기'(guest → 내 계정) 용. 결과는 반드시 내 계정이어야 함
drop policy if exists "tarot_readings update own" on public.tarot_readings;
create policy "tarot_readings update own" on public.tarot_readings
  for update to authenticated
  using (user_id = auth.uid() or (user_id is null and guest_id = auth.uid()::text))
  with check (user_id = auth.uid());

-- 결제 관련 컬럼(is_paid, deep_reading_result)은 클라이언트가 바꾸지 못하도록 컬럼 단위로 제한
revoke insert, update on public.tarot_readings from anon, authenticated;
grant insert (user_id, guest_id, card_id, question_type, is_reversed, reading_result)
  on public.tarot_readings to authenticated;
grant update (user_id, guest_id) on public.tarot_readings to authenticated;
