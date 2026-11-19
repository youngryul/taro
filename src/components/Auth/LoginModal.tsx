import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginModal.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  message = '이 타로를 당신의 이야기로 남길까요?',
}) => {
  const { signInWithKakao, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    try {
      switch (provider) {
        case 'kakao':
          await signInWithKakao();
          break;
        case 'google':
          await signInWithGoogle();
          break;
      }
    } catch (error) {
      console.error(`${provider} 로그인 오류:`, error);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-modal__close" onClick={onClose}>
          ✕
        </button>
        
        <div className="login-modal__content">
          <h2 className="login-modal__title">로그인이 필요해요</h2>
          <p className="login-modal__message">{message}</p>
          
          <div className="login-modal__buttons">
            <button
              className="login-modal__button login-modal__button--kakao"
              onClick={() => handleSocialLogin('kakao')}
            >
              <span className="login-modal__icon">💬</span>
              카카오로 시작하기
            </button>
            
            <button
              className="login-modal__button login-modal__button--google"
              onClick={() => handleSocialLogin('google')}
            >
              <span className="login-modal__icon">🔍</span>
              Google로 시작하기
            </button>
          </div>
          
          <p className="login-modal__footer">
            로그인하면 타로 히스토리와 개인화된 해석을 받을 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
};

