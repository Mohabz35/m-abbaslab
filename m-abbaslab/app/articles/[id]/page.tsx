'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, notFound, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Tag, ArrowLeft, Share2, Bookmark, Loader2,
  Twitter, Linkedin, LinkIcon, ChevronRight, BookOpen, Mail, Eye, Heart
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { personalConfig } from '@/config/personal'

function extractHeadings(content: string) {
  const lines = content.split('\n')
  const headings: { id: string; text: string; level: number }[] = []
  lines.forEach((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      headings.push({ id, text, level })
    }
  })
  return headings
}

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inList = false
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-2 my-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-300">{item}</li>
          ))}
        </ul>
      )
      listItems = []
    }
    inList = false
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('### ')) {
      flushList()
      const text = trimmed.slice(4)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      elements.push(
        <h3 key={i} id={id} className="text-2xl font-bold text-white mt-12 mb-4">{text}</h3>
      )
    } else if (trimmed.startsWith('## ')) {
      flushList()
      const text = trimmed.slice(3)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      elements.push(
        <h2 key={i} id={id} className="text-3xl font-bold text-white mt-16 mb-6 pb-3 border-b border-white/10">{text}</h2>
      )
    } else if (trimmed.startsWith('# ')) {
      flushList()
      const text = trimmed.slice(2)
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      elements.push(
        <h1 key={i} id={id} className="text-4xl font-bold text-white mt-8 mb-6">{text}</h1>
      )
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(trimmed.slice(2))
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = true
      listItems.push(trimmed.replace(/^\d+\.\s/, ''))
    } else if (trimmed.startsWith('> ')) {
      flushList()
      elements.push(
        <blockquote key={i} className="border-l-4 border-[#7000ff] pl-6 py-3 my-6 bg-[#7000ff]/5 rounded-r-xl text-gray-300 italic">
          {trimmed.slice(2)}
        </blockquote>
      )
    } else if (trimmed.startsWith('```')) {
      flushList()
      elements.push(<div key={i} className="my-2" />)
    } else if (trimmed === '') {
      flushList()
    } else {
      flushList()
      const formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-white/10 rounded text-[#00f0ff] text-sm font-mono">$1</code>')
      elements.push(
        <p key={i} className="text-gray-300 leading-relaxed text-lg my-4" dangerouslySetInnerHTML={{ __html: formatted }} />
      )
    }
  })
  flushList()
  return elements
}

