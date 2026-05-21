require('dotenv').config()

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, delay } = require('@whiskeysockets/baileys')
const { createClient } = require('@supabase/supabase-js')
const pino = require('pino')
const fs = require('fs')
const path = require('path')
const http = require('http')

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY)
const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null

const PORT = Number(process.env.PORT || 3000)
const LOCAL_CONFIG_PATH = path.join(__dirname, '..', 'data', 'personal.json')
const AUTH_DIR = path.join(__dirname, 'auth_state')
const AUTH_BACKUP_DIR = path.join(__dirname, 'auth_backup')
const STATUS_ROW_ID = 'primary'
const PHONE_NUMBER = (process.env.PHONE_NUMBER || '254702894309').replace(/[^0-9]/g, '')
const RECONNECT_DELAY = 5000 // 5 seconds

let sock = null
let reconnectTimer = null
let healthInterval = null
let reconnectAttempts = 0
let isConnected = false
let isStarting = false
let connectionState = 'initializing'
let lastConnectedAt = null
let lastDisconnectedAt = null
let lastError = null
let latestPairingCode = null
let pairingCodeRequestTime = null

const sentBotReplies = new Set()

function loadLocalConfig() {
  try {
    if (fs.existsSync(LOCAL_CONFIG_PATH)) {
      const raw = fs.readFileSync(LOCAL_CONFIG_PATH, 'utf8')
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('[M-JARVIS] Local config file error:', e.message)
  }
  return null
}

async function ensureDir(targetPath) {
  if (!fs.existsSync(targetPath)) {
    await fs.promises.mkdir(targetPath, { recursive: true })
  }
}

async function clearDir(targetPath) {
  if (fs.existsSync(targetPath)) {
    await fs.promises.rm(targetPath, { recursive: true, force: true })
  }
  await ensureDir(targetPath)
}

async function copyDir(sourcePath, targetPath) {
  await ensureDir(targetPath)
  const entries = await fs.promises.readdir(sourcePath, { withFileTypes: true })
  for (const entry of entries) {
    const src = path.join(sourcePath, entry.name)
    const dest = path.join(targetPath, entry.name)
    if (entry.isDirectory()) await copyDir(src, dest)
    else await fs.promises.copyFile(src, dest)
  }
}

async function backupAuth() {
  if (fs.existsSync(AUTH_DIR)) {
    console.log('[M-JARVIS] 💾 Backing up auth state...')
    await clearDir(AUTH_BACKUP_DIR)
    await copyDir(AUTH_DIR, AUTH_BACKUP_DIR)
    console.log('[M-JARVIS] ✅ Auth state backed up')
  }
}

async function restoreAuth() {
  if (fs.existsSync(AUTH_BACKUP_DIR)) {
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
        pairing_code: latestPairingCode,
        updated_at: new Date().toISOString()
      })
    } catch (e) {
      console.error('[M-JARVIS] Supabase update failed:', e.message)
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
      console.error('[M-JARVIS] Message logging failed:', e.message)
    }
  }
}

async function getJarvisResponse(senderName, messageText, sender) {
  const lowerMsg = messageText.toLowerCase()
  let trainedRules = []
  let configData = loadLocalConfig()
  
  if (hasSupabase) {
    try {
      const { data } = await supabase.from('site_config').select('config_data').eq('id', 1).single()
      if (data?.config_data) {
        trainedRules = data.config_data.jarvisTraining || []
      }
    } catch (e) {}
  }

  if (trainedRules.length === 0 && configData) {
    trainedRules = configData.jarvisTraining || []
  }

  for (const rule of trainedRules) {
    if (rule.keyword && lowerMsg.includes(rule.keyword.toLowerCase())) {
      return rule.response
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: "You are M-JARVIS, Mohammed Abbas's assistant. Be professional and concise." },
            { role: 'user', content: `From ${senderName}: ${messageText}` }
          ]
        })
      })
      if (response.ok) {
        const data = await response.json()
        return data.choices?.[0]?.message?.content?.trim()
      }
    } catch (e) {}
  }

  return "Mohammed is currently busy, but I've logged your message! Visit m-abbaslab.vercel.app for more."
}

async function startJarvis() {
  if (isStarting) return
  isStarting = true
  
  console.log(`\n[M-JARVIS] 🚀 Starting Engine for ${PHONE_NUMBER}...`)
  
  try {
    await ensureDir(AUTH_DIR)
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Ubuntu', 'Chrome', '110.0.5481.178'] // More standard browser string
    })

    // Pairing Code Logic
    if (!sock.authState.creds.registered) {
      console.log('[M-JARVIS] 📱 Requesting pairing code...')
      await delay(5000) // Wait for socket to stabilize
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER)
        latestPairingCode = code?.match(/.{1,4}/g)?.join('-') || code
        pairingCodeRequestTime = Date.now()
        
        console.log('\n' + '='.repeat(40))
        console.log(`🔑 PAIRING CODE: ${latestPairingCode}`)
        console.log('='.repeat(40) + '\n')
        
        await updateStatus({ pairingCode: latestPairingCode, connectionState: 'waiting_for_pairing' })
      } catch (err) {
        console.error('[M-JARVIS] ❌ Pairing request failed:', err.message)
      }
    }

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut
        
        isConnected = false
        connectionState = shouldReconnect ? 'reconnecting' : 'logged_out'
        lastDisconnectedAt = new Date().toISOString()
        lastError = lastDisconnect?.error?.message || 'Disconnected'
        
        console.log(`[M-JARVIS] ❌ Connection closed (${statusCode}). Reconnecting: ${shouldReconnect}`)
        
        if (!shouldReconnect) {
          await clearDir(AUTH_DIR)
          await clearDir(AUTH_BACKUP_DIR)
        }

        setTimeout(() => {
          isStarting = false
          startJarvis()
        }, RECONNECT_DELAY)
        
        await updateStatus({ isConnected, connectionState, lastDisconnectedAt, lastError })
      }

      if (connection === 'open') {
        isConnected = true
        isStarting = false
        reconnectAttempts = 0
        connectionState = 'connected'
        lastConnectedAt = new Date().toISOString()
        latestPairingCode = null
        
        console.log('\n✅ [M-JARVIS] CONNECTED!')
        await backupAuth()
        await updateStatus({ isConnected, connectionState, lastConnectedAt, pairingCode: null })
      }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return
      for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue
        const sender = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const name = msg.pushName || 'User'

        if (text) {
          const reply = await getJarvisResponse(name, text, sender)
          await sock.sendMessage(sender, { text: reply }, { quoted: msg })
          await logMessage(sender, name, text, reply)
        }
      }
    })

  } catch (e) {
    console.error('[M-JARVIS] ❌ Startup error:', e.message)
    isStarting = false
    setTimeout(startJarvis, 10000)
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ status: connectionState, isConnected, pairingCode: latestPairingCode }))
})

server.listen(PORT, () => {
  console.log(`[M-JARVIS] 🌐 Server on port ${PORT}`)
  startJarvis()
})
