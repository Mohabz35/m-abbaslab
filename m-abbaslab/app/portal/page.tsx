'use client'

import { useQISAuth } from '@/lib/qis-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Shield, FolderKanban, FileText, Users, Clock,
  TrendingUp, Zap, AlertTriangle, Lock
} from 'lucide-react'
import Link from 'next/link'

type Stats = {
  projects: number
  documents: number
  members: number
}

export default function PortalDashboard() {
  const { member, loading } = useQISAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ projects: 0, documents: 0, members: 0 })

  useEffect(() => {
    if (!loading && !member) {
      router.push('/quantum-impact-syndicate')
    }
  }, [member, loading, router])

  useEffect(() => {
    const loadStats = async () => {
      const [projects, documents, members] = await Promise.all([
        supabase.from('qis_projects').select('id', { count: 'exact', head: true }),
        supabase.from('qis_documents').select('id', { count: 'exact', head: true }),
        supabase.from('qis_members').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      ])
      setStats({
        projects: projects.count || 0,
        documents: documents.count || 0,
        members: members.count || 0,
      })
    }
    if (member) loadStats()
  }, [member])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!member) return null

  const isPending = member.status === 'pending'
  const roleLabel = member.role.charAt(0).toUpperCase() + member.role.slice(1)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome, {member.full_name.split(' ')[0]}
        </h1>
        <p className="text-gray-400">
          {roleLabel} Member — {member.discipline || 'Research Collective'}
        </p>
      </div>

      {/* Pending Approval Banner */}
      {isPending && (
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-400 mb-1">Application Under Review</h3>
            <p className="text-sm text-gray-400">
              Your membership application is pending approval by the Chief Strategist.
              You&apos;ll receive access to the full portal once approved.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Projects', value: stats.projects, icon: FolderKanban, color: 'text-blue-400' },
          { label: 'Documents', value: stats.documents, icon: FileText, color: 'text-purple-400' },
          { label: 'Approved Members', value: stats.members, icon: Users, color: 'text-emerald-400' },
        ].map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-black/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-white">{stat.value}</span>
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/portal/doctrine">
          <div className="p-6 rounded-2xl border border-white/5 bg-black/30 hover:border-blue-500/20 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">QIS Doctrine</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Access founding documents, charters, and governance frameworks.
              {member.role === 'associate' && <span className="block mt-2 text-amber-400/60"><Lock className="w-3 h-3 inline mr-1" />Some documents require Core+ access</span>}
            </p>
          </div>
        </Link>

        <Link href="/portal/decks">
          <div className="p-6 rounded-2xl border border-white/5 bg-black/30 hover:border-purple-500/20 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Strategy Decks</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Alignment decks, budget presentations, and strategic roadmaps.
            </p>
          </div>
        </Link>

        <Link href="/portal/projects">
          <div className="p-6 rounded-2xl border border-white/5 bg-black/30 hover:border-emerald-500/20 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <FolderKanban className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Projects</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              View and contribute to QIS flagship R&D projects.
            </p>
          </div>
        </Link>

        <Link href="/portal/profile">
          <div className="p-6 rounded-2xl border border-white/5 bg-black/30 hover:border-amber-500/20 transition-all group cursor-pointer">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">My Profile</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Manage your membership details and skill DNA profile.
            </p>
          </div>
        </Link>
      </div>

      {/* Membership Info */}
      <div className="p-6 rounded-2xl border border-white/5 bg-black/20">
        <h3 className="text-sm font-bold text-white mb-4">Membership Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Status', value: member.status.charAt(0).toUpperCase() + member.status.slice(1) },
            { label: 'Role', value: roleLabel },
            { label: 'NDA', value: member.nda_signed ? 'Signed' : 'Not Signed' },
            { label: 'Applied', value: member.applied_at ? new Date(member.applied_at).toLocaleDateString() : 'N/A' },
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
