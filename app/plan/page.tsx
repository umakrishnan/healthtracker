'use client'

import { useState } from 'react'

type Day = { name: string; pills: { type: string; label: string }[]; note?: string }
type Week = { num: string; title: string; days: Day[]; note: string; defaultOpen?: boolean }
type Phase = { id: string; label: string; weeks: string; title: string; desc: string; weeks_data: Week[] }

const phases: Phase[] = [
  {
    id: 'ph1', label: 'Wks 1–2 · Establish', weeks: 'Weeks 1–2', title: 'Establish the Rhythm',
    desc: 'Introduce 2× Pilates/yoga sessions per week without disrupting your existing routine. Keep walks at 45 min flat — no intervals yet. Let your body adapt to the added load.',
    weeks_data: [
      {
        num: 'Week 01', title: 'Adding Pilates', defaultOpen: true,
        note: 'Add Pilates + yoga without disrupting existing habits. Monitor back response to Pilates closely — you should feel worked, not painful.',
        days: [
          { name: 'Mon', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pt', label: '◆ PT' }], note: 'PT immediately after walk is fine — you\'re already warmed up.' },
          { name: 'Tue', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pilates', label: '✦ Pilates 30 min' }], note: 'Pilates session A (see Pilates Library). Walk first, rest 1 hr, then Pilates.' },
          { name: 'Wed', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pt', label: '◆ PT' }], note: 'PT after walk. Wednesday is a full active day.' },
          { name: 'Thu', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }], note: 'Walk only. Active recovery day.' },
          { name: 'Fri', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'yoga', label: '🌿 Yoga 25 min' }], note: 'Restorative yoga: legs-up-wall, reclined butterfly, supported fish, thread-needle. No deep twists.' },
          { name: 'Sat', pills: [{ type: 'rest', label: '— Rest' }], note: 'Full rest or 10 min gentle spinal mobility.' },
          { name: 'Sun', pills: [{ type: 'swim', label: '🏊 Swim 30 min' }, { type: 'pt', label: '◆ PT (optional)' }], note: 'Swim first. Backstroke + relaxed freestyle only, no butterfly.' },
        ]
      },
      {
        num: 'Week 02', title: 'Solidifying',
        note: 'If Week 1 went smoothly, you\'re ready for walk intervals in Phase 2. Any back flare-ups? Repeat Week 1 before progressing.',
        days: [
          { name: 'Mon', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pt', label: '◆ PT' }] },
          { name: 'Tue', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pilates', label: '✦ Pilates 35 min' }], note: 'Extend to 35 min. Add 1–2 new movements from the library.' },
          { name: 'Wed', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pt', label: '◆ PT' }] },
          { name: 'Thu', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }], note: 'Walk only. Light day.' },
          { name: 'Fri', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'yoga', label: '🌿 Yoga 30 min' }], note: 'Same restorative sequence. Begin building to gentle flow if comfortable.' },
          { name: 'Sat', pills: [{ type: 'rest', label: '— Rest' }] },
          { name: 'Sun', pills: [{ type: 'swim', label: '🏊 Swim 30 min' }, { type: 'pt', label: '◆ PT (optional)' }] },
        ]
      }
    ]
  },
  {
    id: 'ph2', label: 'Wks 3–4 · Intensify', weeks: 'Weeks 3–4', title: 'Intensify the Walks',
    desc: 'Introduce walk intervals to increase caloric burn without adding time. Pilates progresses to Session B. Swim gets structured for the first time.',
    weeks_data: [
      {
        num: 'Weeks 03–04', title: 'Walk Intervals Begin', defaultOpen: true,
        note: '2 interval walks/week is the primary new caloric stimulus. ⚡ = interval day. The 3 non-interval walks stay easy.',
        days: [
          { name: 'Mon', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'pt', label: '◆ PT' }], note: 'Interval walk: 10 min warmup → 3 × (4 min brisk + 3 min easy) → 10 min cooldown.' },
          { name: 'Tue', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pilates', label: '✦ Pilates 40 min' }], note: 'Pilates Session B. Add resistance band to clamshells if available.' },
          { name: 'Wed', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'pt', label: '◆ PT' }], note: 'Same interval walk as Monday.' },
          { name: 'Thu', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }], note: 'Easy steady walk — recovery day.' },
          { name: 'Fri', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'yoga', label: '🌿 Yoga 30 min' }], note: 'Begin adding gentle active yoga: warrior I, low lunge, crescent. No deep backbends or strong twists.' },
          { name: 'Sat', pills: [{ type: 'rest', label: '— Rest' }], note: 'Full rest. Foam roll glutes and hamstrings (not lumbar).' },
          { name: 'Sun', pills: [{ type: 'swim', label: '🏊 Swim 30 min ⚡' }, { type: 'pt', label: '◆ PT (optional)' }], note: 'Structured swim: 5 min warmup → 4 × 3 min moderate + 1 min easy → 5 min cooldown.' },
        ]
      }
    ]
  },
  {
    id: 'ph3', label: 'Wks 5–6 · Strengthen', weeks: 'Weeks 5–6', title: 'Strengthen the Foundation',
    desc: 'Upgrade to 3 interval walks per week. Pilates grows to 45 min and introduces more glute/hip loading. Yoga becomes a proper active flow. This is the core fat-loss block.',
    weeks_data: [
      {
        num: 'Weeks 05–06', title: 'Three Hard Walks', defaultOpen: true,
        note: 'Highest-volume block. 3 interval walks + 45 min Pilates + structured swim. Expect meaningful fatigue — sleep 7–8 hrs becomes critical.',
        days: [
          { name: 'Mon', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'pt', label: '◆ PT' }], note: 'Upgraded intervals: 4 × (5 min brisk + 2 min easy).' },
          { name: 'Tue', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pilates', label: '✦ Pilates 45 min' }], note: 'Full Pilates Session C. Light ankle weights optional if cleared by physio.' },
          { name: 'Wed', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'pt', label: '◆ PT' }] },
          { name: 'Thu', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }], note: 'Third interval walk. Keep it moderate.' },
          { name: 'Fri', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'yoga', label: '🌿 Yoga 35 min' }], note: 'Active flow: cat-cow → bird-dog → crescent lunge → warrior I → standing balance → legs-up-wall.' },
          { name: 'Sat', pills: [{ type: 'rest', label: '— Rest' }, { type: 'pt', label: '◆ PT (if 3rd needed)' }] },
          { name: 'Sun', pills: [{ type: 'swim', label: '🏊 Swim 30 min ⚡' }], note: 'Upgraded swim: 400m warmup → 6 × 25m harder effort with 20 sec rest → easy cooldown.' },
        ]
      }
    ]
  },
  {
    id: 'ph4', label: 'Wks 7–8 · Peak', weeks: 'Weeks 7–8', title: 'Peak & Consolidate',
    desc: 'Hold Phase 3 intensity while introducing slightly longer Pilates (50 min) and a second optional swim. Solidify this as your long-term sustainable baseline.',
    weeks_data: [
      {
        num: 'Weeks 07–08', title: 'The New Normal', defaultOpen: true,
        note: 'By week 8 you\'re doing 3 interval walks, 50 min Pilates, structured swim, and maintained PT — all sustainably. This becomes your Phase 2 baseline.',
        days: [
          { name: 'Mon', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'pt', label: '◆ PT' }], note: '5 × (4 min hard + 2 min easy). Your hardest walk format yet.' },
          { name: 'Tue', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'pilates', label: '✦ Pilates 50 min' }], note: 'Full Session C + D. 50 min. This is a real workout now.' },
          { name: 'Wed', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'pt', label: '◆ PT' }] },
          { name: 'Thu', pills: [{ type: 'walk', label: '🚶 Walk 45 min ⚡' }, { type: 'swim', label: '🏊 Optional Swim 20 min' }], note: 'If adding a 2nd swim, keep it easy. Optional if recovery is high.' },
          { name: 'Fri', pills: [{ type: 'walk', label: '🚶 Walk 45 min' }, { type: 'yoga', label: '🌿 Yoga 35 min' }], note: 'Same active flow. Deepen where ready. Pigeon pose (supported) for hip tightness.' },
          { name: 'Sat', pills: [{ type: 'rest', label: '— Rest' }, { type: 'pt', label: '◆ PT (if needed)' }] },
          { name: 'Sun', pills: [{ type: 'swim', label: '🏊 Swim 30 min ⚡' }] },
        ]
      }
    ]
  },
]

