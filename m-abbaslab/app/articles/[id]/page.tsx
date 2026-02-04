'use client'

import { useParams, notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag, ArrowLeft, Share2, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'

export default function ArticleDetailPage() {
    const params = useParams()
    const id = params.id as string

    const article = (personalConfig.articles as any[]).find((a: any) => a.id === id)

    if (!article) {
        notFound()
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link
                    href="/articles"
                    className="inline-flex items-center text-gray-400 hover:text-[#00f0ff] mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Articles
                </Link>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
                        {String(article.category).charAt(0).toUpperCase() + String(article.category).slice(1)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {article.published_at ? new Date(String(article.published_at)).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'Recent'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {article.read_time} min read
                    </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
                    {article.title}
                </h1>

                <div className="flex items-center justify-between py-6 border-y border-white/10 mb-12">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center text-white font-bold text-xl">
                            {personalConfig.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-white font-semibold">{personalConfig.name}</div>
                            <div className="text-sm text-gray-500">Author & Researcher</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                            <Bookmark className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-invert prose-cyan max-w-none mb-16 font-inter">
                    <p className="text-xl text-gray-400 leading-relaxed mb-8 italic border-l-4 border-[#00f0ff] pl-6 py-2">
                        {article.excerpt}
                    </p>

                    <div className="text-gray-300 leading-loose text-lg space-y-6">
                        {String(article.content).split('\n\n').map((para: string, i: number) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>

                    <div className="mt-12 p-8 rounded-3xl glass-panel border border-white/10 bg-gradient-to-br from-[#00f0ff]/5 to-[#7000ff]/5">
                        <h3 className="text-xl font-bold text-white mb-4">Key Innovation Takeaways</h3>
                        <ul className="space-y-3">
                            {(article.tags as any[]).map((tag: string) => (
                                <li key={tag} className="flex items-center text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] mr-3" />
                                    Understanding {tag} integration in modern systems.
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-20">
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
            </motion.div>
        </div>
    )
}
