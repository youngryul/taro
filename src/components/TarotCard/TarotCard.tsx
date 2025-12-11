import React from 'react';
import './TarotCard.css';
import { TarotCard as TarotCardType } from '../../constants/tarotCards';

interface TarotCardProps {
  card: TarotCardType;
  isFlipped: boolean;
  isSelected: boolean;
  position: {
    x: number;
    y: number;
    angle: number;
    scale: number;
    zIndex?: number;
  };
  onClick: () => void;
  disabled?: boolean;
}

/**
 * 타로 카드 컴포넌트
 * 앞면/뒷면 전환 및 Black Gold 스타일 적용
 */
export const TarotCard: React.FC<TarotCardProps> = ({
  card,
  isFlipped,
  isSelected,
  position,
  onClick,
  disabled = false,
}) => {
  return (
    <div
      className={`tarot-card ${isFlipped ? 'tarot-card--flipped' : ''} ${
        isSelected ? 'tarot-card--selected' : ''
      } ${disabled ? 'tarot-card--disabled' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) rotate(${position.angle}deg) scale(${position.scale})`,
        zIndex: position.zIndex || 1,
        '--angle': `${position.angle}deg`,
        '--scale': position.scale,
      } as React.CSSProperties}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="tarot-card__inner">
        {/* 카드 뒷면 */}
        <div className="tarot-card__back">
          <div className="tarot-card__back-border">
            <div className="tarot-card__back-corner tarot-card__back-corner--tl"></div>
            <div className="tarot-card__back-corner tarot-card__back-corner--tr"></div>
            <div className="tarot-card__back-corner tarot-card__back-corner--bl"></div>
            <div className="tarot-card__back-corner tarot-card__back-corner--br"></div>
          </div>
          <div className="tarot-card__back-pattern">
            <div className="tarot-card__back-symbol">✦</div>
            <div className="tarot-card__back-moon tarot-card__back-moon--left">☾</div>
            <div className="tarot-card__back-moon tarot-card__back-moon--right">☽</div>
          </div>
        </div>

        {/* 카드 앞면 */}
        <div className="tarot-card__front">
          <div className="tarot-card__front-border">
            <div className="tarot-card__front-corner tarot-card__front-corner--tl"></div>
            <div className="tarot-card__front-corner tarot-card__front-corner--tr"></div>
            <div className="tarot-card__front-corner tarot-card__front-corner--bl"></div>
            <div className="tarot-card__front-corner tarot-card__front-corner--br"></div>
          </div>
          <div className="tarot-card__front-content">
            <div className="tarot-card__front-header">
              <span className="tarot-card__front-ornament tarot-card__front-ornament--left">✦</span>
              <span className="tarot-card__front-ornament tarot-card__front-ornament--right">✦</span>
            </div>
            <div className="tarot-card__front-image">
              {/* 임시 이미지 - 실제로는 card.imageUrl 사용 */}
              <div className="tarot-card__front-image-placeholder">
                {card.type === 'major' ? '🦋' : '🌙'}
              </div>
            </div>
            <div className="tarot-card__front-title">
              <h3>{card.nameKo}</h3>
              <p>{card.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 선택 표시 */}
      {isSelected && (
        <div className="tarot-card__selection-indicator">
          <span className="tarot-card__selection-number">✓</span>
        </div>
      )}
    </div>
  );
};

