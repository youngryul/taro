import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTarotHistory } from '../../services/tarotService';
import { Database } from '../../lib/supabase';
import { TarotCard } from '../../constants/tarotCards';
import { TarotCard as TarotCardComponent } from '../TarotCard/TarotCard';
import './TarotHistory.css';

type TarotReading = Database['public']['Tables']['tarot_readings']['Row'];

/**
 * 타로 히스토리 컴포넌트
 * 로그인한 사용자의 타로 뽑기 기록을 표시
 */
export const TarotHistory: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [readings, setReadings] = useState<TarotReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<TarotCard[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const history = await getTarotHistory(user.id);
        setReadings(history);

        // 카드 데이터 로드
        const { TAROT_CARDS } = await import('../../constants/tarotCards');
        setCards(TAROT_CARDS);
      } catch (error) {
        console.error('히스토리 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="tarot-history">
        <div className="tarot-history__empty">
          <p>로그인하면 타로 히스토리를 확인할 수 있어요</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="tarot-history">
        <div className="tarot-history__loading">
          <div className="tarot-history__loading-spinner">✨</div>
          <p>히스토리를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="tarot-history">
        <h2 className="tarot-history__title">나의 타로 히스토리</h2>
        <div className="tarot-history__empty">
          <p>아직 저장된 타로가 없어요</p>
          <p className="tarot-history__empty-hint">
            오늘의 타로를 뽑고 저장해보세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tarot-history">
      <h2 className="tarot-history__title">나의 타로 히스토리</h2>
      <div className="tarot-history__list">
        {readings.map((reading) => {
          const card = cards.find((c) => c.id === reading.card_id);
          if (!card) return null;

          const date = new Date(reading.created_at);
          const dateStr = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <div key={reading.reading_id} className="tarot-history__item">
              <div className="tarot-history__card-wrapper">
                <TarotCardComponent
                  card={card}
                  isFlipped={true}
                  isSelected={false}
                  position={{ x: 0, y: 0, angle: 0, scale: 1 }}
                  onClick={() => {}}
                  disabled={true}
                />
              </div>
              <div className="tarot-history__content">
                <div className="tarot-history__header">
                  <h3 className="tarot-history__card-name">{card.nameKo}</h3>
                  <span className="tarot-history__date">{dateStr}</span>
                </div>
                <div className="tarot-history__type">
                  {reading.question_type === 'today' && '오늘의 타로'}
                  {reading.question_type === 'love' && '연애'}
                  {reading.question_type === 'career' && '커리어'}
                  {reading.question_type === 'money' && '금전'}
                  {reading.question_type === 'general' && '일반'}
                </div>
                {reading.reading_result && (
                  <p className="tarot-history__result">{reading.reading_result}</p>
                )}
                {reading.is_paid && (
                  <div className="tarot-history__badge">프리미엄</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

