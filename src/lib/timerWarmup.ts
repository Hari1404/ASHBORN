import { deviceTimeZone, timerDayTotal, timerState } from "@/lib/timerApi"
import { localDay } from "@/lib/timerMaths"

// AB:TIMER.WARMUP:START
// The warm-up of the Pro Timer: things the timer screen needs are done early, so the screen opens quickly. Everything here is caught and ignored: the warm-up can never break the screen. See CONNECTIONS.md C44.
// The font of the clock digits is loaded. It must be the family and the weight of .ab-timer-big in timer.css (CONNECTIONS.md C32).
export const WARM_FONT = '500 16px "Space Grotesk Variable"'
// Every character a clock can show (formatClock writes digits and colons).
export const WARM_FONT_TEXT = "0123456789:"
// The wait before the warm-up runs in a browser that has no idle callback (Safari), and the longest the quiet moment of another browser may be waited for.
export const WARM_FALLBACK_MS = 800
export const WARM_IDLE_TIMEOUT_MS = 3000

let webgl2: boolean | null = null
let warmed = false

// Whether this browser can draw the ball and the moving background (both need WebGL 2). The browser is asked once for the whole page and the answer, yes or no, is kept. The test context is given back at once.
export function canDrawWebgl2(): boolean {
  if (webgl2 !== null) return webgl2
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2")
    if (gl === null || gl === undefined) {
      webgl2 = false
    } else {
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      webgl2 = true
    }
  } catch {
    webgl2 = false
  }
  return webgl2
}

// Makes the page forget what the warm-up did. Only the tests use it.
export function forgetWarmup(): void {
  webgl2 = null
  warmed = false
}

function warmFont(): void {
  try {
    const loading = document.fonts?.load(WARM_FONT, WARM_FONT_TEXT)
    loading?.catch(() => {})
  } catch {
    // no font loading in this browser: the font loads when the screen needs it
  }
}

// The first reading is on a cold connection. Asking for the state and for the day total of this device once opens the connection; the answers are thrown away.
function warmDatabase(): void {
  try {
    const day = localDay(Date.now(), deviceTimeZone())
    timerState().catch(() => {})
    timerDayTotal(day).catch(() => {})
  } catch {
    // the real reading will ask again and show a problem if there is one
  }
}

function warmNow(withDatabase: boolean): void {
  warmFont()
  if (withDatabase) warmDatabase()
  canDrawWebgl2()
}

// Runs once per page load, a moment after the first picture. withDatabase is false when the page was opened straight on the Pro Timer, which reads the database itself at once.
export function warmTimerScreen(withDatabase: boolean): void {
  if (warmed) return
  warmed = true
  const run = () => warmNow(withDatabase)
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: WARM_IDLE_TIMEOUT_MS })
  } else {
    window.setTimeout(run, WARM_FALLBACK_MS)
  }
}
// AB:TIMER.WARMUP:END
