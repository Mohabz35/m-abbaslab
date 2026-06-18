'use client'

import { useEffect, useState } from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  ExternalLink,
  Clipboard,
  Calendar,
  AlertCircle,
  FileText,
  Smartphone,
  QrCode
} from 'lucide-react'

type ConnectionStatus = {
  status?: string
  service?: string
  is_connected?: boolean
  connection_state?: string
  reconnect_attempts?: number
  last_connected_at?: string | null
  last_disconnected_at?: string | null
  last_error?: string | null
  updated_at?: string | null
  metadata?: {
    latestQrAvailable?: boolean
    latestPairingCodeAvailable?: boolean
    qrCode?: string | null
    pairingCode?: string | null
  }
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

export default function WhatsAppConnection() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [source, setSource] = useState<string>('unknown')
  const [engineUrl, setEngineUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [activeMethod, setActiveMethod] = useState<'qr' | 'pairing'>('qr')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchStatus = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const headers: Record<string, string> = {}
      if (ADMIN_SECRET) {
        headers['x-admin-secret'] = ADMIN_SECRET
      }

      const response = await fetch('/api/admin/whatsapp-status', {
        headers,
        cache: 'no-store'
      })

      const data = await response.json()
      if (data.success) {
        setStatus(data.status)
        setSource(data.source)
        setEngineUrl(data.engineUrl)
      } else {
        setStatus(null)
      }
    } catch (err: any) {
      console.warn('Failed to load whatsapp connection status:', err)
      setStatus(null)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatus()

    // Poll status every 15 seconds
    const interval = setInterval(() => {
      fetchStatus(true)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const handleReconnect = async () => {
    setIsReconnecting(true)
    try {
      const headers: Record<string, string> = {}
      if (ADMIN_SECRET) {
        headers['x-admin-secret'] = ADMIN_SECRET
      }

      const response = await fetch('/api/admin/whatsapp-status', {
        method: 'POST',
        headers
      })

      const data = await response.json()
      if (data.success) {
        showToast('Reconnection sequence initiated!')
        fetchStatus(true)
      } else {
        showToast(data.error || 'Reconnect request failed', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error triggering reconnect', 'error')
    } finally {
      setIsReconnecting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast('Copied to clipboard!')
  }

  const isConnected = Boolean(status?.is_connected)
  const connectionState = status?.connection_state || status?.status || 'disconnected'
  const qrCodeText = status?.metadata?.qrCode
  const pairingCode = status?.metadata?.pairingCode

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border shadow-lg transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Wifi className="w-5 h-5 text-emerald-500" />
            WhatsApp Connection Manager
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Monitor WhatsApp socket connectivity, link phone sessions, and inspect system logs.
          </p>
        </div>
        <button
          onClick={() => fetchStatus(true)}
          disabled={isRefreshing}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Refresh connection status"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Status card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Display */}
          <div className="md:col-span-2 flex items-start gap-4 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/40">
            <div className={`p-3 rounded-2xl flex-shrink-0 ${
              isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}>
              {isConnected ? <Wifi className="w-8 h-8" /> : <WifiOff className="w-8 h-8" />}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base text-gray-900 dark:text-white">
                  Jarvis Engine Status
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                  {connectionState}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-400 mt-2">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Last connected: {status?.last_connected_at ? new Date(status.last_connected_at).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Last disconnected: {status?.last_disconnected_at ? new Date(status.last_disconnected_at).toLocaleString() : 'Never'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconnect attempts: {status?.reconnect_attempts || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Reporting source: <span className="font-semibold uppercase text-blue-500">{source}</span></span>
                </div>
              </div>

              {status?.last_error && (
                <div className="mt-3 text-xs bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl max-w-full truncate">
                  <span className="font-bold">Error:</span> {status.last_error}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col justify-between p-5 rounded-2xl border border-gray-150 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-950/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Connection Actions</h3>
            <div className="space-y-2.5">
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
                Reconnect Socket
              </button>
              
              <a
                href="https://dashboard.render.com/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Render Dashboard
              </a>
            </div>
            
            <div className="text-[10px] text-gray-400 flex items-start gap-1">
              <FileText className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
              <span>To debug credentials issues, check Render deployment logs directly.</span>
            </div>
          </div>
        </div>

        {/* QR Scanner / Connection Method section (show if not connected) */}
        {!isConnected && (
          <div className="border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/30 dark:bg-gray-950/10">
            <div className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 px-4 py-3 flex gap-2">
              <button
                onClick={() => setActiveMethod('qr')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeMethod === 'qr'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                QR Code Method
              </button>
              <button
                onClick={() => setActiveMethod('pairing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  activeMethod === 'pairing'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Pairing Code Method
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {activeMethod === 'qr' ? (
                <div className="space-y-4 max-w-sm">
                  {qrCodeText ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-gray-200 inline-block shadow-sm">
                        {/* Render QR code via free public API */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeText)}`}
                          alt="WhatsApp Linking QR Code"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Scan this QR Code</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Open WhatsApp on your phone ➔ Menu ➔ Linked Devices ➔ Link a Device ➔ Point your camera at this screen.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 space-y-2">
                      <QrCode className="w-12 h-12 text-gray-300 mx-auto" />
                      <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">No QR Code Available</h4>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto">
                        The engine has not shared a QR code. If the engine is starting or reconnecting, wait a moment or click "Reconnect Socket" to generate a code.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-w-md">
                  {pairingCode ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl px-6 py-4 inline-block font-mono text-xl font-bold tracking-widest text-blue-600 dark:text-blue-400 select-all shadow-sm">
                        {pairingCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">Enter Pairing Code on Phone</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Open WhatsApp on your phone ➔ Linked Devices ➔ Link with phone number instead. Enter the code above when prompted.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 space-y-2">
                      <Smartphone className="w-12 h-12 text-gray-300 mx-auto" />
                      <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">No Pairing Code Available</h4>
                      <p className="text-xs text-gray-400 max-w-xs mx-auto">
                        To use this method, set the <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px] text-gray-600 dark:text-gray-400">PHONE_NUMBER</code> environment variable in your Render engine (e.g. 254702894309) and restart the service.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
