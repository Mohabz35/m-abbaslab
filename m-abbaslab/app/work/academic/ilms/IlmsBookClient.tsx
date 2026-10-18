'use client'

import { motion } from 'framer-motion'
import { Book, ChevronRight, Sparkles, Layout, Database, Shield, Cpu, Target } from 'lucide-react'
import Link from 'next/link'

const chapters = [
    { id: 'chapter-1', title: 'System Context, Vision, and Scope', icon: Target, color: 'text-blue-400', desc: 'The foundational vision and institutional boundaries of the ILMS.' },
    { id: 'chapter-2', title: 'Background Systems and Architectural Foundations', icon: Layout, color: 'text-purple-400', desc: 'Situating the ILMS within the landscape of modern academic platforms.' },
    { id: 'chapter-3', title: 'Core System Architecture and Data Models', icon: Database, color: 'text-cyan-400', desc: 'The technical core: identity, academic structure, and intelligence layers.' },
    { id: 'chapter-4', title: 'System Workflows and User Journeys', icon: Cpu, color: 'text-emerald-400', desc: 'Translating static data models into living, role-specific operational logic.' },
    { id: 'chapter-5', title: 'Assessment, Grading, and Evaluation', icon: Book, color: 'text-amber-400', desc: 'Defining the precision, fairness, and traceability of academic outcomes.' },
    { id: 'chapter-6', title: 'Attendance and Engagement Analytics', icon: Sparkles, color: 'text-pink-400', desc: 'Transforming participation signals into reliable institutional records.' },
    { id: 'chapter-7', title: 'Skill DNA Intelligence and Analytics', icon: Cpu, color: 'text-indigo-400', desc: 'Inferring competencies from academic evidence to guide student growth.' },
    { id: 'chapter-8', title: 'System Evaluation and Scalability', icon: Shield, color: 'text-rose-400', desc: 'Architectural soundess and readiness for high-concurrency deployment.' },
    { id: 'chapter-9', title: 'Sample Data and Walkthrough', icon: Layout, color: 'text-orange-400', desc: 'Concrete scenarios demonstrating the end-to-end mission lifecycle.' },
    { id: 'chapter-10', title: 'Prototype and Functional Blueprint', icon: Database, color: 'text-teal-400', desc: 'The first tangible system form: validating logic and usability.' },
    { id: 'chapter-11', title: 'MVP and AI System Clarification', icon: Cpu, color: 'text-violet-400', desc: 'Defining the ethically constrained role of AI in academic assistance.' },
    { id: 'chapter-12', title: 'Costing, Tooling, and Revenue Model', icon: Sparkles, color: 'text-yellow-400', desc: 'The business case for a student-led, value-driven academic startup.' },
    { id: 'chapter-13', title: 'Examination and Question Engine', icon: Book, color: 'text-blue-500', desc: 'Design, delivery, and evaluation of high-integrity online assessments.' },
    { id: 'chapter-14', title: 'Security, Compliance, and Data Protection', icon: Shield, color: 'text-red-400', desc: 'Least-privilege access and data minimization for institutional trust.' },
    { id: 'chapter-15', title: 'Implementation Plan and Tech Stack', icon: Cpu, color: 'text-slate-400', desc: 'The execution roadmap: from documentation to working software.' },
]

export default function ILMSDocsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                    <Book className="w-8 h-8 text-[#00f0ff]" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                    ILMS <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">Documentation</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    Intelligent Learning Management System (ILMS) - Foundations, Architecture, and Implementation Roadmap for a modern academic operating system.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter, index) => {
                    const Icon = chapter.icon
                    return (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <Link
                                href={`/work/academic/ilms/${chapter.id}`}
                                className="group p-6 glass-panel rounded-2xl border border-white/5 hover:border-[#00f0ff]/30 transition-all duration-300 flex items-start space-x-4 h-full"
                            >
                                <div className={`p-3 rounded-xl bg-white/5 transition-colors group-hover:bg-white/10 ${chapter.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Chapter {index + 1}</div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-[#00f0ff] transition-colors leading-tight">
                                        {chapter.title}
                                    </h3>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#00f0ff] group-hover:translate-x-1 transition-all" />
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

            {/* Startup Vision CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-20 p-8 md:p-12 rounded-3xl glass-panel border border-[#00f0ff]/20 text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/5 via-transparent to-[#7000ff]/5" />
                <div className="relative z-10">
                    <Sparkles className="w-12 h-12 text-[#00f0ff] mx-auto mb-6 opacity-50" />
                    <h2 className="text-3xl font-bold mb-4 text-white">The SDK Startup Vision</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                        This documentation outlines more than just a system—it is a blueprint for a student-led startup aiming to fix systemic issues in academic management.
                    </p>
                    <Link
                        href="/work/academic/ilms/chapter-12"
                        className="inline-flex items-center px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[#00f0ff] font-semibold hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 transition-all"
                    >
                        Explore the Business Case <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
