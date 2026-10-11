# PACKET 05E2: THE LIGHT OF THE RAYS GROWS WITH THE SESSION (DIM AT THE START, FULL AT 90 MINUTES)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05E1 (the moving background is Side Rays). Step 0 checks that it is in place and that the files this packet replaces are untouched. If not: **STOP**.
- Edit ONLY these files. TWO files replaced as a whole: `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`. TWO files edited in a few places: `src/components/TimerBackground.tsx`, `src/timer.css`. THREE map files edited: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Create NO new file.
- Do NOT create any helper script, `.ps1` file, note or temp file anywhere. Write the two replaced files with your file-writing tool (put exactly the block in the file). Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/SideRays.tsx`, `src/components/MetaBalls.tsx`, `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them. `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/TimerScreen.test.tsx`, `src/components/TimerBall.tsx` and every file in `src/lib` except the two named above are NOT changed by this packet.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any other install. This packet needs none. Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 8 is allowed.
- Every "find and replace" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
Today the rays of the moving background (Side Rays, Packet 05E1) are equally bright for the whole session. This packet makes the light GROW with the session: the rays are dim when the session starts (30 percent of the full light), get brighter in a straight line, and are at the full light, which is exactly the look of Packet 05E1, after 90 minutes (5400 seconds, the time of the last colour step of the glowing ball, so the colour and the light reach their end together). After that the light stays full. The time that counts is the same `seconds` of the session that give the colour, so the light and the colour always move on together, and a reload or a second device shows the same light.

