import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react"
import { createPortal } from "react-dom"
import LaserFlow from "@/components/LaserFlow"
import { LITE_LEVEL } from "@/lib/lite"
import { conditionFromMinutes, dayPaletteOf, type OverviewCondition } from "@/lib/overviewCondition"
import { buildDayView, dayLegendFor, weekDaysUpTo, type DayLegendItem, type DayView, type WeekDay } from "@/lib/overviewDay"
import { timerDayScore, timerDaySessions } from "@/lib/timerApi"
import "../dayview.css"

// AB:OVERVIEW.DAYVIEW:START
// "The whole day": the full black screen that opens from the glass button of "Today in Pro Timer" (OverviewHud.tsx, CONNECTIONS.md C63). The screen goes black, the Laser Flow beam (library file src/components/LaserFlow.tsx, never edited) falls from the top and lands on the top edge of an empty box (ab-day-landing) that stands where the day starts, and in that light the day appears, laid out as in day-view.html: the weekday, one sentence, the timeline of the sessions (one pill per session, the colour is its quality), the tag bar and the four colours.
// This file is loaded only when the button is used or when the pointer or the focus comes near it (the shader and the font do not weigh on the first picture of the Overview). Everything the screen shows comes from src/lib/overviewDay.ts (the day model, C62); the day and the time zone are given by the button, so the sentence, the pills and the panel of the Overview are of the same day.
// It asks the database for the day score and the sessions of the day when it opens, and again when "Try again" is used.
// THE WEEK (Week view): above the weekday there is a row of the days of this week, Monday to today (weekDaysUpTo of the day model, C62; today is the day the button gave). A tap on a day shows that day's sentence, pills and tag bar. Nothing is built again for it: the beam, the black screen and the sheet stay where they are and the reveal does not play a second time, only the content changes and the colour goes to the colours of that day. Each day has the colours of its own condition (conditionFromMinutes of its credited minutes, C64); today keeps the condition the button gave, so the screen matches the Overview behind it. While another day is read the day that is shown stays, a little dimmer, until the new one arrives. The database is asked for the chosen day only (the same two readings as for today). A phone (lite level 1) draws the beam at a pixel ratio of 1; at lite level 2 the beam falls once and then stands still (src/lib/lite.ts).
// THE TIME AXIS (Day screen idea 2): the timeline is zoomed to the window of the day by default (from an hour before the first session to an hour after the last one, in whole steps of 3 hours, at least 6 hours, never wider than the full axis; zoomedDayAxis of the day model, C62), because the full axis of 06 to 24 leaves most of the line empty and the pills thin. A small \"Full day\" button under the hour marks (ab-day-full, only for a day where the zoom is shorter than the full axis) switches to the full axis and back; the choice stays when another day is chosen. Both axes are laid out when the day is read, so the switch asks the database for nothing and plays no opening.
// While it is open: the page behind it does not scroll and takes no tap or focus (the element root is inert), Escape and the Close button close it, Tab stays inside it, the moving background of the Overview is hidden (so it stops drawing, see dayview.css) and the focus goes back to the button that opened it.
type Props = { day: string; zone: string; condition?: OverviewCondition; onClose: () => void }
// A day that has been read: its text, the condition whose colours it is drawn in, and everything the screen draws for it.
type Loaded = { day: string; condition: OverviewCondition; views: { zoom: DayView; full: DayView } }

// The beam. beamPosition 0.5 is the middle of the screen. The COLOUR is not here: it is the beam colour of the condition (palette.beam of overviewCondition.ts, so the laser goes with the background of the same condition). The intensity is lower than the library default (1.8): at the default a bright colour burns out to white, at 0.7 it stays its colour with a white hot core. The spread is the library default (1.5): the owner looked at the shorter spread of day-view.html and chose the default. The mouse does not move the light (day-view.html has no such thing). Every other setting stays at the library default.
const BEAM = { beamPosition: 0.5, intensity: 0.7, spread: 1.5, mouseInteraction: false }

// The timing, in milliseconds after the screen opens: the screen fades to black, a moment of pure black, then the beam starts to fall (the library has its own fall of about a second), then the light has landed (the library's beam reaches the line about 0.8 seconds after it starts) and the day comes in (the pieces come one after the other, their delays are in dayview.css). The fade is the same one in and out.
const FADE_MS = 350
const BLACK_MS = 300
const LAND_MS = 1250
const REVEAL_DELAY_MS = 40
// The labels of the pills: the space kept between two labels in a row, the most rows there can be, and the space kept between a label and the edge of the screen.
const LABEL_GAP_PX = 8
const LABEL_ROWS = 4
const LABEL_EDGE_PX = 8

