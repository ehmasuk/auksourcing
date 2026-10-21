"use client"

import { useProgress } from "@react-three/drei"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { LoaderHud } from "./loader-hud"

// Dynamically import Canvas with SSR disabled to prevent WebGL SSR errors
const LoaderCanvas = dynamic(
  () => import("./loader-canvas").then((mod) => mod.LoaderCanvas),
  { ssr: false }
)

interface LoadingScreenProps {
  onFinished?: () => void
}

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const { progress: rawRealProgress } = useProgress()

  const [isMounted, setIsMounted] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isInteracted, setIsInteracted] = useState(false)

  const progressRef = useRef(0)
  const targetProgressRef = useRef(0)
  const isCompleteTriggered = useRef(false)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const triggerExit = useCallback(() => {
    if (isCompleteTriggered.current) return
    isCompleteTriggered.current = true
    setIsComplete(true)

    // Hold at 100% for 450ms for satisfying visual payoff
    setTimeout(() => {
      setIsExiting(true)

      // 900ms shutter split transition duration
      setTimeout(() => {
        setIsActive(false)
        setIsExiting(false)
        onFinished?.()
      }, 900)
    }, 450)
  }, [onFinished])

  const handleSkip = useCallback(() => {
    targetProgressRef.current = 100
    progressRef.current = 100
    setProgress(100)
    triggerExit()
  }, [triggerExit])

  // Reset and replay function
  const startLoadingSequence = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
    }
    isCompleteTriggered.current = false
    progressRef.current = 0
    targetProgressRef.current = 0
    setProgress(0)
    setIsComplete(false)
    setIsExiting(false)
    setIsInteracted(false)
    setIsActive(true)

    const startTime = performance.now()
    const MIN_DURATION = 2400 // 2.4s cinematic sequence

    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const timeRatio = Math.min(1, Math.max(0, elapsed / MIN_DURATION))

      // Smooth custom ease curve for progress (0 to 100 over MIN_DURATION)
      const simulatedPercent =
        timeRatio < 0.6
          ? Math.pow(timeRatio / 0.6, 1.8) * 78
          : 78 + Math.pow((timeRatio - 0.6) / 0.4, 0.9) * 22

      // If network asset download is still in flight, clamp simulated pace
      const isAssetDownloading =
        Number.isFinite(rawRealProgress) &&
        rawRealProgress > 0 &&
        rawRealProgress < 100

      const target = isAssetDownloading
        ? Math.min(simulatedPercent, Math.max(rawRealProgress, 20))
        : simulatedPercent

      if (timeRatio >= 1 && !isAssetDownloading) {
        targetProgressRef.current = 100
      } else {
        targetProgressRef.current = Math.min(99.4, target)
      }

      // Smooth lerp
      const diff = targetProgressRef.current - progressRef.current
      progressRef.current += diff * 0.095

      if (targetProgressRef.current >= 100 && 100 - progressRef.current < 0.4) {
        progressRef.current = 100
        setProgress(100)
        triggerExit()
        return
      }

      setProgress(progressRef.current)
      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [rawRealProgress, triggerExit])

  // Start on initial mount
  useEffect(() => {
    if (isMounted) {
      startLoadingSequence()
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isMounted, startLoadingSequence])

  // Keyboard shortcut listener: ESC to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive && !isExiting) {
        handleSkip()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isActive, isExiting, handleSkip])

  // Custom event listener for replay (stays permanently mounted!)
  useEffect(() => {
    const handleReplayEvent = () => {
      startLoadingSequence()
    }
    window.addEventListener("replay-loader", handleReplayEvent)
    return () => window.removeEventListener("replay-loader", handleReplayEvent)
  }, [startLoadingSequence])

  if (!isMounted || !isActive) {
    // Keep mounted so window event listener remains active!
    return <div className="hidden" aria-hidden="true" />
  }

  // Dynamic stage text
  const getStageText = () => {
    if (progress < 25) return "INITIALIZING 3D ENGINE"
    if (progress < 50) return "FETCHING HIGH-RES EMBLEM"
    if (progress < 75) return "COMPILING SHADERS & LIGHTING"
    if (progress < 95) return "CALIBRATING GEOMETRY"
    if (progress < 100) return "SYNCHRONIZING ASSETS"
    return "INITIALIZATION COMPLETE"
  }

  return (
    <div
      id="main-loader-screen"
      className="fixed inset-0 z-50 overflow-hidden select-none"
      style={{
        pointerEvents: isExiting ? "none" : "auto",
      }}
    >
      {/* ── Top Shutter Door (Background) ────────────────────── */}
      <div
        className={`absolute inset-x-0 top-0 h-1/2 bg-[#08090f] z-0 border-b border-white/[0.04] transition-transform duration-900 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#1a2ffb_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
      </div>

      {/* ── Bottom Shutter Door (Background) ─────────────────── */}
      <div
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[#08090f] z-0 border-t border-white/[0.04] transition-transform duration-900 ease-[cubic-bezier(0.85,0,0.15,1)] ${
          isExiting ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#1a2ffb_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
      </div>

      {/* ── Ambient Radial Glow behind 3D model ──────────────── */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 size-[550px] rounded-full blur-[100px] transition-all duration-700"
        style={{
          background: isComplete
            ? "radial-gradient(circle, rgba(193,255,0,0.22) 0%, rgba(26,47,251,0.28) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(26,47,251,0.28) 0%, rgba(99,103,255,0.14) 50%, transparent 75%)",
          transform: isExiting ? "scale(1.5)" : "scale(1)",
          opacity: isExiting ? 0 : 1,
        }}
      />

      {/* ── Central Horizon Beam Flare ───────────────────────── */}
      <div
        className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] z-15 bg-gradient-to-r from-transparent via-[#1a2ffb] to-transparent shadow-[0_0_24px_#1a2ffb] transition-all duration-500 ${
          isExiting ? "opacity-0 scale-x-150" : isComplete ? "opacity-100" : "opacity-40"
        }`}
      />

      {/* ── Central 3D Canvas Content ────────────────────────── */}
      <div
        className={`absolute inset-0 z-20 transition-all duration-400 ease-out ${
          isExiting ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        <LoaderCanvas
          isComplete={isComplete}
          onInteract={() => setIsInteracted(true)}
        />
      </div>

      {/* ── HUD Telemetry, Progress & Controls ───────────────── */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-350 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      >
        <LoaderHud
          progress={progress}
          stageText={getStageText()}
          isComplete={isComplete}
          isInteracted={isInteracted}
          onSkip={handleSkip}
        />
      </div>
    </div>
  )
}
