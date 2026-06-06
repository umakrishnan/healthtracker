import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const logs = await prisma.backCheckin.findMany({ orderBy: { date: 'desc' }, take: 20 })
  return NextResponse.json(logs)
}

export async function POST(req: NextRequest) {
  const { date, status, painLevel, notes } = await req.json()
  const log = await prisma.backCheckin.create({ data: { date, status, painLevel, notes } })
  return NextResponse.json(log)
}
