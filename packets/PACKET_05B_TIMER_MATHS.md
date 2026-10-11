# PACKET 05B: PRO TIMER MATHS (pure functions + automated tests)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Create or edit ONLY these files: `src/lib/timerMaths.ts` (new), `src/lib/timerMaths.test.ts` (new), `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. The two npm commands in Step 1 also change `package.json` and `package-lock.json`. Nothing else.
- Do NOT create any other file anywhere: no helper scripts, no `.ps1` files, no notes, no temp files. Run every command directly in the terminal.
- Three tracked files already have changes that are NOT part of this packet: `src/components/AppMenu.tsx`, `src/components/SignedInStub.tsx`, `src/menu.css`. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, or any install other than the one in Step 1. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 10 is allowed.
- Every "replace" or "add" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
This is the first code of the Pro Timer, and it has no screen yet. It adds the timer maths as pure functions in one file (whole seconds of a session counted the way the database counts them, the clock text, quality meh / solid / deep / flow, GO BACK IN, milestone messages, the hour ring and its neon colours, the day total) and an automated test file with 180 tests that checks every cut-off at its boundary (59 and 60 seconds, 599 and 600, 1799 and 1800, 5399 and 5400, 2699 and 2700). It installs the test tool `vitest` (exact version 5.0.3) and adds the command `npm test`. It records the new code in the code map and two new connections (C26, C27) in the connections list. Nothing on any screen changes. The app does not use this code yet.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `supabase/timer_schema.sql`, `supabase/timer_verify.sql`, `src/lib/screens.ts`, `src/lib/lite.ts`. If any is missing: **STOP** and report which.

Check that these do NOT exist: `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`. If either exists: **STOP** and report which.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 17 tags, 25 places
CONNECTIONS OK: 25 connections, 100 anchors, 21 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these three paths: `src/components/AppMenu.tsx`, `src/components/SignedInStub.tsx`, `src/menu.css`. If ANY other tracked file is changed: **STOP** and report the COMPLETE output.

Then run these read-only commands. Do NOT stop on their results and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -3`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. `npm pkg get scripts`

## STEP 1: Install the test tool
Run:
```
npm install --save-dev --save-exact vitest@5.0.3
```
If it asks a question, asks for a login, or ends with an error: **STOP** and report the COMPLETE output. (Lines about funding or audits are harmless. A deprecation warning is harmless: copy it.)

Run:
```
npm pkg set "scripts.test=vitest run"
```

Run these three and copy the RAW output of each:
1. `npm pkg get scripts.test`
2. `npm ls vitest --depth=0`
3. `git diff package.json`

Command 1 must print exactly `"vitest run"` (with the quote marks). Command 2 must show `vitest@5.0.3`. If either differs: **STOP** and report the RAW outputs. Do not edit `package.json` by hand.

Run `git status --short`. The changed tracked files must be ONLY `package.json`, `package-lock.json` and the three files named in the rules. If ANY other tracked file is changed: **STOP** and report the COMPLETE output.

## STEP 2: Create `src/lib/timerMaths.ts`
Create the file `src/lib/timerMaths.ts` with exactly this content (everything inside the block below; the first line is a comment and the last line is a comment):
```ts
// AB:TIMER.MATHS:START
// The Pro Timer maths. Pure functions: no screen, no database call, no clock of its own.
// Every time comes in as a number (milliseconds) or as the text the database sends.
// What is shared with the database: see CONNECTIONS.md C26. The cut-offs and the tests: see CONNECTIONS.md C27.
// The automated tests are in src/lib/timerMaths.test.ts. Run them with: npm test

// ---- The numbers that decide things. A change here also changes the tests (C27). ----
export const MIN_SESSION_SECONDS = 60
export const SOLID_FROM_SECONDS = 600
export const DEEP_FROM_SECONDS = 1800
export const FLOW_FROM_SECONDS = 5400
export const GO_BACK_IN_LIMIT_SECONDS = 2700
export const MILESTONE_MINUTES = [15, 25, 45, 60, 90, 120, 150, 180] as const
export const MAX_LIVE_STEP_SECONDS = 10
export const RING_LOOP_SECONDS = 3600
export const RING_FIRST_COLOR = "#ffffff"
export const NEON_COLORS = [
  "#39ff14",
  "#00f0ff",
  "#ff2bd6",
  "#fff200",
  "#ff7a00",
  "#b026ff",
  "#ff2a55",
] as const

// ---- Types ----
export type Quality = "meh" | "solid" | "deep" | "flow"

// One running session, exactly as the database function timer_state sends it (see C26).
export type TimerRow = {
  started_at: string
  tz: string
  status: "running" | "paused"
  paused_at: string | null
  paused_seconds: number
  cap_at: string
}

export type MilestoneStep = { announce: number | null; shown: number[] }

// ---- Whole seconds and the clock text ----
// Anything that is not a finite number above 0 counts as 0. Otherwise the fraction is cut off (floor), never rounded.
export function wholeSeconds(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.floor(value)
}

function twoDigits(n: number): string {
  return String(n).padStart(2, "0")
}

// 3725 seconds -> "01:02:05". Hours are not capped.
export function formatClock(seconds: number): string {
  const s = wholeSeconds(seconds)
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  return twoDigits(hours) + ":" + twoDigits(minutes) + ":" + twoDigits(s % 60)
}

// ---- The 60 second rule, quality, GO BACK IN ----
export function isSessionCounted(seconds: number): boolean {
  return wholeSeconds(seconds) >= MIN_SESSION_SECONDS
}

export function qualityOf(seconds: number): Quality {
  const s = wholeSeconds(seconds)
  if (s >= FLOW_FROM_SECONDS) return "flow"
  if (s >= DEEP_FROM_SECONDS) return "deep"
  if (s >= SOLID_FROM_SECONDS) return "solid"
  return "meh"
}

// GO BACK IN is offered only for a session shorter than 45 minutes.
export function canGoBackIn(seconds: number): boolean {
  return wholeSeconds(seconds) < GO_BACK_IN_LIMIT_SECONDS
}

