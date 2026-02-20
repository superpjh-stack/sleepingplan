'use client'

import type { SleepRecord } from '@/types/sleep'
import { formatDuration } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Props {
  records: SleepRecord[]
  targetDurationMinutes?: number
}

function avg(nums: number[]) {
  if (!nums.length) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

export default function StatsSummary({ records, targetDurationMinutes = 480 }: Props) {
  if (!records.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        이번 기간 기록이 없습니다
      </div>
    )
  }

  const avgDuration = avg(records.map((r) => r.durationMinutes))
  const avgQuality = (
    records.reduce((s, r) => s + r.qualityScore, 0) / records.length
  ).toFixed(1)

  const goalAchievedDays = records.filter(
    (r) => r.durationMinutes >= targetDurationMinutes
  ).length
  const goalRate = Math.round((goalAchievedDays / records.length) * 100)

  // 최다 취침 시간대 (HH만 추출)
  const bedHours = records.map((r) => parseInt(r.bedTime.split(':')[0]))
  const avgBedHour = avg(bedHours)
  const bedLabel =
    avgBedHour >= 22 || avgBedHour <= 2
      ? '늦은 밤'
      : avgBedHour <= 21
      ? '저녁'
      : '새벽'

  const stats = [
    {
      label: '평균 수면 시간',
      value: formatDuration(avgDuration),
      sub: `목표 ${formatDuration(targetDurationMinutes)}`,
      progress: Math.min(100, Math.round((avgDuration / targetDurationMinutes) * 100)),
      color: avgDuration >= targetDurationMinutes ? 'bg-green-500' : 'bg-yellow-500',
    },
    {
      label: '평균 수면 질',
      value: `${avgQuality} / 10`,
      sub: parseFloat(avgQuality) >= 7 ? '😊 양호' : parseFloat(avgQuality) >= 5 ? '😐 보통' : '😴 나쁨',
      progress: Math.round((parseFloat(avgQuality) / 10) * 100),
      color:
        parseFloat(avgQuality) >= 7
          ? 'bg-green-500'
          : parseFloat(avgQuality) >= 5
          ? 'bg-yellow-500'
          : 'bg-red-500',
    },
    {
      label: '목표 달성일',
      value: `${goalAchievedDays}일 / ${records.length}일`,
      sub: `달성률 ${goalRate}%`,
      progress: goalRate,
      color: goalRate >= 70 ? 'bg-green-500' : goalRate >= 40 ? 'bg-yellow-500' : 'bg-red-500',
    },
    {
      label: '평균 취침 시간대',
      value: `${String(avgBedHour).padStart(2, '0')}시`,
      sub: bedLabel,
      progress: null,
      color: '',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className="text-lg font-bold leading-tight">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            {s.progress !== null && (
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s.color}`}
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
