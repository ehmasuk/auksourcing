"use client"

import { Center, useGLTF } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { animate, useMotionValue } from "motion/react"
import { Suspense, useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { signalThunderReady } from "./thunder-ready"
import type { StrikeTarget, ThunderStage } from "./thunder-relay"

/* Warm both model caches the instant this chunk loads — the bolt (and
   later the hero emblem) are then ready to fly on every reload. */
useGLTF.preload("/3dthunder.glb")
useGLTF.preload("/models/logo.glb")

/* Strike timings — must mirror STAGE_AT in thunder-relay.tsx: the dive
   starts 50ms after "settle" (750ms after the GLB resolves, after the
   descent has settled) and accelerates down for 850ms, so the "land"
   stage (1660ms) fires right on impact. */
const DIVE_DELAY = 0.05
const DIVE_DURATION = 0.85
/** Entrance — the bolt descends from above the viewport into its hold
    position; it must never just pop into existence */
const ENTRANCE_DELAY = 0.05
const ENTRANCE_DURATION = 0.6
/** Landing size at the logo slot — matches the SVG bolt's footprint */
const LAND_SCALE = 0.065

/** A falling body doesn't glide — it accelerates: the dive starts
    slow enough to read as 3D, then drops at near-terminal velocity
    into a dead stop at the logo slot. */
const STRIKE_EASE = [0.6, 0, 0.85, 0.4] as [number, number, number, number]

/** Bolt material — amber model tinted with the brand bolt glow */
function useBoltMaterial(scene: THREE.Group) {
  return useMemo(() => {
    const found: THREE.MeshStandardMaterial[] = []
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      const material = mesh.material as THREE.MeshStandardMaterial | undefined
      if (mesh.isMesh && material && !Array.isArray(mesh.material)) {
        const clone = material.clone()
        clone.emissive = new THREE.Color("#FEE497")
        clone.emissiveIntensity = 0.55
        mesh.material = clone
        found.push(clone)
      }
    })
    return (found[0] ?? null) as THREE.MeshStandardMaterial | null
  }, [scene])
}

