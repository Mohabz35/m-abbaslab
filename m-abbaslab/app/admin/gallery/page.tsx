'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Plus, Trash2, Upload, X, ArrowLeft, Image as ImageIcon, Video, RefreshCw, Star } from 'lucide-react'
import Link from 'next/link'

interface MediaItem {
    id: string
    created_at: string
    url: string
    type: string
    caption: string
    category: string
    featured: boolean
}

export default function GalleryAdmin() {
    const [media, setMedia] = useState<MediaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)

    // Upload State
    const [file, setFile] = useState<File | null>(null)
    const [caption, setCaption] = useState('')
    const [category, setCategory] = useState('editorial')
    const [type, setType] = useState('image')

    const fetchMedia = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setMedia(data || [])
        } catch (err) {
            console.error('Error fetching media:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMedia()
    }, [])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `gallery/${fileName}`

            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('content')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('content')
                .getPublicUrl(filePath)

            // 3. Save to DB
            const { error: dbError } = await supabase
                .from('media')
                .insert([{
                    url: publicUrl,
                    type: type,
                    caption: caption,
                    category: category,
                    featured: false
                }])

            if (dbError) throw dbError

            setShowUploadModal(false)
            fetchMedia()
            // Reset form
            setFile(null)
            setCaption('')
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed. Ensure you have a "content" bucket in Supabase storage and RLS is configured.')
        } finally {
            setUploading(false)
        }
    }

    const deleteItem = async (id: string, url: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return
        try {
            // Delete from DB first
            const { error } = await supabase.from('media').delete().eq('id', id)
            if (error) throw error

            setMedia(media.filter(m => m.id !== id))
        } catch (err) {
            console.error('Delete failed:', err)
        }
    }

    const toggleFeatured = async (id: string, current: boolean) => {
        try {
            const { error } = await supabase
                .from('media')
                .update({ featured: !current })
                .eq('id', id)
            if (error) throw error
            setMedia(media.map(m => m.id === id ? { ...m, featured: !current } : m))
        } catch (err) {
            console.error('Toggle featured failed:', err)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider uppercase">Virtual Gallery Admin</h1>
                            <p className="text-gray-500 text-sm">Managing digital assets, runways, and editorial media.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-6 py-3 bg-[#00f0ff] text-black font-bold rounded-xl flex items-center hover:scale-105 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Asset
                    </button>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 text-gray-600">
                        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                        <p>Scanning database for assets...</p>
                    </div>
                ) : media.length === 0 ? (
                    <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-3xl">
                        <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-800" />
                        <p className="text-gray-500 text-lg">Your gallery is empty. Begin the future by uploading an asset.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {media.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden glass-panel border border-white/10"
                            >
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={item.caption} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-blue-900/20 flex items-center justify-center">
                                        <Video className="w-12 h-12 text-blue-400" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end gap-2">
                                    <p className="text-xs font-bold truncate">{item.caption}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{item.category}</p>
                                    <div className="flex space-x-2 mt-2">
                                        <button
                                            onClick={() => toggleFeatured(item.id, item.featured)}
                                            className={`p-2 rounded-lg transition-colors ${item.featured ? 'bg-yellow-500 text-black' : 'bg-black/80 text-white'}`}
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteItem(item.id, item.url)}
                                            className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowUploadModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold flex items-center uppercase tracking-widest">
                                    <Upload className="w-5 h-5 mr-3 text-[#00f0ff]" />
                                    Upload Transmission
                                </h2>
                                <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 uppercase">System Asset</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 uppercase">Descriptor / Caption</label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="Brief description of the asset..."
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 uppercase">Classification</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm"
                                        >
                                            <option value="editorial">Editorial</option>
                                            <option value="runway">Runway</option>
                                            <option value="commercial">Commercial</option>
                                            <option value="lifestyle">Lifestyle</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-500 uppercase">Type</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm"
                                        >
                                            <option value="image">Image</option>
                                            <option value="video">Video</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-4 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {uploading ? 'UPLOADING...' : 'INITIALIZE UPLOAD'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
