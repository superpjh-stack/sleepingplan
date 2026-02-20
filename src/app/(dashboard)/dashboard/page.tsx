'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSleepRecord } from '@/features/sleep-record/hooks/useSleepRecord'
import SleepRecordForm from '@/features/sleep-record/components/SleepRecordForm'
import MiniWeekChart from '@/features/analytics/components/MiniWeekChart'
import { useSession } from 'next-auth/react'
import { formatDuration, getTodayString, getDateNDaysAgo } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const TARGET_DURATION = 480 // 8시간 (분)

function qualityEmoji(score: number) {
  if (score >= 8) return '😊'
  if (score >= 5) return '😐'
  return '😴'
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user
  const today = getTodayString()
  const currentMonth = today.slice(0, 7)
  const [formOpen, setFormOpen] = useState(false)

  const { records, isLoading } = useSleepRecord(currentMonth)

  const todayRecord = records.find((r) => r.date === today)

  // 최근 7일 기록
  const weekStart = getDateNDaysAgo(6)
  const weekRecords = records.filter((r) => r.date >= weekStart && r.date <= today)

  const avgDuration = weekRecords.length
    ? Math.round(weekRecords.reduce((s, r) => s + r.durationMinutes, 0) / weekRecords.length)
    : null

  const avgQuality = weekRecords.length
    ? weekRecords.reduce((s, r) => s + r.qualityScore, 0) / weekRecords.length
    : null

  const goalDays = weekRecords.filter((r) => r.durationMinutes >= TARGET_DURATION).length
  const goalRate = weekRecords.length ? Math.round((goalDays / weekRecords.length) * 100) : 0

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return '좋은 아침이에요'
    if (h < 18) return '안녕하세요'
    return '좋은 저녁이에요'
  })()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="lg:grid lg:grid-cols-5 lg:gap-6">
        {/* ── 좌측 메인 (3/5) ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* 인사 */}
          <div>
            <h1 className="text-2xl font-bold">
              {greeting}, {user?.name ?? ''}님 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
          </div>

          {/* 오늘 기록 없음 배너 */}
          {!isLoading && !todayRecord && (
            <div className="rounded-xl border border-dashed border-primary/50 bg-primary/5 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">오늘 수면 기록이 없어요 🌙</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  어젯밤 수면을 기록해보세요
                </p>
              </div>
              <Button size="sm" onClick={() => setFormOpen(true)}>
                기록하기
              </Button>
            </div>
          )}

          {/* 이번 주 통계 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {isLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
            ) : (
              <>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <p className="text-xs text-muted-foreground">주간 평균</p>
                    <p className="text-lg font-bold mt-0.5">
                      {avgDuration !== null ? formatDuration(avgDuration) : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">수면 시간</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <p className="text-xs text-muted-foreground">평균 수면질</p>
                    <p className="text-lg font-bold mt-0.5">
                      {avgQuality !== null ? `${avgQuality.toFixed(1)}` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">/ 10점</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <p className="text-xs text-muted-foreground">목표 달성</p>
                    <p className="text-lg font-bold mt-0.5">
                      {weekRecords.length ? `${goalRate}%` : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {goalDays}/{weekRecords.length}일
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* 최근 7일 미니 차트 */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">최근 7일 수면 시간</CardTitle>
                <Link
                  href="/analytics"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  자세히 보기 →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              {isLoading ? (
                <Skeleton className="h-24 rounded" />
              ) : (
                <MiniWeekChart records={records} targetHours={TARGET_DURATION / 60} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 우측 사이드 (2/5) ── */}
        <div className="lg:col-span-2 space-y-5 mt-5 lg:mt-0">
          {/* 오늘 수면 요약 카드 */}
          {isLoading ? (
            <Skeleton className="h-36 rounded-xl" />
          ) : todayRecord ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">오늘의 수면</CardTitle>
                  <Badge variant="secondary">
                    {qualityEmoji(todayRecord.qualityScore)} {todayRecord.qualityScore}/10
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {formatDuration(todayRecord.durationMinutes)}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1">수면</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {todayRecord.bedTime} 취침 → {todayRecord.wakeTime} 기상
                </p>
                {todayRecord.notes && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                    &quot;{todayRecord.notes}&quot;
                  </p>
                )}
                {/* 목표 대비 진행률 */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>목표 달성률</span>
                    <span>
                      {Math.min(100, Math.round((todayRecord.durationMinutes / TARGET_DURATION) * 100))}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(100, Math.round((todayRecord.durationMinutes / TARGET_DURATION) * 100))}
                    className="h-1.5"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed opacity-60">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                아직 오늘 수면 기록이 없습니다
              </CardContent>
            </Card>
          )}

          {/* 빠른 메뉴 */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/record">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-4 px-4">
                  <p className="text-xl mb-1">📝</p>
                  <p className="font-medium text-sm">수면 기록</p>
                  <p className="text-xs text-muted-foreground">기록 추가/조회</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/coaching">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="py-4 px-4">
                  <p className="text-xl mb-1">🤖</p>
                  <p className="font-medium text-sm">AI 코칭</p>
                  <p className="text-xs text-muted-foreground">맞춤 수면 조언</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* 수면 기록 모달 (모바일/태블릿) */}
      <SleepRecordForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </div>
  )
}
