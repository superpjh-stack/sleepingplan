# 반응형 웹 아키텍처 변경 기획서

> **Summary**: 현재 단순 반응형 레이아웃을 모바일-우선(Mobile-First) 완전 반응형 아키텍처로 전환. 데스크톱에서 사이드바 + 콘텐츠 2단 레이아웃, 태블릿 중간 상태, 모바일 하단 탭바 패턴을 체계적으로 적용.
>
> **Project**: SleepingPlan
> **Feature**: responsive-web-architecture
> **Version**: 0.1.0
> **Date**: 2026-02-21
> **Status**: Draft
> **Parent Feature**: sleep-habit-management

---

## 1. 현재 상태 분석 (Current State)

### 1.1 현재 반응형 구현 현황

| 영역 | 현재 상태 | 문제점 |
|------|-----------|--------|
| 레이아웃 컨테이너 | `max-w-2xl mx-auto` (672px) | 데스크톱에서 너무 좁음 |
| 내비게이션 | 상단 헤더 + 모바일 하단 탭 | 데스크톱에 사이드바 없음 |
| 대시보드 | 단일 컬럼 | 데스크톱 화면 공간 낭비 |
| 분석 페이지 | 단일 컬럼 차트 | 데스크톱에서 차트 너무 좁음 |
| 랜딩 페이지 | `md:grid-cols-3` 일부 적용 | 더 넓은 섹션 레이아웃 필요 |
| 수면 기록 | 단일 컬럼 | 데스크톱에서 폼+목록 나란히 미지원 |

### 1.2 현재 코드 구조

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Navbar + main flex-col (변경 필요)
│   │   ├── dashboard/page.tsx  ← max-w-2xl 단일 컬럼 (확장 필요)
│   │   ├── record/page.tsx     ← 단일 컬럼 (2단 레이아웃 필요)
│   │   ├── analytics/page.tsx  ← max-w-2xl (더 넓게 필요)
│   │   └── ...
│   └── page.tsx               ← 랜딩 (헤더/섹션 보강 필요)
└── components/
    └── layout/
        └── Navbar.tsx          ← 상단 헤더 + 모바일 탭 (사이드바 추가 필요)
```

---

## 2. 목표 아키텍처 (Target Architecture)

### 2.1 반응형 브레이크포인트 전략

| 브레이크포인트 | 범위 | 레이아웃 패턴 |
|--------------|------|-------------|
| **Mobile** | `< 768px` (md) | 전체 너비 + 하단 탭바 |
| **Tablet** | `768px ~ 1023px` | 상단 헤더 + 콘텐츠 (md 브레이크) |
| **Desktop** | `≥ 1024px` (lg) | 사이드바 + 메인 콘텐츠 2단 |

### 2.2 데스크톱 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│ [Sidebar 240px]  │  [Main Content Area]             │
│                  │                                   │
│  SleepingPlan    │  ┌─────────────────────────────┐ │
│  ──────────────  │  │  Page Content (max-w-5xl)   │ │
│  🏠 홈          │  │                              │ │
│  📝 수면기록     │  │  • 2-column grid on lg+     │ │
│  📊 분석        │  │  • Full-width charts         │ │
│  🤖 AI 코칭     │  │  • Wide form layouts         │ │
│  ⚙️ 설정        │  └─────────────────────────────┘ │
│                  │                                   │
│  [User Info]     │                                   │
│  [Logout]        │                                   │
└─────────────────────────────────────────────────────┘
```

### 2.3 모바일 레이아웃 구조

```
┌──────────────────┐
│ [Header: 로고]   │
├──────────────────┤
│                  │
│  Page Content    │
│  (full width)    │
│                  │
├──────────────────┤
│ 🏠 📝 📊 🤖 ⚙️ │  ← 하단 탭바 (고정)
└──────────────────┘
```

---

## 3. 변경 범위 (Scope of Changes)

### 3.1 레이아웃 컴포넌트 변경

#### 3.1.1 새 Sidebar 컴포넌트 생성
- **파일**: `src/components/layout/Sidebar.tsx` (신규)
- **내용**:
  - 로고 + 사용자 정보 + 네비게이션 링크 + 로그아웃
  - `lg:flex hidden` (모바일/태블릿에서 숨김)
  - 고정 너비 `w-60` (240px)

#### 3.1.2 DashboardLayout 개선
- **파일**: `src/app/(dashboard)/layout.tsx`
- **변경**:
  ```tsx
  // 기존: flex-col
  // 변경: lg에서 flex-row (사이드바 + 메인)
  <div className="min-h-screen flex flex-col lg:flex-row">
    <Sidebar />           {/* lg에서만 표시 */}
    <MobileHeader />      {/* lg 미만에서만 표시 */}
    <main className="flex-1 ...">
      {children}
    </main>
  </div>
  ```

#### 3.1.3 모바일 헤더 분리
- **파일**: `src/components/layout/MobileHeader.tsx` (신규)
- **내용**: 로고 + 사용자명만 표시하는 심플 헤더 (`lg:hidden`)

