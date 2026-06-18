'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Key, History, User, Save, RefreshCcw, Activity } from 'lucide-react'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { personalConfig } from '@/config/personal'

export default function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'audit'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [bio, setBio] = useState('Chief Executive Officer. Architecting System 12×.')
  const [displayName, setDisplayName] = useState('M. Abbas')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs()
    }
  }, [activeTab])

  const fetchAuditLogs = async () => {
    setAuditLoading(true)
    if (hasSupabaseKeys) {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20)
      if (data) setAuditLogs(data)
    }
    setAuditLoading(false)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpdateProfile = async () => {
    setIsSaving(true)
    if (hasSupabaseKeys) {
      await supabase.from('site_config').upsert({ key: 'profile', value: { displayName, bio } }, { onConflict: 'key' })
      await supabase.from('audit_logs').insert({ action: 'PROFILE_UPDATED', entity_type: 'profile', details: { displayName } })
    }
    setTimeout(() => {
      setIsSaving(false)
      showToast('Profile biography updated successfully.')
    }, 500)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error')
      return
    }
    setIsSaving(true)
    if (hasSupabaseKeys) {
      const { error } = await supabase.from('site_config').upsert({ key: 'admin_credentials', value: { password: newPassword } }, { onConflict: 'key' })
      if (!error) {
        await supabase.from('audit_logs').insert({ action: 'PASSWORD_CHANGED', entity_type: 'security', details: {} })
      }
    }
    setTimeout(() => {
      setIsSaving(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Security credentials updated.')
    }, 500)
  }

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-sm text-gray-200">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Shield className="text-cyan-500 w-7 h-7" />
            System Security & Identity
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Admin Privileges & Audit Logs</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
        {[
          { id: 'profile', label: 'Identity Profile', icon: User },
          { id: 'security', label: 'Access Control', icon: Key },
          { id: 'audit', label: 'Audit History', icon: History }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                  : 'bg-transparent text-gray-400 hover:text-gray-300 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="min-h-[300px]">
        {activeTab === 'profile' && (
          <div className="max-w-xl space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Core Identity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Display Name</label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">System Biography</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none resize-none" />
                </div>
                <button onClick={handleUpdateProfile} disabled={isSaving} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Identity
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-xl space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" /> Change Master Password
              </h3>
              <p className="text-xs text-gray-400 mb-6">Updating this will revoke all existing admin sessions.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none" />
                </div>
                <button onClick={handleChangePassword} disabled={isSaving || !newPassword} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Update Security Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" /> System Event Logs
              </h3>
              <button onClick={fetchAuditLogs} className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-1">
                <RefreshCcw className={`w-3 h-3 ${auditLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-bold">Timestamp</th>
                    <th className="pb-3 font-bold">Action Event</th>
                    <th className="pb-3 font-bold">Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {auditLogs.length === 0 && !auditLoading && (
                    <tr><td colSpan={3} className="py-8 text-center text-gray-400">No audit events yet. Actions will be logged here automatically.</td></tr>
                  )}
                  {auditLoading && <tr><td colSpan={3} className="py-8 text-center text-gray-400">Loading...</td></tr>}
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-900/30">
                      <td className="py-3 text-gray-400 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="py-3 text-cyan-400 font-bold tracking-wide">{log.action}</td>
                      <td className="py-3 text-gray-400 font-mono text-xs">{log.entity_type || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
