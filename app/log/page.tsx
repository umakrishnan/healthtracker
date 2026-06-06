'use client'

import { useState, useEffect, useCallback } from 'react'

const ACTIVITIES = [
  { id: 'walk',    label: '🚶 Walk 45 min',    type: 'walk' },
  { id: 'pt',      label: '◆ PT Session',       type: 'pt' },
  { id: 'pilates', label: '✦ Pilates',           type: 'pilates' },
  { id: 'yoga',    label: '🌿 Yoga',             type: 'yoga' },
  { id: 'swim',    label: '🏊 Swim',             type: 'swim' },
]

function toISOLocal(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

function getWeekDates(base: Date) {
  const day = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((day + 6) % 7))
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

export default function LogPage() {
  const today = toISOLocal()
  const [selectedDate, setSelectedDate] = useState(today)
  const [completions, setCompletions] = useState<Record<string, boolean>>({})
  const [streak, setStreak] = useState(0)
  const [weekSummary, setWeekSummary] = useState<{ date: string; count: number }[]>([])

  const fetchDay = useCallback(async (date: string) => {
    const res = await fetch(`/api/activity?from=${date}&to=${date}`)
    const logs: { activity: string; completed: boolean }[] = await res.json()
    const map: Record<string, boolean> = {}
    for (const a of ACTIVITIES) map[a.id] = false
    for (const l of logs) map[l.activity] = l.completed
    setCompletions(map)
  }, [])

  const fetchStreak = useCallback(async () => {
    const res = await fetch('/api/activity')
    const all: { date: string; completed: boolean }[] = await res.json()
    const doneDays = [...new Set(all.filter(a => a.completed).map(a => a.date))].sort().reverse()
    let s = 0
    let check = new Date(today)
    for (const d of doneDays) {
      if (d === toISOLocal(check)) { s++; check.setDate(check.getDate() - 1) } else break
    }
    setStreak(s)
  }, [today])

  const fetchWeek = useCallback(async () => {
    const dates = getWeekDates(new Date())
    const from = dates[0]; const to = dates[6]
    const res = await fetch(`/api/activity?from=${from}&to=${to}`)
    const all: { date: string; completed: boolean }[] = await res.json()
    const byDay = dates.map(d => ({
      date: d,
      count: all.filter(a => a.date === d && a.completed).length,
    }))
    setWeekSummary(byDay)
  }, [])

  useEffect(() => {
    fetchDay(selectedDate)
    fetchStreak()
    fetchWeek()
  }, [selectedDate, fetchDay, fetchStreak, fetchWeek])

  const toggle = async (activityId: string) => {
    const newVal = !completions[activityId]
    setCompletions(prev => ({ ...prev, [activityId]: newVal }))
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, activity: activityId, completed: newVal }),
    })
    fetchStreak()
    fetchWeek()
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Activity Completion</div>
        <h1>Daily <em>Activity</em><br />Log</h1>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        {/* Streak */}
        <div className="stat-row" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-num">{streak}</div>
            <div className="stat-label">day streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{weekSummary.reduce((s, d) => s + d.count, 0)}</div>
            <div className="stat-label">activities this week</div>
          </div>
        </div>

        {/* Week overview dots */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">This Week</div>
          <div style={{ padding: '14px 16px', display: 'flex', gap: 6, justifyContent: 'space-between' }}>
            {weekSummary.map((d, i) => (
              <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--light)', letterSpacing: 1 }}>{dayLabels[i]}</div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: d.count > 0 ? 'var(--sage)' : 'var(--warm)',
                  border: `2px solid ${d.date === today ? 'var(--clay)' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: d.count > 0 ? 'white' : 'var(--light)',
                }}>
                  {d.count || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--clay)', display: 'block', marginBottom: 6 }}>Date</label>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '10px 13px', background: 'var(--warm)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--ink)', width: '100%', outline: 'none' }}
          />
        </div>

        {/* Checkboxes */}
        <div className="card">
          <div className="card-header">Activities</div>
          {ACTIVITIES.map(a => (
            <div key={a.id} className="activity-row">
              <button
                className={`activity-check${completions[a.id] ? ' done' : ''}`}
                onClick={() => toggle(a.id)}
                aria-label={`Mark ${a.label} ${completions[a.id] ? 'incomplete' : 'complete'}`}
              >
                {completions[a.id] && '✓'}
              </button>
              <span className={`pill pill-${a.type}`}>{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
