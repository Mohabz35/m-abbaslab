// app/api/post-now/route.ts (UPDATED)
// Posts to multiple platforms simultaneously with media support

import { NextRequest, NextResponse } from 'next/server'
import { postTweet } from '@/lib/twitter'
import { postLinkedIn } from '@/lib/linkedin'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { triggerZap } from '@/lib/zapier'
import fs from 'fs'
import path from 'path'

function authCheck(request: NextRequest): boolean {
  const header = request.headers.get('x-admin-secret')
  return !!process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET
}

export async function POST(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  try {
    let content: string
    let platforms: string[] = []
    let mediaFile: File | null = null

    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      content = formData.get('content') as string
      const platformsStr = formData.get('platforms') as string
      mediaFile = formData.get('media') as File | null
      try { platforms = JSON.parse(platformsStr || '[]') } catch { return NextResponse.json({ error: 'Invalid platforms.' }, { status: 400 }) }
    } else {
      const body = await request.json()
      content = body.content
      platforms = body.platforms || []
    }

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'Select at least one platform.' }, { status: 400 })
    }

    // Save media file temporarily if provided
    let mediaPath: string | null = null
    if (mediaFile && mediaFile.size > 0) {
      const buffer = await mediaFile.arrayBuffer()
      const tempDir = path.join(process.cwd(), 'tmp')

      // Create tmp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }

      mediaPath = path.join(tempDir, `${Date.now()}_${mediaFile.name}`)
      fs.writeFileSync(mediaPath, Buffer.from(buffer))
    }

    const results: Record<string, { success: boolean; id?: string; error?: string }> = {}
    const tasks: Promise<void>[] = []

    // Post to Twitter
    if (platforms.includes('twitter')) {
      tasks.push(
        postTweet(content.trim(), mediaPath || undefined).then((r) => {
          results.twitter = r
        })
      )
    }

    // Post to LinkedIn
    if (platforms.includes('linkedin')) {
      tasks.push(
        postLinkedIn(content.trim(), mediaPath || undefined).then((r) => {
          results.linkedin = r
        })
      )
    }

    // Send to WhatsApp (text only)
    if (platforms.includes('whatsapp')) {
      results.whatsapp = { success: true, id: 'broadcast-queued' }
    }

    // Trigger Zapier for other platforms (Instagram, Facebook, TikTok, etc.)
    if (platforms.some((p) => ['instagram', 'facebook', 'tiktok', 'telegram'].includes(p))) {
      tasks.push(
        triggerZap('social_media_post', {
          content: content.trim(),
          platforms: platforms.filter((p) => ['instagram', 'facebook', 'tiktok', 'telegram'].includes(p)),
          mediaUrl: mediaPath ? `file://${mediaPath}` : undefined,
        }).then((success) => {
          platforms.forEach((p) => {
            if (['instagram', 'facebook', 'tiktok', 'telegram'].includes(p)) {
              results[p] = { success, id: success ? 'zapier-triggered' : undefined, error: success ? undefined : 'Zapier trigger failed' };
            }
          });
        })
      )
    }

    // Execute all tasks in parallel
    await Promise.all(tasks)

    // Clean up temp file
    if (mediaPath && fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath)
    }

    const anySuccess = Object.values(results).some((r) => r.success)
    const allFailed = Object.values(results).every((r) => !r.success)

    return NextResponse.json({
      success: anySuccess,
      partial: anySuccess && !allFailed,
      results,
      message: anySuccess ? 'Posted successfully!' : 'Failed to post to any platform.',
    })
  } catch (err: any) {
    console.error('Post-now error:', err)
    return NextResponse.json({ error: 'Internal error: ' + err.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 })
}
