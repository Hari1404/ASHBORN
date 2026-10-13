import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import Grainient from "@/components/Grainient"
import { BG_FADE_MS, BG_MOUNT_DELAY_MS, BG_SETTINGS, bgDrawn, bgPaletteIndex, bgRamp } from "@/lib/backgroundLook"
import { LITE_LEVEL } from "@/lib/lite"
import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"

// AB:TIMER.BG:START
// The moving background of the Pro Timer screen. It is shown while a session runs or is paused, and it is plain black (nothing is drawn) when there is no session.
// Library: src/components/Grainient.tsx (React Bits, never edited). It draws a slow flowing gradient with a little grain from a ramp of five colours (its `colors`). This file hands it the ramp of the seconds of the session and nothing else changes: the ramp starts all black and grows slowly and all the time, with the look of the first colour step at 10 minutes, of the second at 30 minutes and the whole palette at 90 minutes (backgroundLook.ts, CONNECTIONS.md C37).
// The library reads its `colors` again on its own while it runs and never builds its drawing again for them, so the ramp is simply given as a new list of five colours whenever the seconds of the session change. There is no blend over time and no timer here: the ramp is a plain function of the seconds (bgRamp). Every other setting is the same all the time (BG_SETTINGS).
// The palette is the one of the glowing ball (bgPaletteIndex gives the same number as the ball for the same session), so the ball and the background are of the same colour family.
// A new session lights a new background, like the ball: it is made again and starts black. When the session ends the background fades out for BG_FADE_MS and is then taken away. While it fades its colours stay where they were.
// The background needs WebGL 2, like the ball. Without it, or when the library throws, or at lite level 2, nothing is drawn and the clocks still work (see CONNECTIONS.md C38).
// Whether this browser can draw it (WebGL 2) is asked by canDrawWebgl2 (src/lib/timerWarmup.ts), once for the whole page and shared with the ball, and only when a session is shown: opening the screen does not ask the browser anything (see CONNECTIONS.md C38 and C44).
// The background is not made in the same moment as the press of Start, and not in the same moment as the ball: its box and the library animation are made BG_MOUNT_DELAY_MS after the session lights it (useMountDelay in src/lib/timerWarmup.ts), before the glowing ball (BALL_MOUNT_DELAY_MS in src/lib/ballLook.ts), because the ball is the heavy one and is made last. The box has the fade in, so the fade in starts when the box is made. A session that ends during the wait never makes the background (see CONNECTIONS.md C47).
// A person who asked their device for less motion gets the flow standing still (speed 0). Read once, when the screen is made.
function wantsStillness(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return false
  }
}

// If the library throws, the background is left out and the rest of the screen stays.
class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// One lit background. The screen makes it again for every new session, so it always starts black. The ramp it is given is the ramp of the seconds the session has reached, so a page opened in the middle of a session shows the right colours at once.
function LitBackground({ target, still }: { target: readonly string[]; still: boolean }) {
  return <Grainient {...BG_SETTINGS} speed={still ? 0 : BG_SETTINGS.speed} colors={[...target]} />
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

  // The ramp of the seconds the session has reached. When the session ends the seconds and the seed are gone while the background is still fading: the ramp of the last moment is kept, so it does not jump to black in the middle of the fade.
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
