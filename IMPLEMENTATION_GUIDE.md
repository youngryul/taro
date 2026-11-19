# Tarot Flow 구현 가이드

## 📋 구현 완료 사항

### 1. Supabase 설정
- ✅ SQL 스키마 및 RLS 정책 작성 (`supabase/schema.sql`)
- ✅ 데이터베이스 타입 정의 (`src/lib/supabase.ts`)
- ✅ Supabase 클라이언트 설정

### 2. 인증 시스템
- ✅ 소셜 로그인 (Kakao, Google, Apple)
- ✅ 인증 컨텍스트 및 훅 (`src/contexts/AuthContext.tsx`)
- ✅ OAuth 콜백 처리
- ✅ 게스트 ID 관리 (`src/utils/guestId.ts`)

### 3. 타로 서비스
- ✅ 오늘의 타로 뽑기 (비로그인 가능)
- ✅ 타로 결과 저장
- ✅ 게스트 데이터 → 사용자 계정 연결
- ✅ 타로 히스토리 조회

### 4. UX 컴포넌트
- ✅ 로그인 모달 (`src/components/Auth/LoginModal.tsx`)
- ✅ 결제 잠금 화면 (`src/components/Auth/PaymentLock.tsx`)
- ✅ 오늘의 타로 (인증 통합 버전)
- ✅ 타로 히스토리 컴포넌트

## 🚀 시작하기

### 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 Database URL과 anon key 확인
3. SQL Editor에서 `supabase/schema.sql` 실행

### 2. 소셜 로그인 설정

#### Kakao
1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성
2. Redirect URI: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Kakao 활성화

#### Google
1. [Google Cloud Console](https://console.cloud.google.com)에서 OAuth 클라이언트 생성
2. Redirect URI: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Google 활성화

### 3. 환경 변수 설정

`.env.local` 파일 생성:

```env
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 타로 카드 데이터 초기화

`tarot_cards` 테이블에 카드 데이터를 삽입해야 합니다. 
프론트엔드의 `src/constants/tarotCards.ts`를 참고하여 DB에 데이터를 마이그레이션하거나,
별도의 마이그레이션 스크립트를 작성하세요.

### 5. 개발 서버 실행

```bash
npm install
npm start
```

## 📁 주요 파일 구조

```
src/
├── lib/
│   └── supabase.ts              # Supabase 클라이언트 설정
├── contexts/
│   └── AuthContext.tsx           # 인증 컨텍스트
├── services/
│   └── tarotService.ts            # 타로 관련 API 로직
├── components/
│   ├── Auth/
│   │   ├── LoginModal.tsx        # 로그인 모달
│   │   └── PaymentLock.tsx       # 결제 잠금 화면
│   ├── TodayFortune/
│   │   └── TodayFortuneWithAuth.tsx  # 오늘의 타로 (인증 통합)
│   └── TarotHistory/
│       └── TarotHistory.tsx     # 타로 히스토리
└── utils/
    └── guestId.ts                # 게스트 ID 관리

supabase/
└── schema.sql                    # 데이터베이스 스키마
```

## 🔐 보안 고려사항

1. **Row Level Security (RLS)**: 모든 테이블에 RLS 활성화됨
2. **환경 변수**: `.env.local`은 `.gitignore`에 포함되어 있음
3. **게스트 데이터**: 비로그인 사용자의 데이터는 `guest_id`로 관리

## 💳 결제 연동 (향후 작업)

현재 결제 구조는 확장 가능하도록 설계되어 있습니다:
- `payments` 테이블 준비됨
- `tarot_readings.is_paid` 플래그
- `deep_reading_result` 필드

결제 프로바이더 연동 시:
1. 결제 성공 후 `payments` 테이블에 기록
2. `tarot_readings.is_paid = true` 업데이트
3. `deep_reading_result` 표시

## 🎨 UX 문구 가이드

- 로그인 유도: "이 타로를 당신의 이야기로 남길까요?"
- 결제 유도: "카드가 아직 말을 아끼고 있어요"
- 깊은 해석: "이 질문의 진짜 답을 확인해보세요"

## 📝 다음 단계

1. 타로 카드 이미지 업로드 및 URL 설정
2. 깊은 해석 콘텐츠 생성
3. 결제 프로바이더 연동 (예: 토스페이먼츠, 아임포트)
4. 사용자 프로필 설정 기능
5. 개인화된 해석 로직 구현

