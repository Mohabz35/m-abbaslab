'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, User, BookOpen, Search, TrendingUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'
import { supabase } from '@/lib/supabase'

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dynamicArticles, setDynamicArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch dynamic articles
  useEffect(() => {
    const fetchArticles = async () => {
      // Small artificial delay to prevent hydration mismatch if using mock
      if (!supabase) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })

      if (data) {
        setDynamicArticles(data)
      }
      setLoading(false)
    }

    fetchArticles()
  }, [])

  // Merge articles
  const allArticles = [
    ...dynamicArticles,
    ...personalConfig.articles
  ]

  // Calculate stats
  const totalArticles = allArticles.length
  const featuredCount = allArticles.filter((a: any) => a.featured).length

  // Update categories with dynamic counts
  const categories = [
    { id: 'all', name: 'All Articles', count: totalArticles },
    { id: 'research', name: 'Research Papers', count: allArticles.filter((a: any) => a.category === 'research').length },
    { id: 'technical', name: 'Technical Guides', count: allArticles.filter((a: any) => a.category === 'technical').length },
    { id: 'fashion-tech', name: 'Fashion Tech', count: allArticles.filter((a: any) => a.category === 'fashion-tech').length },
    { id: 'economics', name: 'Economics', count: allArticles.filter((a: any) => a.category === 'economics').length },
  ]

  const filteredArticles = allArticles.filter((article: any) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20">
          <BookOpen className="w-8 h-8 text-[#00f0ff]" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
          Articles & <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">Research</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Insights, research findings, and technical guides on economics, technology, and data science.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles by title, content, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl glass-panel border border-white/10 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/50 outline-none transition-all text-white placeholder-gray-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : totalArticles}
              </div>
              <div className="text-sm text-gray-500">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7000ff] drop-shadow-[0_0_5px_rgba(112,0,255,0.5)]">
                {featuredCount}
              </div>
              <div className="text-sm text-gray-500">Featured</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 border ${selectedCategory === category.id
                ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20 hover:text-white'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{category.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === category.id
                ? 'bg-[#00f0ff]/20 text-white'
                : 'bg-white/10 text-gray-400'
                }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Featured Articles */}
      {filteredArticles.filter((a: any) => a.featured).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center text-white">
            <TrendingUp className="w-6 h-6 mr-3 text-amber-500" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredArticles
              .filter((article: any) => article.featured)
              .map((article: any) => (
                <motion.article
                  key={article.id}
                  whileHover={{ y: -5 }}
                  className="group relative glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#00f0ff]/50 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
                        {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Featured
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#00f0ff] transition-colors shadow-black drop-shadow-md">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {article.tags && article.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-white/5 text-gray-300 rounded-full text-sm font-medium flex items-center border border-white/5 group-hover:border-[#00f0ff]/20 transition-colors"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {personalConfig.name}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {article.read_time} min read
                        </div>
                      </div>
                      <Link
                        href={`/articles/${article.id}`}
                        className="text-[#7000ff] font-semibold text-sm hover:text-[#00f0ff] transition-colors"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
          </div>
        </motion.div>
      )}

      {/* All Articles Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-white">All Articles</h2>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article: any, index: number) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group glass-panel rounded-2xl border border-white/5 hover:border-[#7000ff]/50 p-6 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${article.category === 'research' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      article.category === 'technical' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                      {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#7000ff] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {article.published_at ? new Date(article.published_at).getFullYear() : '2024'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {article.read_time} min read
                      </div>
                    </div>
                    <Link
                      href={`/articles/${article.id}`}
                      className="text-[#7000ff] font-semibold text-sm hover:text-[#00f0ff] transition-colors"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/5">
            <div className="text-6xl mb-6 grayscale opacity-50">📝</div>
            <h3 className="text-2xl font-bold mb-3 text-white">No Articles Found</h3>
            <p className="text-gray-500 mb-8">
              {searchQuery
                ? `No articles found for "${searchQuery}". Try a different search term.`
                : 'No articles in this category. Try selecting "All Articles".'
              }
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSearchQuery('')
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-semibold rounded-xl hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
            >
              Show All Articles
            </button>
          </div>
        )}
      </motion.div>

      {/* Newsletter CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-20 p-8 md:p-12 rounded-3xl glass-panel border border-[#00f0ff]/20 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/5 via-transparent to-[#7000ff]/5" />
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-4 text-white">Stay Updated with New Research</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Subscribe to receive notifications about new articles, research papers, and technical guides.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-6 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/50 outline-none text-white placeholder-gray-600"
            />
            <button className="px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.5)] transition-all hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
