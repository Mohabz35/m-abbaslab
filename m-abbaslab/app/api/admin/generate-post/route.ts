import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { jwtVerify } from 'jose'
import { logAudit } from '@/lib/audit'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'

const PLATFORM_GUIDES: Record<string, string> = {
  twitter: 'X/Twitter: punchy and concise, ideally <= 280 chars, include 1-2 relevant hashtags.',
  linkedin: 'LinkedIn: professional, insight-led, 2-4 short paragraphs, add a clear CTA.',
  instagram: 'Instagram: visual and engaging, short paragraphs + up to 5 hashtags.',
  tiktok: 'TikTok: energetic hook in first line, short lines, include a simple CTA.',
  facebook: 'Facebook: conversational but professional, 1-3 short paragraphs, optional emoji.',
  youtube: 'YouTube: description style, include hook + value promise + CTA to subscribe.',
  whatsapp: 'WhatsApp: short broadcast-style note, direct and personal, no excessive hashtags.',
  telegram: 'Telegram: concise channel update tone, include quick context and CTA.',
  github: 'GitHub: technical update tone, mention build/progress and next milestone clearly.',
}

type AIConfig = {
  topic: string
  platforms: string[]
  tone?: string
  length?: 'short' | 'medium' | 'long'
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

function cleanCodeFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

function extractJsonObject(raw: string): Record<string, string> {
  const cleaned = cleanCodeFences(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1))
    }
    throw new Error('Invalid JSON from AI provider')
  }
}

function buildPrompt(config: AIConfig): string {
  const tone = config.tone || 'professional'
  const length = config.length || 'medium'
  const guides = config.platforms
    .map((platform) => `- ${platform}: ${PLATFORM_GUIDES[platform] || 'Make it platform-appropriate and audience-friendly.'}`)
    .join('\n')

  return `Generate social media copy for topic: "${config.topic}".

Requested tone: ${tone}
Requested length: ${length}
Platforms:
${guides}

Return ONLY valid JSON with this shape:
{
  "twitter": "...",
  "linkedin": "..."
}

Rules:
- Include exactly the requested platform keys.
- Value for each key must be plain text copy only.
- No markdown code fences.
- No extra commentary outside JSON.
- Keep claims grounded and avoid fabricated statistics.`
}

async function generateViaOpenRouter(config: AIConfig): Promise<Record<string, string>> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://m-abbaslab.vercel.app',
      'X-Title': 'M-AbbasLab Social Generator',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.7,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a social media copywriter. Always return strict JSON only.',
        },
        {
          role: 'user',
          content: buildPrompt(config),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`OpenRouter error (${response.status}): ${errText}`)
  }

  const data = await response.json()
  const raw = data?.choices?.[0]?.message?.content
  if (!raw || typeof raw !== 'string') {
    throw new Error('OpenRouter returned empty content')
  }
  return extractJsonObject(raw)
}

async function generateViaAnthropic(config: AIConfig): Promise<Record<string, string>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured')
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-3-5-haiku-latest',
    max_tokens: 900,
    temperature: 0.7,
    system: 'You are a social media copywriter. Return strict JSON only.',
    messages: [{ role: 'user', content: buildPrompt(config) }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  const raw = textBlock?.type === 'text' ? textBlock.text : ''
  if (!raw) {
    throw new Error('Anthropic returned empty content')
  }
  return extractJsonObject(raw)
}

function sanitizeContentForPlatforms(
  raw: Record<string, string>,
  platforms: string[]
): Record<string, string> {
  const sanitized: Record<string, string> = {}
  for (const platform of platforms) {
    const value = raw[platform]
    sanitized[platform] = typeof value === 'string' ? value.trim() : ''
  }
  return sanitized
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as AIConfig
    const topic = body.topic?.trim()
    const platforms = Array.isArray(body.platforms)
      ? body.platforms.filter((p) => typeof p === 'string' && p.trim())
      : []

    if (!topic) {
      return NextResponse.json({ success: false, error: 'Topic is required.' }, { status: 400 })
    }
    if (platforms.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one platform is required.' }, { status: 400 })
    }

    const payload: AIConfig = {
      topic,
      platforms,
      tone: body.tone || 'professional',
      length: body.length || 'medium',
    }

    const providerErrors: string[] = []
    let rawContent: Record<string, string> | null = null
    let provider = ''

    if (process.env.OPENROUTER_API_KEY) {
      try {
        rawContent = await generateViaOpenRouter(payload)
        provider = 'openrouter'
      } catch (err: any) {
        providerErrors.push(err?.message || 'OpenRouter generation failed')
      }
    }

    if (!rawContent && process.env.ANTHROPIC_API_KEY) {
      try {
        rawContent = await generateViaAnthropic(payload)
        provider = 'anthropic'
      } catch (err: any) {
        providerErrors.push(err?.message || 'Anthropic generation failed')
      }
    }

    if (!rawContent) {
      await logAudit('SOCIAL_GENERATION_FAILED', `Topic="${topic}", errors=${providerErrors.join(' | ')}`)
      return NextResponse.json(
        {
          success: false,
          error: providerErrors[0] || 'AI provider unavailable. Configure OPENROUTER_API_KEY or ANTHROPIC_API_KEY.',
        },
        { status: 500 }
      )
    }

    const content = sanitizeContentForPlatforms(rawContent, platforms)
    const generatedAny = Object.values(content).some((value) => value.length > 0)
    if (!generatedAny) {
      return NextResponse.json({ success: false, error: 'Generation returned empty content.' }, { status: 500 })
    }

    await logAudit('SOCIAL_GENERATION_SUCCESS', `Topic="${topic}" via ${provider} for [${platforms.join(', ')}]`)

    return NextResponse.json({
      success: true,
      provider,
      content,
      meta: { topic, tone: payload.tone, length: payload.length },
    })
  } catch (error: any) {
    console.error('generate-post error:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate content.' },
      { status: 500 }
    )
  }
}
