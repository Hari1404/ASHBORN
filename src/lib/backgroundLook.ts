import { blendHex, ballPaletteIndex, ballStep } from "@/lib/ballLook"
import type { LiteLevel } from "@/lib/lite"
import { FLOW_FROM_SECONDS } from "@/lib/timerMaths"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and a few functions: no screen, no clock of its own.
// The background is a slow flowing gradient with a little grain, drawn by our own canvas (src/components/BackgroundCanvas.tsx and src/lib/backgroundRender.ts, from Packet 08C; before that it was the React Bits animation Grainient). It draws its picture from a ramp of five colours (its `colors`). The ramp of a session starts all black and grows from the dark end: the dark shade and the main colour come in at the first colour step, the lighter tint at the second, the lightest tint at the third (bgRamp below, and CONNECTIONS.md C37).
// The colour steps (10, 30 and 90 minutes) and the choice of palette are the ones of the glowing ball (src/lib/ballLook.ts), so the background and the ball always have the same colour family.
// The canvas reads its `colors` again on its own while it runs and does not build its drawing again for them, so a colour step is a smooth blend from the old ramp to the new one (bgBlendRamp), given to the canvas as a new list of five colours many times a second while it moves (see TimerBackground.tsx).
// The automated tests are in src/lib/backgroundLook.test.ts. Run them with: npm test

// How long the background takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C38).
export const BG_FADE_MS = 700
// How long the ramp takes to move from one colour step to the next, in milliseconds. It is slower than the glowing ball (BALL_BLEND_MS in src/lib/ballLook.ts): the background is a big soft picture, and a slow change reads as light changing, not as a switch.
export const BG_BLEND_MS = 12000
// How long after a session lights the background its canvas is made, in milliseconds. It is shorter than BALL_MOUNT_DELAY_MS (src/lib/ballLook.ts): the background is made first because it is cheap to draw, and the heavy glowing ball is made after it, so the work of the two never lands in the same moment (see CONNECTIONS.md C47). The box of the background (its black and its fade in) appears when the canvas is made, so the fade in starts then.
export const BG_MOUNT_DELAY_MS = 300

// The settings of the animation, as chosen by the owner in the blend preview. The colours are not here: they come from the ramp of the session.
// The flow never stops (speed 1) and never answers the cursor, a click or a touch (the canvas has no way to listen to them: a timer screen is not a toy). The grain stands still, so it does not flicker. The canvas draws one pixel for every pixel of the screen (dpr 1).
export const BG_SETTINGS = {
  angle: 55,
  speed: 1,
  flow: 0.8,
  scale: 1,
  softness: 1,
  silk: 0.35,
  grainAmount: 0.08,
  grainSize: 1.2,
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

// The five colours of the ramp after this many seconds of the session. Black before the first colour step. At the first step the dark shade and the main colour come in, and the two light places of the ramp hold the main colour. At the second step the lighter tint comes in, at the third the lightest. A number that is not a real count of seconds counts as second 0, and a palette number that is not a palette counts as palette 0.
export function bgRamp(seconds: number, paletteIndex: number): readonly string[] {
  const palette = BG_PALETTES[Number.isInteger(paletteIndex) && paletteIndex >= 0 && paletteIndex < BG_PALETTES.length ? paletteIndex : 0]
  const step = ballStep(seconds)
  if (step === 0) return [palette[0], palette[0], palette[0], palette[0], palette[0]]
  if (step === 1) return [palette[0], palette[1], palette[2], palette[2], palette[2]]
  if (step === 2) return [palette[0], palette[1], palette[2], palette[3], palette[3]]
  return [...palette]
}

// How far the colours have moved after this share of the blend time: a smooth start and a smooth end (smoothstep), so a colour step does not begin or stop with a jerk. 0 gives 0 and 1 gives 1. A share outside 0 to 1 is cut to the ends, and a share that is not a number counts as arrived.
export function bgEase(progress: number): number {
  if (Number.isNaN(progress)) return 1
  const k = Math.min(1, Math.max(0, progress))
  return k * k * (3 - 2 * k)
}

// The ramp on its way from one ramp to another: every colour moves on its own from its old value to its new one, channel by channel, as the ball does (blendHex). At the end the new ramp is given exactly as written. A colour the old ramp does not have is taken as it is.
export function bgBlendRamp(from: readonly string[], to: readonly string[], progress: number): readonly string[] {
  const moved = bgEase(progress)
  return to.map((colour, i) => (moved >= 1 || from[i] === undefined ? colour : blendHex(from[i], colour, moved)))
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