// ---- Times from the database ----
const SERVER_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}(?::?\d{2})?)$/

// "2026-10-06T09:30:00.123456+00:00" -> milliseconds since 1970 (the microseconds become a fraction of a millisecond).
// Written by hand so that every browser reads the same text the same way. Bad text throws an Error that starts with BAD_SERVER_TIME.
export function parseServerTimeMs(text: string): number {
  const m = SERVER_TIME.exec(text.trim())
  if (m === null) throw new Error("BAD_SERVER_TIME: " + text)
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const hour = Number(m[4])
  const minute = Number(m[5])
  const second = Number(m[6])
  const fraction = m[7] ?? ""
  const zone = m[8] ?? "Z"
  // A date that does not exist (month 0 or 13, day 0, 31 in a 30 day month) rolls over into another month here, so the month no longer matches.
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    year < 1970 ||
    probe.getUTCMonth() !== month - 1 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new Error("BAD_SERVER_TIME: " + text)
  }
  let offsetMinutes = 0
  if (zone !== "Z") {
    const digits = zone.slice(1).replace(":", "")
    const zoneMinutes = Number(digits.slice(0, 2)) * 60 + (digits.length > 2 ? Number(digits.slice(2, 4)) : 0)
    offsetMinutes = zone.startsWith("-") ? -zoneMinutes : zoneMinutes
  }
  const wholeMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60000
  const micros = Number((fraction + "000000").slice(0, 6))
  return wholeMs + micros / 1000
}

// All counting below is done in whole microseconds, because the database counts in microseconds.
function toMicros(ms: number): number {
  return Math.round(ms * 1000)
}

// The server time now, estimated from the server time at the last read and the time that has passed on this device since.
// A device clock that jumps backwards never makes the estimate go backwards.
export function estimateServerNowMs(serverNowAtReadMs: number, localAtReadMs: number, localNowMs: number): number {
  return serverNowAtReadMs + Math.max(0, localNowMs - localAtReadMs)
}

// ---- The running session ----
// Whole seconds the session has counted. This copies what the database function timer_end counts (see C26):
// the end is the smaller of now and cap_at (local midnight); a paused session counts up to paused_at only;
// then whole seconds of (that moment minus started_at minus paused_seconds), never below 0.
export function activeSeconds(row: TimerRow, serverNowMs: number): number {
  const started = toMicros(parseServerTimeMs(row.started_at))
  const cap = toMicros(parseServerTimeMs(row.cap_at))
  const end = Math.min(toMicros(serverNowMs), cap)
  let reference = end
  if (row.status === "paused") {
    if (row.paused_at === null) throw new Error("BAD_ROW: paused without paused_at")
    reference = Math.min(toMicros(parseServerTimeMs(row.paused_at)), end)
  }
  const activeMicros = reference - started - Math.round(row.paused_seconds * 1000000)
  return Math.floor(Math.max(0, activeMicros) / 1000000)
}

// True when local midnight has been reached (the database then refuses pause and resume with DAY_ENDED).
export function dayHasEnded(row: TimerRow, serverNowMs: number): boolean {
  return toMicros(serverNowMs) >= toMicros(parseServerTimeMs(row.cap_at))
}

// ---- The day ----
// The date (YYYY-MM-DD) in the person's own time zone, never the UTC date. Same rule as the database (see C26).
export function localDay(ms: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(ms))
  const pick = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const text = pick("year") + "-" + pick("month") + "-" + pick("day")
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error("BAD_LOCAL_DAY: " + text)
  return text
}

// Saved seconds of the day plus the running session, each cut to whole seconds first so that nothing drifts.
// The running session counts from its first second. If it ends under 60 seconds the database does not save it and the total goes back down.
export function dayTotalSeconds(savedSeconds: number, runningSeconds: number | null): number {
  const saved = wholeSeconds(savedSeconds)
  if (runningSeconds === null) return saved
  return saved + wholeSeconds(runningSeconds)
}

// ---- Milestone messages ----
// Call this on every tick with the seconds of the previous tick (null on the first tick after Start or after the page opened),
// the seconds now, and the milestones already passed or shown. It tells which milestone to announce, if any, and the new list.
// A milestone is announced only when it is crossed during a normal step of at most MAX_LIVE_STEP_SECONDS.
// After a long gap (page closed, phone locked) the milestones that were passed are marked as shown without a message.
export function milestoneStep(
  previousSeconds: number | null,
  currentSeconds: number,
  shown: readonly number[],
): MilestoneStep {
  const now = wholeSeconds(currentSeconds)
  const nextShown = MILESTONE_MINUTES.filter((m) => shown.includes(m) || m * 60 <= now)
  let announce: number | null = null
  if (previousSeconds !== null) {
    const before = wholeSeconds(previousSeconds)
    const step = now - before
    const crossed = nextShown.filter((m) => !shown.includes(m) && m * 60 > before)
    if (crossed.length > 0 && step <= MAX_LIVE_STEP_SECONDS) {
      announce = crossed[crossed.length - 1]
    }
  }
  return { announce, shown: nextShown }
}

// ---- The hour ring ----
// Which loop of the ring the session is in (0 = the first hour) and how full the current loop is (0 up to just under 1).
export function ringLoop(seconds: number): number {
  return Math.floor(wholeSeconds(seconds) / RING_LOOP_SECONDS)
}

export function ringFill(seconds: number): number {
  return (wholeSeconds(seconds) % RING_LOOP_SECONDS) / RING_LOOP_SECONDS
}

