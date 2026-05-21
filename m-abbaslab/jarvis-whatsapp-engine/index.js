require('dotenv').config()

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
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
const RECONNECT_DELAY = 5000 // 5 seconds

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
      await fs.promises.copyFile(sourceEntryPath, targetEntryPath)
    }
  }
}

async function backupAuth() {
  if (await exists(AUTH_DIR)) {
    console.log('[M-JARVIS] 💾 Backing up auth state...')
    await clearDir(AUTH_BACKUP_DIR)
    await copyDir(AUTH_DIR, AUTH_BACKUP_DIR)
    console.log('[M-JARVIS] ✅ Auth state backed up')
  }
}

async function restoreAuth() {
  if (await exists(AUTH_BACKUP_DIR)) {
    console.log('[M-JARVIS] 🔄 Restoring auth state from backup...')
    await clearDir(AUTH_DIR)
    await copyDir(AUTH_BACKUP_DIR, AUTH_DIR)
    console.log('[M-JARVIS] ✅ Auth state restored')
    return true
  }
  return false
}

async function updateStatus(updates) {
  if (updates.connectionState) connectionState = updates.connectionState
  if (updates.isConnected !== undefined) isConnected = updates.isConnected
  if (updates.lastConnectedAt) lastConnectedAt = updates.lastConnectedAt
  if (updates.lastDisconnectedAt) lastDisconnectedAt = updates.lastDisconnectedAt
  if (updates.lastError !== undefined) lastError = updates.lastError
  if (updates.qr !== undefined) latestQr = updates.qr
  if (updates.pairingCode !== undefined) latestPairingCode = updates.pairingCode

  if (hasSupabase) {
    try {
      await supabase.from('whatsapp_connection_status').upsert({
        id: STATUS_ROW_ID,
        status: connectionState,
        is_connected: isConnected,
        last_connected_at: lastConnectedAt,
        last_disconnected_at: lastDisconnectedAt,
        last_error: lastError ? String(lastError) : null,
        reconnect_attempts: reconnectAttempts,
        updated_at: new Date().toISOString()
      })
    } catch (e) {
      console.error('[M-JARVIS] Failed to update status in Supabase:', e.message)
    }
  }
}

async function logMessage(sender, senderName, text, reply) {
  if (hasSupabase) {
    try {
      await supabase.from('whatsapp_messages').insert({
        sender_number: sender,
        sender_name: senderName || 'Unknown',
        message_text: text,
        jarvis_reply: reply,
        is_read: false,
        timestamp: new Date().toISOString()
      })
    } catch (e) {
      console.error('[M-JARVIS] Failed to log message to Supabase:', e.message)
    }
  }
}

async function getJarvisResponse(senderName, messageText, sender) {
  const lowerMsg = messageText.toLowerCase()
  let trainedRules = []
  let configData = null

  if (hasSupabase) {
    try {
      const { data } = await supabase.from('site_config').select('config_data').eq('id', 1).single()
      if (data?.config_data) {
        configData = data.config_data
        trainedRules = data.config_data.jarvisTraining || []
      }
    } catch (e) {
      console.warn('[M-JARVIS] Failed to fetch config from Supabase:', e.message)
    }
  }

  if (!configData) {
    configData = loadLocalConfig()
    if (configData) trainedRules = configData.jarvisTraining || []
  }

  for (const rule of trainedRules) {
    if (rule.keyword && lowerMsg.includes(rule.keyword.toLowerCase())) {
      return rule.response
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const systemPrompt = "You are M-JARVIS, Mohammed Abbas's intelligent personal assistant. Mohammed is an Economist, Statistician, Data Scientist, and Software Engineer. Be professional, concise, and helpful. Mirror his style."
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': "Bearer " + process.env.OPENROUTER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Message from " + senderName + ": " + messageText }
          ]
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices?.[0]?.message?.content?.trim()
      }
    } catch (e) {
      console.error('[M-JARVIS] AI Response failed:', e.message)
    }
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return "Hello " + senderName + "! I'm M-JARVIS, Mohammed's assistant. How can I help?"
  }

  return "Thanks for your message! Mohammed will get back to you soon. Visit m-abbaslab.vercel.app for more."
}

