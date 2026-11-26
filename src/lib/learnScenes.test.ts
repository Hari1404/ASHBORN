import { describe, expect, it } from "vitest"
import { SUBJECT_COLOURS, SUBJECT_IDS } from "../data/learn/subjectColours"
import {
  HOME_SCENE_COLOUR,
  NO_POINTER,
  SCENE_IDS,
  STILL_TIME,
  createSceneState,
  drawScene,
  hexAlpha,
  sceneFramePlan,
  sceneOpacity,
  type SceneContext,
  type SceneId,
} from "./learnScenes"

// The canvas scenes of the Learn screen (Packet 12B, chunk 3), drawn on a fake context that writes down every call.
// jsdom has no canvas, and a recording is what a test needs: how many marks, where, in which alpha and colour.
type Call = { op: string; args: unknown[]; alpha: number; fill: unknown; stroke: unknown; mode: string; width: number }

class FakeGradient {
  stops: [number, string][] = []
  args: number[]
  constructor(args: number[]) {
    this.args = args
  }
  addColorStop(offset: number, colour: string): void {
    this.stops.push([offset, colour])
  }
}

class FakeContext {
  calls: Call[] = []
  globalAlpha = 1
  globalCompositeOperation = "source-over"
  fillStyle: unknown = "#000000"
  strokeStyle: unknown = "#000000"
  lineWidth = 1
  font = "10px sans-serif"
  gradients: FakeGradient[] = []
  alphas: number[] = []
  private _alpha = 1
  private note(op: string, args: unknown[]): void {
    this.calls.push({ op, args, alpha: this._alpha, fill: this.fillStyle, stroke: this.strokeStyle, mode: this.globalCompositeOperation, width: this.lineWidth })
  }
  clearRect(...a: number[]): void { this.note("clearRect", a) }
  fillRect(...a: number[]): void { this.note("fillRect", a) }
  fillText(...a: unknown[]): void { this.note("fillText", a) }
  beginPath(): void { this.note("beginPath", []) }
  moveTo(...a: number[]): void { this.note("moveTo", a) }
  lineTo(...a: number[]): void { this.note("lineTo", a) }
  bezierCurveTo(...a: number[]): void { this.note("bezierCurveTo", a) }
  arc(...a: number[]): void { this.note("arc", a) }
  fill(): void { this.note("fill", []) }
  stroke(): void { this.note("stroke", []) }
  createRadialGradient(...a: number[]): FakeGradient {
    const g = new FakeGradient(a)
    this.gradients.push(g)
    return g
  }
  count(op: string): number { return this.calls.filter((c) => c.op === op).length }
  of(op: string): Call[] { return this.calls.filter((c) => c.op === op) }
}

// globalAlpha as a property that remembers what was set (a plain field cannot tell a test every value)
function makeContext(): FakeContext {
  const ctx = new FakeContext()
  let alpha = 1
  Object.defineProperty(ctx, "globalAlpha", {
    get: () => alpha,
    set: (v: number) => {
      alpha = v
      ctx.alphas.push(v)
      ;(ctx as unknown as { _alpha: number })._alpha = v
    },
  })
  return ctx
}

function asContext(ctx: FakeContext): SceneContext {
  return ctx as unknown as SceneContext
}

// A random function that gives the same numbers every time
function seeded(seed = 7): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const SIZE = { w: 400, h: 300 }

function draw(id: SceneId, t = 1, size = SIZE, pointer = NO_POINTER, state = createSceneState(), rand = seeded()): FakeContext {
  const ctx = makeContext()
  drawScene(id, asContext(ctx), state, t, size, "#bf81f2", pointer, rand)
  return ctx
}

describe("the list of scenes", () => {
  it("has the hub and one scene per subject", () => {
    expect([...SCENE_IDS].sort()).toEqual(["home", ...SUBJECT_IDS].sort())
  })

  it("draws something for every scene", () => {
    for (const id of SCENE_IDS) expect(draw(id).calls.length).toBeGreaterThan(0)
  })

  it("gives the hub the first colour of the data family", () => {
    expect(HOME_SCENE_COLOUR).toBe(SUBJECT_COLOURS.python)
  })

  it("draws in the colour it is given", () => {
    for (const id of SCENE_IDS.filter((i) => i !== "python")) {
      const ctx = draw(id)
      const colours = ctx.calls.flatMap((c) => [c.fill, c.stroke])
      expect(colours).toContain("#bf81f2")
    }
  })
})

