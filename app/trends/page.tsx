'use client'

import { useState, useEffect } from 'react'

type WeekData = {
  week: string
  label: string
  avgSleep: number | null
  food: { green: number; yellow: number; red: number } | null
  activeDays: number
  avgPain: number | null
  backTrend: 'better' | 'same' | 'worse' | null
}

function SleepChart({ weeks }: { weeks: WeekData[] }) {
  const maxH = 10
  const data = weeks.filter(w => w.avgSleep !== null)
  if (!data.length) return <p style={{ fontSize: 12, color: 'var(--muted)', padding: '16px' }}>No sleep data yet.</p>

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80, marginBottom: 8 }}>
        {data.map(w => {
          const h = w.avgSleep!
          const pct = (h / maxH) * 100
          const color = h >= 7 ? 'var(--sage)' : h >= 6 ? 'var(--yellow)' : 'var(--clay)'
          return (
            <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 600 }}>{h}h</div>
              <div style={{ width: '100%', height: `${pct}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 4 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map(w => (
          <div key={w.week} style={{ flex: 1, fontSize: 8, color: 'var(--light)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {w.label}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 12, fontSize: 10, color: 'var(--muted)' }}>
        <span><span style={{ color: 'var(--clay)' }}>■</span> under 6h</span>
        <span><span style={{ color: 'var(--yellow)' }}>■</span> 6–7h</span>
        <span><span style={{ color: 'var(--sage)' }}>■</span> 7h+</span>
      </div>
    </div>
  )
}

function FoodChart({ weeks }: { weeks: WeekData[] }) {
  const data = weeks.filter(w => w.food !== null)
  if (!data.length) return <p style={{ fontSize: 12, color: 'var(--muted)', padding: '16px' }}>No food data yet.</p>

  return (
    <div style={{ padding: '16px' }}>
      {data.map(w => {
        const f = w.food!
        const total = f.green + f.yellow + f.red
        const gPct = (f.green / total) * 100
        const yPct = (f.yellow / total) * 100
        const rPct = (f.red / total) * 100
        return (
          <div key={w.week} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>{w.label}</span>
              <span style={{ fontSize: 10, color: 'var(--light)' }}>{total} days logged</span>
            </div>
            <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', background: 'var(--warm)' }}>
              {gPct > 0 && <div style={{ width: `${gPct}%`, background: 'var(--green)' }} />}
              {yPct > 0 && <div style={{ width: `${yPct}%`, background: 'var(--yellow)' }} />}
              {rPct > 0 && <div style={{ width: `${rPct}%`, background: 'var(--red)' }} />}
            </div>
          </div>
        )
      })}
      <div style={{ marginTop: 4, display: 'flex', gap: 12, fontSize: 10, color: 'var(--muted)' }}>
        <span><span style={{ color: 'var(--green)' }}>■</span> Green</span>
        <span><span style={{ color: 'var(--yellow)' }}>■</span> Yellow</span>
        <span><span style={{ color: 'var(--red)' }}>■</span> Red</span>
      </div>
    </div>
  )
}

function BackChart({ weeks }: { weeks: WeekData[] }) {
  const data = weeks.filter(w => w.avgPain !== null)
  if (!data.length) return <p style={{ fontSize: 12, color: 'var(--muted)', padding: '16px' }}>No back check-in data yet.</p>

  const trendIcon = { better: '↑', same: '→', worse: '↓' }
  const trendColor = { better: 'var(--green)', same: 'var(--yellow)', worse: 'var(--red)' }

  return (
    <div style={{ padding: '16px' }}>
      {/* Pain line chart using CSS */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60, marginBottom: 8 }}>
        {data.map(w => {
          const p = w.avgPain!
          const pct = (p / 10) * 100
          const color = p <= 3 ? 'var(--green)' : p <= 6 ? 'var(--yellow)' : 'var(--red)'
          return (
            <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 600 }}>{p}</div>
              <div style={{ width: '100%', height: `${pct}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 4 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {data.map(w => (
          <div key={w.week} style={{ flex: 1, fontSize: 8, color: 'var(--light)', textAlign: 'center' }}>{w.label}</div>
        ))}
      </div>

      {/* Trend badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {data.map(w => w.backTrend && (
          <span key={w.week} style={{
            fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
            background: `${trendColor[w.backTrend]}22`,
            color: trendColor[w.backTrend],
          }}>
            {trendIcon[w.backTrend]} {w.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ActivityChart({ weeks }: { weeks: WeekData[] }) {
  const data = weeks.filter(w => w.activeDays > 0 || weeks.indexOf(w) === weeks.length - 1)
  if (!data.filter(w => w.activeDays > 0).length) {
    return <p style={{ fontSize: 12, color: 'var(--muted)', padding: '16px' }}>No activity data yet.</p>
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70, marginBottom: 8 }}>
        {weeks.map(w => {
          const pct = (w.activeDays / 7) * 100
          return (
            <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 600 }}>{w.activeDays || ''}</div>
              <div style={{ width: '100%', height: `${Math.max(pct, 3)}%`, background: 'var(--sage)', borderRadius: '4px 4px 0 0', opacity: w.activeDays ? 1 : 0.15 }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {weeks.map(w => (
          <div key={w.week} style={{ flex: 1, fontSize: 8, color: 'var(--light)', textAlign: 'center' }}>{w.label}</div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 8 }}>Active days per week (days with at least one completed activity)</p>
    </div>
  )
}

export default function TrendsPage() {
  const [weeks, setWeeks] = useState<WeekData[]>([])
  const [loading, setLoading] = useState(true)
  const [window8, setWindow8] = useState(true)

  useEffect(() => {
    fetch('/api/trends')
      .then(r => r.json())
      .then((d: WeekData[]) => { setWeeks(d); setLoading(false) })
  }, [])

  const displayed = window8 ? weeks.slice(-8) : weeks

  const allTimeSleep = weeks.filter(w => w.avgSleep).map(w => w.avgSleep!)
  const overallSleepAvg = allTimeSleep.length
    ? (allTimeSleep.reduce((a, b) => a + b, 0) / allTimeSleep.length).toFixed(1)
    : null

  const totalGreen = weeks.reduce((s, w) => s + (w.food?.green ?? 0), 0)
  const totalFood = weeks.reduce((s, w) => s + (w.food ? w.food.green + w.food.yellow + w.food.red : 0), 0)
  const greenPct = totalFood ? Math.round((totalGreen / totalFood) * 100) : null

  const painEntries = weeks.filter(w => w.avgPain !== null)
  const recentPain = painEntries.length ? painEntries[painEntries.length - 1].avgPain : null
  const earliestPain = painEntries.length ? painEntries[0].avgPain : null
  const painDelta = recentPain !== null && earliestPain !== null ? +(recentPain - earliestPain).toFixed(1) : null

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Long-Term Progress</div>
        <h1>Your <em>Trends</em></h1>
        <p className="hero-sub">How you're doing over time — the bigger picture.</p>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0', fontSize: 13 }}>Loading…</p>
        ) : weeks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
              No data yet. Start logging sleep, food, and activities — trends will appear here after a few days.
            </p>
          </div>
        ) : (
          <>
            {/* All-time summary stats */}
            <div className="stat-row" style={{ marginBottom: 20 }}>
              {overallSleepAvg && (
                <div className="stat-card">
                  <div className="stat-num">{overallSleepAvg}h</div>
                  <div className="stat-label">avg sleep<br />all time</div>
                </div>
              )}
              {greenPct !== null && (
                <div className="stat-card">
                  <div className="stat-num">{greenPct}%</div>
                  <div className="stat-label">🟢 green food<br />days</div>
                </div>
              )}
              {painDelta !== null && (
                <div className="stat-card">
                  <div className="stat-num" style={{ color: painDelta <= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {painDelta > 0 ? '+' : ''}{painDelta}
                  </div>
                  <div className="stat-label">pain change<br />(first → now)</div>
                </div>
              )}
              <div className="stat-card">
                <div className="stat-num">{weeks.length}</div>
                <div className="stat-label">weeks<br />tracked</div>
              </div>
            </div>

            {/* Window toggle */}
            {weeks.length > 8 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[true, false].map(is8 => (
                  <button
                    key={String(is8)}
                    onClick={() => setWindow8(is8)}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 10,
                      border: `1.5px solid ${window8 === is8 ? 'var(--clay)' : 'var(--line)'}`,
                      background: window8 === is8 ? 'var(--clay-soft)' : 'var(--card)',
                      color: window8 === is8 ? 'var(--clay)' : 'var(--muted)',
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {is8 ? 'Last 8 weeks' : 'All time'}
                  </button>
                ))}
              </div>
            )}

            {/* Sleep chart */}
            <div className="sec-label">Sleep</div>
            <div className="card" style={{ marginBottom: 20 }}>
              <SleepChart weeks={displayed} />
            </div>

            {/* Back pain chart */}
            <div className="sec-label">Back Pain & Trend</div>
            <div className="card" style={{ marginBottom: 20 }}>
              <BackChart weeks={displayed} />
            </div>

            {/* Food chart */}
            <div className="sec-label">Food Check-Ins</div>
            <div className="card" style={{ marginBottom: 20 }}>
              <FoodChart weeks={displayed} />
            </div>

            {/* Activity chart */}
            <div className="sec-label">Active Days</div>
            <div className="card" style={{ marginBottom: 20 }}>
              <ActivityChart weeks={displayed} />
            </div>
          </>
        )}
      </div>
    </>
  )
}
