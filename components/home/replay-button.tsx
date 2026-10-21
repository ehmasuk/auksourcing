"use client"

import { RotateCcw } from "lucide-react"
import { useEffect } from "react"

interface ReplayButtonProps {
  onReplay?: () => void
}

export default function ReplayButton({ onReplay }: ReplayButtonProps) {
  const triggerReplay = () => {
    onReplay?.()
    window.dispatchEvent(new CustomEvent("replay-loader"))
  }

  // Keyboard shortcut: Press 'R' to replay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }
      if (e.key === "r" || e.key === "R") {
        triggerReplay()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={triggerReplay}
        className="group flex items-center gap-2 rounded-full border border-black/10 bg-white/90 dark:border-white/15 dark:bg-[#151519]/90 px-4 py-2 text-[12px] font-mono tracking-tight text-foreground shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:border-[#1a2ffb]/50 hover:bg-white dark:hover:bg-[#151519] hover:shadow-md cursor-pointer active:scale-95"
        title="Replay 3D Loading Screen (or press 'R')"
      >
        <RotateCcw className="size-3.5 transition-transform duration-500 group-hover:-rotate-180 text-[#1a2ffb]" />
        <span>Replay 3D Loader</span>
        <span className="hidden sm:inline-block rounded bg-black/5 dark:bg-white/10 px-1.5 py-0.2 text-[9px] text-muted-foreground">
          R
        </span>
      </button>
    </div>
  )
}
