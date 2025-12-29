import React, { useState } from 'react';
import './styles/global.css';
import { Navigation, Section } from './components/Navigation/Navigation';
import { TodayFortune } from './components/TodayFortune/TodayFortune';
import { QuestionCategories } from './components/QuestionCategories/QuestionCategories';
import { HealingMessage } from './components/HealingMessage/HealingMessage';
import { TarotAdvice } from './components/TarotAdvice/TarotAdvice';
import { Statistics } from './components/Statistics/Statistics';
import './App.css';

/**
 * 타로 앱 메인 컴포넌트
 * 메뉴바를 통해 각 섹션을 독립적으로 표시합니다.
 */
const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<Section>('fortune');

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

