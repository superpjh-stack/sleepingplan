import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const goalSchema = z.object({
  targetBedTime: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식은 HH:MM 이어야 합니다'),
  targetWakeTime: z.string().regex(/^\d{2}:\d{2}$/, '시간 형식은 HH:MM 이어야 합니다'),
  targetDurationMinutes: z.number().int().positive(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const goal = await prisma.sleepGoal.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json(goal)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = goalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const goal = await prisma.sleepGoal.upsert({
      where: { userId: session.user.id },
      update: parsed.data,
      create: { ...parsed.data, userId: session.user.id },
    })

    return NextResponse.json(goal)
  } catch (err) {
    console.error('[goals PUT]', err)
    return NextResponse.json(
      { error: '수면 목표 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
