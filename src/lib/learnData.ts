// AB:LEARN.DATA-CHECK:START
// The checks of the Learn content (DECISIONS_LEARN.md 12a, L-14, Q22, B5): the validation that says in plain words
// what is wrong with src/data/learn/tier1.ts and src/data/learn/needs.ts. Pure functions that read the content they
// are given and return a list of problems; an empty list means the content is sound.
// Node cannot read a .ts file without a new package, so the check runs as the test file src/lib/learnData.test.ts
// (npm test), on the real content. Keep it passing before anything ships.
//
// What it checks:
//   - the counts (147 items, 36 regions, 36 region tasks), the ids (unique, the right shape, starting with the code of
//     their subject, frozen ids still there),
//   - every item has a check and an answer, learn lines and ability lines in the ranges of the content rules,
//   - every region has a task, the order is complete (every item is in exactly one region of its subject),
//   - every need points at a real item or region, never at something later in the same subject, never in a circle,
//   - every Coursera path and every link is real,
//   - (usedSourceProblems, usedWhatProblems) that every source and every item or gate that a SAVED session uses
//     still exists. Packet 12C gives them the saved sessions; until then they run on a list.
import type { SourceNode } from "../data/learn/sources"
import { SUBJECT_IDS } from "../data/learn/subjectColours"
import type { CourseLink, LearnSubject } from "../data/learn/tier1"
import type { Need } from "../data/learn/needs"
import { GATE_SHAPE, ITEM_ID_SHAPE, parseWhat } from "./learnLabel"
import { findSource, isSourcePath, sourceIsRetired } from "./learnSources"

// The counts of Tier 1 (L-57, the final content).
export const TIER1_COUNTS = { items: 147, regions: 36, tasks: 36 } as const

// The rules for the lines of an item card (the content work, HANDOVER.md "Rules for writing").
export const LEARN_LINE_COUNT = { min: 7, max: 10 } as const
export const ABILITY_LINE_COUNT = { min: 6, max: 8 } as const
export const LEARN_LINE_MAX_LENGTH = 150
export const ABILITY_KINDS: readonly string[] = ["write", "predict", "read", "fix", "say", "pick"]
export const VIA_TAGS: readonly string[] = ["video", "reading", "lab", "quiz"]

export type LearnDataInput = {
  subjects: readonly LearnSubject[]
  regionNeeds: Readonly<Record<string, readonly Need[]>>
  itemNeeds: Readonly<Record<string, readonly Need[]>>
  frozenItemIds: readonly string[]
  frozenRegionKeys: readonly string[]
  courseLinks: Readonly<Record<string, CourseLink>>
  sources: readonly SourceNode[]
  // The counts to expect. Leave it out to skip the count check (a small test fixture).
  expected?: { items: number; regions: number; tasks: number }
}

const EM_DASH = "\u2014"
const EN_DASH = "\u2013"

function blank(text: unknown): boolean {
  return typeof text !== "string" || text.trim() === ""
}

function lineProblems(where: string, what: string, text: unknown, maxLength: number | null, out: string[]): void {
  if (blank(text)) {
    out.push(`${where}: ${what} is empty`)
    return
  }
  const t = text as string
  if (t.includes("\n")) out.push(`${where}: ${what} has a line break`)
  if (t.includes(EM_DASH) || t.includes(EN_DASH)) out.push(`${where}: ${what} has a dash (plain words, no dashes)`)
  if (maxLength !== null && t.length > maxLength) out.push(`${where}: ${what} is longer than ${maxLength} characters`)
}

