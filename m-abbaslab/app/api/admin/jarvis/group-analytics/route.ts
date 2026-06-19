import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

async function authBySession(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET, { issuer: 'm-abbaslab', audience: 'admin' })
    return true
  } catch { return false }
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
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
      stats: { totalGroups: 0, monitoredGroups: 0, totalStatuses: 0, likedStatuses: 0 }
    })
  }

  try {
    const { data: groups, error: groupsError } = await supabase
      .from('whatsapp_groups')
      .select('*')
      .order('last_seen_at', { ascending: false })

    // Handle missing table gracefully
    if (groupsError && (groupsError.code === '42P01' || groupsError.message?.includes('does not exist'))) {
      return NextResponse.json({
        success: true,
        groups: [],
        statuses: [],
        stats: { totalGroups: 0, monitoredGroups: 0, totalStatuses: 0, likedStatuses: 0 }
      })
    }
    if (groupsError) throw groupsError

    const { data: statuses, error: statusesError } = await supabase
      .from('whatsapp_status_updates')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(50)

    if (statusesError && !(statusesError.code === '42P01' || statusesError.message?.includes('does not exist'))) {
      throw statusesError
    }

    const totalGroups = groups?.length || 0
    const monitoredGroups = groups?.filter(g => g.metadata?.monitored !== false).length || 0
    const totalStatuses = statuses?.length || 0
    const likedStatuses = statuses?.filter(s => s.jarvis_liked === true || s.metadata?.auto_liked === true).length || 0

    return NextResponse.json({
      success: true,
      groups: groups || [],
      statuses: statuses || [],
      stats: { totalGroups, monitoredGroups, totalStatuses, likedStatuses }
    })
  } catch (error: any) {
    console.error('[API-GROUP-ANALYTICS] Error:', error.message)
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

    const { data: group, error: fetchError } = await supabase
      .from('whatsapp_groups')
      .select('metadata')
      .eq('group_jid', groupJid)
      .single()

    if (fetchError) {
      if (fetchError.code === '42P01') {
        return NextResponse.json({ success: false, error: 'WhatsApp tables not configured' }, { status: 500 })
      }
      throw fetchError
    }

    const updatedMetadata = { ...(group?.metadata || {}), monitored: Boolean(monitored) }

    const { error: updateError } = await supabase
      .from('whatsapp_groups')
      .update({ metadata: updatedMetadata, updated_at: new Date().toISOString() })
      .eq('group_jid', groupJid)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, groupJid, monitored: Boolean(monitored) })
  } catch (error: any) {
    console.error('[API-GROUP-ANALYTICS] Error:', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