HOW: the library gets NO new setting. It builds its whole drawing again whenever its intensity changes (that is also why it never gets a colour), so its intensity stays 2.8. Instead a plain black layer is laid over the rays, inside the box of the background, above the tint layer. Its opacity is 1 minus the light of the session: 70 percent black at the start, thinner and thinner, gone at 90 minutes. One new function `bgLight(seconds)` and two numbers (`BG_LIGHT_START`, `BG_LIGHT_FULL_AT_SECONDS`) in `backgroundLook.ts` give the light; `TimerBackground.tsx` puts the layer, sets its opacity from the light, and keeps the light of the last moment while the background fades out (the seconds are 0 then, and without this the layer would jump to its thickest in the middle of the fade; the file already keeps the colour for the same reason); `timer.css` has the layer (`.ab-timer-bg-dim`, z-index 5, above the tint's 4). Nothing else changes: the colour, the fade in and out (700 ms), the dimming, the dimming when paused, no background without WebGL 2 and at lite level 2, the ball, the clocks, the buttons, the timer maths and the database. The drawing cost of the rays stays the same (a darker picture is not a cheaper picture); the black layer is one more full-screen layer that only changes its opacity.

The tests of this packet are in `backgroundLook.test.ts` (10 new ones): the growing of the light, and a read of `TimerBackground.tsx` and `timer.css` that checks the black layer is wired as described, that the light of the last moment is kept while the background fades out, and that the library is never given anything that depends on the seconds.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `src/components/TimerBackground.tsx`, `src/components/SideRays.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/lib/timerMaths.ts`, `src/timer.css`. If any is missing: **STOP** and report which. If `src/components/SideRays.tsx` is one of the missing files, Packet 05E1 has not been run yet: say exactly that in your report.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05E1):
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 40 connections, 230 anchors, 35 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the files this packet changes (`src/components/TimerBackground.tsx`, `src/timer.css`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 05E1`. If none does: **STOP** and report the COMPLETE output (Packet 05E1 was not committed).

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. This ONE command (it prints the fingerprint of each of the four files this packet depends on or replaces as a whole, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/SideRays.tsx","src/timer.css","src/lib/backgroundLook.ts","src/lib/backgroundLook.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
6. This ONE command (information only, never a reason to stop: the planner wants these two fingerprints for the record):
```
foreach ($f in @("src/components/TimerBackground.tsx","src/components/TimerBackground.test.tsx")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must print exactly these four lines (the files exactly as they are after Packet 05E1 and before this packet):
```
src/components/SideRays.tsx f66220f839ea59f0c5831dbdb2efb41344062f2c0bc094bc493a85500974baaf
src/timer.css 6eff8c34b5edbfa1a703d28398009785229652bd7bc9ba32e5d3628eaaecb1d7
src/lib/backgroundLook.ts c4d7155a5be5b3e6fc484e05a14aa90f31943ca6115e61bf7f27a50b62fb317f
src/lib/backgroundLook.test.ts 865ccb0458d7e8c32ef98a423efbd03c5389b2a95ad9185bc630c42bbc8eadb1
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Replace two files as a whole
Each of the two files below already exists. Replace its ENTIRE content with the block below it: delete everything that is in the file and put exactly the block in its place.

Replace the ENTIRE content of the file `src/lib/backgroundLook.ts` with exactly this content:
```ts
import type { LiteLevel } from "@/lib/lite"
import { FLOW_FROM_SECONDS } from "@/lib/timerMaths"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and two functions: no screen, no clock of its own.
// The background is the React Bits animation Side Rays: soft rays of light that sweep in from the top right corner of the screen. The library draws the rays in WHITE, always (both of its ray colours are given white). The colour comes from a tint layer on top of it (see TimerBackground.tsx and CONNECTIONS.md C37), because giving the library another colour makes it build its whole drawing again.
// The intensity is the same: the library builds its whole drawing again whenever its intensity changes, so it always gets the same intensity (BG_SETTINGS) and the light that GROWS while the session goes on comes from a black layer over the rays that gets thinner and thinner (bgLight below, and CONNECTIONS.md C37).
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

// How bright the rays are when a session starts, as a share of the full light (1 = the full light, which is the look of BG_SETTINGS with the dimming of .ab-timer-bg in timer.css). The light grows from here up to 1 while the session goes on.
export const BG_LIGHT_START = 0.3
// After this many seconds of the session the light is full. It is the time of the last colour step (the flow step of timerMaths.ts), so the rays reach full light when the colour reaches its last step.
export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS

// The light of the rays after this many seconds of the session: BG_LIGHT_START at second 0, then growing in a straight line up to 1 at BG_LIGHT_FULL_AT_SECONDS, and 1 from then on. It never goes down while the session goes on. A number that is not a real count of seconds (not a number, or below 0) gives the start light.
export function bgLight(seconds: number): number {
  if (!(seconds > 0)) return BG_LIGHT_START
  if (seconds >= BG_LIGHT_FULL_AT_SECONDS) return 1
  return BG_LIGHT_START + (1 - BG_LIGHT_START) * (seconds / BG_LIGHT_FULL_AT_SECONDS)
}

// Whether the background is drawn: the full look (laptop) and lite level 1 (phones) draw the rays, lite level 2 draws nothing (the screen stays plain black, see src/lib/lite.ts).
const DRAWN_BY_LITE: readonly [boolean, boolean, boolean] = [true, true, false]

export function bgDrawn(liteLevel: LiteLevel): boolean {
  return DRAWN_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
```

Replace the ENTIRE content of the file `src/lib/backgroundLook.test.ts` with exactly this content:
```ts
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
  BG_COLOUR,
  BG_FADE_MS,
  BG_LIGHT_FULL_AT_SECONDS,
  BG_LIGHT_START,
  BG_SETTINGS,
  bgDrawn,
  bgLight,
} from "./backgroundLook"
import { FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "./timerMaths"

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
    expect(BG_SETTINGS.speed).toBe(2.9)
    expect(BG_SETTINGS.tilt).toBe(13)
    expect(BG_SETTINGS.intensity).toBe(2.8)
  })
})

