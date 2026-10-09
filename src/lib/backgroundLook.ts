import type { LiteLevel } from "@/lib/lite"
import { FLOW_FROM_SECONDS } from "@/lib/timerMaths"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and two functions: no screen, no clock of its own.
// The background is the React Bits animation Side Rays: soft rays of light that sweep in from the top right corner of the screen. The library draws the rays in WHITE, always (both of its ray colours are given white). The colour comes from a tint layer on top of it (see TimerBackground.tsx and CONNECTIONS.md C37), because giving the library another colour makes it build its whole drawing again.
// The intensity is the same: the library builds its whole drawing again whenever its intensity changes, so it always gets the same intensity (BG_SETTINGS) and the light that GROWS while the session goes on comes from a black layer over the rays that gets thinner and thinner (bgLight below, and CONNECTIONS.md C37).
// The colour steps and the palettes are the ones of the glowing ball (src/lib/ballLook.ts), so the background and the ball always have the same colour.
// The automated tests are in src/lib/backgroundLook.test.ts. Run them with: npm test

// The colour given to the library for BOTH of its ray colours. It is white on purpose and never changes: the tint layer does the colouring.
export const BG_COLOUR = "#ffffff"
// How long the background takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C38).
export const BG_FADE_MS = 700

// The settings of the animation, as chosen by the owner on the React Bits page (speed 2.9, tilt 13, intensity 2.8). Every other setting of the library keeps its own default.
export const BG_SETTINGS = {
  speed: 2.9,
  tilt: 13,
  intensity: 2.8,
} as const

// How bright the rays are when a session starts, as a share of the full light (1 = the full light, which is the look of BG_SETTINGS with the dimming of .ab-timer-bg in timer.css). The light grows from here up to 1 while the session goes on.
export const BG_LIGHT_START = 0.3
// After this many seconds of the session the light is full. It is the time of the last colour step (the flow step of timerMaths.ts), so the rays reach full light when the colour reaches its last step.
export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS

// The light of the rays after this many seconds of the session: BG_LIGHT_START at second 0, then growing in a straight line up to 1 at BG_LIGHT_FULL_AT_SECONDS, and 1 from then on. It never goes down while the session goes on. A number that is not a real count of seconds (not a number, or below 0) gives the start light.
export function bgLight(seconds: number): number {
  if (!(seconds > 0)) return BG_LIGHT_START
  if (seconds >= BG_LIGHT_FULL_AT_SECONDS) return 1
  return BG_LIGHT_START + (1 - BG_LIGHT_START) * (seconds / BG_LIGHT_FULL_AT_SECONDS)
}

// Whether the background is drawn: the full look (laptop) and lite level 1 (phones) draw the rays, lite level 2 draws nothing (the screen stays plain black, see src/lib/lite.ts).
const DRAWN_BY_LITE: readonly [boolean, boolean, boolean] = [true, true, false]

export function bgDrawn(liteLevel: LiteLevel): boolean {
  return DRAWN_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
