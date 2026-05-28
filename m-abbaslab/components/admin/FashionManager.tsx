'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Scissors, ShoppingBag, Loader2, PackageOpen } from 'lucide-react'

export default function FashionManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  
  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/fashion')
      const data = await res.json()
      if (data.success) {
        setItems(data.items)
      }
    } catch (e) {
      console.error('Failed to fetch fashion items', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const values = {
      title: formData.get('title'),
      collection: formData.get('collection'),
      status: formData.get('status'),
      stock: parseInt(formData.get('stock') as string, 10)
    }
    
    const method = editingItem ? 'PUT' : 'POST'
    const body = editingItem ? { ...values, id: editingItem.id } : values

    try {
      const res = await fetch('/api/admin/fashion', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setIsEditing(false)
        setEditingItem(null)
        fetchItems()
      }
    } catch (error) {
      console.error('Failed to save fashion item', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fashion item?')) return
    try {
      await fetch(`/api/admin/fashion?id=${id}`, { method: 'DELETE' })
      fetchItems()
    } catch (e) {
      console.error('Failed to delete', e)
    }
  }

  return (
    <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-150 dark:border-gray-800 flex justify-between items-center bg-pink-50/50 dark:bg-pink-950/10 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
            <Scissors className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Fashion Lab</h2>
            <p className="text-xs text-gray-500">Manage designs, collections, and inventory.</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsEditing(true); }}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-pink-500" /></div>
        ) : isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Title / Name</label>
              <input name="title" defaultValue={editingItem?.title || ''} required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Collection</label>
              <input name="collection" defaultValue={editingItem?.collection || ''} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select name="status" defaultValue={editingItem?.status || 'design'} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none">
                  <option value="design">Design Phase</option>
                  <option value="production">In Production</option>
                  <option value="shipped">Available/Shipped</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stock</label>
                <input name="stock" type="number" defaultValue={editingItem?.stock || 0} min="0" required className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Save Item
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No fashion items found. Add your first design!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-pink-500/30 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{item.collection || 'No Collection'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(item); setIsEditing(true); }} className="text-gray-400 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <div className="flex justify-between items-end mt-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      item.status === 'shipped' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      item.status === 'production' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Stock</div>
                    <div className={`font-mono font-bold ${item.stock > 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>{item.stock}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
