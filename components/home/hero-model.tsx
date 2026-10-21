"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrthographicCamera } from "@react-three/drei"
import type { RapierRigidBody } from "@react-three/rapier"
import { BallCollider, Physics, RigidBody } from "@react-three/rapier"
import type { RefObject } from "react"
import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

const VIEW_HALF_HEIGHT = 5

const COLORS = [
  "#ffffff",
  "#FFF83F"
]

const COUNT = 40

type RingData = {
  position: [number, number, number]
  color: string
  size: number
  velocity: [number, number, number]
  angularVelocity: [number, number, number]
}

function createRings(width: number, height: number): RingData[] {
  let seed = 12345

  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  const result: RingData[] = []

  // Jittered grid spawn so rings never start overlapping.
  // Overlapping bodies get depenetration-shoved, which causes
  // violent shaking right after load.
  const cols = Math.max(1, Math.ceil(Math.sqrt((COUNT * width) / height)))
  const rows = Math.ceil(COUNT / cols)

  for (let i = 0; i < COUNT; i++) {
    const size = 0.8
    const col = i % cols
    const row = Math.floor(i / cols)

    result.push({
      position: [
        ((col + random() * 0.5 + 0.25) / cols - 0.5) * width,
        ((row + random() * 0.5 + 0.25) / rows - 0.5) * height,
        (random() - 0.5) * 5,
      ],
      color: COLORS[i % COLORS.length],
      size,
      velocity: [
        (random() - 0.5) * 0.9,
        (random() - 0.5) * 0.9,
        (random() - 0.5) * 0.9,
      ],
      angularVelocity: [
        (random() - 0.5) * 0.8,
        (random() - 0.5) * 0.8,
        (random() - 0.5) * 0.8,
      ],
    })
  }

  return result
}

function Ring({
  data,
  mouse,
}: {
  data: RingData
  mouse: RefObject<THREE.Vector3>
}) {
  const body = useRef<RapierRigidBody>(null)
  const tubeRadius = data.size * 0.5
  const colliderCount = 16
  useFrame((_, delta) => {
    if (!body.current) return

    // Mouse repulsion. Impulse must be scaled by delta,
    // otherwise rings get hammered once per frame and vibrate.
    const mouseRadius = 4
    const mouseStrength = 100

    const position = body.current.translation()

    const dx = position.x - mouse.current.x
    const dy = position.y - mouse.current.y
    const dz = position.z - mouse.current.z

    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (distance < mouseRadius && distance > 0.001) {
      const force =
        Math.pow(1 - distance / mouseRadius, 2) * mouseStrength * delta

      body.current.applyImpulse(
        {
          x: (dx / distance) * force,
          y: (dy / distance) * force,
          z: (dz / distance) * force,
        },
        true
      )
    }
  })

  // Approximate the torus tube with spheres arranged
  // around its circular centerline.
  const colliderPositions = useMemo(() => {
    return Array.from({ length: colliderCount }, (_, i) => {
      const angle = (i / colliderCount) * Math.PI * 2

      return [Math.cos(angle) * data.size, Math.sin(angle) * data.size, 0] as [
        number,
        number,
        number,
      ]
    })
  }, [data.size])

  return (
    <RigidBody
      ref={body}
      position={data.position}
      linearVelocity={data.velocity}
      angularVelocity={data.angularVelocity}
      colliders={false}
      mass={3}
      gravityScale={0}
      linearDamping={0.04}
      angularDamping={0.12}
      restitution={0.55}
      friction={0.35}
      canSleep={false}
      ccd
    >
      <mesh>
        <torusGeometry args={[data.size, tubeRadius, 32, 96]} />

        <meshStandardMaterial
          color={data.color}
          metalness={0.95}
          roughness={0.2}
          emissive={data.color}
          emissiveIntensity={0.08}
        />
      </mesh>

      {colliderPositions.map((position, i) => (
        <BallCollider
          key={i}
          args={[tubeRadius]}
          position={position}
          friction={0.35}
          restitution={0.82}
        />
      ))}
    </RigidBody>
  )
}

function Walls({ width, height }: { width: number; height: number }) {
  const zDepth = 5
  const margin = 0.4
  const x = width / 2 + margin
  const y = height / 2 + margin

  return (
    <>
      <RigidBody type="fixed" colliders="cuboid" position={[0, y, 0]}>
        <mesh>
          <boxGeometry args={[width, 0.2, zDepth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[0, -y, 0]}>
        <mesh>
          <boxGeometry args={[width, 0.2, zDepth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[-x, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.2, height, zDepth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[x, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.2, height, zDepth]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, -zDepth / 2]}>
        <mesh>
          <boxGeometry args={[width, height, 0.2]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid" position={[0, 0, zDepth / 2]}>
        <mesh>
          <boxGeometry args={[width, height, 0.2]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>
    </>
  )
}

function RingWorld() {
  const size = useThree((state) => state.size)

  const bounds = useMemo(
    () => ({
      width: VIEW_HALF_HEIGHT * 2 * (size.width / size.height) + 0.8,
      height: VIEW_HALF_HEIGHT * 2 + 0.8,
    }),
    [size]
  )

  const rings = useMemo(
    () => createRings(bounds.width, bounds.height),
    [bounds]
  )
  const mouse = useRef(new THREE.Vector3(100, 100, 0))
  const { camera, pointer, raycaster } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  )

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera)

    if (raycaster.ray.intersectPlane(plane, target)) {
      mouse.current.copy(target)
    }
  })

  return (
    <Physics gravity={[0, 0, 0]} timeStep="vary" interpolate>
      <Walls width={bounds.width} height={bounds.height} />

      {rings.map((ring, i) => (
        <Ring key={i} data={ring} mouse={mouse} />
      ))}
    </Physics>
  )
}

function SceneCamera() {
  const size = useThree((state) => state.size)
  const camera = useRef<THREE.OrthographicCamera>(null)

  useLayoutEffect(() => {
    if (!camera.current) return

    const halfWidth = VIEW_HALF_HEIGHT * (size.width / size.height)

    camera.current.left = -halfWidth
    camera.current.right = halfWidth
    camera.current.top = VIEW_HALF_HEIGHT
    camera.current.bottom = -VIEW_HALF_HEIGHT
    camera.current.updateProjectionMatrix()
  }, [size])

  return (
    <OrthographicCamera
      ref={camera}
      makeDefault
      position={[0, 0, 10]}
      zoom={1}
    />
  )
}

export default function HeroModel() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <SceneCamera />
        <color attach="background" args={["#000000"]} />

        <ambientLight intensity={0.65} />

        <directionalLight position={[5, 8, 5]} intensity={2} />

        <pointLight position={[-5, -3, 3]} intensity={1.5} color="#8B5CF6" />

        <pointLight position={[4, 2, -3]} intensity={1.2} color="#22D3EE" />

        <RingWorld />
      </Canvas>
    </div>
  )
}
