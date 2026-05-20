require('dotenv').config()
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const qrcode = require('qrcode-terminal')
const pino = require('pino')
const fs = require('fs')
const path = require('path')

// ─── Supabase Client ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const hasSupabase = !!(SUPABASE_URL && SUPABASE_KEY)
const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null

// ─── Local JSON Fallback Config ───────────────────────────────────────────────
const LOCAL_CONFIG_PATH = path.join(__dirname, '..', 'data', 'personal.json')

function loadLocalConfig() {
  try {
    const raw = fs.readFileSync(LOCAL_CONFIG_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.warn('[M-JARVIS] Local config file not found or invalid:', e.message)
    return null
  }
}

// ─── In-memory Set to track bot auto-replies (avoid double-logging) ──────────
const sentBotReplies = new Set()

// ─── Scheduling: Check if bot should reply now ────────────────────────────────
function isChatbotAllowedNow(schedule) {
  if (!schedule || schedule.type === 'always') return true
  if (schedule.type === 'disabled') return false

  const tz = schedule.timezone || 'Africa/Nairobi'
  const now = new Date()

  // Get current time in target timezone
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  const [curH, curM] = timeStr.split(':').map(Number)
  const currentMins = curH * 60 + curM

  const [startH, startM] = (schedule.workingHoursStart || '08:00').split(':').map(Number)
  const [endH, endM] = (schedule.workingHoursEnd || '17:00').split(':').map(Number)
  const startMins = startH * 60 + startM
  const endMins = endH * 60 + endM

  const isWorkingHours = currentMins >= startMins && currentMins < endMins

  if (schedule.type === 'working') return isWorkingHours
  if (schedule.type === 'non-working') return !isWorkingHours

  return true
}

// ─── Fetch recent chat history for a sender from Supabase ────────────────────
async function getChatHistory(sender) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('message_text, jarvis_reply, timestamp')
      .eq('sender_number', sender)
      .order('timestamp', { ascending: false })
      .limit(8)

    if (error || !data) return []

    // Reverse to chronological order, build message pairs
    return data.reverse()
  } catch (e) {
    console.warn('[M-JARVIS] Could not fetch chat history:', e.message)
    return []
  }
}

