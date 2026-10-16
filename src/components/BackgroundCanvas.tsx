import { useEffect, useRef, type CSSProperties } from "react"
import {
  FIELD_FRAGMENT,
  FIELD_UNIFORM_NAMES,
  FIELD_VERTEX,
  RAMP_SIZE,
  canvasPixels,
  fieldUniforms,
  flowAfter,
  rampBytes,
} from "@/lib/backgroundRender"

// AB:TIMER.BG-CANVAS:START
// The canvas of the moving background of the Pro Timer: a slowly flowing gradient with a little still grain, drawn from a ramp of colours (its `colors`). It is our own component, not a library file; the picture and the numbers behind it are in src/lib/backgroundRender.ts (see CONNECTIONS.md C52).
// It makes its OWN canvas inside its effect and takes it away again when the effect is cleaned up. This matters: in development React mounts every component, takes it away at once and mounts it again (StrictMode, src/main.tsx), and a canvas whose graphics context was given back cannot get a new one. A canvas made in JSX would come back dead the second time, and the background would stay empty. Here the second mount makes a new canvas with a new context. The old context is given back when its canvas is thrown away.
// The colours are read in plain code, never by drawing them on a hidden canvas and reading the pixels back (readColour in backgroundRender.ts).
// The colours (`colors`) and the settings can be given again at any moment, many times a second while a colour step moves: the programs for the graphics chip are made once, and only the row of 256 colours is sent again, when the colours really changed. The graphics context is made once for as long as the component lives, and if the browser takes it away (webglcontextlost) the canvas draws again as soon as the browser gives it back.
// The flow goes on while speed is above 0 and the page is visible, one picture for every frame of the screen. With speed 0 (a person who asked for less motion) it draws one still picture, and again when the colours or the size change. frozenAt stands the flow still at that many seconds; it is for the pixel checks, the Pro Timer never gives it.
// It draws one canvas pixel for every pixel of the screen times dpr (without dpr: the pixel ratio of the screen, at most 1.5). It does not listen to the cursor, a click or a touch.
// The settings of the animation come from BG_SETTINGS (src/lib/backgroundLook.ts) and are all given; only dpr, shade and frozenAt can be left out.
export type BackgroundCanvasProps = {
  colors: readonly string[]
  angle: number
  speed: number
  flow: number
  scale: number
  softness: number
  silk: number
  grainAmount: number
  grainSize: number
  dpr?: number
  shade?: number
  frozenAt?: number
}

type Pipeline = {
  program: WebGLProgram
  texture: WebGLTexture
  uniforms: Record<(typeof FIELD_UNIFORM_NAMES)[number], WebGLUniformLocation | null>
}

const HOST_STYLE: CSSProperties = { position: "relative", width: "100%", height: "100%", overflow: "hidden" }
const CANVAS_STYLE = "position:absolute;inset:0;display:block;width:100%;height:100%"

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (shader === null) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

// The program and the texture of the ramp. Null when the browser cannot make them.
function createPipeline(gl: WebGL2RenderingContext): Pipeline | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, FIELD_VERTEX)
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FIELD_FRAGMENT)
  const program = gl.createProgram()
  const texture = gl.createTexture()
  if (vertex === null || fragment === null || program === null || texture === null) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    gl.deleteTexture(texture)
    return null
  }
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, RAMP_SIZE, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const uniforms = {} as Pipeline["uniforms"]
  for (const name of FIELD_UNIFORM_NAMES) uniforms[name] = gl.getUniformLocation(program, name)
  return { program, texture, uniforms }
}

