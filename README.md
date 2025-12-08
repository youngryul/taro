# 타로 앱 - 따뜻하고 힐링되는 감성의 UI

파스텔 톤의 따뜻한 색감과 부드러운 애니메이션으로 구성된 타로 앱 UI 무드보드입니다.

## 주요 특징

- 🌸 **파스텔 톤 디자인**: 로즈 베이지, 크림 화이트, 따뜻한 그린 컬러
- ✨ **부드러운 애니메이션**: 카드 떠다니는 효과, 반짝임, 글로우 효과
- 🎨 **지브리 + Calm 앱 스타일**: 따뜻하고 고요한 분위기
- 📱 **반응형 디자인**: 모바일 최적화

## UI 구성

1. **오늘의 운세 화면**: 부드럽게 빛나는 3장의 타로 카드
2. **질문 카테고리 UI**: 연애, 속마음, 재회, 금전, 이직, 합격 카드형 버튼
3. **힐링 메시지 영역**: 따뜻한 그라데이션 배경과 손글씨 느낌의 문구
4. **타로 조언 + To-Do 리스트**: 카드 해석과 미니 체크리스트
5. **지난 30일 통계 UI**: 부드러운 곡선 그래프

## 시작하기

### 설치

```bash
npm install
```

### 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/          # UI 컴포넌트
│   ├── TodayFortune/    # 오늘의 운세
│   ├── QuestionCategories/ # 질문 카테고리
│   ├── HealingMessage/  # 힐링 메시지
│   ├── TarotAdvice/     # 타로 조언 + To-Do
│   └── Statistics/      # 통계 그래프
├── constants/           # 상수 정의
│   ├── colors.ts        # 색상 상수
│   ├── spacing.ts       # 간격 상수
│   └── animations.ts    # 애니메이션 상수
└── styles/              # 전역 스타일
    └── global.css
```

## 디자인 컬러 팔레트

- 로즈 베이지: `#F5E6D3`, `#E8D5C4`
- 크림 화이트: `#FFF8F0`, `#FEFCF8`
- 따뜻한 그린: `#558972`, `#7BA68A`, `#A8C4B3`

## 기술 스택

- React 18
- TypeScript
- CSS3 (애니메이션, 그라데이션)

---

## 상세 기능 설명

### 1. 오늘의 운세 화면 (TodayFortune)

**코드 위치:**
- 컴포넌트: `src/components/TodayFortune/TodayFortune.tsx`
- 스타일: `src/components/TodayFortune/TodayFortune.css`
- 애니메이션 상수: `src/constants/animations.ts` (CARD_FLOAT_DURATION, CARD_FLOAT_DELAY_1~3)

**주요 기능:**
- **3장의 타로 카드 표시**: 과거, 현재, 미래를 나타내는 카드
- **떠다니는 애니메이션**: 각 카드가 독립적으로 위아래로 부드럽게 움직임 (`float` 애니메이션)
- **글로우 효과**: 카드 내부에 빛이 번지는 효과 (`shimmer` 애니메이션)
- **호버 인터랙션**: 마우스 오버 시 카드가 위로 올라가며 약간 확대됨
- **그라데이션 배경**: 크림 화이트에서 로즈 베이지로의 부드러운 그라데이션
- **인셋 그림자**: 카드 내부에 은은한 빛 효과
- **반응형 디자인**: 모바일에서 카드 크기 자동 조정 (100px → 90px)

**구현 세부사항:**
- 각 카드는 `animationDelay`를 다르게 설정하여 순차적으로 움직임
- `perspective: 1000px`로 3D 효과 제공
- 카드 패턴에 별(✦) 심볼 사용

---

### 2. 질문 카테고리 UI (QuestionCategories)

**코드 위치:**
- 컴포넌트: `src/components/QuestionCategories/QuestionCategories.tsx`
- 스타일: `src/components/QuestionCategories/QuestionCategories.css`

**주요 기능:**
- **6가지 카테고리 버튼**: 연애(💕), 속마음(💭), 재회(🔄), 금전(💰), 이직(💼), 합격(🎓)
- **그리드 레이아웃**: 3열 그리드로 배치 (모바일에서는 2열)
- **호버 애니메이션**: 
  - 버튼이 위로 살짝 올라감 (`translateY(-4px)`)
  - 그림자 강도 증가
  - 빛이 지나가는 효과 (`::before` 가상 요소)
