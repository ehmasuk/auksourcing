"use client"

import dynamic from "next/dynamic"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { motion, useReducedMotion } from "motion/react"
import { StrikeChannel } from "./thunder-channel"
import { thunderReady } from "./thunder-ready"

/**
 * The storm's stages — every animated element on the page keys off this
 * single state machine, so the charge-up, the strike, the impact, the
 * reveal and the header all stay synchronized. There is no loader and
 * no animated background: the whole page surface IS the storm (the body
 * is painted black). The bolt comes from the top-centre of the screen
 * and hits the hero logo slot directly — ONE continuous motion down a
 * single vertical line, and after the flash everything calms: no
 * lingering sparks.
 *
 *   strike  → the page is black; the 3D thunder hangs large just below
 *             the top edge, right above the logo slot, slowly turning in
 *             3D and charging with light — the showcase moment
 *   settle  → THE STRIKE: the thunder accelerates down the channel in
 *             one continuous motion, corkscrewing as it falls, hits the
 *             logo slot and the page surface flashes white→dark
 *   land    → impact: the thunder icon is now minimized in the hero
 *             lockup (the brand bolt) behind the flash
 *   brand   → the alphabets arrive: AUK ⚡ OURCING and the tagline
 *   model   → the winged globe maximizes (scales to 1)
 *   done    → the header appears, one item at a time
 *   settled → resting state of the site
 */
export type ThunderStage =
  | "strike"
  | "settle"
  | "land"
  | "brand"
  | "model"
  | "done"
  | "settled"

const STAGE_ORDER: ThunderStage[] = [
  "strike",
  "settle",
  "land",
  "brand",
  "model",
  "done",
  "settled",
]

/** True once the stage machine has reached (or passed) `s` */
export function stageReached(stage: ThunderStage, s: ThunderStage) {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(s)
}

/** Viewport point the strike aims at — the hero logo slot, in px */
export interface StrikeTarget {
  x: number
  y: number
}

const ThunderContext = createContext<{
  stage: ThunderStage
  reportStrikeTarget: (target: StrikeTarget) => void
}>({ stage: "strike", reportStrikeTarget: () => {} })

export function useThunderRelay() {
  return useContext(ThunderContext)
}

/* Client-only WebGL canvas — the bolt scene mounts at first render */
const ThunderStrike = dynamic(() => import("./thunder-strike"), { ssr: false })

/**
 * Stage clock (ms) — anchored to the moment the thunder GLB resolves.
 * The bolt descends into view (~0.65s), hovers just a beat, then the
 * strike fires; after impact the reveal continues one beat at a time
 * (alphabets → winged globe → header). Must mirror DIVE_* in
 * thunder-strike.tsx.
 */
const STAGE_AT = {
  settle: 750,
  land: 1660,
  brand: 2350,
  model: 3500,
  done: 4700,
  settled: 6000,
} as const

/* The storm color IS the hero card color. Body stays dark permanently. */
const DARK = "#0c0d12"
/** Electric-surge white — the room "clips" to this during the flicker */
const SURGE = "#ffffff"

/** Seconds into "settle" when the bolt hits the logo slot (0.05s delay
    + 0.85s dive — mirrors thunder-strike.tsx) */
const IMPACT = 0.9

/* One shared impact shake across the world and the lightning layer */
const SHAKE_X = [0, -3, 2.5, -2, 1, 0]
const shakeTransition = {
  duration: 0.5,
  ease: "easeOut" as const,
  delay: IMPACT - 0.05,
}

