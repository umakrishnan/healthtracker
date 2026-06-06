import { prisma } from '@/lib/prisma'

function getWeekDates() {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7))
  const dates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function toISOLocal(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function Home() {
  const today = toISOLocal(new Date())
  const weekDates = getWeekDates()
  const weekFrom = weekDates[0]
  const weekTo = weekDates[6]

  const [foodToday, sleepWeek, activityWeek, backLogs] = await Promise.all([
    prisma.foodLog.findUnique({ where: { date: today } }),
    prisma.sleepLog.findMany({ where: { date: { gte: weekFrom, lte: weekTo } } }),
    prisma.activityLog.findMany({ where: { date: { gte: weekFrom, lte: weekTo }, completed: true } }),
    prisma.backCheckin.findMany({ orderBy: { date: 'desc' }, take: 5 }),
  ])

  const avgSleep = sleepWeek.length
    ? (sleepWeek.reduce((s, l) => s + l.hours, 0) / sleepWeek.length).toFixed(1)
    : '—'

  const completedCount = activityWeek.length

  // Simple streak: count consecutive days (from today backward) with at least 1 completion
  const allActivity = await prisma.activityLog.findMany({
    where: { completed: true },
    orderBy: { date: 'desc' },
  })
  const uniqueDays = [...new Set(allActivity.map(a => a.date))].sort().reverse()
  let streak = 0
  let check = new Date(today)
  for (const d of uniqueDays) {
    if (d === toISOLocal(check)) {
      streak++
      check.setDate(check.getDate() - 1)
    } else break
  }

  const ratingEmoji: Record<string, string> = { green: '🟢', yellow: '🟡', red: '🔴' }
  const lastBack = backLogs[0]

  return (
    <>
      <div className="hero">
        <div className="hero-orb1" />
        <div className="hero-orb2" />
        <div className="eyebrow">8-Week Recovery Plan</div>
        <h1>Today&rsquo;s<br /><em>Overview</em></h1>
        <p className="hero-sub">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="page">
        {/* Stats row */}
        <div className="stat-row">
          <div className="stat-card">
            <div className="stat-num">{streak}</div>
            <div className="stat-label">day streak<br />active days</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{avgSleep}h</div>
            <div className="stat-label">avg sleep<br />this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{completedCount}</div>
            <div className="stat-label">activities done<br />this week</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ fontSize: '22px' }}>
              {foodToday ? ratingEmoji[foodToday.rating] : '—'}
            </div>
            <div className="stat-label">food check-in<br />today</div>
          </div>
        </div>

        {/* Back status */}
        {lastBack && (
          <div style={{ marginBottom: 16 }}>
            <div className="sec-label">Back Status</div>
            <div className="card">
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className={`status-badge status-${lastBack.status}`}>
                    {lastBack.status === 'better' ? '↑ Better' : lastBack.status === 'worse' ? '↓ Worse' : '→ Same'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Pain {lastBack.painLevel}/10 · {lastBack.date}
                  </span>
                </div>
                {lastBack.notes && (
                  <p style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>{lastBack.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="sec-label">Quick Actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { href: '/log', icon: '✅', label: 'Log today\'s\nactivities' },
            { href: '/food', icon: '🥗', label: 'Food\ncheck-in' },
            { href: '/sleep', icon: '🌙', label: 'Log last\nnight\'s sleep' },
            { href: '/back', icon: '🔄', label: 'Back\ncheck-in' },
          ].map(({ href, icon, label }) => (
            <a key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              background: 'var(--card)', border: '1px solid var(--line)',
              borderRadius: 14, padding: '16px', textDecoration: 'none',
              color: 'var(--ink)',
            }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{label}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
