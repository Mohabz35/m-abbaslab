'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Play, Grid, Image as ImageIcon, X, ChevronLeft, Film } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { personalConfig } from '@/config/personal'

// Combining direct images with a specialized gallery structure
const galleryItems = [
    // Images from config/personal.ts
    { id: 1, type: 'image', src: '/images/fashion/runway-blue-suit.jpg', category: 'Runway', title: 'Blue Sequin Suit - Kasarani' },
    { id: 2, type: 'image', src: '/images/fashion/editorial-fur-black.jpg', category: 'Editorial', title: 'Black Fur Aesthetic' },
    { id: 3, type: 'image', src: '/images/fashion/mr-fashion-kitui-group.jpg', category: 'Awards', title: 'Mr. Fashion Kitui Victory' },
    { id: 4, type: 'image', src: '/images/fashion/runway-creative.jpg', category: 'Runway', title: 'Creative Avant-Garde' },
    { id: 5, type: 'image', src: '/images/fashion/awards-group.jpg', category: 'Awards', title: 'Mr. Kipawa Media Group' },
    { id: 6, type: 'image', src: '/images/fashion/kipawa-duo.jpg', category: 'Awards', title: 'Kipawa Afrika Duo' },
    { id: 7, type: 'image', src: '/images/fashion/editorial-fur-black.jpg', category: 'Editorial', title: 'Black Fur Aesthetic' },
    { id: 8, type: 'image', src: '/images/fashion/mr-fashion-kitui-group.jpg', category: 'Awards', title: 'Mr. Fashion Kitui Victory' },
    { id: 9, type: 'image', src: '/images/fashion/runway-creative.jpg', category: 'Runway', title: 'Creative Avant-Garde' },
    { id: 10, type: 'image', src: '/images/fashion/awards-group.jpg', category: 'Awards', title: 'Mr. Kipawa Media Group' },
    // Batch 2 Additions
    { id: 11, type: 'image', src: '/images/fashion/mr-alba-group.jpg', category: 'Awards', title: 'Mr. Alba 2024 Team' },
    { id: 12, type: 'image', src: '/images/fashion/runway-amani-gold.jpg', category: 'Runway', title: 'Mr. Amani Gold Runway' },
    { id: 13, type: 'image', src: '/images/fashion/white-suit-trio.jpg', category: 'Event', title: 'B&W Anniversary Gala' },
    { id: 14, type: 'image', src: '/images/fashion/pageant-blue-couple.jpg', category: 'Pageant', title: 'Miss Githurai & Mr. Kipawa' },
    { id: 15, type: 'image', src: '/images/fashion/white-suit-cane-seated.jpg', category: 'Editorial', title: 'Modern Royal Portrait' },
    // Batch 3 Additions
    { id: 16, type: 'image', src: '/images/fashion/mr-fresher-chuka-group.jpg', category: 'Awards', title: 'Mr. Fresher Chuka 2025/26' },
    { id: 17, type: 'image', src: '/images/fashion/black-gold-suit-standing.jpg', category: 'Editorial', title: 'Voguish Black & Gold' },
    { id: 18, type: 'image', src: '/images/fashion/black-gold-suit-seated.jpg', category: 'Editorial', title: 'The Gold Standard' },
    { id: 19, type: 'image', src: '/images/fashion/runway-fur-night-cane.jpg', category: 'Runway', title: 'Night Runway: The Cane' },
    { id: 20, type: 'image', src: '/images/fashion/group-pentagon-coalition.jpg', category: 'Leadership', title: 'Student Leadership Coalition' },
    // Batch 4 Additions
    { id: 21, type: 'image', src: '/images/fashion/mr-miss-glam-haven-crowned.jpg', category: 'Pageant', title: 'Mr. & Miss Glam Haven Crowned' },
    { id: 22, type: 'image', src: '/images/fashion/red-black-split-suit.jpg', category: 'High Fashion', title: 'Red & Black Split Blazer' },
    { id: 23, type: 'image', src: '/images/fashion/mr-chuka-university-trio.jpg', category: 'Pageant', title: 'Mr. Chuka University 2024' },
    { id: 24, type: 'image', src: '/images/fashion/creative-horror-makeup-group.jpg', category: 'Creative', title: 'Creative Horror Concept' },
    { id: 25, type: 'image', src: '/images/fashion/joker-face-paint-solo.jpg', category: 'Creative', title: 'The Joker: Creative Solo' },
    // Batch 5 Additions
    { id: 26, type: 'image', src: '/images/fashion/mr-yymh-portrait-green.jpg', category: 'Awards', title: 'Mr. YYMH Title Holder' },
    { id: 27, type: 'image', src: '/images/fashion/mr-yymh-winners-group.jpg', category: 'Awards', title: 'Mr. YYMH Winners Circle' },
    { id: 28, type: 'image', src: '/images/fashion/mr-yymh-prep.jpg', category: 'Behind The Scenes', title: 'Getting Ready: Mr. YYMH' },
    { id: 29, type: 'image', src: '/images/fashion/mr-glam-haven-sashing.jpg', category: 'Behind The Scenes', title: 'Mr. Glam Haven Sashing Moment' },
    { id: 30, type: 'image', src: '/images/fashion/kasarani-family-support.jpg', category: 'Event', title: 'Family & Support at Kasarani' },
    // Batch 6 Additions
    { id: 31, type: 'image', src: '/images/fashion/mr-amani-gold-group-red-carpet.jpg', category: 'Awards', title: 'Mr. Amani Gold: Red Carpet' },
    { id: 32, type: 'image', src: '/images/fashion/creative-recyclable-paper-angel.jpg', category: 'Creative', title: 'Recycled Paper Angel Concept' },
    { id: 33, type: 'image', src: '/images/fashion/creative-mummy-wrap-runway.jpg', category: 'Creative', title: 'The Mummy: Runway Concept' },
    { id: 34, type: 'image', src: '/images/fashion/creative-cd-disc-outfit.jpg', category: 'Creative', title: 'Digital Age: CD Disc Outfit' },
    { id: 35, type: 'image', src: '/images/fashion/blue-velvet-suit-portrait.jpg', category: 'High Fashion', title: 'Blue Velvet Portrait' },
    // Placeholders for expanded content
    { id: 36, type: 'video', src: '/images/fashion/runway-blue-suit.jpg', category: 'Runway', title: 'Runway Walk 2025 (Clip)', duration: '0:45' },
    { id: 37, type: 'video', src: '/images/fashion/mr-fashion-kitui-group.jpg', category: 'Behind The Scenes', title: 'Backstage Kitui Fashion', duration: '1:20' },
]

