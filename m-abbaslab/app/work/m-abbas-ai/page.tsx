'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowLeft, Brain, Cpu, Eye, Mic, Hand, Zap, Activity,
    ChevronDown, Play, Pause, RotateCcw, ArrowRight, Layers,
    Radio, Scan, GitBranch, Award
} from 'lucide-react'

// ─── Data ────────────────────────────────────────────────────────────────────

const layers = [
    {
        id: 'structure',
        number: '01',
        title: 'The Structure',
        subtitle: 'The Body',
        color: '#00f0ff',
        glow: 'rgba(0,240,255,0.4)',
        icon: Layers,
        tagline: 'Carbon, Silicone & Precision',
        description:
            'A lightweight endoskeleton of carbon fiber and aircraft-grade aluminum houses all motors, computers, and power systems — engineered to mimic exact human proportions and joint articulation.',
        features: [
            { icon: Zap, title: 'Series Elastic Actuators', detail: 'Spring-loaded motors enabling compliant, safe, force-controlled movement for a natural handshake or gentle touch.' },
            { icon: Scan, title: 'Multi-layer Silicone Skin', detail: 'Pigmented outer layer matching exact skin tone with simulated pores. Sub-layer of soft foam mimics the give of muscle and fat.' },
            { icon: Radio, title: '3D-Scanned Replica', detail: 'Full-body 3D scan captures precise anthropometry — every curve, proportion, and dimension translated into the physical frame.' },
        ],
    },
    {
        id: 'movement',
        number: '02',
        title: 'The Movement',
        subtitle: 'Fluidity & Grace',
        color: '#7000ff',
        glow: 'rgba(112,0,255,0.4)',
        icon: Activity,
        tagline: 'From Creepy to Captivating',
        description:
            'Movement is what separates an uncanny statue from a living presence. Every gesture, stride, and micro-expression is drawn from a real motion-capture session.',
        features: [
            { icon: Play, title: 'Motion Capture Library', detail: 'A full-body MoCap suit records my personal walking gait, head tilts, talking gestures, and fidget patterns to form the robot\'s movement vocabulary.' },
            { icon: GitBranch, title: 'Dynamic Balancing Engine', detail: 'A real-time gait algorithm — inspired by Atlas — continuously recalculates center of gravity, enabling smooth walking, turning, and push-recovery.' },
            { icon: Hand, title: 'Fine Motor Hand Control', detail: 'Each finger driven by multiple micro-motors. A dedicated hand-processor manages precise pressure: firm enough for a handshake, gentle enough for a coffee cup.' },
        ],
    },
    {
        id: 'intelligence',
        number: '03',
        title: 'The Intelligence',
        subtitle: 'The AI Mind',
        color: '#ff006e',
        glow: 'rgba(255,0,110,0.4)',
        icon: Brain,
        tagline: 'A Mind That Understands You',
        description:
            'The body is a vessel. The intelligence is what makes each interaction feel natural, warm, and eerily real — because it truly understands social context.',
        features: [
            { icon: Eye, title: 'Multimodal Sensory Fusion', detail: 'Cameras track facial expressions and body language. Microphones detect emotional timbre. Tactile skin senses touch force. All fused into a single social-context graph.' },
            { icon: Brain, title: 'Large Action Model', detail: 'A central LAM — trained on vast human interaction data and my personal personality profile — maps sensory input to a synchronized tri-layer response: words, tone, and body language.' },
            { icon: Cpu, title: 'Continuous Learning', detail: 'Every interaction is logged and used to refine the model. Over time, the android anticipates needs, adapts phrasing, and grows astonishingly natural.' },
        ],
    },
]

const responseExample = {
    trigger: '"You look tired, Abbas."',
    visual: 'Slumped posture detected + weary sigh in audio',
    linguistic: '"Long day? Can I get you a drink?"',
    prosodic: 'Warm, concerned tone with soft pacing',
    kinesic: 'Slight forward lean + gentle shoulder touch + eyebrows raised',
}

