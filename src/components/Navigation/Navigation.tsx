import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../Auth/LoginModal';
import './Navigation.css';

export type Section = 'fortune' | 'categories' | 'healing' | 'advice' | 'statistics' | 'history';

interface NavigationProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
}

/**
 * 네비게이션 메뉴바 컴포넌트
 * 각 섹션으로 이동할 수 있는 메뉴를 제공합니다.
 */
export const Navigation: React.FC<NavigationProps> = ({
  currentSection,
  onSectionChange,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const menuItems: { id: Section; label: string; icon: string }[] = [
    { id: 'fortune', label: '오늘의 타로', icon: '🎴' },
    { id: 'categories', label: '질문 카테고리', icon: '💭' },
    { id: 'healing', label: '힐링 메시지', icon: '✨' },
    { id: 'advice', label: '타로 조언', icon: '🔮' },
    { id: 'statistics', label: '통계', icon: '📊' },
    { id: 'history', label: '히스토리', icon: '📜' },
  ];

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      try {
        await signOut();
      } catch (error) {
        console.error('로그아웃 오류:', error);
      }
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <nav className="navigation">
        <div className="navigation__container">
          <div className="navigation__logo">
            <span className="navigation__logo-icon">🔮</span>
            <span className="navigation__logo-text">Tarot Flow</span>
          </div>
          <ul className="navigation__menu">
            {menuItems.map((item) => (
              <li key={item.id} className="navigation__menu-item">
                <button
                  className={`navigation__menu-button ${
                    currentSection === item.id ? 'navigation__menu-button--active' : ''
                  }`}
                  onClick={() => onSectionChange(item.id)}
                  type="button"
                >
                  <span className="navigation__menu-icon">{item.icon}</span>
                  <span className="navigation__menu-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="navigation__auth">
            <button
              className="navigation__auth-button"
              onClick={handleAuthClick}
              type="button"
            >
              {isAuthenticated ? (
                <>
                  <span className="navigation__auth-icon">👤</span>
                  <span className="navigation__auth-text">
                    {user?.email?.split('@')[0] || '로그아웃'}
                  </span>
                </>
              ) : (
                <>
                  <span className="navigation__auth-icon">🔐</span>
                  <span className="navigation__auth-text">로그인</span>
                </>
              )}
            </button>
          </div>
        </div>
      </nav>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

