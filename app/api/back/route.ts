import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const { rows } = await pool.query('SELECT * FROM back_checkin ORDER BY date DESC LIMIT 20')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { date, status, painLevel, notes } = await req.json()
  const { rows } = await pool.query(
    `INSERT INTO back_checkin (date, status, pain_level, notes)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [date, status, painLevel, notes ?? null]
  )
  return NextResponse.json(rows[0])
}