const techPills = [
    'Series Elastic Actuators', 'Carbon Fiber Frame', 'Silicone Skin',
    'Motion Capture', 'Dynamic Gait Engine', 'Fine Motor Control',
    'Computer Vision', 'Voice Cloning', 'Emotion Recognition',
    'Tactile Sensing', 'Large Action Model', 'Multimodal Fusion',
    'Continuous Learning', 'Saccadic Eye Movement',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParticleField() {
    const particles = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 4,
        opacity: Math.random() * 0.4 + 0.1,
    }))

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-[#00f0ff]"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
                    animate={{ y: [0, -30, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    )
}

function CircuitLines() {
    return (
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M10 10 h20 v20 M50 10 h20 v20 M10 50 h20 v20 M50 50 h20 v20" stroke="#00f0ff" strokeWidth="0.5" fill="none" />
                    <circle cx="10" cy="10" r="2" fill="#00f0ff" />
                    <circle cx="50" cy="10" r="2" fill="#7000ff" />
                    <circle cx="30" cy="30" r="1.5" fill="#00f0ff" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
    )
}

function HeroAndroid() {
    return (
        <div className="relative w-full max-w-sm mx-auto aspect-[3/4]">
            {/* Outer ring */}
            <motion.div
                className="absolute inset-0 rounded-full border border-[#00f0ff]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{ borderRadius: '50%' }}
            />
            {/* Inner ring */}
            <motion.div
                className="absolute inset-8 rounded-full border border-[#7000ff]/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                style={{ borderRadius: '50%' }}
            />

            {/* Central figure placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-64">
                    {/* Head */}
                    <motion.div
                        className="w-24 h-28 mx-auto rounded-t-[3rem] rounded-b-[1.5rem] bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] border border-[#00f0ff]/30 relative overflow-hidden"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        {/* Face glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/10 to-transparent" />
                        {/* Eyes */}
                        <div className="absolute top-8 left-0 right-0 flex justify-center gap-4">
                            <motion.div
                                className="w-4 h-4 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="w-4 h-4 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 3, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        </div>
                        {/* Scan line */}
                        <motion.div
                            className="absolute left-0 right-0 h-px bg-[#00f0ff]/50"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                    </motion.div>

                    {/* Neck */}
                    <div className="w-8 h-4 mx-auto bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] border-x border-[#00f0ff]/20" />

                    {/* Body */}
                    <motion.div
                        className="w-full h-28 rounded-2xl bg-gradient-to-b from-[#0d0d1a] to-[#050510] border border-[#7000ff]/30 relative overflow-hidden"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 4, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/10 to-transparent" />
                        {/* Chest panel */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-12 rounded-xl border border-[#00f0ff]/20 bg-black/40 flex items-center justify-center">
                            <motion.div
                                className="w-3 h-3 rounded-full bg-[#7000ff] shadow-[0_0_6px_#7000ff]"
                                animate={{ scale: [1, 1.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        </div>
                        {/* Side lines */}
                        <div className="absolute left-3 top-6 w-px h-16 bg-gradient-to-b from-[#00f0ff]/30 to-transparent" />
                        <div className="absolute right-3 top-6 w-px h-16 bg-gradient-to-b from-[#00f0ff]/30 to-transparent" />
                    </motion.div>
                </div>
            </div>

            {/* Orbiting dots */}
            {[0, 120, 240].map((deg, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]"
                    style={{ top: '50%', left: '50%', marginTop: -6, marginLeft: -6 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            width: 120 + i * 30,
                            height: 1,
                            background: 'transparent',
                            transformOrigin: '0 50%',
                            transform: `rotate(${deg}deg) translateY(-50%)`,
                        }}
                    >
                        <div className="absolute right-0 w-3 h-3 rounded-full bg-[#7000ff] shadow-[0_0_6px_#7000ff]" style={{ transform: 'translateY(-50%)' }} />
                    </div>
                </motion.div>
            ))}

            {/* Status labels */}
            {[
                { label: 'ONLINE', top: '5%', left: '0%', color: '#00f0ff' },
                { label: 'LEARNING', top: '20%', right: '0%', color: '#7000ff' },
                { label: 'AWARE', bottom: '20%', left: '0%', color: '#ff006e' },
            ].map((s, i) => (
                <motion.div
                    key={i}
                    className="absolute text-[10px] font-mono font-bold tracking-widest"
                    style={{ color: s.color, top: s.top, left: s.left, right: (s as any).right, bottom: (s as any).bottom }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, delay: i * 0.7, repeat: Infinity }}
                >
                    ◉ {s.label}
                </motion.div>
            ))}
        </div>
    )
}

function ResponseDemo() {
    const [phase, setPhase] = useState(0)
    const [playing, setPlaying] = useState(false)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const startDemo = () => {
        setPhase(0)
        setPlaying(true)
    }
    const stopDemo = () => {
        setPlaying(false)
        if (timerRef.current) clearInterval(timerRef.current)
    }

    useEffect(() => {
        if (playing) {
            timerRef.current = setInterval(() => {
                setPhase((p) => {
                    if (p >= 4) { setPlaying(false); return 4 }
                    return p + 1
                })
            }, 1200)
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [playing])

    const steps = [
        { label: 'Trigger', value: responseExample.trigger, color: '#00f0ff', icon: Mic },
        { label: 'Sensory Input', value: responseExample.visual, color: '#7000ff', icon: Eye },
        { label: 'Linguistic Output', value: responseExample.linguistic, color: '#00f0ff', icon: Brain },
        { label: 'Prosodic Layer', value: responseExample.prosodic, color: '#7000ff', icon: Activity },
        { label: 'Kinesic Layer', value: responseExample.kinesic, color: '#ff006e', icon: Hand },
    ]

    return (
        <div className="glass-panel rounded-3xl border border-white/10 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 via-transparent to-[#7000ff]/5" />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-white">Live Response Simulation</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={startDemo}
                            id="demo-play-btn"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-sm font-semibold hover:bg-[#00f0ff]/20 transition-all"
                        >
                            <Play className="w-4 h-4" /> Play
                        </button>
                        <button
                            onClick={stopDemo}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {steps.map((step, i) => {
                        const Icon = step.icon
                        const active = phase > i
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: active ? 1 : 0.25, x: 0 }}
                                className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-500"
                                style={{
                                    borderColor: active ? `${step.color}40` : 'rgba(255,255,255,0.05)',
                                    background: active ? `${step.color}08` : 'transparent',
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ background: active ? `${step.color}20` : 'rgba(255,255,255,0.03)' }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: active ? step.color : '#555' }} />
                                </div>
                                <div>
                                    <div className="text-xs font-mono text-gray-500 mb-1">{step.label}</div>
                                    <div className="text-sm font-medium" style={{ color: active ? '#fff' : '#444' }}>
                                        {step.value}
                                    </div>
                                </div>
                                {active && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="ml-auto w-2 h-2 rounded-full shrink-0 mt-1"
                                        style={{ background: step.color, boxShadow: `0 0 6px ${step.color}` }}
                                    />
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-3">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className="h-1 rounded-full transition-all duration-500"
                                style={{
                                    width: phase > i ? 24 : 6,
                                    background: phase > i ? steps[i].color : 'rgba(255,255,255,0.1)',
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-600 ml-auto font-mono">
                        {playing ? 'PROCESSING...' : phase === 4 ? 'RESPONSE COMPLETE' : 'STANDBY'}
                    </span>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MAbbasAIPage() {
    const [activeLayer, setActiveLayer] = useState(0)
    const heroRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 60])

    return (
        <div className="min-h-screen bg-[#030308] text-white overflow-x-hidden">
            <CircuitLines />

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
                <ParticleField />

                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7000ff]/8 rounded-full blur-[100px] pointer-events-none" />

                <motion.div style={{ opacity: heroOpacity, y: heroY }} className="w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Text */}
                        <div>
                            <Link
                                href="/work"
                                className="inline-flex items-center text-gray-500 hover:text-[#00f0ff] mb-10 transition-colors group text-sm"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Projects
                            </Link>

                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono tracking-widest">
                                        CONCEPT · 2026
                                    </span>
                                    <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#7000ff]/10 text-[#7000ff] border border-[#7000ff]/20 font-mono tracking-widest">
                                        ROBOTICS · AI
                                    </span>
                                </div>

                                <h1 className="text-6xl md:text-7xl xl:text-8xl font-black mb-4 leading-none tracking-tight">
                                    <span className="block text-white">M-Abbas</span>
                                    <span className="block bg-gradient-to-r from-[#00f0ff] via-[#7000ff] to-[#ff006e] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                                        AI
                                    </span>
                                </h1>

                                <p className="text-2xl text-gray-400 font-light mb-4">Interactive Cyborg</p>

                                <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
                                    A biomimetic android built as an exact physical replica of me — with compliant robotic actuators,
                                    a motion-capture movement library, and a multimodal large action model that fuses vision,
                                    audio, and touch into a single, eerily natural social intelligence.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <a
                                        href="#architecture"
                                        className="px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-black font-bold rounded-2xl flex items-center gap-3 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all hover:scale-[1.02]"
                                    >
                                        Explore Blueprint <ArrowRight className="w-5 h-5" />
                                    </a>
                                    <a
                                        href="#intelligence"
                                        className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all"
                                    >
                                        See AI Demo <Brain className="w-5 h-5" />
                                    </a>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right: Android Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative flex justify-center"
                        >
                            <HeroAndroid />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className="text-xs font-mono tracking-widest">SCROLL</span>
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </section>

            {/* ── Architecture: 3-Layer System ────────────────────────────────── */}
            <section id="architecture" className="px-4 py-32 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <span className="text-xs font-mono tracking-widest text-[#00f0ff] mb-4 block">SYSTEM ARCHITECTURE</span>
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                        Three Core{' '}
                        <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
                            Challenges
                        </span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                        Building a natural-feeling android requires solving Structure, Movement, and Intelligence in sync.
                    </p>
                </motion.div>

                {/* Layer selector tabs */}
                <div className="flex gap-4 justify-center mb-16 flex-wrap">
                    {layers.map((layer, i) => {
                        const Icon = layer.icon
                        return (
                            <button
                                key={layer.id}
                                id={`layer-tab-${layer.id}`}
                                onClick={() => setActiveLayer(i)}
                                className="flex items-center gap-3 px-6 py-4 rounded-2xl border font-semibold transition-all duration-300"
                                style={{
                                    borderColor: activeLayer === i ? layer.color : 'rgba(255,255,255,0.08)',
                                    background: activeLayer === i ? `${layer.color}12` : 'transparent',
                                    color: activeLayer === i ? layer.color : '#666',
                                    boxShadow: activeLayer === i ? `0 0 20px ${layer.color}20` : 'none',
                                }}
                            >
                                <span className="font-mono text-xs opacity-60">{layer.number}</span>
                                <Icon className="w-4 h-4" />
                                {layer.title}
                            </button>
                        )
                    })}
                </div>

                {/* Active layer detail */}
                <AnimatePresence mode="wait">
                    {layers.map((layer, i) => {
                        if (i !== activeLayer) return null
                        const Icon = layer.icon
                        return (
                            <motion.div
                                key={layer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
                            >
                                {/* Left: Info */}
                                <div>
                                    <div
                                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                                        style={{ background: `${layer.color}20`, border: `1px solid ${layer.color}40` }}
                                    >
                                        <Icon className="w-8 h-8" style={{ color: layer.color }} />
                                    </div>
                                    <div className="text-sm font-mono mb-2" style={{ color: layer.color }}>{layer.tagline}</div>
                                    <h3 className="text-4xl font-black text-white mb-4">{layer.title}: <span style={{ color: layer.color }}>{layer.subtitle}</span></h3>
                                    <p className="text-gray-400 text-lg leading-relaxed mb-10">{layer.description}</p>

                                    <div
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono"
                                        style={{ background: `${layer.color}10`, border: `1px solid ${layer.color}20`, color: layer.color }}
                                    >
                                        <span className="w-2 h-2 rounded-full" style={{ background: layer.color, boxShadow: `0 0 4px ${layer.color}` }} />
                                        {layer.number} / 03 — {layer.subtitle}
                                    </div>
                                </div>

                                {/* Right: Feature cards */}
                                <div className="space-y-5">
                                    {layer.features.map((feat, fi) => {
                                        const FIcon = feat.icon
                                        return (
                                            <motion.div
                                                key={fi}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.4, delay: fi * 0.1 }}
                                                className="p-6 rounded-3xl border relative overflow-hidden group"
                                                style={{ borderColor: `${layer.color}20`, background: `${layer.color}06` }}
                                            >
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                                    style={{ background: `linear-gradient(135deg, ${layer.color}10, transparent)` }} />
                                                <div className="relative z-10 flex gap-4">
                                                    <div
                                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                                                        style={{ background: `${layer.color}20`, border: `1px solid ${layer.color}30` }}
                                                    >
                                                        <FIcon className="w-5 h-5" style={{ color: layer.color }} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white mb-2">{feat.title}</h4>
                                                        <p className="text-sm text-gray-500 leading-relaxed">{feat.detail}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </section>

            {/* ── Intelligence Demo ─────────────────────────────────────────────── */}
            <section id="intelligence" className="px-4 py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#7000ff]/5 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <span className="text-xs font-mono tracking-widest text-[#7000ff] mb-4 block">INTELLIGENCE LAYER</span>
                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            The Brain:{' '}
                            <span className="bg-gradient-to-r from-[#7000ff] to-[#ff006e] bg-clip-text text-transparent">
                                Large Action Model
                            </span>
                        </h2>
                        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                            Watch how a single input is transformed into a synchronized, tri-layer response: words, tone, and body language — all in real time.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <ResponseDemo />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-4">Tri-Layer Response Generation</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    A response is never just words. The Large Action Model simultaneously outputs three synchronized layers,
                                    making every interaction feel instinctively human.
                                </p>
                            </div>

                            {[
                                { label: 'Linguistic', desc: 'The exact words — chosen for context, relationship history, and social appropriateness.', color: '#00f0ff', icon: Brain },
                                { label: 'Prosodic', desc: 'Tone, pacing, warmth, and emotional coloring of the voice — cloned from my own speech patterns.', color: '#7000ff', icon: Mic },
                                { label: 'Kinesic', desc: 'Body language, gesture, facial expression, and physical contact — drawn from the motion capture library.', color: '#ff006e', icon: Activity },
                            ].map((item, i) => {
                                const Icon = item.icon
                                return (
                                    <div key={i} className="flex gap-5 items-start">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: item.color }} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white mb-1">{item.label}</div>
                                            <div className="text-sm text-gray-500">{item.desc}</div>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="p-6 rounded-2xl border border-[#ff006e]/20 bg-[#ff006e]/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <RotateCcw className="w-4 h-4 text-[#ff006e]" />
                                    <span className="text-sm font-bold text-white">Continuous Learning Loop</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Every interaction is logged. The model learns what resonated, refines its personality model of you, and grows more natural with each conversation.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Sensory Fusion Stats ─────────────────────────────────────────── */}
            <section className="px-4 py-24 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="text-xs font-mono tracking-widest text-[#00f0ff] mb-4 block">MULTIMODAL SENSORY INTEGRATION</span>
                    <h2 className="text-4xl font-black text-white">Fusing all the senses</h2>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: Eye, label: 'Vision', value: '4K', desc: 'Camera resolution per eye', color: '#00f0ff' },
                        { icon: Mic, label: 'Hearing', value: '360°', desc: 'Spatial audio field coverage', color: '#7000ff' },
                        { icon: Hand, label: 'Touch', value: '1000+', desc: 'Tactile pressure sensors', color: '#ff006e' },
                        { icon: Brain, label: 'Processing', value: '< 50ms', desc: 'Sensory-to-response latency', color: '#00f0ff' },
                    ].map((stat, i) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="glass-panel rounded-3xl p-8 border border-white/5 text-center hover:border-[#00f0ff]/20 transition-all duration-300 group"
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                    style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
                                >
                                    <Icon className="w-7 h-7" style={{ color: stat.color }} />
                                </div>
                                <div className="text-3xl font-black text-white mb-1" style={{ textShadow: `0 0 20px ${stat.color}60` }}>
                                    {stat.value}
                                </div>
                                <div className="text-xs font-mono text-[#00f0ff] mb-2">{stat.label}</div>
                                <div className="text-xs text-gray-600">{stat.desc}</div>
                            </motion.div>
                        )
                    })}
                </div>
            </section>

            {/* ── Technology Stack ─────────────────────────────────────────────── */}
            <section className="px-4 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/3 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-mono tracking-widest text-[#00f0ff] mb-4 block">TECHNOLOGY STACK</span>
                        <h2 className="text-4xl font-black text-white">Built from the ground up</h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-3">
                        {techPills.map((tech, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: i * 0.04 }}
                                whileHover={{ scale: 1.05 }}
                                className="px-5 py-2.5 rounded-full text-sm font-medium border cursor-default"
                                style={{
                                    borderColor: i % 3 === 0 ? 'rgba(0,240,255,0.25)' : i % 3 === 1 ? 'rgba(112,0,255,0.25)' : 'rgba(255,0,110,0.2)',
                                    color: i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#a855f7' : '#ff6ea6',
                                    background: i % 3 === 0 ? 'rgba(0,240,255,0.06)' : i % 3 === 1 ? 'rgba(112,0,255,0.06)' : 'rgba(255,0,110,0.06)',
                                }}
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────────────────────────────────────── */}
            <section className="px-4 py-32 max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative p-16 rounded-[3rem] border border-[#00f0ff]/20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/8 via-transparent to-[#7000ff]/8" />
                    <ParticleField />
                    <div className="relative z-10">
                        <Award className="w-16 h-16 mx-auto mb-6 text-[#00f0ff]" />
                        <h2 className="text-5xl font-black text-white mb-6">The Future is Personal</h2>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            M-Abbas AI is not just a robot — it is the most intimate form of human-AI collaboration ever conceived.
                            A persistent, learning presence that knows you, grows with you, and speaks as you.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/work"
                                className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition-all"
                            >
                                <ArrowLeft className="w-5 h-5" /> All Projects
                            </Link>
                            <Link
                                href="/articles"
                                className="px-8 py-4 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-black font-bold rounded-2xl flex items-center gap-3 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all hover:scale-[1.02]"
                            >
                                Read Research <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent" />
        </div>
    )
}
