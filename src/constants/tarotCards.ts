/**
 * 타로 카드 데이터 (막스웰 밀러 유니버셜 타로 74장)
 * 실제 데이터는 src/data/universalTarot.ts 에 있고, 여기서는 화면용 형태로 변환합니다.
 */
import { ALL_CARDS, CardData, cardImageUrl, Suit } from '../data/universalTarot';

export interface TarotCard {
  id: number;
  key: string;
  name: string;
  nameKo: string;
  type: 'major' | 'minor';
  suit?: Suit;
  number?: number;
  imageUrl: string;
  meaning: string;
}

const toTarotCard = (card: CardData, id: number): TarotCard => ({
  id,
  key: card.key,
  name: card.name,
  nameKo: card.nameKo,
  type: card.type,
  suit: card.suit,
  number: card.number,
  imageUrl: cardImageUrl(card.key),
  meaning: card.keywords.join(', '),
});

/** 전체 74장 (메이저 0~21, 이후 완드·컵·소드·디스크 순) */
export const TAROT_CARDS: TarotCard[] = ALL_CARDS.map(toTarotCard);

export const TOTAL_CARDS_COUNT = TAROT_CARDS.length;

export const ACTIVE_TAROT_CARDS = TAROT_CARDS;

// 선택할 카드 수
export const SELECTED_CARDS_COUNT = 3;

/**
 * Fisher–Yates 셔플 (모든 순서가 같은 확률로 나옴)
 */
export const shuffleCards = <T,>(cards: T[]): T[] => {
  const result = [...cards];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * 랜덤으로 N장 선택
 */
export const drawRandomCards = (cards: TarotCard[], count: number): TarotCard[] =>
  shuffleCards(cards).slice(0, count);
