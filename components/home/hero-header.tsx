import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

export default function HeroHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between py-5 md:py-6">
      {/* ── Brand Logo & Wordmark ──────────────────────────────── */}
      <a href="/" className="group flex items-center gap-3.5 select-none">
        <div className="relative h-11 w-auto aspect-2460/1630 transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/img/logo-emblem.png"
            alt="Auk Sourcing emblem"
            width={246}
            height={163}
            priority
            className="h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1 font-heading text-[17px] md:text-[18px] font-bold tracking-tight uppercase text-foreground leading-none">
            <span>AUK</span>
            <span className="text-[#f59e0b] text-[15px] leading-none inline-block transform -translate-y-px">⚡</span>
            <span>SOURCING</span>
          </div>
          <span className="text-[9px] md:text-[10px] font-mono tracking-[0.22em] uppercase text-foreground/45 mt-1">
            Global Sourcing • 3D Motion
          </span>
        </div>
      </a>

      {/* ── Center Studio Navigation ────────────────────────────── */}
      <nav className="hidden md:flex items-center gap-8 text-[12px] md:text-[13px] font-medium tracking-[0.04em] uppercase text-foreground/60 select-none">
        <a
          href="#sculpture"
          className="transition-colors duration-200 hover:text-foreground hover:opacity-100"
        >
          Kinetic 3D
        </a>
        <a
          href="#capabilities"
          className="transition-colors duration-200 hover:text-foreground hover:opacity-100"
        >
          Capabilities
        </a>
        <a
          href="#about"
          className="transition-colors duration-200 hover:text-foreground hover:opacity-100"
        >
          About
        </a>
      </nav>

      {/* ── Header Buttons ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Let's Talk Magnetic Pill CTA */}
        <a
          href="#contact"
          className="group relative inline-flex h-11 items-center gap-2.5 rounded-full bg-[#181920] pl-5 pr-3 text-[12px] md:text-[13px] font-medium uppercase tracking-[0.03em] text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:bg-[#111217] hover:shadow-[0_8px_24px_rgba(26,47,251,0.22)] hover:scale-[1.02] active:scale-95"
        >
          <span>Let&apos;s Talk</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-electric-indigo">
            <ArrowUpRight className="size-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>

        {/* Menu Trigger Pill */}
        <a
          href="#menu"
          className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-black/10 bg-white/70 px-5 text-[12px] md:text-[13px] font-medium uppercase tracking-[0.03em] text-foreground backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-black/20 hover:bg-white hover:scale-[1.02] active:scale-95"
        >
          <div className="flex flex-col gap-1 w-3.5">
            <span className="h-[1.5px] w-full bg-foreground transition-all duration-300 group-hover:w-full" />
            <span className="h-[1.5px] w-2/3 bg-foreground transition-all duration-300 group-hover:w-full" />
          </div>
          <span>Menu</span>
        </a>
      </div>
    </header>
  )
}