describe("every scene, over many pictures", () => {
  const sizes = [
    { w: 400, h: 300 },
    { w: 1, h: 1 },
    { w: 37, h: 911 },
    { w: 1920, h: 1080 },
  ]

  // The scenes make about 265,000 numbers in this test. Checking each with its own expect() took about a second on a fast
  // computer (a test may take 5 seconds unless it says otherwise), so it ran out of time on a busy one. The same checks now run
  // in plain loops, every wrong number is written down with its scene, size and call, and one expect() at the end must find none.
  // It has its own time limit as well. The same number of tests as before.
  it("only passes finite numbers to the canvas and keeps alpha between 0 and 1", () => {
    const wrong: string[] = []
    for (const id of SCENE_IDS) {
      for (const size of sizes) {
        const state = createSceneState()
        const rand = seeded(11)
        const ctx = makeContext()
        const frames = size.w * size.h > 100000 ? 6 : 40
        for (let f = 0; f < frames; f += 1) drawScene(id, asContext(ctx), state, f / 30, size, "#bf81f2", { x: size.w / 2, y: size.h / 2 }, rand)
        for (const c of ctx.calls) {
          for (const a of c.args) if (typeof a === "number" && !Number.isFinite(a)) wrong.push(`${id} ${size.w}x${size.h}: ${c.op} was given ${a}`)
        }
        for (const a of ctx.alphas) {
          if (!(a >= 0 && a <= 1)) wrong.push(`${id} ${size.w}x${size.h}: alpha was ${a}`)
        }
      }
    }
    expect(wrong.slice(0, 20)).toEqual([])
  }, 60_000)

  it("draws the same picture twice from the same random numbers", () => {
    for (const id of SCENE_IDS) {
      const a = draw(id, 2.5, SIZE, NO_POINTER, createSceneState(), seeded(3))
      const b = draw(id, 2.5, SIZE, NO_POINTER, createSceneState(), seeded(3))
      expect(a.calls).toEqual(b.calls)
    }
  })

  it("draws nothing, and does not throw, when the size is not a positive number", () => {
    for (const id of SCENE_IDS) {
      for (const size of [{ w: 0, h: 100 }, { w: 100, h: 0 }, { w: -5, h: 100 }, { w: NaN, h: 10 }, { w: 10, h: Infinity }]) {
        expect(draw(id, 1, size).calls).toEqual([])
      }
    }
  })

  it("survives a time that is not a number", () => {
    for (const id of SCENE_IDS) {
      const ctx = draw(id, NaN)
      for (const c of ctx.calls) for (const a of c.args) if (typeof a === "number") expect(Number.isFinite(a)).toBe(true)
    }
  })

  it("draws the still picture of every scene at STILL_TIME", () => {
    expect(STILL_TIME).toBe(3)
    for (const id of SCENE_IDS) expect(draw(id, STILL_TIME).calls.length).toBeGreaterThan(0)
  })
})

describe("home: drifting dots", () => {
  it("draws 70 dots and keeps them from one picture to the next, drifting up", () => {
    const state = createSceneState()
    const rand = seeded(5)
    const first = makeContext()
    drawScene("home", asContext(first), state, 0, SIZE, "#dfbefd", NO_POINTER, rand)
    expect(first.count("arc")).toBe(70)
    expect(state.dots).toHaveLength(70)
    const before = state.dots!.map((d) => d.y)
    drawScene("home", asContext(makeContext()), state, 0.03, SIZE, "#dfbefd", NO_POINTER, rand)
    expect(state.dots!.every((d, i) => d.y < before[i] || d.y > SIZE.h)).toBe(true)
  })

  it("brings a dot that left at the top back in at the bottom", () => {
    const state = createSceneState()
    state.dots = [{ x: 10, y: -4.99, r: 1, v: 0.2 }]
    drawScene("home", asContext(makeContext()), state, 0, SIZE, "#dfbefd", NO_POINTER, seeded())
    expect(state.dots[0].y).toBe(SIZE.h + 5)
  })
})

describe("git: lines with commits", () => {
  it("draws five lines across the whole width", () => {
    const ctx = draw("git")
    const lines = ctx.of("lineTo").filter((c) => c.args[0] === SIZE.w)
    expect(lines).toHaveLength(5)
  })

  it("draws commit dots of radius 4 and some branch curves", () => {
    const ctx = draw("git")
    expect(ctx.of("arc").every((c) => c.args[2] === 4)).toBe(true)
    expect(ctx.count("arc")).toBeGreaterThan(5)
    expect(ctx.count("bezierCurveTo")).toBeGreaterThan(0)
  })

  it("moves the commits sideways as time passes", () => {
    const a = draw("git", 0).of("arc")[0].args[0]
    const b = draw("git", 1).of("arc")[0].args[0]
    expect(a).not.toBe(b)
  })
})

