"use client"

import { OrthographicCamera } from "@react-three/drei"
import type { ThreeEvent } from "@react-three/fiber"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import type { RapierRigidBody } from "@react-three/rapier"
import { BallCollider, Physics, RigidBody } from "@react-three/rapier"
import type { RefObject } from "react"
import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"

const VIEW_HALF_HEIGHT = 5

const COLORS = ["#ffffff", "#1a2ffb", "#c1ff00", "#e4e6ef", "#2b2e3a", "#3244e8"]

const COUNT = 20

type RingData = {
  position: [number, number, number]
  rotation: [number, number, number]
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
  const placed: { x: number; y: number; z: number }[] = []

  // In any rotation a torus encloses in a sphere of size + tube
  // radius (1.65 here), so centers spaced further apart than two
  // enclosing radii can never overlap. Two rings on different
  // depth layers spaced 1.2 apart (tube diameter 1.1 + margin)
  // also stay clear regardless of their x/y distance.
  const separation = 3.45
  const edgeX = width / 2 - 1.75
  const edgeY = height / 2 - 1.75

  // Center-focused packed spawn: candidates cluster near the
  // middle first and widen out on retries, so dense batches still
  // find non-overlapping spots.
  const attempts = 600
  const centerBias = 0.7
  const channels = [-0.6, 0.6]

  for (let i = 0; i < COUNT; i++) {
    const size = 1.1
    const channel = channels[i % channels.length]

    let x = 0
    let y = 0

    for (let attempt = 0; attempt < attempts; attempt++) {
      const shrink = Math.min(1, centerBias + attempt / attempts)

      x = (random() - 0.5) * 2 * shrink * edgeX
      y = (random() - 0.5) * 2 * shrink * edgeY

      const clear = placed.every(
        (p) =>
          Math.hypot(x - p.x, y - p.y) >= separation ||
          Math.abs(channel - p.z) >= 2.0
      )

      if (clear) break
    }

    placed.push({ x, y, z: channel })

    // Random unit direction so every ring drifts its own way
    // at a similar, smooth pace.
    const speed = 1.2 + random() * 1.6
    const dirX = (random() - 0.5) * 2
    const dirY = (random() - 0.5) * 2
    const dirZ = (random() - 0.5) * 2
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ) || 1

    // Tumble around a random axis, at a mostly steady rate.
    const spin = 0.15 + random() * 0.5
    const spinX = (random() - 0.5) * 2
    const spinY = (random() - 0.5) * 2
    const spinZ = (random() - 0.5) * 2
    const spinLength =
      Math.sqrt(spinX * spinX + spinY * spinY + spinZ * spinZ) || 1

    result.push({
      position: [x, y, channel],
      rotation: [
        random() * Math.PI * 2,
        random() * Math.PI * 2,
        random() * Math.PI * 2,
      ],
      color: COLORS[i % COLORS.length],
      size,
      velocity: [
        (dirX / dirLength) * speed,
        (dirY / dirLength) * speed,
        (dirZ / dirLength) * speed * 0.3,
      ],
      angularVelocity: [
        (spinX / spinLength) * spin,
        (spinY / spinLength) * spin,
        (spinZ / spinLength) * spin,
      ],
    })
  }

  return result
}

