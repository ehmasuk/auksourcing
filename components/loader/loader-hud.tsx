"use client"

interface LoaderHudProps {
  progress: number
  stageText: string
  isComplete: boolean
  isInteracted: boolean
  onSkip: () => void
}

export function LoaderHud({
  progress,
  stageText,
  isComplete,
}: LoaderHudProps) {
  const safeProgress = Number.isFinite(progress)
    ? Math.max(0, Math.min(100, progress))
    : 0

  return (
    <footer className="w-full flex flex-col items-center justify-center select-none pb-2 md:pb-4 pointer-events-none">
      {/* Telemetry Stage & Percentage */}
      <div className="w-full max-w-xs md:max-w-sm flex items-center justify-between font-mono text-[11px] tracking-wider text-white/60 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className={`size-1.5 rounded-full ${
              isComplete ? "bg-acid-lime" : "bg-electric-indigo animate-ping"
            }`}
          />
          <span className="text-white/70 uppercase text-[10px] tracking-widest">
            {isComplete ? "INITIALIZATION COMPLETE" : stageText}
          </span>
        </div>
        <div className="flex items-baseline font-mono text-xs text-white/90">
          <span className="font-semibold">
            {Math.floor(safeProgress).toString().padStart(3, "0")}
          </span>
          <span className="text-acid-lime text-[10px] ml-0.5">%</span>
        </div>
      </div>

      {/* Precision Hairline Progress Bar */}
      <div className="w-full max-w-xs md:max-w-sm">
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-linear-to-r from-electric-indigo via-[#6367ff] to-acid-lime shadow-[0_0_12px_rgba(26,47,251,0.8)] transition-all duration-150 ease-out"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>
    </footer>
  )
}
