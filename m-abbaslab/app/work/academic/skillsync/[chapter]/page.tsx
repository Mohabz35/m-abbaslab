import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Brain, Info } from 'lucide-react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import HolographicBook from '@/components/ui/HolographicBook'

const chapters = [
    { id: 'chapter-1', title: 'Academic Analysis & Validation' },
    { id: 'chapter-2', title: 'Mathematical Models & Equations' },
    { id: 'chapter-3', title: 'System Documentation & Architecture' },
    { id: 'chapter-4', title: 'The Evolution Engine (Prompt Guide)' },
]

export default async function SkillSyncChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
    const resolvedParams = await params;
    const chapterId = resolvedParams.chapter;
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);

    if (chapterIndex === -1) {
        notFound();
    }

    const filePath = path.join(process.cwd(), 'docs', 'skillsync', `${chapterId}.md`);

    let content = '';
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading SkillSync chapter file:', error);
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
                        {/* Visual Element */}
                        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b from-[#7000ff]/10 to-[#00f0ff]/5 p-2">
                            <div className="relative group">
                                <HolographicBook />
                                <div className="absolute inset-x-0 bottom-4 text-center">
                                    <span className="text-[10px] font-bold text-[#7000ff] uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">Evolution Engine v1.0</span>
                                </div>
                            </div>
                        </div>

                        {/* Chapter Navigation */}
                        <div className="glass-panel rounded-3xl border border-white/10 p-6">
                            <h3 className="text-white font-bold mb-4 flex items-center text-sm">
                                <Brain className="w-4 h-4 mr-2 text-[#7000ff]" />
                                Skill DNA Modules
                            </h3>
                            <div className="space-y-1 pr-2">
                                {chapters.map((ch, idx) => (
                                    <Link
                                        key={ch.id}
                                        href={`/work/academic/skillsync/${ch.id}`}
                                        className={`block text-xs py-2.5 px-4 rounded-xl transition-all border ${ch.id === chapterId
                                                ? 'bg-[#7000ff]/20 text-white border-[#7000ff]/40 font-bold shadow-[0_0_15px_rgba(112,0,255,0.2)]'
                                                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="mr-2 opacity-30">0{idx + 1}</span>
                                        {ch.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Scientific Note */}
                        <div className="p-4 rounded-2xl bg-[#7000ff]/5 border border-[#7000ff]/10">
                            <div className="flex items-start space-x-3">
                                <Info className="w-4 h-4 text-[#7000ff] mt-0.5" />
                                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                    This framework is based on Ebbinghaus forgetting curves and learning saturation models.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/work/academic/skillsync"
                            className="inline-flex items-center text-xs text-gray-500 hover:text-[#7000ff] transition-colors group px-2"
                        >
                            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Intelligence Hub
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="glass-panel rounded-[40px] p-8 md:p-14 border border-white/10 relative overflow-hidden mb-12 min-h-[600px]">
                        {/* Background glow matching SkillSync purple/cyan theme */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7000ff]/5 blur-[120px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00f0ff]/5 blur-[120px] -z-10" />

                        <MarkdownRenderer content={content} />
                    </div>

                    {/* Pagination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prevChapter ? (
                            <Link
                                href={`/work/academic/skillsync/${prevChapter.id}`}
                                className="flex flex-col p-8 glass-panel rounded-3xl border border-white/5 hover:border-[#7000ff]/30 transition-all group items-start"
                            >
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                                    <ChevronLeft className="w-3 h-3 mr-1" /> Decrypting Previous Node
                                </span>
                                <span className="text-lg font-bold text-white group-hover:text-[#7000ff] transition-colors">{prevChapter.title}</span>
                            </Link>
                        ) : <div />}

                        {nextChapter ? (
                            <Link
                                href={`/work/academic/skillsync/${nextChapter.id}`}
                                className="flex flex-col p-8 glass-panel rounded-3xl border border-white/5 hover:border-[#7000ff]/30 transition-all group items-end text-right"
                            >
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                                    Synthesizing Next Node <ChevronRight className="w-3 h-3 ml-1" />
                                </span>
                                <span className="text-lg font-bold text-white group-hover:text-[#7000ff] transition-colors">{nextChapter.title}</span>
                            </Link>
                        ) : <div />}
                    </div>
                </main>
            </div>
        </div>
    )
}
