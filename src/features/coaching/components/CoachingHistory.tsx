'use client'

import { useState, useEffect } from 'react'
import type { CoachingCache } from '@/types/coaching'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })
}

export default function CoachingHistory() {
  const [history, setHistory] = useState<CoachingCache[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const thirtyDaysAgo = (() => {
          const d = new Date()
          d.setDate(d.getDate() - 30)
          return d.toISOString().slice(0, 10)
        })()
        const res = await fetch(`/api/coaching/history?from=${thirtyDaysAgo}`)
        if (res.ok) {
          const data: CoachingCache[] = await res.json()
          setHistory(data ?? [])
        }
      } catch {
        // 히스토리 로드 실패는 무시
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!history.length) return null

  // 오늘 것은 CoachingCard에서 이미 표시하므로 제외
  const today = new Date().toISOString().slice(0, 10)
  const pastHistory = history.filter((h) => !h.generatedAt.startsWith(today))

  if (!pastHistory.length) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">이전 코칭 기록</h2>
      {pastHistory.map((item) => (
        <Card key={item.id} className="bg-muted/40">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground mb-1">
              {formatDate(item.generatedAt)} · {item.dataRangeFrom} ~ {item.dataRangeTo}
            </p>
            <p className="text-sm leading-relaxed line-clamp-3">{item.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