function seedToNumber(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function randomFromSeed(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// The colour of one loop. Loop 0 is white. Every later loop gets a neon colour chosen by a seeded random draw
// that skips the colour of the loop before it, so two loops in a row never share a colour.
// The same seed (use the started_at text of the session) always gives the same colours, so a reload or a second device shows the same ring.
export function ringColor(loop: number, seed: string): string {
  const count = Math.floor(wholeSeconds(loop))
  if (count === 0) return RING_FIRST_COLOR
  const random = randomFromSeed(seedToNumber(seed))
  let color: string = RING_FIRST_COLOR
  for (let i = 1; i <= count; i++) {
    const options = NEON_COLORS.filter((c) => c !== color)
    color = options[Math.floor(random() * options.length)]
  }
  return color
}
// AB:TIMER.MATHS:END
```

## STEP 3: Create `src/lib/timerMaths.test.ts`
Create the file `src/lib/timerMaths.test.ts` with exactly this content (everything inside the block below; it starts with `import { describe, expect, it } from "vitest"`):
```ts
import { describe, expect, it } from "vitest"
import {
  DEEP_FROM_SECONDS,
  FLOW_FROM_SECONDS,
  GO_BACK_IN_LIMIT_SECONDS,
  MAX_LIVE_STEP_SECONDS,
  MILESTONE_MINUTES,
  MIN_SESSION_SECONDS,
  NEON_COLORS,
  RING_FIRST_COLOR,
  RING_LOOP_SECONDS,
  SOLID_FROM_SECONDS,
  activeSeconds,
  canGoBackIn,
  dayHasEnded,
  dayTotalSeconds,
  estimateServerNowMs,
  formatClock,
  isSessionCounted,
  localDay,
  milestoneStep,
  parseServerTimeMs,
  qualityOf,
  ringColor,
  ringFill,
  ringLoop,
  wholeSeconds,
} from "./timerMaths"
import type { TimerRow } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the timer maths. Run them with: npm test
// The numbers below are written out again on purpose: if a cut-off in timerMaths.ts is changed, a test must fail. See CONNECTIONS.md C27.

const T0 = Date.UTC(2026, 9, 6, 9, 0, 0) // 2026-10-06 09:00:00 UTC

function row(changes: Partial<TimerRow> = {}): TimerRow {
  return {
    started_at: "2026-10-06T09:00:00+00:00",
    tz: "UTC",
    status: "running",
    paused_at: null,
    paused_seconds: 0,
    cap_at: "2026-10-07T00:00:00+00:00",
    ...changes,
  }
}

// A small seeded random number generator, so the random-looking tests give the same result every time.
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    return a / 4294967296
  }
}

// Whole microseconds since 1970 -> the text the database sends, for example 2026-10-06T09:00:00.000001+00:00.
function microsText(micros: number): string {
  const seconds = Math.floor(micros / 1000000)
  const fraction = micros - seconds * 1000000
  return new Date(seconds * 1000).toISOString().slice(0, 19) + "." + String(fraction).padStart(6, "0") + "+00:00"
}

describe("the numbers that decide things", () => {
  it("are the numbers the owner decided", () => {
    expect(MIN_SESSION_SECONDS).toBe(60)
    expect(SOLID_FROM_SECONDS).toBe(600)
    expect(DEEP_FROM_SECONDS).toBe(1800)
    expect(FLOW_FROM_SECONDS).toBe(5400)
    expect(GO_BACK_IN_LIMIT_SECONDS).toBe(2700)
    expect(RING_LOOP_SECONDS).toBe(3600)
    expect([...MILESTONE_MINUTES]).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
    expect(MAX_LIVE_STEP_SECONDS).toBe(10)
  })
})

describe("wholeSeconds", () => {
  it.each([
    [0, 0],
    [0.4, 0],
    [0.999, 0],
    [1, 1],
    [59.999, 59],
    [60, 60],
    [3599.99, 3599],
    [-5, 0],
    [-0, 0],
    [Number.NaN, 0],
    [Number.POSITIVE_INFINITY, 0],
  ])("%s gives %s", (input, expected) => {
    expect(wholeSeconds(input)).toBe(expected)
  })
})

describe("formatClock", () => {
  it.each([
    [0, "00:00:00"],
    [1, "00:00:01"],
    [59, "00:00:59"],
    [59.9, "00:00:59"],
    [60, "00:01:00"],
    [3599, "00:59:59"],
    [3600, "01:00:00"],
    [3661, "01:01:01"],
    [86399, "23:59:59"],
    [86400, "24:00:00"],
    [360000, "100:00:00"],
    [-3, "00:00:00"],
    [Number.NaN, "00:00:00"],
  ])("%s seconds shows %s", (input, expected) => {
    expect(formatClock(input)).toBe(expected)
  })
})

describe("the 60 second rule", () => {
  it.each([
    [0, false],
    [59, false],
    [59.999, false],
    [60, true],
    [60.5, true],
    [3600, true],
  ])("%s seconds counted: %s", (input, expected) => {
    expect(isSessionCounted(input)).toBe(expected)
  })
})

describe("quality", () => {
  it.each([
    [0, "meh"],
    [59, "meh"],
    [60, "meh"],
    [599, "meh"],
    [599.99, "meh"],
    [600, "solid"],
    [601, "solid"],
    [1799, "solid"],
    [1799.99, "solid"],
    [1800, "deep"],
    [1801, "deep"],
    [5399, "deep"],
    [5399.99, "deep"],
    [5400, "flow"],
    [5401, "flow"],
    [86400, "flow"],
    [-1, "meh"],
    [Number.NaN, "meh"],
  ])("%s seconds is %s", (input, expected) => {
    expect(qualityOf(input)).toBe(expected)
  })
})

describe("GO BACK IN", () => {
  it.each([
    [0, true],
    [59, true],
    [2699, true],
    [2699.99, true],
    [2700, false],
    [2701, false],
    [5400, false],
  ])("%s seconds: offered %s", (input, expected) => {
    expect(canGoBackIn(input)).toBe(expected)
  })
})

