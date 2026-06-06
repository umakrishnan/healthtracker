export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

function isoWeek(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay() === 0 ? 7 : d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day - 1))
  return monday.toISOString().slice(0, 10)
}

function weekLabel(mondayStr: string) {
  const d = new Date(mondayStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function GET() {
  const [sleepRes, foodRes, actRes, backRes] = await Promise.all([
    pool.query('SELECT date, hours FROM sleep_log ORDER BY date ASC'),
    pool.query('SELECT date, rating FROM food_log ORDER BY date ASC'),
    pool.query('SELECT date FROM activity_log WHERE completed = true ORDER BY date ASC'),
    pool.query('SELECT date, pain_level, status FROM back_checkin ORDER BY date ASC'),
  ])

  const weeks = new Map<string, {
    sleep: number[]
    food: { green: number; yellow: number; red: number }
    actDays: Set<string>
    backPain: number[]
    backStatus: string[]
  }>()

  function ensureWeek(w: string) {
    if (!weeks.has(w)) {
      weeks.set(w, { sleep: [], food: { green: 0, yellow: 0, red: 0 }, actDays: new Set(), backPain: [], backStatus: [] })
    }
    return weeks.get(w)!
  }

  for (const r of sleepRes.rows) ensureWeek(isoWeek(r.date)).sleep.push(r.hours)

  for (const r of foodRes.rows) {
    const f = ensureWeek(isoWeek(r.date)).food
    if (r.rating === 'green') f.green++
    else if (r.rating === 'yellow') f.yellow++
    else f.red++
  }

  for (const r of actRes.rows) ensureWeek(isoWeek(r.date)).actDays.add(r.date)

  for (const r of backRes.rows) {
    ensureWeek(isoWeek(r.date)).backPain.push(r.pain_level)
    ensureWeek(isoWeek(r.date)).backStatus.push(r.status)
  }

  const result = [...weeks.keys()].sort().map(w => {
    const d = weeks.get(w)!
    const avgSleep = d.sleep.length ? +(d.sleep.reduce((a, b) => a + b, 0) / d.sleep.length).toFixed(1) : null
    const avgPain = d.backPain.length ? +(d.backPain.reduce((a, b) => a + b, 0) / d.backPain.length).toFixed(1) : null
    const totalFood = d.food.green + d.food.yellow + d.food.red
    const trend = d.backStatus.length
      ? d.backStatus.filter(s => s === 'better').length > d.backStatus.filter(s => s === 'worse').length
        ? 'better' : d.backStatus.some(s => s === 'worse') ? 'worse' : 'same'
      : null

    return {
      week: w,
      label: weekLabel(w),
      avgSleep,
      food: totalFood ? d.food : null,
      activeDays: d.actDays.size,
      avgPain,
      backTrend: trend,
    }
  })

  return NextResponse.json(result)
}
