'use client'

import { useState, useEffect, useCallback } from 'react'

function toISOLocal(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

const RATINGS = [
  { id: 'green',  emoji: '🟢', label: 'Green', desc: 'Ate well, anti-inflammatory, protein-rich' },
  { id: 'yellow', emoji: '🟡', label: 'Yellow', desc: 'Mostly good, a few lapses' },
  { id: 'red',    emoji: '🔴', label: 'Red',    desc: 'Off track today' },
]

export default function FoodPage() {
  const today = toISOLocal()
  const [date, setDate] = useState(today)
  const [rating, setRating] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<{ date: string; rating: string; notes?: string | null }[]>([])

  const fetchHistory = useCallback(async () => {
    const res = await fetch('/api/food')
    setHistory(await res.json())
  }, [])

  const fetchDay = useCallback(async (d: string) => {
    const res = await fetch(`/api/food?from=${d}&to=${d}`)
    const logs: { rating: string; notes?: string | null }[] = await res.json()
    if (logs.length) { setRating(logs[0].rating); setNotes(logs[0].notes ?? '') }
    else { setRating(null); setNotes('') }
  }, [])

  useEffect(() => { fetchDay(date); fetchHistory() }, [date, fetchDay, fetchHistory])

  const save = async () => {
    if (!rating) return
    setSaving(true)
    await fetch('/api/food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, rating, notes: notes || null }),
    })
    setSaving(false); setSaved(true)
    fetchHistory()
    setTimeout(() => setSaved(false), 2000)
  }

  const emoji: Record<string, string> = { green: '🟢', yellow: '🟡', red: '🔴' }

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Nutrition Check-In</div>
        <h1>Daily Food <em>Traffic Light</em></h1>
        <p className="hero-sub">A simple, honest rating. No calorie counting required.</p>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--clay)', display: 'block', marginBottom: 6 }}>Date</label>
          <input
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
            style={{ padding: '10px 13px', background: 'var(--warm)', border: '1px solid var(--line)', borderRadius: 10, fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'var(--ink)', width: '100%', outline: 'none' }}
          />
        </div>

        {/* Traffic lights */}
        <div className="sec-label">How did you eat today?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {RATINGS.map(r => (
            <button
              key={r.id}
              className={`tl-btn ${r.id}${rating === r.id ? ' selected' : ''}`}
              onClick={() => setRating(r.id)}
            >
              <span className="tl-emoji">{r.emoji}</span>
              <span className="tl-label">{r.label}</span>
            </button>
          ))}
        </div>

        {rating && (
          <div style={{ marginBottom: 12, padding: '10px 13px', background: 'var(--warm)', borderRadius: 10, fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>
            {RATINGS.find(r => r.id === rating)?.desc}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--clay)', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you eat? Any wins or struggles?"
          />
        </div>

        <button className="btn-primary" onClick={save} disabled={saving || !rating}>
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Check-In'}
        </button>

        {/* History */}
        {history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="sec-label">Recent History</div>
            <div className="card">
              {history.slice(0, 14).map((log, i) => (
                <div key={log.date} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 16px',
                  borderBottom: i < Math.min(history.length - 1, 13) ? '1px solid var(--line)' : 'none',
                }}>
                  <span style={{ fontSize: 18 }}>{emoji[log.rating]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink)' }}>{log.date}</div>
                    {log.notes && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.5 }}>{log.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
