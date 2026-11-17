"use client"

import { useEffect, useRef } from "react"
import { LIGHTNING_SVG } from "./lightning-frames"

/**
 * The hand-sketched lightning overlay.
 *
 * The source SVG animates itself across ~50 SMIL frames over 3.333s —
 * each frame holds for ~66ms so the artwork reads as a boiling
 * pencil-sketched bolt. Its own timeline starts when the document gets
 * inserted, which would drift against the 3D strike by tens or hundreds
 * of milliseconds. So we don't let it run free: the svg's SMIL clock is
 * paused at t=0 and scrubbed from a rAF loop (`setCurrentTime`), scaled
 * by SKETCH_SPEED so the entire drawing cycle burns out during the
 * settle stage — starting on the exact commit where the 3D bolt lands.
 */
const SKETCH_SOURCE_SECONDS = 3.333
/** Full sketch cycle in settle stage: 3.333s of art played at ~4.5× */
const SKETCH_SPEED = 4.5

export default function ThunderSketch({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    host.innerHTML = LIGHTNING_SVG
    const svg = host.querySelector("svg")
    if (!svg || typeof (svg as unknown as { pauseAnimations?: () => void }).pauseAnimations !== "function") {
      return
    }

    /* Freeze its document clock, then drive it ourselves — this keeps the
       sketch from playing before impact and guarantees every reload draws
       the same frame sequence on the same beat. */
    svg.pauseAnimations()
    svg.setCurrentTime(0)

    let raf = 0
    const t0 = performance.now()
    const scrub = (now: number) => {
      const t = ((now - t0) / 1000) * SKETCH_SPEED
      svg.setCurrentTime(t % SKETCH_SOURCE_SECONDS)
      raf = requestAnimationFrame(scrub)
    }
    raf = requestAnimationFrame(scrub)

    return () => cancelAnimationFrame(raf)
  }, [])

  return <div ref={hostRef} className={className} aria-hidden="true" />
}
