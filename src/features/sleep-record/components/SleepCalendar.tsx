'use client'

import { useState } from 'react'
import { useSleepRecordStore } from '@/stores/sleepRecordStore'
import { cn } from '@/lib/utils'
import type { SleepRecord } from '@/types/sleep'
import { Button } from '@/components/ui/button'
import SleepRecordForm from './SleepRecordForm'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function qualityBg(score: number) {
  if (score >= 8) return 'bg-green-200 text-green-900'
  if (score >= 5) return 'bg-yellow-200 text-yellow-900'
  return 'bg-red-200 text-red-900'
}

interface Props {
  onAddClick: (date: string) => void
}

export default function SleepCalendar({ onAddClick }: Props) {
  const { records, selectedMonth, setSelectedMonth, fetchRecords } = useSleepRecordStore()
  const [editTarget, setEditTarget] = useState<SleepRecord | null>(null)

  const [year, month] = selectedMonth.split('-').map(Number)
  const daysInMonth = getDaysInMonth(year, month - 1)
  const firstDay = getFirstDayOfWeek(year, month - 1)

  const recordMap = new Map(records.map((r) => [r.date, r]))

  const changeMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    setSelectedMonth(newMonth)
    fetchRecords(newMonth)
  }

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => changeMonth(-1)}>
          ‹ 이전
        </Button>
        <h2 className="font-semibold">
          {year}년 {month}월
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => changeMonth(1)}
          disabled={selectedMonth >= todayStr.slice(0, 7)}
        >
          다음 ›
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px sm:gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`
          const record = recordMap.get(dateStr)
          const isToday = dateStr === todayStr
          const isFuture = dateStr > todayStr

          return (
            <button
              key={day}
              disabled={isFuture}
              onClick={() => {
                if (record) {
                  setEditTarget(record)
                } else {
                  onAddClick(dateStr)
                }
              }}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors',
                isFuture && 'opacity-30 cursor-not-allowed',
                !isFuture && !record && 'hover:bg-muted cursor-pointer',
                isToday && !record && 'ring-2 ring-primary',
                record && qualityBg(record.qualityScore),
                record && 'cursor-pointer'
              )}
            >
              <span className="text-xs font-medium">{day}</span>
              {record && (
                <span className="text-[10px] opacity-75">{record.qualityScore}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-3 text-xs text-muted-foreground justify-center sm:justify-end">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200 inline-block" /> 좋음(8+)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-200 inline-block" /> 보통(5-7)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-200 inline-block" /> 나쁨(1-4)
        </span>
      </div>

      {/* 수정 모달 */}
      {editTarget && (
        <SleepRecordForm
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
          editTarget={editTarget}
        />
      )}
    </>
  )
}
