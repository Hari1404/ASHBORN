// AB:TIMER.BG-RENDER:START
// How the moving background of the Pro Timer is drawn, as plain values and functions: no screen, no WebGL, no clock of its own. The canvas that uses them is src/components/BackgroundCanvas.tsx (see CONNECTIONS.md C52).
// The picture is the one of the blend preview of the owner: a long soft gradient that flows slowly, taken from a ramp of five colours, with a little grain that stands still. The ramp is turned into a row of 256 colours (rampBytes), mixed between the five colours in the Oklab colour space, and the graphics chip looks every pixel up in that row (FIELD_FRAGMENT).
// A colour is read from its text #rrggbb in plain code (readColour). Nothing is ever drawn on a hidden canvas and read back, so a browser that blocks or scrambles that (some privacy settings and extensions do) cannot change the colours.
// The automated tests are in src/lib/backgroundRender.test.ts. Run them with: npm test

// How many colours the row has. The texture of the canvas is this wide and one pixel high.
export const RAMP_SIZE = 256
// The longest step of time the flow takes in one frame, in seconds. After the page was hidden or the machine stalled, the flow goes on from where it was instead of jumping.
export const FRAME_STEP_MAX_S = 0.1

export type Triple = readonly [number, number, number]

const BLACK: Triple = [0, 0, 0]

