# PACKET 05D1: THE PRO TIMER FITS THE WINDOW (THE BUTTONS NEVER FALL BELOW THE BOTTOM EDGE)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05C3 (the two-column Pro Timer). Step 0 checks that it is in place and that the files this packet replaces are untouched. If not: **STOP**.
- Edit ONLY these files: TWO files that are replaced as a whole (`src/timer.css`, `src/components/TimerScreen.test.tsx`) and three edited files (`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`). Create NO new file. `src/components/TimerScreen.tsx` is NOT changed by this packet.
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/MetaBalls.tsx`, `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them. `src/components/TimerBall.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerScreen.tsx` and every file in `src/lib` are NOT changed by this packet either.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any other install. This packet needs none. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 8 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
Today the Pro Timer is one column on a phone and in a narrow or low window, and in that column the dial is a fixed 400 px at most, whatever the height of the window. The line and the buttons stand under the dial, so in a window that is not high enough (a phone held sideways, a laptop window made low, a phone with a big browser toolbar, or the browser zoomed in) Start, Pause and Hold to end session fall below the bottom edge of the window and cannot be pressed without scrolling. This packet fixes that and changes NOTHING in the look of a normal phone or of a laptop at full size. (1) In the one-column screen the dial is now only as high as the window allows: its width is the smallest of 84 percent of the window width, 400 px, and the window height minus the room the other things need (the new css variable `--ab-timer-reserve`), and never below 150 px. While the connection has a problem (a second text line and the Try again button) the reserve is bigger, so the buttons still fit. (2) The clock digits stay a fixed share of the dial (17 and 6 percent of its width, the same share as before) also when the dial is smaller than 400 px. (3) The two-column screen of Packet 05C3 now also starts for any window that is at least 600 px wide and wider than 5 to 4 (a laptop window made low, a phone held sideways), not only from 1000 x 560. Everything else of the two-column rule stays as it is. (4) `src/timer.css` and `src/components/TimerScreen.test.tsx` are replaced as whole files (the test file gets 6 new tests: 1 in the wide-screen part and 5 in a new part), and the three map files are updated (C39 is rewritten, C40 is new). Nothing else on any screen changes. The background, the glowing ball, the timer maths, the database, the buttons themselves and `TimerScreen.tsx` are not touched.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`, `src/components/TimerBackground.tsx`. If any is missing: **STOP** and report which.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05C3):
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 39 connections, 221 anchors, 35 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the five files this packet changes (`src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 05C3`. If none does: **STOP** and report the COMPLETE output (Packet 05C3 was not committed).

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. This ONE command (it prints the fingerprint of each of the three files this packet touches or depends on, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must print exactly these three lines (the files exactly as Packet 05C3 made them):
```
src/components/TimerScreen.tsx 2943330535809db4bd281cd95a725e9ab264fb0ed2e4232feeaa8ceed6c44012
src/timer.css eb04fd3b6094c649537cee02e00c7a25d1b449b712b040eb29cfc392e82d2baf
src/components/TimerScreen.test.tsx e05eda16185b74a8574ffc8147c04df08052801a4ba5f00070cc61c3782320ab
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Replace two files as a whole
Each of the two files below already exists. Replace its ENTIRE content with the block below it: delete everything that is in the file and put exactly the block in its place.

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
  --ab-timer-reserve: 298px;
  overflow: hidden;
  background: #000;
  color: #fff;
  font-family: "Space Grotesk Variable", system-ui, sans-serif;
}

/* The dial: a square box. The ball (TimerBall.tsx) sits behind the two clocks in the middle. It is drawn above the background (z-index 1). */
.ab-timer-dial {
  position: relative;
  z-index: 1;
  width: min(84vw, 400px, max(150px, calc(100dvh - var(--ab-timer-reserve))));
  aspect-ratio: 1;
}

