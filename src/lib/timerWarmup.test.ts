// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The real timerApi is replaced, so no test ever calls the network.
const api = vi.hoisted(() => ({
  timerState: vi.fn(),
  timerDayTotal: vi.fn(),
}))
vi.mock("@/lib/supabase", () => ({ supabase: null }))
vi.mock("@/lib/timerApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/timerApi")>()
  return { ...actual, ...api, deviceTimeZone: () => "Asia/Kolkata" }
})

import { formatClock } from "@/lib/timerMaths"
import { WARM_FALLBACK_MS, WARM_FONT, WARM_FONT_TEXT, WARM_IDLE_TIMEOUT_MS, canDrawWebgl2, forgetWarmup, useMountDelay, warmTimerScreen } from "./timerWarmup"

// AB:TIMER.TESTS:START
// The css, the page and the database client are read as plain text from the project root, where npm test runs.
const timerCss = readFileSync("src/timer.css", "utf8")
const indexHtml = readFileSync("index.html", "utf8")
const supabaseCode = readFileSync("src/lib/supabase.ts", "utf8")

// 2026-10-07 10:00:00 UTC is 15:30 on 7 October in Asia/Kolkata.
const T0 = Date.parse("2026-10-07T10:00:00Z")

let loseContext = vi.fn()
let canvasMode: "webgl2" | "none" | "throws" = "webgl2"
let fontLoad = vi.fn()

function asks(): number {
  return vi.mocked(HTMLCanvasElement.prototype.getContext).mock.calls.length
}

function setFonts(value: unknown): void {
  Object.defineProperty(document, "fonts", { value, configurable: true })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(T0)
  forgetWarmup()
  canvasMode = "webgl2"
  loseContext = vi.fn()
  fontLoad = vi.fn(async () => [])
  setFonts({ load: fontLoad })
  api.timerState.mockReset()
  api.timerDayTotal.mockReset()
  api.timerState.mockResolvedValue({ serverNowMs: T0, row: null })
  api.timerDayTotal.mockResolvedValue(0)
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) => {
    if (type !== "webgl2") return null
    if (canvasMode === "throws") throw new Error("no context")
    if (canvasMode === "none") return null
    return { getExtension: (name: string) => (name === "WEBGL_lose_context" ? { loseContext } : null) }
  }) as never)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete (window as { requestIdleCallback?: unknown }).requestIdleCallback
  setFonts(undefined)
})

describe("canDrawWebgl2", () => {
  it("is true when the browser gives a WebGL 2 context, and gives the test context back", () => {
    expect(canDrawWebgl2()).toBe(true)
    expect(loseContext).toHaveBeenCalledTimes(1)
  })

  it("is false when the browser gives no WebGL 2", () => {
    canvasMode = "none"
    expect(canDrawWebgl2()).toBe(false)
  })

  it("is false, and does not crash, when asking for the context throws an error", () => {
    canvasMode = "throws"
    expect(canDrawWebgl2()).toBe(false)
  })

  it("asks the browser once for the whole page and remembers the answer, yes or no", () => {
    expect(canDrawWebgl2()).toBe(true)
    expect(canDrawWebgl2()).toBe(true)
    expect(asks()).toBe(1)
    forgetWarmup()
    canvasMode = "none"
    expect(canDrawWebgl2()).toBe(false)
    expect(canDrawWebgl2()).toBe(false)
    expect(asks()).toBe(2)
  })
})

