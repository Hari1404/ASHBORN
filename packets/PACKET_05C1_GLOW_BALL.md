# PACKET 05C1: GLOWING BALL BEHIND THE PRO TIMER CLOCK (the hour ring is taken out)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05C. Step 0 checks that 05C is in place and that its files are untouched. If not: **STOP**.
- Create or edit ONLY these files: five NEW files (`src/components/CrystalizedBall.tsx` (the library ball, installed in Step 1), `src/lib/ballLook.ts`, `src/components/TimerBall.tsx`, `src/lib/ballLook.test.ts`, `src/components/TimerBall.test.tsx`), THREE files that are replaced as a whole (`src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`), and three edited files (`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`).
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any install other than the one command in Step 1. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 11 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The owner chose the React Bits component "Crystalized Ball" (a glass ball with a crackling electric rim and glowing dust inside) as the centrepiece of the Pro Timer screen, and asked to take the hour ring out. This packet does that. (1) Step 1 installs the library ball. (2) `src/lib/ballLook.ts` holds the look of the ball as plain functions: it starts white, its colour moves on at the quality steps of the session (10, 30 and 90 minutes), and each session draws one of six hand-picked neon palettes. (3) `src/components/TimerBall.tsx` draws the ball behind the big clock: it lights when a session starts, changes colour slowly, stands still and dims while paused, fades out when the session ends, and draws nothing in a browser without WebGL 2 (the timer still works). (4) `src/components/TimerScreen.tsx`, `src/timer.css` and `src/components/TimerScreen.test.tsx` are replaced as whole files: the ring is gone and the ball is in. (5) Two new test files, the map files and `PROGRESS.md` are updated. Nothing else on any screen changes. The database, the buttons and the timer maths are not touched.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `src/lib/timerMaths.ts`, `src/lib/useTimer.ts`, `src/lib/lite.ts`, `src/components/HoldButton.tsx`, `src/components/AppMenu.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`. If any is missing: **STOP** and report which, and say "Packet 05C has not been run" if `src/components/TimerScreen.tsx` is one of them.

