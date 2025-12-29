import React, { useState, useEffect, useRef } from 'react';
import './TodayFortune.css';
import { TarotCard as TarotCardComponent } from '../TarotCard/TarotCard';
import { LoginModal } from '../Auth/LoginModal';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ACTIVE_TAROT_CARDS, 
  SELECTED_CARDS_COUNT, 
  shuffleCards,
  TarotCard as TarotCardType 
} from '../../constants/tarotCards';
import { calculateCirclePositions, SpiralPosition } from '../../utils/spiralLayout';
import { drawTodayTarot, saveTarotReading } from '../../services/tarotService';

/**
 * 애니메이션 단계 타입
 */
type Phase = 'initial' | 'spreading' | 'ready' | 'selecting' | 'result';

/**
 * 오늘의 운세 화면 컴포넌트
 * 74장의 타로카드를 나선형으로 펼치고 사용자가 직접 3장을 선택합니다.
 */
export const TodayFortune: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [phase, setPhase] = useState<Phase>('initial');
  const [shuffledCards, setShuffledCards] = useState<TarotCardType[]>([]);
  const [cardPositions, setCardPositions] = useState<SpiralPosition[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarotCardType[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<number[]>([]);
  
  // 초기 셔플 및 펼치기
  useEffect(() => {
    if (phase === 'initial') {
      // 74장 중 랜덤으로 30장 선택 (모든 카드가 보이도록)
      const shuffled = shuffleCards(ACTIVE_TAROT_CARDS);
      const selectedDeck = shuffled.slice(0, 30);
      setShuffledCards(selectedDeck);
      
      // 약간의 지연 후 펼치기 시작
      setTimeout(() => {
        setPhase('spreading');
      }, 500);
    }
  }, [phase]);

  // 카드 펼치기 애니메이션
  useEffect(() => {
    if (phase === 'spreading' && containerRef.current) {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // 원형 위치 계산
      const positions = calculateCirclePositions(
        shuffledCards.length, 
        width, 
        height
      );
      setCardPositions(positions);
      
      // 펼치기 애니메이션 완료 후 선택 가능 상태로
      setTimeout(() => {
        setPhase('ready');
      }, 2000);
    }
  }, [phase, shuffledCards.length]);

  // 카드 선택 핸들러
  const handleCardClick = (card: TarotCardType) => {
    if (phase !== 'ready' && phase !== 'selecting') return;
    
    // 이미 선택된 카드인 경우 선택 해제
    if (selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      setFlippedCardIds(flippedCardIds.filter(id => id !== card.id));
      if (phase === 'selecting' && selectedCards.length === 1) {
        setPhase('ready');
      }
      return;
    }
    
    // 최대 선택 개수 체크
    if (selectedCards.length >= SELECTED_CARDS_COUNT) return;
    
    setPhase('selecting');
    setSelectedCards([...selectedCards, card]);
    setFlippedCardIds([...flippedCardIds, card.id]);
    
    // 3장 선택 완료 시
    if (selectedCards.length + 1 === SELECTED_CARDS_COUNT) {
      setTimeout(() => {
        setPhase('result');
      }, 800);
    }
  };

  // 다시 뽑기
  const handleReset = () => {
    setPhase('initial');
    setSelectedCards([]);
    setFlippedCardIds([]);
    setCardPositions([]);
  };

  // 타로 결과 저장
  const handleSave = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (selectedCards.length !== SELECTED_CARDS_COUNT || !user?.id) {
      return;
    }

    try {
      setIsSaving(true);
      // 첫 번째 카드를 오늘의 타로로 저장
      const result = await drawTodayTarot(user.id);
      if (result.reading?.reading_id) {
        await saveTarotReading(result.reading.reading_id, user.id);
        alert('타로 결과가 저장되었습니다!');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="today-fortune">
      <div className="today-fortune__header">
        <h2 className="today-fortune__title">
          <span className="today-fortune__title-ornament">✦</span>
          오늘의 타로
          <span className="today-fortune__title-ornament">✦</span>
        </h2>
        {phase === 'ready' || phase === 'selecting' ? (
          <p className="today-fortune__instruction">
            3장의 카드를 선택하세요 ({selectedCards.length} / {SELECTED_CARDS_COUNT})
          </p>
        ) : phase === 'spreading' ? (
          <p className="today-fortune__instruction">카드를 펼치는 중...</p>
        ) : phase === 'result' ? (
          <p className="today-fortune__instruction">선택이 완료되었습니다</p>
        ) : null}
      </div>

      {phase === 'result' ? (
        // 결과 표시
        <div className="today-fortune__result">
          <div className="today-fortune__result-cards">
            {selectedCards.map((card, index) => (
              <div key={card.id} className="today-fortune__result-card-wrapper">
                <TarotCardComponent
                  card={card}
                  isFlipped={true}
                  isSelected={false}
                  position={{ x: 0, y: 0, angle: 0, scale: 1 }}
                  onClick={() => {}}
                  disabled={true}
                />
                <div className="today-fortune__result-label">
                  {index === 0 ? '과거' : index === 1 ? '현재' : '미래'}
                </div>
                <div className="today-fortune__result-meaning">
                  {card.meaning}
                </div>
              </div>
            ))}
          </div>
          <div className="today-fortune__result-actions">
            <button 
              className="today-fortune__save-button"
              onClick={handleSave}
              disabled={isSaving}
              type="button"
            >
              {isSaving ? '저장 중...' : isAuthenticated ? '이 타로 저장하기' : '이 타로를 당신의 이야기로 남길까요?'}
            </button>
            <button 
              className="today-fortune__reset-button"
              onClick={handleReset}
              type="button"
            >
              다시 뽑기
            </button>
          </div>
        </div>
      ) : (
        // 카드 덱 표시
        <div 
          ref={containerRef}
          className={`today-fortune__spread ${
            phase === 'spreading' ? 'today-fortune__spread--spreading' : ''
          } ${phase === 'ready' || phase === 'selecting' ? 'today-fortune__spread--ready' : ''}`}
        >
          {shuffledCards.map((card, index) => {
            const position = cardPositions[index] || { x: 400, y: 300, angle: 0, scale: 0.85, zIndex: 1 };
            const isSelected = selectedCards.find(c => c.id === card.id) !== undefined;
            const isFlipped = flippedCardIds.includes(card.id);
            const isDisabled = 
              phase === 'selecting' && 
              !isSelected && 
              selectedCards.length >= SELECTED_CARDS_COUNT;

            return (
              <TarotCardComponent
                key={card.id}
                card={card}
                isFlipped={isFlipped}
                isSelected={isSelected}
                position={position}
                onClick={() => handleCardClick(card)}
                disabled={isDisabled || phase === 'spreading' || phase === 'initial'}
              />
            );
          })}
        </div>
      )}
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="이 타로를 당신의 이야기로 남길까요?"
      />
    </section>
  );
};