export default function ThunderRelay({ children }: { children: ReactNode }) {
  /* Dev escape hatch: ?storm=force previews the full storm even on
     devices with reduced motion enabled at the OS level */
  const [forceStorm, setForceStorm] = useState(false)
  useEffect(() => {
    /* One-time hydration-safe read of an external system (the URL) */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForceStorm(new URLSearchParams(window.location.search).has("storm"))
  }, [])

  const prefersReduced = useReducedMotion() && !forceStorm
  const [stage, setStage] = useState<ThunderStage>("strike")
  const [strikeTarget, setStrikeTarget] = useState<StrikeTarget | null>(null)
  const reportStrikeTarget = useCallback((target: StrikeTarget) => {
    setStrikeTarget((prev) =>
      prev && prev.x === target.x && prev.y === target.y ? prev : target,
    )
  }, [])

  /* Stage clock — starts only when the thunder GLB has actually loaded,
     so the strike fires the instant the bolt is ready on every reload. */
  useEffect(() => {
    if (prefersReduced) {
      /* Reduced motion: skip straight to the resting site */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage("done")
      const doneTimer = window.setTimeout(() => setStage("settled"), 80)
      return () => clearTimeout(doneTimer)
    }

    let cancelled = false
    const ids: number[] = []

    /* 5s ceiling: a dead GLB must never hold the page in darkness */
    const fallback = new Promise<void>((resolve) => {
      ids.push(window.setTimeout(resolve, 5000))
    })
    Promise.race([thunderReady, fallback]).then(() => {
      if (cancelled) return
      ids.push(
        window.setTimeout(() => setStage("settle"), STAGE_AT.settle),
        window.setTimeout(() => setStage("land"), STAGE_AT.land),
        window.setTimeout(() => setStage("brand"), STAGE_AT.brand),
        window.setTimeout(() => setStage("model"), STAGE_AT.model),
        window.setTimeout(() => setStage("done"), STAGE_AT.done),
        window.setTimeout(() => setStage("settled"), STAGE_AT.settled),
      )
    })

    return () => {
      cancelled = true
      ids.forEach((id) => clearTimeout(id))
    }
  }, [prefersReduced])

  /* The storm owns the viewport — no scrolling until daylight — and the
     document itself is painted storm-dark so nothing light peeks through
     the seams (body gutters under the rounded hero card, overscroll).
     The body stays dark permanently; it is the hero's color. */
  useEffect(() => {
    const live = !stageReached(stage, "done")
    document.documentElement.style.overflow = live ? "hidden" : ""
    document.documentElement.style.backgroundColor = DARK
    document.body.style.backgroundColor = DARK
    return () => {
      document.documentElement.style.overflow = ""
    }
  }, [stage])

  const inStorm = !stageReached(stage, "brand")
  const shake = stage === "settle" || stage === "land"

  return (
    <ThunderContext.Provider value={{ stage, reportStrikeTarget }}>
      {/* The site itself opens black — the page surface is the storm. As
          the bolt hits the logo the whole surface strobes white→dark
          (like an electric surge), peaking exactly on impact. */}
      <motion.div
        className="relative"
        initial={{ backgroundColor: DARK }}
        animate={
          stage === "settle"
            ? { backgroundColor: [DARK, SURGE, DARK, SURGE, DARK] }
            : { backgroundColor: DARK }
        }
        transition={
          stage === "settle"
            ? {
                duration: 0.6,
                delay: IMPACT - 0.14,
                times: [0, 0.26, 0.5, 0.72, 1],
                ease: "linear",
              }
            : { duration: 0.8, ease: "easeInOut" }
        }
      >
        {/* The world shares the impact shake with the lightning layer */}
        <motion.div
          animate={shake ? { x: SHAKE_X } : { x: 0 }}
          transition={shake ? shakeTransition : { duration: 0 }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Lightning layer — the charge-up, the WebGL strike and the channel.
          It stays mounted through "land" so the channel and burst can
          burn out naturally and the WebGL bolt can fade away gracefully
          behind the flash (no hard cut), then unmounts at "brand". */}
      {inStorm && (
        <div className="pointer-events-none fixed inset-0 z-[60] select-none overflow-hidden">
          {/* Charge-up — the sky loading with light directly above the
              logo slot during the split second before the discharge.
              (The storm-charge keyframes translate -50%,-50% so `left`
              is the exact aim point.) */}
          {stage === "strike" && (
            <div
              className="storm-charge absolute top-0 size-[34vmin]"
              style={{
                left: strikeTarget?.x ?? "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(254,228,151,0.28) 30%, transparent 65%)",
              }}
            />
          )}

          {/* WebGL strike — the 3D thunder descends into view, shows
              itself above the logo slot (turning, charging), then
              accelerates straight down into the slot. At "land" the
              whole layer fades out behind the impact flash — the hand
              off to the minimized brand mark is seamless. */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: stage === "land" ? 0 : 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ThunderStrike stage={stage} target={strikeTarget} />
          </motion.div>

          {/* The lightning channel — the leader draws down toward the logo
              slot as the bolt falls, a lighter echo restrike follows, and
              the impact burst pops at the hit point. It hangs off the
              MEASURED logo x so channel, 3D thunder and the lockup share
              one vertical line. It stays mounted through "land" so the
              burn-out and burst complete instead of being cut. */}
          {(stage === "settle" || stage === "land") && strikeTarget && (
            <div className="absolute inset-0 z-[9]">
              <div
                className="absolute top-0 w-[56vmin] max-w-[540px] -translate-x-1/2"
                style={{
                  left: strikeTarget.x,
                  height: strikeTarget.y,
                  ["--channel-life" as string]: "1.15s",
                }}
              >
                <StrikeChannel className="h-full w-full" />
                <div className="h-full w-full origin-top scale-[0.72]">
                  <StrikeChannel
                    className="storm-channel-echo h-full w-full"
                    delay={0.3}
                  />
                </div>
              </div>
              <div
                className="storm-burst absolute size-[22vmin]"
                style={{
                  left: strikeTarget.x,
                  top: strikeTarget.y,
                  animationDelay: `${IMPACT - 0.03}s`,
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(254,228,151,0.45) 26%, transparent 60%)",
                }}
              />
            </div>
          )}
        </div>
      )}
    </ThunderContext.Provider>
  )
}
