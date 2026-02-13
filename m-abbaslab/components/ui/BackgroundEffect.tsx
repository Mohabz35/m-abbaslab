'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: { x: number; y: number; vx: number; vy: number; size: number }[] = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }

        const initParticles = () => {
            particles = []
            const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 15000)

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2
                })
            }
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            particles.forEach((p, i) => {
                p.x += p.vx
                p.y += p.vy

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1

                // Draw particle
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(100, 100, 255, 0.3)' // Subtle blue
                ctx.fill()

                // Connect nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j]
                    const dx = p.x - p2.x
                    const dy = p.y - p2.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 100) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(100, 100, 255, ${0.1 * (1 - distance / 100)})`
                        ctx.lineWidth = 0.5
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(p2.x, p2.y)
                        ctx.stroke()
                    }
                }
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        window.addEventListener('resize', () => {
            resize()
            initParticles()
        })

        resize()
        initParticles()
        draw()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
            style={{ background: 'black' }}
        />
    )
}
