import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/lib/learnMotion"
import {
  NO_POINTER,
  STILL_TIME,
  createSceneState,
  drawScene,
  framesPerPicture,
  refreshPeriod,
  sceneFramePlan,
  sceneOpacity,
  type SceneId,
  type ScenePointer,
} from "@/lib/learnScenes"
import { LITE_LEVEL, type LiteLevel } from "@/lib/lite"
import "../learn.css"

// AB:LEARN.SCENE:START
// The moving picture behind the Learn screen: ONE canvas the size of its box (the window), drawn by drawScene (src/lib/learnScenes.ts says what each scene looks like; this file owns the canvas, the frame timer and the lite mode). See CONNECTIONS.md C75 and C76.
// How it is drawn comes from sceneFramePlan(lite, reduced): level 0 is the full size at 30 pictures a second, level 1 half the size at 20 pictures a second, level 2 and reduced motion one still picture (the scene at STILL_TIME). The canvas holds width x scale pixels and the context is set with setTransform(scale), so a scene is always drawn in the size of the box.
// The pace is COUNTED in frames of the screen, not measured in milliseconds: one picture is drawn on every n-th frame (framesPerPicture in learnScenes.ts, with the frame time of the screen taken from the gaps seen lately by refreshPeriod). A 60 Hz screen gets every 2nd frame at level 0 and every 3rd at level 1, so the gap between two pictures is always the same. The old rule, "draw when 50 ms have passed", drew by turns after 50 and after 67 ms on a phone.
// A new scene or colour starts again, but the canvas keeps its bitmap: the size and the scale it was set for are remembered across the restarts (giving a canvas a width or a height reallocates and clears it, which a change of scene does not need), the old picture stays until the first picture of the new scene, and then the canvas is wiped once just before that picture is drawn. A new lite level changes the scale, so it does give the canvas a new size. A change of fraction only changes the brightness (the opacity, which the css fades), so the picture goes on. The size is measured again 120 ms after the last resize; a still picture is drawn again at the new size, a moving one simply carries on.
// Only the numpy scene follows the mouse (its dots swell near it), and only while it moves; a still picture does not listen. The place is counted from the corner of the canvas.
// A browser with no 2d canvas (or one that throws when asked) gets an empty canvas and no timer. The canvas is hidden from a screen reader.
export type LearnSceneProps = {
  scene: SceneId
  colour: string
  fraction?: number // how much of the subject is finished, 0 to 1: the more, the brighter
  lite?: LiteLevel // the lite level of the page when it is not given
}

export const SCENE_RESIZE_WAIT_MS = 120
// How many of the latest gaps between two frames of the screen are kept to find the frame time of the screen (the middle one counts, so one late frame changes nothing).
export const SCENE_REFRESH_WINDOW = 12

// What belongs to the canvas and not to one scene, so a new scene does not lose it: the size in css pixels and the scale the canvas was last set for (w -1 = never set), and the frames of the screen seen lately.
type Kept = { w: number; h: number; scale: number; gaps: number[]; lastFrame: number | null }

export default function LearnScene({ scene, colour, fraction = 0, lite = LITE_LEVEL }: LearnSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keptRef = useRef<Kept>({ w: -1, h: -1, scale: -1, gaps: [], lastFrame: null })

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return undefined
    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext("2d", { desynchronized: true })
    } catch {
      ctx = null
    }
    if (ctx === null) return undefined
    const context = ctx
    const plan = sceneFramePlan(lite, prefersReducedMotion())
    const kept = keptRef.current

    let size = { w: Math.max(0, kept.w), h: Math.max(0, kept.h) }
    let state = createSceneState()
    let mouse: { x: number; y: number } | null = null
    let frame = 0
    let wait = 0
    let first: number | null = null
    let skip = 0 // frames of the screen still to pass before the next picture

    // The size of the box in css pixels. Giving the canvas a width or a height clears it and resets the context, so it is only done when the size or the scale really changed (never for a new scene), and the transform is set after.
    const measure = (): boolean => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === kept.w && h === kept.h && plan.scale === kept.scale) return false
      kept.w = w
      kept.h = h
      kept.scale = plan.scale
      size = { w, h }
      canvas.width = Math.max(1, Math.round(w * plan.scale))
      canvas.height = Math.max(1, Math.round(h * plan.scale))
      context.setTransform(plan.scale, 0, 0, plan.scale, 0, 0)
      state = createSceneState()
      return true
    }

    // The canvas of the scene before this one is still on it: it is wiped, and the settings of the old scene are put back to the plain ones, just before the first picture.
    const wipe = (): void => {
      context.globalAlpha = 1
      context.globalCompositeOperation = "source-over"
      context.clearRect(0, 0, size.w, size.h)
    }

    const pointer = (): ScenePointer => {
      if (mouse === null) return NO_POINTER
      const box = canvas.getBoundingClientRect()
      return { x: mouse.x - box.left, y: mouse.y - box.top }
    }

    const paint = (seconds: number): void => {
      drawScene(scene, context, state, seconds, size, colour, scene === "numpy" ? pointer() : NO_POINTER)
    }

    const onMouse = (event: PointerEvent): void => {
      mouse = { x: event.clientX, y: event.clientY }
    }

    const onResize = (): void => {
      window.clearTimeout(wait)
      wait = window.setTimeout(() => {
        if (measure() && plan.frameMs === null) paint(STILL_TIME)
      }, SCENE_RESIZE_WAIT_MS)
    }

    measure()
    window.addEventListener("resize", onResize)
    if (plan.frameMs === null) {
      wipe()
      paint(STILL_TIME)
    } else {
      const frameMs = plan.frameMs
      const onFrame = (now: number): void => {
        frame = window.requestAnimationFrame(onFrame)
        if (kept.lastFrame !== null) {
          kept.gaps.push(now - kept.lastFrame)
          if (kept.gaps.length > SCENE_REFRESH_WINDOW) kept.gaps.shift()
        }
        kept.lastFrame = now
        if (skip > 0) {
          skip -= 1
          return
        }
        if (first === null) {
          first = now
          wipe()
        }
        paint((now - first) / 1000)
        skip = framesPerPicture(frameMs, refreshPeriod(kept.gaps)) - 1
      }
      frame = window.requestAnimationFrame(onFrame)
      if (scene === "numpy") window.addEventListener("pointermove", onMouse, { passive: true })
    }

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(wait)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onMouse)
    }
  }, [scene, colour, lite])

  return <canvas ref={canvasRef} className="ab-learn-scene" style={{ opacity: sceneOpacity(fraction) }} aria-hidden="true" />
}
// AB:LEARN.SCENE:END
