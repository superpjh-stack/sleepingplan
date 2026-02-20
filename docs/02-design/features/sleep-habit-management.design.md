# sleep-habit-management Design Document

> **Summary**: 수면 기록 CRUD, 분석 대시보드, AI 코칭을 제공하는 풀스택 수면 관리 웹앱 상세 설계
>
> **Project**: SleepingPlan
> **Version**: 0.1.0
> **Author**: -
> **Date**: 2026-02-20
> **Status**: Draft
> **Planning Doc**: [sleep-habit-management.plan.md](../../01-plan/features/sleep-habit-management.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | ❌ 작성 예정 |
| Phase 2 | Coding Conventions | ❌ 작성 예정 |
| Phase 3 | UI Mockup | ❌ 작성 예정 |
| Phase 4 | API Spec | ✅ 본 문서 섹션 4 |

---

## 1. Overview

### 1.1 Design Goals

- Next.js API Routes + Prisma + PostgreSQL 자체 백엔드로 완전한 데이터 소유권 확보
- Next.js App Router 서버 컴포넌트/클라이언트 컴포넌트 역할 명확히 분리
- Claude API 비용 최소화를 위한 1일 1회 코칭 생성 + 캐싱 전략
- 3스텝 이내 수면 기록 입력 완료 (UX 목표)
- 반응형 UI: 모바일(375px) ~ 데스크톱(1440px)

### 1.2 Design Principles

- **단일 책임**: 각 feature 모듈은 하나의 도메인만 담당
- **API Route 자체 구현**: 인증(NextAuth.js)·DB CRUD(Prisma)를 Next.js 내에서 직접 처리
- **점진적 활성화**: AI 코칭은 7일 이상 데이터 보유 시 활성화
- **오프라인 친화**: 로딩 스켈레톤 + 에러 경계로 API 지연 대응

---

## 2. Architecture

### 2.1 시스템 구성도

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Client)                   │
│  Next.js App Router                                   │
│  ├── Server Components (데이터 페칭, SEO)             │
│  └── Client Components (인터랙션, 상태 관리)          │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│             Next.js API Routes (Server)               │
│  ├── /api/auth/[...nextauth]  (NextAuth.js)          │
│  ├── /api/sleep-records       (Prisma CRUD)          │
│  ├── /api/goals               (Prisma CRUD)          │
│  ├── /api/notifications       (Prisma CRUD)          │
│  └── /api/coaching/generate   (Claude API 호출)      │
└────────────┬──────────────────────────┬──────────────┘
             │                          │
             ▼                          ▼
┌─────────────────────┐   ┌──────────────────────────┐
│   Prisma ORM        │   │   Anthropic Claude        │
│   └── PostgreSQL    │   │   claude-haiku-4-5        │
└─────────────────────┘   └──────────────────────────┘
```

### 2.2 Data Flow

```
[수면 기록 입력]
User → SleepRecordForm → zod 유효성 검사 → POST /api/sleep-records → Prisma → PostgreSQL

[AI 코칭 생성]
User → /coaching 페이지 → /api/coaching/generate → (캐시 확인)
  → 캐시 없음: 최근 14일 기록 조회(Prisma) → Claude API → 코칭 저장 → 응답
  → 캐시 있음: 캐시된 코칭 메시지 즉시 응답

