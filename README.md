# Health Tracker

A personal wellness tracking web app built for an 8-week back recovery plan. Tracks daily activity, sleep, food, and back health over time — designed to be used from your phone.

## Features

### 📋 8-Week Recovery Plan
Tabbed workout plan across four phases (Establish → Intensify → Strengthen → Peak). Each week is expandable with a daily schedule of colour-coded activity pills.

### ✅ Daily Activity Log
Log each day's activities with duration or completion:
- **Flat Walk** / **Hilly Walk** / **Interval Walk** — minutes stepper (+5/−5)
- **PT Session**, **Pilates**, **Yoga**, **Swim Lesson** — checkboxes
- Streak counter and weekly dot-grid overview

### 🥗 Food Traffic Light
Daily check-in with a 🟢 / 🟡 / 🔴 rating and optional notes. 14-day history view.

### 🌙 Sleep Log
Log hours slept with a slider. Weekly bar chart colour-coded by target (green = 7h+, yellow = 6–7h, red = under 6h).

### 🔄 Back Check-In
Log back status (Better / Same / Worse) and pain level (0–10). Surfaces specific adaptive plan recommendations based on your status — e.g. drop intervals and skip Pilates if "Worse", advance phases early if "Better" for 2+ weeks.

### 📈 Trends
Long-term charts showing weekly averages across all four trackers. All-time summary stats: avg sleep, % green food days, pain delta (first → now), weeks tracked.

## Tech Stack

- **Next.js 14** (App Router)
- **PostgreSQL** via raw `pg` (node-postgres) — no ORM
- **Tailwind-free** — custom CSS with warm earthy palette (clay, sage, cream)
- **Playfair Display + Outfit** fonts
- Mobile-first, installable as a home screen web app

## Design

| Token | Value | Used for |
|---|---|---|
| `--clay` | `#B5694A` | Primary accent, buttons, headings |
| `--sage` | `#5C7A5E` | Walks, yoga, positive states |
| `--bg` | `#F7F4EF` | Page background |
| `--card` | `#FFFFFF` | Card surfaces |
| `--warm` | `#F0EBE1` | Card headers, inputs |

## Running Locally

Requires a local PostgreSQL database.

```bash
# 1. Clone and install
git clone https://github.com/umakrishnan/healthtracker.git
cd healthtracker
npm install

# 2. Create the database
createdb healthtracker

# 3. Set up environment
echo 'DATABASE_URL="postgresql://YOUR_USER@127.0.0.1:5432/healthtracker"' > .env

# 4. Run migrations
node scripts/migrate.js

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Railway

1. Push to GitHub
2. In Railway: **New Project → Deploy from GitHub repo**
3. Add a **PostgreSQL** plugin
4. In your service **Variables**, add:
   ```
   DATABASE_URL = ${{ Postgres.DATABASE_URL }}
   BASIC_AUTH_PASSWORD = your-password-here
   ```
5. Railway auto-deploys on every push to `master`

The start command (`node scripts/migrate.js && npm start`) runs `CREATE TABLE IF NOT EXISTS` on every deploy — safe to run repeatedly.

## Security

- Password-protected via HTTP Basic Auth (`middleware.ts`)
- Set `BASIC_AUTH_PASSWORD` in Railway Variables to enable
- When not set (local dev), auth is skipped
- `DATABASE_URL` is server-side only — never exposed to the browser

## Project Structure

```
app/
  page.tsx          # Home dashboard
  plan/             # 8-week workout plan
  log/              # Daily activity log
  food/             # Food traffic light check-in
  sleep/            # Sleep logger
  back/             # Back check-in + adaptive recommendations
  trends/           # Long-term charts
  api/
    activity/       # Activity log API
    food/           # Food log API
    sleep/          # Sleep log API
    back/           # Back check-in API
    trends/         # Weekly aggregation API
    health/         # Railway healthcheck endpoint
components/
  BottomNav.tsx     # Mobile bottom navigation
lib/
  db.ts             # pg connection pool
scripts/
  migrate.js        # CREATE TABLE IF NOT EXISTS — runs at startup
middleware.ts       # Basic Auth
```
