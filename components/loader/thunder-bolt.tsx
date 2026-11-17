"use client"

import { LoaderBolt } from "./loader-bolt"
import { stageReached, useThunderRelay } from "./thunder-relay"

interface ThunderBoltProps {
  className?: string
}

/**
 * Hero slot of the brand bolt — the thunder icon, now minimized. It
 * mounts the instant the 3D thunder lands ("land" stage) at the exact
 * point it strikes; the impact flash masks the WebGL → SVG handoff and
 * the `storm-bolt-impact` pop sells the hit. No sparks, no flight —
 * the strike is one continuous motion from the top of the screen
 * straight into this slot.
 */
export function HeroThunderBolt({ className }: ThunderBoltProps) {
  const { stage } = useThunderRelay()
  const live = stageReached(stage, "land")
  if (!live) return null
  return (
    <span
      className={`storm-bolt-impact inline-flex shrink-0 items-center justify-center ${
        className ?? ""
      }`}
    >
      <LoaderBolt className="size-full" />
    </span>
  )
}
