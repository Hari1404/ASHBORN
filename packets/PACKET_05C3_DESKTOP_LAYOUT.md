# PACKET 05C3: PRO TIMER ON A WIDE SCREEN (THE DIAL ON THE LEFT, THE LINE AND THE BUTTONS ON THE RIGHT)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05C2 (the moving background). Step 0 checks that it is in place and that the files this packet replaces are untouched. If not: **STOP**.
- Edit ONLY these files: THREE files that are replaced as a whole (`src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`) and three edited files (`CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`). Create NO new file.
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/MetaBalls.tsx`, `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them. `src/components/TimerBall.tsx`, `src/components/TimerBackground.tsx` and every file in `src/lib` are NOT changed by this packet either.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any other install. This packet needs none. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 8 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
On the phone the Pro Timer is one column: the dial (the big clock with the glowing ball behind it), then the line, then Start or Pause and Hold to end session. On a laptop that looks wrong. This packet changes ONLY the laptop. On a wide screen (at least 1000 px wide AND at least 560 px high; a phone held sideways is too small and stays one column) the dial becomes a big circle on the LEFT, and the line, the Try again button and the buttons (Start, or Pause and Hold to end session) stand on the RIGHT, in the middle of the height. The clock digits grow with the circle. The tags and everything else that comes later will go into the right-hand side; they are NOT part of this packet. (1) `src/components/TimerScreen.tsx` gets one new box, `ab-timer-side`, around the line, the Try again button and the buttons. (2) `src/timer.css` gets that box (it is no box at all on a phone, so the phone looks exactly as before) and one wide-screen rule at the end of the screen part of the file. (3) `src/components/TimerScreen.test.tsx` gets 18 new tests: 7 for the structure and 11 for the css (the order of the rules, the numbers, and that nothing that clips or stacks is touched). (4) The three map files are updated (one new connection, C39). Nothing else on any screen changes. The background, the glowing ball, the timer maths, the database and the buttons themselves are not touched.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/timer.css`, `src/components/TimerBackground.tsx`, `src/lib/backgroundLook.ts`. If any is missing: **STOP** and report which, and say "Packet 05C2 has not been run" if `src/components/TimerBackground.tsx` is one of them.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05C2):
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 38 connections, 211 anchors, 34 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the six files this packet changes (`src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 05C2`. If none does: **STOP** and report the COMPLETE output (Packet 05C2 was not committed).

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. This ONE command (it prints the fingerprint of each of the three files this packet replaces, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must print exactly these three lines (the files exactly as Packet 05C2 made them):
```
src/components/TimerScreen.tsx ac86ae56b18a0b247b48e2b1653ae48e077c0dcf032f8f6ada8d2cff0145ab78
src/timer.css 3cc616d9e685556541dea9b19f6561ea45c191993dceae35174df409c039de1b
src/components/TimerScreen.test.tsx 880a9e02da329f600fa7880c46fa28c65940737251b50dfa3f31a34d14404187
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Replace three files as a whole
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
// On a phone the screen is one column: the dial, then the line, then the buttons. On a wide screen (a laptop) the dial is a big circle on the left and the line and the buttons stand on the right, inside the box ab-timer-side (see CONNECTIONS.md C39). The tags and the rest that come later go into that box too.

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
      <div className="ab-timer-side">
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

/* The box of the line, the Try again button and the buttons (TimerScreen.tsx). On a phone it is not a box at all (display contents), so the phone screen is one column exactly as before. On a wide screen it is the right-hand side, see below and CONNECTIONS.md C39. */
.ab-timer-side {
  display: contents;
}

