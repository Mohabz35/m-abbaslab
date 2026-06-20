'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Image, Edit, Trash2, Save, Plus, Star, Calendar, MapPin,
  Camera, Tag, Eye, Download, Search, Filter
} from 'lucide-react'

type FashionItem = {
  id: string
  title: string
  category: string
  image_url: string
  description: string | null
  photo_date: string | null
  photographer: string | null
  event_name: string | null
  location: string | null
  tags: string[]
  view_count: number
  is_featured: boolean
  created_at: string
}

const categories = ['Editorial', 'Runway', 'Commercial', 'Portrait', 'Street', 'Campaign', 'Personal']

export default function FashionEnhancedManager() {
  const [items, setItems] = useState<FashionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [editingItem, setEditingItem] = useState<FashionItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', category: 'Editorial', image_url: '', description: '',
    photo_date: '', photographer: '', event_name: '', location: '',
    tags: '', is_featured: false,
  })

  useEffect(() => { loadItems() }, [])

  const loadItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('fashion_items').select('*').order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }

  const saveItem = async () => {
    if (!form.title || !form.image_url) return
    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      photo_date: form.photo_date || null,
    }
    if (editingItem) {
      const { data } = await supabase.from('fashion_items').update(payload).eq('id', editingItem.id).select().single()
      if (data) setItems(prev => prev.map(i => i.id === editingItem.id ? data : i))
    } else {
      const { data } = await supabase.from('fashion_items').insert(payload).select().single()
      if (data) setItems(prev => [data, ...prev])
    }
    setShowForm(false)
    setEditingItem(null)
    resetForm()
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('fashion_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('fashion_items').update({ is_featured: !current }).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_featured: !current } : i))
  }

  const resetForm = () => setForm({ title: '', category: 'Editorial', image_url: '', description: '', photo_date: '', photographer: '', event_name: '', location: '', tags: '', is_featured: false })

  const startEdit = (item: FashionItem) => {
    setEditingItem(item)
    setForm({
      title: item.title, category: item.category, image_url: item.image_url,
      description: item.description || '', photo_date: item.photo_date || '',
      photographer: item.photographer || '', event_name: item.event_name || '',
      location: item.location || '', tags: (item.tags || []).join(', '),
      is_featured: item.is_featured,
    })
    setShowForm(true)
  }

  const filtered = items.filter(i => {
    const matchesCat = filterCategory === 'all' || i.category === filterCategory
    const matchesSearch = searchQuery === '' || i.title.toLowerCase().includes(searchQuery.toLowerCase()) || (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCat && matchesSearch
  })

  const stats = {
    total: items.length,
    featured: items.filter(i => i.is_featured).length,
    totalViews: items.reduce((s, i) => s + (i.view_count || 0), 0),
    categories: new Set(items.map(i => i.category)).size,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fashion Portfolio Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stats.total} items | {stats.featured} featured | {stats.totalViews} total views</p>
        </div>
        <button onClick={() => { resetForm(); setEditingItem(null); setShowForm(true) }} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input type="text" placeholder="Search portfolio..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div> : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Image className="w-12 h-12 text-gray-400 dark:text-gray-600 dark:text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
              <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                {item.is_featured && <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1"><Star className="w-3 h-3" /> Featured</div>}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(item)} className="w-7 h-7 bg-white dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:bg-gray-800"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => toggleFeatured(item.id, item.is_featured)} className="w-7 h-7 bg-white dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:bg-gray-800"><Star className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteItem(item.id)} className="w-7 h-7 bg-white dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:bg-white dark:bg-gray-800 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate">{item.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                  <span>{item.category}</span>
                  {item.view_count > 0 && <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {item.view_count}</span>}
                </div>
                {item.photographer && <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><Camera className="w-3 h-3" /> {item.photographer}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            <input type="text" placeholder="Image URL" value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.photo_date} onChange={e => setForm(p => ({ ...p, photo_date: e.target.value }))} className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
              <input type="text" placeholder="Photographer" value={form.photographer} onChange={e => setForm(p => ({ ...p, photographer: e.target.value }))} className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Event Name" value={form.event_name} onChange={e => setForm(p => ({ ...p, event_name: e.target.value }))} className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
              <input type="text" placeholder="Location" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            </div>
            <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))} className="rounded" />
              Featured item
            </label>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setEditingItem(null) }} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={saveItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
