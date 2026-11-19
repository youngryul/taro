import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      user_profile: {
        Row: {
          user_id: string;
          interest_type: string[] | null;
          tarot_style: 'soft' | 'direct' | 'realistic';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          interest_type?: string[] | null;
          tarot_style?: 'soft' | 'direct' | 'realistic';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          interest_type?: string[] | null;
          tarot_style?: 'soft' | 'direct' | 'realistic';
          updated_at?: string;
        };
      };
      tarot_cards: {
        Row: {
          card_id: number;
          card_name: string;
          card_name_ko: string;
          card_type: 'major' | 'minor';
          card_suit: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
          card_number: number | null;
          card_image_url: string;
          card_meaning_upright: string;
          card_meaning_reversed: string | null;
          created_at: string;
        };
        Insert: {
          card_id?: number;
          card_name: string;
          card_name_ko: string;
          card_type: 'major' | 'minor';
          card_suit?: 'wands' | 'cups' | 'swords' | 'pentacles' | null;
          card_number?: number | null;
          card_image_url: string;
          card_meaning_upright: string;
          card_meaning_reversed?: string | null;
          created_at?: string;
        };
        Update: {
          card_name?: string;
          card_name_ko?: string;
          card_image_url?: string;
          card_meaning_upright?: string;
          card_meaning_reversed?: string | null;
        };
      };
      tarot_readings: {
        Row: {
          reading_id: string;
          user_id: string | null;
          guest_id: string | null;
          card_id: number;
          question_type: 'today' | 'love' | 'career' | 'money' | 'general';
          is_reversed: boolean;
          is_paid: boolean;
          reading_result: string | null;
          deep_reading_result: string | null;
          created_at: string;
        };
        Insert: {
          reading_id?: string;
          user_id?: string | null;
          guest_id?: string | null;
          card_id: number;
          question_type: 'today' | 'love' | 'career' | 'money' | 'general';
          is_reversed?: boolean;
          is_paid?: boolean;
          reading_result?: string | null;
          deep_reading_result?: string | null;
          created_at?: string;
        };
        Update: {
          is_paid?: boolean;
          reading_result?: string | null;
          deep_reading_result?: string | null;
        };
      };
      payments: {
        Row: {
          payment_id: string;
          user_id: string;
          product_type: 'deep_reading' | 'premium' | 'subscription';
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          reading_id: string | null;
          payment_method: string | null;
          transaction_id: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          payment_id?: string;
          user_id: string;
          product_type: 'deep_reading' | 'premium' | 'subscription';
          amount: number;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          reading_id?: string | null;
          payment_method?: string | null;
          transaction_id?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          transaction_id?: string | null;
          completed_at?: string | null;
        };
      };
    };
  };
}

