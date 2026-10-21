"use client"

import { MousePointerClick } from "lucide-react"
import { useState } from "react"
import HeroModel from "./hero-model"

export default function HeroSection() {
  const [hasInteracted, setHasInteracted] = useState(false)

  return (
    <section className="relative px-4 sm:px-6 py-6 md:py-10">
      {/* ── Typographic Hero Statement ────────────────────────────── */}
      <div className="mx-auto max-w-4xl text-center pb-8 md:pb-10">
        {/* Eyebrow Label */}
        <div className="mb-4 inline-flex items-center gap-2 text-caption font-medium tracking-[0.16em] uppercase text-foreground/60 select-none">
          <span>+</span>
          <span>Digital Sculpture Gallery // 2026 Archive</span>
          <span>+</span>
        </div>

        {/* Sculpted Display Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-[50px] lg:text-[54px] font-medium leading-[1.08] tracking-[-0.03em] text-foreground">
          <span className="block">Global sourcing for premium product brands.</span>
          <span className="block text-foreground/85">From supplier discovery to final delivery.</span>
          <span className="block text-foreground/60">Trusted by 200+ teams worldwide.</span>
        </h1>
      </div>

      {/* ── Signature 100px-Radius 3D Sculpture Container ──────────── */}
      <div
        className="group relative w-full h-[520px] md:h-[620px] lg:h-[660px] rounded-[36px] md:rounded-imagecontainers overflow-hidden bg-[#121318] select-none"
        onPointerDown={() => setHasInteracted(true)}
      >
        {/* Subtle dark ambient vignetting */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(0,0,0,0.45)_100%)]" />

        {/* 3D Interactive Rapier Torus Simulation */}
        <HeroModel />

        {/* ── In-Canvas Quiet HUD Overlays (Non-Intrusive) ─────────── */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
          {/* Top Bar inside Canvas */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#1a2ffb] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/80">
                Kinetic Sculpture // 20 Elements
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-white/50 tracking-wider">
              <span>ZERO-G PHYSICS</span>
              <span>•</span>
              <span className="text-acid-lime">LIVE COLLISION</span>
            </div>
          </div>

          {/* Bottom Bar inside Canvas */}
          <div className="flex items-end justify-between text-white">
            <div className="hidden md:flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/40">
              <span>[ RAPIER 3D DYNAMICS ]</span>
            </div>

            {/* Interactive hint pill */}
            <div
              className={`flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3.5 py-1.5 font-mono text-[11px] text-white/80 backdrop-blur-md transition-opacity duration-700 ${
                hasInteracted ? "opacity-0" : "opacity-90"
              }`}
            >
              <MousePointerClick className="size-3 text-acid-lime animate-bounce" />
              <span>DRAG OR THROW OBJECTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Signature Scroll Prompt (from DESIGN.md) ───────────────── */}
      <div className="flex flex-col items-center justify-center gap-6 pt-12 pb-6 select-none">
        <div className="flex items-center gap-3 text-caption font-medium uppercase tracking-[0.18em] text-foreground transition-opacity hover:opacity-70">
          <span className="text-[10px] text-foreground/40">+</span>
          <span>Scroll to Explore</span>
          <span className="text-[10px] text-foreground/40">+</span>
        </div>

        {/* Decorative tick separator matching DESIGN.md Section 198 */}
        <div className="flex items-center gap-4 text-foreground/30 text-sm">
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>
      </div>
    </section>
  )
}
