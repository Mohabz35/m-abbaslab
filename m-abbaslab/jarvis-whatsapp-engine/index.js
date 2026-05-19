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
  const lowerMsg = messageText.toLowerCase()
  let trainedRules = []
  let configData = null

  // 1. Fetch real-time self-updating data from Supabase
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('config_data')
      .eq('id', 1)
      .single()
    
    if (!error && data && data.config_data) {
      configData = data.config_data
      trainedRules = data.config_data.jarvisTraining || []
    }
  } catch (err) {
    console.error('[M-JARVIS] Failed to query dynamic config from Supabase:', err.message)
  }

  // 2. Rule-based Trained Custom Keywords (Free, instant matching)
  for (const rule of trainedRules) {
    if (rule.keyword && lowerMsg.includes(rule.keyword.toLowerCase())) {
      console.log(`[M-JARVIS] Matched dynamic trained rule: "${rule.keyword}"`)
      return rule.response
    }
  }

  // 3. OpenRouter API Call (Dynamic free Gemini-2.5-Flash model for conversational intelligence!)
  if (process.env.OPENROUTER_API_KEY) {
    console.log('[M-JARVIS] OpenRouter API Key active. Dispatching conversational request.');
    try {
      const dynamicSystemPrompt = `You are M-JARVIS, a highly capable and intelligent personal assistant for Mohammed Abbas.
Mohammed Abbas is an Economist, Statistician, Data Scientist, and Full-Stack Software Engineer.
Your replies should be helpful, professional, and slightly futuristic. Write in a concise manner (2-4 sentences max).

Here is Mohammed's current site portfolio information (synced in real-time from the database):
- Email: ${configData?.email || 'mohammedabbasofficial100@gmail.com'}
- Brand Name: ${configData?.brandName || 'M-AbbasLab'}
- Active Roles: ${JSON.stringify(configData?.roles || [])}
- Selected Projects: ${JSON.stringify((configData?.projects || []).slice(0, 4).map(p => ({ title: p.title, description: p.description, status: p.status })))}
- Modeling Titles: ${JSON.stringify((configData?.fashion?.titles || []).slice(0, 3).map(t => ({ title: t.title, year: t.year })))}
- Contact Details: Email is ${configData?.email || 'mohammedabbasofficial100@gmail.com'}, Phone/WhatsApp: +254702894309, Web: m-abbaslab.vercel.app

You are conversing with ${senderName}. Respond directly to their query.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://m-abbaslab.vercel.app",
          "X-Title": "M-AbbasLab Jarvis WhatsApp"
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-super-120b-a12b:free",
          messages: [
            { role: "system", content: dynamicSystemPrompt },
            { role: "user", content: messageText }
          ],
          temperature: 0.7,
          max_tokens: 512
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        const reply = responseData.choices?.[0]?.message?.content || '';
        if (reply) {
          console.log('[M-JARVIS] Successfully fetched response from OpenRouter.');
          return reply;
        }
      } else {
        const errBody = await response.text();
        console.error('[M-JARVIS] OpenRouter returned error status:', response.status, errBody);
      }
    } catch (err) {
      console.error('[M-JARVIS] Failed to query OpenRouter:', err.message);
    }
  }

  // 4. Fallbacks using active config database details
  if (configData) {
    // Projects query
    if (lowerMsg.includes('project') || lowerMsg.includes('portfolio') || lowerMsg.includes('work')) {
      const topProjects = (configData.projects || []).slice(0, 3).map(p => `• *${p.title}*: ${p.description}`).join('\n')
      return `Mohammed has built several outstanding systems. Here are a few recent ones:\n\n${topProjects || '• M-AbbasLab Platform'}\n\nExplore them all at: *m-abbaslab.vercel.app* 🚀`
    }

    // Modeling and Pageantry
    if (lowerMsg.includes('model') || lowerMsg.includes('fashion') || lowerMsg.includes('title')) {
      const titlesList = (configData.fashion?.titles || []).slice(0, 3).map(t => `• *${t.title}* (${t.year})`).join('\n')
      return `Mohammed is a crowned commercial and pageantry model in Kenya. His achievements include:\n\n${titlesList || '• Mr. Glam Haven\n• Mr. YYMH'}\n\nHe merges fashion with analytics to build the future of modeling! 👑`
    }

    // Contact
    if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone') || lowerMsg.includes('social')) {
      return `You can connect with Mohammed directly at:\n✉️ Email: ${configData.email || 'mohammedabbasofficial100@gmail.com'}\n📞 Phone/WhatsApp: +254 702 894 309\n🌐 Web: *m-abbaslab.vercel.app*`
    }
  }

  // 4. Default keyword match fallback
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
    return `Hello ${senderName}! 👋 This is M-JARVIS, Mohammed's assistant. How can I help you today?`
  }
  if (lowerMsg.includes('who are you') || lowerMsg.includes('are you a bot')) {
    return `I'm M-JARVIS, an intelligent assistant for Mohammed Abbas. I'm here to help with any questions or direct you to the right resources.`
  }
  if (lowerMsg.includes('mohammed') || lowerMsg.includes('boss') || lowerMsg.includes('director')) {
    return `Mohammed Abbas is a visionary economist, full-stack engineer, and founder of the Quantum Impact Syndicate. He's currently occupied but will respond to you personally as soon as possible.`
  }
  if (lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('appreciate')) {
    return `You're most welcome! 🙏 Is there anything else I can help you with?`
  }

  // Default smart AI assistant message
  return `Thank you for reaching out to Mohammed! 👋 I've logged your message and he will respond to you personally. In the meantime, feel free to check out his full projects, publications, and professional background at *m-abbaslab.vercel.app*!`
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
  const usePairingCode = Boolean(process.env.PHONE_NUMBER)

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  })

  sock.ev.on('creds.update', saveCreds)

  // Request Pairing Code if phone number is provided and session is not authenticated
  if (usePairingCode && !sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER.replace(/[^0-9]/g, '')
    console.log(`[M-JARVIS] Requesting pairing code for phone number: ${phoneNumber}...`)
    setTimeout(async () => {
      try {
        let code = await sock.requestPairingCode(phoneNumber)
        code = code?.match(/.{1,4}/g)?.join('-') || code
        console.log(`\n🔑 [M-JARVIS] YOUR PAIRING CODE IS: ${code}\n`)
      } catch (err) {
        console.error('[M-JARVIS] Failed to request pairing code:', err)
      }
    }, 3000)
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr && !usePairingCode) {
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

// ─── Render Port Binding (prevents boot timeouts) ───────────────────────────
const http = require('http')
const PORT = process.env.PORT || 3000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('M-JARVIS WhatsApp Engine is online and running!')
})

server.listen(PORT, () => {
  console.log(`[M-JARVIS] Health check server listening on port ${PORT}`)
})
