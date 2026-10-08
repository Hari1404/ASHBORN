import { qualityOf, type Quality } from "@/lib/timerMaths"

// AB:TIMER.BALL-LOOK:START
// The look of the glowing ball of the Pro Timer, as pure functions: no screen, no clock of its own.
// The ball starts white. At each quality step of the session (meh, solid, deep, flow) its colour moves one step on. The steps are the quality names of timerMaths.ts, so the cut-offs are written only there (see CONNECTIONS.md C34).
// Every session draws one of the palettes below from the started_at text of the session, so a reload or a second device shows the same colours.
// The automated tests are in src/lib/ballLook.test.ts. Run them with: npm test

export const BALL_WHITE = "#ffffff"
// How long the colour takes to move from one step to the next, in milliseconds.
export const BALL_BLEND_MS = 4000
// How long the ball takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C35).
export const BALL_FADE_MS = 700

// The order of the quality names is the order of the steps: 0 is white, 1 is the first colour of a palette, and so on.
const STEPS: readonly Quality[] = ["meh", "solid", "deep", "flow"]

// Each palette has three colours: the colour of solid, of deep and of flow, in this order.
export const BALL_PALETTES: readonly (readonly [string, string, string])[] = [
  ["#ffc53d", "#ff6b2c", "#ff2d55"],
  ["#7df9ff", "#2fa8ff", "#5b5bff"],
  ["#b6ff5c", "#3cffb0", "#19d4ff"],
  ["#ff8ae2", "#f25bd0", "#b13cff"],
  ["#e6ff3d", "#7cff4d", "#00ffa3"],
  ["#a58bff", "#7b5cff", "#ff4ddb"],
]

// How many dust grains the ball draws: the full look, lite level 1 (phones) and lite level 2 (see src/lib/lite.ts).
const PARTICLES_BY_LITE: readonly [number, number, number] = [15000, 6000, 3000]

export function ballParticles(liteLevel: 0 | 1 | 2): number {
  return PARTICLES_BY_LITE[liteLevel]
}

// 0 for white, up to 3 for the last colour.
export function ballStep(seconds: number): 0 | 1 | 2 | 3 {
  return STEPS.indexOf(qualityOf(seconds)) as 0 | 1 | 2 | 3
}

function seedToNumber(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// The palette of a session: the same seed always gives the same palette.
export function ballPaletteIndex(seed: string): number {
  return seedToNumber(seed) % BALL_PALETTES.length
}

// The colour the ball is moving towards after this many seconds of the session.
export function ballTargetColour(seconds: number, seed: string): string {
  const step = ballStep(seconds)
  if (step === 0) return BALL_WHITE
  return BALL_PALETTES[ballPaletteIndex(seed)][step - 1]
}

function readHex(text: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(text)
  if (match === null) return null
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)]
}

// A colour between two colours written as #rrggbb. t = 0 gives the first, t = 1 the second; t outside 0 to 1 is cut to it, and a t that is not a number gives the second.
// A colour that is not written as #rrggbb gives the second colour as it is.
export function blendHex(from: string, to: string, t: number): string {
  const a = readHex(from)
  const b = readHex(to)
  if (a === null || b === null) return to
  const k = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1
  const channel = (i: number) => Math.round(a[i] + (b[i] - a[i]) * k)
  return "#" + [0, 1, 2].map((i) => channel(i).toString(16).padStart(2, "0")).join("")
}
// AB:TIMER.BALL-LOOK:END
