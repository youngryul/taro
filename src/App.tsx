import React from 'react';
import './styles/global.css';
import { TodayFortune } from './components/TodayFortune/TodayFortune';
import { QuestionCategories } from './components/QuestionCategories/QuestionCategories';
import { HealingMessage } from './components/HealingMessage/HealingMessage';
import { TarotAdvice } from './components/TarotAdvice/TarotAdvice';
import { Statistics } from './components/Statistics/Statistics';
import './App.css';

/**
 * 타로 앱 메인 컴포넌트
 * 모든 UI 섹션을 통합하여 표시합니다.
 */
const App: React.FC = () => {
  return (
    <div className="app">
      <div className="app__container">
        <TodayFortune />
        <QuestionCategories />
        <HealingMessage />
        <TarotAdvice />
        <Statistics />
      </div>
    </div>
  );
};

export default App;