function ThunderScene({
  stage,
  target,
}: {
  stage: ThunderStage
  target: StrikeTarget | null
}) {
  const { scene } = useGLTF("/3dthunder.glb")
  const { viewport, size } = useThree()
  const groupRef = useRef<THREE.Group>(null)
  const impactAt = useRef<number | null>(null)
  const clockAt = useRef(0)
  const started = useRef(false)
  const dived = useRef(false)
  /* Showcase hold pose — set once the model is ready, read every frame.
     holdUntil is the clock time the entrance finishes; the bob only
     engages after that, so the hand-off is seamless. */
  const holdY = useRef(0)
  const holdScale = useRef(1)
  const holdUntil = useRef(0)
  const mat = useBoltMaterial(scene)

  /* The model's natural footprint — measured so the hold pose occupies
     a known fraction of the screen on every device, regardless of the
     GLB's internal units */
  const naturalHeight = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    return Math.max(box.getSize(new THREE.Vector3()).y, 0.0001)
  }, [scene])

  /* The compiler forbids mutating the memoized material from a frame
     callback, so the frame loop reads it through a ref instead */
  const matRef = useRef<THREE.MeshStandardMaterial | null>(null)
  useEffect(() => {
    matRef.current = mat
  }, [mat])

  /* MotionValues drive the GPU-side transforms; they are only ever read
     inside useFrame, never during render (per Motion best practice). */
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const z = useMotionValue(0)
  const scale = useMotionValue(1)
  const tilt = useMotionValue(0)
  const spin = useMotionValue(0)

  /* Showcase hold — the bolt is VISIBLE here: sized to ~36% of the
     viewport height and hanging in the upper half of the screen, right
     above the logo slot, slowly turning in 3D while the charge-up glow
     builds. It DESCENDS into this pose from above the viewport — it
     never pops into existence — and only dwells for a beat before the
     strike. Runs the moment the model is actually ready, keeping the
     relay's stage clock and the visuals perfectly synchronized on
     every reload. */
  useEffect(() => {
    if (started.current) return
    started.current = true

    const group = groupRef.current
    if (!group) return

    holdScale.current = THREE.MathUtils.clamp(
      (viewport.height * 0.36) / naturalHeight,
      0.55,
      1.4,
    )
    holdY.current = viewport.height * 0.3

    /* Start fully above the viewport, a touch larger (closer to the
       camera) so the descent reads as depth */
    const startScale = holdScale.current * 1.18
    const startY =
      viewport.height / 2 + startScale * (naturalHeight / 2) + 0.3
    y.set(startY)
    scale.set(startScale)
    tilt.set(-0.28)
    group.visible = true

    holdUntil.current = clockAt.current + ENTRANCE_DELAY + ENTRANCE_DURATION
    animate(y, holdY.current, {
      delay: ENTRANCE_DELAY,
      duration: ENTRANCE_DURATION,
      ease: "easeOut",
    })
    animate(scale, holdScale.current, {
      delay: ENTRANCE_DELAY,
      duration: ENTRANCE_DURATION,
      ease: "easeOut",
    })

    /* The relay timeline is anchored right here */
    signalThunderReady()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, naturalHeight])

  /* Keep tracking the measured logo x while holding, so the bolt is
     always on the exact vertical line of the lockup before it strikes */
  useEffect(() => {
    if (dived.current || !target) return
    x.set(((target.x / size.width) * 2 - 1) * (viewport.width / 2))
  }, [target, size, viewport, x])

  /* THE STRIKE — one continuous accelerating plunge into the hero logo
     slot. The dive is fully three-dimensional: the bolt corkscrews
     around the vertical axis, eases back into the scene plane and
     shrinks as it lands, minimizing into the brand mark. */
  useEffect(() => {
    if (stage !== "settle" || dived.current) return
    const group = groupRef.current
    if (!group) return
    dived.current = true

    /* The measured logo slot, in px → world space at z=0 (the canvas is
       fixed and covers the viewport) */
    const px = target ?? { x: size.width / 2, y: size.height * 0.62 }
    const worldX = ((px.x / size.width) * 2 - 1) * (viewport.width / 2)
    const worldY = (0.5 - px.y / size.height) * viewport.height

    /* At least one more full revolution while falling, ending clean */
    const nextSpin =
      Math.ceil(spin.get() / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2

    x.set(worldX)

    /* Impact time for the emissive decay — the dead stop at the logo */
    impactAt.current = clockAt.current + DIVE_DELAY + DIVE_DURATION

    /* y/scale/tilt animate from their current (held) values — no snap.
       The depth does a gentle dip toward the camera mid-fall and eases
       back into the scene plane (two chained phases, no jump). */
    animate(y, worldY, { delay: DIVE_DELAY, duration: DIVE_DURATION, ease: STRIKE_EASE })
    animate(scale, LAND_SCALE, { delay: DIVE_DELAY, duration: DIVE_DURATION, ease: STRIKE_EASE })
    animate(tilt, 0, { delay: DIVE_DELAY, duration: DIVE_DURATION, ease: STRIKE_EASE })
    animate(spin, nextSpin, { delay: DIVE_DELAY, duration: DIVE_DURATION, ease: STRIKE_EASE })
    animate(z, 0.3, {
      delay: DIVE_DELAY,
      duration: DIVE_DURATION * 0.45,
      ease: "easeOut",
    })
    animate(z, 0, {
      delay: DIVE_DELAY + DIVE_DURATION * 0.45,
      duration: DIVE_DURATION * 0.55,
      ease: "easeIn",
    })
  }, [stage, target, size, viewport, x, y, z, scale, tilt, spin])

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return
    clockAt.current = clock.elapsedTime

    /* Showcase hold — a slow, continuous turn; once the descent has
       finished, a gentle bob eases in so the hand-off is seamless.
       (After the dive starts, animate() owns these values.) */
    if (!dived.current) {
      spin.set(spin.get() + delta * 0.9)
      if (clock.elapsedTime >= holdUntil.current) {
        const bobT = clock.elapsedTime - holdUntil.current
        const amp = Math.min(1, bobT / 0.6) * 0.05
        y.set(holdY.current + Math.sin(bobT * 1.8) * amp)
      }
    }

    group.position.x = x.get()
    group.position.y = y.get()
    group.position.z = z.get()
    group.scale.setScalar(scale.get())
    group.rotation.z = tilt.get()
    group.rotation.y = spin.get()

    /* Voltage flicker — a charge-up while held above the screen, then
       spiky, decaying pulses the moment it strikes the logo */
    const material = matRef.current
    if (material) {
      let intensity = 0.55
      const t0 = impactAt.current
      if (t0 !== null && clock.elapsedTime >= t0) {
        const t = clock.elapsedTime - t0
        const decay = Math.max(0, 1 - t / 0.55)
        intensity =
          0.55 +
          decay * decay *
            (3.1 * (0.55 + 0.45 * Math.abs(Math.sin(t * 46) * Math.sin(t * 27) * Math.sin(t * 11))))
      } else {
        const t = clock.elapsedTime
        intensity =
          0.55 + 0.5 * Math.max(0, t) * (0.6 + 0.4 * Math.abs(Math.sin(t * 31) * Math.sin(t * 7.7)))
      }
      material.emissiveIntensity = intensity
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

/** Client-only WebGL layer for the lightning strike */
export default function ThunderStrike({
  stage,
  target,
}: {
  stage: ThunderStage
  target: StrikeTarget | null
}) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 34 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        {/* Storm lighting: one warm key from above, one cool slate rim —
            two lights total so the model reads as lit by the storm sky,
            not staged in a colorful studio */}
        <ambientLight intensity={0.85} />
        <directionalLight position={[0, 6, 8]} intensity={2.6} color="#fff3d6" />
        <directionalLight position={[-5, 2, -4]} intensity={0.9} color="#5b6b8c" />

        <Suspense fallback={null}>
          <ThunderScene stage={stage} target={target} />
        </Suspense>
      </Canvas>
    </div>
  )
}
