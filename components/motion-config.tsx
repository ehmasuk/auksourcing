"use client"

import { MotionConfig } from "motion/react"
import { useState } from "react"

/**
 * Honors prefers-reduced-motion app-wide: transforms and layout
 * animations collapse to their endpoints, while opacity and color
 * animations still play (per Motion best practices).
 *
 * Dev escape hatch: visiting with ?storm=force previews the storm's
 * full motion even on devices with reduced motion enabled.
 */
export function MotionPrefs({ children }: { children: React.ReactNode }) {
  const [force] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("storm"),
  )
  return <MotionConfig reducedMotion={force ? "never" : "user"}>{children}</MotionConfig>
}
