import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const { rows } = from && to
    ? await pool.query('SELECT * FROM food_log WHERE date >= $1 AND date <= $2 ORDER BY date DESC', [from, to])
    : await pool.query('SELECT * FROM food_log ORDER BY date DESC')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { date, rating, notes } = await req.json()
  const { rows } = await pool.query(
    `INSERT INTO food_log (date, rating, notes)
     VALUES ($1, $2, $3)
     ON CONFLICT (date) DO UPDATE SET rating = $2, notes = $3
     RETURNING *`,
    [date, rating, notes ?? null]
  )
  return NextResponse.json(rows[0])
}
