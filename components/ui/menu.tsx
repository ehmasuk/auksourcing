"use client"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

const ease = [0.22, 1, 0.36, 1] as const

interface MenuItem {
  label: string
  onClick?: () => void
}

interface FloatingMenuProps {
  items?: MenuItem[]
}

/** Single menu item with the letter-drop hover (kept from the original). */
function MenuButtonItem({
  label,
  onClick,
  isOpen,
  index,
}: {
  label: string
  onClick?: () => void
  isOpen: boolean
  index: number
}) {
  const [hovered, setHovered] = useState(false)
  const animatingRef = useRef(false)
  const pendingLeaveRef = useRef(false)
  const chars = label.split("")
  const lockDuration = 30 * chars.length + 300

  const handleEnter = useCallback(() => {
    pendingLeaveRef.current = false
    if (hovered) return
    setHovered(true)
    animatingRef.current = true
    setTimeout(() => {
      animatingRef.current = false
      if (pendingLeaveRef.current) {
        pendingLeaveRef.current = false
        setHovered(false)
      }
    }, lockDuration)
  }, [hovered, lockDuration])

  const handleLeave = useCallback(() => {
    if (animatingRef.current) {
      pendingLeaveRef.current = true
    } else {
      setHovered(false)
    }
  }, [])

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="overflow-hidden text-[24px] leading-none text-[#f7f1ed] uppercase"
      style={{
        letterSpacing: "-0.03em",
        height: "1em",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        color: "#000",
      }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{
        duration: 0.4,
        delay: isOpen ? 0.4 + 0.08 * index : 0,
        ease,
      }}
    >
      <div className="flex justify-center">
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden"
            style={{ height: "1em" }}
          >
            <span
              className="flex flex-col"
              style={{
                transitionProperty: "transform",
                transitionDuration: hovered ? "800ms" : "0ms",
                transitionDelay: hovered ? `${30 * i}ms` : "0ms",
                transform: hovered ? "translateY(-50%)" : "translateY(0%)",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <span
                className="block"
                style={{ height: "1em", lineHeight: "1em" }}
              >
                {char}
              </span>
              <span
                className="block"
                style={{ height: "1em", lineHeight: "1em" }}
                aria-hidden
              >
                {char}
              </span>
            </span>
          </span>
        ))}
      </div>
    </motion.button>
  )
}

export default function FloatingMenu({ items }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuItems: MenuItem[] = items ?? [
    { label: "Home" },
    { label: "Works" },
    { label: "Contact" },
  ]

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isOpen])

  return (
    <div data-menu-root ref={rootRef} className="relative z-[100] inline-flex">
      {/* ── Trigger button — same UI as header Menu pill ── */}
      <motion.a
        href="#menu"
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        className="group inline-flex h-11 items-center gap-2.5 rounded-full border border-black/10 bg-white/70 px-5 text-[12px] font-medium tracking-[0.03em] text-foreground uppercase shadow-[0_2px_6px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:border-black/20 hover:bg-white active:scale-95 md:text-[13px]"
        animate={{
          borderColor: isOpen ? "black/40" : "black/10",
          backgroundColor: isOpen ? "white" : "rgba(255,255,255,0.7)",
        }}
        transition={{ duration: 0.25, ease }}
      >
        <div className="flex w-3.5 flex-col gap-1">
          <motion.span
            className="h-[1.5px] w-full bg-foreground"
            style={{ transformOrigin: "center center" }}
            animate={{
              rotate: isOpen ? 45 : 0,
              y: isOpen ? 1.5 : 0,
            }}
            transition={{ duration: 0.4, ease }}
          />
          <motion.span
            className="h-[1.5px] w-2/3 bg-foreground"
            style={{ transformOrigin: "center center" }}
            animate={{
              rotate: isOpen ? -45 : 0,
              y: isOpen ? -1.5 : 0,
            }}
            transition={{ duration: 0.4, ease }}
          />
        </div>
        <span>Menu</span>
      </motion.a>

      {/* ── Dropdown panel — opens directly below the button ── */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.35, ease }}
            className="absolute top-full right-0 mt-3 bg-white overflow-hidden text-black rounded shadow-[0_24px_60px_rgba(0,0,0,0.12)]"

          >
            {/* Menu items */}
            <div
              className="relative z-10 flex flex-col items-center justify-center gap-6 p-6"
              style={{ pointerEvents: "auto" }}
            >
              {menuItems.map((item, idx) => (
                <MenuButtonItem
                  key={item.label}
                  label={item.label}
                  onClick={() => {
                    item.onClick?.()
                    setIsOpen(false)
                  }}
                  isOpen
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
