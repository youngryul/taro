import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { setAnonymousUserId } from '../utils/guestId';

interface AuthContextType {
  /** 소셜 로그인한 사용자 (익명 사용자는 null) */
  user: User | null;
  session: Session | null;
  /** 현재 Supabase 계정 ID — 익명 사용자 포함. 데이터 소유자(auth.uid()) */
  uid: string | null;
  isAnonymous: boolean;
  loading: boolean;
  signInWithKakao: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/** 소셜 로그인 리다이렉트에 실어 보내는 '로그인 전 익명 계정 ID' 파라미터 */
const GUEST_PARAM = 'guest';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const takeGuestParam = (): string | null => {
  const url = new URL(window.location.href);
  const id = url.searchParams.get(GUEST_PARAM);
  if (!id) return null;
  url.searchParams.delete(GUEST_PARAM);
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
  return UUID_RE.test(id) ? id : null;
};

/** 익명 계정으로 남긴 기록(질문 타로 + 오늘의 타로)을 방금 로그인한 계정으로 옮김 */
const claimGuestData = async (guestId: string) => {
  const { error } = await supabase.rpc('tarot_claim_guest_readings', { p_guest_id: guestId });
  if (error) console.warn('익명 기록 이전 실패:', error.message);
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const signingInAnonymously = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const apply = async (next: Session | null) => {
      // 세션이 없으면 익명 계정으로 로그인 → 비로그인 사용자도 서버에 자기 기록을 저장
      if (!next) {
        if (signingInAnonymously.current) return;
        signingInAnonymously.current = true;
        const { error } = await supabase.auth.signInAnonymously();
        signingInAnonymously.current = false;
        if (error) {
          console.warn(
            '익명 로그인 실패 — Supabase Dashboard 에서 Anonymous sign-ins 를 켜 주세요:',
            error.message
          );
          if (!cancelled) {
            setSession(null);
            setAnonymousUserId(null);
            setLoading(false);
          }
        }
        // 성공 시 onAuthStateChange 가 새 세션으로 다시 apply 를 호출
        return;
      }

      const anonymous = !!next.user.is_anonymous;
      if (!anonymous) {
        const guestId = takeGuestParam();
        if (guestId && guestId !== next.user.id) await claimGuestData(guestId);
      }
      if (cancelled) return;
      setAnonymousUserId(anonymous ? next.user.id : null);
      setSession(next);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    // 콜백 안에서 바로 supabase 를 호출하면 교착될 수 있어 다음 틱으로 미룸
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'INITIAL_SESSION') return; // getSession 에서 처리
      window.setTimeout(() => apply(next), 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const redirectTo = () => {
    const url = new URL(`${window.location.origin}/auth/callback`);
    const current = session?.user;
    if (current?.is_anonymous) url.searchParams.set(GUEST_PARAM, current.id);
    return url.toString();
  };

  const signInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectTo(),
          // account_email을 제외하기 위해 queryParams에 scope를 명시
          // 카카오 디벨로퍼스 콘솔에서 설정한 동의 항목과 일치해야 함
          queryParams: {
            // profile_nickname과 profile_image만 요청 (account_email 제외)
            // 참고: Supabase Dashboard에서도 카카오 OAuth 설정 확인 필요
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Kakao 로그인 오류:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectTo() },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // onAuthStateChange(SIGNED_OUT) → 새 익명 계정으로 다시 로그인
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  const isAnonymous = !!session?.user.is_anonymous;
  const user = session && !isAnonymous ? session.user : null;

  const value: AuthContextType = {
    user,
    session,
    uid: session?.user.id ?? null,
    isAnonymous,
    loading,
    signInWithKakao,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
