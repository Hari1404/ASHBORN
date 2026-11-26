// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The lite level is read from the browser when the file is imported (matchMedia, which jsdom does not have), so it is replaced by a level a test can change.
const lite = vi.hoisted(() => ({ level: 0 as 0 | 1 | 2 }))
vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return lite.level
  },
}))
// The pictures themselves are tested in src/lib/learnScenes.test.ts. Here drawScene is a recorder, to see what this component gives it and when.
vi.mock("@/lib/learnScenes", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/learnScenes")>()
  return { ...real, drawScene: vi.fn() }
})

import { NO_POINTER, STILL_TIME, drawScene, type SceneId } from "@/lib/learnScenes"
import LearnScene, { SCENE_RESIZE_WAIT_MS } from "./LearnScene"

let root: Root | null = null
let container: HTMLElement | null = null
let frames: { id: number; run: FrameRequestCallback }[] = []
let nextFrame = 1
let cancelled: number[] = []
let box = { w: 800, h: 600 }
let context: { setTransform: ReturnType<typeof vi.fn> }
let getContext: ReturnType<typeof vi.spyOn>
let reduced = false

const widthOriginal = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth")
const heightOriginal = Object.getOwnPropertyDescriptor(Element.prototype, "clientHeight")

type Props = { scene?: SceneId; colour?: string; fraction?: number; lite?: 0 | 1 | 2 }

function show(props: Props = {}): void {
  const full = { scene: "python" as SceneId, colour: "#dfbefd", ...props }
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
  act(() => root?.render(createElement(LearnScene, full)))
}

function canvas(): HTMLCanvasElement {
  const found = container?.querySelector("canvas") ?? null
  if (found === null) throw new Error("no canvas")
  return found
}

// A frame of the screen comes at this time (milliseconds, as requestAnimationFrame gives it).
function frame(now: number): void {
  const waiting = frames
  frames = []
  act(() => waiting.forEach((f) => f.run(now)))
}

function draws(): unknown[][] {
  return vi.mocked(drawScene).mock.calls as unknown[][]
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
  vi.mocked(drawScene).mockClear()
  frames = []
  cancelled = []
  nextFrame = 1
  box = { w: 800, h: 600 }
  reduced = false
  lite.level = 0
  context = { setTransform: vi.fn() }
  getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation((() => context) as never)
  Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, get: () => box.w })
  Object.defineProperty(Element.prototype, "clientHeight", { configurable: true, get: () => box.h })
  vi.stubGlobal("matchMedia", () => ({ matches: reduced }))
  vi.stubGlobal("requestAnimationFrame", (run: FrameRequestCallback) => {
    const id = nextFrame++
    frames.push({ id, run })
    return id
  })
  vi.stubGlobal("cancelAnimationFrame", (id: number) => {
    cancelled.push(id)
    frames = frames.filter((f) => f.id !== id)
  })
})

