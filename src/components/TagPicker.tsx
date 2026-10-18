import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react"
import GlassSurface from "@/components/GlassSurface"
import TagManage from "@/components/TagManage"
import { LITE_LEVEL } from "@/lib/lite"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.TAGS:START
// The tag picker of the Pro Timer, version 2 (Packet 10F; version 1 was Packet 10C2): the person chooses the tag BEFORE pressing Start (DECISIONS_TAGS.md sections 4 and 4b, CONNECTIONS.md C56). TimerScreen.tsx shows it as the first thing inside the buttons box, only while no session runs; the choice itself lives in useTimer.ts (tagId, chooseTag, reloadTags), and the list arrives there already in the order of use (CONNECTIONS.md C58).
// The glass is the ReactBits part GlassSurface.tsx (Hari's decision of 18 Oct 2026). All its settings are in the GLASS object below, in one place; the darkness is in timer.css (.ab-tag-glass). In lite mode (src/lib/lite.ts: a touch screen, or ?lite=1 in the address) GlassSurface is not used: a plain dark box of the same size stands there (the same rule as the login card, CONNECTIONS.md C22).
// On a wide screen (the same condition as C39) one row stands above Start: No tag, the four tags the person uses most (the first four of the list), the chosen tag as one more pill when it is not among those four (so that the choice is always seen), and ONE All tags pill that holds two buttons: the words All tags (opens the list) and a pen (opens the editing box). On a phone (the one-column screen) ONE pill shows the current choice and opens the list. Both versions are always in the page; the css decides which one is seen.
// The place (a layer over the whole window, a plain dim layer with the glass panel in it) has two views. LIST: the title All tags, a pen at the top right, and a row for No tag and for EVERY tag in the order of use; a tap on a row chooses it and closes (nothing starts). EDIT: the box of Packet 10D (TagManage.tsx: the field and Add; renaming and removing are Packet 10G); Back goes to the list. Escape and a tap on the dim layer close everything. Focus goes to the panel when the list opens and when Back comes back to it (to the field when the editing view opens) and back to what opened it when it closes. Tab stays inside the panel. A tag name is shown as plain text, never as markup.
// The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type TagPickerProps = {
  tags: TimerTag[]
  tagId: string | null
  disabled: boolean
  onChoose: (id: string | null) => void
  onOpen: () => void
  onAdd: (name: string) => Promise<AddTagResult>
}

const NO_TAG = "No tag"
const TOP_COUNT = 4

// The settings of the glass, one object for the pills and one for the panel (the meaning of every number is in GlassSurface.tsx and in src/components/LoginCard.tsx, which has the same kind of object).
const GLASS = {
  pill: {
    borderRadius: 22,
    borderWidth: 0.07,
    brightness: 50,
    opacity: 0.93,
    blur: 11,
    displace: 0,
    backgroundOpacity: 0,
    saturation: 1,
    distortionScale: -120,
    redOffset: 0,
    greenOffset: 0,
    blueOffset: 0,
  },
  panel: {
    borderRadius: 22,
    borderWidth: 0.07,
    brightness: 50,
    opacity: 0.93,
    blur: 11,
    displace: 2,
    backgroundOpacity: 0,
    saturation: 1,
    distortionScale: -120,
    redOffset: 0,
    greenOffset: 0,
    blueOffset: 0,
  },
}

type GlassProps = { kind: "pill" | "panel"; className: string; width: number | string; height: number | string; children: ReactNode }

// The glass, or in lite mode the plain dark box with the same size and corners (both have 8 px of padding around the content).
function Glass({ kind, className, width, height, children }: GlassProps) {
  const settings = GLASS[kind]
  if (LITE_LEVEL > 0) {
    return (
      <div className="ab-tag-solid" data-kind={kind} style={{ width, height, borderRadius: settings.borderRadius }}>
        {children}
      </div>
    )
  }
  return (
    <GlassSurface {...settings} width={width} height={height} className={className}>
      {children}
    </GlassSurface>
  )
}

