'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { NotificationSetting } from '@/types/sleep'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationSettings() {
  const [setting, setSetting] = useState<NotificationSetting | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bedtimeEnabled: false,
    bedtimeTime: '22:30',
    wakeEnabled: false,
    wakeTime: '07:00',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const s: NotificationSetting | null = await res.json()
          setSetting(s)
          if (s) {
            setForm({
              bedtimeEnabled: s.bedtimeEnabled,
              bedtimeTime: s.bedtimeTime,
              wakeEnabled: s.wakeEnabled,
              wakeTime: s.wakeTime,
            })
          }
        }
      } catch {
        // ignore — user may not have settings yet
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (form.bedtimeEnabled || form.wakeEnabled) {
        if (typeof Notification !== 'undefined') {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') {
            toast.error('알림 권한이 필요합니다. 브라우저 설정에서 허용해주세요.')
            setSaving(false)
            return
          }
        }
      }
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '저장 실패')
      }
      const updated: NotificationSetting = await res.json()
      setSetting(updated)
      toast.success('알림 설정이 저장되었습니다')
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
        <CardTitle className="text-base">알림 설정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="bedtimeEnabled"
              checked={form.bedtimeEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, bedtimeEnabled: e.target.checked }))
              }
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="bedtimeEnabled" className="cursor-pointer">
              취침 알림
            </Label>
          </div>
          <Input
            type="time"
            value={form.bedtimeTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, bedtimeTime: e.target.value }))
            }
            disabled={!form.bedtimeEnabled}
            className="w-32"
          />
        </div>
        <div className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="wakeEnabled"
              checked={form.wakeEnabled}
              onChange={(e) =>
                setForm((f) => ({ ...f, wakeEnabled: e.target.checked }))
              }
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="wakeEnabled" className="cursor-pointer">
              기상 알림
            </Label>
          </div>
          <Input
            type="time"
            value={form.wakeTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, wakeTime: e.target.value }))
            }
            disabled={!form.wakeEnabled}
            className="w-32"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          * 브라우저 알림 권한이 필요합니다
        </p>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장'}
        </Button>
      </CardContent>
    </Card>
  )
}
