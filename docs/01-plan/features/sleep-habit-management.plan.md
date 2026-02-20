# 수면습관관리 웹앱 기획서

> **Summary**: 개인 사용자가 수면을 기록하고 AI 기반 인사이트로 수면 습관을 개선할 수 있는 풀스택 웹 애플리케이션
>
> **Project**: SleepingPlan
> **Version**: 0.1.0
> **Author**: -
> **Date**: 2026-02-20
> **Status**: Draft

---

## 1. 개요 (Overview)

### 1.1 목적 (Purpose)

현대인의 불규칙한 수면 패턴 문제를 해결하기 위해, 사용자가 매일 수면 데이터를 손쉽게 기록하고 AI 기반 분석과 코칭을 통해 장기적으로 수면 습관을 개선할 수 있도록 돕는다.

### 1.2 배경 (Background)

- 국내 성인 10명 중 3명 이상이 수면 장애를 경험 (수면 건강 인식 증가)
- 기존 수면 앱은 웨어러블 기기 의존도가 높아 진입 장벽이 있음
- 기기 없이 자기 기입 방식으로 간편하게 기록하고 AI 코칭을 받는 서비스 부재

### 1.3 관련 문서

- 디자인 문서: `docs/02-design/features/sleep-habit-management.design.md` (작성 예정)

---

## 2. 범위 (Scope)

### 2.1 포함 범위 (In Scope)

- [x] 회원가입 / 로그인 / 로그아웃 (이메일 기반)
- [x] 수면 기록 입력 (취침 시간, 기상 시간, 수면 질 점수, 메모)
- [x] 수면 기록 목록 조회 / 수정 / 삭제
- [x] 수면 분석 대시보드 (주간/월간 차트, 평균 수면 시간, 수면 질 트렌드)
- [x] 취침/기상 알림 설정 (브라우저 알림)
- [x] 수면 루틴 목표 설정 (목표 취침 시간, 목표 수면 시간)
- [x] AI 수면 코칭 (수면 패턴 기반 개선 조언 생성)
- [x] 마이페이지 (프로필 수정, 목표 설정)

### 2.2 제외 범위 (Out of Scope)

- 웨어러블 기기 연동 (Apple Watch, Fitbit 등)
- 소셜 기능 (친구 비교, 커뮤니티)
- 유료 결제 / 구독 플랜
- 모바일 앱 (iOS / Android 네이티브)
- 의료 진단 기능

---

## 3. 요구사항 (Requirements)

### 3.1 기능 요구사항 (Functional Requirements)

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| FR-01 | 사용자는 이메일/비밀번호로 회원가입 및 로그인할 수 있다 | High | Pending |
| FR-02 | 사용자는 취침 시간, 기상 시간, 수면 질 점수(1-10), 메모를 입력하여 수면을 기록할 수 있다 | High | Pending |
| FR-03 | 사용자는 수면 기록을 달력 또는 리스트 형태로 조회할 수 있다 | High | Pending |
| FR-04 | 사용자는 수면 기록을 수정하거나 삭제할 수 있다 | High | Pending |
| FR-05 | 사용자는 주간/월간 수면 분석 차트(평균 수면 시간, 수면 질 트렌드)를 볼 수 있다 | High | Pending |
| FR-06 | 사용자는 목표 취침 시간과 목표 수면 시간을 설정할 수 있다 | Medium | Pending |
| FR-07 | 사용자는 취침/기상 알림을 설정하고 브라우저 푸시 알림을 받을 수 있다 | Medium | Pending |
| FR-08 | 시스템은 최근 2주 수면 데이터를 기반으로 AI 코칭 메시지를 생성한다 | Medium | Pending |
| FR-09 | 사용자는 마이페이지에서 닉네임과 수면 목표를 수정할 수 있다 | Low | Pending |
| FR-10 | 수면 기록이 없는 날에 대해 기록 유도 메시지를 표시한다 | Low | Pending |

### 3.2 비기능 요구사항 (Non-Functional Requirements)

| 범주 | 기준 | 측정 방법 |
|------|------|-----------|
| 성능 | 페이지 초기 로딩 < 2초 (LCP) | Lighthouse |
| 반응형 | 모바일(375px) ~ 데스크톱(1440px) 모두 지원 | Chrome DevTools |
| 보안 | OWASP Top 10 준수, JWT 기반 인증 | 코드 리뷰 |
| 접근성 | WCAG 2.1 AA 수준 | axe DevTools |
| UX | 수면 기록 입력 3스텝 이내 완료 | 사용성 테스트 |

---

## 4. 성공 기준 (Success Criteria)

### 4.1 완료 정의 (Definition of Done)

- [x] FR-01 ~ FR-08 모든 기능 구현 및 동작 확인
- [x] 모바일/데스크톱 반응형 UI 적용
- [x] 로그인/비로그인 라우팅 보호 처리
- [x] AI 코칭 메시지 정상 생성 (최소 2주 데이터 보유 시)
- [x] Gap Analysis 90% 이상 달성

### 4.2 품질 기준

- [x] ESLint 에러 0개
- [x] TypeScript 빌드 성공
- [x] Lighthouse Performance 80점 이상

---

## 5. 위험 요소 및 대응 (Risks and Mitigation)

