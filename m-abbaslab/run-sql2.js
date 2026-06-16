const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        process.env[match[1].trim()] = match[2].trim()
      }
    }
  })
}

async function runSQL() {
  const password = process.env.SUPABASE_DB_PASSWORD
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  
  if (!password) {
    console.error('SUPABASE_DB_PASSWORD not configured')
    process.exit(1)
  }
  
  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  if (!projectRef) {
    console.error('Invalid Supabase URL')
    process.exit(1)
  }
  
  const pool = new Pool({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })
  
  const client = await pool.connect()
  
  try {
    // Check site_config columns
    const { rows: cols } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'site_config'
    `)
    console.log('site_config columns:', cols)
    
    // Ensure key column exists
    await client.query(`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS key TEXT UNIQUE`)
    await client.query(`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS value JSONB NOT NULL DEFAULT '{}'`)
    await client.query(`ALTER TABLE site_config ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`)
    
    // Add unique constraint if missing
    try {
      await client.query(`ALTER TABLE site_config ADD CONSTRAINT site_config_key_unique UNIQUE (key)`)
      console.log('Added unique constraint on key')
    } catch (e) {
      if (e.code === '42P16' || e.message.includes('already exists')) {
        console.log('Unique constraint already exists')
      } else {
        console.log('Constraint error:', e.message)
      }
    }
    
    // Notify PostgREST to reload schema
    try {
      await client.query(`NOTIFY pgrst, 'reload schema'`)
      console.log('Sent schema reload notification')
    } catch (e) {
      console.log('Notify failed (expected if not superuser):', e.message)
    }
    
    console.log('\n✓ Schema updates completed')
  } catch (err) {
    console.error('Fatal error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runSQL()