'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useSleepRecordStore } from '@/stores/sleepRecordStore'
import { formatDuration } from '@/lib/utils'
import type { SleepRecord } from '@/types/sleep'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import SleepRecordForm from './SleepRecordForm'

interface Props {
  record: SleepRecord
}

function qualityColor(score: number) {
  if (score >= 8) return 'bg-green-100 text-green-800'
  if (score >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

export default function SleepRecordCard({ record }: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { removeRecord } = useSleepRecordStore()

  const handleDelete = async () => {
    try {
      await removeRecord(record.id)
      toast.success('수면 기록이 삭제되었습니다')
    } catch {
      toast.error('삭제에 실패했습니다')
    }
    setDeleteOpen(false)
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="py-4 px-5">
          <div className="flex items-start justify-between gap-4">
            {/* 날짜 & 수면 시간 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{formatDate(record.date)}</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {record.bedTime} 취침 → {record.wakeTime} 기상
              </p>
              <p className="text-sm font-medium mt-1">
                총 {formatDuration(record.durationMinutes)}
              </p>
              {record.notes && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {record.notes}
                </p>
              )}
            </div>

            {/* 수면 질 점수 */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge className={qualityColor(record.qualityScore)}>
                {record.qualityScore}/10
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={() => setEditOpen(true)}
                >
                  수정
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수정 모달 */}
      <SleepRecordForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editTarget={record}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>수면 기록을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {formatDate(record.date)} 기록이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
