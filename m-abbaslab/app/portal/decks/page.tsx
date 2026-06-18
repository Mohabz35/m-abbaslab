'use client'

import { useQISAuth } from '@/lib/qis-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Presentation, Download, Eye, Lock, Calendar } from 'lucide-react'

export default function DecksPage() {
  const { member } = useQISAuth()
  const [decks, setDecks] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('qis_documents').select('*').eq('type', 'deck').order('created_at', { ascending: false })
      if (data) setDecks(data)
    }
    load()
  }, [])

  const staticDecks = [
    { title: 'QIS Alignment Deck', description: 'Strategic vision and mission alignment for all syndicate members. Core philosophy and operating principles.', access_level: 'associate', created_at: '2026-01-01' },
    { title: 'QIS Budget Deck', description: 'Financial projections, revenue models, and resource allocation framework for QIS ventures.', access_level: 'core', created_at: '2026-02-01' },
    { title: 'QIS Strategic Plan 2026-2030', description: 'Five-year strategic roadmap covering all divisions, milestones, and key performance indicators.', access_level: 'leadership', created_at: '2026-03-01' },
  ]

  const allDecks = [...decks, ...staticDecks.filter(sd => !decks.find(d => d.title === sd.title))]

  const accessRank: Record<string, number> = { public: 0, associate: 1, core: 2, leadership: 3, admin: 4 }
  const memberRank = member ? accessRank[member.role] || 0 : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Strategy Decks</h1>
        <p className="text-gray-400">Alignment, budget, and strategic planning presentations.</p>
      </div>

      {allDecks.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/5 bg-black/20">
          <Presentation className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No strategy decks uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDecks.map((deck, idx) => {
            const locked = memberRank < (accessRank[deck.access_level] || 0)
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl border transition-all ${locked ? 'border-white/5 bg-black/20 opacity-60' : 'border-white/5 bg-black/30 hover:border-purple-500/20'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {locked ? <Lock className="w-4 h-4 text-gray-600" /> : <Presentation className="w-4 h-4 text-purple-400" />}
                  <h3 className="text-sm font-bold text-white">{deck.title}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{deck.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-gray-600">
                    <Calendar className="w-3 h-3" />
                    {deck.created_at ? new Date(deck.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                  {!locked && (
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
