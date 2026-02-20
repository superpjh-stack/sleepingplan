# Plan: login-first-flow

## 개요
- **Feature:** login-first-flow
- **작성일:** 2026-02-21
- **우선순위:** High
- **예상 범위:** 소규모 (파일 1~2개 수정)

## 목적

현재 앱에 접속하면 랜딩 페이지(`/`)가 먼저 표시되며 로그인과 회원가입 버튼이 동등하게 노출됩니다.
이를 **로그인 우선 진입 플로우**로 변경합니다:

- 앱 접속 시 `/login` 페이지가 먼저 표시됨
- 회원가입은 로그인 폼 하단의 "계정이 없으신가요? 회원가입" 링크를 통해서만 접근 가능
- 이미 로그인된 사용자는 `/dashboard`로 자동 리다이렉트

## 현재 플로우

```
/ (랜딩) → 로그인 버튼 → /login
         → 시작하기 버튼 → /signup
```

## 변경 후 플로우

```
/ → /login (redirect)
/login → 로그인 성공 → /dashboard
       → "계정이 없으신가요?" 링크 → /signup
/login → 이미 로그인됨 → /dashboard
```

## 요구사항

### FR-01: 루트 접속 시 로그인 페이지 우선 표시
- `src/app/page.tsx`를 `/login`으로 redirect하도록 변경
- 이미 로그인된 사용자는 `/dashboard`로 redirect

### FR-02: 회원가입 페이지 직접 접근 유지
- `/signup` URL은 유지 (북마크, 링크 공유 시)
- 단, 진입 경로는 로그인 페이지의 링크가 주 경로

### FR-03: LoginForm에 회원가입 링크 유지
- 현재 LoginForm 하단의 "계정이 없으신가요? 회원가입" 링크 유지 (이미 구현됨)

## 영향 범위

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `src/app/page.tsx` | 수정 | 랜딩 → `/login` redirect |

## 비영향 파일 (변경 없음)

- `src/app/(auth)/login/page.tsx` — 그대로 유지
- `src/app/(auth)/signup/page.tsx` — 그대로 유지
- `src/features/auth/components/LoginForm.tsx` — 하단 회원가입 링크 이미 존재
- `src/features/auth/components/SignupForm.tsx` — 하단 로그인 링크 이미 존재
- `src/middleware.ts` — 변경 불필요

## 구현 방법

`src/app/page.tsx`에서 `redirect('/login')` 사용 (Next.js 서버 컴포넌트의 `next/navigation` redirect 활용).
로그인 상태 확인은 `getServerSession`으로 서버 측에서 처리.

```tsx
// src/app/page.tsx 변경안
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RootPage() {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/dashboard')
  }
  redirect('/login')
}
```

## 완료 기준

- [ ] 앱 접속 시(`/`) 로그인 페이지로 즉시 이동
- [ ] 로그인된 사용자는 `/dashboard`로 이동
- [ ] `/signup` 직접 접근 시 회원가입 페이지 정상 표시
- [ ] 로그인 폼 하단 회원가입 링크 정상 동작
