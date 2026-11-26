// AB:LEARN.FROZEN:START
// The ids of Tier 1 that have shipped (DECISIONS_LEARN.md Q22). They never change and never go away: a saved
// session, a started item and a passed gate store them. The checks in src/lib/learnData.ts fail when one of
// them is missing from src/data/learn/tier1.ts. Adding a new id to the content is fine, but add it here in
// the same change, so it is frozen from then on. Never reuse an id for something else.
// The items are in the order of the content (subject by subject, as in tier1.ts).

// 147 items.
export const FROZEN_ITEM_IDS: readonly string[] = [
  "PY-1", "PY-2", "PY-3", "PY-4", "PY-5", "PY-6", "PY-7", "PY-8", "PY-9", "PY-10", "PY-11", "PY-12",
  "PY-13", "PY-14", "PY-15", "PY-16", "PY-17", "PY-18", "PY-19", "PY-20", "PY-21", "PY-22", "PY-23",
  "PY-24", "PY-25", "PY-26", "PY-27", "PY-28", "PY-29", "PY-30", "PY-31", "PY-32", "PY-33", "PY-34",
  "PY-35", "PY-36", "PY-37", "PY-38", "PY-39", "PY-40", "PY-41", "PY-42", "PY-43", "PY-44", "NP-1",
  "NP-2", "NP-3", "NP-4", "NP-5", "NP-6", "NP-7", "NP-8", "NP-9", "NP-10", "NP-11", "NP-18", "NP-19",
  "NP-12", "NP-13", "NP-14", "NP-20", "NP-15", "NP-16", "NP-17", "NP-23", "NP-21", "NP-22", "PD-1",
  "PD-2", "PD-3", "PD-23", "PD-4", "PD-5", "PD-6", "PD-7", "PD-8", "PD-13", "PD-14", "PD-15", "PD-9",
  "PD-10", "PD-11", "PD-22", "PD-16", "PD-17", "PD-18", "PD-12", "PD-19", "PD-20", "PD-21", "PD-24",
  "PD-25", "TM-1", "TM-2", "TM-3", "TM-4", "TM-5", "TM-6", "TM-7", "GT-1", "GT-2", "GT-3", "GT-4", "GT-5",
  "GT-6", "GT-7", "GT-8", "GT-9", "GT-10", "GT-11", "GT-12", "GT-13", "GT-14", "GT-15", "GT-16", "GT-17",
  "GT-18", "GT-19", "GT-20", "LA-1", "LA-2", "LA-3", "LA-4", "LA-5", "LA-6", "LA-7", "LA-8", "LA-9",
  "LA-10", "LA-11", "LA-12", "LA-13", "PB-1", "PB-2", "PB-3", "PB-4", "PB-5", "PB-6", "PB-7", "PB-8",
  "PB-9", "PB-10", "PB-11", "PB-12", "PB-13", "PB-14", "PB-15"
]

// 36 regions: the subject id, a slash and the region id. The same text is the gate (gate:python/D).
export const FROZEN_REGION_KEYS: readonly string[] = [
  "python/A", "python/B", "python/C", "python/D", "python/E", "python/F", "python/G", "python/H",
  "python/I", "python/J", "python/K", "numpy/NP-A", "numpy/NP-B", "numpy/NP-C", "numpy/NP-D",
  "numpy/NP-E", "numpy/NP-F", "pandas/PD-F", "pandas/PD-G", "pandas/PD-H", "pandas/PD-I", "pandas/PD-J",
  "pandas/PD-K", "terminal/TA", "terminal/TB", "git/A", "git/B", "git/C", "git/D", "la/A", "la/B", "la/C",
  "prob/A", "prob/B", "prob/C", "prob/D"
]
// AB:LEARN.FROZEN:END
