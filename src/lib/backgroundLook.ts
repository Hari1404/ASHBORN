import type { LiteLevel } from "@/lib/lite"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and one function: no screen, no clock of its own.
// The background is the React Bits animation Meta Balls: soft blobs that move and melt into each other. The library draws the blobs in WHITE on black, always. The colour comes from a tint layer on top of it (see TimerBackground.tsx and CONNECTIONS.md C37), because giving the library another colour makes it build its whole drawing again.
// The colour steps and the palettes are the ones of the glowing ball (src/lib/ballLook.ts), so the background and the ball always have the same colour.
// The automated tests are in src/lib/backgroundLook.test.ts. Run them with: npm test

// The colour given to the library. It is white on purpose and never changes: the tint layer does the colouring.
export const BG_COLOUR = "#ffffff"
// How long the background takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C38).
export const BG_FADE_MS = 700

// The settings of the animation, as chosen by the owner on the React Bits page (speed 0.5, animation size 27, smoothness 0.141, cursor ball size 4, mouse off). The number of balls is not here: the lite level gives it (see bgBallCount).
export const BG_SETTINGS = {
  speed: 0.5,
  animationSize: 27,
  hoverSmoothness: 0.141,
  cursorBallSize: 4,
  enableMouseInteraction: false,
} as const

// How many balls the background draws: the full look (laptop), lite level 1 (phones) and lite level 2 (none: the screen stays plain black, see src/lib/lite.ts).
const BALLS_BY_LITE: readonly [number, number, number] = [21, 10, 0]

export function bgBallCount(liteLevel: LiteLevel): number {
  return BALLS_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
