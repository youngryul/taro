import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { clearGuestId } from '../utils/guestId';

interface AuthContextType {
  user: User | null;
  session: Session | null;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // 로그인 성공 시 guest_id 삭제
      if (session?.user) {
        clearGuestId();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithKakao = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
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
    } catch (error) {
      console.error('로그아웃 오류:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithKakao,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

