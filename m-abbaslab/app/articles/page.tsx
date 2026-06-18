'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, User, BookOpen, Search, TrendingUp, Loader2, PenTool, BarChart3, Lightbulb, Brain, BookMarked } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { personalConfig } from '@/config/personal'

const categoryMeta: Record<string, { label: string; icon: any; color: string; borderColor: string; bgColor: string; textColor: string; description: string }> = {
  research: { label: 'Research', icon: Brain, color: 'blue', borderColor: 'border-blue-500/20', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', description: 'Academic papers and research findings' },
  technical: { label: 'Technical Guide', icon: BookOpen, color: 'purple', borderColor: 'border-purple-500/20', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', description: 'Step-by-step technical tutorials' },
  technology: { label: 'Technical Guide', icon: BookOpen, color: 'purple', borderColor: 'border-purple-500/20', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', description: 'Step-by-step technical tutorials' },
  tutorial: { label: 'Tutorial', icon: BookOpen, color: 'cyan', borderColor: 'border-cyan-500/20', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400', description: 'Hands-on learning guides' },
  'fashion-tech': { label: 'Fashion Tech', icon: Lightbulb, color: 'pink', borderColor: 'border-pink-500/20', bgColor: 'bg-pink-500/10', textColor: 'text-pink-400', description: 'Technology meets fashion design' },
  economics: { label: 'Economics', icon: BarChart3, color: 'emerald', borderColor: 'border-emerald-500/20', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400', description: 'Economics simplified for everyone' },
  statistics: { label: 'Statistics', icon: BarChart3, color: 'orange', borderColor: 'border-orange-500/20', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400', description: 'Statistics demystified with examples' },
  'complex-concepts': { label: 'Complex Concepts', icon: Lightbulb, color: 'indigo', borderColor: 'border-indigo-500/20', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400', description: 'Hard ideas explained simply' },
  'problem-solving': { label: 'Problem-Solving', icon: Brain, color: 'yellow', borderColor: 'border-yellow-500/20', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400', description: 'Research methodologies and frameworks' },
  'books-writing': { label: 'Books & Writing', icon: PenTool, color: 'teal', borderColor: 'border-teal-500/20', bgColor: 'bg-teal-500/10', textColor: 'text-teal-400', description: 'Book reviews, writing insights, and literary analysis' },
}

function fallbackArticles() {
  return [
    {
      id: 'econ-1',
      title: 'Supply and Demand: The Foundation of Economics',
      excerpt: 'Understand how prices are set in markets through the timeless forces of supply and demand.',
      content: '',
      category: 'economics',
      read_time: 6,
      published_at: '2026-06-01',
      tags: ['economics', 'markets', 'pricing'],
      featured: true,
      cover_image: '',
    },
    {
      id: 'stats-1',
      title: 'Correlation vs. Causation: The Most Important Distinction',
      excerpt: 'Stop mistaking correlation for causation. Learn the difference with real-world examples.',
      content: '',
      category: 'statistics',
      read_time: 5,
      published_at: '2026-06-05',
      tags: ['statistics', 'data literacy', 'research methods'],
      featured: true,
      cover_image: '',
    },
    {
      id: 'econ-2',
      title: 'Why Prices Keep Going Up: Understanding Inflation',
      excerpt: 'A plain-language guide to what inflation is, why it happens, and how it affects your daily life.',
      content: '',
      category: 'economics',
      read_time: 7,
      published_at: '2026-06-10',
      tags: ['economics', 'inflation', 'personal finance'],
      featured: false,
      cover_image: '',
    },
    {
      id: 'stats-2',
      title: 'P-Values: What They Really Mean (And Don\'t Mean)',
      excerpt: 'Demystify p-values and statistical significance without the jargon.',
      content: '',
      category: 'statistics',
      read_time: 8,
      published_at: '2026-06-12',
      tags: ['statistics', 'hypothesis testing', 'data science'],
      featured: true,
      cover_image: '',
    },
    {
      id: 'concept-1',
      title: 'Quantitative Easing: What Central Banks Really Do',
      excerpt: 'Breaking down one of the most misunderstood tools in modern monetary policy.',
      content: '',
      category: 'complex-concepts',
      read_time: 10,
      published_at: '2026-06-14',
      tags: ['monetary policy', 'central banks', 'macroeconomics'],
      featured: false,
      cover_image: '',
    },
  ]
}

function getCatStyle(cat: string) {
  const meta = categoryMeta[cat]
  if (!meta) return { borderColor: 'border-green-500/20', bgColor: 'bg-green-500/10', textColor: 'text-green-400', label: cat || 'General' }
  return meta
}

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/public/articles', { cache: 'no-store' })
        if (res.ok) {
          setAllArticles(await res.json())
        } else {
        const published = (personalConfig.articles as any[]).filter((a) => a.status === 'published' || a.published !== false)
          setAllArticles(published.length > 0 ? published : fallbackArticles())
        }
      } catch {
        const published = (personalConfig.articles as any[]).filter((a) => a.status === 'published' || a.published !== false)
        setAllArticles(published.length > 0 ? published : fallbackArticles())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalArticles = allArticles.length
  const featuredCount = allArticles.filter((a: any) => a.featured).length

  const categories = [
    { id: 'all', name: 'All Articles', count: totalArticles, icon: BookOpen },
    { id: 'economics', name: 'Economics Simplified', count: allArticles.filter((a: any) => a.category === 'economics').length, icon: BarChart3 },
    { id: 'statistics', name: 'Statistics Demystified', count: allArticles.filter((a: any) => a.category === 'statistics').length, icon: BarChart3 },
    { id: 'complex-concepts', name: 'Complex Concepts', count: allArticles.filter((a: any) => a.category === 'complex-concepts').length, icon: Lightbulb },
    { id: 'problem-solving', name: 'Problem-Solving', count: allArticles.filter((a: any) => a.category === 'problem-solving').length, icon: Brain },
    { id: 'books-writing', name: 'Books & Writing', count: allArticles.filter((a: any) => a.category === 'books-writing').length, icon: PenTool },
    { id: 'research', name: 'Research', count: allArticles.filter((a: any) => a.category === 'research').length, icon: Brain },
    { id: 'technical', name: 'Technical Guides', count: allArticles.filter((a: any) => a.category === 'technical').length, icon: BookOpen },
    { id: 'fashion-tech', name: 'Fashion Tech', count: allArticles.filter((a: any) => a.category === 'fashion-tech').length, icon: Lightbulb },
  ]

  const filteredArticles = allArticles.filter((article: any) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.tags && article.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    return matchesCategory && matchesSearch
  })

  const booksArticles = allArticles.filter((a: any) => a.category === 'books-writing')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setSubscribed(true)
      setNewsletterEmail('')
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Articles & Research — M-AbbasLab',
    description: 'Insights, research findings, and technical guides on economics, technology, and data science.',
    url: 'https://m-abbaslab.com/articles',
    publisher: {
      '@type': 'Organization',
      name: 'M-AbbasLab',
      url: 'https://m-abbaslab.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

        {/* Search and Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-6 mb-8">
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
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : totalArticles}
                </div>
                <div className="text-sm text-gray-400">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7000ff] drop-shadow-[0_0_5px_rgba(112,0,255,0.5)]">
                  {featuredCount}
                </div>
                <div className="text-sm text-gray-400">Featured</div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 border text-sm ${selectedCategory === category.id
                    ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20 hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === category.id
                    ? 'bg-[#00f0ff]/20 text-white'
                    : 'bg-white/10 text-gray-400'
                    }`}>
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Books & Writing Highlight Section */}
        {booksArticles.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center text-white">
                <PenTool className="w-7 h-7 mr-3 text-teal-400" />
                Books & Writing
              </h2>
              <button
                onClick={() => setSelectedCategory('books-writing')}
                className="text-teal-400 text-sm font-semibold hover:text-[#00f0ff] transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {booksArticles.slice(0, 3).map((article: any) => (
                <Link key={article.id} href={`/articles/${article.id}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group glass-panel rounded-2xl border border-teal-500/20 hover:border-teal-400/50 p-6 transition-all duration-300 h-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      {article.cover_image && (
                        <div className="relative h-36 w-full rounded-xl overflow-hidden mb-4">
                          <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">{article.excerpt}</p>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {article.read_time} min read
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

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
                .map((article: any) => {
                  const cat = getCatStyle(article.category)
                  return (
                    <motion.article
                      key={article.id}
                      whileHover={{ y: -5 }}
                      className="group relative glass-panel rounded-3xl p-8 border border-white/10 hover:border-[#00f0ff]/50 transition-all duration-500 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${cat.bgColor} ${cat.textColor} border ${cat.borderColor}`}>
                            {cat.label}
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
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
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
                  )
                })}
            </div>
          </motion.div>
        )}

        {/* All Articles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-white">
            {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name || 'Articles'}
          </h2>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article: any, index: number) => {
                const cat = getCatStyle(article.category)
                return (
                  <motion.article
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group glass-panel rounded-2xl border border-white/5 hover:border-[#7000ff]/50 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      {article.cover_image && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                          <Image
                            src={article.cover_image}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${cat.borderColor} ${cat.bgColor} ${cat.textColor}`}>
                            {cat.label}
                          </span>
                          <div className="flex items-center text-xs text-gray-400">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.read_time} min
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#7000ff] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-gray-400 mb-4 text-sm line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {article.tags && article.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-white/5 text-gray-400 rounded-full text-xs border border-white/5"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.tags && article.tags.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-400 text-xs">+{article.tags.length - 3}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                          </div>
                          <Link
                            href={`/articles/${article.id}`}
                            className="text-[#7000ff] font-semibold text-sm hover:text-[#00f0ff] transition-colors"
                          >
                            Read →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 glass-panel rounded-3xl border border-white/5">
              <div className="text-6xl mb-6 grayscale opacity-50">📝</div>
              <h3 className="text-2xl font-bold mb-3 text-white">No Articles Found</h3>
              <p className="text-gray-400 mb-8">
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
            {subscribed ? (
              <p className="text-[#00f0ff] font-semibold text-lg">Thanks for subscribing!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-6 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/50 outline-none text-white placeholder-gray-600"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.5)] transition-all hover:scale-105"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
