const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  host: 'db.nspzkkemwaaokpiykfvv.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'XBhhIKaHiWzsxdBC',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

async function setupAdmin() {
  const username = process.argv[2] || 'admin'
  const password = process.argv[3] || 'ChangeMeNow!2026'
  const email = process.argv[4] || 'admin@mohammedabbas.tech'
  const fullName = process.argv[5] || 'M. Abbas'

  console.log(`Setting up admin user: ${username}`)

  const passwordHash = await bcrypt.hash(password, 12)
  const client = await pool.connect()

  try {
    // Check if admin_users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'admin_users'
      )
    `)

    if (!tableCheck.rows[0].exists) {
      console.error('admin_users table does not exist. Run phase2_schema.sql first.')
      process.exit(1)
    }

    // Upsert admin user
    const result = await client.query(`
      INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
      VALUES ($1, $2, $3, $4, 'admin', true)
      ON CONFLICT (username) DO UPDATE
      SET password_hash = $3, email = $2, full_name = $4, is_active = true, updated_at = NOW()
      RETURNING id, username, email, role
    `, [username, email, passwordHash, fullName])

    console.log('Admin user created/updated:')
    console.log(JSON.stringify(result.rows[0], null, 2))
    console.log('')
    console.log('Login credentials:')
    console.log(`  Username: ${username}`)
    console.log(`  Password: ${password}`)
    console.log('')
    console.log('IMPORTANT: Change this password after first login!')
  } finally {
    client.release()
    await pool.end()
  }
}

setupAdmin().catch(err => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
