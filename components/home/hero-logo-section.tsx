"use client"

import { HeroThunderBolt } from "@/components/loader/thunder-bolt"
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
  return (
    <section className="relative w-full pt-1 pb-10">
      {/* ── 3D Brand Logo Showcase Container ───────────────────────── */}
      <div className="group relative h-[calc(100vh-140px)] max-h-210 min-h-155 w-full overflow-hidden rounded-[28px] bg-[#0c0d12] shadow-[0_24px_70px_rgba(0,0,0,0.12)] ring-1 ring-black/6 select-none md:rounded-[36px] lg:rounded-[40px]">
        {/* Ambient atmospheric vignetting & subtle deep blue center glow */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_50%,rgba(26,47,251,0.1)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(0,0,0,0.65)_100%)]" />

        {/* Real-time 3D Winged Globe Experience */}
        <HeroLogoModel />

        {/* ── Fixed Brand Lockup Under the 3D Emblem ────────────────── */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[22%] z-10 flex flex-col items-center gap-2 px-6 text-center sm:gap-2.5">
          {/* Wordmark: AUK ⚡ OURCING */}
          <div className="flex items-center font-heading text-3xl leading-none text-white sm:text-5xl md:text-4xl">
            <SlideUpText split="characters" stagger={0.08} delay={4.5}>
              AUK
            </SlideUpText>
            <HeroThunderBolt className="mx-1 size-10" />
            <SlideUpText split="characters" stagger={0.06} delay={5}>
              OURCING
            </SlideUpText>
          </div>

          {/* Tagline */}
          <SlideUpText
            split="characters"
            stagger={0.03}
            delay={5.5}
            className="text-sm font-light text-white/90 sm:text-base md:text-lg"
          >
            Connecting the world efficiently
          </SlideUpText>
        </div>
      </div>

      {/* ── Signature Scroll Prompt (Matching DESIGN.md) ───────────── */}
      <div className="flex flex-col items-center justify-center gap-5 pt-10 pb-4 select-none">
        <div className="flex cursor-pointer items-center gap-3 text-caption font-medium tracking-[0.18em] text-foreground/80 uppercase transition-opacity hover:opacity-60">
          <span className="text-[10px] text-foreground/40">+</span>
          <span>Scroll to Explore</span>
          <span className="text-[10px] text-foreground/40">+</span>
        </div>

        {/* Decorative tick separator */}
        <div className="flex items-center gap-4 text-sm text-foreground/25">
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>
      </div>
    </section>
  )
}