export default function GalleryPage() {
    const [filter, setFilter] = useState('all')
    const [dynamicMedia, setDynamicMedia] = useState<any[]>([])
    const [selectedItem, setSelectedItem] = useState<any | null>(null)

    useEffect(() => {
        async function fetchDynamicMedia() {
            const { supabase } = await import('@/lib/supabase')
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .order('created_at', { ascending: false })

            if (data && !error) {
                const formatted = data.map(item => ({
                    id: `db-${item.id}`,
                    type: item.type,
                    src: item.url,
                    category: item.category || 'Portfolio',
                    title: item.caption || 'Untitled Asset',
                    isDynamic: true
                }))
                setDynamicMedia(formatted)
            }
        }
        fetchDynamicMedia()
    }, [])

    const allItems = [...dynamicMedia, ...galleryItems]
    const filteredItems = allItems.filter(item => filter === 'all' || item.type === filter || item.category === filter)

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/10 via-black to-black -z-10" />

            {/* Navigation */}
            <nav className="p-6 flex justify-between items-center relative z-20">
                <Link href="/fashion" className="flex items-center text-gray-400 hover:text-white transition-colors group">
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </Link>
                <div className="text-xl font-bold tracking-widest uppercase">
                    Visual <span className="text-pink-500">Archive</span>
                </div>
                <div className="w-24" /> {/* Spacer */}
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8">

                {/* Filter Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {[
                        { id: 'all', label: 'All Media', icon: Grid },
                        { id: 'image', label: 'Photos', icon: ImageIcon },
                        { id: 'video', label: 'Videos & Clips', icon: Play },
                        { id: 'Runway', label: 'Runway', icon: Camera },
                        { id: 'Editorial', label: 'Editorial', icon: Film },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`flex items-center px-6 py-3 rounded-full border transition-all duration-300 ${filter === tab.id
                                ? 'bg-pink-500 text-white border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Gallery Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence>
                        {filteredItems.map((item) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-pink-500/50 transition-colors"
                            >
                                {/* Image/Thumbnail */}
                                <Image
                                    src={item.src}
                                    alt={item.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                    loading="lazy"
                                    quality={85}
                                />

                                {/* Video Indicator */}
                                {item.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                                            <Play className="w-6 h-6 text-white fill-white" />
                                        </div>
                                    </div>
                                )}

                                {/* Overlay Info */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-pink-400 text-xs font-bold uppercase tracking-wider">{item.category}</span>
                                        {item.type === 'video' && (
                                            <span className="text-gray-400 text-xs font-mono bg-black/50 px-2 py-0.5 rounded">{item.duration}</span>
                                        )}
                                    </div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{item.title}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Lightbox Modal */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-xl"
                            onClick={() => setSelectedItem(null)}
                        >
                            {/* Close Button */}
                            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50">
                                <X className="w-8 h-8" />
                            </button>

                            <div
                                className="relative max-w-5xl w-full max-h-full flex flex-col items-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {selectedItem.type === 'video' ? (
                                    <div className="w-full aspect-video bg-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                        <img src={selectedItem.src} className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                                        <div className="relative z-10 text-center">
                                            <Play className="w-20 h-20 text-white/50 mx-auto mb-4" />
                                            <p className="text-xl text-white font-bold">Video Playback Placeholder</p>
                                            <p className="text-gray-400">Video source not connected yet.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative w-auto max-h-[80vh] aspect-[3/4]">
                                        <Image
                                            src={selectedItem.src}
                                            alt={selectedItem.title}
                                            fill
                                            className="object-contain rounded-lg shadow-2xl"
                                            sizes="(max-width: 1024px) 90vw, 1200px"
                                            quality={95}
                                        />
                                    </div>
                                )}

                                <div className="mt-6 text-center">
                                    <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                                    <span className="px-3 py-1 rounded-full border border-pink-500/30 text-pink-400 text-sm">
                                        {selectedItem.category}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
