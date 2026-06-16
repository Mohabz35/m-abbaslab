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

console.log('DB Password loaded:', process.env.SUPABASE_DB_PASSWORD ? 'YES' : 'NO')
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET')

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
  
  const SQL_PATH = path.join(process.cwd(), 'supabase', 'complete_schema.sql')
  const sql = fs.readFileSync(SQL_PATH, 'utf8')
  
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
    // Only run the ALTER TABLE statements for fashion_items and CREATE TABLE for runway_journey
    const statements = [
      `ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}'`,
      `ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS event_date DATE`,
      `ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS location TEXT`,
      `ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'`,
      
      `CREATE TABLE IF NOT EXISTS runway_journey (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        year TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        highlights TEXT[] DEFAULT '{}',
        featured BOOLEAN DEFAULT false,
        image_url TEXT,
        category TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
      
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS year TEXT`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS title TEXT`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS description TEXT`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}'`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS image_url TEXT`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS category TEXT`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`,
      `ALTER TABLE runway_journey ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`
    ]
    
    for (const stmt of statements) {
      try {
        await client.query(stmt)
        console.log(`✓ Executed: ${stmt.substring(0, 60)}...`)
      } catch (err) {
        if (err.code === '42701' || err.code === '42P07' || err.message?.includes('already exists')) {
          console.log(`⊘ Skipped (exists): ${stmt.substring(0, 60)}...`)
        } else {
          console.error(`✗ Failed: ${stmt.substring(0, 60)}...`)
          console.error(`  Error: ${err.message}`)
        }
      }
    }
    
    console.log('\n✓ All schema updates completed')
  } catch (err) {
    console.error('Fatal error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

runSQL()