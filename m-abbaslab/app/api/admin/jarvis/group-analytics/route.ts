import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
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
      groups: [],
      statuses: [],
      stats: {
        totalGroups: 0,
        monitoredGroups: 0,
        totalStatuses: 0,
        likedStatuses: 0
      }
    })
  }

  try {
    // 1. Fetch all groups
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .order('last_seen_at', { ascending: false })

    if (groupsError) throw groupsError

    // 2. Fetch recent status updates
    const { data: statuses, error: statusesError } = await supabase
      .from('whatsapp_status_updates')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(50)

    if (statusesError) throw statusesError

    // 3. Compute stats
    const totalGroups = groups?.length || 0
    const monitoredGroups = groups?.filter(g => g.metadata?.monitored !== false).length || 0
    const totalStatuses = statuses?.length || 0
    const likedStatuses = statuses?.filter(s => s.jarvis_liked === true || s.metadata?.auto_liked === true).length || 0

    return NextResponse.json({
      success: true,
      groups: groups || [],
      statuses: statuses || [],
      stats: {
        totalGroups,
        monitoredGroups,
        totalStatuses,
        likedStatuses
      }
    })
  } catch (error: any) {
    console.error('[API-GROUP-ANALYTICS] Error fetching analytics:', error.message)
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
    const { groupJid, monitored } = await request.json()

    if (!groupJid) {
      return NextResponse.json({ success: false, error: 'Group JID is required' }, { status: 400 })
    }

    // Fetch existing group metadata
    const { data: group, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('metadata')
      .eq('group_jid', groupJid)
      .single()

    if (fetchError) throw fetchError

    const updatedMetadata = {
      ...(group?.metadata || {}),
      monitored: Boolean(monitored)
    }

    const { error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('group_jid', groupJid)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, groupJid, monitored: Boolean(monitored) })
  } catch (error: any) {
    console.error('[API-GROUP-ANALYTICS] Error toggling group monitoring:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
