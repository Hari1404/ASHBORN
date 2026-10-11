# PACKET 05C2: MOVING BACKGROUND (META BALLS) BEHIND THE WHOLE PRO TIMER SCREEN

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05C1 and after the later change that gave every session its own look of the glowing ball (the "random look"). Step 0 checks that both are in place and that the files this packet replaces are untouched. If not: **STOP**.
- Create or edit ONLY these files: five NEW files (`src/components/MetaBalls.tsx` (the library animation, installed in Step 1), `src/lib/backgroundLook.ts`, `src/components/TimerBackground.tsx`, `src/lib/backgroundLook.test.ts`, `src/components/TimerBackground.test.tsx`), THREE files that are replaced as a whole (`src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`), and three edited files (`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`).
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/MetaBalls.tsx`, `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them. `src/components/TimerBall.tsx` and `src/lib/ballLook.ts` (the glowing ball) are NOT changed by this packet either.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any install other than the one command in Step 1. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 11 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The owner chose the React Bits animation "Meta Balls" (soft blobs that move and melt into each other) as the moving background of the Pro Timer screen, with the settings of his own link (speed 0.5, animation size 27, smoothness 0.141, cursor ball size 4, mouse interaction off, 21 balls). Today the screen behind the clocks is plain black. The glowing ball and everything else that was done before stay exactly as they are. This packet adds the background behind everything. (1) Step 1 installs the library animation. (2) `src/lib/backgroundLook.ts` holds the look of the background as plain values: the white given to the library, the settings of the owner, how many balls for a laptop (21), a phone (10) and the lightest level (none), and the fade time. (3) `src/components/TimerBackground.tsx` draws the background over the whole screen: it fades in when a session starts, takes the colour of the glowing ball at every moment (white at first, then the colours of the session at 10, 30 and 90 minutes, with the same 4 second blend, from the same functions as the ball), dims while the session is paused, fades out when the session ends, and draws nothing in a browser without WebGL 2 or at lite level 2 (the timer still works). The library animation is always given WHITE and never another colour, because it builds its whole drawing again whenever its colour changes; the colour comes from a tint layer laid over it that multiplies the white blobs with the colour. (4) `src/components/TimerScreen.tsx`, `src/timer.css` and `src/components/TimerScreen.test.tsx` are replaced as whole files: the background is the first thing inside the screen, the screen becomes its own stacking box, and everything else is drawn over the background. (5) Two new test files, the map files and `PROGRESS.md` are updated. Nothing else on any screen changes. The database, the buttons, the timer maths and the glowing ball are not touched.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `src/lib/timerMaths.ts`, `src/lib/useTimer.ts`, `src/lib/lite.ts`, `src/lib/ballLook.ts`, `src/components/HoldButton.tsx`, `src/components/CrystalizedBall.tsx`, `src/components/TimerBall.tsx`, `src/components/AppMenu.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`. If any is missing: **STOP** and report which, and say "Packet 05C1 has not been run" if `src/components/TimerBall.tsx` is one of them.

