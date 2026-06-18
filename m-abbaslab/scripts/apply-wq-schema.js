const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  host: 'db.nspzkkemwaaokpiykfvv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'XBhhIKaHiWzsxdBC',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

;(async () => {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'wq_lab_schema.sql'), 'utf8')
  const cleaned = raw.split('\n').filter(line => {
    const trimmed = line.trim()
    return trimmed === '' || !trimmed.startsWith('--')
  }).join('\n')

  const statements = cleaned.split(';').filter(s => s.trim().length > 0)
  const client = await pool.connect()
  try {
    let ok = 0, skip = 0, fail = 0
    for (const stmt of statements) {
      const trimmed = stmt.trim()
      if (!trimmed) continue
      try {
        await client.query(trimmed + ';')
        ok++
      } catch (err) {
        if (err.code === '42710' || err.code === '42P07' || err.message?.includes('already exists')) {
          skip++
        } else {
          console.error(`FAIL: ${err.message} — ${trimmed.substring(0, 100)}`)
          fail++
        }
      }
    }
    console.log(`WQ Lab schema: ${ok} applied, ${skip} skipped, ${fail} failed`)
  } finally {
    client.release()
    await pool.end()
  }
})()
