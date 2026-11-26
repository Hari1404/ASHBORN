// AB:LEARN.NEEDS:START
// What must be done first: the structured needs of Learn (DECISIONS_LEARN.md Q12, F8, 19d).
// Written by hand from two things: the "needs" sentence of each region in the pack (kept unchanged as
// needsText in tier1.ts) and the list of Q12 (NumPy needs Python A to F, pandas needs NumPy A to C, Git needs
// the terminal, probability needs loops and functions, linear algebra region C needs NumPy, Python region I
// needs the terminal). The sentences also hold things that are not needs of this kind (Windows notes, the data
// file, "no python -c one-liners", Tier 2 pointers): they stay in needsText and are NOT written here.
//
// HARD: the thing is locked until the need is met (the pack says "needs first"). Q12.
// SOFT: a hint, shown as "learn alongside", never a lock.
//
// A need is met when
//   - a region need: the gate of that region is passed (a region ends when its gate is passed, DECISIONS_LEARN.md 9b),
//   - an item need: that item is done.
//
// Inside one subject the order already makes a region wait for every region before it, so the needs between
// regions of the same subject are for the chips on the card ("Needs first": the reason), not for the lock.
// The tests check that no need points at something that comes later, and that no chain of needs runs in a circle.
//
// The WHY is the pack's reason in a few plain words. It is shown to him on the chip.
//
// Planner's readings where the pack is not exact (the tests do not guard these, they are decisions):
//   - Probability: only Python D and E (loops, functions) are HARD. The `math.comb` of PB-4 is a SOFT item need on
//     PY-35 (`import`), the nearest item that shows how a module is used. The NumPy random generator for
//     probability C and D is SOFT (NumPy region NP-E).
//   - Git: the terminal (both terminal regions) is HARD for region A. Python (PY-1) is SOFT for A and B: it is
//     only used to run a one-line main.py.
//   - Linear algebra: LA-5 has a SOFT need on NP-21 (the pack says "do NP-21 before LA-5", Q12 keeps regions A
//     and B open). Region C has a HARD need on NP-22.
// Safe to tune alone: the why words, and a need from HARD to SOFT or back. NOT safe: the target of a need
// (it must exist; the tests check).

export type NeedTarget = { kind: "region"; key: string } | { kind: "item"; id: string }
export type Need = { target: NeedTarget; hard: boolean; why: string }

const hard = (key: string, why: string): Need => ({ target: { kind: "region", key }, hard: true, why })
const soft = (key: string, why: string): Need => ({ target: { kind: "region", key }, hard: false, why })
const hardItem = (id: string, why: string): Need => ({ target: { kind: "item", id }, hard: true, why })
const softItem = (id: string, why: string): Need => ({ target: { kind: "item", id }, hard: false, why })

// Regions A to F of Python, each with the same reason.
const pythonAtoF = (why: string): Need[] => ["A", "B", "C", "D", "E", "F"].map((r) => hard(`python/${r}`, why))

// Needs of a region, by its key (the subject id, a slash and the region id). A region that is missing here needs nothing.
export const REGION_NEEDS: Readonly<Record<string, readonly Need[]>> = {
  // Python
  "python/B": [hard("python/A", "variables, `print`")],
  "python/C": [hard("python/A", "variables, `input`")],
  "python/D": [hard("python/A", "variables"), hard("python/C", "conditions")],
  "python/E": [hard("python/A", "variables"), hard("python/C", "conditions"), hard("python/D", "loops")],
  "python/F": [
    hard("python/A", "variables"),
    hard("python/C", "conditions"),
    hard("python/D", "loops"),
    hard("python/E", "functions"),
    soft("python/B", "slicing works as in region B"),
  ],
  "python/G": [
    hard("python/C", "conditions"),
    hard("python/D", "loops"),
    hard("python/F", "lists"),
    hardItem("PY-24", "tuples: the pairs that `.items()` gives"),
  ],
  "python/H": pythonAtoF("PY-31 to PY-34 use functions, loops, lists, strings and `sorted`"),
  "python/I": [
    ...pythonAtoF("regions A to F"),
    hard("terminal/TA", "terminal commands: make a folder, change into it"),
    hard("terminal/TB", "terminal commands: copy a file, delete a folder, save output with `>`, run a file"),
  ],
  "python/J": [...pythonAtoF("regions A to F"), hardItem("PY-34", "`assert`"), hardItem("PY-35", "`import math`")],
  "python/K": [...pythonAtoF("loops, functions, lists"), hardItem("PY-35", "`import`")],
  // Terminal
  "terminal/TB": [hard("terminal/TA", "`mkdir`, `cd`, `ls`")],
  // NumPy
  "numpy/NP-A": [...pythonAtoF("running a file, `pip install`"), hard("python/I", "running a file, `pip install`")],
  "numpy/NP-B": [hard("numpy/NP-A", "arrays made and described")],
  "numpy/NP-C": [hard("numpy/NP-B", "reaching into arrays")],
  "numpy/NP-D": [hard("numpy/NP-C", "arithmetic on whole arrays")],
  "numpy/NP-E": [hard("numpy/NP-D", "shape and order"), hard("python/K", "the `random` module and seeds")],
  "numpy/NP-F": [hard("numpy/NP-C", "broadcasting"), hard("numpy/NP-D", "shapes, transpose")],
  // pandas
  "pandas/PD-F": [hard("numpy/NP-A", "arrays"), hard("numpy/NP-B", "reaching into arrays"), hard("numpy/NP-C", "arithmetic on arrays")],
  "pandas/PD-G": [hard("pandas/PD-F", "a table and its columns")],
  "pandas/PD-H": [hard("pandas/PD-G", "reaching into a table"), hardItem("NP-10", "the standard deviation")],
  "pandas/PD-I": [hard("pandas/PD-G", "reaching into a table"), hard("pandas/PD-H", "new columns and summaries")],
  "pandas/PD-J": [hard("pandas/PD-G", "reaching into a table"), hard("pandas/PD-H", "new columns and summaries")],
  "pandas/PD-K": [hard("pandas/PD-G", "reaching into a table"), hard("pandas/PD-J", "gaps, types and names")],
  // Linear algebra
  "la/C": [hardItem("NP-22", "matrices in NumPy: the `@` product")],
  // Probability
  "prob/A": [hard("python/D", "loops"), hard("python/E", "functions")],
  "prob/C": [soft("numpy/NP-E", "NumPy's random generator")],
  "prob/D": [soft("numpy/NP-E", "NumPy's random generator")],
  // Git
  "git/A": [
    hard("terminal/TA", "the terminal"),
    hard("terminal/TB", "the terminal"),
    softItem("PY-1", "Python only runs a one-line `main.py`"),
  ],
  "git/B": [softItem("PY-1", "Python only runs a one-line `main.py`")],
}

// Needs of one item, by its id (needs that belong to one item and not to the whole region).
export const ITEM_NEEDS: Readonly<Record<string, readonly Need[]>> = {
  "PY-10": [soft("python/B", "the strings")],
  "PY-12": [soft("python/B", "the strings")],
  "TM-7": [hardItem("PY-1", "Python installed")],
  "LA-5": [softItem("NP-21", "NumPy's `@`: do NP-21 before this item")],
  "PB-4": [softItem("PY-35", "`math.comb` is used through `import math`")],
}
// AB:LEARN.NEEDS:END
