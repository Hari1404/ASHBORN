import { renderSound, type Recipe } from "@/lib/react-bits-sound"

// AB:OVERVIEW.SOUND:START
// The sound of the intro of the Overview background: the sound "reveal" of the React Bits Sound Lab (a soft swell into a warm chord). The recipe is copied as the owner pasted it from the Sound Lab. The engine that draws a recipe into a sound is the library file src/lib/react-bits-sound.ts (never edited). See CONNECTIONS.md C59.
// The whole sound is 3.4 seconds long (about 4.6 with the tail of its reverb). It starts with the intro of the picture (2 seconds, OVERVIEW_INTRO_SECONDS in overviewLook.ts) and is NOT cut when the picture is finished: it rings out to its natural end, so the swell grows with the picture, the chord comes 1.12 seconds into it and the rest fades away by itself.
export const REVEAL: Recipe = {
  duration: 3.4,
  seed: 142,
  loudness: -15,
  lowpass: 8500,
  highpass: 30,
  drive: 0.08,
  width: 0.8,
  reverb: { mix: 0.3, decay: 2.6, predelay: 0.02, damp: 5000 },
  layers: [
    {
      type: "noise",
      color: "pink",
      filter: { type: "lowpass", freq: { from: 400, to: 3800, time: 1.1, curve: 0.7 }, q: 0.6 },
      env: { attack: 1.1, rise: 2.1, decay: 0.12, curve: 3 },
    },
    {
      type: "tone",
      at: 1.12,
      freq: { from: 96, to: 58, time: 0.5, curve: 3 },
      gain: -6,
      env: { attack: 0.006, decay: 1.2, curve: 5 },
    },
    {
      type: "tone",
      freq: 293.66,
      at: 1.12,
      gain: -4,
      partials: [
        [1, 1, 1],
        [2, 0.08, 0.55],
        [3, 0.02, 0.35],
      ],
      env: { attack: 0.004, decay: 2.05, curve: 6 },
    },
    {
      type: "tone",
      freq: 440,
      at: 1.132,
      gain: -5.5,
      partials: [
        [1, 1, 1],
        [2, 0.08, 0.55],
        [3, 0.02, 0.35],
      ],
      env: { attack: 0.004, decay: 2.1, curve: 6 },
    },
    {
      type: "tone",
      freq: 587.33,
      at: 1.144,
      gain: -7,
      partials: [
        [1, 1, 1],
        [2, 0.08, 0.55],
        [3, 0.02, 0.35],
      ],
      env: { attack: 0.004, decay: 2.15, curve: 6 },
    },
    {
      type: "tone",
      freq: 739.99,
      at: 1.156,
      gain: -8.5,
      partials: [
        [1, 1, 1],
        [2, 0.08, 0.55],
        [3, 0.02, 0.35],
      ],
      env: { attack: 0.004, decay: 2.2, curve: 6 },
    },
  ],
}

// How loud the sound is played, 0 to 1 (1 = the level the Sound Lab gives it).
export const SOUND_VOLUME = 1

// The taps and keys that let a browser start a sound (a page that was opened with no tap yet is not allowed to make one).
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchend"] as const

type Playing = { context: AudioContext; gain: GainNode; source: AudioBufferSourceNode }

let context: AudioContext | null = null
let rendered: { rate: number; buffer: Promise<AudioBuffer> } | null = null

// For the tests: forgets the audio context and the finished sound, as at the first opening of the page.
export function forgetIntroSound(): void {
  context = null
  rendered = null
}

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (context) return context
  const Made = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Made) return null
  try {
    context = new Made({ latencyHint: "interactive" })
  } catch {
    return null
  }
  return context
}

// The sound is drawn once for the whole page and kept (at the rate of the audio context).
function soundFor(rate: number): Promise<AudioBuffer> {
  if (!rendered || rendered.rate !== rate) {
    const buffer = renderSound(REVEAL, {}, { sampleRate: rate })
    rendered = { rate, buffer }
    buffer.catch(() => {
      if (rendered?.buffer === buffer) rendered = null
    })
  }
  return rendered.buffer
}

// Plays all of the sound from `offset` seconds into it, so that it stays in step with the picture, and lets it ring out to its natural end (nothing cuts it). Gives nothing back when almost nothing is left of it.
function play(context: AudioContext, buffer: AudioBuffer, offset: number): Playing | null {
  const left = buffer.duration - offset
  if (!(left > 0.05)) return null
  const start = context.currentTime + 0.005
  const gain = context.createGain()
  gain.gain.setValueAtTime(SOUND_VOLUME, start)
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(gain)
  gain.connect(context.destination)
  source.start(start, Math.max(0, offset))
  return { context, gain, source }
}

// Starts the sound of the intro and gives back the function that stops it (a fast fade, 50 ms). The screen calls it when the Overview opens and calls the returned function when the Overview goes away.
// If the browser does not allow a sound yet (no tap or key on this page since it was opened, for example after a reload on a signed-in page), the sound waits for the first tap or key while the Overview is still open and then plays from its start (all of it). A person who asked for less motion gets no sound (the picture has no intro then either). A browser with no audio gets nothing, and nothing can break the screen.
export function startIntroSound(): () => void {
  if (typeof window === "undefined") return () => {}
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {}
  const openedAt = performance.now()
  let stopped = false
  let playing: Playing | null = null
  let removeUnlock: (() => void) | null = null

  const begin = async () => {
    const ctx = getContext()
    if (!ctx) return
    ctx.resume().catch(() => {})
    let buffer: AudioBuffer
    try {
      buffer = await soundFor(ctx.sampleRate)
    } catch {
      return
    }
    if (stopped) return
    if (ctx.state === "running") {
      playing = play(ctx, buffer, (performance.now() - openedAt) / 1000)
      return
    }
    const unlock = () => {
      removeUnlock?.()
      removeUnlock = null
      ctx
        .resume()
        .then(() => {
          if (stopped || ctx.state !== "running") return
          playing = play(ctx, buffer, 0)
        })
        .catch(() => {})
    }
    for (const type of UNLOCK_EVENTS) window.addEventListener(type, unlock, { capture: true })
    removeUnlock = () => {
      for (const type of UNLOCK_EVENTS) window.removeEventListener(type, unlock, { capture: true })
    }
  }
  begin().catch(() => {})

  return () => {
    stopped = true
    removeUnlock?.()
    removeUnlock = null
    const current = playing
    playing = null
    if (!current) return
    try {
      const now = current.context.currentTime
      current.gain.gain.cancelScheduledValues(now)
      current.gain.gain.setValueAtTime(current.gain.gain.value, now)
      current.gain.gain.linearRampToValueAtTime(0, now + 0.05)
      current.source.stop(now + 0.06)
    } catch {
      // A sound that has already ended cannot be stopped again. Nothing to do.
    }
  }
}
// AB:OVERVIEW.SOUND:END
