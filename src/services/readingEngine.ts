/**
 * 규칙 기반 타로 해석 엔진.
 *
 * 답변 = (자리별 카드 해석) + (전체 흐름 분석) + (조언)
 * - 카드 해석 우선순위: 개발자 보완(카테고리별) → 개발자 보완(요약) → 문서 요약
 * - 문서 메모(notes) 중 질문 카테고리와 관련된 줄을 골라 근거로 붙임
 * - 전체 흐름: 메이저 비율, 4원소 분포, 슈트/숫자 반복, 인물 카드
 *
 * 나중에 LLM(예: Claude API)으로 바꾸더라도, 이 엔진이 만든 근거(sections)를
 * 프롬프트 재료로 그대로 쓸 수 있도록 구조를 나눠 두었습니다.
 */
import { CARD_BY_KEY, CardData, Element, Suit } from '../data/universalTarot';
import {
  CATEGORY_BY_ID, CategoryId, ELEMENTS, NUMBERS, SPREAD_BY_ID, SpreadId, SUITS,
} from '../data/knowledge';
import { CardSection, DrawnCard, Overrides, ReadingResult } from './storage';

export const ENGINE_VERSION = 1;

const POSITION_LEAD: Record<string, string> = {
  '핵심 메시지': '',
  '과거': '지금 상황의 바탕에는 이런 흐름이 있었습니다. ',
  '현재': '지금 당신은 이런 상태에 놓여 있습니다. ',
  '미래': '이대로 흘러가면 이런 방향이 보입니다. ',
  '상황': '질문의 현재 상황은 이렇습니다. ',
  '조언': '이렇게 해보길 권합니다. ',
  '결과': '조언을 따른다면 이런 결과로 이어집니다. ',
};

/** 문서 해석을 바탕으로 한 카드의 기본 톤 (+1 긍정, -1 주의, 0 중립/변화) */
const TONE: Record<string, number> = {
  m1: 1, m3: 1, m5: 1, m6: 1, m8: 1, m10: 1, m17: 1, m19: 1, m20: 1, m21: 1,
  m12: -1, m15: -1, m16: -1, m18: -1,
  w1: 1, w4: 1, w6: 1, w8: 1, w3: -1, w5: -1, w7: -1, w9: -1, w10: -1,
  c1: 1, c2: 1, c6: 1, c9: 1, c10: 1, c4: -1, c5: -1, c7: -1, c8: -1, ckn: -1,
  s6: 1, sk: 1, s2: -1, s3: -1, s4: -1, s5: -1, s7: -1, s8: -1, s9: -1, s10: -1,
  d3: 1, d6: 1, d8: 1, d9: 1, d10: 1, dk: 1, d4: -1, d5: -1, d7: -1,
};

const ADVICE_MARKERS = ['필요', '해야', '하세요', '말자', '주의', '다스려야', '직시'];

const pickNotes = (card: CardData, terms: string[], limit: number) => {
  if (terms.length === 0) return [];
  return card.notes
    .filter((line) => terms.some((t) => line.includes(t)) && !line.includes('연예인'))
    .slice(0, limit);
};

function buildSection(
  card: CardData,
  position: string,
  category: CategoryId,
  overrides: Overrides
): CardSection {
  const cat = CATEGORY_BY_ID[category];
  const ov = overrides[card.key];
  const lead = POSITION_LEAD[position] ?? '';
  const title = `${card.nameKo} · ${card.name}`;

  const custom = ov?.byCategory?.[category];
  if (custom) {
    return { position, cardKey: card.key, title, body: lead + custom, source: 'override' };
  }

  const summary = ov?.summary ?? card.summary;
  const related = pickNotes(card, cat.terms, 2);
  let detail = '';
  if (related.length > 0) {
    detail = ` ${cat.topic}에 비추어 보면 ‘${related.join('’, ‘')}’의 의미가 있습니다.`;
  } else if (category !== 'general') {
    detail = ` 이 카드의 키워드(${card.keywords.slice(0, 3).join(' · ')})를 ${cat.topic}에 비추어 생각해 보세요.`;
  }

  return {
    position,
    cardKey: card.key,
    title,
    body: lead + summary + detail,
    source: ov?.summary ? 'override' : 'doc',
  };
}