describe("parseServerTimeMs", () => {
  it.each([
    ["1970-01-01T00:00:00+00:00", 0],
    ["2026-10-06T09:00:00+00:00", T0],
    ["2026-10-06T09:00:00Z", T0],
    ["2026-10-06 09:00:00+00", T0],
    ["2026-10-06T09:00:00.5+00:00", T0 + 500],
    ["2026-10-06T14:30:00+05:30", T0],
    ["2026-10-06T14:30:00+0530", T0],
    ["2026-10-06T05:00:00-04:00", T0],
    ["2026-10-06T09:00:01+00:00", T0 + 1000],
  ])("reads %s", (text, expected) => {
    expect(parseServerTimeMs(text)).toBe(expected)
  })

  it("keeps the microseconds as a fraction of a millisecond and cuts after the sixth digit", () => {
    expect(parseServerTimeMs("2026-10-06T09:00:00.123456+00:00")).toBeCloseTo(T0 + 123.456, 3)
    expect(parseServerTimeMs("2026-10-06T09:00:00.123456789+00:00")).toBeCloseTo(T0 + 123.456, 3)
    expect(parseServerTimeMs("2026-10-06T09:00:00.000001+00:00")).toBeCloseTo(T0 + 0.001, 3)
  })

  it.each([
    [""],
    ["garbage"],
    ["2026-10-06T09:00:00"],
    ["2026-13-01T00:00:00+00:00"],
    ["2026-02-30T00:00:00+00:00"],
    ["2026-00-10T00:00:00+00:00"],
    ["2026-10-00T00:00:00+00:00"],
    ["2026-10-32T00:00:00+00:00"],
    ["2026-04-31T00:00:00+00:00"],
    ["2026-01-00T00:00:00+00:00"],
    ["2026-12-32T00:00:00+00:00"],
    ["2026-10-06T24:00:00+00:00"],
    ["2026-10-06T09:60:00+00:00"],
    ["2026-10-06T09:00:60+00:00"],
    ["1969-12-31T23:59:59+00:00"],
  ])("refuses %j", (text) => {
    expect(() => parseServerTimeMs(text)).toThrow("BAD_SERVER_TIME")
  })

  it("keeps every microsecond exactly (3000 seeded random times)", () => {
    const random = seeded(42)
    for (let i = 0; i < 3000; i++) {
      const seconds = Math.floor(1577836800 + random() * 631152000) // 2020 to 2040
      const micros = Math.floor(random() * 1000000)
      const text =
        new Date(seconds * 1000).toISOString().slice(0, 19) + "." + String(micros).padStart(6, "0") + "+00:00"
      expect(Math.round(parseServerTimeMs(text) * 1000)).toBe(seconds * 1000000 + micros)
    }
  })
})

describe("estimateServerNowMs", () => {
  it.each([
    [1000, 5000, 5000, 1000],
    [1000, 5000, 5750, 1750],
    [1000, 5000, 65000, 61000],
    [1000, 5000, 4000, 1000], // the device clock jumped back: the estimate does not go back
  ])("server %s, device %s then %s gives %s", (server, localThen, localNow, expected) => {
    expect(estimateServerNowMs(server, localThen, localNow)).toBe(expected)
  })
})

describe("activeSeconds: a running session", () => {
  it.each([
    [0, 0],
    [999, 0],
    [1000, 1],
    [59999, 59],
    [60000, 60],
    [60001, 60],
    [599999, 599],
    [600000, 600],
    [1799999, 1799],
    [1800000, 1800],
    [2699999, 2699],
    [2700000, 2700],
    [3599999, 3599],
    [3600000, 3600],
    [5399999, 5399],
    [5400000, 5400],
  ])("%s ms after the start gives %s s", (afterMs, expected) => {
    expect(activeSeconds(row(), T0 + afterMs)).toBe(expected)
  })

  it("counts in microseconds like the database", () => {
    const r = row({ started_at: "2026-10-06T09:00:00.000001+00:00" })
    expect(activeSeconds(r, T0 + 60000)).toBe(59) // 59.999999 s
    expect(activeSeconds(r, T0 + 60000.001)).toBe(60) // exactly 60 s
  })

  it("rounds a device clock with fractions of a millisecond to the nearest microsecond", () => {
    expect(activeSeconds(row(), T0 + 59999.9997)).toBe(60) // 0.3 microseconds short of 60 s counts as 60 s
    expect(activeSeconds(row(), T0 + 59999.9993)).toBe(59) // 0.7 microseconds short of 60 s does not
    expect(activeSeconds(row(), T0 + 60000.0003)).toBe(60)
    expect(activeSeconds(row(), T0 + 60000.0007)).toBe(60)
  })

  it("never gives a negative number when now is before the start", () => {
    expect(activeSeconds(row(), T0 - 5000)).toBe(0)
  })

  it("takes the paused seconds away", () => {
    expect(activeSeconds(row({ paused_seconds: 30 }), T0 + 90000)).toBe(60)
    expect(activeSeconds(row({ paused_seconds: 30 }), T0 + 89999)).toBe(59)
    expect(activeSeconds(row({ paused_seconds: 100 }), T0 + 50000)).toBe(0)
  })

  it("does not lose a second to decimal numbers", () => {
    expect(activeSeconds(row({ paused_seconds: 0.3 }), T0 + 60300)).toBe(60)
    expect(activeSeconds(row({ paused_seconds: 14.999999 }), T0 + 75000)).toBe(60)
    expect(activeSeconds(row({ paused_seconds: 15.000001 }), T0 + 75000)).toBe(59)
    expect(activeSeconds(row({ paused_seconds: 0.1 + 0.2 }), T0 + 60300)).toBe(60)
  })
})

