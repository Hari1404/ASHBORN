import { blendHex, ballPaletteIndex } from "@/lib/ballLook"
import type { LiteLevel } from "@/lib/lite"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and a few functions: no screen, no clock of its own.
// The background is the React Bits animation Grainient: a slow flowing gradient with a little grain. It draws its picture from a ramp of five colours (its `colors`). The ramp of a session starts all black and grows from the dark end, slowly and all the time: it has the look of the first colour step (the dark shade and the main colour) at 10 minutes, the look of the second (the lighter tint comes in) at 30 minutes, the whole palette (the lightest tint comes in) at 90 minutes, and between these times it is on its way from one look to the next (bgRamp below, and CONNECTIONS.md C37).
// The times of the looks (10, 30 and 90 minutes) are the colour steps of timerMaths.ts, the same cut-offs as the quality steps of the glowing ball, and the choice of palette is the one of the ball (src/lib/ballLook.ts), so the background and the ball always have the same colour family.
// The library reads its `colors` again on its own while it runs and does not build its drawing again for them, so the screen only gives it the ramp of the seconds the session has reached, as a new list of five colours (see TimerBackground.tsx). There is no blend over time and no timer: the ramp is a plain function of the seconds, so it keeps changing a little at every second instead of waiting for a cut-off and then changing in a few seconds.
// The automated tests are in src/lib/backgroundLook.test.ts. Run them with: npm test

// How long the background takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C38).
export const BG_FADE_MS = 700
// How long after a session lights the background the library animation is made, in milliseconds. It is shorter than BALL_MOUNT_DELAY_MS (src/lib/ballLook.ts): the background is made first because it is cheap to draw, and the heavy glowing ball is made after it, so the work of the two never lands in the same moment (see CONNECTIONS.md C47). The box of the background (its black and its fade in) appears when the animation is made, so the fade in starts then.
export const BG_MOUNT_DELAY_MS = 300

// The settings of the animation, as chosen by the owner in the blend preview. Every other setting of the library keeps its own default. The colours are not here: they come from the ramp of the session.
// The flow never stops (speed 1) and never answers the cursor, a click or the start of the library (a timer screen is not a toy). The grain stands still, so it does not flicker. The library draws one pixel for every pixel of the screen (dpr 1) and draws its picture at half of that size itself, so no half-size box is needed.
export const BG_SETTINGS = {
  type: "linear",
  angle: 55,
  speed: 1,
  flow: 0.8,
  scale: 1,
  softness: 1,
  silk: 0.35,
  grainAmount: 0.08,
  grainSize: 1.2,
  grainAnimated: false,
  interactive: false,
  stir: 0,
  clickSwirl: false,
  intro: false,
  dpr: 1,
} as const

// The six palettes of the background, in the order of the six palettes of the glowing ball (BALL_PALETTES in ballLook.ts: the same session draws the same number for both). Each has five colours, from a near black to the lightest tint: black, dark shade, main colour, lighter tint, lightest tint. Every colour is lighter than the one before it.
export const BG_PALETTES: readonly (readonly [string, string, string, string, string])[] = [
  ["#020100", "#44150c", "#9a3412", "#db8238", "#e9c89f"],
  ["#00030a", "#082e47", "#0e659e", "#409be9", "#a8c1dc"],
  ["#010302", "#093426", "#137158", "#45aa8f", "#90ccbc"],
  ["#050105", "#490b44", "#a0138d", "#e948c6", "#ddadcb"],
  ["#010300", "#213107", "#436f0e", "#68aa3d", "#9acf88"],
  ["#020208", "#2a116f", "#6618ea", "#9782eb", "#bfb8dc"],
]

// The palette of a session: the palette of the glowing ball of the same session.
export function bgPaletteIndex(seed: string): number {
  return ballPaletteIndex(seed)
}

// The second at which the session has each of the four looks of the ramp: look 0 (all black) at the start, look 1 at the solid step, look 2 at the deep step, look 3 (the whole palette) at the flow step. They are the colour steps of timerMaths.ts, the same cut-offs as the quality steps of the glowing ball.
const LOOK_AT_SECONDS = [0, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS] as const

// One look of the ramp. Look 0 is all black. Look 1 has the dark shade and the main colour, and the two light places of the ramp hold the main colour. Look 2 adds the lighter tint, and look 3 is the whole palette.
function bgLook(palette: (typeof BG_PALETTES)[number], look: 0 | 1 | 2 | 3): readonly string[] {
  if (look === 0) return [palette[0], palette[0], palette[0], palette[0], palette[0]]
  if (look === 1) return [palette[0], palette[1], palette[2], palette[2], palette[2]]
  if (look === 2) return [palette[0], palette[1], palette[2], palette[3], palette[3]]
  return [...palette]
}

// The five colours of the ramp after this many seconds of the session. It is all black at second 0, has the look of the first colour step at 10 minutes, the look of the second at 30 minutes and the whole palette at 90 minutes (and from then on), and it is on its way all the time between these times: every colour moves in a straight line from its place in one look to its place in the next, channel by channel as the ball does (blendHex). So nothing waits for a cut-off and then switches, and at a cut-off the ramp is exactly the look written for it. A number that is not a real count of seconds counts as second 0, and a palette number that is not a palette counts as palette 0.
export function bgRamp(seconds: number, paletteIndex: number): readonly string[] {
  const palette = BG_PALETTES[Number.isInteger(paletteIndex) && paletteIndex >= 0 && paletteIndex < BG_PALETTES.length ? paletteIndex : 0]
  if (!(seconds > 0)) return bgLook(palette, 0)
  if (seconds >= LOOK_AT_SECONDS[3]) return bgLook(palette, 3)
  const look = seconds >= LOOK_AT_SECONDS[2] ? 2 : seconds >= LOOK_AT_SECONDS[1] ? 1 : 0
  const next = look === 0 ? 1 : look === 1 ? 2 : 3
  const from = bgLook(palette, look)
  const to = bgLook(palette, next)
  const share = (seconds - LOOK_AT_SECONDS[look]) / (LOOK_AT_SECONDS[next] - LOOK_AT_SECONDS[look])
  return to.map((colour, i) => blendHex(from[i], colour, share))
}

// The light of the old rays. The screen does not use it any more; the tests of the stop alert lines and of the milestone lines still check what some lines say about it, until the lines are rewritten (Packet 08B) and this part is removed.
export const BG_LIGHT_START = 0.3
export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS
export function bgLight(seconds: number): number {
  if (!(seconds > 0)) return BG_LIGHT_START
  if (seconds >= BG_LIGHT_FULL_AT_SECONDS) return 1
  return BG_LIGHT_START + (1 - BG_LIGHT_START) * (seconds / BG_LIGHT_FULL_AT_SECONDS)
}

// Whether the background is drawn: the full look (laptop) and lite level 1 (phones) draw it, lite level 2 draws nothing (the screen stays plain black, see src/lib/lite.ts).
const DRAWN_BY_LITE: readonly [boolean, boolean, boolean] = [true, true, false]

export function bgDrawn(liteLevel: LiteLevel): boolean {
  return DRAWN_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