[분석 대시보드]
User → /analytics → Server Component → Prisma 데이터 조회 → Recharts 렌더링
```

### 2.3 Component Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `(dashboard)/*` pages | NextAuth.js session | 인증 미들웨어 보호 |
| `SleepRecordForm` | react-hook-form, zod, /api/sleep-records | 수면 기록 입력/수정 |
| `AnalyticsChart` | Recharts, /api/sleep-records | 수면 데이터 시각화 |
| `CoachingCard` | /api/coaching/generate | AI 코칭 표시 |
| `NotificationSettings` | Web Notification API | 브라우저 알림 관리 |

---

## 3. Data Model

### 3.1 Entity 정의

```typescript
// 사용자 (NextAuth.js 세션과 연동)
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 수면 기록 (핵심 엔티티)
interface SleepRecord {
  id: string;
  userId: string;
  date: string;            // 기록 날짜 "YYYY-MM-DD" (unique per user)
  bedTime: string;         // 취침 시간 "HH:MM" (24h)
  wakeTime: string;        // 기상 시간 "HH:MM" (24h)
  durationMinutes: number; // 계산값: 수면 총 시간 (분)
  qualityScore: number;    // 수면 질 점수 1-10
  notes?: string;          // 메모 (선택)
  createdAt: Date;
  updatedAt: Date;
}

// 수면 목표
interface SleepGoal {
  id: string;
  userId: string;
  targetBedTime: string;
  targetWakeTime: string;
  targetDurationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

// 알림 설정
interface NotificationSetting {
  id: string;
  userId: string;
  bedtimeEnabled: boolean;
  bedtimeTime: string;    // "HH:MM"
  wakeEnabled: boolean;
  wakeTime: string;       // "HH:MM"
  createdAt: Date;
  updatedAt: Date;
}

// AI 코칭 캐시
interface CoachingCache {
  id: string;
  userId: string;
  message: string;
  generatedAt: Date;
  dataRangeFrom: string;  // "YYYY-MM-DD"
  dataRangeTo: string;    // "YYYY-MM-DD"
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Entity Relationships

```
[User] 1 ──── N [SleepRecord]
       1 ──── 1 [SleepGoal]
       1 ──── 1 [NotificationSetting]
       1 ──── N [CoachingCache]
```

### 3.3 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    // bcrypt 해시
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sleepRecords        SleepRecord[]
  sleepGoal           SleepGoal?
  notificationSetting NotificationSetting?
  coachingCaches      CoachingCache[]
}

model SleepRecord {
  id              String   @id @default(cuid())
  userId          String
  date            String   // "YYYY-MM-DD"
  bedTime         String   // "HH:MM"
  wakeTime        String   // "HH:MM"
  durationMinutes Int
  qualityScore    Int      // 1-10
  notes           String?  @db.VarChar(500)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}

model SleepGoal {
  id                    String   @id @default(cuid())
  userId                String   @unique
  targetBedTime         String
  targetWakeTime        String
  targetDurationMinutes Int
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model NotificationSetting {
  id              String   @id @default(cuid())
  userId          String   @unique
  bedtimeEnabled  Boolean  @default(false)
  bedtimeTime     String   @default("22:00")
  wakeEnabled     Boolean  @default(false)
  wakeTime        String   @default("07:00")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CoachingCache {
  id            String   @id @default(cuid())
  userId        String
  message       String   @db.Text
  generatedAt   DateTime
  dataRangeFrom String
  dataRangeTo   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, generatedAt])
}
```

---

## 4. API Specification

### 4.1 Next.js API Routes (Prisma 기반 CRUD)

| Resource | Endpoint | Methods | Auth |
|----------|----------|---------|------|
| 수면 기록 | `/api/sleep-records` | GET, POST | NextAuth session |
| 수면 기록 (단건) | `/api/sleep-records/[id]` | GET, PUT, DELETE | NextAuth session |
| 수면 목표 | `/api/goals` | GET, PUT | NextAuth session |
| 알림 설정 | `/api/notifications` | GET, PUT | NextAuth session |
| AI 코칭 생성 | `/api/coaching/generate` | POST | NextAuth session |

주요 쿼리 예시 (서버 컴포넌트 내 Prisma 직접 호출):
```typescript
// 특정 월 수면 기록 조회
const records = await prisma.sleepRecord.findMany({
  where: { userId, date: { gte: '2026-02-01', lte: '2026-02-28' } },
  orderBy: { date: 'asc' },
});

// 최근 14일 기록 (AI 코칭용)
const records = await prisma.sleepRecord.findMany({
  where: { userId, date: { gte: twoWeeksAgo } },
  orderBy: { date: 'asc' },
});
```

### 4.2 커스텀 API Routes

#### `POST /api/coaching/generate`

AI 코칭 메시지 생성 (서버 사이드, API 키 보호)

**Request:**
```json
{}
```
(NextAuth 세션 쿠키로 인증)

**처리 흐름:**
1. NextAuth 세션 검증 (`getServerSession`)
2. CoachingCache에서 오늘 생성된 캐시 확인 (Prisma)
3. 캐시 있음 → 즉시 캐시 반환
4. 캐시 없음 → 최근 14일 SleepRecord 조회 (Prisma)
5. 7일 미만 데이터 → 에러 응답 (코칭 비활성화)
6. Claude API 호출 (claude-haiku-4-5)
7. 결과 CoachingCache에 저장 (Prisma)
8. 코칭 메시지 반환

**Response (200 OK):**
```json
{
  "message": "최근 2주간 분석 결과...",
  "generatedAt": "2026-02-20T09:00:00Z",
  "dataRangeFrom": "2026-02-06",
  "dataRangeTo": "2026-02-20",
  "fromCache": false
}
```

**Error Responses:**
- `401 Unauthorized`: 인증 토큰 없음/만료
- `400 Bad Request`: 수면 데이터 7일 미만 (코칭 불가)
- `429 Too Many Requests`: 당일 코칭 이미 생성됨 (캐시 반환)

#### Claude API Prompt 설계

```
System: 당신은 수면 전문 코칭 AI입니다. 사용자의 수면 데이터를 분석하여
        실용적이고 구체적인 개선 조언을 한국어로 제공합니다.
        응답은 200-300자 이내로 간결하게 작성하세요.

User: 최근 14일간 수면 데이터:
      [날짜, 취침시간, 기상시간, 수면시간(분), 수면질점수] 형태의 데이터

      분석해서 주요 패턴과 개선점을 알려주세요.
```

---

## 5. UI/UX Design

### 5.1 페이지별 레이아웃

#### 랜딩 페이지 (`/`)
```
┌────────────────────────────────────┐
│  [Logo] SleepingPlan          [로그인]│
├────────────────────────────────────┤
│                                    │
│  Hero: "더 나은 수면을 위한 첫걸음" │
│  [지금 시작하기 →]                  │
│                                    │
├────────────────────────────────────┤
│  Feature Cards (3개)               │
│  수면 기록 | 분석 차트 | AI 코칭   │
└────────────────────────────────────┘
```

#### 대시보드 (`/dashboard`)
```
┌────────────────────────────────────┐
│  Sidebar/Header Nav               │
├────────────────────────────────────┤
│  오늘의 수면 요약 카드              │
│  [+ 수면 기록하기] CTA             │
├─────────────────┬──────────────────┤
│  이번 주 평균   │  목표 달성률      │
│  수면 시간      │  프로그레스 바    │
├────────────────────────────────────┤
│  최근 7일 미니 차트                │
│  [오늘 기록 없음 배너 - 조건부]    │
└────────────────────────────────────┘
```

#### 수면 기록 (`/record`)
```
┌────────────────────────────────────┐
│  [달력 뷰] [리스트 뷰] 탭 전환    │
├────────────────────────────────────┤
│  달력: 날짜별 기록 유무 표시       │
│  리스트: SleepRecordCard 목록      │
├────────────────────────────────────┤
│  [+ 새 기록 추가] FAB 버튼         │
└────────────────────────────────────┘

[수면 기록 입력 모달 - 3스텝]
Step 1: 날짜 선택
Step 2: 취침 시간 / 기상 시간 입력
Step 3: 수면 질 점수(1-10) + 메모 → [저장]
```

### 5.2 User Flow

```
신규 방문 → 랜딩(/) → 회원가입(/signup) → 대시보드(/dashboard)
                                              ↓
로그인 사용자 → 대시보드 → 수면 기록(/record) → 기록 입력 모달
                         → 분석(/analytics) → 차트 확인
                         → AI 코칭(/coaching) → 코칭 메시지 (7일+ 데이터 필요)
                         → 설정(/settings) → 알림/목표 설정
```

### 5.3 Component 목록

| Component | Location | 담당 |
|-----------|----------|------|
| `Navbar` | `src/components/layout/` | 상단 네비게이션 |
| `Sidebar` | `src/components/layout/` | 사이드바 (데스크톱) |
| `LoginForm` | `src/features/auth/components/` | 로그인 폼 |
| `SignupForm` | `src/features/auth/components/` | 회원가입 폼 |
| `SleepRecordForm` | `src/features/sleep-record/components/` | 수면 기록 입력 3스텝 |
| `SleepRecordCard` | `src/features/sleep-record/components/` | 기록 카드 (수정/삭제) |
| `SleepCalendar` | `src/features/sleep-record/components/` | 달력 뷰 |
| `WeeklyChart` | `src/features/analytics/components/` | 주간 수면 차트 |
| `MonthlyChart` | `src/features/analytics/components/` | 월간 수면 차트 |
| `StatsSummary` | `src/features/analytics/components/` | 통계 요약 카드 |
| `CoachingCard` | `src/features/coaching/components/` | AI 코칭 메시지 카드 |
| `GoalSettings` | `src/features/notifications/components/` | 수면 목표 설정 폼 |
| `NotificationSettings` | `src/features/notifications/components/` | 알림 설정 폼 |

---

## 6. State Management (Zustand)

### 6.1 Store 구조

```typescript
// src/stores/authStore.ts
interface AuthStore {
  user: { id: string; email: string; name?: string } | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// src/stores/sleepRecordStore.ts
interface SleepRecordStore {
  records: SleepRecord[];
  selectedMonth: string; // "YYYY-MM"
  isLoading: boolean;
  fetchRecords: (month: string) => Promise<void>;
  addRecord: (data: CreateSleepRecordInput) => Promise<void>;
  updateRecord: (id: string, data: UpdateSleepRecordInput) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

// src/stores/goalStore.ts
interface GoalStore {
  goal: SleepGoal | null;
  isLoading: boolean;
  fetchGoal: () => Promise<void>;
  upsertGoal: (data: SleepGoalInput) => Promise<void>;
}
```

### 6.2 서버 vs 클라이언트 컴포넌트 분리

| 컴포넌트 | 타입 | 이유 |
|----------|------|------|
| `/dashboard` page | Server | 초기 데이터 페칭, SEO |
| `/analytics` page | Server | 차트 데이터 SSR |
| `SleepRecordForm` | Client | 사용자 인터랙션 |
| `SleepCalendar` | Client | 달력 상태 관리 |
| `CoachingCard` | Client | 버튼 클릭 → API 호출 |
| `NotificationSettings` | Client | Web Notification API |

---

## 7. Error Handling

### 7.1 Error Code 정의

| Code | 상황 | 처리 |
|------|------|------|
| 401 | NextAuth 세션 없음/만료 | /login 리다이렉트 (middleware) |
| 403 | 다른 사용자 데이터 접근 | 에러 토스트 표시 |
| 404 | 수면 기록 없음 | 빈 상태 UI 표시 (기록 유도) |
| 400 | 중복 날짜 기록 (Prisma unique 제약) | "해당 날짜 기록이 이미 존재합니다" 안내 |
| 429 | Claude API 호출 한도 | "오늘의 코칭이 이미 생성되었습니다" 안내 |
| 500 | 서버 에러 | 에러 경계(Error Boundary) + 재시도 버튼 |

### 7.2 Error Response Format (API Routes)

```json
{
  "error": {
    "code": "INSUFFICIENT_DATA",
    "message": "수면 코칭을 위해 최소 7일간의 기록이 필요합니다.",
    "requiredDays": 7,
    "currentDays": 3
  }
}
```

---

## 8. Security Considerations

- [x] Prisma 쿼리에 `userId` 조건 필수 → 자신의 데이터만 접근
- [x] NextAuth 세션으로 모든 API Route 인증 (`getServerSession`)
- [x] ANTHROPIC_API_KEY 서버 사이드 전용 (NEXT_PUBLIC_ 접두사 없음)
- [x] DATABASE_URL, NEXTAUTH_SECRET 서버 전용 환경변수
- [x] zod 스키마로 모든 사용자 입력 유효성 검사
- [x] Prisma `@@unique([userId, date])` 제약으로 날짜 중복 방지
- [x] XSS 방지: notes 필드 최대 500자 (@db.VarChar(500)) + HTML 이스케이프
- [x] bcrypt로 비밀번호 해싱 (저장 전 처리)
- [ ] Rate Limiting: /api/coaching/generate에 IP 기반 제한 (추후)

---

## 9. Clean Architecture

### 9.1 Layer 구조

| Layer | 담당 | 위치 |
|-------|------|------|
| **Presentation** | 페이지, UI 컴포넌트 | `src/app/`, `src/components/`, `src/features/*/components/` |
| **Application** | 비즈니스 로직, 훅, 스토어 | `src/features/*/hooks/`, `src/stores/` |
| **Domain** | 타입, 인터페이스 | `src/types/` |
| **Infrastructure** | API 클라이언트, 외부 서비스 | `src/services/`, `src/lib/` |

### 9.2 This Feature's Layer Assignment

| 컴포넌트 | Layer | 위치 |
|----------|-------|------|
| `SleepRecordForm` | Presentation | `src/features/sleep-record/components/` |
| `useSleepRecord` | Application | `src/features/sleep-record/hooks/` |
| `SleepRecord` interface | Domain | `src/types/sleep.ts` |
| `prisma` singleton | Infrastructure | `src/lib/prisma.ts` |
| `claudeClient` | Infrastructure | `src/services/claude.ts` |
| `authOptions` | Infrastructure | `src/lib/auth.ts` |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `SleepRecordForm`, `CoachingCard` |
| 훅 | camelCase + use 접두사 | `useSleepRecord`, `useGoal` |
| 타입/인터페이스 | PascalCase | `SleepRecord`, `SleepGoal` |
| 상수 | UPPER_SNAKE_CASE | `MAX_COACHING_DAYS`, `MIN_QUALITY_SCORE` |
| 파일(컴포넌트) | PascalCase.tsx | `SleepRecordForm.tsx` |
| 파일(훅/유틸) | camelCase.ts | `useSleepRecord.ts`, `formatDuration.ts` |
| 폴더 | kebab-case | `sleep-record/`, `ai-coaching/` |

### 10.2 This Feature's Conventions

| 항목 | 적용 컨벤션 |
|------|------------|
| 컴포넌트 명명 | PascalCase, 기능명 + 역할명 (e.g. SleepRecordCard) |
| 파일 구성 | features/{domain}/components, hooks, types 분리 |
| 상태 관리 | Zustand store + Server Component 데이터 페칭 조합 |
| 에러 처리 | try-catch + 에러 토스트 (sonner 라이브러리) |
| API 호출 | services/ 레이어를 통해서만 (컴포넌트 직접 fetch 금지) |

---

## 11. Implementation Guide

### 11.1 파일 구조

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # 인증 체크 + 공통 레이아웃
│   │   ├── dashboard/page.tsx
│   │   ├── record/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── coaching/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── profile/page.tsx
│   ├── api/
│   │   └── coaching/
│   │       └── generate/route.ts
│   ├── layout.tsx              # 루트 레이아웃
│   └── page.tsx                # 랜딩 페이지
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── ui/                     # shadcn/ui 컴포넌트
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   ├── sleep-record/
│   │   ├── components/
│   │   │   ├── SleepRecordForm.tsx
│   │   │   ├── SleepRecordCard.tsx
│   │   │   └── SleepCalendar.tsx
│   │   └── hooks/
│   │       └── useSleepRecord.ts
│   ├── analytics/
│   │   └── components/
│   │       ├── WeeklyChart.tsx
│   │       ├── MonthlyChart.tsx
│   │       └── StatsSummary.tsx
│   ├── coaching/
│   │   └── components/
│   │       └── CoachingCard.tsx
│   └── notifications/
│       └── components/
│           ├── GoalSettings.tsx
│           └── NotificationSettings.tsx
├── services/
│   └── claude.ts              # Claude API 클라이언트 (서버 전용)
├── stores/
│   ├── authStore.ts
│   ├── sleepRecordStore.ts
│   └── goalStore.ts
├── types/
│   ├── sleep.ts               # SleepRecord, SleepGoal 타입
│   └── coaching.ts            # CoachingCache 타입
├── lib/
│   ├── prisma.ts              # Prisma 클라이언트 싱글턴
│   ├── auth.ts                # NextAuth.js authOptions
│   ├── utils.ts               # cn(), formatDuration() 등
│   └── constants.ts           # MAX_COACHING_DAYS 등
└── prisma/
    └── schema.prisma          # DB 스키마 정의
```

### 11.2 구현 순서

1. [ ] **환경 변수 설정** `.env.local` 생성 (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ANTHROPIC_API_KEY`)
2. [ ] **Prisma 초기화** `npx prisma init` → `schema.prisma` 작성 → `npx prisma migrate dev`
3. [ ] **타입 정의** `src/types/sleep.ts`, `src/types/coaching.ts`
4. [ ] **Prisma 클라이언트 싱글턴** `src/lib/prisma.ts`
5. [ ] **NextAuth.js 설정** `src/lib/auth.ts` + `/api/auth/[...nextauth]/route.ts`
6. [ ] **인증 플로우** LoginForm, SignupForm, (dashboard) middleware, `src/middleware.ts`
7. [ ] **Zustand 스토어** authStore, sleepRecordStore, goalStore
8. [ ] **수면 기록 CRUD API** `/api/sleep-records` Route Handlers (Prisma)
9. [ ] **수면 기록 UI** SleepRecordForm(3스텝), SleepRecordCard, SleepCalendar
10. [ ] **분석 차트** WeeklyChart, MonthlyChart (Recharts)
11. [ ] **AI 코칭** `/api/coaching/generate` Route Handler + CoachingCard
12. [ ] **알림/목표 설정** Web Notification API + GoalSettings API
13. [ ] **랜딩 페이지** `/` 마케팅 페이지
14. [ ] **반응형 UI 검증** 모바일/데스크톱 레이아웃 확인

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-20 | Initial draft | - |
