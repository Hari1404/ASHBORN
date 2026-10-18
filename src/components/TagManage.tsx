import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.TAGS:START
// The Manage tags box of the Pro Timer (Packet 10D): the place where the person ADDS a tag. Renaming and removing come in Packet 10E. TagPicker.tsx opens it from the Manage tags row at the bottom of the phone list and from the Manage tags chip under the chips of a wide screen, and draws it INSTEAD of the list while it is open (DECISIONS_TAGS.md section 5, CONNECTIONS.md C57).
// It is a plain dim layer over the whole window (no blur, the same as the list) with a box at the TOP of the window, under the Menu button. The box is not at the bottom like the list on purpose: the keyboard of a phone would hide a box at the bottom while the person types. The box has a title, a Back button (Done on a wide screen), a text field with an Add button, one line for an error, and the person's tags as plain read-only rows. It scrolls when it is taller than the window.
// Add hands the name to the hook as typed (onAdd = addTag in useTimer.ts). The database cuts the spaces and checks the rules, so the rules and the words of the errors live in one place and this box has no rule of its own, not even a limit on the field. While the call runs, Add and Enter do nothing (a second tap cannot add the name twice) and the field cannot be edited. On success the field is emptied, the focus stays in the field, and the new tag appears in the list below (it is NOT chosen, see DECISIONS_TAGS.md section 4). On an error the text stays in the field and the plain words show in one line until the person types again.
// Enter in the field is the same as Add, except while a word is still being composed with an input method (a name in another script). Focus goes to the field when the box opens. Tab stays inside the box. Escape and a tap on the dim layer close the whole picker: TagPicker.tsx listens for Escape and gets the tap as onClose.
// A tag name is shown as plain text, never as markup. The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type TagManageProps = {
  tags: TimerTag[]
  backLabel: string
  onAdd: (name: string) => Promise<AddTagResult>
  onBack: () => void
  onClose: () => void
}

export default function TagManage({ tags, backLabel, onAdd, onBack, onClose }: TagManageProps) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const busyRef = useRef(false)
  const aliveRef = useRef(true)

  // The field gets the focus when the box opens. An answer that comes after the box was closed changes nothing.
  useEffect(() => {
    aliveRef.current = true
    inputRef.current?.focus()
    return () => {
      aliveRef.current = false
    }
  }, [])

  async function submit() {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    let result: AddTagResult
    try {
      result = await onAdd(draft)
    } catch {
      result = { ok: false, message: "Something went wrong." }
    }
    busyRef.current = false
    if (!aliveRef.current) return
    setBusy(false)
    if (result.ok) {
      setDraft("")
      setError("")
      inputRef.current?.focus()
    } else {
      setError(result.message)
    }
  }

  // Tab stays inside the box: from the last stop it goes to the first one and back (the box itself counts as the place before the first stop).
  function trap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return
    const stops = Array.from(boxRef.current?.querySelectorAll<HTMLElement>("button, input") ?? [])
    if (stops.length === 0) return
    const first = stops[0]
    const last = stops[stops.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === boxRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="ab-tag-dialog">
      <div className="ab-tag-scrim" aria-hidden="true" onClick={onClose} />
      <div className="ab-tag-box" role="dialog" aria-modal="true" aria-label="Manage tags" tabIndex={-1} ref={boxRef} onKeyDown={trap}>
        <div className="ab-tag-box-head">
          <p className="ab-tag-box-title">Manage tags</p>
          <button className="ab-tag-back" type="button" onClick={onBack}>
            {backLabel}
          </button>
        </div>
        <div className="ab-tag-add">
          <input
            className="ab-tag-input"
            type="text"
            aria-label="New tag name"
            placeholder="New tag"
            autoComplete="off"
            spellCheck={false}
            readOnly={busy}
            value={draft}
            ref={inputRef}
            onChange={(event) => {
              setDraft(event.target.value)
              setError("")
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault()
                void submit()
              }
            }}
          />
          <button className="ab-tag-add-button" type="button" disabled={busy} onClick={() => void submit()}>
            Add
          </button>
        </div>
        {error === "" ? null : (
          <p className="ab-tag-error" role="alert">
            {error}
          </p>
        )}
        {tags.length === 0 ? (
          <p className="ab-tag-have-empty">You have no tags yet.</p>
        ) : (
          <ul className="ab-tag-have" aria-label="Your tags">
            {tags.map((tag) => (
              <li key={tag.id} className="ab-tag-have-row">
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
// AB:TIMER.TAGS:END
