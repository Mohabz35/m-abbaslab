'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Key, History, User, Save, RefreshCcw, Activity } from 'lucide-react'

export default function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'audit'>('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Profile State
  const [bio, setBio] = useState('Chief Executive Officer. Architecting System 12×.')
  const [displayName, setDisplayName] = useState('M. Abbas')
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Mock Audit History
  const [auditLogs] = useState([
    { id: 1, action: 'PASSWORD_CHANGED', ip: '192.168.1.1', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, action: 'ZAPIER_WEBHOOK_TRIGGERED', ip: 'System', date: new Date(Date.now() - 172800000).toISOString() },
    { id: 3, action: 'DISCIPLINE_REVIEW_SAVED', ip: '192.168.1.1', date: new Date(Date.now() - 259200000).toISOString() },
    { id: 4, action: 'ADMIN_LOGIN_SUCCESS', ip: '192.168.1.1', date: new Date(Date.now() - 345600000).toISOString() },
  ])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleUpdateProfile = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      showToast('Profile biography updated successfully.')
    }, 1000)
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error')
      return
    }
    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error')
      return
    }
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showToast('Security credentials updated. Re-login may be required.')
    }, 1500)
  }

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-sm text-gray-200">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Shield className="text-cyan-500 w-7 h-7" />
            System Security & Identity
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Admin Privileges & Audit Logs</p>
        </div>
      </div>

      {/* Tabs */}
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
                  : 'bg-transparent text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="max-w-xl space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Core Identity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">System Biography</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none resize-none"
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Identity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="max-w-xl space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Change Master Password
              </h3>
              <p className="text-xs text-gray-500 mb-6">Updating this will revoke all existing admin sessions.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving || !currentPassword || !newPassword}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  Update Security Credentials
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              System Event Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-bold">Timestamp</th>
                    <th className="pb-3 font-bold">Action Event</th>
                    <th className="pb-3 font-bold">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-900/30">
                      <td className="py-3 text-gray-400 font-mono">{new Date(log.date).toLocaleString()}</td>
                      <td className="py-3 text-cyan-400 font-bold tracking-wide">{log.action}</td>
                      <td className="py-3 text-gray-500 font-mono">{log.ip}</td>
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
