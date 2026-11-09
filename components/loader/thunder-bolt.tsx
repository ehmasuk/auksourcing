"use client"

import { motion } from "motion/react"
import { LoaderBolt } from "./loader-bolt"
import { useThunderRelay } from "./thunder-relay"

/**
 * `layoutId` shared across the loading screen and the hero lockup.
 * Sizing is supplied per usage via `className` on the wrapper; the svg
 * fills it. Layout animation transition must live on the element
 * animating TO (the hero bolt), per Motion's shared-element rules.
 */
const THUNDER_LAYOUT_ID = "brand-thunder"

/* Duration-based tween (not a spring) so the flight releases with the
   same long, gliding character as the initial thunder dive */
const FLIGHT_TRANSITION = {
  layout: {
    duration: 1.4,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
}

interface ThunderBoltProps {
  className?: string
}

/** Bare shared-element bolt — used by the loading screen. */
export function ThunderBolt({ className }: ThunderBoltProps) {
  return (
    <motion.span
      layoutId={THUNDER_LAYOUT_ID}
      transition={FLIGHT_TRANSITION}
      className={`inline-flex shrink-0 items-center justify-center ${
        className ?? ""
      }`}
      style={{ transformOrigin: "50% 50%", willChange: "transform" }}
    >
      <LoaderBolt className="size-full" />
    </motion.span>
  )
}

/**
 * Hero slot of the same true bolt — mounts in the same commit the
 * loader bolt unmounts, which is what makes Motion fly it over.
 */
export function HeroThunderBolt({ className }: ThunderBoltProps) {
  const { hasLanded } = useThunderRelay()
  if (!hasLanded) return null
  return <ThunderBolt className={className} />
}
