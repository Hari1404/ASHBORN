// AB:LEARN.SOURCES:START
// Reads the catalogue of "Learning from" sources (src/data/learn/sources.ts).
// Pure functions: no screen, no database call. The tests are in src/lib/learnSources.test.ts.
// The SHAPE of a source path is also checked by the database (Packet 12C): see CONNECTIONS.md C66.
import { LEARN_SOURCES, type SourceCap, type SourceNode } from "../data/learn/sources"

// The shape of a stored source path: parts made of small letters, digits, dots and hyphens, joined by
// one slash, no empty part, at most 80 characters. The shape says nothing about whether the source exists.
export const SOURCE_PATH_SHAPE = /^[a-z0-9][a-z0-9.-]*(\/[a-z0-9][a-z0-9.-]*)*$/
export const SOURCE_PATH_MAX_LENGTH = 80

export function isSourcePath(text: unknown): text is string {
  return typeof text === "string" && text.length <= SOURCE_PATH_MAX_LENGTH && SOURCE_PATH_SHAPE.test(text)
}

// The nodes from the top of the catalogue down to the node of the path, or null when the path is not in it.
// A retired source is still found: an old session must still draw (B5).
export function sourceChain(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceNode[] | null {
  if (!isSourcePath(path)) return null
  const parts = path.split("/")
  const chain: SourceNode[] = []
  let level: readonly SourceNode[] = catalogue
  for (let depth = 1; depth <= parts.length; depth++) {
    const wanted = parts.slice(0, depth).join("/")
    const node = level.find((n) => n.path === wanted)
    if (!node) return null
    chain.push(node)
    level = node.children ?? []
  }
  return chain
}

export function findSource(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceNode | null {
  const chain = sourceChain(path, catalogue)
  return chain ? (chain[chain.length - 1] ?? null) : null
}

// The words of the tap line for a source, for example "Coursera IBM Python 1.3". Null when unknown.
export function sourceSay(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): string | null {
  return findSource(path, catalogue)?.say ?? null
}

// The end cap of a pill: the cap of the node, or of its nearest parent that has one. Own practice has none.
export function sourceCapOf(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceCap | null {
  const chain = sourceChain(path, catalogue)
  if (!chain) return null
  for (let i = chain.length - 1; i >= 0; i--) {
    const cap = chain[i]?.cap
    if (cap) return cap
  }
  return null
}

// True when the source or one of its parents is retired. It still draws, but the picker no longer offers it.
export function sourceIsRetired(path: string, catalogue: readonly SourceNode[] = LEARN_SOURCES): boolean {
  const chain = sourceChain(path, catalogue)
  return chain ? chain.some((n) => n.retired === true) : false
}

// What the picker lists under a source (null = the top level): the children that are not retired.
export function sourceChoices(path: string | null, catalogue: readonly SourceNode[] = LEARN_SOURCES): SourceNode[] {
  const level = path === null ? catalogue : (findSource(path, catalogue)?.children ?? [])
  return level.filter((n) => n.retired !== true)
}

// Every path of the catalogue, parents before children.
export function sourcePathsOf(catalogue: readonly SourceNode[] = LEARN_SOURCES): string[] {
  const out: string[] = []
  const walk = (nodes: readonly SourceNode[]) => {
    for (const n of nodes) {
      out.push(n.path)
      walk(n.children ?? [])
    }
  }
  walk(catalogue)
  return out
}

// The validation of the catalogue (the first part of the validation script of DECISIONS_LEARN.md 12a).
// Returns the list of problems; an empty list means the catalogue is sound.
export function validateCatalogue(catalogue: readonly SourceNode[] = LEARN_SOURCES): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  const hex = /^#[0-9a-f]{6}$/
  const walk = (nodes: readonly SourceNode[], parent: SourceNode | null) => {
    for (const n of nodes) {
      if (!isSourcePath(n.path)) problems.push(`bad path shape: ${n.path}`)
      if (seen.has(n.path)) problems.push(`duplicate path: ${n.path}`)
      seen.add(n.path)
      if (parent === null) {
        if (n.path.includes("/")) problems.push(`top level path has a slash: ${n.path}`)
      } else if (!n.path.startsWith(`${parent.path}/`) || n.path.slice(parent.path.length + 1).includes("/")) {
        problems.push(`${n.path} is not directly under ${parent.path}`)
      }
      if (n.title.trim() === "") problems.push(`empty title: ${n.path}`)
      if (n.say.trim() === "") problems.push(`empty say line: ${n.path}`)
      if (n.cap && !hex.test(n.cap.color)) problems.push(`bad cap colour: ${n.path}`)
      if (n.cap && n.cap.letter !== null && n.cap.letter.length !== 1) problems.push(`cap letter is not one character: ${n.path}`)
      if (n.hours !== undefined && !(Number.isFinite(n.hours) && n.hours > 0)) problems.push(`bad hours: ${n.path}`)
      if (n.headlineHours !== undefined) {
        const [low, high] = n.headlineHours
        if (!(low > 0 && high >= low)) problems.push(`bad headline hours: ${n.path}`)
      }
      walk(n.children ?? [], n)
    }
  }
  walk(catalogue, null)
  return problems
}
// AB:LEARN.SOURCES:END