#### 3.1.4 Navbar 리팩토링 또는 분리
- **파일**: `src/components/layout/Navbar.tsx`
- **변경**: Sidebar + MobileHeader + BottomTabBar로 역할 분리

### 3.2 페이지별 레이아웃 변경

| 페이지 | 현재 | 변경 후 |
|--------|------|--------|
| `dashboard/page.tsx` | `max-w-2xl` 단일 컬럼 | `max-w-5xl`, lg에서 2컬럼 (요약+차트) |
| `record/page.tsx` | 단일 컬럼 | lg에서 폼 사이드패널 + 기록 목록 |
| `analytics/page.tsx` | `max-w-2xl` | `max-w-5xl`, 차트 더 넓게 |
| `coaching/page.tsx` | 단일 컬럼 | lg에서 코칭 메시지 + 히스토리 사이드 |
| `settings/page.tsx` | 단일 컬럼 | `max-w-2xl` 유지 (설정은 좁게 적합) |
| `page.tsx` (랜딩) | 단순 flex | 전체 리디자인 (히어로 + 피처 섹션) |

### 3.3 컨테이너 시스템 표준화

기존 각 페이지마다 다른 `max-w-*` 값 → 표준화:

```tsx
// src/components/layout/PageContainer.tsx (신규)
// props: size = 'sm' | 'md' | 'lg' | 'full'
// sm: max-w-2xl (settings)
// md: max-w-3xl (default)
// lg: max-w-5xl (dashboard, analytics)
// full: w-full (landing hero)
```

---

## 4. 요구사항 (Requirements)

### 4.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| RW-01 | 데스크톱(lg+)에서 좌측 사이드바 내비게이션 표시 | High |
| RW-02 | 모바일(md 미만)에서 하단 탭바 유지 | High |
| RW-03 | 태블릿(md~lg)에서 상단 헤더 + 전체 너비 콘텐츠 | High |
| RW-04 | 대시보드 데스크톱 2컬럼 레이아웃 (통계 + 차트 나란히) | Medium |
| RW-05 | 수면 기록 페이지 데스크톱 폼/목록 나란히 | Medium |
| RW-06 | 분석 페이지 차트 데스크톱 최대 너비 확장 | Medium |
| RW-07 | 랜딩 페이지 반응형 섹션 리디자인 | Medium |
| RW-08 | 페이지 컨테이너 시스템 표준화 (`PageContainer` 컴포넌트) | Low |

### 4.2 비기능 요구사항

| 범주 | 기준 |
|------|------|
| 반응형 | 375px(모바일) ~ 1440px+(데스크톱) 전 구간 정상 동작 |
| 성능 | 레이아웃 변경으로 LCP 저하 없음 (Lighthouse ≥ 80) |
| 접근성 | 키보드 내비게이션 사이드바/탭바 모두 동작 |
| 일관성 | 모든 페이지 동일한 컨테이너 너비 기준 적용 |

---

## 5. 성공 기준 (Success Criteria)

- [ ] RW-01 ~ RW-07 모든 요구사항 구현
- [ ] Chrome DevTools 3개 기기 (375px, 768px, 1440px) 정상 레이아웃 확인
- [ ] 기존 기능 (수면 기록 CRUD, AI 코칭, 분석) 영향 없음
- [ ] Gap Analysis 90% 이상

---

## 6. 위험 요소 (Risks)

| 위험 | 영향도 | 대응 방안 |
|------|--------|-----------|
| 사이드바 추가로 기존 레이아웃 밀림 | Medium | `flex-1`로 메인 영역 자동 조정 |
| 2컬럼 전환 시 기존 상태 관리 영향 | Low | 레이아웃만 변경, 로직은 그대로 유지 |
| 다크 모드 대응 | Low | Tailwind `dark:` 클래스 병행 적용 |

---

## 7. 구현 순서 (Implementation Order)

1. `Sidebar.tsx` + `MobileHeader.tsx` 신규 컴포넌트 생성
2. `layout.tsx` — 사이드바 통합 레이아웃 적용
3. `Navbar.tsx` — 역할 축소 (하단 탭바만 담당)
4. `dashboard/page.tsx` — 2컬럼 레이아웃 적용
5. `record/page.tsx` — 데스크톱 사이드 폼 적용
6. `analytics/page.tsx` — 컨테이너 너비 확장
7. `coaching/page.tsx` — 2컬럼 레이아웃 적용
8. `page.tsx` (랜딩) — 섹션 리디자인
9. `PageContainer.tsx` 도입 (선택적 리팩토링)

---

## 8. 다음 단계 (Next Steps)

1. [ ] 이 플랜 기반으로 `responsive-web-architecture.design.md` 작성
2. [ ] `/pdca design responsive-web-architecture` 로 디자인 단계 시작
3. [ ] 승인 후 구현 시작

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 0.1 | 2026-02-21 | 초안 작성 — 현재 상태 분석 및 목표 아키텍처 정의 |
