// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The engine of the Sound Lab is replaced: this file tests when the sound starts, where it starts, how it ends and how it is stopped, never the sound itself.
const engine = vi.hoisted(() => ({ renderSound: vi.fn() }))
vi.mock("@/lib/react-bits-sound", () => ({ renderSound: engine.renderSound }))

import { REVEAL, SOUND_COOLDOWN_MS, SOUND_STAMP_KEY, SOUND_VOLUME, forgetIntroSound, prepareIntroSound, startIntroSound as startForReal } from "./overviewSound"

// Every opening that a test makes is closed again when the test ends, as the screen does when it goes away: a waiting sound that is left behind would still answer the tap of the next test, and would take the minute of the one minute rule.
const openings: (() => void)[] = []
const startIntroSound = () => {
  const stop = startForReal()
  openings.push(stop)
  return stop
}

// AB:OVERVIEW.TESTS:START
// A fake audio context that writes down what it is asked to do. `permission.allowed` plays the browser: while it is false the context stays suspended and a resume does nothing, until a test calls allow() (a tap).
type ParamEvent = { kind: "set" | "ramp" | "cancel"; value?: number; time: number }
class FakeParam {
  value = SOUND_VOLUME
  events: ParamEvent[] = []
  setValueAtTime(value: number, time: number) {
    this.events.push({ kind: "set", value, time })
  }
  linearRampToValueAtTime(value: number, time: number) {
    this.events.push({ kind: "ramp", value, time })
  }
  cancelScheduledValues(time: number) {
    this.events.push({ kind: "cancel", time })
  }
}
class FakeGain {
  gain = new FakeParam()
  connected: unknown[] = []
  connect(to: unknown) {
    this.connected.push(to)
  }
}
class FakeSource {
  buffer: unknown = null
  connected: unknown[] = []
  starts: { when: number; offset: number }[] = []
  stops: number[] = []
  connect(to: unknown) {
    this.connected.push(to)
  }
  start(when: number, offset: number) {
    this.starts.push({ when, offset })
  }
  stop(when: number) {
    this.stops.push(when)
  }
}
const permission = { allowed: true }
const made = { contexts: [] as FakeContext[] }
class FakeContext {
  state: "running" | "suspended" = permission.allowed ? "running" : "suspended"
  sampleRate = 48000
  currentTime = 10
  destination = { name: "destination" }
  gains: FakeGain[] = []
  sources: FakeSource[] = []
  resumes = 0
  options: unknown
  constructor(options?: unknown) {
    this.options = options
    made.contexts.push(this)
  }
  resume(): Promise<void> {
    this.resumes += 1
    if (permission.allowed) this.state = "running"
    return Promise.resolve()
  }
  createGain() {
    const gain = new FakeGain()
    this.gains.push(gain)
    return gain
  }
  createBufferSource() {
    const source = new FakeSource()
    this.sources.push(source)
    return source
  }
}

const buffer = { duration: 6, name: "the-sound" }
let now = 0
let wall = 1_800_000_000_000
let reduce = false

// The time in the browser (the clock), as the number the stamp of the one minute rule is made of.
const stamp = () => window.localStorage.getItem(SOUND_STAMP_KEY)

// Lets the waiting parts of startIntroSound (the sound is "drawn", the context is "resumed") finish.
async function flush() {
  for (let i = 0; i < 8; i += 1) await Promise.resolve()
}

function tap(type = "pointerdown") {
  permission.allowed = true
  window.dispatchEvent(new Event(type))
}

beforeEach(() => {
  forgetIntroSound()
  window.localStorage.clear()
  made.contexts = []
  permission.allowed = true
  now = 0
  wall = 1_800_000_000_000
  reduce = false
  engine.renderSound.mockReset()
  engine.renderSound.mockImplementation(async () => buffer)
  vi.spyOn(performance, "now").mockImplementation(() => now)
  vi.spyOn(Date, "now").mockImplementation(() => wall)
  vi.stubGlobal("AudioContext", FakeContext)
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduce && query.includes("reduced-motion") }))
})

