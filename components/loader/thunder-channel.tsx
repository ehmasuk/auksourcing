"use client"

/**
 * StrikeChannel — a lightning channel drawn top→bottom.
 *
 * Three core geometries share one 180ms slot cycle (`steps(1,end)`) so the
 * channel's shape jumps frame-to-frame 60ms at a time — like real footage
 * of a strike, where the channel re-forms every few frames. Two side
 * forks are drawn a beat after the main channel. The whole channel strobes
 * and dies via `storm-channel-life`; a second strike (delay) re-fires the
 * whole thing smaller, like a real double-flash.
 *
 * Geometry lives in a 0–100 box stretched to the container
 * (preserveAspectRatio="none"), `vector-effect="non-scaling-stroke"`
 * keeps the stroke width in real pixels; `pathLength="100"` makes the
 * draw-in a plain 0→100 dashoffset wipe.
 */

interface StrikeChannelProps {
  className?: string
  /** Delay before this channel fires (restrike) */
  delay?: number
}

const CORES = [
  "M56 0 51 11 61 19 49 31 57 39 45 53 55 61 46 77 53 85 50 100",
  "M62 0 54 9 63 20 55 30 60 42 47 55 57 63 44 75 52 87 50 100",
  "M53 0 58 10 47 21 59 32 50 40 57 56 48 62 58 80 48 88 50 100",
]

const FORKS = ["M55 36 67 41 71 49", "M49 57 40 63 38 71"]

export function StrikeChannel({ className, delay = 0 }: StrikeChannelProps) {
  const style = { ["--channel-delay" as string]: `${delay}s` }
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`storm-channel ${className ?? ""}`}
      style={style}
      aria-hidden="true"
    >
      {CORES.map((d, i) => (
        <path
          key={i}
          className="storm-channel-core"
          d={d}
          pathLength={100}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: `calc(var(--channel-delay) + ${i * 0.06}s), calc(var(--channel-delay) + ${i * 0.06}s)` }}
        />
      ))}
      {FORKS.map((d, i) => (
        <path
          key={i}
          className="storm-channel-fork"
          d={d}
          pathLength={100}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ animationDelay: `calc(var(--channel-delay) + ${0.04 + i * 0.03}s)` }}
        />
      ))}
    </svg>
  )
}
