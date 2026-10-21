"use client"

import { useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from "three"

/**
 * Luminous floating particles around the 3D logo
 */
export function LoaderParticles({ count = 90 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)

    const color1 = new THREE.Color("#1a2ffb") // Electric Indigo
    const color2 = new THREE.Color("#c1ff00") // Acid Lime
    const color3 = new THREE.Color("#ffffff") // Diamond White
    const color4 = new THREE.Color("#7986cb") // Soft Lavender

    for (let i = 0; i < count; i++) {
      // Cylindrical / spherical cloud around the logo
      const radius = 1.4 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.9

      pos[i * 3] = radius * Math.cos(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) + (Math.random() - 0.5) * 0.4
      pos[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta)

      const rand = Math.random()
      const selected =
        rand < 0.45 ? color1 : rand < 0.7 ? color4 : rand < 0.85 ? color3 : color2

      col[i * 3] = selected.r
      col[i * 3 + 1] = selected.g
      col[i * 3 + 2] = selected.b
    }

    return [pos, col]
  }, [count])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y += delta * 0.12
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/**
 * Orbiting dynamic light beacon creating specular light sweeps
 */
export function OrbitingLight() {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (!lightRef.current) return
    const t = clock.elapsedTime * 1.2
    const radius = 3.2
    lightRef.current.position.x = Math.sin(t) * radius
    lightRef.current.position.y = Math.cos(t * 0.7) * 1.5
    lightRef.current.position.z = Math.cos(t) * radius
  })

  return (
    <pointLight
      ref={lightRef}
      color="#1a2ffb"
      intensity={3.5}
      distance={8}
      decay={2}
    />
  )
}
