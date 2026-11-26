// AB:LEARN.SCENES:START
// The canvas scene behind each Learn subject (from the preview page ASHBORN_Learn_subjects_item_card.html, "RN").
// The hub has drifting dots; git has lines with moving commit dots; terminal has falling glyphs; python has soft moving
// blobs; numpy has a wave of dots; pandas has a grid with a scanning row; linear algebra has a warping grid; probability
// has falling balls that pile up in bins.
// Pure drawing: every scene draws on a context it is given (a small part of CanvasRenderingContext2D), at a time t in
// seconds, in the logical size w and h. No clock and no screen here, and the random numbers come from a function the
// caller can replace, so a test can draw a scene on a fake context. The screen (src/components/LearnScene.tsx) owns the
// canvas, the frame timer and the lite mode. See CONNECTIONS.md C75.
//
// One change from the preview: the hub scene gets a real colour (the preview gave it the text "var(--s)", which a canvas
// cannot read), and the python scene draws its blobs straight on the canvas instead of on a small copy that was stretched.
import type { SubjectId } from "../data/learn/subjectColours"
import { SUBJECT_COLOURS } from "../data/learn/subjectColours"
import type { LiteLevel } from "./lite"

export type SceneId = "home" | SubjectId
export const SCENE_IDS: readonly SceneId[] = ["home", "python", "numpy", "pandas", "terminal", "git", "la", "prob"]

// The colour of the hub scene: the first colour of the data family, as the page's default accent was.
export const HOME_SCENE_COLOUR = SUBJECT_COLOURS.python

export type SceneContext = Pick<
  CanvasRenderingContext2D,
  | "globalAlpha"
  | "globalCompositeOperation"
  | "fillStyle"
  | "strokeStyle"
  | "lineWidth"
  | "font"
  | "clearRect"
  | "fillRect"
  | "fillText"
  | "beginPath"
  | "moveTo"
  | "lineTo"
  | "bezierCurveTo"
  | "arc"
  | "fill"
  | "stroke"
  | "createRadialGradient"
>

export type SceneSize = { w: number; h: number }
export type ScenePointer = { x: number; y: number }
export const NO_POINTER: ScenePointer = { x: -999, y: -999 }

type Dot = { x: number; y: number; r: number; v: number }
type Ball = { x: number; y: number }
// What a scene keeps from one frame to the next. A new state is made when the scene or the size changes.
export type SceneState = { dots?: Dot[]; columns?: number[]; bins?: number[]; balls?: Ball[] }
export function createSceneState(): SceneState {
  return {}
}

// The picture that stands still (reduced motion, lite level 2) is the scene at this time.
export const STILL_TIME = 3

// How a scene is drawn on this device: how big its canvas is compared with the window and how often it is drawn.
// frameMs null = one still picture. Level 0 is the full look (30 frames a second); level 1 draws at half size and 20
// frames a second; level 2 draws one still picture. Reduced motion is always one still picture.
export function sceneFramePlan(lite: LiteLevel, reduced: boolean): { scale: number; frameMs: number | null } {
  if (reduced || lite === 2) return { scale: lite === 0 ? 1 : 0.5, frameMs: null }
  if (lite === 1) return { scale: 0.5, frameMs: 50 }
  return { scale: 1, frameMs: 32 }
}

// The scene grows brighter as the subject is finished: 0.4 with nothing done, 0.9 with everything done.
export function sceneOpacity(fraction: number): number {
  const f = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0
  return Math.round((0.4 + 0.5 * f) * 100) / 100
}

