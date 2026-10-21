"use client"

import { Center, Float, useGLTF } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js"

export function LoaderPlaceholder() {
  const dotRef = useRef<THREE.Mesh>(null)
  const ping1Ref = useRef<THREE.Mesh>(null)
  const ping2Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gentle heartbeat on the core dot
    if (dotRef.current) {
      dotRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.18)
    }

    // Radar ping rings expanding and fading on a loop
    const PING_PERIOD = 1.5
    const updatePing = (mesh: THREE.Mesh | null, offset: number) => {
      if (!mesh) return
      const phase = (t / PING_PERIOD + offset) % 1
      mesh.scale.setScalar(0.5 + phase * 3.2)
      const mat = mesh.material as THREE.MeshBasicMaterial
      mat.opacity = 0.6 * (1 - phase) * (1 - phase)
    }
    updatePing(ping1Ref.current, 0)
    updatePing(ping2Ref.current, 0.5)
  })

  return (
    <group position={[0, MODEL_Y_OFFSET, 0]}>
      {/* Core dot — acid lime heartbeat */}
      <mesh ref={dotRef}>
        <sphereGeometry args={[0.045, 24, 24]} />
        <meshStandardMaterial
          color="#c1ff00"
          emissive="#c1ff00"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* Expanding indigo pings */}
      <mesh ref={ping1Ref}>
        <torusGeometry args={[0.06, 0.003, 8, 64]} />
        <meshBasicMaterial
          color="#1a2ffb"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ping2Ref}>
        <torusGeometry args={[0.06, 0.003, 8, 64]} />
        <meshBasicMaterial
          color="#1a2ffb"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// Fly-in intro tuning: distance, size and duration
const INTRO_START_Z = -18
const INTRO_START_SCALE = 0.22
const INTRO_DURATION = 2.2

// Vertical offset centered at origin
const MODEL_Y_OFFSET = 0

// Completion flourish: forward push toward the camera on the last flap
const COMPLETE_Z_PUSH = 0.25

