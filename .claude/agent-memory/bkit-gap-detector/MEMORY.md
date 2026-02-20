# Gap Detector Memory - SleepingPlan

## Project Context
- **Project**: SleepingPlan (#10), Level: Dynamic
- **Tech (Design)**: Next.js App Router + Prisma + PostgreSQL + NextAuth.js + Zustand + Recharts + sonner
- **Tech (Current Impl)**: Next.js App Router + bkend.ai BaaS + Zustand + Recharts + sonner
- **Primary Feature**: sleep-habit-management
- **Architecture Migration**: bkend.ai -> Prisma/NextAuth (design updated, impl not yet)

## Analysis History

### sleep-habit-management v0.1 (2026-02-20, pre-migration)
- **Match Rate**: 91% (88/97 checkpoints passed)
- **Status**: Completed, no iteration needed at that time

### sleep-habit-management v0.2 (2026-02-20, post-architecture-change)
- **Match Rate**: 28% (21/56 checkpoints passed)
- **Reason**: Design updated to Prisma/NextAuth; impl still on bkend.ai
- **Key Gaps**:
  - 0/9 infrastructure items (no Prisma schema, no lib/prisma.ts, no lib/auth.ts)
  - 1/7 API routes (only coaching/generate exists, still uses bkend.ai)
  - 0/6 auth items (no NextAuth, no middleware, all bkend.ai JWT tokens)
  - 0/6 type items (still `_id` not `id`, string timestamps not Date)
  - 0/4 store items (all import from bkend.ts)
  - 12/13 UI components (all functional, only Sidebar missing intentionally)
  - 9/11 pages (all exist, layout auth is wrong mechanism)
- **Migration**: ~495 new lines, 16 files to modify, 1 to delete, 4 npm packages
- **Status**: < 90%, iteration (migration) required

### responsive-web-architecture v0.1 (2026-02-21)
- **Match Rate**: 96% (80/83 checkpoints passed)
- **Status**: PASSED (>= 90%), no iteration needed
- **Key Gaps**:
  - Navbar.tsx not deleted (dead code, 85 lines) -- only actionable gap
  - Sidebar container: `shrink-0` instead of `min-h-screen` (cosmetic)
  - Dashboard mobile stacking: `mt-5 lg:mt-0` instead of `space-y-5 lg:space-y-0` (cosmetic)
- **Code Quality**: navItems duplicated in Sidebar.tsx and BottomTabBar.tsx (extract recommended)

## Architecture Patterns
- Layout split into Sidebar (lg+) + MobileHeader (<lg) + BottomTabBar (<md)
- Navbar.tsx is now dead code (layout.tsx no longer imports it)
- Navbar previously handled both desktop horizontal nav and mobile bottom tab bar
- Claude API client logic is inline in `/api/coaching/generate/route.ts` (single consumer)
- bkend.ts (213 lines) is the unified API client -- to be deleted post-migration
- Stores: authStore, sleepRecordStore, goalStore (all Zustand, all import bkend.ts)
- Types: sleep.ts uses `_id` (MongoDB), coaching.ts uses `_id` -- must change to `id`
- Store method names differ: `editRecord`/`removeRecord` vs design `updateRecord`/`deleteRecord`

## File Paths
- Design: `docs/02-design/features/sleep-habit-management.design.md`
- Plan: `docs/01-plan/features/sleep-habit-management.plan.md`
- Analysis: `docs/03-analysis/sleep-habit-management.analysis.md`
- Impl root: `src/`

## Migration Notes
- See `migration-plan.md` for detailed 24-step execution order
- bkend.ai env vars to remove: NEXT_PUBLIC_BKEND_API_URL, NEXT_PUBLIC_BKEND_PROJECT_ID, BKEND_SERVICE_KEY
- New env vars needed: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- `_id` references in: sleepRecordStore, goalStore, SleepRecordForm, SleepRecordCard, NotificationSettings
