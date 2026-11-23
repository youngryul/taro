/**
 * 비로그인 사용자 식별자.
 *
 * 브라우저 저장소 대신 Supabase 익명 로그인(signInAnonymously)의 사용자 ID 를 guest_id 로 씁니다.
 * AuthContext 가 세션이 바뀔 때 setAnonymousUserId 로 값을 채웁니다.
 */

let anonymousUserId: string | null = null;
let fallbackId: string | null = null;

export const setAnonymousUserId = (id: string | null): void => {
  anonymousUserId = id;
};

/**
 * guest_id 조회. 익명 로그인이 꺼져 있는 등 세션이 없으면
 * 이번 페이지에서만 유지되는 임시 ID 를 돌려줍니다.
 */
export const getOrCreateGuestId = (): string => {
  if (anonymousUserId) return anonymousUserId;
  if (!fallbackId) fallbackId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  return fallbackId;
};

export const clearGuestId = (): void => {
  anonymousUserId = null;
};

/** 현재 guest_id 조회 (익명 세션이 없으면 null) */
export const getGuestId = (): string | null => anonymousUserId;
