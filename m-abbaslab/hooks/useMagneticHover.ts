import { useState } from 'react'

interface MagneticPosition {
    x: number
    y: number
}

interface UseMagneticHoverReturn {
    position: MagneticPosition
    handleMouseMove: (e: React.MouseEvent<HTMLElement>) => void
    handleMouseLeave: () => void
}

/**
 * Custom hook for magnetic hover effect
 * @param strength - Multiplier for the magnetic pull (0.1 = subtle, 0.5 = strong)
 * @returns Position state and event handlers
 */
export function useMagneticHover(strength: number = 0.3): UseMagneticHoverReturn {
    const [position, setPosition] = useState<MagneticPosition>({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const centerX = left + width / 2
        const centerY = top + height / 2

        // Calculate offset from center
        const x = (e.clientX - centerX) * strength
        const y = (e.clientY - centerY) * strength

        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    return {
        position,
        handleMouseMove,
        handleMouseLeave,
    }
}
