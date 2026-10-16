// @vitest-environment jsdom
import { StrictMode, act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { BG_PALETTES, BG_SETTINGS } from "@/lib/backgroundLook"
import { FIELD_FRAGMENT, FIELD_UNIFORM_NAMES, RAMP_SIZE, canvasPixels, fieldUniforms, rampBytes } from "@/lib/backgroundRender"
import BackgroundCanvas, { type BackgroundCanvasProps } from "./BackgroundCanvas"

// AB:TIMER.TESTS:START

// Tests of the canvas of the moving background (BackgroundCanvas.tsx). jsdom has no WebGL, so the canvas gets a FAKE graphics context that writes down everything it is asked to do. The frames of the screen, the size of the box, the resize observer and the visibility of the page are made by hand in the tests.
// The fake context behaves like the context of a browser where it matters here: once a canvas has given its context back (loseContext), asking that canvas for a context again gives the same dead context and never a new one. That is the reason the canvas makes its own canvas in its effect (see the note at the top of BackgroundCanvas.tsx).
// The fake context also keeps the state of a real one that matters for the ORDER of the calls (the active texture unit, what is bound to it, the program in use, which shaders a program has, whether it is linked, the viewport, what the texture holds) and writes down every call that a real WebGL would refuse or ignore. After every test it is checked that there was none (see afterEach). It can also play a browser that has no WEBGL_lose_context.
// That these tests can fail was checked by putting faults into BackgroundCanvas.tsx one at a time (152 single faults and 8 faults of order): see evidence/scripts/fault_check_canvas.py and evidence/FAULT_CHECK_BackgroundCanvas.md.
// That the shader really compiles and draws is not tested here: it is the look in a real browser. The numbers and the text of the shader are tested in src/lib/backgroundRender.test.ts.

// The numbers of the real WebGL constants that the canvas uses.
const GL = {
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  TEXTURE0: 0x84c0,
  TEXTURE_2D: 0x0de1,
  RGBA: 0x1908,
  UNSIGNED_BYTE: 0x1401,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  LINEAR: 0x2601,
  CLAMP_TO_EDGE: 0x812f,
  TRIANGLES: 0x0004,
} as const

// What the fake context does when it is asked (a test sets it, it is reset before every test).
const behaviour = {
  context: "ok" as "ok" | "none" | "throws",
  compileFails: "none" as "none" | "vertex" | "fragment",
  linkFails: false,
  noShader: false,
  noProgram: false,
  noTexture: false,
  // The browser has no WEBGL_lose_context (getExtension gives null).
  noLoseExtension: false,
}

type Fake = {
  canvas: HTMLCanvasElement
  // True once the context is lost (the browser took it, or the page gave it back).
  lost: boolean
  gl: Record<string, unknown>
  // Every call by name, with its arguments.
  calls: Record<string, unknown[][]>
  // A copy of every row of colours that was sent to the texture.
  ramps: Uint8Array[]
  // Every uniform that was set, in order.
  uniformLog: { setter: string; name: string; values: number[] }[]
  // The newest value of every uniform, and a copy of all of them at every draw.
  latest: Record<string, number[]>
  frames: Record<string, number[]>[]
  // At every draw: the program in use, what is bound to texture unit 0, where the sampler points, and the row of colours that texture held at that moment.
  draws: { program: unknown; texture: unknown; sampler: number | undefined; ramp: Uint8Array | null }[]
  // Every call that a real WebGL would refuse or ignore (a texture call with no texture bound, a uniform set with the wrong program in use, a draw with an empty texture, and so on).
  errors: string[]
  made: { shaders: { type: number; source: string }[]; programs: object[]; textures: object[] }
}

const contexts: Fake[] = []
const byCanvas = new WeakMap<HTMLCanvasElement, Fake>()
let asked: { type: string; options: unknown }[] = []

function makeFake(canvas: HTMLCanvasElement): Fake {
  const fake: Fake = { canvas, lost: false, gl: {}, calls: {}, ramps: [], uniformLog: [], latest: {}, frames: [], draws: [], errors: [], made: { shaders: [], programs: [], textures: [] } }
  // A little of the state of a real graphics context, so that a call made in the wrong state or in the wrong order shows up in `errors`: the active texture unit, what is bound to every unit, the program in use, the viewport, and what a program and a texture were given so far.
  type FakeProgram = { kind: "program"; attached: object[]; linked: boolean }
  type FakeTexture = { kind: "texture"; allocated: boolean; ramp: Uint8Array | null }
  type FakeLocation = { name: string; program: object }
  let unit: number = GL.TEXTURE0
  const bound = new Map<number, FakeTexture>()
  let inUse: FakeProgram | null = null
  let viewport: number[] = [0, 0, canvas.width, canvas.height]
  const refuse = (message: string) => {
    fake.errors.push(message)
  }
  const boundTexture = (name: string): FakeTexture | null => {
    const texture = bound.get(unit) ?? null
    if (texture === null) refuse(`${name} with no texture bound`)
    return texture
  }
  const locations = new Map<object, Map<string, FakeLocation>>()
  const method = (name: string, impl?: (...args: unknown[]) => unknown) => {
    fake.gl[name] = (...args: unknown[]) => {
      ;(fake.calls[name] ??= []).push(args)
      return impl?.(...args)
    }
  }
  const setUniform = (setter: string, location: unknown, values: unknown[]) => {
    const found = location as FakeLocation | null
    const name = found?.name ?? "(none)"
    const numbers = values.map(Number)
    fake.uniformLog.push({ setter, name, values: numbers })
    // A real WebGL ignores a null location, and refuses a uniform when the program it belongs to is not the one in use.
    if (found === null) return
    if (inUse === null || inUse !== found.program) {
      refuse(`${setter}(${name}) with ${inUse === null ? "no program" : "another program"} in use`)
      return
    }
    fake.latest[name] = numbers
  }
  Object.assign(fake.gl, GL)
  method("createShader", (type) => {
    if (behaviour.noShader) return null
    const shader = { type: Number(type), source: "" }
    fake.made.shaders.push(shader)
    return shader
  })
  method("shaderSource", (shader, source) => {
    ;(shader as { source: string }).source = String(source)
  })
  method("compileShader")
  method("getShaderParameter", (shader, pname) => {
    if (pname !== GL.COMPILE_STATUS) return null
    const type = (shader as { type: number }).type
    if (behaviour.compileFails === "vertex" && type === GL.VERTEX_SHADER) return false
    if (behaviour.compileFails === "fragment" && type === GL.FRAGMENT_SHADER) return false
    return true
  })
  method("deleteShader")
  method("createProgram", () => {
    if (behaviour.noProgram) return null
    const program: FakeProgram = { kind: "program", attached: [], linked: false }
    fake.made.programs.push(program)
    return program
  })
  method("attachShader", (program, shader) => {
    ;(program as FakeProgram).attached.push(shader as object)
  })
  method("linkProgram", (program) => {
    const target = program as FakeProgram
    target.linked = target.attached.length === 2
  })
  method("getProgramParameter", (_program, pname) => (pname === GL.LINK_STATUS ? !behaviour.linkFails : null))
  method("deleteProgram")
  method("createTexture", () => {
    if (behaviour.noTexture) return null
    const texture: FakeTexture = { kind: "texture", allocated: false, ramp: null }
    fake.made.textures.push(texture)
    return texture
  })
  method("deleteTexture")
  method("activeTexture", (value) => {
    unit = Number(value)
  })
  method("bindTexture", (_target, texture) => {
    if (texture === null) bound.delete(unit)
    else bound.set(unit, texture as FakeTexture)
  })
  method("texImage2D", () => {
    const texture = boundTexture("texImage2D")
    if (texture !== null) texture.allocated = true
  })
  method("texParameteri", () => {
    boundTexture("texParameteri")
  })
  method("texSubImage2D", (...args) => {
    const texture = boundTexture("texSubImage2D")
    if (texture !== null && !texture.allocated) refuse("texSubImage2D on a texture that has no storage yet")
    const bytes = new Uint8Array(args[8] as Uint8Array)
    fake.ramps.push(bytes)
    if (texture !== null) texture.ramp = bytes
  })
  method("getUniformLocation", (program, name) => {
    const owner = program as FakeProgram
    const key = String(name)
    // A real WebGL gives no location for a program that is not linked.
    if (!owner.linked) {
      refuse(`getUniformLocation(${key}) in a program that is not linked`)
      return null
    }
    let own = locations.get(owner)
    if (own === undefined) {
      own = new Map()
      locations.set(owner, own)
    }
    let location = own.get(key)
    if (location === undefined) {
      location = { name: key, program: owner }
      own.set(key, location)
    }
    return location
  })
  method("uniform1i", (location, a) => setUniform("uniform1i", location, [a]))
  method("uniform1f", (location, a) => setUniform("uniform1f", location, [a]))
  method("uniform2f", (location, a, b) => setUniform("uniform2f", location, [a, b]))
  method("viewport", (...args) => {
    viewport = args.map(Number)
  })
  method("useProgram", (program) => {
    if (program !== null && !(program as FakeProgram).linked) refuse("useProgram with a program that is not linked")
    inUse = program as FakeProgram | null
  })
  method("drawArrays", () => {
    const texture = bound.get(GL.TEXTURE0) ?? null
    if (inUse === null) refuse("drawArrays with no program in use")
    if (texture === null || texture.ramp === null) refuse("drawArrays with no row of colours in texture unit 0")
    if (viewport.join() !== [0, 0, canvas.width, canvas.height].join()) refuse(`drawArrays with the viewport ${viewport.join(",")} and not the canvas ${canvas.width}x${canvas.height}`)
    fake.frames.push(Object.fromEntries(Object.entries(fake.latest).map(([name, values]) => [name, [...values]])))
    fake.draws.push({ program: inUse, texture, sampler: fake.latest.uRamp?.[0], ramp: texture?.ramp ? new Uint8Array(texture.ramp) : null })
  })
  method("isContextLost", () => fake.lost)
  method("getExtension", (name) =>
    name === "WEBGL_lose_context" && !behaviour.noLoseExtension
      ? {
          loseContext: () => {
            ;(fake.calls.loseContext ??= []).push([])
            fake.lost = true
          },
        }
      : null,
  )
  return fake
}

function ctx(index = 0): Fake {
  const found = contexts[index]
  if (found === undefined) throw new Error(`no graphics context number ${index} was asked for`)
  return found
}

function called(fake: Fake, name: string): unknown[][] {
  return fake.calls[name] ?? []
}

function lastFrame(fake: Fake = ctx()): Record<string, number[]> {
  const frame = fake.frames.at(-1)
  if (frame === undefined) throw new Error("nothing was drawn")
  return frame
}

// The frames of the screen: a frame is asked for with requestAnimationFrame and comes when the test says so. The clock starts above 0 because the canvas counts a frame time of exactly 0 as "no frame yet".
let frameQueue = new Map<number, FrameRequestCallback>()
let frameId = 0
let clock = 1000

function nextFrame(ms = 16): void {
  clock += ms
  const due = [...frameQueue.values()]
  frameQueue.clear()
  for (const callback of due) callback(clock)
}

function pendingFrames(): number {
  return frameQueue.size
}

// The page: shown or hidden. A page that is hidden gives no frames in a real browser.
let hidden = false

function setHidden(value: boolean, announce = true): void {
  hidden = value
  if (announce) document.dispatchEvent(new Event("visibilitychange"))
}

// The box the canvas fills, as the page measures it.
let rect = { width: 800, height: 600 }

// The resize observers that the canvas made.
type StubObserver = { callback: () => void; observed: Element[]; disconnected: boolean }
let observers: StubObserver[] = []

class FakeResizeObserver {
  callback: () => void
  observed: Element[] = []
  disconnected = false
  constructor(callback: () => void) {
    this.callback = callback
    observers.push(this)
  }
  observe(target: Element): void {
    this.observed.push(target)
  }
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true
  }
}

