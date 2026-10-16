# PACKET 08A: THE MOVING BACKGROUND BECOMES GRAINIENT (STARTS BLACK, GROWS FROM THE DARK END, 12 SECOND BLEND), IN THE COLOUR FAMILY OF THE GLOWING BALL

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 07C (the milestone message on the screen). Step 0 checks that it is in place and that the files this packet changes are untouched. If not: **STOP**.
- Edit ONLY these files. ONE new file: `src/components/Grainient.tsx` (a library file, copied unchanged). FOUR files replaced as a whole: `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`. TWO files edited in one place each: `src/components/TimerScreen.tsx` (one line of comment) and `src/timer.css` (the block of the moving background). THREE map files edited: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Create NO other file.
- Do NOT create any helper script, `.ps1` file, note or temp file anywhere. Write the new file and the four replaced files with your file-writing tool (put exactly the block in the file). Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/SideRays.tsx`, `src/components/MetaBalls.tsx`, `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them. `SideRays.tsx` and `MetaBalls.tsx` are not used any more after this packet, but they STAY in the project (do NOT delete them). `Grainient.tsx` is a library file too: after Step 1 never edit it. `src/components/TimerBall.tsx`, `src/components/TimerScreen.test.tsx`, `src/lib/milestoneLines.test.ts`, `src/lib/stopAlertLines.test.ts` and every file in `src/lib` except the two named above are NOT changed by this packet.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any other install. This packet needs none (Grainient uses only React). Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 9 is allowed.
- Every "find and replace" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The moving background behind the Pro Timer (it shows while a session runs or is paused) is today the React Bits animation Side Rays: white rays from the top right corner, coloured by a tint layer, and brightened over the session by a black layer. This packet replaces it with the React Bits animation **Grainient**: a slowly flowing gradient with a little grain, drawn from a ramp of five colours, with the settings the owner chose in his blend preview (angle 55, flow 0.8, speed 1, scale 1, softness 1, silk 0.35, grain 0.08 and 1.2, grain still, no cursor, no click, no start animation, one canvas pixel for every pixel of the screen).

The ramp of a session **starts all black** and **grows from the dark end**: at 10 minutes the dark shade and the main colour of the palette come in, at 30 minutes the lighter tint, at 90 minutes the lightest tint. Each step is a **smooth 12 second blend** (a smooth start and a smooth end; the glowing ball takes 4 seconds). The six palettes are in the same order as the six palettes of the glowing ball, and a session gets the same palette number for both, so the ball and the background are always of the same colour family. The library reads its colours again while it runs and does not build its drawing again for them, so the screen simply gives it a new list of five colours many times a second while a blend is on its way.

Gone: the tint layer, the black light layer and the half-size box of the old rays (and `BG_COLOUR` and `BG_RENDER_SCALE`). New: a shade at the bottom of the box (45 percent black at the very bottom, gone at 60 percent of the height) so that the milestone message stays easy to read. Everything else stays: the fade in and out (700 ms), the dimming (0.5, and 0.2 while paused), no background without WebGL 2 and at lite level 2, the waits before the animations are made (300 ms and 600 ms), the glowing ball, the clocks, the buttons, the timer maths and the database.

Left on purpose: the function `bgLight` and its two numbers stay in `backgroundLook.ts`, because the tests of the stop alert lines and of the milestone lines still ask them about the "rays". Those lines talk about rays of light that do not exist any more; a later packet (08B) rewrites them and then removes `bgLight`.

In the planner's checks the whole test suite, the type check, the checker and the build passed with exactly these files. The tests use a stand-in for the animation (the test browser has no WebGL 2): the real look in a browser is the owner's own look at the end of this packet.

---
## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/SideRays.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/lib/ballLook.ts`, `src/timer.css`. If any is missing: **STOP** and report which.
Check that `src/components/Grainient.tsx` does NOT exist yet. If it exists: **STOP** and report.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 07C):
```
TAGS OK: 34 tags, 66 places
CONNECTIONS OK: 51 connections, 415 anchors, 52 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the files this packet changes (`src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 07C`. If none does: **STOP** and report the COMPLETE output (Packet 07C was not committed).

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. This ONE command (it prints the fingerprint of each of the nine files this packet changes, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/components/TimerBackground.tsx","src/components/TimerBackground.test.tsx","src/lib/backgroundLook.ts","src/lib/backgroundLook.test.ts","CODE_MAP.md","CONNECTIONS.md","PROGRESS.md")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must print exactly these nine lines (the files exactly as they are after Packet 07C and before this packet):
```
src/components/TimerScreen.tsx 2f77a2e37fbc22780e2bb22fb4c0257d6f6e26368f928b598ec78196c3245544
src/timer.css 69b1b8826a8816670d86ac32f42508b7109976bf93d3adc181536b64b4a9940b
src/components/TimerBackground.tsx cc655154d7312e7f5728615030c00d4f84412ac852ea0efa2ff67b83dc7b76ad
src/components/TimerBackground.test.tsx 098da8f882bdffeb85193e2e67dab8b2384f585fdd2c7c928a2d60d56d6fc2b4
src/lib/backgroundLook.ts f9e32413aadbf9d4076b28d4591d78e6de5411402b0d9685bd619fb676301e32
src/lib/backgroundLook.test.ts c20c79dfa923f3faad0b3685d42da687cf89f3a82db4d89edd9010c41a37e135
CODE_MAP.md 175523d63388f0792a691088d676216c2cd84b7c0c45ea2952f5d884233930bd
CONNECTIONS.md 3652f3eb3033ba2b77d2c7f2df51f9fd0891ac1ac789108271629d7b5e041cdd
PROGRESS.md 325f6d5a514e69319adfb610c44e76b3e3490c9ad6b8c40f7c03287fb877eb31
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Create the new file `src/components/Grainient.tsx`
This is the React Bits component Grainient (TypeScript, Tailwind variant), copied unchanged. It is a LIBRARY file: never edit it after this step. Create the file `src/components/Grainient.tsx` with exactly this content (everything inside the block below; the block is 688 lines long):
````
'use client';

import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from 'react';

export type GrainientType = 'linear' | 'radial';

export interface GrainientProps extends Omit<HTMLAttributes<HTMLDivElement>, 'style'> {
  colors?: string[];
  type?: GrainientType;
  angle?: number;
  bands?: number;
  speed?: number;
  flow?: number;
  scale?: number;
  softness?: number;
  silk?: number;
  grainAmount?: number;
  grainSize?: number;
  grainAnimated?: boolean;
  contrast?: number;
  saturation?: number;
  variation?: number;
  interactive?: boolean;
  stir?: number;
  clickSwirl?: boolean;
  intro?: boolean;
  lightMode?: boolean;
  dpr?: number;
  style?: CSSProperties;
}

type Settings = {
  colors: string[];
  type: number;
  angle: number;
  bands: number;
  speed: number;
  flow: number;
  scale: number;
  softness: number;
  silk: number;
  grainAmount: number;
  grainSize: number;
  grainAnimated: boolean;
  contrast: number;
  saturation: number;
  variation: number;
  interactive: boolean;
  stir: number;
  clickSwirl: boolean;
  intro: boolean;
  lightMode: boolean;
  dpr?: number;
};

type Sample = { x: number; y: number; vx: number; vy: number; age: number; grow: number; done: boolean };

type Spin = { x: number; y: number; age: number; direction: number };

type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> };

const MAX_COLORS = 8;
const MAX_STIRS = 24;
const MAX_TWIRLS = 4;
const STIR_LIFE = 1.3;
const STIR_STEP = 0.06;
const TWIRL_LIFE = 2.6;
const INTRO_SECONDS = 1.6;
const DEFAULT_COLORS = ['#120f17', '#2a0f0a', '#9a3412', '#f97316', '#fed7aa'];
const TYPES: Record<string, number> = { linear: 0, radial: 1 };
const LIFT = 0.2;

const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FIELD = `#version 300 es
precision highp float;
precision highp int;
uniform float uAspect;
uniform float uTime;
uniform vec3 uRamp[8];
uniform int uCount;
uniform int uType;
uniform vec2 uDir;
uniform float uExtent;
uniform float uBands;
uniform float uSoftness;
uniform float uFlow;
uniform float uScale;
uniform float uSilk;
uniform vec4 uStir[24];
uniform float uStirWeight[24];
uniform vec4 uTwirl[4];
uniform vec2 uSeed;
uniform float uContrast;
uniform float uSaturation;
uniform float uSettle;
uniform float uReveal;
in vec2 vUv;
out vec4 outColor;

vec2 hash2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.103, 0.0973));
  q += dot(q, q.yzx + 33.33);
  return fract((q.xx + q.yz) * q.zy) * 2.0 - 1.0;
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(hash2(i), f);
  float b = dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return 0.5 + 0.5 * mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

vec2 drift(vec2 p, float t) {
  vec2 w1 = vec2(
    noise(p * 0.85 + vec2(t * 0.11, t * 0.07)),
    noise(p * 0.85 + vec2(4.1, 1.7) - vec2(t * 0.08, t * 0.12))
  );
  vec2 w2 = vec2(
    noise(p * 1.55 + w1 * 1.8 + vec2(1.3, 7.1) + t * 0.05),
    noise(p * 1.55 + w1 * 1.8 + vec2(6.4, 2.2) - t * 0.06)
  );
  return (w1 - 0.5) * 1.1 + (w2 - 0.5) * 0.55;
}

vec2 warp(vec2 p) {
  vec2 q = p / uScale;
  if (uType == 1) {
    float turn = uTime * 0.35;
    q = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * q;
  } else {
    q += vec2(-uDir.y, uDir.x) * uTime * 0.45;
  }
  return p + drift(q + uSeed, uTime) * uFlow * uScale * uSettle;
}

float coord(vec2 p) {
  vec2 w = warp(p);
  return uType == 1 ? 1.0 - length(w) * 1.1 : dot(w, uDir) / uExtent + 0.5;
}

vec3 labToRgb(vec3 lab) {
  float l = lab.x + 0.3963377774 * lab.y + 0.2158037573 * lab.z;
  float m = lab.x - 0.1055613458 * lab.y - 0.0638541728 * lab.z;
  float s = lab.x - 0.0894841775 * lab.y - 1.2914855480 * lab.z;
  l = l * l * l;
  m = m * m * m;
  s = s * s * s;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}

vec3 encode(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  for (int i = 0; i < 24; i++) {
    float w = uStirWeight[i];
    if (w <= 0.0) continue;
    vec2 d = p - uStir[i].xy;
    p -= uStir[i].zw * w * exp(-dot(d, d) / 0.045);
  }
  for (int i = 0; i < 4; i++) {
    float angle = uTwirl[i].z;
    if (angle == 0.0) continue;
    vec2 d = p - uTwirl[i].xy;
    float a = angle * exp(-dot(d, d) / (uTwirl[i].w * uTwirl[i].w));
    float c = cos(a);
    float s = sin(a);
    p = uTwirl[i].xy + mat2(c, -s, s, c) * d;
  }
  float raw = coord(p);
  float s = raw;
  if (uBands > 1.0) {
    s *= uBands;
    float cycle = floor(s);
    s = fract(s);
    if (mod(cycle, 2.0) > 0.5) s = 1.0 - s;
  }
  s = clamp(s, 0.0, 1.0);
  float scaled = s * float(uCount - 1);
  int index = int(min(floor(scaled), float(uCount - 2)));
  float f = scaled - float(index);
  float edge = max(uSoftness * 0.5, fwidth(scaled) * 0.75);
  float shaped = smoothstep(0.5 - edge, 0.5 + edge, f);
  vec3 from = uRamp[0];
  vec3 to = uRamp[1];
  for (int i = 0; i < 7; i++) {
    if (i == index) {
      from = uRamp[i];
      to = uRamp[i + 1];
    }
  }
  vec3 lab = mix(from, to, shaped);
  if (uSilk > 0.0) {
    vec2 grad = vec2(coord(p + vec2(0.004, 0.0)) - raw, coord(p + vec2(0.0, 0.004)) - raw) / 0.004;
    vec2 slope = grad * sin(3.14159265 * clamp(raw, 0.0, 1.0) * uBands) * uSilk * 4.0;
    vec3 normal = normalize(vec3(-slope, 1.0));
    vec3 light = normalize(vec3(-uDir.y, uDir.x, 1.2));
    float diffuse = dot(normal, light) - light.z;
    lab = uRamp[0] + (lab - uRamp[0]) * (1.0 + (diffuse * 0.35 + max(diffuse, 0.0) * diffuse * 0.6) * uSilk);
  }
  lab = mix(uRamp[0], lab, smoothstep(0.0, 1.0, uReveal * 1.5 - length(vUv - 0.5) * 0.6));
  lab.x = (lab.x - 0.55) * uContrast + 0.55;
  lab.yz *= uSaturation;
  outColor = vec4(encode(labToRgb(lab)), 1.0);
}`;

