# PACKET 05E1: THE MOVING BACKGROUND BECOMES SIDE RAYS (SPEED 2.9, TILT 13, INTENSITY 2.8), IN THE COLOUR OF THE GLOWING BALL

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- This packet runs AFTER Packet 05D1 (the Pro Timer fits the window). Step 0 checks that it is in place and that the files this packet replaces are untouched. If not: **STOP**.
- Edit ONLY these files. ONE new file: `src/components/SideRays.tsx`. TWO files replaced as a whole: `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`. FOUR files edited in a few places: `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx` (one line of comment), `src/timer.css`. THREE map files edited: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Create NO other file.
- Do NOT create any helper script, `.ps1` file, note or temp file anywhere. Write the new file and the two replaced files with your file-writing tool (put exactly the block in the file). Run every command directly in the terminal.
- `src/components/AppMenu.tsx` and `src/menu.css` may have changes that are NOT part of this packet. Do not open, edit, stage, revert or commit them. Other untracked files (the `packets` files, `run_*.ps1`) are also not part of this packet: leave them alone.
- `src/components/MetaBalls.tsx`, `src/components/CrystalizedBall.tsx` and `src/components/HoldButton.tsx` are library components: never open them for editing and never change them. `MetaBalls.tsx` is not used any more after this packet, but it STAYS in the project (do NOT delete it). `src/components/TimerBall.tsx`, `src/components/TimerScreen.test.tsx` and every file in `src/lib` except the two named above are NOT changed by this packet.
- Do not run `npm audit fix`, `npm update`, `npm uninstall`, `npm install`, or any other install. This packet needs none (the library `ogl` that Side Rays uses is already in `package.json`). Do not run `npm run lint`.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 10 is allowed.
- Every "find and replace" below says where to look. The old text or the heading must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess. Ignore the line ending (a trailing carriage return) when you compare lines.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The moving background behind the Pro Timer (it shows while a session runs or is paused) is today the React Bits animation Meta Balls: soft blobs. This packet replaces it with the React Bits animation Side Rays: rays of light that sweep in from the top right corner of the screen, with the settings the owner chose on the React Bits page (speed 2.9, tilt 13, intensity 2.8; every other setting of the animation keeps its own default). The COLOUR works exactly as before: the library draws the rays in white (both of its ray colours are given white and never change), and a tint layer on top gives them the colour of the glowing ball at every moment (white at first, then the colours of the session at 10, 30 and 90 minutes), so the ball and the background always have the same colour. Two things in `timer.css` must change for this to work with Side Rays, because its canvas is see-through where there is no ray (Meta Balls drew its own black): the box of the background gets its own black (`background: #000;`), and the tint layer gets `z-index: 4`, because the box of Side Rays has `z-[3]` and would otherwise be drawn OVER the tint. Everything else stays: the fade in and out (700 ms), the dimming, the dimming when paused, no background without WebGL 2 and at lite level 2, the glowing ball, the clocks, the buttons, the timer maths and the database. In the planner's test browser the whole screen was drawn with the real animation, the real ball and the real colours on a laptop and on a phone size, and the white digits stay easy to read in every palette. The library file `MetaBalls.tsx` stays in the project, unused.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/components/MetaBalls.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/timer.css`. If any is missing: **STOP** and report which.
Check that `src/components/SideRays.tsx` does NOT exist yet. If it exists: **STOP** and report.
Run `Select-String -Pattern '"ogl"' package.json`. It must print one line with `"ogl"`. If it prints nothing: **STOP** and report.

