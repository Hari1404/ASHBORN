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

// The one minute rule: the sound plays at most once in SOUND_COOLDOWN_MS, counted from the moment it last STARTED to play (a sound that never played, for example because the browser did not allow it, does not count). The time is kept in the browser under SOUND_STAMP_KEY (localStorage), so a reload or another tab of the same browser counts too, and in a plain variable (for a browser that does not allow storage); if either of the two says "less than a minute ago", the sound is left out. Only the sound is left out: the picture is not changed.
export const SOUND_COOLDOWN_MS = 60_000
export const SOUND_STAMP_KEY = "ashborn.overviewSoundAt"
let lastStartedAt = 0

// The taps and keys that let a browser start a sound (a page that was opened with no tap yet is not allowed to make one).
const UNLOCK_EVENTS = ["pointerdown", "keydown", "touchend"] as const

type Playing = { context: AudioContext; gain: GainNode; source: AudioBufferSourceNode }

let context: AudioContext | null = null
let rendered: { rate: number; buffer: Promise<AudioBuffer> } | null = null
let removePrimed: (() => void) | null = null

// For the tests: forgets the audio context, the finished sound and the time the sound last started in this page (not the one kept in the browser), as at the first opening of the page.
export function forgetIntroSound(): void {
  removePrimed?.()
  removePrimed = null
  context = null
  rendered = null
  lastStartedAt = 0
}

// True when `at` (ms since 1970) is less than SOUND_COOLDOWN_MS ago. 0, a number that is not a number and a time in the future (the clock of the device was set back) count as "long ago", so a wrong value can never keep the sound away.
function isRecent(at: number): boolean {
  if (!Number.isFinite(at) || at <= 0) return false
  const passed = Date.now() - at
  return passed >= 0 && passed < SOUND_COOLDOWN_MS
}

// The time kept in the browser, or 0 when there is none or the browser does not allow storage.
function storedStart(): number {
  try {
    const raw = window.localStorage.getItem(SOUND_STAMP_KEY)
    return raw === null ? 0 : Number(raw)
  } catch {
    return 0
  }
}

function coolingDown(): boolean {
  return isRecent(storedStart()) || isRecent(lastStartedAt)
}

// Called at the moment the sound really starts to play, never before.
function markStarted(): void {
  lastStartedAt = Date.now()
  try {
    window.localStorage.setItem(SOUND_STAMP_KEY, String(lastStartedAt))
  } catch {
    // The browser does not allow storage (a private window, blocked site data). The plain variable is all there is then.
  }
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

// Gets the sound ready BEFORE the Overview opens, so that it can start together with the first picture and not a moment later: the audio context is made, the sound is drawn (that takes a moment, and it must not be done while the picture is already running), and while the browser does not allow a sound yet, the first tap or key anywhere on the page (the tap on the sign-in button, for example) wakes the context up. It is called once, when this file is loaded (the last line of this tag). A person who asked for less motion and a browser with no audio get nothing.
export function prepareIntroSound(): void {
  if (typeof window === "undefined") return
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return
  const made = getContext()
  if (!made) return
  const audio: AudioContext = made
  soundFor(audio.sampleRate).catch(() => {})
  if (audio.state === "running" || removePrimed) return
  function stopWaiting() {
    for (const type of UNLOCK_EVENTS) window.removeEventListener(type, wake, { capture: true })
    if (removePrimed === stopWaiting) removePrimed = null
  }
  // Inside the tap itself (Safari wants that). It keeps waiting until the context really runs: a tap that does not unlock the browser is not the last one.
  function wake() {
    audio
      .resume()
      .then(() => {
        if (audio.state === "running") stopWaiting()
      })
      .catch(() => {})
  }
  for (const type of UNLOCK_EVENTS) window.addEventListener(type, wake, { capture: true })
  removePrimed = stopWaiting
}

// Starts the sound of the intro and gives back the function that stops it (a fast fade, 50 ms). The screen calls it when the Overview opens and calls the returned function when the Overview goes away.
// The sound is played IN STEP WITH THE PICTURE: it starts at the place of the sound that the picture has reached by now (at the very start when everything is ready, which prepareIntroSound takes care of). It is never played late from its start: if the browser does not allow a sound yet (no tap or key on this page since it was opened, for example after a reload on a signed-in page), the sound waits for the first tap or key while the Overview is still open, and then joins at the place the picture has reached, or is left out when the sound is already over by then. A person who asked for less motion gets no sound (the picture has no intro then either). A browser with no audio gets nothing, and nothing can break the screen.
// The one minute rule (see SOUND_COOLDOWN_MS) is checked first, before anything is made or drawn, and once more at the moment of playing (another tab may have started its sound while this one was waiting); the time is written down only when the sound really starts.
export function startIntroSound(): () => void {
  if (typeof window === "undefined") return () => {}
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {}
  if (coolingDown()) return () => {}
  const openedAt = performance.now()
  let stopped = false
  let playing: Playing | null = null
  let removeUnlock: (() => void) | null = null

  const playInStep = (ctx: AudioContext, buffer: AudioBuffer) => {
    if (stopped || coolingDown()) return
    const started = play(ctx, buffer, (performance.now() - openedAt) / 1000)
    if (!started) return
    playing = started
    markStarted()
  }

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
      playInStep(ctx, buffer)
      return
    }
    const unlock = () => {
      removeUnlock?.()
      removeUnlock = null
      ctx
        .resume()
        .then(() => {
          if (ctx.state !== "running") return
          playInStep(ctx, buffer)
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

prepareIntroSound()
// AB:OVERVIEW.SOUND:END