const COLOURS = [...BG_PALETTES[1]]
const BASE: BackgroundCanvasProps = { ...BG_SETTINGS, colors: COLOURS }

let root: Root | null = null
let container: HTMLElement | null = null

function mountPoint(): void {
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
}

function render(over: Partial<BackgroundCanvasProps> = {}, strict = false): void {
  mountPoint()
  const element = createElement(BackgroundCanvas, { ...BASE, ...over })
  act(() => root?.render(strict ? createElement(StrictMode, null, element) : element))
}

function dispose(): void {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
}

function host(): HTMLElement {
  const found = container?.firstElementChild ?? null
  if (found === null) throw new Error("the box of the canvas is not there")
  return found as HTMLElement
}

function canvases(): HTMLCanvasElement[] {
  return [...(container?.querySelectorAll("canvas") ?? [])]
}

function theCanvas(): HTMLCanvasElement {
  const all = canvases()
  if (all.length !== 1) throw new Error(`expected one canvas, found ${all.length}`)
  return all[0]
}

// What the shader should be given for these props at this pixel ratio.
function expectedFor(props: BackgroundCanvasProps, ratio: number) {
  return fieldUniforms(
    { angle: props.angle, flow: props.flow, scale: props.scale, silk: props.silk, grainAmount: props.grainAmount, grainSize: props.grainSize, shade: props.shade ?? 0 },
    ratio,
  )
}

function sizeObservedBox(width: number, height: number): void {
  rect = { width, height }
  act(() => {
    for (const observer of observers) observer.callback()
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  behaviour.context = "ok"
  behaviour.compileFails = "none"
  behaviour.linkFails = false
  behaviour.noShader = false
  behaviour.noProgram = false
  behaviour.noTexture = false
  behaviour.noLoseExtension = false
  contexts.length = 0
  asked = []
  frameQueue = new Map()
  frameId = 0
  clock = 1000
  hidden = false
  rect = { width: 800, height: 600 }
  observers = []
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (this: HTMLCanvasElement, type: string, options?: unknown) {
    asked.push({ type, options })
    if (type !== "webgl2") return null
    if (behaviour.context === "throws") throw new Error("no context")
    if (behaviour.context === "none") return null
    // A canvas keeps its context for good, a lost one too (the browser gives the same dead context back).
    const known = byCanvas.get(this)
    if (known !== undefined) return known.gl
    const fake = makeFake(this)
    byCanvas.set(this, fake)
    contexts.push(fake)
    return fake.gl
  } as never)
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ ...rect, x: 0, y: 0, top: 0, left: 0, right: rect.width, bottom: rect.height, toJSON: () => ({}) }) as DOMRect,
  )
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frameId += 1
    frameQueue.set(frameId, callback)
    return frameId
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    frameQueue.delete(id)
  })
  vi.stubGlobal("ResizeObserver", FakeResizeObserver)
  vi.stubGlobal("devicePixelRatio", 1)
  Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden })
})