function Ring({
  data,
  index,
  bounds,
  mouse,
  grabbedRing,
}: {
  data: RingData
  index: number
  bounds: { width: number; height: number }
  mouse: RefObject<THREE.Vector3>
  grabbedRing: RefObject<number>
}) {
  const body = useRef<RapierRigidBody>(null)
  const age = useRef(0)
  const settling = useRef(true)
  const stuckAge = useRef(0)
  const stuckTravel = useRef(0)
  const stuckLast = useRef({ x: 0, y: 0, z: 0 })
  const stuckTracking = useRef(false)
  const calm = useRef(0)
  const steerAge = useRef(0)
  const steerInterval = useRef(1.5)
  const wanderTarget = useRef<THREE.Vector3 | null>(null)
  const tubeRadius = data.size * 0.5
  const colliderCount = 16
  // Steady roaming speed the flow controller recovers toward after
  // every collision.
  const cruise = 2.2 + Math.hypot(...data.velocity) * 0.4
  useFrame((_, delta) => {
    if (!body.current) return

    if (age.current < 1.2 && settling.current) {
      // Overlapping spawn bodies get depenetration-shoved. A brief
      // heavily damped window eats most of that energy, then normal
      // near-frictionless motion resumes.
      age.current += delta
      body.current.setLinearDamping(0.5)
      body.current.setAngularDamping(0.5)

      if (age.current >= 1.2) {
        settling.current = false

        body.current.setLinearDamping(0.03)
        body.current.setAngularDamping(0.05)
      }
    }

    if (grabbedRing.current === index) {
      // Spring the grabbed ring toward the pointer. Driving the
      // velocity directly keeps it dynamic, so it still collides
      // with the crowd instead of tunneling through.
      const followStrength = 14
      const maxSpeed = 24

      const position = body.current.translation()

      let vx = (mouse.current.x - position.x) * followStrength
      let vy = (mouse.current.y - position.y) * followStrength
      let vz = (mouse.current.z - position.z) * followStrength

      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed
        vx *= scale
        vy *= scale
        vz *= scale
      }

      body.current.setLinvel({ x: vx, y: vy, z: vz }, true)

      return
    }

    const position = body.current.translation()

    // Center-biased drift. A soft rectangular field starts
    // pushing a ring back toward the middle once it leaves the
    // comfortable area, so rings hover around the hero instead
    // of camping on the walls and corners.
    const softX = bounds.width * 0.28
    const softY = bounds.height * 0.28
    const softZ = 1.0
    const pullStrength = 6

    const overX = Math.abs(position.x) - softX
    const overY = Math.abs(position.y) - softY
    const overZ = Math.abs(position.z) - softZ

    if (overX > 0 || overY > 0 || overZ > 0) {
      const fx =
        overX > 0
          ? -Math.sign(position.x) * overX * pullStrength * delta * 3
          : 0
      const fy =
        overY > 0
          ? -Math.sign(position.y) * overY * pullStrength * delta * 3
          : 0
      const fz =
        overZ > 0
          ? -Math.sign(position.z) * overZ * pullStrength * delta * 3
          : 0

      body.current.applyImpulse({ x: fx, y: fy, z: fz }, true)
    }

    // Mouse repulsion. Impulse must be sized against mass and scaled
    // by delta, otherwise rings get hammered once per frame and
    // vibrate — strength kept low so a hover nudges and scatters
    // gently instead of juggling rings against the speed clamp.
    const mouseRadius = 4
    const mouseStrength = 30

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

    // Flow controller. Collisions and the containment field drain
    // momentum until the crowd clogs dead in the middle. Steering
    // every ring toward a slowly wandering direction at a steady
    // pace restores speed after each bump, so the scene keeps
    // flowing and never settles down.
    if (!wanderTarget.current) {
      wanderTarget.current = new THREE.Vector3(...data.velocity).normalize()
    }

    steerAge.current += delta

    if (steerAge.current >= steerInterval.current) {
      steerAge.current = 0
      steerInterval.current = 1.2 + Math.random() * 1.8

      wanderTarget.current
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 0.5
          )
        )
        .normalize()
    }

    const linvel = body.current.linvel()

    if (wanderTarget.current) {
      const target = wanderTarget.current

      body.current.applyImpulse(
        {
          x: (target.x * cruise - linvel.x) * 1.4 * delta * 3,
          y: (target.y * cruise - linvel.y) * 1.4 * delta * 3,
          z: (target.z * cruise - linvel.z) * 1.4 * delta * 3,
        },
        true
      )
    }

    // Rate limiter: spawn overlap resolution and collisions can
    // spike velocities far above the ambient drift. Clamping every
    // frame kills the fast shaking while leaving normal motion
    // untouched.
    const maxSpeed = 4.6
    const maxSpin = 2.4

    const clampedLinvel = body.current.linvel()
    const linSpeed = Math.sqrt(
      clampedLinvel.x * clampedLinvel.x +
        clampedLinvel.y * clampedLinvel.y +
        clampedLinvel.z * clampedLinvel.z
    )

    if (linSpeed > maxSpeed) {
      const scale = maxSpeed / linSpeed
      body.current.setLinvel(
        {
          x: clampedLinvel.x * scale,
          y: clampedLinvel.y * scale,
          z: clampedLinvel.z * scale,
        },
        true
      )
    }

    const angvel = body.current.angvel()
    const angSpeed = Math.sqrt(
      angvel.x * angvel.x + angvel.y * angvel.y + angvel.z * angvel.z
    )

    if (angSpeed > maxSpin) {
      const scale = maxSpin / angSpeed
      body.current.setAngvel(
        { x: angvel.x * scale, y: angvel.y * scale, z: angvel.z * scale },
        true
      )
    }

    // Stuck rescue. A ring threaded with another ring, or wedged
    // in a wall corner, vibrates in place forever. If it travels
    // far less than its speed suggests over a second, steer it
    // toward the middle of the box and calm it down for a moment.
    if (!stuckTracking.current) {
      stuckTracking.current = true
      stuckLast.current.x = position.x
      stuckLast.current.y = position.y
      stuckLast.current.z = position.z
    }

    stuckTravel.current += Math.hypot(
      position.x - stuckLast.current.x,
      position.y - stuckLast.current.y,
      position.z - stuckLast.current.z
    )
    stuckLast.current.x = position.x
    stuckLast.current.y = position.y
    stuckLast.current.z = position.z
    stuckAge.current += delta

    if (calm.current > 0) {
      calm.current -= delta

      if (calm.current <= 0) {
        body.current.setLinearDamping(0.03)
        body.current.setAngularDamping(0.05)
      }
    }

    if (stuckAge.current >= 1) {
      stuckAge.current = 0

      if (stuckTravel.current < 0.4) {
        stuckTravel.current = 0

        const dx = position.x
        const dy = position.y
        const dz = position.z
        const length = Math.hypot(dx, dy, dz)

        const escape =
          length > 0.001
            ? { x: -dx / length, y: -dy / length, z: -dz / length }
            : { x: 1, y: 0, z: 0 }

        body.current.setLinvel(
          { x: escape.x * 2.6, y: escape.y * 2.6, z: escape.z * 2.6 },
          true
        )
        body.current.setLinearDamping(0.35)
        body.current.setAngularDamping(0.35)
        calm.current = 0.8
      }
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
      rotation={data.rotation}
      linearVelocity={data.velocity}
      angularVelocity={data.angularVelocity}
      colliders={false}
      mass={3}
      gravityScale={0}
      linearDamping={0.03}
      angularDamping={0.05}
      restitution={0.72}
      friction={0.1}
      canSleep={false}
      ccd
    >
      <mesh userData={{ ringIndex: index }}>
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
          friction={0.1}
          restitution={0.72}
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
  const grabbedRing = useRef(-1)
  const hoverCount = useRef(0)
  const { camera, pointer, raycaster } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  )

  useEffect(() => {
    const release = () => {
      grabbedRing.current = -1
      document.body.style.cursor = hoverCount.current > 0 ? "grab" : "auto"
    }

    window.addEventListener("pointerup", release)
    window.addEventListener("pointercancel", release)

    return () => {
      window.removeEventListener("pointerup", release)
      window.removeEventListener("pointercancel", release)
    }
  }, [])

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    const index = event.object.userData.ringIndex

    if (typeof index !== "number") return

    event.stopPropagation()
    grabbedRing.current = index
    document.body.style.cursor = "grabbing"
  }

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    hoverCount.current += 1

    if (grabbedRing.current === -1) {
      document.body.style.cursor = "grab"
    }
  }

  const handlePointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    hoverCount.current -= 1

    if (grabbedRing.current === -1 && hoverCount.current < 1) {
      document.body.style.cursor = "auto"
    }
  }

  useFrame((_, delta) => {
    raycaster.setFromCamera(pointer, camera)

    if (raycaster.ray.intersectPlane(plane, target)) {
      // Ease the repulsion field toward the cursor instead of
      // snapping, so entering the canvas doesn't kick the rings.
      const smoothing = 1 - Math.exp(-12 * delta)
      mouse.current.lerp(target, smoothing)
    }
  })

  return (
    <Physics gravity={[0, 0, 0]} timeStep="vary" interpolate>
      <Walls width={bounds.width} height={bounds.height} />

      <group
        onPointerDown={handlePointerDown}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {rings.map((ring, i) => (
          <Ring
            key={i}
            data={ring}
            index={i}
            bounds={bounds}
            mouse={mouse}
            grabbedRing={grabbedRing}
          />
        ))}
      </group>
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
        <color attach="background" args={["#121318"]} />

        <ambientLight intensity={0.7} />

        <directionalLight position={[6, 8, 6]} intensity={2.2} />

        <pointLight position={[-6, -4, 4]} intensity={1.8} color="#1a2ffb" />

        <pointLight position={[5, 3, -4]} intensity={1.2} color="#c1ff00" />

        <RingWorld />
      </Canvas>
    </div>
  )
}