describe("where the background is drawn", () => {
  it("is drawn for the full look and for lite level 1, and not at lite level 2", () => {
    expect(bgDrawn(0)).toBe(true)
    expect(bgDrawn(1)).toBe(true)
    expect(bgDrawn(2)).toBe(false)
  })

  it("never draws at a lighter level what a heavier level does not draw", () => {
    for (const level of [1, 2] as const) {
      if (!bgDrawn((level - 1) as 0 | 1)) expect(bgDrawn(level)).toBe(false)
    }
  })
})

describe("the light of the rays grows with the session", () => {
  it("starts dim and not dark: the light at second 0 is the start light, which is between 0 and 1", () => {
    expect(bgLight(0)).toBe(BG_LIGHT_START)
    expect(BG_LIGHT_START).toBeGreaterThan(0)
    expect(BG_LIGHT_START).toBeLessThan(1)
  })

  it("is full at the time of the last colour step and stays full after it", () => {
    expect(BG_LIGHT_FULL_AT_SECONDS).toBe(FLOW_FROM_SECONDS)
    expect(bgLight(FLOW_FROM_SECONDS)).toBe(1)
    expect(bgLight(FLOW_FROM_SECONDS * 4)).toBe(1)
  })

  it("grows in a straight line: halfway through the time the light is halfway between the start light and full", () => {
    expect(bgLight(BG_LIGHT_FULL_AT_SECONDS / 2)).toBeCloseTo((BG_LIGHT_START + 1) / 2, 10)
  })

  it("never gets dimmer while the session goes on (checked every minute, also after the light is full)", () => {
    let before = bgLight(0)
    for (let s = 60; s <= BG_LIGHT_FULL_AT_SECONDS + 3600; s += 60) {
      const now = bgLight(s)
      expect(now).toBeGreaterThanOrEqual(before)
      before = now
    }
  })

  it("is brighter after the first colour step than at the start, and not yet full just before the last colour step", () => {
    expect(bgLight(SOLID_FROM_SECONDS)).toBeGreaterThan(bgLight(0))
    expect(bgLight(BG_LIGHT_FULL_AT_SECONDS - 1)).toBeLessThan(1)
  })

  it("stays between the start light and 1 for every number, also for numbers that are not seconds", () => {
    for (const odd of [Number.NaN, -1, -Infinity, 0.5, 1e12, Infinity]) {
      const light = bgLight(odd)
      expect(light).toBeGreaterThanOrEqual(BG_LIGHT_START)
      expect(light).toBeLessThanOrEqual(1)
    }
    expect(bgLight(Number.NaN)).toBe(BG_LIGHT_START)
    expect(bgLight(-1)).toBe(BG_LIGHT_START)
    expect(bgLight(Infinity)).toBe(1)
  })
})