Check that none of the five new files exist: `src/components/MetaBalls.tsx`, `src/lib/backgroundLook.ts`, `src/components/TimerBackground.tsx`, `src/lib/backgroundLook.test.ts`, `src/components/TimerBackground.test.tsx`. If any exists: **STOP** and report which.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05C1 and the random look):
```
TAGS OK: 24 tags, 41 places
CONNECTIONS OK: 36 connections, 187 anchors, 32 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the six files this packet changes (`src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 05C1`. If none does: **STOP** and report the COMPLETE output (Packet 05C1 was not committed).

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
Command 6 must print exactly these three lines (the files exactly as Packet 05C1 made them):
```
src/components/TimerScreen.tsx 082a9e4ee105626634697abc3b637630045b4d7b823100dd53bd7e4f3012640f
src/timer.css c781010bea6f13685574aec90f6967b84809b0325d6e4ba85c7a5a910b501a0b
src/components/TimerScreen.test.tsx 447596c42535583adab92838fb97f4bd6b9a66114bdb8f1248959006167ada73
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Install the library animation
Run:
```
npx shadcn@latest add @react-bits/MetaBalls-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP** and report.
- If it asks whether to overwrite any existing file: answer **no**, then **STOP** and report which file.
- If it says the component or the registry was not found, or it cannot reach the registry (a network error): do NOT stop. Copy the message, then run this fallback command exactly as written (it downloads the same file from the React Bits repository):
```
Invoke-WebRequest -UseBasicParsing -Uri "https://raw.githubusercontent.com/DavidHDev/react-bits/main/src/ts-tailwind/Animations/MetaBalls/MetaBalls.tsx" -OutFile "src/components/MetaBalls.tsx"
```
  and say in your report that the fallback was used. If the fallback also fails: **STOP** and report both messages.
- Any other error: **STOP** and report the COMPLETE output.

Then run these two and copy the RAW output of each:
1. `git status --short`
2. `git diff --stat -- package.json package-lock.json`

The ONLY new file must be `src/components/MetaBalls.tsx`. If the install created any other file or folder, or changed a tracked file other than `package.json` and `package-lock.json`: **STOP** and report the COMPLETE `git status --short`. Do not commit.
If `package.json` or `package-lock.json` shows as changed: copy the output of `git diff package.json`, then run `git checkout -- package.json package-lock.json` (the package `ogl` is already installed, so nothing is lost), then run `git status --short` again and copy its raw output.

Run this ONE command:
```
foreach ($f in @("src/components/MetaBalls.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It should print `src/components/MetaBalls.tsx bf307bcf78f18b8bed5f82ce3ff6810b2a8c8e04c55fc0ccc47f2e4023c7be3e`. If the number is different, do NOT stop: copy the line. (The type check in Step 6 decides whether the file works.)

## STEP 2: Create `src/lib/backgroundLook.ts` and `src/components/TimerBackground.tsx`
Create the file `src/lib/backgroundLook.ts` with exactly this content (everything inside the block below; the first line is an import line and the last line is a comment):
```ts
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
```

Create the file `src/components/TimerBackground.tsx` with exactly this content (everything inside the block below):
```tsx
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
```

## STEP 3: Create the two test files
Create the file `src/lib/backgroundLook.test.ts` with exactly this content (everything inside the block below):
```ts
import { describe, expect, it } from "vitest"
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgBallCount } from "./backgroundLook"

// AB:TIMER.TESTS:START

// Tests of the look of the moving background. Run them with: npm test
// The colours and the colour steps of the background are the ones of the glowing ball (ballLook.ts), they are tested in ballLook.test.ts and TimerBackground.test.tsx.

describe("the colour given to the library", () => {
  it("is white, because the tint layer multiplies it: white times a colour is that colour", () => {
    expect(BG_COLOUR).toBe("#ffffff")
  })
})

describe("the timing of the background", () => {
  it("fades out in 0.7 seconds", () => {
    expect(BG_FADE_MS).toBe(700)
  })
})

describe("the settings of the animation", () => {
  it("are the ones the owner chose on the React Bits page", () => {
    expect(BG_SETTINGS.speed).toBe(0.5)
    expect(BG_SETTINGS.animationSize).toBe(27)
    expect(BG_SETTINGS.hoverSmoothness).toBe(0.141)
    expect(BG_SETTINGS.cursorBallSize).toBe(4)
    expect(BG_SETTINGS.enableMouseInteraction).toBe(false)
  })
})

describe("how many balls the background draws", () => {
  it("is 21 for the full look, 10 for lite level 1 and none for lite level 2", () => {
    expect(bgBallCount(0)).toBe(21)
    expect(bgBallCount(1)).toBe(10)
    expect(bgBallCount(2)).toBe(0)
  })

  it("never gives more balls to a lighter level, and always a whole number the library can take (at most 50)", () => {
    for (const level of [0, 1, 2] as const) {
      expect(Number.isInteger(bgBallCount(level))).toBe(true)
      expect(bgBallCount(level)).toBeGreaterThanOrEqual(0)
      expect(bgBallCount(level)).toBeLessThanOrEqual(50)
    }
    expect(bgBallCount(1)).toBeLessThanOrEqual(bgBallCount(0))
    expect(bgBallCount(2)).toBeLessThanOrEqual(bgBallCount(1))
  })
})
// AB:TIMER.TESTS:END
```

Create the file `src/components/TimerBackground.test.tsx` with exactly this content (everything inside the block below):
```tsx
// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The library files and the lite level are replaced by stand-ins: this file only tests what TimerBackground decides and what it hands to the library.
// A real Meta Balls needs WebGL 2, which the test browser (jsdom) does not have; the test that the real animation draws is the look in a real browser (see the owner's look at the end of the packet).
const state = vi.hoisted(() => ({
  lite: 0 as 0 | 1 | 2,
  props: [] as Record<string, unknown>[],
  ballProps: [] as Record<string, unknown>[],
  mounts: 0,
  unmounts: 0,
  broken: false,
}))

vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return state.lite
  },
}))

vi.mock("@/components/MetaBalls", async () => {
  const { createElement: h, useEffect } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.props.push(props)
      if (state.broken) throw new Error("the animation broke")
      useEffect(() => {
        state.mounts++
        return () => {
          state.unmounts++
        }
      }, [])
      return h("div", { id: "metaballs-stub" })
    },
  }
})

// The glowing ball is replaced too: it is only used to check that the background has the colour of the ball at every moment.
vi.mock("@/components/CrystalizedBall", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.ballProps.push(props)
      return h("canvas", { id: "ball-stub" })
    },
  }
})

import { BG_FADE_MS, BG_SETTINGS } from "@/lib/backgroundLook"
import { BALL_BLEND_MS, BALL_FADE_MS, BALL_PALETTES, BALL_WHITE, ballPaletteIndex } from "@/lib/ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"
import TimerBackground from "./TimerBackground"
import TimerBall from "./TimerBall"

// AB:TIMER.TESTS:START
const timerCss = readFileSync("src/timer.css", "utf8")
const SEED = "2026-10-07T10:00:00.123456+00:00"
const PALETTE = BALL_PALETTES[ballPaletteIndex(SEED)]

type BgProps = { active: boolean; seconds: number; seed: string }

let root: Root | null = null
let container: HTMLElement | null = null
let loseContext = vi.fn()
let canvasMode: "webgl2" | "none" | "throws" = "webgl2"

function mountPoint(): void {
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
}

function show(over: Partial<BgProps> = {}): void {
  const props: BgProps = { active: true, seconds: 0, seed: SEED, ...over }
  mountPoint()
  act(() => root?.render(createElement("div", null, createElement(TimerBackground, props), createElement("p", { id: "after" }, "after"))))
}

// The background and the glowing ball side by side, given the same seconds and the same seed, as the screen does.
function showBoth(over: Partial<BgProps> = {}): void {
  const props: BgProps = { active: true, seconds: 0, seed: SEED, ...over }
  mountPoint()
  act(() =>
    root?.render(
      createElement(
        "div",
        null,
        createElement(TimerBackground, props),
        createElement(TimerBall, { ...props, paused: false }),
      ),
    ),
  )
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
  const found = container?.querySelector<HTMLElement>(".ab-timer-bg") ?? null
  if (found === null) throw new Error("no background box")
  return found
}

function tintHex(): string {
  const tint = container?.querySelector<HTMLElement>(".ab-timer-bg-tint") ?? null
  if (tint === null) throw new Error("no tint layer")
  const raw = tint.style.backgroundColor
  const rgb = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(raw)
  if (rgb === null) return raw
  return "#" + [rgb[1], rgb[2], rgb[3]].map((v) => Number(v).toString(16).padStart(2, "0")).join("")
}

function lastProps(): Record<string, unknown> {
  const last = state.props.at(-1)
  if (last === undefined) throw new Error("the animation was never drawn")
  return last
}

function lastBallColour(): string {
  const last = state.ballProps.at(-1)
  if (last === undefined) throw new Error("the ball was never drawn")
  return String(last.color)
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  state.lite = 0
  state.props = []
  state.ballProps = []
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
  vi.unstubAllGlobals()
})

describe("TimerBackground: when it draws", () => {
  it("draws nothing while there is no session", () => {
    show({ active: false })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
  })

  it("draws the animation and the tint layer in its box while a session runs, hidden from screen readers", () => {
    show({ active: true })
    expect(box().getAttribute("aria-hidden")).toBe("true")
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(has("#metaballs-stub")).toBe(true)
    expect(has(".ab-timer-bg-tint")).toBe(true)
    expect(state.mounts).toBe(1)
  })

  it("puts the tint layer after the animation, so that it is drawn over it", () => {
    show({ active: true })
    const stub = container?.querySelector("#metaballs-stub") ?? null
    const tint = container?.querySelector(".ab-timer-bg-tint") ?? null
    expect(stub).not.toBeNull()
    expect(tint).not.toBeNull()
    expect((stub as Element).compareDocumentPosition(tint as Element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("draws nothing when the browser cannot give WebGL 2, and the rest of the page stays", () => {
    canvasMode = "none"
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })

  it("draws nothing and does not crash when asking for WebGL 2 throws an error", () => {
    canvasMode = "throws"
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has("#after")).toBe(true)
  })

  it("gives its test context back to the browser", () => {
    show({ active: true })
    expect(loseContext).toHaveBeenCalledTimes(1)
  })

  it("draws nothing at lite level 2, where the screen stays plain black", () => {
    state.lite = 2
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })
})

describe("TimerBackground: what it hands to the library", () => {
  it("uses the settings the owner chose, with a plain opaque black behind the blobs", () => {
    show({ active: true })
    const props = lastProps()
    expect(props.speed).toBe(BG_SETTINGS.speed)
    expect(props.animationSize).toBe(27)
    expect(props.hoverSmoothness).toBe(0.141)
    expect(props.cursorBallSize).toBe(4)
    expect(props.enableMouseInteraction).toBe(false)
    expect(props.enableTransparency).toBe(false)
  })

  it("gives the library white for the balls and for the cursor ball, so that the tint layer can colour them", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe("#ffffff")
    expect(lastProps().cursorBallColor).toBe("#ffffff")
  })

  it("draws 21 balls on the laptop and 10 on a phone (lite level 0 and 1)", () => {
    show({ active: true })
    expect(lastProps().ballCount).toBe(21)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(lastProps().ballCount).toBe(10)
  })

  it("lets the blobs move at the chosen speed", () => {
    show({ active: true })
    expect(lastProps().speed).toBe(0.5)
  })

  it("lets the blobs stand still for a person who asked their device for less motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), media: query }))
    show({ active: true })
    expect(lastProps().speed).toBe(0)
  })

  it("never gives the library another colour or another setting while the colour moves, and does not make it again", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    show({ active: true, seconds: FLOW_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    const written = new Set(state.props.map((p) => JSON.stringify(p)))
    expect(written.size).toBe(1)
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
  })

  it("does not draw the library part again while the colour moves (only the tint layer changes)", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const before = state.props.length
    wait(BALL_BLEND_MS)
    expect(state.props.length).toBe(before)
  })
})

describe("TimerBackground: the colour of the tint layer", () => {
  it("is white at the start of a session", () => {
    show({ active: true, seconds: 0 })
    expect(tintHex()).toBe(BALL_WHITE)
  })

  it("shows the right colour at once when the page is opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    expect(state.mounts).toBe(1)
  })

  it("stays white until the solid cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    wait(5000)
    expect(tintHex()).toBe(BALL_WHITE)
  })

  it("moves from white to the first colour of the palette in exactly BALL_BLEND_MS, not at once", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    expect(tintHex()).toBe(BALL_WHITE)
    wait(BALL_BLEND_MS / 2)
    const half = tintHex()
    expect(half).not.toBe(BALL_WHITE)
    expect(half).not.toBe(PALETTE[0])
    const from = channels(BALL_WHITE)
    const to = channels(PALETTE[0])
    channels(half).forEach((value, i) => {
      expect(value).toBeGreaterThanOrEqual(Math.min(from[i], to[i]))
      expect(value).toBeLessThanOrEqual(Math.max(from[i], to[i]))
    })
    wait(BALL_BLEND_MS / 2 - 100)
    expect(tintHex()).not.toBe(PALETTE[0])
    wait(100)
    expect(tintHex()).toBe(PALETTE[0])
    wait(3000)
    expect(tintHex()).toBe(PALETTE[0])
  })

  it("comes steadily closer to the new colour while it moves", () => {
    const away = (hex: string): number => {
      const a = channels(hex)
      const b = channels(PALETTE[0])
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const seen: number[] = [away(tintHex())]
    for (let i = 0; i < 4; i++) {
      wait(BALL_BLEND_MS / 4)
      seen.push(away(tintHex()))
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeLessThan(seen[i - 1])
    expect(seen.at(-1)).toBe(0)
  })

  it("goes on from the first colour to the second at the deep cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[0])
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BALL_BLEND_MS)
    expect(tintHex()).toBe(PALETTE[1])
  })

  it("leaves no timer behind when the screen goes away in the middle of a colour step", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(500)
    dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("TimerBackground: lighting and fading", () => {
  it("fades out for BG_FADE_MS when the session ends, and is then taken away", () => {
    show({ active: true, seconds: 100 })
    show({ active: false, seconds: 0, seed: "" })
    expect(box().getAttribute("data-out")).toBe("yes")
    wait(BG_FADE_MS - 100)
    expect(has(".ab-timer-bg")).toBe(true)
    wait(100)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.unmounts).toBe(1)
  })

  it("keeps its colour while it fades, and does not start to move towards white", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS - 100)
    expect(tintHex()).toBe(PALETTE[1])
  })

  it("does not turn back towards white while it fades after a colour step was on its way: it goes on to the colour it was moving to", () => {
    const away = (hex: string): number => {
      const a = channels(hex)
      const b = channels(PALETTE[0])
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
    }
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(1000)
    show({ active: false, seconds: 0, seed: "" })
    let before = away(tintHex())
    expect(before).toBeGreaterThan(0)
    for (let i = 0; i < 4; i++) {
      wait(150)
      const now = away(tintHex())
      expect(now).toBeLessThan(before)
      before = now
    }
  })

  it("lights a new background for every new session", () => {
    show({ active: true })
    show({ active: false, seed: "" })
    wait(BG_FADE_MS)
    expect(state.mounts).toBe(1)
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("lights a new background when a session starts while the old one is still fading", () => {
    show({ active: true })
    show({ active: false, seed: "" })
    wait(300)
    show({ active: true })
    wait(BG_FADE_MS * 2)
    expect(state.mounts).toBe(2)
    expect(box().hasAttribute("data-out")).toBe(false)
  })

  it("lights a new background when the seed changes while a session is shown, and it starts white", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    show({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(state.mounts).toBe(2)
    expect(tintHex()).toBe(BALL_WHITE)
  })

  it("does not light a new background when only the seed text is gone for a moment of a running session", () => {
    show({ active: true, seconds: 100 })
    show({ active: true, seconds: 101, seed: "" })
    expect(state.mounts).toBe(1)
  })

  it("starts a new session white, also after a long one", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS)
    show({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(tintHex()).toBe(BALL_WHITE)
  })
})

describe("TimerBackground: when the library breaks", () => {
  it("leaves the background out and keeps the rest of the page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    state.broken = true
    show({ active: true })
    expect(has("#metaballs-stub")).toBe(false)
    expect(has(".ab-timer-bg-tint")).toBe(false)
    expect(has("#after")).toBe(true)
    quiet.mockRestore()
  })
})

describe("TimerBackground: the same colour as the glowing ball", () => {
  it("has the colour of the ball at every moment of a long session, also in the middle of every colour step", () => {
    showBoth({ active: true, seconds: 0 })
    expect(tintHex()).toBe(lastBallColour())
    for (const seconds of [0, SOLID_FROM_SECONDS - 1, SOLID_FROM_SECONDS, SOLID_FROM_SECONDS + 30, DEEP_FROM_SECONDS - 1, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS - 1, FLOW_FROM_SECONDS, FLOW_FROM_SECONDS * 2]) {
      showBoth({ active: true, seconds })
      expect(tintHex()).toBe(lastBallColour())
      for (let i = 0; i < 18; i++) {
        wait(250)
        expect(tintHex()).toBe(lastBallColour())
      }
    }
    expect(tintHex()).toBe(PALETTE[2])
  })

  it("has the colour of the ball when the page is opened in the middle of a session", () => {
    showBoth({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(tintHex()).toBe(PALETTE[1])
    expect(lastBallColour()).toBe(PALETTE[1])
  })

  it("starts white together with a new ball for the next session, also after a long one", () => {
    showBoth({ active: true, seconds: FLOW_FROM_SECONDS + 5 })
    showBoth({ active: false, seconds: 0, seed: "" })
    wait(Math.max(BG_FADE_MS, BALL_FADE_MS))
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has(".ab-timer-ball")).toBe(false)
    showBoth({ active: true, seconds: 0, seed: "2026-10-08T07:00:00.000001+00:00" })
    expect(tintHex()).toBe(BALL_WHITE)
    expect(lastBallColour()).toBe(BALL_WHITE)
    for (let i = 0; i < 4; i++) {
      wait(500)
      expect(tintHex()).toBe(lastBallColour())
    }
  })
})

describe("the css of the background", () => {
  const block = (selector: string): string => {
    const start = timerCss.indexOf(selector + " {")
    if (start < 0) return ""
    return timerCss.slice(start, timerCss.indexOf("}", start))
  }

  it("is a box over the whole screen, at the very bottom, clipped, that never catches a tap", () => {
    const bg = block(".ab-timer-bg")
    expect(bg).toContain("position: absolute;")
    expect(bg).toContain("inset: 0;")
    expect(bg).toContain("z-index: 0;")
    expect(bg).toContain("overflow: hidden;")
    expect(bg).toContain("isolation: isolate;")
    expect(bg).toContain("pointer-events: none;")
  })

  it("fades for as long as the code waits before it takes the background away", () => {
    const bg = block(".ab-timer-bg")
    const fade = Number(/transition:\s*opacity\s+([0-9]+)ms/.exec(bg)?.[1])
    expect(fade).toBe(BG_FADE_MS)
    expect(block('.ab-timer-bg[data-out="yes"]')).toContain("opacity: 0;")
  })

  it("is dimmed, so that the white digits stay easy to read, and dimmer still while the session is paused", () => {
    const opacity = Number(/opacity:\s*([0-9.]+);/.exec(block(".ab-timer-bg"))?.[1])
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(1)
    const paused = Number(/opacity:\s*([0-9.]+);/.exec(block('.ab-timer[data-state="paused"] .ab-timer-bg'))?.[1])
    expect(paused).toBeGreaterThan(0)
    expect(paused).toBeLessThan(opacity)
  })

  it("fades in with a short animation that stands still for a person who asked for less motion", () => {
    expect(block(".ab-timer-bg")).toMatch(/animation:\s*ab-timer-bg-in\s+[0-9]+ms/)
    expect(timerCss).toContain("@keyframes ab-timer-bg-in {")
    const quiet = timerCss.slice(timerCss.lastIndexOf("@media (prefers-reduced-motion: reduce)"))
    expect(quiet).toContain(".ab-timer-bg {")
    expect(quiet).toContain("animation: none;")
  })

  it("has a tint layer that multiplies the white blobs with its colour, over the whole box", () => {
    const tint = block(".ab-timer-bg-tint")
    expect(tint).toContain("mix-blend-mode: multiply;")
    expect(tint).toContain("position: absolute;")
    expect(tint).toContain("inset: 0;")
  })

  it("lets the canvas of the library fill its place without a gap under it", () => {
    expect(block(".ab-timer-bg canvas")).toContain("display: block;")
  })

  it("lives in a screen that is its own stacking box, with the dial drawn above the background", () => {
    const screen = block(".ab-timer")
    expect(screen).toContain("position: relative;")
    expect(screen).toContain("isolation: isolate;")
    expect(screen).toContain("overflow: hidden;")
    expect(block(".ab-timer-dial")).toContain("z-index: 1;")
  })

  it("keeps the line, the Try again button and the buttons above the background", () => {
    for (const selector of [".ab-timer-note", ".ab-timer-retry", ".ab-timer-actions"]) {
      expect(block(selector)).toContain("position: relative;")
      expect(block(selector)).toContain("z-index: 1;")
    }
  })

  it("gives the line under the dial a dark shadow, so that it can be read over a bright blob", () => {
    expect(block(".ab-timer-note")).toContain("text-shadow:")
  })
})
// AB:TIMER.TESTS:END
```

## STEP 4: Replace three files as a whole
Each of the three files below already exists. Replace its ENTIRE content with the block below it: delete everything that is in the file and put exactly the block in its place.

Replace the ENTIRE content of the file `src/components/TimerScreen.tsx` with exactly this content (everything inside the block below):
```tsx
import HoldButton from "@/components/HoldButton"
import TimerBackground from "@/components/TimerBackground"
import TimerBall from "@/components/TimerBall"
import { formatClock, qualityOf } from "@/lib/timerMaths"
import { useTimer, type EndNotice } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.SCREEN:START
// The Pro Timer screen. It is shown at the page address #timer (SignedInStub.tsx chooses it, see CONNECTIONS.md C30).
// Big clock: the seconds of the running session. Small clock under it: the total of the day, saved sessions plus the running one.
// Behind the big clock sits the glowing ball (TimerBall.tsx). It lights when a session starts, changes colour as the session gets deeper, stops and dims when paused, and fades when the session ends.
// Behind everything, over the whole screen, sits the moving background (TimerBackground.tsx, the Meta Balls animation). It is the first thing inside the main element, it has the same colour as the ball at every moment, and the screen is black without a session (see CONNECTIONS.md C37 and C38).
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
      <TimerBackground active={timer.status !== "idle"} seconds={timer.seconds} seed={timer.ringSeed} />
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
/* The screen: black, with the moving background (TimerBackground.tsx) behind everything while a session runs. The menu button (menu.css) floats above it, so the top has room for it. The screen is its own stacking box (position and isolation), so the background, which sits at the bottom of it, can never fall behind the page. */
.ab-timer {
  position: relative;
  isolation: isolate;
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

/* The dial: a square box. The ball (TimerBall.tsx) sits behind the two clocks in the middle. It is drawn above the background (z-index 1). */
.ab-timer-dial {
  position: relative;
  z-index: 1;
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
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.85), 0 0 3px rgba(0, 0, 0, 0.7);
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

/* AB:TIMER.BG:START */
/* The moving background (TimerBackground.tsx): it fills the whole screen, sits at the very bottom, is dimmed so that the white digits stay easy to read, and never catches a tap. It fades in when a session starts and out when it ends. The fade time is the same as BG_FADE_MS in backgroundLook.ts (CONNECTIONS.md C38). */
.ab-timer-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.5;
  transition: opacity 700ms ease;
  animation: ab-timer-bg-in 700ms ease;
}

.ab-timer-bg canvas {
  display: block;
}

.ab-timer-bg[data-out="yes"] {
  opacity: 0;
}

.ab-timer[data-state="paused"] .ab-timer-bg {
  opacity: 0.2;
}

/* The tint layer over the library's white blobs: white times a colour is that colour, black stays black (CONNECTIONS.md C37). The colour is set by TimerBackground.tsx on this layer. */
.ab-timer-bg-tint {
  position: absolute;
  inset: 0;
  mix-blend-mode: multiply;
}

@keyframes ab-timer-bg-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab-timer-bg {
    animation: none;
  }
}
/* AB:TIMER.BG:END */
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

// The moving background is replaced by a stand-in too, in the same way (it is tested in TimerBackground.test.tsx).
const background = vi.hoisted(() => ({ props: [] as Record<string, unknown>[] }))
vi.mock("@/components/TimerBackground", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      background.props.push(props)
      return h("div", { id: "background-stub" })
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
  background.props = []
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

describe("TimerScreen: the background", () => {
  const lastBackground = (): Record<string, unknown> => {
    const last = background.props.at(-1)
    if (last === undefined) throw new Error("the background was not drawn")
    return last
  }

  it("tells the background that no session is running when idle", () => {
    show({ status: "idle", seconds: 0 })
    expect(lastBackground().active).toBe(false)
  })

  it("hands the seconds and the seed of a running session to the background, and nothing else", () => {
    show({ status: "running", seconds: 3725, ringSeed: SEED })
    expect(lastBackground()).toEqual({ active: true, seconds: 3725, seed: SEED })
  })

  it("keeps the background lit while the session is paused", () => {
    show({ status: "paused", seconds: 1800, ringSeed: SEED })
    expect(lastBackground()).toEqual({ active: true, seconds: 1800, seed: SEED })
  })

  it("puts the background first inside the screen, before the dial, so that everything else is drawn over it", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const stub = q("#background-stub")
    expect(stub.parentElement?.classList.contains("ab-timer")).toBe(true)
    expect(stub.parentElement?.firstElementChild).toBe(stub)
    expect(stub.compareDocumentPosition(q(".ab-timer-dial")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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
foreach ($f in @("src/lib/backgroundLook.ts","src/components/TimerBackground.tsx","src/lib/backgroundLook.test.ts","src/components/TimerBackground.test.tsx","src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these seven lines:
```
src/lib/backgroundLook.ts 39716995107d5cd3a31cb4330f7555a40334425973e9274f61a94c4e99348d4a
src/components/TimerBackground.tsx 25eee7899553bd5e1104f0f81a03cbb3e8b5e0a827d3dfc97a33137433058e0b
src/lib/backgroundLook.test.ts 138ebfc42a06b31b0fd28e32a99a09a99b7c570fea989ec76f2dd7205ce83aa4
src/components/TimerBackground.test.tsx 71d7d2fdc573074fb17d1d44ef16ebfd70cc5a4120ed836056320604960d0456
src/components/TimerScreen.tsx ac86ae56b18a0b247b48e2b1653ae48e077c0dcf032f8f6ada8d2cff0145ab78
src/timer.css 3cc616d9e685556541dea9b19f6561ea45c191993dceae35174df409c039de1b
src/components/TimerScreen.test.tsx 880a9e02da329f600fa7880c46fa28c65940737251b50dfa3f31a34d14404187
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/lib/backgroundLook.ts 29, src/components/TimerBackground.tsx 138, src/lib/backgroundLook.test.ts 48, src/components/TimerBackground.test.tsx 568, src/components/TimerScreen.tsx 92, src/timer.css 223, src/components/TimerScreen.test.tsx 376.)

## STEP 6: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  10 passed (10)` and a line `Tests  529 passed (529)`. It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 7: Edit `CODE_MAP.md`
Four changes. Change nothing else in the file.

**7a.** Replace this whole line (in the "Page codes" table):
```
| TIMER | Pro Timer: the maths, the database calls, the live state, the screen (page address #timer) with its glowing ball, and their tests are built; the stop alert and the messages are not built yet |
```
with this whole line:
```
| TIMER | Pro Timer: the maths, the database calls, the live state, the screen (page address #timer) with its glowing ball and its moving background, and their tests are built; the stop alert and the messages are not built yet |
```

**7b.** Replace this whole line (the `AB:TIMER.SCREEN` row):
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Plain black background, Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```
with this whole line:
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Black background (the moving background behind everything has its own row below), Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32; the screen must stay its own stacking box with the background at its bottom, see C38); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```

**7c.** Replace this whole line (the `AB:TIMER.TESTS` row):
```
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, the glowing ball and its look, and the choice of screen in the signed-in stub. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/TimerBall.test.tsx`, `src/components/SignedInStub.test.tsx`, `src/lib/ballLook.test.ts` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29, C33, C34 and C35 |
```
with these three lines (three table rows, one after the other, no empty line between them):
```markdown
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values: the white given to the library, the animation settings the owner chose, how many balls for a laptop, a phone and the lightest level (none), the fade time | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the balls per lite level; the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the white (BG_COLOUR) must stay white, see CONNECTIONS.md C37 |
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Meta Balls animation): black without a session; it fades in when a session starts, has the colour of the glowing ball at every moment (white at first, then the colours of the session), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 and at lite level 2. The library animation is `src/components/MetaBalls.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the dimming (opacity), the dimming when paused and the fade time in the css (see CONNECTIONS.md C37 and C38); the colour comes from the functions of the ball, see C37 |
| `AB:TIMER.TESTS` | The automated tests of the Pro Timer: the maths, the database calls, the live state, the screen, the glowing ball and its look, the moving background and its look, and the choice of screen in the signed-in stub. Run them with npm test | `src/lib/timerMaths.test.ts`, `src/lib/timerApi.test.ts`, `src/lib/useTimer.test.ts`, `src/lib/useTimer.hook.test.ts`, `src/components/TimerScreen.test.tsx`, `src/components/TimerBall.test.tsx`, `src/components/SignedInStub.test.tsx`, `src/lib/ballLook.test.ts`, `src/components/TimerBackground.test.tsx`, `src/lib/backgroundLook.test.ts` | add tests; the numbers and names written in them must match the code, see CONNECTIONS.md C27, C28, C29, C33, C34, C35, C37 and C38 |
```