afterEach(() => {
  dispose()
  // The safety net of every test: whatever it did, the canvas never made a call that a real WebGL would refuse (see `errors` in the fake context).
  const refused = contexts.flatMap((fake, index) => fake.errors.map((message) => `graphics context ${index}: ${message}`))
  Reflect.deleteProperty(document, "hidden")
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  expect(refused, "calls that a real WebGL would refuse").toEqual([])
})

describe("BackgroundCanvas: its own canvas", () => {
  it("has no canvas in its markup: the box is empty until its effect makes the canvas", () => {
    const markup = renderToStaticMarkup(createElement(BackgroundCanvas, BASE))
    expect(markup).not.toContain("<canvas")
    expect(markup).toContain("position:relative")
    expect(asked).toHaveLength(0)
  })

  it("makes one canvas inside its box, hidden from screen readers, and fills the box with it", () => {
    render()
    expect(host().children).toHaveLength(1)
    const canvas = theCanvas()
    expect(canvas.parentElement).toBe(host())
    expect(canvas.getAttribute("aria-hidden")).toBe("true")
    expect(canvas.style.position).toBe("absolute")
    expect(canvas.style.display).toBe("block")
    expect(canvas.style.width).toBe("100%")
    expect(canvas.style.height).toBe("100%")
    expect(canvas.style.inset).toBe("0px")
  })

  it("gives its box the full size of the place it is put in, and cuts off what sticks out", () => {
    render()
    expect(host().style.position).toBe("relative")
    expect(host().style.width).toBe("100%")
    expect(host().style.height).toBe("100%")
    expect(host().style.overflow).toBe("hidden")
  })

  it("asks once for a WebGL 2 context without alpha, antialiasing, depth or stencil, and for no other kind", () => {
    render()
    expect(asked).toEqual([{ type: "webgl2", options: { alpha: false, antialias: false, depth: false, stencil: false } }])
  })

  it("makes the texture of the row of colours 256 wide and 1 high, smooth, and without wrapping round at the ends", () => {
    render()
    const fake = ctx()
    expect(called(fake, "texImage2D")).toEqual([[GL.TEXTURE_2D, 0, GL.RGBA, RAMP_SIZE, 1, 0, GL.RGBA, GL.UNSIGNED_BYTE, null]])
    const parameters = called(fake, "texParameteri").map(([, name, value]) => [name, value])
    expect(parameters).toEqual([
      [GL.TEXTURE_MIN_FILTER, GL.LINEAR],
      [GL.TEXTURE_MAG_FILTER, GL.LINEAR],
      [GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE],
      [GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE],
    ])
  })

  it("compiles the vertex and the fragment shader of backgroundRender.ts and links them once", () => {
    render()
    const fake = ctx()
    expect(fake.made.shaders.map((shader) => shader.type)).toEqual([GL.VERTEX_SHADER, GL.FRAGMENT_SHADER])
    expect(fake.made.shaders[1].source).toBe(FIELD_FRAGMENT)
    expect(called(fake, "compileShader")).toHaveLength(2)
    expect(called(fake, "linkProgram")).toHaveLength(1)
    expect(called(fake, "deleteShader")).toHaveLength(2)
  })

  it("attaches both of its shaders to its program, and links that program", () => {
    render()
    const fake = ctx()
    const [vertex, fragment] = fake.made.shaders
    const [program] = fake.made.programs
    const attached = called(fake, "attachShader")
    expect(attached).toHaveLength(2)
    expect(attached).toContainEqual([program, vertex])
    expect(attached).toContainEqual([program, fragment])
    expect(called(fake, "linkProgram")).toEqual([[program]])
  })

  it("makes no call that a real WebGL would refuse or ignore, from the first set-up to the frames (see the safety net after every test)", () => {
    render()
    nextFrame()
    nextFrame()
    expect(ctx().errors).toEqual([])
    expect(ctx().draws).toHaveLength(2)
  })
})

describe("BackgroundCanvas: React StrictMode (mount, take away, mount again), which left the library background gray", () => {
  it("ends with one canvas in the box, and it is the second one that was made", () => {
    render({}, true)
    expect(contexts).toHaveLength(2)
    expect(canvases()).toHaveLength(1)
    expect(theCanvas()).toBe(ctx(1).canvas)
    expect(ctx(0).canvas).not.toBe(ctx(1).canvas)
    expect(ctx(0).canvas.isConnected).toBe(false)
  })

  it("ends with a live context on that canvas, and gives the first one back", () => {
    render({}, true)
    expect(ctx(1).lost).toBe(false)
    expect(called(ctx(1), "loseContext")).toHaveLength(0)
    expect(ctx(0).lost).toBe(true)
    expect(called(ctx(0), "loseContext")).toHaveLength(1)
  })

  it("cleans up the program and the texture of the first mount before giving its context back", () => {
    render({}, true)
    expect(called(ctx(0), "deleteProgram")).toEqual([[ctx(0).made.programs[0]]])
    expect(called(ctx(0), "deleteTexture")).toEqual([[ctx(0).made.textures[0]]])
    expect(called(ctx(1), "deleteProgram")).toHaveLength(0)
  })

  it("draws on the second canvas only", () => {
    render({}, true)
    nextFrame()
    expect(ctx(1).frames).toHaveLength(1)
    expect(ctx(0).frames).toHaveLength(0)
    expect(ctx(0).ramps).toHaveLength(0)
    expect(ctx(1).ramps).toHaveLength(1)
  })

  it("asks for one frame only, the one of the second mount", () => {
    render({}, true)
    expect(pendingFrames()).toBe(1)
  })

  it("would not work with one canvas for both mounts: a canvas that gave its context back only gets the dead one again", () => {
    // This is the model of the browser that the fake context follows, and the reason for the canvas of its own.
    render({}, true)
    const first = ctx(0).canvas
    expect(first.getContext("webgl2")).toBe(ctx(0).gl)
    expect((ctx(0).gl.isContextLost as () => boolean)()).toBe(true)
    expect(contexts).toHaveLength(2)
  })

  it("leaves nothing behind when it is taken away in StrictMode", () => {
    render({}, true)
    dispose()
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(1), "loseContext")).toHaveLength(1)
    expect(called(ctx(1), "deleteProgram")).toHaveLength(1)
    expect(pendingFrames()).toBe(0)
  })
})

