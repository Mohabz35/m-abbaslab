const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: 'postgresql://postgres:XBhhIKaHiWzsxdBC@db.nspzkkemwaaokpiykfvv.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
})

// Split SQL respecting dollar-quoted strings
function splitSQL(sql) {
  const statements = []
  let current = ''
  let inDollar = false
  const lines = sql.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('--')) continue
    
    if (trimmed.includes('$$')) {
      const count = (trimmed.match(/\$\$/g) || []).length
      if (count % 2 === 1) inDollar = !inDollar
    }
    
    current += line + '\n'
    
    if (!inDollar && trimmed.endsWith(';')) {
      const stmt = current.trim()
      if (stmt && !stmt.startsWith('--')) statements.push(stmt)
      current = ''
    }
  }
  
  if (current.trim()) statements.push(current.trim())
  return statements
}

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../supabase/migration_fix_tables.sql'), 'utf8')
  const client = await pool.connect()
  try {
    const statements = splitSQL(sql)
    let ok = 0, fail = 0
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await client.query(stmt)
        const preview = stmt.substring(0, 60).replace(/\n/g, ' ')
        console.log(`[${i + 1}/${statements.length}] OK  — ${preview}...`)
        ok++
      } catch (e) {
        const preview = stmt.substring(0, 60).replace(/\n/g, ' ')
        console.log(`[${i + 1}/${statements.length}] ERR — ${e.message.substring(0, 80)}`)
        console.log(`         SQL: ${preview}...`)
        fail++
      }
    }
    console.log(`\nDone: ${ok} OK, ${fail} warnings out of ${statements.length} statements`)
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1) })
