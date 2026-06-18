import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try { await jwtVerify(session.value, JWT_SECRET); return true } catch { return false }
}

async function logAudit(action: string, details: string) {
  if (!hasSupabaseKeys) return
  try {
    await supabase.from('audit_logs').insert([{ action, details, timestamp: new Date().toISOString() }])
  } catch {
    // audit_logs table may not exist — non-critical
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    const section = url.searchParams.get('section') || 'all'

    const result: Record<string, unknown> = {}

    if (!hasSupabaseKeys) {
      return NextResponse.json({ days: [], goals: { categories: [], passive: [] }, reviews: [], habits: [] })
    }

    if (section === 'all' || section === 'days') {
      try {
        let query = supabase.from('discipline_days').select('*').order('date', { ascending: false })
        if (date) query = query.eq('date', date)
        else query = query.limit(30)
        const { data: days } = await query
        result.days = days || []
      } catch { result.days = [] }
    }

    if (section === 'all' || section === 'goals') {
      try {
        const { data: goals } = await supabase.from('discipline_goals').select('*').order('created_at', { ascending: true })
        result.goals = goals || []
      } catch { result.goals = [] }
    }

    if (section === 'all' || section === 'habits') {
      try {
        let query = supabase.from('discipline_habits').select('*').order('created_at', { ascending: false })
        if (date) query = query.eq('date', date)
        else query = query.limit(100)
        const { data: habits } = await query
        result.habits = habits || []
      } catch { result.habits = [] }
    }

    if (section === 'all' || section === 'passive') {
      try {
        let query = supabase.from('discipline_passive').select('*').order('date', { ascending: false })
        if (date) query = query.eq('date', date)
        else query = query.limit(10)
        const { data: passive } = await query
        result.passive = passive || []
      } catch { result.passive = [] }
    }

    if (section === 'all' || section === 'reviews') {
      try {
        let query = supabase.from('discipline_reviews').select('*').order('created_at', { ascending: false })
        if (date) query = query.eq('date', date)
        else query = query.limit(20)
        const { data: reviews } = await query
        result.reviews = reviews || []
      } catch { result.reviews = [] }
    }

    if (section === 'all' || section === 'diary') {
      try {
        let query = supabase.from('discipline_diary').select('*').order('date', { ascending: false })
        if (date) query = query.eq('date', date)
        else query = query.limit(30)
        const { data: diary } = await query
        result.diary = diary || []
      } catch { result.diary = [] }
    }

    if (section === 'habits-stats') {
      try {
        const today = new Date().toISOString().split('T')[0]
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
        const { data: recentHabits } = await supabase
          .from('discipline_habits')
          .select('habit_name, completed, date')
          .gte('date', thirtyDaysAgo)
          .order('date', { ascending: false })

        const habitStats: Record<string, { total: number; completed: number; streak: number; lastDate: string }> = {}
        if (recentHabits) {
          for (const h of recentHabits) {
            if (!habitStats[h.habit_name]) habitStats[h.habit_name] = { total: 0, completed: 0, streak: 0, lastDate: '' }
            habitStats[h.habit_name].total++
            if (h.completed) habitStats[h.habit_name].completed++
            if (!habitStats[h.habit_name].lastDate) habitStats[h.habit_name].lastDate = h.date
          }
        }
        result.habitStats = habitStats
      } catch { result.habitStats = {} }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching discipline data:', error)
    return NextResponse.json({ error: 'Failed to retrieve discipline data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    if (!body || typeof body !== 'object' || !body.type) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    if (!hasSupabaseKeys) {
      return NextResponse.json({ success: false, message: 'Supabase not configured' }, { status: 503 })
    }

    const { type } = body

    if (type === 'day') {
      const { date, data: dayData } = body
      const { error } = await supabase.from('discipline_days').upsert({
        date,
        hours: dayData.hours || [],
        pillars: dayData.pillars || {},
        wins: dayData.wins || [],
        losses: dayData.losses || [],
        gratitude: dayData.gratitude || '',
        tomorrow: dayData.tomorrow || '',
        deep_work_hours: dayData.deepWorkHours || 0,
        sleep_hours: dayData.sleepHours || 0,
        wasted_hours: dayData.wastedHours || 0,
        overall_score: dayData.overallScore || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'date', ignoreDuplicates: false })
      if (error) {
        console.error('Day upsert error:', error)
        throw error
      }
      await logAudit('DISCIPLINE_DAY_UPDATE', `Logged daily data for ${date}`)
      return NextResponse.json({ success: true, message: 'Day data synced to Supabase' })
    }

    if (type === 'goals') {
      const { goals } = body
      if (Array.isArray(goals)) {
        for (const g of goals) {
          const { error } = await supabase.from('discipline_goals').upsert({
            id: g.id,
            category_id: g.categoryId,
            category_label: g.categoryLabel,
            category_color: g.categoryColor,
            goal_id: g.goalId,
            name: g.name,
            status: g.status,
            metric: g.metric || '',
            note: g.note || '',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id', ignoreDuplicates: false })
          if (error) console.error('Goal upsert error:', error)
        }
      }
      await logAudit('DISCIPLINE_GOALS_UPDATE', 'Updated goals')
      return NextResponse.json({ success: true, message: 'Goals synced' })
    }

    if (type === 'habit-toggle') {
      const { date, habitName, habitCategory, completed, difficulty, streak } = body
      const { error } = await supabase.from('discipline_habits').upsert({
        date,
        habit_name: habitName,
        habit_category: habitCategory || 'daily',
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        difficulty: difficulty || 'simple',
        streak: streak || 0,
      }, { onConflict: 'date,habit_name', ignoreDuplicates: false })
      if (error) {
        console.error('Habit toggle error:', error)
        throw error
      }
      return NextResponse.json({ success: true, message: 'Habit toggled' })
    }

    if (type === 'habits-bulk') {
      const { date, habits } = body
      if (Array.isArray(habits)) {
        for (const h of habits) {
          const { error } = await supabase.from('discipline_habits').upsert({
            date,
            habit_name: h.name,
            habit_category: h.category || 'daily',
            completed: h.completed,
            completed_at: h.completed ? new Date().toISOString() : null,
            difficulty: h.difficulty || 'simple',
            streak: h.streak || 0,
          }, { onConflict: 'date,habit_name', ignoreDuplicates: false })
          if (error) console.error('Habit bulk upsert error:', error)
        }
      }
      return NextResponse.json({ success: true, message: 'Habits synced' })
    }

    if (type === 'passive') {
      const { date, checks } = body
      const { error } = await supabase.from('discipline_passive').upsert({
        date,
        checks,
      }, { onConflict: 'date', ignoreDuplicates: false })
      if (error) {
        console.error('Passive upsert error:', error)
        throw error
      }
      return NextResponse.json({ success: true, message: 'Passive checks synced' })
    }

    if (type === 'review') {
      const { reviewType, date, answers } = body
      const { error } = await supabase.from('discipline_reviews').insert({
        type: reviewType,
        date,
        answers,
      })
      if (error) {
        console.error('Review insert error:', error)
        throw error
      }
      await logAudit('DISCIPLINE_REVIEW_UPDATE', `Saved ${reviewType} review for ${date}`)
      return NextResponse.json({ success: true, message: 'Review saved' })
    }

    if (type === 'diary') {
      const { date, title, content: diaryContent, mood, tags, ai_suggestion } = body
      const wordCount = diaryContent ? diaryContent.split(/\s+/).filter(Boolean).length : 0
      const { error } = await supabase.from('discipline_diary').upsert({
        date,
        title: title || '',
        content: diaryContent || '',
        mood: mood || 'neutral',
        tags: tags || [],
        ai_suggestion: ai_suggestion || '',
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'date', ignoreDuplicates: false })
      if (error) {
        console.error('Diary upsert error:', error)
        throw error
      }
      return NextResponse.json({ success: true, message: 'Diary saved' })
    }

    return NextResponse.json({ error: 'Unknown action type' }, { status: 400 })
  } catch (error) {
    console.error('Error saving discipline data:', error)
    return NextResponse.json({ error: 'Failed to save discipline data' }, { status: 500 })
  }
}
