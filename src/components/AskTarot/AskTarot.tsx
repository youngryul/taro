import React, { useEffect, useMemo, useRef, useState } from 'react';
import './AskTarot.css';
import { TarotCard as TarotCardComponent } from '../TarotCard/TarotCard';
import { ACTIVE_TAROT_CARDS, shuffleCards, TarotCard } from '../../constants/tarotCards';
import { calculateCirclePositions, SpiralPosition } from '../../utils/spiralLayout';
import { CATEGORIES, CATEGORY_BY_ID, CategoryId, SPREADS, SPREAD_BY_ID, SpreadId } from '../../data/knowledge';
import { cardImageUrl } from '../../data/universalTarot';
import { ENGINE_VERSION, generateReading } from '../../services/readingEngine';
import {
  addReading, newId, overridesStore, Reading, readingsStore, saveFeedback, saveReadingAi,
  setReadingUiState, useStore,
} from '../../services/storage';
import { generateAiReading, isAiReadingEnabled } from '../../services/aiReading';

type Step = 'question' | 'draw' | 'result';

/** 펼칠 카드 수 (74장 중 랜덤) */
const SPREAD_SIZE = 26;

/**
 * 질문 타로: 카테고리·질문 입력 → 카드 직접 뽑기 → 문서 기반 답변
 * 모든 질문/답변은 저장되어 개발자 모드에서 모아보고 보완할 수 있습니다.
 */
export const AskTarot: React.FC = () => {
  const [step, setStep] = useState<Step>('question');
  const [category, setCategory] = useState<CategoryId>('love');
  const [question, setQuestion] = useState('');
  const [spreadId, setSpreadId] = useState<SpreadId>('time');
  const [readingId, setReadingId] = useState<string | null>(null);

  const readings = useStore(readingsStore);
  const reading = readings.find((r) => r.id === readingId) ?? null;
  const spread = SPREAD_BY_ID[spreadId];
  const cat = CATEGORY_BY_ID[category];

  const startDraw = () => {
    if (!question.trim()) return;
    setStep('draw');
  };

  const handleDrawn = (cards: TarotCard[]) => {
    const drawn = cards.map((c, i) => ({ key: c.key, position: spread.positions[i].label }));
    const result = generateReading({
      question, category, spread: spreadId, cards: drawn, overrides: overridesStore.get(),
    });
    const record: Reading = {
      id: newId(),
      createdAt: Date.now(),
      question: question.trim(),
      category,
      spread: spreadId,
      cards: drawn,
      result,
      engineVersion: ENGINE_VERSION,
      review: { status: 'new' },
      aiStatus: isAiReadingEnabled() ? 'pending' : undefined,
    };
    // 규칙 엔진 답변을 바로 보여 주며 서버에 저장하고,
    // AI 답변이 오면 화면을 교체한 뒤 같은 행에 AI 답변을 추가 저장
    const saved = addReading(record);
    setReadingId(record.id);
    setStep('result');

    if (!isAiReadingEnabled()) return;
    const ai = generateAiReading({ question, category, spread: spreadId, cards: drawn, base: result });
    Promise.all([saved, ai])
      .then(([, answer]) => saveReadingAi(record.id, answer))
      .catch((err) => {
        console.warn('AI 답변 생성 실패, 기본 해석을 사용합니다:', err);
        setReadingUiState(record.id, { aiStatus: 'failed' });
      });
  };

  const reset = (keepQuestion: boolean) => {
    if (!keepQuestion) setQuestion('');
    setReadingId(null);
    setStep(keepQuestion ? 'draw' : 'question');
  };

  return (
    <section className="ask-tarot">
      {step === 'question' && (
        <div className="ask-tarot__panel">
          <h2 className="ask-tarot__title">✦ 무엇이 궁금하신가요? ✦</h2>

          <div className="ask-tarot__categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`ask-tarot__chip ${category === c.id ? 'ask-tarot__chip--active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                <span aria-hidden>{c.icon}</span> {c.name}
              </button>
            ))}
          </div>

          <textarea
            className="ask-tarot__input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={cat.placeholder}
            maxLength={200}
            rows={3}
          />

          <div className="ask-tarot__spreads">
            {SPREADS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`ask-tarot__spread ${spreadId === s.id ? 'ask-tarot__spread--active' : ''}`}
                onClick={() => setSpreadId(s.id)}
              >
                <strong>{s.name}</strong>
                <span>{s.description}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="ask-tarot__primary"
            onClick={startDraw}
            disabled={!question.trim()}
          >
            마음을 담아 카드 뽑기
          </button>
          <p className="ask-tarot__hint">질문을 떠올리며 {spread.positions.length}장을 직접 골라 주세요.</p>
        </div>
      )}

      {step === 'draw' && (
        <CardPicker
          count={spread.positions.length}
          labels={spread.positions.map((p) => p.label)}
          question={question}
          onBack={() => setStep('question')}
          onComplete={handleDrawn}
        />
      )}

      {step === 'result' && reading && (
        <ReadingView reading={reading} onAgain={() => reset(true)} onNew={() => reset(false)} />
      )}
    </section>
  );
};

/* ───────────────────────── 카드 고르기 ───────────────────────── */

interface CardPickerProps {
  count: number;
  labels: string[];
  question: string;
  onBack: () => void;
  onComplete: (cards: TarotCard[]) => void;
}

