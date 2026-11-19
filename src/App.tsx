import React, { useEffect, useState } from 'react';
import './styles/global.css';
import { Navigation, Section } from './components/Navigation/Navigation';
import { TodayFortune } from './components/TodayFortune/TodayFortune';
import { AskTarot } from './components/AskTarot/AskTarot';
import { HealingMessage } from './components/HealingMessage/HealingMessage';
import { TarotAdvice } from './components/TarotAdvice/TarotAdvice';
import { Statistics } from './components/Statistics/Statistics';
import { DevMode } from './components/DevMode/DevMode';
import { devModeStore, useStore } from './services/storage';
import './App.css';

/** 주소에 ?dev 또는 #dev 가 있으면 개발자 모드를 켭니다 */
const urlRequestsDevMode = () =>
  /[?&]dev\b/.test(window.location.search) || window.location.hash === '#dev';

/**
 * 타로 앱 메인 컴포넌트
 * 메뉴바를 통해 각 섹션을 독립적으로 표시합니다.
 */
const App: React.FC = () => {
  const devMode = useStore(devModeStore);
  const [currentSection, setCurrentSection] = useState<Section>(
    urlRequestsDevMode() ? 'dev' : 'fortune'
  );

  useEffect(() => {
    const sync = () => urlRequestsDevMode() && devModeStore.set(true);
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  // 개발자 모드를 끄면 개발자 화면에서 빠져나옴
  useEffect(() => {
    if (!devMode && currentSection === 'dev') setCurrentSection('ask');
  }, [devMode, currentSection]);

  const renderSection = () => {
    switch (currentSection) {
      case 'fortune':
        return <TodayFortune />;
      case 'ask':
        return <AskTarot />;
      case 'healing':
        return <HealingMessage />;
      case 'advice':
        return <TarotAdvice />;
      case 'statistics':
        return <Statistics />;
      case 'dev':
        return devMode ? <DevMode /> : <AskTarot />;
      default:
        return <TodayFortune />;
    }
  };

  return (
    <div className="app">
      <Navigation
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        showDev={devMode}
      />
      <div className="app__container">
        {renderSection()}
      </div>
    </div>
  );
};

export default App;