// ─── JARVIS AI Response Engine ────────────────────────────────────────────────
async function getJarvisResponse(senderName, messageText, sender) {
  const lowerMsg = messageText.toLowerCase()
  let trainedRules = []
  let configData = null
  let chatbotSchedule = null

  // 1. Fetch live config from Supabase (trained rules + schedule)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('config_data')
        .eq('id', 1)
        .single()

      if (!error && data && data.config_data) {
        configData = data.config_data
        trainedRules = data.config_data.jarvisTraining || []
        chatbotSchedule = data.config_data.whatsappBotSchedule || null
      }
    } catch (err) {
      console.warn('[M-JARVIS] Supabase config fetch failed, using local fallback:', err.message)
    }
  }

  // 1b. Fallback to local JSON if Supabase failed or is not configured
  if (!configData) {
    const localConfig = loadLocalConfig()
    if (localConfig) {
      configData = localConfig
      trainedRules = localConfig.jarvisTraining || []
      chatbotSchedule = localConfig.whatsappBotSchedule || null
      console.log('[M-JARVIS] Using local config fallback.')
    }
  }

  // 2. Check schedule — should bot reply right now?
  if (!isChatbotAllowedNow(chatbotSchedule)) {
    console.log('[M-JARVIS] Bot is outside its active schedule window. Skipping reply.')
    return null // null = don't reply
  }

  // 3. Rule-based Trained Custom Keywords (instant, free matching)
  for (const rule of trainedRules) {
    if (rule.keyword && lowerMsg.includes(rule.keyword.toLowerCase())) {
      console.log(`[M-JARVIS] ✅ Matched trained rule: "${rule.keyword}"`)
      return rule.response
    }
  }

  // 4. OpenRouter AI (with chat history context)
  if (process.env.OPENROUTER_API_KEY) {
    console.log('[M-JARVIS] OpenRouter AI active. Building context-aware response...')
    try {
      // Fetch recent chat history
      const history = await getChatHistory(sender)

      // Build conversation messages
      const conversationMessages = []

      // Add past exchanges as context (max 6 message pairs)
      for (const row of history.slice(-6)) {
        if (row.message_text && !row.message_text.startsWith('[Manual Reply]')) {
          conversationMessages.push({ role: 'user', content: row.message_text })
          if (row.jarvis_reply) {
            conversationMessages.push({ role: 'assistant', content: row.jarvis_reply })
          }
        } else if (row.message_text && row.message_text.startsWith('[Manual Reply]')) {
          // This was Mohammed himself replying — use it to style responses
          if (row.jarvis_reply) {
            conversationMessages.push({
              role: 'assistant',
              content: `[Mohammed's personal reply]: ${row.jarvis_reply}`
            })
          }
        }
      }

      // Add the current user message
      conversationMessages.push({ role: 'user', content: messageText })

      const dynamicSystemPrompt = `You are M-JARVIS, a highly capable and intelligent personal assistant for Mohammed Abbas.
Mohammed Abbas is an Economist, Statistician, Data Scientist, Full-Stack Software Engineer, and commercial fashion model based in Kenya.
Your replies should mirror Mohammed's professional yet approachable communication style. Be concise (2-4 sentences max), helpful, and slightly futuristic.

Mohammed's profile:
- Email: ${configData?.email || 'mohammedabbasofficial100@gmail.com'}
- Brand: ${configData?.brandName || 'M-AbbasLab'}
- Roles: ${JSON.stringify(configData?.roles || ['Economist', 'Engineer', 'Data Scientist'])}
- Projects: ${JSON.stringify((configData?.projects || []).slice(0, 4).map(p => ({ title: p.title, description: p.description, status: p.status })))}
- Modeling Titles: ${JSON.stringify((configData?.fashion?.titles || []).slice(0, 3).map(t => ({ title: t.title, year: t.year })))}
- Contact: Email ${configData?.email || 'mohammedabbasofficial100@gmail.com'}, WhatsApp: +254702894309, Web: m-abbaslab.vercel.app

IMPORTANT: You are conversing with ${senderName}. Study the conversation history above (especially any [Mohammed's personal reply] entries) to match his tone and style closely. Respond ONLY to the latest message.`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://m-abbaslab.vercel.app',
          'X-Title': 'M-AbbasLab Jarvis WhatsApp'
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
          messages: [
            { role: 'system', content: dynamicSystemPrompt },
            ...conversationMessages
          ],
          temperature: 0.7,
          max_tokens: 512
        })
      })

      if (response.ok) {
        const responseData = await response.json()
        const reply = responseData.choices?.[0]?.message?.content?.trim() || ''
        if (reply) {
          console.log('[M-JARVIS] ✅ OpenRouter response received.')
          return reply
        }
      } else {
        const errBody = await response.text()
        console.error('[M-JARVIS] OpenRouter error:', response.status, errBody)
      }
    } catch (err) {
      console.error('[M-JARVIS] OpenRouter call failed:', err.message)
    }
  }

  // 5. Static config-based fallbacks
  if (configData) {
    if (lowerMsg.includes('project') || lowerMsg.includes('portfolio') || lowerMsg.includes('work')) {
      const topProjects = (configData.projects || []).slice(0, 3).map(p => `• *${p.title}*: ${p.description}`).join('\n')
      return `Mohammed has built several outstanding systems. Here are a few recent ones:\n\n${topProjects || '• M-AbbasLab Platform'}\n\nExplore them all at: *m-abbaslab.vercel.app* 🚀`
    }
    if (lowerMsg.includes('model') || lowerMsg.includes('fashion') || lowerMsg.includes('title')) {
      const titlesList = (configData.fashion?.titles || []).slice(0, 3).map(t => `• *${t.title}* (${t.year})`).join('\n')
      return `Mohammed is a crowned commercial and pageantry model in Kenya. His achievements include:\n\n${titlesList || '• Mr. Glam Haven\n• Mr. YYMH'}\n\nHe merges fashion with analytics to build the future of modeling! 👑`
    }
    if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone')) {
      return `You can connect with Mohammed directly at:\n✉️ Email: ${configData.email || 'mohammedabbasofficial100@gmail.com'}\n📞 Phone/WhatsApp: +254 702 894 309\n🌐 Web: *m-abbaslab.vercel.app*`
    }
  }

  // 6. Hardcoded keyword fallbacks
  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('salam') || lowerMsg.includes('habari')) {
    return `Hello ${senderName}! 👋 This is M-JARVIS, Mohammed's AI assistant. How can I help you today?`
  }
  if (lowerMsg.includes('who are you') || lowerMsg.includes('are you a bot') || lowerMsg.includes('are you ai')) {
    return `I'm M-JARVIS — Mohammed Abbas's intelligent personal assistant. I handle his WhatsApp while he's working. How can I assist you?`
  }
  if (lowerMsg.includes('mohammed') || lowerMsg.includes('boss') || lowerMsg.includes('director')) {
    return `Mohammed Abbas is a visionary economist, full-stack engineer, and founder of the Quantum Impact Syndicate. He's currently occupied but will personally respond to you soon.`
  }
  if (lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('appreciate') || lowerMsg.includes('asante')) {
    return `You're most welcome! 🙏 Is there anything else I can assist you with?`
  }

  // 7. Final default
  return `Thank you for reaching out to Mohammed! 👋 I've logged your message and he will respond personally. In the meantime, visit *m-abbaslab.vercel.app* to explore his work.`
}

