import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PaymentLock.css';

interface PaymentLockProps {
  onUnlock?: () => void;
  message?: string;
}

export const PaymentLock: React.FC<PaymentLockProps> = ({
  onUnlock,
  message = '카드가 아직 말을 아끼고 있어요',
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="payment-lock">
      <div className="payment-lock__content">
        <div className="payment-lock__icon">🔒</div>
        <p className="payment-lock__message">{message}</p>
        <p className="payment-lock__submessage">
          이 질문의 진짜 답을 확인해보세요
        </p>
        {!isAuthenticated && (
          <p className="payment-lock__hint">
            로그인 후 더 깊은 해석을 받을 수 있어요
          </p>
        )}
        {onUnlock && (
          <button className="payment-lock__button" onClick={onUnlock}>
            {isAuthenticated ? '깊은 해석 보기' : '로그인하기'}
          </button>
        )}
      </div>
      <div className="payment-lock__blur"></div>
    </div>
  );
};

