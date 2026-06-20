'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Search, Briefcase, Calendar, Users, FileText, Sparkles, Paperclip, CheckCircle2, Upload, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProjectsManager() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', category: '', status: 'planning', contributors: '', milestones: '', file_uploads: '' })
  
  // AI State
  const [aiInsights, setAiInsights] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects')
      const data = await res.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (e) {
      console.error('Failed to fetch projects', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editingProject ? 'PUT' : 'POST'
    const body = editingProject ? { ...formData, id: editingProject.id } : formData
    
    try {
      const res = await fetch('/api/admin/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setIsFormOpen(false)
        setEditingProject(null)
        setFormData({ title: '', description: '', category: '', status: 'planning', contributors: '', milestones: '', file_uploads: '' })
        fetchProjects()
      }
    } catch (error) {
      console.error('Failed to save project', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' })
      fetchProjects()
    } catch (e) {
      console.error('Failed to delete', e)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('projectId', id)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    const id = e.dataTransfer.getData('projectId')
    if (!id) return
    
    // Optimistic UI update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    
    try {
      await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
    } catch (error) {
      console.error('Failed to update status', error)
      fetchProjects() // revert on fail
    }
  }

  const columns = [
    { id: 'planning', label: 'Planning', color: 'border-b border-gray-200 dark:border-gray-700lue-500' },
    { id: 'in-progress', label: 'In Progress', color: 'border-amber-500' },
    { id: 'shipped', label: 'Shipped', color: 'border-emerald-500' }
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1 * 1024 * 1024) {
      alert('Image must be under 1MB')
      return
    }
    setIsUploadingFile(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success && data.url) {
        const current = formData.file_uploads
        setFormData({ ...formData, file_uploads: current ? current + ', ' + data.url : data.url })
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploadingFile(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleGenerateInsights = async () => {
    setIsAiLoading(true)
    try {
      const summary = projects.map(p => `[${p.status.toUpperCase()}] ${p.title}`).join('\\n')
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'project_insights', 
          prompt: 'Analyze these projects for bottlenecks, risks, and recommendations.',
          content: summary
        })
      })
      const data = await res.json()
      if (data.success) setAiInsights(data.result)
    } catch (e) {
      console.error(e)
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Briefcase className="w-6 h-6 text-blue-500"/> Project Kanban</h2>
          <p className="text-sm text-slate-400">Manage projects, milestones, and contributors.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleGenerateInsights} disabled={isAiLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-gray-200 dark:border-gray-700 border-purple-500/30 rounded-lg transition-colors disabled:opacity-50 text-sm font-bold">
            <Sparkles className="w-4 h-4" /> {isAiLoading ? 'Analyzing...' : 'AI Insights'}
          </button>
          <button onClick={() => { setEditingProject(null); setFormData({ title: '', description: '', category: '', status: 'planning', contributors: '', milestones: '', file_uploads: '' }); setIsFormOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aiInsights && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-purple-900/20 border border-gray-200 dark:border-gray-700 border-purple-500/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4"/> Bottlenecks & Risks Analysis</h3>
              <button onClick={() => setAiInsights('')} className="text-slate-400 hover:text-white"><Trash2 className="w-4 h-4"/></button>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap">{aiInsights}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div 
            key={col.id} 
            className={`bg-slate-800/50 rounded-xl border-t-4 ${col.color} border-l border-r border-b border-gray-200 dark:border-gray-700 border-slate-700 p-4 min-h-[500px]`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-wider text-sm">{col.label} ({projects.filter(p => p.status === col.id).length})</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {projects.filter(p => p.status === col.id).map(project => (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    key={project.id} 
                    draggable 
                    onDragStart={(e: any) => handleDragStart(e, project.id)}
                    className="bg-slate-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-600 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-colors shadow-lg group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-white leading-tight">{project.title}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingProject(project); setFormData(project); setIsFormOpen(true) }} className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800"><Edit className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(project.id)} className="p-1.5 text-slate-400 hover:text-red-400 rounded bg-slate-800"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{project.description || 'No description'}</p>
                    
                    {/* Advanced Metrics Preview */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(project.contributors ? (typeof project.contributors === 'string' ? project.contributors : JSON.stringify(project.contributors)) : '').split(',').filter(Boolean).map((c: string, i: number) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px] text-white font-bold border border-gray-200 dark:border-gray-700 border-slate-500 shrink-0" title={c.trim()}>
                          {c.trim().substring(0, 2).toUpperCase()}
                        </div>
                      ))}
                      {(project.milestones ? (typeof project.milestones === 'string' ? project.milestones : JSON.stringify(project.milestones)) : '').split(',').filter(Boolean).length > 0 && (
                        <div className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-gray-200 dark:border-gray-700 border-indigo-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3"/> {(project.milestones ? (typeof project.milestones === 'string' ? project.milestones : JSON.stringify(project.milestones)) : '').split(',').filter(Boolean).length} tasks
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"><Calendar className="w-3 h-3"/> {new Date(project.created_at).toLocaleDateString()}</span>
                      {(project.file_uploads ? (typeof project.file_uploads === 'string' ? project.file_uploads : JSON.stringify(project.file_uploads)) : '').split(',').filter(Boolean).length > 0 && (
                        <span className="flex items-center gap-1 text-blue-400"><Paperclip className="w-3 h-3"/></span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Project Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">{editingProject ? 'Edit Project' : 'New Project'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Category</label>
                  <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white">
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="shipped">Shipped</option>
                  </select>
                </div>
              </div>

              {/* Advanced fields */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Contributors (comma separated)</label>
                <input type="text" placeholder="e.g. Alice, Bob" value={formData.contributors || (editingProject?.contributors ? (typeof editingProject.contributors === 'string' ? editingProject.contributors : JSON.stringify(editingProject.contributors)) : '')} onChange={e => setFormData({...formData, contributors: e.target.value})} className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white" />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Milestones/Tasks (comma separated)</label>
                <input type="text" placeholder="e.g. Design UI, Setup DB, Write Tests" value={formData.milestones || (editingProject?.milestones ? (typeof editingProject.milestones === 'string' ? editingProject.milestones : JSON.stringify(editingProject.milestones)) : '')} onChange={e => setFormData({...formData, milestones: e.target.value})} className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white" />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">File Uploads</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://..." value={formData.file_uploads || (editingProject?.file_uploads ? (typeof editingProject.file_uploads === 'string' ? editingProject.file_uploads : JSON.stringify(editingProject.file_uploads)) : '')} onChange={e => setFormData({...formData, file_uploads: e.target.value})} className="flex-1 bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-2.5 text-white" />
                  <label className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors shrink-0">
                    {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Upload className="w-4 h-4 text-slate-300" />}
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-1">URLs or upload image (max 1MB)</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
