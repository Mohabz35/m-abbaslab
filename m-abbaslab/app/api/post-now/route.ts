// app/api/post-now/route.ts
// Instantly posts to X and LinkedIn simultaneously

import { NextRequest, NextResponse } from 'next/server'
import { postTweet } from '@/lib/twitter'
import { postLinkedIn } from '@/lib/linkedin'

function authCheck(request: NextRequest): boolean {
  const header = request.headers.get('x-admin-secret')
  return !!process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET
}

export async function POST(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const { content, platforms } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
    }
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'Select at least one platform.' }, { status: 400 })
    }

    const results: Record<string, { success: boolean; id?: string; error?: string }> = {}

    // Fire both simultaneously
    const tasks: Promise<void>[] = []

    if (platforms.includes('twitter')) {
      tasks.push(postTweet(content.trim()).then((r) => { results.twitter = r }))
    }
    if (platforms.includes('linkedin')) {
      tasks.push(postLinkedIn(content.trim()).then((r) => { results.linkedin = r }))
    }
    if (platforms.includes('whatsapp')) {
      // WhatsApp broadcast isn't a "post" — skip silently
      results.whatsapp = { success: true, id: 'broadcast-not-applicable' }
    }

    await Promise.all(tasks)

    const anySuccess = Object.values(results).some((r) => r.success)
    const allFailed = Object.values(results).every((r) => !r.success)

    return NextResponse.json({
      success: anySuccess,
      partial: anySuccess && !allFailed,
      results,
    })
  } catch (err: any) {
    console.error('Post-now error:', err)
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
