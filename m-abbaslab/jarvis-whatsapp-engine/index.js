require('dotenv').config()

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const qrcode = require('qrcode-terminal')
const pino = require('pino')
const fs = require('fs')
const path = require('path')
const http = require('http')
const GroupMonitor = require('./group-monitor')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY)
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

const PORT = Number(process.env.PORT || 3000)
const LOCAL_CONFIG_PATH = path.join(__dirname, '..', 'data', 'personal.json')
const AUTH_DIR = path.join(__dirname, 'auth_state')
const AUTH_BACKUP_DIR = path.join(__dirname, 'auth_backup')
const STATUS_ROW_ID = 'primary'
const MAX_RECONNECT_ATTEMPTS = Number(process.env.MAX_RECONNECT_ATTEMPTS || 5)
const HEALTH_CHECK_INTERVAL = Number(process.env.HEALTH_CHECK_INTERVAL || 30000)

let sock = null
let groupMonitor = null
let reconnectTimer = null
let healthInterval = null
let reconnectAttempts = 0
let isConnected = false
let isStarting = false
let connectionState = 'initializing'
let lastConnectedAt = null
let lastDisconnectedAt = null
let lastError = null
let latestQr = null
let latestPairingCode = null

const sentBotReplies = new Set()

function loadLocalConfig() {
  try {
    const raw = fs.readFileSync(LOCAL_CONFIG_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    console.warn('[M-JARVIS] Local config file not found or invalid:', e.message)
    return null
  }
}

function exists(targetPath) {
  return fs.existsSync(targetPath)
}

async function ensureDir(targetPath) {
  await fs.promises.mkdir(targetPath, { recursive: true })
}

async function clearDir(targetPath) {
  await fs.promises.rm(targetPath, { recursive: true, force: true })
  await ensureDir(targetPath)
}

async function copyDir(sourcePath, targetPath) {
  await ensureDir(targetPath)
  const entries = await fs.promises.readdir(sourcePath, { withFileTypes: true })

  for (const entry of entries) {
    const sourceEntryPath = path.join(sourcePath, entry.name)
    const targetEntryPath = path.join(targetPath, entry.name)

    if (entry.isDirectory()) {
      await copyDir(sourceEntryPath, targetEntryPath)
    } else {
      await ensureDir(path.dirname(targetEntryPath))
      await fs.promises.copyFile(sourceEntryPath, targetEntryPath)
    }
  }
}

async function backupAuthState() {
  if (!exists(AUTH_DIR)) return false

  try {
    await clearDir(AUTH_BACKUP_DIR)
    await copyDir(AUTH_DIR, AUTH_BACKUP_DIR)
    console.log('[M-JARVIS] Auth state backup refreshed.')
    return true
  } catch (error) {
    console.error('[M-JARVIS] Failed to back up auth state:', error.message)
    return false
  }
}

async function restoreAuthStateFromBackup() {
  if (!exists(AUTH_BACKUP_DIR)) {
    console.warn('[M-JARVIS] No auth backup available to restore.')
    return false
  }

  try {
    await clearDir(AUTH_DIR)
    await copyDir(AUTH_BACKUP_DIR, AUTH_DIR)
    console.log('[M-JARVIS] Auth state restored from backup.')
    return true
  } catch (error) {
    console.error('[M-JARVIS] Failed to restore auth state backup:', error.message)
    return false
  }
}

function buildStatusPayload(overrides = {}) {
  return {
    id: STATUS_ROW_ID,
    status: isConnected ? 'online' : connectionState,
    service: 'M-JARVIS WhatsApp Engine',
    is_connected: isConnected,
    connection_state: connectionState,
    reconnect_attempts: reconnectAttempts,
    last_connected_at: lastConnectedAt,
    last_disconnected_at: lastDisconnectedAt,
    last_error: lastError,
    engine_url: process.env.JARVIS_ENGINE_URL || null,
    metadata: {
      latestQrAvailable: Boolean(latestQr),
      latestPairingCodeAvailable: Boolean(latestPairingCode),
      qrCode: latestQr || null,
      pairingCode: latestPairingCode || null
    },
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

async function pushConnectionStatus(overrides = {}) {
  if (!supabase) return

  try {
    await supabase.from('whatsapp_connection_status').upsert(buildStatusPayload(overrides))
  } catch (error) {
    console.error('[M-JARVIS] Failed to push connection status:', error.message)
  }
}

function isChatbotAllowedNow(schedule) {
  if (!schedule || schedule.type === 'always') return true
  if (schedule.type === 'disabled') return false

  const tz = schedule.timezone || 'Africa/Nairobi'
  const now = new Date()
  const timeStr = now.toLocaleTimeString('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
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
    return data.reverse()
  } catch (e) {
    console.warn('[M-JARVIS] Could not fetch chat history:', e.message)
    return []
  }
}

async function getJarvisResponse(senderName, messageText, sender) {
  const lowerMsg = messageText.toLowerCase()
  let trainedRules = []
  let configData = null
  let chatbotSchedule = null

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

  if (!configData) {
    const localConfig = loadLocalConfig()
    if (localConfig) {
      configData = localConfig
      trainedRules = localConfig.jarvisTraining || []
      chatbotSchedule = localConfig.whatsappBotSchedule || null
      console.log('[M-JARVIS] Using local config fallback.')
    }
  }

  if (!isChatbotAllowedNow(chatbotSchedule)) {
    console.log('[M-JARVIS] Bot is outside its active schedule window. Skipping reply.')
    return null
  }

  for (const rule of trainedRules) {
    if (rule.keyword && lowerMsg.includes(rule.keyword.toLowerCase())) {
      console.log(`[M-JARVIS] Matched trained rule: "${rule.keyword}"`)
      return rule.response
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    console.log('[M-JARVIS] OpenRouter AI active. Building context-aware response...')

    try {
      const history = await getChatHistory(sender)
      const conversationMessages = []

      for (const row of history.slice(-6)) {
        if (row.message_text && !row.message_text.startsWith('[Manual Reply]')) {
          conversationMessages.push({ role: 'user', content: row.message_text })
          if (row.jarvis_reply) {
            conversationMessages.push({ role: 'assistant', content: row.jarvis_reply })
          }
        } else if (row.message_text && row.message_text.startsWith('[Manual Reply]') && row.jarvis_reply) {
          conversationMessages.push({
            role: 'assistant',
            content: `[Mohammed's personal reply]: ${row.jarvis_reply}`,
          })
        }
      }

      conversationMessages.push({ role: 'user', content: messageText })

      const dynamicSystemPrompt = `You are M-JARVIS, a highly capable and intelligent personal assistant for Mohammed Abbas.
Mohammed Abbas is an Economist, Statistician, Data Scientist, Full-Stack Software Engineer, and commercial fashion model based in Kenya.
Your replies should mirror Mohammed's professional yet approachable communication style. Be concise (2-4 sentences max), helpful, and slightly futuristic.

Mohammed's profile:
- Email: ${configData?.email || 'mohammedabbasofficial100@gmail.com'}
- Brand: ${configData?.brandName || 'M-AbbasLab'}
- Roles: ${JSON.stringify(configData?.roles || ['Economist', 'Engineer', 'Data Scientist'])}
- Projects: ${JSON.stringify((configData?.projects || []).slice(0, 4).map((p) => ({ title: p.title, description: p.description, status: p.status })))}
- Modeling Titles: ${JSON.stringify((configData?.fashion?.titles || []).slice(0, 3).map((t) => ({ title: t.title, year: t.year })))}
- Contact: Email ${configData?.email || 'mohammedabbasofficial100@gmail.com'}, WhatsApp: +254702894309, Web: m-abbaslab.vercel.app

IMPORTANT: You are conversing with ${senderName}. Study the conversation history above (especially any [Mohammed's personal reply] entries) to match his tone and style closely. Respond ONLY to the latest message.`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://m-abbaslab.vercel.app',
          'X-Title': 'M-AbbasLab Jarvis WhatsApp',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free',
          messages: [
            { role: 'system', content: dynamicSystemPrompt },
            ...conversationMessages,
          ],
          temperature: 0.7,
          max_tokens: 512,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()
        const reply = responseData.choices?.[0]?.message?.content?.trim() || ''
        if (reply) {
          console.log('[M-JARVIS] OpenRouter response received.')
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

  if (configData) {
    if (lowerMsg.includes('project') || lowerMsg.includes('portfolio') || lowerMsg.includes('work')) {
      const topProjects = (configData.projects || [])
        .slice(0, 3)
        .map((p) => `• *${p.title}*: ${p.description}`)
        .join('\n')
      return `Mohammed has built several outstanding systems. Here are a few recent ones:\n\n${topProjects || '• M-AbbasLab Platform'}\n\nExplore them all at: *m-abbaslab.vercel.app*`
    }

    if (lowerMsg.includes('model') || lowerMsg.includes('fashion') || lowerMsg.includes('title')) {
      const titlesList = (configData.fashion?.titles || [])
        .slice(0, 3)
        .map((t) => `• *${t.title}* (${t.year})`)
        .join('\n')
      return `Mohammed is a crowned commercial and pageantry model in Kenya. His achievements include:\n\n${titlesList || '• Mr. Glam Haven\n• Mr. YYMH'}`
    }

    if (lowerMsg.includes('contact') || lowerMsg.includes('email') || lowerMsg.includes('phone')) {
      return `You can connect with Mohammed directly at:\nEmail: ${configData.email || 'mohammedabbasofficial100@gmail.com'}\nPhone/WhatsApp: +254 702 894 309\nWeb: *m-abbaslab.vercel.app*`
    }
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey') || lowerMsg.includes('salam') || lowerMsg.includes('habari')) {
    return `Hello ${senderName}. This is M-JARVIS, Mohammed's AI assistant. How can I help you today?`
  }
  if (lowerMsg.includes('who are you') || lowerMsg.includes('are you a bot') || lowerMsg.includes('are you ai')) {
    return `I'm M-JARVIS, Mohammed Abbas's intelligent personal assistant. I handle his WhatsApp while he's working. How can I assist you?`
  }
  if (lowerMsg.includes('mohammed') || lowerMsg.includes('boss') || lowerMsg.includes('director')) {
    return `Mohammed Abbas is a visionary economist, full-stack engineer, and founder of the Quantum Impact Syndicate. He's currently occupied but will personally respond to you soon.`
  }
  if (lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('appreciate') || lowerMsg.includes('asante')) {
    return `You're most welcome. Is there anything else I can assist you with?`
  }

  return `Thank you for reaching out to Mohammed. I've logged your message and he will respond personally. In the meantime, visit *m-abbaslab.vercel.app* to explore his work.`
}

async function logMessageToSupabase(sender, senderName, message, reply) {
  if (!supabase) {
    console.log('[Supabase] Not configured. Skipping message log.')
    return
  }

  try {
    await supabase.from('whatsapp_messages').insert([{
      sender_number: sender,
      sender_name: senderName || 'Unknown',
      message_text: message,
      jarvis_reply: reply,
      message_type: 'text',
      direction: 'incoming',
      metadata: {},
      timestamp: new Date().toISOString(),
      is_read: false,
    }])
    console.log(`[Supabase] Logged message from ${senderName}`)
  } catch (err) {
    console.error('[Supabase] Failed to log message:', err.message)
  }
}

async function logManualReplyToSupabase(recipientJid, recipientName, replyText) {
  if (!supabase) return

  try {
    await supabase.from('whatsapp_messages').insert([{
      sender_number: recipientJid,
      sender_name: recipientName || 'Contact',
      message_text: '[Manual Reply]',
      jarvis_reply: replyText,
      message_type: 'text',
      direction: 'outgoing',
      metadata: {},
      timestamp: new Date().toISOString(),
      is_read: true,
    }])
    console.log(`[Supabase] Logged Mohammed's manual reply to ${recipientJid}`)
  } catch (err) {
    console.error('[Supabase] Failed to log manual reply:', err.message)
  }
}

async function logJarvisInteraction(sender, senderName, messageText, reply) {
  if (!supabase) return

  try {
    await supabase.from('jarvis_interactions').insert([{
      sender_number: sender,
      sender_name: senderName || 'Unknown',
      user_message: messageText,
      ai_reply: reply,
      provider: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'fallback',
      timestamp: new Date().toISOString(),
    }])
  } catch (err) {
    console.error('[Supabase] Failed to log interaction:', err.message)
  }
}

function resetRealtimeState() {
  isConnected = false
  latestQr = null
  latestPairingCode = null
}

function scheduleReconnect(reason, options = { restoreBackup: false }) {
  if (reconnectTimer) return

  console.log(`[M-JARVIS] Reconnect scheduled in ${RECONNECT_DELAY / 1000}s. Reason: ${reason}`)
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null
    if (options.restoreBackup) {
      await restoreAuthStateFromBackup()
    }
    startJarvis().catch((e) => console.error('[M-JARVIS] Reconnect start error:', e.message))
  }, RECONNECT_DELAY)
}

async function startJarvis() {
  if (isStarting) return
  isStarting = true
  connectionState = 'connecting'

  try {
    console.log('[M-JARVIS] Starting WhatsApp Engine...')
    await ensureDir(AUTH_DIR)

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
    const configData = loadLocalConfig()

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: ['M-JARVIS', 'Safari', '1.0'],
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        latestQr = qr
        console.log('[M-JARVIS] New QR Code generated.')
        await pushConnectionStatus({ status: 'awaiting_login' })
      }

      if (connection === 'connecting') {
        connectionState = 'connecting'
        await pushConnectionStatus()
      }

      if (connection === 'open') {
        isConnected = true
        connectionState = 'connected'
        reconnectAttempts = 0
        lastConnectedAt = new Date().toISOString()
        lastError = null
        latestQr = null
        latestPairingCode = null

        console.log('\n[M-JARVIS] Connected to WhatsApp. Bot is online and listening.\n')
        
        // Initialize group and status monitoring
        groupMonitor = new GroupMonitor(sock, supabase, configData)
        groupMonitor.initializeGroupMonitoring().catch(err => console.error('[M-JARVIS] Group monitor init error:', err))
        groupMonitor.initializeStatusMonitoring().catch(err => console.error('[M-JARVIS] Status monitor init error:', err))

        await backupAuthState()
        await pushConnectionStatus({ status: 'online' })
      }

      if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = code !== DisconnectReason.loggedOut

        resetRealtimeState()
        connectionState = shouldReconnect ? 'disconnected' : 'logged_out'
        lastDisconnectedAt = new Date().toISOString()
        lastError = `disconnect_code_${code || 'unknown'}`

        console.log(`[M-JARVIS] Disconnected. Code: ${code}. Reconnecting: ${shouldReconnect}`)
        await pushConnectionStatus()

        if (shouldReconnect) {
          scheduleReconnect(lastError)
        } else {
          const restored = await restoreAuthStateFromBackup()
          if (restored) {
            scheduleReconnect('logged_out_restore', { restoreBackup: false })
          }
        }
      }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return

      for (const msg of messages) {
        const sender = msg.key.remoteJid
        const isGroup = sender?.endsWith('@g.us')
        const isStatus = sender === 'status@broadcast'

        if (isStatus) {
          if (groupMonitor) {
            groupMonitor.handleStatusUpdate(msg)
          }
          continue
        }

        if (msg.key.fromMe) {
          const msgId = msg.key.id
          if (sentBotReplies.has(msgId)) {
            sentBotReplies.delete(msgId)
            continue
          }

          const replyText =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            ''

          if (replyText && sender && !isGroup) {
            const recipientName = msg.pushName || sender.split('@')[0]
            console.log(`\n[M-JARVIS] Manual reply by Mohammed to ${sender}: "${replyText}"`)
            await logManualReplyToSupabase(sender, recipientName, replyText)
          }
          continue
        }

        const messageText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          ''

        if (!messageText) continue

        const senderName = msg.pushName || sender.split('@')[0]

        if (isGroup) {
          if (groupMonitor) {
            await groupMonitor.handleGroupMessage(msg, sender, messageText, senderName)
          }
          continue
        }

        console.log(`\n[M-JARVIS] Message from ${senderName} (${sender}): "${messageText}"`)

        const reply = await getJarvisResponse(senderName, messageText, sender)
        if (reply === null) {
          console.log('[M-JARVIS] Schedule block. No reply sent.')
          continue
        }

        try {
          const sentMsg = await sock.sendMessage(sender, { text: reply }, { quoted: msg })
          if (sentMsg?.key?.id) {
            sentBotReplies.add(sentMsg.key.id)
            setTimeout(() => sentBotReplies.delete(sentMsg.key.id), 30000)
          }
          console.log(`[M-JARVIS] Replied to ${senderName}: "${reply.substring(0, 80)}..."`)
        } catch (sendErr) {
          console.error('[M-JARVIS] Failed to send reply:', sendErr.message)
        }

        await logMessageToSupabase(sender, senderName, messageText, reply)
        await logJarvisInteraction(sender, senderName, messageText, reply)
      }
    })
  } catch (error) {
    resetRealtimeState()
    connectionState = 'error'
    lastDisconnectedAt = new Date().toISOString()
    lastError = error.message
    console.error('[M-JARVIS] Engine startup failed:', error.message)
    await pushConnectionStatus()
    scheduleReconnect(error.message, { restoreBackup: reconnectAttempts >= MAX_RECONNECT_ATTEMPTS })
  } finally {
    isStarting = false
  }
}

async function triggerManualReconnect() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  reconnectAttempts = 0
  isConnected = false
  connectionState = 'reconnecting'
  lastError = 'manual_reconnect_requested'
  await pushConnectionStatus()

  try {
    if (sock?.ws?.close) {
      sock.ws.close()
    }
  } catch (error) {
    console.warn('[M-JARVIS] Manual socket close warning:', error.message)
  }

  sock = null
  setTimeout(() => {
    startJarvis().catch((error) => console.error('[M-JARVIS] Manual reconnect failed:', error.message))
  }, 1000)
}

function startHealthLoop() {
  if (healthInterval) clearInterval(healthInterval)

  healthInterval = setInterval(async () => {
    if (isConnected) {
      await backupAuthState()
    }

    await pushConnectionStatus()

    if (!isConnected && !reconnectTimer && !isStarting) {
      scheduleReconnect('health_check')
    }
  }, HEALTH_CHECK_INTERVAL)
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/reconnect') {
    await triggerManualReconnect()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      success: true,
      status: 'reconnecting',
      timestamp: new Date().toISOString(),
    }))
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: isConnected ? 'online' : connectionState === 'reconnecting' ? 'reconnecting' : 'degraded',
    service: 'M-JARVIS WhatsApp Engine',
    timestamp: new Date().toISOString(),
    isConnected,
    connectionState,
    reconnectAttempts,
    lastConnectedAt,
    lastDisconnectedAt,
    lastError,
  }))
})

server.listen(PORT, () => {
  console.log(`[M-JARVIS] Health check server listening on port ${PORT}`)
})

startHealthLoop()
startJarvis().catch((error) => {
  console.error('[M-JARVIS] Fatal startup error:', error.message)
})