// "#rrggbb" with an alpha, as a colour a gradient can fade to without turning grey on the way.
export function hexAlpha(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (m === null) return `rgba(0,0,0,${alpha})`
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`
}

const TAU = Math.PI * 2
const MONO = "ui-monospace,Menlo,Consolas,monospace"
const TERMINAL_GLYPHS = "01$>_/{}<#="
const MAX_LOOP = 4000 // no scene draws more than this many marks in one loop, whatever the size

function pick(glyphs: string, rand: () => number): string {
  return glyphs.charAt(Math.floor(rand() * glyphs.length) % glyphs.length)
}

function home(ctx: SceneContext, st: SceneState, t: number, { w, h }: SceneSize, colour: string, rand: () => number): void {
  ctx.clearRect(0, 0, w, h)
  if (st.dots === undefined) {
    st.dots = Array.from({ length: 70 }, () => ({ x: rand() * w, y: rand() * h, r: rand() * 1.8 + 0.4, v: rand() * 0.25 + 0.05 }))
  }
  ctx.fillStyle = colour
  for (const p of st.dots) {
    p.y -= p.v
    if (p.y < -5) p.y = h + 5
    ctx.globalAlpha = Math.max(0, 0.25 + 0.35 * Math.sin(t + p.x)) // a canvas ignores a negative alpha, so it is cut at 0
    ctx.beginPath()
    ctx.arc(p.x + Math.sin(t * 0.4 + p.y * 0.01) * 12, p.y, p.r, 0, TAU)
    ctx.fill()
  }
}

function git(ctx: SceneContext, t: number, { w, h }: SceneSize, colour: string): void {
  ctx.clearRect(0, 0, w, h)
  ctx.strokeStyle = colour
  ctx.fillStyle = colour
  ctx.lineWidth = 1.5
  for (let l = 0; l < 5; l += 1) {
    const y = h * (0.14 + 0.18 * l)
    const o = (t * (14 + l * 4)) % 170
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
    for (let k = -1, guard = 0; k * 170 + o < w + 170 && guard < MAX_LOOP; k += 1, guard += 1) {
      const x = k * 170 + o + l * 37
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, TAU)
      ctx.fill()
      if ((k + l) % 3 === 0 && l < 4) {
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.bezierCurveTo(x + 60, y, x + 60, y + h * 0.18, x + 120, y + h * 0.18)
        ctx.stroke()
      }
    }
  }
}

function terminal(ctx: SceneContext, st: SceneState, { w, h }: SceneSize, colour: string, rand: () => number): void {
  const count = Math.min(MAX_LOOP, Math.ceil(w / 18))
  if (st.columns === undefined || st.columns.length !== count) {
    st.columns = Array.from({ length: count }, () => (rand() * h) / 18)
  }
  // The old picture fades a little each frame (the trail), then a new glyph is written at the head of each column.
  ctx.globalCompositeOperation = "destination-out"
  ctx.fillStyle = "rgba(0,0,0,.17)"
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = "source-over"
  ctx.font = `14px ${MONO}`
  ctx.fillStyle = colour
  ctx.globalAlpha = 0.9
  const columns = st.columns
  columns.forEach((y, i) => {
    ctx.fillText(pick(TERMINAL_GLYPHS, rand), i * 18, y * 18)
    columns[i] = y * 18 > h && rand() > 0.975 ? 0 : y + 0.6
  })
}

function python(ctx: SceneContext, t: number, { w, h }: SceneSize, colour: string): void {
  ctx.clearRect(0, 0, w, h)
  const clear = hexAlpha(colour, 0)
  for (let i = 0; i < 3; i += 1) {
    const x = w * (0.5 + 0.4 * Math.sin(t * 0.25 + i * 2.1))
    const y = h * (0.45 + 0.3 * Math.cos(t * 0.2 + i * 1.7))
    const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.45)
    g.addColorStop(0, colour)
    g.addColorStop(1, clear)
    ctx.globalAlpha = 0.32
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
}

function numpy(ctx: SceneContext, t: number, { w, h }: SceneSize, colour: string, pointer: ScenePointer): void {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = colour
  const buckets: number[][] = [[], [], [], []]
  let marks = 0
  for (let y = 14; y < h && marks < MAX_LOOP * 4; y += 28) {
    for (let x = 14; x < w && marks < MAX_LOOP * 4; x += 28) {
      const dx = x - pointer.x
      const dy = y - pointer.y
      const d2 = dx * dx + dy * dy
      const near = d2 < 19600 ? 1 - Math.sqrt(d2) / 140 : 0 // the dots near the pointer swell
      const wave = (Math.sin((x + y) * 0.018 - t * 2) + 1) / 2
      const b = Math.min(3, Math.floor(wave * 3.2 + near * 3))
      buckets[b].push(x, y, 1.4 + b * 0.7)
      marks += 1
    }
  }
  buckets.forEach((list, i) => {
    ctx.globalAlpha = 0.25 + i * 0.2
    ctx.beginPath()
    for (let k = 0; k < list.length; k += 3) {
      ctx.moveTo(list[k] + list[k + 2], list[k + 1])
      ctx.arc(list[k], list[k + 1], list[k + 2], 0, TAU)
    }
    ctx.fill()
  })
}

function pandas(ctx: SceneContext, t: number, { w, h }: SceneSize, colour: string): void {
  ctx.clearRect(0, 0, w, h)
  const cw = 120
  const rh = 38
  const ox = (t * 10) % cw
  const oy = (t * 6) % rh
  ctx.strokeStyle = colour
  ctx.fillStyle = colour
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.22
  ctx.beginPath()
  for (let x = -ox, g = 0; x < w && g < MAX_LOOP; x += cw, g += 1) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
  }
  for (let y = -oy, g = 0; y < h && g < MAX_LOOP; y += rh, g += 1) {
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
  }
  ctx.stroke()
  ctx.globalAlpha = 0.12
  ctx.fillRect(0, ((t * 40) % (h + rh * 2)) - rh, w, rh) // the scanning row
}

function la(ctx: SceneContext, t: number, { w, h }: SceneSize, colour: string): void {
  ctx.clearRect(0, 0, w, h)
  // A grid that a slowly changing matrix [[a, b], [c, d]] bends; the two arrows are the images of the unit vectors.
  const a = 1 + 0.3 * Math.sin(t * 0.5)
  const b = 0.35 * Math.sin(t * 0.37)
  const c = 0.35 * Math.cos(t * 0.43)
  const d = 1 + 0.3 * Math.cos(t * 0.6)
  const s = 56
  const P = (u: number, v: number): [number, number] => [w / 2 + (a * u + b * v) * s, h / 2 + (c * u + d * v) * s]
  ctx.strokeStyle = colour
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.28
  ctx.beginPath()
  for (let i = -30; i <= 30; i += 1) {
    let p = P(i, -30)
    let q = P(i, 30)
    ctx.moveTo(p[0], p[1])
    ctx.lineTo(q[0], q[1])
    p = P(-30, i)
    q = P(30, i)
    ctx.moveTo(p[0], p[1])
    ctx.lineTo(q[0], q[1])
  }
  ctx.stroke()
  ctx.globalAlpha = 0.95
  ctx.lineWidth = 3
  ctx.beginPath()
  const o = P(0, 0)
  let q = P(2, 0)
  ctx.moveTo(o[0], o[1])
  ctx.lineTo(q[0], q[1])
  q = P(0, 2)
  ctx.moveTo(o[0], o[1])
  ctx.lineTo(q[0], q[1])
  ctx.stroke()
}

function prob(ctx: SceneContext, st: SceneState, { w, h }: SceneSize, colour: string, rand: () => number): void {
  ctx.clearRect(0, 0, w, h)
  const count = Math.min(MAX_LOOP, Math.ceil(w / 16))
  if (st.bins === undefined || st.bins.length !== count) st.bins = new Array<number>(count).fill(0)
  if (st.balls === undefined) st.balls = Array.from({ length: 60 }, () => ({ x: w / 2, y: rand() * h * 0.6 }))
  const bins = st.bins
  const binOf = (x: number): number => Math.min(count - 1, Math.max(0, Math.trunc(x / 16)))
  ctx.fillStyle = colour
  for (const p of st.balls) {
    p.y += 4.4
    if (Math.trunc(p.y) % 22 < 4.4) p.x += rand() < 0.5 ? -8 : 8 // a ball steps left or right at each peg row
    const k = binOf(p.x)
    if (p.y > h - bins[k] * 3) {
      if (bins[k] < 60) bins[k] += 1
      p.x = w / 2
      p.y = -rand() * 200
    }
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.arc(p.x, p.y, 3, 0, TAU)
    ctx.fill()
  }
  ctx.globalAlpha = 0.35
  bins.forEach((v, i) => ctx.fillRect(i * 16 + 1, h - v * 3, 14, v * 3))
}

// Draws one picture of a scene. Nothing is drawn (and nothing thrown) when the size is not a positive number.
export function drawScene(
  id: SceneId,
  ctx: SceneContext,
  state: SceneState,
  t: number,
  size: SceneSize,
  colour: string,
  pointer: ScenePointer = NO_POINTER,
  rand: () => number = Math.random,
): void {
  if (!(size.w > 0) || !(size.h > 0) || !Number.isFinite(size.w) || !Number.isFinite(size.h)) return
  const time = Number.isFinite(t) ? t : 0
  switch (id) {
    case "home":
      return home(ctx, state, time, size, colour, rand)
    case "git":
      return git(ctx, time, size, colour)
    case "terminal":
      return terminal(ctx, state, size, colour, rand)
    case "python":
      return python(ctx, time, size, colour)
    case "numpy":
      return numpy(ctx, time, size, colour, pointer)
    case "pandas":
      return pandas(ctx, time, size, colour)
    case "la":
      return la(ctx, time, size, colour)
    case "prob":
      return prob(ctx, state, size, colour, rand)
  }
}
// AB:LEARN.SCENES:END
