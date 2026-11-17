/**
 * Module-scope bridge between the WebGL bolt and the relay's stage clock.
 * The thunder GLB may resolve well after hydration on slow connections,
 * so the entire storm timeline is anchored to the moment the model is
 * truly ready — never to a fixed clock that could desync from the visuals.
 */
let resolveReady!: () => void

export const thunderReady: Promise<void> = new Promise<void>((resolve) => {
  resolveReady = resolve
})

export function signalThunderReady() {
  resolveReady()
}
