"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "motion/react"
import { ThunderBolt } from "./thunder-bolt"

interface LoadingScreenProps {
  onFinished?: () => void
}

/**
 * Orchestration timings (ms only). Every visual here is a
 * compositor-only CSS keyframe (globals.css — "Loader Thunder"); the
 * loader stays perfectly smooth even while the WebGL canvas renders
 * behind the overlay. Motion is kept for what it's best at:
 * the shared-element bolt handoff (ThunderBolt layoutId) and the
 * state machine that times the exit to that handoff.
 */
const HOLD_MS = 3000
const EXIT_MS = 900

export default function LoadingScreen({ onFinished }: LoadingScreenProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const triggerExit = useCallback(() => {
    setIsExiting(true)

    // Fade the screen, then unmount — in that same commit the bolt
    // unmounts and the hero bolt mounts, flying the shared layoutId
    // element into its hero slot
    setTimeout(() => {
      setIsActive(false)
      onFinished?.()
    }, EXIT_MS)
  }, [onFinished])

  // Start on initial mount: hold the bolt on screen, then exit
  useEffect(() => {
    if (!isMounted) return

    const holdTimeout = setTimeout(triggerExit, HOLD_MS)
    return () => clearTimeout(holdTimeout)
  }, [isMounted, triggerExit])

  // Custom event listener for replay (stays permanently mounted!)
  useEffect(() => {
    const handleReplayEvent = () => {
      setIsExiting(false)
      setIsActive(true)
      setTimeout(triggerExit, HOLD_MS)
    }
    window.addEventListener("replay-loader", handleReplayEvent)
    return () => window.removeEventListener("replay-loader", handleReplayEvent)
  }, [triggerExit])

  if (!isMounted) {
    return null
  }

  if (!isActive) {
    // Keep mounted so replay event listener remains active
    return <div className="hidden" aria-hidden="true" />
  }

  return (
    <>
      {/* Darkness — a circular clip anchored on the bolt: while loading
          the circle covers the whole viewport; on exit it contracts to
          zero width, swallowing the glow/shockwave as it closes into
          the thunder */}
      <div
        id="main-loader-screen"
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none"
        style={{ pointerEvents: isExiting ? "none" : "auto" }}
      >
        <div
          className={`absolute inset-0 bg-[#08090f] ${
            isExiting ? "loader-iris" : ""
          }`}
        >
          {/* Ambient brand glow behind the bolt */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="loader-glow size-[55vmax] rounded-full bg-[radial-gradient(circle,rgba(254,228,151,0.14)_0%,rgba(99,102,241,0.08)_36%,transparent_70%)]" />
          </div>

          {/* Shockwave ring from the impact point */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="loader-shockwave size-20 sm:size-24 md:size-28 rounded-full border-2 border-[#FEE497]/50" />
          </div>

          {/* Full-screen flash when the bolt arrives */}
          <div className="loader-flash pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0%,rgba(254,228,151,0.35)_30%,transparent_65%)]" />
        </div>
      </div>

      {/* Bolt layer — sibling of the fading screen so the bolt stays
          visible all the way to the hero handoff. layoutRoot lets Motion
          measure shared-element snapshots inside this fixed container. */}
      <motion.div
        layoutRoot
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none"
      >
        {/* Dive: huge-to-rest glide (CSS, GPU-composited) */}
        <div className="loader-bolt-dive flex items-center justify-center">
          {/* FX: blur/brightness resolve, or the exit discharge surge */}
          <div
            className={`flex items-center justify-center ${
              isExiting ? "loader-bolt-surge" : "loader-bolt-fx"
            }`}
          >
            {/* Breathing keeps the bolt alive while it rests */}
            <div className="loader-bolt-breathe flex items-center justify-center">
              <ThunderBolt className="size-10 sm:size-12 md:size-14" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