| 위험 | 영향도 | 가능성 | 대응 방안 |
|------|--------|--------|-----------|
| AI 코칭 API 비용 초과 | High | Medium | Claude API 호출 횟수 제한 (1일 1회 생성, 캐싱 처리) |
| 브라우저 알림 권한 거부 | Medium | High | 인앱 알림 배너로 폴백 처리 |
| 수면 데이터 부족으로 AI 코칭 품질 저하 | Medium | Medium | 최소 7일 이상 데이터 수집 후 코칭 활성화 |
| PostgreSQL 연결 지연 | Low | Low | 로딩 스켈레톤 UI, 에러 경계 처리 |

---

## 6. 아키텍처 방향 (Architecture Considerations)

### 6.1 프로젝트 레벨 선택

| 레벨 | 특성 | 선택 |
|------|------|:----:|
| Starter | 정적 사이트, 로컬 스토리지 | ☐ |
| **Dynamic** | 풀스택, 자체 API + Prisma/PostgreSQL, 인증 포함 | ✅ |
| Enterprise | 마이크로서비스, 고트래픽 | ☐ |

**선택: Dynamic** — 개인 사용자 대상 SaaS MVP, 인증+DB+AI API 통합 필요

### 6.2 핵심 기술 결정

| 결정 항목 | 선택 | 이유 |
|-----------|------|------|
| 프레임워크 | Next.js 15 (App Router) | SEO, SSR, 풀스택 지원 |
| 스타일링 | Tailwind CSS + shadcn/ui | 빠른 UI 개발, 일관된 디자인 |
| 상태 관리 | Zustand | 경량, 단순한 클라이언트 상태 |
| 차트 | Recharts | React 친화적, 반응형 지원 |
| 폼 처리 | react-hook-form + zod | 유효성 검사 통합 |
| 인증 | NextAuth.js (Credentials) | Next.js 통합, 세션 관리 내장 |
| ORM | Prisma | 타입 안전 쿼리, 마이그레이션 지원 |
| 데이터베이스 | PostgreSQL | 안정적인 RDBMS, Prisma 최적 지원 |
| AI 코칭 | Claude API (claude-haiku-4-5) | 비용 효율적, 한국어 지원 우수 |

### 6.3 폴더 구조 (Dynamic 레벨)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 로그인/회원가입 라우트 그룹
│   ├── (dashboard)/       # 인증 필요 페이지 그룹
│   │   ├── dashboard/     # 메인 대시보드
│   │   ├── record/        # 수면 기록 입력/목록
│   │   ├── analytics/     # 분석 차트
│   │   ├── coaching/      # AI 코칭
│   │   └── settings/      # 알림/루틴 설정
│   └── api/               # API Route Handlers
│       ├── auth/          # NextAuth.js 핸들러
│       ├── sleep-records/ # 수면 기록 CRUD
│       ├── goals/         # 수면 목표 API
│       └── coaching/      # AI 코칭 생성
├── components/            # 공통 컴포넌트
│   ├── ui/               # shadcn/ui 기본 컴포넌트
│   └── charts/           # 수면 차트 컴포넌트
├── features/             # 도메인별 기능 모듈
│   ├── auth/
│   ├── sleep-record/
│   ├── analytics/
│   ├── coaching/
│   └── notifications/
├── services/             # 서버 사이드 서비스 레이어
│   └── claude.ts         # Claude API 클라이언트 (서버 전용)
├── lib/                  # 유틸리티
│   ├── prisma.ts         # Prisma 클라이언트 싱글턴
│   ├── auth.ts           # NextAuth.js 설정
│   └── constants.ts      # 상수 정의
├── types/                # 공통 타입 정의
└── prisma/               # Prisma 스키마 및 마이그레이션
    └── schema.prisma
```

---

## 7. 환경 변수 (Environment Variables)

| 변수명 | 용도 | 스코프 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | Server |
| `NEXTAUTH_SECRET` | NextAuth.js 세션 서명 키 | Server |
| `NEXTAUTH_URL` | 앱 도메인 (콜백 URL용) | Server |
| `ANTHROPIC_API_KEY` | Claude API 키 | Server |
| `NEXT_PUBLIC_APP_URL` | 앱 도메인 (알림 리다이렉트용) | Client |

---

## 8. 화면 목록 (Pages)

| 페이지 | 경로 | 인증 필요 | 설명 |
|--------|------|:---------:|------|
| 랜딩/소개 | `/` | ☐ | 서비스 소개, 로그인 유도 |
| 로그인 | `/login` | ☐ | 이메일 로그인 |
| 회원가입 | `/signup` | ☐ | 회원가입 폼 |
| 대시보드 | `/dashboard` | ✅ | 오늘의 수면 요약, 기록 유도 |
| 수면 기록 | `/record` | ✅ | 기록 목록 + 새 기록 입력 |
| 분석 | `/analytics` | ✅ | 주간/월간 차트 |
| AI 코칭 | `/coaching` | ✅ | 코칭 메시지 + 히스토리 |
| 설정 | `/settings` | ✅ | 알림, 루틴, 목표 설정 |
| 마이페이지 | `/settings/profile` | ✅ | 프로필 수정 |

---

## 9. 다음 단계 (Next Steps)

1. [ ] `docs/02-design/features/sleep-habit-management.design.md` 설계 문서 작성
2. [ ] Phase 1: 스키마/용어 정의 (`/phase-1-schema`)
3. [ ] Phase 2: 코딩 컨벤션 정의 (`/phase-2-convention`)
4. [ ] Phase 3: UI 목업 생성 (`/phase-3-mockup`)
5. [ ] 팀 리뷰 및 승인

---

## 버전 히스토리

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 0.1 | 2026-02-20 | 초안 작성 | - |
