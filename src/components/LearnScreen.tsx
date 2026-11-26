import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react"
import LearnScene from "@/components/LearnScene"
import LearnTitle from "@/components/LearnTitle"
import SpotGlow from "@/components/SpotGlow"
import { SUBJECT_COLOURS, type SubjectId } from "@/data/learn/subjectColours"
import { HUB_EFFECT, SUBJECT_EFFECT } from "@/lib/learnEffects"
import { prefersReducedMotion } from "@/lib/learnMotion"
import { LEARN_INDEX, NO_FACTS, type LearnFacts, type LearnIndex } from "@/lib/learnRules"
import { HOME_SCENE_COLOUR, type SceneId } from "@/lib/learnScenes"
import { hubTiles, resolveGuideAddress, subjectView, tierClosedMessage, tierTabs, type HubTile, type SubjectView, type TierTab } from "@/lib/learnView"
import type { LiteLevel } from "@/lib/lite"
import { guideHash, type GuideAddress } from "@/lib/screens"
import { useLearnSpotlight } from "@/lib/useLearnSpotlight"
import "../learn.css"

// AB:LEARN.SUBJECT:START
// The subject view of the Learn screen (Packet 12B, DECISIONS_LEARN.md section 16): the way back, the caption, the big name of the subject, and for each region its heading with the count, a thin bar, the idea line and a grid of item tiles.
// Read only. Every item tile is a real link to its own address (#guide/python/PY-14); until the item card exists (Packet 12B2) the address only MARKS the tile (aria-current and data-marked) and the screen scrolls it into view.
// A state is an attribute that the css reads (data-done, data-marked, data-all), never a computed class name. See CONNECTIONS.md C77.
// The small helpers that the hub uses too (the accent, the tick) are here, at the top of the first part.
// The look is the part of src/learn.css that has the same tag.
function accent(colour: string): CSSProperties {
  return { "--ab-learn-s": colour } as CSSProperties
}

function CheckBadge() {
  return (
    <span className="ab-learn-bdg" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  )
}

type SubjectPageProps = { view: SubjectView; marked: string | null; notice: string | null; backRef: RefObject<HTMLAnchorElement | null> }

