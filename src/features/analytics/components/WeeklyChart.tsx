'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { SleepRecord } from '@/types/sleep'
import { getDateNDaysAgo, getTodayString } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  records: SleepRecord[]
}

function buildWeeklyData(records: SleepRecord[]) {
  const days: { date: string; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = getDateNDaysAgo(i)
    const dateObj = new Date(d + 'T00:00:00')
    days.push({
      date: d,
      label: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
    })
  }

  const map = new Map(records.map((r) => [r.date, r]))

  return days.map(({ date, label }) => {
    const r = map.get(date)
    return {
      label,
      수면시간: r ? Math.round((r.durationMinutes / 60) * 10) / 10 : null,
      수면질: r ? r.qualityScore : null,
      목표: 8,
    }
  })
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        p.value !== null && (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.name === '수면시간' ? `${p.value}h` : p.value}
          </p>
        )
      ))}
    </div>
  )
}

export default function WeeklyChart({ records }: Props) {
  const today = getTodayString()
  const weekRecords = records.filter(
    (r) => r.date >= getDateNDaysAgo(6) && r.date <= today
  )
  const data = buildWeeklyData(weekRecords)
  const hasData = data.some((d) => d.수면시간 !== null)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">최근 7일 수면 현황</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            최근 7일 기록이 없습니다
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="left"
                domain={[0, 12]}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="left"
                dataKey="수면시간"
                fill="hsl(var(--primary))"
                opacity={0.8}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="left"
                dataKey="목표"
                stroke="hsl(var(--destructive))"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                yAxisId="right"
                dataKey="수면질"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
