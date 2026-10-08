import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import CrystalizedBall from "@/components/CrystalizedBall"
import { BALL_BLEND_MS, BALL_FADE_MS, ballFlavour, ballParticles, ballTargetColour, blendHex } from "@/lib/ballLook"
import { LITE_LEVEL } from "@/lib/lite"

// AB:TIMER.BALL:START
// The glowing ball behind the big clock of the Pro Timer screen. It is shown while a session runs or is paused.
// Library: src/components/CrystalizedBall.tsx (React Bits, never edited). Its settings are the props below. The ball needs WebGL 2; without it, or when it fails, nothing is drawn and the clocks still work (see CONNECTIONS.md C35).
// A new session lights a new ball: it is made again, so it starts white and plays its short ignite. When the session ends the ball fades out for BALL_FADE_MS and is then taken away.
// The colour moves to its next step slowly (BALL_BLEND_MS) instead of jumping. The steps and palettes are in src/lib/ballLook.ts. The seed is the started_at text of the session (the screen calls it ringSeed).
// Every session has its own flavour (the library preset, the way the dust moves, the shape of a grain), drawn from the same seed as the palette and kept until the ball is taken away: it does not change while the ball fades, when the seed is gone (see CONNECTIONS.md C36).
// The box of the ball is 136 percent of the dial and the ball is 66 percent of that box, so the ball is about 90 percent of the dial (see CONNECTIONS.md C31).
// Whether this browser can draw the ball: it needs WebGL 2.
function canDrawBall(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2")
    if (gl === null || gl === undefined) return false
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return true
  } catch {
    return false
  }
}

// If the library ball throws, the ball is left out and the rest of the screen stays.
class BallGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// The colour on the way from the colour it has to the colour it should have. The first colour is taken at once (a page opened in the middle of a session shows the right colour at once).
function useBlendedColour(target: string): string {
  const [colour, setColour] = useState(target)
  const current = useRef(target)
  useEffect(() => {
    if (current.current === target) return undefined
    const from = current.current
    const startedAt = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / BALL_BLEND_MS)
      current.current = blendHex(from, target, t)
      setColour(current.current)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return colour
}

// One lit ball. The screen makes it again for every new session, so its colour always starts at the colour of the first moment.
// The flavour is drawn once, when the ball is made, and then kept (useState): when the session ends the seed becomes empty while the ball is still fading, and a flavour drawn again from an empty seed would change the look in the middle of the fade.
function LitBall({ paused, target, seed }: { paused: boolean; target: string; seed: string }) {
  const colour = useBlendedColour(target)
  const [flavour] = useState(() => ballFlavour(seed))
  return (
    <CrystalizedBall
      preset={flavour.preset}
      motion={flavour.motion}
      particleShape={flavour.particleShape}
      color={colour}
      size={0.66}
      particleCount={ballParticles(LITE_LEVEL)}
      intro
      interactive
      paused={paused}
    />
  )
}

export default function TimerBall({
  active,
  paused,
  seconds,
  seed,
}: {
  active: boolean
  paused: boolean
  seconds: number
  seed: string
}) {
  const [drawable] = useState(canDrawBall)
  const [shown, setShown] = useState(active)
  const [lit, setLit] = useState(active ? 1 : 0)
  const wasActive = useRef(active)
  const litSeed = useRef(seed)

  // A new ball is lit when a session starts, and also when the seed changes while a session is shown (another device ended the session and started a new one between two readings): the look follows the seed, so every device shows the same ball for the same session.
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
    const timer = window.setTimeout(() => setShown(false), BALL_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [active, seed])

  if (!drawable || !shown) return null
  return (
    <div className="ab-timer-ball" data-out={active ? undefined : "yes"} aria-hidden="true">
      <BallGuard>
        <LitBall key={lit} paused={paused} target={ballTargetColour(seconds, seed)} seed={seed} />
      </BallGuard>
    </div>
  )
}
// AB:TIMER.BALL:END
