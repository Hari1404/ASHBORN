// AB:LEARN.MOTION:START
// Whether the person asked the device for less motion. The Learn screen asks this once when a part is shown (the title effect, the scene) and plays a still picture instead of an animation when the answer is yes.
// It never throws: where there is no window (a test with no page) or the browser cannot tell (no matchMedia), the answer is no. The css has its own rule for the same setting (@media (prefers-reduced-motion: reduce) in src/learn.css), so the two agree. See CONNECTIONS.md C76.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
}
// AB:LEARN.MOTION:END
