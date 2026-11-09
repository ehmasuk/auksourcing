interface LoaderBoltProps {
  className?: string
}

/**
 * Lightning charge bolt (Bootstrap `bi-lightning-charge-fill`).
 * Loader emblem — also reused inline inside the hero brand lockup.
 * Sizing is always supplied via `className` so each usage controls it.
 */
export function LoaderBolt({ className }: LoaderBoltProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`text-[#FEE497] drop-shadow-[0_0_24px_rgba(254,228,151,0.75)] ${className ?? ""}`}
      aria-hidden="true"
    >
      <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
    </svg>
  )
}
