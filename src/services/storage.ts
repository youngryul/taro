/**
 * Supabase 기반 저장소 (브라우저 저장소는 사용하지 않음).
 * - readings  : tarot_question_readings 테이블 — 질문·카드·답변·AI 답변·피드백·검토
 * - overrides : tarot_card_overrides 테이블 — 개발자가 보완한 카드 해석 (다음 답변 생성부터 반영)
 * - isAdmin   : tarot_admins 테이블 — 개발자 모드 권한
 * - devMode   : 개발자 모드 메뉴 노출 여부 (메모리, 새로고침하면 초기화)
 *
 * 화면은 메모리 스토어를 구독하고, 쓰기는 메모리를 먼저 바꾼 뒤(낙관적 업데이트) 서버에 반영합니다.
 * 테이블 정의: supabase/migrations/002_tarot_question_readings.sql
 */
import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { CategoryId, SpreadId } from '../data/knowledge';

export interface CardSection {
  position: string;
  cardKey: string;
  title: string;
  body: string;
  /** 해석 출처: 개발자 보완(override) / 문서(doc) / AI(ai) */
  source: 'override' | 'doc' | 'ai';
}

export interface ReadingResult {
  headline: string;
  sections: CardSection[];
  overall: string;
  advice: string;
}

export interface DrawnCard {
  key: string;
  position: string;
}

export type ReviewStatus = 'new' | 'reviewed' | 'needs-work';

export interface Review {
  status: ReviewStatus;
  rating?: number;
  note?: string;
  improvedAnswer?: string;
  reviewedAt?: number;
}

export interface AiAnswer {
  result: ReadingResult;
  model: string;
  createdAt: number;
}

export interface Reading {
  id: string;
  createdAt: number;
  question: string;
  category: CategoryId;
  spread: SpreadId;
  cards: DrawnCard[];
  result: ReadingResult;
  engineVersion: number;
  /** OpenAI 로 다듬은 답변 (result 를 근거로 생성). 있으면 화면에 우선 표시 */
  ai?: AiAnswer;
  /** AI 답변 진행 상태 — 화면 표시용, 서버에 저장하지 않음 */
  aiStatus?: 'pending' | 'done' | 'failed';
  userFeedback?: 'up' | 'down';
  review: Review;
}

export interface CardOverride {
  summary?: string;
  byCategory?: Partial<Record<CategoryId, string>>;
  updatedAt: number;
}

export type Overrides = Record<string, CardOverride>;

/* ───────── 아주 작은 pub/sub 메모리 스토어 ───────── */

export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(next) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const readingsStore = createStore<Reading[]>([]);
export const overridesStore = createStore<Overrides>({});
export const devModeStore = createStore<boolean>(false);
export const isAdminStore = createStore<boolean>(false);

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/* ───────── DB 행 ↔ 앱 타입 ───────── */

interface ReadingRow {
  id: string;
  user_id: string;
  question: string;
  category: CategoryId;
  spread: SpreadId;
  cards: DrawnCard[];
  result: ReadingResult;
  engine_version: number;
  ai_result: ReadingResult | null;
  ai_model: string | null;
  ai_created_at: string | null;
  user_feedback: 'up' | 'down' | null;
  review: Review | null;
  created_at: string;
}

interface OverrideRow {
  card_key: string;
  summary: string | null;
  by_category: Partial<Record<CategoryId, string>> | null;
  updated_at: string;
}

const toReading = (r: ReadingRow): Reading => ({
  id: r.id,
  createdAt: Date.parse(r.created_at),
  question: r.question,
  category: r.category,
  spread: r.spread,
  cards: r.cards,
  result: r.result,
  engineVersion: r.engine_version,
  ai: r.ai_result
    ? { result: r.ai_result, model: r.ai_model ?? '', createdAt: Date.parse(r.ai_created_at ?? r.created_at) }
    : undefined,
  userFeedback: r.user_feedback ?? undefined,
  review: r.review ?? { status: 'new' },
});

const toOverride = (r: OverrideRow): CardOverride => ({
  ...(r.summary ? { summary: r.summary } : {}),
  byCategory: r.by_category ?? {},
  updatedAt: Date.parse(r.updated_at),
});

