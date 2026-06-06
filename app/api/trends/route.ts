import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
  const [sleepLogs, foodLogs, activityLogs, backLogs] = await Promise.all([
    prisma.sleepLog.findMany({ orderBy: { date: 'asc' } }),
    prisma.foodLog.findMany({ orderBy: { date: 'asc' } }),
    prisma.activityLog.findMany({ where: { completed: true }, orderBy: { date: 'asc' } }),
    prisma.backCheckin.findMany({ orderBy: { date: 'asc' } }),
  ])

  // Group by week (Monday-keyed)
  const weeks = new Map<string, {
    sleep: number[]
    food: { green: number; yellow: number; red: number }
    activities: number
    backPain: number[]
    backStatus: string[]
  }>()

  function ensureWeek(w: string) {
    if (!weeks.has(w)) {
      weeks.set(w, { sleep: [], food: { green: 0, yellow: 0, red: 0 }, activities: 0, backPain: [], backStatus: [] })
    }
    return weeks.get(w)!
  }

  for (const l of sleepLogs) {
    const w = isoWeek(l.date)
    ensureWeek(w).sleep.push(l.hours)
  }

  for (const l of foodLogs) {
    const w = isoWeek(l.date)
    const bucket = ensureWeek(w).food
    if (l.rating === 'green') bucket.green++
    else if (l.rating === 'yellow') bucket.yellow++
    else bucket.red++
  }

  // Count unique active days per week
  const actDaysByWeek = new Map<string, Set<string>>()
  for (const l of activityLogs) {
    const w = isoWeek(l.date)
    if (!actDaysByWeek.has(w)) actDaysByWeek.set(w, new Set())
    actDaysByWeek.get(w)!.add(l.date)
    ensureWeek(w) // ensure entry exists
  }
  for (const [w, days] of actDaysByWeek) {
    weeks.get(w)!.activities = days.size
  }

  for (const l of backLogs) {
    const w = isoWeek(l.date)
    ensureWeek(w).backPain.push(l.painLevel)
    ensureWeek(w).backStatus.push(l.status)
  }

  const sorted = [...weeks.keys()].sort()

  const result = sorted.map(w => {
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
      activeDays: d.activities || 0,
      avgPain,
      backTrend: trend,
    }
  })

  return NextResponse.json(result)
}
