// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { StrictMode, act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import GradientASCII, { type GradientASCIIProps } from "./GradientASCII"

// AB:OVERVIEW.TESTS:START
// Tests of the library file GradientASCII.tsx, which has three documented edits (CONNECTIONS.md C59): the intro lasts 2 seconds, and the canvas is made in the effect and taken away in the cleanup. jsdom has no WebGL, so every canvas gets a FAKE graphics context that behaves like a real one where it matters here: once a canvas has given its context back (loseContext), asking that canvas again gives the same dead context, and a dead context makes no shader (the same as the one of BackgroundCanvas.test.tsx, CONNECTIONS.md C52). That the animation really draws is the look in a real browser, not tested here.
const source = readFileSync("src/components/GradientASCII.tsx", "utf8")

type Fake = {
  canvas: HTMLCanvasElement
  lost: boolean
  asked: number
  draws: number
  lostCalls: number
  trails: number[][]
  clicks: number[][]
}

const fakes: Fake[] = []
const byCanvas = new WeakMap<HTMLCanvasElement, { fake: Fake; gl: unknown }>()
// The numbers of the three real WebGL constants that the animation compares; every other constant is 1 here.
const CONSTANTS: Record<string, number> = { COMPILE_STATUS: 0x8b81, LINK_STATUS: 0x8b82, ACTIVE_UNIFORMS: 0x8b86 }

function makeContext(canvas: HTMLCanvasElement) {
  const fake: Fake = { canvas, lost: false, asked: 0, draws: 0, lostCalls: 0, trails: [], clicks: [] }
  fakes.push(fake)
  let uniform4Calls = 0
  const methods: Record<string, (...args: unknown[]) => unknown> = {
    createShader: () => (fake.lost ? null : {}),
    getShaderParameter: (_s, pname) => (pname === CONSTANTS.COMPILE_STATUS ? true : null),
    createProgram: () => (fake.lost ? null : {}),
    getProgramParameter: (_p, pname) => (pname === CONSTANTS.ACTIVE_UNIFORMS ? 0 : pname === CONSTANTS.LINK_STATUS ? true : null),
    getUniformLocation: () => ({}),
    createTexture: () => ({}),
    createFramebuffer: () => ({}),
    createVertexArray: () => ({}),
    getExtension: (name) =>
      name === "WEBGL_lose_context"
        ? {
            loseContext: () => {
              fake.lost = true
              fake.lostCalls += 1
            },
          }
        : null,
    isContextLost: () => fake.lost,
    drawArrays: () => {
      if (!fake.lost) fake.draws += 1
    },
    // The animation sets the trail of the mouse first and the clicks second, once for every picture.
    uniform4fv: (_location, data) => {
      if (fake.lost) return
      const copy = Array.from(data as Float32Array)
      if (uniform4Calls % 2 === 0) fake.trails.push(copy)
      else fake.clicks.push(copy)
      uniform4Calls += 1
    },
  }
  const gl = new Proxy(
    {},
    {
      get(_target, property) {
        if (typeof property !== "string") return undefined
        if (property in methods) return methods[property]
        if (/^[A-Z][A-Z0-9_]*$/.test(property)) return CONSTANTS[property] ?? 1
        return () => undefined
      },
    },
  )
  return { fake, gl }
}

const fake2d = {
  clearRect() {},
  fillRect() {},
  fillText() {},
  getImageData: () => ({ data: [0, 0, 0, 255] }),
  fillStyle: "",
  font: "",
  textAlign: "",
  textBaseline: "",
}

const frames: ((now: number) => void)[] = []
let root: Root | null = null
let container: HTMLElement | null = null
let clock = 0

function mount(props: GradientASCIIProps = {}, strict = false): void {
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  const element = createElement(GradientASCII, props)
  act(() => root?.render(strict ? createElement(StrictMode, null, element) : element))
}

function unmount(): void {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
}

// Runs the pictures that the animation asked for.
function frame(count = 1): void {
  for (let i = 0; i < count; i += 1) {
    clock += 16
    const queue = frames.splice(0, frames.length)
    act(() => queue.forEach((callback) => callback(clock)))
  }
}

const live = () => fakes.filter((f) => !f.lost && f.canvas.isConnected)
const newestTrail = () => fakes[fakes.length - 1].trails[fakes[fakes.length - 1].trails.length - 1] ?? []
const newestClicks = () => fakes[fakes.length - 1].clicks[fakes[fakes.length - 1].clicks.length - 1] ?? []
// The z of every point of the trail (the third number of each group of four) and the strength of every click (the fourth).
const trailStrength = () => newestTrail().filter((_, i) => i % 4 === 2)
const clickStrength = () => newestClicks().filter((_, i) => i % 4 === 3)

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  fakes.length = 0
  frames.length = 0
  clock = 0
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement, type: string) {
    if (type === "2d") return fake2d as unknown as CanvasRenderingContext2D
    if (type !== "webgl2") return null
    let entry = byCanvas.get(this)
    if (!entry) {
      entry = makeContext(this)
      byCanvas.set(this, entry)
    }
    entry.fake.asked += 1
    return entry.gl as WebGL2RenderingContext
  } as typeof HTMLCanvasElement.prototype.getContext)
  vi.stubGlobal("requestAnimationFrame", (callback: (now: number) => void) => frames.push(callback))
  vi.stubGlobal("cancelAnimationFrame", () => {})
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal("matchMedia", () => ({ matches: false }))
})