.ab-timer-readout {
  position: absolute;
  inset: 0;
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* The digits: Space Grotesk medium. Its digits are not all the same width by default, so tabular-nums switches on the fixed width ones (checked in the font file at weights 400, 500 and 600). CONNECTIONS.md C32. */
.ab-timer-big {
  margin: 0;
  font-size: min(clamp(2.4rem, 13vw, 4.25rem), 17cqw);
  font-weight: 500;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 22px rgba(0, 0, 0, 0.75), 0 0 6px rgba(0, 0, 0, 0.6);
}

.ab-timer-small {
  margin: 0;
  font-size: min(clamp(1.05rem, 4.6vw, 1.5rem), 6cqw);
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

/* Connection problem: the line has two lines and the Try again button is there, so the dial leaves more room (C40). */
.ab-timer[data-link="problem"] {
  --ab-timer-reserve: 384px;
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

/* The box of the line, the Try again button and the buttons (TimerScreen.tsx). On a phone it is not a box at all (display contents), so the phone screen is one column exactly as before. On a wide screen it is the right-hand side, see below and CONNECTIONS.md C39. */
.ab-timer-side {
  display: contents;
}

/* A wide screen (a laptop, a tablet held wide; a phone held sideways is too small and stays one column): the dial is a big circle on the left, and the line and the buttons stand on the right, in the middle of the screen's height. These rules must stay AFTER the phone rules above, because they replace some of them. They must not change overflow, z-index or pointer-events (CONNECTIONS.md C31). CONNECTIONS.md C39. */
@media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {
  .ab-timer {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 340px;
    grid-template-rows: minmax(0, 1fr);
    align-items: center;
    column-gap: clamp(32px, 5vw, 96px);
    padding: 72px clamp(32px, 6vw, 112px) 48px;
  }

  .ab-timer-dial {
    grid-column: 1;
    justify-self: center;
    width: min(100%, calc(100dvh - 168px), 780px);
  }

  /* The digits grow with the dial: 17 and 6 percent of its width (the readout is a size container, see the phone rules), the same share as on a phone (68 and 24 of 400). */
  .ab-timer-big {
    font-size: 17cqw;
  }

  .ab-timer-small {
    font-size: 6cqw;
  }

  .ab-timer-side {
    grid-column: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
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

describe("TimerScreen: the desktop layout (structure)", () => {
  it("puts the line and the buttons into one box, the right-hand side, directly after the dial and directly inside the screen", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const side = q(".ab-timer-side")
    expect(side.parentElement?.classList.contains("ab-timer")).toBe(true)
    expect(side.previousElementSibling).toBe(q(".ab-timer-dial"))
    expect(side.nextElementSibling).toBeNull()
  })

  it("keeps the line, then the buttons, inside that box, in this order", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const side = q(".ab-timer-side")
    expect(q(".ab-timer-note").parentElement).toBe(side)
    expect(q(".ab-timer-actions").parentElement).toBe(side)
    expect(q(".ab-timer-note").compareDocumentPosition(q(".ab-timer-actions")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("keeps Pause and the Hold Button inside the buttons box inside that box", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const actions = q(".ab-timer-actions")
    expect(q(".ab-timer-pill").parentElement).toBe(actions)
    expect(q(".ab-timer-end").closest(".ab-timer-actions")).toBe(actions)
    expect(q(".ab-timer-end").closest(".ab-timer-side")).toBe(q(".ab-timer-side"))
  })

  it("puts the Try again button between the line and the buttons, inside that box", () => {
    show({ link: "problem", problem: "Something went wrong." })
    const side = q(".ab-timer-side")
    expect(q(".ab-timer-retry").parentElement).toBe(side)
    expect(q(".ab-timer-note").compareDocumentPosition(q(".ab-timer-retry")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(q(".ab-timer-retry").compareDocumentPosition(q(".ab-timer-actions")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it("keeps the box and its two children while loading, so that the layout does not jump", () => {
    show({ link: "loading" })
    const side = q(".ab-timer-side")
    expect(side.contains(q(".ab-timer-note"))).toBe(true)
    expect(side.contains(q(".ab-timer-actions"))).toBe(true)
  })

  it("keeps the dial free of the line and the buttons: only the ball and the two clocks are in it", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const dial = q(".ab-timer-dial")
    expect(dial.contains(q("#ball-stub"))).toBe(true)
    expect(dial.contains(q(".ab-timer-readout"))).toBe(true)
    expect(dial.contains(q(".ab-timer-side"))).toBe(false)
    expect(dial.contains(q(".ab-timer-note"))).toBe(false)
    expect(dial.contains(q(".ab-timer-actions"))).toBe(false)
  })

  it("has the screen's children in the order background, dial, side", () => {
    show({ status: "running", seconds: 100, ringSeed: SEED })
    const kids = Array.from(q(".ab-timer").children)
    expect(kids.map((k) => k.id || k.className)).toEqual(["background-stub", "ab-timer-dial", "ab-timer-side"])
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
describe("the css of the screen: the desktop layout", () => {
  const HEADER = "@media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {"
  const escape = (selector: string): string => selector.replace(/\./g, "\\.")

  // The text between the braces of the wide-screen rule, found by counting braces.
  function wideRules(): string {
    const start = timerCss.indexOf(HEADER)
    if (start < 0) return ""
    let depth = 0
    for (let i = start + HEADER.length - 1; i < timerCss.length; i++) {
      if (timerCss[i] === "{") depth++
      else if (timerCss[i] === "}") {
        depth--
        if (depth === 0) return timerCss.slice(start + HEADER.length, i)
      }
    }
    return ""
  }

  // A rule of the wide-screen block, and a rule of the phone (top level, at the start of a line).
  const wide = (selector: string): string => new RegExp("\\n\\s*" + escape(selector) + " \\{([^}]*)\\}").exec("\n" + wideRules())?.[1] ?? ""
  const phone = (selector: string): string => new RegExp("\\n" + escape(selector) + " \\{([^}]*)\\}").exec("\n" + timerCss)?.[1] ?? ""

  it("has exactly one wide-screen rule: a laptop (1000 px wide and 560 px high) or any window at least 600 px wide and wider than 5 to 4", () => {
    expect(timerCss.split(HEADER).length - 1).toBe(1)
    expect(wideRules()).not.toBe("")
    expect(HEADER).toContain("(min-width: 1000px) and (min-height: 560px)")
    expect(HEADER).toContain("(min-width: 600px) and (min-aspect-ratio: 5/4)")
  })

  it("leaves room for the dial in the narrowest two-column window: at 600 px the dial column is not smaller than the smallest phone dial", () => {
    const columns = /grid-template-columns:\s*minmax\(0, 1fr\)\s+(\d+)px/.exec(wide(".ab-timer"))?.[1]
    const gap = Number(/column-gap:\s*clamp\((\d+)px/.exec(wide(".ab-timer"))?.[1])
    const side = Number(/padding:\s*\d+px clamp\((\d+)px/.exec(wide(".ab-timer"))?.[1])
    const floor = Number(/max\((\d+)px, calc\(100dvh/.exec(phone(".ab-timer-dial"))?.[1])
    const narrowest = Number(/\(min-width: (\d+)px\) and \(min-aspect-ratio/.exec(HEADER)?.[1])
    expect(floor).toBeGreaterThan(0)
    expect(narrowest - Number(columns) - gap - 2 * side).toBeGreaterThanOrEqual(floor)
  })

  it("lies inside the screen's own tagged part of the css", () => {
    // The two marker lines are written in two pieces here, so that the tag checker does not take them for markers of this test file.
    const marker = (edge: string): string => "/* A" + "B:TIMER.SCREEN:" + edge + " */"
    const at = timerCss.indexOf(HEADER)
    expect(timerCss.indexOf(marker("START"))).toBeGreaterThan(-1)
    expect(timerCss.indexOf(marker("START"))).toBeLessThan(at)
    expect(timerCss.indexOf(marker("END"))).toBeGreaterThan(at)
  })

  it("comes AFTER every phone rule it replaces, because it replaces them by being later", () => {
    const at = timerCss.indexOf(HEADER)
    for (const selector of [".ab-timer", ".ab-timer-dial", ".ab-timer-readout", ".ab-timer-big", ".ab-timer-small", ".ab-timer-side"]) {
      const first = timerCss.indexOf("\n" + selector + " {")
      expect(first, selector).toBeGreaterThan(-1)
      expect(first, selector).toBeLessThan(at)
    }
  })

  it("makes the screen two columns, with the dial in the first and the side in the second", () => {
    const screen = wide(".ab-timer")
    expect(screen).toContain("display: grid;")
    expect(screen).toContain("grid-template-columns: minmax(0, 1fr) 340px;")
    expect(wide(".ab-timer-dial")).toContain("grid-column: 1;")
    expect(wide(".ab-timer-side")).toContain("grid-column: 2;")
  })

  it("makes the right-hand column at least as wide as the buttons, so that the buttons are never squeezed", () => {
    const column = Number(/grid-template-columns:\s*minmax\(0, 1fr\)\s+(\d+)px/.exec(wide(".ab-timer"))?.[1])
    const buttons = Number(/max-width:\s*(\d+)px/.exec(phone(".ab-timer-actions"))?.[1])
    expect(buttons).toBeGreaterThan(0)
    expect(column).toBeGreaterThanOrEqual(buttons)
  })

  it("centres the right-hand side as a column in the middle of the height", () => {
    const side = wide(".ab-timer-side")
    expect(side).toContain("display: flex;")
    expect(side).toContain("flex-direction: column;")
    expect(side).toContain("align-items: center;")
    expect(side).toContain("justify-content: center;")
    expect(wide(".ab-timer")).toContain("align-items: center;")
  })

  it("makes the dial a big circle that never grows taller than the screen allows", () => {
    const dial = wide(".ab-timer-dial")
    expect(dial).toContain("width: min(100%, calc(100dvh - 168px), 780px);")
    expect(dial).toContain("justify-self: center;")
    expect(phone(".ab-timer-dial")).toContain("aspect-ratio: 1;")
  })

  it("keeps the phone as it was: one column, and the box of the side is no box at all", () => {
    const screen = phone(".ab-timer")
    expect(screen).toContain("display: flex;")
    expect(screen).toContain("flex-direction: column;")
    expect(phone(".ab-timer-side")).toContain("display: contents;")
  })

  it("lets the digits grow with the dial, with the same share of the dial as on the phone", () => {
    expect(phone(".ab-timer-readout")).toContain("container-type: inline-size;")
    const phoneBig = Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(phone(".ab-timer-big"))?.[1]) * 16
    const phoneSmall = Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(phone(".ab-timer-small"))?.[1]) * 16
    const phoneDial = Number(/min\(\d+vw,\s*(\d+)px,/.exec(phone(".ab-timer-dial"))?.[1])
    const bigShare = Number(/font-size:\s*([\d.]+)cqw;/.exec(wide(".ab-timer-big"))?.[1])
    const smallShare = Number(/font-size:\s*([\d.]+)cqw;/.exec(wide(".ab-timer-small"))?.[1])
    expect(bigShare).toBeCloseTo((phoneBig / phoneDial) * 100, 5)
    expect(smallShare).toBeCloseTo((phoneSmall / phoneDial) * 100, 5)
    // The phone digits are held to the same share, so that they also shrink with a dial that the window height made smaller.
    expect(Number(/,\s*([\d.]+)cqw\)/.exec(phone(".ab-timer-big"))?.[1])).toBe(bigShare)
    expect(Number(/,\s*([\d.]+)cqw\)/.exec(phone(".ab-timer-small"))?.[1])).toBe(smallShare)
  })

  it("never touches what keeps the ball clipped and the buttons tappable (overflow, stacking, pointer events)", () => {
    const all = wideRules()
    for (const word of ["overflow", "z-index", "pointer-events", "position:", "isolation", "mix-blend-mode"]) {
      expect(all, word).not.toContain(word)
    }
  })

  it("leaves the clip, the stacking and the dim of the phone rules in place", () => {
    expect(phone(".ab-timer")).toContain("overflow: hidden;")
    expect(phone(".ab-timer")).toContain("isolation: isolate;")
    expect(phone(".ab-timer-dial")).toContain("z-index: 1;")
    expect(phone(".ab-timer-actions")).toContain("z-index: 1;")
    expect(phone(".ab-timer-note")).toContain("z-index: 1;")
  })
})
describe("the css of the screen: the phone fits the window", () => {
  const block = (selector: string): string => new RegExp("\\n" + selector.replace(/[.[\]="]/g, "\\$&") + " \\{([^}]*)\\}").exec("\n" + timerCss)?.[1] ?? ""
  const px = (text: string, pattern: RegExp): number => Number(pattern.exec(text)?.[1])
  const reserve = (text: string): number => px(text, /--ab-timer-reserve:\s*(\d+)px;/)

  // Everything that stands above and below the dial in the one-column screen, taken from the css itself: the padding, two gaps, the line (one text line) and the buttons box.
  function stack(): number {
    const screen = block(".ab-timer")
    const padding = /padding:\s*(\d+)px \d+px (\d+)px;/.exec(screen)
    const gap = px(screen, /\n\s*gap:\s*(\d+)px;/)
    const line = px(block(".ab-timer-note"), /font-size:\s*(\d+)px;/) * Number(/min-height:\s*([\d.]+)em;/.exec(block(".ab-timer-note"))?.[1])
    const buttons = px(block(".ab-timer-actions"), /min-height:\s*(\d+)px;/)
    return Number(padding?.[1]) + Number(padding?.[2]) + 2 * gap + line + buttons
  }

  it("makes the dial as high as the window allows, but never smaller than 150 px and never bigger than before", () => {
    expect(block(".ab-timer-dial")).toContain("width: min(84vw, 400px, max(150px, calc(100dvh - var(--ab-timer-reserve))));")
    expect(block(".ab-timer-dial")).toContain("aspect-ratio: 1;")
  })

  it("reserves exactly the room the other things need: the reserve is the height of the stack, plus at most 6 px", () => {
    expect(stack()).toBe(297)
    expect(reserve(block(".ab-timer"))).toBeGreaterThanOrEqual(stack())
    expect(reserve(block(".ab-timer"))).toBeLessThanOrEqual(stack() + 6)
  })

  it("reserves more when the connection has a problem: the second text line, the gap and the Try again button", () => {
    const problem = block('.ab-timer[data-link="problem"]')
    const retry = block(".ab-timer-retry")
    const retryHeight = 2 * px(retry, /padding:\s*(\d+)px/) + 2 + px(retry, /font-size:\s*(\d+)px;/) * 1.5
    const extra = px(block(".ab-timer-note"), /font-size:\s*(\d+)px;/) * 1.4 + px(block(".ab-timer"), /\n\s*gap:\s*(\d+)px;/) + retryHeight
    expect(reserve(problem)).toBeGreaterThanOrEqual(reserve(block(".ab-timer")) + Math.floor(extra) - 1)
    expect(reserve(problem)).toBeLessThanOrEqual(stack() + extra + 6)
  })

  it("keeps the problem rule in the screen's part of the css, before the wide-screen rule, and the wide rules never use the reserve", () => {
    const at = timerCss.indexOf('.ab-timer[data-link="problem"] {')
    expect(at).toBeGreaterThan(-1)
    expect(at).toBeLessThan(timerCss.indexOf("@media (min-width: 1000px)"))
    const start = timerCss.indexOf("@media (min-width: 1000px)")
    const wideText = timerCss.slice(start, timerCss.indexOf("/* A" + "B:TIMER.SCREEN:END */"))
    expect(wideText).not.toContain("--ab-timer-reserve")
  })

  it("holds the digits of the phone to a share of the dial, so that they shrink with a dial the window made smaller", () => {
    expect(block(".ab-timer-readout")).toContain("container-type: inline-size;")
    expect(block(".ab-timer-big")).toContain("font-size: min(clamp(2.4rem, 13vw, 4.25rem), 17cqw);")
    expect(block(".ab-timer-small")).toContain("font-size: min(clamp(1.05rem, 4.6vw, 1.5rem), 6cqw);")
  })
})
// AB:TIMER.TESTS:END
```

## STEP 2: Check that the files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these three lines (`TimerScreen.tsx` is the same as before):
```
src/components/TimerScreen.tsx 2943330535809db4bd281cd95a725e9ab264fb0ed2e4232feeaa8ceed6c44012
src/timer.css bf6f7f8a701026efa0a0997f285281b933ecd1d2c28aa9c0fa9821cab887f87b
src/components/TimerScreen.test.tsx 4f8af77e639bda84c19fe40756f8fb4833af3d94ecced759c80525f386e693f0
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/timer.css 271, src/components/TimerScreen.test.tsx 608.)

## STEP 3: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  10 passed (10)` and a line `Tests  553 passed (553)`. It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 4: Edit `CODE_MAP.md`
One change. Change nothing else in the file.

Replace this whole line (the `AB:TIMER.SCREEN` row; it must be found EXACTLY ONCE):
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Black background (the moving background behind everything has its own row below), Space Grotesk digits. On a wide screen (at least 1000 px wide and 560 px high) it is two columns: the dial as a big circle on the left, the line, the Try again button and the buttons on the right; a phone stays one column | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32; the screen must stay its own stacking box with the background at its bottom, see C38; the wide-screen rule must stay after the phone rules and must not touch the clip, the stacking or the taps, see C39); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```
with this whole line:
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Black background (the moving background behind everything has its own row below), Space Grotesk digits. On a wide screen (at least 1000 px wide and 560 px high, or any window at least 600 px wide and wider than 5 to 4) it is two columns: the dial as a big circle on the left, the line, the Try again button and the buttons on the right. Otherwise (a phone, a narrow window) it is one column, and the dial is only as high as the window allows, so that the buttons never fall below the window | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32; the screen must stay its own stacking box with the background at its bottom, see C38; the wide-screen rule must stay after the phone rules and must not touch the clip, the stacking or the taps, see C39; the height of the phone dial and its reserve must match the things around it, see C40); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```

## STEP 5: Edit `CONNECTIONS.md`
One change. Change nothing else in the file.

Replace the entry C39 and add the new entry C40. Find this line (EXACTLY ONCE):
```
### C39: On a wide screen the Pro Timer is two columns (the dial on the left, the line and the buttons on the right), the phone stays one column, and the wide rules must come after the phone rules and must not touch the clip, the stacking or the taps
```
and this line (EXACTLY ONCE):
```
## Things to know (no check is possible)
```
The first one must come before the second. The block from the C39 line down to the line directly above the `## Things to know (no check is possible)` line must be 17 lines long (it ends with one empty line). If it is not: **STOP** and report. Delete that whole block (the C39 line and every line below it, up to but NOT including the `## Things to know (no check is possible)` line). In the same place insert exactly this block, followed by one empty line (so that there is an empty line between the last line of C40 and the `## Things to know (no check is possible)` line):
```markdown
### C39: On a wide screen the Pro Timer is two columns (the dial on the left, the line and the buttons on the right), the phone stays one column, and the wide rules must come after the phone rules and must not touch the clip, the stacking or the taps
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: the box ab-timer-side or the order of the dial and that box in TimerScreen.tsx, the wide-screen rule at the end of the screen part of timer.css (its @media line, the grid, the width of the dial, the digit sizes), the phone rule display contents of ab-timer-side, or the width of the buttons box
- Then also: the phone is one column (ab-timer is a flex column). On a wide screen (at least 1000 px wide AND 560 px high, OR any window at least 600 px wide and wider than 5 to 4, which is a laptop window made low and a phone held sideways) the @media rule turns ab-timer into a grid of two columns: the dial in the first (a big circle, as high as the screen allows, at most 780 px), the box ab-timer-side in the second (340 px, the line, the Try again button and the buttons, in the middle of the height). Four things must stay. (1) The box ab-timer-side is the second child of ab-timer, directly after the dial, and holds the line, the Try again button and the buttons box in this order; it is display contents on the phone (no box, so the phone looks exactly as before) and a flex column in the wide rule. The tags and the rest that come later go into this box. (2) The @media block stays AFTER the phone rules for ab-timer, ab-timer-dial, ab-timer-readout, ab-timer-big, ab-timer-small and ab-timer-side, because it replaces them only by being later. (3) The right-hand column (340 px) is at least as wide as the buttons box (max-width 320 px), and at 600 px wide the dial column is still at least as wide as the smallest phone dial (150 px). (4) The block never sets overflow, z-index, position, pointer-events, isolation or mix-blend-mode, because those belong to C31 and C38. The digits are 17 and 6 percent of the dial width in the wide rule (container query units, the readout is the size container, its container-type is in the phone rule), the same share as on the phone (68 and 24 of 400): change the phone digit sizes and the dial width of the phone and these two numbers must follow (C40). The dial width, the gap and the padding of the wide rule are safe to tune alone. Tests in TimerScreen.test.tsx read the structure and timer.css and fail when one of the four is broken.
- If you forget: on a laptop the buttons fall under the circle again, or the digits are too small or too big for the circle, or the phone changes, or the ball and the background are no longer clipped or the buttons stop reacting.
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <div className="ab-timer-side">`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = @media (min-width: 1000px) and (min-height: 560px), (min-width: 600px) and (min-aspect-ratio: 5/4) {`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = display: contents;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = grid-template-columns: minmax(0, 1fr) 340px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = width: min(100%, calc(100dvh - 168px), 780px);`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = container-type: inline-size;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: 17cqw;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: 6cqw;`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("TimerScreen: the desktop layout (structure)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the screen: the desktop layout", () => {`
- Check by hand: on a laptop (or a browser window at least 1000 px wide and 560 px high) open the page address #timer and start a session: the dial is a big circle on the left, and the line and the buttons stand on the right in the middle of the height, with the digits inside the circle. Make the window lower (about 450 px, still wider than 600 px): it stays two columns, the circle gets smaller and the buttons stay on the screen. Make the window narrower than 600 px, or narrower than 1000 px and nearly square or tall: the screen becomes the phone layout (one column). On the phone nothing has changed.

### C40: The phone dial is only as high as the window allows, and the reserve in the css must be as high as everything else on the screen
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: the width rule of ab-timer-dial (the 150 px floor, the 400 px cap, the reserve), one of the two --ab-timer-reserve lines, the padding or the gap of ab-timer, the min-height of ab-timer-note or ab-timer-actions, the Try again button (its padding or font size), the number of text lines the line can have, or the digit caps of the phone (17cqw and 6cqw)
- Then also: on the phone (one column) the dial is a square whose width is the smallest of 84 percent of the window width, 400 px and the window height minus the reserve (--ab-timer-reserve), and never below 150 px. The reserve is the height of everything else on the screen: top padding 72 + bottom padding 32 + two gaps of 24 + the line (one text line, 1.4 times 15 = 21 px) + the buttons box (124 px) = 297 px, and the reserve is 298 px (1 px for rounding). With a connection problem (the attribute data-link is problem) the line has two text lines and the Try again button is there, which is 21 + 24 + 40.5 more, so the reserve is 384 px. If the reserve is smaller than the real stack, Start, Pause and the Hold Button fall under the bottom edge of the window again; if it is much bigger, the phone dial is smaller than it has to be (the tests allow at most 6 px more than the stack). The reserve is used by the phone dial only. The wide rule has its own height rule (calc(100dvh - 168px)) and never uses it; the tests check both. The digits of the phone are held to 17 and 6 percent of the dial width (the smaller of the old size and that share), so that they shrink with a dial that is smaller than 400 px. Measured limits: a window narrower than 600 px and lower than about 450 px (about 530 px with a connection problem) fits neither layout, so the page scrolls; a message of two text lines without the Try again button (the day ended at midnight) is one text line (21 px) higher than the reserve counts for, so in a low window the buttons stay on the screen but the page scrolls by about 20 px (the empty bottom padding); every further text line pushes the buttons down by one more text line. A window lower than 375 px with a connection problem scrolls by 15 px even in two columns.
- If you forget: on a small phone, or in a low window, the buttons fall under the bottom edge; or the dial is needlessly small; or the digits stick out of a small dial.
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = --ab-timer-reserve: 298px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = --ab-timer-reserve: 384px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = width: min(84vw, 400px, max(150px, calc(100dvh - var(--ab-timer-reserve))));`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: min(clamp(2.4rem, 13vw, 4.25rem), 17cqw);`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: min(clamp(1.05rem, 4.6vw, 1.5rem), 6cqw);`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the screen: the phone fits the window", () => {`
- Check by hand: on the phone open #timer, start a session and look at the whole screen: the dial, the line and the buttons are all on the screen without scrolling (also with the address bar of the browser shown). On the laptop make the browser window low (about 500 px) and narrow (about 700 px wide, so that it stays one column): the dial gets smaller and the buttons stay on the screen. If a line of red text with Try again shows, the dial is a little smaller and Start and Try again are still on the screen.
```

## STEP 6: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
Find the line that starts with `- Packet 05C3:` (it must be found EXACTLY ONCE). KEEP it. Directly BELOW it add this one line:
```
- Packet 05D1: the Pro Timer fits the window. On the phone the dial is only as high as the window allows (never below 150 px), so Start, Pause and the Hold Button never fall below the window; with a connection problem the dial leaves more room for the second text line and Try again. A window at least 600 px wide and wider than 5 to 4 (a laptop window made low, a phone held sideways) now gets the two columns, not only 1000 x 560 and more. The clock digits follow the size of the dial. A normal phone looks the same as before. With automated tests.
```
If that line is not found exactly once: **STOP** and report.

## STEP 7: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 40 connections, 227 anchors, 35 classes, 2 css variables, 2 label links
```
(The tags and places stay the same. 40 connections and 227 anchors: C40 is new with 6 anchors, and C39 has the same number of anchors as before. 2 css variables: `--ab-timer-reserve` is new. 35 classes: no new class. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.test.tsx` and `src/timer.css`, and it may also list the two files named in the rules (they had changes before this packet). If ANY other tracked file is listed (for example `package.json` or `src/components/TimerScreen.tsx`): **STOP** and report the COMPLETE output. Do not commit.

## STEP 8: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/timer.css src/components/TimerScreen.test.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05D1: Pro Timer fits the window, buttons never fall below the bottom edge"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The two files named in the rules and untracked files may still show: leave them alone.

## STEP 9: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0, the five files this packet changes had no uncommitted changes, and the three fingerprints of Step 0 matched.
2. The three fingerprint lines of Step 2 matched exactly.
3. `npm test` printed `Test Files  10 passed (10)` and `Tests  553 passed (553)`, and `npx tsc -b` printed nothing.
4. `node scripts/check-tags.mjs` printed the two lines of Step 7 (40 connections, 227 anchors, 2 css variables).
5. `npm run build` finished with no errors.
6. `git show --stat HEAD` lists exactly these 5 files: `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
7. The first line of `git log --oneline` ends with `Packet 05D1: Pro Timer fits the window, buttons never fall below the bottom edge`.
8. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
9. `git push` finished without an error.
10. No file other than the ones named in this packet was created, edited or committed.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 10 done-checks
- the RAW outputs of the 5 commands of Step 0 (and the output of `git diff` of the file if Step 0 stopped)
- the exact three lines printed in Step 2
- the last 12 lines of the output of `npm test`, and the output of `npx tsc -b` (or the word EMPTY)
- the exact output of `node scripts/check-tags.mjs` from Step 7
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 7
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 8
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.

---

## HOW TO UNDO (not the agent's job)
The whole packet is one commit, so one `git revert <hash of the commit of Step 8>` in the planner chat brings back the Pro Timer exactly as Packet 05C3 left it.

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests read the css; they cannot see pixels. In the planner's test browser (real Chromium, software WebGL 2, the real glowing ball and the real moving background for the pictures, a stand-in for them for the 1350-case size sweep, because the layout does not depend on them) every window size from 320 x 360 to 1920 x 1080 was measured in the states idle, running, paused, a message after a day that ended at midnight, and a connection problem, with the old css and the new css. Before this packet 821 of the 1350 cases had a button below the bottom edge or a page that scrolls; after it 195 have, and every one of those is a low window or the message after a day that ended at midnight (see the known limits at the end). Browser zoom was measured on three model screens (1440 x 800, 1366 x 768 and 1920 x 1080 at 125 percent): before, the buttons fell below the bottom edge from 150 percent zoom (175 percent on the big screen); now everything fits up to 200 percent, and the page scrolls from 250 percent. No window size or zoom that was fine before became worse. Look yourself, on the laptop AND on the phone:
1. Phone, upright (any normal phone): open `#timer` and start a session. Nothing should look different from before: same dial, same digits, Start or Pause and Hold to end session under it, all on the screen, also with the address bar of the browser shown.
2. Phone held sideways: the screen is now two columns (the dial on the left, the buttons on the right) and everything is on the screen. Before this packet the buttons were below the bottom edge.
3. Laptop, browser window wide and high: nothing changed (the two columns of Packet 05C3, the circle as big as before).
4. Laptop, make the browser window LOW (about 450 px high) but keep it wider than 600 px: it stays two columns, the circle gets smaller, the buttons stay on the screen.
5. Laptop, make the window narrow (about 500 px wide) and about 650 px high: one column, the dial is smaller than 400 px, the buttons stay on the screen.
5b. Laptop, browser window as big as the screen: press Ctrl and plus step by step up to 200 percent. Before this packet the buttons fell below the bottom edge from about 150 percent; now the whole screen stays visible up to 200 percent (it is two columns, with a smaller circle). At 250 percent and more it does not fit any more.
6. Cut the internet (or turn on airplane mode) so that the line says the connection has a problem and Try again shows: the dial gets a little smaller and Start, the line and Try again are still all on the screen.
7. Tell me if the two-column rule now starts for windows you did not expect. It starts when the window is at least 600 px wide and wider than 5 to 4 (for example 930 x 700 or 700 x 500). Each of these is one number in the css (the `600px` and the `5/4` in the `@media` line of `timer.css`).
Known limits, measured and not fixed by this packet: a window narrower than 600 px and lower than about 450 px (about 530 px with a connection problem, and about 375 px in two columns with a connection problem) is too small for the whole screen, so the page scrolls; and after a day that ended at midnight the message has two text lines, which makes the page scroll by about 20 px in a low window (the buttons stay on the screen).