Check that none of the five new files exist: `src/components/CrystalizedBall.tsx`, `src/lib/ballLook.ts`, `src/components/TimerBall.tsx`, `src/lib/ballLook.test.ts`, `src/components/TimerBall.test.tsx`. If any exists: **STOP** and report which.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05C):
```
TAGS OK: 22 tags, 36 places
CONNECTIONS OK: 33 connections, 166 anchors, 34 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the six files this packet changes (`src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -10`. One of the ten lines must contain the text `Packet 05C: Pro Timer screen`. If none does: **STOP** and report the COMPLETE output (Packet 05C was not committed).

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. `npm ls ogl vitest jsdom --depth=0`
6. This ONE command (it prints the fingerprint of each of the three files this packet replaces, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must show `ogl@`, `vitest@5.0.3` and `jsdom@30.1.2`. If any is missing: **STOP** and report the RAW output.
Command 6 must print exactly these three lines (the files exactly as Packet 05C made them):
```
src/components/TimerScreen.tsx e3084eec69ace554260786e21d90718b830e8672fe5aeba6b013ff67c34127bc
src/timer.css e35cd8e4ad20e7df2cfc6cff7f78dfe79634cf786ef886c10af1e5794a3472a1
src/components/TimerScreen.test.tsx 2512bba95e7ef52a07986bb14a840aab05ef37ba28974acac707ae7d23312cdb
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Install the library ball
Run:
```
npx shadcn@latest add @react-bits/CrystalizedBall-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP** and report.
- If it asks whether to overwrite any existing file: answer **no**, then **STOP** and report which file.
- If it says the component or the registry was not found, or it cannot reach the registry (a network error): do NOT stop. Copy the message, then run this fallback command exactly as written (it downloads the same file from the React Bits repository):
```
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Animations/CrystalizedBall/CrystalizedBall.tsx" -OutFile "src/components/CrystalizedBall.tsx"
```
  and say in your report that the fallback was used. If the fallback also fails: **STOP** and report both messages.
- Any other error: **STOP** and report the COMPLETE output.

Then run these two and copy the RAW output of each:
1. `git status --short`
2. `git diff --stat -- package.json package-lock.json`

The ONLY new file must be `src/components/CrystalizedBall.tsx`. If the install created any other file or folder, or changed a tracked file other than `package.json` and `package-lock.json`: **STOP** and report the COMPLETE `git status --short`. Do not commit.
If `package.json` or `package-lock.json` shows as changed: copy the output of `git diff package.json`, then run `git checkout -- package.json package-lock.json` (the package `ogl` is already installed, so nothing is lost), then run `git status --short` again and copy its raw output.

Run this ONE command:
```
foreach ($f in @("src/components/CrystalizedBall.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It should print `src/components/CrystalizedBall.tsx b5a603ded88eca8b1ac5316d54047496cd32d6bfc7d0fc548191e72b3f69c5c0`. If the number is different, do NOT stop: copy the line. (The type check in Step 6 decides whether the file works.)

## STEP 2: Create `src/lib/ballLook.ts` and `src/components/TimerBall.tsx`
Create the file `src/lib/ballLook.ts` with exactly this content (everything inside the block below; the first line is an import line and the last line is a comment):
```ts
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
```

Create the file `src/components/TimerBall.tsx` with exactly this content (everything inside the block below):
```tsx
import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import CrystalizedBall from "@/components/CrystalizedBall"
import { BALL_BLEND_MS, BALL_FADE_MS, ballParticles, ballTargetColour, blendHex } from "@/lib/ballLook"
import { LITE_LEVEL } from "@/lib/lite"

// AB:TIMER.BALL:START
// The glowing ball behind the big clock of the Pro Timer screen. It is shown while a session runs or is paused.
// Library: src/components/CrystalizedBall.tsx (React Bits, never edited). Its settings are the props below. The ball needs WebGL 2; without it, or when it fails, nothing is drawn and the clocks still work (see CONNECTIONS.md C35).
// A new session lights a new ball: it is made again, so it starts white and plays its short ignite. When the session ends the ball fades out for BALL_FADE_MS and is then taken away.
// The colour moves to its next step slowly (BALL_BLEND_MS) instead of jumping. The steps and palettes are in src/lib/ballLook.ts. The seed is the started_at text of the session (the screen calls it ringSeed).
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
function LitBall({ paused, target }: { paused: boolean; target: string }) {
  const colour = useBlendedColour(target)
  return (
    <CrystalizedBall
      preset="plasma"
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

  useEffect(() => {
    if (active) {
      if (!wasActive.current) setLit((n) => n + 1)
      wasActive.current = true
      setShown(true)
      return undefined
    }
    wasActive.current = false
    const timer = window.setTimeout(() => setShown(false), BALL_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [active])

  if (!drawable || !shown) return null
  return (
    <div className="ab-timer-ball" data-out={active ? undefined : "yes"} aria-hidden="true">
      <BallGuard>
        <LitBall key={lit} paused={paused} target={ballTargetColour(seconds, seed)} />
      </BallGuard>
    </div>
  )
}
// AB:TIMER.BALL:END
```

## STEP 3: Create the two test files
Create the file `src/lib/ballLook.test.ts` with exactly this content (everything inside the block below):
```ts
import { describe, expect, it } from "vitest"
import {
  BALL_BLEND_MS,
  BALL_FADE_MS,
  BALL_PALETTES,
  BALL_WHITE,
  ballPaletteIndex,
  ballParticles,
  ballStep,
  ballTargetColour,
  blendHex,
} from "./ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the look of the glowing ball. Run them with: npm test
// The steps of the ball follow the quality cut-offs of timerMaths.ts (they are imported here, not written again), see CONNECTIONS.md C34.

// A started_at text as the database sends it, different for every number.
function seedOf(n: number): string {
  const ms = Date.UTC(2026, 9, 7, 10, 0, 0) + n * 1234567
  return new Date(ms).toISOString().replace("Z", "123+00:00")
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function saturation(hex: string): number {
  const c = channels(hex)
  const max = Math.max(...c)
  return max === 0 ? 0 : (max - Math.min(...c)) / max
}

function distance(a: string, b: string): number {
  const x = channels(a)
  const y = channels(b)
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])
}

describe("the timing of the ball", () => {
  it("moves to the next colour in 4 seconds and fades out in 0.7 seconds", () => {
    expect(BALL_BLEND_MS).toBe(4000)
    expect(BALL_FADE_MS).toBe(700)
  })
})

describe("the palettes", () => {
  it("has white as the first colour", () => {
    expect(BALL_WHITE).toBe("#ffffff")
  })

  it("has at least four palettes, each with three different colours written as #rrggbb", () => {
    expect(BALL_PALETTES.length).toBeGreaterThanOrEqual(4)
    for (const palette of BALL_PALETTES) {
      expect(palette).toHaveLength(3)
      for (const colour of palette) expect(colour).toMatch(/^#[0-9a-f]{6}$/)
      expect(new Set(palette).size).toBe(3)
    }
  })

  it("has no palette twice", () => {
    const written = BALL_PALETTES.map((p) => p.join(","))
    expect(new Set(written).size).toBe(written.length)
  })

  it("has only bright, vivid colours, so that every colour looks strong on a black screen", () => {
    for (const colour of BALL_PALETTES.flat()) {
      expect(luminance(colour)).toBeGreaterThanOrEqual(0.15)
      expect(saturation(colour)).toBeGreaterThanOrEqual(0.4)
      expect(Math.max(...channels(colour))).toBeGreaterThanOrEqual(224)
    }
  })

  it("moves visibly from white to the first colour and on from step to step", () => {
    for (const palette of BALL_PALETTES) {
      expect(distance(BALL_WHITE, palette[0])).toBeGreaterThanOrEqual(100)
      expect(distance(palette[0], palette[1])).toBeGreaterThanOrEqual(45)
      expect(distance(palette[1], palette[2])).toBeGreaterThanOrEqual(45)
    }
  })
})

describe("the step of the ball", () => {
  it("is 0 below the solid cut-off, 1 from it, 2 from the deep cut-off, 3 from the flow cut-off", () => {
    expect(ballStep(0)).toBe(0)
    expect(ballStep(SOLID_FROM_SECONDS - 1)).toBe(0)
    expect(ballStep(SOLID_FROM_SECONDS)).toBe(1)
    expect(ballStep(DEEP_FROM_SECONDS - 1)).toBe(1)
    expect(ballStep(DEEP_FROM_SECONDS)).toBe(2)
    expect(ballStep(FLOW_FROM_SECONDS - 1)).toBe(2)
    expect(ballStep(FLOW_FROM_SECONDS)).toBe(3)
    expect(ballStep(FLOW_FROM_SECONDS * 10)).toBe(3)
  })

  it("cuts a part of a second off, like the maths does", () => {
    expect(ballStep(SOLID_FROM_SECONDS - 0.5)).toBe(0)
    expect(ballStep(SOLID_FROM_SECONDS + 0.5)).toBe(1)
  })
})

describe("the palette of a session", () => {
  it("is the same for the same seed, and a valid palette number", () => {
    for (let n = 0; n < 50; n++) {
      const index = ballPaletteIndex(seedOf(n))
      expect(index).toBe(ballPaletteIndex(seedOf(n)))
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(BALL_PALETTES.length)
    }
  })

  it("gives an empty seed a valid palette too", () => {
    const index = ballPaletteIndex("")
    expect(index).toBeGreaterThanOrEqual(0)
    expect(index).toBeLessThan(BALL_PALETTES.length)
  })

  it("uses every palette, and none of them much less than the others", () => {
    const counts = new Array<number>(BALL_PALETTES.length).fill(0)
    const total = 600
    for (let n = 0; n < total; n++) counts[ballPaletteIndex(seedOf(n))]++
    const fair = total / BALL_PALETTES.length
    for (const count of counts) {
      expect(count).toBeGreaterThan(fair * 0.5)
      expect(count).toBeLessThan(fair * 1.5)
    }
  })
})

describe("the colour the ball moves towards", () => {
  it("is white until the solid cut-off, whatever the seed", () => {
    for (let n = 0; n < 20; n++) {
      expect(ballTargetColour(0, seedOf(n))).toBe(BALL_WHITE)
      expect(ballTargetColour(SOLID_FROM_SECONDS - 1, seedOf(n))).toBe(BALL_WHITE)
    }
    expect(ballTargetColour(100, "")).toBe(BALL_WHITE)
  })

  it("takes the three colours of the palette of the seed, one per step", () => {
    for (let n = 0; n < 30; n++) {
      const seed = seedOf(n)
      const palette = BALL_PALETTES[ballPaletteIndex(seed)]
      expect(ballTargetColour(SOLID_FROM_SECONDS, seed)).toBe(palette[0])
      expect(ballTargetColour(DEEP_FROM_SECONDS, seed)).toBe(palette[1])
      expect(ballTargetColour(FLOW_FROM_SECONDS, seed)).toBe(palette[2])
      expect(ballTargetColour(FLOW_FROM_SECONDS * 3, seed)).toBe(palette[2])
    }
  })

  it("keeps the colour inside a step the same", () => {
    const seed = seedOf(7)
    expect(ballTargetColour(SOLID_FROM_SECONDS + 1, seed)).toBe(ballTargetColour(DEEP_FROM_SECONDS - 1, seed))
  })

  it("shows the same colours for the same session on every device", () => {
    const seed = "2026-10-07T10:00:00.123456+00:00"
    const first = [SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS].map((s) => ballTargetColour(s, seed))
    const second = [SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS].map((s) => ballTargetColour(s, seed))
    expect(second).toEqual(first)
  })
})

describe("blending two colours", () => {
  it("gives the first colour at 0 and the second at 1", () => {
    expect(blendHex("#102030", "#a0b0c0", 0)).toBe("#102030")
    expect(blendHex("#102030", "#a0b0c0", 1)).toBe("#a0b0c0")
  })

  it("gives the middle colour at one half, rounded to the nearest number", () => {
    expect(blendHex("#000000", "#ffffff", 0.5)).toBe("#808080")
    expect(blendHex("#000000", "#646464", 0.5)).toBe("#323232")
    expect(blendHex("#ff0000", "#0000ff", 0.25)).toBe("#bf0040")
  })

  it("blends each of the three channels on its own", () => {
    expect(blendHex("#ff0000", "#00ff00", 1)).toBe("#00ff00")
    expect(blendHex("#0a0b0c", "#0a0b0c", 0.3)).toBe("#0a0b0c")
    expect(blendHex("#000000", "#0000ff", 0.5)).toBe("#000080")
    expect(blendHex("#000000", "#00ff00", 0.5)).toBe("#008000")
    expect(blendHex("#000000", "#ff0000", 0.5)).toBe("#800000")
  })

  it("cuts a t outside 0 to 1 back to 0 or 1", () => {
    expect(blendHex("#102030", "#a0b0c0", -3)).toBe("#102030")
    expect(blendHex("#102030", "#a0b0c0", 7)).toBe("#a0b0c0")
  })

  it("gives the second colour when t is not a number", () => {
    expect(blendHex("#102030", "#a0b0c0", Number.NaN)).toBe("#a0b0c0")
    expect(blendHex("#102030", "#a0b0c0", Number.POSITIVE_INFINITY)).toBe("#a0b0c0")
  })

  it("accepts capital letters and always answers in small letters", () => {
    expect(blendHex("#FFFFFF", "#ABCDEF", 1)).toBe("#abcdef")
    expect(blendHex("#ABCDEF", "#ABCDEF", 0)).toBe("#abcdef")
  })

  it("gives the second colour as it is when a colour is not written as #rrggbb", () => {
    expect(blendHex("white", "#a0b0c0", 0.5)).toBe("#a0b0c0")
    expect(blendHex("#102030", "red", 0.5)).toBe("red")
    expect(blendHex("#fff", "#000", 0.5)).toBe("#000")
    expect(blendHex("#10203", "#a0b0c0", 0.5)).toBe("#a0b0c0")
  })
})

describe("how many grains of dust the ball draws", () => {
  it("is 15000 for the full look, 6000 for lite level 1 and 3000 for lite level 2", () => {
    expect(ballParticles(0)).toBe(15000)
    expect(ballParticles(1)).toBe(6000)
    expect(ballParticles(2)).toBe(3000)
  })
})
// AB:TIMER.TESTS:END
```

Create the file `src/components/TimerBall.test.tsx` with exactly this content (everything inside the block below):
```tsx
// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The library ball and the lite level are replaced by stand-ins: this file only tests what TimerBall decides and what it hands to the ball.
// A real ball needs WebGL 2, which the test browser (jsdom) does not have; the test that the real ball draws is the look in a real browser (see the owner's look at the end of the packet).
const state = vi.hoisted(() => ({
  lite: 0 as 0 | 1 | 2,
  props: [] as Record<string, unknown>[],
  mounts: 0,
  unmounts: 0,
  broken: false,
}))

vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return state.lite
  },
}))

vi.mock("@/components/CrystalizedBall", async () => {
  const { createElement: h, useEffect } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.props.push(props)
      if (state.broken) throw new Error("the ball broke")
      useEffect(() => {
        state.mounts++
        return () => {
          state.unmounts++
        }
      }, [])
      return h("canvas", { id: "ball-stub" })
    },
  }
})

import { BALL_BLEND_MS, BALL_FADE_MS, BALL_PALETTES, BALL_WHITE, ballPaletteIndex } from "@/lib/ballLook"
import { DEEP_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"
import TimerBall from "./TimerBall"

// AB:TIMER.TESTS:START
const timerCss = readFileSync("src/timer.css", "utf8")
const SEED = "2026-10-07T10:00:00.123456+00:00"
const PALETTE = BALL_PALETTES[ballPaletteIndex(SEED)]

type BallProps = { active: boolean; paused: boolean; seconds: number; seed: string }

let root: Root | null = null
let container: HTMLElement | null = null
let loseContext = vi.fn()
let canvasMode: "webgl2" | "none" | "throws" = "webgl2"

function show(over: Partial<BallProps> = {}): void {
  const props: BallProps = { active: true, paused: false, seconds: 0, seed: SEED, ...over }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement("div", null, createElement(TimerBall, props), createElement("p", { id: "after" }, "after"))))
}

function dispose(): void {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
}

function wait(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function box(): HTMLElement {
  const found = container?.querySelector<HTMLElement>(".ab-timer-ball") ?? null
  if (found === null) throw new Error("no ball box")
  return found
}

function lastProps(): Record<string, unknown> {
  const last = state.props.at(-1)
  if (last === undefined) throw new Error("the ball was never drawn")
  return last
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  state.lite = 0
  state.props = []
  state.mounts = 0
  state.unmounts = 0
  state.broken = false
  canvasMode = "webgl2"
  loseContext = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) => {
    if (type !== "webgl2") return null
    if (canvasMode === "throws") throw new Error("no context")
    if (canvasMode === "none") return null
    return { getExtension: (name: string) => (name === "WEBGL_lose_context" ? { loseContext } : null) }
  }) as never)
  vi.useFakeTimers()
})

afterEach(() => {
  dispose()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("TimerBall: when it draws", () => {
  it("draws nothing while there is no session", () => {
    show({ active: false })
    expect(has(".ab-timer-ball")).toBe(false)
    expect(state.props).toHaveLength(0)
  })

  it("draws the ball in its box while a session runs, hidden from screen readers", () => {
    show({ active: true })
    expect(box().getAttribute("aria-hidden")).toBe("true")
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(has("#ball-stub")).toBe(true)
    expect(state.mounts).toBe(1)
  })

  it("draws nothing when the browser cannot give WebGL 2, and the rest of the page stays", () => {
    canvasMode = "none"
    show({ active: true })
    expect(has(".ab-timer-ball")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })

  it("draws nothing and does not crash when asking for WebGL 2 throws an error", () => {
    canvasMode = "throws"
    show({ active: true })
    expect(has(".ab-timer-ball")).toBe(false)
    expect(has("#after")).toBe(true)
  })

  it("gives its test context back to the browser", () => {
    show({ active: true })
    expect(loseContext).toHaveBeenCalledTimes(1)
  })
})

describe("TimerBall: what it hands to the library ball", () => {
  it("uses the plasma look at 66 percent of its box, with the ignite and the cursor wake on", () => {
    show({ active: true })
    const props = lastProps()
    expect(props.preset).toBe("plasma")
    expect(props.size).toBe(0.66)
    expect(props.intro).toBe(true)
    expect(props.interactive).toBe(true)
    expect(props.paused).toBe(false)
  })

  it("draws fewer grains of dust on a phone: 15000, 6000 and 3000 for lite level 0, 1 and 2", () => {
    show({ active: true })
    expect(lastProps().particleCount).toBe(15000)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(lastProps().particleCount).toBe(6000)
    dispose()
    state.lite = 2
    show({ active: true })
    expect(lastProps().particleCount).toBe(3000)
  })

  it("stands the ball still while the session is paused, and lets it go on after", () => {
    show({ active: true, paused: true })
    expect(lastProps().paused).toBe(true)
    show({ active: true, paused: false })
    expect(lastProps().paused).toBe(false)
  })

  it("is white at the start of a session", () => {
    show({ active: true, seconds: 0 })
    expect(lastProps().color).toBe(BALL_WHITE)
  })

  it("shows the right colour at once when the page is opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe(PALETTE[1])
    expect(state.mounts).toBe(1)
  })
})

describe("TimerBall: the colour moving on", () => {
  it("stays white until the solid cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    wait(5000)
    expect(lastProps().color).toBe(BALL_WHITE)
  })

  it("moves from white to the first colour of the palette in exactly BALL_BLEND_MS, not at once", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    expect(lastProps().color).toBe(BALL_WHITE)
    wait(BALL_BLEND_MS / 2)
    const half = String(lastProps().color)
    expect(half).not.toBe(BALL_WHITE)
    expect(half).not.toBe(PALETTE[0])
    const from = channels(BALL_WHITE)
    const to = channels(PALETTE[0])
    channels(half).forEach((value, i) => {
      expect(value).toBeGreaterThanOrEqual(Math.min(from[i], to[i]))
      expect(value).toBeLessThanOrEqual(Math.max(from[i], to[i]))
    })
    wait(BALL_BLEND_MS / 2 - 100)
    expect(lastProps().color).not.toBe(PALETTE[0])
    wait(100)
    expect(lastProps().color).toBe(PALETTE[0])
    wait(3000)
    expect(lastProps().color).toBe(PALETTE[0])
  })

  it("comes steadily closer to the new colour while it moves", () => {
    const away = (hex: string): number => {
      const a = channels(hex)
      const b = channels(PALETTE[0])
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const seen: number[] = [away(String(lastProps().color))]
    for (let i = 0; i < 4; i++) {
      wait(BALL_BLEND_MS / 4)
      seen.push(away(String(lastProps().color)))
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeLessThan(seen[i - 1])
    expect(seen.at(-1)).toBe(0)
  })

  it("goes on from the first colour to the second at the deep cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe(PALETTE[0])
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    expect(lastProps().color).toBe(PALETTE[1])
  })

  it("does not draw the ball again for a colour step: it is the same ball", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
  })

  it("leaves no timer behind when the screen goes away in the middle of a colour step", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(500)
    dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("TimerBall: lighting and fading", () => {
  it("fades out for BALL_FADE_MS when the session ends, and is then taken away", () => {
    show({ active: true, seconds: 100 })
    show({ active: false, seconds: 0 })
    expect(box().getAttribute("data-out")).toBe("yes")
    wait(BALL_FADE_MS - 100)
    expect(has(".ab-timer-ball")).toBe(true)
    wait(100)
    expect(has(".ab-timer-ball")).toBe(false)
    expect(state.unmounts).toBe(1)
  })

  it("lights a new ball for every new session", () => {
    show({ active: true })
    show({ active: false })
    wait(BALL_FADE_MS)
    expect(state.mounts).toBe(1)
    show({ active: true })
    expect(has(".ab-timer-ball")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("lights a new ball when a session starts while the old one is still fading", () => {
    show({ active: true })
    show({ active: false })
    wait(300)
    show({ active: true })
    wait(BALL_FADE_MS * 2)
    expect(state.mounts).toBe(2)
    expect(box().hasAttribute("data-out")).toBe(false)
  })

  it("starts a new session white, also after a long one", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe(PALETTE[1])
    show({ active: false, seconds: 0 })
    wait(BALL_FADE_MS)
    show({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(lastProps().color).toBe(BALL_WHITE)
  })

  it("keeps the ball while a session is paused", () => {
    show({ active: true, seconds: 100 })
    show({ active: true, paused: true, seconds: 100 })
    wait(BALL_FADE_MS * 3)
    expect(has(".ab-timer-ball")).toBe(true)
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(state.mounts).toBe(1)
  })
})

describe("TimerBall: when the library ball breaks", () => {
  it("leaves the ball out and keeps the rest of the page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    state.broken = true
    show({ active: true })
    expect(has("#ball-stub")).toBe(false)
    expect(has("#after")).toBe(true)
    quiet.mockRestore()
  })
})

describe("the css of the ball", () => {
  const block = (selector: string): string => {
    const start = timerCss.indexOf(selector + " {")
    if (start < 0) return ""
    return timerCss.slice(start, timerCss.indexOf("}", start))
  }

  it("is a box larger than the dial, square, behind the clocks, that never catches a tap", () => {
    const ball = block(".ab-timer-ball")
    const width = Number(/width:\s*([0-9.]+)%/.exec(ball)?.[1])
    expect(width).toBeGreaterThanOrEqual(100)
    expect(ball).toContain("aspect-ratio: 1;")
    expect(ball).toContain("position: absolute;")
    expect(ball).toContain("pointer-events: none;")
  })

  it("fades for as long as the code waits before it takes the ball away", () => {
    const ball = block(".ab-timer-ball")
    const fade = Number(/transition:\s*opacity\s+([0-9]+)ms/.exec(ball)?.[1])
    expect(fade).toBe(BALL_FADE_MS)
    expect(block('.ab-timer-ball[data-out="yes"]')).toContain("opacity: 0;")
  })

  it("dims the ball while the session is paused", () => {
    const dim = block('.ab-timer[data-state="paused"] .ab-timer-ball')
    const opacity = Number(/opacity:\s*([0-9.]+);/.exec(dim)?.[1])
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(1)
  })

  it("clips what reaches past the edge of the screen, so the phone never scrolls sideways", () => {
    expect(block(".ab-timer")).toContain("overflow: hidden;")
  })

  it("keeps the line, the Try again button and the buttons above the ball", () => {
    for (const selector of [".ab-timer-note", ".ab-timer-retry", ".ab-timer-actions"]) {
      expect(block(selector)).toContain("position: relative;")
      expect(block(selector)).toContain("z-index: 1;")
    }
  })
})
// AB:TIMER.TESTS:END
```

## STEP 4: Replace three files as a whole
Each of the three files below already exists. Replace its ENTIRE content with the block below it: delete everything that is in the file and put exactly the block in its place.

Replace the ENTIRE content of the file `src/components/TimerScreen.tsx` with exactly this content (everything inside the block below):
```tsx
import HoldButton from "@/components/HoldButton"
import TimerBall from "@/components/TimerBall"
import { formatClock, qualityOf } from "@/lib/timerMaths"
import { useTimer, type EndNotice } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.SCREEN:START
// The Pro Timer screen. It is shown at the page address #timer (SignedInStub.tsx chooses it, see CONNECTIONS.md C30).
// Big clock: the seconds of the running session. Small clock under it: the total of the day, saved sessions plus the running one.
// Behind the big clock sits the glowing ball (TimerBall.tsx). It lights when a session starts, changes colour as the session gets deeper, stops and dims when paused, and fades when the session ends.
// Start and Pause / Resume are normal taps. End Session is the library Hold Button (src/components/HoldButton.tsx, never edited): hold it until it is full.
// The ball sits in a box that is larger than the dial, and the ball is a share of that box (see CONNECTIONS.md C31).
// The look of the clock digits (Space Grotesk, fixed width) is in timer.css (see CONNECTIONS.md C32).

function noticeText(notice: EndNotice): string {
  const head = notice.capped ? "Day ended at midnight. " : ""
  if (!notice.saved || notice.seconds === null) return head + "Under 1 minute, so it was not saved."
  return head + "Saved " + formatClock(notice.seconds) + " (" + qualityOf(notice.seconds) + ")."
}

export default function TimerScreen() {
  const timer = useTimer()
  const ready = timer.link === "online" && !timer.busy

  let note = ""
  if (timer.link === "offline") note = "No connection. Waiting to reconnect."
  else if (timer.link === "problem") note = timer.problem
  else if (timer.notice !== null) note = noticeText(timer.notice)

  return (
    <main className="ab-timer" data-state={timer.status} data-link={timer.link}>
      <div className="ab-timer-dial">
        <TimerBall
          active={timer.status !== "idle"}
          paused={timer.status === "paused"}
          seconds={timer.seconds}
          seed={timer.ringSeed}
        />
        <div className="ab-timer-readout">
          <p className="ab-timer-big" role="timer">
            {formatClock(timer.seconds)}
          </p>
          <p className="ab-timer-small">{formatClock(timer.dayTotal)}</p>
        </div>
      </div>
      <p className="ab-timer-note" role="status">
        {note}
      </p>
      {timer.link === "problem" ? (
        <button className="ab-timer-retry" type="button" onClick={timer.retry}>
          Try again
        </button>
      ) : null}
      <div className="ab-timer-actions">
        {timer.link === "loading" ? null : timer.status === "idle" ? (
          <button className="ab-timer-pill" type="button" disabled={!ready} onClick={timer.start}>
            Start
          </button>
        ) : (
          <>
            <button
              className="ab-timer-pill"
              type="button"
              disabled={!ready}
              onClick={timer.status === "running" ? timer.pause : timer.resume}
            >
              {timer.status === "running" ? "Pause" : "Resume"}
            </button>
            <HoldButton
              className="ab-timer-end"
              size="lg"
              holdTime={1500}
              backgroundColor="#1c1c20"
              fillColor="#ff2a55"
              textColor="#f5f5f5"
              fillTextColor="#ffffff"
              doneLabel="Ended"
              disabled={!ready}
              onHold={timer.end}
            >
              Hold to end session
            </HoldButton>
          </>
        )}
      </div>
    </main>
  )
}
// AB:TIMER.SCREEN:END
```

Replace the ENTIRE content of the file `src/timer.css` with exactly this content (everything inside the block below):
```css
/* Styles of the Pro Timer screen. Tag: see CODE_MAP.md in the project root. */

@import "@fontsource-variable/space-grotesk";

/* AB:TIMER.SCREEN:START */
/* The screen: plain black for now. The menu button (menu.css) floats above it, so the top has room for it. */
.ab-timer {
  min-height: 100dvh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 72px 20px 32px;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-family: "Space Grotesk Variable", system-ui, sans-serif;
}

/* The dial: a square box. The ball (TimerBall.tsx) sits behind the two clocks in the middle. */
.ab-timer-dial {
  position: relative;
  width: min(84vw, 400px);
  aspect-ratio: 1;
}

.ab-timer-readout {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* The digits: Space Grotesk medium. Its digits are not all the same width by default, so tabular-nums switches on the fixed width ones (checked in the font file at weights 400, 500 and 600). CONNECTIONS.md C32. */
.ab-timer-big {
  margin: 0;
  font-size: clamp(2.4rem, 13vw, 4.25rem);
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 22px rgba(0, 0, 0, 0.75), 0 0 6px rgba(0, 0, 0, 0.6);
}

.ab-timer-small {
  margin: 0;
  font-size: clamp(1.05rem, 4.6vw, 1.5rem);
  font-weight: 500;
  line-height: 1;
  color: rgba(255, 255, 255, 0.6);
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 14px rgba(0, 0, 0, 0.75), 0 0 4px rgba(0, 0, 0, 0.6);
}

/* Paused: the digits blink slowly (the ball stands still and dims, see the ball rules below). Still loading: the whole dial is dim. */
.ab-timer[data-state="paused"] .ab-timer-big {
  animation: ab-timer-blink 1.8s ease-in-out infinite;
}

.ab-timer[data-link="loading"] .ab-timer-dial {
  opacity: 0.45;
}

@keyframes ab-timer-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab-timer[data-state="paused"] .ab-timer-big {
    animation: none;
    opacity: 0.55;
  }
}

/* The line under the dial: No connection, an error, or what happened to the session that was just ended. It keeps its height so that nothing jumps. */
.ab-timer-note {
  position: relative;
  z-index: 1;
  margin: 0;
  min-height: 1.4em;
  max-width: 320px;
  font-size: 15px;
  line-height: 1.4;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.ab-timer-retry {
  position: relative;
  z-index: 1;
  padding: 8px 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 999px;
  cursor: pointer;
}

/* The buttons: Start, or Pause and Resume above the Hold Button. The box keeps its height while loading so that the dial does not move. */
.ab-timer-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 320px;
  min-height: 124px;
}

.ab-timer-pill {
  width: 100%;
  height: 58px;
  padding: 0 28px;
  font: inherit;
  font-size: 19px;
  font-weight: 700;
  color: #000;
  background: #fff;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.ab-timer-pill:disabled {
  opacity: 0.4;
  cursor: default;
}

.ab-timer-pill:active:enabled {
  transform: scale(0.98);
}

.ab-timer-end {
  width: 100%;
}
/* AB:TIMER.SCREEN:END */

/* AB:TIMER.BALL:START */
/* The box of the glowing ball (TimerBall.tsx). It is 136 percent of the dial, so the glow has room, and it sits behind the clocks. It never catches a tap. The fade time is the same as BALL_FADE_MS in ballLook.ts (CONNECTIONS.md C31 and C35). */
.ab-timer-ball {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 136%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: opacity 700ms ease;
}

.ab-timer-ball[data-out="yes"] {
  opacity: 0;
}

.ab-timer[data-state="paused"] .ab-timer-ball {
  opacity: 0.4;
}
/* AB:TIMER.BALL:END */
```

Replace the ENTIRE content of the file `src/components/TimerScreen.test.tsx` with exactly this content (everything inside the block below):
```tsx
// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The timer hook is replaced by a view that each test fills in, so this file only tests what the screen draws and which buttons it wires.
const state = vi.hoisted(() => ({ view: null as unknown }))
vi.mock("@/lib/useTimer", () => ({ useTimer: () => state.view }))

// The glowing ball is replaced by a stand-in that records what the screen hands to it (the ball itself is tested in TimerBall.test.tsx).
const ball = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }))
vi.mock("@/components/TimerBall", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      ball.props.push(props)
      return h("div", { id: "ball-stub" })
    },
  }
})

import { formatClock, qualityOf } from "@/lib/timerMaths"
import type { TimerView } from "@/lib/useTimer"
import TimerScreen from "./TimerScreen"

// AB:TIMER.TESTS:START
// The css files are read as plain text from the project root, where npm test runs (vitest turns an imported css file into nothing, also with ?raw).
const timerCss = readFileSync("src/timer.css", "utf8")
const fontCss = readFileSync("node_modules/@fontsource-variable/space-grotesk/index.css", "utf8")

const SEED = "2026-10-07T10:00:00+00:00"

function makeView(over: Partial<TimerView> = {}): TimerView {
  return {
    link: "online",
    problem: "",
    busy: false,
    status: "idle",
    seconds: 0,
    dayTotal: 0,
    ringSeed: "",
    notice: null,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    end: vi.fn(),
    retry: vi.fn(),
    ...over,
  }
}

let root: Root | null = null
let container: HTMLElement | null = null

function show(over: Partial<TimerView> = {}): TimerView {
  const view = makeView(over)
  state.view = view
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(TimerScreen)))
  return view
}

function q(selector: string): HTMLElement {
  const found = container?.querySelector<HTMLElement>(selector) ?? null
  if (found === null) throw new Error("not found: " + selector)
  return found
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function pointer(type: string): Event {
  return new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0 })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  ball.props = []
  // The Hold Button watches its own size; jsdom has no ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.useFakeTimers()
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe("TimerScreen: what it shows", () => {
  it("shows the big clock of the session and the small clock of the day", () => {
    show({ status: "running", seconds: 3725, dayTotal: 7300 })
    expect(q(".ab-timer-big").textContent).toBe(formatClock(3725))
    expect(q(".ab-timer-big").getAttribute("role")).toBe("timer")
    expect(q(".ab-timer-small").textContent).toBe(formatClock(7300))
  })

  it("hands its state to the css as two attributes of the main element", () => {
    show({ link: "loading", status: "idle" })
    expect(q("main.ab-timer").getAttribute("data-state")).toBe("idle")
    expect(q("main.ab-timer").getAttribute("data-link")).toBe("loading")
    show({ link: "online", status: "paused", seconds: 100 })
    expect(q("main.ab-timer").getAttribute("data-state")).toBe("paused")
    expect(q("main.ab-timer").getAttribute("data-link")).toBe("online")
  })

  it("keeps the line under the dial empty when there is nothing to say", () => {
    show()
    expect(q(".ab-timer-note").textContent).toBe("")
  })

  it("says that there is no connection", () => {
    show({ link: "offline" })
    expect(q(".ab-timer-note").textContent).toContain("No connection")
  })

  it("shows the problem text and a Try again button that reads again", () => {
    const view = show({ link: "problem", problem: "The timer got an answer it could not read." })
    expect(q(".ab-timer-note").textContent).toBe("The timer got an answer it could not read.")
    act(() => q(".ab-timer-retry").click())
    expect(view.retry).toHaveBeenCalledTimes(1)
  })

  it("has no Try again button when there is no problem", () => {
    show({ link: "online" })
    expect(has(".ab-timer-retry")).toBe(false)
    show({ link: "offline" })
    expect(has(".ab-timer-retry")).toBe(false)
  })

  it("tells what happened to the session that was just ended", () => {
    show({ notice: { saved: true, capped: false, seconds: 2000 } })
    const saved = q(".ab-timer-note").textContent ?? ""
    expect(saved).toContain("Saved " + formatClock(2000))
    expect(saved).toContain(qualityOf(2000))
    expect(saved).not.toContain("midnight")
    show({ notice: { saved: false, capped: false, seconds: null } })
    expect(q(".ab-timer-note").textContent).toContain("not saved")
    show({ notice: { saved: true, capped: true, seconds: 600 } })
    expect(q(".ab-timer-note").textContent).toContain("Day ended at midnight.")
    expect(q(".ab-timer-note").textContent).toContain("Saved " + formatClock(600))
    show({ notice: { saved: false, capped: true, seconds: null } })
    expect(q(".ab-timer-note").textContent).toContain("Day ended at midnight.")
    expect(q(".ab-timer-note").textContent).toContain("not saved")
  })

  it("a session that was not saved says so, whatever the seconds in the notice say", () => {
    show({ notice: { saved: false, capped: false, seconds: 125 } })
    expect(q(".ab-timer-note").textContent).toContain("not saved")
    expect(q(".ab-timer-note").textContent).not.toContain("Saved")
  })

  it("puts no connection and problems before the notice", () => {
    const notice = { saved: true, capped: false, seconds: 2000 }
    show({ link: "offline", notice })
    expect(q(".ab-timer-note").textContent).toContain("No connection")
    show({ link: "problem", problem: "Something went wrong.", notice })
    expect(q(".ab-timer-note").textContent).toBe("Something went wrong.")
  })
})

describe("TimerScreen: the ball", () => {
  const lastBall = (): Record<string, unknown> => {
    const last = ball.props.at(-1)
    if (last === undefined) throw new Error("the ball was not drawn")
    return last
  }

  it("tells the ball that no session is running when idle", () => {
    show({ status: "idle", seconds: 0 })
    expect(lastBall().active).toBe(false)
    expect(lastBall().paused).toBe(false)
  })

  it("hands the seconds and the seed of a running session to the ball", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(lastBall()).toEqual({ active: true, paused: false, seconds: 3725, seed: SEED })
  })

  it("tells the ball that the session is paused", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(lastBall()).toEqual({ active: true, paused: true, seconds: 1800, seed: SEED })
  })

  it("puts the ball inside the dial before the clocks, so that the digits are drawn over it", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const stub = q("#ball-stub")
    expect(stub.parentElement?.classList.contains("ab-timer-dial")).toBe(true)
    expect(stub.compareDocumentPosition(q(".ab-timer-readout")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("has no ring any more", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    expect(has("svg")).toBe(false)
    expect(has(".ab-timer-ring")).toBe(false)
  })
})

describe("TimerScreen: the buttons", () => {
  it("shows nothing to press while the first reading is loading", () => {
    show({ link: "loading" })
    expect(has("button")).toBe(false)
  })

  it("idle: one Start button, and it starts", () => {
    const view = show({ status: "idle" })
    expect(q(".ab-timer-pill").textContent).toBe("Start")
    expect(has(".ab-timer-end")).toBe(false)
    act(() => q(".ab-timer-pill").click())
    expect(view.start).toHaveBeenCalledTimes(1)
  })

  it("running: Pause and the Hold Button, no Start; Pause pauses", () => {
    const view = show({ status: "running", seconds: 100 })
    expect(q(".ab-timer-pill").textContent).toBe("Pause")
    expect(q(".ab-timer-end").textContent).toContain("Hold to end session")
    expect(document.querySelectorAll(".ab-timer-pill").length).toBe(1)
    act(() => q(".ab-timer-pill").click())
    expect(view.pause).toHaveBeenCalledTimes(1)
    expect(view.resume).not.toHaveBeenCalled()
  })

  it("paused: Resume and the Hold Button; Resume resumes", () => {
    const view = show({ status: "paused", seconds: 100 })
    expect(q(".ab-timer-pill").textContent).toBe("Resume")
    expect(has(".ab-timer-end")).toBe(true)
    act(() => q(".ab-timer-pill").click())
    expect(view.resume).toHaveBeenCalledTimes(1)
    expect(view.pause).not.toHaveBeenCalled()
  })

  it.each([
    ["without a connection", { link: "offline" as const }],
    ["while a call is on its way", { busy: true }],
    ["after a problem", { link: "problem" as const, problem: "x" }],
  ])("every button is off %s", (_name, extra) => {
    show({ status: "idle", ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    show({ status: "running", seconds: 100, ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(true)
    show({ status: "paused", seconds: 100, ...extra })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(true)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(true)
  })

  it("every button is on when online and not busy", () => {
    show({ status: "running", seconds: 100 })
    expect(q(".ab-timer-pill").hasAttribute("disabled")).toBe(false)
    expect(q(".ab-timer-end").hasAttribute("disabled")).toBe(false)
  })

  it("the Hold Button ends the session only after it was held for 1.5 seconds", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1400)
    })
    expect(view.end).not.toHaveBeenCalled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(view.end).toHaveBeenCalledTimes(1)
  })

  it("a short tap or a hold that is let go early does not end the session", async () => {
    const view = show({ status: "running", seconds: 100 })
    const hold = q(".ab-timer-end")
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(100)
      hold.dispatchEvent(pointer("pointerup"))
      await vi.advanceTimersByTimeAsync(3000)
    })
    await act(async () => {
      hold.dispatchEvent(pointer("pointerdown"))
      await vi.advanceTimersByTimeAsync(1000)
      hold.dispatchEvent(pointer("pointerup"))
      await vi.advanceTimersByTimeAsync(3000)
    })
    expect(view.end).not.toHaveBeenCalled()
  })
})

describe("the css of the screen", () => {
  it("loads Space Grotesk, names the font as the package does, and uses a weight the font has", () => {
    expect(timerCss).toContain('@import "@fontsource-variable/space-grotesk";')
    const screenBlock = /\.ab-timer \{([^}]*)\}/.exec(timerCss)?.[1] ?? ""
    const family = /font-family:\s*"([^"]+)"/.exec(screenBlock)?.[1] ?? ""
    expect(family).toBe("Space Grotesk Variable")
    expect(fontCss).toContain("font-family: '" + family + "'")
    expect(fontCss).toContain("font-weight: 300 700")
    for (const selector of [".ab-timer-big", ".ab-timer-small"]) {
      const block = new RegExp("\\" + selector + " \\{([^}]*)\\}").exec(timerCss)?.[1] ?? ""
      const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1])
      expect(weight).toBeGreaterThanOrEqual(300)
      expect(weight).toBeLessThanOrEqual(700)
    }
  })

  it("switches on the fixed width digits for both clocks", () => {
    for (const selector of [".ab-timer-big", ".ab-timer-small"]) {
      const block = new RegExp("\\" + selector + " \\{([^}]*)\\}").exec(timerCss)?.[1] ?? ""
      expect(block).toContain("font-variant-numeric: tabular-nums;")
    }
  })

  it("reacts to the two attributes the screen sets", () => {
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-ball {')
    expect(timerCss).toContain('.ab-timer[data-state="paused"] .ab-timer-big {')
    expect(timerCss).toContain('.ab-timer[data-link="loading"] .ab-timer-dial {')
  })
})
// AB:TIMER.TESTS:END
```

## STEP 5: Check that the seven files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/lib/ballLook.ts","src/components/TimerBall.tsx","src/lib/ballLook.test.ts","src/components/TimerBall.test.tsx","src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these seven lines:
```
src/lib/ballLook.ts e7eff5960a419cf96024b94cee359aac9e8b2459e2851095cdd8f9d4d9bf112f
src/components/TimerBall.tsx d9955774cd1c2a8b14367a58ac73bead9c5fce74f1f0cafe529bd0b694362b5e
src/lib/ballLook.test.ts 9a8882b05d6685b34b9c7bccf1d4ce5effcb16dde9a68dd4df33b05b6de4f060
src/components/TimerBall.test.tsx 115c42f9c3e33a751af623fc626ab9a2b9fda158c20843ff049d82fb4eb01083
src/components/TimerScreen.tsx 082a9e4ee105626634697abc3b637630045b4d7b823100dd53bd7e4f3012640f
src/timer.css c781010bea6f13685574aec90f6967b84809b0325d6e4ba85c7a5a910b501a0b
src/components/TimerScreen.test.tsx 447596c42535583adab92838fb97f4bd6b9a66114bdb8f1248959006167ada73
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/lib/ballLook.ts 77, src/components/TimerBall.tsx 110, src/lib/ballLook.test.ts 223, src/components/TimerBall.test.tsx 377, src/components/TimerScreen.tsx 89, src/timer.css 173, src/components/TimerScreen.test.tsx 332.)

## STEP 6: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  8 passed (8)` and a line `Tests  455 passed (455)`. It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 7: Edit `CODE_MAP.md`
Five changes. Change nothing else in the file.

**7a.** Replace this whole line (in the "Page codes" table):
```
| TIMER | Pro Timer: the maths, the database calls, the live state, the screen (page address #timer) and their tests are built; the stop alert and the messages are not built yet |
```
with this whole line:
```
| TIMER | Pro Timer: the maths, the database calls, the live state, the screen (page address #timer) with its glowing ball, and their tests are built; the stop alert and the messages are not built yet |
```

**7b.** Replace this whole line (the `AB:TIMER.MATHS` row):
```
| `AB:TIMER.MATHS` | The Pro Timer maths: whole seconds of a session, the clock text, quality (meh, solid, deep, flow), GO BACK IN, milestone messages, the hour ring and its colours, the day total. Pure functions: no screen and no database call | `src/lib/timerMaths.ts` | the neon colours of the ring (NEON_COLORS); the cut-offs, the milestone times and the 60 second rule are decisions, see CONNECTIONS.md C26 and C27 |
```
with this whole line:
```
| `AB:TIMER.MATHS` | The Pro Timer maths: whole seconds of a session, the clock text, quality (meh, solid, deep, flow), GO BACK IN, milestone messages, the hour ring and its colours (built and tested, but the screen has not drawn the ring since Packet 05C1: the glowing ball took its place), the day total. Pure functions: no screen and no database call | `src/lib/timerMaths.ts` | the neon colours of the ring (NEON_COLORS, not shown on the screen at the moment); the cut-offs, the milestone times and the 60 second rule are decisions, see CONNECTIONS.md C26 and C27 |
```

**7c.** Replace this whole line (the `AB:TIMER.SCREEN` row):
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the hour ring, the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Plain black background, Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the ring stroke width must stay 10 or less, see CONNECTIONS.md C31; the fixed width digits must stay, see C32); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```
with this whole line:
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Plain black background, Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```

**7d.** Replace this whole line (the `AB:TIMER.TESTS` row):
```
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, and the choice of screen in the signed-in stub. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/SignedInStub.test.tsx` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29 and C33 |
```
with these three lines (three table rows, one after the other, no empty line between them):
```markdown
| `AB:TIMER.BALL-LOOK` | The look of the glowing ball as pure functions: the colour steps (they follow the quality of the session), the palettes, the blending of two colours, how many dust grains for a phone | `src/lib/ballLook.ts` | the colours of the palettes (BALL_PALETTES; every colour must be bright and vivid, the tests check it), how long a colour step takes (BALL_BLEND_MS), the dust grains per lite level, the fade time (BALL_FADE_MS, tied to the css, see CONNECTIONS.md C35); the steps are tied to the quality names, see CONNECTIONS.md C34 |
| `AB:TIMER.BALL` | The glowing ball behind the big clock: it lights when a session starts, changes colour as the session gets deeper, stands still and dims when paused, and fades when the session ends; it draws nothing when the browser has no WebGL 2. The library ball is `src/components/CrystalizedBall.tsx` | `src/components/TimerBall.tsx`, `src/timer.css` | the settings given to the ball (preset, size, interactive, dust grains) in TimerBall.tsx; the box of the ball, its dimming when paused and its fade time in the css (see CONNECTIONS.md C31 and C35) |
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, the glowing ball and its look, and the choice of screen in the signed-in stub. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/TimerBall.test.tsx`, `src/components/SignedInStub.test.tsx`, `src/lib/ballLook.test.ts` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29, C33, C34 and C35 |
```

**7e.** Find this whole line (it must be found EXACTLY ONCE):
```
| Staggered Menu (the menu) | `src/components/StaggeredMenu.tsx` | `AB:MENU.PANEL` |
```
KEEP it. Directly BELOW it add this one line:
```
| CrystalizedBall (the glowing ball of the Pro Timer) | `src/components/CrystalizedBall.tsx` | `AB:TIMER.BALL` |
```

## STEP 8: Edit `CONNECTIONS.md`
Two changes. Change nothing else in the file.

**8a.** Replace the entry C31. Find this line (EXACTLY ONCE):
```
### C31: The ring is drawn in a box of 100 by 100, so its stroke width in the css must stay 10 or less
```
and this line (EXACTLY ONCE):
```
### C32: The clock digits use Space Grotesk with fixed width digits, loaded from the font package
```
The first one must come before the second. The block from the C31 line down to the line directly above the C32 line must be 12 lines long (it ends with one empty line). If it is not: **STOP** and report. Delete that whole block (the C31 line and every line below it, up to but NOT including the C32 line). In the same place insert exactly this block, followed by one empty line (so that there is an empty line before the C32 line):
```markdown
### C31: The ball sits in a box larger than the dial, so the screen clips it, the ball never catches a tap and the buttons stay above it
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.BALL`
- If you change: the size of the box of the ball (.ab-timer-ball in timer.css), the part of that box the ball fills (size in TimerBall.tsx), the overflow of .ab-timer, the pointer-events of the ball box, the position and z-index of the line under the dial, the Try again button and the buttons, or the place of TimerBall in TimerScreen.tsx
- Then also: the box of the ball is 136 percent of the dial, so the glow has room, and the ball fills 66 percent of the box (size 0.66), so the ball is about 90 percent of the dial. Because the box reaches past the dial, three things must stay. (1) .ab-timer clips what reaches past its edge (overflow hidden), otherwise a phone scrolls sideways. (2) The ball box has pointer-events none, otherwise it can catch taps meant for the buttons. (3) The line, the Try again button and the buttons have position relative and z-index 1, so the ball is drawn under them. The ball is the first thing inside .ab-timer-dial and the two clocks come after it, so the digits are drawn over the ball. The box size and the share of the ball are safe to tune alone (the ball only gets bigger or smaller) and are not pinned. Tests in TimerBall.test.tsx and TimerScreen.test.tsx read timer.css and fail when one of the three is removed.
- If you forget: the phone scrolls sideways, the buttons stop reacting under the ball, or the digits are hidden behind it.
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = overflow: hidden;`
- Anchor: `AB:TIMER.BALL @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = <div className="ab-timer-ball" data-out={active ? undefined : "yes"} aria-hidden="true">`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TimerBall`
- Check by hand: look at the timer on the phone while a session runs: the ball is round and fully inside the screen, the page does not scroll sideways, and Pause and the Hold Button react to a finger at the lower edge of the ball.
```

**8b.** Add two new entries, C34 and C35. Find the line `## Things to know (no check is possible)`. KEEP that line. Directly ABOVE it add exactly this block, followed by one empty line:
```markdown
### C34: The colour steps of the ball are the quality names of the maths, and every palette has three colours
- Tags: `AB:TIMER.BALL-LOOK`, `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: the quality names or the function qualityOf in timerMaths.ts, the list STEPS in ballLook.ts, the number of colours of a palette, or the cut-offs of the quality (C27)
- Then also: the ball has no cut-offs of its own. ballStep asks qualityOf and turns the answer (meh, solid, deep, flow) into a step with the list STEPS, so the colour moves on at the same seconds as the quality of the session (10, 30 and 90 minutes today). If a quality is renamed or added, STEPS and the palettes change in the same step: a palette has three colours, the colour of solid, of deep and of flow, and white is the colour of meh. The colours of the palettes are safe to tune alone (a test checks that every colour is bright and vivid on black). The palette of a session is drawn from the started_at text of the session, so every device shows the same colours for the same session. The same palette can come up in two sessions in a row (the draw is by the start time, not by the last session): this is on purpose, because a draw that remembers the last session could not be the same on the phone and the laptop.
- If you forget: the ball changes colour at another time than the quality changes, or a colour is missing.
- Anchor: `src/lib/ballLook.ts = import { qualityOf, type Quality } from "@/lib/timerMaths"`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = const STEPS: readonly Quality[] = ["meh", "solid", "deep", "flow"]`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return STEPS.indexOf(qualityOf(seconds)) as 0 | 1 | 2 | 3`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = return BALL_PALETTES[ballPaletteIndex(seed)][step - 1]`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export type Quality = "meh" | "solid" | "deep" | "flow"`
- Anchor: `AB:TIMER.TESTS @ src/lib/ballLook.test.ts = expect(ballStep(SOLID_FROM_SECONDS)).toBe(1)`
- Check by hand: after a change of the qualities (names or number), look at the ball in a session of 5, 15, 45 and 100 minutes: each step has its own colour.

### C35: The ball needs WebGL 2 and is a library file, so it must never break the screen; its fade time is written in the code and in the css
- Tags: `AB:TIMER.BALL`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.TESTS`
- If you change: canDrawBall or BallGuard in TimerBall.tsx, the library file CrystalizedBall.tsx (never edit it), the settings the ball is given (preset, color, size, particleCount, intro, interactive, paused), the dust grains in ballLook.ts, BALL_FADE_MS in ballLook.ts, or the fade time of .ab-timer-ball in timer.css
- Then also: the library ball draws with WebGL 2 (the graphics chip, through the browser). A browser that cannot do it gets no ball: canDrawBall asks for a WebGL 2 context first and gives it back, and BallGuard catches an error thrown while the ball is made, so the clocks and the buttons keep working. Both must stay. The settings of the ball are changed only by its props in TimerBall.tsx, never inside the library file (TAGGING_RULES.md, rule 6). A newer copy of the library file must be looked at on the laptop and on the phone before it is trusted: the tests use a stand-in, not the real ball. The number of dust grains follows the lite level (15000, 6000 and 3000 in ballLook.ts): the ball is the heaviest thing on the screen and the screen stays open for hours. The fade in the css (700 ms) and BALL_FADE_MS (700) are the same on purpose, because the code takes the ball away when the fade ends; a test compares them.
- If you forget: a browser without WebGL 2 shows an error or a blank screen, the ball is cut off while it fades, or the phone gets hot.
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = class BallGuard extends Component<{ children: ReactNode }, { failed: boolean }> {`
- Anchor: `AB:TIMER.BALL @ src/components/TimerBall.tsx = <BallGuard>`
- Anchor: `src/components/TimerBall.tsx = import CrystalizedBall from "@/components/CrystalizedBall"`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_FADE_MS = 700`
- Anchor: `AB:TIMER.BALL @ src/timer.css = transition: opacity 700ms ease;`
- Anchor: `AB:TIMER.TESTS @ src/lib/ballLook.test.ts = expect(BALL_FADE_MS).toBe(700)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBall.test.tsx = expect(fade).toBe(BALL_FADE_MS)`
- Check by hand: on the phone open the page address #timer and start a session: the ball lights up, the clocks stay readable, and the phone does not get hot after 10 minutes. In a browser without WebGL 2 the clocks and the buttons still work.
```

## STEP 9: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this one line:
```
- Packet 05C1: a glowing ball (the React Bits Crystalized Ball) sits behind the big clock of the Pro Timer and the hour ring is gone. Start lights the ball in white, it moves on to a colour at 10, 30 and 90 minutes (the quality steps), each session draws one of six palettes, Pause stands it still and dims it, End fades it out. A browser without WebGL 2 shows no ball and the timer still works. The look is in src/lib/ballLook.ts and src/components/TimerBall.tsx, with automated tests.
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 10: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 24 tags, 41 places
CONNECTIONS OK: 35 connections, 179 anchors, 32 classes, 1 css variables, 2 label links
```
(24 tags and 41 places: two new tags, five new places. 35 connections and 179 anchors: C31 is rewritten, C34 and C35 are new. 32 classes: the three ring classes are gone and the ball box class is new. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx` and `src/timer.css`, and it may also list the two files named in the rules (they had changes before this packet). If ANY other tracked file is listed (for example `package.json`): **STOP** and report the COMPLETE output. Do not commit.

## STEP 11: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/lib/ballLook.ts src/lib/ballLook.test.ts src/components/TimerBall.tsx src/components/TimerBall.test.tsx src/components/CrystalizedBall.tsx src/components/TimerScreen.tsx src/timer.css src/components/TimerScreen.test.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05C1: glowing ball behind the Pro Timer clock"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The two files named in the rules and untracked files may still show: leave them alone.

## STEP 12: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (166 anchors), the six files this packet changes had no uncommitted changes, and the three fingerprints of Step 0 matched.
2. The library ball was installed (say whether by the install command or by the fallback), `src/components/CrystalizedBall.tsx` was the only new file, and `package.json` and `package-lock.json` have no changes.
3. The seven fingerprint lines of Step 5 matched exactly.
4. `npm test` printed `Test Files  8 passed (8)` and `Tests  455 passed (455)`, and `npx tsc -b` printed nothing.
5. `node scripts/check-tags.mjs` printed the two lines of Step 10 (35 connections, 179 anchors).
6. `npm run build` finished with no errors.
7. `git show --stat HEAD` lists exactly these 11 files: `src/lib/ballLook.ts`, `src/lib/ballLook.test.ts`, `src/components/TimerBall.tsx`, `src/components/TimerBall.test.tsx`, `src/components/CrystalizedBall.tsx`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
8. The first line of `git log --oneline` ends with `Packet 05C1: glowing ball behind the Pro Timer clock`.
9. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
10. `git push` finished without an error.
11. No file other than the ones named in this packet was created, edited or committed.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 11 done-checks
- the RAW outputs of the 6 commands of Step 0 (and the output of `git diff` of the file if Step 0 stopped)
- the message of the install command, whether the fallback was used, and the RAW outputs of the 2 commands of Step 1, the output of `git diff package.json` if it showed a change, and the library fingerprint line
- the exact seven lines printed in Step 5
- the last 12 lines of the output of `npm test`, and the output of `npx tsc -b` (or the word EMPTY)
- the exact output of `node scripts/check-tags.mjs` from Step 10
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 10
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 11
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.

---

## HOW TO UNDO (not the agent's job)
If the owner does not like the ball: the whole packet is one commit, so one `git revert <hash of the commit of Step 11>` in the planner chat brings the ring back exactly as Packet 05C made it.

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests use a stand-in for the ball (a test browser has no WebGL), so only your eyes can judge the real ball. In the planner's test browser (a PC without a graphics card) the ball drew correctly, the colours moved, the buttons worked through the ball's box and nothing scrolled sideways; but how smooth it is, how hot the phone gets and how it looks on a real screen are NOT known. Look on the laptop AND on the phone:
1. Open the Pro Timer (`#timer`). Idle: black screen, `00:00:00`, a small `00:00:00` under it, a white Start button. NO ball and no ring.
2. Tap Start. The ball ignites in WHITE within about two seconds: a crackling white rim, dust inside. The digits stay readable over it.
3. Laptop: move the mouse over the ball (the dust swirls) and click it (it shakes). Phone: drag a finger across it. Pause, Resume and the Hold button must still react to a finger, also at the lower edge of the ball.
4. Tap Pause: the ball stands still and gets dimmer, the digits blink slowly. Resume: the ball moves again.
5. Let a session run past 10 minutes: over about four seconds the ball moves from white to a colour. It moves on again at 30 and at 90 minutes. Each new session may pick another palette. (You do not have to wait for 90 minutes today. Tell me what you saw at 10.)
6. Hold the end button 1.5 seconds: the ball fades out in under a second. Tap Start again: a new white ball ignites.
7. Phone, the big one: leave a session running for 10 minutes with the screen on. Is it smooth? Does the phone get hot? How much battery did it use? If it is too heavy, add `?lite=2` to the page address (fewer grains of dust) and tell me the difference.
8. On the phone the page must not scroll sideways, the ball must be round and not cut off at the screen edge, and nothing may flash or flicker when the colour changes.
Report what does not look right. Do not fix anything by hand.
