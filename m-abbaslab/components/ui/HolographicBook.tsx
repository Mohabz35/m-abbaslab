'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, MeshWobbleMaterial, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function BookObject() {
    const mesh = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.5
            mesh.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
        }
    })

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <mesh ref={mesh}>
                <boxGeometry args={[3, 4, 0.5]} />
                <MeshDistortMaterial
                    color="#00f0ff"
                    speed={2}
                    distort={0.2}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                    emissive="#00f0ff"
                    emissiveIntensity={0.5}
                />
                {/* Pages effect */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[2.9, 3.9, 0.55]} />
                    <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
                </mesh>
            </mesh>
        </Float>
    )
}

export default function HolographicBook() {
    return (
        <div className="w-full h-[400px] relative">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#7000ff" />
                <spotLight position={[0, 5, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f0ff" />

                <BookObject />

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
                    <planeGeometry args={[20, 20]} />
                    <MeshWobbleMaterial
                        factor={0.1}
                        speed={1}
                        color="#7000ff"
                        opacity={0.05}
                        transparent
                    />
                </mesh>
            </Canvas>
        </div>
    )
}
