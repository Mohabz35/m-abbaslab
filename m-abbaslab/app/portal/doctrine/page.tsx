'use client'

import { useQISAuth } from '@/lib/qis-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, Lock, Download, Gavel, DollarSign, AlertTriangle, Users, Crown } from 'lucide-react'

const docIcons: Record<string, any> = {
  charter: FileText,
  deck: FileText,
  nda: Gavel,
  legal: Gavel,
  research: FileText,
  template: FileText,
}

const docColors: Record<string, string> = {
  charter: 'text-blue-400 bg-blue-500/10',
  deck: 'text-purple-400 bg-purple-500/10',
  nda: 'text-amber-400 bg-amber-500/10',
  legal: 'text-red-400 bg-red-500/10',
  research: 'text-emerald-400 bg-emerald-500/10',
  template: 'text-cyan-400 bg-cyan-500/10',
}

const staticDocs = [
  { title: 'QIS Foundational Bundle', type: 'charter', description: 'The complete constitutional framework governing QIS operations, values, and membership standards.', access_level: 'associate' },
  { title: 'QIS NDA Agreement', type: 'nda', description: 'Binding non-disclosure agreement required for all Core and Leadership tier members.', access_level: 'core' },
  { title: 'QIS Profit Sharing Charter', type: 'legal', description: 'Transparent revenue distribution framework across all active members and venture projects.', access_level: 'core' },
  { title: 'QIS Penalty & Reward Scheme', type: 'legal', description: 'Performance accountability framework with structured incentives and consequences.', access_level: 'associate' },
  { title: 'QIS Membership Agreement', type: 'charter', description: 'Formal contractual terms defining rights, responsibilities, and exit clauses.', access_level: 'associate' },
  { title: 'QIS Leadership Appointment Template', type: 'template', description: 'Official governance document for designating division heads and executive collaborators.', access_level: 'leadership' },
]

type AccessLevel = 'public' | 'associate' | 'core' | 'leadership' | 'admin'
const accessRank: Record<AccessLevel, number> = { public: 0, associate: 1, core: 2, leadership: 3, admin: 4 }

export default function DoctrinePage() {
  const { member } = useQISAuth()
  const [dbDocs, setDbDocs] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('qis_documents').select('*').order('created_at', { ascending: false })
      if (data) setDbDocs(data)
    }
    load()
  }, [])

  const allDocs = [...dbDocs, ...staticDocs.filter(sd => !dbDocs.find(d => d.title === sd.title))]
  const memberRank = member ? accessRank[member.role as AccessLevel] || 0 : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">QIS Doctrine</h1>
        <p className="text-gray-400">Founding documents, governance frameworks, and legal charters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allDocs.map((doc, idx) => {
          const Icon = docIcons[doc.type] || FileText
          const colorClass = docColors[doc.type] || 'text-gray-400 bg-white/5'
          const docRank = accessRank[(doc.access_level || 'public') as AccessLevel] || 0
          const locked = memberRank < docRank

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${locked ? 'border-white/5 bg-black/20 opacity-60' : 'border-white/5 bg-black/30 hover:border-white/10'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  {locked ? <Lock className="w-4 h-4 text-gray-500" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-white">{doc.title}</h3>
                    {locked && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">Locked</span>}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{doc.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-600 uppercase tracking-wider">
                    <span>{doc.type}</span>
                    <span>·</span>
                    <span>{doc.access_level || 'public'}+</span>
                  </div>
                </div>
                {!locked && (
                  <button className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