describe("activeSeconds: against an exact count", () => {
  it("gives the same whole seconds as counting whole microseconds (3000 seeded random sessions)", () => {
    const random = seeded(2026)
    for (let i = 0; i < 3000; i++) {
      const startMicros = Math.floor(1790000000 + random() * 1000000) * 1000000 + Math.floor(random() * 1000000)
      const span = Math.floor(random() * 90000 * 1000000)
      const nowMicros = startMicros + span
      const capMicros = startMicros + 1 + Math.floor(random() * 86400 * 1000000)
      const pausedMicros = Math.floor(random() * span)
      const isPaused = random() < 0.5
      const pausedAtMicros = startMicros + Math.floor(random() * span)
      const end = Math.min(nowMicros, capMicros)
      const reference = isPaused ? Math.min(pausedAtMicros, end) : end
      const active = reference - startMicros - pausedMicros
      const expected = active <= 0 ? 0 : Math.floor(active / 1000000)
      const r: TimerRow = {
        started_at: microsText(startMicros),
        tz: "UTC",
        status: isPaused ? "paused" : "running",
        paused_at: isPaused ? microsText(pausedAtMicros) : null,
        paused_seconds: pausedMicros / 1000000,
        cap_at: microsText(capMicros),
      }
      expect(activeSeconds(r, nowMicros / 1000), JSON.stringify(r) + " now " + nowMicros).toBe(expected)
    }
  })
})

describe("activeSeconds: exact boundaries with odd microseconds", () => {
  const far = "2030-01-01T00:00:00+00:00"

  it("counts exactly N seconds as N, and one microsecond less as N - 1 (4000 seeded random starts)", () => {
    const random = seeded(11)
    for (let i = 0; i < 4000; i++) {
      const startMicros = Math.floor(1790000000 + random() * 1000000) * 1000000 + Math.floor(random() * 1000000)
      const r = row({ started_at: microsText(startMicros), cap_at: far })
      for (const wanted of [60, 600, 1800, 2700, 5400]) {
        const exact = startMicros + wanted * 1000000
        expect(activeSeconds(r, exact / 1000), "start " + startMicros + " wanted " + wanted).toBe(wanted)
        expect(activeSeconds(r, (exact - 1) / 1000), "start " + startMicros + " wanted " + wanted + " minus 1 us").toBe(wanted - 1)
      }
    }
  })

  it("does the same with earlier pauses of odd length (4000 seeded random pauses)", () => {
    const random = seeded(12)
    for (let i = 0; i < 4000; i++) {
      const startMicros = Math.floor(1790000000 + random() * 1000000) * 1000000 + Math.floor(random() * 1000000)
      const pausedMicros = Math.floor(random() * 90000 * 1000000)
      const r = row({ started_at: microsText(startMicros), cap_at: far, paused_seconds: pausedMicros / 1000000 })
      for (const wanted of [60, 2700]) {
        const exact = startMicros + pausedMicros + wanted * 1000000
        expect(activeSeconds(r, exact / 1000), "start " + startMicros + " paused " + pausedMicros).toBe(wanted)
        expect(activeSeconds(r, (exact - 1) / 1000), "start " + startMicros + " paused " + pausedMicros + " minus 1 us").toBe(wanted - 1)
      }
    }
  })
})

describe("activeSeconds: a paused session", () => {
  const pausedAt = "2026-10-06T09:02:00+00:00" // 120 s after the start

  it("stands still while paused, however late it is read", () => {
    const r = row({ status: "paused", paused_at: pausedAt })
    expect(activeSeconds(r, T0 + 120000)).toBe(120)
    expect(activeSeconds(r, T0 + 130000)).toBe(120)
    expect(activeSeconds(r, T0 + 3600000)).toBe(120)
  })

  it("is not ahead of the clock if it is read before paused_at", () => {
    const r = row({ status: "paused", paused_at: pausedAt })
    expect(activeSeconds(r, T0 + 60000)).toBe(60)
  })

  it("also takes away earlier pauses", () => {
    const r = row({ status: "paused", paused_at: pausedAt, paused_seconds: 30 })
    expect(activeSeconds(r, T0 + 3600000)).toBe(90)
  })

  it("refuses a paused row that has no paused_at", () => {
    expect(() => activeSeconds(row({ status: "paused", paused_at: null }), T0)).toThrow("BAD_ROW")
  })
})

describe("activeSeconds: the midnight cut", () => {
  // Asia/Kolkata: local midnight is 18:30 UTC. This session started at 23:59:30 local (18:29:30 UTC).
  const kolkata = row({
    started_at: "2026-10-06T18:29:30+00:00",
    tz: "Asia/Kolkata",
    cap_at: "2026-10-06T18:30:00+00:00",
  })
  const start = Date.UTC(2026, 9, 6, 18, 29, 30)
  const cap = Date.UTC(2026, 9, 6, 18, 30, 0)

  it("counts up to midnight and not after", () => {
    expect(activeSeconds(kolkata, cap - 1000)).toBe(29)
    expect(activeSeconds(kolkata, cap)).toBe(30)
    expect(activeSeconds(kolkata, cap + 1)).toBe(30)
    expect(activeSeconds(kolkata, cap + 3600000)).toBe(30)
    expect(activeSeconds(kolkata, start)).toBe(0)
  })

  it("stops at midnight for a paused session that was paused after midnight too", () => {
    const r = { ...kolkata, status: "paused" as const, paused_at: "2026-10-06T19:00:00+00:00" }
    expect(activeSeconds(r, cap + 7200000)).toBe(30)
  })
})

describe("dayHasEnded", () => {
  const r = row({ tz: "Asia/Kolkata", cap_at: "2026-10-06T18:30:00+00:00" })
  const cap = Date.UTC(2026, 9, 6, 18, 30, 0)
  it.each([
    [-1000, false],
    [-1, false],
    [0, true],
    [1, true],
    [3600000, true],
  ])("%s ms from midnight: %s", (offset, expected) => {
    expect(dayHasEnded(r, cap + offset)).toBe(expected)
  })
})

