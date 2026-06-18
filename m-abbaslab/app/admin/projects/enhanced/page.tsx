'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Briefcase, Edit, Trash2, Plus, Star, Eye, ExternalLink,
  Github, BarChart3, Calendar, Users, Search, Filter, Save
} from 'lucide-react'

type Project = {
  id: string
  title: string
  description: string
  category: string
  tech_stack: string[]
  github_url: string | null
  demo_url: string | null
  image_url: string | null
  featured: boolean
  status: string
  case_study: string | null
  impact_metrics: any
  team_members: string[]
  start_date: string | null
  end_date: string | null
  gallery_images: string[]
  view_count: number
  created_at: string
}

const categories = ['Research', 'Academic', 'Technology', 'Data Science', 'Web Development', 'AI/ML', 'Open Source']

export default function ProjectsEnhancedManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'Technology', tech_stack: '',
    github_url: '', demo_url: '', image_url: '', featured: false, status: 'active',
    case_study: '', team_members: '', start_date: '', end_date: '',
  })

  useEffect(() => { loadProjects() }, [])

  const loadProjects = async () => {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  const saveProject = async () => {
    if (!form.title || !form.description) return
    const payload = {
      ...form,
      tech_stack: form.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
      team_members: form.team_members.split(',').map(t => t.trim()).filter(Boolean),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }
    if (editingProject) {
      const { data } = await supabase.from('projects').update(payload).eq('id', editingProject.id).select().single()
      if (data) setProjects(prev => prev.map(p => p.id === editingProject.id ? data : p))
    } else {
      const { data } = await supabase.from('projects').insert(payload).select().single()
      if (data) setProjects(prev => [data, ...prev])
    }
    setShowForm(false)
    setEditingProject(null)
    resetForm()
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('projects').update({ featured: !current }).eq('id', id)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p))
  }

  const resetForm = () => setForm({ title: '', description: '', category: 'Technology', tech_stack: '', github_url: '', demo_url: '', image_url: '', featured: false, status: 'active', case_study: '', team_members: '', start_date: '', end_date: '' })

  const startEdit = (project: Project) => {
    setEditingProject(project)
    setForm({
      title: project.title, description: project.description, category: project.category,
      tech_stack: (project.tech_stack || []).join(', '), github_url: project.github_url || '',
      demo_url: project.demo_url || '', image_url: project.image_url || '',
      featured: project.featured, status: project.status || 'active',
      case_study: project.case_study || '', team_members: (project.team_members || []).join(', '),
      start_date: project.start_date || '', end_date: project.end_date || '',
    })
    setShowForm(true)
  }

  const filtered = projects.filter(p => {
    const matchesCat = filterCategory === 'all' || p.category === filterCategory
    const matchesSearch = searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects Manager</h1>
          <p className="text-sm text-gray-400">{projects.length} projects | {projects.filter(p => p.featured).length} featured</p>
        </div>
        <button onClick={() => { resetForm(); setEditingProject(null); setShowForm(true) }} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-3 border rounded-xl text-sm">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(project => (
            <div key={project.id} className="bg-white rounded-xl border p-4 flex items-center gap-4 hover:border-blue-200 transition-all">
              {project.image_url && <img src={project.image_url} alt={project.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{project.title}</span>
                  {project.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">{project.category}</span>
                </div>
                <p className="text-xs text-gray-600 truncate mt-1">{project.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                  {project.tech_stack?.slice(0, 4).map(t => <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{t}</span>)}
                  {project.tech_stack && project.tech_stack.length > 4 && <span>+{project.tech_stack.length - 4}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  {project.view_count > 0 && <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {project.view_count}</span>}
                  {project.start_date && <span>{new Date(project.start_date).toLocaleDateString()}</span>}
                </div>
                <div className="flex gap-1">
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded"><Github className="w-3.5 h-3.5 text-gray-400" /></a>}
                  {project.demo_url && <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-gray-100 rounded"><ExternalLink className="w-3.5 h-3.5 text-gray-400" /></a>}
                  <button onClick={() => startEdit(project)} className="p-1.5 hover:bg-gray-100 rounded"><Edit className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={() => toggleFeatured(project.id, project.featured)} className="p-1.5 hover:bg-gray-100 rounded"><Star className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={() => deleteProject(project.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold">{editingProject ? 'Edit Project' : 'Add Project'}</h3>
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border rounded-lg px-4 py-3 text-sm resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <input type="text" placeholder="Tech Stack (comma separated)" value={form.tech_stack} onChange={e => setForm(p => ({ ...p, tech_stack: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input type="url" placeholder="GitHub URL" value={form.github_url} onChange={e => setForm(p => ({ ...p, github_url: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm" />
              <input type="url" placeholder="Demo URL" value={form.demo_url} onChange={e => setForm(p => ({ ...p, demo_url: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm" />
            </div>
            <input type="url" placeholder="Image URL" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="w-full border rounded-lg px-4 py-3 text-sm" />
            <textarea placeholder="Case Study (detailed writeup)" value={form.case_study} onChange={e => setForm(p => ({ ...p, case_study: e.target.value }))} rows={4} className="w-full border rounded-lg px-4 py-3 text-sm resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Team Members (comma separated)" value={form.team_members} onChange={e => setForm(p => ({ ...p, team_members: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm" />
              <div className="flex items-center gap-2">
                <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm flex-1" />
                <span className="text-gray-400">to</span>
                <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm flex-1" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="rounded" />
              Featured project
            </label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setEditingProject(null) }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={saveProject} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
