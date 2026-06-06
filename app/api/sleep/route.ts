import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const { rows } = from && to
    ? await pool.query('SELECT * FROM sleep_log WHERE date >= $1 AND date <= $2 ORDER BY date ASC', [from, to])
    : await pool.query('SELECT * FROM sleep_log ORDER BY date ASC')
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const { date, hours } = await req.json()
  const { rows } = await pool.query(
    `INSERT INTO sleep_log (date, hours)
     VALUES ($1, $2)
     ON CONFLICT (date) DO UPDATE SET hours = $2
     RETURNING *`,
    [date, hours]
  )
  return NextResponse.json(rows[0])
}
