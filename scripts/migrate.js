// Load .env for local dev (Next.js does this automatically, bare node doesn't)
const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
  })
}

const { Pool } = require('pg')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS food_log (
      id SERIAL PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      rating TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sleep_log (
      id SERIAL PRIMARY KEY,
      date TEXT UNIQUE NOT NULL,
      hours REAL NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      activity TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(date, activity)
    );
    CREATE TABLE IF NOT EXISTS back_checkin (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      pain_level INTEGER NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('Migration complete')
  await pool.end()
}

migrate().catch(e => { console.error('Migration failed:', e); process.exit(1) })
