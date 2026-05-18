require('dotenv').config()
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const qrcode = require('qrcode-terminal')
const pino = require('pino')

// ─── Supabase Client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ─── JARVIS Knowledge Base ─────────────────────────────────────────────────
const JARVIS_PERSONA = process.env.JARVIS_PERSONA || "Mohammed Abbas"
const JARVIS_RULES = `
You are M-JARVIS, a personal AI assistant for ${JARVIS_PERSONA}.
Rules:
1. Be concise, professional, and helpful.
2. If someone asks about Mohammed Abbas, describe him as a visionary economist, software engineer, and founder of the Quantum Impact Syndicate.
3. For business inquiries, direct to: m-abbaslab.vercel.app
4. For urgent matters, politely say Mohammed will respond personally.
5. Do NOT reveal you are an AI bot unless directly asked.
`

// ─── JARVIS AI Response Engine ────────────────────────────────────────────────
async function getJarvisResponse(senderName, messageText) {
  // Keyword-based smart responses (no API key needed for basic mode)
  const lowerMsg = messageText.toLowerCase()

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Hello ${senderName}! 👋 This is M-JARVIS, Mohammed's assistant. How can I help you today?`
  }
  if (lowerMsg.includes('who are you') || lowerMsg.includes('are you a bot')) {
    return `I'm M-JARVIS, an intelligent assistant for Mohammed Abbas. I'm here to help with any questions or direct you to the right resources.`
  }
  if (lowerMsg.includes('mohammed') || lowerMsg.includes('boss') || lowerMsg.includes('director')) {
    return `Mohammed Abbas is a visionary economist, full-stack engineer, and founder of the Quantum Impact Syndicate. He's currently occupied but will respond to you personally as soon as possible.`
  }
  if (lowerMsg.includes('website') || lowerMsg.includes('portfolio') || lowerMsg.includes('work')) {
    return `You can explore Mohammed's full portfolio, research, and projects at:\n🌐 *m-abbaslab.vercel.app*\n\nFeel free to browse the Quantum Impact Syndicate portal for collaboration opportunities.`
  }
  if (lowerMsg.includes('business') || lowerMsg.includes('invest') || lowerMsg.includes('partner')) {
    return `For business inquiries and partnerships, please visit:\n🏛️ *m-abbaslab.vercel.app/quantum-impact-syndicate*\n\nMohammed will personally review your proposal. You can also connect on WhatsApp for priority access.`
  }
  if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('quote')) {
    return `For pricing and project quotes, please share details about your requirements and Mohammed will get back to you with a tailored proposal. 📊`
  }
  if (lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('appreciate')) {
    return `You're most welcome! 🙏 Is there anything else I can help you with?`
  }

  // Default intelligent response
  return `Thank you for reaching out! I've noted your message and Mohammed will respond personally. In the meantime, you can explore his work at *m-abbaslab.vercel.app* 🚀`
}

// ─── Log message to Supabase ──────────────────────────────────────────────────
async function logMessageToSupabase(sender, senderName, message, reply) {
  try {
    await supabase.from('whatsapp_messages').insert([{
      sender_number: sender,
      sender_name: senderName || 'Unknown',
      message_text: message,
      jarvis_reply: reply,
      timestamp: new Date().toISOString(),
      is_read: false
    }])
    console.log(`[Supabase] Logged message from ${senderName}`)
  } catch (err) {
    console.error('[Supabase] Failed to log message:', err.message)
  }
}

// ─── Main WhatsApp Connection ─────────────────────────────────────────────────
async function startJarvis() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_state')
  const logger = pino({ level: 'silent' })

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['M-JARVIS', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n[M-JARVIS] Scan this QR Code with your WhatsApp:\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = code !== DisconnectReason.loggedOut
      console.log(`[M-JARVIS] Disconnected. Code: ${code}. Reconnecting: ${shouldReconnect}`)
      if (shouldReconnect) setTimeout(startJarvis, 5000)
    }

    if (connection === 'open') {
      console.log('\n✅ [M-JARVIS] Connected to WhatsApp! Bot is online and listening...\n')
    }
  })

  // ─── Message Handler ────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      // Ignore our own messages
      if (msg.key.fromMe) continue

      const sender = msg.key.remoteJid
      const isGroup = sender.endsWith('@g.us')

      // Only respond to direct messages (not groups) by default
      if (isGroup && !process.env.RESPOND_TO_GROUPS) continue

      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        ''

      if (!messageText) continue

      const senderName = msg.pushName || sender.split('@')[0]
      console.log(`\n[M-JARVIS] Message from ${senderName}: "${messageText}"`)

      // Get JARVIS response
      const reply = await getJarvisResponse(senderName, messageText)

      // Send Reply
      await sock.sendMessage(sender, { text: reply }, { quoted: msg })
      console.log(`[M-JARVIS] Replied: "${reply}"`)

      // Log to Supabase
      await logMessageToSupabase(sender, senderName, messageText, reply)
    }
  })
}

startJarvis().catch(console.error)