function WeekBlock({ week }: { week: Week }) {
  const [open, setOpen] = useState(!!week.defaultOpen)
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '13px 16px', background: 'var(--warm)', borderBottom: open ? '1px solid var(--line)' : 'none',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--clay)' }}>{week.num}</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, fontWeight: 400, marginTop: 2 }}>{week.title}</div>
        </div>
        <div style={{ fontSize: 20, color: 'var(--light)', transition: 'transform 0.25s', transform: open ? 'rotate(45deg)' : 'none' }}>+</div>
      </div>
      {open && (
        <>
          {week.days.map(day => (
            <div key={day.name}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 16px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--light)', width: 28, flexShrink: 0, paddingTop: 3 }}>{day.name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'flex-start', flex: 1 }}>
                  {day.pills.map((p, i) => (
                    <span key={i} className={`pill pill-${p.type}`}>{p.label}</span>
                  ))}
                  {day.note && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.55, width: '100%', marginTop: 4 }}>{day.note}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div style={{ margin: '12px 16px 14px', padding: '11px 13px', background: 'rgba(181,105,74,0.06)', borderLeft: '3px solid var(--clay)', borderRadius: '0 8px 8px 0', fontSize: 11, color: 'var(--muted)', lineHeight: 1.65 }}>
            <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>Goal: </strong>{week.note}
          </div>
        </>
      )}
    </div>
  )
}

export default function PlanPage() {
  const [activePhase, setActivePhase] = useState('ph1')
  const phase = phases.find(p => p.id === activePhase)!

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">Rebuilt From Your Baseline</div>
        <h1>8-Week <em>Progressive</em><br />Recovery Plan</h1>
        <p className="hero-sub">Built around your 5×45 min walks, 3× PT routine, and weekly Sunday swim.</p>
      </div>

      {/* Phase tabs */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--line)', padding: '0 20px', gap: 0, scrollbarWidth: 'none' }}>
        {phases.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePhase(p.id)}
            style={{
              flexShrink: 0, padding: '11px 14px', fontSize: 10.5, fontWeight: 500,
              color: activePhase === p.id ? 'var(--clay)' : 'var(--muted)',
              background: 'none', border: 'none',
              borderBottom: activePhase === p.id ? '2px solid var(--clay)' : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="page" style={{ paddingTop: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div className="sec-label">{phase.weeks}</div>
          <h2 style={{ fontSize: 22, marginBottom: 6 }}><em>{phase.title.split(' ')[0]}</em> {phase.title.split(' ').slice(1).join(' ')}</h2>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.7 }}>{phase.desc}</p>
        </div>
        {phase.weeks_data.map(w => <WeekBlock key={w.num} week={w} />)}
      </div>
    </>
  )
}