const warn = (what: string, error: { message: string } | null) => {
  if (error) console.warn(`[supabase] ${what} 실패:`, error.message);
  return !error;
};

const patchLocal = (id: string, patch: Partial<Reading>) =>
  readingsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

/* ───────── 불러오기 ───────── */

/** 내 답변(관리자면 전체 답변)을 서버에서 불러옴 */
export async function loadReadings(limit = 500): Promise<boolean> {
  const { data, error } = await supabase
    .from('tarot_question_readings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (!warn('답변 불러오기', error)) return false;
  const loaded = (data as ReadingRow[]).map(toReading);
  // 아직 서버 응답 전인 방금 만든 답변(메모리에만 있음)은 유지
  readingsStore.set((prev) => {
    const ids = new Set(loaded.map((r) => r.id));
    return [...prev.filter((r) => !ids.has(r.id)), ...loaded].sort((a, b) => b.createdAt - a.createdAt);
  });
  return true;
}

export async function loadOverrides(): Promise<boolean> {
  const { data, error } = await supabase.from('tarot_card_overrides').select('*');
  if (!warn('카드 해석 불러오기', error)) return false;
  overridesStore.set(Object.fromEntries((data as OverrideRow[]).map((r) => [r.card_key, toOverride(r)])));
  return true;
}

export async function loadIsAdmin(userId: string | null): Promise<boolean> {
  if (!userId) {
    isAdminStore.set(false);
    return false;
  }
  const { data, error } = await supabase.from('tarot_admins').select('user_id').eq('user_id', userId).maybeSingle();
  const admin = !error && !!data;
  isAdminStore.set(admin);
  return admin;
}

/** 로그아웃/계정 전환 시 이전 계정 데이터를 화면에서 지움 */
export function resetUserData() {
  readingsStore.set([]);
  isAdminStore.set(false);
}

/* ───────── 답변 쓰기 ───────── */

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** 새 답변 저장 (user_id 는 DB 기본값 auth.uid()) */
export async function addReading(reading: Reading): Promise<boolean> {
  readingsStore.set((prev) => [reading, ...prev]);
  const { error } = await supabase.from('tarot_question_readings').insert({
    id: reading.id,
    question: reading.question,
    category: reading.category,
    spread: reading.spread,
    cards: reading.cards,
    result: reading.result,
    engine_version: reading.engineVersion,
    user_feedback: reading.userFeedback ?? null,
    review: reading.review,
    created_at: new Date(reading.createdAt).toISOString(),
  });
  return warn('답변 저장', error);
}

/** 화면 상태만 바꿈 (예: aiStatus) */
export function setReadingUiState(id: string, patch: Pick<Reading, 'aiStatus'>) {
  patchLocal(id, patch);
}

export async function saveReadingAi(id: string, ai: AiAnswer): Promise<boolean> {
  patchLocal(id, { ai, aiStatus: 'done' });
  const { error } = await supabase.rpc('tarot_set_reading_ai', {
    p_id: id,
    p_result: ai.result,
    p_model: ai.model,
  });
  return warn('AI 답변 저장', error);
}

export async function saveFeedback(id: string, feedback: 'up' | 'down' | undefined): Promise<boolean> {
  patchLocal(id, { userFeedback: feedback });
  const { error } = await supabase.rpc('tarot_set_reading_feedback', {
    p_id: id,
    p_feedback: feedback ?? null,
  });
  return warn('피드백 저장', error);
}

/* ───────── 관리자(개발자 모드) 전용 ───────── */

export async function replaceReadingResult(id: string, result: ReadingResult, engineVersion: number): Promise<boolean> {
  patchLocal(id, { result, engineVersion });
  const { error } = await supabase
    .from('tarot_question_readings')
    .update({ result, engine_version: engineVersion })
    .eq('id', id);
  return warn('답변 교체', error);
}

export async function updateReview(id: string, patch: Partial<Review>): Promise<boolean> {
  const current = readingsStore.get().find((r) => r.id === id);
  if (!current) return false;
  const review: Review = { ...current.review, ...patch, reviewedAt: Date.now() };
  patchLocal(id, { review });
  const { error } = await supabase.from('tarot_question_readings').update({ review }).eq('id', id);
  return warn('검토 저장', error);
}

export async function deleteReading(id: string): Promise<boolean> {
  readingsStore.set((prev) => prev.filter((r) => r.id !== id));
  const { error } = await supabase.from('tarot_question_readings').delete().eq('id', id);
  return warn('답변 삭제', error);
}

export async function saveCardOverride(
  cardKey: string,
  patch: Omit<Partial<CardOverride>, 'updatedAt'>
): Promise<boolean> {
  const current = overridesStore.get()[cardKey] ?? { updatedAt: 0 };
  const merged: CardOverride = {
    ...current,
    ...patch,
    byCategory: { ...current.byCategory, ...patch.byCategory },
    updatedAt: Date.now(),
  };
  // 빈 문자열은 지워서 문서 해석으로 되돌아가게 함
  if (!merged.summary?.trim()) delete merged.summary;
  Object.keys(merged.byCategory ?? {}).forEach((k) => {
    const cat = k as CategoryId;
    if (!merged.byCategory?.[cat]?.trim()) delete merged.byCategory?.[cat];
  });

  const empty = !merged.summary && Object.keys(merged.byCategory ?? {}).length === 0;
  overridesStore.set((prev) => {
    const next = { ...prev };
    if (empty) delete next[cardKey];
    else next[cardKey] = merged;
    return next;
  });

  const { error } = empty
    ? await supabase.from('tarot_card_overrides').delete().eq('card_key', cardKey)
    : await supabase.from('tarot_card_overrides').upsert({
        card_key: cardKey,
        summary: merged.summary ?? null,
        by_category: merged.byCategory ?? {},
        updated_at: new Date(merged.updatedAt).toISOString(),
      });
  return warn('카드 해석 저장', error);
}

/* ───────── 백업 / 가져오기 ───────── */

export interface ExportBundle {
  exportedAt: string;
  readings: Reading[];
  overrides: Overrides;
}

export function exportAll(): ExportBundle {
  return {
    exportedAt: new Date().toISOString(),
    readings: readingsStore.get(),
    overrides: overridesStore.get(),
  };
}

/**
 * 백업 JSON(예: 예전 브라우저 저장 시절 내려받은 파일)을 서버에 합치기.
 * 이미 있는 답변(id 중복)은 건너뜀. 가져온 답변의 소유자는 현재 계정이 됩니다.
 */
export async function importAll(bundle: Partial<ExportBundle>): Promise<{ readings: number; overrides: number }> {
  let readings = 0;
  let overrides = 0;

  if (bundle.readings?.length) {
    const rows = bundle.readings.map((r) => ({
      id: r.id,
      question: r.question,
      category: r.category,
      spread: r.spread,
      cards: r.cards,
      result: r.result,
      engine_version: r.engineVersion,
      ai_result: r.ai?.result ?? null,
      ai_model: r.ai?.model ?? null,
      ai_created_at: r.ai ? new Date(r.ai.createdAt).toISOString() : null,
      user_feedback: r.userFeedback ?? null,
      review: r.review ?? { status: 'new' },
      created_at: new Date(r.createdAt).toISOString(),
    }));
    const { error } = await supabase.from('tarot_question_readings').upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (!warn('답변 가져오기', error)) throw new Error(error?.message);
    readings = rows.length;
  }

  if (bundle.overrides) {
    const rows = Object.entries(bundle.overrides).map(([key, o]) => ({
      card_key: key,
      summary: o.summary ?? null,
      by_category: o.byCategory ?? {},
      updated_at: new Date(o.updatedAt || Date.now()).toISOString(),
    }));
    if (rows.length) {
      const { error } = await supabase.from('tarot_card_overrides').upsert(rows);
      if (!warn('카드 해석 가져오기', error)) throw new Error(error?.message);
      overrides = rows.length;
    }
  }

  await Promise.all([loadReadings(), loadOverrides()]);
  return { readings, overrides };
}