describe("BackgroundCanvas: the row of colours is sent again only when the colours change", () => {
  it("sends the row once, with the bytes of rampBytes for its colours and softness, at its first frame", () => {
    render()
    expect(ctx().ramps).toHaveLength(0)
    nextFrame()
    const sent = called(ctx(), "texSubImage2D")
    expect(sent).toHaveLength(1)
    expect(sent[0].slice(0, 8)).toEqual([GL.TEXTURE_2D, 0, 0, 0, RAMP_SIZE, 1, GL.RGBA, GL.UNSIGNED_BYTE])
    expect(ctx().ramps[0]).toEqual(rampBytes(COLOURS, BG_SETTINGS.softness))
  })

  it("does not send it again in later frames with the same colours", () => {
    render()
    for (let i = 0; i < 6; i++) nextFrame()
    expect(ctx().frames).toHaveLength(6)
    expect(ctx().ramps).toHaveLength(1)
  })

  it("does not send it again when the same colours are given as a new list", () => {
    render()
    nextFrame()
    render({ colors: [...COLOURS] })
    nextFrame()
    render({ colors: COLOURS.map((colour) => colour.toUpperCase().replace("#", "#")) })
    nextFrame()
    expect(ctx().ramps).toHaveLength(2)
  })

  it("sends it again, once, when a colour changes, with the bytes of the new colours", () => {
    render()
    nextFrame()
    const changed = [...COLOURS.slice(0, 4), "#ff00aa"]
    render({ colors: changed })
    nextFrame()
    nextFrame()
    nextFrame()
    expect(ctx().ramps).toHaveLength(2)
    expect(ctx().ramps[1]).toEqual(rampBytes(changed, BG_SETTINGS.softness))
    expect(ctx().ramps[1]).not.toEqual(ctx().ramps[0])
  })

  it("sends it again when the softness changes, because the row is made with it", () => {
    render()
    nextFrame()
    render({ softness: 0.2 })
    nextFrame()
    expect(ctx().ramps).toHaveLength(2)
    expect(ctx().ramps[1]).toEqual(rampBytes(COLOURS, 0.2))
  })

  it("sends it again when the number of colours changes", () => {
    render()
    nextFrame()
    render({ colors: COLOURS.slice(0, 3) })
    nextFrame()
    expect(ctx().ramps).toHaveLength(2)
    expect(ctx().ramps[1]).toEqual(rampBytes(COLOURS.slice(0, 3), BG_SETTINGS.softness))
  })

  it("does not send it again when only another setting changes, but the shader gets the new number", () => {
    render()
    nextFrame()
    render({ angle: 90, flow: 2 })
    nextFrame()
    expect(ctx().ramps).toHaveLength(1)
    expect(lastFrame().uDir[0]).toBeCloseTo(0, 12)
    expect(lastFrame().uDir[1]).toBeCloseTo(1, 12)
    expect(lastFrame().uFlow).toEqual([2])
  })

  it("makes the programs once while the colours change 60 times (a blend), and sends the row once for every change", () => {
    render()
    nextFrame()
    for (let i = 1; i <= 60; i++) {
      const step = (i * 4).toString(16).padStart(2, "0")
      render({ colors: [`#${step}0000`, ...COLOURS.slice(1)] })
      nextFrame()
    }
    const fake = ctx()
    expect(contexts).toHaveLength(1)
    expect(fake.made.shaders).toHaveLength(2)
    expect(fake.made.programs).toHaveLength(1)
    expect(fake.made.textures).toHaveLength(1)
    expect(called(fake, "linkProgram")).toHaveLength(1)
    expect(fake.ramps).toHaveLength(61)
    expect(fake.frames).toHaveLength(61)
    expect(canvases()).toHaveLength(1)
  })
})

describe("BackgroundCanvas: what it draws in a frame", () => {
  it("draws one big triangle into the whole canvas with its program and its row of colours", () => {
    render()
    nextFrame()
    const fake = ctx()
    expect(called(fake, "viewport").at(-1)).toEqual([0, 0, 800, 600])
    expect(called(fake, "useProgram").at(-1)).toEqual([fake.made.programs[0]])
    expect(called(fake, "activeTexture").at(-1)).toEqual([GL.TEXTURE0])
    expect(called(fake, "bindTexture").at(-1)).toEqual([GL.TEXTURE_2D, fake.made.textures[0]])
    expect(called(fake, "drawArrays")).toEqual([[GL.TRIANGLES, 0, 3]])
  })

  it("sets every uniform of the shader in every frame, with the call that fits its type (1i for the sampler, 1f for a float, 2f for a vec2)", () => {
    const types = new Map([...FIELD_FRAGMENT.matchAll(/^uniform\s+(\w+)\s+(\w+)\s*;/gm)].map((found) => [found[2], found[1]]))
    const setterOf: Record<string, string> = { sampler2D: "uniform1i", float: "uniform1f", vec2: "uniform2f" }
    const valuesOf: Record<string, number> = { sampler2D: 1, float: 1, vec2: 2 }
    render()
    nextFrame()
    nextFrame()
    const fake = ctx()
    for (const name of FIELD_UNIFORM_NAMES) {
      const type = types.get(name)
      expect(type, name).toBeDefined()
      const sets = fake.uniformLog.filter((entry) => entry.name === name)
      expect(sets, name).toHaveLength(2)
      for (const entry of sets) {
        expect(entry.setter, name).toBe(setterOf[type ?? ""])
        expect(entry.values, name).toHaveLength(valuesOf[type ?? ""])
      }
    }
    expect(fake.uniformLog.map((entry) => entry.name).filter((name) => !(FIELD_UNIFORM_NAMES as readonly string[]).includes(name))).toEqual([])
  })

  it("has its own program in use, its row of colours on texture unit 0 and the sampler pointing at unit 0, at every draw", () => {
    render()
    nextFrame()
    nextFrame()
    const fake = ctx()
    expect(fake.draws).toHaveLength(2)
    for (const draw of fake.draws) {
      expect(draw.program).toBe(fake.made.programs[0])
      expect(draw.texture).toBe(fake.made.textures[0])
      expect(draw.sampler).toBe(0)
      expect(draw.ramp).toEqual(rampBytes(COLOURS, BG_SETTINGS.softness))
    }
  })

  it("passes on every one of its settings: each one changed from its default shows up in its own uniform", () => {
    const custom = { angle: 123, flow: 1.7, scale: 2, silk: 0.6, grainAmount: 0.3, grainSize: 2.5, shade: 0.45 }
    render()
    nextFrame()
    const before = lastFrame()
    render(custom)
    nextFrame()
    const frame = lastFrame()
    const want = expectedFor({ ...BASE, ...custom }, 1)
    expect(frame.uZoom).toEqual([want.zoom])
    expect(frame.uFlow).toEqual([want.flow])
    expect(frame.uDir).toEqual([...want.dir])
    expect(frame.uSilk).toEqual([want.silk])
    expect(frame.uGrain).toEqual([...want.grain])
    expect(frame.uShade).toEqual([want.shade])
    for (const name of ["uZoom", "uFlow", "uDir", "uSilk", "uGrain", "uShade"]) expect(frame[name], name).not.toEqual(before[name])
  })

  it("points the sampler at texture unit 0", () => {
    render()
    nextFrame()
    expect(lastFrame().uRamp).toEqual([0])
  })

  it("gives the shader the numbers of fieldUniforms for its settings, and the size of the canvas", () => {
    render()
    nextFrame()
    const want = expectedFor(BASE, 1)
    const frame = lastFrame()
    expect(frame.uRes).toEqual([800, 600])
    expect(frame.uZoom).toEqual([want.zoom])
    expect(frame.uFlow).toEqual([want.flow])
    expect(frame.uDir).toEqual([...want.dir])
    expect(frame.uSilk).toEqual([want.silk])
    expect(frame.uGrain).toEqual([...want.grain])
    expect(frame.uShade).toEqual([want.shade])
  })

  it("leaves the shade at 0 unless it is given, and passes it on when it is", () => {
    render()
    nextFrame()
    expect(lastFrame().uShade).toEqual([0])
    render({ shade: 0.45 })
    nextFrame()
    expect(lastFrame().uShade).toEqual([0.45])
  })

  it("uses the settings it has at the moment of the frame, not the ones of its first render", () => {
    render({ angle: 10 })
    render({ angle: 0, grainSize: 3 })
    nextFrame()
    expect(lastFrame().uDir).toEqual([1, 0])
    expect(lastFrame().uGrain[0]).toBe(3)
  })
})

