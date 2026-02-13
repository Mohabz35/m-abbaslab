'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Search, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'
import { supabase } from '@/lib/supabase'

export default function AdminArticlesPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [dynamicArticles, setDynamicArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch dynamic articles from Supabase
    useEffect(() => {
        const fetchArticles = async () => {
            if (!supabase) return

            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) {
                setDynamicArticles(data)
            }
            setLoading(false)
        }

        fetchArticles()
    }, [])

    // Combine static and dynamic articles
    const allArticles = [
        ...personalConfig.articles.map(a => ({ ...a, source: 'static', status: 'published' })),
        ...dynamicArticles.map(a => ({ ...a, source: 'database', status: a.published ? 'published' : 'draft' }))
    ]

    const filteredArticles = allArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
        if (activeTab === 'all') return matchesSearch
        return matchesSearch && article.status === activeTab
    })

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Article Management</h1>
                        <p className="text-gray-400">Manage your research, tutorials, and blog posts.</p>
                    </div>
                    <Link
                        href="/admin/articles/new"
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Article
                    </Link>
                </header>

                {/* Filters */}
                <div className="flex justify-between items-center mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex space-x-2">
                        {['all', 'published', 'drafts'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64"
                        />
                    </div>
                </div>

                {/* Articles List */}
                <div className="grid gap-4">
                    {filteredArticles.map((article) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-6 flex justify-between items-center hover:border-blue-500/30 transition-colors"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${article.source === 'static' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{article.title}</h3>
                                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                                        <span className={`px-2 py-0.5 rounded text-xs ${article.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {article.status.toUpperCase()}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(article.published_at || Date.now()).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span className="capitalize">{article.source}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {article.source === 'database' ? (
                                    <>
                                        <Link
                                            href={`/admin/articles/edit/${article.id}`}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex items-center text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg">
                                        <AlertCircle className="w-3 h-3 mr-1.5" />
                                        Read-only (Static)
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
