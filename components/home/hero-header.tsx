"use client"

import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { stageReached, useThunderRelay } from "@/components/loader/thunder-relay"
import { LoaderBolt } from "../loader/loader-bolt"
import FloatingMenu from "../ui/menu"

export default function HeroHeader() {
  const { stage } = useThunderRelay()
  /* The header is the last beat of the storm — it only enters after the
     winged globe has maximized, one item at a time. */
  const isLive = stageReached(stage, "done")

  return (
    <motion.header
      /* Hidden until the storm has landed — then drops in from above.
          The children enter one by one (brand → CTA → menu), like a
          runway walk, after the globe has maximized. */
      initial={{ y: -24 }}
      animate={isLive ? { y: 0 } : { y: -24 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex items-center justify-between py-5 md:py-6"
    >
      {/* ── Brand Logo & Wordmark ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={isLive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-w-0"
      >
        <Link href="/" className="group flex items-center gap-3.5 select-none">
          <div className="relative aspect-2460/1630 h-11 w-auto transition-transform duration-300 group-hover:scale-105">
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
            <div className="flex items-center font-heading text-white/90 text-[17px] leading-none font-bold tracking-tight  uppercase md:text-[18px]">
              <span>AUK</span>
              <LoaderBolt className="size-5 shrink-0 sm:size-6" />
              <span>OURCING</span>
            </div>
            <span className="mt-1 font-mono text-[9px] text-white/80 tracking-[0.22em] uppercase md:text-[10px]">
              Connecting the world efficiently
            </span>
          </div>
        </Link>
      </motion.div>


      {/* ── Header Buttons ─────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Let's Talk Magnetic Pill CTA */}
        <motion.a
          href="#contact"
          initial={{ opacity: 0, y: 10 }}
          animate={isLive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="group relative inline-flex h-11 items-center gap-2.5 rounded-full bg-[#181920] pr-3 pl-5 text-[12px] font-medium tracking-[0.03em] text-white uppercase shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:scale-[1.02] hover:bg-[#111217] hover:shadow-[0_8px_24px_rgba(26,47,251,0.22)] active:scale-95 md:text-[13px]"
        >
          <span>Let&apos;s Talk</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-electric-indigo">
            <ArrowUpRight className="size-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </motion.a>

        {/* Menu Trigger Pill */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isLive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.6, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center"
        >
          <FloatingMenu />
        </motion.div>
      </div>
    </motion.header>
  )
}