export function learnDataProblems(input: LearnDataInput): string[] {
  const out: string[] = []
  const { subjects } = input

  // ---- the subjects ----
  const ids = subjects.map((s) => s.id as string)
  if (JSON.stringify(ids) !== JSON.stringify([...SUBJECT_IDS])) out.push(`the subjects are [${ids.join(", ")}] and must be [${SUBJECT_IDS.join(", ")}]`)

  // ---- one pass over the content: ids, positions ----
  type Place = { subject: string; subjectOrder: number; regionKey: string; regionOrder: number; place: number }
  const itemPlace = new Map<string, Place>()
  const regionPlace = new Map<string, { subject: string; order: number; itemIds: string[] }>()
  let itemCount = 0
  let taskCount = 0
  for (const subject of subjects) {
    if (blank(subject.name)) out.push(`subject ${subject.id}: the name is empty`)
    if (typeof subject.code !== "string" || !/^[A-Z]{2}$/.test(subject.code)) out.push(`subject ${subject.id}: the code must be two capital letters`)
    let inSubject = 0
    subject.regions.forEach((region, regionOrder) => {
      const where = `region ${region.key}`
      if (region.key !== `${subject.id}/${region.id}`) out.push(`${where}: the key must be the subject id, a slash and the region id (${subject.id}/${region.id})`)
      if (!GATE_SHAPE.test(region.key)) out.push(`${where}: the key has the wrong shape`)
      if (regionPlace.has(region.key)) out.push(`${where}: the key is used twice`)
      regionPlace.set(region.key, { subject: subject.id, order: regionOrder, itemIds: region.items.map((i) => i.id) })
      if (blank(region.n)) out.push(`${where}: the name is empty`)
      if (blank(region.idea)) out.push(`${where}: the idea is empty`)
      if (typeof region.needsText !== "string") out.push(`${where}: needsText is missing`)
      if (region.items.length === 0) out.push(`${where}: has no items`)
      // the region task
      const task = region.task
      if (!task) {
        out.push(`${where}: has no task`)
      } else {
        taskCount += 1
        for (const f of ["t", "u", "k", "a"] as const) if (blank(task[f])) out.push(`${where}: the task has an empty ${f}`)
      }
      region.items.forEach((item, place) => {
        itemCount += 1
        inSubject += 1
        const iw = `item ${item.id}`
        if (!ITEM_ID_SHAPE.test(item.id)) out.push(`${iw}: the id has the wrong shape`)
        else if (!item.id.startsWith(`${subject.code}-`)) out.push(`${iw}: the id must start with the code of its subject (${subject.code}-)`)
        if (itemPlace.has(item.id)) out.push(`${iw}: the id is used twice`)
        itemPlace.set(item.id, { subject: subject.id, subjectOrder: inSubject - 1, regionKey: region.key, regionOrder, place })
        for (const f of ["t", "y", "c", "a"] as const) if (blank(item[f])) out.push(`${iw}: the ${f === "c" ? "check" : f === "a" ? "answer" : f === "t" ? "title" : "y line"} is empty`)
        if (item.o !== undefined && blank(item.o)) out.push(`${iw}: o is there but empty (leave it out)`)
        // the learn lines
        if (item.learn.length < LEARN_LINE_COUNT.min || item.learn.length > LEARN_LINE_COUNT.max) {
          out.push(`${iw}: has ${item.learn.length} learn lines, must be ${LEARN_LINE_COUNT.min} to ${LEARN_LINE_COUNT.max}`)
        }
        item.learn.forEach((line, i) => lineProblems(iw, `learn line ${i + 1}`, line, LEARN_LINE_MAX_LENGTH, out))
        // the ability lines
        if (item.ab.length < ABILITY_LINE_COUNT.min || item.ab.length > ABILITY_LINE_COUNT.max) {
          out.push(`${iw}: has ${item.ab.length} ability lines, must be ${ABILITY_LINE_COUNT.min} to ${ABILITY_LINE_COUNT.max}`)
        }
        item.ab.forEach(([kind, text], i) => {
          if (!ABILITY_KINDS.includes(kind)) out.push(`${iw}: ability line ${i + 1} has the unknown kind "${String(kind)}"`)
          lineProblems(iw, `ability line ${i + 1}`, text, LEARN_LINE_MAX_LENGTH, out)
        })
        // where to learn (Coursera)
        if (item.via) {
          const v = item.via
          if (!isSourcePath(v.path)) {
            out.push(`${iw}: via path "${v.path}" has the wrong shape`)
          } else if (findSource(v.path, input.sources) === null) {
            out.push(`${iw}: via path "${v.path}" is not in the catalogue of sources`)
          } else if (sourceIsRetired(v.path, input.sources)) {
            out.push(`${iw}: via path "${v.path}" is retired`)
          }
          if (blank(v.where)) out.push(`${iw}: via has no "where" words`)
          for (const tag of v.tags) if (!VIA_TAGS.includes(tag)) out.push(`${iw}: via has the unknown tag "${tag}"`)
          const course = Object.keys(input.courseLinks).find((k) => v.path === k || v.path.startsWith(`${k}/`))
          if (course === undefined) out.push(`${iw}: via path "${v.path}" is under no course with a link`)
        }
        // other reading
        if (item.src) {
          const seen = new Set<string>()
          item.src.forEach((s, i) => {
            const sw = `${iw}, reading ${i + 1}`
            if (blank(s.title)) out.push(`${sw}: the title is empty`)
            if (blank(s.note)) out.push(`${sw}: the note is empty`)
            if (typeof s.url !== "string" || !/^https:\/\/[^\s]+$/.test(s.url)) out.push(`${sw}: the link must start with https:// and hold no spaces`)
            if (seen.has(s.url)) out.push(`${sw}: the same link twice in one item`)
            seen.add(s.url)
          })
        }
      })
    })
    if (inSubject === 0) out.push(`subject ${subject.id}: has no items`)
  }

  // ---- the counts ----
  const regionCount = regionPlace.size
  if (input.expected) {
    if (itemCount !== input.expected.items) out.push(`there are ${itemCount} items, there must be ${input.expected.items}`)
    if (regionCount !== input.expected.regions) out.push(`there are ${regionCount} regions, there must be ${input.expected.regions}`)
    if (taskCount !== input.expected.tasks) out.push(`there are ${taskCount} region tasks, there must be ${input.expected.tasks}`)
  }

  // ---- the links of the courses ----
  for (const [path, link] of Object.entries(input.courseLinks)) {
    if (findSource(path, input.sources) === null) out.push(`course link "${path}" is not in the catalogue of sources`)
    if (blank(link.name)) out.push(`course link "${path}": the name is empty`)
    if (typeof link.url !== "string" || !/^https:\/\/[^\s]+$/.test(link.url)) out.push(`course link "${path}": the link must start with https://`)
  }

  // ---- frozen ids ----
  for (const [name, list, known] of [
    ["item id", input.frozenItemIds, itemPlace],
    ["region key", input.frozenRegionKeys, regionPlace],
  ] as const) {
    const seen = new Set<string>()
    for (const id of list) {
      if (seen.has(id)) out.push(`frozen ${name} ${id} is listed twice`)
      seen.add(id)
      if (!known.has(id)) out.push(`frozen ${name} ${id} is missing from the content (an id never goes away)`)
    }
  }

  // ---- the needs ----
  const needsOf = (label: string, needs: readonly Need[]): void => {
    needs.forEach((n, i) => {
      if (blank(n.why)) out.push(`${label}: need ${i + 1} has no reason`)
      if (n.target.kind === "region") {
        if (!regionPlace.has(n.target.key)) out.push(`${label}: need ${i + 1} points at the region ${n.target.key}, which does not exist`)
      } else if (!itemPlace.has(n.target.id)) {
        out.push(`${label}: need ${i + 1} points at the item ${n.target.id}, which does not exist`)
      }
    })
  }
  for (const [key, needs] of Object.entries(input.regionNeeds)) {
    if (!regionPlace.has(key)) {
      out.push(`needs: the region ${key} does not exist`)
      continue
    }
    needsOf(`needs of region ${key}`, needs)
  }
  for (const [id, needs] of Object.entries(input.itemNeeds)) {
    if (!itemPlace.has(id)) {
      out.push(`needs: the item ${id} does not exist`)
      continue
    }
    needsOf(`needs of item ${id}`, needs)
  }

  // A need must never point at something later in the same subject, and no chain of needs may run in a circle.
  // The graph: a node waits for the nodes it points at. Items wait for the item before them in the region and for the
  // region before (its gate); a region (its gate) waits for all its items; a need adds an edge.
  const edges = new Map<string, string[]>()
  const edge = (from: string, to: string) => {
    const list = edges.get(from) ?? []
    list.push(to)
    edges.set(from, list)
  }
  const regionNode = (key: string) => `region:${key}`
  const itemNode = (id: string) => `item:${id}`
  const targetNode = (n: Need) => (n.target.kind === "region" ? regionNode(n.target.key) : itemNode(n.target.id))
  const targetAt = (n: Need): { subject: string; regionOrder: number; place: number | null } | null => {
    if (n.target.kind === "region") {
      const r = regionPlace.get(n.target.key)
      return r ? { subject: r.subject, regionOrder: r.order, place: null } : null
    }
    const p = itemPlace.get(n.target.id)
    return p ? { subject: p.subject, regionOrder: p.regionOrder, place: p.place } : null
  }
  for (const [key, r] of regionPlace) {
    for (const id of r.itemIds) edge(regionNode(key), itemNode(id))
  }
  for (const [id, p] of itemPlace) {
    const region = regionPlace.get(p.regionKey)
    if (!region) continue
    if (p.place > 0) {
      const before = region.itemIds[p.place - 1]
      if (before !== undefined) edge(itemNode(id), itemNode(before))
    } else if (region.order > 0) {
      const subject = subjects.find((s) => s.id === p.subject)
      const before = subject?.regions[region.order - 1]
      if (before) edge(itemNode(id), regionNode(before.key))
    }
    for (const n of [...(input.regionNeeds[p.regionKey] ?? []), ...(input.itemNeeds[id] ?? [])]) edge(itemNode(id), targetNode(n))
  }
  // Inside one subject a need must point at something EARLIER. A region need: an earlier region. An item need: an
  // item of an earlier region, or an item before it in the same region (a region target must be an earlier region).
  for (const [key, needs] of Object.entries(input.regionNeeds)) {
    const r = regionPlace.get(key)
    if (!r) continue
    for (const n of needs) {
      const t = targetAt(n)
      if (t && t.subject === r.subject && t.regionOrder >= r.order) out.push(`needs of region ${key}: a need points at ${n.target.kind === "region" ? n.target.key : n.target.id}, which is not before it in the same subject`)
    }
  }
  for (const [id, needs] of Object.entries(input.itemNeeds)) {
    const p = itemPlace.get(id)
    if (!p) continue
    for (const n of needs) {
      const t = targetAt(n)
      if (!t || t.subject !== p.subject) continue
      const later = n.target.kind === "region" ? t.regionOrder >= p.regionOrder : t.regionOrder > p.regionOrder || (t.regionOrder === p.regionOrder && (t.place ?? 0) >= p.place)
      if (later) out.push(`needs of item ${id}: a need points at ${n.target.kind === "region" ? n.target.key : n.target.id}, which is not before it in the same subject`)
    }
  }
  // cycle search (depth first)
  const state = new Map<string, 1 | 2>() // 1 = on the path, 2 = done
  const cycle: string[] = []
  const visit = (node: string, path: string[]): boolean => {
    state.set(node, 1)
    path.push(node)
    for (const next of edges.get(node) ?? []) {
      const s = state.get(next)
      if (s === 1) {
        cycle.push(...path.slice(path.indexOf(next)), next)
        return true
      }
      if (s === undefined && visit(next, path)) return true
    }
    path.pop()
    state.set(node, 2)
    return false
  }
  for (const node of edges.keys()) {
    if (state.get(node) === undefined && visit(node, [])) {
      out.push(`the needs run in a circle: ${cycle.join(" -> ")}`)
      break
    }
  }

  return [...new Set(out)]
}

