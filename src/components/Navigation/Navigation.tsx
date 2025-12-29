import React from 'react';
import './Navigation.css';

export type Section = 'fortune' | 'categories' | 'healing' | 'advice' | 'statistics';

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
  const menuItems: { id: Section; label: string; icon: string }[] = [
    { id: 'fortune', label: '오늘의 타로', icon: '🎴' },
    { id: 'categories', label: '질문 카테고리', icon: '💭' },
    { id: 'healing', label: '힐링 메시지', icon: '✨' },
    { id: 'advice', label: '타로 조언', icon: '🔮' },
    { id: 'statistics', label: '통계', icon: '📊' },
  ];

  return (
    <nav className="navigation">
      <div className="navigation__container">
        <div className="navigation__logo">
          <span className="navigation__logo-icon">🔮</span>
          <span className="navigation__logo-text">타로</span>
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
      </div>
    </nav>
  );
};

