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
