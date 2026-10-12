import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import SideRays from "@/components/SideRays"
import { BG_COLOUR, BG_FADE_MS, BG_RENDER_SCALE, BG_SETTINGS, bgDrawn, bgLight } from "@/lib/backgroundLook"
import { BALL_BLEND_MS, ballTargetColour, blendHex } from "@/lib/ballLook"
import { LITE_LEVEL } from "@/lib/lite"
import { canDrawWebgl2 } from "@/lib/timerWarmup"

// AB:TIMER.BG:START
// The moving background of the Pro Timer screen. It is shown while a session runs or is paused, and it is plain black (nothing is drawn) when there is no session.
// Library: src/components/SideRays.tsx (React Bits, never edited). It draws white rays on a clear background (the black behind it is the box of the background, see timer.css). This file lays a tint layer over it that multiplies the white with the colour of the session, so the rays get that colour (see CONNECTIONS.md C37). The library is never given a colour: a new colour would make it build its whole drawing again, many times a second.
// The colour is the colour of the glowing ball at every moment: the same functions (ballTargetColour, blendHex) and the same time to move to the next colour (BALL_BLEND_MS) as TimerBall.tsx. It starts white and moves on at the quality steps of the session.
// A new session lights a new background, like the ball: it is made again and starts white. When the session ends the background fades out for BG_FADE_MS and is then taken away. While it fades its colour stays where it was.
// The background needs WebGL 2, like the ball. Without it, or when the library throws, or at lite level 2, nothing is drawn and the clocks still work (see CONNECTIONS.md C38).
// Whether this browser can draw it (WebGL 2) is asked by canDrawWebgl2 (src/lib/timerWarmup.ts), once for the whole page and shared with the ball, and only when a session is shown: opening the screen does not ask the browser anything (see CONNECTIONS.md C38 and C44).
// A person who asked their device for less motion gets the rays standing still. Read once, when the screen is made.
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
function LitBackground({ target, light, still }: { target: string; light: number; still: boolean }) {
  return (
    <>
      {/* The animation lives in a box that is only BG_RENDER_SCALE of the screen in width and height, and the css stretches the box back over the whole screen (ab-timer-bg-rays, CONNECTIONS.md C38). The library reads the size of its box, so it draws a quarter of the pixels. */}
      <div
        className="ab-timer-bg-rays"
        style={{ width: (BG_RENDER_SCALE * 100).toFixed(2) + "%", height: (BG_RENDER_SCALE * 100).toFixed(2) + "%", transform: "scale(" + 1 / BG_RENDER_SCALE + ")" }}
      >
        <SideRays
          rayColor1={BG_COLOUR}
          rayColor2={BG_COLOUR}
          speed={still ? 0 : BG_SETTINGS.speed}
          tilt={BG_SETTINGS.tilt}
          intensity={BG_SETTINGS.intensity}
        />
      </div>
      <Tint target={target} />
      {/* The black layer that makes the light grow with the session: thick at the start, thinner and thinner, gone when the light is full (bgLight in backgroundLook.ts, CONNECTIONS.md C37). Its opacity is set here and never on the library animation. */}
      <div className="ab-timer-bg-dim" style={{ opacity: 1 - light }} />
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
  const [still] = useState(wantsStillness)
  const [shown, setShown] = useState(active)
  const [lit, setLit] = useState(active ? 1 : 0)
  const wasActive = useRef(active)
  const litSeed = useRef(seed)

  // The colour the background moves towards. When the session ends the seconds and the seed are gone while the background is still fading: the colour of the last moment is kept, so it does not start to move towards white in the middle of the fade.
  const target = ballTargetColour(seconds, seed)
  const [held, setHeld] = useState(target)
  if (active && held !== target) setHeld(target)

  // The light of the rays (bgLight in backgroundLook.ts, CONNECTIONS.md C37) follows the seconds of the session. Like the colour, the light of the last moment is kept while the background fades out: the seconds are 0 then, and without this the black layer would jump to its thickest in the middle of the fade.
  const light = bgLight(seconds)
  const [heldLight, setHeldLight] = useState(light)
  if (active && heldLight !== light) setHeldLight(light)

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

  if (!shown || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null
  return (
    <div className="ab-timer-bg" data-out={active ? undefined : "yes"} aria-hidden="true">
      <BackgroundGuard>
        <LitBackground key={lit} target={active ? target : held} light={active ? light : heldLight} still={still} />
      </BackgroundGuard>
    </div>
  )
}
// AB:TIMER.BG:END