/* A wide screen (a laptop, a tablet held wide; a phone held sideways is too small and stays one column): the dial is a big circle on the left, and the line and the buttons stand on the right, in the middle of the screen's height. These rules must stay AFTER the phone rules above, because they replace some of them. They must not change overflow, z-index or pointer-events (CONNECTIONS.md C31). CONNECTIONS.md C39. */
@media (min-width: 1000px) and (min-height: 560px) {
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

  /* The readout is a size container, so that the digits grow with the dial: 17 and 6 percent of its width, the same share as on a phone (68 and 24 of 400). */
  .ab-timer-readout {
    container-type: inline-size;
  }

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
  const HEADER = "@media (min-width: 1000px) and (min-height: 560px) {"
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

  it("has exactly one wide-screen rule: from 1000 px wide and 560 px high", () => {
    expect(timerCss.split(HEADER).length - 1).toBe(1)
    expect(wideRules()).not.toBe("")
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
    expect(wide(".ab-timer-readout")).toContain("container-type: inline-size;")
    const phoneBig = Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(phone(".ab-timer-big"))?.[1]) * 16
    const phoneSmall = Number(/clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/.exec(phone(".ab-timer-small"))?.[1]) * 16
    const phoneDial = Number(/min\(\d+vw,\s*(\d+)px\)/.exec(phone(".ab-timer-dial"))?.[1])
    const bigShare = Number(/font-size:\s*([\d.]+)cqw;/.exec(wide(".ab-timer-big"))?.[1])
    const smallShare = Number(/font-size:\s*([\d.]+)cqw;/.exec(wide(".ab-timer-small"))?.[1])
    expect(bigShare).toBeCloseTo((phoneBig / phoneDial) * 100, 5)
    expect(smallShare).toBeCloseTo((phoneSmall / phoneDial) * 100, 5)
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
// AB:TIMER.TESTS:END
```

## STEP 2: Check that the three files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/components/TimerScreen.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these three lines:
```
src/components/TimerScreen.tsx 2943330535809db4bd281cd95a725e9ab264fb0ed2e4232feeaa8ceed6c44012
src/timer.css eb04fd3b6094c649537cee02e00c7a25d1b449b712b040eb29cfc392e82d2baf
src/components/TimerScreen.test.tsx e05eda16185b74a8574ffc8147c04df08052801a4ba5f00070cc61c3782320ab
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/components/TimerScreen.tsx 95, src/timer.css 268, src/components/TimerScreen.test.tsx 543.)

## STEP 3: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  10 passed (10)` and a line `Tests  547 passed (547)`. It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 4: Edit `CODE_MAP.md`
One change. Change nothing else in the file.

Replace this whole line (the `AB:TIMER.SCREEN` row; it must be found EXACTLY ONCE):
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Black background (the moving background behind everything has its own row below), Space Grotesk digits | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32; the screen must stay its own stacking box with the background at its bottom, see C38); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```
with this whole line:
```
| `AB:TIMER.SCREEN` | The Pro Timer screen at the page address #timer: the big clock of the session with the glowing ball behind it (the ball has its own row below), the small clock with the day total, Start, Pause and Resume, End Session (hold the button), the line for No connection and for what happened to the session that was just ended. Black background (the moving background behind everything has its own row below), Space Grotesk digits. On a wide screen (at least 1000 px wide and 560 px high) it is two columns: the dial as a big circle on the left, the line, the Try again button and the buttons on the right; a phone stays one column | `src/components/TimerScreen.tsx`, `src/timer.css` | colours, sizes and spacing in the css (the screen must keep clipping what reaches past its edge and the line and buttons must stay above the ball, see CONNECTIONS.md C31; the fixed width digits must stay, see C32; the screen must stay its own stacking box with the background at its bottom, see C38; the wide-screen rule must stay after the phone rules and must not touch the clip, the stacking or the taps, see C39); the Hold Button settings (holdTime, colours, labels) and the wording of the line under the clock (noticeText) in TimerScreen.tsx |
```

## STEP 5: Edit `CONNECTIONS.md`
One change. Change nothing else in the file.

Add one new entry, C39. Find the line `## Things to know (no check is possible)` (it must be found EXACTLY ONCE). KEEP that line. Directly ABOVE it add exactly this block, followed by one empty line:
```markdown
### C39: On a wide screen the Pro Timer is two columns (the dial on the left, the line and the buttons on the right), the phone stays one column, and the wide rules must come after the phone rules and must not touch the clip, the stacking or the taps
- Tags: `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: the box ab-timer-side or the order of the dial and that box in TimerScreen.tsx, the wide-screen rule at the end of the screen part of timer.css (its @media line, the grid, the width of the dial, the digit sizes), the phone rule display contents of ab-timer-side, or the width of the buttons box
- Then also: the phone is one column (ab-timer is a flex column). On a wide screen (at least 1000 px wide AND 560 px high; a phone held sideways is too small and stays one column) the @media rule turns ab-timer into a grid of two columns: the dial in the first (a big circle, as high as the screen allows, at most 780 px), the box ab-timer-side in the second (340 px, the line, the Try again button and the buttons, in the middle of the height). Four things must stay. (1) The box ab-timer-side is the second child of ab-timer, directly after the dial, and holds the line, the Try again button and the buttons box in this order; it is display contents on the phone (no box, so the phone looks exactly as before) and a flex column in the wide rule. The tags and the rest that come later go into this box. (2) The @media block stays AFTER the phone rules for ab-timer, ab-timer-dial, ab-timer-readout, ab-timer-big, ab-timer-small and ab-timer-side, because it replaces them only by being later. (3) The right-hand column (340 px) is at least as wide as the buttons box (max-width 320 px). (4) The block never sets overflow, z-index, position, pointer-events, isolation or mix-blend-mode, because those belong to C31 and C38. The digits are 17 and 6 percent of the dial width in the wide rule (container query units on the readout), the same share as on the phone (68 and 24 of 400): change the phone digit sizes and the dial width of the phone and these two numbers must follow. The dial width, the gap and the padding of the wide rule are safe to tune alone. Tests in TimerScreen.test.tsx read the structure and timer.css and fail when one of the four is broken.
- If you forget: on a laptop the buttons fall under the circle again, or the digits are too small or too big for the circle, or the phone changes, or the ball and the background are no longer clipped or the buttons stop reacting.
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <div className="ab-timer-side">`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = @media (min-width: 1000px) and (min-height: 560px) {`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = display: contents;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = grid-template-columns: minmax(0, 1fr) 340px;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = width: min(100%, calc(100dvh - 168px), 780px);`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = container-type: inline-size;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: 17cqw;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = font-size: 6cqw;`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("TimerScreen: the desktop layout (structure)", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = describe("the css of the screen: the desktop layout", () => {`
- Check by hand: on a laptop (or a browser window at least 1000 px wide and 560 px high) open the page address #timer and start a session: the dial is a big circle on the left, and the line and the buttons stand on the right in the middle of the height, with the digits inside the circle. Make the window narrower than 1000 px: the screen becomes the phone layout again (one column). On the phone nothing has changed.
```

## STEP 6: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
Find the line that starts with `- Packet 05C2:` (it must be found EXACTLY ONCE). KEEP it. Directly BELOW it add this one line:
```
- Packet 05C3: the Pro Timer on a wide screen (a laptop: at least 1000 px wide and 560 px high): the dial is a big circle on the left, and the line and the buttons (Start, or Pause and Hold to end session) stand on the right; the clock digits grow with the circle. The phone is unchanged (one column). The tags come in a later packet. With automated tests.
```
If that line is not found exactly once: **STOP** and report.

## STEP 7: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 39 connections, 221 anchors, 35 classes, 1 css variables, 2 label links
```
(The tags and places stay the same. 39 connections and 221 anchors: C39 is new with 10 anchors. 35 classes: the box `ab-timer-side` is new. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx` and `src/timer.css`, and it may also list the two files named in the rules (they had changes before this packet). If ANY other tracked file is listed (for example `package.json`): **STOP** and report the COMPLETE output. Do not commit.

## STEP 8: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/components/TimerScreen.tsx src/timer.css src/components/TimerScreen.test.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05C3: Pro Timer on a wide screen, dial left and buttons right"
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
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (211 anchors), the six files this packet changes had no uncommitted changes, and the three fingerprints of Step 0 matched.
2. The three fingerprint lines of Step 2 matched exactly.
3. `npm test` printed `Test Files  10 passed (10)` and `Tests  547 passed (547)`, and `npx tsc -b` printed nothing.
4. `node scripts/check-tags.mjs` printed the two lines of Step 7 (39 connections, 221 anchors).
5. `npm run build` finished with no errors.
6. `git show --stat HEAD` lists exactly these 6 files: `src/components/TimerScreen.tsx`, `src/timer.css`, `src/components/TimerScreen.test.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
7. The first line of `git log --oneline` ends with `Packet 05C3: Pro Timer on a wide screen, dial left and buttons right`.
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
The whole packet is one commit, so one `git revert <hash of the commit of Step 8>` in the planner chat brings back the one-column screen on every device, exactly as it was before this packet.

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests read the structure and the css; they cannot see pixels. In the planner's test browser (real Meta Balls and the real glowing ball, software WebGL 2) the phone sizes (390x844, 360x640, 844x390, 999x800 and 1200x559) were measured with the old and the new css: every element had the SAME box and the same font size as before. On wide windows (1000x560, 1024x768, 1280x720, 1440x900, 1920x1080) in the states idle, running, paused and a problem, the dial was a square circle on the left, fully inside the height and under the menu button, the line and the buttons were on the right and centred on the middle of the circle, nothing scrolled, the digits kept the phone share of the circle, every button was reached at its centre, the background still filled the whole screen and the console stayed empty. Look yourself on the laptop AND on the phone:
1. Laptop, browser window wide: open `#timer`. Idle: the digits `00:00:00` (big) and a small `00:00:00` under them stand on the left, a white Start button stands on the right, in the middle of the height. No circle yet.
2. Click Start: the moving background fades in over the whole window, the glowing ball lights up as a BIG circle on the left with the digits inside it, and on the right you have Pause and, under it, Hold to end session.
3. Make the window narrower than 1000 px (or lower than 560 px): the screen turns into the phone layout (dial on top, buttons under it). Make it wide again: it turns back.
4. Pause, Resume and Hold to end session work with the mouse on the right. The ball and the blobs do not cover them.
5. Phone: nothing at all should look different from before this packet.
6. Tell me if the circle is too big or too small on your laptop (the biggest it gets is 780 px), if the right-hand side should sit higher or lower, or if you want the buttons wider. Each of these is one number in the css. The tags go into the right-hand side in the next packet.
Report what does not look right. Do not fix anything by hand.