describe("the growing light is drawn by a black layer over the rays, never by the library", () => {
  const source = readFileSync("src/components/TimerBackground.tsx", "utf8")
  const css = readFileSync("src/timer.css", "utf8")
  const block = (selector: string): string => {
    const start = css.indexOf(selector + " {")
    expect(start).toBeGreaterThan(-1)
    return css.slice(start, css.indexOf("}", start))
  }

  it("lays the black layer after the tint layer, with an opacity of 1 minus the light of the session", () => {
    const tint = source.indexOf("<Tint target={target} />")
    const dim = source.indexOf('<div className="ab-timer-bg-dim" style={{ opacity: 1 - light }} />')
    expect(tint).toBeGreaterThan(-1)
    expect(dim).toBeGreaterThan(tint)
  })

  it("gives the library the same intensity all the time, because a new intensity makes it build its whole drawing again", () => {
    const rays = /<SideRays[\s\S]*?\/>/.exec(source)?.[0] ?? ""
    expect(rays).toContain("intensity={BG_SETTINGS.intensity}")
    expect(rays).not.toContain("bgLight")
    expect(rays).not.toContain("seconds")
    expect(rays).not.toContain("light")
  })

  it("keeps the light of the last moment while the background fades out, the same way as the colour (the seconds are 0 then)", () => {
    expect(source).toContain("const light = bgLight(seconds)")
    expect(source).toContain("if (active && heldLight !== light) setHeldLight(light)")
    expect(source).toContain("light={active ? light : heldLight}")
  })

  it("makes the black layer cover the whole box, plain black, above the tint layer, and never catching a tap", () => {
    const dim = block(".ab-timer-bg-dim")
    expect(dim).toContain("position: absolute;")
    expect(dim).toContain("inset: 0;")
    expect(dim).toContain("background: #000;")
    expect(dim).toContain("pointer-events: none;")
    const dimZ = Number(/z-index:\s*(\d+);/.exec(dim)?.[1])
    const tintZ = Number(/z-index:\s*(\d+);/.exec(block(".ab-timer-bg-tint"))?.[1])
    expect(tintZ).toBeGreaterThan(0)
    expect(dimZ).toBeGreaterThan(tintZ)
  })
})
// AB:TIMER.TESTS:END
```

## STEP 2: Edit `src/components/TimerBackground.tsx`
In the file `src/components/TimerBackground.tsx` make exactly these 5 changes, one after the other. Each old text must be found EXACTLY ONCE in that file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one.

**Change 1 of 5.** Find this text:
```text
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgDrawn } from "@/lib/backgroundLook"
```
and replace it with:
```text
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgDrawn, bgLight } from "@/lib/backgroundLook"
```

**Change 2 of 5.** Find this text:
```text
function LitBackground({ target, still }: { target: string; still: boolean }) {
```
and replace it with:
```text
function LitBackground({ target, light, still }: { target: string; light: number; still: boolean }) {
```

**Change 3 of 5.** Find this text:
```text
<Tint target={target} />
```
and replace it with:
```text
<Tint target={target} />
      {/* The black layer that makes the light grow with the session: thick at the start, thinner and thinner, gone when the light is full (bgLight in backgroundLook.ts, CONNECTIONS.md C37). Its opacity is set here and never on the library animation. */}
      <div className="ab-timer-bg-dim" style={{ opacity: 1 - light }} />
```

**Change 4 of 5.** Find this text:
```text
if (active && held !== target) setHeld(target)
```
and replace it with:
```text
if (active && held !== target) setHeld(target)

  // The light of the rays (bgLight in backgroundLook.ts, CONNECTIONS.md C37) follows the seconds of the session. Like the colour, the light of the last moment is kept while the background fades out: the seconds are 0 then, and without this the black layer would jump to its thickest in the middle of the fade.
  const light = bgLight(seconds)
  const [heldLight, setHeldLight] = useState(light)
  if (active && heldLight !== light) setHeldLight(light)
```

**Change 5 of 5.** Find this text:
```text
<LitBackground key={lit} target={active ? target : held} still={still} />
```
and replace it with:
```text
<LitBackground key={lit} target={active ? target : held} light={active ? light : heldLight} still={still} />
```

## STEP 3: Edit `src/timer.css`
In the file `src/timer.css` make exactly this 1 change. The old text must be found EXACTLY ONCE in that file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one.

**Change 1 of 1.** Find this text:
```text
.ab-timer-bg-tint {
  position: absolute;
  inset: 0;
  z-index: 4;
  mix-blend-mode: multiply;
}
```
and replace it with:
```text
.ab-timer-bg-tint {
  position: absolute;
  inset: 0;
  z-index: 4;
  mix-blend-mode: multiply;
}

/* The black layer that makes the light of the rays grow with the session (CONNECTIONS.md C37). It lies over the tint layer and over the whole box, plain black, and TimerBackground.tsx sets its opacity to 1 minus the light of the session (bgLight in backgroundLook.ts): mostly black at the start, gone when the light is full. Its z-index must stay higher than the tint's (4). */
.ab-timer-bg-dim {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: #000;
  pointer-events: none;
}
```

## STEP 4: Check that the files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/lib/backgroundLook.ts","src/lib/backgroundLook.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these two lines:
```
src/lib/backgroundLook.ts ce77b90bc4eac6ef48a2a8c7734bd71482c680f399e1721d47ebf4be0ec07fe6
src/lib/backgroundLook.test.ts 10d06916566e80c53ba6ddf00970fb1cfc72bcfbc9eae37306c2631426d28bb4
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/lib/backgroundLook.ts 41, src/lib/backgroundLook.test.ts 138.)

## STEP 5: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  10 passed (10)` and a line `Tests  565 passed (565)` (555 from before, plus 10 new tests in `backgroundLook.test.ts`). It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 6: Edit `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`
Change nothing else in these files.

**`CODE_MAP.md`: two rows.** Each old line must be found EXACTLY ONCE (it is a whole line of the file). Replace it with the new line below it.

Row 1 of 2. Replace this whole line:
```
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values: the white given to the library, the animation settings the owner chose (speed, tilt, intensity), which lite levels draw it (the lightest level draws nothing), the fade time | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the lite levels that draw it; the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the white (BG_COLOUR) must stay white, see CONNECTIONS.md C37 |
```
with this whole line:
```
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values: the white given to the library, the animation settings the owner chose (speed, tilt, intensity), how the light of the rays grows while a session goes on (dim at the start, full at the time of the last colour step), which lite levels draw it (the lightest level draws nothing), the fade time | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the lite levels that draw it; the start light (BG_LIGHT_START) and the time the light is full (BG_LIGHT_FULL_AT_SECONDS, which follows the last colour step of timerMaths.ts, see CONNECTIONS.md C37); the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the white (BG_COLOUR) must stay white, see CONNECTIONS.md C37 |
```

Row 2 of 2. Replace this whole line:
```
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Side Rays animation: rays of light that come in from the top right corner): black without a session; it fades in when a session starts, has the colour of the glowing ball at every moment (white at first, then the colours of the session), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 and at lite level 2. The library animation is `src/components/SideRays.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the dimming (opacity), the dimming when paused, the black behind the rays and the fade time in the css (see CONNECTIONS.md C37 and C38); the colour comes from the functions of the ball, see C37 |
```
with this whole line:
```
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Side Rays animation: rays of light that come in from the top right corner): black without a session; it fades in when a session starts, has the colour of the glowing ball at every moment (white at first, then the colours of the session), gets brighter the longer the session goes on (a black layer over the rays that gets thinner), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 and at lite level 2. The library animation is `src/components/SideRays.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the dimming (opacity), the dimming when paused, the black behind the rays, the black layer that makes the light grow (ab-timer-bg-dim) and the fade time in the css (see CONNECTIONS.md C37 and C38); the colour comes from the functions of the ball, see C37 |
```