export default function ArticleDetailPage() {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const [article, setArticle] = useState<any | null>(null)
  const [allArticles, setAllArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [articleRes, allRes] = await Promise.all([
          fetch(`/api/public/articles/${id}`, { cache: 'no-store' }),
          fetch('/api/public/articles', { cache: 'no-store' }),
        ])
        if (articleRes.ok) {
          setArticle(await articleRes.json())
        } else {
          const fallback = ((personalConfig.articles as unknown as any[]) || []).find((a) => a.id === id && (a.status === 'published' || a.published !== false))
          if (fallback?.published !== false) {
            setArticle(fallback)
          } else {
            setMissing(true)
          }
        }
        if (allRes.ok) {
          setAllArticles(await allRes.json())
        }
      } catch {
        const fallback = ((personalConfig.articles as unknown as any[]) || []).find((a) => a.id === id && (a.status === 'published' || a.published !== false))
        if (fallback?.published !== false) {
          setArticle(fallback)
        } else {
          setMissing(true)
        }
      }
      setLoading(false)
    }
    load()
  }, [id])

  // Track view, load counts, check favorites
  useEffect(() => {
    if (!article?.id) return

    // Increment view count
    fetch(`/api/public/articles/${article.id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' }),
    }).then(r => r.json()).then(d => { if (d.view_count !== undefined) setViewCount(d.view_count) }).catch(() => {})

    // Load current counts
    fetch(`/api/public/articles/${article.id}/reactions`).then(r => r.json()).then(d => {
      if (d.view_count !== undefined) setViewCount(d.view_count)
      if (d.like_count !== undefined) setLikeCount(d.like_count)
    }).catch(() => {})

    // Check if favorited in localStorage
    const favs = JSON.parse(localStorage.getItem('favorited_articles') || '[]')
    setFavorited(favs.includes(article.id))
    const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]')
    setLiked(likedArticles.includes(article.id))
  }, [article?.id])

  const headings = useMemo(() => {
    if (!article?.content) return []
    return extractHeadings(String(article.content))
  }, [article?.content])

  const relatedArticles = useMemo(() => {
    if (!article || allArticles.length === 0) return []
    return allArticles
      .filter((a) => a.id !== article.id && a.category === article.category)
      .slice(0, 3)
  }, [article, allArticles])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = article ? `Read "${article.title}" by ${personalConfig.name}` : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setSubscribed(true)
      setNewsletterEmail('')
    }
  }

  const handleLike = async () => {
    if (!article?.id) return
    const action = liked ? 'unlike' : 'like'
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)

    // Persist to localStorage
    const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]')
    if (liked) {
      localStorage.setItem('liked_articles', JSON.stringify(likedArticles.filter((id: string) => id !== article.id)))
    } else {
      localStorage.setItem('liked_articles', JSON.stringify([...likedArticles, article.id]))
    }

    try {
      await fetch(`/api/public/articles/${article.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
    } catch {}
  }

  const handleFavorite = () => {
    if (!article?.id) return
    setFavorited(!favorited)
    const favs = JSON.parse(localStorage.getItem('favorited_articles') || '[]')
    if (favorited) {
      localStorage.setItem('favorited_articles', JSON.stringify(favs.filter((id: string) => id !== article.id)))
    } else {
      localStorage.setItem('favorited_articles', JSON.stringify([...favs, article.id]))
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (missing || !article) {
    notFound()
  }

  const categoryColors: Record<string, string> = {
    research: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    technical: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    technology: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    tutorial: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'fashion-tech': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    economics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    statistics: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'complex-concepts': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'problem-solving': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'books-writing': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  }

  const categoryLabel: Record<string, string> = {
    research: 'Research',
    technical: 'Technical Guide',
    technology: 'Technical Guide',
    tutorial: 'Tutorial',
    'fashion-tech': 'Fashion Tech',
    economics: 'Economics',
    statistics: 'Statistics',
    'complex-concepts': 'Complex Concepts',
    'problem-solving': 'Problem-Solving',
    'books-writing': 'Books & Writing',
  }

  const cat = String(article.category || '')
  const colorClass = categoryColors[cat] || 'bg-green-500/10 text-green-400 border-green-500/20'
  const label = categoryLabel[cat] || 'Article'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: personalConfig.name,
      url: 'https://m-abbaslab.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'M-AbbasLab',
      url: 'https://m-abbaslab.com',
    },
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    image: article.cover_image || undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://m-abbaslab.com/articles/${article.id}`,
    },
    keywords: article.tags?.join(', ') || undefined,
    articleSection: label,
    wordCount: article.content ? String(article.content).split(/\s+/).length : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex gap-12">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 min-w-0 max-w-4xl"
          >
            <Link
              href="/articles"
              className="inline-flex items-center text-gray-400 hover:text-[#00f0ff] mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Articles
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${colorClass}`}>
                {label}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1.5" />
                {article.published_at ? new Date(String(article.published_at)).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                }) : 'Recent'}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1.5" />
                {article.read_time} min read
              </div>
              {article.content && (
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 mr-1.5" />
                  {String(article.content).split(/\s+/).length.toLocaleString()} words
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1.5" />
                {viewCount.toLocaleString()} views
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Heart className={`w-4 h-4 mr-1.5 ${liked ? 'fill-pink-500 text-pink-500' : ''}`} />
                {likeCount.toLocaleString()} likes
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed mb-8 italic border-l-4 border-[#00f0ff] pl-6 py-2">
              {article.excerpt}
            </p>

            {/* Author & Share Bar */}
            <div className="flex items-center justify-between py-6 border-y border-white/10 mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center text-white font-bold text-xl shrink-0">
                  {personalConfig.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-semibold">{personalConfig.name}</div>
                  <div className="text-sm text-gray-500">Author & Researcher</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-[#1DA1F2] transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-[#0A66C2] transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href={`https://substack.com/share?publication_url=&p=${encodeURIComponent(shareUrl)}&utm_source=substack`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-[#FF6719] transition-colors"
                  title="Share on Substack"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-2.5 rounded-full hover:bg-white/5 text-gray-400 hover:text-[#00f0ff] transition-colors"
                  title={copied ? 'Copied!' : 'Copy link'}
                >
                  {copied ? <ChevronRight className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleLike}
                  className={`p-2.5 rounded-full hover:bg-white/5 transition-colors ${liked ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:text-pink-500'}`}
                  title={liked ? 'Unlike' : 'Like this article'}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-pink-500' : ''}`} />
                </button>
                <button
                  onClick={handleFavorite}
                  className={`p-2.5 rounded-full hover:bg-white/5 transition-colors ${favorited ? 'text-amber-500 bg-amber-500/10' : 'text-gray-400 hover:text-amber-500'}`}
                  title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Bookmark className={`w-5 h-5 ${favorited ? 'fill-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-invert prose-cyan max-w-none mb-16 font-inter">
              <div className="text-gray-300 leading-loose text-lg space-y-6">
                {renderContent(String(article.content || ''))}
              </div>

              {/* Tags Section */}
              {article.tags && (article.tags as any[]).length > 0 && (
                <div className="mt-12 p-8 rounded-3xl glass-panel border border-white/10 bg-gradient-to-br from-[#00f0ff]/5 to-[#7000ff]/5">
                  <h3 className="text-xl font-bold text-white mb-4">Key Takeaways</h3>
                  <div className="flex flex-wrap gap-2">
                    {(article.tags as any[]).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-4 py-2 bg-white/5 text-gray-300 rounded-xl text-sm font-medium flex items-center border border-white/10 hover:border-[#00f0ff]/50 transition-colors cursor-default"
                      >
                        <Tag className="w-3 h-3 mr-2 text-[#00f0ff]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Author Bio */}
            <div className="p-8 rounded-3xl glass-panel border border-white/10 mb-12">
              <div className="flex items-start space-x-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center text-white font-bold text-3xl shrink-0">
                  {personalConfig.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{personalConfig.name}</h3>
                  <p className="text-sm text-[#00f0ff] mb-3">{personalConfig.title || 'Researcher & Technologist'}</p>
                  <p className="text-gray-400 leading-relaxed">
                    {personalConfig.tagline || 'Exploring the intersection of economics, technology, and research.'}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    {personalConfig.social?.twitter && (
                      <a href={personalConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#1DA1F2] transition-colors">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {personalConfig.social?.linkedin && (
                      <a href={personalConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0A66C2] transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {personalConfig.social?.github && (
                      <a href={personalConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter CTA */}
            <div className="p-8 rounded-3xl glass-panel border border-[#00f0ff]/20 text-center mb-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/5 via-transparent to-[#7000ff]/5" />
              <div className="relative z-10">
                <Mail className="w-10 h-10 text-[#00f0ff] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-3 text-white">Enjoyed this article?</h3>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                  Get notified when I publish new research, technical guides, and insights.
                </p>
                {subscribed ? (
                  <p className="text-[#00f0ff] font-semibold">Thanks for subscribing!</p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 px-5 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/50 outline-none text-white placeholder-gray-600"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.5)] transition-all hover:scale-105"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related: any) => (
                    <Link key={related.id} href={`/articles/${related.id}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="glass-panel rounded-2xl border border-white/5 hover:border-[#7000ff]/50 p-6 transition-all duration-300 h-full"
                      >
                        {related.cover_image && (
                          <div className="relative h-32 w-full rounded-xl overflow-hidden mb-4">
                            <Image
                              src={related.cover_image}
                              alt={related.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${categoryColors[related.category] || 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {categoryLabel[related.category] || 'Article'}
                        </span>
                        <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-[#00f0ff] transition-colors">
                          {related.title}
                        </h4>
                        <p className="text-gray-400 text-sm line-clamp-2">{related.excerpt}</p>
                        <div className="flex items-center mt-4 text-sm text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {related.read_time} min read
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Table of Contents Sidebar */}
          {headings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="hidden xl:block w-64 shrink-0"
            >
              <div className="sticky top-24">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Table of Contents</h4>
                <nav className="space-y-1">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block py-1.5 text-sm text-gray-500 hover:text-[#00f0ff] transition-colors border-l-2 border-transparent hover:border-[#00f0ff]/50 ${
                        heading.level === 2 ? 'pl-4' : heading.level === 3 ? 'pl-8' : 'pl-0'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}
