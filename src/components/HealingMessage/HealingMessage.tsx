import React from 'react';
import './HealingMessage.css';

/**
 * 힐링 메시지 영역 컴포넌트
 * 따뜻한 그라데이션 배경과 손글씨 느낌의 위로/격려 문구를 표시합니다.
 */
export const HealingMessage: React.FC = () => {
  const messages = [
    '오늘도 수고했어요',
    '당신은 충분히 소중한 사람이에요',
    '작은 변화도 성장의 시작이에요',
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <section className="healing-message">
      <div className="healing-message__container">
        <p className="healing-message__text">{randomMessage}</p>
        <div className="healing-message__decoration">
          <span className="healing-message__star">✦</span>
        </div>
      </div>
    </section>
  );
};