export default function BackgroundCanvas(props: BackgroundCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const latest = useRef(props)
  const wake = useRef<(() => void) | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (host === null) return undefined
    // The canvas is made here and not in the markup (see the note at the top).
    const canvas = document.createElement("canvas")
    canvas.setAttribute("aria-hidden", "true")
    canvas.style.cssText = CANVAS_STYLE
    let context: WebGL2RenderingContext | null = null
    try {
      context = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false, stencil: false })
    } catch {
      context = null
    }
    if (context === null) return undefined
    const gl = context
    let pipeline = createPipeline(gl)
    if (pipeline === null) {
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      return undefined
    }
    host.appendChild(canvas)

    let disposed = false
    let lost = false
    let raf = 0
    let last = 0
    let phase = 0
    let ratio = 1
    let rampKey = ""
    let drawn = false

    const draw = () => {
      if (pipeline === null || gl.isContextLost()) return
      const s = latest.current
      const u = fieldUniforms(
        { angle: s.angle, flow: s.flow, scale: s.scale, silk: s.silk, grainAmount: s.grainAmount, grainSize: s.grainSize, shade: s.shade ?? 0 },
        ratio,
      )
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(pipeline.program)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, pipeline.texture)
      const key = s.colors.join(",") + "|" + s.softness
      if (key !== rampKey) {
        rampKey = key
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, RAMP_SIZE, 1, gl.RGBA, gl.UNSIGNED_BYTE, rampBytes(s.colors, s.softness))
      }
      const at = pipeline.uniforms
      gl.uniform1i(at.uRamp, 0)
      gl.uniform2f(at.uRes, canvas.width, canvas.height)
      gl.uniform1f(at.uPhase, s.frozenAt ?? phase)
      gl.uniform1f(at.uZoom, u.zoom)
      gl.uniform1f(at.uFlow, u.flow)
      gl.uniform2f(at.uDir, u.dir[0], u.dir[1])
      gl.uniform1f(at.uSilk, u.silk)
      gl.uniform2f(at.uGrain, u.grain[0], u.grain[1])
      gl.uniform1f(at.uShade, u.shade)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      drawn = true
    }

    const frame = (now: number) => {
      raf = 0
      if (disposed || lost || document.hidden) return
      const s = latest.current
      if (last !== 0) phase = flowAfter(phase, now - last, s.speed)
      last = now
      draw()
      if (s.frozenAt === undefined && s.speed > 0) raf = requestAnimationFrame(frame)
      else last = 0
    }

    const wakeUp = () => {
      if (raf === 0 && !disposed && !lost && !document.hidden) raf = requestAnimationFrame(frame)
    }

    const resize = () => {
      const box = host.getBoundingClientRect()
      ratio = latest.current.dpr ?? Math.min(window.devicePixelRatio || 1, 1.5)
      const [width, height] = canvasPixels(box.width, box.height, ratio)
      const changed = canvas.width !== width || canvas.height !== height
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      // Setting the width or the height empties the canvas, and the browser paints right after the resize observers have run, before the next frame: without a picture drawn here, that paint is an empty (black) picture, once for every size step. The first picture of a canvas still waits for the first frame.
      if (changed && drawn) draw()
      wakeUp()
    }

    const onVisibility = () => {
      last = 0
      wakeUp()
    }
    const onLost = (event: Event) => {
      event.preventDefault()
      lost = true
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onRestored = () => {
      lost = false
      rampKey = ""
      last = 0
      pipeline = createPipeline(gl)
      resize()
    }

    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)
    document.addEventListener("visibilitychange", onVisibility)
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null
    if (observer === null) window.addEventListener("resize", resize)
    else observer.observe(host)
    wake.current = wakeUp
    resize()

    return () => {
      disposed = true
      wake.current = null
      cancelAnimationFrame(raf)
      observer?.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      if (pipeline !== null && !gl.isContextLost()) {
        gl.deleteProgram(pipeline.program)
        gl.deleteTexture(pipeline.texture)
      }
      // This canvas is thrown away now, so its context can be given back safely (see the note at the top).
      gl.getExtension("WEBGL_lose_context")?.loseContext()
      canvas.remove()
    }
  }, [])

  // After every render: the loop reads the newest colours and settings, and a still picture (speed 0) is drawn again.
  useEffect(() => {
    latest.current = props
    wake.current?.()
  })

  return <div ref={hostRef} style={HOST_STYLE} />
}
// AB:TIMER.BG-CANVAS:END
