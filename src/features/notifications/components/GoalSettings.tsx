'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useGoalStore } from '@/stores/goalStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

const schema = z.object({
  targetBedTime: z.string().regex(/^\d{2}:\d{2}$/, '올바른 시간을 입력해주세요'),
  targetWakeTime: z.string().regex(/^\d{2}:\d{2}$/, '올바른 시간을 입력해주세요'),
})

type FormValues = z.infer<typeof schema>

function calcDuration(bed: string, wake: string): number {
  const [bh, bm] = bed.split(':').map(Number)
  const [wh, wm] = wake.split(':').map(Number)
  let minutes = wh * 60 + wm - (bh * 60 + bm)
  if (minutes < 0) minutes += 24 * 60
  return minutes
}

export default function GoalSettings() {
  const { goal, isLoading, fetchGoal, upsertGoal } = useGoalStore()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetBedTime: '23:00',
      targetWakeTime: '07:00',
    },
  })

  useEffect(() => {
    fetchGoal()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (goal) {
      reset({
        targetBedTime: goal.targetBedTime,
        targetWakeTime: goal.targetWakeTime,
      })
    }
  }, [goal, reset])

  const bedTime = watch('targetBedTime')
  const wakeTime = watch('targetWakeTime')
  const duration =
    bedTime && wakeTime ? calcDuration(bedTime, wakeTime) : null

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      await upsertGoal({
        targetBedTime: values.targetBedTime,
        targetWakeTime: values.targetWakeTime,
        targetDurationMinutes: calcDuration(values.targetBedTime, values.targetWakeTime),
      })
      toast.success('수면 목표가 저장되었습니다')
    } catch {
      toast.error('저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-48 rounded-xl" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">수면 목표 설정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="targetBedTime">목표 취침 시간</Label>
              <Input
                id="targetBedTime"
                type="time"
                {...register('targetBedTime')}
              />
              {errors.targetBedTime && (
                <p className="text-xs text-destructive">
                  {errors.targetBedTime.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetWakeTime">목표 기상 시간</Label>
              <Input
                id="targetWakeTime"
                type="time"
                {...register('targetWakeTime')}
              />
              {errors.targetWakeTime && (
                <p className="text-xs text-destructive">
                  {errors.targetWakeTime.message}
                </p>
              )}
            </div>
          </div>
          {duration !== null && (
            <p className="text-sm text-muted-foreground">
              목표 수면 시간:{' '}
              <span className="font-medium text-foreground">
                {Math.floor(duration / 60)}시간{' '}
                {duration % 60 > 0 ? `${duration % 60}분` : ''}
              </span>
            </p>
          )}
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
