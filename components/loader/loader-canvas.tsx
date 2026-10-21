"use client"

import { OrbitControls } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { LoaderParticles, OrbitingLight } from "./loader-effects"
import { LoaderLogo } from "./loader-logo"

interface LoaderCanvasProps {
  isComplete: boolean
  onInteract?: () => void
}

export function LoaderCanvas({ isComplete, onInteract }: LoaderCanvasProps) {
  return (
    <div
      className="relative size-full cursor-grab active:cursor-grabbing select-none"
      onPointerDown={onInteract}
    >
      <Canvas
        camera={{ position: [0, 0.32, 4.5], fov: 36 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Gallery lighting */}
        <ambientLight intensity={1.3} />
        <directionalLight position={[4, 6, 5]} intensity={2.6} />
        <directionalLight position={[-4, 3, -2]} intensity={1.8} color="#1a2ffb" />
        <pointLight position={[0, -2, 2.5]} intensity={1.6} color="#c1ff00" />

        {/* Dynamic sweeping spotlight */}
        <OrbitingLight />

        {/* Surrounding 3D energy elements */}
        <LoaderParticles count={80} />

        {/* The 3D Winged Globe Logo with organic wing flapping */}
        <LoaderLogo isComplete={isComplete} />

        {/* Front-focused interactive inspection controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          dampingFactor={0.06}
          enableDamping
          target={[0, 0.15, 0]}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
          minPolarAngle={Math.PI / 2 - 0.35}
          maxPolarAngle={Math.PI / 2 + 0.35}
        />
      </Canvas>
    </div>
  )
}
