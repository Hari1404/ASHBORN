import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import BackgroundCanvas from "@/components/BackgroundCanvas"
import { BG_BLEND_MS, BG_FADE_MS, BG_MOUNT_DELAY_MS, BG_SETTINGS, bgBlendRamp, bgDrawn, bgPaletteIndex, bgRamp } from "@/lib/backgroundLook"
import { LITE_LEVEL } from "@/lib/lite"
import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"

// AB:TIMER.BG:START
// The moving background of the Pro Timer screen. It is shown while a session runs or is paused, and it is plain black (nothing is drawn) when there is no session.
// Canvas: src/components/BackgroundCanvas.tsx, with the picture in src/lib/backgroundRender.ts (our own, see CONNECTIONS.md C52; before Packet 08C the React Bits animation Grainient drew the background). It draws a slow flowing gradient with a little grain from a ramp of five colours (its `colors`). This file hands it the ramp of the session and nothing else changes: the ramp starts all black and gets its colours at 10, 30 and 90 minutes, moving to each new colour in BG_BLEND_MS (backgroundLook.ts, CONNECTIONS.md C37).
// The canvas reads its `colors` again on its own while it runs and never builds its drawing again for them, so the ramp is simply given as a new list of five colours many times a second while it moves (useBlendedRamp). Every other setting is the same all the time (BG_SETTINGS).
// The palette is the one of the glowing ball (bgPaletteIndex gives the same number as the ball for the same session), so the ball and the background are of the same colour family.
// A new session lights a new background, like the ball: it is made again and starts black. When the session ends the background fades out for BG_FADE_MS and is then taken away. While it fades its colours stay where they were.
// The background needs WebGL 2, like the ball. Without it, or when the canvas throws, or at lite level 2, nothing is drawn and the clocks still work (see CONNECTIONS.md C38).
// Whether this browser can draw it (WebGL 2) is asked by canDrawWebgl2 (src/lib/timerWarmup.ts), once for the whole page and shared with the ball, and only when a session is shown: opening the screen does not ask the browser anything (see CONNECTIONS.md C38 and C44).
// The background is not made in the same moment as the press of Start, and not in the same moment as the ball: its box and its canvas are made BG_MOUNT_DELAY_MS after the session lights it (useMountDelay in src/lib/timerWarmup.ts), before the glowing ball (BALL_MOUNT_DELAY_MS in src/lib/ballLook.ts), because the ball is the heavy one and is made last. The box has the fade in, so the fade in starts when the box is made. A session that ends during the wait never makes the background (see CONNECTIONS.md C47).
// A person who asked their device for less motion gets the flow standing still (speed 0). Read once, when the screen is made.
function wantsStillness(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return false
  }
}

// If the canvas throws, the background is left out and the rest of the screen stays.
class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// The five colours on the way from the ramp they have to the ramp they should have. The first ramp is taken at once (a page opened in the middle of a session shows the right colours at once). A new target in the middle of a blend starts from the colours the blend has reached, so nothing jumps.
function useBlendedRamp(target: readonly string[]): readonly string[] {
  const key = target.join(",")
  const [ramp, setRamp] = useState<readonly string[]>(target)
  const current = useRef<readonly string[]>(target)
  useEffect(() => {
    if (current.current.join(",") === key) return undefined
    const from = current.current
    const to = key.split(",")
    const startedAt = performance.now()
    let frame = 0
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / BG_BLEND_MS)
      current.current = bgBlendRamp(from, to, progress)
      setRamp(current.current)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [key])
  return ramp
}

// One lit background. The screen makes it again for every new session, so its colours always start at the ramp of the first moment.
function LitBackground({ target, still }: { target: readonly string[]; still: boolean }) {
  const colours = useBlendedRamp(target)
  return <BackgroundCanvas {...BG_SETTINGS} speed={still ? 0 : BG_SETTINGS.speed} colors={colours} />
}

export default function TimerBackground({
  active,
  seconds,
  seed,
}: {
  active: boolean
  seconds: number
  seed: string
}) {
  const [still] = useState(wantsStillness)
  const [shown, setShown] = useState(active)
  const [lit, setLit] = useState(active ? 1 : 0)
  const wasActive = useRef(active)
  const litSeed = useRef(seed)

  // The ramp the background moves towards. When the session ends the seconds and the seed are gone while the background is still fading: the ramp of the last moment is kept, so it does not start to move towards black in the middle of the fade.
  const target = bgRamp(seconds, bgPaletteIndex(seed))
  const [held, setHeld] = useState(target)
  if (active && held.join(",") !== target.join(",")) setHeld(target)

  // A new background is lit when a session starts, and also when the seed changes while a session is shown (another device ended the session and started a new one between two readings): the same rule as the glowing ball, so the two always start together.
  useEffect(() => {
    if (active) {
      const sameSession = wasActive.current && (seed === "" || seed === litSeed.current)
      if (!sameSession) setLit((n) => n + 1)
      if (seed !== "") litSeed.current = seed
      wasActive.current = true
      setShown(true)
      return undefined
    }
    wasActive.current = false
    const timer = window.setTimeout(() => setShown(false), BG_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [active, seed])

  const ready = useMountDelay(lit, active, BG_MOUNT_DELAY_MS)
  if (!shown || !ready || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null
  return (
    <div className="ab-timer-bg" data-out={active ? undefined : "yes"} aria-hidden="true">
      <BackgroundGuard>
        <LitBackground key={lit} target={active ? target : held} still={still} />
      </BackgroundGuard>
    </div>
  )
}
// AB:TIMER.BG:END