**7d.** Find this whole line (it must be found EXACTLY ONCE):
```
| CrystalizedBall (the glowing ball of the Pro Timer) | `src/components/CrystalizedBall.tsx` | `AB:TIMER.BALL` |
```
KEEP it. Directly BELOW it add this one line:
```
| MetaBalls (the moving background of the Pro Timer) | `src/components/MetaBalls.tsx` | `AB:TIMER.BG` |
```

## STEP 8: Edit `CONNECTIONS.md`
One change. Change nothing else in the file.

Add two new entries, C37 and C38. Find the line `## Things to know (no check is possible)` (it must be found EXACTLY ONCE). KEEP that line. Directly ABOVE it add exactly this block, followed by one empty line:
```markdown
### C37: The moving background is white blobs from the library with a tint layer over them, and the tint has the colour of the glowing ball
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.TESTS`
- If you change: the colour given to the library animation (BG_COLOUR, and cursorBallColor in TimerBackground.tsx), the tint layer (the class ab-timer-bg-tint and its mix-blend-mode in timer.css), the functions or the time the tint uses to get its colour (ballTargetColour, blendHex, BALL_BLEND_MS), or the colour steps and palettes of the ball (C34)
- Then also: the library animation (Meta Balls) draws white blobs on black. It builds its whole drawing again (the graphics context and all balls) whenever its colour setting changes, so it is given white once and never another colour. The colour comes from a tint layer laid over it: the layer has the colour of the session and multiplies the white blobs (white times a colour is that colour, black stays black). This works only while (1) the library colour AND the cursor ball colour stay white (BG_COLOUR), (2) the tint layer comes after the library in TimerBackground.tsx, (3) the tint layer has mix-blend-mode multiply and covers the whole box, (4) the box is isolated (isolation isolate), so that the multiply meets only the blobs. The tint gets its colour from ballTargetColour and blendHex of ballLook.ts and moves on in BALL_BLEND_MS, exactly as the ball does (TimerBall.tsx), so the ball and the background have the same colour at every moment while a session runs or is paused; a test puts both side by side and compares them. It starts white, and the steps are the quality steps (C34): a new step or palette in ballLook.ts reaches the background by itself. While the background fades out its colour is held, the ball's is not (it fades for the same short time and nobody can see the difference). The animation settings and the number of balls (backgroundLook.ts) are safe to tune alone. So is the dimming (opacity) of the box in timer.css, but the white digits must stay easy to read over the brightest blob.
- If you forget: the background builds its drawing again many times a second (it flickers and the phone gets hot), or it stays white or grey, or its colour is not the colour of the ball.
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_COLOUR = "#ffffff"`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = color={BG_COLOUR}`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = cursorBallColor={BG_COLOUR}`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const target = ballTargetColour(seconds, seed)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const t = Math.min(1, (now - startedAt) / BALL_BLEND_MS)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <Tint target={target} />`
- Anchor: `AB:TIMER.BG @ src/timer.css = mix-blend-mode: multiply;`
- Anchor: `AB:TIMER.BG @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_BLEND_MS = 4000`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_COLOUR).toBe("#ffffff")`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = describe("TimerBackground: the same colour as the glowing ball", () => {`
- Check by hand: start a session on the phone and on the laptop: the background starts white, and at 10, 30 and 90 minutes it moves to the same colour as the glowing ball. The background does not flicker when its colour moves.