describe("terminal: falling glyphs", () => {
  it("fades the old picture first, with destination-out, then writes with source-over", () => {
    const ctx = draw("terminal")
    expect(ctx.calls[0].op).toBe("fillRect")
    expect(ctx.calls[0].mode).toBe("destination-out")
    expect(ctx.of("fillText").every((c) => c.mode === "source-over")).toBe(true)
    expect(ctx.count("clearRect")).toBe(0)
  })

  it("writes one glyph for each 18 pixels of width", () => {
    expect(draw("terminal", 1, { w: 400, h: 300 }).count("fillText")).toBe(Math.ceil(400 / 18))
    expect(draw("terminal", 1, { w: 18, h: 300 }).count("fillText")).toBe(1)
    expect(draw("terminal", 1, { w: 19, h: 300 }).count("fillText")).toBe(2)
  })

  it("writes only glyphs of its set, at the column of each glyph", () => {
    const ctx = draw("terminal")
    ctx.of("fillText").forEach((c, i) => {
      expect("01$>_/{}<#=".includes(c.args[0] as string)).toBe(true)
      expect(c.args[1]).toBe(i * 18)
    })
  })

  it("moves every column down by 0.6 of a row, and sends one back to the top only after it passed the bottom", () => {
    const narrow = { w: 36, h: 300 } // two columns
    const state = createSceneState()
    state.columns = [1, 100]
    drawScene("terminal", asContext(makeContext()), state, 0, narrow, "#bf81f2", NO_POINTER, () => 0.99)
    expect(state.columns[0]).toBeCloseTo(1.6)
    expect(state.columns[1]).toBe(0) // 100 rows is far below the bottom and the random number is high enough
    state.columns = [1, 100]
    drawScene("terminal", asContext(makeContext()), state, 0, narrow, "#bf81f2", NO_POINTER, () => 0.5)
    expect(state.columns[1]).toBeCloseTo(100.6) // below the bottom but the random number is too low: it keeps falling
    state.columns = [1, 100]
    drawScene("terminal", asContext(makeContext()), state, 0, narrow, "#bf81f2", NO_POINTER, () => 0.9)
    expect(state.columns[1]).toBeCloseTo(100.6) // 0.9 is still under the 0.975 that sends a column back
    state.columns = [1, 100]
    drawScene("terminal", asContext(makeContext()), state, 0, narrow, "#bf81f2", NO_POINTER, () => 0.98)
    expect(state.columns[1]).toBe(0)
    state.columns = [100, 100]
    drawScene("terminal", asContext(makeContext()), state, 0, narrow, "#bf81f2", NO_POINTER, () => 0.99)
    expect(state.columns).toEqual([0, 0]) // both are below the bottom, so both go back
  })

  it("makes new columns when the width changes", () => {
    const state = createSceneState()
    drawScene("terminal", asContext(makeContext()), state, 0, { w: 180, h: 100 }, "#bf81f2", NO_POINTER, seeded())
    expect(state.columns).toHaveLength(10)
    drawScene("terminal", asContext(makeContext()), state, 0, { w: 360, h: 100 }, "#bf81f2", NO_POINTER, seeded())
    expect(state.columns).toHaveLength(20)
  })
})

describe("python: soft blobs", () => {
  it("draws three blobs, each a radial gradient from the colour to the same colour with no alpha", () => {
    const ctx = draw("python")
    expect(ctx.gradients).toHaveLength(3)
    for (const g of ctx.gradients) {
      expect(g.stops).toEqual([[0, "#bf81f2"], [1, hexAlpha("#bf81f2", 0)]])
    }
    expect(ctx.of("fillRect").every((c) => c.args.join() === `0,0,${SIZE.w},${SIZE.h}` && c.alpha === 0.32)).toBe(true)
  })

  it("gives each blob a radius of 0.45 of the larger side", () => {
    for (const g of draw("python").gradients) expect(g.args[5]).toBe(400 * 0.45)
  })
})

