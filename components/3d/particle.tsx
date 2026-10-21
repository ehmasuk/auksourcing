"use client"
import { OrbitControls, Sphere } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { pointsInner, pointsOuter } from "./utils"

const ParticleRing = ({ height }: { height: string }) => {
  return (
    <div className="relative">
      <Canvas
        camera={{
          position: [-5, -5, -5],
        }}
        style={{ height: height }}
        className="bg-slate-900"
      >
        <OrbitControls maxDistance={20} minDistance={10} />
        <directionalLight />
        <pointLight position={[-30, 0, -30]} power={10.0} />
        <PointCircle />
      </Canvas>
    </div>
  )
}

const PointCircle = () => {
  const ref = useRef(null)

  useFrame(({ clock }) => {
    if (ref.current?.rotation) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.05
    }
  })

  return (
    <group ref={ref}>
      {pointsInner.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
      {pointsOuter.map((point) => (
        <Point key={point.idx} position={point.position} color={point.color} />
      ))}
    </group>
  )
}

const Point = ({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) => {
  return (
    <Sphere position={position} args={[0.1, 10, 10]}>
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={0.5}
        roughness={0.5}
        color={color}
      />
    </Sphere>
  )
}

export default ParticleRing
