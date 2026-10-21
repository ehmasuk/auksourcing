"use client"

import dynamic from "next/dynamic"
import { useState } from "react"

// Dynamic import with SSR disabled to ensure WebGL only mounts client-side
const HeroLogoModel = dynamic(() => import("./hero-logo-model"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#0c0d12]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-electric-indigo border-t-transparent animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest text-white/50">
          Loading 3D Emblem...
        </span>
      </div>
    </div>
  ),
})

export default function HeroLogoSection() {
  const [hasInteracted, setHasInteracted] = useState(false)

  return (
    <section className="relative w-full pt-1 pb-10">
      {/* ── 3D Brand Logo Showcase Container ───────────────────────── */}
      <div
        className="group relative w-full h-[calc(100vh-140px)] min-h-155 max-h-210 rounded-[28px] md:rounded-[36px] lg:rounded-[40px] overflow-hidden bg-[#0c0d12] select-none shadow-[0_24px_70px_rgba(0,0,0,0.12)] ring-1 ring-black/6"
        onPointerDown={() => setHasInteracted(true)}
      >
        {/* Ambient atmospheric vignetting & subtle deep blue center glow */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_50%,rgba(26,47,251,0.1)_0%,transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(0,0,0,0.65)_100%)]" />

        {/* Real-time 3D Winged Globe Experience */}
        <HeroLogoModel />

        {/* ── In-Canvas Quiet Studio HUD Overlays ────────────────────── */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-5 md:p-8">
          {/* Top Bar: Telemetry */}
          <div className="flex items-center text-white">
            {/* Left: Brand Identity Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 backdrop-blur-md">
                <span className="size-2 rounded-full bg-electric-indigo animate-pulse" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-white/90">
                  AUK EMBLEM // 3D CORE
                </span>
              </div>

              <div className="hidden lg:flex items-center gap-2 font-mono text-[11px] text-white/45 tracking-wider">
                <span>177K TOPOLOGY</span>
                <span>•</span>
                <span className="text-acid-lime">AERODYNAMIC VERTEX SHADER</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Studio Philosophy + Interactive Cue */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between text-white">
            {/* Studio Brand Descriptor */}
            <div className="flex flex-col gap-1 select-none">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-electric-indigo" />
                <span className="text-[13px] md:text-[14px] font-medium uppercase tracking-tight text-white/95">
                  The Winged Sphere • Master Emblem
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] font-mono tracking-wider text-white/45 pl-3.5">
                Global Sourcing at the Intersection of Design & 3D Engineering
              </span>
            </div>

            {/* Interactive hint (with clearance for fixed replay button) */}
            <div
              className={`flex items-center gap-2.5 rounded-full border border-white/15 bg-black/60 px-4 py-2 font-mono text-[11px] text-white/90 backdrop-blur-md transition-all duration-700 ${
                hasInteracted
                  ? "opacity-60 hover:opacity-100"
                  : "opacity-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              }`}
            >
              <span className="size-1.5 rounded-full bg-acid-lime animate-ping" />
              <span className="tracking-wide text-[10px] md:text-[11px]">
                MOVE TO MAGNETIZE • DRAG TO ORBIT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Signature Scroll Prompt (Matching DESIGN.md) ───────────── */}
      <div className="flex flex-col items-center justify-center gap-5 pt-10 pb-4 select-none">
        <div className="flex items-center gap-3 text-caption font-medium uppercase tracking-[0.18em] text-foreground/80 transition-opacity hover:opacity-60 cursor-pointer">
          <span className="text-[10px] text-foreground/40">+</span>
          <span>Scroll to Explore</span>
          <span className="text-[10px] text-foreground/40">+</span>
        </div>

        {/* Decorative tick separator */}
        <div className="flex items-center gap-4 text-foreground/25 text-sm">
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>
      </div>
    </section>
  )
}
