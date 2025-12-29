# 카카오 로그인 KOE205 에러 해결 가이드

## 문제 상황

카카오 로그인 시 다음 에러가 발생:
- **에러 코드**: KOE205
- **에러 메시지**: "설정하지 않은 카카오 로그인 동의 항목을 포함해 인가 코드를 요청했습니다"
- **문제 항목**: `account_email`

## 원인

Supabase가 카카오 OAuth 요청 시 `account_email` scope를 포함하고 있지만, 카카오 디벨로퍼스 콘솔에서는 해당 항목이 "권한 없음"으로 설정되어 있어 충돌이 발생합니다.

## 해결 방법

### 방법 1: Supabase Dashboard에서 설정 확인 (가장 중요)

1. **Supabase Dashboard 접속**
   - [Supabase Dashboard](https://app.supabase.com)에 로그인
   - 프로젝트 선택

2. **카카오 OAuth 설정 확인**
   - 왼쪽 메뉴: **Authentication** > **Providers** > **Kakao**
   - 현재 설정된 OAuth 옵션 확인

3. **Scope 설정 확인**
   - Supabase가 기본적으로 요청하는 scope 확인
   - `account_email`이 포함되어 있다면 제거 필요

4. **Supabase 설정 변경 (가능한 경우)**
   - OAuth 설정에서 scope를 수정할 수 있다면 `account_email` 제거
   - 또는 기본 scope를 `profile_nickname, profile_image`만으로 제한

### 방법 2: 카카오 디벨로퍼스 콘솔 재확인

1. **카카오 디벨로퍼스 콘솔 접속**
   - [카카오 디벨로퍼스](https://developers.kakao.com/)에 로그인
   - 내 애플리케이션 선택

2. **동의 항목 재확인**
   - 제품 설정 > 카카오 로그인 > 동의 항목
   - `account_email`이 "권한 없음"인지 확인
   - 만약 "선택 동의"로 되어 있다면 "권한 없음"으로 변경

3. **저장 및 적용**
   - 변경 사항 저장
   - 몇 분 후 적용 확인

### 방법 3: Supabase 지원팀 문의

Supabase Dashboard에서 scope를 직접 수정할 수 없는 경우:

1. **Supabase 지원팀에 문의**
   - 카카오 OAuth에서 `account_email` scope를 제외하고 싶다고 요청
   - 현재 설정과 문제 상황 설명

2. **대안: Edge Function 사용**
   - Supabase Edge Function을 사용하여 커스텀 OAuth 플로우 구현
   - 필요한 scope만 명시적으로 요청

## 임시 해결 방법

코드 레벨에서는 Supabase가 내부적으로 OAuth 플로우를 처리하므로 직접 scope를 제어하기 어렵습니다. 

하지만 다음을 시도해볼 수 있습니다:

1. **브라우저 캐시 삭제**
   - 카카오 로그인 관련 캐시 삭제
   - 시크릿 모드에서 테스트

2. **Supabase 프로젝트 재설정**
   - 카카오 OAuth 설정을 완전히 제거 후 재설정
   - 이번에는 `account_email`을 포함하지 않도록 설정

## 확인 방법

설정이 올바르게 적용되었는지 확인:

1. **새로운 사용자로 테스트**
   - 시크릿 모드 또는 새로운 브라우저에서 테스트
   - 카카오 로그인 시도
   - KOE205 에러가 발생하지 않는지 확인

2. **네트워크 탭 확인**
   - 브라우저 개발자 도구 > Network 탭
   - 카카오 OAuth 요청 URL 확인
   - `scope` 파라미터에 `account_email`이 포함되어 있지 않은지 확인

## 참고사항

- Supabase는 기본적으로 OAuth provider의 표준 scope를 요청합니다
- 카카오의 경우 기본 scope는 `profile_nickname`입니다
- `account_email`은 추가 scope이므로, Supabase 설정에서 제외 가능해야 합니다
- 카카오 디벨로퍼스 콘솔과 Supabase 설정이 일치해야 합니다

## 추가 리소스

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [카카오 로그인 API 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

