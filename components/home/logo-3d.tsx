
"use client";

import { Bounds, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

function LogoModel() {
  const { scene } = useGLTF("/models/logo.glb");
  const meshRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    return SkeletonUtils.clone(scene);
  }, [scene]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

export default function Logo3D() {
  return (
    <Suspense
      fallback={
        <span className="text-body font-medium uppercase text-foreground">
          AUKSourcing
        </span>
      }
    >
      <div className="pointer-events-none" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 35 }}
          dpr={[1, 1.5]}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          style={{ pointerEvents: "none" }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[3, 4, 5]} intensity={2.5} />
          <directionalLight
            position={[-4, 1, -3]}
            intensity={1.5}
          />

          {/* Keep your original camera-fitting settings */}
          <Bounds fit clip observe margin={1.1}>
            <LogoModel />
          </Bounds>
        </Canvas>
      </div>
    </Suspense>
  );
}

useGLTF.preload("/models/logo.glb");
