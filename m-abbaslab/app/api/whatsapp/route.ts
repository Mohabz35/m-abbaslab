// app/api/whatsapp/route.ts
// WhatsApp Cloud API Webhook — auto-replies to DMs using Claude AI
// Trained on: Mohammed Abbas's communication style (strategic, professional, direct)

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { sendWhatsAppMessage, markAsRead } from '@/lib/whatsapp'

const client = new Anthropic()

// Mohammed's trained AI personality — edit this to shape how it responds
const SYSTEM_PROMPT = `You are Mohammed Abbas's AI assistant, responding on his behalf via WhatsApp.

About Mohammed:
- A driven young entrepreneur, quant finance researcher, and software developer based in Kenya
- Founder of M-AbbasLab — an AI-powered personal operating platform
- Currently at Chuka University, pursuing ambitious academic and business goals
- Projects: ILMS (Intelligent Learning Management System), SkillSync AI, PEFM (Predictive Economic Forecasting Model), M-JARVIS AI assistant
- Interests: quantitative finance (WorldQuant), machine learning, fashion modeling, tech entrepreneurship

Communication Style:
- Professional yet warm and personable
- Concise — never long-winded
- Strategic thinker who values time
- Uses "Commander" mindset — decisive and action-oriented
- Does NOT use excessive slang, but is friendly and real
- Replies in the same language the person messaged in

Rules:
- If someone asks about projects, briefly describe the relevant project and invite them to the site (m-abbaslab.vercel.app)
- If someone asks to meet or collaborate, say Mohammed will follow up personally
- If someone asks something sensitive or personal, politely redirect
- Keep replies under 300 characters where possible — this is WhatsApp, not email
- Never reveal you are an AI unless directly and sincerely asked
- If directly asked, acknowledge you are Mohammed's AI assistant handling messages

Always be helpful, brief, and represent Mohammed well.`

// ─── GET — Webhook verification (Meta requires this on setup) ─────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified ✓')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Verification failed.' }, { status: 403 })
}

// ─── POST — Receive incoming messages and auto-reply ─────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const rawBody = await request.text()

    // Verify Meta webhook signature if WHATSAPP_APP_SECRET is configured
    if (process.env.WHATSAPP_APP_SECRET) {
      const signature = request.headers.get('x-hub-signature-256')
      if (signature) {
        const crypto = await import('crypto')
        const expectedSignature =
          'sha256=' +
          crypto
            .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
            .update(rawBody)
            .digest('hex')

        if (signature !== expectedSignature) {
          console.warn('WhatsApp webhook signature mismatch')
          return NextResponse.json({ status: 'ok' })
        }
      }
    }

    const body = JSON.parse(rawBody)

    // WhatsApp sends nested structure
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    // Ignore non-message events (status updates, etc.)
    if (!value?.messages) {
      return NextResponse.json({ status: 'ok' })
    }

    const message = value.messages[0]
    const from = message.from // sender's phone number
    const messageId = message.id
    const messageType = message.type

    // Only handle text messages
    if (messageType !== 'text') {
      // For non-text, send a polite redirect
      await sendWhatsAppMessage(
        from,
        "Hey! I can only read text messages right now. Send me a message and I'll get back to you 🤝"
      )
      return NextResponse.json({ status: 'ok' })
    }

    const incomingText = message.text.body?.trim()
    if (!incomingText) return NextResponse.json({ status: 'ok' })

    // Mark as read immediately (shows double blue tick)
    await markAsRead(messageId)

    // Generate AI reply using Claude
    const aiResponse = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: incomingText }],
    })

    const reply =
      aiResponse.content[0]?.type === 'text'
        ? aiResponse.content[0].text
        : "Hey! Mohammed's AI here — he'll be with you shortly 🤝"

    // Send the reply
    await sendWhatsAppMessage(from, reply)

    return NextResponse.json({ status: 'ok', replied: true })
  } catch (err: any) {
    console.error('WhatsApp webhook error:', err)
    // Always return 200 to WhatsApp — otherwise Meta will retry endlessly
    return NextResponse.json({ status: 'ok', error: err.message })
  }
}