Run `node scripts/check-tags.mjs`. It must print exactly (these are the numbers after Packet 05D1):
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 40 connections, 227 anchors, 35 classes, 2 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. A line for a changed tracked file is fine ONLY for these two paths: `src/components/AppMenu.tsx`, `src/menu.css`.
- If one of the files this packet changes (`src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/timer.css`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`) shows as changed (an `M` in either column): **STOP** and report the COMPLETE output of `git status --short` and the COMPLETE output of `git diff -- <that file>`. Do not commit, restore or edit anything.
- If ANY other tracked file is changed: **STOP** and report the COMPLETE output of `git status --short`.

Run `git log --oneline -20`. One of the twenty lines must contain the text `Packet 05D1`. If none does: **STOP** and report the COMPLETE output (Packet 05D1 was not committed).

Then run these read-only commands. Do NOT stop on their results unless a line below says so, and do NOT fix anything. Copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -5`
3. `git ls-files | Select-String -Pattern "\.env"`
4. `node -v`
5. This ONE command (it prints the fingerprint of each of the four files this packet depends on or replaces as a whole, line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/TimerScreen.tsx","src/timer.css","src/lib/backgroundLook.ts","src/lib/backgroundLook.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```

Command 5 must print exactly these four lines (the files exactly as they are after Packet 05D1 and before this packet):
```
src/components/TimerScreen.tsx 2943330535809db4bd281cd95a725e9ab264fb0ed2e4232feeaa8ceed6c44012
src/timer.css bf6f7f8a701026efa0a0997f285281b933ecd1d2c28aa9c0fa9821cab887f87b
src/lib/backgroundLook.ts 39716995107d5cd3a31cb4330f7555a40334425973e9274f61a94c4e99348d4a
src/lib/backgroundLook.test.ts 138ebfc42a06b31b0fd28e32a99a09a99b7c570fea989ec76f2dd7205ce83aa4
```
If a fingerprint is different: **STOP** and report the RAW output. Do not edit anything.

## STEP 1: Create the new file `src/components/SideRays.tsx`
This is the React Bits component Side Rays (TypeScript, Tailwind variant), copied unchanged. It is a LIBRARY file: never edit it after this step. Create the file `src/components/SideRays.tsx` with exactly this content (everything inside the block below):
```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

type Origin = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

interface SideRaysProps {
  speed?: number;
  rayColor1?: string;
  rayColor2?: string;
  intensity?: number;
  spread?: number;
  origin?: Origin;
  tilt?: number;
  saturation?: number;
  blend?: number;
  falloff?: number;
  opacity?: number;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
};

const originToFlip = (origin: Origin): [number, number] => {
  switch (origin) {
    case 'top-left': return [1, 0];
    case 'bottom-right': return [0, 1];
    case 'bottom-left': return [1, 1];
    default: return [0, 0];
  }
};

const SideRays = ({
  speed = 2.5,
  rayColor1 = '#EAB308',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = ''
}: SideRaysProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Record<string, { value: number | number[] }> | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }

    const initializeWebGL = async () => {
      if (!containerRef.current) return;

      await new Promise<void>(resolve => setTimeout(resolve, 10));

      if (!containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`;

      const [flipX, flipY] = originToFlip(origin);
      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] as number[] },
        iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) as number[] },
        iRayColor2: { value: hexToRgb(rayColor2) as number[] },
        iIntensity: { value: intensity },
        iSpread: { value: spread },
        iFlipX: { value: flipX },
        iFlipY: { value: flipY },
        iTilt: { value: tilt },
        iSaturation: { value: saturation },
        iBlend: { value: blend },
        iFalloff: { value: falloff },
        iOpacity: { value: opacity }
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updateSize = () => {
        if (!containerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth: w, clientHeight: h } = containerRef.current;
        renderer.setSize(w, h);
        uniforms.iResolution.value = [w * renderer.dpr, h * renderer.dpr];
      };

      const loop = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) return;
        uniforms.iTime.value = t * 0.001;
        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (e) {
          return;
        }
      };

      window.addEventListener('resize', updateSize);
      updateSize();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }
        window.removeEventListener('resize', updateSize);
        if (renderer) {
          try {
            const loseCtx = renderer.gl.getExtension('WEBGL_lose_context');
            if (loseCtx) loseCtx.loseContext();
            const canvas = renderer.gl.canvas;
            if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
          } catch (e) {}
        }
        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    initializeWebGL();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [isVisible, speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;
    u.iSpeed.value = speed;
    u.iRayColor1.value = hexToRgb(rayColor1);
    u.iRayColor2.value = hexToRgb(rayColor2);
    u.iIntensity.value = intensity;
    u.iSpread.value = spread;
    const [flipX, flipY] = originToFlip(origin);
    u.iFlipX.value = flipX;
    u.iFlipY.value = flipY;
    u.iTilt.value = tilt;
    u.iSaturation.value = saturation;
    u.iBlend.value = blend;
    u.iFalloff.value = falloff;
    u.iOpacity.value = opacity;
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none z-[3] ${className}`.trim()}
    />
  );
};

export default SideRays;
```

## STEP 2: Replace two files as a whole
Each of the two files below already exists. Replace its ENTIRE content with the block below it: delete everything that is in the file and put exactly the block in its place.

Replace the ENTIRE content of the file `src/lib/backgroundLook.ts` with exactly this content:
```ts
import type { LiteLevel } from "@/lib/lite"

// AB:TIMER.BG-LOOK:START
// The look of the moving background of the Pro Timer screen, as plain values and one function: no screen, no clock of its own.
// The background is the React Bits animation Side Rays: soft rays of light that sweep in from the top right corner of the screen. The library draws the rays in WHITE, always (both of its ray colours are given white). The colour comes from a tint layer on top of it (see TimerBackground.tsx and CONNECTIONS.md C37), because giving the library another colour makes it build its whole drawing again.
// The colour steps and the palettes are the ones of the glowing ball (src/lib/ballLook.ts), so the background and the ball always have the same colour.
// The automated tests are in src/lib/backgroundLook.test.ts. Run them with: npm test

// The colour given to the library for BOTH of its ray colours. It is white on purpose and never changes: the tint layer does the colouring.
export const BG_COLOUR = "#ffffff"
// How long the background takes to fade out when the session ends, in milliseconds. The css fades for the same time (see CONNECTIONS.md C38).
export const BG_FADE_MS = 700

// The settings of the animation, as chosen by the owner on the React Bits page (speed 2.9, tilt 13, intensity 2.8). Every other setting of the library keeps its own default.
export const BG_SETTINGS = {
  speed: 2.9,
  tilt: 13,
  intensity: 2.8,
} as const

// Whether the background is drawn: the full look (laptop) and lite level 1 (phones) draw the rays, lite level 2 draws nothing (the screen stays plain black, see src/lib/lite.ts).
const DRAWN_BY_LITE: readonly [boolean, boolean, boolean] = [true, true, false]

export function bgDrawn(liteLevel: LiteLevel): boolean {
  return DRAWN_BY_LITE[liteLevel]
}
// AB:TIMER.BG-LOOK:END
```

Replace the ENTIRE content of the file `src/lib/backgroundLook.test.ts` with exactly this content:
```ts
import { describe, expect, it } from "vitest"
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgDrawn } from "./backgroundLook"