**`CONNECTIONS.md`: the entry C37, five changes.** All five old texts are inside the entry C37 (the heading line starts with `### C37:`). Each old text must be found EXACTLY ONCE in the file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one. Change nothing else.

**Change 1 of 5.** Find this text:
```text
the functions or the time the tint uses to get its colour (ballTargetColour, blendHex, BALL_BLEND_MS), or the colour steps and palettes of the ball (C34)
```
and replace it with:
```text
the functions or the time the tint uses to get its colour (ballTargetColour, blendHex, BALL_BLEND_MS), the colour steps and palettes of the ball (C34), or the light of the rays (bgLight, BG_LIGHT_START and BG_LIGHT_FULL_AT_SECONDS in backgroundLook.ts, the black layer ab-timer-bg-dim in TimerBackground.tsx and timer.css)
```

**Change 2 of 5.** Find this text:
```text
So is the dimming (opacity) of the box in timer.css, but the white digits must stay easy to read over the brightest ray.
```
and replace it with:
```text
So is the dimming (opacity) of the box in timer.css, but the white digits must stay easy to read over the brightest ray. The light of the rays GROWS while the session goes on, and the library has no part in it: its intensity is fixed (BG_SETTINGS), because the library builds its whole drawing again whenever its intensity changes (the same reason as for the colour). Instead TimerBackground.tsx lays a plain black layer (the class ab-timer-bg-dim) over the tint layer, inside the isolated box, and sets its opacity to 1 minus the light (bgLight of the seconds of the session): thick at the start (BG_LIGHT_START is 0.3, so 70 percent black), thinner and thinner in a straight line, gone when the light is full. The light is full at BG_LIGHT_FULL_AT_SECONDS, which is FLOW_FROM_SECONDS of timerMaths.ts (90 minutes, the time of the last colour step): if that cut-off is changed, the end of the growing moves with it, on purpose. This works only while (1) the black layer comes after the tint layer in TimerBackground.tsx and has a higher z-index than the tint (5, the tint has 4), (2) it covers the whole box and is plain black (background #000) and never catches a tap, (3) its opacity comes from bgLight of the same seconds that give the colour, so the light and the colour move on together, (4) the light of the last moment is kept while the background fades out (heldLight, the same way as the colour is kept in held): the seconds are 0 then, and without it the black layer would jump to its thickest in the middle of the fade, (5) the library is never given anything that depends on the seconds (a test reads TimerBackground.tsx). The full light is the look of BG_SETTINGS with the dimming of the box in timer.css, so the light can never be brighter than that look: to make the end brighter, raise the opacity of .ab-timer-bg in timer.css, and look at the digits again, do not raise BG_LIGHT_START.
```

