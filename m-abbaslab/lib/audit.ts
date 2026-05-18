import fs from 'fs'
import path from 'path'
import { supabase, hasSupabaseKeys } from './supabase'

export async function logAudit(action: string, details: string) {
  const timestamp = new Date().toISOString()
  const logEntry = { action, details, timestamp }

  // 1. Try Supabase if configured
  if (hasSupabaseKeys) {
    try {
      await supabase.from('audit_logs').insert([logEntry])
      return
    } catch (e) {
      console.error('Supabase audit log failed', e)
    }
  }

  // 2. Fallback to local file system
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    const auditFile = path.join(dataDir, 'audit.log')
    fs.appendFileSync(auditFile, `[${timestamp}] ${action}: ${details}\n`)
  } catch (e) {
    console.error('Local audit log failed', e)
  }
}
