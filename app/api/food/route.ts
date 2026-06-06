import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const where = from && to ? { date: { gte: from, lte: to } } : {}
  const logs = await prisma.foodLog.findMany({ where, orderBy: { date: 'desc' } })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const { date, rating, notes } = await req.json()
  const log = await prisma.foodLog.upsert({
    where: { date },
    update: { rating, notes },
    create: { date, rating, notes },
  })
  return NextResponse.json(log)
}