### C38: The background needs WebGL 2 and is a library file, so it must never break the screen; it sits at the very bottom of the screen, and its fade time is written in the code and in the css
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: canDrawBackground or BackgroundGuard in TimerBackground.tsx, the library file MetaBalls.tsx (never edit it), BG_FADE_MS or the balls per lite level in backgroundLook.ts, the fade time or the stacking rules of .ab-timer-bg, .ab-timer and .ab-timer-dial in timer.css, or the place of TimerBackground in TimerScreen.tsx
- Then also: the library animation draws with WebGL 2 (the graphics chip, through the browser). A browser that cannot do it, a lite level 2 page (no balls) or an error thrown by the library gives no background: canDrawBackground asks for a WebGL 2 context first and gives it back, and BackgroundGuard catches an error thrown while the animation is made, so the clocks, the ball and the buttons keep working. Both must stay. The settings of the animation are changed only by its props in TimerBackground.tsx and the values in backgroundLook.ts, never inside the library file (TAGGING_RULES.md, rule 6). A newer copy of the library file must be looked at on the laptop and on the phone before it is trusted: the tests use a stand-in, not the real animation. The layers: TimerBackground is the FIRST thing inside the main element of TimerScreen.tsx; .ab-timer-bg is position absolute over the whole screen with z-index 0 and pointer-events none; .ab-timer is position relative with isolation isolate, so the background can never fall behind the page, never covers the menu (the menu sits beside the main element with its own z-index) and never catches a tap; .ab-timer-dial has z-index 1 and the line, the Try again button and the buttons have z-index 1 (C31), so everything is drawn over the background. The library measures its box when it is made and again only when the window is resized, so the box must have its real size when the session starts (the screen has it). The fade in the css (700 ms) and BG_FADE_MS (700) are the same on purpose, because the code takes the background away when the fade ends; a test compares them.
- If you forget: a browser without WebGL 2 shows an error or a blank screen, the background covers the digits or the buttons, it catches taps, it is cut off while it fades, or the phone gets hot.
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <BackgroundGuard>`
- Anchor: `src/components/TimerBackground.tsx = import MetaBalls from "@/components/MetaBalls"`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_FADE_MS = 700`
- Anchor: `AB:TIMER.BG @ src/timer.css = transition: opacity 700ms ease;`
- Anchor: `AB:TIMER.BG @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.BG @ src/timer.css = z-index: 0;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TimerBackground`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_FADE_MS).toBe(700)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(fade).toBe(BG_FADE_MS)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = expect(stub.parentElement?.firstElementChild).toBe(stub)`
- Check by hand: on the phone open the page address #timer and start a session: the background fades in, the clocks stay readable, the buttons react to a finger everywhere, and the phone does not get hot after 10 minutes. In a browser without WebGL 2 the clocks and the buttons still work. With ?lite=2 in the page address the screen stays plain black.
```