- **클릭 피드백**: 클릭 시 약간 눌리는 효과
- **이모지 아이콘**: 각 카테고리에 맞는 이모지 사용
- **부드러운 그림자**: 카드형 버튼에 소프트 섀도우 적용

**구현 세부사항:**
- `categories` 배열로 데이터 관리 (확장 가능)
- `::before` 가상 요소로 빛 지나가는 효과 구현
- `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`로 부드러운 전환

---

### 3. 힐링 메시지 영역 (HealingMessage)

**코드 위치:**
- 컴포넌트: `src/components/HealingMessage/HealingMessage.tsx`
- 스타일: `src/components/HealingMessage/HealingMessage.css`

**주요 기능:**
- **랜덤 메시지 표시**: 3가지 위로 문구 중 랜덤 선택
  - "오늘도 수고했어요"
  - "당신은 충분히 소중한 사람이에요"
  - "작은 변화도 성장의 시작이에요"
- **손글씨 폰트**: Nanum Pen Script 폰트 사용 (Google Fonts)
- **그라데이션 배경**: 로즈 베이지(#F5E6D3)에서 따뜻한 그린(#A8C4B3)으로
- **글로우 애니메이션**: 배경에 은은한 빛이 회전하는 효과 (`gentleGlow`)
- **장식 요소**: 우측 상단에 반짝이는 별(✦) 아이콘 (`twinkle` 애니메이션)
- **텍스트 그림자**: 텍스트에 부드러운 그림자 효과

**구현 세부사항:**
- `Math.random()`으로 메시지 랜덤 선택
- `::before` 가상 요소로 배경 글로우 효과
- 별 아이콘은 `opacity`와 `scale` 애니메이션으로 반짝임

---

### 4. 타로 조언 + To-Do 리스트 (TarotAdvice)

**코드 위치:**
- 컴포넌트: `src/components/TarotAdvice/TarotAdvice.tsx`
- 스타일: `src/components/TarotAdvice/TarotAdvice.css`

**주요 기능:**

#### 4-1. 카드 해석 섹션
- **타로 카드 해석 텍스트**: 오늘의 운세에 대한 상세한 해석 표시
- **그라데이션 카드**: 크림 화이트에서 로즈 베이지로의 배경
- **부드러운 그림자**: 카드에 소프트 섀도우 적용

#### 4-2. 힐링 체크리스트
- **체크박스 기능**: React `useState`로 상태 관리
- **3가지 기본 To-Do 항목**:
  - "오늘은 자신을 돌보는 시간을 가져보세요"
  - "작은 감사한 일을 세 가지 적어보세요"
  - "깊게 숨을 들이쉬고 내면의 평화를 느껴보세요"
- **완료 상태 시각화**: 
  - 체크 시 취소선 표시
  - 텍스트 색상 흐려짐 (`opacity: 0.6`)
- **커스텀 체크박스**: 기본 체크박스를 스타일링하여 따뜻한 그린 색상으로 변경
- **호버 효과**: 항목에 마우스 오버 시 배경색 변경

**구현 세부사항:**
- `handleToggleTodo` 함수로 체크 상태 토글
- 체크박스는 `appearance: none`으로 기본 스타일 제거 후 커스텀
- 완료된 항목은 `tarot-advice__todo-text--completed` 클래스로 스타일링

---

### 5. 지난 30일 통계 UI (Statistics)

**코드 위치:**
- 컴포넌트: `src/components/Statistics/Statistics.tsx`
- 스타일: `src/components/Statistics/Statistics.css`

**주요 기능:**
- **부드러운 곡선 그래프**: Catmull-Rom 스플라인 근사 알고리즘 사용
- **이중 데이터 시각화**: 
  - 좋은 흐름 (상승 추세, 따뜻한 그린 #558972)
  - 나쁜 흐름 (하락 추세, 로즈 베이지 #E8D5C4)
- **그라데이션 영역 채우기**: 
  - 각 곡선 아래 영역을 그라데이션으로 채움
  - `linearGradient` SVG 요소 사용
- **범례(Legend)**: 좋은 흐름/나쁜 흐름 구분 표시
- **30일 데이터**: 샘플 데이터로 30일치 통계 표시

**구현 세부사항:**
- `generateSmoothPath` 함수로 부드러운 베지어 곡선 생성
  - 각 점의 이전/다음 점을 고려하여 제어점 계산
  - `C` (Cubic Bezier) 명령어 사용
- SVG `viewBox="0 0 100 100"`로 반응형 그래프 구현
- `preserveAspectRatio="none"`으로 컨테이너에 맞춤
- 곡선에 `filter: blur(0.5px)` 적용하여 더 부드러운 느낌

---

## 전역 스타일 및 상수

### 전역 스타일 (Global Styles)

**코드 위치:**
- `src/styles/global.css`
- `src/App.css`

**주요 기능:**
- **배경 그라데이션**: 로즈 베이지 → 크림 화이트 → 따뜻한 그린
- **파티클 효과**: `body::before`로 배경에 빛 입자 효과
- **폰트 설정**: Noto Sans KR (본문), Nanum Pen Script (손글씨)
- **부드러운 스크롤**: `scroll-behavior: smooth`
- **배경 애니메이션**: `backgroundShift`로 배경이 살짝 움직임

### 색상 상수 (Colors)

**코드 위치:** `src/constants/colors.ts`

**정의된 색상:**
- `ROSE_BEIGE_LIGHT`, `ROSE_BEIGE`, `ROSE_BEIGE_DARK`: 로즈 베이지 톤
- `CREAM_WHITE`, `CREAM_WHITE_PURE`: 크림 화이트 톤
- `WARM_GREEN`, `WARM_GREEN_LIGHT`, `WARM_GREEN_PALE`: 따뜻한 그린 톤
- `PASTEL_PINK`, `PASTEL_LAVENDER`, `PASTEL_PEACH`: 추가 파스텔 컬러
- `SHADOW_SOFT`, `SHADOW_MEDIUM`, `GLOW_SOFT`: 그림자 및 글로우 효과
- `TEXT_PRIMARY`, `TEXT_SECONDARY`, `TEXT_LIGHT`: 텍스트 컬러

### 간격 상수 (Spacing)

**코드 위치:** `src/constants/spacing.ts`

**정의된 간격:**
- `SPACING_XS` ~ `SPACING_XXL`: 기본 간격 값 (4px ~ 48px)
- `CARD_PADDING`, `CARD_BORDER_RADIUS`, `CARD_GAP`: 카드 관련 간격
- `SECTION_MARGIN`: 섹션 간 간격

### 애니메이션 상수 (Animations)

**코드 위치:** `src/constants/animations.ts`

**정의된 애니메이션:**
- `ANIMATION_DURATION_FAST` ~ `ANIMATION_DURATION_SLOWER`: 애니메이션 지속 시간
- `ANIMATION_EASING_SMOOTH`, `ANIMATION_EASING_BOUNCE`: 이징 함수
- `CARD_FLOAT_DURATION`: 카드 떠다니는 애니메이션 지속 시간 (3s)
- `CARD_FLOAT_DELAY_1~3`: 각 카드의 애니메이션 지연 시간

---

## 메인 앱 컴포넌트

**코드 위치:** `src/App.tsx`

**주요 기능:**
- 모든 UI 섹션을 통합하여 표시
- 최대 너비 600px의 컨테이너로 중앙 정렬
- 섹션 간 일관된 간격 유지

**컴포넌트 구조:**
```tsx
<App>
  <TodayFortune />
  <QuestionCategories />
  <HealingMessage />
  <TarotAdvice />
  <Statistics />
</App>
```

---

## 커스터마이징 가이드

### 색상 변경
`src/constants/colors.ts` 파일에서 색상 상수를 수정하면 전체 앱의 색상이 일괄 변경됩니다.

### 애니메이션 속도 조절
`src/constants/animations.ts` 파일에서 애니메이션 지속 시간과 이징 함수를 변경할 수 있습니다.

### 카테고리 추가/수정
`src/components/QuestionCategories/QuestionCategories.tsx`의 `categories` 배열을 수정하면 카테고리를 추가하거나 변경할 수 있습니다.

### 힐링 메시지 변경
`src/components/HealingMessage/HealingMessage.tsx`의 `messages` 배열에 새로운 메시지를 추가할 수 있습니다.

### 통계 데이터 연결
`src/components/Statistics/Statistics.tsx`의 `goodFlowData`와 `badFlowData`를 실제 API 데이터나 props로 교체할 수 있습니다.

