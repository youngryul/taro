# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com)에 접속
2. 새 프로젝트 생성
3. 프로젝트 설정에서 Database URL과 anon key 확인

## 2. SQL 스키마 실행

1. Supabase Dashboard → SQL Editor 이동
2. `schema.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블과 RLS 정책이 생성되었는지 확인

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

