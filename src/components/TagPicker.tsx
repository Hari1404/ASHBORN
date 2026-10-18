import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import TagManage from "@/components/TagManage"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.TAGS:START
// The tag picker of the Pro Timer (Packet 10C2): the person chooses the tag BEFORE pressing Start (DECISIONS_TAGS.md section 4, CONNECTIONS.md C56). TimerScreen.tsx shows it as the first thing inside the buttons box, only while no session runs; the choice itself lives in useTimer.ts (tagId, chooseTag, reloadTags) and goes to the database with Start.
// "No tag" (Freestyle) is always the first choice and the one every new session starts with. The tags follow in the order the hook gives them (oldest first). A tag name is shown as plain text, never as markup.
// On a phone (the one-column screen) it is ONE pill above Start that shows the current choice. Tapping it asks the hook to read the list again and opens the sheet: a plain dim layer over the whole screen (no blur, C25) with a panel that slides up from the bottom. Tapping a row chooses it and closes the sheet; tapping the dim layer or pressing Escape closes it without a change. Focus goes to the panel (not to a row, as in StopAlert.tsx) and comes back to the pill when the sheet closes. Tab stays inside the panel while it is open.
// On a wide screen (the same condition as C39) the pill and the sheet are not drawn (timer.css): every tag stands there as a chip in a wrapping row, "No tag" first, and tapping a chip chooses it. Both versions are always in the page; the css decides which one is seen.
// Managing tags (Packet 10D, CONNECTIONS.md C57): the list ends with a Manage tags row, and a wide screen has a Manage tags chip on a row of its own under the chips. Either one opens the Manage tags box (TagManage.tsx), which is drawn INSTEAD of the list while it is open: from the row, Back goes back to the list; from the chip (a wide screen has no list), Done closes the picker. The box only adds a tag for now (renaming and removing are Packet 10E), and a tag that was added is never chosen by itself.
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

export default function TagPicker({ tags, tagId, disabled, onChoose, onOpen, onAdd }: TagPickerProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"list" | "manage">("list")
  const [viaChip, setViaChip] = useState(false)
  const pillRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
  const current = tagId === null ? undefined : tags.find((tag) => tag.id === tagId)
  const label = current === undefined ? NO_TAG : current.name

  // Closing returns the focus to the pill, so that a keyboard person is where they were.
  function close() {
    setOpen(false)
    pillRef.current?.focus()
  }

  function openList() {
    setViaChip(false)
    setView("list")
    onOpen()
    setOpen(true)
  }

  function openManageFromList() {
    setView("manage")
  }

  function openManageFromChip() {
    onOpen()
    setViaChip(true)
    setView("manage")
    setOpen(true)
  }

  // Back from the box: to the list when the box was opened from the list (a phone), out of the picker when it was opened from the chip (a wide screen has no list).
  function leaveManage() {
    if (viaChip) close()
    else setView("list")
  }

  function choose(id: string | null) {
    onChoose(id)
    close()
  }

  // While the sheet is open: focus goes to the panel, and Escape closes the sheet without a change.
  useEffect(() => {
    if (!open) return
    panelRef.current?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        pillRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, view])

  // When the picker closes after a box that was opened from the chip of a wide screen, the focus goes back to that chip (the pill is not drawn there).
  useEffect(() => {
    if (!open && viaChip) chipRef.current?.focus()
  }, [open, viaChip])

  // Tab stays inside the panel: from the last row it goes to the first one and back (the panel itself counts as the place before the first row).
  function trap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return
    const rows = Array.from(panelRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])
    if (rows.length === 0) return
    const first = rows[0]
    const last = rows[rows.length - 1]
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
      <button
        className="ab-tag-pill"
        type="button"
        ref={pillRef}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={"Tag: " + label}
        onClick={openList}
      >
        <span className="ab-tag-pill-text">{label}</span>
        <span className="ab-tag-chevron" aria-hidden="true" />
      </button>
      <div className="ab-tag-chips" role="group" aria-label="Tag">
        <button className="ab-tag-chip" type="button" disabled={disabled} aria-pressed={tagId === null} onClick={() => onChoose(null)}>
          {NO_TAG}
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            className="ab-tag-chip"
            type="button"
            disabled={disabled}
            aria-pressed={tag.id === tagId}
            onClick={() => onChoose(tag.id)}
          >
            {tag.name}
          </button>
        ))}
      </div>
      <button className="ab-tag-more-chip" type="button" ref={chipRef} disabled={disabled} aria-haspopup="dialog" onClick={openManageFromChip}>
        Manage tags
      </button>
      {open && view === "manage" ? (
        <TagManage tags={tags} backLabel={viaChip ? "Done" : "Back"} onAdd={onAdd} onBack={leaveManage} onClose={close} />
      ) : null}
      {open && view === "list" ? (
        <div className="ab-tag-sheet">
          <div className="ab-tag-scrim" aria-hidden="true" onClick={close} />
          <div className="ab-tag-panel" role="dialog" aria-modal="true" aria-label="Choose a tag" tabIndex={-1} ref={panelRef} onKeyDown={trap}>
            <button className="ab-tag-row" type="button" aria-pressed={tagId === null} onClick={() => choose(null)}>
              {NO_TAG}
            </button>
            {tags.map((tag) => (
              <button key={tag.id} className="ab-tag-row" type="button" aria-pressed={tag.id === tagId} onClick={() => choose(tag.id)}>
                {tag.name}
              </button>
            ))}
            <button className="ab-tag-more" type="button" onClick={openManageFromList}>
              Manage tags
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
// AB:TIMER.TAGS:END
