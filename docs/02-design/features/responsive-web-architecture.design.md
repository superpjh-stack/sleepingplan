# 반응형 웹 아키텍처 변경 설계서

> **Summary**: 현재 단일 컬럼 + 상단 헤더 구조에서, 데스크톱 사이드바 + 2컬럼 그리드 레이아웃으로 전환하는 반응형 아키텍처 설계
>
> **Feature**: responsive-web-architecture
> **Plan**: `docs/01-plan/features/responsive-web-architecture.plan.md`
> **Date**: 2026-02-21
> **Status**: Draft

---

## 1. 브레이크포인트 체계

### 1.1 Tailwind 브레이크포인트 기준 (변경 없음)

| 이름 | 최소 너비 | 용도 |
|------|----------|------|
| (default) | 0px | 모바일 기본 |
| `sm` | 640px | 소형 태블릿 보조 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 데스크톱 (사이드바 전환점) |
| `xl` | 1280px | 와이드 데스크톱 |

### 1.2 레이아웃 전환 룰

```
< md (모바일)   : 하단 탭바, MobileHeader, 전체 너비 콘텐츠
md ~ lg (태블릿): MobileHeader, 전체 너비 콘텐츠 (탭바 숨김, 헤더 유지)
≥ lg (데스크톱) : 좌측 Sidebar (240px 고정), 오른쪽 메인 콘텐츠
```

---

## 2. 컴포넌트 설계

### 2.1 신규 컴포넌트: `Sidebar`

**파일**: `src/components/layout/Sidebar.tsx`

**표시 조건**: `lg:flex hidden` — 데스크톱 전용

**와이어프레임**:
```
┌─────────────────────────┐
│  🌙 SleepingPlan         │  ← 로고 + 홈 링크
│─────────────────────────│
│  홍길동                  │  ← 사용자 이름
│  user@email.com          │  ← 이메일 (text-xs, muted)
│─────────────────────────│
│  🏠  홈                  │  ← active: bg-primary/10
│  📝  수면 기록            │
│  📊  분석                │
│  🤖  AI 코칭             │
│  ⚙️   설정               │
│─────────────────────────│
│  [로그아웃]              │  ← 하단 고정
└─────────────────────────┘
```

**Props**: 없음 (useSession, usePathname 내부 사용)

**핵심 클래스**:
```tsx
// 사이드바 컨테이너
"hidden lg:flex flex-col w-60 border-r min-h-screen bg-background sticky top-0 h-screen"

// 네비게이션 링크 (활성)
"flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary/10 text-primary"

// 네비게이션 링크 (비활성)
"flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
```

---

### 2.2 신규 컴포넌트: `MobileHeader`

**파일**: `src/components/layout/MobileHeader.tsx`

**표시 조건**: `lg:hidden` — 모바일/태블릿 전용

**와이어프레임**:
```
┌──────────────────────────────────────┐
│  🌙 SleepingPlan        [홍길동] [나가기]│
└──────────────────────────────────────┘
```

**핵심 클래스**:
```tsx
// 헤더 컨테이너
"lg:hidden border-b px-4 py-3 flex items-center justify-between bg-background"
```

---

### 2.3 신규 컴포넌트: `BottomTabBar`

**파일**: `src/components/layout/BottomTabBar.tsx` (Navbar에서 분리)

**표시 조건**: `md:hidden fixed bottom-0` — 모바일 전용

**와이어프레임**:
```
┌─────────────────────────────────┐
│  🏠   📝   📊   🤖   ⚙️        │
│  홈  기록  분석  코칭  설정      │
└─────────────────────────────────┘
```

**현재 Navbar에서 이 부분만 추출** (로직 동일, 컴포넌트 분리)

---

### 2.4 변경 컴포넌트: `DashboardLayout`

**파일**: `src/app/(dashboard)/layout.tsx`

**변경 전**:
```tsx
<div className="min-h-screen flex flex-col">
  <Navbar />
  <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
</div>
```

**변경 후**:
```tsx
<div className="min-h-screen flex flex-col lg:flex-row">
  <Sidebar />                              {/* lg+ 사이드바 */}
  <div className="flex-1 flex flex-col min-h-screen">
    <MobileHeader />                       {/* < lg 헤더 */}
    <main className="flex-1 p-4 md:p-6 pb-20 lg:pb-6 overflow-y-auto">
      {children}
    </main>
    <BottomTabBar />                       {/* < md 하단 탭 */}
  </div>
</div>
```