describe("BackgroundCanvas: the size of the canvas", () => {
  it("is the size of its box times the pixel ratio (dpr), and the grain grows by the same ratio", () => {
    render({ dpr: 2 })
    nextFrame()
    expect(theCanvas().width).toBe(1600)
    expect(theCanvas().height).toBe(1200)
    expect(called(ctx(), "viewport").at(-1)).toEqual([0, 0, 1600, 1200])
    expect(lastFrame().uRes).toEqual([1600, 1200])
    expect(lastFrame().uGrain[0]).toBeCloseTo(BG_SETTINGS.grainSize * 2, 12)
  })

  it("uses the pixel ratio of the screen when no dpr is given, but at most 1.5", () => {
    const cases: [number, number, number][] = [
      [1, 800, 600],
      [1.25, 1000, 750],
      [1.5, 1200, 900],
      [2, 1200, 900],
      [3, 1200, 900],
    ]
    for (const [ratio, width, height] of cases) {
      vi.stubGlobal("devicePixelRatio", ratio)
      render({ dpr: undefined })
      expect(theCanvas().width, `ratio ${ratio}`).toBe(width)
      expect(theCanvas().height, `ratio ${ratio}`).toBe(height)
      dispose()
    }
  })

  it("counts a screen pixel ratio of 0 or not a number as 1", () => {
    for (const odd of [0, Number.NaN]) {
      vi.stubGlobal("devicePixelRatio", odd)
      render({ dpr: undefined })
      expect(theCanvas().width, String(odd)).toBe(800)
      dispose()
    }
  })

  it("lets the dpr of its settings win over the pixel ratio of the screen", () => {
    vi.stubGlobal("devicePixelRatio", 3)
    render({ dpr: 1 })
    expect(theCanvas().width).toBe(800)
  })

  it("takes a dpr of 0 as given: it is not replaced by the pixel ratio of the screen (canvasPixels cuts it to its smallest ratio)", () => {
    vi.stubGlobal("devicePixelRatio", 2)
    render({ dpr: 0 })
    expect([theCanvas().width, theCanvas().height]).toEqual(canvasPixels(800, 600, 0))
    expect(theCanvas().width).toBe(200)
  })

  it("is made as big as canvasPixels says, also for an empty box (2 by 2)", () => {
    rect = { width: 333, height: 777 }
    render({ dpr: 1.5 })
    expect([theCanvas().width, theCanvas().height]).toEqual(canvasPixels(333, 777, 1.5))
    dispose()
    rect = { width: 0, height: 0 }
    render()
    expect([theCanvas().width, theCanvas().height]).toEqual([2, 2])
  })

  it("watches its box with a resize observer and follows it when the box changes", () => {
    render()
    expect(observers).toHaveLength(1)
    expect(observers[0].observed).toEqual([host()])
    sizeObservedBox(400, 300)
    expect([theCanvas().width, theCanvas().height]).toEqual([400, 300])
    nextFrame()
    expect(called(ctx(), "viewport").at(-1)).toEqual([0, 0, 400, 300])
    expect(lastFrame().uRes).toEqual([400, 300])
  })

  it("draws again at the new size when the box changes while the picture stands still (speed 0)", () => {
    render({ speed: 0 })
    nextFrame()
    expect(pendingFrames()).toBe(0)
    sizeObservedBox(1000, 500)
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(lastFrame().uRes).toEqual([1000, 500])
  })

  it("draws at the new size at once when the box changes after a picture was drawn (a resize empties the canvas, and the browser paints before the next frame)", () => {
    render()
    nextFrame()
    const before = ctx().frames.length
    sizeObservedBox(400, 300)
    expect(ctx().frames).toHaveLength(before + 1)
    expect(lastFrame().uRes).toEqual([400, 300])
    expect(called(ctx(), "viewport").at(-1)).toEqual([0, 0, 400, 300])
    nextFrame()
    expect(lastFrame().uRes).toEqual([400, 300])
  })

  it("draws at once also when only the height changes, and when the picture stands still (speed 0)", () => {
    render({ speed: 0 })
    nextFrame()
    const before = ctx().frames.length
    sizeObservedBox(800, 500)
    expect(ctx().frames).toHaveLength(before + 1)
    expect(lastFrame().uRes).toEqual([800, 500])
  })

  it("draws nothing extra when the box is measured again at the same size, and waits for the first frame for its very first picture", () => {
    render()
    expect(ctx().frames).toHaveLength(0)
    nextFrame()
    const before = ctx().frames.length
    sizeObservedBox(800, 600)
    expect(ctx().frames).toHaveLength(before)
  })

  it("does not touch the canvas again when the box has not changed size (that would clear it)", () => {
    render()
    const widthSet = vi.spyOn(HTMLCanvasElement.prototype, "width", "set")
    const heightSet = vi.spyOn(HTMLCanvasElement.prototype, "height", "set")
    sizeObservedBox(800, 600)
    sizeObservedBox(800, 600)
    expect(widthSet).not.toHaveBeenCalled()
    expect(heightSet).not.toHaveBeenCalled()
    sizeObservedBox(800, 601)
    expect(widthSet).not.toHaveBeenCalled()
    expect(heightSet).toHaveBeenCalledTimes(1)
  })

  it("listens to the resize of the window instead when the browser has no resize observer", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    render()
    expect(observers).toHaveLength(0)
    rect = { width: 500, height: 250 }
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect([theCanvas().width, theCanvas().height]).toEqual([500, 250])
  })
})

