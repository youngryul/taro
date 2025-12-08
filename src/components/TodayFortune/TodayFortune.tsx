import React from 'react';
import './TodayFortune.css';
import { CARD_FLOAT_DURATION, CARD_FLOAT_DELAY_1, CARD_FLOAT_DELAY_2, CARD_FLOAT_DELAY_3 } from '../../constants/animations';

/**
 * 오늘의 운세 화면 컴포넌트
 * 부드럽게 빛나는 3장의 타로 카드를 표시합니다.
 */
export const TodayFortune: React.FC = () => {
  const cards = [
    { id: 1, name: '과거', delay: CARD_FLOAT_DELAY_1 },
    { id: 2, name: '현재', delay: CARD_FLOAT_DELAY_2 },
    { id: 3, name: '미래', delay: CARD_FLOAT_DELAY_3 },
  ];

  return (
    <section className="today-fortune">
      <h2 className="today-fortune__title">오늘의 운세</h2>
      <div className="today-fortune__cards">
        {cards.map((card) => (
          <div
            key={card.id}
            className="today-fortune__card"
            style={{
              animationDelay: card.delay,
              animationDuration: CARD_FLOAT_DURATION,
            }}
          >
            <div className="today-fortune__card-inner">
              <div className="today-fortune__card-glow"></div>
              <div className="today-fortune__card-content">
                <span className="today-fortune__card-label">{card.name}</span>
                <div className="today-fortune__card-pattern"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

