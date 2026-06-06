'use client'

import { useState, useEffect, useCallback } from 'react'

type ActivityDef = {
  id: string
  label: string
  type: string
  mode: 'minutes' | 'checkbox'
  note?: string
}

const ACTIVITIES: ActivityDef[] = [
  { id: 'walk_easy',     label: '🚶 Flat Walk',        type: 'walk',    mode: 'minutes', note: 'Flat route, steady pace' },
  { id: 'walk_hilly',    label: '🚶⛰️ Hilly Walk',    type: 'walk',    mode: 'minutes', note: 'Half flat, half uphill' },
  { id: 'walk_interval', label: '🚶⚡ Interval Walk',  type: 'walk',    mode: 'minutes', note: 'Brisk/easy intervals' },
  { id: 'pt',            label: '◆ PT Session',         type: 'pt',      mode: 'checkbox' },
  { id: 'pilates',       label: '✦ Pilates',            type: 'pilates', mode: 'checkbox' },
  { id: 'yoga',          label: '🌿 Yoga',              type: 'yoga',    mode: 'checkbox' },
  { id: 'swim_lesson',   label: '🏊 Swim Lesson',       type: 'swim',    mode: 'checkbox', note: '30 min with coach' },
]

function toISOLocal(d = new Date()) { return d.toISOString().slice(0, 10) }

