import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const { rows } = from && to
    ? await pool.query('SELECT * FROM activity_log WHERE date >= $1 AND date <= $2 ORDER BY date DESC', [from, to])
    : await pool.query('SELECT * FROM activity_log ORDER BY date DESC')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { date, activity, completed, count } = await req.json()
  const { rows } = await pool.query(
    `INSERT INTO activity_log (date, activity, completed, count)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (date, activity) DO UPDATE SET completed = $3, count = $4
     RETURNING *`,
    [date, activity, completed, count ?? 1]
  )
  return NextResponse.json(rows[0])
}
