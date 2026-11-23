// AB:LEARN.LABEL:START
// The label a learn session carries (DECISIONS_LEARN.md 19a and 19g): two answers and a flag.
//   what   = "Working on":     "item:PY-13", "gate:python/D", or null
//   via    = "Learning from":  a source path such as "own" or "coursera/ibm-python/m1/1.3", or null
//   review = working again on a finished item (the pill gets a hollow notch, B2)
// Pure functions: no screen, no database call. The tests are in src/lib/learnLabel.test.ts.
// The SHAPES below are also checked by the database (Packet 12C): see CONNECTIONS.md C66.
// Whether the item or the gate EXISTS is not checked here: the app checks it against the content.
import { findSource, isSourcePath } from "./learnSources"

export type LearnWhat = { kind: "item"; id: string } | { kind: "gate"; subject: string; region: string }

export type LearnLabel = { what: string | null; via: string | null; review: boolean }

// An item id: two capital letters, a hyphen, one to three digits (PY-13, NP-4, PD-25).
export const ITEM_ID_SHAPE = /^[A-Z]{2}-[0-9]{1,3}$/
// A gate: the subject id, a slash and the region id (python/D, numpy/NP-A, terminal/TA).
export const GATE_SHAPE = /^[a-z]{2,12}\/[A-Z0-9-]{1,6}$/

export function parseWhat(text: unknown): LearnWhat | null {
  if (typeof text !== "string") return null
  if (text.startsWith("item:")) {
    const id = text.slice(5)
    return ITEM_ID_SHAPE.test(id) ? { kind: "item", id } : null
  }
  if (text.startsWith("gate:")) {
    const rest = text.slice(5)
    if (!GATE_SHAPE.test(rest)) return null
    const [subject, region] = rest.split("/") as [string, string]
    return { kind: "gate", subject, region }
  }
  return null
}

export function whatText(what: LearnWhat): string {
  return what.kind === "item" ? `item:${what.id}` : `gate:${what.subject}/${what.region}`
}

export function isEmptyLearnLabel(label: LearnLabel): boolean {
  return label.what === null && label.via === null && !label.review
}

// The shape problems of a label. An empty list means the shapes are right.
export function learnLabelProblems(label: LearnLabel): string[] {
  const problems: string[] = []
  if (label.what !== null && parseWhat(label.what) === null) problems.push(`bad what: ${label.what}`)
  if (label.via !== null && !isSourcePath(label.via)) problems.push(`bad source: ${label.via}`)
  return problems
}

// One session has ONE label (Q5): no tag, a timer tag, or a learn label. A timer tag together with learn
// fields is "invalid"; the database refuses it too.
export type SessionLabelKind = "none" | "timer" | "learn" | "invalid"
export function sessionLabelKind(tagId: string | null, label: LearnLabel): SessionLabelKind {
  const hasLearn = !isEmptyLearnLabel(label)
  if (tagId !== null && hasLearn) return "invalid"
  if (hasLearn) return learnLabelProblems(label).length === 0 ? "learn" : "invalid"
  return tagId !== null ? "timer" : "none"
}

// The words for a source in the tap line: "own practice", or "via Coursera IBM Python 1.3".
export function learnSourceLine(via: string): string {
  const node = findSource(via)
  if (!node) return `via ${via}`
  return node.kind === "own" ? node.say : `via ${node.say}`
}

// The label as one line for the tap line and the dial: the parts are joined by a middle dot, for example
// PY-2, a dot, then "via Coursera IBM Python 1.3". A source with no item starts with "No item". A review
// starts with "Review of NP-3".
// The title of the item, the quality and the minutes are added by the screen. Null when the label is empty.
// A middle dot with a space on each side. It is written as an escape so that the file stays plain ASCII.
export const PART_SEPARATOR = " \u00b7 "

export function learnLabelLine(label: LearnLabel): string | null {
  if (isEmptyLearnLabel(label)) return null
  const parts: string[] = []
  if (label.what === null) {
    parts.push("No item")
  } else {
    const what = parseWhat(label.what)
    const head = what === null ? label.what : what.kind === "item" ? what.id : `Gate ${what.subject}/${what.region}`
    parts.push(label.review ? `Review of ${head}` : head)
  }
  if (label.via !== null) parts.push(learnSourceLine(label.via))
  return parts.join(PART_SEPARATOR)
}
// AB:LEARN.LABEL:END