function SubjectPage({ view, marked, notice, backRef }: SubjectPageProps) {
  return (
    <div className="ab-learn-page">
      <a ref={backRef} className="ab-learn-back" href={guideHash()}>
        {"\u2190 Subjects"}
      </a>
      <div className="ab-learn-cap ab-learn-above">{`Learn \u00b7 ${view.code}`}</div>
      <LearnTitle key={view.id} text={view.name} effect={SUBJECT_EFFECT[view.id]} />
      <p role="status" className="ab-learn-note">
        {notice ?? ""}
      </p>
      {view.regions.map((region) => (
        <section key={region.key} className="ab-learn-region" aria-labelledby={`ab-learn-r-${region.key}`}>
          <div className="ab-learn-rn">
            <h2 id={`ab-learn-r-${region.key}`} className="ab-learn-rname">
              {region.heading}
            </h2>
            <span className="ab-learn-cap ab-learn-rcount" data-done={region.finished ? "true" : undefined}>
              {region.count}
            </span>
          </div>
          <div className="ab-learn-pbr" data-all={region.finished ? "true" : undefined}>
            <i style={{ transform: `scaleX(${region.progress})` }} />
          </div>
          <p className="ab-learn-idea">
            {region.idea.map((part, i) =>
              part.code ? (
                <code key={i} className="ab-learn-code">
                  {part.text}
                </code>
              ) : (
                <Fragment key={i}>{part.text}</Fragment>
              ),
            )}
          </p>
          <div className="ab-learn-grid">
            {region.items.map((item) => (
              <a
                key={item.id}
                className="ab-learn-tile ab-learn-item"
                href={guideHash(view.id, item.id)}
                data-spot="tilt"
                data-item={item.id}
                data-done={item.done ? "true" : undefined}
                data-marked={marked === item.id ? "true" : undefined}
                aria-current={marked === item.id ? "true" : undefined}
                aria-label={item.done ? `${item.code} ${item.title}, finished` : undefined}
              >
                <span className="ab-learn-tc">{item.code}</span>
                <span className="ab-learn-tname">{item.title}</span>
                {item.done ? <CheckBadge /> : null}
                <SpotGlow />
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
// AB:LEARN.SUBJECT:END

// AB:LEARN.HUB:START
// The hub of the Learn screen: the caption, the big word Subjects, the six tier tabs, the line of words and one tile per subject.
// Only Tier 1 is open and selected. A closed tier is a tab with aria-disabled="true" and a lock: a tap shakes it (not with less motion) and says "Tier n is closed. It opens only when you say so." on the line of words under the tabs, which also carries the notice of a wrong address. The message of a closed tier takes the place of the notice.
// A mouse or a pen resting on a subject tile asks the screen to show that subject's scene behind the hub (onPreview); a finger never does. Leaving the grid ends it, and so does leaving the hub: the pointer never gets to say it left when a tile is opened.
// Each subject tile sets its own accent (and carries data-accent, CONNECTIONS.md C76) and holds the glow as its last child. See CONNECTIONS.md C77.
const SHAKE: Keyframe[] = [
  { transform: "none" },
  { transform: "translateX(-6px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(-3px)" },
  { transform: "none" },
]
const SHAKE_MS = 320
const NOTE_FADE_MS = 250

function Lock() {
  return (
    <svg className="ab-learn-lock" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

type HubPageProps = { tabs: TierTab[]; tiles: HubTile[]; notice: string | null; onPreview: (id: SubjectId | null) => void }

function HubPage({ tabs, tiles, notice, onPreview }: HubPageProps) {
  // The last tap on a closed tier. Every tap makes a new object, so the line of words fades in again even for the same tier.
  const [tap, setTap] = useState<{ n: number } | null>(null)
  const noteRef = useRef<HTMLParagraphElement>(null)

  // Leaving the hub (a tile was opened) ends the preview: the pointer never gets to say it left.
  useEffect(() => () => onPreview(null), [onPreview])

  useEffect(() => {
    const note = noteRef.current
    if (tap === null || note === null || prefersReducedMotion() || typeof note.animate !== "function") return
    note.animate([{ opacity: 0 }, { opacity: 1 }], { duration: NOTE_FADE_MS })
  }, [tap])

  const onClosedTier = (event: ReactMouseEvent<HTMLButtonElement>, n: number): void => {
    const button = event.currentTarget
    if (!prefersReducedMotion() && typeof button.animate === "function") button.animate(SHAKE, { duration: SHAKE_MS, easing: "cubic-bezier(.23,1,.32,1)" })
    setTap({ n })
  }

  const onEnter = (event: ReactPointerEvent<HTMLAnchorElement>, id: SubjectId): void => {
    if (event.pointerType !== "touch") onPreview(id)
  }

  return (
    <div className="ab-learn-page">
      <div className="ab-learn-cap">Learn</div>
      <LearnTitle text="Subjects" effect={HUB_EFFECT} />
      <div className="ab-learn-tiers" role="tablist" aria-label="Tiers">
        {tabs.map((tab) =>
          tab.open ? (
            <button key={tab.n} type="button" role="tab" className="ab-learn-tier" aria-selected="true" data-done={tab.finished ? "true" : undefined}>
              <span>{tab.label}</span>
              <small>{tab.count}</small>
              <i className="ab-learn-tpg" style={{ transform: `scaleX(${tab.progress})` }} />
            </button>
          ) : (
            <button
              key={tab.n}
              type="button"
              role="tab"
              className="ab-learn-tier"
              aria-selected="false"
              aria-disabled="true"
              data-tier={tab.n}
              onClick={(event) => onClosedTier(event, tab.n)}
            >
              <Lock />
              <span>{tab.label}</span>
              <small>{tab.count}</small>
            </button>
          ),
        )}
      </div>
      <p ref={noteRef} role="status" className="ab-learn-note">
        {tap !== null ? tierClosedMessage(tap.n) : (notice ?? "")}
      </p>
      <div className="ab-learn-grid" onPointerLeave={() => onPreview(null)}>
        {tiles.map((tile) => (
          <a
            key={tile.id}
            className="ab-learn-tile ab-learn-subj"
            href={guideHash(tile.id)}
            data-spot="tilt"
            data-accent=""
            data-subject={tile.id}
            data-done={tile.finished ? "true" : undefined}
            style={accent(tile.colour)}
            onPointerEnter={(event) => onEnter(event, tile.id)}
          >
            <span className="ab-learn-tc">{tile.code}</span>
            <span className="ab-learn-tname">{tile.name}</span>
            <span className="ab-learn-tline">{tile.line}</span>
            <i className="ab-learn-spg" style={{ transform: `scaleX(${tile.progress})` }} />
            {tile.finished ? <CheckBadge /> : null}
            <SpotGlow />
          </a>
        ))}
      </div>
    </div>
  )
}
// AB:LEARN.HUB:END

// AB:LEARN.SCREEN:START
// The Learn screen of the Guide (Packet 12B, chunk 5): ONE <main> that is the scroller of the whole screen, with the moving picture first (z-index 0), the sticky top bar with the Learn | Prove switch (z-index 2) and the page, the hub or a subject (z-index 1). Read only: the facts are NO_FACTS until the database arrives (12C, 12D), and nothing here calls it.
// Everything is a function of the page address (the words after #guide, given as `address`): resolveGuideAddress (src/lib/learnView.ts) says which place opens and what notice goes with it, and it never throws.
//  - The address in the page: while the page address still starts with #guide and is not the exact form (Python, py-14, a place that does not exist), it is replaced by the exact one with replaceState, so no step is added to the history.
//  - Where the page starts: the scroller goes to the top at every new subject (and when the hub comes back), or the marked item is scrolled to the middle (smooth, or at once with less motion).
//  - The keyboard: a subject opens with the keyboard on its way back, the hub that comes back puts the keyboard on the tile of the subject just left, and Escape in a subject goes to the hub (not while the trip of Prove runs).
//  - The picture behind: the hub shows the scene "home"; a mouse resting on a subject tile shows that subject's scene instead; a subject shows its own. The more is finished, the brighter.
//  - The switch: Prove asks the screen around it (GuideScreen, chunk 6) for the trip, TV off, black hold, TV on, and while `proving` is true both buttons and Escape are off.
// The glow and tilt of the tiles come from ONE listener on the root (useLearnSpotlight). The look is the part of src/learn.css that has the same tag. See CONNECTIONS.md C75, C76 and C77.
export type LearnScreenProps = {
  address: GuideAddress
  onProve: () => void
  proving?: boolean
  lite?: LiteLevel // the lite level of the page when it is not given
  index?: LearnIndex
  facts?: LearnFacts
}

export default function LearnScreen({ address, onProve, proving = false, lite, index = LEARN_INDEX, facts = NO_FACTS }: LearnScreenProps) {
  const rootRef = useRef<HTMLElement>(null)
  const backRef = useRef<HTMLAnchorElement>(null)
  const lastSubject = useRef<SubjectId | null>(null)
  const [preview, setPreview] = useState<SubjectId | null>(null)

  const resolved = useMemo(() => resolveGuideAddress(address, index), [address, index])
  const tabs = useMemo(() => tierTabs(index, facts), [index, facts])
  const tiles = useMemo(() => hubTiles(index, facts), [index, facts])
  const subjectId = resolved.view === "subject" ? resolved.subject : null
  const markedId = resolved.view === "subject" ? resolved.item : null
  const view = useMemo(() => (subjectId === null ? null : subjectView(subjectId, index, facts)), [subjectId, index, facts])

  useLearnSpotlight(rootRef)

  // A loose address is replaced by the exact one, but only while the page is still on the Guide.
  useEffect(() => {
    const here = window.location.hash
    if (here.startsWith("#guide") && here !== resolved.hash) window.history.replaceState(null, "", resolved.hash)
  }, [address, resolved.hash])

  // Where the page starts: the marked item in the middle, or the top.
  useEffect(() => {
    const root = rootRef.current
    if (root === null) return
    const target = markedId === null ? null : root.querySelector<HTMLElement>(`[data-item="${markedId}"]`)
    if (target !== null && typeof target.scrollIntoView === "function") {
      const reduced = prefersReducedMotion()
      target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" })
    } else {
      root.scrollTop = 0
    }
  }, [subjectId, markedId])

  // The keyboard: the way back when a subject opens, the tile of the subject just left when the hub comes back.
  useEffect(() => {
    const before = lastSubject.current
    lastSubject.current = subjectId
    if (subjectId !== null) {
      backRef.current?.focus({ preventScroll: true })
      return
    }
    if (before !== null) {
      rootRef.current
        ?.querySelector<HTMLElement>(`[data-subject="${before}"]`)
        ?.focus({ preventScroll: true })
    }
  }, [subjectId])

  // Escape in a subject goes back to the hub.
  useEffect(() => {
    if (subjectId === null || proving) return undefined
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") window.location.hash = guideHash()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [subjectId, proving])

  // The picture behind the page.
  let scene: SceneId = "home"
  let colour = HOME_SCENE_COLOUR
  let fraction = tabs[0]?.progress ?? 0
  if (view !== null) {
    scene = view.id
    colour = SUBJECT_COLOURS[view.id]
    fraction = view.total === 0 ? 0 : view.done / view.total
  } else {
    const previewed = preview === null ? undefined : tiles.find((t) => t.id === preview)
    if (previewed !== undefined) {
      scene = previewed.id
      colour = previewed.colour
      fraction = previewed.progress
    }
  }

  return (
    <main
      ref={rootRef}
      className="ab-learn"
      data-accent=""
      aria-label="Learn"
      style={view === null ? undefined : accent(SUBJECT_COLOURS[view.id])}
    >
      <LearnScene scene={scene} colour={colour} fraction={fraction} lite={lite} />
      <div className="ab-learn-bar">
        <div className="ab-learn-switch" role="group" aria-label="Learn or Prove">
          <button type="button" className="ab-learn-sw" aria-pressed="true" disabled={proving}>
            Learn
          </button>
          <button type="button" className="ab-learn-sw" aria-pressed="false" disabled={proving} onClick={onProve}>
            Prove
          </button>
        </div>
      </div>
      {view === null ? (
        <HubPage tabs={tabs} tiles={tiles} notice={resolved.notice} onPreview={setPreview} />
      ) : (
        <SubjectPage view={view} marked={markedId} notice={resolved.notice} backRef={backRef} />
      )}
    </main>
  )
}
// AB:LEARN.SCREEN:END
