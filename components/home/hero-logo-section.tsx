"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect, useRef } from "react"
import { HeroThunderBolt } from "@/components/loader/thunder-bolt"
import { stageReached, useThunderRelay } from "@/components/loader/thunder-relay"
import dynamic from "next/dynamic"
import SlideUpText from "../ui/slide-up"

// Dynamic import with SSR disabled to ensure WebGL only mounts client-side
const HeroLogoModel = dynamic(() => import("./hero-logo-model"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0c0d12]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-electric-indigo border-t-transparent" />
        <span className="font-mono text-xs tracking-widest text-white/50 uppercase">
          Loading 3D Emblem...
        </span>
      </div>
    </div>
  ),
})

export default function HeroLogoSection() {
  const { stage, reportStrikeTarget } = useThunderRelay()
  const reducedMotion = useReducedMotion()
  /* One beat at a time: the alphabets arrive at "brand", the winged
     globe maximizes at "model", the scroll prompt waits for "done". */
  const brandLive = stageReached(stage, "brand")
  const modelLive = stageReached(stage, "model")
  const siteLive = stageReached(stage, "done")

  /* The bolt slot is the strike's aim point. It is measured from the
     very first frame (the slot holds its final size while the storm is
     still raging, so nothing shifts when the bolt pops in at impact)
     and reported to the relay, which aims the WebGL strike and the
     lightning channel straight at it. */
  const boltSlotRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const measure = () => {
      const el = boltSlotRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return
      reportStrikeTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    }
    measure()
    window.addEventListener("resize", measure)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => window.removeEventListener("resize", measure)
  }, [reportStrikeTarget])

  return (
    <section className="relative w-full pt-1 pb-10">
      {/* ── 3D Brand Logo Showcase Container ─────────────────────────
          During the storm this is NOT a card: no corners, no ring, no
          shadow, no vignettes — just one dark surface blended into the
          black body, so the strike happens on the page itself, not in a
          loading box. The card identity only arrives with daylight. */}
      <motion.div
        className="group relative h-[calc(100vh-140px)] max-h-210 min-h-155 w-full overflow-hidden select-none"
        // animate={
        //   isLive
        //     ? {
        //         borderRadius: 40,
        //         boxShadow:
        //           "inset 0px 0px 0px 1px rgba(0,0,0,0.06), 0px 24px 70px rgba(0,0,0,0.12)",
        //       }
        //     : {
        //         borderRadius: 0,
        //         boxShadow:
        //           "inset 0px 0px 0px 1px rgba(0,0,0,0), 0px 24px 70px rgba(0,0,0,0)",
        //       }
        // }
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ambient atmospheric vignetting & subtle deep blue center glow —
            daylight-only, so the storm surface stays perfectly flat */}
        {/* <motion.div
          className="pointer-events-none absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLive ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(26,47,251,0.1)_0%,transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(0,0,0,0.65)_100%)]" />
        </motion.div> */}

        {/* Real-time 3D Winged Globe Experience — maximizes only after
            the wordmark has arrived: scales up from nothing on a spring
            (reduced motion: plain fade) */}
        {modelLive ? (
          <motion.div
            initial={reducedMotion ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reducedMotion
                ? { duration: 0.6, delay: 0.1 }
                : { type: "spring", stiffness: 105, damping: 13, mass: 0.9, delay: 0.05 }
            }
            style={{ transformOrigin: "50% 50%" }}
            className="absolute inset-0 z-0"
          >
            <HeroLogoModel />
          </motion.div>
        ) : null}

        {/* ── Fixed Brand Lockup Under the 3D Emblem ────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[22%] z-10 flex flex-col items-center gap-2 px-6 text-center sm:gap-2.5">
          {/* Wordmark: AUK ⚡ OURCING — the alphabets slide up around the
              landed bolt, one after another */}
          <div className="flex items-center font-heading text-3xl leading-none text-white sm:text-5xl md:text-4xl">
            <SlideUpText split="characters" stagger={0.08} delay={0.12} autoStart={brandLive}>
              AUK
            </SlideUpText>
            {/* The strike's aim point — sized from the first frame so the
                bolt lands here with zero layout shift */}
            <span
              ref={boltSlotRef}
              className="mx-1 inline-flex size-10 items-center justify-center"
            >
              <HeroThunderBolt className="size-full" />
            </span>
            <SlideUpText split="characters" stagger={0.06} delay={0.32} autoStart={brandLive}>
              OURCING
            </SlideUpText>
          </div>

          {/* Tagline */}
          <SlideUpText
            split="characters"
            stagger={0.03}
            delay={0.6}
            autoStart={brandLive}
            className="text-sm font-light text-white/90 sm:text-base md:text-lg"
          >
            Connecting the world efficiently
          </SlideUpText>
        </div>
      </motion.div>

      {/* ── Signature Scroll Prompt (Matching DESIGN.md) ───────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={siteLive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className="flex flex-col items-center justify-center gap-5 pt-10 pb-4 select-none"
      >
        <div className="flex cursor-pointer items-center gap-3 text-white/80 text-caption font-medium tracking-[0.18em]  uppercase transition-opacity hover:opacity-60">
          <span className="text-[10px] text-white/40">+</span>
          <span>Scroll to Explore</span>
          <span className="text-[10px] text-white/40">+</span>
        </div>

        {/* Decorative tick separator */}
        <div className="flex items-center gap-4 text-sm text-white/25">
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>
      </motion.div>
    </section>
  )
}
