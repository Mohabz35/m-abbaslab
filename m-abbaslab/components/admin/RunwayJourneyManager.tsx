'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Plus, Edit, Trash2, Loader2, X, MapPin, Calendar, Tag, Star,
  Image, ChevronDown, ChevronUp, Eye, ArrowUp, ArrowDown,
  Award, Upload
} from 'lucide-react'

interface RunwayEntry {
  id: string
  year: number
  title: string
  description: string
  highlights: string[]
  featured: boolean
  image_url: string
  category: string
  display_order: number
  created_at: string
  updated_at: string
}

export default function RunwayJourneyManager() {
  const [items, setItems] = useState<RunwayEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<RunwayEntry | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<RunwayEntry | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageFileInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/runway')
      const data = await res.json()
      if (data.success) setItems(data.items)
    } catch (e) {
      console.error('Failed to fetch runway entries', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success && data.url) {
        const imageInput = document.querySelector<HTMLInputElement>('input[name="image_url"]')
        if (imageInput) imageInput.value = data.url
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setIsUploadingImage(false)
      if (imageFileInputRef.current) imageFileInputRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    const values = {
      year: parseInt(fd.get('year') as string) || new Date().getFullYear(),
      title: fd.get('title') as string,
      description: fd.get('description') as string,
      category: fd.get('category') as string,
      image_url: fd.get('image_url') as string,
      display_order: parseInt(fd.get('display_order') as string) || 0,
      featured: (fd.get('featured') as string) === 'true',
      highlights: (fd.get('highlights') as string || '').split('\n').map(h => h.trim()).filter(Boolean),
    }
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { ...values, id: editing.id } : values
    try {
      const res = await fetch('/api/admin/runway', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        setShowForm(false)
        setEditing(null)
        fetchItems()
      }
    } catch (e) {
      console.error('Failed to save', e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this runway entry?')) return
    try {
      await fetch(`/api/admin/runway?id=${id}`, { method: 'DELETE' })
      fetchItems()
    } catch (e) { console.error('Failed to delete', e) }
  }

  const toggleFeatured = async (item: RunwayEntry) => {
    try {
      await fetch('/api/admin/runway', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, featured: !item.featured })
      })
      fetchItems()
    } catch (e) { console.error('Failed to toggle featured', e) }
  }

  const sorted = [...items].sort((a, b) => b.year - a.year || a.display_order - b.display_order)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Award className="w-6 h-6 text-pink-400" />
            </div>
            Runway Journey
          </h2>
          <p className="text-slate-400 text-sm mt-1">Timeline of fashion collections & shows</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Milestone
        </button>
      </div>

      {/* Form */}
      {(showForm || editing) && (
        <form onSubmit={handleSave} className="bg-slate-800/50 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">{editing ? 'Edit Milestone' : 'New Milestone'}</h3>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="p-1 hover:bg-slate-700 rounded"><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
              <input name="year" type="number" defaultValue={editing?.year || new Date().getFullYear()} required className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <input name="category" defaultValue={editing?.category || 'Collection'} className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
              <input name="title" defaultValue={editing?.title || ''} required className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <textarea name="description" rows={3} defaultValue={editing?.description || ''} className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
              <div className="flex gap-2">
                <input name="image_url" defaultValue={editing?.image_url || ''} className="flex-1 bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none" />
                <label className="flex items-center gap-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors shrink-0">
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-pink-400" /> : <Upload className="w-4 h-4 text-slate-300" />}
                  <input ref={imageFileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1">Paste URL or upload image (max 1MB)</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Display Order</label>
              <input name="display_order" type="number" defaultValue={editing?.display_order || 0} className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Featured</label>
              <select name="featured" defaultValue={editing?.featured ? 'true' : 'false'} className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Highlights (one per line)</label>
              <textarea name="highlights" rows={4} defaultValue={(editing?.highlights || []).join('\n')} className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium text-sm">Save</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null) }} className="bg-slate-700 text-slate-300 px-6 py-2 rounded-lg font-medium text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No runway milestones yet</p>
          <p className="text-sm mt-1">Add your first collection or show milestone</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured */}
          {sorted.filter(e => e.featured).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sorted.filter(e => e.featured).map(item => (
                <div key={item.id} className="relative bg-gradient-to-br from-pink-900/20 to-purple-900/20 border border-gray-200 dark:border-gray-700 border-pink-500/30 rounded-xl overflow-hidden group cursor-pointer" onClick={() => setSelected(item)}>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 bg-pink-600 text-white text-[10px] font-bold rounded flex items-center gap-1"><Star className="w-3 h-3" /> FEATURED</span>
                  </div>
                  <div className="h-40 bg-slate-800 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-600"><Image className="w-10 h-10" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-pink-400">{item.year}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{item.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-800 hidden md:block" />
            {sorted.map((item, idx) => (
              <div key={item.id} className="relative pl-0 md:pl-20 pb-8 last:pb-0 group">
                {/* Timeline dot */}
                <div className="hidden md:flex absolute left-5 top-1 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 items-center justify-center group-hover:border-pink-500 transition-colors z-10">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                </div>

                <div className="bg-slate-800/50 hover:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl overflow-hidden transition-all cursor-pointer" onClick={() => setSelected(item)}>
                  <div className="flex flex-col md:flex-row">
                    {item.image_url && (
                      <div className="md:w-48 h-32 shrink-0 bg-slate-900 overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-pink-400">{item.year}</span>
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.category}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button onClick={() => toggleFeatured(item)} className={`p-1.5 rounded-lg ${item.featured ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700 text-slate-400 hover:text-amber-400'}`}>
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setEditing(item); setShowForm(true) }} className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 text-slate-400"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
                      {item.highlights && item.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.highlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs">{h}</span>
                          ))}
                          {item.highlights.length > 3 && (
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">+{item.highlights.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            {selected.image_url && (
              <div className="h-56 bg-slate-800">
                <img src={selected.image_url} alt={selected.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-pink-400">{selected.year}</span>
                  <span className="text-xs font-medium text-slate-400 uppercase">{selected.category}</span>
                </div>
                {selected.featured && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded flex items-center gap-1"><Star className="w-3 h-3" /> FEATURED</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{selected.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{selected.description}</p>
              {selected.highlights && selected.highlights.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Highlights</h4>
                  <ul className="space-y-1">
                    {selected.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-300"><span className="w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />{h}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button onClick={() => { setEditing(selected); setShowForm(true); setSelected(null) }} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium"><Edit className="w-4 h-4" /> Edit</button>
                <button onClick={() => { handleDelete(selected.id); setSelected(null) }} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}