function motionIsReduced(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
}

// The place of a piece in the order of the coming in (the number --i of dayview.css).
function step(i: number): CSSProperties {
  return { "--i": i } as CSSProperties
}

// The labels of the pills sit in the first row under the line. Two pills that are close together would have their labels on top of each other (day-view.html shows a day where they are far apart), so a label that would touch the one before it goes to the next row, a little lower, up to four rows (a very full day on a phone). Only the height changes, never the place along the line, except that a label is pushed inwards when it would be cut by the edge of the screen. The row is written as data-lane (0 to 3) on the label, and the number of rows as data-lanes on the track (dayview.css makes the track taller for three or four rows). A label that has no size (a screen that is not laid out) stays in row 0.
function placeLabels(track: HTMLElement): void {
  const edges: number[] = []
  const room = window.innerWidth - LABEL_EDGE_PX
  for (const label of track.querySelectorAll<HTMLElement>(".ab-day-blab")) {
    label.style.translate = ""
    const rect = label.getBoundingClientRect()
    if (rect.width === 0) {
      label.dataset.lane = "0"
      continue
    }
    let shift = 0
    if (rect.left < LABEL_EDGE_PX) shift = LABEL_EDGE_PX - rect.left
    else if (rect.right > room) shift = room - rect.right
    let lane = edges.findIndex((edge) => rect.left + shift >= edge + LABEL_GAP_PX)
    if (lane === -1) lane = edges.length < LABEL_ROWS ? edges.length : edges.indexOf(Math.min(...edges))
    edges[lane] = rect.right + shift
    label.dataset.lane = String(lane)
    if (shift !== 0) label.style.translate = shift + "px"
  }
  track.dataset.lanes = String(Math.max(2, edges.length))
}

// The days of this week for the row. A day text that is not a day gives no row (the reading then gives the error, as before).
function weekOf(day: string): WeekDay[] {
  try {
    return weekDaysUpTo(day)
  } catch {
    return []
  }
}

