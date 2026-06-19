import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

function authBySecret(request: NextRequest): boolean {
  const header = request.headers.get('x-admin-secret')
  return Boolean(process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET)
}

async function authBySession(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false

  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (authBySecret(request)) return true
  return authBySession(request)
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasSupabaseKeys) {
    return NextResponse.json({
      success: true,
      interactions: [],
      stats: {
        totalInteractions: 0,
        averageScore: 0,
        topTopics: []
      }
    })
  }

  try {
    // 1. Fetch recent interactions (e.g. last 100)
    const { data: interactions, error: fetchError } = await supabase
      .from('jarvis_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (fetchError) {
      if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
        return NextResponse.json({ success: true, interactions: [], stats: { totalInteractions: 0, averageScore: 0, topTopics: [] } })
      }
      throw fetchError
    }

    // 2. Compute stats
    const totalInteractions = interactions?.length || 0
    let ratingCount = 0
    let ratingSum = 0
    const topicFrequency: Record<string, number> = {}

    // Exclude common stop words for topic extraction
    const stopwords = new Set([
      'hello', 'there', 'please', 'would', 'could', 'should', 'about', 'their', 'there', 'these',
      'thanks', 'thank', 'youre', 'welcome', 'mohammed', 'abbas', 'jarvis', 'what', 'your', 'with',
      'this', 'that', 'from', 'have', 'salam', 'habari', 'project', 'work', 'projects'
    ])

    interactions?.forEach(item => {
      // Aggregate ratings from metadata
      const rating = item.metadata?.rating
      if (typeof rating === 'number') {
        ratingCount++
        ratingSum += rating
      }

      // Analyze user messages for topics
      const msg = item.user_message || ''
      const words = msg.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w: string) => w.length > 4 && !stopwords.has(w))

      words.forEach((w: string) => {
        topicFrequency[w] = (topicFrequency[w] || 0) + 1
      })
    })

    const averageScore = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0

    // Get top 5 topics
    const topTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }))

    return NextResponse.json({
      success: true,
      interactions: interactions || [],
      stats: {
        totalInteractions,
        averageScore,
        topTopics
      }
    })
  } catch (error: any) {
    console.error('[API-JARVIS-LEARNING] Error fetching learning data:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  if (!hasSupabaseKeys) {
    return NextResponse.json({ success: false, error: 'Supabase is not configured' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { action, interactionId, rating, feedback } = body

    if (action === 'reset') {
      // Reset learning profile by clearing/deleting all interactions
      const { error: deleteError } = await supabase
        .from('jarvis_interactions')
        .delete()
        .neq('sender_number', '') // simple condition to delete all rows

      if (deleteError) throw deleteError

      return NextResponse.json({ success: true, message: 'Learning profile reset successfully.' })
    }

    if (!interactionId) {
      return NextResponse.json({ success: false, error: 'Interaction ID is required' }, { status: 400 })
    }

    // Fetch existing metadata
    const { data: item, error: fetchError } = await supabase
      .from('jarvis_interactions')
      .select('metadata')
      .eq('id', interactionId)
      .single()

    if (fetchError) throw fetchError

    const updatedMetadata = {
      ...(item?.metadata || {}),
      rating: Number(rating),
      feedback: feedback || ''
    }

    const { error: updateError } = await supabase
      .from('jarvis_interactions')
      .update({
        metadata: updatedMetadata
      })
      .eq('id', interactionId)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, interactionId, rating, feedback })
  } catch (error: any) {
    console.error('[API-JARVIS-LEARNING] Error recording feedback:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