describe("warmTimerScreen: when it runs", () => {
  it("does nothing at once: the first picture is not delayed by it", () => {
    warmTimerScreen(true)
    expect(asks()).toBe(0)
    expect(fontLoad).not.toHaveBeenCalled()
    expect(api.timerState).not.toHaveBeenCalled()
    expect(api.timerDayTotal).not.toHaveBeenCalled()
  })

  it("runs after a short wait in a browser that has no idle callback (Safari)", () => {
    warmTimerScreen(true)
    vi.advanceTimersByTime(WARM_FALLBACK_MS - 1)
    expect(asks()).toBe(0)
    vi.advanceTimersByTime(1)
    expect(asks()).toBe(1)
    expect(fontLoad).toHaveBeenCalledTimes(1)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("uses the quiet moment of the browser when it has one, and tells it not to wait longer than WARM_IDLE_TIMEOUT_MS", () => {
    const idle = vi.fn()
    ;(window as { requestIdleCallback?: unknown }).requestIdleCallback = idle
    warmTimerScreen(true)
    expect(idle).toHaveBeenCalledTimes(1)
    expect(idle.mock.calls[0][1]).toEqual({ timeout: WARM_IDLE_TIMEOUT_MS })
    expect(vi.getTimerCount()).toBe(0)
    expect(asks()).toBe(0)
    idle.mock.calls[0][0]()
    expect(asks()).toBe(1)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("runs once per page load: a second call, also with another answer for the database, does nothing", () => {
    warmTimerScreen(false)
    warmTimerScreen(true)
    vi.advanceTimersByTime(WARM_FALLBACK_MS * 4)
    expect(asks()).toBe(1)
    expect(fontLoad).toHaveBeenCalledTimes(1)
    expect(api.timerState).not.toHaveBeenCalled()
  })
})

describe("warmTimerScreen: what it does", () => {
  it("asks the database for the state and for the day total of this device, and throws the answers away", () => {
    warmTimerScreen(true)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledTimes(1)
    expect(api.timerDayTotal).toHaveBeenCalledWith("2026-10-07")
  })

  it("leaves the database alone when the page was opened straight on the Pro Timer screen, which reads it itself", () => {
    warmTimerScreen(false)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    expect(api.timerState).not.toHaveBeenCalled()
    expect(api.timerDayTotal).not.toHaveBeenCalled()
    expect(fontLoad).toHaveBeenCalledTimes(1)
    expect(asks()).toBe(1)
  })

  it("loads the font of the clock digits for the characters of the clocks", () => {
    warmTimerScreen(false)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    expect(fontLoad).toHaveBeenCalledWith(WARM_FONT, WARM_FONT_TEXT)
  })

  it("does the WebGL 2 check, so that the ball and the background find the answer ready", () => {
    warmTimerScreen(false)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    expect(asks()).toBe(1)
    expect(canDrawWebgl2()).toBe(true)
    expect(asks()).toBe(1)
  })
})

describe("warmTimerScreen: nothing can break the screen", () => {
  it("ignores database answers that fail", async () => {
    api.timerState.mockRejectedValue(new Error("no connection"))
    api.timerDayTotal.mockRejectedValue(new Error("no connection"))
    warmTimerScreen(true)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    await vi.advanceTimersByTimeAsync(0)
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("ignores a font that cannot be loaded", async () => {
    fontLoad.mockRejectedValue(new Error("no font"))
    warmTimerScreen(false)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    await vi.advanceTimersByTimeAsync(0)
    expect(fontLoad).toHaveBeenCalledTimes(1)
  })

  it("ignores a browser that has no font loading at all, and still does the rest", () => {
    setFonts(undefined)
    warmTimerScreen(true)
    vi.advanceTimersByTime(WARM_FALLBACK_MS)
    expect(api.timerState).toHaveBeenCalledTimes(1)
    expect(asks()).toBe(1)
  })

  it("ignores a font loading that throws at once", () => {
    setFonts({
      load: () => {
        throw new Error("broken")
      },
    })
    warmTimerScreen(true)
    expect(() => vi.advanceTimersByTime(WARM_FALLBACK_MS)).not.toThrow()
    expect(api.timerState).toHaveBeenCalledTimes(1)
  })

  it("ignores a database function that throws at once", () => {
    api.timerState.mockImplementation(() => {
      throw new Error("broken")
    })
    warmTimerScreen(true)
    expect(() => vi.advanceTimersByTime(WARM_FALLBACK_MS)).not.toThrow()
    expect(asks()).toBe(1)
  })

  it("ignores a browser whose WebGL 2 check throws", () => {
    canvasMode = "throws"
    warmTimerScreen(false)
    expect(() => vi.advanceTimersByTime(WARM_FALLBACK_MS)).not.toThrow()
  })
})

describe("useMountDelay: the wait before a library animation is made", () => {
  type Probe = { lit: number; active: boolean; ms: number }
  let root: Root | null = null
  let holder: HTMLElement | null = null

  // The answer of the hook is written into the page, so the test reads it from there.
  function Reader(props: Probe) {
    return createElement("p", { "data-ready": String(useMountDelay(props.lit, props.active, props.ms)) })
  }

  function isReady(): boolean {
    return holder?.querySelector("p")?.getAttribute("data-ready") === "true"
  }

  function put(props: Probe): void {
    if (holder === null) {
      ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
      holder = document.createElement("div")
      root = createRoot(holder)
    }
    act(() => root?.render(createElement(Reader, props)))
  }

  function pass(ms: number): void {
    act(() => {
      vi.advanceTimersByTime(ms)
    })
  }

  afterEach(() => {
    act(() => root?.unmount())
    root = null
    holder = null
  })

  it("is ready at once when the wait is 0, and for a negative wait", () => {
    put({ lit: 1, active: true, ms: 0 })
    expect(isReady()).toBe(true)
    put({ lit: 1, active: true, ms: -5 })
    expect(isReady()).toBe(true)
  })

  it("is not ready before the wait is over, and is ready when it is over", () => {
    put({ lit: 1, active: true, ms: 300 })
    expect(isReady()).toBe(false)
    pass(299)
    expect(isReady()).toBe(false)
    pass(1)
    expect(isReady()).toBe(true)
  })

  it("is never ready for light number 0 (no session has been lit)", () => {
    put({ lit: 0, active: true, ms: 300 })
    pass(5000)
    expect(isReady()).toBe(false)
  })

  it("starts the wait again when a new light is lit", () => {
    put({ lit: 1, active: true, ms: 300 })
    pass(300)
    expect(isReady()).toBe(true)
    put({ lit: 2, active: true, ms: 300 })
    expect(isReady()).toBe(false)
    pass(299)
    expect(isReady()).toBe(false)
    pass(1)
    expect(isReady()).toBe(true)
  })

  it("is never ready when the session ends during the wait, also when the wait runs out later", () => {
    put({ lit: 1, active: true, ms: 300 })
    pass(200)
    put({ lit: 1, active: false, ms: 300 })
    pass(5000)
    expect(isReady()).toBe(false)
  })

  it("stays ready when the session ends after the wait, so that the fade out can be seen", () => {
    put({ lit: 1, active: true, ms: 300 })
    pass(300)
    put({ lit: 1, active: false, ms: 300 })
    expect(isReady()).toBe(true)
    pass(5000)
    expect(isReady()).toBe(true)
  })

  it("leaves no timer behind when the screen goes away during the wait", () => {
    put({ lit: 1, active: true, ms: 300 })
    expect(vi.getTimerCount()).toBe(1)
    act(() => root?.unmount())
    expect(vi.getTimerCount()).toBe(0)
    root = null
    holder = null
  })
})

describe("what the warm-up is tied to", () => {
  it("loads the same font, in the same weight, that the clock digits use in timer.css", () => {
    expect(WARM_FONT).toContain('"Space Grotesk Variable"')
    expect(timerCss).toContain('font-family: "Space Grotesk Variable"')
    const big = /\n\.ab-timer-big \{([^}]*)\}/.exec(timerCss)?.[1] ?? ""
    const weight = /font-weight:\s*(\d+)/.exec(big)?.[1]
    expect(weight).toBe("500")
    expect(WARM_FONT.startsWith(weight + " ")).toBe(true)
  })

  it("asks for every character the clocks can show", () => {
    for (const seconds of [0, 59, 60, 3599, 3600, 86_399, 90_000, 359_999]) {
      for (const char of formatClock(seconds)) expect(WARM_FONT_TEXT).toContain(char)
    }
  })

  it("has the preconnect line for the database in index.html, with the same setting that the database client reads", () => {
    expect(indexHtml).toContain('<link rel="preconnect" href="%VITE_SUPABASE_URL%" crossorigin />')
    expect(supabaseCode).toContain("import.meta.env.VITE_SUPABASE_URL")
  })

  it("puts the preconnect line in the head, before the title", () => {
    const head = indexHtml.slice(indexHtml.indexOf("<head>"), indexHtml.indexOf("</head>"))
    expect(head).toContain("rel=\"preconnect\"")
    expect(head.indexOf("rel=\"preconnect\"")).toBeLessThan(head.indexOf("<title>"))
  })
})
// AB:TIMER.TESTS:END