export default function OverviewDayView({ day, zone, condition = "unknown", onClose }: Props) {
  const [reduce] = useState(motionIsReduced)
  const [on, setOn] = useState(reduce)
  const [beam, setBeam] = useState(reduce)
  const [lit, setLit] = useState(reduce)
  const [shown, setShown] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [selected, setSelected] = useState(day)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  // The zoomed axis is the default; true shows the full day (06 to 24). It belongs to the screen, not to a day, so it stays when another day is chosen.
  const [fullDay, setFullDay] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)
  const landingRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // The colours are those of the day that is shown; before any day is shown they are those of the condition the button gave. They stay while the next day is read and change when it arrives.
  const shownCondition = loaded?.condition ?? condition
  const palette = dayPaletteOf(shownCondition)
  const week = weekOf(day)

  const close = useCallback(() => setLeaving(true), [])

  // The way in: the fade, the pure black, the beam, the landing of the light. With reduced motion everything is there from the first picture (the library also shows the beam already landed).
  useEffect(() => {
    if (reduce) return
    const timers = [
      window.setTimeout(() => setOn(true), 20),
      window.setTimeout(() => setBeam(true), BLACK_MS),
      window.setTimeout(() => setLit(true), LAND_MS),
    ]
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [reduce])

  // The way out: the fade, then the button is told to take the screen away.
  useEffect(() => {
    if (!leaving) return
    const id = window.setTimeout(onClose, reduce ? 0 : FADE_MS)
    return () => window.clearTimeout(id)
  }, [leaving, onClose, reduce])

  // The page behind: no scrolling, no taps, no focus, and the focus goes to the Close button and back to where it was. This is a layout effect on purpose: its cleanup runs in the same moment as the removal of the screen, so the page is never left locked behind a screen that is already gone (the cleanup of a normal effect comes later, after the picture, and on a slow machine that is seconds later).
  useLayoutEffect(() => {
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const body = document.body
    const overflow = body.style.overflow
    body.style.overflow = "hidden"
    const app = document.getElementById("root")
    app?.setAttribute("inert", "")
    closeRef.current?.focus({ preventScroll: true })
    return () => {
      body.style.overflow = overflow
      app?.removeAttribute("inert")
      if (before?.isConnected) before.focus({ preventScroll: true })
    }
  }, [])

  // The moving background of the Overview is hidden while the screen is open (a hidden box stops its drawing) and comes back at the start of the fade out, so it is there again when the screen is gone.
  useEffect(() => {
    if (leaving) return
    document.documentElement.setAttribute("data-ab-day-open", "")
    return () => document.documentElement.removeAttribute("data-ab-day-open")
  }, [leaving])

  // Escape closes, and Tab goes round inside the screen (there are only buttons in it).
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault()
        close()
        return
      }
      if (event.key !== "Tab") return
      const root = rootRef.current
      const buttons = root === null ? [] : [...root.querySelectorAll<HTMLElement>("button:not(:disabled)")]
      if (root === null || buttons.length === 0) return
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      const active = document.activeElement
      const inside = active !== null && root.contains(active)
      if (event.shiftKey && (!inside || active === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [close])

  // The score and the sessions of the chosen day are read together, so the sentence and the pills are of the same moment. A reading that fails, or a day that cannot be laid out (a time zone the browser does not know), gives the error. A reading that comes after another day was chosen is ignored. Today is drawn in the condition the button gave; any other day in the condition of its own credited minutes.
  useEffect(() => {
    let alive = true
    Promise.all([timerDayScore(selected), timerDaySessions(selected)])
      .then(([score, sessions]) => {
        if (!alive) return
        const dayCondition = selected === day ? condition : conditionFromMinutes(score.creditedMinutes)
        const base = { day: selected, sessions, score, deviceZone: zone, qualityColors: dayPaletteOf(dayCondition).qualities }
        const views = { zoom: buildDayView({ ...base, axisMode: "zoom" }), full: buildDayView({ ...base, axisMode: "full" }) }
        setLoaded({ day: selected, condition: dayCondition, views })
      })
      .catch(() => {
        if (alive) setFailed(true)
      })
    return () => {
      alive = false
    }
  }, [selected, day, zone, attempt, condition])

  function pick(next: string): void {
    if (next === selected) return
    setSelected(next)
    setFailed(false)
  }

  function retry(): void {
    setFailed(false)
    setAttempt((n) => n + 1)
  }

  // The day comes in when the light has landed AND the day is read, whichever is later.
  const ready = loaded !== null
  useEffect(() => {
    if (!lit || !ready) return
    const id = window.setTimeout(() => setShown(true), reduce ? 0 : REVEAL_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [lit, ready, reduce])

  // Where the browser cannot make a WebGL 2 picture the library draws nothing, and a plain line with a plain beam (dayview.css) takes its place. The library has already asked for the context of its canvas, so asking again gives the same one (or nothing).
  useEffect(() => {
    const box = beamRef.current
    const canvas = box?.querySelector("canvas")
    if (!box || !canvas) return
    box.dataset.gl = canvas.getContext("webgl2") === null ? "no" : "yes"
  }, [beam])

  // The labels find their row when the day is drawn and when the width of the track changes.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (track === null) return
    placeLabels(track)
    if (typeof ResizeObserver === "undefined") return
    const watch = new ResizeObserver(() => placeLabels(track))
    watch.observe(track)
    return () => watch.disconnect()
  }, [loaded, failed, fullDay])

  return createPortal(
    <div
      ref={rootRef}
      className="ab-day"
      role="dialog"
      aria-modal="true"
      aria-label="The whole day"
      data-on={on && !leaving ? "true" : "false"}
      data-lit={lit ? "true" : "false"}
      data-condition={shownCondition}
      style={{ "--ab-day-beam": palette.beam, "--ab-day-accent": palette.accent } as CSSProperties}
    >
      <div ref={beamRef} className="ab-day-beam" aria-hidden="true">
        {beam ? (
          <LaserFlow
            surfaceRef={landingRef}
            beamPosition={BEAM.beamPosition}
            color={palette.beam}
            intensity={BEAM.intensity}
            spread={BEAM.spread}
            mouseInteraction={BEAM.mouseInteraction}
            dpr={LITE_LEVEL > 0 ? 1 : undefined}
            paused={LITE_LEVEL === 2}
          />
        ) : null}
        <div ref={landingRef} className="ab-day-landing" />
        <div className="ab-day-fallback" />
      </div>
      <button ref={closeRef} className="ab-glass-button ab-day-close" type="button" data-lite={LITE_LEVEL > 0 ? "on" : undefined} onClick={close}>
        Close
      </button>
      <div className="ab-day-surface">
        <div className="ab-day-sheet" data-reveal={shown ? "true" : "false"}>
          {week.length > 0 ? (
            <div className="ab-day-week" role="group" aria-label="This week">
              {week.map((item) => (
                <button
                  key={item.day}
                  className="ab-day-chip ab-day-caps"
                  type="button"
                  aria-pressed={item.day === selected}
                  aria-label={item.isToday ? item.name + ", today" : item.name}
                  data-today={item.isToday ? "true" : undefined}
                  onClick={() => pick(item.day)}
                >
                  {item.short}
                </button>
              ))}
            </div>
          ) : null}
          {loaded === null && !failed ? (
            <p className="ab-day-quiet" role="status">
              Reading the day…
            </p>
          ) : null}
          {failed ? (
            <>
              <p className="ab-day-quiet" role="alert">
                Could not read this day.
              </p>
              <button className="ab-glass-button ab-day-retry" type="button" data-lite={LITE_LEVEL > 0 ? "on" : undefined} onClick={retry}>
                Try again
              </button>
            </>
          ) : null}
          {loaded !== null && !failed ? (
            <div className="ab-day-body" data-busy={loaded.day !== selected ? "true" : "false"} aria-busy={loaded.day !== selected}>
              <DayBody
                view={fullDay ? loaded.views.full : loaded.views.zoom}
                zoomable={loaded.views.zoom.zoomable}
                fullDay={fullDay}
                onToggleFullDay={() => setFullDay((value) => !value)}
                legend={dayLegendFor(palette.qualities)}
                trackRef={trackRef}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

type DayBodyProps = {
  view: DayView
  zoomable: boolean
  fullDay: boolean
  onToggleFullDay: () => void
  legend: DayLegendItem[]
  trackRef: RefObject<HTMLDivElement | null>
}

function DayBody({ view, zoomable, fullDay, onToggleFullDay, legend, trackRef }: DayBodyProps) {
  return (
    <>
      <h1 className="ab-day-title ab-day-r" style={step(0)}>
        {view.title}
      </h1>
      <p className="ab-day-sentence ab-day-r" style={step(1)}>
        {view.sentence}
      </p>
      {view.bars.length > 0 ? (
        <>
          <div ref={trackRef} className="ab-day-track ab-day-r" style={step(2)}>
            <div className="ab-day-line" />
            {view.woke !== null ? (
              <>
                <span className="ab-day-caps ab-day-woke" style={{ left: view.woke.leftPercent + "%" }}>
                  {view.woke.label}
                </span>
                <span className="ab-day-dot" style={{ left: view.woke.leftPercent + "%" }} />
              </>
            ) : null}
            {view.bars.map((bar, i) => (
              <Fragment key={bar.id}>
                <span
                  className="ab-day-bar"
                  data-quality={bar.quality}
                  style={{
                    ...step(i),
                    left: bar.leftPercent + "%",
                    width: bar.widthPercent + "%",
                    background: bar.color,
                    boxShadow: "0 0 18px 2px color-mix(in srgb, " + bar.color + " 55%, transparent)",
                  }}
                />
                <span className="ab-day-caps ab-day-blab" style={{ left: bar.centerPercent + "%" }}>
                  {bar.label}
                </span>
              </Fragment>
            ))}
          </div>
          <div className="ab-day-ticks ab-day-caps ab-day-r" style={step(2)} aria-hidden="true">
            {view.axis.ticks.map((tick) => (
              <span key={tick.hour} style={{ left: tick.leftPercent + "%" }}>
                {tick.label}
              </span>
            ))}
          </div>
          {zoomable ? (
            <div className="ab-day-axisrow ab-day-r" style={step(2)}>
              <button className="ab-day-full ab-day-caps" type="button" aria-pressed={fullDay} onClick={onToggleFullDay}>
                Full day
              </button>
            </div>
          ) : null}
          <div className="ab-day-tags ab-day-r" style={step(3)} aria-hidden="true">
            {view.tagBar.map((part) => (
              <i key={part.label} style={{ flex: Math.max(part.seconds, 1) }} />
            ))}
          </div>
          <div className="ab-day-tl ab-day-caps ab-day-r" style={step(3)}>
            {view.tagBar.map((part) => (
              <span key={part.label} style={{ flex: Math.max(part.seconds, 1) }}>
                {part.label} <b>{part.minutes}</b>
              </span>
            ))}
          </div>
          <div className="ab-day-legend ab-day-caps ab-day-r" style={step(4)}>
            {legend.map((item) => (
              <span key={item.quality}>
                <i className="ab-day-swatch" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </>
  )
}
// AB:OVERVIEW.DAYVIEW:END