---

### 2.5 Navbar 처리

기존 `Navbar.tsx`는 `Sidebar` + `MobileHeader` + `BottomTabBar`로 **역할 분리** 후 제거하거나,
파일을 유지하되 내부를 3개 컴포넌트의 조합 export로 단순화.

**선택**: 기존 파일 제거 → 3개 컴포넌트로 대체

---

## 3. 페이지별 레이아웃 설계

### 3.1 대시보드 (`/dashboard`)

**모바일** (기존 유지):
```
┌────────────────────┐
│ 안녕하세요, 홍길동 │
│ 오늘 수면 기록 없음│
│ [오늘 수면 요약]   │
│ [주간 통계 3개]    │
│ [미니 차트]        │
│ [빠른 메뉴 2개]    │
└────────────────────┘
```

**데스크톱** (2컬럼):
```
┌─────────────────────────────────────────────────┐
│ [좌 컬럼 60%]             │ [우 컬럼 40%]       │
│                           │                     │
│ 안녕하세요, 홍길동님 👋    │ [오늘 수면 요약]    │
│ 오늘 기록 없음 배너        │                     │
│ [주간 통계 3개 가로]       │ [목표 달성률 카드]  │
│ [최근 7일 차트]            │ [빠른 메뉴]         │
│                           │                     │
└─────────────────────────────────────────────────┘
```

**변경 코드 패턴**:
```tsx
// 기존
<div className="max-w-2xl mx-auto space-y-5">

// 변경
<div className="max-w-5xl mx-auto">
  <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-5 lg:space-y-0">
    <div className="lg:col-span-3 space-y-5">  {/* 좌측 메인 */}
    <div className="lg:col-span-2 space-y-5">  {/* 우측 사이드 */}
  </div>
</div>
```

---

### 3.2 수면 기록 (`/record`)

**모바일** (기존 유지 — 탭 방식):
```
┌────────────────────┐
│ 수면 기록  [+새기록]│
│ [리스트|달력] 탭    │
│ 기록 카드들         │
└────────────────────┘
```

**데스크톱** (모달 → 인라인 사이드패널):
```
┌────────────────────────────────────────────────┐
│ 수면 기록               [+새 기록]              │
│──────────────────────────────────────────────── │
│ [기록 목록/달력 55%]    │ [입력 폼 45%]         │
│                         │                       │
│ ┌─────────────────────┐ │ ┌───────────────────┐ │
│ │ 2026-02-21          │ │ │ 새 수면 기록       │ │
│ │ 23:00 → 07:00 (8h) │ │ │ 취침 시간: __:__  │ │
│ │ 수면질: 7/10        │ │ │ 기상 시간: __:__  │ │
│ └─────────────────────┘ │ │ 수면질: ──────    │ │
│ ┌─────────────────────┐ │ │ 메모: ──────────  │ │
│ │ 2026-02-20          │ │ │                   │ │
│ │ ...                 │ │ │ [저장하기]         │ │
│ └─────────────────────┘ │ └───────────────────┘ │
└────────────────────────────────────────────────┘
```

**변경 코드 패턴**:
```tsx
// 데스크톱에서는 formOpen 상태 없이 항상 사이드패널 표시
<div className="max-w-5xl mx-auto">
  <div className="lg:grid lg:grid-cols-5 lg:gap-6">
    <div className="lg:col-span-3">  {/* 기록 목록 */}
    <div className="hidden lg:block lg:col-span-2">  {/* 인라인 폼 */}
      <SleepRecordForm inline />
    </div>
  </div>
  {/* 모바일: 기존 Dialog 유지 */}
  <div className="lg:hidden">
    <SleepRecordForm open={formOpen} onClose={...} />
  </div>
</div>
```

> **SleepRecordForm 변경**: `inline?: boolean` prop 추가.
> - `inline=true`: Dialog wrapper 없이 Card로 렌더
> - `inline=false` (기존): Dialog/Sheet로 렌더

---

### 3.3 분석 (`/analytics`)

**모바일** (기존 유지):
```
┌────────────────────┐
│ 수면 분석 [‹2월›]  │
│ [통계 요약 2x2]    │
│ [주간 차트]        │
│ [월간 차트]        │
└────────────────────┘
```

