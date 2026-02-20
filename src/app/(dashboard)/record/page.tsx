'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSleepRecord } from '@/features/sleep-record/hooks/useSleepRecord'
import SleepRecordCard from '@/features/sleep-record/components/SleepRecordCard'
import SleepCalendar from '@/features/sleep-record/components/SleepCalendar'
import SleepRecordForm from '@/features/sleep-record/components/SleepRecordForm'
import { getTodayString } from '@/lib/utils'

export default function RecordPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>()
  const { records, isLoading } = useSleepRecord()

  const handleAddClick = (date?: string) => {
    setPreselectedDate(date)
    setFormOpen(true)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">수면 기록</h1>
        {/* 모바일/태블릿: Dialog 열기 버튼 */}
        <Button className="lg:hidden" onClick={() => handleAddClick(getTodayString())}>
          + 새 기록
        </Button>
      </div>

      <div className="lg:grid lg:grid-cols-5 lg:gap-6">
        {/* ── 기록 목록/달력 (3/5) ── */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list">리스트</TabsTrigger>
              <TabsTrigger value="calendar">달력</TabsTrigger>
            </TabsList>

            {/* 리스트 뷰 */}
            <TabsContent value="list">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-4xl mb-3">🌙</p>
                  <p className="font-medium">이번 달 수면 기록이 없습니다</p>
                  <p className="text-sm mt-1">첫 번째 수면 기록을 추가해보세요!</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => handleAddClick()}
                  >
                    기록 추가하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <SleepRecordCard key={record.id} record={record} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 달력 뷰 */}
            <TabsContent value="calendar">
              <SleepCalendar onAddClick={handleAddClick} />
            </TabsContent>
          </Tabs>
        </div>

        {/* ── 인라인 폼 패널 (2/5) — 데스크톱 전용 ── */}
        <div className="hidden lg:block lg:col-span-2">
          <SleepRecordForm
            key={preselectedDate ?? 'inline-form'}
            inline
            defaultDate={preselectedDate}
          />
        </div>
      </div>

      {/* 모바일/태블릿: Dialog 모드 */}
      <div className="lg:hidden">
        <SleepRecordForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setPreselectedDate(undefined)
          }}
          defaultDate={preselectedDate}
        />
      </div>
    </div>
  )
}
