import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')

  const whereClause: {
    userId: string
    generatedAt?: { gte: Date }
  } = { userId: session.user.id }

  if (from) {
    whereClause.generatedAt = { gte: new Date(`${from}T00:00:00Z`) }
  }

  const history = await prisma.coachingCache.findMany({
    where: whereClause,
    orderBy: { generatedAt: 'desc' },
  })

  return NextResponse.json(history)
}
