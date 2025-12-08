import React from 'react';
import './QuestionCategories.css';

/**
 * 질문 카테고리 UI 컴포넌트
 * 연애, 속마음, 재회, 금전, 이직, 합격 등의 카드형 버튼을 표시합니다.
 */
export const QuestionCategories: React.FC = () => {
  const categories = [
    { id: 1, name: '연애', icon: '💕' },
    { id: 2, name: '속마음', icon: '💭' },
    { id: 3, name: '재회', icon: '🔄' },
    { id: 4, name: '금전', icon: '💰' },
    { id: 5, name: '이직', icon: '💼' },
    { id: 6, name: '합격', icon: '🎓' },
  ];

  return (
    <section className="question-categories">
      <h2 className="question-categories__title">어떤 것이 궁금하신가요?</h2>
      <div className="question-categories__grid">
        {categories.map((category) => (
          <button
            key={category.id}
            className="question-categories__card"
            type="button"
          >
            <span className="question-categories__icon">{category.icon}</span>
            <span className="question-categories__name">{category.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

