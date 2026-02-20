import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import Anthropic from '@anthropic-ai/sdk'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { MIN_COACHING_DAYS, COACHING_DATA_RANGE_DAYS } from '@/lib/constants'
import { getTodayString, getDateNDaysAgo, formatDuration } from '@/lib/utils'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  void req

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다' } },
      { status: 401 }
    )
  }

  const userId = session.user.id
  const today = getTodayString()

  try {
    // 1. 오늘 생성된 캐시 확인
    const todayStart = new Date(`${today}T00:00:00Z`)
    const cached = await prisma.coachingCache.findFirst({
      where: {
        userId,
        generatedAt: { gte: todayStart },
      },
      orderBy: { generatedAt: 'desc' },
    })

    if (cached) {
      return NextResponse.json({
        message: cached.message,
        generatedAt: cached.generatedAt.toISOString(),
        dataRangeFrom: cached.dataRangeFrom,
        dataRangeTo: cached.dataRangeTo,
        fromCache: true,
      })
    }

    // 2. 최근 14일 수면 기록 조회
    const from = getDateNDaysAgo(COACHING_DATA_RANGE_DAYS - 1)
    const records = await prisma.sleepRecord.findMany({
      where: {
        userId,
        date: { gte: from, lte: today },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        bedTime: true,
        wakeTime: true,
        durationMinutes: true,
        qualityScore: true,
      },
    })

    // 3. 7일 미만이면 코칭 불가
    if (records.length < MIN_COACHING_DAYS) {
      return NextResponse.json(
        {
          error: {
            code: 'INSUFFICIENT_DATA',
            message: `수면 코칭을 위해 최소 ${MIN_COACHING_DAYS}일 이상의 기록이 필요합니다.`,
            requiredDays: MIN_COACHING_DAYS,
            currentDays: records.length,
          },
        },
        { status: 400 }
      )
    }

    // 4. Claude API 프롬프트 구성
    const dataText = records
      .map((r) => {
        const dur = formatDuration(r.durationMinutes)
        return `- ${r.date}: 취침 ${r.bedTime}, 기상 ${r.wakeTime}, 수면 ${dur}, 수면질 ${r.qualityScore}/10`
      })
      .join('\n')

    const avgDuration = Math.round(
      records.reduce((s, r) => s + r.durationMinutes, 0) / records.length
    )
    const avgQuality = (
      records.reduce((s, r) => s + r.qualityScore, 0) / records.length
    ).toFixed(1)

    const prompt = `다음은 사용자의 최근 ${records.length}일간 수면 데이터입니다:

${dataText}

요약 통계:
- 평균 수면 시간: ${formatDuration(avgDuration)}
- 평균 수면 질: ${avgQuality}/10

위 데이터를 분석하여 다음 내용을 포함한 수면 코칭을 한국어로 제공해주세요:
1. 현재 수면 패턴의 주요 특징 (1-2문장)
2. 가장 개선이 필요한 점 1가지
3. 구체적이고 실천 가능한 개선 방법 1-2가지

전체 응답은 250자 이내로 간결하게 작성해주세요. 친근하고 격려하는 톤으로 작성해주세요.`

    // 5. Claude API 호출
    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system:
        '당신은 수면 전문 AI 코치입니다. 사용자의 수면 데이터를 분석하여 실용적인 개선 조언을 제공합니다. 항상 따뜻하고 격려하는 톤을 유지하세요.',
      messages: [{ role: 'user', content: prompt }],
    })

    const coachingMessage =
      completion.content[0].type === 'text' ? completion.content[0].text : ''

    const generatedAt = new Date()

    // 6. coaching_cache에 저장 (Prisma)
    await prisma.coachingCache.create({
      data: {
        userId,
        message: coachingMessage,
        generatedAt,
        dataRangeFrom: from,
        dataRangeTo: today,
      },
    })

    return NextResponse.json({
      message: coachingMessage,
      generatedAt: generatedAt.toISOString(),
      dataRangeFrom: from,
      dataRangeTo: today,
      fromCache: false,
    })
  } catch (err) {
    console.error('[coaching/generate]', err)
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: '코칭 생성 중 오류가 발생했습니다' } },
      { status: 500 }
    )
  }
}
