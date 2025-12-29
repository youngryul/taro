import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import { getOrCreateGuestId, getGuestId } from '../utils/guestId';
import { TarotCard } from '../constants/tarotCards';

type TarotReading = Database['public']['Tables']['tarot_readings']['Row'];
type TarotReadingInsert = Database['public']['Tables']['tarot_readings']['Insert'];

export interface TodayTarotResult {
  card: TarotCard;
  reading: TarotReading | null;
  isSaved: boolean;
  canViewDeepReading: boolean;
}

/**
 * 오늘의 타로 뽑기 (비로그인 가능)
 */
export const drawTodayTarot = async (
  userId: string | null
): Promise<TodayTarotResult> => {
  try {
    // 1. 랜덤 카드 선택 (프론트엔드에서 처리)
    // 실제로는 DB에서 카드 정보를 가져와야 하지만,
    // 현재는 프론트엔드의 TAROT_CARDS를 사용
    const cards = await getTarotCards();
    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    // 2. 오늘 이미 뽑았는지 확인
    const guestId = userId ? null : getGuestId();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data: existingReading, error: checkError } = await supabase
      .from('tarot_readings')
      .select('*')
      .eq('question_type', 'today')
      .eq(userId ? 'user_id' : 'guest_id', userId || guestId)
      .gte('created_at', `${today}T00:00:00Z`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116은 "no rows returned" 에러 (정상)
      throw checkError;
    }

    // 이미 오늘 뽑은 경우 기존 결과 반환
    if (existingReading) {
      return {
        card: cards.find(c => c.id === existingReading.card_id) || randomCard,
        reading: existingReading,
        isSaved: !!existingReading.user_id,
        canViewDeepReading: existingReading.is_paid,
      };
    }

    // 3. 새로운 타로 결과 저장
    const readingData: TarotReadingInsert = {
      user_id: userId || null,
      guest_id: userId ? null : getOrCreateGuestId(),
      card_id: randomCard.id,
      question_type: 'today',
      is_reversed: Math.random() > 0.5, // 랜덤으로 정/역 위치 결정
      is_paid: false,
      reading_result: randomCard.meaning, // 기본 해석
    };

    const { data: newReading, error: insertError } = await supabase
      .from('tarot_readings')
      .insert(readingData)
      .select()
      .single();

    if (insertError) throw insertError;

    return {
      card: randomCard,
      reading: newReading,
      isSaved: !!userId,
      canViewDeepReading: false,
    };
  } catch (error) {
    console.error('오늘의 타로 뽑기 오류:', error);
    throw error;
  }
};

/**
 * 타로 결과 저장 (로그인 유도)
 */
export const saveTarotReading = async (
  readingId: string,
  userId: string
): Promise<void> => {
  try {
    // guest_id로 저장된 결과를 user_id로 업데이트
    const { error } = await supabase
      .from('tarot_readings')
      .update({ user_id: userId, guest_id: null })
      .eq('reading_id', readingId);

    if (error) throw error;
  } catch (error) {
    console.error('타로 결과 저장 오류:', error);
    throw error;
  }
};

/**
 * 비로그인 사용자의 타로 결과를 로그인 후 계정에 연결
 */
export const linkGuestReadingsToUser = async (
  userId: string,
  guestId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('tarot_readings')
      .update({ user_id: userId, guest_id: null })
      .eq('guest_id', guestId)
      .is('user_id', null);

    if (error) throw error;
  } catch (error) {
    console.error('게스트 결과 연결 오류:', error);
    throw error;
  }
};

/**
 * 타로 히스토리 조회
 */
export const getTarotHistory = async (
  userId: string,
  limit: number = 30
): Promise<TarotReading[]> => {
  try {
    const { data, error } = await supabase
      .from('tarot_readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('타로 히스토리 조회 오류:', error);
    throw error;
  }
};

/**
 * 타로 카드 목록 조회
 */
export const getTarotCards = async (): Promise<TarotCard[]> => {
  try {
    const { data, error } = await supabase
      .from('tarot_cards')
      .select('*')
      .order('card_id');

    if (error) throw error;

    // DB 데이터를 프론트엔드 타입으로 변환
    return (data || []).map((card) => ({
      id: card.card_id,
      name: card.card_name,
      nameKo: card.card_name_ko,
      type: card.card_type,
      suit: card.card_suit || undefined,
      number: card.card_number || undefined,
      imageUrl: card.card_image_url,
      meaning: card.card_meaning_upright,
    }));
  } catch (error) {
    console.error('타로 카드 조회 오류:', error);
    // DB 연결 실패 시 프론트엔드 상수 사용
    const { TAROT_CARDS } = await import('../constants/tarotCards');
    return TAROT_CARDS;
  }
};

/**
 * 깊은 해석 조회 (결제 필요)
 */
export const getDeepReading = async (
  readingId: string,
  userId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('tarot_readings')
      .select('deep_reading_result, is_paid')
      .eq('reading_id', readingId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    if (!data?.is_paid) {
      throw new Error('결제가 필요한 서비스입니다.');
    }

    return data.deep_reading_result || null;
  } catch (error) {
    console.error('깊은 해석 조회 오류:', error);
    throw error;
  }
};

