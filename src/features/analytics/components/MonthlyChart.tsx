'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SleepRecord } from '@/types/sleep'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props {
  records: SleepRecord[]
  month: string   // "YYYY-MM"
}

function buildMonthlyData(records: SleepRecord[]) {
  return records
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      label: `${parseInt(r.date.slice(8))}일`,
      수면시간: Math.round((r.durationMinutes / 60) * 10) / 10,
      수면질: r.qualityScore,
    }))
}

function buildWeeklyAvg(records: SleepRecord[]) {
  const weeks: Record<number, { total: number; count: number; qualityTotal: number }> = {}
  records.forEach((r) => {
    const day = parseInt(r.date.slice(8))
    const week = Math.ceil(day / 7)
    if (!weeks[week]) weeks[week] = { total: 0, count: 0, qualityTotal: 0 }
    weeks[week].total += r.durationMinutes
    weeks[week].qualityTotal += r.qualityScore
    weeks[week].count++
  })
  return Object.entries(weeks).map(([w, v]) => ({
    label: `${w}주차`,
    평균수면: Math.round((v.total / v.count / 60) * 10) / 10,
    평균수면질: Math.round((v.qualityTotal / v.count) * 10) / 10,
  }))
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
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name.includes('수면시간') || p.name.includes('수면') && !p.name.includes('질')
            ? `${p.value}h`
            : p.value}
        </p>
      ))}
    </div>
  )
}

export default function MonthlyChart({ records, month }: Props) {
  const [year, m] = month.split('-')
  const title = `${year}년 ${parseInt(m)}월`
  const dailyData = buildMonthlyData(records)
  const weeklyData = buildWeeklyAvg(records)
  const hasData = records.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title} 분석</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
            이번 달 기록이 없습니다
          </div>
        ) : (
          <Tabs defaultValue="daily">
            <TabsList className="mb-3 h-8">
              <TabsTrigger value="daily" className="text-xs">일별</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">주별</TabsTrigger>
            </TabsList>

            {/* 일별 수면 시간 추이 */}
            <TabsContent value="daily">
              <p className="text-xs text-muted-foreground mb-2">수면 시간 추이 (h)</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={dailyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    dataKey="수면시간"
                    stroke="hsl(var(--primary))"
                    fill="url(#sleepGrad)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>

              <p className="text-xs text-muted-foreground mb-2 mt-4">수면 질 추이</p>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={dailyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="qualityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={3} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    dataKey="수면질"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#qualityGrad)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            {/* 주별 평균 */}
            <TabsContent value="weekly">
              <p className="text-xs text-muted-foreground mb-2">주별 평균 수면 시간 (h)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="평균수면"
                    fill="hsl(var(--primary))"
                    opacity={0.85}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <p className="text-xs text-muted-foreground mb-2 mt-4">주별 평균 수면 질</p>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="평균수면질"
                    fill="hsl(var(--chart-2))"
                    opacity={0.85}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
