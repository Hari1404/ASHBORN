import { describe, expect, it } from "vitest"
import { BG_PALETTES, BG_SETTINGS } from "./backgroundLook"
import {
  FIELD_FRAGMENT,
  FIELD_UNIFORM_NAMES,
  FIELD_VERTEX,
  FRAME_STEP_MAX_S,
  RAMP_SIZE,
  canvasPixels,
  fieldUniforms,
  flowAfter,
  fromOklab,
  rampBytes,
  readColour,
  toOklab,
  type FieldSettings,
  type Triple,
} from "./backgroundRender"

// AB:TIMER.TESTS:START

// Tests of how the moving background is drawn, as plain values and functions (backgroundRender.ts): reading a colour, the Oklab colour mixing, the row of 256 colours of a ramp, the numbers for the shader, the size of the canvas, the flow of time, and the text of the shader. Run them with: npm test
// What the canvas does with them (its own canvas, the graphics context, the frames) is tested in src/components/BackgroundCanvas.test.tsx with a fake graphics context. That the shader really compiles and draws cannot be tested here (jsdom has no WebGL): that is the look in a real browser.

// A small seeded random number generator, so the random-looking tests give the same result every time.
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    return a / 4294967296
  }
}

// The four bytes (red, green, blue, alpha) of entry number k of a row of colours.
function entry(bytes: Uint8Array, k: number): [number, number, number, number] {
  return [bytes[k * 4], bytes[k * 4 + 1], bytes[k * 4 + 2], bytes[k * 4 + 3]]
}

