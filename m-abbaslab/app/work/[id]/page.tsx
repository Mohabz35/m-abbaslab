'use client'

import { useParams, notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ExternalLink, Github, Code, ArrowLeft, Layers, Calendar, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'

export default function ProjectDetailPage() {
    const params = useParams()
    const id = params.id as string

    const project = (personalConfig.projects as any[]).find((p: any) => p.id === id)

    if (!project) {
        notFound()
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link
                    href="/work"
                    className="inline-flex items-center text-gray-400 hover:text-[#00f0ff] mb-12 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Projects
                </Link>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
                                {String(project.category).toUpperCase()}
                            </span>
                            <div className="flex items-center text-sm text-gray-500 font-mono">
                                <Calendar className="w-4 h-4 mr-2" />
                                {project.year || '2024'}
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
                            {project.title}
                        </h1>

                        <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {project.live_url && project.live_url !== '#' && (
                                <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-[#00f0ff] text-black font-bold rounded-xl flex items-center gap-3 hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all"
                                >
                                    View Live <ExternalLink className="w-5 h-5" />
                                </a>
                            )}
                            {project.github_url && project.github_url !== '#' && (
                                <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all"
                                >
                                    Source Code <Github className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        {/* Mockups / Placeholder Illustration */}
                        <div className="aspect-square glass-panel rounded-[3rem] border border-white/5 flex items-center justify-center p-12 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/20 via-transparent to-[#7000ff]/20" />
                            <div className="relative z-10 w-full aspect-video bg-black/60 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center">
                                <Code className="w-16 h-16 text-[#00f0ff] animate-pulse" />
                            </div>

                            {/* Floating elements */}
                            <div className="absolute top-12 right-12 w-24 h-24 bg-[#7000ff]/20 rounded-full blur-3xl animate-pulse-slow" />
                            <div className="absolute bottom-12 left-12 w-32 h-32 bg-[#00f0ff]/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />
                        </div>
                    </div>
                </div>

                {/* Content Tabs / Info Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                                <Layers className="w-6 h-6 text-[#7000ff]" />
                                System Overview
                            </h2>
                            <div className="text-gray-300 text-lg leading-loose space-y-6">
                                {project.longDescription ? (
                                    String(project.longDescription).split('\n\n').map((para: string, i: number) => (
                                        <p key={i}>{para}</p>
                                    ))
                                ) : (
                                    <p>Detailed architecture and methodology for the {project.title} are focused on bridging {project.category} with modern statistical approaches.</p>
                                )}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold text-white mb-6">Key Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['Real-time dynamic analysis', 'Statistical validation', 'Cloud-native architecture', 'Interactive visualization'].map((item) => (
                                    <div key={item} className="p-6 glass-panel rounded-2xl border border-white/5 flex items-start gap-4">
                                        <CheckCircle2 className="w-6 h-6 text-[#00f0ff] shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-white">{item}</h4>
                                            <p className="text-sm text-gray-500">Implemented with high performance and accessibility in mind.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8">
                        <div className="p-8 glass-panel rounded-3xl border border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white mb-6">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {(project.technologies as any[]).map((tech: string) => (
                                    <span
                                        key={tech}
                                        className="px-4 py-2 bg-black/40 text-[#00f0ff] border border-[#00f0ff]/20 rounded-xl text-sm font-medium"
                                    >
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 glass-panel rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold text-white mb-4">Project Status</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-white font-medium">{project.status || 'Active'}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </motion.div>
        </div>
    )
}
