'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSleepRecord } from '@/features/sleep-record/hooks/useSleepRecord'
import StatsSummary from '@/features/analytics/components/StatsSummary'
import WeeklyChart from '@/features/analytics/components/WeeklyChart'
import MonthlyChart from '@/features/analytics/components/MonthlyChart'

export default function AnalyticsPage() {
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const [month, setMonth] = useState(currentMonth)

  const { records, isLoading } = useSleepRecord(month)

  const changeMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    setMonth(next)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 + 월 선택 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">수면 분석</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)}>
            ‹
          </Button>
          <span className="text-sm font-medium w-20 text-center">
            {month.replace('-', '년 ')}월
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => changeMonth(1)}
            disabled={month >= currentMonth}
          >
            ›
          </Button>
        </div>
      </div>

      {/* 통계 요약 */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <StatsSummary records={records} />
      )}

      {/* 주간 차트 (이번 달일 때만) */}
      {month === currentMonth && (
        isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <WeeklyChart records={records} />
        )
      )}

      {/* 월간 차트 */}
      {isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <MonthlyChart records={records} month={month} />
      )}
    </div>
  )
}