describe("localDay", () => {
  it.each([
    // Asia/Kolkata is 5 hours 30 minutes ahead of UTC.
    [Date.UTC(2026, 9, 5, 18, 29, 59, 999), "Asia/Kolkata", "2026-10-05"],
    [Date.UTC(2026, 9, 5, 18, 30, 0, 0), "Asia/Kolkata", "2026-10-06"],
    [Date.UTC(2026, 9, 6, 20, 0, 0, 0), "Asia/Kolkata", "2026-10-07"], // the UTC date would say the 6th
    [Date.UTC(2026, 9, 6, 20, 0, 0, 0), "UTC", "2026-10-06"],
    // New York, the day the clocks go forward (2026-03-08): midnight of the 9th is 04:00 UTC.
    [Date.UTC(2026, 2, 9, 3, 59, 59), "America/New_York", "2026-03-08"],
    [Date.UTC(2026, 2, 9, 4, 0, 0), "America/New_York", "2026-03-09"],
    // New York, the day the clocks go back (2026-11-01): midnight of the 2nd is 05:00 UTC.
    [Date.UTC(2026, 10, 2, 4, 59, 59), "America/New_York", "2026-11-01"],
    [Date.UTC(2026, 10, 2, 5, 0, 0), "America/New_York", "2026-11-02"],
    // Year end.
    [Date.UTC(2026, 11, 31, 18, 29, 59), "Asia/Kolkata", "2026-12-31"],
    [Date.UTC(2026, 11, 31, 18, 30, 0), "Asia/Kolkata", "2027-01-01"],
  ])("%s in %s is the day %s", (ms, zone, expected) => {
    expect(localDay(ms, zone)).toBe(expected)
  })

  it("refuses a time zone that does not exist", () => {
    expect(() => localDay(T0, "Mars/Olympus")).toThrow()
  })
})

describe("dayTotalSeconds", () => {
  it.each([
    [0, null, 0],
    [3600, null, 3600],
    [3600, 0, 3600],
    [3600, 59.9, 3659],
    [100, 59.9, 159],
    [100.7, 59.9, 159],
    [-5, 10, 10],
    [100, Number.NaN, 100],
    [86399, 1, 86400],
  ])("saved %s and running %s gives %s", (saved, running, expected) => {
    expect(dayTotalSeconds(saved, running)).toBe(expected)
  })
})

describe("milestones", () => {
  it("are further apart than one normal step, so one step can cross at most one of them", () => {
    const minutes = [...MILESTONE_MINUTES]
    for (let i = 1; i < minutes.length; i++) {
      expect(minutes[i]).toBeGreaterThan(minutes[i - 1])
      expect((minutes[i] - minutes[i - 1]) * 60).toBeGreaterThan(MAX_LIVE_STEP_SECONDS)
    }
  })

  function runTicks(stepSeconds: number, endSeconds: number) {
    let previous: number | null = null
    let shown: number[] = []
    const announced: number[] = []
    for (let t = 0; t <= endSeconds; t += stepSeconds) {
      const result = milestoneStep(previous, t, shown)
      shown = result.shown
      if (result.announce !== null) announced.push(result.announce)
      previous = t
    }
    return { announced, shown }
  }

  it("announces a milestone when it is crossed", () => {
    expect(milestoneStep(899, 900, [])).toEqual({ announce: 15, shown: [15] })
    expect(milestoneStep(1499, 1500, [15])).toEqual({ announce: 25, shown: [15, 25] })
    expect(milestoneStep(10799, 10800, [15, 25, 45, 60, 90, 120, 150])).toEqual({
      announce: 180,
      shown: [15, 25, 45, 60, 90, 120, 150, 180],
    })
  })

  it("does not announce one second before", () => {
    expect(milestoneStep(898, 899, [])).toEqual({ announce: null, shown: [] })
  })

  it("does not announce the same milestone twice", () => {
    expect(milestoneStep(900, 901, [15])).toEqual({ announce: null, shown: [15] })
  })

  it("announces each of the eight milestones exactly once, for every tick size", () => {
    for (const step of [0.25, 1, 3, 7, 10]) {
      const { announced } = runTicks(step, 11000)
      expect(announced, "tick size " + step).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
    }
  })

  it("stays silent when every step is longer than a normal step, but still remembers them", () => {
    const { announced, shown } = runTicks(11, 11000)
    expect(announced).toEqual([])
    expect(shown).toEqual([15, 25, 45, 60, 90, 120, 150, 180])
  })

  it("is silent on the first tick after the page opened, and marks what was passed", () => {
    expect(milestoneStep(null, 7300, [])).toEqual({ announce: null, shown: [15, 25, 45, 60, 90, 120] })
    expect(milestoneStep(null, 900, [])).toEqual({ announce: null, shown: [15] })
    expect(milestoneStep(null, 0, [])).toEqual({ announce: null, shown: [] })
  })

  it("does not send a burst after a long gap", () => {
    expect(milestoneStep(800, 3000, [])).toEqual({ announce: null, shown: [15, 25, 45] })
  })

  it("announces with a step of exactly 10 seconds and is silent with 11", () => {
    expect(milestoneStep(895, 905, [])).toEqual({ announce: 15, shown: [15] })
    expect(milestoneStep(894, 905, [])).toEqual({ announce: null, shown: [15] })
  })

  it("does not announce again when the time steps back and forward over a milestone", () => {
    let shown: number[] = []
    const first = milestoneStep(899, 900, shown)
    expect(first.announce).toBe(15)
    shown = first.shown
    const back = milestoneStep(900, 899, shown)
    expect(back.announce).toBeNull()
    shown = back.shown
    const forward = milestoneStep(899, 900, shown)
    expect(forward.announce).toBeNull()
    expect(forward.shown).toEqual([15])
  })

  it("does not announce when the previous second was already past the milestone", () => {
    expect(milestoneStep(1000, 1001, [])).toEqual({ announce: null, shown: [15] })
  })

  it("stays quiet while paused (the same seconds again and again)", () => {
    expect(milestoneStep(900, 900, [15])).toEqual({ announce: null, shown: [15] })
  })

  it("never announces twice, whatever the ticks do (seeded random walk)", () => {
    const random = seeded(7)
    let t = 0
    let previous: number | null = null
    let shown: number[] = []
    const announced: number[] = []
    for (let i = 0; i < 40000; i++) {
      t += random() < 0.05 ? -1 : random() * 1.5
      if (t < 0) t = 0
      const result = milestoneStep(previous, t, shown)
      shown = result.shown
      if (result.announce !== null) announced.push(result.announce)
      previous = t
    }
    expect(new Set(announced).size).toBe(announced.length)
    for (const m of announced) expect([...MILESTONE_MINUTES]).toContain(m)
  })

  it("does not change the list it was given", () => {
    const given = Object.freeze([15])
    const result = milestoneStep(1499, 1500, given)
    expect(given).toEqual([15])
    expect(result.shown).toEqual([15, 25])
  })
})