function analyzeOverall(cards: CardData[]): string {
  const lines: string[] = [];
  const total = cards.length;
  const majors = cards.filter((c) => c.type === 'major').length;

  if (total === 1) {
    lines.push(
      cards[0].type === 'major'
        ? '메이저 카드가 나왔습니다. 개인의 의지를 넘어서는 큰 흐름이 작용하고 있는 질문입니다.'
        : '마이너 카드가 나왔습니다. 일상 속의 구체적인 사건과 선택으로 풀려 가는 문제입니다.'
    );
  } else if (majors >= 2) {
    lines.push(`${total}장 중 메이저 카드가 ${majors}장입니다. 통제하기 어려운 큰 흐름(운명적인 힘)이 강하게 작용하고 있어요.`);
  } else if (majors === 0) {
    lines.push('모두 마이너 카드입니다. 큰 운명보다는 일상적이고 구체적인 사건들로 풀려 가는 질문이에요.');
  }

  // 4원소 분포
  const elementCount = new Map<Element, number>();
  cards.forEach((c) => c.element && elementCount.set(c.element, (elementCount.get(c.element) ?? 0) + 1));
  const sorted = Array.from(elementCount.entries()).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 2) {
    const [el] = sorted[0];
    lines.push(`${ELEMENTS[el].ko}의 기운이 두드러집니다 — ${ELEMENTS[el].temperament}이 이 질문의 분위기를 이끌고 있어요.`);
  } else if (total >= 3 && sorted.length >= 3) {
    lines.push('서로 다른 원소가 고르게 섞여 있어, 한쪽으로 치우치지 않은 균형 잡힌 흐름입니다.');
  }

  // 슈트 반복
  const suitCount = new Map<Suit, number>();
  cards.forEach((c) => c.suit && suitCount.set(c.suit, (suitCount.get(c.suit) ?? 0) + 1));
  suitCount.forEach((n, suit) => {
    if (n >= 2) {
      const theme = SUITS[suit].theme.split(',').slice(0, 4).join(',').trim();
      lines.push(`${SUITS[suit].ko} 카드가 ${n}장 — ${theme} 같은 주제가 반복됩니다.`);
    }
  });

  // 숫자 반복 (Ace~10)
  const numberCount = new Map<number, number>();
  cards.forEach((c) => c.type === 'minor' && c.number <= 10 && numberCount.set(c.number, (numberCount.get(c.number) ?? 0) + 1));
  numberCount.forEach((n, num) => {
    if (n >= 2) lines.push(`숫자 ${num}이(가) ${n}번 나왔습니다 — ${NUMBERS[num]}.`);
  });

  // 인물 카드
  const courts = cards.filter((c) => c.type === 'minor' && c.number > 10);
  if (courts.length > 0) {
    lines.push(`인물 카드(${courts.map((c) => c.nameKo).join(', ')})가 있어, 특정 사람의 성향이나 태도가 결과에 영향을 줍니다.`);
  }

  // 전체 톤
  const score = cards.reduce((sum, c) => sum + (TONE[c.key] ?? 0), 0);
  if (score >= Math.max(1, Math.ceil(total / 2))) lines.push('전체적으로 긍정적인 기운이 우세한 흐름입니다.');
  else if (score <= -Math.max(1, Math.ceil(total / 2))) lines.push('전체적으로 조심스럽게 다뤄야 할 흐름이지만, 카드가 알려준 지점을 알면 충분히 대비할 수 있어요.');
  else if (total > 1) lines.push('좋은 기운과 주의할 점이 섞여 있어, 어떤 선택을 하느냐에 따라 결과가 달라질 수 있습니다.');

  return lines.join(' ');
}

function buildAdvice(cards: CardData[], spread: SpreadId): string {
  // 조언 자리 카드 → 마지막 카드 → 나머지 순으로 조언 문장을 찾음
  const order =
    spread === 'advice' && cards.length >= 2
      ? [cards[1], cards[cards.length - 1], ...cards]
      : [cards[cards.length - 1], ...cards];
  const seen = new Set<string>();
  const tips: string[] = [];
  for (const card of order) {
    for (const line of card.notes) {
      if (tips.length >= 2) break;
      if (!seen.has(line) && ADVICE_MARKERS.some((m) => line.includes(m))) {
        seen.add(line);
        tips.push(line.replace(/^.*?-/, '').trim());
      }
    }
  }
  const key = order[0];
  if (tips.length === 0) tips.push(key.notes[0]);
  const base = `‘${key.keywords[0]}’을(를) 마음에 두세요.`;
  return tips.length > 0 ? `${base} 카드가 전하는 말: ${tips.map((t) => `“${t}”`).join(' / ')}` : base;
}

export interface GenerateInput {
  question: string;
  category: CategoryId;
  spread: SpreadId;
  cards: DrawnCard[];
  overrides: Overrides;
}

export function generateReading({ category, spread, cards, overrides }: GenerateInput): ReadingResult {
  const datas = cards.map((c) => CARD_BY_KEY[c.key]);
  const sections = cards.map((c, i) => buildSection(datas[i], c.position, category, overrides));
  const cat = CATEGORY_BY_ID[category];
  const last = datas[datas.length - 1];
  const headline =
    SPREAD_BY_ID[spread].positions.length === 1
      ? `${last.nameKo} — ‘${last.keywords[0]}’이(가) ${cat.topic}의 핵심입니다`
      : `${cat.topic}의 흐름: ${datas.map((d) => d.keywords[0]).join(' → ')}`;

  return {
    headline,
    sections,
    overall: analyzeOverall(datas),
    advice: buildAdvice(datas, spread),
  };
}

/** 개발자 모드 복사/비교용 평문 */
export function readingToText(result: ReadingResult): string {
  return [
    result.headline,
    '',
    ...result.sections.map((s) => `[${s.position}] ${s.title}\n${s.body}`),
    '',
    `[전체 흐름] ${result.overall}`,
    `[조언] ${result.advice}`,
  ].join('\n');
}