async function startJarvis() {
  if (isStarting) return
  isStarting = true
  
  console.log('[M-JARVIS] Starting WhatsApp Engine...')
  await ensureDir(AUTH_DIR)
  
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }),
    browser: ['M-JARVIS', 'Chrome', '1.0.0']
  })

  groupMonitor = new GroupMonitor(sock, supabase)

  sock.ev.on('creds.update', async () => {
    await saveCreds()
    await backupAuth()
  })

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      latestQr = qr
      console.log('[M-JARVIS] New QR Code generated.')
      qrcode.generate(qr, { small: true })
      await updateStatus({ qr, connectionState: 'qr_ready' })
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      
      isConnected = false
      lastDisconnectedAt = new Date().toISOString()
      lastError = lastDisconnect?.error?.message || 'Disconnected'
      
      console.log("[M-JARVIS] Disconnected. Code: " + statusCode + ". Reconnecting: " + shouldReconnect)
      
      if (shouldReconnect) {
        connectionState = 'reconnecting'
        reconnectAttempts++
        
        if (reconnectAttempts === 2) {
          await restoreAuth()
        }

        const delay = Math.min(RECONNECT_DELAY * reconnectAttempts, 30000)
        reconnectTimer = setTimeout(() => {
          isStarting = false
          startJarvis()
        }, delay)
      } else {
        connectionState = 'logged_out'
        console.log('[M-JARVIS] 🚪 Hard logout. Clearing session for fresh login...')
        if (fs.existsSync(AUTH_DIR)) fs.rmSync(AUTH_DIR, { recursive: true, force: true })
        if (fs.existsSync(AUTH_BACKUP_DIR)) fs.rmSync(AUTH_BACKUP_DIR, { recursive: true, force: true })
        
        setTimeout(() => {
          isStarting = false
          startJarvis()
        }, 3000)
      }
      await updateStatus({ isConnected, connectionState, lastDisconnectedAt, lastError })
    }

    if (connection === 'open') {
      isConnected = true
      isStarting = false
      reconnectAttempts = 0
      connectionState = 'connected'
      lastConnectedAt = new Date().toISOString()
      latestQr = null
      latestPairingCode = null
      
      console.log('[M-JARVIS] ✅ Connected to WhatsApp!')
      await backupAuth()
      await updateStatus({ isConnected, connectionState, lastConnectedAt, qr: null, pairingCode: null })
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue
      
      const sender = msg.key.remoteJid
      const isGroup = sender.endsWith('@g.us')
      const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
      const senderName = msg.pushName || 'User'

      if (isGroup) {
        await groupMonitor.handleMessage(msg)
        continue
      }

      if (messageText) {
        console.log("[M-JARVIS] 📩 Message from " + senderName + ": " + messageText)
        const reply = await getJarvisResponse(senderName, messageText, sender)
        
        if (reply) {
          await sock.sendMessage(sender, { text: reply }, { quoted: msg })
          await logMessage(sender, senderName, messageText, reply)
          console.log("[M-JARVIS] ✅ Replied to " + senderName)
        }
      }
    }
  })

  if (process.env.PHONE_NUMBER && !sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER.replace(/[^0-9]/g, '')
    console.log("[M-JARVIS] Requesting pairing code for: " + phoneNumber + "...")
    
    setTimeout(async () => {
      try {
        if (sock && !sock.authState.creds.registered) {
          const code = await sock.requestPairingCode(phoneNumber)
          latestPairingCode = code?.match(/.{1,4}/g)?.join('-') || code
          console.log("\n🔑 [M-JARVIS] YOUR PAIRING CODE IS: " + latestPairingCode + "\n")
          await updateStatus({ pairingCode: latestPairingCode, connectionState: 'pairing_ready' })
        }
      } catch (e) {
        console.error('[M-JARVIS] Failed to request pairing code:', e.message)
      }
    }, 10000)
  }
}

function startHealthCheck() {
  if (healthInterval) clearInterval(healthInterval)
  healthInterval = setInterval(async () => {
    if (isConnected && sock) {
      try {
        await sock.fetchBlocklist()
      } catch (e) {
        console.warn('[M-JARVIS] Health check failed, connection might be stale')
      }
    }
  }, HEALTH_CHECK_INTERVAL)
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: connectionState,
    isConnected,
    lastConnectedAt,
    lastDisconnectedAt,
    reconnectAttempts,
    pairingCode: latestPairingCode
  }))
})

server.listen(PORT, () => {
  console.log("[M-JARVIS] 🌐 Health server on port " + PORT)
  startJarvis()
  startHealthCheck()
})
