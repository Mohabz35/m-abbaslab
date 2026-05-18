import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { getLiveConfig, saveLiveConfig } from '@/lib/dbConfig'
import { logAudit } from '@/lib/audit'
import { jwtVerify } from 'jose'

const DATA_PATH = path.join(process.cwd(), 'data', 'personal.json')
const CONFIG_PATH = path.join(process.cwd(), 'config', 'personal.ts')
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

export async function GET() {
  try {
    const liveConfig = await getLiveConfig()
    return NextResponse.json(liveConfig)
  } catch (error) {
    // If Supabase fails, try local file fallback
    try {
      const fileContent = await fs.readFile(DATA_PATH, 'utf8')
      return NextResponse.json(JSON.parse(fileContent))
    } catch (e) {
      return NextResponse.json({ error: 'Failed to read configuration' }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const session = request.cookies.get('admin_session')
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    try {
      await jwtVerify(session.value, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 })
    }

    const body = await request.json()

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // 2. Save to Supabase (Primary live store)
    const dbSaved = await saveLiveConfig(body)

    // 3. Fallback: Save to Local Files (Works in local dev, safe fallback on Vercel)
    try {
      const dataDir = path.dirname(DATA_PATH)
      await fs.mkdir(dataDir, { recursive: true })
      
      await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), 'utf8')
      
      const tsContent = `// config/personal.ts - AUTOMATICALLY UPDATED BY ADMIN PANEL\nexport const personalConfig = ${JSON.stringify(body, null, 2)}\n\nexport type PersonalConfig = typeof personalConfig\n`
      await fs.writeFile(CONFIG_PATH, tsContent, 'utf8')
    } catch (fsErr) {
      console.warn('Local FS write bypassed or failed (expected on serverless production):', fsErr)
    }

    await logAudit('CONFIG_UPDATE', `Site configuration updated. Database sync: ${dbSaved ? 'SUCCESS' : 'LOCAL_ONLY'}`)

    return NextResponse.json({ 
      success: true, 
      message: dbSaved 
        ? 'Configuration saved successfully to Supabase Database!' 
        : 'Configuration saved locally (Supabase not configured).' 
    })
  } catch (error) {
    console.error('Error writing config:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}