describe("BackgroundCanvas: the flow of time", () => {
  it("draws a picture for every frame and asks for the next one, while the speed is above 0", () => {
    render()
    for (let i = 1; i <= 4; i++) {
      expect(pendingFrames()).toBe(1)
      nextFrame()
      expect(ctx().frames).toHaveLength(i)
    }
    expect(pendingFrames()).toBe(1)
  })

  it("asks for one frame at a time, however often it is rendered between two frames", () => {
    render()
    for (let i = 0; i < 20; i++) render({ angle: i })
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(ctx().frames).toHaveLength(1)
    render({ speed: 0 })
    for (let i = 0; i < 20; i++) render({ speed: 0, angle: i })
    expect(pendingFrames()).toBe(1)
  })

  it("starts the flow at 0 and moves it by the time between frames times the speed", () => {
    render({ speed: 2 })
    nextFrame(16)
    nextFrame(16)
    nextFrame(50)
    const phases = ctx().frames.map((frame) => frame.uPhase[0])
    expect(phases[0]).toBe(0)
    expect(phases[1]).toBeCloseTo(0.032, 9)
    expect(phases[2]).toBeCloseTo(0.032 + 0.1, 9)
  })

  it("moves the flow by at most 0.1 second of time in one frame, so a stall does not make it jump", () => {
    render({ speed: 2 })
    nextFrame()
    nextFrame(5000)
    nextFrame(60000)
    const phases = ctx().frames.map((frame) => frame.uPhase[0])
    expect(phases[1]).toBeCloseTo(0.2, 9)
    expect(phases[2]).toBeCloseTo(0.4, 9)
  })

  it("flows at the speed it has at the moment of the frame", () => {
    render({ speed: 1 })
    nextFrame()
    nextFrame(100)
    render({ speed: 3 })
    nextFrame(100)
    const phases = ctx().frames.map((frame) => frame.uPhase[0])
    expect(phases[1]).toBeCloseTo(0.1, 9)
    expect(phases[2]).toBeCloseTo(0.1 + 0.3, 9)
  })

  it("draws one still picture at speed 0 and asks for no more frames", () => {
    render({ speed: 0 })
    nextFrame()
    expect(ctx().frames).toHaveLength(1)
    expect(lastFrame().uPhase).toEqual([0])
    expect(pendingFrames()).toBe(0)
    nextFrame(1000)
    expect(ctx().frames).toHaveLength(1)
  })

  it("draws a still picture again, still at the same flow, when its colours change at speed 0", () => {
    render({ speed: 0 })
    nextFrame()
    const changed = ["#000000", "#102030", "#405060", "#8090a0", "#c0d0e0"]
    render({ speed: 0, colors: changed })
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(ctx().frames).toHaveLength(2)
    expect(lastFrame().uPhase).toEqual([0])
    expect(ctx().ramps[1]).toEqual(rampBytes(changed, BG_SETTINGS.softness))
    expect(pendingFrames()).toBe(0)
  })

  it("draws a still picture again with the new settings after any render at speed 0", () => {
    render({ speed: 0 })
    nextFrame()
    render({ speed: 0, angle: 90 })
    nextFrame()
    expect(ctx().frames).toHaveLength(2)
    expect(lastFrame().uDir[1]).toBeCloseTo(1, 12)
  })

  it("starts the flow when the speed goes from 0 up, and stops it when the speed goes back to 0", () => {
    render({ speed: 0 })
    nextFrame()
    expect(pendingFrames()).toBe(0)
    render({ speed: 1 })
    expect(pendingFrames()).toBe(1)
    nextFrame()
    nextFrame(100)
    expect(ctx().frames).toHaveLength(3)
    expect(pendingFrames()).toBe(1)
    render({ speed: 0 })
    nextFrame()
    expect(ctx().frames).toHaveLength(4)
    expect(pendingFrames()).toBe(0)
  })

  it("stands the flow still at frozenAt seconds, draws once and asks for no more frames", () => {
    render({ speed: 1, frozenAt: 5 })
    nextFrame()
    expect(lastFrame().uPhase).toEqual([5])
    expect(pendingFrames()).toBe(0)
    nextFrame(1000)
    expect(ctx().frames).toHaveLength(1)
  })

  it("counts a frozenAt of 0 as frozen at 0, not as not given", () => {
    render({ speed: 1, frozenAt: 0 })
    nextFrame()
    expect(lastFrame().uPhase).toEqual([0])
    expect(pendingFrames()).toBe(0)
  })

  it("freezes at 0 also when the flow had already moved on: a frozenAt of 0 is a value, not \"not given\"", () => {
    render({ speed: 1 })
    nextFrame()
    nextFrame(100)
    expect(lastFrame().uPhase[0]).toBeGreaterThan(0)
    render({ speed: 1, frozenAt: 0 })
    nextFrame()
    expect(lastFrame().uPhase).toEqual([0])
    expect(pendingFrames()).toBe(0)
  })

  it("starts from the same flow, without a jump, when the speed goes up from 0 after a long time of standing still", () => {
    render({ speed: 0 })
    nextFrame()
    nextFrame(60000)
    render({ speed: 1 })
    expect(pendingFrames()).toBe(1)
    nextFrame(16)
    expect(lastFrame().uPhase).toEqual([0])
    nextFrame(16)
    expect(lastFrame().uPhase[0]).toBeCloseTo(0.016, 9)
  })

  it("draws a frozen picture again when the colours change, at the same frozen flow", () => {
    render({ speed: 1, frozenAt: 7.5 })
    nextFrame()
    render({ speed: 1, frozenAt: 7.5, colors: ["#101010", "#202020", "#303030", "#404040", "#505050"] })
    nextFrame()
    expect(ctx().frames).toHaveLength(2)
    expect(lastFrame().uPhase).toEqual([7.5])
  })
})

describe("BackgroundCanvas: a page that is hidden", () => {
  it("draws nothing and asks for no more frames while the page is hidden", () => {
    render({ speed: 2 })
    nextFrame()
    nextFrame()
    setHidden(true)
    nextFrame()
    expect(ctx().frames).toHaveLength(2)
    expect(pendingFrames()).toBe(0)
  })

  it("goes on from the same flow when the page is shown again, without a jump", () => {
    render({ speed: 2 })
    nextFrame()
    nextFrame()
    const before = lastFrame().uPhase[0]
    expect(before).toBeCloseTo(0.032, 9)
    setHidden(true)
    nextFrame()
    setHidden(false)
    expect(pendingFrames()).toBe(1)
    nextFrame(60000)
    expect(lastFrame().uPhase[0]).toBeCloseTo(before, 12)
    nextFrame(16)
    expect(lastFrame().uPhase[0]).toBeCloseTo(before + 0.032, 9)
  })

  it("asks for no frame when it is made in a hidden page, and starts when the page is shown", () => {
    setHidden(true, false)
    render()
    expect(pendingFrames()).toBe(0)
    expect(canvases()).toHaveLength(1)
    setHidden(false)
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(ctx().frames).toHaveLength(1)
  })

  it("does not ask for a frame when the page is shown again at speed 0 and nothing changed... but draws its still picture", () => {
    render({ speed: 0 })
    nextFrame()
    setHidden(true)
    setHidden(false)
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(ctx().frames).toHaveLength(2)
    expect(pendingFrames()).toBe(0)
  })
})

