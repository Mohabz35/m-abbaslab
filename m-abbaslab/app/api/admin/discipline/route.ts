import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import path from 'path'
import { promises as fs } from 'fs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

// The generic project ID where we store discipline data
const DISCIPLINE_STORAGE_TITLE = '__SYSTEM_DISCIPLINE_OS__'

// Helper: Ensure the local data/discipline.json file exists and is initialized
const DATA_PATH = path.join(process.cwd(), 'data', 'discipline.json')
async function getLocalData() {
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    return { days: {}, goals: null, reviews: {} }
  }
}

async function saveLocalData(data: any) {
  try {
    const dataDir = path.dirname(DATA_PATH)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {}
}

async function getSupabaseData() {
  if (!hasSupabaseKeys) return null
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('description')
      .eq('title', DISCIPLINE_STORAGE_TITLE)
      .single()
    
    if (data && data.description) {
      return JSON.parse(data.description)
    }
  } catch (e) {
    console.error('Failed to read discipline from Supabase projects:', e)
  }
  return null
}

async function saveSupabaseData(data: any) {
  if (!hasSupabaseKeys) return false
  try {
    // Check if it exists
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('title', DISCIPLINE_STORAGE_TITLE)
      .single()

    const payload = JSON.stringify(data)

    if (existing) {
      const { error } = await supabase
        .from('projects')
        .update({ description: payload })
        .eq('id', existing.id)
      return !error
    } else {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: DISCIPLINE_STORAGE_TITLE,
          description: payload,
          category: 'System',
          status: 'planning'
        })
      return !error
    }
  } catch (e) {
    console.error('Failed to save discipline to Supabase projects:', e)
    return false
  }
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try { await jwtVerify(session.value, JWT_SECRET); return true } catch { return false }
}

export async function GET(request: NextRequest) {
  try {
    // 1. Verify Authentication
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // First try Supabase (persistent), fallback to local
    let data = await getSupabaseData()
    if (!data) {
      data = await getLocalData()
    }

    const days = Object.values(data.days || {})
    const goals = data.goals
    const reviews = Object.values(data.reviews || {})

    return NextResponse.json({ days, goals, reviews })
  } catch (error) {
    console.error('Error fetching discipline data:', error)
    return NextResponse.json({ error: 'Failed to retrieve discipline parameters' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (!body || typeof body !== 'object' || !body.type) {
      return NextResponse.json({ error: 'Invalid payload request' }, { status: 400 })
    }

    const { type } = body
    let data = await getSupabaseData()
    if (!data) {
      data = await getLocalData()
    }

    if (type === 'day') {
      const { date, data: dayData } = body
      if (!data.days) data.days = {}
      data.days[date] = dayData
      await logAudit('DISCIPLINE_DAY_UPDATE', `Logged daily accountability scores for date: ${date}`)
    } else if (type === 'goals') {
      const { goalsData } = body
      data.goals = goalsData
      await logAudit('DISCIPLINE_GOALS_UPDATE', `Updated parallel goals checklist.`)
    } else if (type === 'review') {
      const { id, reviewType, date, answers } = body
      if (!data.reviews) data.reviews = {}
      data.reviews[id] = { id, type: reviewType, date, answers }
      await logAudit('DISCIPLINE_REVIEW_UPDATE', `Saved ${reviewType} radical honesty review for ${date}.`)
    } else {
      return NextResponse.json({ error: 'Action type not recognized' }, { status: 400 })
    }

    // Save to both Supabase and local
    const dbSaved = await saveSupabaseData(data)
    await saveLocalData(data)

    return NextResponse.json({
      success: true,
      message: dbSaved 
        ? 'Data synchronized successfully with Supabase Cloud.' 
        : 'Data saved to local fallback system (volatile).'
    })
  } catch (error) {
    console.error('Error updating discipline tracking data:', error)
    return NextResponse.json({ error: 'Failed to save discipline parameters' }, { status: 500 })
  }
}