// Every source path that a saved session uses must still be in the catalogue (B5: a source is retired, never deleted).
// A retired source is fine. Packet 12C passes the learn_via of the saved sessions.
export function usedSourceProblems(used: readonly string[], sources: readonly SourceNode[]): string[] {
  const out: string[] = []
  for (const path of new Set(used)) {
    if (!isSourcePath(path)) out.push(`a saved session has the source "${path}", which has the wrong shape`)
    else if (findSource(path, sources) === null) out.push(`a saved session uses the source "${path}", which is no longer in the catalogue`)
  }
  return out
}

// Every item or gate that a saved session or a saved fact uses must still exist (Q22). `used` holds the learn_what texts
// ("item:PY-13", "gate:python/D").
export function usedWhatProblems(used: readonly string[], subjects: readonly LearnSubject[]): string[] {
  const items = new Set<string>()
  const regions = new Set<string>()
  for (const s of subjects) {
    for (const r of s.regions) {
      regions.add(r.key)
      for (const i of r.items) items.add(i.id)
    }
  }
  const out: string[] = []
  for (const text of new Set(used)) {
    const what = parseWhat(text)
    if (what === null) out.push(`a saved session has the label "${text}", which has the wrong shape`)
    else if (what.kind === "item" && !items.has(what.id)) out.push(`a saved session works on the item ${what.id}, which no longer exists`)
    else if (what.kind === "gate" && !regions.has(`${what.subject}/${what.region}`)) out.push(`a saved session works on the gate ${what.subject}/${what.region}, which no longer exists`)
  }
  return out
}
// AB:LEARN.DATA-CHECK:END
