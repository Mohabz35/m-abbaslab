import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

async function isAuthorized(request: any): Promise<boolean> {
  const header = request.headers?.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies?.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const feed: any[] = []

  if (hasSupabaseKeys) {
    // Real data: check system health
    const { count: alphaCount } = await supabase.from('alphas').select('*', { count: 'exact', head: true })
    const { count: passedCount } = await supabase.from('alphas').select('*', { count: 'exact', head: true }).eq('is_passed', true)
    const { count: pendingMessages } = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
    const { count: messageCount } = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true })
    const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    const { count: unshippedProjects } = await supabase.from('projects').select('*', { count: 'exact', head: true }).neq('status', 'shipped')

    // Alphas that need attention (queued for testing)
    const { count: simulatingAlphas } = await supabase.from('alphas').select('*', { count: 'exact', head: true }).eq('status', 'simulating')
    const { count: passedAlphasReady } = await supabase.from('alphas').select('*', { count: 'exact', head: true }).eq('status', 'passed').eq('submitted_to_wq', false)

    if (alphaCount && alphaCount > 0) {
      feed.push({
        id: 1,
        type: alphaCount > 50 ? 'alert' : 'insight',
        message: alphaCount > 50
          ? `Alpha Lab is at capacity: ${alphaCount} alphas generated. Consider pruning low-fitness candidates.`
          : `${alphaCount} alphas have been tested. Pass rate: ${passedCount && alphaCount ? Math.round(passedCount / alphaCount * 100) : 0}%.`
      })
    }

    if (passedAlphasReady && passedAlphasReady > 0) {
      feed.push({
        id: 2,
        type: 'action',
        message: `${passedAlphasReady} passed alpha${passedAlphasReady > 1 ? 's' : ''} ready for WorldQuant submission. Review and submit in the Alpha Lab.`
      })
    }

    if (simulatingAlphas && simulatingAlphas > 0) {
      feed.push({
        id: 3,
        type: 'action',
        message: `${simulatingAlphas} alpha${simulatingAlphas > 1 ? 's are' : ' is'} currently in simulation. Results pending.`
      })
    }

    if (messageCount && messageCount > 0) {
      feed.push({
        id: 4,
        type: pendingMessages && pendingMessages > 0 ? 'alert' : 'insight',
        message: pendingMessages && pendingMessages > 0
          ? `${pendingMessages} unread WhatsApp message${pendingMessages > 1 ? 's' : ''} in JARVIS inbox.`
          : `${messageCount} WhatsApp messages processed by JARVIS. All caught up.`
      })
    }

    if (unshippedProjects && unshippedProjects > 0) {
      feed.push({
        id: 5,
        type: 'insight',
        message: `${unshippedProjects} active project${unshippedProjects > 1 ? 's' : ''} in development. Total: ${projectCount || 0}.`
      })
    }
  }

  // Always add at least one item so the feed is never empty
  if (feed.length === 0) {
    feed.push({
      id: 1,
      type: 'insight',
      message: hasSupabaseKeys
        ? 'All systems operational. No significant activity detected yet.'
        : 'Supabase not configured. Connect your database to see live intelligence.'
    })
  }

  return NextResponse.json({ feed })
}
