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
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10 size-[500px] rounded-full blur-[100px] transition-all duration-700"
        style={{
          background: isComplete
            ? "radial-gradient(circle, rgba(193,255,0,0.18) 0%, rgba(26,47,251,0.25) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(26,47,251,0.25) 0%, rgba(99,103,255,0.12) 50%, transparent 75%)",
          transform: isExiting ? "scale(1.5)" : "scale(1)",
          opacity: isExiting ? 0 : 1,
        }}
      />

      {/* ── Structured Interactive Foreground ────────────────── */}
      <div
        className={`relative z-20 flex h-full w-full flex-col justify-between p-6 md:p-10 transition-all duration-400 ease-out ${
          isExiting
            ? "opacity-0 scale-105 pointer-events-none"
            : "opacity-100 scale-100"
        }`}
      >
        {/* Top Discreet Telemetry Header */}
        <header className="flex items-center justify-between text-white/40 text-[10px] font-mono uppercase tracking-[0.18em] select-none pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-electric-indigo animate-pulse" />
            <span>Auk Sourcing // Studio 3D</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/30">
            <span>[ ESC ] TO SKIP</span>
          </div>
        </header>

        {/* Center Lockup: 3D Model + Brand Wordmark */}
        <div className="flex flex-col items-center justify-center -my-2 select-none flex-1">
          {/* 3D Model Viewport (Upper Half) */}
          <div className="relative w-full h-[38vh] sm:h-[44vh] min-h-[260px] max-h-[460px] flex items-center justify-center">
            <LoaderCanvas
              isComplete={isComplete}
              onInteract={() => setIsInteracted(true)}
            />
          </div>

          {/* Brand Wordmark & Tagline Lockup (Directly Beneath Model) */}
          <div className="flex flex-col items-center gap-3 text-center px-4 -mt-2 sm:-mt-4 relative z-20 pointer-events-none">
            {/* Subtle atmospheric ambient glow */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-20 w-80 bg-[radial-gradient(ellipse_at_center,rgba(26,47,251,0.2),transparent_70%)] animate-loader-glow" />

            {/* Unified, Perfectly Symmetrical Brand Name */}
            <h1 className="relative font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[58px] font-medium tracking-[0.22em] uppercase leading-none select-none animate-loader-wordmark">
              <span className="relative z-10 inline-block animate-loader-shimmer drop-shadow-[0_4px_30px_rgba(255,255,255,0.22)]">
                AUKSOURCING
              </span>
            </h1>

            {/* Refined Brand Tagline with Hairlines */}
            <div className="flex items-center justify-center gap-3 md:gap-4 transition-all duration-700 delay-300">
              <span className="h-px w-6 sm:w-10 md:w-14 bg-linear-to-r from-transparent to-white/20" />
              <p className="font-mono text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.34em] text-white/50">
                Connecting the world efficiently
              </p>
              <span className="h-px w-6 sm:w-10 md:w-14 bg-linear-to-l from-transparent to-white/20" />
            </div>
          </div>
        </div>

        {/* Bottom Progress & Telemetry Footer */}
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
