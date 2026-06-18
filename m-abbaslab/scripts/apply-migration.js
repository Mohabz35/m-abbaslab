const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '../supabase/migration_fix_tables.sql'), 'utf8')
  
  // Split by semicolons and execute each statement
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
  
  let ok = 0, fail = 0
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';'
    const { error } = await supabase.rpc('exec_sql', { query: stmt })
    if (error) {
      // Try direct query via rest
      const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: stmt })
      })
      if (!res.ok) {
        console.log(`[${i+1}] FAIL: ${res.status} — ${stmt.substring(0, 60)}...`)
        fail++
      } else {
        console.log(`[${i+1}] OK`)
        ok++
      }
    } else {
      console.log(`[${i+1}] OK`)
      ok++
    }
  }
  console.log(`\nDone: ${ok} OK, ${fail} FAIL out of ${statements.length} statements`)
}

run().catch(e => { console.error(e); process.exit(1) })
