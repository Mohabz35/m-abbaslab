'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Send, RefreshCw, CheckCircle, AlertTriangle, Link as LinkIcon, Settings } from 'lucide-react'

export default function ZapierPanel() {
  const [eventName, setEventName] = useState('new_lead')
  const [payloadText, setPayloadText] = useState('{\n  "email": "investor@example.com",\n  "name": "Jane Doe",\n  "source": "QIS_Portal"\n}')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleTestZap = async () => {
    setStatus('loading')
    try {
      // Validate JSON
      let payload;
      try {
        payload = JSON.parse(payloadText)
      } catch (e) {
        throw new Error("Invalid JSON payload format")
      }

      const res = await fetch('/api/admin/zapier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, payload })
      })

      if (res.ok) {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        const data = await res.json()
        throw new Error(data.error || 'Failed to trigger Zap')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="text-orange-500 w-6 h-6" />
            Zapier Automation Hub
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure and trigger external workflows via Webhooks.</p>
        </div>
        <div className="mt-4 md:mt-0 px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          Webhook Status: {process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL ? 'Connected' : 'Not Configured'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test Trigger Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Manual Zap Trigger</h3>
          
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event Name</label>
            <select 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50"
            >
              <option value="new_lead">new_lead (Send to CRM)</option>
              <option value="qis_application">qis_application (Email Founder)</option>
              <option value="content_published">content_published (Social Cross-post)</option>
              <option value="finance_alert">finance_alert (Slack Notification)</option>
              <option value="custom">custom_event</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">JSON Payload Data</label>
            <textarea 
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full h-32 font-mono text-xs bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <button 
            onClick={handleTestZap}
            disabled={status === 'loading'}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-all disabled:opacity-50"
          >
            {status === 'loading' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
             status === 'success' ? <CheckCircle className="w-4 h-4" /> : 
             <Send className="w-4 h-4" />}
            
            {status === 'loading' ? 'Triggering Zap...' : 
             status === 'success' ? 'Zap Triggered Successfully!' : 
             'Fire Manual Webhook'}
          </button>
        </div>

        {/* Configuration Guide */}
        <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Settings className="w-24 h-24 text-orange-500" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Setup Instructions</h3>
          <ol className="list-decimal pl-4 space-y-4 text-sm text-gray-600 dark:text-gray-400 relative z-10">
            <li>Log into your Zapier account and click <strong>Create a Zap</strong>.</li>
            <li>For the Trigger, choose <strong>Webhooks by Zapier</strong>.</li>
            <li>Select <strong>Catch Hook</strong> as the event.</li>
            <li>Copy the unique Webhook URL Zapier provides you.</li>
            <li>Open your Vercel Project Settings → Environment Variables.</li>
            <li>Add a new variable: <code className="bg-gray-200 dark:bg-white/10 px-1 rounded text-orange-500">NEXT_PUBLIC_ZAPIER_WEBHOOK_URL</code> and paste your URL.</li>
            <li>Redeploy your Vercel site.</li>
            <li>Use the form on the left to fire a test payload, then click <strong>Test Trigger</strong> in Zapier to verify!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
