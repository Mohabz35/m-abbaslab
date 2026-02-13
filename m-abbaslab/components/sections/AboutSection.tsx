'use client'

import { motion } from 'framer-motion'
import { ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'

export default function AboutSection() {
    return (
        <section className="py-20 bg-black/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center space-x-2 mb-4">
                            <User className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">About Me</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-6 text-white">
                            Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Economics</span> & Technology
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-6">
                            {personalConfig.tagline}
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            My journey involves a unique blend of academic rigor in economics and practical expertise in modern software engineering.
                            I build systems that are not just functional, but intelligent and aesthetically compelling.
                        </p>

                        <Link
                            href="/about"
                            className="inline-flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all text-white font-medium group"
                        >
                            More About My Journey
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                            {/* Abstract code/data visualization placeholder */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black p-8 flex flex-col justify-center">
                                <div className="font-mono text-sm text-green-400/80 mb-2">$ init_profile --verbose</div>
                                <div className="font-mono text-xs text-blue-300/60 leading-relaxed">
                                    Loading module: Economics... [OK]<br />
                                    Loading module: Statistics... [OK]<br />
                                    Loading module: WebGL... [OK]<br />
                                    Loading module: React... [OK]<br />
                                    <br />
                                    Compiling assets...<br />
                                    <span className="text-yellow-400/80">Warning: High levels of creativity detected.</span>
                                </div>
                            </div>

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
