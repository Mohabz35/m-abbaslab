'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

export default function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-br from-blue-900/20 to-purple-900/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                        Ready to <span className="text-blue-400">Innovate?</span>
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                        Whether you need a data-driven solution, a research partner, or cutting-edge web development,
                        I'm always open to discussing new opportunities.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 flex items-center shadow-lg shadow-blue-500/20"
                        >
                            Start a Conversation
                            <Mail className="ml-2 w-5 h-5" />
                        </Link>

                        <Link
                            href="/work"
                            className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center"
                        >
                            View Portfolio
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
