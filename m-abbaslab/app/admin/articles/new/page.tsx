'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Image as ImageIcon, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function NewArticlePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'research',
        tags: '',
        read_time: 5
    })
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!supabase) throw new Error('Supabase client not initialized')

            const { data, error: insertError } = await supabase
                .from('articles')
                .insert([
                    {
                        ...formData,
                        tags: formData.tags.split(',').map(t => t.trim()),
                        published: true, // Auto-publish for now
                        published_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }
                ])
                .select()

            if (insertError) throw insertError

            // Redirect to admin list
            router.push('/admin/articles')
        } catch (err: any) {
            console.error('Error creating article:', err)
            setError(err.message || 'Failed to create article')
        } finally {
            setLoading(false)
        }
    }

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value
        setFormData(prev => ({
            ...prev,
            title,
            slug: title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
        }))
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/admin/articles"
                    className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Articles
                </Link>

                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create New Article</h1>
                    <p className="text-gray-400">Share your latest research or thoughts with the world.</p>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
                        Error: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">

                        {/* Title & Slug */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g. The Future of AI in Fashion"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                                    placeholder="the-future-of-ai-in-fashion"
                                />
                            </div>
                        </div>

                        {/* Category & Read Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="research">Research</option>
                                    <option value="technology">Technology</option>
                                    <option value="fashion-tech">Fashion Tech</option>
                                    <option value="economics">Economics</option>
                                    <option value="tutorial">Tutorial</option>
                                    <option value="blog">Blog</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Read Time (min)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.read_time}
                                    onChange={(e) => setFormData({ ...formData, read_time: parseInt(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Brief summary of the article..."
                            />
                        </div>

                        {/* Content (Markdown) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Content (Markdown supported)</label>
                            <textarea
                                required
                                rows={15}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                                placeholder="# Introduction\n\nWrite your article content here..."
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tags (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="AI, Machine Learning, Fashion"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link
                            href="/admin/articles"
                            className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Publish Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
