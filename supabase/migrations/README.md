# Supabase 마이그레이션 가이드

## 마이그레이션 실행 방법

### 1. Supabase Dashboard에서 실행

1. Supabase Dashboard → SQL Editor 이동
2. `001_insert_tarot_cards.sql` 파일 내용을 복사하여 실행
3. 실행 결과 확인

### 2. Supabase CLI 사용 (선택사항)

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 마이그레이션 파일 설명

### `001_insert_tarot_cards.sql`
- 타로 카드 데이터 삽입
- 메이저 아르카나 22장
- 마이너 아르카나 56장 (완드, 컵, 소드, 펜타클 각 14장)
- 총 78장의 카드 데이터

## 주의사항

- 기존 데이터가 있는 경우 중복 삽입을 방지하기 위해 `DELETE` 문을 주석 해제하세요
- `card_id`는 프론트엔드의 `id`와 일치하도록 설정되어 있습니다
- 이미지 URL은 기본 경로로 설정되어 있으며, 실제 이미지 업로드 후 수정이 필요할 수 있습니다

## 데이터 확인

마이그레이션 후 다음 쿼리로 데이터 확인:

```sql
-- 전체 카드 수 확인
SELECT COUNT(*) FROM public.tarot_cards;

-- 타입별 카드 수 확인
SELECT card_type, COUNT(*) as count 
FROM public.tarot_cards 
GROUP BY card_type;

-- 특정 슈트의 카드 확인
SELECT * FROM public.tarot_cards 
WHERE card_suit = 'wands' 
ORDER BY card_number;
```

