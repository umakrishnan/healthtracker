'use client'

import { useState, useEffect, useCallback } from 'react'

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

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function SleepPage() {
  const today = toISOLocal()
  const [date, setDate] = useState(today)
  const [hours, setHours] = useState(7.5)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [weekLogs, setWeekLogs] = useState<{ date: string; hours: number }[]>([])

  const fetchWeek = useCallback(async () => {
    const dates = getWeekDates(new Date())
    const from = dates[0]; const to = dates[6]
    const res = await fetch(`/api/sleep?from=${from}&to=${to}`)
    setWeekLogs(await res.json())
  }, [])

  const fetchDay = useCallback(async (d: string) => {
    const res = await fetch(`/api/sleep?from=${d}&to=${d}`)
    const logs: { hours: number }[] = await res.json()
    if (logs.length) setHours(logs[0].hours)
    else setHours(7.5)
  }, [])

  useEffect(() => { fetchDay(date); fetchWeek() }, [date, fetchDay, fetchWeek])

  const save = async () => {
    setSaving(true)
    await fetch('/api/sleep', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, hours }),
    })
    setSaving(false); setSaved(true)
    fetchWeek()
    setTimeout(() => setSaved(false), 2000)
  }

  const weekDates = getWeekDates(new Date())
  const avg = weekLogs.length
    ? (weekLogs.reduce((s, l) => s + l.hours, 0) / weekLogs.length).toFixed(1)
    : null

  function barClass(h: number) {
    if (h < 6) return 'low'
    if (h < 7) return 'ok'
    return 'good'
  }

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Sleep Tracking</div>
        <h1>Sleep <em>Log</em></h1>
        <p className="hero-sub">7–8 hrs non-negotiable. Discs rehydrate overnight.</p>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        {/* Weekly view */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>This Week</span>
            {avg && <span style={{ color: 'var(--ink)', fontWeight: 600 }}>avg {avg}h</span>}
          </div>
          <div style={{ padding: '16px' }}>
            {weekDates.map((d, i) => {
              const log = weekLogs.find(l => l.date === d)
              const h = log?.hours ?? 0
              return (
                <div key={d} className="sleep-bar-wrap">
                  <div className="sleep-day-label">{DAY_LABELS[i]}</div>
                  <div className="sleep-bar-bg">
                    <div
                      className={`sleep-bar-fill ${h ? barClass(h) : ''}`}
                      style={{ width: h ? `${Math.min((h / 10) * 100, 100)}%` : '0%' }}
                    />
                  </div>
                  <div className="sleep-hours-label">{h ? `${h}h` : '—'}</div>
                </div>
              )
            })}
            <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 10, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--clay)', display: 'inline-block' }} /> under 6h
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} /> 6–7h
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--sage)', display: 'inline-block' }} /> 7h+
              </span>
            </div>
          </div>
        </div>

        {/* Log form */}
        <div className="sec-label">Log Sleep</div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Date</label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={e => setDate(e.target.value)}
                style={{ padding: '10px 13px', background: 'var(--warm)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--ink)', width: '100%', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Hours slept</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min={2} max={12} step={0.5}
                  value={hours}
                  onChange={e => setHours(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--sage)', padding: 0, background: 'none', border: 'none' }}
                />
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 600, color: 'var(--clay)', minWidth: 48, textAlign: 'center' }}>
                  {hours}h
                </div>
              </div>
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Sleep Log'}
        </button>
      </div>
    </>
  )
}