describe("BackgroundCanvas: when the browser takes the context away and gives it back", () => {
  function lose(): Event {
    const fake = ctx()
    fake.lost = true
    const event = new Event("webglcontextlost", { cancelable: true })
    act(() => {
      theCanvas().dispatchEvent(event)
    })
    return event
  }

  function restore(): void {
    ctx().lost = false
    act(() => {
      theCanvas().dispatchEvent(new Event("webglcontextrestored"))
    })
  }

  it("keeps the browser from throwing the context away for good (preventDefault on the lost event)", () => {
    render()
    expect(lose().defaultPrevented).toBe(true)
  })

  it("stops drawing while the context is lost: the frame that was asked for is cancelled", () => {
    render()
    nextFrame()
    expect(pendingFrames()).toBe(1)
    lose()
    expect(pendingFrames()).toBe(0)
    nextFrame()
    expect(ctx().frames).toHaveLength(1)
  })

  it("draws nothing even if a frame that was asked for before still comes, and asks for no more", () => {
    render()
    const [late] = [...frameQueue.values()]
    lose()
    late(clock + 16)
    expect(ctx().frames).toHaveLength(0)
    expect(pendingFrames()).toBe(0)
  })

  it("does not wake up for a resize or a render while the context is lost", () => {
    render()
    lose()
    sizeObservedBox(300, 200)
    render({ angle: 33 })
    expect(pendingFrames()).toBe(0)
    expect([theCanvas().width, theCanvas().height]).toEqual([300, 200])
  })

  it("makes its program, its texture and its row of colours again when the context comes back, on the same canvas", () => {
    render()
    nextFrame()
    const canvas = theCanvas()
    lose()
    restore()
    const fake = ctx()
    expect(fake.made.shaders).toHaveLength(4)
    expect(fake.made.programs).toHaveLength(2)
    expect(fake.made.textures).toHaveLength(2)
    expect(called(fake, "linkProgram")).toHaveLength(2)
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(fake.frames).toHaveLength(2)
    expect(fake.ramps).toHaveLength(2)
    expect(fake.ramps[1]).toEqual(fake.ramps[0])
    expect(called(fake, "useProgram").at(-1)).toEqual([fake.made.programs[1]])
    expect(theCanvas()).toBe(canvas)
    expect(contexts).toHaveLength(1)
  })

  it("goes on flowing from where it was after the context comes back, without a jump", () => {
    render({ speed: 1 })
    nextFrame()
    nextFrame(16)
    const before = lastFrame().uPhase[0]
    lose()
    restore()
    nextFrame(10000)
    expect(lastFrame().uPhase[0]).toBeCloseTo(before, 12)
    nextFrame(16)
    expect(lastFrame().uPhase[0]).toBeCloseTo(before + 0.016, 9)
  })

  it("draws a still picture again when the context comes back at speed 0", () => {
    render({ speed: 0 })
    nextFrame()
    lose()
    restore()
    expect(pendingFrames()).toBe(1)
    nextFrame()
    expect(ctx().frames).toHaveLength(2)
    expect(pendingFrames()).toBe(0)
  })

  it("draws nothing when the browser says the context is lost, even before the event of the loss has come", () => {
    render()
    nextFrame()
    ctx().lost = true
    expect(() => nextFrame()).not.toThrow()
    expect(ctx().frames).toHaveLength(1)
    expect(called(ctx(), "drawArrays")).toHaveLength(1)
  })

  it("draws with the new program and the new texture after the context came back, with its row of colours in it", () => {
    render()
    nextFrame()
    lose()
    restore()
    nextFrame()
    const fake = ctx()
    expect(fake.draws).toHaveLength(2)
    expect(fake.draws[1].program).toBe(fake.made.programs[1])
    expect(fake.draws[1].texture).toBe(fake.made.textures[1])
    expect(fake.draws[1].sampler).toBe(0)
    expect(fake.draws[1].ramp).toEqual(rampBytes(COLOURS, BG_SETTINGS.softness))
    expect(fake.errors).toEqual([])
  })

  it("copes with a context that comes back when its program cannot be made again: draws nothing, does not crash, and can be taken away", () => {
    render()
    nextFrame()
    lose()
    behaviour.compileFails = "fragment"
    restore()
    expect(() => nextFrame()).not.toThrow()
    expect(ctx().frames).toHaveLength(1)
    expect(() => dispose()).not.toThrow()
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(), "loseContext")).toHaveLength(1)
  })

  it("can lose and get the context back again and again", () => {
    render()
    nextFrame()
    for (let i = 0; i < 5; i++) {
      lose()
      restore()
      nextFrame()
    }
    expect(ctx().frames).toHaveLength(6)
    expect(ctx().made.programs).toHaveLength(6)
    expect(canvases()).toHaveLength(1)
  })

  it("is taken away without errors while the context is lost, and does not delete anything on the dead context", () => {
    render()
    nextFrame()
    lose()
    expect(() => dispose()).not.toThrow()
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(), "deleteProgram")).toHaveLength(0)
    expect(called(ctx(), "deleteTexture")).toHaveLength(0)
    expect(called(ctx(), "loseContext")).toHaveLength(1)
  })
})

describe("BackgroundCanvas: when it is taken away", () => {
  it("removes its canvas and gives the context back", () => {
    render()
    nextFrame()
    const canvas = theCanvas()
    dispose()
    expect(canvas.isConnected).toBe(false)
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(), "loseContext")).toHaveLength(1)
    expect(ctx().lost).toBe(true)
  })

  it("deletes its program and its texture", () => {
    render()
    nextFrame()
    dispose()
    expect(called(ctx(), "deleteProgram")).toEqual([[ctx().made.programs[0]]])
    expect(called(ctx(), "deleteTexture")).toEqual([[ctx().made.textures[0]]])
  })

  it("gives the context back also when it was never drawn on", () => {
    render()
    dispose()
    expect(ctx().frames).toHaveLength(0)
    expect(called(ctx(), "loseContext")).toHaveLength(1)
    expect(canvases()).toHaveLength(0)
  })

  it("cancels the frame that was asked for, and a frame that still comes draws nothing", () => {
    render()
    nextFrame()
    const [late] = [...frameQueue.values()]
    dispose()
    expect(pendingFrames()).toBe(0)
    late(clock + 16)
    expect(ctx().frames).toHaveLength(1)
    expect(pendingFrames()).toBe(0)
  })

  it("stops watching its box, and the page being shown or hidden", () => {
    render()
    nextFrame()
    dispose()
    expect(observers[0].disconnected).toBe(true)
    setHidden(true)
    setHidden(false)
    expect(pendingFrames()).toBe(0)
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(pendingFrames()).toBe(0)
  })

  it("does not react to the events of its canvas any more", () => {
    render()
    nextFrame()
    const canvas = theCanvas()
    dispose()
    ctx().lost = false
    canvas.dispatchEvent(new Event("webglcontextrestored"))
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }))
    expect(ctx().made.programs).toHaveLength(1)
    expect(pendingFrames()).toBe(0)
  })

  it("takes its window resize listener away when there was no resize observer, so a later resize of the window does nothing", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    mountPoint()
    const added: { type: string; listener: unknown }[] = []
    const removed: { type: string; listener: unknown }[] = []
    // `window` is the global object here and has its own addEventListener (see the note in "what it listens to"), so it is watched on its own.
    const addToWindow = window.addEventListener
    const removeFromWindow = window.removeEventListener
    vi.spyOn(window, "addEventListener").mockImplementation((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      added.push({ type, listener })
      return addToWindow.call(window, type, listener, options)
    })
    vi.spyOn(window, "removeEventListener").mockImplementation((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
      removed.push({ type, listener })
      return removeFromWindow.call(window, type, listener, options)
    })
    render()
    expect(added.map((one) => one.type)).toEqual(["resize"])
    dispose()
    for (const one of added) expect(removed.some((other) => other.type === one.type && other.listener === one.listener), one.type).toBe(true)
    const measured = vi.mocked(Element.prototype.getBoundingClientRect)
    measured.mockClear()
    act(() => {
      window.dispatchEvent(new Event("resize"))
    })
    expect(measured).not.toHaveBeenCalled()
  })

  it("is taken away without errors when the browser has no WEBGL_lose_context to give the context back with", () => {
    behaviour.noLoseExtension = true
    render()
    nextFrame()
    expect(canvases()).toHaveLength(1)
    expect(() => dispose()).not.toThrow()
    expect(canvases()).toHaveLength(0)
  })

  it("removes every listener it added", () => {
    mountPoint()
    const added: { target: unknown; type: string }[] = []
    const removed: { target: unknown; type: string }[] = []
    const add = EventTarget.prototype.addEventListener
    const remove = EventTarget.prototype.removeEventListener
    vi.spyOn(EventTarget.prototype, "addEventListener").mockImplementation(function (this: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      added.push({ target: this, type })
      return add.call(this, type, listener, options)
    })
    vi.spyOn(EventTarget.prototype, "removeEventListener").mockImplementation(function (this: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) {
      removed.push({ target: this, type })
      return remove.call(this, type, listener, options)
    })
    render()
    expect(added.length).toBeGreaterThan(0)
    dispose()
    for (const one of added) {
      expect(removed.some((other) => other.target === one.target && other.type === one.type), one.type).toBe(true)
    }
  })
})

