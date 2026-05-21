require('dotenv').config()

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
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
const PHONE_NUMBER = process.env.PHONE_NUMBER || '254702894309'
const PAIRING_CODE_TIMEOUT = 120000 // 2 minutes to enter code
const RECONNECT_DELAY = 3000 // 3 seconds

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

async function requestPairingCode() {
  if (!sock) {
    console.log('[M-JARVIS] ⚠️ Socket not ready for pairing code request')
    return
  }

  try {
    console.log('[M-JARVIS] 📱 Requesting pairing code for: ' + PHONE_NUMBER)
    pairingCodeRequestTime = Date.now()
    
    const code = await sock.requestPairingCode(PHONE_NUMBER)
    latestPairingCode = code?.match(/.{1,4}/g)?.join('-') || code
    
    console.log('\n' + '='.repeat(60))
    console.log('🔑 [M-JARVIS] YOUR PAIRING CODE IS: ' + latestPairingCode)
    console.log('⏱️  Code valid for 2 minutes. Enter it on your phone now!')
    console.log('='.repeat(60) + '\n')
    
    await updateStatus({ pairingCode: latestPairingCode, connectionState: 'waiting_for_pairing' })
  } catch (e) {
    console.error('[M-JARVIS] ❌ Failed to request pairing code:', e.message)
    lastError = e.message
    await updateStatus({ lastError })
  }
}

async function startJarvis() {
  if (isStarting) {
    console.log('[M-JARVIS] ⚠️ Already starting, skipping...')
    return
  }
  
  isStarting = true
  console.log('\n[M-JARVIS] 🚀 Starting WhatsApp Engine (Pairing Code Mode)...')
  
  try {
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

    sock.ev.on('creds.update', async () => {
      await saveCreds()
      await backupAuth()
    })

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut
        
        isConnected = false
        lastDisconnectedAt = new Date().toISOString()
        lastError = lastDisconnect?.error?.message || 'Disconnected'
        
        console.log('[M-JARVIS] ❌ Disconnected. Code: ' + statusCode + '. Reconnecting: ' + shouldReconnect)
        
        if (shouldReconnect) {
          connectionState = 'reconnecting'
          reconnectAttempts++
          
          if (reconnectAttempts === 2) {
            console.log('[M-JARVIS] 🔄 Attempting to restore from backup...')
            await restoreAuth()
          }

          const delay = Math.min(RECONNECT_DELAY * reconnectAttempts, 30000)
          console.log('[M-JARVIS] ⏳ Reconnecting in ' + (delay / 1000) + ' seconds...')
          
          reconnectTimer = setTimeout(() => {
            isStarting = false
            startJarvis()
          }, delay)
        } else {
          connectionState = 'logged_out'
          console.log('[M-JARVIS] 🚪 Hard logout detected. Clearing session for fresh start...')
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
        latestPairingCode = null
        
        console.log('\n' + '='.repeat(60))
        console.log('✅ [M-JARVIS] CONNECTED TO WHATSAPP!')
        console.log('🟢 Bot is online and listening for messages')
        console.log('='.repeat(60) + '\n')
        
        await backupAuth()
        await updateStatus({ isConnected, connectionState, lastConnectedAt, pairingCode: null })
      }

      if (connection === 'open' && !sock.authState.creds.registered) {
        setTimeout(() => {
          requestPairingCode()
        }, 1000)
      }
    })

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return

      for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue
        
        const sender = msg.key.remoteJid
        const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const senderName = msg.pushName || 'User'

        if (messageText) {
          console.log('[M-JARVIS] 📩 Message from ' + senderName + ': ' + messageText)
          const reply = await getJarvisResponse(senderName, messageText, sender)
          
          if (reply) {
            await sock.sendMessage(sender, { text: reply }, { quoted: msg })
            await logMessage(sender, senderName, messageText, reply)
            console.log('[M-JARVIS] ✅ Replied to ' + senderName)
          }
        }
      }
    })

    setTimeout(() => {
      if (sock && !sock.authState.creds.registered) {
        requestPairingCode()
      }
    }, 5000)

  } catch (e) {
    console.error('[M-JARVIS] ❌ Fatal error:', e.message)
    lastError = e.message
    await updateStatus({ lastError, connectionState: 'error' })
    isStarting = false
    
    setTimeout(() => {
      startJarvis()
    }, 5000)
  }
}

function startHealthCheck() {
  if (healthInterval) clearInterval(healthInterval)
  healthInterval = setInterval(async () => {
    if (isConnected && sock) {
      try {
        await sock.fetchBlocklist()
      } catch (e) {
        console.warn('[M-JARVIS] Health check failed')
      }
    }
  }, 30000)
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: connectionState,
    isConnected,
    lastConnectedAt,
    lastDisconnectedAt,
    reconnectAttempts,
    pairingCode: latestPairingCode,
    pairingCodeAge: pairingCodeRequestTime ? Date.now() - pairingCodeRequestTime : null
  }))
})

server.listen(PORT, () => {
  console.log('[M-JARVIS] 🌐 Health check server on port ' + PORT)
  startJarvis()
  startHealthCheck()
})

process.on('SIGINT', () => {
  console.log('[M-JARVIS] Shutting down...')
  process.exit(0)
})