function getWeekDates(base = new Date()) {
  const day = base.getDay()
  const monday = new Date(base)
  monday.setDate(base.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function LogPage() {
  const today = toISOLocal()
  const [selectedDate, setSelectedDate] = useState(today)
  // count=0 means not done; checkbox activities use count 0 or 1
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [streak, setStreak] = useState(0)
  const [weekDots, setWeekDots] = useState<{ date: string; count: number }[]>([])

  const fetchDay = useCallback(async (date: string) => {
    const res = await fetch(`/api/activity?from=${date}&to=${date}`)
    const logs: { activity: string; completed: boolean; count: number }[] = await res.json()
    const map: Record<string, number> = {}
    for (const a of ACTIVITIES) map[a.id] = 0
    for (const l of logs) if (l.completed) map[l.activity] = l.count ?? 1
    setCounts(map)
  }, [])

  const fetchStreak = useCallback(async () => {
    const res = await fetch('/api/activity')
    const all: { date: string; completed: boolean }[] = await res.json()
    const doneDays = [...new Set(all.filter(a => a.completed).map(a => a.date))].sort().reverse()
    let s = 0
    const check = new Date(today)
    for (const d of doneDays) {
      if (d === toISOLocal(check)) { s++; check.setDate(check.getDate() - 1) } else break
    }
    setStreak(s)
  }, [today])

  const fetchWeek = useCallback(async () => {
    const dates = getWeekDates()
    const res = await fetch(`/api/activity?from=${dates[0]}&to=${dates[6]}`)
    const all: { date: string; completed: boolean }[] = await res.json()
    setWeekDots(dates.map(d => ({
      date: d,
      count: all.filter(a => a.date === d && a.completed).length,
    })))
  }, [])

  useEffect(() => {
    fetchDay(selectedDate)
    fetchStreak()
    fetchWeek()
  }, [selectedDate, fetchDay, fetchStreak, fetchWeek])

  const save = async (id: string, newCount: number) => {
    const completed = newCount > 0
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate, activity: id, completed, count: newCount }),
    })
    fetchStreak()
    fetchWeek()
  }

  const setCount = (id: string, val: number) => {
    const clamped = Math.max(0, val)
    setCounts(prev => ({ ...prev, [id]: clamped }))
    save(id, clamped)
  }

  const toggle = (id: string) => {
    const next = counts[id] ? 0 : 1
    setCounts(prev => ({ ...prev, [id]: next }))
    save(id, next)
  }

  const totalToday = Object.values(counts).reduce((s, c) => s + (c > 0 ? 1 : 0), 0)

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Activity Completion</div>
        <h1>Daily <em>Activity</em><br />Log</h1>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        <div className="stat-row" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-num">{streak}</div>
            <div className="stat-label">day streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{totalToday}</div>
            <div className="stat-label">done today</div>
          </div>
        </div>

        {/* Week dots */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">This Week</div>
          <div style={{ padding: '14px 16px', display: 'flex', gap: 6, justifyContent: 'space-between' }}>
            {weekDots.map((d, i) => (
              <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--light)', letterSpacing: 1 }}>{DAY_LABELS[i]}</div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: d.count > 0 ? 'var(--sage)' : 'var(--warm)',
                  border: `2px solid ${d.date === today ? 'var(--clay)' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600,
                  color: d.count > 0 ? 'white' : 'var(--light)',
                }}>
                  {d.count || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--clay)', display: 'block', marginBottom: 6 }}>Date</label>
          <input
            type="date" value={selectedDate} max={today}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '10px 13px', background: 'var(--warm)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--ink)', width: '100%', outline: 'none' }}
          />
        </div>

        {/* Activity rows */}
        <div className="card">
          <div className="card-header">Activities</div>
          {ACTIVITIES.map((a, i) => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: i < ACTIVITIES.length - 1 ? '1px solid var(--line)' : 'none',
            }}>
              {a.mode === 'minutes' ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`pill pill-${a.type}`} style={{ opacity: counts[a.id] ? 1 : 0.7 }}>{a.label}</span>
                      {a.note && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{a.note}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => setCount(a.id, Math.max(0, (counts[a.id] ?? 0) - 5))}
                        disabled={!counts[a.id]}
                        style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          border: '1.5px solid var(--line)', background: 'var(--warm)',
                          fontSize: 16, cursor: counts[a.id] ? 'pointer' : 'not-allowed',
                          opacity: counts[a.id] ? 1 : 0.35,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
                        }}
                      >−</button>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="number"
                          min={0}
                          max={300}
                          value={counts[a.id] || ''}
                          placeholder="0"
                          onChange={e => {
                            const v = parseInt(e.target.value, 10)
                            setCount(a.id, isNaN(v) ? 0 : Math.max(0, Math.min(300, v)))
                          }}
                          style={{
                            width: '100%',
                            padding: '7px 28px 7px 10px',
                            fontFamily: 'Playfair Display, serif',
                            fontSize: 16, fontWeight: 600,
                            color: counts[a.id] ? 'var(--clay)' : 'var(--light)',
                            background: 'var(--warm)',
                            border: `1.5px solid ${counts[a.id] ? 'var(--clay)' : 'var(--line)'}`,
                            borderRadius: 9,
                            outline: 'none',
                            textAlign: 'center',
                            boxSizing: 'border-box',
                          }}
                        />
                        <span style={{
                          position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
                          fontSize: 11, fontWeight: 600, color: 'var(--muted)',
                          fontFamily: 'Outfit, sans-serif', pointerEvents: 'none',
                        }}>min</span>
                      </div>
                      <button
                        onClick={() => setCount(a.id, (counts[a.id] ?? 0) + 5)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          border: '1.5px solid var(--clay)', background: 'var(--clay-soft)',
                          fontSize: 16, cursor: 'pointer', color: 'var(--clay)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >+</button>
                    </div>
                  </div>
                </>
              ) : a.mode === 'checkbox' ? (
                <>
                  <button
                    onClick={() => toggle(a.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${counts[a.id] ? 'var(--sage)' : 'var(--line)'}`,
                      background: counts[a.id] ? 'var(--sage)' : 'none',
                      color: 'white', fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {counts[a.id] ? '✓' : ''}
                  </button>
                  <div style={{ flex: 1 }}>
                    <span className={`pill pill-${a.type}`} style={{ opacity: counts[a.id] ? 1 : 0.6 }}>{a.label}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => setCount(a.id, (counts[a.id] ?? 0) - 1)}
                      disabled={!counts[a.id]}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        border: '1.5px solid var(--line)', background: 'var(--warm)',
                        fontSize: 16, cursor: counts[a.id] ? 'pointer' : 'not-allowed',
                        opacity: counts[a.id] ? 1 : 0.35,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
                      }}
                    >−</button>
                    <div style={{
                      width: 24, textAlign: 'center',
                      fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600,
                      color: counts[a.id] ? 'var(--clay)' : 'var(--light)',
                    }}>
                      {counts[a.id] ?? 0}
                    </div>
                    <button
                      onClick={() => setCount(a.id, (counts[a.id] ?? 0) + 1)}
                      style={{
                        width: 28, height: 28, borderRadius: 8,
                        border: '1.5px solid var(--clay)', background: 'var(--clay-soft)',
                        fontSize: 16, cursor: 'pointer', color: 'var(--clay)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className={`pill pill-${a.type}`} style={{ opacity: counts[a.id] ? 1 : 0.6 }}>{a.label}</span>
                    {a.note && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{a.note}</div>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
