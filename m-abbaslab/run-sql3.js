const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

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
    // Drop old config_data column or make it nullable
    try {
      await client.query(`ALTER TABLE site_config ALTER COLUMN config_data DROP NOT NULL`)
      console.log('Made config_data nullable')
    } catch (e) {
      console.log('config_data already nullable or error:', e.message)
    }
    
    // Migrate any existing data from config_data to key/value
    await client.query(`
      UPDATE site_config 
      SET key = 'legacy_config', value = config_data 
      WHERE key IS NULL AND config_data IS NOT NULL
    `)
    console.log('Migrated legacy config_data to key/value')
    
    // Now make key NOT NULL (since it should be the primary identifier)
    await client.query(`ALTER TABLE site_config ALTER COLUMN key SET NOT NULL`)
    console.log('Set key NOT NULL')
    
    // Drop config_data column (no longer needed)
    await client.query(`ALTER TABLE site_config DROP COLUMN IF EXISTS config_data`)
    console.log('Dropped config_data column')
    
    // Notify PostgREST to reload schema
    try {
      await client.query(`NOTIFY pgrst, 'reload schema'`)
      console.log('Sent schema reload notification')
    } catch (e) {
      console.log('Notify failed (expected if not superuser):', e.message)
    }
    
    console.log('\n✓ Schema migration completed')
  } catch (err) {
    console.error('Fatal error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runSQL()