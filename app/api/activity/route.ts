import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const where = from && to ? { date: { gte: from, lte: to } } : {}
  const logs = await prisma.activityLog.findMany({ where, orderBy: { date: 'desc' } })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const { date, activity, completed } = await req.json()
  const log = await prisma.activityLog.upsert({
    where: { date_activity: { date, activity } },
    update: { completed },
    create: { date, activity, completed },
  })
  return NextResponse.json(log)
}