describe("the hour ring", () => {
  it.each([
    [0, 0],
    [1, 1 / 3600],
    [1800, 0.5],
    [3599, 3599 / 3600],
    [3599.9, 3599 / 3600],
    [3600, 0],
    [3601, 1 / 3600],
    [7199, 3599 / 3600],
    [7200, 0],
    [Number.NaN, 0],
    [-5, 0],
  ])("%s seconds fills %s of the loop", (input, expected) => {
    expect(ringFill(input)).toBe(expected)
  })

  it.each([
    [0, 0],
    [3599, 0],
    [3599.9, 0],
    [3600, 1],
    [7199, 1],
    [7200, 2],
    [86399, 23],
    [86400, 24],
    [-5, 0],
  ])("%s seconds is in loop %s", (input, expected) => {
    expect(ringLoop(input)).toBe(expected)
  })

  it("has a neon list that is safe to draw from", () => {
    expect(NEON_COLORS.length).toBeGreaterThanOrEqual(2)
    expect(new Set(NEON_COLORS).size).toBe(NEON_COLORS.length)
    expect(RING_FIRST_COLOR).toBe("#ffffff")
    for (const color of NEON_COLORS) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/)
      expect(color).not.toBe(RING_FIRST_COLOR)
    }
  })

  it("is white in the first loop whatever the seed", () => {
    for (const seed of ["", "a", "2026-10-06T09:00:00+00:00"]) {
      expect(ringColor(0, seed)).toBe("#ffffff")
    }
    expect(ringColor(-1, "x")).toBe("#ffffff")
    expect(ringColor(Number.NaN, "x")).toBe("#ffffff")
  })

  it("is a neon colour from the second loop on, and never the same colour twice in a row", () => {
    const seeds = ["", "a", "2026-10-06T09:00:00+00:00", "2026-10-06T09:00:00.123456+00:00", "x".repeat(500)]
    const random = seeded(99)
    for (let i = 0; i < 60; i++) seeds.push("seed-" + Math.floor(random() * 1e9))
    for (const seed of seeds) {
      let previous = ringColor(0, seed)
      for (let loop = 1; loop <= 200; loop++) {
        const color = ringColor(loop, seed)
        expect(NEON_COLORS as readonly string[]).toContain(color)
        expect(color, "seed " + seed + ", loop " + loop).not.toBe(previous)
        previous = color
      }
    }
  })

  it("gives the same colours for the same seed, every time", () => {
    for (let loop = 0; loop <= 30; loop++) {
      expect(ringColor(loop, "2026-10-06T09:00:00+00:00")).toBe(ringColor(loop, "2026-10-06T09:00:00+00:00"))
    }
    expect(ringColor(1.9, "s")).toBe(ringColor(1, "s"))
  })

  it("uses many colours and differs from seed to seed", () => {
    const used = new Set<string>()
    for (let loop = 1; loop <= 100; loop++) used.add(ringColor(loop, "2026-10-06T09:00:00+00:00"))
    expect(used.size).toBeGreaterThanOrEqual(5)

    const firstColors = new Set<string>()
    for (let i = 0; i < 50; i++) firstColors.add(ringColor(1, "session-" + i))
    expect(firstColors.size).toBeGreaterThanOrEqual(4)

    const a = Array.from({ length: 30 }, (_, i) => ringColor(i + 1, "seed-one"))
    const b = Array.from({ length: 30 }, (_, i) => ringColor(i + 1, "seed-two"))
    expect(a).not.toEqual(b)
  })
})
// AB:TIMER.TESTS:END
```

## STEP 4: Check that both files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/lib/timerMaths.ts","src/lib/timerMaths.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these two lines:
```
src/lib/timerMaths.ts 177c9d2f47b7bf7c77c34194e59d4ecefcd19c8da7fc2b4c7664c3af9c859bf5
src/lib/timerMaths.test.ts f77412314020e2837d913825837e39c6fb366e8b28c2f99e02bca98b96ff7608
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and the output of `(Get-Content src/lib/timerMaths.ts).Count` and `(Get-Content src/lib/timerMaths.test.ts).Count`. Do not fix the file. (Expected line counts: 241 and 648.)

## STEP 5: Run the tests
Run:
```
npm test
```
It must finish with a line `Test Files  1 passed (1)` and a line `Tests  180 passed (180)`. It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 8 lines of the output.

## STEP 6: Edit `CODE_MAP.md`
Two changes. Change nothing else in the file.

**6a.** Replace this whole line (in the "Page codes" table):
```
| TIMER | Pro Timer (not built yet) |
```
with this whole line:
```
| TIMER | Pro Timer: the maths and its tests are built; the screen is not built yet |
```

**6b.** Find the line that starts with `## Library components (installed React Bits source`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new section and that heading):
```markdown
## TIMER (the Pro Timer)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:TIMER.MATHS` | The Pro Timer maths: whole seconds of a session, the clock text, quality (meh, solid, deep, flow), GO BACK IN, milestone messages, the hour ring and its colours, the day total. Pure functions: no screen and no database call | `src/lib/timerMaths.ts` | the neon colours of the ring (NEON_COLORS); the cut-offs, the milestone times and the 60 second rule are decisions, see CONNECTIONS.md C26 and C27 |
| `AB:TIMER.TESTS` | The automated tests of that maths. Run them with npm test | `src/lib/timerMaths.test.ts` | add tests; the numbers written in them must match the maths, see CONNECTIONS.md C27 |

