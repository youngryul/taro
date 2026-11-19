import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  drawTodayTarot, 
  saveTarotReading, 
  linkGuestReadingsToUser,
  TodayTarotResult 
} from '../../services/tarotService';
import { getGuestId } from '../../utils/guestId';
import { LoginModal } from '../Auth/LoginModal';
import { PaymentLock } from '../Auth/PaymentLock';
import { TarotCard as TarotCardComponent } from '../TarotCard/TarotCard';
import { TarotCard } from '../../constants/tarotCards';
import './TodayFortune.css';

/**
 * 오늘의 타로 컴포넌트 (인증 통합 버전)
 * 비로그인 사용자도 사용 가능하며, 로그인 시 히스토리 저장
 */
export const TodayFortuneWithAuth: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [tarotResult, setTarotResult] = useState<TodayTarotResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentLock, setShowPaymentLock] = useState(false);

  // 초기 타로 뽑기
  useEffect(() => {
    const loadTodayTarot = async () => {
      try {
        setLoading(true);
        const result = await drawTodayTarot(user?.id || null);
        setTarotResult(result);
      } catch (error) {
        console.error('타로 뽑기 오류:', error);
        // 오류 발생 시 기본 카드 표시
        try {
          const { TAROT_CARDS } = await import('../../constants/tarotCards');
          const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
          setTarotResult({
            card: randomCard,
            reading: null,
            isSaved: false,
            canViewDeepReading: false,
          });
        } catch (importError) {
          console.error('카드 데이터 로드 오류:', importError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadTodayTarot();
    }
  }, [user?.id, authLoading]);

  // 로그인 후 게스트 결과 연결
  useEffect(() => {
    const linkGuestData = async () => {
      if (isAuthenticated && user?.id) {
        const guestId = getGuestId();
        if (guestId) {
          try {
            await linkGuestReadingsToUser(user.id, guestId);
            // 연결 후 다시 로드
            const result = await drawTodayTarot(user.id);
            setTarotResult(result);
          } catch (error) {
            console.error('게스트 데이터 연결 오류:', error);
          }
        }
      }
    };

    linkGuestData();
  }, [isAuthenticated, user?.id]);

  // 타로 저장하기
  const handleSaveTarot = async () => {
    if (!tarotResult?.reading) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (user?.id && tarotResult.reading.reading_id) {
        await saveTarotReading(tarotResult.reading.reading_id, user.id);
        setTarotResult({
          ...tarotResult,
          isSaved: true,
        });
        alert('타로 결과가 저장되었습니다!');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 깊은 해석 보기
  const handleViewDeepReading = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!tarotResult?.canViewDeepReading) {
      setShowPaymentLock(true);
      return;
    }

    // 결제된 경우 깊은 해석 표시
    // TODO: 결제 연동 후 구현
    alert('깊은 해석 기능은 준비 중입니다.');
  };

  if (authLoading || loading) {
    return (
      <section className="today-fortune">
        <div className="today-fortune__loading">
          <div className="today-fortune__loading-spinner">✨</div>
          <p>카드를 섞고 있어요...</p>
        </div>
      </section>
    );
  }

  if (!tarotResult) {
    return null;
  }

  const { card, isSaved, canViewDeepReading } = tarotResult;

  return (
    <section className="today-fortune">
      <div className="today-fortune__header">
        <h2 className="today-fortune__title">
          <span className="today-fortune__title-ornament">✦</span>
          오늘의 타로
          <span className="today-fortune__title-ornament">✦</span>
        </h2>
        <p className="today-fortune__instruction">
          오늘 하루를 위한 당신의 카드
        </p>
      </div>

      <div className="today-fortune__result-single">
        <div className="today-fortune__card-wrapper">
          <TarotCardComponent
            card={card}
            isFlipped={true}
            isSelected={false}
            position={{ x: 0, y: 0, angle: 0, scale: 1 }}
            onClick={() => {}}
            disabled={true}
          />
        </div>

        <div className="today-fortune__interpretation">
          <h3 className="today-fortune__card-name">{card.nameKo}</h3>
          <p className="today-fortune__card-meaning">{card.meaning}</p>

          {/* 기본 해석 영역 */}
          <div className="today-fortune__reading-section">
            <h4>기본 해석</h4>
            <p>{tarotResult.reading?.reading_result || card.meaning}</p>
          </div>

          {/* 깊은 해석 영역 (결제 필요) */}
          <div className="today-fortune__deep-reading-section">
            {canViewDeepReading ? (
              <div>
                <h4>깊은 해석</h4>
                <p>{tarotResult.reading?.deep_reading_result || '깊은 해석을 준비 중입니다.'}</p>
              </div>
            ) : (
              <PaymentLock
                onUnlock={handleViewDeepReading}
                message="카드가 아직 말을 아끼고 있어요"
              />
            )}
          </div>
        </div>

        <div className="today-fortune__actions">
          {!isSaved && (
            <button
              className="today-fortune__save-button"
              onClick={handleSaveTarot}
            >
              {isAuthenticated ? '이 타로 저장하기' : '이 타로를 당신의 이야기로 남길까요?'}
            </button>
          )}
          {isSaved && (
            <div className="today-fortune__saved-badge">
              ✓ 저장됨
            </div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="이 타로를 당신의 이야기로 남길까요?"
      />
    </section>
  );
};

