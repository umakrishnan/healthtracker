import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const where = from && to ? { date: { gte: from, lte: to } } : {}
  const logs = await prisma.sleepLog.findMany({ where, orderBy: { date: 'asc' } })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const { date, hours } = await req.json()
  const log = await prisma.sleepLog.upsert({
    where: { date },
    update: { hours },
    create: { date, hours },
  })
  return NextResponse.json(log)
}
