'use client'

import { ArrowRight, Sparkles, Cpu, LineChart, Code, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import { useState, useEffect } from 'react'
import { useMagneticHover } from '@/hooks/useMagneticHover'
import { useMemo } from 'react'

// 3D "Digital Brain" / Orb Component - Optimized
function DigitalBrain() {
  // Memoize geometry to prevent recreation on every render
  const sphereArgs: [number, number, number] = useMemo(() => [1, 64, 64], [])

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={sphereArgs} scale={2.4}>
        <MeshDistortMaterial
          color="#7000ff"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          wireframe
        />
      </Sphere>
      <Sphere args={sphereArgs} scale={2.2}>
        <MeshDistortMaterial
          color="#00f0ff"
          attach="material"
          distort={0.3}
          speed={3}
          transparent
          opacity={0.3}
        />
      </Sphere>
    </Float>
  )
}

function DecodingText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState('')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&'

  useEffect(() => {
    let iteration = 0
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) return text[index]
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join('')
      )

      if (iteration >= text.length) clearInterval(interval)
      iteration += 1 / 3
    }, 30)

    return () => clearInterval(interval)
  }, [text])

  return <span className={className}>{display}</span>
}

// Magnetic Button Component with hover effect
function MagneticButton({
  href,
  children,
  primary = false
}: {
  href: string
  children: React.ReactNode
  primary?: boolean
}) {
  const { position, handleMouseMove, handleMouseLeave } = useMagneticHover(0.3)

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`group relative px-8 py-4 rounded-lg font-bold uppercase tracking-widest transition-all duration-300 overflow-hidden flex items-center ${primary
          ? 'bg-transparent border border-[#00f0ff] text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]'
          : 'border border-white/20 text-gray-300 hover:border-[#7000ff] hover:text-[#7000ff] backdrop-blur-sm'
          }`}
      >
        {primary && (
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700" />
        )}
        <span className="relative flex items-center">
          {children}
        </span>
      </Link>
    </motion.div>
  )
}

// Feature Card with Magnetic Hover
function FeatureCard({
  feature,
  Icon,
  index
}: {
  feature: { title: string; desc: string }
  Icon: React.ComponentType<{ className?: string }>
  index: number
}) {
  const { position, handleMouseMove, handleMouseLeave } = useMagneticHover(0.2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      className="group p-8 glass-panel rounded-2xl border border-white/5 hover:border-[#7000ff]/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
      style={{ transformOrigin: 'center center' }}
    >
      <motion.div
        whileHover={{
          y: -10,
          boxShadow: "0 0 25px rgba(112, 0, 255, 0.4)"
        }}
        className="relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="inline-flex p-4 rounded-xl bg-[#7000ff]/10 mb-6 group-hover:scale-110 group-hover:bg-[#7000ff]/20 transition-all duration-500">
          <Icon className="w-8 h-8 text-[#7000ff] group-hover:text-white" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.desc}</p>
      </motion.div>
    </motion.div>
  )
}

export default function HeroSection() {
  const features = [
    { icon: Cpu, title: 'Research', desc: 'Economics & Data Analysis' },
    { icon: LineChart, title: 'Modeling', desc: 'Statistical & Predictive' },
    { icon: Code, title: 'Technology', desc: 'Full-Stack Development' },
    { icon: Zap, title: 'Innovation', desc: 'Creative Problem Solving' },
  ]

  return (
    <section className="relative py-20 md:py-32 overflow-hidden min-h-[90vh] flex items-center">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full glass-panel border border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <Sparkles className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-sm font-medium text-[#00f0ff]">
                Welcome to the Lab
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white font-[family-name:var(--font-geist-mono)] relative z-10">
              <span className="block mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Mohammed
              </span>
              <div className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#7000ff] to-[#00f0ff] bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                <DecodingText text="Abbas Lab" />
              </div>
            </h1>

            {/* AI Background Visual Effect */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] -z-10 opacity-30 pointer-events-none mix-blend-screen">
              <Image
                src="/images/fashion/ai-effect.jpg"
                alt="AI Neural Network Visual"
                width={500}
                height={500}
                className="w-full h-full object-cover rounded-full blur-3xl animate-pulse"
                priority
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-xl text-gray-400 max-w-xl mb-10 leading-relaxed"
            >
              A living platform where <span className="font-semibold text-[#00f0ff] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]">Research</span>,{' '}
              <span className="font-semibold text-[#7000ff] drop-shadow-[0_0_5px_rgba(112,0,255,0.8)]">Economics</span>, and{' '}
              <span className="font-semibold text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.8)]">Technology</span> converge.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 relative z-10"
            >
              <MagneticButton href="/about" primary>
                Explore System <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </MagneticButton>

              <MagneticButton href="/work">
                View Projects
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Right: Futuristic AI Avatar (Interactive) */}
          <div className="relative h-[500px] w-full flex items-center justify-center">
            {/* 3D Background Orb behind the Avatar */}
            <div className="absolute inset-0 z-0">
              <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <DigitalBrain />
              </Canvas>
            </div>
            <InteractiveAvatar />
          </div>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <FeatureCard key={feature.title} feature={feature} Icon={Icon} index={index} />
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function InteractiveAvatar() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    setMousePosition({ x, y });
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovering(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="hidden lg:block h-[500px] w-full relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holographic Container - Interactive Tilt */}
      <motion.div
        animate={{
          rotateY: isHovering ? mousePosition.x * 20 : 0, // Tilt towards cursor
          rotateX: isHovering ? -mousePosition.y * 20 : 0,
          scale: isHovering ? 1.05 : 1,
        }}
        initial={{ rotateY: 360 }} // Initial spin (Greeting)
        transition={{
          rotateY: isHovering ? { type: "spring", stiffness: 300, damping: 20 } : { duration: 2, ease: "easeInOut" },
          rotateX: { type: "spring", stiffness: 300, damping: 20 },
          scale: { duration: 0.4 },
        }}
        className="relative w-[350px] h-[450px] mx-auto group"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Breathing Animation Wrapper */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Greeting Animation / Initial Spin */}
          <motion.div
            initial={{ rotateY: 180, scale: 0.8 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 1, type: "spring" }}
            className="w-full h-full relative"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Glowing Ring Background */}
            <div
              className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-pink-500/30 rounded-[2rem] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"
              style={{ transform: 'translateZ(-50px)' }}
            />

            {/* Main Card */}
            <div
              className="relative w-full h-full bg-black/80 backdrop-blur-md rounded-[1.5rem] border border-white/10 overflow-hidden shadow-2xl"
              style={{ transform: 'translateZ(0px)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-10" />

              {/* AI Avatar Image */}
              <Image
                src="/images/hero-3d-avatar.png"
                alt="Mohammed Abbas 3D AI Avatar"
                fill
                className="object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                priority
                quality={90}
              />

              {/* HUD Overlays - Top */}
              <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-cyan-500/50 rounded-sm" />
                  <div className="w-1 h-3 bg-cyan-500/30 rounded-sm" />
                  <div className="w-1 h-3 bg-cyan-500/10 rounded-sm" />
                </div>
                <div className="text-[10px] font-mono text-cyan-500/70 border border-cyan-500/20 px-2 py-0.5 rounded animate-pulse">
                  STATUS: ONLINE
                </div>
              </div>

              {/* HUD Overlays - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-mono text-green-400">GREETINGS, USER</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">M-Abbas AI</h3>
                <p className="text-xs text-gray-400 font-mono">INTERACTIVE • CYBORG • SYSTEM</p>
              </div>

              {/* Scanning Line Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[20%] w-full animate-scan pointer-events-none z-30" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}