// app/api/schedule/route.ts
// Manages scheduled posts — CRUD + process due posts (Supabase-backed)

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { postTweet } from '@/lib/twitter'
import { postLinkedIn } from '@/lib/linkedin'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  is_draft: boolean
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  created_at: string
  updated_at: string
  published_at?: string | null
  results?: Record<string, { success: boolean; id?: string; error?: string }> | null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function authCheck(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true

  const session = request.cookies.get('admin_session')
  if (session?.value) {
    try {
      const { payload } = await jwtVerify(session.value, JWT_SECRET, {
        issuer: 'm-abbaslab',
        audience: 'admin',
      })
      return !!payload.user
    } catch { /* invalid token */ }
  }

  return false
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readQueue(): Promise<ScheduledPost[]> {
  if (!hasSupabaseKeys) return []
  const { data, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Read queue error:', error)
    return []
  }
  return (data || []) as ScheduledPost[]
}

async function upsertPost(post: ScheduledPost): Promise<void> {
  if (!hasSupabaseKeys) return
  const { error } = await supabase.from('scheduled_posts').upsert(post, { onConflict: 'id' })
  if (error) console.error('Upsert post error:', error)
}

async function deletePostById(id: string): Promise<boolean> {
  if (!hasSupabaseKeys) return false
  const { error } = await supabase.from('scheduled_posts').delete().eq('id', id)
  return !error
}

// ─── POST — Add new scheduled/draft post ──────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!(await authCheck(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const { content, platforms, scheduledAt, isDraft, isNow } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content required.' }, { status: 400 })
    }

    if (!isDraft && !isNow && (!scheduledAt || new Date(scheduledAt) <= new Date())) {
      return NextResponse.json({ error: 'Scheduled time must be in the future.' }, { status: 400 })
    }

    // If posting now, process immediately
    if (isNow && !isDraft) {
      const results: Record<string, { success: boolean; id?: string; error?: string }> = {}
      const tasks: Promise<void>[] = []

      if (platforms?.includes('twitter')) {
        tasks.push(postTweet(content.trim()).then((r) => { results.twitter = r }))
      }
      if (platforms?.includes('linkedin')) {
        tasks.push(postLinkedIn(content.trim()).then((r) => { results.linkedin = r }))
      }

      if (tasks.length > 0) await Promise.all(tasks)

      const anySuccess = Object.values(results).some((r) => r.success)
      const newPost: ScheduledPost = {
        id: `post_${Date.now()}`,
        content: content.trim(),
        platforms: platforms || [],
        scheduled_at: null,
        is_draft: false,
        status: anySuccess ? 'published' : 'failed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: anySuccess ? new Date().toISOString() : null,
        results,
      }
      await upsertPost(newPost)
      return NextResponse.json({ success: true, post: newPost })
    }

    const newPost: ScheduledPost = {
      id: `post_${Date.now()}`,
      content: content.trim(),
      platforms: platforms || [],
      scheduled_at: isDraft ? null : scheduledAt,
      is_draft: !!isDraft,
      status: isDraft ? 'draft' : 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: null,
      results: null,
    }

    await upsertPost(newPost)

    return NextResponse.json({ success: true, post: newPost })
  } catch (err: unknown) {
    console.error('Schedule POST error:', err)
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 })
  }
}

// ─── GET — Fetch queue OR process due posts ────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!(await authCheck(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const queue = await readQueue()

  // Process due posts — called by cron or manual trigger
  if (action === 'process') {
    const now = new Date()
    const duePosts = queue.filter(
      (p) =>
        p.status === 'scheduled' &&
        !p.is_draft &&
        p.scheduled_at &&
        new Date(p.scheduled_at) <= now
    )

    for (const post of duePosts) {
      const results: Record<string, { success: boolean; id?: string; error?: string }> = {}
      const tasks: Promise<void>[] = []

      if (post.platforms.includes('twitter')) {
        tasks.push(postTweet(post.content).then((r) => { results.twitter = r }))
      }
      if (post.platforms.includes('linkedin')) {
        tasks.push(postLinkedIn(post.content).then((r) => { results.linkedin = r }))
      }

      await Promise.all(tasks)

      const anySuccess = Object.values(results).some((r) => r.success)
      post.status = anySuccess ? 'published' : 'failed'
      post.results = results
      post.published_at = anySuccess ? now.toISOString() : null
      post.updated_at = now.toISOString()
    }

    if (duePosts.length > 0) {
      for (const post of duePosts) {
        await upsertPost(post)
      }
    }

    return NextResponse.json({ processed: duePosts.length, posts: duePosts })
  }

  // Default: return full queue sorted newest first
  const filter = searchParams.get('status')
  const filtered = filter ? queue.filter((p) => p.status === filter) : queue

  return NextResponse.json({
    posts: filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ),
  })
}

// ─── DELETE — Remove a post ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  if (!(await authCheck(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Post ID required.' }, { status: 400 })

  const deleted = await deletePostById(id)
  if (!deleted) {
    return NextResponse.json({ error: 'Post not found or delete failed.' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

// ─── PATCH — Edit a draft or reschedule ───────────────────────────────────────

export async function PATCH(request: NextRequest) {
  if (!(await authCheck(request))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id, content, platforms, scheduledAt, isDraft } = await request.json()
  if (!id) return NextResponse.json({ error: 'Post ID required.' }, { status: 400 })

  const queue = await readQueue()
  const post = queue.find((p) => p.id === id)

  if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  if (post.status === 'published') {
    return NextResponse.json({ error: 'Cannot edit a published post.' }, { status: 400 })
  }

  if (content) post.content = content.trim()
  if (platforms) post.platforms = platforms
  if (scheduledAt) post.scheduled_at = scheduledAt
  if (typeof isDraft !== 'undefined') {
    post.is_draft = isDraft
    post.status = isDraft ? 'draft' : 'scheduled'
  }

  post.updated_at = new Date().toISOString()
  await upsertPost(post)

  return NextResponse.json({ success: true, post })
}