const CardPicker: React.FC<CardPickerProps> = ({ count, labels, question, onBack, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deck = useMemo(() => shuffleCards(ACTIVE_TAROT_CARDS).slice(0, SPREAD_SIZE), []);
  const [positions, setPositions] = useState<SpiralPosition[]>([]);
  const [picked, setPicked] = useState<TarotCard[]>([]);

  useEffect(() => {
    const layout = () => {
      const el = containerRef.current;
      if (el) setPositions(calculateCirclePositions(deck.length, el.clientWidth, el.clientHeight));
    };
    const t = window.setTimeout(layout, 300);
    window.addEventListener('resize', layout);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', layout);
    };
  }, [deck.length]);

  useEffect(() => {
    if (picked.length === count) {
      const t = window.setTimeout(() => onComplete(picked), 900);
      return () => window.clearTimeout(t);
    }
  }, [picked, count, onComplete]);

  const toggle = (card: TarotCard) => {
    if (picked.length === count) return;
    setPicked((prev) =>
      prev.some((c) => c.id === card.id) ? prev.filter((c) => c.id !== card.id) : [...prev, card]
    );
  };

  return (
    <div className="ask-tarot__draw">
      <div className="ask-tarot__draw-header">
        <button type="button" className="ask-tarot__link" onClick={onBack}>← 질문 수정</button>
        <p className="ask-tarot__draw-question">“{question}”</p>
        <p className="ask-tarot__draw-status">
          {picked.length < count
            ? `${labels[picked.length]} 카드를 골라 주세요 (${picked.length} / ${count})`
            : '카드를 읽는 중...'}
        </p>
      </div>
      <div ref={containerRef} className="ask-tarot__circle">
        {deck.map((card, i) => {
          const pos = positions[i] ?? { x: 0, y: 0, angle: 0, scale: 0.85, zIndex: 1 };
          const order = picked.findIndex((c) => c.id === card.id);
          return (
            <TarotCardComponent
              key={card.id}
              card={card}
              isFlipped={order >= 0}
              isSelected={order >= 0}
              position={pos}
              onClick={() => toggle(card)}
              disabled={positions.length === 0 || (picked.length === count && order < 0)}
            />
          );
        })}
      </div>
    </div>
  );
};

/* ───────────────────────── 결과 ───────────────────────── */

interface ReadingViewProps {
  reading: Reading;
  onAgain: () => void;
  onNew: () => void;
}

export const ReadingCards: React.FC<{ reading: Reading; size?: 'md' | 'sm' }> = ({ reading, size = 'md' }) => (
  <div className={`reading-cards reading-cards--${size}`}>
    {reading.cards.map((c, i) => (
      <figure key={`${c.key}-${i}`} className="reading-cards__item" style={{ animationDelay: `${i * 0.2}s` }}>
        <img src={cardImageUrl(c.key)} alt={reading.result.sections[i]?.title ?? c.key} />
        <figcaption>{c.position}</figcaption>
      </figure>
    ))}
  </div>
);

const ReadingView: React.FC<ReadingViewProps> = ({ reading, onAgain, onNew }) => {
  const result = reading.ai?.result ?? reading.result;
  const aiPending = reading.aiStatus === 'pending';
  const improved = reading.review.improvedAnswer?.trim();

  return (
    <div className="ask-tarot__result">
      <p className="ask-tarot__result-question">
        {CATEGORY_BY_ID[reading.category].icon} “{reading.question}”
      </p>
      <ReadingCards reading={reading} />

      <h3 className="ask-tarot__headline">{result.headline}</h3>
      {aiPending && !improved && (
        <p className="ask-tarot__ai-status">✦ 타로 리더가 당신의 질문에 맞춰 해석을 다듬고 있어요...</p>
      )}

      {improved ? (
        <article className="ask-tarot__block ask-tarot__block--improved">
          <h4>타로 마스터의 답변</h4>
          <p className="ask-tarot__pre">{improved}</p>
        </article>
      ) : (
        <>
          {result.sections.map((s) => (
            <article key={s.position} className="ask-tarot__block">
              <h4>
                <span className="ask-tarot__badge">{s.position}</span> {s.title}
              </h4>
              <p>{s.body}</p>
            </article>
          ))}
          <article className="ask-tarot__block">
            <h4>전체 흐름</h4>
            <p>{result.overall}</p>
          </article>
          <article className="ask-tarot__block ask-tarot__block--advice">
            <h4>오늘의 조언</h4>
            <p>{result.advice}</p>
          </article>
        </>
      )}

      <div className="ask-tarot__feedback">
        <span>이 해석이 도움이 되었나요?</span>
        {(['up', 'down'] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`ask-tarot__thumb ${reading.userFeedback === v ? 'ask-tarot__thumb--active' : ''}`}
            onClick={() => saveFeedback(reading.id, reading.userFeedback === v ? undefined : v)}
            aria-label={v === 'up' ? '도움이 됐어요' : '아쉬워요'}
          >
            {v === 'up' ? '👍' : '👎'}
          </button>
        ))}
      </div>

      <div className="ask-tarot__actions">
        <button type="button" className="ask-tarot__secondary" onClick={onAgain}>같은 질문 다시 뽑기</button>
        <button type="button" className="ask-tarot__primary" onClick={onNew}>새로운 질문하기</button>
      </div>
    </div>
  );
};
