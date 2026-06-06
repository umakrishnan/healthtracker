'use client'

import { useState, useEffect, useCallback } from 'react'

function toISOLocal(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

type CheckIn = { id: number; date: string; status: string; painLevel: number; notes?: string | null }

const RECOMMENDATIONS: Record<string, { title: string; color: string; bg: string; advice: string[]; modification: string }> = {
  better: {
    title: '↑ Improving — Stay the Course',
    color: 'var(--green)',
    bg: 'var(--green-soft)',
    advice: [
      'Proceed with the current week\'s planned activities.',
      'Consider advancing to the next phase if you\'ve been "better" for 2+ consecutive weeks.',
      'You can add optional swim sessions or extend Pilates by 5 min.',
      'Continue all PT exercises as prescribed.',
    ],
    modification: 'No modifications needed. If pain level is 0–2, you\'re eligible to progress phases early.',
  },
  same: {
    title: '→ Holding Steady — Maintain',
    color: 'var(--yellow)',
    bg: 'var(--yellow-soft)',
    advice: [
      'Keep all activities as planned — no new additions this week.',
      'Focus on form quality over volume in PT and Pilates.',
      'Ensure walks stay conversational pace — this isn\'t the week to push intervals.',
      'Check sleep and hydration first; plateau often reflects recovery deficit.',
    ],
    modification: 'Hold current phase. Don\'t progress until "better" for at least 1 week.',
  },
  worse: {
    title: '↓ Worse — Modify Immediately',
    color: 'var(--red)',
    bg: 'var(--red-soft)',
    advice: [
      'Drop interval walks — all walks should be easy, conversational pace this week.',
      'Skip Pilates entirely until you have 2 consecutive "same" or "better" days.',
      'Continue PT only if it does not provoke radiating leg pain. Inform your physio.',
      'Prioritise sleep, hydration, and anti-inflammatory foods this week.',
      'If pain is 7+ or you have new radiating leg pain — contact your physio before any exercise.',
    ],
    modification: 'Step back one phase. If in Phase 1, maintain walks + PT only. No Pilates, no swim intervals.',
  },
}

const PAIN_COLORS = (n: number) => {
  if (n <= 3) return 'var(--green)'
  if (n <= 6) return 'var(--yellow)'
  return 'var(--red)'
}

export default function BackPage() {
  const today = toISOLocal()
  const [status, setStatus] = useState<string | null>(null)
  const [pain, setPain] = useState(3)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<CheckIn[]>([])

  const fetchHistory = useCallback(async () => {
    const res = await fetch('/api/back')
    setHistory(await res.json())
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const save = async () => {
    if (!status) return
    setSaving(true)
    await fetch('/api/back', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, status, painLevel: pain, notes: notes || null }),
    })
    setSaving(false); setSaved(true)
    fetchHistory()
    setTimeout(() => setSaved(false), 2000)
  }

  const rec = status ? RECOMMENDATIONS[status] : null

  const statusBtnStyle = (s: string) => ({
    flex: 1,
    padding: '14px 8px',
    borderRadius: 12,
    border: `2px solid ${status === s ? RECOMMENDATIONS[s].color : 'var(--line)'}`,
    background: status === s ? RECOMMENDATIONS[s].bg : 'var(--card)',
    cursor: 'pointer',
    fontFamily: 'Outfit, sans-serif',
    fontSize: 11,
    fontWeight: 600,
    color: status === s ? RECOMMENDATIONS[s].color : 'var(--muted)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    transition: 'all 0.15s',
  })

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Adaptive Plan</div>
        <h1>Back <em>Check-In</em></h1>
        <p className="hero-sub">Your plan adapts to your back. Honest check-ins = better outcomes.</p>
      </div>

      <div className="page" style={{ paddingTop: 0 }}>
        <div className="sec-label">How is your back today?</div>

        {/* Status selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button style={statusBtnStyle('better')} onClick={() => setStatus('better')}>
            <span style={{ fontSize: 20 }}>↑</span>
            Better
          </button>
          <button style={statusBtnStyle('same')} onClick={() => setStatus('same')}>
            <span style={{ fontSize: 20 }}>→</span>
            Same
          </button>
          <button style={statusBtnStyle('worse')} onClick={() => setStatus('worse')}>
            <span style={{ fontSize: 20 }}>↓</span>
            Worse
          </button>
        </div>

        {/* Pain slider */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 16 }}>
            <label style={{ fontSize: 10, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>
              Pain level: <strong style={{ color: PAIN_COLORS(pain), fontWeight: 700, fontSize: 13 }}>{pain}/10</strong>
            </label>
            <input
              type="range"
              min={0} max={10} step={1}
              value={pain}
              onChange={e => setPain(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: PAIN_COLORS(pain), padding: 0, background: 'none', border: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--light)', marginTop: 4 }}>
              <span>0 — No pain</span>
              <span>10 — Severe</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {rec && (
          <div style={{ marginBottom: 16, padding: '14px 16px', background: rec.bg, border: `1px solid ${rec.color}`, borderRadius: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: rec.color, marginBottom: 10 }}>{rec.title}</div>
            <ul style={{ listStyle: 'none', marginBottom: 10 }}>
              {rec.advice.map((a, i) => (
                <li key={i} style={{ fontSize: 11.5, color: 'var(--ink)', lineHeight: 1.65, paddingBottom: 6, display: 'flex', gap: 7 }}>
                  <span style={{ color: rec.color, flexShrink: 0 }}>·</span>
                  {a}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.5)', borderRadius: 8, padding: '8px 11px', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--ink)' }}>Plan modification: </strong>{rec.modification}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 9, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--clay)', display: 'block', marginBottom: 6 }}>Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What triggered it? What helped? Any new symptoms?"
          />
        </div>

        <button className="btn-primary" onClick={save} disabled={saving || !status}>
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Check-In'}
        </button>

        {/* Trend */}
        {history.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div className="sec-label">Back Trend</div>
            <div className="card">
              {history.slice(0, 10).map((log, i) => (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 16px',
                  borderBottom: i < Math.min(history.length - 1, 9) ? '1px solid var(--line)' : 'none',
                }}>
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>
                    <span className={`status-badge status-${log.status}`}>
                      {log.status === 'better' ? '↑' : log.status === 'worse' ? '↓' : '→'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{log.date}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: PAIN_COLORS(log.painLevel) }}>pain {log.painLevel}/10</span>
                    </div>
                    {log.notes && <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{log.notes}</div>}
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
