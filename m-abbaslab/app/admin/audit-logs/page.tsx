'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Shield, AlertTriangle, Eye, Search, Filter, Download,
  Clock, User, Activity, Lock, Unlock, Key, Globe
} from 'lucide-react'

type SecurityEvent = {
  id: string
  event_type: string
  user_id: string | null
  username: string | null
  ip_address: string | null
  user_agent: string | null
  details: any
  severity: string
  created_at: string
}

type AuditLog = {
  id: string
  username: string
  action: string
  resource_type: string | null
  resource_id: string | null
  old_values: any
  new_values: any
  ip_address: string | null
  created_at: string
}

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
}

const eventTypeIcons: Record<string, typeof Lock> = {
  failed_login: Lock,
  successful_login: Unlock,
  password_change: Key,
  role_change: Shield,
  suspicious_activity: AlertTriangle,
  rate_limit: AlertTriangle,
  csrf_attempt: Shield,
}

export default function AuditLogsSecurity() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'security' | 'audit'>('security')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState(7)

  useEffect(() => { loadData() }, [timeRange])

  const loadData = async () => {
    setLoading(true)
    const since = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString()
    const [secRes, auditRes] = await Promise.all([
      supabase.from('security_events').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
      supabase.from('admin_activity_logs').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(200),
    ])
    setSecurityEvents(secRes.data || [])
    setAuditLogs(auditRes.data || [])
    setLoading(false)
  }

  const filteredSecurity = securityEvents.filter(e => {
    const matchesSeverity = filterSeverity === 'all' || e.severity === filterSeverity
    const matchesSearch = searchQuery === '' ||
      e.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.username && e.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.ip_address && e.ip_address.includes(searchQuery))
    return matchesSeverity && matchesSearch
  })

  const filteredAudit = auditLogs.filter(l => {
    const matchesSearch = searchQuery === '' ||
      l.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.resource_type && l.resource_type.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const exportLogs = () => {
    const data = view === 'security' ? filteredSecurity.map(e => ({
      type: e.event_type, severity: e.severity, username: e.username, ip: e.ip_address, date: e.created_at
    })) : filteredAudit.map(l => ({
      username: l.username, action: l.action, resource: l.resource_type, id: l.resource_id, date: l.created_at
    }))
    const headers = Object.keys(data[0] || {})
    const csv = [headers.join(','), ...data.map(r => headers.map(h => `"${String(r[h as keyof typeof r] || '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${view}-logs.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    totalSecurity: securityEvents.length,
    critical: securityEvents.filter(e => e.severity === 'critical').length,
    warnings: securityEvents.filter(e => e.severity === 'warning').length,
    failedLogins: securityEvents.filter(e => e.event_type === 'failed_login').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs & Security</h1>
          <p className="text-sm text-gray-400">Monitor security events and admin activity</p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={e => setTimeRange(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={exportLogs} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: stats.totalSecurity, color: 'blue' },
          { label: 'Critical', value: stats.critical, color: 'red' },
          { label: 'Warnings', value: stats.warnings, color: 'amber' },
          { label: 'Failed Logins', value: stats.failedLogins, color: 'gray' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setView('security')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'security' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          <Shield className="w-4 h-4 inline mr-2" /> Security Events ({securityEvents.length})
        </button>
        <button onClick={() => setView('audit')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'audit' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          <Activity className="w-4 h-4 inline mr-2" /> Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm" />
        </div>
        {view === 'security' && (
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="px-4 py-3 border rounded-xl text-sm">
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        )}
      </div>

      {/* Content */}
      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          {view === 'security' ? (
            filteredSecurity.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No security events</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredSecurity.map(e => {
                  const Icon = eventTypeIcons[e.event_type] || Shield
                  return (
                    <div key={e.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{e.event_type.replace(/_/g, ' ')}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${severityColors[e.severity]}`}>{e.severity}</span>
                        </div>
                        {e.username && <div className="text-xs text-gray-400">User: {e.username}</div>}
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        {e.ip_address && <div>{e.ip_address}</div>}
                        <div>{new Date(e.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          ) : (
            filteredAudit.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400">No audit logs</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAudit.map(l => (
                  <div key={l.id} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">{l.username.charAt(0).toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-medium">{l.username}</span>
                        <span className="text-gray-400 mx-1">{l.action}</span>
                        {l.resource_type && <span className="text-blue-600">{l.resource_type}</span>}
                        {l.resource_id && <span className="text-gray-400 ml-1">({l.resource_id.slice(0, 8)})</span>}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {l.ip_address && <div>{l.ip_address}</div>}
                      <div>{new Date(l.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
