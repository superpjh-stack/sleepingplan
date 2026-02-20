import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD 이어야 합니다'),
  bedTime: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식은 HH:MM 이어야 합니다'),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식은 HH:MM 이어야 합니다'),
  durationMinutes: z.number().int().positive(),
  qualityScore: z.number().int().min(1).max(10),
  notes: z.string().max(500).optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // "YYYY-MM"

  let whereClause: { userId: string; date?: { gte: string; lte: string } } = {
    userId: session.user.id,
  }

  if (month) {
    const from = `${month}-01`
    const d = new Date(from)
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    const to = d.toISOString().slice(0, 10)
    whereClause = { ...whereClause, date: { gte: from, lte: to } }
  }

  const records = await prisma.sleepRecord.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
  })

  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const record = await prisma.sleepRecord.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes('Unique constraint')
    ) {
      return NextResponse.json(
        { error: '해당 날짜의 수면 기록이 이미 존재합니다' },
        { status: 409 }
      )
    }
    console.error('[sleep-records POST]', err)
    return NextResponse.json(
      { error: '수면 기록 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