// A colour #rrggbb as three whole numbers from 0 to 255.
function bytesOf(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// Entry number k of a row of colours as red, green, blue from 0 to 1.
function rgbAt(bytes: Uint8Array, k: number): Triple {
  return [bytes[k * 4] / 255, bytes[k * 4 + 1] / 255, bytes[k * 4 + 2] / 255]
}

function hexOf(n: number): string {
  return n.toString(16).padStart(2, "0")
}

// The most any colour channel changes from one entry of the row to the next.
function biggestStep(bytes: Uint8Array): number {
  let biggest = 0
  for (let k = 1; k < RAMP_SIZE; k++) {
    for (let c = 0; c < 3; c++) biggest = Math.max(biggest, Math.abs(bytes[k * 4 + c] - bytes[(k - 1) * 4 + c]))
  }
  return biggest
}

// Values that are not numbers for the code (a number that is not finite counts as no number).
const NOT_NUMBERS = [Number.NaN, Infinity, -Infinity]

const THREE = ["#ff0000", "#00ff00", "#0000ff"]

const PLAIN: FieldSettings = { angle: 0, flow: 1, scale: 1, silk: 0.5, grainAmount: 0.1, grainSize: 1, shade: 0 }

function uniformsWith(over: Partial<FieldSettings>, ratio = 1) {
  return fieldUniforms({ ...PLAIN, ...over }, ratio)
}

describe("readColour", () => {
  it("reads #rrggbb as red, green and blue from 0 to 1", () => {
    expect(readColour("#000000")).toEqual([0, 0, 0])
    expect(readColour("#ffffff")).toEqual([1, 1, 1])
    expect(readColour("#ff0000")).toEqual([1, 0, 0])
    expect(readColour("#00ff00")).toEqual([0, 1, 0])
    expect(readColour("#0000ff")).toEqual([0, 0, 1])
  })

  it("gives n / 255 for every one of the 256 steps of every channel", () => {
    for (let n = 0; n < 256; n++) {
      expect(readColour(`#${hexOf(n)}0000`)[0]).toBe(n / 255)
      expect(readColour(`#00${hexOf(n)}00`)[1]).toBe(n / 255)
      expect(readColour(`#0000${hexOf(n)}`)[2]).toBe(n / 255)
    }
  })

  it("reads the same without the #, and capital letters are the same as small ones", () => {
    expect(readColour("336699")).toEqual(readColour("#336699"))
    expect(readColour("#AbCdEf")).toEqual(readColour("#abcdef"))
    expect(readColour("#ABCDEF")).toEqual(readColour("#abcdef"))
  })

  it("gives black for anything that is not exactly six hex digits, with or without a #", () => {
    const wrong = [
      "",
      "#",
      "red",
      "#fff",
      "#ff00",
      "#ff00000",
      "#gg0000",
      "#12345g",
      " #ff0000",
      "#ff0000 ",
      "#ff0000\n",
      "##ff0000",
      "rgb(255, 0, 0)",
      "#ff 00 00",
      "0xff0000",
      "#ff0000ff",
    ]
    for (const text of wrong) expect(readColour(text), JSON.stringify(text)).toEqual([0, 0, 0])
  })

  it("agrees with a plain reading of 3000 seeded random texts, and always gives three numbers from 0 to 1", () => {
    const random = seeded(2026)
    const digits = "0123456789abcdefABCDEF"
    for (let i = 0; i < 3000; i++) {
      const length = Math.floor(random() * 9)
      let body = ""
      for (let d = 0; d < length; d++) body += digits[Math.floor(random() * digits.length)]
      const text = (random() < 0.5 ? "#" : "") + body
      const got = readColour(text)
      const want = body.length === 6 ? bytesOf("#" + body).map((n) => n / 255) : [0, 0, 0]
      expect(got, text).toEqual(want)
      for (const channel of got) {
        expect(Number.isFinite(channel)).toBe(true)
        expect(channel).toBeGreaterThanOrEqual(0)
        expect(channel).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe("the Oklab colour space", () => {
  it("gives the published Oklab values for red, green and blue", () => {
    // The reference values of the author of Oklab (Bjorn Ottosson), for the full red, green and blue of the screen.
    const red = toOklab([1, 0, 0])
    expect(red[0]).toBeCloseTo(0.62796, 4)
    expect(red[1]).toBeCloseTo(0.22486, 4)
    expect(red[2]).toBeCloseTo(0.12585, 4)
    const green = toOklab([0, 1, 0])
    expect(green[0]).toBeCloseTo(0.86644, 4)
    expect(green[1]).toBeCloseTo(-0.23389, 4)
    expect(green[2]).toBeCloseTo(0.1795, 4)
    const blue = toOklab([0, 0, 1])
    expect(blue[0]).toBeCloseTo(0.45201, 4)
    expect(blue[1]).toBeCloseTo(-0.03246, 4)
    expect(blue[2]).toBeCloseTo(-0.31153, 4)
  })

  it("makes black lightness 0 and white lightness 1, both without any hue", () => {
    expect(toOklab([0, 0, 0])).toEqual([0, 0, 0])
    const white = toOklab([1, 1, 1])
    expect(white[0]).toBeCloseTo(1, 6)
    expect(white[1]).toBeCloseTo(0, 6)
    expect(white[2]).toBeCloseTo(0, 6)
  })

  it("gives greys no hue, and a lightness that rises from dark to light grey", () => {
    let before = -1
    for (const grey of [0, 0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
      const lab = toOklab([grey, grey, grey])
      expect(lab[1]).toBeCloseTo(0, 6)
      expect(lab[2]).toBeCloseTo(0, 6)
      expect(lab[0]).toBeGreaterThan(before)
      before = lab[0]
    }
  })

  it("comes back from Oklab to the same colour (3000 seeded random colours, within 0.00001)", () => {
    const random = seeded(7)
    for (let i = 0; i < 3000; i++) {
      const rgb: Triple = [random(), random(), random()]
      const back = fromOklab(toOklab(rgb))
      for (let c = 0; c < 3; c++) expect(Math.abs(back[c] - rgb[c])).toBeLessThan(0.00001)
    }
  })

  it("cuts a colour that the screen cannot show to the ends of 0 to 1", () => {
    for (const channel of fromOklab([1.5, 0, 0])) expect(channel).toBeGreaterThan(0.999999)
    expect(fromOklab([-0.5, 0, 0])).toEqual([0, 0, 0])
    const strong = fromOklab([0.5, 0.4, 0.4])
    for (const channel of strong) {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(1)
    }
    expect(Math.min(...strong)).toBe(0)
  })

  it("always gives red, green and blue from 0 to 1, wherever in the space it is asked (3000 seeded random points)", () => {
    const random = seeded(99)
    for (let i = 0; i < 3000; i++) {
      const rgb = fromOklab([random() * 2 - 0.5, random() * 2 - 1, random() * 2 - 1])
      for (const channel of rgb) {
        expect(channel).toBeGreaterThanOrEqual(0)
        expect(channel).toBeLessThanOrEqual(1)
      }
    }
  })
})

describe("rampBytes: the row of colours", () => {
  it("is a row of 256 colours with four bytes each", () => {
    const row = rampBytes(THREE, 0)
    expect(RAMP_SIZE).toBe(256)
    expect(row).toBeInstanceOf(Uint8Array)
    expect(row).toHaveLength(RAMP_SIZE * 4)
  })

  it("makes every colour of the row fully opaque", () => {
    for (const softness of [0, 0.5, 1]) {
      for (const colours of [THREE, ["#336699"], [], ["nonsense", "#ffffff"], [...BG_PALETTES[0]]]) {
        const row = rampBytes(colours, softness)
        for (let k = 0; k < RAMP_SIZE; k++) expect(row[k * 4 + 3]).toBe(255)
      }
    }
  })

  it("starts with the first colour of the ramp and ends with the last one, exactly (red, green, blue)", () => {
    for (const softness of [0, 0.5, 1]) {
      const row = rampBytes(THREE, softness)
      expect(entry(row, 0)).toEqual([255, 0, 0, 255])
      expect(entry(row, RAMP_SIZE - 1)).toEqual([0, 0, 255, 255])
    }
  })

  it("starts and ends with the first and last colour exactly, for 1000 seeded random pairs of colours", () => {
    const random = seeded(31)
    const colour = () => "#" + [0, 1, 2].map(() => hexOf(Math.floor(random() * 256))).join("")
    for (let i = 0; i < 1000; i++) {
      const first = colour()
      const last = colour()
      const row = rampBytes([first, last], random())
      expect(entry(row, 0), first).toEqual([...bytesOf(first), 255])
      expect(entry(row, RAMP_SIZE - 1), last).toEqual([...bytesOf(last), 255])
    }
  })

  it("starts and ends with the first and last colour of every palette of the background, for any softness", () => {
    for (const palette of BG_PALETTES) {
      for (const softness of [0, BG_SETTINGS.softness, 1]) {
        const row = rampBytes(palette, softness)
        expect(entry(row, 0), palette[0]).toEqual([...bytesOf(palette[0]), 255])
        expect(entry(row, RAMP_SIZE - 1), palette[4]).toEqual([...bytesOf(palette[4]), 255])
      }
    }
  })

  it("is on a colour of the ramp exactly at the entries where the position falls on it (4 colours: 0, 85, 170, 255; 6 colours: every 51)", () => {
    const four = ["#020100", "#9a3412", "#409be9", "#e9c89f"]
    const six = ["#020208", "#2a116f", "#6618ea", "#9782eb", "#bfb8dc", "#f0f0f0"]
    for (const softness of [0, 0.5, 1]) {
      const rowFour = rampBytes(four, softness)
      four.forEach((colour, j) => expect(entry(rowFour, j * 85), `${colour} at softness ${softness}`).toEqual([...bytesOf(colour), 255]))
      const rowSix = rampBytes(six, softness)
      six.forEach((colour, j) => expect(entry(rowSix, j * 51), `${colour} at softness ${softness}`).toEqual([...bytesOf(colour), 255]))
    }
  })

  it("is one colour all along for a ramp of one colour", () => {
    for (const softness of [0, 0.5, 1]) {
      const row = rampBytes(["#336699"], softness)
      for (let k = 0; k < RAMP_SIZE; k++) expect(entry(row, k)).toEqual([0x33, 0x66, 0x99, 255])
    }
  })

  it("is one colour all along for five equal colours (the ramp of a session that has just started)", () => {
    const row = rampBytes(Array<string>(5).fill("#9a3412"), 1)
    for (let k = 0; k < RAMP_SIZE; k++) expect(entry(row, k)).toEqual([0x9a, 0x34, 0x12, 255])
  })

  it("is black all along for a ramp with no colour", () => {
    const row = rampBytes([], 0.5)
    for (let k = 0; k < RAMP_SIZE; k++) expect(entry(row, k)).toEqual([0, 0, 0, 255])
  })

  it("counts a colour that is not #rrggbb as black, and the rest of the ramp stays", () => {
    const onlyBad = rampBytes(["nonsense"], 0)
    for (let k = 0; k < RAMP_SIZE; k++) expect(entry(onlyBad, k)).toEqual([0, 0, 0, 255])
    const badFirst = rampBytes(["nonsense", "#ffffff"], 0)
    expect(entry(badFirst, 0)).toEqual([0, 0, 0, 255])
    expect(entry(badFirst, RAMP_SIZE - 1)).toEqual([255, 255, 255, 255])
    expect(rampBytes(["nonsense", "#ffffff"], 0.3)).toEqual(rampBytes(["#000000", "#ffffff"], 0.3))
    const badLast = rampBytes(["#ffffff", "#12"], 0)
    expect(entry(badLast, RAMP_SIZE - 1)).toEqual([0, 0, 0, 255])
  })

  it("mixes in the Oklab space, not in plain red, green and blue: the middle of black and white is a grey near 99, not 128", () => {
    const row = rampBytes(["#000000", "#ffffff"], 0)
    for (const k of [127, 128]) {
      const grey = row[k * 4]
      expect(grey).toBeGreaterThanOrEqual(97)
      expect(grey).toBeLessThanOrEqual(102)
    }
  })

  it("goes from black to white without ever going down, and stays grey", () => {
    const row = rampBytes(["#000000", "#ffffff"], 0)
    for (let k = 0; k < RAMP_SIZE; k++) {
      if (k > 0) expect(row[k * 4]).toBeGreaterThanOrEqual(row[(k - 1) * 4])
      expect(Math.abs(row[k * 4] - row[k * 4 + 1])).toBeLessThanOrEqual(1)
      expect(Math.abs(row[k * 4] - row[k * 4 + 2])).toBeLessThanOrEqual(1)
    }
  })

  it("with softness 0 mixes in a straight line: the lightness of the entries grows in equal steps (checked from entry 64 on)", () => {
    const row = rampBytes(["#000000", "#ffffff"], 0)
    for (let k = 64; k < RAMP_SIZE; k++) expect(Math.abs(toOklab(rgbAt(row, k))[0] - k / (RAMP_SIZE - 1))).toBeLessThan(0.01)
  })

  it("with softness 1 eases in and out of the colours: near the ends it stays on the end colours longer", () => {
    const straight = rampBytes(["#000000", "#ffffff"], 0)
    const soft = rampBytes(["#000000", "#ffffff"], 1)
    // Entry 64 is a quarter of the way: softness 1 is still darker there, and at 191 (three quarters) it is already lighter.
    expect(soft[64 * 4]).toBeLessThan(straight[64 * 4] - 10)
    expect(soft[191 * 4]).toBeGreaterThan(straight[191 * 4] + 10)
  })

  it("with a softness between 0 and 1 is in between", () => {
    const rows = [0, 0.5, 1].map((softness) => rampBytes(["#000000", "#ffffff"], softness))
    expect(rows[0][64 * 4]).toBeGreaterThan(rows[1][64 * 4])
    expect(rows[1][64 * 4]).toBeGreaterThan(rows[2][64 * 4])
    expect(rows[0][191 * 4]).toBeLessThan(rows[1][191 * 4])
    expect(rows[1][191 * 4]).toBeLessThan(rows[2][191 * 4])
  })

  it("with softness 1 puts the two entries beside the middle colour of the ramp on it, and with softness 0 it does not", () => {
    const soft = rampBytes(THREE, 1)
    expect(entry(soft, 127)).toEqual([0, 255, 0, 255])
    expect(entry(soft, 128)).toEqual([0, 255, 0, 255])
    const straight = rampBytes(THREE, 0)
    expect(entry(straight, 127)[0]).toBeGreaterThanOrEqual(10)
    expect(entry(straight, 128)[2]).toBeGreaterThanOrEqual(10)
  })

  it("cuts a softness out of 0 to 1 to it", () => {
    expect(rampBytes(THREE, 5)).toEqual(rampBytes(THREE, 1))
    expect(rampBytes(THREE, 1.0001)).toEqual(rampBytes(THREE, 1))
    expect(rampBytes(THREE, -3)).toEqual(rampBytes(THREE, 0))
    expect(rampBytes(THREE, -0.0001)).toEqual(rampBytes(THREE, 0))
  })

  it("counts a softness that is not a number as 0 (also Infinity, which is not cut to 1)", () => {
    const straight = rampBytes(THREE, 0)
    for (const odd of NOT_NUMBERS) expect(rampBytes(THREE, odd), String(odd)).toEqual(straight)
  })

  it("gives a new row every time and does not change the list of colours it is given", () => {
    const colours = Object.freeze([...THREE])
    const a = rampBytes(colours, 0.4)
    const b = rampBytes(colours, 0.4)
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
    a[0] = a[0] === 7 ? 8 : 7
    expect(b[0]).toBe(255)
    expect(colours).toEqual(THREE)
  })

  it("has no seam in the row of any palette of the background at the softness it uses: no channel jumps from one entry to the next", () => {
    for (const palette of BG_PALETTES) {
      const row = rampBytes(palette, BG_SETTINGS.softness)
      expect(biggestStep(row), palette.join(" ")).toBeLessThanOrEqual(6)
    }
  })

  it("gives a row that is the same for the same colours and softness, however often it is asked (no state of its own)", () => {
    const first = rampBytes(BG_PALETTES[2], 0.7)
    rampBytes(BG_PALETTES[4], 0.1)
    rampBytes(THREE, 1)
    expect(rampBytes(BG_PALETTES[2], 0.7)).toEqual(first)
  })
})

describe("fieldUniforms: the numbers for the shader", () => {
  it("gives the numbers of plain settings", () => {
    expect(fieldUniforms(PLAIN, 1)).toEqual({ zoom: 1.15, flow: 1, dir: [1, 0], silk: 0.5, grain: [1, 0.2], shade: 0 })
  })

  it("makes the direction an arrow of the angle in degrees, turning from the right towards the top", () => {
    const cases: [number, number, number][] = [
      [0, 1, 0],
      [90, 0, 1],
      [180, -1, 0],
      [270, 0, -1],
      [-90, 0, -1],
      [360, 1, 0],
      [45, Math.SQRT1_2, Math.SQRT1_2],
      [30, Math.cos(Math.PI / 6), 0.5],
    ]
    for (const [angle, x, y] of cases) {
      const dir = uniformsWith({ angle }).dir
      expect(dir[0], `x at ${angle}`).toBeCloseTo(x, 10)
      expect(dir[1], `y at ${angle}`).toBeCloseTo(y, 10)
    }
  })

  it("makes the direction an arrow of length 1 for 2000 seeded random angles", () => {
    const random = seeded(5)
    for (let i = 0; i < 2000; i++) {
      const [x, y] = uniformsWith({ angle: random() * 10000 - 5000 }).dir
      expect(Math.hypot(x, y)).toBeCloseTo(1, 10)
    }
  })

  it("keeps an angle of up to ten turns (3600 degrees) as it is, more than one turn included", () => {
    // 450 degrees is one turn and a quarter: it points to the top, so a limit of one turn would show.
    const cases: [number, number, number][] = [
      [450, 0, 1],
      [-450, 0, -1],
      [3510, 0, -1],
      [-3510, 0, 1],
    ]
    for (const [angle, x, y] of cases) {
      const dir = uniformsWith({ angle }).dir
      expect(dir[0], `x at ${angle}`).toBeCloseTo(x, 9)
      expect(dir[1], `y at ${angle}`).toBeCloseTo(y, 9)
    }
  })

  it("cuts an angle beyond 3600 degrees either way to 3600", () => {
    // 3690 would point to the top if it were not cut (a quarter turn past 3600); cut to 3600 it points to the right.
    for (const angle of [3690, 4000, 1e9]) {
      const dir = uniformsWith({ angle }).dir
      expect(dir, String(angle)).toEqual(uniformsWith({ angle: 3600 }).dir)
      expect(dir[0]).toBeCloseTo(1, 9)
      expect(dir[1]).toBeCloseTo(0, 9)
    }
    for (const angle of [-3690, -4000, -1e9]) {
      const dir = uniformsWith({ angle }).dir
      expect(dir, String(angle)).toEqual(uniformsWith({ angle: -3600 }).dir)
      expect(dir[0]).toBeCloseTo(1, 9)
      expect(dir[1]).toBeCloseTo(0, 9)
    }
  })

  it("makes the zoom 1.15 divided by the scale, with the scale cut to 0.25 to 3", () => {
    expect(uniformsWith({ scale: 1 }).zoom).toBe(1.15)
    expect(uniformsWith({ scale: 2 }).zoom).toBeCloseTo(0.575, 12)
    expect(uniformsWith({ scale: 0.5 }).zoom).toBeCloseTo(2.3, 12)
    expect(uniformsWith({ scale: 3 }).zoom).toBeCloseTo(1.15 / 3, 12)
    expect(uniformsWith({ scale: 0.25 }).zoom).toBeCloseTo(4.6, 12)
    for (const small of [0.1, 0, -4]) expect(uniformsWith({ scale: small }).zoom).toBeCloseTo(4.6, 12)
    for (const big of [3.01, 10, 1e9]) expect(uniformsWith({ scale: big }).zoom).toBeCloseTo(1.15 / 3, 12)
  })

  it("keeps the flow from 0 to 3", () => {
    expect(uniformsWith({ flow: 0 }).flow).toBe(0)
    expect(uniformsWith({ flow: 0.8 }).flow).toBe(0.8)
    expect(uniformsWith({ flow: 3 }).flow).toBe(3)
    expect(uniformsWith({ flow: -1 }).flow).toBe(0)
    expect(uniformsWith({ flow: 5 }).flow).toBe(3)
  })

  it("keeps the silk from 0 to 1", () => {
    expect(uniformsWith({ silk: 0 }).silk).toBe(0)
    expect(uniformsWith({ silk: 0.35 }).silk).toBe(0.35)
    expect(uniformsWith({ silk: 1 }).silk).toBe(1)
    expect(uniformsWith({ silk: -1 }).silk).toBe(0)
    expect(uniformsWith({ silk: 2 }).silk).toBe(1)
  })

  it("keeps the shade from 0 to 1", () => {
    expect(uniformsWith({ shade: 0 }).shade).toBe(0)
    expect(uniformsWith({ shade: 0.45 }).shade).toBe(0.45)
    expect(uniformsWith({ shade: 1 }).shade).toBe(1)
    expect(uniformsWith({ shade: -1 }).shade).toBe(0)
    expect(uniformsWith({ shade: 7 }).shade).toBe(1)
  })

  it("makes the strength of the grain twice the grain amount, with the amount cut to 0 to 0.5", () => {
    expect(uniformsWith({ grainAmount: 0 }).grain[1]).toBe(0)
    expect(uniformsWith({ grainAmount: 0.1 }).grain[1]).toBe(0.2)
    expect(uniformsWith({ grainAmount: 0.5 }).grain[1]).toBe(1)
    expect(uniformsWith({ grainAmount: 0.9 }).grain[1]).toBe(1)
    expect(uniformsWith({ grainAmount: -1 }).grain[1]).toBe(0)
  })

  it("makes the size of a grain the grain size times the pixel ratio, with the size cut to 0.5 to 4 and the ratio to 0.25 to 8", () => {
    expect(uniformsWith({ grainSize: 2 }, 1.5).grain[0]).toBe(3)
    expect(uniformsWith({ grainSize: 0.1 }, 1).grain[0]).toBe(0.5)
    expect(uniformsWith({ grainSize: 9 }, 1).grain[0]).toBe(4)
    expect(uniformsWith({ grainSize: 2 }, 0).grain[0]).toBe(0.5)
    expect(uniformsWith({ grainSize: 2 }, 100).grain[0]).toBe(16)
    expect(uniformsWith({ grainSize: 1.2 }, 1).grain[0]).toBe(1.2)
  })

  it("lets the pixel ratio change the size of a grain and nothing else", () => {
    const one = fieldUniforms(PLAIN, 1)
    const two = fieldUniforms(PLAIN, 2)
    expect(two.grain[0]).toBe(one.grain[0] * 2)
    expect({ ...two, grain: [0, two.grain[1]] }).toEqual({ ...one, grain: [0, one.grain[1]] })
  })

  it("counts a setting that is not a number as the plainest value: a straight gradient to the right, no flow, no silk, no grain, no shade", () => {
    for (const odd of NOT_NUMBERS) {
      const all = fieldUniforms({ angle: odd, flow: odd, scale: odd, silk: odd, grainAmount: odd, grainSize: odd, shade: odd }, odd)
      expect(all, String(odd)).toEqual({ zoom: 1.15, flow: 0, dir: [1, 0], silk: 0, grain: [1, 0], shade: 0 })
    }
  })

  it("counts each setting that is not a number as plain on its own, and leaves the others as they are", () => {
    for (const odd of NOT_NUMBERS) {
      expect(uniformsWith({ flow: odd }), `flow ${odd}`).toEqual({ ...fieldUniforms(PLAIN, 1), flow: 0 })
      expect(uniformsWith({ silk: odd }), `silk ${odd}`).toEqual({ ...fieldUniforms(PLAIN, 1), silk: 0 })
      expect(uniformsWith({ shade: odd }), `shade ${odd}`).toEqual({ ...fieldUniforms(PLAIN, 1), shade: 0 })
      expect(uniformsWith({ scale: odd }), `scale ${odd}`).toEqual({ ...fieldUniforms(PLAIN, 1), zoom: 1.15 })
      expect(uniformsWith({ grainAmount: odd }), `grain amount ${odd}`).toEqual({ ...fieldUniforms(PLAIN, 1), grain: [1, 0] })
    }
  })

  it("does not change the settings it is given", () => {
    const settings = Object.freeze({ ...PLAIN })
    expect(() => fieldUniforms(settings, 1.5)).not.toThrow()
    expect(settings).toEqual(PLAIN)
  })

  it("keeps every number inside its range and finite, for 4000 seeded random settings (some of them not numbers)", () => {
    const random = seeded(2468)
    const odd = [Number.NaN, Infinity, -Infinity, 1e308, -1e308, 0, -0, 1e-300]
    const pick = (): number => (random() < 0.25 ? odd[Math.floor(random() * odd.length)] : (random() - 0.5) * Math.pow(10, Math.floor(random() * 7)))
    for (let i = 0; i < 4000; i++) {
      const u = fieldUniforms({ angle: pick(), flow: pick(), scale: pick(), silk: pick(), grainAmount: pick(), grainSize: pick(), shade: pick() }, pick())
      expect(u.zoom).toBeGreaterThanOrEqual(1.15 / 3 - 1e-12)
      expect(u.zoom).toBeLessThanOrEqual(4.6 + 1e-12)
      expect(u.flow).toBeGreaterThanOrEqual(0)
      expect(u.flow).toBeLessThanOrEqual(3)
      expect(Math.hypot(u.dir[0], u.dir[1])).toBeCloseTo(1, 10)
      expect(u.silk).toBeGreaterThanOrEqual(0)
      expect(u.silk).toBeLessThanOrEqual(1)
      expect(u.grain[0]).toBeGreaterThanOrEqual(0.125)
      expect(u.grain[0]).toBeLessThanOrEqual(32)
      expect(u.grain[1]).toBeGreaterThanOrEqual(0)
      expect(u.grain[1]).toBeLessThanOrEqual(1)
      expect(u.shade).toBeGreaterThanOrEqual(0)
      expect(u.shade).toBeLessThanOrEqual(1)
      for (const n of [u.zoom, u.flow, u.silk, u.shade, ...u.dir, ...u.grain]) expect(Number.isFinite(n)).toBe(true)
    }
  })

  it("passes the settings of the Pro Timer on as they are: none of them is cut (BG_SETTINGS in backgroundLook.ts)", () => {
    const u = fieldUniforms(
      {
        angle: BG_SETTINGS.angle,
        flow: BG_SETTINGS.flow,
        scale: BG_SETTINGS.scale,
        silk: BG_SETTINGS.silk,
        grainAmount: BG_SETTINGS.grainAmount,
        grainSize: BG_SETTINGS.grainSize,
        shade: 0,
      },
      BG_SETTINGS.dpr,
    )
    const radians = (BG_SETTINGS.angle * Math.PI) / 180
    expect(u.zoom).toBeCloseTo(1.15 / BG_SETTINGS.scale, 12)
    expect(u.flow).toBe(BG_SETTINGS.flow)
    expect(u.dir[0]).toBeCloseTo(Math.cos(radians), 12)
    expect(u.dir[1]).toBeCloseTo(Math.sin(radians), 12)
    expect(u.silk).toBe(BG_SETTINGS.silk)
    expect(u.grain[0]).toBeCloseTo(BG_SETTINGS.grainSize * BG_SETTINGS.dpr, 12)
    expect(u.grain[1]).toBeCloseTo(2 * BG_SETTINGS.grainAmount, 12)
    // The two settings that are not turned into numbers for the shader are inside their ranges too.
    expect(BG_SETTINGS.softness).toBeGreaterThanOrEqual(0)
    expect(BG_SETTINGS.softness).toBeLessThanOrEqual(1)
    expect(BG_SETTINGS.speed).toBeGreaterThan(0)
    expect(BG_SETTINGS.speed).toBeLessThanOrEqual(100)
    expect(BG_SETTINGS.dpr).toBeGreaterThanOrEqual(0.25)
    expect(BG_SETTINGS.dpr).toBeLessThanOrEqual(8)
  })
})

describe("canvasPixels: the size of the canvas", () => {
  it("is the size of the box times the pixel ratio, in whole pixels", () => {
    expect(canvasPixels(800, 600, 1)).toEqual([800, 600])
    expect(canvasPixels(800, 600, 1.5)).toEqual([1200, 900])
    expect(canvasPixels(390, 844, 3)).toEqual([1170, 2532])
    expect(canvasPixels(333, 777, 1.5)).toEqual([500, 1166])
  })

  it("is never smaller than 2 by 2", () => {
    expect(canvasPixels(0, 0, 1)).toEqual([2, 2])
    expect(canvasPixels(-5, -5, 1)).toEqual([2, 2])
    expect(canvasPixels(0.4, 0.4, 1)).toEqual([2, 2])
    expect(canvasPixels(1, 1, 1)).toEqual([2, 2])
    expect(canvasPixels(3, 3, 1)).toEqual([3, 3])
  })

  it("works out the width and the height on their own", () => {
    expect(canvasPixels(800, 0, 1)).toEqual([800, 2])
    expect(canvasPixels(0, 600, 2)).toEqual([2, 1200])
  })

  it("counts a size that is not a number as 0, so the canvas is 2 by 2", () => {
    for (const odd of NOT_NUMBERS) {
      expect(canvasPixels(odd, 600, 1), String(odd)).toEqual([2, 600])
      expect(canvasPixels(800, odd, 1), String(odd)).toEqual([800, 2])
    }
  })

  it("counts a box of more than 100000 screen pixels as 100000", () => {
    expect(canvasPixels(1e9, 1e9, 1)).toEqual([100000, 100000])
    expect(canvasPixels(1e9, 1e9, 8)).toEqual([800000, 800000])
  })

  it("cuts the pixel ratio to 0.25 to 8, and counts a ratio that is not a number as 1", () => {
    expect(canvasPixels(100, 100, 0.1)).toEqual([25, 25])
    expect(canvasPixels(100, 100, 0)).toEqual([25, 25])
    expect(canvasPixels(100, 100, 20)).toEqual([800, 800])
    for (const odd of NOT_NUMBERS) expect(canvasPixels(100, 100, odd), String(odd)).toEqual([100, 100])
  })

  it("gives whole numbers of at least 2, for 3000 seeded random boxes and ratios", () => {
    const random = seeded(77)
    for (let i = 0; i < 3000; i++) {
      const [width, height] = canvasPixels(random() * 5000 - 100, random() * 5000 - 100, random() * 10 - 1)
      expect(Number.isInteger(width)).toBe(true)
      expect(Number.isInteger(height)).toBe(true)
      expect(width).toBeGreaterThanOrEqual(2)
      expect(height).toBeGreaterThanOrEqual(2)
    }
  })
})

describe("flowAfter: the flow of time", () => {
  it("moves the flow by the time that passed (in milliseconds) at the speed", () => {
    expect(flowAfter(0, 16, 1)).toBeCloseTo(0.016, 12)
    expect(flowAfter(2, 50, 2)).toBeCloseTo(2.1, 12)
    expect(flowAfter(0, 80, 0.5)).toBeCloseTo(0.04, 12)
    expect(flowAfter(7.5, 0, 1)).toBe(7.5)
    expect(flowAfter(-3, 100, 1)).toBeCloseTo(-2.9, 12)
  })

  it("takes at most 0.1 second of time in one frame, so the flow goes on after a stall instead of jumping", () => {
    expect(FRAME_STEP_MAX_S).toBe(0.1)
    expect(flowAfter(0, 100, 1)).toBeCloseTo(0.1, 12)
    expect(flowAfter(0, 1000, 1)).toBeCloseTo(0.1, 12)
    expect(flowAfter(0, 3_600_000, 1)).toBeCloseTo(0.1, 12)
    expect(flowAfter(2, 1000, 0.5)).toBeCloseTo(2.05, 12)
  })

  it("stands still at a speed of 0, below 0 or not a number", () => {
    for (const speed of [0, -1, -0.001, ...NOT_NUMBERS]) expect(flowAfter(4.25, 16, speed), String(speed)).toBe(4.25)
  })

  it("does not let a speed above 100 run away", () => {
    expect(flowAfter(0, 100, 200)).toBeCloseTo(10, 12)
    expect(flowAfter(0, 100, 200)).toBe(flowAfter(0, 100, 100))
  })

  it("ignores a time that is negative or not a number", () => {
    for (const elapsed of [-50, -0.001, ...NOT_NUMBERS]) expect(flowAfter(1, elapsed, 1), String(elapsed)).toBe(1)
  })

  it("moves one second of flow at speed 1 in a second of 60 frames", () => {
    let phase = 0
    for (let frame = 0; frame < 60; frame++) phase = flowAfter(phase, 1000 / 60, 1)
    expect(phase).toBeCloseTo(1, 9)
  })

  it("never goes back, for 3000 seeded random frames at random speeds", () => {
    const random = seeded(13)
    let phase = 0
    for (let i = 0; i < 3000; i++) {
      const next = flowAfter(phase, random() * 400 - 20, random() * 3)
      expect(next).toBeGreaterThanOrEqual(phase)
      phase = next
    }
  })
})

describe("the text of the shader", () => {
  // Every uniform of the fragment shader as a pair: its name and its type.
  const declared = [...FIELD_FRAGMENT.matchAll(/^uniform\s+(\w+)\s+(\w+)\s*;/gm)].map((found) => [found[2], found[1]] as const)

  it("declares every name of FIELD_UNIFORM_NAMES exactly once as a uniform", () => {
    expect(FIELD_UNIFORM_NAMES).toHaveLength(9)
    expect(new Set(FIELD_UNIFORM_NAMES).size).toBe(FIELD_UNIFORM_NAMES.length)
    for (const name of FIELD_UNIFORM_NAMES) expect(declared.filter(([found]) => found === name), name).toHaveLength(1)
  })

  it("declares no uniform that is missing from FIELD_UNIFORM_NAMES (the canvas would never set it)", () => {
    const names: readonly string[] = FIELD_UNIFORM_NAMES
    for (const [name] of declared) expect(names, name).toContain(name)
    expect(declared).toHaveLength(FIELD_UNIFORM_NAMES.length)
  })

  it("uses every uniform in the code and not only in its declaration (a uniform that is not used is removed by the graphics chip and cannot be set)", () => {
    for (const name of FIELD_UNIFORM_NAMES) {
      const uses = FIELD_FRAGMENT.match(new RegExp(`\\b${name}\\b`, "g")) ?? []
      expect(uses.length, name).toBeGreaterThanOrEqual(2)
    }
  })

  it("reads both numbers of the grain uniform: the size of a grain (x) and its strength (y)", () => {
    expect(FIELD_FRAGMENT).toContain("uGrain.x")
    expect(FIELD_FRAGMENT).toContain("uGrain.y")
  })

  it("uses only the three kinds of uniform that the canvas knows how to set: float, vec2 and the sampler of the ramp", () => {
    for (const [name, type] of declared) expect(["float", "vec2", "sampler2D"], `${name} is a ${type}`).toContain(type)
    expect(declared.filter(([, type]) => type === "sampler2D")).toEqual([["uRamp", "sampler2D"]])
  })

  it("starts both shaders with the version line, right at the first character (WebGL 2 refuses anything before it)", () => {
    expect(FIELD_VERTEX.startsWith("#version 300 es\n")).toBe(true)
    expect(FIELD_FRAGMENT.startsWith("#version 300 es\n")).toBe(true)
  })

  it("sets a precision for floats in the fragment shader, and writes a fully opaque colour", () => {
    expect(FIELD_FRAGMENT).toMatch(/precision\s+highp\s+float\s*;/)
    expect(FIELD_FRAGMENT).toMatch(/out\s+vec4\s+outColor\s*;/)
    expect(FIELD_FRAGMENT).toMatch(/outColor\s*=\s*vec4\([^;]*,\s*1\.0\)\s*;/)
  })

  it("draws the vertex shader's one big triangle from the number of the vertex, with no data from the page", () => {
    expect(FIELD_VERTEX).toContain("gl_VertexID")
    expect(FIELD_VERTEX).toContain("gl_Position")
    expect(FIELD_VERTEX).not.toMatch(/\buniform\b/)
    expect(FIELD_VERTEX).not.toMatch(/^\s*in\s/m)
  })

  it("closes every bracket and brace in both shaders", () => {
    for (const source of [FIELD_VERTEX, FIELD_FRAGMENT]) {
      for (const [open, close] of ["()", "{}", "[]"].map((pair) => [pair[0], pair[1]])) {
        expect(source.split(open).length, `${open}${close}`).toBe(source.split(close).length)
      }
    }
  })

  it("keeps the grain still: the line that makes the grain does not use the flow of time", () => {
    const grainLines = FIELD_FRAGMENT.split("\n").filter((line) => line.includes("hash(") && line.includes("gl_FragCoord"))
    expect(grainLines).toHaveLength(1)
    expect(grainLines[0]).not.toContain("uPhase")
  })
})
// AB:TIMER.TESTS:END