const COMPOSITE = `#version 300 es
precision highp float;
uniform sampler2D uField;
uniform float uGrain;
uniform float uGrainSize;
uniform float uFrame;
in vec2 vUv;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float clump(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec3 color = texture(uField, vUv).rgb;
  vec2 pixel = gl_FragCoord.xy + uFrame * vec2(17.0, 59.0);
  float fine = hash(pixel) + hash(pixel + 7.13) - 1.0;
  float coarse = (clump(pixel / max(uGrainSize, 1.0)) - 0.5) * 2.0;
  float grain = mix(fine, coarse, clamp(uGrainSize - 1.0, 0.0, 1.0) * 0.8);
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color += grain * uGrain * (0.45 + 2.2 * luma * (1.0 - luma));
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toLinear = (value: number) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

const toLab = ([r, g, b]: number[]): number[] => {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ];
};

const compile = (gl: WebGL2RenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
};

const link = (gl: WebGL2RenderingContext, fragmentSource: string): Program | null => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    const name = info.name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
};

const Grainient = ({
  colors = DEFAULT_COLORS,
  type = 'linear',
  angle = 55,
  bands = 1,
  speed = 1,
  flow = 0.8,
  scale = 1,
  softness = 1,
  silk = 0.35,
  grainAmount = 0.08,
  grainSize = 1.2,
  grainAnimated = true,
  contrast = 1,
  saturation = 1,
  variation = 0,
  interactive = true,
  stir = 1,
  clickSwirl = true,
  intro = true,
  lightMode = false,
  dpr,
  className = '',
  style,
  ...rest
}: GrainientProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const palette = (Array.isArray(colors) && colors.length ? colors : DEFAULT_COLORS).slice(0, MAX_COLORS);
  const settings: Settings = {
    colors: palette.length > 1 ? palette : [palette[0], palette[0]],
    type: TYPES[type] ?? 0,
    angle,
    bands: clamp(bands, 1, 8),
    speed: Math.max(0, speed),
    flow: clamp(flow, 0, 3),
    scale: clamp(scale, 0.25, 3),
    softness: clamp(softness, 0, 1),
    silk: clamp(silk, 0, 1),
    grainAmount: clamp(grainAmount, 0, 0.5),
    grainSize: clamp(grainSize, 0.5, 4),
    grainAnimated,
    contrast: clamp(contrast, 0.2, 2),
    saturation: clamp(saturation, 0, 2),
    variation: Math.max(0, variation),
    interactive,
    stir: clamp(stir, 0, 2),
    clickSwirl,
    intro,
    lightMode,
    dpr
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!container || !canvas || !gl) return undefined;

    const field = link(gl, FIELD);
    const composite = link(gl, COMPOSITE);
    if (!field || !composite) return undefined;
    const fu = field.uniforms;
    const cu = composite.uniforms;
    const vao = gl.createVertexArray();
    const target = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, target);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const buffer = gl.createFramebuffer();
    const fieldSize = { width: 0, height: 0 };

    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    const colorCache = new Map<string, number[]>();
    const parse = (value: string): number[] => {
      const key = String(value);
      const cached = colorCache.get(key);
      if (cached) return cached;
      let rgb = [0, 0, 0];
      if (probe) {
        probe.clearRect(0, 0, 1, 1);
        probe.fillStyle = '#000000';
        probe.fillStyle = key;
        probe.fillRect(0, 0, 1, 1);
        const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
        rgb = [r / 255, g / 255, b / 255];
      }
      colorCache.set(key, rgb);
      return rgb;
    };

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const view = { width: 1, height: 1, ratio: 1 };
    const ramp = new Float32Array(MAX_COLORS * 3);
    const stirs = new Float32Array(MAX_STIRS * 4);
    const stirWeights = new Float32Array(MAX_STIRS);
    const twirls = new Float32Array(MAX_TWIRLS * 4);
    const trail: Sample[] = [];
    const spins: Spin[] = [];
    const pointer = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, inside: false, fresh: true };
    let paletteKey = '';
    let time = 0;
    let introClock = settingsRef.current.intro && !reduce ? 0 : 1;
    let frameSeed = 0;
    let grainClock = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const syncPalette = () => {
      const s = settingsRef.current;
      const key = `${s.colors.join(',')}|${s.lightMode}`;
      if (key === paletteKey) return;
      paletteKey = key;
      const labs = s.colors.map(color => toLab(parse(color)));
      if (!s.lightMode) {
        labs.forEach((lab, i) => ramp.set(lab, i * 3));
      } else {
        const blank = labs.map(([L]) => Math.abs(L - labs[0][0]) < 0.1);
        const tints = labs.filter((_, i) => !blank[i]).reverse();
        labs.forEach((_, i) => {
          const [L, a, b] = blank[i] ? [1, 0, 0] : (tints.shift() as number[]);
          ramp.set([L + (1 - L) * LIFT, a * (1 - LIFT), b * (1 - LIFT)], i * 3);
        });
      }
    };

    const draw = () => {
      const s = settingsRef.current;
      const aspect = view.width / view.height;
      syncPalette();
      gl.bindVertexArray(vao);
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.viewport(0, 0, fieldSize.width, fieldSize.height);
      gl.useProgram(field.program);
      gl.uniform1f(fu.uAspect, aspect);
      gl.uniform1f(fu.uTime, time);
      gl.uniform3fv(fu.uRamp, ramp);
      gl.uniform1i(fu.uCount, s.colors.length);
      const radians = (s.angle * Math.PI) / 180;
      gl.uniform1i(fu.uType, s.type);
      gl.uniform2f(fu.uDir, Math.sin(radians), Math.cos(radians));
      gl.uniform1f(fu.uExtent, aspect * Math.abs(Math.sin(radians)) + Math.abs(Math.cos(radians)));
      gl.uniform1f(fu.uBands, s.bands);
      gl.uniform1f(fu.uSoftness, s.softness);
      gl.uniform1f(fu.uFlow, s.flow);
      gl.uniform1f(fu.uScale, s.scale);
      gl.uniform1f(fu.uSilk, s.silk);
      gl.uniform4fv(fu.uStir, stirs);
      gl.uniform1fv(fu.uStirWeight, stirWeights);
      gl.uniform4fv(fu.uTwirl, twirls);
      gl.uniform2f(fu.uSeed, s.variation * 3.17, s.variation * 1.91);
      gl.uniform1f(fu.uContrast, s.contrast);
      gl.uniform1f(fu.uSaturation, s.saturation);
      gl.uniform1f(fu.uSettle, introClock * introClock * (3 - 2 * introClock));
      gl.uniform1f(fu.uReveal, introClock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(composite.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, target);
      gl.uniform1i(cu.uField, 0);
      gl.uniform1f(cu.uGrain, s.grainAmount);
      gl.uniform1f(cu.uGrainSize, s.grainSize * view.ratio);
      gl.uniform1f(cu.uFrame, frameSeed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const s = settingsRef.current;
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      view.ratio = Math.min(s.dpr || window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(view.width * view.ratio));
      canvas.height = Math.max(1, Math.round(view.height * view.ratio));
      const width = Math.max(1, Math.round(canvas.width / 2));
      const height = Math.max(1, Math.round(canvas.height / 2));
      if (width !== fieldSize.width || height !== fieldSize.height) {
        fieldSize.width = width;
        fieldSize.height = height;
        gl.bindTexture(gl.TEXTURE_2D, target);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
      draw();
      wake();
    };

    const updateTouches = (dt: number, aspect: number) => {
      const s = settingsRef.current;
      const follow = 1 - Math.exp(-dt / 0.06);
      const px = pointer.sx;
      const py = pointer.sy;
      pointer.sx += (pointer.x - pointer.sx) * follow;
      pointer.sy += (pointer.y - pointer.sy) * follow;
      const vx = ((pointer.sx - px) / dt) * aspect;
      const vy = (pointer.sy - py) / dt;
      pointer.vx = vx;
      const head = trail[0];
      trail.forEach(sample => {
        if (sample.done) sample.age += dt;
      });
      if (s.interactive && pointer.inside && Math.hypot(vx, vy) > 0.02 && !reduce) {
        if (!head || head.done) {
          trail.unshift({ x: 0, y: 0, vx: 0, vy: 0, age: 0, grow: 0, done: false });
          if (trail.length > MAX_STIRS) trail.pop();
        }
        const live = trail[0];
        live.x = (pointer.sx - 0.5) * aspect;
        live.y = pointer.sy - 0.5;
        live.vx = vx;
        live.vy = vy;
        live.grow = Math.min(1, live.grow + dt / STIR_STEP);
        live.done = live.grow >= 1;
      } else if (head) {
        head.done = true;
      }
      while (trail.length && trail[trail.length - 1].age > STIR_LIFE) trail.pop();
      for (let i = 0; i < MAX_STIRS; i++) {
        const sample = trail[i];
        if (!sample) {
          stirWeights[i] = 0;
          continue;
        }
        const fade = 1 - sample.age / STIR_LIFE;
        const cap = Math.min(1, 2.2 / Math.max(Math.hypot(sample.vx, sample.vy), 0.001));
        stirs.set([sample.x, sample.y, sample.vx * cap, sample.vy * cap], i * 4);
        stirWeights[i] = fade * fade * sample.grow * s.stir * 0.05;
      }
      spins.forEach(spin => {
        spin.age += dt;
      });
      while (spins.length && spins[spins.length - 1].age > TWIRL_LIFE) spins.pop();
      for (let i = 0; i < MAX_TWIRLS; i++) {
        const spin = spins[i];
        if (!spin) {
          twirls[i * 4 + 2] = 0;
          continue;
        }
        const k = spin.age / TWIRL_LIFE;
        const envelope = Math.min(1, spin.age / 0.18) * (1 - k) * (1 - k);
        twirls.set([spin.x, spin.y, spin.direction * 2.4 * envelope, 0.16 + 0.1 * Math.min(1, spin.age / 0.5)], i * 4);
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const s = settingsRef.current;
      const dt = last ? clamp((now - last) / 1000, 0.001, 0.05) : 1 / 60;
      last = now;
      if (!reduce) time += dt * s.speed * 0.16;
      if (introClock < 1) introClock = Math.min(1, introClock + dt / INTRO_SECONDS);
      grainClock += dt;
      if (s.grainAnimated && !reduce && grainClock > 1 / 24) {
        grainClock = 0;
        frameSeed = (frameSeed + 1) % 97;
      }
      updateTouches(dt, view.width / view.height);
      draw();
      const busy =
        (!reduce && (s.speed > 0 || s.grainAnimated)) || introClock < 1 || trail.length > 0 || spins.length > 0;
      if (busy) raf = requestAnimationFrame(frame);
      else last = 0;
    };

    function wake() {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    }

    const locate = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(1, rect.width);
      const y = 1 - (event.clientY - rect.top) / Math.max(1, rect.height);
      pointer.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      pointer.x = x;
      pointer.y = y;
      if (pointer.fresh || !pointer.inside) {
        pointer.sx = x;
        pointer.sy = y;
        pointer.fresh = false;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      locate(event);
      if (pointer.inside || trail.length) wake();
    };

    const onPointerDown = (event: PointerEvent) => {
      locate(event);
      const s = settingsRef.current;
      if (!pointer.inside || !s.clickSwirl || reduce) return;
      spins.unshift({
        x: (pointer.x - 0.5) * (view.width / view.height),
        y: pointer.y - 0.5,
        age: 0,
        direction: pointer.vx < 0 ? 1 : -1
      });
      if (spins.length > MAX_TWIRLS) spins.pop();
      wake();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
    };

    const onVisibility = () => {
      last = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (visible) {
        last = 0;
        wake();
      }
    });
    intersection.observe(container);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    resize();
    wakeRef.current = wake;

    return () => {
      cancelAnimationFrame(raf);
      wakeRef.current = null;
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      gl.deleteTexture(target);
      gl.deleteFramebuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(field.program);
      gl.deleteProgram(composite.program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []);

  useEffect(() => {
    wakeRef.current?.();
  });

  return (
    <div
      ref={containerRef}
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
    </div>
  );
};

export default Grainient;
````

## STEP 2: Replace two files as a whole: `src/lib/backgroundLook.ts` and `src/lib/backgroundLook.test.ts`
Delete the content of each file and write exactly the block below into it. (Where a line of the old file is not in the new one, that is meant: the white colour, the render scale and the tint and light parts of the old rays are gone, and the new palettes, the ramp and the blend are in.)

**`src/lib/backgroundLook.ts`** (new content):
````
import { blendHex, ballPaletteIndex, ballStep } from "@/lib/ballLook"
import type { LiteLevel } from "@/lib/lite"
import { FLOW_FROM_SECONDS } from "@/lib/timerMaths"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and a few functions: no screen, no clock of its own.
// The background is the React Bits animation Grainient: a slow flowing gradient with a little grain. It draws its picture from a ramp of five colours (its `colors`). The ramp of a session starts all black and grows from the dark end: the dark shade and the main colour come in at the first colour step, the lighter tint at the second, the lightest tint at the third (bgRamp below, and CONNECTIONS.md C37).
// The colour steps (10, 30 and 90 minutes) and the choice of palette are the ones of the glowing ball (src/lib/ballLook.ts), so the background and the ball always have the same colour family.
// The library reads its `colors` again on its own while it runs and does not build its drawing again for them, so a colour step is a smooth blend from the old ramp to the new one (bgBlendRamp), given to the library as a new list of five colours many times a second while it moves (see TimerBackground.tsx).
// The automated tests are in src/lib/backgroundLook.test.ts. Run them with: npm test

// How long the background takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C38).
export const BG_FADE_MS = 700
// How long the ramp takes to move from one colour step to the next, in milliseconds. It is slower than the glowing ball (BALL_BLEND_MS in src/lib/ballLook.ts): the background is a big soft picture, and a slow change reads as light changing, not as a switch.
export const BG_BLEND_MS = 12000
// How long after a session lights the background the library animation is made, in milliseconds. It is shorter than BALL_MOUNT_DELAY_MS (src/lib/ballLook.ts): the background is made first because it is cheap to draw, and the heavy glowing ball is made after it, so the work of the two never lands in the same moment (see CONNECTIONS.md C47). The box of the background (its black and its fade in) appears when the animation is made, so the fade in starts then.
export const BG_MOUNT_DELAY_MS = 300

// The settings of the animation, as chosen by the owner in the blend preview. Every other setting of the library keeps its own default. The colours are not here: they come from the ramp of the session.
// The flow never stops (speed 1) and never answers the cursor, a click or the start of the library (a timer screen is not a toy). The grain stands still, so it does not flicker. The library draws one pixel for every pixel of the screen (dpr 1) and draws its picture at half of that size itself, so no half-size box is needed.
export const BG_SETTINGS = {
  type: "linear",
  angle: 55,
  speed: 1,
  flow: 0.8,
  scale: 1,
  softness: 1,
  silk: 0.35,
  grainAmount: 0.08,
  grainSize: 1.2,
  grainAnimated: false,
  interactive: false,
  stir: 0,
  clickSwirl: false,
  intro: false,
  dpr: 1,
} as const

// The six palettes of the background, in the order of the six palettes of the glowing ball (BALL_PALETTES in ballLook.ts: the same session draws the same number for both). Each has five colours, from a near black to the lightest tint: black, dark shade, main colour, lighter tint, lightest tint. Every colour is lighter than the one before it.
export const BG_PALETTES: readonly (readonly [string, string, string, string, string])[] = [
  ["#020100", "#44150c", "#9a3412", "#db8238", "#e9c89f"],
  ["#00030a", "#082e47", "#0e659e", "#409be9", "#a8c1dc"],
  ["#010302", "#093426", "#137158", "#45aa8f", "#90ccbc"],
  ["#050105", "#490b44", "#a0138d", "#e948c6", "#ddadcb"],
  ["#010300", "#213107", "#436f0e", "#68aa3d", "#9acf88"],
  ["#020208", "#2a116f", "#6618ea", "#9782eb", "#bfb8dc"],
]

// The palette of a session: the palette of the glowing ball of the same session.
export function bgPaletteIndex(seed: string): number {
  return ballPaletteIndex(seed)
}

// The five colours of the ramp after this many seconds of the session. Black before the first colour step. At the first step the dark shade and the main colour come in, and the two light places of the ramp hold the main colour. At the second step the lighter tint comes in, at the third the lightest. A number that is not a real count of seconds counts as second 0, and a palette number that is not a palette counts as palette 0.
export function bgRamp(seconds: number, paletteIndex: number): readonly string[] {
  const palette = BG_PALETTES[Number.isInteger(paletteIndex) && paletteIndex >= 0 && paletteIndex < BG_PALETTES.length ? paletteIndex : 0]
  const step = ballStep(seconds)
  if (step === 0) return [palette[0], palette[0], palette[0], palette[0], palette[0]]
  if (step === 1) return [palette[0], palette[1], palette[2], palette[2], palette[2]]
  if (step === 2) return [palette[0], palette[1], palette[2], palette[3], palette[3]]
  return [...palette]
}

// How far the colours have moved after this share of the blend time: a smooth start and a smooth end (smoothstep), so a colour step does not begin or stop with a jerk. 0 gives 0 and 1 gives 1. A share outside 0 to 1 is cut to the ends, and a share that is not a number counts as arrived.
export function bgEase(progress: number): number {
  if (Number.isNaN(progress)) return 1
  const k = Math.min(1, Math.max(0, progress))
  return k * k * (3 - 2 * k)
}

// The ramp on its way from one ramp to another: every colour moves on its own from its old value to its new one, channel by channel, as the ball does (blendHex). At the end the new ramp is given exactly as written. A colour the old ramp does not have is taken as it is.
export function bgBlendRamp(from: readonly string[], to: readonly string[], progress: number): readonly string[] {
  const moved = bgEase(progress)
  return to.map((colour, i) => (moved >= 1 || from[i] === undefined ? colour : blendHex(from[i], colour, moved)))
}

// The light of the old rays. The screen does not use it any more; the tests of the stop alert lines and of the milestone lines still check what some lines say about it, until the lines are rewritten (Packet 08B) and this part is removed.
export const BG_LIGHT_START = 0.3
export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS
export function bgLight(seconds: number): number {
  if (!(seconds > 0)) return BG_LIGHT_START
  if (seconds >= BG_LIGHT_FULL_AT_SECONDS) return 1
  return BG_LIGHT_START + (1 - BG_LIGHT_START) * (seconds / BG_LIGHT_FULL_AT_SECONDS)
}

// Whether the background is drawn: the full look (laptop) and lite level 1 (phones) draw it, lite level 2 draws nothing (the screen stays plain black, see src/lib/lite.ts).
const DRAWN_BY_LITE: readonly [boolean, boolean, boolean] = [true, true, false]

export function bgDrawn(liteLevel: LiteLevel): boolean {
  return DRAWN_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
````

**`src/lib/backgroundLook.test.ts`** (new content):
````
import { describe, expect, it } from "vitest"
import {
  BG_BLEND_MS,
  BG_FADE_MS,
  BG_LIGHT_FULL_AT_SECONDS,
  BG_LIGHT_START,
  BG_PALETTES,
  BG_SETTINGS,
  bgBlendRamp,
  bgDrawn,
  bgEase,
  bgLight,
  bgPaletteIndex,
  bgRamp,
} from "./backgroundLook"
import { BALL_BLEND_MS, BALL_PALETTES, ballPaletteIndex } from "./ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "./timerMaths"

// AB:TIMER.TESTS:START

// Tests of the look of the moving background. Run them with: npm test
// The quality steps (10, 30 and 90 minutes) are the ones of the glowing ball (ballLook.ts, timerMaths.ts), they are tested in ballLook.test.ts and timerMaths.test.ts. How the screen uses the ramp is tested in TimerBackground.test.tsx.

const HEX = /^#[0-9a-f]{6}$/
const SEEDS = ["2026-10-07T10:00:00.123456+00:00", "2026-10-08T07:00:00.000001+00:00", "2026-10-09T18:30:12.987654+00:00", ""]

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// How bright a colour is (the usual weights of red, green and blue).
function luma(hex: string): number {
  const [r, g, b] = channels(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

describe("the timing of the background", () => {
  it("fades out in 0.7 seconds", () => {
    expect(BG_FADE_MS).toBe(700)
  })

  it("moves from one colour step to the next in 12 seconds, which is slower than the 4 seconds of the glowing ball", () => {
    expect(BG_BLEND_MS).toBe(12000)
    expect(BG_BLEND_MS).toBeGreaterThan(BALL_BLEND_MS)
  })
})

describe("the settings of the animation", () => {
  it("are the ones the owner chose in the studio", () => {
    expect(BG_SETTINGS.type).toBe("linear")
    expect(BG_SETTINGS.angle).toBe(55)
    expect(BG_SETTINGS.flow).toBe(0.8)
    expect(BG_SETTINGS.speed).toBe(1)
    expect(BG_SETTINGS.scale).toBe(1)
    expect(BG_SETTINGS.softness).toBe(1)
    expect(BG_SETTINGS.silk).toBe(0.35)
    expect(BG_SETTINGS.grainAmount).toBe(0.08)
    expect(BG_SETTINGS.grainSize).toBe(1.2)
  })

  it("keep the grain still and switch the cursor and the start of the library off", () => {
    expect(BG_SETTINGS.grainAnimated).toBe(false)
    expect(BG_SETTINGS.interactive).toBe(false)
    expect(BG_SETTINGS.stir).toBe(0)
    expect(BG_SETTINGS.clickSwirl).toBe(false)
    expect(BG_SETTINGS.intro).toBe(false)
  })

  it("draw one pixel for every pixel of the screen (the library draws its picture at half of that)", () => {
    expect(BG_SETTINGS.dpr).toBe(1)
  })
})

describe("the palettes", () => {
  it("are six, one for every palette of the glowing ball, in the same order", () => {
    expect(BG_PALETTES).toHaveLength(6)
    expect(BG_PALETTES).toHaveLength(BALL_PALETTES.length)
  })

  it("have five colours each, written as #rrggbb in small letters, and no colour twice in a palette", () => {
    for (const palette of BG_PALETTES) {
      expect(palette).toHaveLength(5)
      for (const colour of palette) expect(colour).toMatch(HEX)
      expect(new Set(palette).size).toBe(5)
    }
  })

  it("start with a black: no channel of the first colour is above 12 of 255", () => {
    for (const palette of BG_PALETTES) {
      for (const value of channels(palette[0])) expect(value).toBeLessThanOrEqual(12)
    }
  })

  it("get lighter at every colour, so the last colour is the lightest and no step goes back", () => {
    for (const palette of BG_PALETTES) {
      for (let i = 1; i < palette.length; i++) expect(luma(palette[i])).toBeGreaterThan(luma(palette[i - 1]))
    }
  })

  it("keep the rust of the owner's Fire ramp exactly, as the main colour of the first palette", () => {
    expect(BG_PALETTES[0][2]).toBe("#9a3412")
  })
})

describe("which palette a session gets", () => {
  it("is the palette of the glowing ball of the same session, so the two are of the same colour family", () => {
    for (const seed of SEEDS) expect(bgPaletteIndex(seed)).toBe(ballPaletteIndex(seed))
  })

  it("is always a real palette, and the same one for the same session", () => {
    for (let i = 0; i < 200; i++) {
      const seed = "2026-10-" + String(1 + (i % 28)).padStart(2, "0") + "T" + String(i % 24).padStart(2, "0") + ":00:00." + String(i * 7919).padStart(6, "0") + "+00:00"
      const index = bgPaletteIndex(seed)
      expect(Number.isInteger(index)).toBe(true)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(BG_PALETTES.length)
      expect(bgPaletteIndex(seed)).toBe(index)
    }
  })

  it("can be every one of the six palettes", () => {
    const seen = new Set<number>()
    for (let i = 0; i < 300; i++) seen.add(bgPaletteIndex("2026-10-07T10:00:" + String(i).padStart(2, "0") + "." + String(i * 104729).padStart(6, "0") + "+00:00"))
    expect(seen.size).toBe(6)
  })
})

describe("the ramp of the session", () => {
  it("is all black before the first colour step, so the screen is black", () => {
    BG_PALETTES.forEach((palette, index) => {
      for (const seconds of [0, 1, 60, SOLID_FROM_SECONDS - 1]) {
        expect(bgRamp(seconds, index)).toEqual([palette[0], palette[0], palette[0], palette[0], palette[0]])
      }
    })
  })

  it("brings in the dark shade and the main colour at the solid step, and the light end holds the main colour", () => {
    BG_PALETTES.forEach((p, index) => {
      expect(bgRamp(SOLID_FROM_SECONDS, index)).toEqual([p[0], p[1], p[2], p[2], p[2]])
      expect(bgRamp(DEEP_FROM_SECONDS - 1, index)).toEqual([p[0], p[1], p[2], p[2], p[2]])
    })
  })

  it("brings in the lighter tint at the deep step", () => {
    BG_PALETTES.forEach((p, index) => {
      expect(bgRamp(DEEP_FROM_SECONDS, index)).toEqual([p[0], p[1], p[2], p[3], p[3]])
      expect(bgRamp(FLOW_FROM_SECONDS - 1, index)).toEqual([p[0], p[1], p[2], p[3], p[3]])
    })
  })

  it("brings in the lightest tint at the flow step, and keeps the whole palette from then on", () => {
    BG_PALETTES.forEach((p, index) => {
      expect(bgRamp(FLOW_FROM_SECONDS, index)).toEqual([...p])
      expect(bgRamp(FLOW_FROM_SECONDS * 4, index)).toEqual([...p])
    })
  })

  it("never has a colour that is lighter than the one after it, and never loses a colour while the session goes on (checked every minute for every palette)", () => {
    BG_PALETTES.forEach((_, index) => {
      let before = bgRamp(0, index)
      for (let minute = 1; minute <= 240; minute++) {
        const now = bgRamp(minute * 60, index)
        for (let i = 1; i < now.length; i++) expect(luma(now[i])).toBeGreaterThanOrEqual(luma(now[i - 1]))
        for (let i = 0; i < now.length; i++) expect(luma(now[i])).toBeGreaterThanOrEqual(luma(before[i]))
        before = now
      }
    })
  })

  it("always starts with the black of the palette and has five colours", () => {
    BG_PALETTES.forEach((p, index) => {
      for (const seconds of [0, SOLID_FROM_SECONDS, DEEP_FROM_SECONDS, FLOW_FROM_SECONDS]) {
        const ramp = bgRamp(seconds, index)
        expect(ramp).toHaveLength(5)
        expect(ramp[0]).toBe(p[0])
      }
    })
  })

  it("gives a whole ramp for numbers that are not seconds or not palettes", () => {
    for (const odd of [Number.NaN, -1, -Infinity]) expect(bgRamp(odd, 0)).toEqual(bgRamp(0, 0))
    for (const odd of [-1, 6, 2.5, Number.NaN]) expect(bgRamp(0, odd)).toEqual(bgRamp(0, 0))
    expect(bgRamp(Infinity, 1)).toHaveLength(5)
  })
})

describe("how far the colours have moved", () => {
  it("is exactly 0 at the start and exactly 1 when it has arrived", () => {
    expect(bgEase(0)).toBe(0)
    expect(bgEase(1)).toBe(1)
    expect(bgEase(0.5)).toBe(0.5)
  })

  it("is slow at the start and at the end and fast in the middle", () => {
    expect(bgEase(0.25)).toBeLessThan(0.25)
    expect(bgEase(0.1)).toBeLessThan(0.1)
    expect(bgEase(0.75)).toBeGreaterThan(0.75)
    expect(bgEase(0.9)).toBeGreaterThan(0.9)
    expect(bgEase(0.25)).toBeCloseTo(0.15625, 10)
  })

  it("never goes backwards (checked in a thousand steps)", () => {
    let before = bgEase(0)
    for (let i = 1; i <= 1000; i++) {
      const now = bgEase(i / 1000)
      expect(now).toBeGreaterThanOrEqual(before)
      before = now
    }
  })

  it("cuts a progress outside 0 to 1 to the ends, and counts a progress that is not a number as arrived", () => {
    expect(bgEase(-3)).toBe(0)
    expect(bgEase(7)).toBe(1)
    expect(bgEase(Number.NaN)).toBe(1)
    expect(bgEase(Infinity)).toBe(1)
  })
})

describe("the colours on the way from one ramp to another", () => {
  const FROM = ["#000000", "#102030", "#204060", "#406080", "#6080a0"]
  const TO = ["#000000", "#ffffff", "#204060", "#ff8000", "#6080a0"]

  it("gives the old ramp at progress 0 and the new ramp, exactly as written, at progress 1", () => {
    expect(bgBlendRamp(FROM, TO, 0)).toEqual(FROM)
    expect(bgBlendRamp(FROM, TO, 1)).toEqual(TO)
  })

  it("is in the middle of every colour at half the time (the ease is 0.5 there), channel by channel", () => {
    const half = bgBlendRamp(FROM, TO, 0.5)
    expect(half).toHaveLength(5)
    for (let i = 0; i < 5; i++) {
      const a = channels(FROM[i])
      const b = channels(TO[i])
      channels(half[i]).forEach((value, c) => expect(Math.abs(value - (a[c] + b[c]) / 2)).toBeLessThanOrEqual(1))
    }
  })

  it("leaves a colour that does not change where it is, at every progress", () => {
    for (const progress of [0, 0.2, 0.5, 0.8, 1]) {
      const ramp = bgBlendRamp(FROM, TO, progress)
      expect(ramp[0]).toBe("#000000")
      expect(ramp[2]).toBe("#204060")
      expect(ramp[4]).toBe("#6080a0")
    }
  })

  it("keeps every colour between its old and its new value, and comes closer all the time", () => {
    let before = Infinity
    for (let i = 0; i <= 20; i++) {
      const ramp = bgBlendRamp(FROM, TO, i / 20)
      const away = Math.hypot(...channels(ramp[1]).map((v, c) => v - channels(TO[1])[c]))
      expect(away).toBeLessThanOrEqual(before)
      before = away
      for (let k = 0; k < 5; k++) {
        const a = channels(FROM[k])
        const b = channels(TO[k])
        channels(ramp[k]).forEach((value, c) => {
          expect(value).toBeGreaterThanOrEqual(Math.min(a[c], b[c]))
          expect(value).toBeLessThanOrEqual(Math.max(a[c], b[c]))
        })
      }
    }
    expect(before).toBe(0)
  })

  it("is slower than a straight line at the start: a quarter of the way in, a colour has moved less than a quarter", () => {
    const quarter = channels(bgBlendRamp(["#000000"], ["#ffffff"], 0.25)[0])[0]
    expect(quarter).toBeLessThan(0.25 * 255)
    expect(quarter).toBeGreaterThan(0)
  })

  it("takes the new colour as it is when the old ramp has fewer colours than the new one", () => {
    expect(bgBlendRamp(["#000000"], ["#000000", "#ff0000"], 0.3)[1]).toBe("#ff0000")
  })
})

describe("where the background is drawn", () => {
  it("is drawn for the full look and for lite level 1, and not at lite level 2", () => {
    expect(bgDrawn(0)).toBe(true)
    expect(bgDrawn(1)).toBe(true)
    expect(bgDrawn(2)).toBe(false)
  })

  it("never draws at a lighter level what a heavier level does not draw", () => {
    for (const level of [1, 2] as const) {
      if (!bgDrawn((level - 1) as 0 | 1)) expect(bgDrawn(level)).toBe(false)
    }
  })
})

// The light of the old rays. The screen does not use it any more; the tests of the lines still check what some lines say about it, until the lines are rewritten (Packet 08B) and this part is removed.
describe("the light of the old rays (kept only for the tests of the lines, until Packet 08B)", () => {
  it("starts dim and not dark: the light at second 0 is the start light, which is between 0 and 1", () => {
    expect(bgLight(0)).toBe(BG_LIGHT_START)
    expect(BG_LIGHT_START).toBeGreaterThan(0)
    expect(BG_LIGHT_START).toBeLessThan(1)
  })

  it("is full at the time of the last colour step and stays full after it", () => {
    expect(BG_LIGHT_FULL_AT_SECONDS).toBe(FLOW_FROM_SECONDS)
    expect(bgLight(FLOW_FROM_SECONDS)).toBe(1)
    expect(bgLight(FLOW_FROM_SECONDS * 4)).toBe(1)
  })

  it("grows in a straight line and never gets dimmer", () => {
    expect(bgLight(BG_LIGHT_FULL_AT_SECONDS / 2)).toBeCloseTo((BG_LIGHT_START + 1) / 2, 10)
    let before = bgLight(0)
    for (let s = 60; s <= BG_LIGHT_FULL_AT_SECONDS + 3600; s += 60) {
      const now = bgLight(s)
      expect(now).toBeGreaterThanOrEqual(before)
      before = now
    }
  })

  it("stays between the start light and 1 for every number, also for numbers that are not seconds", () => {
    for (const odd of [Number.NaN, -1, -Infinity, 0.5, 1e12, Infinity]) {
      const light = bgLight(odd)
      expect(light).toBeGreaterThanOrEqual(BG_LIGHT_START)
      expect(light).toBeLessThanOrEqual(1)
    }
  })
})
// AB:TIMER.TESTS:END
````

## STEP 3: Replace two files as a whole: `src/components/TimerBackground.tsx` and `src/components/TimerBackground.test.tsx`
Delete the content of each file and write exactly the block below into it.

**`src/components/TimerBackground.tsx`** (new content):
````
import { Component, useEffect, useRef, useState, type ReactNode } from "react"
import Grainient from "@/components/Grainient"
import { BG_BLEND_MS, BG_FADE_MS, BG_MOUNT_DELAY_MS, BG_SETTINGS, bgBlendRamp, bgDrawn, bgPaletteIndex, bgRamp } from "@/lib/backgroundLook"
import { LITE_LEVEL } from "@/lib/lite"
import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"

// AB:TIMER.BG:START
// The moving background of the Pro Timer screen. It is shown while a session runs or is paused, and it is plain black (nothing is drawn) when there is no session.
// Library: src/components/Grainient.tsx (React Bits, never edited). It draws a slow flowing gradient with a little grain from a ramp of five colours (its `colors`). This file hands it the ramp of the session and nothing else changes: the ramp starts all black and gets its colours at 10, 30 and 90 minutes, moving to each new colour in BG_BLEND_MS (backgroundLook.ts, CONNECTIONS.md C37).
// The library reads its `colors` again on its own while it runs and never builds its drawing again for them, so the ramp is simply given as a new list of five colours many times a second while it moves (useBlendedRamp). Every other setting is the same all the time (BG_SETTINGS).
// The palette is the one of the glowing ball (bgPaletteIndex gives the same number as the ball for the same session), so the ball and the background are of the same colour family.
// A new session lights a new background, like the ball: it is made again and starts black. When the session ends the background fades out for BG_FADE_MS and is then taken away. While it fades its colours stay where they were.
// The background needs WebGL 2, like the ball. Without it, or when the library throws, or at lite level 2, nothing is drawn and the clocks still work (see CONNECTIONS.md C38).
// Whether this browser can draw it (WebGL 2) is asked by canDrawWebgl2 (src/lib/timerWarmup.ts), once for the whole page and shared with the ball, and only when a session is shown: opening the screen does not ask the browser anything (see CONNECTIONS.md C38 and C44).
// The background is not made in the same moment as the press of Start, and not in the same moment as the ball: its box and the library animation are made BG_MOUNT_DELAY_MS after the session lights it (useMountDelay in src/lib/timerWarmup.ts), before the glowing ball (BALL_MOUNT_DELAY_MS in src/lib/ballLook.ts), because the ball is the heavy one and is made last. The box has the fade in, so the fade in starts when the box is made. A session that ends during the wait never makes the background (see CONNECTIONS.md C47).
// A person who asked their device for less motion gets the flow standing still (speed 0). Read once, when the screen is made.
function wantsStillness(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return false
  }
}

// If the library throws, the background is left out and the rest of the screen stays.
class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

// The five colours on the way from the ramp they have to the ramp they should have. The first ramp is taken at once (a page opened in the middle of a session shows the right colours at once). A new target in the middle of a blend starts from the colours the blend has reached, so nothing jumps.
function useBlendedRamp(target: readonly string[]): readonly string[] {
  const key = target.join(",")
  const [ramp, setRamp] = useState<readonly string[]>(target)
  const current = useRef<readonly string[]>(target)
  useEffect(() => {
    if (current.current.join(",") === key) return undefined
    const from = current.current
    const to = key.split(",")
    const startedAt = performance.now()
    let frame = 0
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / BG_BLEND_MS)
      current.current = bgBlendRamp(from, to, progress)
      setRamp(current.current)
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [key])
  return ramp
}

// One lit background. The screen makes it again for every new session, so its colours always start at the ramp of the first moment.
function LitBackground({ target, still }: { target: readonly string[]; still: boolean }) {
  const colours = useBlendedRamp(target)
  return <Grainient {...BG_SETTINGS} speed={still ? 0 : BG_SETTINGS.speed} colors={[...colours]} />
}

export default function TimerBackground({
  active,
  seconds,
  seed,
}: {
  active: boolean
  seconds: number
  seed: string
}) {
  const [still] = useState(wantsStillness)
  const [shown, setShown] = useState(active)
  const [lit, setLit] = useState(active ? 1 : 0)
  const wasActive = useRef(active)
  const litSeed = useRef(seed)

  // The ramp the background moves towards. When the session ends the seconds and the seed are gone while the background is still fading: the ramp of the last moment is kept, so it does not start to move towards black in the middle of the fade.
  const target = bgRamp(seconds, bgPaletteIndex(seed))
  const [held, setHeld] = useState(target)
  if (active && held.join(",") !== target.join(",")) setHeld(target)

  // A new background is lit when a session starts, and also when the seed changes while a session is shown (another device ended the session and started a new one between two readings): the same rule as the glowing ball, so the two always start together.
  useEffect(() => {
    if (active) {
      const sameSession = wasActive.current && (seed === "" || seed === litSeed.current)
      if (!sameSession) setLit((n) => n + 1)
      if (seed !== "") litSeed.current = seed
      wasActive.current = true
      setShown(true)
      return undefined
    }
    wasActive.current = false
    const timer = window.setTimeout(() => setShown(false), BG_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [active, seed])

  const ready = useMountDelay(lit, active, BG_MOUNT_DELAY_MS)
  if (!shown || !ready || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null
  return (
    <div className="ab-timer-bg" data-out={active ? undefined : "yes"} aria-hidden="true">
      <BackgroundGuard>
        <LitBackground key={lit} target={active ? target : held} still={still} />
      </BackgroundGuard>
    </div>
  )
}
// AB:TIMER.BG:END
````

**`src/components/TimerBackground.test.tsx`** (new content):
````
// @vitest-environment jsdom
/// <reference types="node" />
import { readFileSync } from "node:fs"
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// The library files and the lite level are replaced by stand-ins: this file only tests what TimerBackground decides and what it hands to the library.
// A real Grainient needs WebGL 2, which the test browser (jsdom) does not have; the test that the real animation draws is the look in a real browser (see the owner's look at the end of the packet).
const state = vi.hoisted(() => ({
  lite: 0 as 0 | 1 | 2,
  props: [] as Record<string, unknown>[],
  ballProps: [] as Record<string, unknown>[],
  mounts: 0,
  unmounts: 0,
  broken: false,
  ballDelay: 0,
  bgDelay: 0,
}))

vi.mock("@/lib/lite", () => ({
  get LITE_LEVEL() {
    return state.lite
  },
}))

// The waits before the library animations are made (BG_MOUNT_DELAY_MS and BALL_MOUNT_DELAY_MS) are 0 in every test but the ones of the describe "the wait before the library animation is made", which use the real waits.
vi.mock("@/lib/backgroundLook", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/backgroundLook")>()
  return {
    ...actual,
    get BG_MOUNT_DELAY_MS() {
      return state.bgDelay
    },
  }
})

vi.mock("@/lib/ballLook", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/ballLook")>()
  return {
    ...actual,
    get BALL_MOUNT_DELAY_MS() {
      return state.ballDelay
    },
  }
})

vi.mock("@/components/Grainient", async () => {
  const { createElement: h, useEffect } = await import("react")
  return {
    default: function GrainientStandIn(props: Record<string, unknown>) {
      state.props.push(props)
      if (state.broken) throw new Error("the animation broke")
      useEffect(() => {
        state.mounts++
        return () => {
          state.unmounts++
        }
      }, [])
      return h("div", { id: "grainient-stub" })
    },
  }
})

// The glowing ball is replaced too: it is only used to check that the background has the colour family of the ball.
vi.mock("@/components/CrystalizedBall", async () => {
  const { createElement: h } = await import("react")
  return {
    default: (props: Record<string, unknown>) => {
      state.ballProps.push(props)
      return h("canvas", { id: "ball-stub" })
    },
  }
})

import { BG_BLEND_MS, BG_FADE_MS, BG_PALETTES, BG_SETTINGS, bgPaletteIndex, bgRamp } from "@/lib/backgroundLook"
import { BALL_FADE_MS, BALL_PALETTES, BALL_WHITE, ballPaletteIndex } from "@/lib/ballLook"
import { DEEP_FROM_SECONDS, FLOW_FROM_SECONDS, SOLID_FROM_SECONDS } from "@/lib/timerMaths"
import { forgetWarmup } from "@/lib/timerWarmup"
import TimerBackground from "./TimerBackground"
import TimerBall from "./TimerBall"

// The real waits, read from the files themselves (the mocks above hand out 0).
const REAL_BG_DELAY = (await vi.importActual<typeof import("@/lib/backgroundLook")>("@/lib/backgroundLook")).BG_MOUNT_DELAY_MS
const REAL_BALL_DELAY = (await vi.importActual<typeof import("@/lib/ballLook")>("@/lib/ballLook")).BALL_MOUNT_DELAY_MS

// AB:TIMER.TESTS:START
const timerCss = readFileSync("src/timer.css", "utf8")
const SEED = "2026-10-07T10:00:00.123456+00:00"
const OTHER_SEED = "2026-10-08T07:00:00.000001+00:00"
const PALETTE = BG_PALETTES[bgPaletteIndex(SEED)]

type BgProps = { active: boolean; seconds: number; seed: string }

let root: Root | null = null
let container: HTMLElement | null = null
let loseContext = vi.fn()
let canvasMode: "webgl2" | "none" | "throws" = "webgl2"

function mountPoint(): void {
  if (container === null) {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  }
}

function show(over: Partial<BgProps> = {}): void {
  const props: BgProps = { active: true, seconds: 0, seed: SEED, ...over }
  mountPoint()
  act(() => root?.render(createElement("div", null, createElement(TimerBackground, props), createElement("p", { id: "after" }, "after"))))
}

// The background and the glowing ball side by side, given the same seconds and the same seed, as the screen does.
function showBoth(over: Partial<BgProps> = {}): void {
  const props: BgProps = { active: true, seconds: 0, seed: SEED, ...over }
  mountPoint()
  act(() =>
    root?.render(
      createElement(
        "div",
        null,
        createElement(TimerBackground, props),
        createElement(TimerBall, { ...props, paused: false }),
      ),
    ),
  )
}

function dispose(): void {
  act(() => root?.unmount())
  root = null
  container?.remove()
  container = null
}

function wait(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function has(selector: string): boolean {
  return (container?.querySelector(selector) ?? null) !== null
}

function box(): HTMLElement {
  const found = container?.querySelector<HTMLElement>(".ab-timer-bg") ?? null
  if (found === null) throw new Error("no background box")
  return found
}

// How many times the page asked the browser for a context of any kind (the test context of the WebGL 2 check is the only reason to).
function contextAsks(): number {
  return vi.mocked(HTMLCanvasElement.prototype.getContext).mock.calls.length
}

function lastProps(): Record<string, unknown> {
  const last = state.props.at(-1)
  if (last === undefined) throw new Error("the animation was never drawn")
  return last
}

// The five colours the library was given the last time.
function colours(): string[] {
  return lastProps().colors as string[]
}

function lastBallColour(): string {
  const last = state.ballProps.at(-1)
  if (last === undefined) throw new Error("the ball was never drawn")
  return String(last.color)
}

function channels(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

// How far two ramps are from each other: the distance of all their channels together.
function away(a: readonly string[], b: readonly string[]): number {
  let sum = 0
  a.forEach((colour, i) => {
    const x = channels(colour)
    const y = channels(b[i])
    sum += (x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2
  })
  return Math.sqrt(sum)
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  state.lite = 0
  state.props = []
  state.ballProps = []
  state.mounts = 0
  state.unmounts = 0
  state.broken = false
  state.ballDelay = 0
  state.bgDelay = 0
  canvasMode = "webgl2"
  loseContext = vi.fn()
  // The answer of the WebGL 2 check is kept for the whole page (timerWarmup.ts), so every test starts without it.
  forgetWarmup()
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((type: string) => {
    if (type !== "webgl2") return null
    if (canvasMode === "throws") throw new Error("no context")
    if (canvasMode === "none") return null
    return { getExtension: (name: string) => (name === "WEBGL_lose_context" ? { loseContext } : null) }
  }) as never)
  vi.useFakeTimers()
})

afterEach(() => {
  dispose()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("TimerBackground: when it draws", () => {
  it("draws nothing while there is no session", () => {
    show({ active: false })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
  })

  it("draws the animation in its box while a session runs, hidden from screen readers", () => {
    show({ active: true })
    expect(box().getAttribute("aria-hidden")).toBe("true")
    expect(box().hasAttribute("data-out")).toBe(false)
    expect(box().querySelector("#grainient-stub")).not.toBeNull()
    expect(state.mounts).toBe(1)
  })

  it("has no tint layer, no black layer and no stretched box any more: the library animation is all there is in its box", () => {
    show({ active: true })
    for (const old of [".ab-timer-bg-tint", ".ab-timer-bg-dim", ".ab-timer-bg-rays"]) expect(has(old)).toBe(false)
    expect(box().children).toHaveLength(1)
    expect(box().firstElementChild?.id).toBe("grainient-stub")
  })

  it("draws nothing when the browser cannot give WebGL 2, and the rest of the page stays", () => {
    canvasMode = "none"
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })

  it("draws nothing and does not crash when asking for WebGL 2 throws an error", () => {
    canvasMode = "throws"
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has("#after")).toBe(true)
  })

  it("gives its test context back to the browser", () => {
    show({ active: true })
    expect(loseContext).toHaveBeenCalledTimes(1)
  })

  it("does not ask the browser for anything while there is no session, so that opening the screen costs nothing", () => {
    show({ active: false })
    wait(5000)
    expect(contextAsks()).toBe(0)
  })

  it("shares the WebGL 2 check with the glowing ball: both together ask the browser once", () => {
    showBoth({ active: true })
    expect(has(".ab-timer-bg")).toBe(true)
    expect(has(".ab-timer-ball")).toBe(true)
    expect(contextAsks()).toBe(1)
    expect(loseContext).toHaveBeenCalledTimes(1)
  })

  it("does not ask the browser at lite level 2, where nothing is drawn", () => {
    state.lite = 2
    show({ active: true })
    expect(contextAsks()).toBe(0)
  })

  it("draws nothing at lite level 2, where the screen stays plain black", () => {
    state.lite = 2
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(has("#after")).toBe(true)
  })
})

describe("TimerBackground: what it hands to the library", () => {
  it("gives it the studio settings of the owner and its five colours, and nothing else", () => {
    show({ active: true })
    const props = lastProps()
    expect(Object.keys(props).sort()).toEqual([...Object.keys(BG_SETTINGS), "colors"].sort())
    for (const [name, value] of Object.entries(BG_SETTINGS)) expect(props[name], name).toBe(value)
    expect(props.colors).toHaveLength(5)
  })

  it("draws the animation on the laptop and on a phone (lite level 0 and 1)", () => {
    show({ active: true })
    expect(has("#grainient-stub")).toBe(true)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(has("#grainient-stub")).toBe(true)
  })

  it("lets the flow move at the chosen speed, and never lets the cursor or the start of the library in", () => {
    show({ active: true })
    expect(lastProps().speed).toBe(BG_SETTINGS.speed)
    expect(lastProps().interactive).toBe(false)
    expect(lastProps().clickSwirl).toBe(false)
    expect(lastProps().intro).toBe(false)
  })

  it("lets the flow stand still for a person who asked their device for less motion, and still gives it the colours", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("prefers-reduced-motion"), media: query }))
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().speed).toBe(0)
    expect(colours()).toEqual([...bgRamp(DEEP_FROM_SECONDS + 5, bgPaletteIndex(SEED))])
  })

  it("never gives the library another setting while the colours move, and does not make it again", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BG_BLEND_MS)
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BG_BLEND_MS)
    show({ active: true, seconds: FLOW_FROM_SECONDS })
    wait(BG_BLEND_MS)
    const settingsOnly = new Set(state.props.map((p) => JSON.stringify({ ...p, colors: 0 })))
    expect(settingsOnly.size).toBe(1)
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
  })

  it("gives the library new colours while they move, and nothing more once they have arrived", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const before = state.props.length
    wait(1000)
    expect(state.props.length).toBeGreaterThan(before)
    wait(BG_BLEND_MS)
    const arrived = state.props.length
    wait(5000)
    expect(state.props.length).toBe(arrived)
  })

  it("always gives it five colours", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BG_BLEND_MS)
    for (const p of state.props) expect(p.colors).toHaveLength(5)
  })
})

describe("TimerBackground: the colours of the ramp", () => {
  it("are all the black of the palette at the start of a session, so the screen is black", () => {
    show({ active: true, seconds: 0 })
    expect(colours()).toEqual([PALETTE[0], PALETTE[0], PALETTE[0], PALETTE[0], PALETTE[0]])
  })

  it("show the right colours at once when the page is opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(colours()).toEqual([...bgRamp(DEEP_FROM_SECONDS + 5, bgPaletteIndex(SEED))])
    expect(colours()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[3], PALETTE[3]])
    expect(state.mounts).toBe(1)
  })

  it("stay black until the solid cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    wait(5000)
    expect(colours()).toEqual([...bgRamp(0, bgPaletteIndex(SEED))])
  })

  it("move from black to the first ramp in exactly BG_BLEND_MS, not at once", () => {
    const start = [...bgRamp(0, bgPaletteIndex(SEED))]
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    expect(colours()).toEqual(start)
    wait(BG_BLEND_MS / 2)
    const half = colours()
    expect(half).not.toEqual(start)
    expect(half).not.toEqual(target)
    half.forEach((colour, i) => {
      const from = channels(start[i])
      const to = channels(target[i])
      channels(colour).forEach((value, c) => {
        expect(value).toBeGreaterThanOrEqual(Math.min(from[c], to[c]))
        expect(value).toBeLessThanOrEqual(Math.max(from[c], to[c]))
      })
    })
    // The smooth end of the blend is within one step of a channel of its target in the last moments, so the check "not there yet" is made two seconds before the end.
    wait(BG_BLEND_MS / 2 - 2000)
    expect(colours()).not.toEqual(target)
    wait(2000)
    expect(colours()).toEqual(target)
    wait(3000)
    expect(colours()).toEqual(target)
  })

  it("start slowly and end slowly: a quarter of the way in a colour has moved about 16 percent of the way, not 25", () => {
    const start = [...bgRamp(0, bgPaletteIndex(SEED))]
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(BG_BLEND_MS / 4)
    // The main colour (the third of the ramp) goes from black to its colour: how far has it come?
    const moved = away([colours()[2]], [start[2]]) / away([target[2]], [start[2]])
    expect(moved).toBeGreaterThan(0.1)
    expect(moved).toBeLessThan(0.2)
    wait(BG_BLEND_MS / 2)
    const movedThree = away([colours()[2]], [start[2]]) / away([target[2]], [start[2]])
    expect(movedThree).toBeGreaterThan(0.8)
    expect(movedThree).toBeLessThan(0.9)
  })

  it("come steadily closer to the new colours while they move", () => {
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    const seen: number[] = [away(colours(), target)]
    for (let i = 0; i < 4; i++) {
      wait(BG_BLEND_MS / 4)
      seen.push(away(colours(), target))
    }
    for (let i = 1; i < seen.length; i++) expect(seen[i]).toBeLessThan(seen[i - 1])
    expect(seen.at(-1)).toBe(0)
  })

  it("go on at the deep cut-off, and again at the flow cut-off", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS + 5 })
    expect(colours()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[2], PALETTE[2]])
    show({ active: true, seconds: DEEP_FROM_SECONDS })
    wait(BG_BLEND_MS)
    expect(colours()).toEqual([PALETTE[0], PALETTE[1], PALETTE[2], PALETTE[3], PALETTE[3]])
    show({ active: true, seconds: FLOW_FROM_SECONDS })
    wait(BG_BLEND_MS)
    expect(colours()).toEqual([...PALETTE])
  })

  it("leave no timer behind when the screen goes away in the middle of a colour step", () => {
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(500)
    dispose()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe("TimerBackground: lighting and fading", () => {
  it("fades out for BG_FADE_MS when the session ends, and is then taken away", () => {
    show({ active: true, seconds: 100 })
    show({ active: false, seconds: 0, seed: "" })
    expect(box().getAttribute("data-out")).toBe("yes")
    wait(BG_FADE_MS - 100)
    expect(has(".ab-timer-bg")).toBe(true)
    wait(100)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.unmounts).toBe(1)
  })

  it("keeps its colours while it fades, and does not start to move towards black", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    const kept = [...colours()]
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS - 100)
    expect(colours()).toEqual(kept)
  })

  it("does not turn back while it fades after a colour step was on its way: it goes on to the colours it was moving to", () => {
    const target = [...bgRamp(SOLID_FROM_SECONDS, bgPaletteIndex(SEED))]
    show({ active: true, seconds: SOLID_FROM_SECONDS - 1 })
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    wait(3000)
    show({ active: false, seconds: 0, seed: "" })
    let before = away(colours(), target)
    expect(before).toBeGreaterThan(0)
    for (let i = 0; i < 4; i++) {
      wait(150)
      const now = away(colours(), target)
      expect(now).toBeLessThan(before)
      before = now
    }
  })

  it("lights a new background for every new session", () => {
    show({ active: true })
    show({ active: false, seed: "" })
    wait(BG_FADE_MS)
    expect(state.mounts).toBe(1)
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("lights a new background when a session starts while the old one is still fading", () => {
    show({ active: true })
    show({ active: false, seed: "" })
    wait(300)
    show({ active: true })
    wait(BG_FADE_MS * 2)
    expect(state.mounts).toBe(2)
    expect(box().hasAttribute("data-out")).toBe(false)
  })

  it("lights a new background when the seed changes while a session is shown, and it starts black", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    show({ active: true, seconds: 0, seed: OTHER_SEED })
    expect(state.mounts).toBe(2)
    expect(colours()).toEqual([...bgRamp(0, bgPaletteIndex(OTHER_SEED))])
  })

  it("does not light a new background when only the seed text is gone for a moment of a running session", () => {
    show({ active: true, seconds: 100 })
    show({ active: true, seconds: 101, seed: "" })
    expect(state.mounts).toBe(1)
  })

  it("starts a new session black, also after a long one", () => {
    show({ active: true, seconds: FLOW_FROM_SECONDS + 5 })
    expect(colours()).toEqual([...PALETTE])
    show({ active: false, seconds: 0, seed: "" })
    wait(BG_FADE_MS)
    show({ active: true, seconds: 0, seed: OTHER_SEED })
    const black = BG_PALETTES[bgPaletteIndex(OTHER_SEED)][0]
    expect(colours()).toEqual([black, black, black, black, black])
  })
})

describe("TimerBackground: the wait before the library animation is made", () => {
  beforeEach(() => {
    state.bgDelay = REAL_BG_DELAY
    state.ballDelay = REAL_BALL_DELAY
  })

  it("is 300 ms, and the wait of the glowing ball is 600 ms (written here again on purpose, see CONNECTIONS.md C33 and C47)", () => {
    expect(REAL_BG_DELAY).toBe(300)
    expect(REAL_BALL_DELAY).toBe(600)
  })

  it("makes the heavy glowing ball after the background, with at least 300 ms between them, so their work never lands in the same moment", () => {
    expect(REAL_BALL_DELAY - REAL_BG_DELAY).toBeGreaterThanOrEqual(300)
  })

  it("makes no box and no library animation in the moment of the press of Start, and asks the browser nothing then", () => {
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.props).toHaveLength(0)
    expect(state.mounts).toBe(0)
    expect(contextAsks()).toBe(0)
    expect(has("#after")).toBe(true)
  })

  it("makes the box with its animation when the wait is over, and not a moment before", () => {
    show({ active: true })
    wait(REAL_BG_DELAY - 1)
    expect(has(".ab-timer-bg")).toBe(false)
    wait(1)
    expect(has(".ab-timer-bg")).toBe(true)
    expect(has("#grainient-stub")).toBe(true)
    expect(state.mounts).toBe(1)
    expect(contextAsks()).toBe(1)
  })

  it("makes the background first and the glowing ball later, never in the same moment", () => {
    showBoth()
    expect(state.ballProps).toHaveLength(0)
    expect(state.props).toHaveLength(0)
    wait(REAL_BG_DELAY)
    expect(state.props.length).toBeGreaterThan(0)
    expect(state.ballProps).toHaveLength(0)
    wait(REAL_BALL_DELAY - REAL_BG_DELAY - 1)
    expect(state.ballProps).toHaveLength(0)
    wait(1)
    expect(state.ballProps.length).toBeGreaterThan(0)
  })

  it("makes the background with the right colours at once, also for a page opened in the middle of a session", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    wait(REAL_BG_DELAY)
    expect(colours()).toEqual([...bgRamp(DEEP_FROM_SECONDS + 5, bgPaletteIndex(SEED))])
    expect(state.mounts).toBe(1)
  })

  it("never makes the background for a session that ends during the wait", () => {
    show({ active: true })
    wait(REAL_BG_DELAY - 100)
    show({ active: false })
    // The old wait would have run out 100 ms from now, and the box of a fading background is still there for BG_FADE_MS: the clock is moved in steps so that a background made in that time would be seen.
    wait(200)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.mounts).toBe(0)
    wait(REAL_BG_DELAY)
    expect(has(".ab-timer-bg")).toBe(false)
    wait(BG_FADE_MS * 3)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(state.mounts).toBe(0)
    expect(contextAsks()).toBe(0)
  })

  it("counts the wait again for every new session", () => {
    show({ active: true })
    wait(REAL_BG_DELAY)
    show({ active: false })
    wait(BG_FADE_MS)
    expect(has(".ab-timer-bg")).toBe(false)
    show({ active: true })
    expect(has(".ab-timer-bg")).toBe(false)
    wait(REAL_BG_DELAY - 1)
    expect(has(".ab-timer-bg")).toBe(false)
    wait(1)
    expect(has("#grainient-stub")).toBe(true)
    expect(state.mounts).toBe(2)
  })

  it("does not wait again, and does not make the animation again, for a colour step, a pause or a resume of the same session", () => {
    show({ active: true, seconds: 0 })
    wait(REAL_BG_DELAY)
    show({ active: true, seconds: SOLID_FROM_SECONDS })
    show({ active: true, seconds: SOLID_FROM_SECONDS + 1 })
    expect(state.mounts).toBe(1)
    expect(state.unmounts).toBe(0)
    expect(has("#grainient-stub")).toBe(true)
  })

  it("asks the browser for WebGL 2 once the wait is over, and draws nothing when the answer is no", () => {
    canvasMode = "none"
    show({ active: true })
    expect(contextAsks()).toBe(0)
    wait(REAL_BG_DELAY)
    expect(contextAsks()).toBe(1)
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has("#after")).toBe(true)
  })
})

describe("TimerBackground: when the library breaks", () => {
  it("leaves the background out and keeps the rest of the page", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {})
    state.broken = true
    show({ active: true })
    expect(has("#grainient-stub")).toBe(false)
    expect(has("#after")).toBe(true)
    quiet.mockRestore()
  })
})

describe("TimerBackground: the same colour family as the glowing ball", () => {
  it("uses the palette of the ball for the same session: the ball's last colour and the background's last ramp come from the palette with the same number", () => {
    for (const seed of [SEED, OTHER_SEED, "2026-10-09T18:30:12.987654+00:00", "2026-10-10T03:15:45.555555+00:00"]) {
      const index = ballPaletteIndex(seed)
      expect(bgPaletteIndex(seed)).toBe(index)
      showBoth({ active: true, seconds: FLOW_FROM_SECONDS + 5, seed })
      expect(colours()).toEqual([...BG_PALETTES[index]])
      expect(lastBallColour()).toBe(BALL_PALETTES[index][2])
      dispose()
      state.props = []
      state.ballProps = []
    }
  })

  it("starts a new session together with a new ball: the background black, the ball white", () => {
    showBoth({ active: true, seconds: FLOW_FROM_SECONDS + 5 })
    showBoth({ active: false, seconds: 0, seed: "" })
    wait(Math.max(BG_FADE_MS, BALL_FADE_MS))
    expect(has(".ab-timer-bg")).toBe(false)
    expect(has(".ab-timer-ball")).toBe(false)
    showBoth({ active: true, seconds: 0, seed: OTHER_SEED })
    const black = BG_PALETTES[ballPaletteIndex(OTHER_SEED)][0]
    expect(colours()).toEqual([black, black, black, black, black])
    expect(lastBallColour()).toBe(BALL_WHITE)
  })
})

describe("the css of the background", () => {
  const block = (selector: string): string => {
    const start = timerCss.indexOf(selector + " {")
    if (start < 0) return ""
    return timerCss.slice(start, timerCss.indexOf("}", start))
  }

  it("is a box over the whole screen, at the very bottom, clipped, that never catches a tap", () => {
    const bg = block(".ab-timer-bg")
    expect(bg).toContain("position: absolute;")
    expect(bg).toContain("inset: 0;")
    expect(bg).toContain("z-index: 0;")
    expect(bg).toContain("overflow: hidden;")
    expect(bg).toContain("isolation: isolate;")
    expect(bg).toContain("pointer-events: none;")
  })

  it("fades for as long as the code waits before it takes the background away", () => {
    const bg = block(".ab-timer-bg")
    const fade = Number(/transition:\s*opacity\s+([0-9]+)ms/.exec(bg)?.[1])
    expect(fade).toBe(BG_FADE_MS)
    expect(block('.ab-timer-bg[data-out="yes"]')).toContain("opacity: 0;")
  })

  it("is dimmed, so that the white digits stay easy to read, and dimmer still while the session is paused", () => {
    const opacity = Number(/opacity:\s*([0-9.]+);/.exec(block(".ab-timer-bg"))?.[1])
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(1)
    const paused = Number(/opacity:\s*([0-9.]+);/.exec(block('.ab-timer[data-state="paused"] .ab-timer-bg'))?.[1])
    expect(paused).toBeGreaterThan(0)
    expect(paused).toBeLessThan(opacity)
  })

  it("fades in with a short animation that stands still for a person who asked for less motion", () => {
    expect(block(".ab-timer-bg")).toMatch(/animation:\s*ab-timer-bg-in\s+[0-9]+ms/)
    expect(timerCss).toContain("@keyframes ab-timer-bg-in {")
    const quiet = timerCss.slice(timerCss.lastIndexOf("@media (prefers-reduced-motion: reduce)"))
    expect(quiet).toContain(".ab-timer-bg {")
    expect(quiet).toContain("animation: none;")
  })

  it("has its own plain black, so the screen is black before the animation is made and while it fades", () => {
    expect(block(".ab-timer-bg")).toContain("background: #000;")
  })

  it("keeps the bottom a little darker, with a layer over the animation that never catches a tap", () => {
    const shade = block(".ab-timer-bg::after")
    expect(shade).toContain('content: "";')
    expect(shade).toContain("position: absolute;")
    expect(shade).toContain("inset: 0;")
    expect(shade).toContain("pointer-events: none;")
    expect(shade).toContain("linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0) 60%)")
  })

  it("has no rule left for the tint layer, the black layer or the stretched box of the old rays", () => {
    for (const old of [".ab-timer-bg-tint", ".ab-timer-bg-dim", ".ab-timer-bg-rays", "mix-blend-mode"]) expect(timerCss).not.toContain(old)
  })

  it("lets the canvas of the library fill its place without a gap under it", () => {
    expect(block(".ab-timer-bg canvas")).toContain("display: block;")
  })

  it("lives in a screen that is its own stacking box, with the dial drawn above the background", () => {
    const screen = block(".ab-timer")
    expect(screen).toContain("position: relative;")
    expect(screen).toContain("isolation: isolate;")
    expect(screen).toContain("overflow: hidden;")
    expect(block(".ab-timer-dial")).toContain("z-index: 1;")
  })

  it("keeps the line, the Try again button and the buttons above the background", () => {
    for (const selector of [".ab-timer-note", ".ab-timer-retry", ".ab-timer-actions"]) {
      expect(block(selector)).toContain("position: relative;")
      expect(block(selector)).toContain("z-index: 1;")
    }
  })

  it("gives the line under the dial a dark shadow, so that it can be read over a bright colour", () => {
    expect(block(".ab-timer-note")).toContain("text-shadow:")
  })
})
// AB:TIMER.TESTS:END
````

## STEP 4: Edit `src/components/TimerScreen.tsx` and `src/timer.css`
**`src/components/TimerScreen.tsx`: one line of comment.** Find this whole line (EXACTLY ONCE):
```
// Behind everything, over the whole screen, sits the moving background (TimerBackground.tsx, the Side Rays animation). It is the first thing inside the main element, it has the same colour as the ball at every moment, and the screen is black without a session (see CONNECTIONS.md C37 and C38).
```
Replace it with this whole line:
```
// Behind everything, over the whole screen, sits the moving background (TimerBackground.tsx, the Grainient animation). It is the first thing inside the main element, it has a colour of the same family as the ball (the same palette number) and starts black, and the screen is black without a session (see CONNECTIONS.md C37 and C38).
```

**`src/timer.css`: the block of the moving background.** Find the line `/* AB:TIMER.BG:START */` (EXACTLY ONCE) and the line `/* AB:TIMER.BG:END */` (EXACTLY ONCE). The START line must come before the END line. Delete everything from the START line to the END line, both lines included, and in the same place write exactly this block (it begins with the START line and ends with the END line):
````
/* AB:TIMER.BG:START */
/* The moving background (TimerBackground.tsx): it fills the whole screen, sits at the very bottom, is dimmed so that the white digits stay easy to read, and never catches a tap. It has its own black, so that the screen is black before the library animation is made and while it fades (CONNECTIONS.md C37). It fades in when a session starts and out when it ends. The fade time is the same as BG_FADE_MS in backgroundLook.ts (CONNECTIONS.md C38). The opacity of 0.5 is the one number that decides how bright the whole background is: a higher number gives brighter colours and harder-to-read digits. */
.ab-timer-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  pointer-events: none;
  background: #000;
  opacity: 0.5;
  transition: opacity 700ms ease;
  animation: ab-timer-bg-in 700ms ease;
}

.ab-timer-bg canvas {
  display: block;
}

/* The bottom of the screen is kept a little darker, so that the message that comes up from the bottom is easy to read: 45 percent black at the very bottom, gone at 60 percent of the height. It lies over the library animation and never catches a tap (CONNECTIONS.md C37). */
.ab-timer-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0) 60%);
}

.ab-timer-bg[data-out="yes"] {
  opacity: 0;
}

.ab-timer[data-state="paused"] .ab-timer-bg {
  opacity: 0.2;
}

@keyframes ab-timer-bg-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab-timer-bg {
    animation: none;
  }
}
/* AB:TIMER.BG:END */
````
Change nothing else in `src/timer.css`.

## STEP 5: Check that the files are exactly right
Run this ONE command (the same fingerprint as in Step 0):
```
foreach ($f in @("src/components/Grainient.tsx","src/components/TimerBackground.tsx","src/components/TimerBackground.test.tsx","src/lib/backgroundLook.ts","src/lib/backgroundLook.test.ts","src/components/TimerScreen.tsx","src/timer.css")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these seven lines:
```
src/components/Grainient.tsx 33d1637c42e0aac40c1a40724b2a7b0605f0378d227a063e5b9b067407daade9
src/components/TimerBackground.tsx eebeaf9d50ee83cc48eb4d2893ff8cbb1da023564697cb23ca361b372ddc8aca
src/components/TimerBackground.test.tsx 610978128b2226e978fda33ce66d3e0b0e05cefff15857f6a9d69eddd1582420
src/lib/backgroundLook.ts 511435df70887eb7fd1e9c15fb2b1f8f07cb3bb0e91300f6c29593c6d04d7d19
src/lib/backgroundLook.test.ts f046f0c3cc6bef8aacd226f710f0a9c56c9db666b26eaabcb8a1a958c484dcb1
src/components/TimerScreen.tsx 19860bd70a7ba84e2ff29ae3927853d86857e1f6a0a6134a0098ec1437d49418
src/timer.css a073454075c3dff91aff0a2d11c1134fd445970e8a4f765d26f6d58e407bf030
```
If a line is different: **STOP** and report the RAW output. Do not try to fix the file; the likely cause is a changed character when the block was copied.

## STEP 6: Run the tests and the type check
Run:
```
npm test
npx tsc -b
```
`npm test` must print `Test Files  18 passed (18)` and `Tests  914 passed (914)`. `npx tsc -b` must print nothing. (The checker is not run yet: the map files are changed in the next step.) If anything fails: **STOP** and report the COMPLETE output. Do not fix it.

## STEP 7: Edit `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`
Change nothing else in these files.

**`CODE_MAP.md`: three rows.** Each old line must be found EXACTLY ONCE (it is a whole line of the file). Replace it with the new line below it.

Row 1 of 3. Replace this whole line:
```
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values: the white given to the library, the animation settings the owner chose (speed, tilt, intensity), how the light of the rays grows while a session goes on (dim at the start, full at the time of the last colour step), which lite levels draw it (the lightest level draws nothing), the fade time | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the lite levels that draw it; the start light (BG_LIGHT_START) and the time the light is full (BG_LIGHT_FULL_AT_SECONDS, which follows the last colour step of timerMaths.ts, see CONNECTIONS.md C37); the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the wait before the library animation is made (BG_MOUNT_DELAY_MS, which must stay at least 300 ms shorter than BALL_MOUNT_DELAY_MS, see CONNECTIONS.md C47); the size the rays are drawn at (BG_RENDER_SCALE: 0.5 = half width and half height, a quarter of the pixels; tied to TimerBackground.tsx and the css, see CONNECTIONS.md C38); the white (BG_COLOUR) must stay white, see CONNECTIONS.md C37 |
```
with this whole line:
```
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values and functions: the animation settings the owner chose (BG_SETTINGS), the six five-colour palettes (one for every palette of the glowing ball, same order), the ramp of a session (black at first, then the dark shade and the main colour, the lighter tint and the lightest tint at the three colour steps), the smooth blend from one ramp to the next, which lite levels draw it (the lightest level draws nothing), the fade time, and the old light of the rays (kept only for the tests of the lines until Packet 08B) | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the lite levels that draw it; the palettes (BG_PALETTES: six, the same number as BALL_PALETTES, the first colour near black and every colour lighter than the one before it) and the ramp rules (bgRamp), which follow the colour steps of timerMaths.ts (see CONNECTIONS.md C37); the blend time (BG_BLEND_MS, 12 seconds, slower than the ball); the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the wait before the library animation is made (BG_MOUNT_DELAY_MS, which must stay at least 300 ms shorter than BALL_MOUNT_DELAY_MS, see CONNECTIONS.md C47); dpr (BG_SETTINGS.dpr, see CONNECTIONS.md C38); the old light (bgLight, BG_LIGHT_START, BG_LIGHT_FULL_AT_SECONDS) is used only by the tests of the lines, see CONNECTIONS.md C41 and C50 |
```

Row 2 of 3. Replace this whole line:
```
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Side Rays animation: rays of light that come in from the top right corner): black without a session; it fades in when a session starts, has the colour of the glowing ball at every moment (white at first, then the colours of the session), gets brighter the longer the session goes on (a black layer over the rays that gets thinner), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 (asked once for the whole page by timerWarmup.ts, and only when a session is shown, see CONNECTIONS.md C44) and at lite level 2. The box and the library animation are made 300 ms after the session lights them, before the glowing ball (see CONNECTIONS.md C47). The library animation is `src/components/SideRays.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the animation sits in a box that is half the screen in width and height and is stretched back over the screen (ab-timer-bg-rays, so it draws a quarter of the pixels; its size comes from BG_RENDER_SCALE, see CONNECTIONS.md C38); the dimming (opacity), the dimming when paused, the black behind the rays, the black layer that makes the light grow (ab-timer-bg-dim) and the fade time in the css (see CONNECTIONS.md C37 and C38); the colour comes from the functions of the ball, see C37 |
```
with this whole line:
```
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Grainient animation: a slowly flowing gradient with a little grain): black without a session; it fades in when a session starts, starts all black, takes the colours of its palette at 10, 30 and 90 minutes by a slow blend (12 seconds), in the colour family of the glowing ball (same palette number), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 (asked once for the whole page by timerWarmup.ts, and only when a session is shown, see CONNECTIONS.md C44) and at lite level 2. The box and the library animation are made 300 ms after the session lights them, before the glowing ball (see CONNECTIONS.md C47). The library animation is `src/components/Grainient.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the ramp the animation is given and the blend (useBlendedRamp, see CONNECTIONS.md C37); the dimming (opacity), the dimming when paused, the black behind the animation, the shade at the bottom and the fade time in the css (see CONNECTIONS.md C37 and C38) |
```