afterEach(() => {
  for (const stop of openings.splice(0)) stop()
  forgetIntroSound()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const only = () => {
  expect(made.contexts.length).toBe(1)
  return made.contexts[0]
}

describe("the recipe of the sound", () => {
  it("is the sound reveal of the Sound Lab, as the owner pasted it", () => {
    expect(REVEAL.duration).toBe(3.4)
    expect(REVEAL.seed).toBe(142)
    expect(REVEAL.loudness).toBe(-15)
    expect(REVEAL.lowpass).toBe(8500)
    expect(REVEAL.highpass).toBe(30)
    expect(REVEAL.drive).toBe(0.08)
    expect(REVEAL.width).toBe(0.8)
    expect(REVEAL.reverb).toEqual({ mix: 0.3, decay: 2.6, predelay: 0.02, damp: 5000 })
    expect(REVEAL.layers.length).toBe(6)
  })

  it("has the swell, the low thump and the four notes of the chord at the same moments", () => {
    const [swell, thump, ...chord] = REVEAL.layers
    expect(swell).toMatchObject({ type: "noise", color: "pink", env: { attack: 1.1, rise: 2.1, decay: 0.12, curve: 3 } })
    expect(thump).toMatchObject({ type: "tone", at: 1.12, freq: { from: 96, to: 58, time: 0.5, curve: 3 }, gain: -6 })
    expect(chord.map((layer) => ("freq" in layer ? layer.freq : null))).toEqual([293.66, 440, 587.33, 739.99])
    expect(chord.map((layer) => layer.at)).toEqual([1.12, 1.132, 1.144, 1.156])
    expect(chord.map((layer) => layer.gain)).toEqual([-4, -5.5, -7, -8.5])
  })
})

describe("the end of the sound", () => {
  it("is not cut by the end of the intro: there is no fade of the cut any more, and the volume is a real volume", () => {
    expect(SOUND_VOLUME).toBeGreaterThan(0)
    expect(SOUND_VOLUME).toBeLessThanOrEqual(1)
  })
})

describe("startIntroSound when the browser allows a sound", () => {
  it("draws the sound once at the rate of the context and plays all of it from its start, and lets it ring out to its natural end (nothing cuts it)", async () => {
    startIntroSound()
    await flush()
    const ctx = only()
    expect(engine.renderSound).toHaveBeenCalledTimes(1)
    expect(engine.renderSound).toHaveBeenCalledWith(REVEAL, {}, { sampleRate: 48000 })
    expect(ctx.sources.length).toBe(1)
    const source = ctx.sources[0]
    const gain = ctx.gains[0]
    const start = ctx.currentTime + 0.005
    expect(source.buffer).toBe(buffer)
    expect(source.connected).toEqual([gain])
    expect(gain.connected).toEqual([ctx.destination])
    expect(source.starts).toEqual([{ when: start, offset: 0 }])
    expect(source.stops).toEqual([])
    expect(gain.gain.events).toEqual([{ kind: "set", value: SOUND_VOLUME, time: start }])
  })

  it("stays in step with the picture: when drawing the sound took 0.4 seconds it starts 0.4 seconds into the sound and still rings out to its end", async () => {
    engine.renderSound.mockImplementation(async () => {
      now = 400
      return buffer
    })
    startIntroSound()
    await flush()
    const ctx = only()
    const start = ctx.currentTime + 0.005
    expect(ctx.sources[0].starts).toEqual([{ when: start, offset: 0.4 }])
    expect(ctx.sources[0].stops).toEqual([])
    expect(ctx.gains[0].gain.events).toEqual([{ kind: "set", value: SOUND_VOLUME, time: start }])
  })

  it("plays nothing when almost nothing is left of the sound by the time it is ready", async () => {
    engine.renderSound.mockImplementation(async () => {
      now = 5990
      return buffer
    })
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(0)
    expect(stamp()).toBeNull()
  })

  it("plays the rest of the sound when drawing it took long but some of it is left (a sound is not dropped just because the 2 second picture is over)", async () => {
    engine.renderSound.mockImplementation(async () => {
      now = 2500
      return buffer
    })
    startIntroSound()
    await flush()
    const ctx = only()
    const start = ctx.currentTime + 0.005
    expect(ctx.sources[0].starts).toEqual([{ when: start, offset: 2.5 }])
    expect(ctx.sources[0].stops).toEqual([])
  })

  it("makes one audio context and draws the sound once for several openings of the Overview (a minute apart)", async () => {
    startIntroSound()
    await flush()
    wall += SOUND_COOLDOWN_MS
    startIntroSound()
    await flush()
    expect(made.contexts.length).toBe(1)
    expect(engine.renderSound).toHaveBeenCalledTimes(1)
    expect(only().sources.length).toBe(2)
  })

  it("asks for a low-delay context", async () => {
    startIntroSound()
    await flush()
    expect(only().options).toEqual({ latencyHint: "interactive" })
  })
})

describe("stopping the sound", () => {
  it("fades a sound that is playing out in 50 ms and stops it", async () => {
    const stop = startIntroSound()
    await flush()
    const ctx = only()
    ctx.currentTime = 10.3
    stop()
    const events = ctx.gains[0].gain.events
    expect(events.slice(-3)).toEqual([
      { kind: "cancel", time: 10.3 },
      { kind: "set", value: SOUND_VOLUME, time: 10.3 },
      { kind: "ramp", value: 0, time: 10.3 + 0.05 },
    ])
    expect(ctx.sources[0].stops.at(-1)).toBeCloseTo(10.3 + 0.06, 6)
  })

  it("plays nothing when it is stopped before the sound is ready, and does not draw the sound twice when it is started again (React StrictMode)", async () => {
    const first = startIntroSound()
    first()
    const second = startIntroSound()
    await flush()
    const ctx = only()
    expect(engine.renderSound).toHaveBeenCalledTimes(1)
    expect(ctx.sources.length).toBe(1)
    second()
  })

  it("can be stopped twice and when nothing plays, without an error", async () => {
    const stop = startIntroSound()
    stop()
    stop()
    await flush()
    const again = startIntroSound()
    await flush()
    again()
    again()
    expect(true).toBe(true)
  })

  it("does not throw when the sound has already ended and cannot be stopped again", async () => {
    const stop = startIntroSound()
    await flush()
    const source = only().sources[0]
    source.stop = () => {
      throw new Error("InvalidStateError")
    }
    expect(() => stop()).not.toThrow()
  })
})

describe("startIntroSound when the browser does not allow a sound yet", () => {
  beforeEach(() => {
    permission.allowed = false
  })

  it("plays nothing at first, but tries to resume the context", async () => {
    startIntroSound()
    await flush()
    const ctx = only()
    expect(ctx.state).toBe("suspended")
    expect(ctx.resumes).toBeGreaterThanOrEqual(1)
    expect(ctx.sources.length).toBe(0)
  })

  it.each(["pointerdown", "keydown", "touchend"])("joins in step with the picture at the first %s (never late from its start), once", async (type) => {
    startIntroSound()
    await flush()
    now = 1500
    tap(type)
    await flush()
    const ctx = only()
    expect(ctx.sources.length).toBe(1)
    expect(ctx.sources[0].starts[0].offset).toBe(1.5)
    expect(ctx.sources[0].stops).toEqual([])
    tap("pointerdown")
    tap("keydown")
    tap("touchend")
    await flush()
    expect(ctx.sources.length).toBe(1)
  })

  it("leaves the sound out when the first tap comes after the sound is over: it is never played late from its start", async () => {
    startIntroSound()
    await flush()
    now = 20000
    tap()
    await flush()
    expect(only().sources.length).toBe(0)
    expect(stamp()).toBeNull()
  })

  it("resumes the context inside the tap itself, which Safari needs", async () => {
    startIntroSound()
    await flush()
    const ctx = only()
    const before = ctx.resumes
    permission.allowed = true
    window.dispatchEvent(new Event("pointerdown"))
    expect(ctx.resumes).toBe(before + 1)
  })

  it("plays nothing at a tap when the Overview is already gone", async () => {
    const stop = startIntroSound()
    await flush()
    stop()
    tap()
    await flush()
    expect(only().sources.length).toBe(0)
  })

  it("plays nothing when the tap does not unlock the browser either", async () => {
    startIntroSound()
    await flush()
    window.dispatchEvent(new Event("pointerdown"))
    await flush()
    expect(only().sources.length).toBe(0)
  })
})

describe("prepareIntroSound: everything is ready before the Overview opens, so the sound starts with the picture and not after it", () => {
  it("makes the audio context and draws the sound at its rate before any opening, and plays nothing yet", async () => {
    prepareIntroSound()
    await flush()
    const ctx = only()
    expect(ctx.options).toEqual({ latencyHint: "interactive" })
    expect(engine.renderSound).toHaveBeenCalledTimes(1)
    expect(engine.renderSound).toHaveBeenCalledWith(REVEAL, {}, { sampleRate: 48000 })
    expect(ctx.sources.length).toBe(0)
    expect(stamp()).toBeNull()
  })

  it("lets the opening start the sound at its very start, and draws nothing again", async () => {
    prepareIntroSound()
    await flush()
    startIntroSound()
    await flush()
    const ctx = only()
    expect(engine.renderSound).toHaveBeenCalledTimes(1)
    expect(ctx.sources.length).toBe(1)
    expect(ctx.sources[0].starts[0].offset).toBe(0)
  })

  it("wakes a sleeping context at the first tap, inside the tap itself, and then stops listening", async () => {
    permission.allowed = false
    prepareIntroSound()
    await flush()
    const ctx = only()
    expect(ctx.state).toBe("suspended")
    expect(ctx.resumes).toBe(0)
    permission.allowed = true
    window.dispatchEvent(new Event("pointerdown"))
    expect(ctx.resumes).toBe(1)
    await flush()
    expect(ctx.state).toBe("running")
    tap("keydown")
    tap("touchend")
    await flush()
    expect(ctx.resumes).toBe(1)
  })

  it("starts the sound at its very start when the tap came before the Overview opened (for example the tap on the sign-in button)", async () => {
    permission.allowed = false
    prepareIntroSound()
    await flush()
    tap()
    await flush()
    startIntroSound()
    await flush()
    const ctx = only()
    expect(ctx.sources.length).toBe(1)
    expect(ctx.sources[0].starts[0].offset).toBe(0)
    expect(stamp()).toBe(String(wall))
  })

  it("keeps waiting when a tap does not unlock the browser: the next one still wakes it", async () => {
    permission.allowed = false
    prepareIntroSound()
    await flush()
    window.dispatchEvent(new Event("pointerdown"))
    await flush()
    window.dispatchEvent(new Event("pointerdown"))
    await flush()
    const ctx = only()
    expect(ctx.resumes).toBe(2)
    expect(ctx.state).toBe("suspended")
    tap()
    await flush()
    expect(ctx.state).toBe("running")
  })

  it("does not listen twice when it is called twice", async () => {
    permission.allowed = false
    prepareIntroSound()
    prepareIntroSound()
    await flush()
    window.dispatchEvent(new Event("pointerdown"))
    expect(only().resumes).toBe(1)
    expect(engine.renderSound).toHaveBeenCalledTimes(1)
  })

  it("draws the sound again at the opening when the first drawing failed, without an error", async () => {
    engine.renderSound.mockImplementationOnce(async () => {
      throw new Error("no offline audio")
    })
    expect(() => prepareIntroSound()).not.toThrow()
    await flush()
    startIntroSound()
    await flush()
    expect(engine.renderSound).toHaveBeenCalledTimes(2)
    expect(only().sources.length).toBe(1)
  })

  it("makes nothing for a person who asked for less motion", async () => {
    reduce = true
    prepareIntroSound()
    await flush()
    expect(made.contexts.length).toBe(0)
    expect(engine.renderSound).not.toHaveBeenCalled()
  })

  it("does nothing, without an error, in a browser with no audio", async () => {
    vi.stubGlobal("AudioContext", undefined)
    expect(() => prepareIntroSound()).not.toThrow()
    await flush()
    expect(engine.renderSound).not.toHaveBeenCalled()
  })
})

describe("the one minute rule", () => {
  it("writes down the time at the moment the sound starts", async () => {
    expect(stamp()).toBeNull()
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    expect(stamp()).toBe(String(wall))
  })

  it("leaves the sound out when the Overview opens again less than a minute later in the same page (and the picture is not touched: only the sound is gone)", async () => {
    startIntroSound()
    await flush()
    wall += 30_000
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    expect(stamp()).toBe(String(wall - 30_000))
  })

  it("counts a reload and another tab too, because the time is kept in the browser: nothing is made or drawn for the sound that is left out", async () => {
    startIntroSound()
    await flush()
    forgetIntroSound()
    made.contexts = []
    engine.renderSound.mockClear()
    wall += SOUND_COOLDOWN_MS - 1
    startIntroSound()
    await flush()
    expect(made.contexts.length).toBe(0)
    expect(engine.renderSound).not.toHaveBeenCalled()
  })

  it("plays again once a full minute has passed, and writes down the new time", async () => {
    startIntroSound()
    await flush()
    wall += SOUND_COOLDOWN_MS
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(2)
    expect(stamp()).toBe(String(wall))
  })

  it("is still silent one millisecond before the minute is over", async () => {
    startIntroSound()
    await flush()
    wall += SOUND_COOLDOWN_MS - 1
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
  })

  it.each(["", "abc", "-5", "0", "NaN", "Infinity"])("takes the stored value %j for a sound that never played, never as a reason for silence", async (value) => {
    window.localStorage.setItem(SOUND_STAMP_KEY, value)
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    expect(stamp()).toBe(String(wall))
  })

  it("takes a time in the future (the clock was set back) for long ago, and puts the real time in its place", async () => {
    window.localStorage.setItem(SOUND_STAMP_KEY, String(wall + 5 * SOUND_COOLDOWN_MS))
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    expect(stamp()).toBe(String(wall))
  })

  it("keeps the minute in a plain variable when the browser does not allow storage, and never throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError")
    })
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    wall += 30_000
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    wall += SOUND_COOLDOWN_MS
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(2)
  })

  it("does not count a sound that never played: the browser did not allow it and the Overview went away, and the next opening still plays", async () => {
    permission.allowed = false
    const stop = startIntroSound()
    await flush()
    expect(stamp()).toBeNull()
    stop()
    permission.allowed = true
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    expect(stamp()).toBe(String(wall))
  })

  it("does not count a sound that is left out because nothing was left of it", async () => {
    engine.renderSound.mockImplementation(async () => {
      now = 5990
      return buffer
    })
    startIntroSound()
    await flush()
    expect(stamp()).toBeNull()
  })

  it("counts a sound that starts at a tap (not before)", async () => {
    permission.allowed = false
    startIntroSound()
    await flush()
    expect(stamp()).toBeNull()
    now = 800
    tap()
    await flush()
    expect(only().sources[0].starts[0].offset).toBe(0.8)
    expect(stamp()).toBe(String(wall))
  })

  it("leaves the sound out when another tab started its own while this one was drawing the sound", async () => {
    engine.renderSound.mockImplementation(async () => {
      window.localStorage.setItem(SOUND_STAMP_KEY, String(wall))
      return buffer
    })
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(0)
  })

  it("does not take the minute for a first opening that React StrictMode takes away at once: the second one plays", async () => {
    const first = startIntroSound()
    first()
    const second = startIntroSound()
    await flush()
    expect(only().sources.length).toBe(1)
    expect(stamp()).toBe(String(wall))
    second()
  })

  it("writes nothing down for a person who asked for less motion", async () => {
    reduce = true
    startIntroSound()
    await flush()
    expect(stamp()).toBeNull()
  })
})

