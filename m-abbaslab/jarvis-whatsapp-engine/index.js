require('dotenv').config()

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys')

const { createClient } = require('@supabase/supabase-js')

const qrcode = require('qrcode-terminal')

const pino = require('pino')

const fs = require('fs')

const path = require('path')

const http = require('http')



// ─── Configuration ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL

const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY

const hasSupabase = !!(SUPABASE_URL && SUPABASE_KEY)

const supabase = hasSupabase ? createClient(SUPABASE_URL, SUPABASE_KEY) : null



const LOCAL_CONFIG_PATH = path.join(__dirname, '..', 'data', 'personal.json')

const AUTH_STATE_DIR = './auth_state'

const SESSION_BACKUP_DIR = './session_backups'

const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

const MAX_RECONNECT_ATTEMPTS = 5

const RECONNECT_DELAY = 5000 // 5 seconds



// ─── Global State ─────────────────────────────────────────────────────────────

let sock = null

let isConnected = false

let reconnectAttempts = 0

let lastHealthCheck = Date.now()

let connectionStatus = {
  
  status: 'initializing',
  
  lastConnected: null,
  
  lastDisconnected: null,
  
  reconnectAttempts: 0,
  
  uptime: 0,
  
  sessionId: null
    
}



// ─── Session Persistence ──────────────────────────────────────────────────────

function ensureBackupDirs() {
  
  if (!fs.existsSync(SESSION_BACKUP_DIR)) {
    
    fs.mkdirSync(SESSION_BACKUP_DIR, { recursive: true })
    
  }
  
  if (!fs.existsSync(AUTH_STATE_DIR)) {
    
    fs.mkdirSync(AUTH_STATE_DIR, { recursive: true })
    
  }
  
}



function backupAuthState() {
  
  try {
    
    const timestamp = Date.now()
    
    const backupPath = path.join(SESSION_BACKUP_DIR, `backup_${timestamp}`)
    
    if (fs.existsSync(AUTH_STATE_DIR)) {
      
      fs.cpSync(AUTH_STATE_DIR, backupPath, { recursive: true })
      
      console.log(`[M-JARVIS] ✅ Session backed up to ${backupPath}`)
      

      
      const backups = fs.readdirSync(SESSION_BACKUP_DIR)
      
        .filter(f => f.startsWith('backup_'))
      
        .sort()
      
        .reverse()
      

      
      for (let i = 3; i < backups.length; i++) {
        
        fs.rmSync(path.join(SESSION_BACKUP_DIR, backups[i]), { recursive: true })
        
      }
      
    }
    
  } catch (err) {
    
    console.error('[M-JARVIS] Backup failed:', err.message)
    
  }
  
}



function restoreAuthStateFromBackup() {
  
  try {
    
    const backups = fs.readdirSync(SESSION_BACKUP_DIR)
    
      .filter(f => f.startsWith('backup_'))
    
      .sort()
    
      .reverse()
    

    
    if (backups.length > 0) {
      
      const latestBackup = path.join(SESSION_BACKUP_DIR, backups[0])
      
      console.log(`[M-JARVIS] 🔄 Restoring session from backup: ${backups[0]}`)
      

      
      if (fs.existsSync(AUTH_STATE_DIR)) {
        
        fs.rmSync(AUTH_STATE_DIR, { recursive: true })
        
      }
      

      
      fs.cpSync(latestBackup, AUTH_STATE_DIR, { recursive: true })
      
      console.log('[M-JARVIS] ✅ Session restored successfully')
      
      return true
      
    }
    
  } catch (err) {
    
    console.error('[M-JARVIS] Restore failed:', err.message)
    
  }
  
  return false
  
}



// ─── Connection Status API ────────────────────────────────────────────────────

function getConnectionStatus() {
  
  return {
    
    ...connectionStatus,
    
    uptime: Date.now() - (connectionStatus.lastConnected || Date.now()),
    
    isConnected,
    
    timestamp: new Date().toISOString()
      
  }
  
}



async function updateConnectionStatusInSupabase() {
  
  if (!supabase) return
  
  try {
    
    await supabase.from('whatsapp_connection_status').upsert({
      
      id: 1,
      
      status: connectionStatus.status,
      
      last_connected: connectionStatus.lastConnected,
      
      last_disconnected: connectionStatus.lastDisconnected,
      
      reconnect_attempts: connectionStatus.reconnectAttempts,
      
      is_connected: isConnected,
      
      updated_at: new Date().toISOString()
        
    }, { onConflict: 'id' })
    
  } catch (err) {
    
    console.error('[M-JARVIS] Failed to update connection status:', err.message)
    
  }
  
}



// ─── Health Check ─────────────────────────────────────────────────────────────

function startHealthCheck() {
  
  setInterval(async () => {
    
    lastHealthCheck = Date.now()
    

    
    if (!isConnected && sock) {
      
      console.log('[M-JARVIS] ⚠️ Health check: Connection lost, attempting recovery...')
      
      try {
        
        await sock.fetchBlocklist()
        
        console.log('[M-JARVIS] ✅ Health check: Connection recovered')
        
        isConnected = true
        
      } catch (err) {
        
        console.error('[M-JARVIS] Health check failed:', err.message)
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          
          reconnectAttempts++
          
          console.log(`[M-JARVIS] 🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
          
          setTimeout(startJarvis, RECONNECT_DELAY)
          
        }
        
      }
      
    }
    

    
    await updateConn


































































































