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

  const formattedProgress = Math.floor(safeProgress).toString().padStart(3, "0")

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 text-white select-none md:p-10">
      <div />

      {/* ── Brand Wordmark & Tagline ───────────────────────────── */}
      <div className="absolute inset-x-0 top-1/2 z-10 flex translate-y-[28%] flex-col items-center gap-3 text-center">
        <h1 className="animate-in fade-in slide-in-from-bottom-5 font-heading text-5xl font-medium leading-none tracking-[-0.04em] uppercase duration-700 ease-out [animation-delay:350ms] md:text-7xl">
          <span className="text-white drop-shadow-[0_0_32px_rgba(26,47,251,0.45)]">
            AUK
          </span>
          <span className="text-transparent [-webkit-text-stroke:1.2px_rgba(255,255,255,0.38)]">
            SOURCING
          </span>
        </h1>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Side hairlines */}
          <span className="h-px w-8 md:w-14 bg-linear-to-r from-transparent to-white/30" />

          <p className="animate-in fade-in slide-in-from-bottom-4 font-mono text-[9px] uppercase tracking-[0.4em] text-white/55 duration-700 ease-out [animation-delay:600ms] md:text-xs">
            Connecting <span className="text-acid-lime">the world</span>{" "}
            efficiently
          </p>

          <span className="h-px w-8 md:w-14 bg-linear-to-l from-transparent to-white/30" />
        </div>
      </div>

      {/* ── Bottom Progress & Counter ───────────────────────────── */}
      <footer className="flex items-end justify-center pb-2">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Large Digit Counter */}
          <div className="relative mb-2">
            <div className="flex items-baseline justify-center font-mono tracking-tighter">
              <span className="text-6xl font-light text-white drop-shadow-[0_0_24px_rgba(26,47,251,0.4)] md:text-7xl">
                {formattedProgress}
              </span>
              <span className="ml-1 font-mono text-2xl text-acid-lime">%</span>
            </div>
          </div>

          {/* Precision Hairline Progress Bar */}
          <div className="w-full max-w-sm">
            <div className="relative h-0.75 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-linear-to-r from-electric-indigo via-[#6367ff] to-acid-lime shadow-[0_0_12px_rgba(26,47,251,0.9)] transition-all duration-150 ease-out"
                style={{ width: `${safeProgress}%` }}
              />
            </div>

            {/* Stage Text Caption */}
            <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] tracking-wider text-white/60">
              <span className="text-white/70 uppercase">
                {isComplete ? "INITIALIZATION COMPLETE" : stageText}
              </span>
              <span className="text-acid-lime">
                {isComplete ? "READY" : "LOADING"}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
