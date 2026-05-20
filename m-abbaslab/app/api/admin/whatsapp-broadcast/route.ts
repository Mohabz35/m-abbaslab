import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { logAudit } from '@/lib/audit'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

const BROADCAST_DELAY_MS = 100
const LOCAL_SUBSCRIBERS_PATH = path.join(process.cwd(), 'data', 'whatsapp-subscribers.json')
const LOCAL_BROADCASTS_PATH = path.join(process.cwd(), 'data', 'whatsapp-broadcasts.json')

type Subscriber = {
  id: string
  phone_number: string
  name?: string | null
  is_active?: boolean
  subscribed_at?: string | null
  created_at?: string | null
}

type BroadcastSummary = {
  id: string
  message: string
  total_recipients: number
  successful: number
  failed: number
  status: 'pending' | 'sending' | 'completed' | 'failed' | 'cancelled'
  scheduled_for: string | null
  created_at: string
  completed_at: string | null
}

type LocalBroadcastStore = {
  broadcasts: BroadcastSummary[]
  logs: Array<{
    id: string
    broadcast_id: string
    subscriber_id: string
    phone_number: string
    status: 'sent' | 'failed'
    error: string | null
    sent_at: string
  }>
}

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, '')
}

function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone)
}

async function readLocalSubscribers(): Promise<Subscriber[]> {
  try {
    const raw = await fs.readFile(LOCAL_SUBSCRIBERS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function readLocalBroadcastStore(): Promise<LocalBroadcastStore> {
  try {
    const raw = await fs.readFile(LOCAL_BROADCASTS_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      broadcasts: Array.isArray(parsed.broadcasts) ? parsed.broadcasts : [],
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    }
  } catch {
    return { broadcasts: [], logs: [] }
  }
}

async function writeLocalBroadcastStore(store: LocalBroadcastStore): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_BROADCASTS_PATH), { recursive: true })
  await fs.writeFile(LOCAL_BROADCASTS_PATH, JSON.stringify(store, null, 2), 'utf8')
}