afterEach(() => {
  act(() => root?.unmount())
  container?.remove()
  root = null
  container = null
  getContext.mockRestore()
  if (widthOriginal !== undefined) Object.defineProperty(Element.prototype, "clientWidth", widthOriginal)
  if (heightOriginal !== undefined) Object.defineProperty(Element.prototype, "clientHeight", heightOriginal)
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("LearnScene: the markup", () => {
  it("is one canvas that a screen reader skips", () => {
    show()
    expect(container?.querySelectorAll("canvas")).toHaveLength(1)
    expect(canvas().className).toBe("ab-learn-scene")
    expect(canvas().getAttribute("aria-hidden")).toBe("true")
  })

  it("is brighter the more of the subject is finished", () => {
    show({ fraction: 0 })
    expect(canvas().style.opacity).toBe("0.4")
    show({ fraction: 1 })
    expect(canvas().style.opacity).toBe("0.9")
    show({ fraction: 0.5 })
    expect(canvas().style.opacity).toBe("0.65")
  })

  it("is at the dimmest when it is not told how much is finished", () => {
    show()
    expect(canvas().style.opacity).toBe("0.4")
  })

  it("asks the browser for a 2d context", () => {
    show()
    expect(getContext).toHaveBeenCalledWith("2d", { desynchronized: true })
  })
})

describe("LearnScene: the full look (lite level 0)", () => {
  it("makes the canvas as big as its box and draws in the size of the box", () => {
    show({ lite: 0 })
    expect(canvas().width).toBe(800)
    expect(canvas().height).toBe(600)
    expect(context.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0)
    expect(draws()).toHaveLength(0)
    expect(frames).toHaveLength(1)
  })

  it("draws a picture at the first frame, time 0, with the scene, the colour and the size it was given", () => {
    show({ scene: "git", colour: "#b5b11b", lite: 0 })
    frame(1000)
    expect(draws()).toHaveLength(1)
    const [id, ctx, state, seconds, size, colour, pointer] = draws()[0]
    expect(id).toBe("git")
    expect(ctx).toBe(context)
    expect(state).toEqual({})
    expect(seconds).toBe(0)
    expect(size).toEqual({ w: 800, h: 600 })
    expect(colour).toBe("#b5b11b")
    expect(pointer).toBe(NO_POINTER)
  })

  it("draws about 30 times a second: a frame that comes within 32 ms of the last picture draws nothing", () => {
    show({ lite: 0 })
    frame(1000)
    frame(1010)
    frame(1031)
    expect(draws()).toHaveLength(1)
    frame(1032)
    expect(draws()).toHaveLength(2)
    expect(draws()[1][3]).toBeCloseTo(0.032, 5)
    frame(1065)
    expect(draws()).toHaveLength(3)
    expect(draws()[2][3]).toBeCloseTo(0.065, 5)
  })

  it("asks for the next frame at every frame, drawn or not", () => {
    show({ lite: 0 })
    frame(1000)
    expect(frames).toHaveLength(1)
    frame(1005)
    expect(frames).toHaveLength(1)
  })

  it("keeps one state from frame to frame, because the scenes build up the rain and the bins in it", () => {
    show({ scene: "terminal", lite: 0 })
    frame(1000)
    frame(1040)
    expect(draws()[1][2]).toBe(draws()[0][2])
  })

  it("uses the lite level of the page when it is not given one", () => {
    lite.level = 1
    show({})
    expect(canvas().width).toBe(400)
    frame(1000)
    frame(1040)
    expect(draws()).toHaveLength(1)
    frame(1050)
    expect(draws()).toHaveLength(2)
  })
})

describe("LearnScene: lite", () => {
  it("level 1 draws at half the size and 20 times a second", () => {
    show({ lite: 1 })
    expect(canvas().width).toBe(400)
    expect(canvas().height).toBe(300)
    expect(context.setTransform).toHaveBeenCalledWith(0.5, 0, 0, 0.5, 0, 0)
    frame(1000)
    frame(1049)
    expect(draws()).toHaveLength(1)
    frame(1050)
    expect(draws()).toHaveLength(2)
    // the scene is still drawn in the size of the box, the half size is only the pixels behind it
    expect(draws()[1][4]).toEqual({ w: 800, h: 600 })
  })

  it("level 2 draws one still picture at once, at half the size, and asks for no frame", () => {
    show({ lite: 2 })
    expect(canvas().width).toBe(400)
    expect(context.setTransform).toHaveBeenCalledWith(0.5, 0, 0, 0.5, 0, 0)
    expect(draws()).toHaveLength(1)
    expect(draws()[0][3]).toBe(STILL_TIME)
    expect(frames).toHaveLength(0)
  })
})

describe("LearnScene: reduced motion", () => {
  it("draws one still picture at full size at level 0, and asks for no frame", () => {
    reduced = true
    show({ lite: 0 })
    expect(canvas().width).toBe(800)
    expect(draws()).toHaveLength(1)
    expect(draws()[0][3]).toBe(STILL_TIME)
    expect(frames).toHaveLength(0)
  })

  it("draws one still picture at half size at level 1", () => {
    reduced = true
    show({ lite: 1 })
    expect(canvas().width).toBe(400)
    expect(draws()).toHaveLength(1)
    expect(frames).toHaveLength(0)
  })
})

describe("LearnScene: a new scene, colour or level", () => {
  it("starts again with a clean canvas and a new state when the scene changes", () => {
    show({ scene: "terminal", lite: 0 })
    frame(1000)
    const before = draws()[0][2]
    show({ scene: "prob", lite: 0 })
    expect(context.setTransform).toHaveBeenCalledTimes(2)
    frame(2000)
    expect(draws()).toHaveLength(2)
    expect(draws()[1][0]).toBe("prob")
    expect(draws()[1][2]).not.toBe(before)
    expect(draws()[1][3]).toBe(0)
  })

  it("never runs two timers: the old one is cancelled when the scene changes", () => {
    show({ scene: "terminal", lite: 0 })
    const old = frames[0].id
    show({ scene: "prob", lite: 0 })
    expect(cancelled).toContain(old)
    expect(frames).toHaveLength(1)
  })

  it("draws with the new colour", () => {
    show({ colour: "#dfbefd", lite: 0 })
    frame(1000)
    show({ colour: "#8ce6a0", lite: 0 })
    frame(2000)
    expect(draws()[1][5]).toBe("#8ce6a0")
  })

  it("follows a new lite level", () => {
    show({ lite: 0 })
    expect(canvas().width).toBe(800)
    show({ lite: 2 })
    expect(canvas().width).toBe(400)
    expect(frames).toHaveLength(0)
    expect(draws().at(-1)?.[3]).toBe(STILL_TIME)
  })

  it("keeps the same canvas, and only changes the brightness, when the fraction changes", () => {
    show({ lite: 0, fraction: 0 })
    const first = canvas()
    const waiting = frames[0].id
    show({ lite: 0, fraction: 1 })
    expect(canvas()).toBe(first)
    expect(frames[0].id).toBe(waiting)
    expect(cancelled).toEqual([])
  })
})

describe("LearnScene: the size of the box", () => {
  it("measures again 120 ms after the last resize and starts the scene again", () => {
    show({ lite: 0 })
    frame(1000)
    const before = draws()[0][2]
    box = { w: 1000, h: 700 }
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS - 1)
    expect(canvas().width).toBe(800)
    vi.advanceTimersByTime(1)
    expect(canvas().width).toBe(1000)
    expect(canvas().height).toBe(700)
    frame(1040)
    expect(draws()[1][4]).toEqual({ w: 1000, h: 700 })
    expect(draws()[1][2]).not.toBe(before)
  })

  it("waits for the resizing to stop: the 120 ms count from the last event", () => {
    show({ lite: 0 })
    box = { w: 1000, h: 700 }
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(100)
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(100)
    expect(canvas().width).toBe(800)
    vi.advanceTimersByTime(20)
    expect(canvas().width).toBe(1000)
    expect(context.setTransform).toHaveBeenCalledTimes(2)
  })

  it("does nothing when the size is the same", () => {
    show({ lite: 0 })
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS)
    expect(context.setTransform).toHaveBeenCalledTimes(1)
  })

  it("draws the still picture again at the new size when the picture stands still", () => {
    show({ lite: 2 })
    expect(draws()).toHaveLength(1)
    box = { w: 1000, h: 700 }
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS)
    expect(draws()).toHaveLength(2)
    expect(draws()[1][3]).toBe(STILL_TIME)
    expect(draws()[1][4]).toEqual({ w: 1000, h: 700 })
    expect(canvas().width).toBe(500)
  })

  it("does not draw a still picture again when the size did not change", () => {
    show({ lite: 2 })
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS)
    expect(draws()).toHaveLength(1)
  })

  it("stops listening to the size when the scene is taken away", () => {
    show({ lite: 2 })
    box = { w: 1000, h: 700 }
    window.dispatchEvent(new Event("resize"))
    act(() => root?.unmount())
    root = null
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS * 2)
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS * 2)
    expect(draws()).toHaveLength(1)
  })

  it("makes the canvas one pixel big from the start when the box has no size yet", () => {
    box = { w: 0, h: 0 }
    show({ lite: 0 })
    expect(canvas().width).toBe(1)
    expect(canvas().height).toBe(1)
    expect(context.setTransform).toHaveBeenCalledTimes(1)
  })

  it("draws no extra picture at the new size while the scene moves: the next frame does it", () => {
    show({ lite: 0 })
    frame(1000)
    box = { w: 1000, h: 700 }
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS)
    expect(canvas().width).toBe(1000)
    expect(draws()).toHaveLength(1)
    frame(1040)
    expect(draws()).toHaveLength(2)
  })

  it("keeps the canvas at least one pixel big when the box has no size yet", () => {
    box = { w: 0, h: 0 }
    show({ lite: 0 })
    box = { w: 1, h: 1 }
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS)
    expect(canvas().width).toBe(1)
    box = { w: 0, h: 0 }
    window.dispatchEvent(new Event("resize"))
    vi.advanceTimersByTime(SCENE_RESIZE_WAIT_MS)
    expect(canvas().width).toBe(1)
    expect(canvas().height).toBe(1)
  })
})