**Change 3 of 5.** Find this text:
```text
or the rays stay white while the session has a colour, or its colour is not the colour of the ball.
```
and replace it with:
```text
or the rays stay white while the session has a colour, or its colour is not the colour of the ball, or the light does not grow (the rays are as bright at the start as at the end), or it flashes brighter or darker while the background fades out, or the background builds its drawing again every second (the library was given a light that depends on the seconds).
```

**Change 4 of 5.** Find this text:
```text
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_COLOUR = "#ffffff"`
```
and replace it with:
```text
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_COLOUR = "#ffffff"`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_LIGHT_START = 0.3`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <div className="ab-timer-bg-dim" style={{ opacity: 1 - light }} />`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = light={active ? light : heldLight}`
- Anchor: `AB:TIMER.BG @ src/timer.css = z-index: 5;`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = describe("the light of the rays grows with the session", () => {`
```

**Change 5 of 5.** Find this text:
```text
The screen is dark with rays, not one flat colour. The background does not flicker when its colour moves.
```
and replace it with:
```text
The screen is dark with rays, not one flat colour. The background does not flicker when its colour moves. The rays are dim at the start and get brighter minute by minute until 90 minutes, then stay at full light (the look of Packet 05E1).
```

**`PROGRESS.md`.** Find the line that starts with `- Packet 05E1:` (it must be found EXACTLY ONCE). KEEP it. Directly BELOW it add this one line:
```
- Packet 05E2: the light of the moving background grows with the session. The rays are dim when a session starts (30 percent of the full light) and get brighter in a straight line until 90 minutes (the time of the last colour step of the glowing ball), where the light is full, which is the look of Packet 05E1; after that it stays full. The time is the same seconds of the session that give the colour, so the light and the colour move on together. It is done with a plain black layer over the rays that gets thinner (the animation itself is never given a new setting, because it would build its drawing again). With automated tests.
```
If that line is not found exactly once: **STOP** and report.

## STEP 7: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 40 connections, 236 anchors, 36 classes, 2 css variables, 2 label links
```
(C37 has 6 more anchors, 236 instead of 230, and the css has one more class, `ab-timer-bg-dim`, 36 instead of 35. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerBackground.tsx`, `src/lib/backgroundLook.test.ts`, `src/lib/backgroundLook.ts` and `src/timer.css`, and it may also list the two files named in the rules (they had changes before this packet). If ANY other tracked file is listed (for example `package.json`, `package-lock.json` or `src/components/SideRays.tsx`): **STOP** and report the COMPLETE output. Do not commit.

## STEP 8: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/components/TimerBackground.tsx src/lib/backgroundLook.ts src/lib/backgroundLook.test.ts src/timer.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05E2: the light of the background rays grows with the session (dim at the start, full at 90 minutes)"
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
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0, the files this packet changes had no uncommitted changes, and the four fingerprints of Step 0 matched.
2. The two fingerprint lines of Step 4 matched exactly.
3. `npm test` printed `Test Files  10 passed (10)` and `Tests  565 passed (565)`, and `npx tsc -b` printed nothing.
4. `node scripts/check-tags.mjs` printed the two lines of Step 7 (40 connections, 236 anchors, 36 classes).
5. `npm run build` finished with no errors.
6. `git show --stat HEAD` lists exactly these 7 files: `src/components/TimerBackground.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/timer.css`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
7. The first line of `git log --oneline` ends with `Packet 05E2: the light of the background rays grows with the session (dim at the start, full at 90 minutes)`.
8. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
9. `git push` finished without an error.
10. No file other than the ones named in this packet was created, edited or committed, and NO helper script or temp file was created at any time (also not one that was deleted afterwards). `SideRays.tsx` and `MetaBalls.tsx` were not changed.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 10 done-checks. If you had to create a helper file, say so and mark check 10 FAIL.
- the RAW outputs of the 6 commands of Step 0 (and the output of `git diff` of the file if Step 0 stopped), and the output of `node scripts/check-tags.mjs` of Step 0
- the exact two lines printed in Step 4
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
The whole packet is one commit, so one `git revert <hash of the commit of Step 8>` in the planner chat brings back the Side Rays background exactly as Packet 05E1 left it (equally bright for the whole session).

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests use a stand-in for the animation and read two files as text; they cannot see pixels. In the planner's test browser (real Chromium, software WebGL 2, the real Side Rays, the real `bgLight`; the screen around it was a stand-in) the background was drawn at 0, 10, 30, 60 and 90 minutes on a laptop size and a phone size. The brightness of the rays was measured against the same moment with the black layer switched off (full light): 30 percent at the start, 38 percent at 10 minutes, 54 percent at 30 minutes, 77 percent at 60 minutes, and 100 percent at 90 minutes and later (measured at 720 x 450, averaged over eight frames, so that the moving rays do not decide the number). The change of colour at 10, 30 and 90 minutes did not change that. Look yourself, on the laptop AND on the phone:
1. Open `#timer` and press Start. The rays are DIM: a faint glow in the top right corner. They are not black and not as bright as in Packet 05E1.
2. Over the next minutes they get brighter, slowly and without steps. After 10, 30 and 90 minutes the colour moves on as before (to see all of it sooner, ask the planner for a test page that jumps ahead).
3. At 90 minutes the light is full: the same as in Packet 05E1. It does not get brighter after that.
4. Press Pause: the background gets dimmer, as before. The light follows the same seconds as the colour, so if the clock stands still while paused, the light stands still too; press Resume and it grows on from where it was. If the light keeps growing while the clock is paused, tell me.
5. Hold to end the session: the background fades out to black in under a second. It must NOT flash darker or brighter while it fades. If it does, tell me. (The planner checked this in a test render of the real lines of `TimerBackground.tsx` after Packet 05E1 with this packet's five changes: the black layer keeps the opacity of the last moment for the whole fade, 0.35 after 45 minutes stays 0.35. The animation, the ball colours and the lite level were stand-ins in that render, so a look in a real browser is still yours.)
6. The rays must not flicker or stutter when the light grows, and the phone must not get warmer than with Packet 05E1.
7. The numbers you can tune alone: `BG_LIGHT_START` (0.3, the light at the start; 0.5 is calmer to start with less growing, 0.15 is nearly black at the start) in `backgroundLook.ts`; and, for a brighter END, the `opacity: 0.5` of `.ab-timer-bg` in `timer.css` (then look at the white digits again). Tell the planner what you want and the planner writes the next packet.