describe("numpy: a wave of dots", () => {
  it("draws one dot for each grid place, 28 pixels apart from 14", () => {
    expect(draw("numpy", 1, { w: 100, h: 100 }).count("arc")).toBe(16)
    expect(draw("numpy", 1, { w: 15, h: 15 }).count("arc")).toBe(1)
    expect(draw("numpy", 1, { w: 14, h: 14 }).count("arc")).toBe(0)
  })

  it("makes the dots near the pointer bigger, and only those", () => {
    const total = (p: { x: number; y: number }) => draw("numpy", 1, SIZE, p).of("arc").reduce((sum, c) => sum + (c.args[2] as number), 0)
    expect(total({ x: 200, y: 150 })).toBeGreaterThan(total(NO_POINTER))
    const far = { x: 100000, y: 100000 }
    expect(total(far)).toBe(total(NO_POINTER))
  })

  it("keeps the radius between 1.4 and 3.5 and the alpha between 0.25 and 0.85", () => {
    const ctx = draw("numpy", 2, SIZE, { x: 200, y: 150 })
    for (const c of ctx.of("arc")) {
      expect(c.args[2]).toBeGreaterThanOrEqual(1.4)
      expect(c.args[2]).toBeLessThanOrEqual(1.4 + 3 * 0.7 + 1e-9)
    }
    for (const a of ctx.alphas) {
      expect(a).toBeGreaterThanOrEqual(0.25 - 1e-9)
      expect(a).toBeLessThanOrEqual(0.85 + 1e-9)
    }
  })

  it("draws the dots of one size together, in four fills", () => {
    expect(draw("numpy").count("fill")).toBe(4)
  })
})

describe("pandas: a grid with a scanning row", () => {
  it("draws vertical lines 120 apart and horizontal lines 38 apart, in one stroke", () => {
    const ctx = draw("pandas", 0, { w: 360, h: 114 })
    const vertical = ctx.of("lineTo").filter((c) => c.args[0] === c.args[0] && c.args[1] === 114 && ctx.calls[ctx.calls.indexOf(c) - 1].args[0] === c.args[0])
    expect(vertical).toHaveLength(3) // x = 0, 120, 240
    const horizontal = ctx.of("lineTo").filter((c) => c.args[0] === 360)
    expect(horizontal).toHaveLength(3) // y = 0, 38, 76
    expect(ctx.count("stroke")).toBe(1)
  })

  it("draws the scanning row, as high as a grid row, with alpha 0.12", () => {
    const row = draw("pandas", 0, SIZE).of("fillRect")[0]
    expect(row.args[2]).toBe(SIZE.w)
    expect(row.args[3]).toBe(38)
    expect(row.alpha).toBe(0.12)
  })

  it("moves the scanning row down with time and wraps round", () => {
    const y = (t: number) => draw("pandas", t, SIZE).of("fillRect")[0].args[1] as number
    expect(y(1)).toBeGreaterThan(y(0))
    expect(y(0)).toBe(-38)
    expect(y((SIZE.h + 76) / 40)).toBeCloseTo(-38)
  })
})

describe("la: a grid that a matrix bends", () => {
  it("draws 61 vertical and 61 horizontal grid lines and two arrows", () => {
    const ctx = draw("la")
    expect(ctx.count("moveTo")).toBe(61 * 2 + 2)
    expect(ctx.count("lineTo")).toBe(61 * 2 + 2)
    expect(ctx.count("stroke")).toBe(2)
  })

  it("starts both arrows at the middle of the picture", () => {
    const moves = draw("la").of("moveTo").slice(-2)
    expect(moves[0].args).toEqual(moves[1].args)
    const [x, y] = moves[0].args as number[]
    expect(x).toBeCloseTo(SIZE.w / 2)
    expect(y).toBeCloseTo(SIZE.h / 2)
  })

  it("draws the arrows thicker (3 pixels) and brighter than the grid (1 pixel)", () => {
    const strokes = draw("la").of("stroke")
    expect(strokes[1].alpha).toBeGreaterThan(strokes[0].alpha)
    expect(strokes[0].width).toBe(1)
    expect(strokes[1].width).toBe(3)
  })

  it("bends the grid as time passes", () => {
    const a = draw("la", 0).of("lineTo")[0].args
    const b = draw("la", 5).of("lineTo")[0].args
    expect(a).not.toEqual(b)
  })
})