Row 3 of 3. Replace this whole line:
```
| Side Rays (the moving background of the Pro Timer) | `src/components/SideRays.tsx` | `AB:TIMER.BG` |
```
with this whole line:
```
| Grainient (the moving background of the Pro Timer) | `src/components/Grainient.tsx` | `AB:TIMER.BG` |
```

**`CONNECTIONS.md`: C37 and C38.** Find this line (EXACTLY ONCE):
```
### C37: The moving background is white rays from the library with a tint layer over them, and the tint has the colour of the glowing ball
```
and this line (EXACTLY ONCE):
```
### C39: On a wide screen the Pro Timer is two columns (the dial on the left, the line and the buttons on the right), the phone stays one column, and the wide rules must come after the phone rules and must not touch the clip, the stacking or the taps
```
The first one must come before the second. The block from the C37 line down to the line directly above the C39 line must be 54 lines long (it holds the entries C37 and C38 and ends with one empty line). If it is not: **STOP** and report. Delete that whole block (the C37 line and every line below it, up to but NOT including the C39 line). In the same place insert exactly this block (it holds the new C37 and the changed C38, with one empty line between them; it is 56 lines long and ends with one empty line, so that there is an empty line between the last line of C38 and the C39 line):
````
### C37: The moving background is the Grainient library animation, fed with a ramp of five colours that starts black and grows with the session, in the colour family of the glowing ball
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.TESTS`
- If you change: the palettes (BG_PALETTES), the rules of the ramp (bgRamp), the blend (BG_BLEND_MS, bgEase, bgBlendRamp in backgroundLook.ts, and useBlendedRamp in TimerBackground.tsx), the settings of the animation (BG_SETTINGS), the choice of palette (bgPaletteIndex), the black behind the animation, the isolation and the dimming (opacity) of .ab-timer-bg in timer.css, the shade at the bottom (.ab-timer-bg::after), or the colour steps and palettes of the ball (C34: ballStep, BALL_PALETTES, ballPaletteIndex in ballLook.ts)
- Then also: the library animation (Grainient) draws a slowly flowing gradient with a little grain from a list of colours (its `colors`). It reads that list again on its own while it runs and does not build its drawing again (the graphics context and the shaders) when only the colours change, so the background moves from one colour step to the next by giving it a new list of five colours many times a second (useBlendedRamp, with bgBlendRamp), and it is never given anything else that changes: every other setting is BG_SETTINGS, the same all the time (a test compares the names and the values of everything the library is given with BG_SETTINGS and the five colours). The ramp of a session (bgRamp of the seconds and the palette) grows from the dark end: all black before the first colour step (the screen is black), the dark shade and the main colour at the solid step (10 minutes, and the two light places of the ramp hold the main colour), the lighter tint at the deep step (30 minutes), the lightest tint at the flow step (90 minutes). The steps are the quality steps of the ball (ballStep, C34), so a new step in timerMaths.ts reaches the background by itself. The palettes are six, in the same order as the six palettes of the ball, and the palette of a session is the palette number of the ball for the same session (bgPaletteIndex gives ballPaletteIndex of the same seed), so the ball and the background are always of the same colour family; a new palette of the ball needs a new palette here, and a test counts them. The colours are not the colours of the ball: the ramp has five colours, from a near black (no channel above 12 of 255) up to a light tint, every colour lighter than the one before it, so the picture never gets darker at a step (a test walks every minute of four hours for every palette). The main colour of the first palette is the rust of the owner's Fire ramp (#9a3412) and stays. The blend takes BG_BLEND_MS (12 seconds, slower than the 4 seconds of the ball, on purpose: a big soft picture should change like light, not like a switch) with a smooth start and a smooth end (bgEase, smoothstep), channel by channel as the ball does (blendHex). A new target in the middle of a blend starts from the colours the blend has reached, so nothing jumps; the first ramp is taken at once, so a page opened in the middle of a session shows the right colours at once; a new session makes a new background that starts black. While the background fades out its colours are held (held in TimerBackground.tsx): the seconds and the seed are gone then, and without it the ramp would start to move towards black in the middle of the fade. This works only while (1) .ab-timer-bg has its own plain black (background #000) and is isolated (isolation isolate), so the screen is black before the library animation is made and while it fades, (2) the library box has no other layers: no tint, no black layer, no stretched box (they belonged to the old rays animation; a test checks that they are gone), (3) the grain stays still and the cursor, the click and the start of the library stay off (BG_SETTINGS), (4) the library draws one pixel for every pixel of the screen (dpr 1) and makes its picture at half of that size itself, so no half-size box is needed (C38). The settings (angle, flow, speed, scale, softness, silk, grain) are the ones of the blend preview of the owner; they are safe to tune alone, and so is the dimming (opacity) of .ab-timer-bg in timer.css, but the white digits must stay easy to read over the lightest tint of every palette. The light of the old rays (bgLight, BG_LIGHT_START, BG_LIGHT_FULL_AT_SECONDS) is not drawn any more; it stays in backgroundLook.ts only because the tests of the lines of the stop alert and of the milestone message still check what some lines say about rays (C41, C50), until those lines are rewritten (Packet 08B), and then it goes.
- If you forget: the background builds its drawing again many times a second (it flickers and the phone gets hot), or the colours jump at a step instead of moving, or the screen is not black at the start, or the background goes darker at a step, or its colour family is not the colour family of the ball, or it starts to move towards black while it fades out, or the cursor, a click or the grain moves it, or the digits cannot be read over the lightest tint.
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_BLEND_MS = 12000`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_PALETTES: readonly (readonly [string, string, string, string, string])[] = [`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = return ballPaletteIndex(seed)`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgRamp(seconds: number, paletteIndex: number): readonly string[] {`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgEase(progress: number): number {`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export function bgBlendRamp(from: readonly string[], to: readonly string[], progress: number): readonly string[] {`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_LIGHT_START = 0.3`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_LIGHT_FULL_AT_SECONDS = FLOW_FROM_SECONDS`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const target = bgRamp(seconds, bgPaletteIndex(seed))`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const progress = Math.min(1, (now - startedAt) / BG_BLEND_MS)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = current.current = bgBlendRamp(from, to, progress)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <Grainient {...BG_SETTINGS} speed={still ? 0 : BG_SETTINGS.speed} colors={[...colours]} />`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = if (active && held.join(",") !== target.join(",")) setHeld(target)`
- Anchor: `AB:TIMER.BG @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.BG @ src/timer.css = background: #000;`
- Anchor: `AB:TIMER.BG @ src/timer.css = linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0) 60%)`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_BLEND_MS = 4000`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export function ballPaletteIndex(seed: string): number {`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = describe("the ramp of the session", () => {`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_BLEND_MS).toBeGreaterThan(BALL_BLEND_MS)`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_PALETTES[0][2]).toBe("#9a3412")`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(Object.keys(props).sort()).toEqual([...Object.keys(BG_SETTINGS), "colors"].sort())`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = describe("TimerBackground: the same colour family as the glowing ball", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(block(".ab-timer-bg")).toContain("background: #000;")`
- Check by hand: start a session on the phone and on the laptop: the screen stays black while the first 10 minutes run (the background is made but all black), at 10 minutes the dark shade and the main colour of the session come in slowly (about 12 seconds, no jump), at 30 and 90 minutes lighter tints come in the same way, and the colours are of the same family as the glowing ball. The picture keeps flowing, the grain stands still, the cursor and a click do nothing, the white digits stay easy to read over the lightest tint of every palette (look at all six: ?lite=0 on the laptop, and sessions with different start times), and the background does not flicker while the colours move. Use the blend preview of the owner (Grainient_blend_preview.html) to compare the look.

### C38: The background needs WebGL 2 and is a library file, so it must never break the screen; it sits at the very bottom of the screen, and its fade time is written in the code and in the css
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.SCREEN`, `AB:TIMER.WARMUP`, `AB:TIMER.TESTS`
- If you change: canDrawWebgl2 (in src/lib/timerWarmup.ts, shared with the glowing ball, see C44) or BackgroundGuard in TimerBackground.tsx, the library file Grainient.tsx (never edit it), BG_FADE_MS or the lite levels that draw the background in backgroundLook.ts, the fade time or the stacking rules of .ab-timer-bg, .ab-timer and .ab-timer-dial in timer.css, the place of TimerBackground in TimerScreen.tsx, or dpr in BG_SETTINGS (backgroundLook.ts)
- Then also: the library animation draws with WebGL 2 (the graphics chip, through the browser). A browser that cannot do it, a lite level 2 page (the background is not drawn) or an error thrown by the library gives no background: canDrawWebgl2 (timerWarmup.ts) asks for a WebGL 2 context and gives it back, once for the whole page and shared with the ball, and TimerBackground asks it only when a session is shown, never when the screen opens (C44), and BackgroundGuard catches an error thrown while the animation is made, so the clocks, the ball and the buttons keep working. Both must stay. The settings of the animation are changed only by its props in TimerBackground.tsx and the values in backgroundLook.ts, never inside the library file (TAGGING_RULES.md, rule 6). A newer copy of the library file must be looked at on the laptop and on the phone before it is trusted: the tests use a stand-in, not the real animation. The layers: TimerBackground is the FIRST thing inside the main element of TimerScreen.tsx; .ab-timer-bg is position absolute over the whole screen with z-index 0, its own black and pointer-events none, and it has a shade at the bottom (.ab-timer-bg::after: 45 percent black at the very bottom, gone at 60 percent of the height) so that the milestone message that comes up from the bottom is easy to read; .ab-timer is position relative with isolation isolate, so the background can never fall behind the page, never covers the menu (the menu sits beside the main element with its own z-index) and never catches a tap; .ab-timer-dial has z-index 1 and the line, the Try again button and the buttons have z-index 1 (C31), so everything is drawn over the background. The library measures its box when it is made and again only when the window is resized, so the box must have its real size when the session starts (the screen has it). The fade in the css (700 ms) and BG_FADE_MS (700) are the same on purpose, because the code takes the background away when the fade ends; a test compares them. The size the picture is drawn at: the graphics chip runs the animation once for every pixel it draws, and the library already makes its colour field at half the width and half the height of its canvas and only the grain at full size, so the background sets dpr to 1 (one canvas pixel for every pixel of the screen, never more on a sharp phone screen) and needs no half-size box of its own. If the screen gets slow or hot on a phone, lower the work here first (dpr cannot go below 1 without a change of the library; the dimming and the settings do not change the work).
- If you forget: a browser without WebGL 2 shows an error or a blank screen, the background covers the digits or the buttons, it catches taps, it is cut off while it fades, the shade at the bottom is gone and the milestone message is hard to read, or the phone gets hot because the library draws at the full pixel ratio of a sharp screen.
- Anchor: `AB:TIMER.WARMUP @ src/lib/timerWarmup.ts = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = if (!shown || !ready || !bgDrawn(LITE_LEVEL) || !canDrawWebgl2()) return null`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <BackgroundGuard>`
- Anchor: `src/components/TimerBackground.tsx = import Grainient from "@/components/Grainient"`
- Anchor: `src/components/TimerBackground.tsx = import { canDrawWebgl2, useMountDelay } from "@/lib/timerWarmup"`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_FADE_MS = 700`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = dpr: 1,`
- Anchor: `AB:TIMER.BG @ src/timer.css = transition: opacity 700ms ease;`
- Anchor: `AB:TIMER.BG @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.BG @ src/timer.css = z-index: 0;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TimerBackground`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_FADE_MS).toBe(700)`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_SETTINGS.dpr).toBe(1)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(fade).toBe(BG_FADE_MS)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = it("keeps the bottom a little darker, with a layer over the animation that never catches a tap", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = expect(stub.parentElement?.firstElementChild).toBe(stub)`
- Check by hand: on the phone open the page address #timer and start a session: the background fades in, the clocks stay readable, the buttons react to a finger everywhere, and the phone does not get hot after 10 minutes. In a browser without WebGL 2 the clocks and the buttons still work. With ?lite=2 in the page address the screen stays plain black. The picture fills the whole screen, also in the corners, with no hard edges, and the bottom of the screen is a little darker than the top.

````

**`CONNECTIONS.md`: two small word changes.** Each old text must be found EXACTLY ONCE in the file (they sit in C47 and C49). Replace the text, and nothing around it:
- Replace `the box of the background shows its black before the rays are made` with `the box of the background shows its black before the library animation is made`
- Replace `Read the line on top of the brightest rays` with `Read the line on top of the brightest part of the background`

**`PROGRESS.md`: three lines.**
1. Find the line that starts with `- Packet 07C:` (it must be found EXACTLY ONCE). KEEP it. Directly BELOW it add this one line:
```
- Packet 08A: the moving background of the Pro Timer is now the React Bits Grainient animation (a slowly flowing gradient with a little grain; library file src/components/Grainient.tsx, never edited) instead of Side Rays. The animation settings are the ones of the owner's blend preview (angle 55, flow 0.8, speed 1, softness 1, silk 0.35, grain 0.08, still grain, no cursor or click, dpr 1). The background starts all black and grows from the dark end: at 10 minutes the dark shade and the main colour come in, at 30 minutes the lighter tint, at 90 minutes the lightest tint, each by a smooth 12 second blend (slower than the 4 seconds of the ball). The six palettes have the same order as the six palettes of the glowing ball, and a session gets the same palette number for both, so they are of the same colour family. The tint layer, the black light layer and the half-size box of the old rays are gone; the box has a shade at the bottom instead (45 percent black, gone at 60 percent of the height). The old light of the rays (bgLight) stays in backgroundLook.ts only for the tests of the stop alert lines and the milestone lines, until those lines about rays are rewritten. SideRays.tsx and MetaBalls.tsx stay in the project, unused. With automated tests (npm test, 914 tests); the owner still has to look at it by eye.
```
2. Find the line that starts with `- Owner looks at Packets 07B and 07C by eye` (EXACTLY ONCE). KEEP it. Directly BELOW it add these two lines, in this order:
```
- Owner looks at Packet 08A by eye on the phone and the laptop: start a session, the screen stays black, then at 10, 30 and 90 minutes (use the Grainient_blend_preview.html to compare) the colours blend in slowly, the white digits stay readable over the lightest tint of all six palettes, and the phone does not get hot (see CONNECTIONS.md C37 and C38)
- Packet 08B (to write): the lines of the stop alert and of the milestone message that talk about the rays of light (raysLine in every bank of milestoneLines.ts, and the sentences about rays in stopAlertLines.ts) are not true any more, because the background has no rays and its light does not grow in a straight line; they have to be rewritten, and then bgLight and the visuals.rays flag can go (see CONNECTIONS.md C41, C50 and C51)
```
If a line is not found exactly once: **STOP** and report.

Then run this ONE command (the same fingerprint as before):
```
foreach ($f in @("CODE_MAP.md","CONNECTIONS.md","PROGRESS.md")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these three lines:
```
CODE_MAP.md b2f6f893da5400ed3f516b2be39b1af4146f0215d4ff1360e9f3383fbd51808d
CONNECTIONS.md d69bb0cb475c4a6d8825a8de1b168ad75476f59f58a9023dc4a1223d09773e3c
PROGRESS.md 0341e480d373c4e060bbc2da335221367e7b16bd6a1b547c7f76ea968b067532
```
If a line is different: **STOP** and report the RAW output.

## STEP 8: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 34 tags, 66 places
CONNECTIONS OK: 51 connections, 417 anchors, 49 classes, 2 css variables, 2 label links
```
(The tags, places and connections stay the same. 417 anchors: C37 has 24 anchors now (it had 20) and C38 has 18 (it had 20), which is 2 more in all than the 415 before. 49 classes: the three classes of the old rays, `ab-timer-bg-rays`, `ab-timer-bg-tint` and `ab-timer-bg-dim`, are gone.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerScreen.tsx`, `src/lib/backgroundLook.test.ts`, `src/lib/backgroundLook.ts` and `src/timer.css`, and it may also list the two files named in the rules (they had changes before this packet). `git status --short` must show `?? src/components/Grainient.tsx` (the new file is untracked until Step 9). If ANY other tracked file is listed (for example `package.json`, `package-lock.json`, `src/components/SideRays.tsx` or `src/components/MetaBalls.tsx`): **STOP** and report the COMPLETE output. Do not restore anything.

## STEP 9: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/components/Grainient.tsx src/components/TimerBackground.tsx src/components/TimerBackground.test.tsx src/components/TimerScreen.tsx src/lib/backgroundLook.ts src/lib/backgroundLook.test.ts src/timer.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 08A: the moving background is Grainient (starts black, grows from the dark end, 12 s blend, colour family of the glowing ball)"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The two files named in the rules and untracked files may still show: leave them alone.

## STEP 10: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0, the files this packet changes had no uncommitted changes, `Grainient.tsx` did not exist, and the nine fingerprints of Step 0 matched.
2. The seven fingerprint lines of Step 5 matched exactly.
3. `npm test` printed `Test Files  18 passed (18)` and `Tests  914 passed (914)`, and `npx tsc -b` printed nothing.
4. The three fingerprint lines of Step 7 matched exactly.
5. `node scripts/check-tags.mjs` printed the two lines of Step 8 (51 connections, 417 anchors, 49 classes).
6. `npm run build` finished with no errors.
7. `git show --stat HEAD` lists exactly these 10 files: `src/components/Grainient.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/timer.css`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
8. The first line of `git log --oneline` ends with `Packet 08A: the moving background is Grainient (starts black, grows from the dark end, 12 s blend, colour family of the glowing ball)`.
9. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
10. `git push` finished without an error.
11. No file other than the ones named in this packet was created, edited or committed, and NO helper script or temp file was created at any time (also not one that was deleted afterwards). `SideRays.tsx` and `MetaBalls.tsx` are still in the project.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 11 done-checks. If you had to create a helper file, say so and mark check 11 FAIL.
- the RAW outputs of the 5 commands of Step 0 (and the output of `git diff` of the file if Step 0 stopped), and the output of `node scripts/check-tags.mjs` of Step 0
- the exact seven lines printed in Step 5 and the exact three lines printed in Step 7
- the last 12 lines of the output of `npm test`, and the output of `npx tsc -b` (or the word EMPTY)
- the exact output of `node scripts/check-tags.mjs` from Step 8
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 8
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 9
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.

---

## HOW TO UNDO (not the agent's job)
The whole packet is one commit, so one `git revert <hash of the commit of Step 9>` in the planner chat brings back the Side Rays background exactly as Packet 07C left it. (`SideRays.tsx` is still in the project, so nothing has to be installed again.)

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests use a stand-in for the animation; they cannot see pixels, and the planner did NOT see the real Grainient draw in a browser either (there is no WebGL 2 in the test environment). So your look is the first real look. Keep `Grainient_blend_preview.html` open in another tab: it is the look this packet was built from. Look on the laptop AND on the phone:
1. Laptop: open `#timer` and press Start. The screen fades in black and stays black: the first colour comes at 10 minutes. The flow of the background is slow and the grain stands still. Moving the mouse or clicking does nothing to it.
2. At 10, 30 and 90 minutes a new colour blends in, slowly (12 seconds, no jump), and the glowing ball takes its colours at the same minutes (the ball blends faster, in 4 seconds). The two must be of the same colour family. (To see it sooner, use the preview file, or ask the planner for a test page.)
3. The white digits and the buttons must stay easy to read over the lightest tint of every palette. If one palette is too bright, tell me which: the dimming in `timer.css` (`opacity: 0.5` of `.ab-timer-bg`) and the palettes in `backgroundLook.ts` are safe to change alone.
4. Press Pause: the background gets dimmer. Hold to end the session: it fades out to black. A new session starts black again, with a new palette.
5. The bottom of the screen is a little darker than the top (the milestone message sits there).
6. Phone: the same as the laptop. If the phone gets warm or the movement is not smooth, tell me: the first thing to try is the speed in `BG_SETTINGS`.
7. Known leftover: the lines of the stop alert and of the milestone message that talk about "rays" are not true any more. That is Packet 08B.