function PenIcon() {
  return (
    <svg className="ab-tag-pen-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.5 8.5l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function TagPicker({ tags, tagId, disabled, onChoose, onOpen, onAdd }: TagPickerProps) {
  const [view, setView] = useState<"closed" | "list" | "edit">("closed")
  const openerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const open = view !== "closed"
  const current = tagId === null ? undefined : tags.find((tag) => tag.id === tagId)
  const label = current === undefined ? NO_TAG : current.name
  // The pills of the row: the first four tags, and the chosen tag after them when it is a tag from further down the list.
  const top = tags.slice(0, TOP_COUNT)
  const row = current === undefined || top.includes(current) ? top : [...top, current]

  // Closing returns the focus to what opened the place, so that a keyboard person is where they were.
  function close() {
    setView("closed")
    openerRef.current?.focus()
  }

  function openAs(next: "list" | "edit") {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    onOpen()
    setView(next)
  }

  function choose(id: string | null) {
    onChoose(id)
    close()
  }

  // The LIST has the focus on its panel, when it opens and when Back comes back to it (never on a row, so that a key still held can never choose a tag). The editing view puts the focus on its own field when it opens (TagManage.tsx), so this effect leaves it alone there.
  useEffect(() => {
    if (view === "list") panelRef.current?.focus()
  }, [view])

  // While the place is open, Escape closes everything.
  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setView("closed")
        openerRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  // Tab stays inside the panel: from the last stop it goes to the first one and back (the panel itself counts as the place before the first stop).
  function trap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return
    const stops = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("button, input") ?? [])
    if (stops.length === 0) return
    const first = stops[0]
    const last = stops[stops.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="ab-tag-picker">
      <div className="ab-tag-phone">
        <Glass kind="pill" className="ab-tag-glass" width="100%" height={44}>
          <button
            className="ab-tag-pill"
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={"Tag: " + label}
            onClick={() => openAs("list")}
          >
            <span className="ab-tag-pill-text">{label}</span>
            <span className="ab-tag-chevron" aria-hidden="true" />
          </button>
        </Glass>
      </div>
      <div className="ab-tag-chips" role="group" aria-label="Tag">
        <Glass kind="pill" className="ab-tag-glass" width="auto" height={44}>
          <button className="ab-tag-chip" type="button" disabled={disabled} aria-pressed={tagId === null} onClick={() => onChoose(null)}>
            {NO_TAG}
          </button>
        </Glass>
        {row.map((tag) => (
          <Glass key={tag.id} kind="pill" className="ab-tag-glass" width="auto" height={44}>
            <button className="ab-tag-chip" type="button" disabled={disabled} aria-pressed={tag.id === tagId} onClick={() => onChoose(tag.id)}>
              {tag.name}
            </button>
          </Glass>
        ))}
        <Glass kind="pill" className="ab-tag-glass" width="auto" height={44}>
          <button className="ab-tag-all" type="button" disabled={disabled} aria-haspopup="dialog" onClick={() => openAs("list")}>
            All tags
          </button>
          <button className="ab-tag-pen" type="button" disabled={disabled} aria-haspopup="dialog" aria-label="Edit tags" onClick={() => openAs("edit")}>
            <PenIcon />
          </button>
        </Glass>
      </div>
      {open ? (
        <div className="ab-tag-layer" data-view={view}>
          <div className="ab-tag-scrim" aria-hidden="true" onClick={close} />
          <div className="ab-tag-place">
            <Glass kind="panel" className="ab-tag-glass ab-tag-glass-panel" width="100%" height="auto">
              <div
                className="ab-tag-panel"
                role="dialog"
                aria-modal="true"
                aria-label={view === "edit" ? "Edit tags" : "All tags"}
                tabIndex={-1}
                ref={panelRef}
                onKeyDown={trap}
              >
                {view === "edit" ? (
                  <TagManage tags={tags} onAdd={onAdd} onBack={() => setView("list")} />
                ) : (
                  <>
                    <div className="ab-tag-head">
                      <p className="ab-tag-title">All tags</p>
                      <button className="ab-tag-edit-button" type="button" aria-label="Edit tags" onClick={() => setView("edit")}>
                        <PenIcon />
                      </button>
                    </div>
                    <button className="ab-tag-row" type="button" aria-pressed={tagId === null} onClick={() => choose(null)}>
                      {NO_TAG}
                    </button>
                    {tags.map((tag) => (
                      <button key={tag.id} className="ab-tag-row" type="button" aria-pressed={tag.id === tagId} onClick={() => choose(tag.id)}>
                        {tag.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </Glass>
          </div>
        </div>
      ) : null}
    </div>
  )
}
// AB:TIMER.TAGS:END
