'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { SleepRecord } from '@/types/sleep'
import { getDateNDaysAgo, getTodayString } from '@/lib/utils'

interface Props {
  records: SleepRecord[]
  targetHours?: number
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (!active || !payload?.length || payload[0].value == null) return null
  const h = Math.floor(payload[0].value)
  const m = Math.round((payload[0].value - h) * 60)
  return (
    <div className="bg-popover border rounded-lg shadow-md px-2.5 py-1.5 text-xs">
      <p className="font-medium">{label}</p>
      <p>{h}시간 {m > 0 ? `${m}분` : ''}</p>
    </div>
  )
}

export default function MiniWeekChart({ records, targetHours = 8 }: Props) {
  const today = getTodayString()
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = getDateNDaysAgo(6 - i)
    const d = new Date(date + 'T00:00:00')
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const rec = records.find((r) => r.date === date)
    return {
      label,
      isToday: date === today,
      수면: rec ? Math.round((rec.durationMinutes / 60) * 10) / 10 : null,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={({ x, y, payload }) => {
            const item = data.find((d) => d.label === payload.value)
            return (
              <text
                x={x}
                y={(y as number) + 10}
                textAnchor="middle"
                fontSize={10}
                fill={item?.isToday ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                fontWeight={item?.isToday ? 600 : 400}
              >
                {payload.value}
              </text>
            )
          }}
        />
        <YAxis domain={[0, 12]} tick={{ fontSize: 9 }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={targetHours}
          stroke="hsl(var(--destructive))"
          strokeDasharray="4 4"
          strokeWidth={1.2}
        />
        <Bar
          dataKey="수면"
          radius={[3, 3, 0, 0]}
          fill="hsl(var(--primary))"
          opacity={0.75}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
