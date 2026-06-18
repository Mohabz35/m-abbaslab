'use client'

import { useQISAuth } from '@/lib/qis-auth'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserCircle, Shield, Save, CheckCircle, Clock } from 'lucide-react'

const roleLabels: Record<string, string> = {
  associate: 'Associate Member',
  core: 'Core Syndicate Member',
  leadership: 'Leadership Appointee',
  admin: 'Administrator',
}

const statusLabels: Record<string, string> = {
  pending: 'Application Under Review',
  approved: 'Active Member',
  rejected: 'Application Rejected',
  suspended: 'Membership Suspended',
}

const statusColors: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
  suspended: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function ProfilePage() {
  const { member, refresh } = useQISAuth()
  const [fullName, setFullName] = useState(member?.full_name || '')
  const [discipline, setDiscipline] = useState(member?.discipline || '')
  const [institution, setInstitution] = useState(member?.institution || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!member) return
    setSaving(true)
    await supabase.from('qis_members').update({
      full_name: fullName,
      discipline,
      institution,
      updated_at: new Date().toISOString(),
    }).eq('id', member.id)
    await refresh()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!member) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your membership details.</p>
      </div>

      {/* Profile Header */}
      <div className="flex items-center gap-6 p-6 rounded-2xl border border-white/5 bg-black/30">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-white">{member.full_name.charAt(0)}</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              {roleLabels[member.role] || member.role}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[member.status] || 'text-gray-400 bg-white/5 border-white/10'}`}>
              {member.status === 'pending' ? <Clock className="w-2.5 h-2.5 mr-1" /> : <CheckCircle className="w-2.5 h-2.5 mr-1" />}
              {statusLabels[member.status] || member.status}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="p-6 rounded-2xl border border-white/5 bg-black/30 space-y-6">
        <h3 className="text-sm font-bold text-white">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={member.email}
              disabled
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Discipline</label>
            <input
              type="text"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              placeholder="e.g. Economics, AI Engineering"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Institution</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Chuka University"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 focus:outline-none transition-all"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Membership Info */}
      <div className="p-6 rounded-2xl border border-white/5 bg-black/20">
        <h3 className="text-sm font-bold text-white mb-4">Membership Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Member Since', value: member.applied_at ? new Date(member.applied_at).toLocaleDateString() : 'N/A' },
            { label: 'NDA Status', value: member.nda_signed ? 'Executed' : 'Pending' },
            { label: 'Role', value: roleLabels[member.role] },
            { label: 'Approved', value: member.approved_at ? new Date(member.approved_at).toLocaleDateString() : 'Pending' },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
