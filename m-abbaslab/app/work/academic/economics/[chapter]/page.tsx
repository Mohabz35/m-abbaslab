import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, LineChart, Info, BarChart3 } from 'lucide-react'
import MarkdownRenderer from '@/components/ui/MarkdownRenderer'
import HolographicBook from '@/components/ui/HolographicBook'

const chapters = [
    { id: 'chapter-1', title: 'Introduction & Background' },
    { id: 'chapter-2', title: 'System Overview & Architecture' },
    { id: 'chapter-3', title: 'Data Pipeline Implementation' },
    { id: 'chapter-4', title: 'ML Model Design (LSTM/GRU)' },
    { id: 'chapter-5', title: 'Statistical Validation' },
    { id: 'chapter-6', title: 'Model Versioning & MLOps' },
    { id: 'chapter-7', title: 'Real-Time Inference API' },
    { id: 'chapter-8', title: 'Cloud-Native Deployment' },
    { id: 'chapter-9', title: 'Interactive Visualization & Analytics' },
    { id: 'chapter-10', title: 'Security, Ethics & Limitations' },
    { id: 'chapter-11', title: 'Conclusion & Future Work' },
]

export default async function EconomicsChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
    const resolvedParams = await params;
    const chapterId = resolvedParams.chapter;
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);

    if (chapterIndex === -1) {
        notFound();
    }

    const filePath = path.join(process.cwd(), 'docs', 'economics', `${chapterId}.md`);

    let content = '';
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading Economics chapter file:', error);
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
                        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden bg-gradient-to-b from-blue-500/10 to-emerald-500/5 p-2">
                            <div className="relative group">
                                <HolographicBook />
                                <div className="absolute inset-x-0 bottom-4 text-center">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">PEFM Engine v2.4</span>
                                </div>
                            </div>
                        </div>

                        {/* Chapter Navigation */}
                        <div className="glass-panel rounded-3xl border border-white/10 p-6 bg-slate-900/50">
                            <h3 className="text-white font-bold mb-4 flex items-center text-sm">
                                <BarChart3 className="w-4 h-4 mr-2 text-blue-400" />
                                PEFM Modules
                            </h3>
                            <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                {chapters.map((ch, idx) => (
                                    <Link
                                        key={ch.id}
                                        href={`/work/academic/economics/${ch.id}`}
                                        className={`block text-[11px] py-2 px-3 rounded-lg transition-all border ${ch.id === chapterId
                                                ? 'bg-blue-500/20 text-white border-blue-500/40 font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="mr-2 opacity-30 italic">{idx + 1}.</span>
                                        {ch.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Technical Note */}
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-start space-x-3">
                                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                                <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                    The PEFM architecture identifies structural breaks using Chow tests and learns regime-shifting behavior via stacked LSTMs.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/work/academic/economics"
                            className="inline-flex items-center text-xs text-gray-500 hover:text-blue-400 transition-colors group px-2"
                        >
                            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Forecasting Hub
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <div className="glass-panel rounded-[40px] p-8 md:p-14 border border-white/10 relative overflow-hidden mb-12 min-h-[600px] bg-slate-950/40">
                        {/* Background glow matching blue/emerald theme */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] -z-10" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -z-10" />

                        <MarkdownRenderer content={content} />
                    </div>

                    {/* Pagination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {prevChapter ? (
                            <Link
                                href={`/work/academic/economics/${prevChapter.id}`}
                                className="flex flex-col p-8 glass-panel rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group items-start bg-slate-900/40"
                            >
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                                    <ChevronLeft className="w-3 h-3 mr-1" /> Previous Section
                                </span>
                                <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{prevChapter.title}</span>
                            </Link>
                        ) : <div />}

                        {nextChapter ? (
                            <Link
                                href={`/work/academic/economics/${nextChapter.id}`}
                                className="flex flex-col p-8 glass-panel rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group items-end text-right bg-slate-900/40"
                            >
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center">
                                    Next Section <ChevronRight className="w-3 h-3 ml-1" />
                                </span>
                                <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{nextChapter.title}</span>
                            </Link>
                        ) : <div />}
                    </div>
                </main>
            </div>
        </div>
    )
}