**데스크톱** (컨테이너 확장 + 상단 통계 4열):
```
┌──────────────────────────────────────────────┐
│ 수면 분석                    [‹ 2026년 2월 ›] │
│ ──────────────────────────────────────────── │
│ [평균수면] [총기록] [평균수면질] [목표달성]    │  ← 4열 그리드
│ ──────────────────────────────────────────── │
│ [주간 수면 시간 차트  (full width)]            │
│ ──────────────────────────────────────────── │
│ [월간 수면 차트       (full width)]            │
└──────────────────────────────────────────────┘
```

**변경 코드 패턴**:
```tsx
// 기존
<div className="max-w-2xl mx-auto space-y-6">

// 변경
<div className="max-w-5xl mx-auto space-y-6">
// StatsSummary 내부: grid-cols-2 sm:grid-cols-4 (기존 2x2 → 4열 확장)
```

---

### 3.4 AI 코칭 (`/coaching`)

**모바일** (기존 유지):
```
┌────────────────────┐
│ AI 수면 코칭        │
│ [코칭 카드]         │
│ [코칭 히스토리]     │
└────────────────────┘
```

**데스크톱** (2컬럼):
```
┌────────────────────────────────────────────┐
│ AI 수면 코칭                                │
│ ─────────────────────────────────────────  │
│ [현재 코칭 카드 55%]   │ [히스토리 45%]    │
│                        │                   │
│ 오늘의 코칭            │ 이전 코칭 목록     │
│ [AI 분석 내용]         │ ┌───────────────┐ │
│ [생성하기 버튼]        │ │ 2026-02-20    │ │
│                        │ │ ...           │ │
│                        │ └───────────────┘ │
└────────────────────────────────────────────┘
```

**변경 코드 패턴**:
```tsx
// 기존
<div className="max-w-2xl mx-auto space-y-6">

// 변경
<div className="max-w-5xl mx-auto">
  <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-6 lg:space-y-0">
    <div className="lg:col-span-3"><CoachingCard /></div>
    <div className="lg:col-span-2"><CoachingHistory /></div>
  </div>
</div>
```

---

### 3.5 설정 (`/settings`) — 변경 없음

```tsx
<div className="max-w-2xl mx-auto space-y-6">
```
설정 페이지는 폼 위주이므로 좁은 너비가 적합. **max-w-2xl 유지**.

---

### 3.6 랜딩 페이지 (`/`)

**현재 문제**: 헤더가 밋밋하고 섹션 레이아웃이 단순함

**개선 설계**:
```
┌──────────────────────────────────────────────┐
│ HEADER: 🌙 SleepingPlan        [로그인] [시작]│
│──────────────────────────────────────────────│
│ HERO SECTION (min-h-[60vh] flex center)      │
│   🌙                                          │
│   더 나은 수면을 위한 첫걸음                   │
│   [부제목]                                    │
│   [지금 시작하기]  [로그인]                    │
│──────────────────────────────────────────────│
│ FEATURES (grid 1→2→3 cols)                  │
│  [📝 수면기록] [📊 분석] [🤖 AI코칭]          │
│──────────────────────────────────────────────│
│ FOOTER: © 2026 SleepingPlan                  │
└──────────────────────────────────────────────┘
```

**변경 포인트**:
- 헤더: 로그인 + 시작하기 버튼 2개
- 히어로: `min-h-[60vh]` 충분한 여백, CTA 버튼 2개
- 피처 카드: `grid-cols-1 md:grid-cols-3` (현재와 동일하나 카드 내용 보강)
- 푸터 추가 (선택적)

---

## 4. 컨테이너 너비 표준

| 용도 | 클래스 | 실제 너비 |
|------|--------|-----------|
| 설정, 인증 폼 | `max-w-2xl mx-auto` | 672px |
| 기본 콘텐츠 | `max-w-3xl mx-auto` | 768px |
| 대시보드, 분석, 기록, 코칭 | `max-w-5xl mx-auto` | 1024px |
| 랜딩 히어로 | `w-full` | 전체 너비 |
| 랜딩 피처 카드 | `max-w-5xl mx-auto` | 1024px |

---

## 5. 파일 변경 목록 (구체 스펙)

### 5.1 신규 생성 파일

