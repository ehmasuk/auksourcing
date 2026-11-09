"use client"

import { Center, Float, OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Suspense, useMemo, useRef } from "react"
import * as THREE from "three"
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js"

// ── Interactive Cursor Follow Spotlight ──────────────────────────────────
function CursorLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  const { pointer, viewport } = useThree()

  useFrame(() => {
    if (!lightRef.current) return
    const targetX = (pointer.x * viewport.width) / 2
    const targetY = (pointer.y * viewport.height) / 2
    lightRef.current.position.x = THREE.MathUtils.lerp(
      lightRef.current.position.x,
      targetX,
      0.1
    )
    lightRef.current.position.y = THREE.MathUtils.lerp(
      lightRef.current.position.y,
      targetY,
      0.1
    )
    lightRef.current.position.z = 2.4
  })

  return (
    <pointLight
      ref={lightRef}
      color="#1a2ffb"
      intensity={3.2}
      distance={8}
      decay={2}
    />
  )
}

// ── 3D Winged Globe Emblem ────────────────────────────────────────────────
function EmblemLogo() {
  const { scene } = useGLTF("/models/logo.glb")
  const groupRef = useRef<THREE.Group>(null)
  const pointer = useThree((state) => state.pointer)

  // Magnetic pull targets, updated only in useFrame
  const magnetPosition = useRef({ x: 0, y: 0 })

  // Shader uniforms — steady flap rhythm, no click swell
  const uniformsRef = useRef({
    uTime: { value: 0 },
    uFlapSpeed: { value: 3.2 },
    uFlapAmp: { value: 0.85 },
  })

  // Clone scene & inject GPU vertex flap shader
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const originalMaterials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]

          const modifiedMats = originalMaterials.map((mat) => {
            const customMat = mat.clone() as THREE.MeshStandardMaterial

            customMat.onBeforeCompile = (shader) => {
              shader.uniforms.uTime = uniformsRef.current.uTime
              shader.uniforms.uFlapSpeed = uniformsRef.current.uFlapSpeed
              shader.uniforms.uFlapAmp = uniformsRef.current.uFlapAmp

              shader.vertexShader = `
                uniform float uTime;
                uniform float uFlapSpeed;
                uniform float uFlapAmp;
                ${shader.vertexShader}
              `

              shader.vertexShader = shader.vertexShader.replace(
                "#include <begin_vertex>",
                `
                #include <begin_vertex>

                float absX = abs(transformed.x);
                float side = sign(transformed.x);
                float hingeX = 0.28;
                float wingSpan = 0.65;
                float normDist = clamp((absX - hingeX) / wingSpan, 0.0, 1.0);
                float w = smoothstep(0.0, 1.0, normDist);

                if (w > 0.0) {
                  float phase = uTime * uFlapSpeed - w * 1.15;
                  float flap = sin(phase);
                  float flapCos = cos(phase);

                  float dz = flap * 0.34 * w * uFlapAmp;
                  float dy = flap * 0.15 * w * uFlapAmp;
                  float dx = -side * flap * 0.06 * w * w * uFlapAmp;
                  float tipCurl = flapCos * 0.08 * pow(w, 2.0) * uFlapAmp;

                  transformed.z += dz + tipCurl;
                  transformed.y += dy;
                  transformed.x += dx;
                }
                `
              )

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
            ? modifiedMats
            : modifiedMats[0]
        }
      }
    })

    return clone
  }, [scene])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // 1. Consistent flap rhythm
    uniformsRef.current.uTime.value = state.clock.elapsedTime

    // 3. Natural body vertical lift with flapping
    const bodyLift =
      Math.sin(
        state.clock.elapsedTime * uniformsRef.current.uFlapSpeed.value
      ) * 0.038

    // 4. Magnetic interaction — the emblem is smoothly attracted
    //    toward the cursor (position pull + gentle tilt)
    const smoothing = 1 - Math.exp(-5 * delta)

    magnetPosition.current.x = THREE.MathUtils.lerp(
      magnetPosition.current.x,
      pointer.x * 0.36,
      smoothing
    )
    magnetPosition.current.y = THREE.MathUtils.lerp(
      magnetPosition.current.y,
      pointer.y * 0.26,
      smoothing
    )

    // 5. Magnetic tilt
    const targetRotX = -pointer.y * 0.22
    const targetRotY = pointer.x * 0.28
    const targetRotZ = -pointer.x * 0.08

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      smoothing
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      smoothing
    )
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      smoothing
    )

    // Scale stays constant — everything moves via magnet/light now
    groupRef.current.position.x = magnetPosition.current.x
    groupRef.current.position.y = bodyLift + magnetPosition.current.y + 1.3
  })

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  )
}

// ── Fallback Loader Sphere ───────────────────────────────────────────────
function ModelFallback() {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.elapsedTime * 0.8
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#1a2ffb"
        wireframe
        emissive="#1a2ffb"
        emissiveIntensity={0.8}
      />
    </mesh>
  )
}

// ── Main Exported 3D Scene Canvas ────────────────────────────────────────
export default function HeroLogoModel() {
  return (
    <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing select-none">
      <Canvas
        camera={{ position: [0, 0, 4.3], fov: 34 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Gallery lighting with high contrast & chromatic rim accents */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 7, 5]} intensity={2.8} />
        <directionalLight
          position={[-6, 3, -3]}
          intensity={2.2}
          color="#1a2ffb"
        />
        <directionalLight
          position={[4, -4, -2]}
          intensity={1.4}
          color="#c1ff00"
        />

        {/* Dynamic cursor follow spotlight */}
        <CursorLight />

        {/* 3D Winged Globe Emblem */}
        <Suspense fallback={<ModelFallback />}>
          <Float
            speed={1.4}
            rotationIntensity={0.08}
            floatIntensity={0.16}
            floatingRange={[-0.04, 0.04]}
          >
            <EmblemLogo />
          </Float>
        </Suspense>

        {/* Camera angle control: drag to orbit, hard-limited to a
            minimal sweep around the emblem so it never breaks framing */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.55}
          dampingFactor={0.06}
          enableDamping
          target={[0, 0.9, 0]}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.9}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
        />
      </Canvas>
    </div>
  )
}
