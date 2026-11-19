/**
 * 브라우저 localStorage 기반 저장소.
 * - readings  : 사용자가 한 질문과 생성된 답변 (개발자 모드에서 모아보고 보완)
 * - overrides : 개발자가 보완한 카드 해석 (다음 답변 생성부터 반영)
 * - devMode   : 개발자 모드 메뉴 노출 여부
 *
 * 서버가 생기면 이 파일의 load/save 만 API 호출로 바꾸면 됩니다.
 */
import { useSyncExternalStore } from 'react';
import { CategoryId, SpreadId } from '../data/knowledge';

export interface CardSection {
  position: string;
  cardKey: string;
  title: string;
  body: string;
  /** 해석 출처: 개발자 보완(override) / 문서(doc) */
  source: 'override' | 'doc';
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

export interface Reading {
  id: string;
  createdAt: number;
  question: string;
  category: CategoryId;
  spread: SpreadId;
  cards: DrawnCard[];
  result: ReadingResult;
  engineVersion: number;
  userFeedback?: 'up' | 'down';
  review: Review;
}

export interface CardOverride {
  summary?: string;
  byCategory?: Partial<Record<CategoryId, string>>;
  updatedAt: number;
}

export type Overrides = Record<string, CardOverride>;

/* ───────── 아주 작은 pub/sub 스토어 ───────── */

const KEYS = {
  readings: 'taro.readings.v1',
  overrides: 'taro.overrides.v1',
  devMode: 'taro.devMode',
} as const;

export interface Store<T> {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
}

function createStore<T>(key: string, fallback: T): Store<T> {
  let state: T = fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) state = JSON.parse(raw) as T;
  } catch {
    // 저장소 접근 불가(시크릿 모드 등) → 메모리에서만 동작
  }
  const listeners = new Set<() => void>();

  return {
    get: () => state,
    set(next: T | ((prev: T) => T)) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // 용량 초과 등은 무시하고 메모리 상태는 유지
      }
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const readingsStore = createStore<Reading[]>(KEYS.readings, []);
export const overridesStore = createStore<Overrides>(KEYS.overrides, {});
export const devModeStore = createStore<boolean>(KEYS.devMode, false);

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/* ───────── 도우미 ───────── */

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function addReading(reading: Reading) {
  readingsStore.set((prev) => [reading, ...prev]);
}

export function updateReading(id: string, patch: Partial<Reading>) {
  readingsStore.set((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export function updateReview(id: string, patch: Partial<Review>) {
  readingsStore.set((prev) =>
    prev.map((r) => (r.id === id ? { ...r, review: { ...r.review, ...patch, reviewedAt: Date.now() } } : r))
  );
}

export function deleteReading(id: string) {
  readingsStore.set((prev) => prev.filter((r) => r.id !== id));
}

export function saveCardOverride(cardKey: string, patch: Omit<Partial<CardOverride>, 'updatedAt'>) {
  overridesStore.set((prev) => {
    const current = prev[cardKey] ?? { updatedAt: 0 };
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
    return { ...prev, [cardKey]: merged };
  });
}

/* ───────── 백업 / 복원 ───────── */

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

export function importAll(bundle: Partial<ExportBundle>, mode: 'merge' | 'replace') {
  if (bundle.readings) {
    const incoming = bundle.readings;
    readingsStore.set((prev) => {
      if (mode === 'replace') return incoming;
      const ids = new Set(prev.map((r) => r.id));
      return [...incoming.filter((r) => !ids.has(r.id)), ...prev].sort((a, b) => b.createdAt - a.createdAt);
    });
  }
  if (bundle.overrides) {
    const incoming = bundle.overrides;
    overridesStore.set((prev) => (mode === 'replace' ? incoming : { ...prev, ...incoming }));
  }
}
