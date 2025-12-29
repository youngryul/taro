import React, { useState, useEffect } from 'react';
import './styles/global.css';
import { Navigation, Section } from './components/Navigation/Navigation';
import { TodayFortune } from './components/TodayFortune/TodayFortune';
import { QuestionCategories } from './components/QuestionCategories/QuestionCategories';
import { HealingMessage } from './components/HealingMessage/HealingMessage';
import { TarotAdvice } from './components/TarotAdvice/TarotAdvice';
import { Statistics } from './components/Statistics/Statistics';
import { TarotHistory } from './components/TarotHistory/TarotHistory';
import { supabase } from './lib/supabase';
import './App.css';

/**
 * 타로 앱 메인 컴포넌트
 * 메뉴바를 통해 각 섹션을 독립적으로 표시합니다.
 */
const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>('fortune');

  // OAuth 콜백 처리
  useEffect(() => {
    const handleAuthCallback = async () => {
      // URL 해시에서 세션 정보 확인
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        // 세션 설정
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.session) {
          // URL 정리
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleAuthCallback();
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case 'fortune':
        return <TodayFortune />;
      case 'categories':
        return <QuestionCategories />;
      case 'healing':
        return <HealingMessage />;
      case 'advice':
        return <TarotAdvice />;
      case 'statistics':
        return <Statistics />;
      case 'history':
        return <TarotHistory />;
      default:
        return <TodayFortune />;
    }
  };

  return (
    <div className="app">
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection} 
      />
      <div className="app__container">
        {renderSection()}
      </div>
    </div>
  );
};

export default App;

