import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen, List } from 'lucide-react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import HolographicBook from '@/components/ui/HolographicBook'

const chapters = [
    { id: 'chapter-1', title: 'System Context, Vision, and Scope' },
    { id: 'chapter-2', title: 'Background Systems and Architectural Foundations' },
    { id: 'chapter-3', title: 'Core System Architecture and Data Models' },
    { id: 'chapter-4', title: 'System Workflows and User Journeys' },
    { id: 'chapter-5', title: 'Assessment, Grading, and Evaluation' },
    { id: 'chapter-6', title: 'Attendance and Engagement Analytics' },
    { id: 'chapter-7', title: 'Skill DNA Intelligence and Analytics' },
    { id: 'chapter-8', title: 'System Evaluation and Scalability' },
    { id: 'chapter-9', title: 'Sample Data and Walkthrough' },
    { id: 'chapter-10', title: 'Prototype and Functional Blueprint' },
    { id: 'chapter-11', title: 'MVP and AI System Clarification' },
    { id: 'chapter-12', title: 'Costing, Tooling, and Revenue Model' },
    { id: 'chapter-13', title: 'Examination and Question Engine' },
    { id: 'chapter-14', title: 'Security, Compliance, and Data Protection' },
    { id: 'chapter-15', title: 'Implementation Plan and Tech Stack' },
]

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
    const resolvedParams = await params;
    const chapterId = resolvedParams.chapter;
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);

    if (chapterIndex === -1) {
        notFound();
    }

    const filePath = path.join(process.cwd(), 'docs', 'ilms', `${chapterId}.md`);

    let content = '';
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading chapter file:', error);
        notFound();
    }

    const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
    const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-24 space-y-8">
                        {/* 3D Visual */}
                        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b from-[#00f0ff]/5 to-[#7000ff]/5">
                            <HolographicBook />
                            <div className="p-4 text-center">
                                <h3 className="text-sm font-bold text-[#00f0ff] uppercase tracking-widest">Project Blueprint</h3>
                                <p className="text-xs text-gray-500 mt-1">ILMS Core Foundations</p>
                            </div>
                        </div>

                        {/* Chapter Navigation */}
                        <div className="glass-panel rounded-3xl border border-white/10 p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center">
                                <List className="w-4 h-4 mr-2 text-[#00f0ff]" />
                                Chapters
                            </h3>
                            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {chapters.map((ch, idx) => (
                                    <Link
                                        key={ch.id}
                                        href={`/work/academic/ilms/${ch.id}`}
                                        className={`block text-xs py-2 px-3 rounded-lg transition-all ${ch.id === chapterId
                                            ? 'bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 font-bold'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="mr-2 opacity-50">{idx + 1}.</span>
                                        {ch.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/work/academic/ilms"
                            className="inline-flex items-center text-gray-400 hover:text-[#00f0ff] transition-colors group px-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Index
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <BookOpen className="w-4 h-4 text-[#00f0ff]" />
                            <span className="font-medium text-white">{chapters[chapterIndex].title}</span>
                        </div>
                        <span className="text-xs text-gray-500">Chapter {chapterIndex + 1} of {chapters.length}</span>
                    </div>

                    {/* Chapter Content */}
                    <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden mb-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/5 blur-[80px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7000ff]/5 blur-[80px] -z-10" />

                        <MarkdownRenderer content={content} />
                    </div>

                    {/* Pagination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prevChapter ? (
                            <Link
                                href={`/work/academic/ilms/${prevChapter.id}`}
                                className="flex flex-col p-6 glass-panel rounded-2xl border border-white/5 hover:border-[#00f0ff]/30 transition-all group items-start"
                            >
                                <span className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                    <ChevronLeft className="w-3 h-3 mr-1" /> Previous
                                </span>
                                <span className="text-white font-bold group-hover:text-[#00f0ff] transition-colors">{prevChapter.title}</span>
                            </Link>
                        ) : <div />}

                        {nextChapter ? (
                            <Link
                                href={`/work/academic/ilms/${nextChapter.id}`}
                                className="flex flex-col p-6 glass-panel rounded-2xl border border-white/5 hover:border-[#00f0ff]/30 transition-all group items-end text-right"
                            >
                                <span className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center">
                                    Next <ChevronRight className="w-3 h-3 ml-1" />
                                </span>
                                <span className="text-white font-bold group-hover:text-[#00f0ff] transition-colors">{nextChapter.title}</span>
                            </Link>
                        ) : <div />}
                    </div>
                </main>
            </div>
        </div>
    )
}
