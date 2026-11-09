"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import LoadingScreen from "./loading-screen"

const ThunderContext = createContext({ hasLanded: false })

export function useThunderRelay() {
  return useContext(ThunderContext)
}

/**
 * Mounts the brand loading screen above the page and broadcasts (via
 * context) the moment the bolt is handed over to its hero slot — the
 * loader bolt and the hero bolt share one `layoutId`, so this state
 * flip is what triggers the shared-element flight in Motion.
 */
export default function ThunderRelay({ children }: { children: ReactNode }) {
  const [hasLanded, setHasLanded] = useState(false)

  // Replays hand the slot back to the loader bolt first
  useEffect(() => {
    const handleReplay = () => setHasLanded(false)
    window.addEventListener("replay-loader", handleReplay)
    return () => window.removeEventListener("replay-loader", handleReplay)
  }, [])

  return (
    <ThunderContext.Provider value={{ hasLanded }}>
      <LoadingScreen onFinished={() => setHasLanded(true)} />
      {children}
    </ThunderContext.Provider>
  )
}
