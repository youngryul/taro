-- ============================================
-- 타로 카드 데이터 마이그레이션
-- 프론트엔드의 src/constants/tarotCards.ts를 기반으로 작성
-- 총 74장: 메이저 아르카나 22장 + 마이너 아르카나 52장
-- ============================================

-- 기존 데이터 삭제 (선택사항 - 필요시 주석 해제)
-- DELETE FROM public.tarot_cards;

-- 메이저 아르카나 22장 삽입
INSERT INTO public.tarot_cards (card_id, card_name, card_name_ko, card_type, card_suit, card_number, card_image_url, card_meaning_upright) VALUES
(0, 'The Fool', '바보', 'major', NULL, NULL, '/tarot-images/major/0.jpg', '새로운 시작, 순수함, 자유로운 영혼'),
(1, 'The Magician', '마법사', 'major', NULL, NULL, '/tarot-images/major/1.jpg', '창조력, 의지력, 능력'),
(2, 'The High Priestess', '여사제', 'major', NULL, NULL, '/tarot-images/major/2.jpg', '직관, 신비, 내면의 지혜'),
(3, 'The Empress', '여황제', 'major', NULL, NULL, '/tarot-images/major/3.jpg', '풍요, 모성, 자연'),
(4, 'The Emperor', '황제', 'major', NULL, NULL, '/tarot-images/major/4.jpg', '권위, 안정, 구조'),
(5, 'The Hierophant', '교황', 'major', NULL, NULL, '/tarot-images/major/5.jpg', '전통, 가르침, 신념'),
(6, 'The Lovers', '연인', 'major', NULL, NULL, '/tarot-images/major/6.jpg', '사랑, 선택, 조화'),
(7, 'The Chariot', '전차', 'major', NULL, NULL, '/tarot-images/major/7.jpg', '의지력, 승리, 결단'),
(8, 'Strength', '힘', 'major', NULL, NULL, '/tarot-images/major/8.jpg', '용기, 내면의 힘, 인내'),
(9, 'The Hermit', '은둔자', 'major', NULL, NULL, '/tarot-images/major/9.jpg', '성찰, 고독, 내면의 탐구'),
(10, 'Wheel of Fortune', '운명의 수레바퀴', 'major', NULL, NULL, '/tarot-images/major/10.jpg', '변화, 순환, 운명'),
(11, 'Justice', '정의', 'major', NULL, NULL, '/tarot-images/major/11.jpg', '공정함, 진실, 균형'),
(12, 'The Hanged Man', '매달린 사람', 'major', NULL, NULL, '/tarot-images/major/12.jpg', '희생, 새로운 관점, 헌신'),
(13, 'Death', '죽음', 'major', NULL, NULL, '/tarot-images/major/13.jpg', '변화, 종료, 재탄생'),
(14, 'Temperance', '절제', 'major', NULL, NULL, '/tarot-images/major/14.jpg', '균형, 조화, 절제'),
(15, 'The Devil', '악마', 'major', NULL, NULL, '/tarot-images/major/15.jpg', '유혹, 집착, 물질주의'),
(16, 'The Tower', '탑', 'major', NULL, NULL, '/tarot-images/major/16.jpg', '갑작스런 변화, 파괴, 깨달음'),
(17, 'The Star', '별', 'major', NULL, NULL, '/tarot-images/major/17.jpg', '희망, 영감, 평온함'),
(18, 'The Moon', '달', 'major', NULL, NULL, '/tarot-images/major/18.jpg', '무의식, 환상, 두려움'),
(19, 'The Sun', '태양', 'major', NULL, NULL, '/tarot-images/major/19.jpg', '성공, 기쁨, 생명력'),
(20, 'Judgement', '심판', 'major', NULL, NULL, '/tarot-images/major/20.jpg', '부활, 결산, 자각'),
(21, 'The World', '세계', 'major', NULL, NULL, '/tarot-images/major/21.jpg', '완성, 성취, 통합');

