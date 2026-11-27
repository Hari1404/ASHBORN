// @vitest-environment jsdom
import { act, createElement, createRef, type RefObject } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SPOT_SCROLL_IDLE_MS, SPOT_SCROLLING_ATTRIBUTE } from "./learnSpotlight"
import { useLearnSpotlight } from "./useLearnSpotlight"

// The listener behind the glow and the tilt of the Learn tiles (Packet 12B, chunk 4), on a small page with two tiles.
// jsdom has no layout, so the box of a tile and its width are given by the test. The frames of the screen come when the test says so.
let root: Root | null = null
let container: HTMLElement | null = null
let frames: { id: number; run: FrameRequestCallback }[] = []
let nextFrame = 1
let cancelled: number[] = []

function Probe({ rootRef }: { rootRef: RefObject<HTMLDivElement | null> }) {
  useLearnSpotlight(rootRef)
  return createElement(
    "div",
    { ref: rootRef, id: "root" },
    createElement("div", { id: "tilt", "data-spot": "tilt" }, createElement("span", { id: "inner" }, "text")),
    createElement("div", { id: "glow", "data-spot": "glow" }),
    createElement("p", { id: "plain" }, "no tile"),
  )
}

function mount(): RefObject<HTMLDivElement | null> {
  const rootRef = createRef<HTMLDivElement>()
  container = document.createElement("div")
  document.body.appendChild(container)
  root = createRoot(container)
  act(() => root?.render(createElement(Probe, { rootRef })))
  return rootRef
}

function el(id: string): HTMLElement {
  const found = document.getElementById(id)
  if (found === null) throw new Error("not found: #" + id)
  return found
}

// The tile is 200 wide and 100 high with its top left corner at (100, 50), no scale.
function giveBox(id: string, box = { left: 100, top: 50, width: 200, height: 100 }, offsetWidth = box.width): void {
  const target = el(id)
  target.getBoundingClientRect = () => ({ ...box, right: box.left + box.width, bottom: box.top + box.height, x: box.left, y: box.top, toJSON: () => ({}) })
  Object.defineProperty(target, "offsetWidth", { configurable: true, value: offsetWidth })
}

function move(target: HTMLElement, x: number, y: number, pointerType = "mouse"): void {
  target.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: x, clientY: y, pointerType }))
}

function runFrame(): void {
  const waiting = frames
  frames = []
  act(() => waiting.forEach((f) => f.run(0)))
}

function written(id: string, name: string): string {
  return el(id).style.getPropertyValue(name)
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })
  frames = []
  cancelled = []
  nextFrame = 1
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
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("useLearnSpotlight: writing the place of the pointer into a tile", () => {
  it("writes the glow and the tilt into a tilt tile, once a frame has come", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 130, 60)
    expect(written("tilt", "--ab-learn-mx")).toBe("")
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
    expect(written("tilt", "--ab-learn-my")).toBe("10px")
    expect(written("tilt", "--ab-learn-rot-x")).toBe("4deg")
    expect(written("tilt", "--ab-learn-rot-y")).toBe("-3.5deg")
  })

  it("writes only the glow into a glow tile", () => {
    mount()
    giveBox("glow")
    move(el("glow"), 250, 100)
    runFrame()
    expect(written("glow", "--ab-learn-mx")).toBe("150px")
    expect(written("glow", "--ab-learn-my")).toBe("50px")
    expect(written("glow", "--ab-learn-rot-x")).toBe("")
    expect(written("glow", "--ab-learn-rot-y")).toBe("")
  })

  it("finds the tile when the pointer is over something inside it", () => {
    mount()
    giveBox("tilt")
    move(el("inner"), 130, 60)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
  })

  it("writes into the tile in pixels of the tile when the page is scaled", () => {
    mount()
    giveBox("tilt", { left: 100, top: 50, width: 240, height: 120 }, 200)
    move(el("tilt"), 220, 110)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("100px")
    expect(written("tilt", "--ab-learn-my")).toBe("50px")
  })

  it("accepts a pen as well as a mouse", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 130, 60, "pen")
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
  })

  it("keeps each tile's own numbers", () => {
    mount()
    giveBox("tilt")
    giveBox("glow", { left: 0, top: 0, width: 100, height: 100 })
    move(el("tilt"), 130, 60)
    runFrame()
    move(el("glow"), 10, 20)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
    expect(written("glow", "--ab-learn-mx")).toBe("10px")
    expect(written("glow", "--ab-learn-my")).toBe("20px")
  })
})

describe("useLearnSpotlight: what it leaves alone", () => {
  it("joins many moves of one frame to one write, with the last place", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 110, 55)
    move(el("tilt"), 120, 58)
    move(el("tilt"), 130, 60)
    expect(frames).toHaveLength(1)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
    expect(written("tilt", "--ab-learn-my")).toBe("10px")
  })

  it("asks for a new frame after the first one has run", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 110, 55)
    runFrame()
    move(el("tilt"), 120, 60)
    expect(frames).toHaveLength(1)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("20px")
  })

  it("writes nothing for a finger", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 130, 60, "touch")
    expect(frames).toHaveLength(0)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("")
  })

  it("writes nothing when the pointer is not over a tile", () => {
    mount()
    giveBox("tilt")
    move(el("plain"), 130, 60)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("")
    expect(written("glow", "--ab-learn-mx")).toBe("")
  })

  it("writes nothing into a tile that has no size", () => {
    mount()
    giveBox("tilt", { left: 0, top: 0, width: 0, height: 0 })
    move(el("tilt"), 5, 5)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("")
  })

  it("never writes into a tile that is outside the root, even when the root sits inside one", () => {
    const outer = document.createElement("section")
    outer.setAttribute("data-spot", "tilt")
    outer.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 400, right: 400, bottom: 400, x: 0, y: 0, toJSON: () => ({}) })
    Object.defineProperty(outer, "offsetWidth", { value: 400 })
    document.body.appendChild(outer)
    const rootRef = createRef<HTMLDivElement>()
    root = createRoot(outer)
    act(() => root?.render(createElement(Probe, { rootRef })))
    move(el("plain"), 50, 50)
    runFrame()
    expect(outer.style.getPropertyValue("--ab-learn-mx")).toBe("")
    act(() => root?.unmount())
    root = null
    outer.remove()
  })
})