describe("prob: falling balls that pile up", () => {
  it("draws 60 balls and one bar for each 16 pixels of width", () => {
    const ctx = draw("prob")
    expect(ctx.count("arc")).toBe(60)
    expect(ctx.count("fillRect")).toBe(Math.ceil(SIZE.w / 16))
  })

  it("lets a ball that reaches the floor add to its bin and start again from the middle top", () => {
    const state = createSceneState()
    state.bins = new Array<number>(25).fill(0)
    state.balls = [{ x: 200, y: 300 }]
    drawScene("prob", asContext(makeContext()), state, 0, SIZE, "#128f43", NO_POINTER, () => 0.99)
    expect(state.bins.reduce((a, b) => a + b, 0)).toBe(1)
    expect(state.balls[0].x).toBe(SIZE.w / 2)
    expect(state.balls[0].y).toBeLessThanOrEqual(0)
  })

  it("never lets a bin grow past 60", () => {
    const state = createSceneState()
    state.bins = new Array<number>(25).fill(60)
    state.balls = [{ x: 200, y: 299 }]
    drawScene("prob", asContext(makeContext()), state, 0, SIZE, "#128f43", NO_POINTER, () => 0.99)
    expect(Math.max(...state.bins)).toBe(60)
  })

  it("keeps every ball inside the bins when it falls for a long time", () => {
    const state = createSceneState()
    const rand = seeded(9)
    for (let f = 0; f < 3000; f += 1) drawScene("prob", asContext(makeContext()), state, f / 30, { w: 160, h: 200 }, "#128f43", NO_POINTER, rand)
    expect(state.bins).toHaveLength(10)
    expect(Math.max(...state.bins!)).toBeLessThanOrEqual(60)
    expect(state.bins!.reduce((a, b) => a + b, 0)).toBeGreaterThan(0)
  })

  it("makes new bins when the width changes", () => {
    const state = createSceneState()
    drawScene("prob", asContext(makeContext()), state, 0, { w: 160, h: 100 }, "#128f43", NO_POINTER, seeded())
    expect(state.bins).toHaveLength(10)
    drawScene("prob", asContext(makeContext()), state, 0, { w: 320, h: 100 }, "#128f43", NO_POINTER, seeded())
    expect(state.bins).toHaveLength(20)
  })
})

describe("how a scene is drawn on a device", () => {
  it("draws the full look at full size and 30 frames a second", () => {
    expect(sceneFramePlan(0, false)).toEqual({ scale: 1, frameMs: 32 })
  })

  it("draws lite level 1 at half size and 20 frames a second", () => {
    expect(sceneFramePlan(1, false)).toEqual({ scale: 0.5, frameMs: 50 })
  })

  it("draws lite level 2 as one still picture at half size", () => {
    expect(sceneFramePlan(2, false)).toEqual({ scale: 0.5, frameMs: null })
  })

  it("draws one still picture when motion is reduced, at the size of the level", () => {
    expect(sceneFramePlan(0, true)).toEqual({ scale: 1, frameMs: null })
    expect(sceneFramePlan(1, true)).toEqual({ scale: 0.5, frameMs: null })
    expect(sceneFramePlan(2, true)).toEqual({ scale: 0.5, frameMs: null })
  })
})

describe("sceneOpacity", () => {
  it("is 0.4 with nothing done and 0.9 with everything done", () => {
    expect(sceneOpacity(0)).toBe(0.4)
    expect(sceneOpacity(1)).toBe(0.9)
    expect(sceneOpacity(0.5)).toBe(0.65)
  })

  it("stays between 0.4 and 0.9 whatever it is given", () => {
    expect(sceneOpacity(-3)).toBe(0.4)
    expect(sceneOpacity(7)).toBe(0.9)
    expect(sceneOpacity(NaN)).toBe(0.4)
    expect(sceneOpacity(Infinity)).toBe(0.4)
  })
})

describe("hexAlpha", () => {
  it("turns a hex colour into rgba with the alpha", () => {
    expect(hexAlpha("#dfbefd", 0)).toBe("rgba(223,190,253,0)")
    expect(hexAlpha("#128F43", 0.5)).toBe("rgba(18,143,67,0.5)")
  })

  it("falls back to a black with the alpha for text that is not a hex colour", () => {
    expect(hexAlpha("var(--s)", 0)).toBe("rgba(0,0,0,0)")
    expect(hexAlpha("#abc", 0)).toBe("rgba(0,0,0,0)")
  })

  it("can fade every subject colour", () => {
    for (const id of SUBJECT_IDS) expect(hexAlpha(SUBJECT_COLOURS[id], 0)).toMatch(/^rgba\(\d+,\d+,\d+,0\)$/)
  })
})
