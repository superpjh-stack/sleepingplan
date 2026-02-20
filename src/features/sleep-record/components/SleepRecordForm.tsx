'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useSleepRecordStore } from '@/stores/sleepRecordStore'
import { calcDurationMinutes, getTodayString } from '@/lib/utils'
import { MIN_QUALITY_SCORE, MAX_QUALITY_SCORE, MAX_NOTES_LENGTH } from '@/lib/constants'
import type { SleepRecord } from '@/types/sleep'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const schema = z.object({
  date: z.string().min(1, '날짜를 선택하세요'),
  bedTime: z.string().min(1, '취침 시간을 입력하세요'),
  wakeTime: z.string().min(1, '기상 시간을 입력하세요'),
  qualityScore: z.number().min(MIN_QUALITY_SCORE).max(MAX_QUALITY_SCORE),
  notes: z.string().max(MAX_NOTES_LENGTH).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  // Dialog 모드 (모바일/태블릿)
  open?: boolean
  onClose?: () => void
  // 인라인 모드 (데스크톱 패널)
  inline?: boolean
  // 공통
  editTarget?: SleepRecord
  defaultDate?: string
}

const STEPS = ['날짜 선택', '취침/기상 시간', '수면 질 & 메모'] as const

export default function SleepRecordForm({ open, onClose, editTarget, inline, defaultDate }: Props) {
  const [step, setStep] = useState(0)
  const { addRecord, editRecord } = useSleepRecordStore()
  const isEdit = !!editTarget

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: editTarget?.date ?? defaultDate ?? getTodayString(),
      bedTime: editTarget?.bedTime ?? '23:00',
      wakeTime: editTarget?.wakeTime ?? '07:00',
      qualityScore: editTarget?.qualityScore ?? 7,
      notes: editTarget?.notes ?? '',
    },
  })

  const qualityScore = watch('qualityScore')
  const bedTime = watch('bedTime')
  const wakeTime = watch('wakeTime')

  const duration = bedTime && wakeTime
    ? calcDurationMinutes(bedTime, wakeTime)
    : null

  const handleClose = () => {
    reset()
    setStep(0)
    if (!inline) onClose?.()
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        date: data.date,
        bedTime: data.bedTime,
        wakeTime: data.wakeTime,
        durationMinutes: calcDurationMinutes(data.bedTime, data.wakeTime),
        qualityScore: data.qualityScore,
        notes: data.notes || undefined,
      }

      if (isEdit && editTarget) {
        await editRecord(editTarget.id, payload)
        toast.success('수면 기록이 수정되었습니다')
      } else {
        await addRecord(payload)
        toast.success('수면 기록이 저장되었습니다 🌙')
      }
      handleClose()
    } catch {
      toast.error('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const canNext = () => {
    if (step === 0) return !!watch('date')
    if (step === 1) return !!watch('bedTime') && !!watch('wakeTime')
    return true
  }

  // ── 폼 공통 콘텐츠 ──
  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 py-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 sm:w-8 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted-foreground hidden sm:inline">{STEPS[step]}</span>
      </div>

      {/* Step 0: 날짜 선택 */}
      {step === 0 && (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="date">수면 날짜</Label>
            <Input
              id="date"
              type="date"
              max={getTodayString()}
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 1: 취침/기상 시간 */}
      {step === 1 && (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bedTime">취침 시간</Label>
            <Input id="bedTime" type="time" {...register('bedTime')} />
            {errors.bedTime && (
              <p className="text-sm text-destructive">{errors.bedTime.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="wakeTime">기상 시간</Label>
            <Input id="wakeTime" type="time" {...register('wakeTime')} />
            {errors.wakeTime && (
              <p className="text-sm text-destructive">{errors.wakeTime.message}</p>
            )}
          </div>
          {duration !== null && (
            <p className="text-sm text-muted-foreground text-center">
              총 수면 시간:{' '}
              <span className="font-medium text-foreground">
                {Math.floor(duration / 60)}시간 {duration % 60}분
              </span>
            </p>
          )}
        </div>
      )}

      {/* Step 2: 수면 질 & 메모 */}
      {step === 2 && (
        <div className="space-y-5 py-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>수면 질 점수</Label>
              <span className="text-2xl font-bold">{qualityScore}</span>
            </div>
            <Slider
              min={MIN_QUALITY_SCORE}
              max={MAX_QUALITY_SCORE}
              step={1}
              value={[qualityScore]}
              onValueChange={([v]) => setValue('qualityScore', v)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>😴 매우 나쁨</span>
              <span>😊 매우 좋음</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">메모 (선택)</Label>
            <Textarea
              id="notes"
              placeholder="오늘 수면에 대한 메모를 남겨보세요..."
              rows={3}
              maxLength={MAX_NOTES_LENGTH}
              {...register('notes')}
            />
            <p className="text-xs text-muted-foreground text-right">
              {watch('notes')?.length ?? 0}/{MAX_NOTES_LENGTH}
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 pt-4">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="flex-1"
          >
            이전
          </Button>
        )}

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="flex-1"
          >
            다음
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? '저장 중...' : isEdit ? '수정 완료' : '저장'}
          </Button>
        )}
      </div>
    </form>
  )

  // ── 인라인 모드 (데스크톱 패널) ──
  if (inline) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {isEdit ? '수면 기록 수정' : '새 수면 기록'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    )
  }

  // ── Dialog 모드 (모바일/태블릿) ──
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md overflow-y-auto max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? '수면 기록 수정' : '수면 기록 추가'}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