async function getSubscribers(recipientIds?: string[]): Promise<Subscriber[]> {
  const normalizedIds = Array.isArray(recipientIds)
    ? recipientIds.filter((id) => typeof id === 'string' && id.trim())
    : []

  if (hasSupabaseKeys) {
    let query = supabase
      .from('whatsapp_subscribers')
      .select('id, phone_number, name, is_active, subscribed_at, created_at')
      .eq('is_active', true)

    if (normalizedIds.length > 0) {
      query = query.in('id', normalizedIds)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as Subscriber[]) || []
  }

  const localSubscribers = await readLocalSubscribers()
  return localSubscribers
    .filter((subscriber) => subscriber.is_active !== false)
    .filter((subscriber) => (normalizedIds.length > 0 ? normalizedIds.includes(subscriber.id) : true))
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'subscribers'

  try {
    if (action === 'subscribers') {
      const subscribers = await getSubscribers()
      return NextResponse.json({ success: true, subscribers })
    }

    if (action === 'history') {
      if (hasSupabaseKeys) {
        const { data, error } = await supabase
          .from('whatsapp_broadcasts')
          .select('id, message, total_recipients, successful, failed, status, scheduled_for, created_at, completed_at')
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw new Error(error.message)
        return NextResponse.json({ success: true, broadcasts: data || [] })
      }

      const store = await readLocalBroadcastStore()
      const broadcasts = [...store.broadcasts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)
      return NextResponse.json({ success: true, broadcasts })
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load broadcast data.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const message = typeof body.message === 'string' ? body.message.trim() : ''
    const sendToAll = Boolean(body.sendToAll)
    const recipientIds = Array.isArray(body.recipientIds) ? (body.recipientIds as string[]) : []

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 })
    }
    if (!sendToAll && recipientIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Select recipients or enable send-to-all.' }, { status: 400 })
    }

    const recipients = await getSubscribers(sendToAll ? undefined : recipientIds)
    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'No active recipients found.' }, { status: 404 })
    }

    const broadcastId = `broadcast_${Date.now()}`
    const createdAt = new Date().toISOString()

    if (hasSupabaseKeys) {
      const { error } = await supabase.from('whatsapp_broadcasts').insert({
        id: broadcastId,
        message,
        total_recipients: recipients.length,
        successful: 0,
        failed: 0,
        status: 'sending',
        created_at: createdAt,
      })
      if (error) throw new Error(error.message)
    } else {
      const store = await readLocalBroadcastStore()
      store.broadcasts.unshift({
        id: broadcastId,
        message,
        total_recipients: recipients.length,
        successful: 0,
        failed: 0,
        status: 'sending',
        scheduled_for: null,
        created_at: createdAt,
        completed_at: null,
      })
      await writeLocalBroadcastStore(store)
    }

    let successful = 0
    let failed = 0
    const failedRecipients: Array<{ id: string; phone: string; error: string }> = []

    for (let i = 0; i < recipients.length; i += 1) {
      const recipient = recipients[i]
      const normalizedPhone = normalizePhone(recipient.phone_number || '')
      let sendStatus: 'sent' | 'failed' = 'failed'
      let sendError: string | null = null

      if (!isValidE164(normalizedPhone)) {
        sendError = 'Invalid phone format. Use E.164 (e.g., +254...).'
      } else {
        const sent = await sendWhatsAppMessage(normalizedPhone, message)
        if (sent) {
          sendStatus = 'sent'
        } else {
          sendError = 'WhatsApp API rejected the message.'
        }
      }

      if (sendStatus === 'sent') {
        successful += 1
      } else {
        failed += 1
        failedRecipients.push({
          id: recipient.id,
          phone: normalizedPhone || recipient.phone_number,
          error: sendError || 'Unknown send failure',
        })
      }

      if (hasSupabaseKeys) {
        await supabase.from('whatsapp_broadcast_logs').insert({
          broadcast_id: broadcastId,
          subscriber_id: recipient.id,
          phone_number: normalizedPhone || recipient.phone_number,
          status: sendStatus,
          error: sendError,
        })
      } else {
        const store = await readLocalBroadcastStore()
        store.logs.unshift({
          id: `log_${Date.now()}_${i}`,
          broadcast_id: broadcastId,
          subscriber_id: recipient.id,
          phone_number: normalizedPhone || recipient.phone_number,
          status: sendStatus,
          error: sendError,
          sent_at: new Date().toISOString(),
        })

        const idx = store.broadcasts.findIndex((b) => b.id === broadcastId)
        if (idx !== -1) {
          store.broadcasts[idx].successful = successful
          store.broadcasts[idx].failed = failed
        }
        await writeLocalBroadcastStore(store)
      }

      if (i < recipients.length - 1) {
        await wait(BROADCAST_DELAY_MS)
      }
    }

    const status: BroadcastSummary['status'] = failed > 0 && successful === 0 ? 'failed' : 'completed'
    const completedAt = new Date().toISOString()

    if (hasSupabaseKeys) {
      await supabase
        .from('whatsapp_broadcasts')
        .update({
          successful,
          failed,
          status,
          completed_at: completedAt,
        })
        .eq('id', broadcastId)
    } else {
      const store = await readLocalBroadcastStore()
      const idx = store.broadcasts.findIndex((b) => b.id === broadcastId)
      if (idx !== -1) {
        store.broadcasts[idx].successful = successful
        store.broadcasts[idx].failed = failed
        store.broadcasts[idx].status = status
        store.broadcasts[idx].completed_at = completedAt
      }
      await writeLocalBroadcastStore(store)
    }

    await logAudit(
      'WHATSAPP_BROADCAST',
      `Broadcast ${broadcastId}: ${successful}/${recipients.length} sent successfully.`
    )

    return NextResponse.json({
      success: true,
      broadcastId,
      results: {
        total: recipients.length,
        successful,
        failed,
        failedRecipients,
      },
    })
  } catch (error: any) {
    console.error('whatsapp-broadcast POST error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send broadcast.' },
      { status: 500 }
    )
  }
}