-- 마이너 아르카나 - 완드 (Wands) 14장
INSERT INTO public.tarot_cards (card_id, card_name, card_name_ko, card_type, card_suit, card_number, card_image_url, card_meaning_upright) VALUES
(22, 'Ace of wands', '완드의 에이스', 'minor', 'wands', 1, '/tarot-images/minor/wands/0.jpg', '열정과 행동의 Ace'),
(23, 'Two of wands', '완드의 2', 'minor', 'wands', 2, '/tarot-images/minor/wands/1.jpg', '열정과 행동의 Two'),
(24, 'Three of wands', '완드의 3', 'minor', 'wands', 3, '/tarot-images/minor/wands/2.jpg', '열정과 행동의 Three'),
(25, 'Four of wands', '완드의 4', 'minor', 'wands', 4, '/tarot-images/minor/wands/3.jpg', '열정과 행동의 Four'),
(26, 'Five of wands', '완드의 5', 'minor', 'wands', 5, '/tarot-images/minor/wands/4.jpg', '열정과 행동의 Five'),
(27, 'Six of wands', '완드의 6', 'minor', 'wands', 6, '/tarot-images/minor/wands/5.jpg', '열정과 행동의 Six'),
(28, 'Seven of wands', '완드의 7', 'minor', 'wands', 7, '/tarot-images/minor/wands/6.jpg', '열정과 행동의 Seven'),
(29, 'Eight of wands', '완드의 8', 'minor', 'wands', 8, '/tarot-images/minor/wands/7.jpg', '열정과 행동의 Eight'),
(30, 'Nine of wands', '완드의 9', 'minor', 'wands', 9, '/tarot-images/minor/wands/8.jpg', '열정과 행동의 Nine'),
(31, 'Ten of wands', '완드의 10', 'minor', 'wands', 10, '/tarot-images/minor/wands/9.jpg', '열정과 행동의 Ten'),
(32, 'Page of wands', '완드의 페이지', 'minor', 'wands', 11, '/tarot-images/minor/wands/10.jpg', '열정과 행동의 Page'),
(33, 'Knight of wands', '완드의 기사', 'minor', 'wands', 12, '/tarot-images/minor/wands/11.jpg', '열정과 행동의 Knight'),
(34, 'Queen of wands', '완드의 여왕', 'minor', 'wands', 13, '/tarot-images/minor/wands/12.jpg', '열정과 행동의 Queen'),
(35, 'King of wands', '완드의 왕', 'minor', 'wands', 14, '/tarot-images/minor/wands/13.jpg', '열정과 행동의 King');

-- 마이너 아르카나 - 컵 (Cups) 14장
INSERT INTO public.tarot_cards (card_id, card_name, card_name_ko, card_type, card_suit, card_number, card_image_url, card_meaning_upright) VALUES
(36, 'Ace of cups', '컵의 에이스', 'minor', 'cups', 1, '/tarot-images/minor/cups/0.jpg', '감정과 관계의 Ace'),
(37, 'Two of cups', '컵의 2', 'minor', 'cups', 2, '/tarot-images/minor/cups/1.jpg', '감정과 관계의 Two'),
(38, 'Three of cups', '컵의 3', 'minor', 'cups', 3, '/tarot-images/minor/cups/2.jpg', '감정과 관계의 Three'),
(39, 'Four of cups', '컵의 4', 'minor', 'cups', 4, '/tarot-images/minor/cups/3.jpg', '감정과 관계의 Four'),
(40, 'Five of cups', '컵의 5', 'minor', 'cups', 5, '/tarot-images/minor/cups/4.jpg', '감정과 관계의 Five'),
(41, 'Six of cups', '컵의 6', 'minor', 'cups', 6, '/tarot-images/minor/cups/5.jpg', '감정과 관계의 Six'),
(42, 'Seven of cups', '컵의 7', 'minor', 'cups', 7, '/tarot-images/minor/cups/6.jpg', '감정과 관계의 Seven'),
(43, 'Eight of cups', '컵의 8', 'minor', 'cups', 8, '/tarot-images/minor/cups/7.jpg', '감정과 관계의 Eight'),
(44, 'Nine of cups', '컵의 9', 'minor', 'cups', 9, '/tarot-images/minor/cups/8.jpg', '감정과 관계의 Nine'),
(45, 'Ten of cups', '컵의 10', 'minor', 'cups', 10, '/tarot-images/minor/cups/9.jpg', '감정과 관계의 Ten'),
(46, 'Page of cups', '컵의 페이지', 'minor', 'cups', 11, '/tarot-images/minor/cups/10.jpg', '감정과 관계의 Page'),
(47, 'Knight of cups', '컵의 기사', 'minor', 'cups', 12, '/tarot-images/minor/cups/11.jpg', '감정과 관계의 Knight'),
(48, 'Queen of cups', '컵의 여왕', 'minor', 'cups', 13, '/tarot-images/minor/cups/12.jpg', '감정과 관계의 Queen'),
(49, 'King of cups', '컵의 왕', 'minor', 'cups', 14, '/tarot-images/minor/cups/13.jpg', '감정과 관계의 King');

