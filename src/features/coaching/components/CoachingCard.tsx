'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import type { CoachingResponse } from '@/types/coaching'
import { MIN_COACHING_DAYS } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CoachingCard() {
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<{ code: string; message: string; currentDays?: number } | null>(null)
  const [autoLoaded, setAutoLoaded] = useState(false)

  // 페이지 진입 시 캐시 자동 조회
  useEffect(() => {
    if (!autoLoaded) {
      setAutoLoaded(true)
      handleGenerate(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async (silent = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/coaching/generate', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setCoaching(data)
      if (!silent && data.fromCache) {
        toast.info('오늘의 코칭을 불러왔습니다')
      } else if (!silent && !data.fromCache) {
        toast.success('새 코칭이 생성되었습니다')
      }
    } catch {
      setError({ code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다' })
    } finally {
      setIsLoading(false)
    }
  }

  // 로딩 중
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </CardContent>
      </Card>
    )
  }

  // 데이터 부족 에러
  if (error?.code === 'INSUFFICIENT_DATA') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <p className="text-4xl mb-3">💤</p>
          <p className="font-medium">아직 코칭을 받을 수 없어요</p>
          <p className="text-sm text-muted-foreground mt-2">
            AI 코칭은 최소 {MIN_COACHING_DAYS}일 이상의 수면 기록이 필요합니다.
            <br />
            현재 <span className="font-medium text-foreground">{error.currentDays}일</span> 기록됨
          </p>
          <div className="mt-4 bg-muted rounded-full h-2 w-48 mx-auto overflow-hidden">
            <div
              className="h-2 bg-primary rounded-full transition-all"
              style={{ width: `${Math.round(((error.currentDays ?? 0) / MIN_COACHING_DAYS) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {MIN_COACHING_DAYS - (error.currentDays ?? 0)}일 더 기록하면 활성화됩니다
          </p>
        </CardContent>
      </Card>
    )
  }

  // 기타 에러
  if (error && !coaching) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => handleGenerate()}
          >
            다시 시도
          </Button>
        </CardContent>
      </Card>
    )
  }

  // 코칭 없음 (초기 상태)
  if (!coaching) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <p className="text-4xl mb-3">🤖</p>
          <p className="font-medium">AI 수면 코칭</p>
          <p className="text-sm text-muted-foreground mt-1">
            최근 수면 데이터를 분석해서 맞춤 코칭을 제공합니다
          </p>
          <Button className="mt-4" onClick={() => handleGenerate()}>
            코칭 받기
          </Button>
        </CardContent>
      </Card>
    )
  }

  // 코칭 표시
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            🤖 AI 수면 코칭
            {coaching.fromCache && (
              <Badge variant="secondary" className="text-xs font-normal">
                오늘의 코칭
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => handleGenerate()}
            disabled={isLoading}
          >
            새로고침
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {coaching.dataRangeFrom} ~ {coaching.dataRangeTo} 기반 분석
        </p>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{coaching.message}</p>
        <p className="text-xs text-muted-foreground mt-4 text-right">
          생성: {formatDate(coaching.generatedAt)}
        </p>
      </CardContent>
    </Card>
  )
}
