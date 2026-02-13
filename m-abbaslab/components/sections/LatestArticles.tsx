'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'
import { supabase } from '@/lib/supabase'

export default function LatestArticles() {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchArticles = async () => {
            let dynamicArticles: any[] = []

            if (supabase) {
                const { data } = await supabase
                    .from('articles')
                    .select('*')
                    .eq('published', true)
                    .order('published_at', { ascending: false })
                    .limit(3)

                if (data) dynamicArticles = data
            }

            // Combine with static articles and sort by date
            const allArticles = [
                ...dynamicArticles,
                ...personalConfig.articles
            ].sort((a, b) => {
                return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
            }).slice(0, 3) // Take top 3 most recent

            setArticles(allArticles)
            setLoading(false)
        }

        fetchArticles()
    }, [])

    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-2 text-white">Latest Insights</h2>
                        <p className="text-gray-400">Thoughts on technology, economics, and the future.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="hidden md:block"
                    >
                        <Link
                            href="/articles"
                            className="group inline-flex items-center text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                        >
                            Explore More Articles
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {articles.map((article, index) => (
                        <motion.article
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all flex flex-col h-full"
                        >
                            <div className="mb-4">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
                                    {article.category}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                {article.title}
                            </h3>

                            <p className="text-gray-400 text-sm mb-6 flex-grow line-clamp-3">
                                {article.excerpt}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-500">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(article.published_at).getFullYear()}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {article.read_time} min
                                    </div>
                                </div>

                                <Link
                                    href={`/articles/${article.id}`}
                                    className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
                                >
                                    Read
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 text-center md:hidden"
                >
                    <Link
                        href="/articles"
                        className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-blue-400 font-semibold hover:bg-white/10 transition-colors"
                    >
                        Explore More Articles
                        <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}
