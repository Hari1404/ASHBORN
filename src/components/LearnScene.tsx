import { useEffect, useRef } from "react"
import { prefersReducedMotion } from "@/lib/learnMotion"
import {
  NO_POINTER,
  STILL_TIME,
  createSceneState,
  drawScene,
  sceneFramePlan,
  sceneOpacity,
  type SceneId,
  type ScenePointer,
} from "@/lib/learnScenes"
import { LITE_LEVEL, type LiteLevel } from "@/lib/lite"
import "../learn.css"

// AB:LEARN.SCENE:START
// The moving picture behind the Learn screen: ONE canvas the size of its box (the window), drawn by drawScene (src/lib/learnScenes.ts says what each scene looks like; this file owns the canvas, the frame timer and the lite mode). See CONNECTIONS.md C75 and C76.
// How it is drawn comes from sceneFramePlan(lite, reduced): level 0 is the full size at 30 frames a second, level 1 half the size at 20 frames a second, level 2 and reduced motion one still picture (the scene at STILL_TIME). The canvas holds width x scale pixels and the context is set with setTransform(scale), so a scene is always drawn in the size of the box.
// A new scene, colour or lite level starts again: the old timer is cancelled and the canvas gets a clean state. A change of fraction only changes the brightness (the opacity, which the css fades), so the picture goes on. The size is measured again 120 ms after the last resize; a still picture is drawn again at the new size, a moving one simply carries on.
// Only the numpy scene follows the mouse (its dots swell near it), and only while it moves; a still picture does not listen. The place is counted from the corner of the canvas.
// A browser with no 2d canvas (or one that throws when asked) gets an empty canvas and no timer. The canvas is hidden from a screen reader.
export type LearnSceneProps = {
  scene: SceneId
  colour: string
  fraction?: number // how much of the subject is finished, 0 to 1: the more, the brighter
  lite?: LiteLevel // the lite level of the page when it is not given
}

export const SCENE_RESIZE_WAIT_MS = 120

export default function LearnScene({ scene, colour, fraction = 0, lite = LITE_LEVEL }: LearnSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    let size = { w: -1, h: -1 } // never equal to a real size, so the first measure always sets the canvas
    let state = createSceneState()
    let mouse: { x: number; y: number } | null = null
    let frame = 0
    let wait = 0
    let first: number | null = null
    let lastDrawn = -Infinity

    // The size of the box in css pixels. Giving the canvas a width or a height clears it and resets the context, so the transform is set after.
    const measure = (): boolean => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === size.w && h === size.h) return false
      size = { w, h }
      canvas.width = Math.max(1, Math.round(w * plan.scale))
      canvas.height = Math.max(1, Math.round(h * plan.scale))
      context.setTransform(plan.scale, 0, 0, plan.scale, 0, 0)
      state = createSceneState()
      return true
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
      paint(STILL_TIME)
    } else {
      const frameMs = plan.frameMs
      const onFrame = (now: number): void => {
        frame = window.requestAnimationFrame(onFrame)
        if (now - lastDrawn < frameMs) return
        lastDrawn = now
        if (first === null) first = now
        paint((now - first) / 1000)
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