describe("BackgroundCanvas: when it cannot get a context or a program", () => {
  it("draws nothing and adds no canvas when the browser has no WebGL 2, and the box stays", () => {
    behaviour.context = "none"
    render()
    expect(canvases()).toHaveLength(0)
    expect(host()).toBeDefined()
    expect(pendingFrames()).toBe(0)
    expect(contexts).toHaveLength(0)
  })

  it("draws nothing and does not crash when asking for the context throws an error", () => {
    behaviour.context = "throws"
    expect(() => render()).not.toThrow()
    expect(canvases()).toHaveLength(0)
    expect(pendingFrames()).toBe(0)
  })

  it("can be taken away, and given new props, after it failed to start", () => {
    behaviour.context = "none"
    render()
    expect(() => render({ angle: 20 })).not.toThrow()
    expect(() => dispose()).not.toThrow()
  })

  it("keeps no canvas and gives the context back when the vertex shader does not compile", () => {
    behaviour.compileFails = "vertex"
    render()
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(), "loseContext")).toHaveLength(1)
    expect(pendingFrames()).toBe(0)
    expect(ctx().frames).toHaveLength(0)
  })

  it("keeps no canvas and gives the context back when the fragment shader does not compile", () => {
    behaviour.compileFails = "fragment"
    render()
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(), "loseContext")).toHaveLength(1)
    expect(pendingFrames()).toBe(0)
    expect(called(ctx(), "linkProgram")).toHaveLength(0)
  })

  it("keeps no canvas, deletes what it made, and gives the context back when the program does not link", () => {
    behaviour.linkFails = true
    render()
    expect(canvases()).toHaveLength(0)
    expect(called(ctx(), "deleteProgram")).toEqual([[ctx().made.programs[0]]])
    expect(called(ctx(), "deleteTexture")).toEqual([[ctx().made.textures[0]]])
    expect(called(ctx(), "loseContext")).toHaveLength(1)
    expect(pendingFrames()).toBe(0)
  })

  it("keeps no canvas and gives the context back when the graphics chip gives no shader, no program or no texture", () => {
    for (const missing of ["noShader", "noProgram", "noTexture"] as const) {
      behaviour[missing] = true
      render()
      expect(canvases(), missing).toHaveLength(0)
      expect(called(ctx(), "loseContext"), missing).toHaveLength(1)
      expect(pendingFrames(), missing).toBe(0)
      dispose()
      behaviour[missing] = false
      contexts.length = 0
    }
  })

  it("deletes the shader that did not compile", () => {
    for (const which of ["vertex", "fragment"] as const) {
      behaviour.compileFails = which
      render()
      const failed = ctx().made.shaders.find((shader) => shader.type === (which === "vertex" ? GL.VERTEX_SHADER : GL.FRAGMENT_SHADER))
      expect(failed, which).toBeDefined()
      expect(called(ctx(), "deleteShader"), which).toContainEqual([failed])
      dispose()
      contexts.length = 0
    }
  })

  it("does not crash when a failed start finds no WEBGL_lose_context to give the context back with", () => {
    behaviour.noLoseExtension = true
    behaviour.compileFails = "fragment"
    expect(() => render()).not.toThrow()
    expect(canvases()).toHaveLength(0)
    expect(pendingFrames()).toBe(0)
  })

  it("does not listen to anything and does not watch its box when it failed to start", () => {
    behaviour.compileFails = "fragment"
    render()
    expect(observers).toHaveLength(0)
    setHidden(true)
    setHidden(false)
    expect(pendingFrames()).toBe(0)
  })
})

describe("BackgroundCanvas: what it listens to", () => {
  function listened(): { target: string; type: string }[] {
    mountPoint()
    const list: { target: string; type: string }[] = []
    const add = EventTarget.prototype.addEventListener
    vi.spyOn(EventTarget.prototype, "addEventListener").mockImplementation(function (this: EventTarget, type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) {
      const target = this === window ? "window" : this === document ? "document" : this instanceof HTMLCanvasElement ? "canvas" : "other"
      list.push({ target, type })
      return add.call(this, type, listener, options)
    })
    // In this test environment `window` is the global object, with its own copy of addEventListener that is already tied to jsdom's window. A spy on the prototype never sees a call made on it (checked), so `window` is watched on its own.
    const addToWindow = window.addEventListener
    vi.spyOn(window, "addEventListener").mockImplementation((type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
      list.push({ target: "window", type })
      return addToWindow(type, listener, options)
    })
    render()
    return list.sort((a, b) => (a.target + a.type).localeCompare(b.target + b.type))
  }

  it("listens to the loss and the return of the context on its canvas, to the page being shown or hidden, and to its box, and to nothing else", () => {
    expect(listened()).toEqual([
      { target: "canvas", type: "webglcontextlost" },
      { target: "canvas", type: "webglcontextrestored" },
      { target: "document", type: "visibilitychange" },
    ])
  })

  it("listens to the resize of the window as well when there is no resize observer", () => {
    vi.stubGlobal("ResizeObserver", undefined)
    expect(listened()).toEqual([
      { target: "canvas", type: "webglcontextlost" },
      { target: "canvas", type: "webglcontextrestored" },
      { target: "document", type: "visibilitychange" },
      { target: "window", type: "resize" },
    ])
  })

  it("never listens to the cursor, a click, a touch, the wheel or a key", () => {
    const types = listened().map((one) => one.type)
    for (const input of ["mousemove", "mousedown", "mouseup", "pointermove", "pointerdown", "pointerup", "click", "touchstart", "touchmove", "touchend", "wheel", "keydown", "keyup"]) {
      expect(types, input).not.toContain(input)
    }
  })
})
// AB:TIMER.TESTS:END
