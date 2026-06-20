'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, RefreshCw, Copy, Check } from 'lucide-react'

interface PairingData {
  pairing_code: string | null
  status: string
  is_connected: boolean
  updated_at: string | null
}

export default function WhatsAppConnectionPanel() {
  const [pairingData, setPairingData] = useState<PairingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch pairing code
  const fetchPairingCode = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/whatsapp-pairing-code')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPairingData(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pairing code')
      console.error(err)
    }
  }

  // Trigger reconnection
  const handleReconnect = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/whatsapp-pairing-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Failed to reconnect')
      } else {
        // Fetch the new pairing code after a short delay
        setTimeout(() => {
          fetchPairingCode()
        }, 2000)
      }
    } catch (err: any) {
      setError('Failed to trigger reconnection')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Copy pairing code to clipboard
  const copyToClipboard = () => {
    if (pairingData?.pairing_code) {
      navigator.clipboard.writeText(pairingData.pairing_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Auto-refresh pairing code every 10 seconds
  useEffect(() => {
    fetchPairingCode()

    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchPairingCode()
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const isConnected = pairingData?.is_connected
  const status = pairingData?.status || 'unknown'
  const pairingCode = pairingData?.pairing_code

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📱</span>
          WhatsApp Connection
        </h2>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      </div>

      {/* Status */}
      <div className="mb-6 p-4 bg-slate-700 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <span className="text-sm font-semibold text-slate-200">
            Status: <span className="capitalize">{status}</span>
          </span>
        </div>
        <p className="text-xs text-slate-400">
          {isConnected ? '✅ Connected and listening' : '⏳ Waiting for connection'}
        </p>
      </div>

      {/* Pairing Code Display */}
      {pairingCode && !isConnected && (
        <div className="mb-6 p-4 bg-blue-900 border border-gray-200 dark:border-gray-700 border-blue-700 rounded-lg">
          <p className="text-xs text-blue-200 mb-3 font-semibold">🔑 PAIRING CODE</p>
          <div className="flex items-center gap-2 mb-3">
            <code className="flex-1 text-lg font-mono font-bold text-blue-100 bg-blue-950 p-3 rounded text-center tracking-widest">
              {pairingCode}
            </code>
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-blue-800 rounded transition"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-blue-300" />
              )}
            </button>
          </div>
          <p className="text-xs text-blue-200">
            📲 Enter this code on your phone: <strong>WhatsApp → Settings → Linked Devices → Link with phone number</strong>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-900 border border-gray-200 dark:border-gray-700 border-red-700 rounded-lg">
          <p className="text-sm text-red-200">⚠️ {error}</p>
        </div>
      )}

      {/* Waiting Message */}
      {!pairingCode && !isConnected && !error && (
        <div className="mb-6 p-4 bg-amber-900 border border-gray-200 dark:border-gray-700 border-amber-700 rounded-lg">
          <p className="text-sm text-amber-200">
            ⏱️ Waiting for pairing code from Render engine...
          </p>
          <p className="text-xs text-amber-300 mt-2">
            Make sure your Render service is running and the engine has started.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleReconnect}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Reconnecting...' : 'Reconnect'}
        </button>
        <button
          onClick={fetchPairingCode}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Fetching...' : 'Refresh'}
        </button>
      </div>

      {/* Auto-refresh Toggle */}
      <div className="mt-4 flex items-center gap-2 p-3 bg-slate-700 rounded-lg">
        <input
          type="checkbox"
          id="autoRefresh"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <label htmlFor="autoRefresh" className="text-xs text-slate-300 cursor-pointer">
          Auto-refresh every 10 seconds
        </label>
      </div>

      {/* Last Updated */}
      {pairingData?.updated_at && (
        <p className="text-xs text-slate-400 mt-4 text-center">
          Last updated: {new Date(pairingData.updated_at).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
