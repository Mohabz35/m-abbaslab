'use client'

import { useQISAuth } from '@/lib/qis-auth'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FolderKanban, ExternalLink, Users, TrendingUp, Cpu, BrainCircuit, Globe } from 'lucide-react'

const divisionIcons: Record<string, any> = {
  quantitative: TrendingUp,
  ai: Cpu,
  venture: BrainCircuit,
  impact: Globe,
}

const divisionColors: Record<string, string> = {
  quantitative: 'text-blue-400 bg-blue-500/10',
  ai: 'text-purple-400 bg-purple-500/10',
  venture: 'text-emerald-400 bg-emerald-500/10',
  impact: 'text-amber-400 bg-amber-500/10',
}

const statusColors: Record<string, string> = {
  proposed: 'text-gray-400 bg-white/5 border-white/10',
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  paused: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  complete: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

export default function ProjectsPage() {
  const { member } = useQISAuth()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('qis_projects').select('*').order('created_at', { ascending: false })
      if (data) setProjects(data)
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">QIS Projects</h1>
        <p className="text-gray-400">Flagship R&D projects across all syndicate divisions.</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-white/5 bg-black/20">
          <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No projects registered yet.</p>
          <p className="text-xs text-gray-600">Projects will appear here once created by Leadership or Admin members.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, idx) => {
            const Icon = divisionIcons[project.division] || FolderKanban
            const divColor = divisionColors[project.division] || 'text-gray-400 bg-white/5'
            const statColor = statusColors[project.status] || statusColors.proposed
            return (
              <div key={idx} className="p-6 rounded-2xl border border-white/5 bg-black/30 hover:border-white/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${divColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-white">{project.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statColor}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-gray-600">
                      <span className="uppercase">{project.division}</span>
                      {project.budget > 0 && <span>${project.budget.toLocaleString()} budget</span>}
                    </div>
                  </div>
                  {project.github_repo && (
                    <a href={project.github_repo} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
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