function FlappingLogo({ isComplete }: { isComplete: boolean }) {
  const { scene } = useGLTF("/models/logo.glb")
  const groupRef = useRef<THREE.Group>(null)
  const pointer = useThree((state) => state.pointer)
  const introProgressRef = useRef(0)
  const completePushRef = useRef(0)

  // Uniforms passed to custom vertex shader for GPU-accelerated wing flapping
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uFlapSpeed: { value: 4.6 },
    uFlapAmp: { value: 1.0 },
  })

  // Clone scene and inject wing flapping shader deformation
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const originalMaterials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]

          const customMaterials = originalMaterials.map((mat) => {
            const customMat = mat.clone() as THREE.MeshStandardMaterial

            customMat.onBeforeCompile = (shader) => {
              shader.uniforms.uTime = uniformsRef.current.uTime
              shader.uniforms.uFlapSpeed = uniformsRef.current.uFlapSpeed
              shader.uniforms.uFlapAmp = uniformsRef.current.uFlapAmp

              // Prepend custom uniforms
              shader.vertexShader = `
                uniform float uTime;
                uniform float uFlapSpeed;
                uniform float uFlapAmp;
                ${shader.vertexShader}
              `

              // Inject organic wing flapping deformation
              shader.vertexShader = shader.vertexShader.replace(
                "#include <begin_vertex>",
                `
                #include <begin_vertex>

                // Lateral distance from center to isolate wings from central globe
                float absX = abs(transformed.x);
                float side = sign(transformed.x);
                float hingeX = 0.28;
                float wingSpan = 0.65;
                float normDist = clamp((absX - hingeX) / wingSpan, 0.0, 1.0);
                // Smooth transition: 0 on globe/rings, up to 1.0 on outer feathers
                float w = smoothstep(0.0, 1.0, normDist);

                if (w > 0.0) {
                  // Phase delay across feathers creates organic fluid wave
                  float phase = uTime * uFlapSpeed - w * 1.15;
                  float flap = sin(phase);
                  float flapCos = cos(phase);

                  // 1. Forward/backward power sweep
                  float dz = flap * 0.32 * w * uFlapAmp;

                  // 2. Up/down vertical flex
                  float dy = flap * 0.14 * w * uFlapAmp;

                  // 3. Spanwise expansion & contraction
                  float dx = -side * flap * 0.06 * w * w * uFlapAmp;

                  // 4. Feather tip aerodynamic curling
                  float tipCurl = flapCos * 0.07 * pow(w, 2.0) * uFlapAmp;

                  transformed.z += dz + tipCurl;
                  transformed.y += dy;
                  transformed.x += dx;
                }
                `
              )

              // Adjust normals for realistic light reflections across flapping feathers
              shader.vertexShader = shader.vertexShader.replace(
                "#include <beginnormal_vertex>",
                `
                #include <beginnormal_vertex>

                float absX_n = abs(position.x);
                float hingeX_n = 0.28;
                float wingSpan_n = 0.65;
                float normDist_n = clamp((absX_n - hingeX_n) / wingSpan_n, 0.0, 1.0);
                float w_n = smoothstep(0.0, 1.0, normDist_n);

                if (w_n > 0.0) {
                  float phase_n = uTime * uFlapSpeed - w_n * 1.15;
                  float flap_n = sin(phase_n);
                  objectNormal.z += flap_n * 0.45 * w_n * uFlapAmp;
                  objectNormal = normalize(objectNormal);
                }
                `
              )
            }

            customMat.needsUpdate = true
            return customMat
          })

          mesh.material = Array.isArray(mesh.material)
            ? customMaterials
            : customMaterials[0]
        }
      }
    })

    return clone
  }, [scene])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Update time uniform for shader
    uniformsRef.current.uTime.value = state.clock.elapsedTime

    // Fly-in intro: approach from far away while growing in size
    if (introProgressRef.current < 1) {
      introProgressRef.current = Math.min(
        1,
        introProgressRef.current + delta / INTRO_DURATION
      )
    }
    const introT = 1 - Math.pow(1 - introProgressRef.current, 3) // ease-out cubic
    const introScale = THREE.MathUtils.lerp(INTRO_START_SCALE, 1, introT)
    const introZ = THREE.MathUtils.lerp(INTRO_START_Z, 0, introT)

    // Accelerate wing flap slightly on completion
    const targetFlapSpeed = isComplete ? 6.5 : 4.6
    uniformsRef.current.uFlapSpeed.value = THREE.MathUtils.lerp(
      uniformsRef.current.uFlapSpeed.value,
      targetFlapSpeed,
      delta * 4
    )

    // Body naturally lifts with wing downstroke
    const bodyLift = Math.sin(state.clock.elapsedTime * uniformsRef.current.uFlapSpeed.value) * 0.035

    // Subtle aerodynamic pitch
    const pitch = Math.sin(state.clock.elapsedTime * uniformsRef.current.uFlapSpeed.value + 0.4) * 0.02

    // Parallax mouse tilt: model stays facing FRONT, but responds to cursor
    const targetRotX = -pointer.y * 0.12 + pitch
    const targetRotY = pointer.x * 0.15
    const targetRotZ = pointer.x * 0.05

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.08
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.08
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      0.08
    )

    // Completion flourish: scale pulse
    const targetScale = (isComplete ? 1.14 : 1) * introScale
    const currentScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      0.08
    )
    groupRef.current.scale.setScalar(currentScale)

    // Position: hover lift + forward fly-in along z, raised on screen
    groupRef.current.position.y = bodyLift + MODEL_Y_OFFSET

    // Completion flourish: lean slightly toward the camera on the last flap
    completePushRef.current = THREE.MathUtils.lerp(
      completePushRef.current,
      isComplete ? COMPLETE_Z_PUSH : 0,
      0.08
    )
    groupRef.current.position.z = introZ + completePushRef.current
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}

export function LoaderLogo({ isComplete }: { isComplete: boolean }) {
  return (
    <Suspense fallback={<LoaderPlaceholder />}>
      <Float
        speed={1.2}
        rotationIntensity={0.08}
        floatIntensity={0.15}
        floatingRange={[-0.03, 0.03]}
      >
        <FlappingLogo isComplete={isComplete} />
      </Float>
    </Suspense>
  )
}

useGLTF.preload("/models/logo.glb")