describe("useLearnSpotlight: taking it away", () => {
  it("stops listening and cancels a waiting frame when the screen goes away", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 130, 60)
    const waiting = frames[0]?.id
    expect(waiting).toBeDefined()
    act(() => root?.unmount())
    expect(cancelled).toEqual([waiting])
    expect(frames).toHaveLength(0)
    root = null
  })

  it("stops listening to the pointer when the screen goes away", () => {
    mount()
    giveBox("tilt")
    const tile = el("tilt")
    act(() => root?.unmount())
    root = null
    move(tile, 130, 60)
    expect(frames).toHaveLength(0)
    expect(tile.style.getPropertyValue("--ab-learn-mx")).toBe("")
  })

  it("cancels nothing when no frame is waiting", () => {
    mount()
    act(() => root?.unmount())
    expect(cancelled).toEqual([])
    root = null
  })

  it("does nothing, and throws nothing, when the ref holds no element", () => {
    const emptyRef = createRef<HTMLDivElement>()
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    function Lonely() {
      useLearnSpotlight(emptyRef)
      return createElement("div")
    }
    expect(() => act(() => root?.render(createElement(Lonely)))).not.toThrow()
    expect(frames).toHaveLength(0)
  })
})

// The scroll guard (the smoothness pass after Packet 12B): the root carries data-scrolling while its page scrolls, and the css takes the pointer away from the tiles in that time.
describe("useLearnSpotlight: the scroll guard", () => {
  const page = (): HTMLElement => el("root")
  const scrolling = (): string | null => page().getAttribute(SPOT_SCROLLING_ATTRIBUTE)
  const scroll = (): void => {
    page().dispatchEvent(new Event("scroll"))
  }

  it("does not mark the root before any scroll has come", () => {
    mount()
    expect(scrolling()).toBeNull()
  })

  it("marks the root at the first scroll event, at once, not at the end of the wait", () => {
    mount()
    scroll()
    expect(scrolling()).toBe("true")
  })

  it("takes the mark off 120 ms after the last scroll event, and not before", () => {
    mount()
    scroll()
    vi.advanceTimersByTime(SPOT_SCROLL_IDLE_MS - 1)
    expect(scrolling()).toBe("true")
    vi.advanceTimersByTime(1)
    expect(scrolling()).toBeNull()
  })

  it("starts the wait again at every scroll event, so a long scroll is one scroll", () => {
    mount()
    scroll()
    vi.advanceTimersByTime(100)
    scroll()
    vi.advanceTimersByTime(100)
    expect(scrolling()).toBe("true")
    vi.advanceTimersByTime(20)
    expect(scrolling()).toBeNull()
  })

  it("marks the root again by a scroll that comes after the mark was taken off", () => {
    mount()
    scroll()
    vi.advanceTimersByTime(SPOT_SCROLL_IDLE_MS)
    expect(scrolling()).toBeNull()
    scroll()
    expect(scrolling()).toBe("true")
    vi.advanceTimersByTime(SPOT_SCROLL_IDLE_MS)
    expect(scrolling()).toBeNull()
  })

  it("writes the mark once and not again at every scroll event", () => {
    mount()
    const setAttribute = vi.spyOn(page(), "setAttribute")
    scroll()
    scroll()
    scroll()
    expect(setAttribute.mock.calls.filter((c) => c[0] === SPOT_SCROLLING_ATTRIBUTE)).toHaveLength(1)
    setAttribute.mockRestore()
  })

  it("listens to the scroll of the root, passively, because a listener that could stop a scroll slows the scroll down", () => {
    const added = vi.spyOn(HTMLElement.prototype, "addEventListener")
    mount()
    // React puts listeners of its own on its container: only the ones that landed on the root of the page are ours
    const ours = added.mock.calls.filter((c, i) => c[0] === "scroll" && added.mock.contexts[i] === page())
    expect(ours).toHaveLength(1)
    expect(ours[0][2]).toEqual({ passive: true })
    added.mockRestore()
  })

  it("keeps the pointer working as before while no scroll is going on", () => {
    mount()
    giveBox("tilt")
    move(el("tilt"), 130, 60)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
    expect(scrolling()).toBeNull()
  })

  it("does not stop the glow and the tilt itself: that is the css's work (the hook only sets the mark)", () => {
    mount()
    giveBox("tilt")
    scroll()
    move(el("tilt"), 130, 60)
    runFrame()
    expect(written("tilt", "--ab-learn-mx")).toBe("30px")
  })

  it("takes the mark, the waiting end of the scroll and the listener away when the screen goes away", () => {
    mount()
    const node = page()
    scroll()
    expect(node.getAttribute(SPOT_SCROLLING_ATTRIBUTE)).toBe("true")
    act(() => root?.unmount())
    root = null
    expect(node.getAttribute(SPOT_SCROLLING_ATTRIBUTE)).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
    node.dispatchEvent(new Event("scroll"))
    expect(node.getAttribute(SPOT_SCROLLING_ATTRIBUTE)).toBeNull()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("leaves nothing waiting when the screen goes away with no scroll going on", () => {
    mount()
    act(() => root?.unmount())
    root = null
    expect(vi.getTimerCount()).toBe(0)
  })
})