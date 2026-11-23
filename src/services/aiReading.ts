/**
 * OpenAI 기반 AI 답변.
 *
 * 브라우저에서 OpenAI 를 직접 부르지 않고 Supabase Edge Function(tarot-reading)을 거칩니다.
 * (CRA 의 REACT_APP_* 값은 번들에 노출되므로 API 키는 서버 Secret 으로만 관리)
 *
 * 규칙 엔진 답변(ReadingResult)을 '근거'로 넘겨, AI 는 문서 해석 안에서 문장만 다듬습니다.
 */
import { supabase } from '../lib/supabase';
import { CARD_BY_KEY } from '../data/universalTarot';
import { CATEGORY_BY_ID, CategoryId, SPREAD_BY_ID, SpreadId } from '../data/knowledge';
import { AiAnswer, DrawnCard, ReadingResult } from './storage';

/** .env 의 REACT_APP_ENABLE_AI_READING=true 일 때만 AI 답변 사용 */
export const isAiReadingEnabled = () => process.env.REACT_APP_ENABLE_AI_READING === 'true';

const FUNCTION_NAME = 'tarot-reading';

interface AiResponse {
  model: string;
  reading: {
    headline: string;
    sections: { position: string; body: string }[];
    overall: string;
    advice: string;
  };
}

export interface AiReadingInput {
  question: string;
  category: CategoryId;
  spread: SpreadId;
  cards: DrawnCard[];
  /** 규칙 엔진 결과 (근거) */
  base: ReadingResult;
}

export async function generateAiReading({ question, category, spread, cards, base }: AiReadingInput): Promise<AiAnswer> {
  const cat = CATEGORY_BY_ID[category];
  const body = {
    question: question.trim(),
    category,
    topic: cat.topic,
    spreadName: SPREAD_BY_ID[spread].name,
    cards: cards.map((c, i) => {
      const data = CARD_BY_KEY[c.key];
      return {
        key: c.key,
        position: c.position,
        name: data.name,
        nameKo: data.nameKo,
        keywords: data.keywords,
        basis: base.sections[i]?.body ?? data.summary,
      };
    }),
    overall: base.overall,
    advice: base.advice,
  };

  const { data, error } = await supabase.functions.invoke<AiResponse>(FUNCTION_NAME, { body });
  if (error || !data?.reading) throw error ?? new Error('AI 응답이 비어 있습니다.');

  const { reading } = data;
  // 카드 정보(cardKey/title)는 규칙 엔진 것을 유지하고 문장만 AI 것으로 교체
  const result: ReadingResult = {
    headline: reading.headline || base.headline,
    sections: base.sections.map((s, i) => {
      const ai = reading.sections.find((r) => r.position === s.position) ?? reading.sections[i];
      return ai?.body ? { ...s, body: ai.body, source: 'ai' } : s;
    }),
    overall: reading.overall || base.overall,
    advice: reading.advice || base.advice,
  };

  return { result, model: data.model, createdAt: Date.now() };
}
