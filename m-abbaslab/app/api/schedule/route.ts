// app/api/schedule/route.ts
// Manages the scheduled post queue — CRUD + process due posts

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { jwtVerify } from 'jose'
import { postTweet } from '@/lib/twitter'
import { postLinkedIn } from '@/lib/linkedin'

const QUEUE_FILE = path.join(process.cwd(), 'data', 'scheduled-posts.json')

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledAt: string | null
  isDraft: boolean
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  results?: Record<string, { success: boolean; id?: string; error?: string }> | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function readQueue(): Promise<ScheduledPost[]> {
  try {
    const raw = await fs.readFile(QUEUE_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeQueue(queue: ScheduledPost[]): Promise<void> {
  await fs.mkdir(path.dirname(QUEUE_FILE), { recursive: true })
  await fs.writeFile(QUEUE_FILE, JSON.stringify(queue, null, 2))
}

async function authCheck(request: NextRequest): Promise<boolean> {
  // Check x-admin-secret header
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true

  // Check JWT session cookie
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

// ─── POST — Add new scheduled/draft post ──────────────────────────────────────

export async function POST(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const { content, platforms, scheduledAt, isDraft } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content required.' }, { status: 400 })
    }

    if (!isDraft && (!scheduledAt || new Date(scheduledAt) <= new Date())) {
      return NextResponse.json({ error: 'Scheduled time must be in the future.' }, { status: 400 })
    }

    const queue = await readQueue()

    const newPost: ScheduledPost = {
      id: `post_${Date.now()}`,
      content: content.trim(),
      platforms: platforms || [],
      scheduledAt: isDraft ? null : scheduledAt,
      isDraft: !!isDraft,
      status: isDraft ? 'draft' : 'scheduled',
      createdAt: new Date().toISOString(),
      results: null,
    }

    queue.push(newPost)
    await writeQueue(queue)

    return NextResponse.json({ success: true, post: newPost })
  } catch (err: any) {
    console.error('Schedule POST error:', err)
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 })
  }
}

// ─── GET — Fetch queue OR process due posts ────────────────────────────────────

export async function GET(request: NextRequest) {
  if (!authCheck(request)) {
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
        !p.isDraft &&
        p.scheduledAt &&
        new Date(p.scheduledAt) <= now
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
      post.publishedAt = anySuccess ? now.toISOString() : undefined
    }

    if (duePosts.length > 0) {
      await writeQueue(queue)
    }

    return NextResponse.json({ processed: duePosts.length, posts: duePosts })
  }

  // Default: return full queue sorted newest first
  const filter = searchParams.get('status')
  const filtered = filter ? queue.filter((p) => p.status === filter) : queue

  return NextResponse.json({
    posts: filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  })
}

// ─── DELETE — Remove a post ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: 'Post ID required.' }, { status: 400 })

  const queue = await readQueue()
  const updated = queue.filter((p) => p.id !== id)

  if (updated.length === queue.length) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  await writeQueue(updated)
  return NextResponse.json({ success: true })
}

// ─── PATCH — Edit a draft or reschedule ───────────────────────────────────────

export async function PATCH(request: NextRequest) {
  if (!authCheck(request)) {
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
  if (scheduledAt) post.scheduledAt = scheduledAt
  if (typeof isDraft !== 'undefined') {
    post.isDraft = isDraft
    post.status = isDraft ? 'draft' : 'scheduled'
  }

  post.updatedAt = new Date().toISOString()
  await writeQueue(queue)

  return NextResponse.json({ success: true, post })
}
