import { useEffect, useRef, useState } from "react"
import type { TimerTag } from "@/lib/timerApi"
import type { AddTagResult } from "@/lib/useTimer"
import "../timer.css"

// AB:TIMER.TAGS:START
// The editing box of the Pro Timer: the place where the person ADDS a tag (Packet 10D built it as the Manage tags box; Packet 10F made it the inside of the Edit tags view of the picker, CONNECTIONS.md C57). Renaming and removing come in Packet 10G. TagPicker.tsx draws it INSTEAD of the list while the pen has switched its panel to editing (DECISIONS_TAGS.md sections 4b and 5).
// It has no dim layer, no dialog and no keys of the place: the layer, the glass panel, the focus, Escape and the Tab rule belong to TagPicker.tsx. The box has a title (Edit tags), a Back button (it returns to the list), a text field with an Add button, one line for an error, and the person's tags as plain read-only rows in the order of the list the hook gave. The panel is at the TOP of the window on every size, so that the keyboard of a phone does not hide the field; it scrolls when it is taller than the window.
// Add hands the name to the hook as typed (onAdd = addTag in useTimer.ts). The database cuts the spaces and checks the rules, so the rules and the words of the errors live in one place and this box has no rule of its own, not even a limit on the field. While the call runs, Add and Enter do nothing (a second tap cannot add the name twice) and the field cannot be edited. On success the field is emptied, the focus stays in the field, and the new tag appears in the list below (it is NOT chosen, see DECISIONS_TAGS.md section 4). On an error the text stays in the field and the plain words show in one line until the person types again.
// Enter in the field is the same as Add, except while a word is still being composed with an input method (a name in another script). Focus goes to the field when the box opens.
// A tag name is shown as plain text, never as markup. The look is in timer.css, in the part that has the same tag as this one (see CODE_MAP.md).

type TagManageProps = {
  tags: TimerTag[]
  onAdd: (name: string) => Promise<AddTagResult>
  onBack: () => void
}

export default function TagManage({ tags, onAdd, onBack }: TagManageProps) {
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
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

  return (
    <div className="ab-tag-edit">
      <div className="ab-tag-head">
        <p className="ab-tag-title">Edit tags</p>
        <button className="ab-tag-back" type="button" onClick={onBack}>
          Back
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
  )
}
// AB:TIMER.TAGS:END
