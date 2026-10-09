import type { LiteLevel } from "@/lib/lite"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and one function: no screen, no clock of its own.
// The background is the React Bits animation Side Rays: soft rays of light that sweep in from the top right corner of the screen. The library draws the rays in WHITE, always (both of its ray colours are given white). The colour comes from a tint layer on top of it (see TimerBackground.tsx and CONNECTIONS.md C37), because giving the library another colour makes it build its whole drawing again.
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

// Whether the background is drawn: the full look (laptop) and lite level 1 (phones) draw the rays, lite level 2 draws nothing (the screen stays plain black, see src/lib/lite.ts).
const DRAWN_BY_LITE: readonly [boolean, boolean, boolean] = [true, true, false]

export function bgDrawn(liteLevel: LiteLevel): boolean {
  return DRAWN_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