| 파일 | 내용 | 우선순위 |
|------|------|---------|
| `src/components/layout/Sidebar.tsx` | 사이드바 컴포넌트 | P0 |
| `src/components/layout/MobileHeader.tsx` | 모바일 헤더 컴포넌트 | P0 |
| `src/components/layout/BottomTabBar.tsx` | 하단 탭바 (Navbar에서 분리) | P0 |

### 5.2 수정 파일

| 파일 | 변경 내용 | 우선순위 |
|------|-----------|---------|
| `src/app/(dashboard)/layout.tsx` | Sidebar + MobileHeader + BottomTabBar 통합 | P0 |
| `src/components/layout/Navbar.tsx` | **삭제** (3개 컴포넌트로 대체) | P0 |
| `src/app/(dashboard)/dashboard/page.tsx` | `max-w-2xl` → `max-w-5xl`, lg 2컬럼 | P1 |
| `src/app/(dashboard)/record/page.tsx` | 데스크톱 인라인 폼 패널 추가 | P1 |
| `src/app/(dashboard)/analytics/page.tsx` | `max-w-2xl` → `max-w-5xl` | P1 |
| `src/app/(dashboard)/coaching/page.tsx` | `max-w-2xl` → `max-w-5xl`, lg 2컬럼 | P2 |
| `src/features/sleep-record/components/SleepRecordForm.tsx` | `inline?: boolean` prop 추가 | P1 |
| `src/app/page.tsx` | 랜딩 헤더/히어로 개선, 푸터 추가 | P2 |

### 5.3 변경 없는 파일

- `src/app/(auth)/login/page.tsx` — `min-h-screen flex center` 이미 적절
- `src/app/(auth)/signup/page.tsx` — 동일
- `src/app/(dashboard)/settings/page.tsx` — `max-w-2xl` 유지
- `src/app/(dashboard)/settings/profile/page.tsx` — `max-w-2xl` 유지
- 모든 `features/*/components/*.tsx` — 내부 로직 변경 없음

---

## 6. SleepRecordForm 인라인 모드 설계

```tsx
// 현재 시그니처
interface SleepRecordFormProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
}

// 변경 시그니처
interface SleepRecordFormProps {
  // Dialog 모드 (모바일)
  open?: boolean
  onClose?: () => void
  defaultDate?: string
  // 인라인 모드 (데스크톱)
  inline?: boolean
}
```

**인라인 렌더 조건**:
- `inline=true` → `<Card>` 래퍼로 직접 렌더 (Dialog 없음)
- `inline=false|undefined` → 기존 Dialog/Sheet 모달

---

## 7. 구현 순서 (Do Phase 가이드)

```
Step 1: 레이아웃 컴포넌트 (P0)
  1a. Sidebar.tsx 생성
  1b. MobileHeader.tsx 생성
  1c. BottomTabBar.tsx 생성 (Navbar 분리)
  1d. layout.tsx 수정
  1e. Navbar.tsx 제거

Step 2: 콘텐츠 페이지 (P1)
  2a. dashboard/page.tsx — 2컬럼
  2b. analytics/page.tsx — 컨테이너 확장
  2c. SleepRecordForm.tsx — inline prop
  2d. record/page.tsx — 인라인 폼 패널

Step 3: 나머지 (P2)
  3a. coaching/page.tsx — 2컬럼
  3b. page.tsx — 랜딩 개선
```

---

## 8. 검증 기준 (Gap Analysis 체크리스트)

| 체크 항목 | 확인 방법 |
|----------|-----------|
| 모바일(375px): 하단 탭바 표시 | Chrome DevTools |
| 태블릿(768px): MobileHeader 표시, 탭바 숨김 | Chrome DevTools |
| 데스크톱(1024px+): Sidebar 표시, 헤더/탭바 숨김 | Chrome DevTools |
| 대시보드 데스크톱 2컬럼 | 1024px+ 확인 |
| 수면기록 데스크톱 인라인 폼 | 1024px+ 확인 |
| 분석 차트 max-w-5xl 적용 | 요소 검사 |
| 코칭 2컬럼 | 1024px+ 확인 |
| 랜딩 헤더 개선 | 시각 확인 |

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 0.1 | 2026-02-21 | 초안 작성 — 전체 컴포넌트 스펙 및 와이어프레임 정의 |
