import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

const DATA_PATH = path.join(process.cwd(), 'data', 'discipline.json')
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

// Helper: Ensure the local data/discipline.json file exists and is initialized
async function getLocalData() {
  try {
    const fileContent = await fs.readFile(DATA_PATH, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    const defaultData = { days: {}, goals: null, reviews: {} }
    const dataDir = path.dirname(DATA_PATH)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(DATA_PATH, JSON.stringify(defaultData, null, 2), 'utf8')
    return defaultData
  }
}

// Helper: Save updated local data
async function saveLocalData(data: any) {
  try {
    const dataDir = path.dirname(DATA_PATH)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error('Failed to write local discipline file:', error)
  }
}

export async function GET(request: NextRequest) {
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

    // Load local fallback as base structure
    const local = await getLocalData()
    let days: any[] = Object.values(local.days || {})
    let goals: any = local.goals
    let reviews: any[] = Object.values(local.reviews || {})

    // 2. Fetch from Supabase if keys exist
    if (hasSupabaseKeys) {
      try {
        // Fetch Goals
        const { data: dbGoals, error: goalsErr } = await supabase
          .from('discipline_goals')
          .select('goals_data')
          .eq('id', 1)
          .single()

        if (!goalsErr && dbGoals && dbGoals.goals_data) {
          goals = dbGoals.goals_data
        }

        // Fetch Days (last 90 days of logs)
        const { data: dbDays, error: daysErr } = await supabase
          .from('discipline_days')
          .select('date, data')
          .order('date', { ascending: true })
          .limit(90)

        if (!daysErr && dbDays) {
          days = dbDays.map(d => ({ date: d.date, ...d.data }))
        }

        // Fetch Reviews (last 50 reviews)
        const { data: dbReviews, error: revsErr } = await supabase
          .from('discipline_reviews')
          .select('id, type, date, answers')
          .order('date', { ascending: false })
          .limit(50)

        if (!revsErr && dbReviews) {
          reviews = dbReviews.map(r => ({ id: r.id, type: r.type, date: r.date, answers: r.answers }))
        }
      } catch (dbErr) {
        console.warn('Supabase fetch failed for discipline. Falling back to local data file:', dbErr)
      }
    }

    return NextResponse.json({ days, goals, reviews })
  } catch (error) {
    console.error('Error fetching discipline data:', error)
    return NextResponse.json({ error: 'Failed to retrieve discipline parameters' }, { status: 500 })
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
    if (!body || typeof body !== 'object' || !body.type) {
      return NextResponse.json({ error: 'Invalid payload request' }, { status: 400 })
    }

    const { type } = body
    const local = await getLocalData()
    let dbSaved = false

    if (type === 'day') {
      const { date, data } = body
      if (!date || !data) {
        return NextResponse.json({ error: 'Missing date or data values' }, { status: 400 })
      }

      // Sync to local fallback file
      if (!local.days) local.days = {}
      local.days[date] = data
      await saveLocalData(local)

      // Sync to Supabase
      if (hasSupabaseKeys) {
        try {
          const { error } = await supabase
            .from('discipline_days')
            .upsert({ date, data })
          dbSaved = !error
        } catch (e) {
          console.error('Supabase day write error:', e)
        }
      }

      await logAudit('DISCIPLINE_DAY_UPDATE', `Logged daily accountability scores for date: ${date}. DB synced: ${dbSaved}`)

    } else if (type === 'goals') {
      const { goalsData } = body
      if (!goalsData) {
        return NextResponse.json({ error: 'Missing goalsData payload' }, { status: 400 })
      }

      // Sync to local fallback file
      local.goals = goalsData
      await saveLocalData(local)

      // Sync to Supabase
      if (hasSupabaseKeys) {
        try {
          const { error } = await supabase
            .from('discipline_goals')
            .upsert({ id: 1, goals_data: goalsData })
          dbSaved = !error
        } catch (e) {
          console.error('Supabase goals write error:', e)
        }
      }

      await logAudit('DISCIPLINE_GOALS_UPDATE', `Updated parallel goals checklist. DB synced: ${dbSaved}`)

    } else if (type === 'review') {
      const { id, reviewType, date, answers } = body
      if (!id || !reviewType || !date || !answers) {
        return NextResponse.json({ error: 'Missing review identifiers or answers' }, { status: 400 })
      }

      // Sync to local fallback file
      if (!local.reviews) local.reviews = {}
      local.reviews[id] = { id, type: reviewType, date, answers }
      await saveLocalData(local)

      // Sync to Supabase
      if (hasSupabaseKeys) {
        try {
          const { error } = await supabase
            .from('discipline_reviews')
            .upsert({ id, type: reviewType, date, answers })
          dbSaved = !error
        } catch (e) {
          console.error('Supabase review write error:', e)
        }
      }

      await logAudit('DISCIPLINE_REVIEW_UPDATE', `Saved ${reviewType} radical honesty review for ${date}. DB synced: ${dbSaved}`)

    } else {
      return NextResponse.json({ error: 'Action type not recognized' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: dbSaved 
        ? 'Accountability logs synchronized successfully with Supabase Cloud.' 
        : 'Accountability logs saved successfully to local fallback system.'
    })
  } catch (error) {
    console.error('Error updating discipline tracking data:', error)
    return NextResponse.json({ error: 'Failed to save discipline parameters' }, { status: 500 })
  }
}