-- 마이너 아르카나 - 소드 (Swords) 14장
INSERT INTO public.tarot_cards (card_id, card_name, card_name_ko, card_type, card_suit, card_number, card_image_url, card_meaning_upright) VALUES
(50, 'Ace of swords', '소드의 에이스', 'minor', 'swords', 1, '/tarot-images/minor/swords/0.jpg', '생각과 갈등의 Ace'),
(51, 'Two of swords', '소드의 2', 'minor', 'swords', 2, '/tarot-images/minor/swords/1.jpg', '생각과 갈등의 Two'),
(52, 'Three of swords', '소드의 3', 'minor', 'swords', 3, '/tarot-images/minor/swords/2.jpg', '생각과 갈등의 Three'),
(53, 'Four of swords', '소드의 4', 'minor', 'swords', 4, '/tarot-images/minor/swords/3.jpg', '생각과 갈등의 Four'),
(54, 'Five of swords', '소드의 5', 'minor', 'swords', 5, '/tarot-images/minor/swords/4.jpg', '생각과 갈등의 Five'),
(55, 'Six of swords', '소드의 6', 'minor', 'swords', 6, '/tarot-images/minor/swords/5.jpg', '생각과 갈등의 Six'),
(56, 'Seven of swords', '소드의 7', 'minor', 'swords', 7, '/tarot-images/minor/swords/6.jpg', '생각과 갈등의 Seven'),
(57, 'Eight of swords', '소드의 8', 'minor', 'swords', 8, '/tarot-images/minor/swords/7.jpg', '생각과 갈등의 Eight'),
(58, 'Nine of swords', '소드의 9', 'minor', 'swords', 9, '/tarot-images/minor/swords/8.jpg', '생각과 갈등의 Nine'),
(59, 'Ten of swords', '소드의 10', 'minor', 'swords', 10, '/tarot-images/minor/swords/9.jpg', '생각과 갈등의 Ten'),
(60, 'Page of swords', '소드의 페이지', 'minor', 'swords', 11, '/tarot-images/minor/swords/10.jpg', '생각과 갈등의 Page'),
(61, 'Knight of swords', '소드의 기사', 'minor', 'swords', 12, '/tarot-images/minor/swords/11.jpg', '생각과 갈등의 Knight'),
(62, 'Queen of swords', '소드의 여왕', 'minor', 'swords', 13, '/tarot-images/minor/swords/12.jpg', '생각과 갈등의 Queen'),
(63, 'King of swords', '소드의 왕', 'minor', 'swords', 14, '/tarot-images/minor/swords/13.jpg', '생각과 갈등의 King');

-- 마이너 아르카나 - 펜타클 (Pentacles) 14장
INSERT INTO public.tarot_cards (card_id, card_name, card_name_ko, card_type, card_suit, card_number, card_image_url, card_meaning_upright) VALUES
(64, 'Ace of pentacles', '펜타클의 에이스', 'minor', 'pentacles', 1, '/tarot-images/minor/pentacles/0.jpg', '물질과 실용의 Ace'),
(65, 'Two of pentacles', '펜타클의 2', 'minor', 'pentacles', 2, '/tarot-images/minor/pentacles/1.jpg', '물질과 실용의 Two'),
(66, 'Three of pentacles', '펜타클의 3', 'minor', 'pentacles', 3, '/tarot-images/minor/pentacles/2.jpg', '물질과 실용의 Three'),
(67, 'Four of pentacles', '펜타클의 4', 'minor', 'pentacles', 4, '/tarot-images/minor/pentacles/3.jpg', '물질과 실용의 Four'),
(68, 'Five of pentacles', '펜타클의 5', 'minor', 'pentacles', 5, '/tarot-images/minor/pentacles/4.jpg', '물질과 실용의 Five'),
(69, 'Six of pentacles', '펜타클의 6', 'minor', 'pentacles', 6, '/tarot-images/minor/pentacles/5.jpg', '물질과 실용의 Six'),
(70, 'Seven of pentacles', '펜타클의 7', 'minor', 'pentacles', 7, '/tarot-images/minor/pentacles/6.jpg', '물질과 실용의 Seven'),
(71, 'Eight of pentacles', '펜타클의 8', 'minor', 'pentacles', 8, '/tarot-images/minor/pentacles/7.jpg', '물질과 실용의 Eight'),
(72, 'Nine of pentacles', '펜타클의 9', 'minor', 'pentacles', 9, '/tarot-images/minor/pentacles/8.jpg', '물질과 실용의 Nine'),
(73, 'Ten of pentacles', '펜타클의 10', 'minor', 'pentacles', 10, '/tarot-images/minor/pentacles/9.jpg', '물질과 실용의 Ten'),
(74, 'Page of pentacles', '펜타클의 페이지', 'minor', 'pentacles', 11, '/tarot-images/minor/pentacles/10.jpg', '물질과 실용의 Page'),
(75, 'Knight of pentacles', '펜타클의 기사', 'minor', 'pentacles', 12, '/tarot-images/minor/pentacles/11.jpg', '물질과 실용의 Knight'),
(76, 'Queen of pentacles', '펜타클의 여왕', 'minor', 'pentacles', 13, '/tarot-images/minor/pentacles/12.jpg', '물질과 실용의 Queen'),
(77, 'King of pentacles', '펜타클의 왕', 'minor', 'pentacles', 14, '/tarot-images/minor/pentacles/13.jpg', '물질과 실용의 King');

-- 참고: 프론트엔드에서는 총 74장만 사용하지만, DB에는 전체 78장(메이저 22장 + 마이너 56장)을 저장합니다.
-- 프론트엔드에서 필요시 card_id 0-73 범위로 필터링하여 사용할 수 있습니다.

-- 시퀀스 재설정 (다음 INSERT 시 올바른 card_id가 생성되도록)
SELECT setval('tarot_cards_card_id_seq', (SELECT MAX(card_id) FROM public.tarot_cards));

-- 데이터 확인
SELECT 
  card_type,
  COUNT(*) as card_count
FROM public.tarot_cards
GROUP BY card_type
ORDER BY card_type;

