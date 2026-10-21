"use client"

import { MousePointerClick } from "lucide-react"
import { useState } from "react"
import HeroModel from "./hero-model"

export default function HeroSection() {
  const [hasInteracted, setHasInteracted] = useState(false)

  return (
    <section className="relative w-full pt-1 pb-10">
      {/* ── Focused 3D Kinetic Sculpture Container ───────────────── */}
      <div
        className="group relative w-full h-[calc(100vh-140px)] min-h-[600px] max-h-[820px] rounded-[28px] md:rounded-[36px] lg:rounded-[40px] overflow-hidden bg-[#121318] select-none shadow-[0_20px_50px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]"
        onPointerDown={() => setHasInteracted(true)}
      >
        {/* Subtle dark ambient vignetting */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_65%,rgba(0,0,0,0.45)_100%)]" />

        {/* 3D Interactive Rapier Torus Simulation */}
        <HeroModel />

        {/* ── In-Canvas Quiet HUD Overlays (Non-Intrusive) ─────────── */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
          {/* Top Bar inside Canvas */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/40 px-3.5 py-1.5 backdrop-blur-md">
              <span className="size-2 rounded-full bg-electric-indigo animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/85">
                Kinetic Sculpture // 20 Elements
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-white/45 tracking-wider">
              <span>ZERO-G PHYSICS</span>
              <span>•</span>
              <span className="text-acid-lime">LIVE COLLISION DYNAMICS</span>
            </div>
          </div>

          {/* Bottom Bar inside Canvas */}
          <div className="flex items-end justify-between text-white">
            {/* 3D Power & Studio Punchline */}
            <div className="flex flex-col gap-1 select-none">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-electric-indigo" />
                <span className="text-[13px] md:text-[14px] font-medium uppercase tracking-tight text-white/95">
                  Real-time 3D Kinetic Simulation
                </span>
              </div>
              <span className="text-[10px] md:text-[11px] font-mono tracking-wider text-white/45 pl-3.5">
                Physics-Driven Rigid Bodies • Drag & Repulsion Mechanics
              </span>
            </div>

            {/* Interactive hint pill */}
            <div
              className={`flex items-center gap-2.5 rounded-full border border-white/15 bg-black/60 px-4 py-2 font-mono text-[11px] text-white/90 backdrop-blur-md transition-all duration-700 ${
                hasInteracted
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              }`}
            >
              <MousePointerClick className="size-3.5 text-acid-lime animate-bounce" />
              <span className="tracking-wide">GRAB & THROW OBJECTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Signature Scroll Prompt (from DESIGN.md) ───────────────── */}
      <div className="flex flex-col items-center justify-center gap-5 pt-10 pb-4 select-none">
        <div className="flex items-center gap-3 text-caption font-medium uppercase tracking-[0.18em] text-foreground/80 transition-opacity hover:opacity-60 cursor-pointer">
          <span className="text-[10px] text-foreground/40">+</span>
          <span>Scroll to Explore</span>
          <span className="text-[10px] text-foreground/40">+</span>
        </div>

        {/* Decorative tick separator matching DESIGN.md Section 198 */}
        <div className="flex items-center gap-4 text-foreground/25 text-sm">
          <span>+</span>
          <span>+</span>
          <span>+</span>
        </div>
      </div>
    </section>
  )
}
