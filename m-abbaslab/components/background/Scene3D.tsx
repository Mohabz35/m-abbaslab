'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Stars, Sparkles, PerspectiveCamera } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function RotatingStars() {
    const ref = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10
            ref.current.rotation.y -= delta / 15
        }
    })

    return (
        <group ref={ref}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}

function GridFloor() {
    return (
        <gridHelper
            args={[100, 100, 0x7000ff, 0x222222]}
            position={[0, -2, 0]}
            rotation={[0, 0, 0]}
        />
    )
}

function FloatingParticles() {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <group ref={ref}>
            <Sparkles
                count={200}
                scale={12}
                size={2}
                speed={0.4}
                opacity={0.5}
                color="#00f0ff"
            />
        </group>
    )
}

export default function Scene3D() {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-[#030014]">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />

                {/* Lights */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7000ff" />

                {/* Environment */}
                <RotatingStars />
                <FloatingParticles />
                <fog attach="fog" args={['#030014', 5, 30]} />

                {/* Optional Grid for "Lab" feel */}
                {/* <GridFloor /> */}
            </Canvas>
        </div>
    )
}
