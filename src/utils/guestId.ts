/**
 * 비로그인 사용자를 위한 guest_id 생성 및 관리
 * localStorage를 사용하여 브라우저별로 고유한 ID 생성
 */

const GUEST_ID_KEY = 'tarot_flow_guest_id';

/**
 * guest_id 생성 또는 조회
 */
export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    // UUID v4 형식으로 생성 (간단한 버전)
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
};

/**
 * guest_id 삭제 (로그인 후 사용)
 */
export const clearGuestId = (): void => {
  localStorage.removeItem(GUEST_ID_KEY);
};

/**
 * 현재 guest_id 조회 (없으면 null)
 */
export const getGuestId = (): string | null => {
  return localStorage.getItem(GUEST_ID_KEY);
};