// ─── Log message to Supabase ──────────────────────────────────────────────────
async function logMessageToSupabase(sender, senderName, message, reply) {
  if (!supabase) {
    console.log('[Supabase] Not configured — skipping message log.')
    return
  }
  try {
    await supabase.from('whatsapp_messages').insert([{
      sender_number: sender,
      sender_name: senderName || 'Unknown',
      message_text: message,
      jarvis_reply: reply,
      timestamp: new Date().toISOString(),
      is_read: false
    }])
    console.log(`[Supabase] ✅ Logged message from ${senderName}`)
  } catch (err) {
    console.error('[Supabase] Failed to log message:', err.message)
  }
}

// ─── Log manual reply from Mohammed's own phone ──────────────────────────────
async function logManualReplyToSupabase(recipientJid, recipientName, replyText) {
  if (!supabase) return
  try {
    await supabase.from('whatsapp_messages').insert([{
      sender_number: recipientJid,
      sender_name: recipientName || 'Contact',
      message_text: '[Manual Reply]',
      jarvis_reply: replyText,
      timestamp: new Date().toISOString(),
      is_read: true
    }])
    console.log(`[Supabase] ✅ Logged Mohammed's manual reply to ${recipientJid}`)
  } catch (err) {
    console.error('[Supabase] Failed to log manual reply:', err.message)
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
    console.log(`[M-JARVIS] Requesting pairing code for: ${phoneNumber}...`)
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
      const sender = msg.key.remoteJid
      const isGroup = sender?.endsWith('@g.us')

      // Handle messages sent FROM Mohammed's own phone (manual replies)
      if (msg.key.fromMe) {
        // Skip if this was a bot auto-reply we just sent
        const msgId = msg.key.id
        if (sentBotReplies.has(msgId)) {
          sentBotReplies.delete(msgId)
          continue
        }

        // It's a real manual reply Mohammed typed himself
        const replyText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          ''

        if (replyText && sender && !isGroup) {
          const recipientName = msg.pushName || sender.split('@')[0]
          console.log(`\n[M-JARVIS] 📝 Manual reply by Mohammed to ${sender}: "${replyText}"`)
          await logManualReplyToSupabase(sender, recipientName, replyText)
        }
        continue
      }

      // Only respond to direct messages (not groups) by default
      if (isGroup && !process.env.RESPOND_TO_GROUPS) continue

      const messageText =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        ''

      if (!messageText) continue

      const senderName = msg.pushName || sender.split('@')[0]
      console.log(`\n[M-JARVIS] 📩 Message from ${senderName} (${sender}): "${messageText}"`)

      // Get JARVIS AI response (returns null if outside schedule window)
      const reply = await getJarvisResponse(senderName, messageText, sender)

      if (reply === null) {
        console.log('[M-JARVIS] ⏰ Schedule block — no reply sent.')
        continue
      }

      // Send Reply and track the message ID to prevent it from being logged as manual reply
      try {
        const sentMsg = await sock.sendMessage(sender, { text: reply }, { quoted: msg })
        if (sentMsg?.key?.id) {
          sentBotReplies.add(sentMsg.key.id)
          // Auto-cleanup from set after 30s
          setTimeout(() => sentBotReplies.delete(sentMsg.key.id), 30000)
        }
        console.log(`[M-JARVIS] ✅ Replied to ${senderName}: "${reply.substring(0, 80)}..."`)
      } catch (sendErr) {
        console.error('[M-JARVIS] Failed to send reply:', sendErr.message)
      }

      // Log to Supabase
      await logMessageToSupabase(sender, senderName, messageText, reply)
    }
  })
}

startJarvis().catch(console.error)

// ─── Health Check Server (prevents boot timeouts on Render etc.) ─────────────
const http = require('http')
const PORT = process.env.PORT || 3000
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'online',
    service: 'M-JARVIS WhatsApp Engine',
    timestamp: new Date().toISOString()
  }))
})

server.listen(PORT, () => {
  console.log(`[M-JARVIS] 🌐 Health check server listening on port ${PORT}`)
})
