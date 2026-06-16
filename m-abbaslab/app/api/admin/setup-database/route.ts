import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const SQL_PATH = join(process.cwd(), 'supabase', 'complete_schema.sql')

export async function POST() {
  const password = process.env.SUPABASE_DB_PASSWORD
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  if (!password) {
    return NextResponse.json({
      success: false,
      error: 'SUPABASE_DB_PASSWORD not configured',
      instructions: [
        'Add SUPABASE_DB_PASSWORD to your .env.local or Vercel environment variables.',
        'Find password at: https://supabase.com/dashboard/project/nspzkkemwaaokpiykfvv/settings/database',
      ]
    }, { status: 400 })
  }

  const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1]
  if (!projectRef) {
    return NextResponse.json({ error: 'Invalid Supabase URL' }, { status: 500 })
  }

  let sql: string
  try {
    sql = readFileSync(SQL_PATH, 'utf8')
  } catch {
    return NextResponse.json({ error: 'SQL file not found' }, { status: 500 })
  }

  try {
    // @ts-ignore - dynamic import types for pg might not resolve correctly
    const { default: { Pool } } = await import('pg')
    const pool = new Pool({
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      database: 'postgres',
      user: 'postgres',
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    })

    const client = await pool.connect()

    try {
      // Split SQL by semicolon and execute each statement
      const statements = sql.split(';').filter(s => s.trim().length > 0)
      const results = []
      for (const stmt of statements) {
        try {
          const result = await client.query(stmt + ';')
          results.push({ success: true, rows: result.rowCount })
        } catch (err: any) {
          // Ignore duplicate object errors for idempotency
          if (err.code === '42710' || err.code === '42P07' || err.message?.includes('already exists') || err.message?.includes('duplicate')) {
            results.push({ success: true, skipped: err.message })
          } else {
            results.push({ success: false, error: err.message, statement: stmt.substring(0, 100) })
          }
        }
      }
      const failed = results.filter(r => !r.success)
      if (failed.length > 0) {
        return NextResponse.json({ success: false, errors: failed, results }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: `All ${statements.length} SQL statements executed`, results })
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    } finally {
      client.release()
      await pool.end()
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