```

## STEP 7: Edit `CONNECTIONS.md`
Add a new heading and TWO new entries, C26 and C27. Change nothing else in the file. Find the line `## Things to know (no check is possible)`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new entries and that heading):
```markdown
## Connections on the TIMER

### C26: The timer maths copies how the database counts a session
- Tags: `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: the 60 second rule, the way the seconds of a session are counted, the names of the fields of a running session (the type TimerRow), the day rule, or any function in supabase/timer_schema.sql (timer_end, timer_cap_at, timer_row_json, timer_state)
- Then also: the maths copies timer_end: the end is the smaller of now and cap_at (local midnight); a paused session counts up to paused_at only; then whole seconds (cut off, never rounded) of that moment minus started_at minus paused_seconds, never below 0. The 60 second rule is in the database twice (the table rule timer_sessions_min_length and the line v_active >= 60 in timer_end). The fields of TimerRow are the keys that timer_row_json sends: started_at, tz, status, paused_at, paused_seconds, cap_at. A change in a SQL file has to be run again in the Supabase SQL Editor by the owner (the agent cannot run SQL), and the maths and the tests change in the same packet. The checker does not read SQL files, so the SQL side is checked by hand.
- If you forget: the screen shows a different number of seconds than the database saves, for example a session that shows 60 seconds and is not saved, or the other way round.
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MIN_SESSION_SECONDS = 60`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = started_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = paused_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = paused_seconds: number`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = cap_at: string`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = const end = Math.min(toMicros(serverNowMs), cap)`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = Math.floor(Math.max(0, activeMicros) / 1000000)`
- Check by hand: after any change compare supabase/timer_schema.sql with the maths. The 60 in timer_sessions_min_length and in timer_end, the function timer_cap_at, the counting lines in timer_end, and the keys in timer_row_json must still say what the maths says.

### C27: The cut-offs are written in the maths and written again in the tests, on purpose
- Tags: `AB:TIMER.MATHS`, `AB:TIMER.TESTS`
- If you change: any number at the top of timerMaths.ts: the 60 second rule, the quality cut-offs (10, 30 and 90 minutes), GO BACK IN (under 45 minutes), the milestone minutes, the 10 second live step, the 3600 second ring loop
- Then also: the same numbers are written again in the tests, so that the tests say what the owner decided. Change both, run npm test, and only change a number the owner has decided to change (PRO_TIMER_PLAN_DECISIONS.md). A cut-off or the 60 second rule is NOT a tiny change: it is also linked to the database (C26). The neon colours and the first ring colour are safe to tune alone and are not pinned.
- If you forget: npm test fails, or this checker fails first.
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const SOLID_FROM_SECONDS = 600`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const DEEP_FROM_SECONDS = 1800`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const FLOW_FROM_SECONDS = 5400`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const GO_BACK_IN_LIMIT_SECONDS = 2700`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MILESTONE_MINUTES = [15, 25, 45, 60, 90, 120, 150, 180] as const`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const MAX_LIVE_STEP_SECONDS = 10`
- Anchor: `AB:TIMER.MATHS @ src/lib/timerMaths.ts = export const RING_LOOP_SECONDS = 3600`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(MIN_SESSION_SECONDS).toBe(60)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(SOLID_FROM_SECONDS).toBe(600)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(DEEP_FROM_SECONDS).toBe(1800)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(FLOW_FROM_SECONDS).toBe(5400)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(GO_BACK_IN_LIMIT_SECONDS).toBe(2700)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect([...MILESTONE_MINUTES]).toEqual([15, 25, 45, 60, 90, 120, 150, 180])`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(MAX_LIVE_STEP_SECONDS).toBe(10)`
- Anchor: `AB:TIMER.TESTS @ src/lib/timerMaths.test.ts = expect(RING_LOOP_SECONDS).toBe(3600)`

```

## STEP 8: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add these two lines:
```
- Packet 05A: the Pro Timer database is set up in Supabase (two tables, row-level security, eight functions). The SQL is in supabase/timer_schema.sql and supabase/timer_verify.sql. The owner ran both by hand and all 5 check rows matched.
- Packet 05B: the Pro Timer maths as pure functions in src/lib/timerMaths.ts, with automated tests in src/lib/timerMaths.test.ts (run them with npm test, vitest).
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 9: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 19 tags, 27 places
CONNECTIONS OK: 27 connections, 122 anchors, 21 classes, 1 css variables, 2 label links
```
(19 tags and 27 places: two new tags in two files. 27 connections and 122 anchors: the new entries C26 and C27. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `package-lock.json` and `package.json`, and it may also list the three files named in the rules (they had changes before this packet). If ANY other tracked file is listed: **STOP** and report the COMPLETE output. Do not commit.

## STEP 10: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add package.json package-lock.json src/lib/timerMaths.ts src/lib/timerMaths.test.ts CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05B: Pro Timer maths and automated tests"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The three files named in the rules and untracked files may still show: leave them alone.

## STEP 11: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (100 anchors).
2. `npm pkg get scripts.test` printed `"vitest run"` and `npm ls vitest --depth=0` showed `vitest@5.0.3`.
3. The two fingerprint lines of Step 4 matched exactly.
4. `npm test` printed `Test Files  1 passed (1)` and `Tests  180 passed (180)`.
5. `node scripts/check-tags.mjs` printed the two lines of Step 9 (27 connections, 122 anchors).
6. `npm run build` finished with no errors.
7. `git show --stat HEAD` lists exactly these 7 files: `package.json`, `package-lock.json`, `src/lib/timerMaths.ts`, `src/lib/timerMaths.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
8. The first line of `git log --oneline` ends with `Packet 05B: Pro Timer maths and automated tests`.
9. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
10. `git push` finished without an error.
11. No file other than the ones named in this packet was created, edited or committed.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 11 done-checks
- the RAW outputs of the 5 commands of Step 0
- the RAW outputs of the 3 commands of Step 1
- the exact two lines printed in Step 4
- the last 8 lines of the output of `npm test`
- the exact output of `node scripts/check-tags.mjs` from Step 9
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 9
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 10
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.
