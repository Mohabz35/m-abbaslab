'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Plus, Edit, Trash2, Scissors, ShoppingBag, Loader2, PackageOpen,
  X, Image, MapPin, Calendar, Tag, Layers, List, Grid3X3, Filter,
  ChevronDown, ChevronUp, Eye, Download, ExternalLink, Archive,
  CheckCircle, Clock, AlertTriangle, Upload
} from 'lucide-react'

interface FashionItem {
  id: string
  title: string
  collection: string
  category: string
  status: string
  size: string
  stock: number
  image_url: string
  gallery_images: string[]
  price: number
  event_date: string
  location: string
  description: string
  tags: string[]
  created_at: string
  updated_at: string
}

export default function FashionManager() {
  const [items, setItems] = useState<FashionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<FashionItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FashionItem | null>(null)
  const [filterCollection, setFilterCollection] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageFileInputRef = useRef<HTMLInputElement>(null)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fashion')
      const data = await res.json()
      if (data.success) setItems(data.items)
    } catch (e) {
      console.error('Failed to fetch fashion items', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size < 1 * 1024 * 1024) {
      alert('Image must be at least 1MB')
      return
    }
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

  const collections = Array.from(new Set(items.map(i => i.collection || 'Uncategorized')))
  const statuses = Array.from(new Set(items.map(i => i.status)))

  const filtered = items.filter(i => {
    if (filterCollection !== 'all' && (i.collection || 'Uncategorized') !== filterCollection) return false
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    if (searchQuery && !i.title.toLowerCase().includes(searchQuery.toLowerCase()) && !i.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = {
    total: items.length,
    design: items.filter(i => i.status === 'design').length,
    production: items.filter(i => i.status === 'production').length,
    shipped: items.filter(i => i.status === 'shipped').length,
    archived: items.filter(i => i.status === 'archived').length,
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const fd = new FormData(form)
    const values = {
      title: fd.get('title') as string,
      collection: fd.get('collection') as string,
      category: fd.get('category') as string,
      status: fd.get('status') as string,
      size: fd.get('size') as string,
      stock: parseInt(fd.get('stock') as string) || 0,
      price: parseFloat(fd.get('price') as string) || 0,
      description: fd.get('description') as string,
      location: fd.get('location') as string,
      event_date: fd.get('event_date') as string,
      image_url: fd.get('image_url') as string,
      tags: (fd.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean),
      gallery_images: (fd.get('gallery_images') as string || '').split(',').map(u => u.trim()).filter(Boolean),
    }
    const method = editingItem ? 'PUT' : 'POST'
    const body = editingItem ? { ...values, id: editingItem.id } : values
    try {
      const res = await fetch('/api/admin/fashion', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        setShowForm(false)
        setEditingItem(null)
        fetchItems()
      }
    } catch (e) {
      console.error('Failed to save', e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      await fetch(`/api/admin/fashion?id=${id}`, { method: 'DELETE' })
      fetchItems()
    } catch (e) {
      console.error('Failed to delete', e)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(p => {
      const next = new Set(p)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return
    selectedIds.forEach(async (id) => {
      await fetch(`/api/admin/fashion?id=${id}`, { method: 'DELETE' })
    })
    setSelectedIds(new Set())
    fetchItems()
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'shipped': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
      case 'production': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'archived': return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
      default: return 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:text-gray-400'
    }
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case 'shipped': return <CheckCircle className="w-3 h-3" />
      case 'production': return <Clock className="w-3 h-3" />
      case 'archived': return <Archive className="w-3 h-3" />
      default: return <AlertTriangle className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { label: 'Design', value: stats.design, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/500/10' },
          { label: 'Production', value: stats.production, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Shipped', value: stats.shipped, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Archived', value: stats.archived, color: 'text-slate-400', bg: 'bg-slate-500/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700 border-transparent`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <select value={filterCollection} onChange={e => setFilterCollection(e.target.value)} className="bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none">
          <option value="all">All Collections</option>
          {collections.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none">
          <option value="all">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="flex-1 min-w-[200px] bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none" />
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'text-slate-400 hover:text-slate-600'}`}><List className="w-4 h-4" /></button>
        </div>
        {selectedIds.size > 0 && (
          <button onClick={bulkDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm font-medium hover:bg-red-500/20">
            <Trash2 className="w-3.5 h-3.5" /> Delete {selectedIds.size}
          </button>
        )}
        <button
          onClick={() => { setEditingItem(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex gap-6">
        {/* Collection Sidebar */}
        <div className="hidden md:block w-48 shrink-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Collections</h3>
          <div className="space-y-1">
            <button onClick={() => setFilterCollection('all')} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterCollection === 'all' ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              All ({items.length})
            </button>
            {collections.map(c => (
              <button key={c} onClick={() => setFilterCollection(c)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterCollection === c ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {c} ({items.filter(i => (i.collection || 'Uncategorized') === c).length})
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
          ) : showForm || editingItem ? (
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-200 dark:border-slate-800 p-6 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingItem ? 'Edit Item' : 'New Fashion Item'}</h3>
                <button type="button" onClick={() => { setShowForm(false); setEditingItem(null) }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                  <input name="title" defaultValue={editingItem?.title || ''} required className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Collection</label>
                  <input name="collection" defaultValue={editingItem?.collection || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <input name="category" defaultValue={editingItem?.category || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select name="status" defaultValue={editingItem?.status || 'design'} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none">
                    <option value="design">Design Phase</option>
                    <option value="production">In Production</option>
                    <option value="shipped">Shipped/Available</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Size</label>
                  <input name="size" defaultValue={editingItem?.size || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Stock</label>
                  <input name="stock" type="number" defaultValue={editingItem?.stock || 0} min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Price</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingItem?.price || 0} min="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Event Date</label>
                  <input name="event_date" type="date" defaultValue={editingItem?.event_date || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
                  <input name="location" defaultValue={editingItem?.location || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
                  <div className="flex gap-2">
                    <input name="image_url" defaultValue={editingItem?.image_url || ''} className="flex-1 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                    <label className="flex items-center gap-1 px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors shrink-0">
                      {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-pink-500" /> : <Upload className="w-4 h-4 text-slate-400" />}
                      <input ref={imageFileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Paste URL or upload image (max 1MB)</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Gallery Images (comma-separated URLs)</label>
                  <input name="gallery_images" defaultValue={(editingItem?.gallery_images || []).join(', ')} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingItem?.description || ''} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma-separated)</label>
                  <input name="tags" defaultValue={(editingItem?.tags || []).join(', ')} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium text-sm">Save</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingItem(null) }} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2 rounded-lg font-medium text-sm">Cancel</button>
              </div>
            </form>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <PackageOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No items found</p>
              <p className="text-sm mt-1">{searchQuery ? 'Try a different search' : 'Add your first fashion item'}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-lg hover:border-pink-500/30 transition-all group">
                  <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => setSelectedItem(item)}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400"><Image className="w-8 h-8" /></div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); setShowForm(true) }} className="p-1.5 bg-white dark:bg-gray-800/90 dark:bg-slate-900/90 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"><Edit className="w-3.5 h-3.5 text-slate-600" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id) }} className="p-1.5 bg-white dark:bg-gray-800/90 dark:bg-slate-900/90 rounded-lg hover:bg-white dark:hover:bg-slate-800 shadow-sm"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${statusColor(item.status)}`}>
                        {statusIcon(item.status)} {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 cursor-pointer" onClick={() => setSelectedItem(item)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.collection || 'No Collection'}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-2 line-clamp-1">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-400 line-clamp-2 mb-3">{item.description}</p>}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        {item.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.price > 0 && <span className="font-mono font-bold text-slate-700 dark:text-slate-300">KES {item.price}</span>}
                        <span className={`font-mono font-bold ${item.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{item.stock}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 border-slate-200 dark:border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="text-left p-3 w-8"><input type="checkbox" onChange={e => { if (e.target.checked) setSelectedIds(new Set(filtered.map(i => i.id))); else setSelectedIds(new Set()) }} className="accent-pink-600" /></th>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Collection</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Stock</th>
                    <th className="text-right p-3">Price</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => setSelectedItem(item)}>
                      <td className="p-3" onClick={e => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-pink-600" /></td>
                      <td className="p-3 font-medium text-slate-800 dark:text-white">{item.title}</td>
                      <td className="p-3 text-slate-400">{item.collection || '-'}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor(item.status)}`}>{item.status.toUpperCase()}</span></td>
                      <td className="p-3 text-right font-mono">{item.stock}</td>
                      <td className="p-3 text-right font-mono">{item.price > 0 ? `KES ${item.price}` : '-'}</td>
                      <td className="p-3 text-slate-400 text-xs">{item.location || '-'}</td>
                      <td className="p-3 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => { setEditingItem(item); setShowForm(true) }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Edit className="w-3.5 h-3.5 text-slate-400" /></button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-64 bg-slate-100 dark:bg-slate-800">
              {selectedItem.image_url ? (
                <img src={selectedItem.image_url} alt={selectedItem.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400"><Image className="w-12 h-12" /></div>
              )}
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"><X className="w-5 h-5" /></button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${statusColor(selectedItem.status)}`}>
                  {statusIcon(selectedItem.status)} {selectedItem.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Gallery */}
            {selectedItem.gallery_images && selectedItem.gallery_images.length > 1 && (
              <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
                {selectedItem.gallery_images.map((url, i) => (
                  <img key={i} src={url} alt={`${selectedItem.title} - ${i+1}`} className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700 border-slate-200 dark:border-slate-700 shrink-0" />
                ))}
              </div>
            )}

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedItem.title}</h2>
                {selectedItem.collection && (
                  <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">{selectedItem.collection}</span>
                )}
              </div>

              {selectedItem.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{selectedItem.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedItem.event_date && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span>{new Date(selectedItem.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {selectedItem.location && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>{selectedItem.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <ShoppingBag className="w-4 h-4 text-pink-500" />
                  <span>Stock: <strong className={selectedItem.stock > 0 ? 'text-emerald-600' : 'text-red-500'}>{selectedItem.stock}</strong></span>
                </div>
                {selectedItem.price > 0 && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span>Price: <strong className="text-slate-800 dark:text-white">KES {selectedItem.price}</strong></span>
                  </div>
                )}
                {selectedItem.size && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Layers className="w-4 h-4 text-pink-500" />
                    <span>Size: <strong>{selectedItem.size}</strong></span>
                  </div>
                )}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="col-span-2 flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-pink-500" />
                    {selectedItem.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button onClick={() => { setEditingItem(selectedItem); setShowForm(true); setSelectedItem(null) }} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm font-medium">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => { handleDelete(selectedItem.id); setSelectedItem(null) }} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}