// A colour written as #rrggbb (the # may be left out, capitals are fine) as three numbers from 0 to 1. Anything else is black.
export function readColour(text: string): Triple {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(text)
  if (match === null) return BLACK
  return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function fromLinear(value: number): number {
  const c = Math.max(0, Math.min(1, value))
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

// A colour (red, green, blue, each 0 to 1) in the Oklab colour space: lightness, and two numbers for the hue.
export function toOklab(rgb: Triple): Triple {
  const r = toLinear(rgb[0])
  const g = toLinear(rgb[1])
  const b = toLinear(rgb[2])
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

// The way back: a colour of the Oklab space as red, green, blue (each cut to 0 to 1).
export function fromOklab(lab: Triple): Triple {
  let l = lab[0] + 0.3963377774 * lab[1] + 0.2158037573 * lab[2]
  let m = lab[0] - 0.1055613458 * lab[1] - 0.0638541728 * lab[2]
  let s = lab[0] - 0.0894841775 * lab[1] - 1.291485548 * lab[2]
  l = l * l * l
  m = m * m * m
  s = s * s * s
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

// The row of RAMP_SIZE colours of a ramp, as bytes (red, green, blue, 255 for every colour). The first colour of the ramp is the first entry of the row and the last colour is the last entry; between two neighbours of the ramp the colour is mixed in the Oklab space. softness 0 mixes in a straight line, softness 1 eases in and out of every colour of the ramp (smoothstep), so the colours melt into each other; in between is in between. A ramp of one colour is a row of that colour, and a colour that is not #rrggbb is black.
export function rampBytes(colours: readonly string[], softness: number): Uint8Array {
  const first = colours[0] ?? "#000000"
  const stops = colours.length >= 2 ? colours : [first, first]
  const labs = stops.map((colour) => toOklab(readColour(colour)))
  const last = labs.length - 1
  const shape = Number.isFinite(softness) ? Math.min(1, Math.max(0, softness)) : 0
  const bytes = new Uint8Array(RAMP_SIZE * 4)
  for (let k = 0; k < RAMP_SIZE; k++) {
    const x = (k / (RAMP_SIZE - 1)) * last
    const i = Math.min(Math.floor(x), last - 1)
    let f = x - i
    f = f + (f * f * (3 - 2 * f) - f) * shape
    const lab: Triple = [
      labs[i][0] + (labs[i + 1][0] - labs[i][0]) * f,
      labs[i][1] + (labs[i + 1][1] - labs[i][1]) * f,
      labs[i][2] + (labs[i + 1][2] - labs[i][2]) * f,
    ]
    const rgb = fromOklab(lab)
    bytes[k * 4] = Math.round(rgb[0] * 255)
    bytes[k * 4 + 1] = Math.round(rgb[1] * 255)
    bytes[k * 4 + 2] = Math.round(rgb[2] * 255)
    bytes[k * 4 + 3] = 255
  }
  return bytes
}

export type FieldSettings = {
  // The direction of the gradient, in degrees.
  angle: number
  // How far the slow flow bends the gradient (0 is a straight gradient).
  flow: number
  // How big the picture is (2 shows half as much of it, so everything looks twice as big).
  scale: number
  // How strong the fine silk lines on the gradient are (0 is none).
  silk: number
  // How strong the grain is (0 is none).
  grainAmount: number
  // How big a grain is, in pixels of the screen.
  grainSize: number
  // How much black the bottom of the picture gets, 0 to 1 (0 is none). The Pro Timer leaves it at 0, because its css puts a shade over the bottom of the screen (CONNECTIONS.md C37); the preview of the owner has its own shade of 0.45, which the pixel checks use.
  shade: number
}

export type FieldUniforms = {
  zoom: number
  flow: number
  dir: readonly [number, number]
  silk: number
  grain: readonly [number, number]
  shade: number
}

// A number cut to its range; a value that is not a number counts as the plainest one given.
function limit(value: number, low: number, high: number, plain: number): number {
  return Number.isFinite(value) ? Math.min(high, Math.max(low, value)) : plain
}

// The numbers the shader gets for these settings. ratio is the number of canvas pixels for one pixel of the screen. Settings out of their range are cut to it, and a setting that is not a number counts as the plainest value (no flow, no silk, no grain).
export function fieldUniforms(settings: FieldSettings, ratio: number): FieldUniforms {
  const radians = (limit(settings.angle, -3600, 3600, 0) * Math.PI) / 180
  const pixels = limit(ratio, 0.25, 8, 1)
  return {
    zoom: 1.15 / limit(settings.scale, 0.25, 3, 1),
    flow: limit(settings.flow, 0, 3, 0),
    dir: [Math.cos(radians), Math.sin(radians)],
    silk: limit(settings.silk, 0, 1, 0),
    grain: [limit(settings.grainSize, 0.5, 4, 1) * pixels, 2 * limit(settings.grainAmount, 0, 0.5, 0)],
    shade: limit(settings.shade, 0, 1, 0),
  }
}

// The size of the canvas in pixels for a box of this size on the screen: at least 2 by 2.
export function canvasPixels(cssWidth: number, cssHeight: number, ratio: number): [number, number] {
  const pixels = limit(ratio, 0.25, 8, 1)
  const side = (css: number) => Math.max(2, Math.round(limit(css, 0, 100000, 0) * pixels))
  return [side(cssWidth), side(cssHeight)]
}

// Where the flow of the picture is after another frame: the elapsed time (in milliseconds) cut to FRAME_STEP_MAX_S and taken at the speed. A speed of 0 (or less, or not a number) stands still.
export function flowAfter(phase: number, elapsedMs: number, speed: number): number {
  const step = limit(elapsedMs / 1000, 0, FRAME_STEP_MAX_S, 0)
  return phase + step * limit(speed, 0, 100, 0)
}

// One big triangle that covers the whole canvas. It needs no data from the page.
export const FIELD_VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

// The picture, for every pixel: the position is bent twice by slow waves (flow), a long gradient runs across it in the direction of the angle with fine lines on it (silk), the number that comes out looks up a colour in the row of the ramp, the bottom may get a shade, and a still grain is added.
export const FIELD_FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uPhase;
uniform sampler2D uRamp;
uniform vec2 uGrain;
uniform float uZoom;
uniform float uFlow;
uniform vec2 uDir;
uniform float uSilk;
uniform float uShade;
out vec4 outColor;
float hash(vec2 s) {
  return fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 p = uv * uZoom;
  float s = uPhase;
  p += 0.22 * uFlow * vec2(sin(p.y * 2.1 + s * 0.31 + 1.3), sin(p.x * 1.7 - s * 0.27));
  p += 0.12 * uFlow * vec2(sin(p.y * 4.3 - s * 0.41), sin(p.x * 3.7 + s * 0.37 + 2.0));
  float t = 0.5 + dot(p, uDir) * 0.95 + 0.12 * uSilk * sin(dot(p, vec2(-uDir.y, uDir.x)) * 9.0 + s * 0.5) + 0.08 * sin(s * 0.2);
  t = pow(clamp(t, 0.0, 1.0), 1.3);
  vec3 col = texture(uRamp, vec2(t, 0.5)).rgb;
  col *= 1.0 - uShade * (1.0 - smoothstep(-0.5, 0.1, uv.y));
  float g = hash(floor(gl_FragCoord.xy / uGrain.x)) - 0.5;
  col += g * uGrain.y;
  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`

// The names of the uniforms of FIELD_FRAGMENT. The canvas looks every one of them up by name.
export const FIELD_UNIFORM_NAMES = ["uRes", "uPhase", "uRamp", "uGrain", "uZoom", "uFlow", "uDir", "uSilk", "uShade"] as const
// AB:TIMER.BG-RENDER:END
