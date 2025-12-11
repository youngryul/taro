/**
 * 타로 카드 데이터 정의
 * 총 74장: 메이저 아르카나 22장 + 마이너 아르카나 52장 (4벌 x 13장)
 */

export interface TarotCard {
  id: number;
  name: string;
  nameKo: string;
  type: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number?: number;
  imageUrl: string;
  meaning: string;
}

// 메이저 아르카나 (22장)
const MAJOR_ARCANA_NAMES = [
  { name: 'The Fool', nameKo: '바보', meaning: '새로운 시작, 순수함, 자유로운 영혼' },
  { name: 'The Magician', nameKo: '마법사', meaning: '창조력, 의지력, 능력' },
  { name: 'The High Priestess', nameKo: '여사제', meaning: '직관, 신비, 내면의 지혜' },
  { name: 'The Empress', nameKo: '여황제', meaning: '풍요, 모성, 자연' },
  { name: 'The Emperor', nameKo: '황제', meaning: '권위, 안정, 구조' },
  { name: 'The Hierophant', nameKo: '교황', meaning: '전통, 가르침, 신념' },
  { name: 'The Lovers', nameKo: '연인', meaning: '사랑, 선택, 조화' },
  { name: 'The Chariot', nameKo: '전차', meaning: '의지력, 승리, 결단' },
  { name: 'Strength', nameKo: '힘', meaning: '용기, 내면의 힘, 인내' },
  { name: 'The Hermit', nameKo: '은둔자', meaning: '성찰, 고독, 내면의 탐구' },
  { name: 'Wheel of Fortune', nameKo: '운명의 수레바퀴', meaning: '변화, 순환, 운명' },
  { name: 'Justice', nameKo: '정의', meaning: '공정함, 진실, 균형' },
  { name: 'The Hanged Man', nameKo: '매달린 사람', meaning: '희생, 새로운 관점, 헌신' },
  { name: 'Death', nameKo: '죽음', meaning: '변화, 종료, 재탄생' },
  { name: 'Temperance', nameKo: '절제', meaning: '균형, 조화, 절제' },
  { name: 'The Devil', nameKo: '악마', meaning: '유혹, 집착, 물질주의' },
  { name: 'The Tower', nameKo: '탑', meaning: '갑작스런 변화, 파괴, 깨달음' },
  { name: 'The Star', nameKo: '별', meaning: '희망, 영감, 평온함' },
  { name: 'The Moon', nameKo: '달', meaning: '무의식, 환상, 두려움' },
  { name: 'The Sun', nameKo: '태양', meaning: '성공, 기쁨, 생명력' },
  { name: 'Judgement', nameKo: '심판', meaning: '부활, 결산, 자각' },
  { name: 'The World', nameKo: '세계', meaning: '완성, 성취, 통합' },
];

// 마이너 아르카나 번호 이름
const MINOR_NUMBER_NAMES = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 
  'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King'
];

const MINOR_NUMBER_NAMES_KO = [
  '에이스', '2', '3', '4', '5', '6', '7', 
  '8', '9', '10', '페이지', '기사', '여왕', '왕'
];

// 슈트 정보
const SUITS = [
  { suit: 'wands', nameKo: '완드', meaning: '열정과 행동' },
  { suit: 'cups', nameKo: '컵', meaning: '감정과 관계' },
  { suit: 'swords', nameKo: '소드', meaning: '생각과 갈등' },
  { suit: 'pentacles', nameKo: '펜타클', meaning: '물질과 실용' },
];

/**
 * 전체 타로 카드 데이터 생성
 */
export const TAROT_CARDS: TarotCard[] = [
  // 메이저 아르카나
  ...MAJOR_ARCANA_NAMES.map((card, index) => ({
    id: index,
    name: card.name,
    nameKo: card.nameKo,
    type: 'major' as const,
    imageUrl: `/tarot-images/major/${index}.jpg`,
    meaning: card.meaning,
  })),
  
  // 마이너 아르카나
  ...SUITS.flatMap((suitInfo, suitIndex) =>
    MINOR_NUMBER_NAMES.map((numName, numIndex) => ({
      id: 22 + suitIndex * 14 + numIndex,
      name: `${numName} of ${suitInfo.suit}`,
      nameKo: `${suitInfo.nameKo}의 ${MINOR_NUMBER_NAMES_KO[numIndex]}`,
      type: 'minor' as const,
      suit: suitInfo.suit as 'wands' | 'cups' | 'swords' | 'pentacles',
      number: numIndex + 1,
      imageUrl: `/tarot-images/minor/${suitInfo.suit}/${numIndex}.jpg`,
      meaning: `${suitInfo.meaning}의 ${numName}`,
    }))
  ),
];

// 총 카드 수 상수 (74장 사용)
export const TOTAL_CARDS_COUNT = 74;

// 실제 사용할 카드 (74장)
export const ACTIVE_TAROT_CARDS = TAROT_CARDS.slice(0, TOTAL_CARDS_COUNT);

// 선택할 카드 수
export const SELECTED_CARDS_COUNT = 3;

/**
 * 랜덤으로 카드 셔플
 */
export const shuffleCards = (cards: TarotCard[]): TarotCard[] => {
  return [...cards].sort(() => Math.random() - 0.5);
};

/**
 * 랜덤으로 N장 선택
 */
export const drawRandomCards = (cards: TarotCard[], count: number): TarotCard[] => {
  const shuffled = shuffleCards(cards);
  return shuffled.slice(0, count);
};