describe("LearnScene: the mouse (numpy only)", () => {
  function pointerAt(x: number, y: number): void {
    window.dispatchEvent(new PointerEvent("pointermove", { clientX: x, clientY: y }))
  }

  it("gives the numpy scene the place of the mouse, counted from the corner of the canvas", () => {
    show({ scene: "numpy", lite: 0 })
    canvas().getBoundingClientRect = () => ({ left: 10, top: 20, width: 800, height: 600, right: 810, bottom: 620, x: 10, y: 20, toJSON: () => ({}) })
    pointerAt(110, 220)
    frame(1000)
    expect(draws()[0][6]).toEqual({ x: 100, y: 200 })
  })

  it("gives no place until the mouse has moved", () => {
    show({ scene: "numpy", lite: 0 })
    frame(1000)
    expect(draws()[0][6]).toBe(NO_POINTER)
  })

  it("listens to the mouse for numpy and for no other scene", () => {
    const added = vi.spyOn(window, "addEventListener")
    show({ scene: "numpy", lite: 0 })
    expect(added.mock.calls.filter((c) => c[0] === "pointermove")).toHaveLength(1)
    added.mockClear()
    show({ scene: "python", lite: 0 })
    expect(added.mock.calls.filter((c) => c[0] === "pointermove")).toHaveLength(0)
    added.mockRestore()
  })

  it("gives no scene but numpy the place of the mouse", () => {
    show({ scene: "python", lite: 0 })
    pointerAt(110, 220)
    frame(1000)
    expect(draws()[0][6]).toBe(NO_POINTER)
  })

  it("does not listen to the mouse where the picture stands still", () => {
    show({ scene: "numpy", lite: 2 })
    pointerAt(110, 220)
    expect(draws()).toHaveLength(1)
    expect(draws()[0][6]).toBe(NO_POINTER)
  })

  it("stops listening to the mouse when the scene is taken away", () => {
    const removed = vi.spyOn(window, "removeEventListener")
    show({ scene: "numpy", lite: 0 })
    act(() => root?.unmount())
    root = null
    expect(removed).toHaveBeenCalledWith("pointermove", expect.any(Function))
    removed.mockRestore()
  })
})

describe("LearnScene: taking it away", () => {
  it("cancels the waiting frame, and draws nothing more", () => {
    show({ lite: 0 })
    frame(1000)
    const waiting = frames[0].id
    act(() => root?.unmount())
    root = null
    expect(cancelled).toContain(waiting)
    expect(frames).toHaveLength(0)
  })
})

describe("LearnScene: a browser with no canvas", () => {
  it("draws nothing and asks for no frame when the browser gives no context", () => {
    getContext.mockImplementation((() => null) as never)
    expect(() => show({ lite: 0 })).not.toThrow()
    expect(draws()).toHaveLength(0)
    expect(frames).toHaveLength(0)
  })

  it("does the same when asking for the context throws", () => {
    getContext.mockImplementation((() => {
      throw new Error("no canvas here")
    }) as never)
    expect(() => show({ lite: 2 })).not.toThrow()
    expect(draws()).toHaveLength(0)
    expect(frames).toHaveLength(0)
  })
})
