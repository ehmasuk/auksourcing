// Generates components/loader/lightning-frames.ts — the public
// lightning-animation.svg inlined as a module string so the storm
// overlay never waits on a runtime fetch (no skittish first-play).
import { readFileSync, writeFileSync } from "node:fs"

const raw = readFileSync("public/lightning-animation.svg", "utf8")

// ES module export: JSON.stringify gives safe escaping for quotes,
// newlines and any control characters the SMIL file contains.
const out = `/**
 * The public lightning-animation.svg (WPS-style hand-sketched lightning,
 * ~50 flat frames on SMIL) inlined as text. Inlining at build time lets
 * ThunderSketch inject it synchronously and drive its clock with
 * pauseAnimations() + setCurrentTime() — the sketch starts frozen at t=0
 * and is scrubbed by our rAF loop, perfectly synced to the 3D impact.
 *
 * Regenerate: node scripts/gen-lightning-frames.mjs
 */

export const LIGHTNING_SVG = ${JSON.stringify(raw)}
`

writeFileSync("components/loader/lightning-frames.ts", out)
console.log(`wrote components/loader/lightning-frames.ts (${out.length} bytes)`)
