import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import MetaBalls from "@/components/MetaBalls"
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgBallCount } from "@/lib/backgroundLook"
import { BALL_BLEND_MS, ballTargetColour, blendHex } from "@/lib/ballLook"
import { LITE_LEVEL } from "@/lib/lite"

// AB:TIMER.BG:START
// The moving background of the Pro Timer screen. It is shown while a session runs or is paused, and it is plain black (nothing is drawn) when there is no session.
// Library: src/components/MetaBalls.tsx (React Bits, never edited). It draws white blobs on black. This file lays a tint layer over it that multiplies the white with the colour of the session, so the blobs get that colour (see CONNECTIONS.md C37). The library is never given a colour: a new colour would make it build its whole drawing again, many times a second.
// The colour is the colour of the glowing ball at every moment: the same functions (ballTargetColour, blendHex) and the same time to move to the next colour (BALL_BLEND_MS) as TimerBall.tsx. It starts white and moves on at the quality steps of the session.
// A new session lights a new background, like the ball: it is made again and starts white. When the session ends the background fades out for BG_FADE_MS and is then taken away. While it fades its colour stays where it was.
// The background needs WebGL 2, like the ball. Without it, or when the library throws, or at lite level 2, nothing is drawn and the clocks still work (see CONNECTIONS.md C38).
// Whether this browser can draw the background: it needs WebGL 2.
function canDrawBackground(): boolean {
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

// A person who asked their device for less motion gets the blobs standing still. Read once, when the screen is made.
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

// The colour on the way from the colour it has to the colour it should have. The first colour is taken at once (a page opened in the middle of a session shows the right colour at once). The same steps as in TimerBall.tsx.
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

// The tint layer. The colour lives in this small part, so the library part above it is not drawn again while the colour moves.
function Tint({ target }: { target: string }) {
  const colour = useBlendedColour(target)
  return <div className="ab-timer-bg-tint" style={{ backgroundColor: colour }} />
}

// One lit background. The screen makes it again for every new session, so its colour always starts at the colour of the first moment.
function LitBackground({ target, still }: { target: string; still: boolean }) {
  return (
    <>
      <MetaBalls
        color={BG_COLOUR}
        cursorBallColor={BG_COLOUR}
        speed={still ? 0 : BG_SETTINGS.speed}
        animationSize={BG_SETTINGS.animationSize}
        hoverSmoothness={BG_SETTINGS.hoverSmoothness}
        cursorBallSize={BG_SETTINGS.cursorBallSize}
        enableMouseInteraction={BG_SETTINGS.enableMouseInteraction}
        ballCount={bgBallCount(LITE_LEVEL)}
        enableTransparency={false}
      />
      <Tint target={target} />
    </>
  )
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
  const [drawable] = useState(() => canDrawBackground() && bgBallCount(LITE_LEVEL) > 0)
  const [still] = useState(wantsStillness)
  const [shown, setShown] = useState(active)
  const [lit, setLit] = useState(active ? 1 : 0)
  const wasActive = useRef(active)
  const litSeed = useRef(seed)

  // The colour the background moves towards. When the session ends the seconds and the seed are gone while the background is still fading: the colour of the last moment is kept, so it does not start to move towards white in the middle of the fade.
  const target = ballTargetColour(seconds, seed)
  const [held, setHeld] = useState(target)
  if (active && held !== target) setHeld(target)

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

  if (!drawable || !shown) return null
  return (
    <div className="ab-timer-bg" data-out={active ? undefined : "yes"} aria-hidden="true">
      <BackgroundGuard>
        <LitBackground key={lit} target={active ? target : held} still={still} />
      </BackgroundGuard>
    </div>
  )
}
// AB:TIMER.BG:END