// AB:TIMER.TESTS:START

// Tests of the look of the moving background. Run them with: npm test
// The colours and the colour steps of the background are the ones of the glowing ball (ballLook.ts), they are tested in ballLook.test.ts and TimerBackground.test.tsx.

describe("the colour given to the library", () => {
  it("is white, because the tint layer multiplies it: white times a colour is that colour", () => {
    expect(BG_COLOUR).toBe("#ffffff")
  })
})

describe("the timing of the background", () => {
  it("fades out in 0.7 seconds", () => {
    expect(BG_FADE_MS).toBe(700)
  })
})

describe("the settings of the animation", () => {
  it("are the ones the owner chose on the React Bits page", () => {
    expect(BG_SETTINGS.speed).toBe(2.9)
    expect(BG_SETTINGS.tilt).toBe(13)
    expect(BG_SETTINGS.intensity).toBe(2.8)
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
// AB:TIMER.TESTS:END
```

## STEP 3: Edit `src/components/TimerBackground.tsx`
In the file `src/components/TimerBackground.tsx` make exactly these 5 changes, one after the other. Each old text must be found EXACTLY ONCE in that file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one.

**Change 1 of 5.** Find this text:
```text
import MetaBalls from "@/components/MetaBalls"
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgBallCount } from "@/lib/backgroundLook"
```
and replace it with:
```text
import SideRays from "@/components/SideRays"
import { BG_COLOUR, BG_FADE_MS, BG_SETTINGS, bgDrawn } from "@/lib/backgroundLook"
```

**Change 2 of 5.** Find this text:
```text
// Library: src/components/MetaBalls.tsx (React Bits, never edited). It draws white blobs on black. This file lays a tint layer over it that multiplies the white with the colour of the session, so the blobs get that colour (see CONNECTIONS.md C37). The library is never given a colour: a new colour would make it build its whole drawing again, many times a second.
```
and replace it with:
```text
// Library: src/components/SideRays.tsx (React Bits, never edited). It draws white rays on a clear background (the black behind it is the box of the background, see timer.css). This file lays a tint layer over it that multiplies the white with the colour of the session, so the rays get that colour (see CONNECTIONS.md C37). The library is never given a colour: a new colour would make it build its whole drawing again, many times a second.
```

**Change 3 of 5.** Find this text:
```text
// A person who asked their device for less motion gets the blobs standing still.
```
and replace it with:
```text
// A person who asked their device for less motion gets the rays standing still.
```

**Change 4 of 5.** Find this text:
```text
      <MetaBalls
        color={BG_COLOUR}
        cursorBallColor={BG_COLOUR}
        speed={still ? 0 : BG_SETTINGS.speed}
        animationSize={BG_SETTINGS.animationSize}
        hoverSmoothness={BG_SETTINGS.hoverSmoothness}
        cursorBallSize={BG_SETTINGS.cursorBallSize}
        enableMouseInteraction={BG_SETTINGS.enableMouseInteraction}
        ballCount={bgBallCount(LITE_LEVEL)}
        enableTransparency={false}
      />
```
and replace it with:
```text
      <SideRays
        rayColor1={BG_COLOUR}
        rayColor2={BG_COLOUR}
        speed={still ? 0 : BG_SETTINGS.speed}
        tilt={BG_SETTINGS.tilt}
        intensity={BG_SETTINGS.intensity}
      />
```

**Change 5 of 5.** Find this text:
```text
canDrawBackground() && bgBallCount(LITE_LEVEL) > 0
```
and replace it with:
```text
canDrawBackground() && bgDrawn(LITE_LEVEL)
```

## STEP 4: Edit `src/components/TimerBackground.test.tsx`
In the file `src/components/TimerBackground.test.tsx` make exactly these 10 changes, one after the other. Each old text must be found EXACTLY ONCE in that file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one.

**Change 1 of 10.** Find this text:
```text
// A real Meta Balls needs WebGL 2
```
and replace it with:
```text
// A real Side Rays needs WebGL 2
```

**Change 2 of 10.** Find this text:
```text
vi.mock("@/components/MetaBalls"
```
and replace it with:
```text
vi.mock("@/components/SideRays"
```

**Change 3 of 10.** Find this text:
```text
return h("div", { id: "metaballs-stub" })
```
and replace it with:
```text
return h("div", { id: "siderays-stub" })
```

**Change 4 of 10.** Find this text:
```text
    expect(has("#metaballs-stub")).toBe(true)
    expect(has(".ab-timer-bg-tint")).toBe(true)
```
and replace it with:
```text
    expect(has("#siderays-stub")).toBe(true)
    expect(has(".ab-timer-bg-tint")).toBe(true)
```

**Change 5 of 10.** Find this text:
```text
const stub = container?.querySelector("#metaballs-stub") ?? null
```
and replace it with:
```text
const stub = container?.querySelector("#siderays-stub") ?? null
```

**Change 6 of 10.** Find this text:
```text
  it("uses the settings the owner chose, with a plain opaque black behind the blobs", () => {
    show({ active: true })
    const props = lastProps()
    expect(props.speed).toBe(BG_SETTINGS.speed)
    expect(props.animationSize).toBe(27)
    expect(props.hoverSmoothness).toBe(0.141)
    expect(props.cursorBallSize).toBe(4)
    expect(props.enableMouseInteraction).toBe(false)
    expect(props.enableTransparency).toBe(false)
  })

  it("gives the library white for the balls and for the cursor ball, so that the tint layer can colour them", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().color).toBe("#ffffff")
    expect(lastProps().cursorBallColor).toBe("#ffffff")
  })

  it("draws 21 balls on the laptop and 10 on a phone (lite level 0 and 1)", () => {
    show({ active: true })
    expect(lastProps().ballCount).toBe(21)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(lastProps().ballCount).toBe(10)
  })

  it("lets the blobs move at the chosen speed", () => {
    show({ active: true })
    expect(lastProps().speed).toBe(0.5)
  })

  it("lets the blobs stand still for a person who asked their device for less motion", () => {
```
and replace it with:
```text
  it("uses the settings the owner chose (speed, tilt, intensity) and leaves every other setting of the library at its own default", () => {
    show({ active: true })
    const props = lastProps()
    expect(props.speed).toBe(BG_SETTINGS.speed)
    expect(props.tilt).toBe(13)
    expect(props.intensity).toBe(2.8)
    expect(Object.keys(props).sort()).toEqual(["intensity", "rayColor1", "rayColor2", "speed", "tilt"])
  })

  it("gives the library white for both of its ray colours, so that the tint layer can colour them", () => {
    show({ active: true, seconds: DEEP_FROM_SECONDS + 5 })
    expect(lastProps().rayColor1).toBe("#ffffff")
    expect(lastProps().rayColor2).toBe("#ffffff")
  })

  it("draws the rays on the laptop and on a phone (lite level 0 and 1)", () => {
    show({ active: true })
    expect(has("#siderays-stub")).toBe(true)
    dispose()
    state.lite = 1
    show({ active: true })
    expect(has("#siderays-stub")).toBe(true)
  })

  it("lets the rays move at the chosen speed", () => {
    show({ active: true })
    expect(lastProps().speed).toBe(2.9)
  })

  it("lets the rays stand still for a person who asked their device for less motion", () => {
```

**Change 7 of 10.** Find this text:
```text
expect(has("#metaballs-stub")).toBe(false)
```
and replace it with:
```text
expect(has("#siderays-stub")).toBe(false)
```

**Change 8 of 10.** Find this text:
```text
it("has a tint layer that multiplies the white blobs with its colour, over the whole box", () => {
```
and replace it with:
```text
it("has a tint layer that multiplies the white rays with its colour, over the whole box", () => {
```

**Change 9 of 10.** Find this text:
```text
  it("lets the canvas of the library fill its place without a gap under it", () => {
```
and replace it with:
```text
  it("has a plain black behind the rays, so that the tint layer colours only the rays and not the empty parts of the canvas", () => {
    expect(block(".ab-timer-bg")).toContain("background: #000;")
  })

  it("draws the tint layer above the library's own box, which has a z-index of its own", () => {
    const library = readFileSync("src/components/SideRays.tsx", "utf8")
    const libraryZ = Number(/z-\[(\d+)\]/.exec(library)?.[1])
    const tintZ = Number(/z-index:\s*(\d+);/.exec(block(".ab-timer-bg-tint"))?.[1])
    expect(libraryZ).toBeGreaterThan(0)
    expect(tintZ).toBeGreaterThan(libraryZ)
  })

  it("lets the canvas of the library fill its place without a gap under it", () => {
```

**Change 10 of 10.** Find this text:
```text
so that it can be read over a bright blob
```
and replace it with:
```text
so that it can be read over a bright ray
```

## STEP 5: Edit `src/components/TimerScreen.tsx` and `src/timer.css`
In the file `src/components/TimerScreen.tsx` make exactly these 1 change, one after the other. Each old text must be found EXACTLY ONCE in that file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one.

**Change 1 of 1.** Find this text:
```text
the moving background (TimerBackground.tsx, the Meta Balls animation)
```
and replace it with:
```text
the moving background (TimerBackground.tsx, the Side Rays animation)
```

In the file `src/timer.css` make exactly these 3 changes, one after the other. Each old text must be found EXACTLY ONCE in that file (ignore line endings). If it is found zero times or more than once: **STOP** and report which one.

**Change 1 of 3.** Find this text:
```text
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.5;
```
and replace it with:
```text
  z-index: 0;
  isolation: isolate;
  overflow: hidden;
  pointer-events: none;
  background: #000;
  opacity: 0.5;
```

**Change 2 of 3.** Find this text:
```text
and never catches a tap. It fades in when a session starts and out when it ends. The fade time is the same as BG_FADE_MS in backgroundLook.ts (CONNECTIONS.md C38). */
```
and replace it with:
```text
and never catches a tap. It has its own black, so that the tint layer below colours only the rays and not the clear parts of the animation (CONNECTIONS.md C37). It fades in when a session starts and out when it ends. The fade time is the same as BG_FADE_MS in backgroundLook.ts (CONNECTIONS.md C38). */
```

**Change 3 of 3.** Find this text:
```text
/* The tint layer over the library's white blobs: white times a colour is that colour, black stays black (CONNECTIONS.md C37). The colour is set by TimerBackground.tsx on this layer. */
.ab-timer-bg-tint {
  position: absolute;
  inset: 0;
  mix-blend-mode: multiply;
}
```
and replace it with:
```text
/* The tint layer over the library's white rays: white times a colour is that colour, black stays black (CONNECTIONS.md C37). Its z-index is higher than the z-index of the library's own box (z-[3]), or the white rays would be drawn over it. The colour is set by TimerBackground.tsx on this layer. */
.ab-timer-bg-tint {
  position: absolute;
  inset: 0;
  z-index: 4;
  mix-blend-mode: multiply;
}
```

## STEP 6: Check that the files are exactly right
Run this ONE command (it prints one line per file: the path and a fingerprint of the file with line endings and trailing blank lines ignored):
```
foreach ($f in @("src/components/SideRays.tsx","src/components/TimerScreen.tsx","src/timer.css","src/lib/backgroundLook.ts","src/lib/backgroundLook.test.ts")) { $t = (Get-Content -Raw -Encoding UTF8 $f).Replace("`r`n","`n").TrimEnd(); $h = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($t))).Replace("-","").ToLower(); "$f $h" }
```
It must print exactly these five lines:
```
src/components/SideRays.tsx f66220f839ea59f0c5831dbdb2efb41344062f2c0bc094bc493a85500974baaf
src/components/TimerScreen.tsx 304a9dfa585cfb0150de226543654bfb926b3bdc22f63ee320cda5502712d079
src/timer.css 6eff8c34b5edbfa1a703d28398009785229652bd7bc9ba32e5d3628eaaecb1d7
src/lib/backgroundLook.ts c4d7155a5be5b3e6fc484e05a14aa90f31943ca6115e61bf7f27a50b62fb317f
src/lib/backgroundLook.test.ts 865ccb0458d7e8c32ef98a423efbd03c5389b2a95ad9185bc630c42bbc8eadb1
```
If a fingerprint is different, or the command fails: **STOP** and report the RAW output and, for the files that differ, the output of `(Get-Content <path>).Count`. Do not fix the file. (Expected line counts: src/components/SideRays.tsx 281, src/lib/backgroundLook.ts 27, src/lib/backgroundLook.test.ts 42, src/timer.css 273.)

## STEP 7: Run the tests and the type check
Run:
```
npm test
```
It must finish with a line `Test Files  10 passed (10)` and a line `Tests  555 passed (555)` (553 from before, plus 2 new tests in the css part of the background tests). It runs once and stops by itself. If any test fails or the count is different: **STOP** and report the COMPLETE output. Do not edit any file. Copy the last 12 lines of the output.

Run:
```
npx tsc -b
```
It must print nothing. If it prints anything: **STOP** and report the COMPLETE output.

## STEP 8: Edit `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`
Change nothing else in these files.

**`CODE_MAP.md`: three rows.** Each old line must be found EXACTLY ONCE (it is a whole line of the file). Replace it with the new line below it.

Row 1 of 3. Replace this whole line:
```
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values: the white given to the library, the animation settings the owner chose, how many balls for a laptop, a phone and the lightest level (none), the fade time | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the balls per lite level; the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the white (BG_COLOUR) must stay white, see CONNECTIONS.md C37 |
```
with this whole line:
```
| `AB:TIMER.BG-LOOK` | The look of the moving background as plain values: the white given to the library, the animation settings the owner chose (speed, tilt, intensity), which lite levels draw it (the lightest level draws nothing), the fade time | `src/lib/backgroundLook.ts` | the animation settings (BG_SETTINGS) and the lite levels that draw it; the fade time (BG_FADE_MS, tied to the css, see CONNECTIONS.md C38); the white (BG_COLOUR) must stay white, see CONNECTIONS.md C37 |
```

Row 2 of 3. Replace this whole line:
```
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Meta Balls animation): black without a session; it fades in when a session starts, has the colour of the glowing ball at every moment (white at first, then the colours of the session), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 and at lite level 2. The library animation is `src/components/MetaBalls.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the dimming (opacity), the dimming when paused and the fade time in the css (see CONNECTIONS.md C37 and C38); the colour comes from the functions of the ball, see C37 |
```
with this whole line:
```
| `AB:TIMER.BG` | The moving background of the Pro Timer screen (the React Bits Side Rays animation: rays of light that come in from the top right corner): black without a session; it fades in when a session starts, has the colour of the glowing ball at every moment (white at first, then the colours of the session), dims when paused and fades out when the session ends; it draws nothing when the browser has no WebGL 2 and at lite level 2. The library animation is `src/components/SideRays.tsx` | `src/components/TimerBackground.tsx`, `src/timer.css` | the settings given to the animation (in backgroundLook.ts); the dimming (opacity), the dimming when paused, the black behind the rays and the fade time in the css (see CONNECTIONS.md C37 and C38); the colour comes from the functions of the ball, see C37 |
```

Row 3 of 3. Replace this whole line:
```
| MetaBalls (the moving background of the Pro Timer) | `src/components/MetaBalls.tsx` | `AB:TIMER.BG` |
```
with this whole line:
```
| Side Rays (the moving background of the Pro Timer) | `src/components/SideRays.tsx` | `AB:TIMER.BG` |
```

**`CONNECTIONS.md`: C37 and C38.** Find this line (EXACTLY ONCE):
```
### C37: The moving background is white blobs from the library with a tint layer over them, and the tint has the colour of the glowing ball
```
and this line (EXACTLY ONCE):
```
### C39: On a wide screen the Pro Timer is two columns (the dial on the left, the line and the buttons on the right), the phone stays one column, and the wide rules must come after the phone rules and must not touch the clip, the stacking or the taps
```
The first one must come before the second. The block from the C37 line down to the line directly above the C39 line must be 38 lines long (it holds the entries C37 and C38 and ends with one empty line). If it is not: **STOP** and report. Delete that whole block (the C37 line and every line below it, up to but NOT including the C39 line). In the same place insert exactly this block (it holds the new C37 and the changed C38, with one empty line between them; it is 41 lines long and ends with one empty line, so that there is an empty line between the last line of C38 and the C39 line):
```markdown
### C37: The moving background is white rays from the library with a tint layer over them, and the tint has the colour of the glowing ball
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.BALL-LOOK`, `AB:TIMER.TESTS`
- If you change: the colour given to the library animation (BG_COLOUR, and rayColor1 and rayColor2 in TimerBackground.tsx), the tint layer (the class ab-timer-bg-tint, its mix-blend-mode and its z-index in timer.css), the black behind the animation (the background line of .ab-timer-bg in timer.css), the functions or the time the tint uses to get its colour (ballTargetColour, blendHex, BALL_BLEND_MS), or the colour steps and palettes of the ball (C34)
- Then also: the library animation (Side Rays) draws rays of light and nothing else: the parts of its canvas without a ray are clear (see-through), not black. It builds its whole drawing again (the graphics context and the shader) whenever one of its settings changes, its two ray colours included, so it is given white for both of them once and never another colour. The colour comes from a tint layer laid over it: the layer has the colour of the session and multiplies the white rays (white times a colour is that colour, black stays black). This works only while (1) both ray colours given to the library stay white (BG_COLOUR), (2) the tint layer comes after the library in TimerBackground.tsx AND has a higher z-index than the box of the library, which has a z-index of its own (z-[3] in SideRays.tsx; the tint has 4; a test reads the number from the library file, because a positioned box with a z-index is drawn over a later box without one, and the rays would stay white), (3) the tint layer has mix-blend-mode multiply and covers the whole box, (4) the box is isolated (isolation isolate), so that the multiply meets only the rays, (5) the box has its own plain black (background #000 in .ab-timer-bg): inside the isolated box the clear parts of the canvas are see-through, and a multiply over see-through gives the colour of the tint itself, so without the black the whole screen would get a flat wash of the session colour instead of dark with rays. The tint gets its colour from ballTargetColour and blendHex of ballLook.ts and moves on in BALL_BLEND_MS, exactly as the ball does (TimerBall.tsx), so the ball and the background have the same colour at every moment while a session runs or is paused; a test puts both side by side and compares them. It starts white, and the steps are the quality steps (C34): a new step or palette in ballLook.ts reaches the background by itself. While the background fades out its colour is held, the ball's is not (it fades for the same short time and nobody can see the difference). The animation settings (BG_SETTINGS: speed, tilt, intensity in backgroundLook.ts) are safe to tune alone: the higher the intensity, the more of the screen is lit (the rays are strongest in the top right corner and fade towards the bottom left). So is the dimming (opacity) of the box in timer.css, but the white digits must stay easy to read over the brightest ray.
- If you forget: the background builds its drawing again many times a second (it flickers and the phone gets hot), or it stays white or grey, or the whole screen is a flat wash of one colour instead of dark with rays, or the rays stay white while the session has a colour, or its colour is not the colour of the ball.
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_COLOUR = "#ffffff"`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = rayColor1={BG_COLOUR}`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = rayColor2={BG_COLOUR}`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const target = ballTargetColour(seconds, seed)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const t = Math.min(1, (now - startedAt) / BALL_BLEND_MS)`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <Tint target={target} />`
- Anchor: `AB:TIMER.BG @ src/timer.css = mix-blend-mode: multiply;`
- Anchor: `AB:TIMER.BG @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.BG @ src/timer.css = background: #000;`
- Anchor: `AB:TIMER.BG @ src/timer.css = z-index: 4;`
- Anchor: `AB:TIMER.BALL-LOOK @ src/lib/ballLook.ts = export const BALL_BLEND_MS = 4000`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_COLOUR).toBe("#ffffff")`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = describe("TimerBackground: the same colour as the glowing ball", () => {`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(block(".ab-timer-bg")).toContain("background: #000;")`
- Check by hand: start a session on the phone and on the laptop: rays of light come in from the top right corner on a black screen and the background starts white, and at 10, 30 and 90 minutes the rays move to the same colour as the glowing ball. The screen is dark with rays, not one flat colour. The background does not flicker when its colour moves.

### C38: The background needs WebGL 2 and is a library file, so it must never break the screen; it sits at the very bottom of the screen, and its fade time is written in the code and in the css
- Tags: `AB:TIMER.BG`, `AB:TIMER.BG-LOOK`, `AB:TIMER.SCREEN`, `AB:TIMER.TESTS`
- If you change: canDrawBackground or BackgroundGuard in TimerBackground.tsx, the library file SideRays.tsx (never edit it), BG_FADE_MS or the lite levels that draw the background in backgroundLook.ts, the fade time or the stacking rules of .ab-timer-bg, .ab-timer and .ab-timer-dial in timer.css, or the place of TimerBackground in TimerScreen.tsx
- Then also: the library animation draws with WebGL 2 (the graphics chip, through the browser). A browser that cannot do it, a lite level 2 page (the background is not drawn) or an error thrown by the library gives no background: canDrawBackground asks for a WebGL 2 context first and gives it back, and BackgroundGuard catches an error thrown while the animation is made, so the clocks, the ball and the buttons keep working. Both must stay. The settings of the animation are changed only by its props in TimerBackground.tsx and the values in backgroundLook.ts, never inside the library file (TAGGING_RULES.md, rule 6). A newer copy of the library file must be looked at on the laptop and on the phone before it is trusted: the tests use a stand-in, not the real animation. The layers: TimerBackground is the FIRST thing inside the main element of TimerScreen.tsx; .ab-timer-bg is position absolute over the whole screen with z-index 0, its own black and pointer-events none (the library box inside it has a z-index of its own, which counts only inside it, because .ab-timer-bg is a stacking box too); .ab-timer is position relative with isolation isolate, so the background can never fall behind the page, never covers the menu (the menu sits beside the main element with its own z-index) and never catches a tap; .ab-timer-dial has z-index 1 and the line, the Try again button and the buttons have z-index 1 (C31), so everything is drawn over the background. The library measures its box when it is made and again only when the window is resized, so the box must have its real size when the session starts (the screen has it); it also waits until its box is on the screen (an intersection observer) before it starts to draw. The fade in the css (700 ms) and BG_FADE_MS (700) are the same on purpose, because the code takes the background away when the fade ends; a test compares them.
- If you forget: a browser without WebGL 2 shows an error or a blank screen, the background covers the digits or the buttons, it catches taps, it is cut off while it fades, or the phone gets hot.
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = const gl = canvas.getContext("webgl2")`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = class BackgroundGuard extends Component<{ children: ReactNode }, { failed: boolean }> {`
- Anchor: `AB:TIMER.BG @ src/components/TimerBackground.tsx = <BackgroundGuard>`
- Anchor: `src/components/TimerBackground.tsx = import SideRays from "@/components/SideRays"`
- Anchor: `AB:TIMER.BG-LOOK @ src/lib/backgroundLook.ts = export const BG_FADE_MS = 700`
- Anchor: `AB:TIMER.BG @ src/timer.css = transition: opacity 700ms ease;`
- Anchor: `AB:TIMER.BG @ src/timer.css = pointer-events: none;`
- Anchor: `AB:TIMER.BG @ src/timer.css = z-index: 0;`
- Anchor: `AB:TIMER.SCREEN @ src/timer.css = isolation: isolate;`
- Anchor: `AB:TIMER.SCREEN @ src/components/TimerScreen.tsx = <TimerBackground`
- Anchor: `AB:TIMER.TESTS @ src/lib/backgroundLook.test.ts = expect(BG_FADE_MS).toBe(700)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerBackground.test.tsx = expect(fade).toBe(BG_FADE_MS)`
- Anchor: `AB:TIMER.TESTS @ src/components/TimerScreen.test.tsx = expect(stub.parentElement?.firstElementChild).toBe(stub)`
- Check by hand: on the phone open the page address #timer and start a session: the background fades in, the clocks stay readable, the buttons react to a finger everywhere, and the phone does not get hot after 10 minutes. In a browser without WebGL 2 the clocks and the buttons still work. With ?lite=2 in the page address the screen stays plain black.

```

**`PROGRESS.md`.** Find the line that starts with `- Packet 05D1:` (it must be found EXACTLY ONCE). KEEP it. Directly BELOW it add this one line:
```
- Packet 05E1: the moving background of the Pro Timer is now the React Bits Side Rays animation (rays of light from the top right corner; speed 2.9, tilt 13, intensity 2.8) instead of Meta Balls. The rays are drawn white by the library and the tint layer gives them the colour of the glowing ball at every moment, as before, so the colour of the background and of the ball is still always the same. The box of the background now has its own black, so only the rays are coloured. Pause dims it and End fades it out, as before. A browser without WebGL 2, and lite level 2, show no background and the timer still works. With automated tests.
```
If that line is not found exactly once: **STOP** and report.

## STEP 9: Check the checker, the build and the changed files
Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 26 tags, 46 places
CONNECTIONS OK: 40 connections, 230 anchors, 35 classes, 2 css variables, 2 label links
```
(The tags, places, connections, classes and css variables stay the same. 230 anchors: C37 has 14 anchors now instead of 11, so 3 more than the 227 before. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list exactly `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/components/TimerBackground.test.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerScreen.tsx`, `src/lib/backgroundLook.test.ts`, `src/lib/backgroundLook.ts` and `src/timer.css`, and it may also list the two files named in the rules (they had changes before this packet). `git status --short` must show `?? src/components/SideRays.tsx` (the new file is untracked until Step 10). If ANY other tracked file is listed (for example `package.json`, `package-lock.json` or `src/components/MetaBalls.tsx`): **STOP** and report the COMPLETE output. Do not commit.

## STEP 10: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/components/SideRays.tsx src/components/TimerBackground.tsx src/components/TimerBackground.test.tsx src/components/TimerScreen.tsx src/lib/backgroundLook.ts src/lib/backgroundLook.test.ts src/timer.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 05E1: moving background is Side Rays (speed 2.9, tilt 13, intensity 2.8) in the colour of the glowing ball"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git show --stat HEAD` and copy its exact output. Then run `git status --short` and copy its raw output. The two files named in the rules and untracked files may still show: leave them alone.

## STEP 11: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0, the files this packet changes had no uncommitted changes, `SideRays.tsx` did not exist, and the four fingerprints of Step 0 matched.
2. The five fingerprint lines of Step 6 matched exactly.
3. `npm test` printed `Test Files  10 passed (10)` and `Tests  555 passed (555)`, and `npx tsc -b` printed nothing.
4. `node scripts/check-tags.mjs` printed the two lines of Step 9 (40 connections, 230 anchors).
5. `npm run build` finished with no errors.
6. `git show --stat HEAD` lists exactly these 10 files: `src/components/SideRays.tsx`, `src/components/TimerBackground.tsx`, `src/components/TimerBackground.test.tsx`, `src/components/TimerScreen.tsx`, `src/lib/backgroundLook.ts`, `src/lib/backgroundLook.test.ts`, `src/timer.css`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`.
7. The first line of `git log --oneline` ends with `Packet 05E1: moving background is Side Rays (speed 2.9, tilt 13, intensity 2.8) in the colour of the glowing ball`.
8. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
9. `git push` finished without an error.
10. No file other than the ones named in this packet was created, edited or committed, and NO helper script or temp file was created at any time (also not one that was deleted afterwards). `MetaBalls.tsx` is still in the project.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 10 done-checks. If you had to create a helper file, say so and mark check 10 FAIL.
- the RAW outputs of the 5 commands of Step 0 (and the output of `git diff` of the file if Step 0 stopped), and the output of `node scripts/check-tags.mjs` of Step 0
- the exact five lines printed in Step 6
- the last 12 lines of the output of `npm test`, and the output of `npx tsc -b` (or the word EMPTY)
- the exact output of `node scripts/check-tags.mjs` from Step 9
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 9
- the RAW output of `git ls-files | Select-String -Pattern "\.env"`, the exact output of `git show --stat HEAD` and of `git status --short` from Step 10
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the result himself.

---

## HOW TO UNDO (not the agent's job)
The whole packet is one commit, so one `git revert <hash of the commit of Step 10>` in the planner chat brings back the Meta Balls background exactly as Packet 05D1 left it. (`MetaBalls.tsx` is still in the project, so nothing has to be installed again.)

## THE OWNER'S OWN LOOK (not the agent's job; after the push and the Vercel deploy)
The tests use a stand-in for the animation; they cannot see pixels. In the planner's test browser (real Chromium, software WebGL 2, the real Side Rays, the real glowing ball and the real colours) the Pro Timer was drawn on a laptop size (1440 x 900) and a phone size (390 x 720): white at the start, the blue palette at 41 minutes and the brightest palette (lime) at 16 minutes. The screen was dark with rays coming from the top right corner, the rays had the same colour as the ball, and the white digits and the buttons stayed easy to read. Look yourself, on the laptop AND on the phone:
1. Laptop: open `#timer` and press Start. The screen fades from black into rays of light that come in from the top right corner, white at first. The rays move slowly and the glowing ball is in front of them.
2. After 10, 30 and 90 minutes the rays (and the ball) move to the next colour of the session, together. (To see it sooner, ask the planner for a test page.)
3. The screen must be DARK with rays. If the whole screen is one flat colour, tell me: it means the black behind the rays is missing.
4. Press Pause: the background gets dimmer. Hold to end the session: it fades out to black.
5. Phone: the same as the laptop, with the rays from the top right corner. If the phone gets warm or the movement is not smooth, tell me (the rays draw at the full size of the screen also on a phone; one number in `backgroundLook.ts` can switch them off on phones).
6. The digits: if the rays are too bright or too dim for you, tell me. Two numbers in `backgroundLook.ts` (`intensity`, `speed`) and the dimming in `timer.css` (`opacity: 0.5` of `.ab-timer-bg`) are safe to change alone.
