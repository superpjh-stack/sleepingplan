import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const updateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  bedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  wakeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationMinutes: z.number().int().positive().optional(),
  qualityScore: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(500).optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력값이 올바르지 않습니다', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const record = await prisma.sleepRecord.update({
      where: { id, userId: session.user.id },
      data: parsed.data,
    })

    return NextResponse.json(record)
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Record to update not found')) {
      return NextResponse.json({ error: '기록을 찾을 수 없습니다' }, { status: 404 })
    }
    console.error('[sleep-records PUT]', err)
    return NextResponse.json(
      { error: '수면 기록 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.sleepRecord.delete({
      where: { id, userId: session.user.id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: '기록을 찾을 수 없습니다' }, { status: 404 })
    }
    console.error('[sleep-records DELETE]', err)
    return NextResponse.json(
      { error: '수면 기록 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