## STEP 9: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
Find the line that starts with `- Packet 05C1:` (it must be found EXACTLY ONCE). KEEP it. Directly BELOW it add this one line:
```
- Packet 05C2: a moving background (the React Bits Meta Balls animation) sits behind the whole Pro Timer screen. Without a session the screen is black. Start fades it in, in white, and it takes the colour of the glowing ball at every moment (10, 30 and 90 minutes), Pause dims it, End fades it out. The animation is always drawn white by the library and a tint layer gives it the colour, so it is not built again when the colour moves. A browser without WebGL 2, and lite level 2, show no background and the timer still works. The look is in src/lib/backgroundLook.ts and src/components/TimerBackground.tsx, with automated tests.
```
If that line is not found exactly once: **STOP** and report.

## STEP 10: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 38 connections, 211 anchors, 34 classes, 1 css variables, 2 label links
```
(26 tags and 46 places: two new tags, five new places. 38 connections and 211 anchors: C37 and C38 are new. 34 classes: the background box class and the tint layer class are new. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

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
git add src/lib/backgroundLook.ts src/lib/backgroundLook.test.ts src/components/TimerBackground.tsx src/components/TimerBackground.test.tsx src/components/MetaBalls.tsx src/components/TimerScreen.tsx src/timer.css src/components/TimerScreen.test.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05C2: moving background behind the Pro Timer screen"
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
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (187 anchors), the six files this packet changes had no uncommitted changes, and the three fingerprints of Step 0 matched.
2. The library animation was installed (say whether by the install command or by the fallback), `src/components/MetaBalls.tsx` was the only new file, and `package.json` and `package-lock.json` have no changes.
3. The seven fingerprint lines of Step 5 matched exactly.
4. `npm test` printed `Test Files  10 passed (10)` and `Tests  529 passed (529)`, and `npx tsc -b` printed nothing.
5. `node scripts/check-tags.mjs` printed the two lines of Step 10 (38 connections, 211 anchors).
6. `npm run build` finished with no errors.
7. `git show --stat HEAD` lists exactly these 11 files: `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/MetaBalls.tsx`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
8. The first line of `git log --oneline` ends with `Packet 05C2: moving background behind the Pro Timer screen`.
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
If the owner does not like the background: the whole packet is one commit, so one `git revert <hash of the commit of Step 11>` in the planner chat brings the plain black screen back exactly as it was before this packet. The glowing ball is not touched by it.

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests use stand-ins for the animation and for the ball (a test browser has no WebGL), so only your eyes can judge the real thing. In the planner's test browser (a PC without a graphics card, with software WebGL 2) the real Meta Balls animation and the real glowing ball both drew correctly together, on a phone-sized and on a laptop-sized screen: the blobs had the colour of the ball at every step (15, 45 and 100 minutes), the library animation was NOT built again while the colour moved, every tap went through the background to the buttons, nothing scrolled sideways, Pause dimmed it and Resume brought it back, End faded it out and took it away, and a browser without WebGL 2 and the page address with `?lite=2` showed a plain black screen with working clocks and buttons. How smooth it is, how hot the phone gets and how it looks on a real screen are NOT known. Look on the laptop AND on the phone:
1. Open the Pro Timer (`#timer`). Idle: black screen, `00:00:00`, a small `00:00:00` under it, a white Start button. NO blobs, NO ball.
2. Tap Start. Within about a second soft grey-white blobs fade in behind everything and move slowly and melt into each other; the ball ignites in white in the middle. The digits and the small clock stay readable, also where a blob is right behind them.
3. The blobs move smoothly and nothing flickers. On the laptop the mouse does NOT move them (mouse interaction is off on purpose). Pause, Resume and the Hold button react to a finger or a click everywhere, also where a blob is behind them.
4. Tap Pause: the blobs get dimmer and keep moving, the ball stands still, the digits blink slowly. Resume: the blobs get brighter again.
5. Let a session run past 10 minutes: over about four seconds the blobs and the ball move from white to the SAME colour. It moves on again at 30 and at 90 minutes. The screen must not flash or flicker at the moment the colour changes. (You do not have to wait for 90 minutes today. Tell me what you saw at 10.)
6. Hold the end button 1.5 seconds: the blobs fade out in under a second. Tap Start again: new white blobs and a new white ball.
7. The blobs are dimmed to half (and to a fifth while paused) so that the white digits stay easy to read. If you want them brighter or darker, tell me: it is one number in the css.
8. Phone, the big one: leave a session running for 10 minutes with the screen on. Two animations now draw at the same time. Is it smooth? Does the phone get hot? How much battery did it use? If it is too heavy, add `?lite=2` to the page address (no blobs at all, fewer grains of dust in the ball) and tell me the difference. A phone gets 10 balls instead of 21.
9. On the phone the page must not scroll sideways, and the blobs must fill the whole screen.
Report what does not look right. Do not fix anything by hand.
