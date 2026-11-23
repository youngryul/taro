# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에 접속
2. 새 프로젝트 생성
3. 프로젝트 설정에서 Database URL과 anon key 확인

## 2. SQL 실행 (순서대로)

Supabase Dashboard → SQL Editor 에서 아래 파일을 **번호 순서대로** 한 번씩 실행합니다.
모든 테이블·함수 이름에는 다른 서비스와 섞이지 않도록 `tarot_` 접두어가 붙어 있습니다.

| 순서 | 파일 | 내용 |
|---|---|---|
| 1 | `migrations/000_tarot_base_schema.sql` | `tarot_cards`, `tarot_readings` 테이블 + RLS |
| 2 | `migrations/001_insert_tarot_cards.sql` | 카드 78장 데이터 |
| 3 | `migrations/002_tarot_question_readings.sql` | 질문 타로 / 관리자 / 카드 해석 보완 |

> 001 은 INSERT 라서 두 번 실행하면 중복 키 오류가 납니다. 다시 넣으려면 파일 위쪽의 `DELETE` 주석을 풀고 실행하세요.

## 3. 소셜 로그인 설정

### Kakao 로그인
1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성
2. Redirect URI 설정: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Kakao
4. Client ID와 Client Secret 입력

### Google 로그인
1. [Google Cloud Console](https://console.cloud.google.com)에서 OAuth 클라이언트 생성
2. Redirect URI 설정: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Google
4. Client ID와 Client Secret 입력

### Apple 로그인 (선택사항)
1. Apple Developer에서 Service ID 생성
2. Redirect URI 설정
3. Supabase Dashboard → Authentication → Providers → Apple 설정

## 4. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
REACT_APP_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
REACT_APP_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

## 5. 데이터베이스 초기화

타로 카드 데이터는 별도의 마이그레이션 스크립트로 관리하거나,
프론트엔드에서 초기 데이터를 삽입하는 API를 호출할 수 있습니다.


## 6. 질문 타로 서버 저장 (브라우저 저장소 미사용)

질문 타로 답변, 피드백, 개발자 모드 검토, 카드 해석 보완은 모두 Supabase 에 저장됩니다.

1. **익명 로그인 켜기**: Dashboard → Authentication → Sign In / Providers → `Allow anonymous sign-ins`
   - 비로그인 방문자도 익명 계정(`auth.uid()`)을 받아 자기 답변을 저장합니다.
   - 소셜 로그인하면 익명 계정의 기록이 로그인 계정으로 옮겨집니다 (`tarot_claim_guest_readings`).
2. **마이그레이션 실행**: 위 2절의 000 → 001 → 002 순서대로 실행
3. **관리자 등록**: 앱 주소 뒤에 `?dev` 를 붙여 개발자 모드를 열면 내 계정 ID 와 SQL 이 표시됩니다.
   ```sql
   insert into public.tarot_admins (user_id) values ('<내 계정 ID>');
   ```
   - 익명 계정은 브라우저 데이터를 지우면 바뀌므로, 소셜 로그인 계정을 관리자로 등록하는 것을 권장합니다.

> 참고: 익명 사용자는 `anon` 이 아니라 `authenticated` 역할로 요청합니다. 000 의 RLS 는 이를 기준으로 작성되어 있습니다.

## 7. OpenAI AI 답변 (Edge Function)

OpenAI 키는 **프론트 `.env` 에 넣지 않습니다** (`REACT_APP_*` 값은 빌드 결과물에 그대로 노출됨).
브라우저 → Supabase Edge Function(`functions/tarot-reading`) → OpenAI 순서로 호출합니다.

```bash
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set OPENAI_MODEL=gpt-4o-mini   # 선택, 기본값 gpt-4o-mini
supabase functions deploy tarot-reading
```

그다음 `.env` 에 `REACT_APP_ENABLE_AI_READING=true` 로 바꾸고 앱을 다시 시작합니다.
AI 호출이 실패하면 규칙 엔진 답변이 그대로 보여지고, 성공하면 `tarot_question_readings.ai_result` 에 저장됩니다.