describe("startIntroSound when nothing can be played", () => {
  it("gives no sound and makes no audio context for a person who asked for less motion", async () => {
    reduce = true
    const stop = startIntroSound()
    await flush()
    expect(made.contexts.length).toBe(0)
    expect(engine.renderSound).not.toHaveBeenCalled()
    expect(() => stop()).not.toThrow()
  })

  it("does nothing, without an error, in a browser with no audio", async () => {
    vi.stubGlobal("AudioContext", undefined)
    const stop = startIntroSound()
    await flush()
    expect(engine.renderSound).not.toHaveBeenCalled()
    expect(() => stop()).not.toThrow()
  })

  it("does nothing, without an error, when the audio context cannot be made", async () => {
    vi.stubGlobal(
      "AudioContext",
      class {
        constructor() {
          throw new Error("not allowed")
        }
      },
    )
    const stop = startIntroSound()
    await flush()
    expect(engine.renderSound).not.toHaveBeenCalled()
    expect(() => stop()).not.toThrow()
  })

  it("does nothing, without an error, when the sound cannot be drawn, and tries again at the next opening", async () => {
    engine.renderSound.mockImplementationOnce(async () => {
      throw new Error("no offline audio")
    })
    startIntroSound()
    await flush()
    expect(only().sources.length).toBe(0)
    startIntroSound()
    await flush()
    expect(engine.renderSound).toHaveBeenCalledTimes(2)
    expect(only().sources.length).toBe(1)
  })
})
// AB:OVERVIEW.TESTS:END