afterEach(() => {
  if (root) unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("GradientASCII: the three edits of the library file", () => {
  it("has the intro of 2 seconds (the library has 2.4) and says so", () => {
    expect(source).toContain("const INTRO_SECONDS = 2;")
    expect(source).not.toContain("const INTRO_SECONDS = 2.4;")
    expect(source).toContain("ASHBORN edit 1 of 3")
  })

  it("makes its canvas in the effect and not in the markup, and takes it away in the cleanup", () => {
    expect(source).toContain("const canvas = document.createElement('canvas');")
    expect(source).toContain("container.appendChild(canvas);")
    expect(source).toContain("canvas.remove();")
    expect(source).not.toMatch(/<canvas[\s/]/)
    expect(source).not.toContain("canvasRef")
    expect(source).toContain("ASHBORN edit 2 of 3")
    expect(source).toContain("ASHBORN edit 3 of 3")
  })

  it("still gives the context back in the cleanup", () => {
    expect(source).toContain("gl.getExtension('WEBGL_lose_context')?.loseContext();")
  })
})

describe("GradientASCII: its own canvas", () => {
  it("puts one canvas into its box, with a live context, that is hidden from screen readers and fills the box", () => {
    mount()
    const canvases = container?.querySelectorAll("canvas") ?? []
    expect(canvases.length).toBe(1)
    expect(canvases[0].getAttribute("aria-hidden")).toBe("true")
    expect(canvases[0].className).toBe("absolute inset-0 block h-full w-full")
    expect(live().length).toBe(1)
  })

  it("draws a picture with its live context", () => {
    mount()
    expect(fakes[0].draws).toBeGreaterThan(0)
  })

  it("takes the canvas away and gives its context back when it goes away", () => {
    mount()
    const canvas = container?.querySelector("canvas") as HTMLCanvasElement
    const box = container as HTMLElement
    unmount()
    expect(canvas.isConnected).toBe(false)
    expect(box.querySelector("canvas")).toBeNull()
    expect(fakes[0].lost).toBe(true)
  })

  it("is not left empty by React StrictMode (mount, take away, mount again), which left the library background empty in development", () => {
    mount({}, true)
    expect(container?.querySelectorAll("canvas").length).toBe(1)
    expect(live().length).toBe(1)
    const drawsBefore = live()[0].draws
    expect(drawsBefore).toBeGreaterThan(0)
    // The canvas of the first mount was thrown away with its dead context.
    expect(fakes.filter((f) => f.lost).every((f) => !f.canvas.isConnected)).toBe(true)
  })

  it("leaves nothing behind after it is mounted three times in StrictMode and taken away", () => {
    for (let i = 0; i < 3; i += 1) {
      mount({}, true)
      unmount()
    }
    expect(document.querySelectorAll("canvas").length).toBe(0)
    expect(fakes.every((f) => f.lost)).toBe(true)
  })

  it("makes no canvas and does not break when the browser has no WebGL 2", () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation((type: string) => (type === "2d" ? (fake2d as unknown as CanvasRenderingContext2D) : null) as never)
    expect(() => mount()).not.toThrow()
    expect(container?.querySelectorAll("canvas").length).toBe(0)
    expect(() => unmount()).not.toThrow()
  })
})

describe("GradientASCII: the mouse", () => {
  function move(): void {
    act(() => {
      window.dispatchEvent(new PointerEvent("pointermove", { clientX: 0.5, clientY: 0.5 }))
    })
  }
  function click(): void {
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0.5, clientY: 0.5 }))
    })
  }

  it("answers to the mouse and to a click with the settings of the Studio (so that this test can fail)", () => {
    mount({ mouseInteraction: true, clickEffect: "wave" })
    frame()
    move()
    click()
    frame()
    expect(Math.max(...trailStrength())).toBeGreaterThan(0)
    expect(Math.max(...clickStrength())).toBeGreaterThan(0)
  })

  it("does nothing with the mouse and nothing on a click with mouseInteraction false and clickEffect none (the settings of the Overview)", () => {
    mount({ mouseInteraction: false, clickEffect: "none" })
    frame()
    move()
    click()
    move()
    frame(3)
    expect(trailStrength().length).toBeGreaterThan(0)
    expect(Math.max(...trailStrength())).toBe(0)
    expect(clickStrength().length).toBeGreaterThan(0)
    expect(Math.max(...clickStrength())).toBe(0)
  })
})
// AB:OVERVIEW.TESTS:END
