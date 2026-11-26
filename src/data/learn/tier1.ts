// AB:LEARN.TIER1-DATA:START
// The Tier 1 content of Learn: 7 subjects, 36 regions, 147 items, 36 region tasks (DECISIONS_LEARN.md 8a, 12a, 19d).
// DATA ONLY. Nothing in the app imports this file yet. The rules that read it are in src/lib/learnRules.ts
// and the checks of it are in src/lib/learnData.ts.
//
// WHERE IT COMES FROM (nothing was rewritten):
//   - id, t (title), y (what you can do), c (the check), a (the answer), o (Windows and other notes),
//     the region (id, n, idea, needsText) and the region task (t, u, k, a): the hub mock's data block,
//     copied word for word. Tier 1 is FINAL (L-57): do not rewrite a check or an answer.
//   - learn ("In this item you will learn") and ab ("By the end you should be able to", with the kind of
//     ability): the item card content work, checkpoint 9 (ashborn_content_work_cp9_final.zip).
//     The kinds are write, predict, read, fix, say and pick. (DECISIONS_LEARN.md 19d calls the last two
//     explain and choose: the stored names are say and pick; the screen picks the icon.)
//   - via ("Where to learn": the Coursera lesson) and src (other reading with its link): the layout page
//     ASHBORN_Learn__item_card_layout.html. They are DRAFT, the planner's reading of the lesson titles
//     (C2), not checked against the lessons. A via path is always a path of src/data/learn/sources.ts:
//     the lesson block where the catalogue has the block (IBM Python modules 1 and 3), otherwise the
//     module (IBM Python modules 2 and 4) or the course (Math courses 1 and 3). "where" is the words of
//     the card.
//   - ONE line is DRAFT and not from the pack: the idea of region git/D. It is empty in the hub mock, the layout
//     page and the subjects page, so it was written from the y lines of GT-16 to GT-20 (clone, push, fetch and
//     pull, a rejected push). Hari reads it; the build script of the planner stops the day the pack has its own.
//   - code (the letters in front of every item id of a subject: PY, NP, PD, TM, GT, LA, PB): the subjects
//     page ASHBORN_Learn_subjects_item_card.html. The tests check that every id starts with it.
//
// IDS ARE FROZEN (Q22): an item id and a region key never change and never go away. The list is in
// src/data/learn/frozenIds.ts and a test fails if one is missing. A region key is the subject id, a slash
// and the region id (python/D): it is also the gate, as in gate:python/D.
// The needs (what must be done first) are NOT here: they are in src/data/learn/needs.ts.
// The text is plain ASCII: every other character is written as a \u escape.
import type { SubjectId } from "./subjectColours"

export type AbilityKind = "write" | "predict" | "read" | "fix" | "say" | "pick"
export type Ability = readonly [AbilityKind, string]

// The Coursera lesson that teaches an item (DRAFT). tags: what the lesson holds (video, reading, lab, quiz).
export type ItemVia = { path: string; where: string; tags: readonly string[] }

// Other reading for an item: a title, a link and a note about what to read there.
export type ItemReading = { title: string; url: string; note: string }

export type LearnItem = {
  id: string
  t: string
  y: string
  c: string
  a: string
  o?: string // Windows and other notes; missing when there is none
  learn: readonly string[]
  ab: readonly Ability[]
  via?: ItemVia
  src?: readonly ItemReading[]
}

export type LearnTask = { t: string; u: string; k: string; a: string }

export type LearnRegion = {
  key: string // subject id, slash, region id
  id: string
  n: string
  idea: string
  needsText: string // the pack's sentence, unchanged; the structured form is in needs.ts
  items: readonly LearnItem[]
  task: LearnTask
}

export type LearnSubject = { id: SubjectId; name: string; code: string; regions: readonly LearnRegion[] }

export type CourseLink = { name: string; url: string }

// The subjects in the order of the colour families (python, numpy, pandas, terminal, git, la, prob);
// the regions and the items are in the order he learns them.
export const TIER1_SUBJECTS: readonly LearnSubject[] = [
 {
  "id": "python",
  "name": "Python",
  "code": "PY",
  "regions": [
   {
    "key": "python/A",
    "id": "A",
    "n": "Values and variables",
    "idea": "a program keeps values under names, computes with them and shows the result.",
    "needsText": "nothing. (PY-1 gets Python running; the few terminal commands it may use are in section 3.)",
    "items": [
     {
      "id": "PY-1",
      "t": "Get Python running and run a file",
      "y": "run a program from a file (not only by typing at the `>>>` prompt) and make it print something.",
      "c": "Install Python 3 if you have not. Save a file `hello.py` that holds one line, `print(\"Hello, Tier 1\")`, and run it. Change the line to `print(2 + 3)` and run it again. Then run a file that holds `import sys` and `print(sys.version_info[0])`. What does each run show?",
      "a": "the first run shows `Hello, Tier 1`; the second shows `5`; the third shows `3` (the first number of the version: you are on Python 3).",
      "o": "Windows (not run here, L-06): after installing Python from python.org, `py hello.py` always works, and `python hello.py` works when the installer's 'add Python to PATH' box was ticked; if one of them opens the Microsoft Store or says it is not found, use the other. On Windows the launcher `py` is the usual start (it is part of the python.org installer; this is from the installer's behaviour as I know it, not checked on a machine here). Use Git Bash or PowerShell; both run `python hello.py`.",
      "learn": [
       "a program can be a file you run, not only lines typed at the `>>>` prompt",
       "install Python 3 first if you do not have it",
       "save `hello.py` with one line: `print(\"Hello, Tier 1\")`",
       "run it and it shows `Hello, Tier 1`",
       "change the line to `print(2 + 3)` and run it again: it shows `5`",
       "a file can also use `import sys` and `print(sys.version_info[0])`, which shows `3`",
       "that number is the first number of the version: you are on Python 3",
       "each run shows only what `print` prints",
       "on Windows after installing from python.org, `py hello.py` runs a file (the item says this was not run)"
      ],
      "ab": [
       [
        "write",
        "Save `hello.py` with one `print` line and run it"
       ],
       [
        "write",
        "Change the line to `print(2 + 3)` and run it again"
       ],
       [
        "write",
        "Run a file that prints `sys.version_info[0]`"
       ],
       [
        "read",
        "Say what each of the three runs shows"
       ],
       [
        "fix",
        "Run the file from the folder it is saved in"
       ],
       [
        "say",
        "Say the difference between typing at `>>>` and running a file"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.1",
       "where": "Module 1 \u00b7 1.1 Python and Jupyter, first program",
       "tags": [
        "video",
        "reading",
        "lab"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Using the Interpreter",
        "url": "https://docs.python.org/3/tutorial/interpreter.html",
        "note": "Chapter 2. Run Python and a file."
       }
      ]
     },
     {
      "id": "PY-2",
      "t": "Variables: a value under a name",
      "y": "store a value under a name, show it, and change it later.",
      "c": "Store the text `\"Ada\"` in `name` and the number 36 in `age`. Print them on one line, separated by a space. Add one to `age`, then print the two again on one line.",
      "a": "the first line is `Ada 36`, the second is `Ada 37`.",
      "learn": [
       "a variable is a name that holds a value",
       "`name = \"Ada\"` stores the text Ada under the name `name`",
       "text goes in quotes and a number does not: `age = 36`",
       "`print(name, age)` shows both on one line, separated by a space: `Ada 36`",
       "`age = age + 1` reads the old value, adds one and stores the result under the same name",
       "printing again shows `Ada 37`",
       "a name can be given a new value later, which is why it is called a variable",
       "the check proves it with two lines: `Ada 36` and `Ada 37`"
      ],
      "ab": [
       [
        "write",
        "Store text in `name` and a number in `age`"
       ],
       [
        "write",
        "Print both on one line with a space between"
       ],
       [
        "write",
        "Add one to `age` and print again"
       ],
       [
        "predict",
        "Predict the second line before you run"
       ],
       [
        "read",
        "Read `Ada 36` and `Ada 37` and say what changed"
       ],
       [
        "say",
        "Say what a variable is"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.3",
       "where": "Module 1 \u00b7 1.3 Expressions and variables",
       "tags": [
        "video",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-3",
      "t": "Numbers and arithmetic",
      "y": "use `+ - * / // % **` and know which one Python does first.",
      "c": "Predict, then run: `7 / 2`, `7 // 2`, `7 % 2`, `2 ** 10`, `2 + 3 * 4`, `(2 + 3) * 4`, `-7 // 2` and `-7 % 2`.",
      "a": "`7 / 2` is 3.5; `7 // 2` is 3; `7 % 2` is 1; `2 ** 10` is 1024; `2 + 3 * 4` is 14 (multiplication first); `(2 + 3) * 4` is 20; `-7 // 2` is -4 (it rounds down, not towards zero); `-7 % 2` is 1.",
      "learn": [
       "the operators are `+ - * / // % **`: add, subtract, multiply, divide, divide and keep the whole part, remainder, power",
       "`7 / 2` is 3.5: plain division always gives a decimal",
       "`7 // 2` is 3: it keeps only the whole part",
       "`7 % 2` is 1: the remainder",
       "`2 ** 10` is 1024",
       "multiplication comes before addition: `2 + 3 * 4` is 14",
       "brackets go first: `(2 + 3) * 4` is 20",
       "`-7 // 2` is -4: it rounds down, not towards zero",
       "`-7 % 2` is 1",
       "predict each answer first, then run it"
      ],
      "ab": [
       [
        "predict",
        "Predict each of the eight results before running"
       ],
       [
        "write",
        "Use `/`, `//`, `%` and `**` in one program"
       ],
       [
        "read",
        "Say which operator Python does first in `2 + 3 * 4`"
       ],
       [
        "write",
        "Use brackets to change the order"
       ],
       [
        "say",
        "Say what `//` and `%` give for negative numbers"
       ],
       [
        "fix",
        "Fix a sum that gave 14 when you wanted 20"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.3",
       "where": "Module 1 \u00b7 1.3 Expressions and variables",
       "tags": [
        "video",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-4",
      "t": "Types, and converting between them",
      "y": "tell `int`, `float`, `str` and `bool` apart, convert with `int()`, `float()` and `str()`, and say why `\"3\" + 4` fails.",
      "c": "What do `type(3)`, `type(3.0)`, `type(\"3\")` and `type(True)` show (one line)? What are `int(\"42\") + 1`, `float(\"2.5\") * 2`, `str(7) + \"1\"` and `int(3.9)` (one line)? What is the name of the error that `\"3\" + 4` raises?",
      "a": "`<class 'int'> <class 'float'> <class 'str'> <class 'bool'>`; then 43, 5.0, 71 and 3 (`int()` cuts off the decimals, it does not round); the error is a `TypeError`.",
      "learn": [
       "four basic types: `int` (whole number), `float` (decimal), `str` (text) and `bool` (True or False)",
       "`type(3)`, `type(3.0)`, `type(\"3\")` and `type(True)` show `<class 'int'> <class 'float'> <class 'str'> <class 'bool'>`",
       "`int(\"42\") + 1` is 43",
       "`float(\"2.5\") * 2` is 5.0",
       "`str(7) + \"1\"` is `71`: two pieces of text joined",
       "`int(3.9)` is 3: it cuts off the decimals and does not round",
       "`\"3\" + 4` raises a `TypeError`, because text and a number do not add",
       "convert first, then calculate"
      ],
      "ab": [
       [
        "write",
        "Print the type of an int, a float, a str and a bool"
       ],
       [
        "write",
        "Convert with `int()`, `float()` and `str()`"
       ],
       [
        "predict",
        "Predict `int(3.9)` before you run it"
       ],
       [
        "read",
        "Read the `TypeError` from `\"3\" + 4`"
       ],
       [
        "fix",
        "Fix `\"3\" + 4` with a conversion"
       ],
       [
        "say",
        "Say why `str(7) + \"1\"` is `71`"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.2",
       "where": "Module 1 \u00b7 1.2 Types",
       "tags": [
        "video",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-5",
      "t": "Reading input: `input()` gives text",
      "y": "read a line the user types and use it as a number.",
      "c": "Write a program that reads two lines with `input()` (no prompt text), then prints their sum as numbers, and on the next line prints `a + b` with no conversion. The user types `12` and then `30`. What are the two printed lines?",
      "a": "the sum is `42`; without the conversion the line is `1230` (two pieces of text joined, not added).",
      "learn": [
       "`input()` waits for a line and gives it back as text",
       "it is always text, even when the user types digits",
       "the user types `12` and then `30`",
       "`int(input())` turns a line into a whole number",
       "the sum as numbers is `42`",
       "without the conversion, `a + b` joins the text and prints `1230`",
       "two pieces of text are joined, not added"
      ],
      "ab": [
       [
        "write",
        "Read two lines with `input()`"
       ],
       [
        "write",
        "Convert both lines with `int()` and print their sum"
       ],
       [
        "write",
        "Print `a + b` with no conversion on the next line"
       ],
       [
        "predict",
        "Predict the two printed lines for 12 and 30"
       ],
       [
        "say",
        "Say why the unconverted line is `1230`"
       ],
       [
        "fix",
        "Fix a program that joined numbers instead of adding them"
       ]
      ]
     }
    ],
    "task": {
     "t": "Temperature converter",
     "u": "variables, arithmetic, types, `input`",
     "k": "Write a program that reads a temperature in whole degrees Celsius with `input()`, converts it to Fahrenheit (multiply by 9, divide by 5, add 32) and prints the result. Run it for 100, for 0 and for -40.",
     "a": "212.0, 32.0, -40.0 (the results are floats because `/` always gives a float; -40 is the one temperature that is the same on both scales)."
    }
   },
   {
    "key": "python/B",
    "id": "B",
    "n": "Text",
    "idea": "text is a sequence of characters you can pick apart, change and format.",
    "needsText": "region A (variables, `print`).",
    "items": [
     {
      "id": "PY-6",
      "t": "Index and slice text",
      "y": "pick one character or a piece out of a string by position, counting from the front or from the back.",
      "c": "Let `s = \"machine learning\"`. Print `s[0]`, `s[-1]`, `s[8:]`, `s[:7]`, `s[2:5]`, `s[::-1]` and `len(s)`, one per line.",
      "a": "`m`, `g`, `learning`, `machine`, `chi`, `gninrael enihcam` (the whole text backwards) and 16. The stop position of a slice is not included: `s[2:5]` is positions 2, 3 and 4.",
      "learn": [
       "text is a sequence of characters, and each has a position that starts at 0",
       "with `s = \"machine learning\"`, `s[0]` is `m`",
       "`s[-1]` counts from the back: `g`",
       "`s[8:]` is `learning` and `s[:7]` is `machine`",
       "`s[2:5]` is `chi`: positions 2, 3 and 4, because the stop is not included",
       "`s[::-1]` is the whole text backwards: `gninrael enihcam`",
       "`len(s)` is 16, and the space counts"
      ],
      "ab": [
       [
        "write",
        "Pick one character from the front and one from the back"
       ],
       [
        "write",
        "Slice out a piece with `s[2:5]`"
       ],
       [
        "write",
        "Reverse text with `s[::-1]`"
       ],
       [
        "write",
        "Print the length with `len(s)`"
       ],
       [
        "predict",
        "Predict a slice before you print it"
       ],
       [
        "say",
        "Say why the stop position is not included"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.4",
       "where": "Module 1 \u00b7 1.4 String operations",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-7",
      "t": "Change text with methods (a string never changes in place)",
      "y": "use `.strip()`, `.lower()`, `.upper()`, `.replace()`, `.startswith()` and `.count()`, and say why `t.upper()` on its own line changes nothing.",
      "c": "Let `t = \"  Data Science  \"`. Print with `repr(...)` (it shows the quotes and the spaces): `t.strip()`, `t.lower()`, `t.replace(\"Science\", \"Engineering\")`. Print `t.strip().startswith(\"Data\")` and `t.count(\"a\")`. Run `t.upper()` on a line of its own, then print `repr(t)`. Last, try `t[2] = \"d\"` and give the name of the error.",
      "a": "`'Data Science'`, `'  data science  '`, `'  Data Engineering  '`, `True`, 2; after `t.upper()` the variable is still `'  Data Science  '` (a method returns a new string and leaves the old one alone); `t[2] = \"d\"` raises a `TypeError`.",
      "learn": [
       "`.strip()` removes spaces from both ends: `'Data Science'`",
       "`.lower()` makes all letters small: `'  data science  '`",
       "`.replace(\"Science\", \"Engineering\")` swaps a piece of text for another",
       "`repr(...)` shows the quotes and the spaces",
       "`t.strip().startswith(\"Data\")` is True, and `t.count(\"a\")` is 2",
       "a method returns a new string and leaves the old one alone",
       "so `t.upper()` on a line of its own changes nothing: `t` is still `'  Data Science  '`",
       "`t[2] = \"d\"` raises a `TypeError`: a string never changes in place"
      ],
      "ab": [
       [
        "write",
        "Clean text with `.strip()` and `.lower()`"
       ],
       [
        "write",
        "Swap text with `.replace()`"
       ],
       [
        "write",
        "Test text with `.startswith()` and count with `.count()`"
       ],
       [
        "predict",
        "Predict that `t.upper()` alone leaves `t` unchanged"
       ],
       [
        "read",
        "Read the `TypeError` from `t[2] = \"d\"`"
       ],
       [
        "fix",
        "Keep a changed string by assigning the result"
       ],
       [
        "say",
        "Say why a string never changes in place"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.4",
       "where": "Module 1 \u00b7 1.4 String operations",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-8",
      "t": "Split and join",
      "y": "cut text into pieces with `.split()` and glue pieces together with `\"sep\".join(...)`.",
      "c": "Print `\"a,b,,c\".split(\",\")` and the number of pieces `len(...)`. Print `\"one two  three\".split()` (two spaces between the last two words). Print `\"-\".join([\"x\", \"y\", \"z\"])` and `\"\".join([\"x\", \"y\", \"z\"])`.",
      "a": "`['a', 'b', '', 'c']` (the empty piece stays), 4 pieces, `['one', 'two', 'three']` (with no argument, any run of spaces is one cut), `x-y-z` and `xyz`.",
      "o": "the square brackets are a list; lists proper are region F, here you only print them and count the pieces.",
      "learn": [
       "`.split(\",\")` cuts text at every comma: `['a', 'b', '', 'c']`",
       "the empty piece stays, so there are 4 pieces",
       "`.split()` with no argument cuts at any run of spaces: `['one', 'two', 'three']`",
       "`\"-\".join([\"x\", \"y\", \"z\"])` glues the pieces with a separator: `x-y-z`",
       "`\"\".join(...)` glues them with nothing: `xyz`",
       "the square brackets show a list, and lists come in region F",
       "split and join are opposites"
      ],
      "ab": [
       [
        "write",
        "Split text at commas and count the pieces with `len`"
       ],
       [
        "write",
        "Split text with no argument"
       ],
       [
        "write",
        "Join pieces with `\"-\".join(...)`"
       ],
       [
        "write",
        "Join pieces with `\"\".join(...)`"
       ],
       [
        "read",
        "Find the empty piece in `['a', 'b', '', 'c']`"
       ],
       [
        "say",
        "Say why `.split()` with no argument gives no empty piece"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.4",
       "where": "Module 1 \u00b7 1.4 String operations",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-9",
      "t": "Put values into text with f-strings",
      "y": "write `f\"...\"` text with values inside braces, set the decimals (`:.2f`), add thousands commas (`:,`), and pad to a width (`:<8`, `:>8`).",
      "c": "Let `name = \"Ada\"`, `score = 91.456`, `count = 1234567`. Print `Ada scored 91.46` using the variables; print the count as `1,234,567`; print a line made of `name` padded on the right to width 8, a `|`, then `score` with one decimal padded on the left to width 8.",
      "a": "`Ada scored 91.46`, `1,234,567`, and `Ada     |    91.5` (`Ada` and five spaces, the bar, four spaces and `91.5`).",
      "learn": [
       "an f-string starts with `f` and holds values inside braces",
       "`f\"{name} scored {score:.2f}\"` prints `Ada scored 91.46`",
       "`:.2f` sets two decimals",
       "`:,` adds thousands commas: `1,234,567`",
       "`:<8` pads on the right to width 8 and `:>8` pads on the left",
       "`{score:>8.1f}` combines them: width 8, one decimal",
       "the full line is `Ada     |    91.5`: `Ada` and five spaces, a bar, then four spaces and `91.5`"
      ],
      "ab": [
       [
        "write",
        "Put variables into text with an f-string"
       ],
       [
        "write",
        "Set decimals with `:.2f`"
       ],
       [
        "write",
        "Add thousands commas with `:,`"
       ],
       [
        "write",
        "Pad text with `:<8` and `:>8`"
       ],
       [
        "predict",
        "Predict the width of the padded line"
       ],
       [
        "read",
        "Read `Ada     |    91.5` and count the spaces"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m1/1.4",
       "where": "Module 1 \u00b7 1.4 String operations",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     }
    ],
    "task": {
     "t": "Name tag",
     "u": "indexing, methods, split, f-strings",
     "k": "A form gives the text `\"  aDA   loVELACE  \"` (stray spaces, mixed capitals). Write a program that reads one such line with `input()` and prints the name tag `Lovelace, Ada` (surname first, only the first letter of each name a capital) and, on the next line, the initials `A.L.`. Run it for that line and for `\"  gRACE   hOPPER \"`.",
     "a": "`Lovelace, Ada`, `A.L.`, then `Hopper, Grace`, `G.H.`."
    }
   },
   {
    "key": "python/C",
    "id": "C",
    "n": "Decisions",
    "idea": "a program picks what to do from a true-or-false condition.",
    "needsText": "region A (variables, `input`); region B only for the strings in PY-10 and PY-12.",
    "items": [
     {
      "id": "PY-10",
      "t": "Comparisons and booleans",
      "y": "write a condition with `==`, `!=`, `<`, `<=`, `>`, `>=`, and say what `True` and `False` are and how `=` differs from `==`.",
      "c": "Print, on one line separated by spaces: `5 == 5.0`, `\"a\" == \"A\"`, `3 != 4`, `10 >= 10`, `\"apple\" < \"banana\"` and `type(3 > 2)`. Then say what kind of error `if x = 3:` is.",
      "a": "`True False True True True <class 'bool'>`; `if x = 3:` is a `SyntaxError` (`=` stores a value, `==` compares two).",
      "learn": [
       "comparisons give `True` or `False`: `==`, `!=`, `<`, `<=`, `>`, `>=`",
       "`5 == 5.0` is True: numbers compare by value",
       "`\"a\" == \"A\"` is False: capital and small letters differ",
       "`3 != 4` is True and `10 >= 10` is True",
       "`\"apple\" < \"banana\"` is True: text compares in alphabetical order",
       "`type(3 > 2)` is `<class 'bool'>`",
       "`=` stores a value and `==` compares two",
       "`if x = 3:` is a `SyntaxError`"
      ],
      "ab": [
       [
        "write",
        "Print six comparisons on one line"
       ],
       [
        "predict",
        "Predict `True` or `False` for each before you run"
       ],
       [
        "read",
        "Read `<class 'bool'>` and say what a bool is"
       ],
       [
        "say",
        "Say the difference between `=` and `==`"
       ],
       [
        "fix",
        "Fix `if x = 3:` with `==`"
       ],
       [
        "pick",
        "Pick the right comparison operator for a test"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.1",
       "where": "Module 3 \u00b7 3.1 Conditions and branching",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      }
     },
     {
      "id": "PY-11",
      "t": "`if`, `elif`, `else`",
      "y": "make a program run exactly one of several branches, and say why the order and the word `elif` matter.",
      "c": "Write a program that reads a whole number with `input()` and prints `negative`, `zero` or `positive`; run it for -5, 0 and 7. Then, for n = 20, write `if n > 0` printing `positive` followed by a second, separate `if n > 10` printing `big`. What does it print? What does it print if the second one is an `elif` instead?",
      "a": "`negative`, `zero`, `positive`. For n = 20 two separate `if`s print `positive` and `big`; with `elif` only `positive` is printed (once a branch has run, the rest are skipped).",
      "learn": [
       "`if`, `elif` and `else` make exactly one of several branches run",
       "read a whole number with `input()` and print `negative`, `zero` or `positive`",
       "run it for -5, 0 and 7",
       "for n = 20, two separate `if` statements print `positive` and `big`",
       "with `elif` for the second test, only `positive` prints",
       "once a branch has run, the rest are skipped",
       "order matters: the first true branch wins"
      ],
      "ab": [
       [
        "write",
        "Write `if`, `elif` and `else` for negative, zero and positive"
       ],
       [
        "write",
        "Run it for -5, 0 and 7"
       ],
       [
        "predict",
        "Predict what two separate `if`s print for 20"
       ],
       [
        "predict",
        "Predict what an `elif` prints for 20"
       ],
       [
        "say",
        "Say why `elif` makes the second test skip"
       ],
       [
        "fix",
        "Fix two `if`s that should have been one `if` and `elif`"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.1",
       "where": "Module 3 \u00b7 3.1 Conditions and branching",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     },
     {
      "id": "PY-12",
      "t": "Combine conditions: `and`, `or`, `not`, `in`",
      "y": "combine tests with `and`, `or` and `not`, and ask \"is it one of these\" with `in`.",
      "c": "A cinema sells a ticket as follows: free if the age is under 5 or at least 65; otherwise a student ticket if the age is under 25 and the person has an ID; otherwise full price. Write it and run it for (age, has an ID): (20, yes), (20, no), (70, no), (3, no), (30, yes). Then print `not (age < 18)` and `age >= 18` for age 17, and `\"b\" in \"abc\"` and `3 in (1, 2, 4)`.",
      "a": "`student`, `full price`, `free`, `free`, `full price`; for age 17 the line `not (age < 18)`, `age >= 18` prints `False False` (the two say the same thing); the line `\"b\" in \"abc\"`, `3 in (1, 2, 4)` prints `True False`.",
      "learn": [
       "`and` needs both tests true, `or` needs at least one, and `not` flips the answer",
       "free if the age is under 5 or at least 65: `age < 5 or age >= 65`",
       "otherwise a student ticket if the age is under 25 and the person has an ID",
       "otherwise full price",
       "the five cases give `student`, `full price`, `free`, `free`, `full price`",
       "`not (age < 18)` and `age >= 18` say the same thing: for 17 both print `False`",
       "`in` asks 'is it one of these': `\"b\" in \"abc\"` is True and `3 in (1, 2, 4)` is False",
       "put the free test first, so the later tests only run for everyone else"
      ],
      "ab": [
       [
        "write",
        "Write the ticket rule with `and`, `or` and an `if` chain"
       ],
       [
        "write",
        "Run it for the five (age, ID) cases"
       ],
       [
        "predict",
        "Predict the ticket for each case first"
       ],
       [
        "write",
        "Print `not (age < 18)` and `age >= 18` for age 17"
       ],
       [
        "write",
        "Use `in` to test membership"
       ],
       [
        "say",
        "Say why the two age tests say the same thing"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.1",
       "where": "Module 3 \u00b7 3.1 Conditions and branching",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      }
     }
    ],
    "task": {
     "t": "Museum ticket",
     "u": "comparisons, `if`/`elif`/`else`, `and`/`or`",
     "k": "A museum charges by age: under 5 free; 5 to 17 costs 8; 18 to 64 costs 15; 65 and over costs 10. On a Tuesday (the text `Tue`) everyone pays 2 less, but never less than 0. Write a program that reads the age and then the day with `input()` and prints the price. Run it for (4, Mon), (5, Mon), (17, Tue), (18, Tue), (64, Wed), (65, Tue) and (3, Tue).",
     "a": "0, 8, 6, 13, 15, 8, 0. (The edges 4 and 5, 17 and 18, 64 and 65 are where `<` written as `<=` shows up; the last case is why \"never less than 0\" is there.)"
    }
   },
   {
    "key": "python/D",
    "id": "D",
    "n": "Loops",
    "idea": "a program repeats steps, either a counted number of times or until a condition changes.",
    "needsText": "regions A and C (variables, conditions).",
    "items": [
     {
      "id": "PY-13",
      "t": "`for` and `range`",
      "y": "repeat steps a counted number of times with `for i in range(...)`, and say which numbers `range` gives (the start is included, the stop is not).",
      "c": "Print the numbers given by `range(5)`, by `range(2, 6)` and by `range(10, 0, -3)`, each on one line separated by spaces (`print(i, end=\" \")` stays on the same line; a bare `print()` ends it). Then say how many times the body of `for i in range(7, 7)` runs.",
      "a": "`0 1 2 3 4`, `2 3 4 5`, `10 7 4 1`, and 0 (an empty range: the body never runs).",
      "learn": [
       "`for i in range(5)` repeats a step a counted number of times",
       "`range(5)` gives 0 1 2 3 4: it starts at 0 and the stop is not included",
       "`range(2, 6)` gives 2 3 4 5: the start is included and the stop is not",
       "`range(10, 0, -3)` gives 10 7 4 1: a negative step counts down",
       "`print(i, end=\" \")` stays on the same line and a bare `print()` ends it",
       "`range(7, 7)` is empty, so the body runs 0 times",
       "the loop variable `i` takes each value in turn"
      ],
      "ab": [
       [
        "write",
        "Print the numbers from `range(5)` on one line"
       ],
       [
        "write",
        "Print the numbers from `range(2, 6)` and `range(10, 0, -3)`"
       ],
       [
        "predict",
        "Predict which numbers a `range` gives before you run"
       ],
       [
        "predict",
        "Say how many times `for i in range(7, 7)` runs"
       ],
       [
        "say",
        "Say which end of a `range` is left out"
       ],
       [
        "fix",
        "Fix a `range` that stopped one number too early"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.2",
       "where": "Module 3 \u00b7 3.2 Loops",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     },
     {
      "id": "PY-14",
      "t": "Loop over a sequence",
      "y": "loop straight over the characters of a string, with no counter.",
      "c": "With a `for` loop over the text, count the vowels (`a e i o u`, capital or small) in `\"Educational Technology\"`. Then, with another loop, print each character of `\"cat\"` in capitals, one per line.",
      "a": "9 vowels (E, u, a, i, o, a in the first word; e, o, o in the second); then `C`, `A`, `T`. (Lower-casing the text first is what makes the capital `E` count.)",
      "learn": [
       "a `for` loop can go straight over the characters of a string, with no counter",
       "`for ch in text:` gives one character at a time",
       "`for ch in \"cat\":` runs three times, with `ch` set to `c`, then `a`, then `t`",
       "count the vowels `a e i o u`, capital or small, in `\"Educational Technology\"`: 9",
       "they are E, u, a, i, o, a in the first word and e, o, o in the second",
       "lower-casing the text first is what makes the capital E count",
       "another loop prints each character of `\"cat\"` in capitals: `C`, `A`, `T`"
      ],
      "ab": [
       [
        "write",
        "Loop over a string and count the vowels"
       ],
       [
        "write",
        "Lower-case the text so the capital E counts"
       ],
       [
        "write",
        "Print each character of `\"cat\"` in capitals, one per line"
       ],
       [
        "predict",
        "Predict that the count is 9"
       ],
       [
        "fix",
        "Fix a vowel count that missed the capital letters"
       ],
       [
        "say",
        "Say why no counter is needed to loop over text"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.2",
       "where": "Module 3 \u00b7 3.2 Loops",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     },
     {
      "id": "PY-15",
      "t": "`while`",
      "y": "repeat until a condition stops being true, and make sure something inside the loop changes it.",
      "c": "Start with `n = 100`. While `n` is greater than 1, replace it by `n // 2` and count the round. Print the number of rounds and the last value of `n` on one line.",
      "a": "`6 1`: six halvings (100, 50, 25, 12, 6, 3, 1). A `while` loop whose condition never changes never ends; stop a stuck program with Ctrl+C.",
      "learn": [
       "`while` repeats until its condition stops being true",
       "start with `n = 100` and halve it while `n > 1`: `n = n // 2`",
       "count each round: six rounds, and the last value is 1, so the line is `6 1`",
       "the values go 100, 50, 25, 12, 6, 3, 1",
       "something inside the loop must change the condition",
       "a `while` loop whose condition never changes never ends",
       "stop a stuck program with Ctrl+C"
      ],
      "ab": [
       [
        "write",
        "Write a `while` loop that halves `n` while `n > 1`"
       ],
       [
        "write",
        "Count the rounds and print the rounds and the last `n`"
       ],
       [
        "predict",
        "Predict the printed line `6 1`"
       ],
       [
        "read",
        "Read the values 100, 50, 25, 12, 6, 3, 1 and count the halvings"
       ],
       [
        "fix",
        "Stop a stuck program with Ctrl+C and fix its condition"
       ],
       [
        "say",
        "Say what a `while` loop needs to end"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.2",
       "where": "Module 3 \u00b7 3.2 Loops",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: An Informal Introduction",
        "url": "https://docs.python.org/3/tutorial/introduction.html",
        "note": "Chapter 3. Numbers, text, lists, first loop."
       }
      ]
     },
     {
      "id": "PY-16",
      "t": "Accumulators: a total, a count, the biggest so far",
      "y": "build a result inside a loop with a running total, a running count, or the biggest value seen so far.",
      "c": "For the whole numbers 1 to 100, print their sum. For the whole numbers 1 to 50, print on one line how many are divisible by 7 and the largest of them.",
      "a": "5050; then `7 49` (7, 14, 21, 28, 35, 42, 49).",
      "learn": [
       "an accumulator is a name you set before a loop and update inside it, one round at a time",
       "a running total starts at `0`: `total = 0`, then `total = total + n` (or `total += n`) in each round",
       "for 1 to 100 the total ends at `5050`: use `range(1, 101)`, because the stop is not included",
       "a running count also starts at `0` and goes up by 1 only when a test is true: `if n % 7 == 0:`",
       "for 1 to 50 the numbers divisible by 7 are 7, 14, 21, 28, 35, 42 and 49, so the count is 7",
       "the biggest so far starts low (`0` works here, as every number is positive) and is replaced when `n > biggest`",
       "here the biggest is 49, because 50 is not divisible by 7",
       "the second line is `7 49`: `print(count, biggest)`",
       "print after the loop, not inside it, or you get one line per round",
       "the common slip: `total = 0` inside the loop resets the total every round"
      ],
      "ab": [
       [
        "write",
        "Write a loop that adds the numbers 1 to 100 into `total` and print it"
       ],
       [
        "write",
        "Count the numbers from 1 to 50 that are divisible by 7"
       ],
       [
        "write",
        "Keep the biggest of those numbers in one name and print `7 49` on one line"
       ],
       [
        "predict",
        "Predict the total `5050` before you run"
       ],
       [
        "read",
        "Read a loop and say what each accumulator holds after each round"
       ],
       [
        "fix",
        "Fix a total that is reset to `0` inside the loop"
       ],
       [
        "fix",
        "Fix a loop that prints on every round instead of once at the end"
       ],
       [
        "say",
        "Say why an accumulator must be set before the loop"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.2",
       "where": "Module 3 \u00b7 3.2 Loops",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      }
     },
     {
      "id": "PY-17",
      "t": "`break` and `continue`",
      "y": "leave a loop early with `break`, skip to the next round with `continue`, and end a `while True` loop.",
      "c": "Print the odd numbers from 1 to 10 on one line, using `continue` to skip the even ones. Then, with `while True` and `break`, find and print the first number above 50 that is divisible by both 6 and 8.",
      "a": "`1 3 5 7 9`; then 72 (48 is divisible by both but is not above 50).",
      "learn": [
       "`continue` skips the rest of this round and goes on to the next one",
       "`break` leaves the loop at once and the program carries on after the loop",
       "to print the odd numbers: `if n % 2 == 0: continue` skips the evens, then `print(n, end=\" \")` shows the rest",
       "for 1 to 10 the line is `1 3 5 7 9`",
       "`while True:` has a condition that is always true, so only a `break` can end it",
       "a number divisible by both 6 and 8 passes `n % 6 == 0 and n % 8 == 0`",
       "start at `n = 51`, since the number must be above 50, and add 1 to `n` each round",
       "the first hit is `72`; 48 is divisible by both but is not above 50",
       "a `while True` loop that never reaches its `break` never ends: stop it with Ctrl+C"
      ],
      "ab": [
       [
        "write",
        "Print `1 3 5 7 9` on one line, using `continue` to skip the even numbers"
       ],
       [
        "write",
        "Write a `while True` loop that adds 1 to `n` each round"
       ],
       [
        "write",
        "Use `break` to stop at the first number above 50 divisible by both 6 and 8"
       ],
       [
        "predict",
        "Predict 72, and not 48, before you run"
       ],
       [
        "read",
        "Read a loop and say which rounds `continue` skips"
       ],
       [
        "fix",
        "Fix a `while True` loop that never reaches its `break`"
       ],
       [
        "say",
        "Say the difference between `break` and `continue`"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     }
    ],
    "task": {
     "t": "The Collatz walk",
     "u": "while, if/else, accumulators, comparisons",
     "k": "Read a whole number n with `input()`. While n is not 1: if n is even replace it by `n // 2`, otherwise by `3 * n + 1`; count the steps and remember the largest value n reaches (including the start). Print the steps and the largest value on one line. Run it for 6, 7 and 27.",
     "a": "`8 16`, `16 52` and `111 9232` (steps, then the largest value). The walk for 27 climbs to 9232 before it falls to 1."
    }
   },
   {
    "key": "python/E",
    "id": "E",
    "n": "Functions",
    "idea": "a function names a piece of work with inputs and a result.",
    "needsText": "regions A, C and D (the bodies use conditions and loops).",
    "items": [
     {
      "id": "PY-18",
      "t": "Define and call a function",
      "y": "write `def name(parameters):` with an indented body, and call it with different values.",
      "c": "Write `square(x)`, which returns `x * x`, and `greet(name)`, which returns `\"Hello, \" + name + \"!\"`. Print `square(7)`, `square(-3)`, `square(2.5)` and `greet(\"Ada\")`.",
      "a": "49, 9, 6.25 and `Hello, Ada!`.",
      "learn": [
       "a function gives a name to a piece of work so you can run it again with different values",
       "`def square(x):` starts the definition and the line ends with a colon",
       "the body is indented under the `def` line: the indent marks what belongs to the function",
       "`x` is a parameter: a name that holds the value you pass in when you call the function",
       "`return x * x` hands the result back to the code that called it",
       "defining a function runs nothing: the body runs only when you call it, as in `square(7)`",
       "`print(square(7))` shows `49`, `square(-3)` gives `9` and `square(2.5)` gives `6.25`",
       "`greet(\"Ada\")` joins the text and gives `Hello, Ada!`; the same function works for any name",
       "the common slip: a missing colon or a missing indent after the `def` line is an error"
      ],
      "ab": [
       [
        "write",
        "Write `square(x)` that returns `x * x`"
       ],
       [
        "write",
        "Write `greet(name)` that returns `\"Hello, \" + name + \"!\"`"
       ],
       [
        "write",
        "Call each function with different values and print the results"
       ],
       [
        "predict",
        "Predict `49`, `9` and `6.25` for the three `square` calls"
       ],
       [
        "read",
        "Read a `def` line and name the function and its parameter"
       ],
       [
        "fix",
        "Fix a `def` that is missing its colon or its indent"
       ],
       [
        "say",
        "Say what a parameter is and what `return` does"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.3",
       "where": "Module 3 \u00b7 3.3 Functions",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     },
     {
      "id": "PY-19",
      "t": "`return` against `print`",
      "y": "say how a function that prints differs from one that returns, and what a function with no `return` gives back.",
      "c": "Define `show_double(x)`, which only prints `x * 2`, and `double(x)`, which returns `x * 2`. Run `a = show_double(4)` and print `a`; run `b = double(4)` and print `b + 1`. What are the three lines?",
      "a": "`8`, `None`, `9`. `show_double` prints 8 but hands back nothing (`None`), so `a` is `None`; `double` hands back 8, so `b + 1` is 9.",
      "learn": [
       "`print` shows a value on the screen; `return` hands a value back to the code that called the function",
       "`show_double(x)` runs `print(x * 2)`: it shows `8` for `show_double(4)` and gives nothing back",
       "a function with no `return` gives back `None`",
       "so `a = show_double(4)` shows `8` and sets `a` to `None`",
       "`print(a)` then shows `None`",
       "`double(x)` runs `return x * 2`: `b = double(4)` shows nothing and sets `b` to 8",
       "because `b` holds 8, `print(b + 1)` shows `9`",
       "the three lines are `8`, `None` and `9`",
       "the common slip: using `print` where you meant `return`, then finding `None` where the result should be",
       "a returned value can be used again in later math; a printed value is only shown once"
      ],
      "ab": [
       [
        "write",
        "Write `show_double` that only prints and `double` that returns"
       ],
       [
        "write",
        "Run `a = show_double(4)` and `b = double(4)`, then print `a` and `b + 1`"
       ],
       [
        "predict",
        "Predict the three lines `8`, `None` and `9`"
       ],
       [
        "read",
        "Read a function and say whether it prints, returns or both"
       ],
       [
        "say",
        "Say why `a` is `None` and why `b + 1` is 9"
       ],
       [
        "fix",
        "Fix a function that prints its answer so that it returns it"
       ],
       [
        "pick",
        "Pick `print` or `return` for a function whose result is used later"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m3/3.3",
       "where": "Module 3 \u00b7 3.3 Functions",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     },
     {
      "id": "PY-20",
      "t": "Default values and keyword arguments",
      "y": "give a parameter a default, call a function with names (`f(b=2, a=1)`), and recognise the error for a missing argument.",
      "c": "Define `power(base, exponent=2)`, which returns `base ** exponent`. Print `power(5)`, `power(2, 10)` and `power(exponent=3, base=4)`. What is the name of the error that `power()` raises?",
      "a": "25, 1024, 64; `power()` raises a `TypeError` (the required `base` is missing).",
      "learn": [
       "a default value gives a parameter something to use when the caller leaves it out",
       "`def power(base, exponent=2):` makes `exponent` optional; `base` has no default, so it is required",
       "`power(5)` uses the default `2` and gives `25`",
       "`power(2, 10)` fills both by position and gives `1024`",
       "a keyword argument names the parameter in the call: `power(exponent=3, base=4)` gives `64`",
       "with names, the order in the call does not matter",
       "put required parameters first and the ones with defaults after them, as in `power`",
       "`power()` raises a `TypeError` because the required `base` is missing",
       "the error message names the missing argument, so read it to see which one"
      ],
      "ab": [
       [
        "write",
        "Write `power(base, exponent=2)` that returns `base ** exponent`"
       ],
       [
        "write",
        "Call `power` by position and with keyword arguments"
       ],
       [
        "predict",
        "Predict `25`, `1024` and `64` before you run"
       ],
       [
        "predict",
        "Predict the error name for `power()`"
       ],
       [
        "read",
        "Read the error message and name the missing argument"
       ],
       [
        "fix",
        "Fix a call that leaves out a required argument"
       ],
       [
        "say",
        "Say what a default value is for"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html",
        "note": "Chapter 4. if, for, range, break, functions."
       }
      ]
     },
     {
      "id": "PY-21",
      "t": "Names inside and outside a function",
      "y": "say which names a function can see, and why a name made inside a function is gone afterwards.",
      "c": "Set `x = 10`. Define `f()` that sets `x = 5` and returns `x`; print `f()` and then `x`. Define `g()` that sets `y = 1`, call it, then print `y` and give the error name. Define `h()` that returns `x + 1`; print `h()` and say why it works.",
      "a": "`5`, then `10` (the `x` inside `f` is a different, local name); `y` raises a `NameError` (it existed only while `g` ran); `h()` gives 11 because a function can read a name from outside it.",
      "learn": [
       "a name made inside a function is local: it exists only while the function runs",
       "`x = 10` outside is a different name from the `x` inside `f`",
       "`f()` sets `x = 5` and returns it, so `print(f())` shows `5`",
       "the outside `x` is untouched, so `print(x)` after that still shows `10`",
       "`g()` sets `y = 1`, and when `g` ends the name `y` is gone",
       "`print(y)` outside raises a `NameError`: no such name exists out there",
       "a function can read a name from outside: `h()` returns `x + 1`, which is `11`",
       "Python looks inside the function first and then outside it",
       "the common slip: expecting `f()` to change the outside `x`",
       "to get a result out of a function, `return` it"
      ],
      "ab": [
       [
        "write",
        "Write `f` that sets its own `x`, and show that the outside `x` stays 10"
       ],
       [
        "write",
        "Write `h` that reads the outside `x` and returns `x + 1`"
       ],
       [
        "predict",
        "Predict `5` then `10` for `print(f())` and `print(x)`"
       ],
       [
        "predict",
        "Predict the error name for `print(y)` after `g()` has run"
       ],
       [
        "read",
        "Read code and say which `x` each line uses"
       ],
       [
        "fix",
        "Fix code that expects `f()` to change the outside `x`"
       ],
       [
        "say",
        "Say why `y` is gone after `g` ends but `h` can read `x`"
       ]
      ]
     }
    ],
    "task": {
     "t": "Primes",
     "u": "functions, `return`, loops, conditions",
     "k": "Write `is_prime(n)`, which returns True for a prime and False otherwise (1 and below are not prime), using a loop and `return`. Print `is_prime(1)`, `is_prime(2)` and `is_prime(91)` on one line. Then print the primes below 30 on one line, and how many primes are below 100, using your function.",
     "a": "`False True False` (91 is 7 times 13); the primes below 30 are `2 3 5 7 11 13 17 19 23 29`; there are 25 primes below 100."
    }
   },
   {
    "key": "python/F",
    "id": "F",
    "n": "Ordered collections",
    "idea": "many values kept in order and reached by position.",
    "needsText": "regions A, C, D and E; slicing works as in region B.",
    "items": [
     {
      "id": "PY-22",
      "t": "Lists: make, index, slice",
      "y": "make a list, reach items by position (from either end), slice it, and ask its length and whether a value is in it.",
      "c": "Let `scores = [72, 88, 91, 65, 79]`. Print `scores[0]`, `scores[-1]`, `scores[1:4]`, `scores[::2]`, `len(scores)` and `88 in scores`, one per line.",
      "a": "72, 79, `[88, 91, 65]`, `[72, 91, 79]`, 5 and `True`.",
      "learn": [
       "a list keeps many values in order inside square brackets: `[72, 88, 91, 65, 79]`",
       "positions count from 0: `scores[0]` is `72`",
       "a negative position counts from the end: `scores[-1]` is `79`",
       "a slice `scores[1:4]` gives `[88, 91, 65]`: the start is included and the stop is not",
       "a third number is a step: `scores[::2]` takes every second item and gives `[72, 91, 79]`",
       "`len(scores)` is the number of items: `5`",
       "`88 in scores` asks whether a value is in the list and gives `True`",
       "the last position is 4: `scores[5]` is out of range and is an error",
       "a slice makes a new list and leaves `scores` as it was",
       "the common slip: expecting `scores[1:4]` to include position 4"
      ],
      "ab": [
       [
        "write",
        "Make `scores` and print `scores[0]` and `scores[-1]`"
       ],
       [
        "write",
        "Print `scores[1:4]` and `scores[::2]`"
       ],
       [
        "write",
        "Print `len(scores)` and `88 in scores`"
       ],
       [
        "predict",
        "Predict all six lines before you run"
       ],
       [
        "read",
        "Read a slice and name the positions it takes"
       ],
       [
        "fix",
        "Fix a slice that stops one item early"
       ],
       [
        "say",
        "Say what `[1:4]` includes and what it leaves out"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.1 Lists and tuples",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     },
     {
      "id": "PY-23",
      "t": "Change a list in place",
      "y": "add, remove and reorder items with `append`, `insert`, `remove`, `pop` and `sort`, and tell `.sort()` (changes the list, gives back `None`) from `sorted(...)` (gives back a new list).",
      "c": "Start with `xs = [3, 1, 2]`. Append 5, insert 0 at the front, remove the value 1, and pop the last item (print what `pop` gave back). Print `xs`. Then print `sorted([3, 1, 2])` and print the value of the expression `[3, 1, 2].sort()`.",
      "a": "`5` (what `pop` gave back), `[0, 3, 2]`, `[1, 2, 3]`, and `None` (`.sort()` sorts in place and gives nothing back; a common bug is `xs = xs.sort()`).",
      "learn": [
       "a list can be changed in place: these methods change the list itself",
       "`xs.append(5)` adds `5` at the end",
       "`xs.insert(0, 0)` takes a position then a value: here the value `0` goes to the front",
       "`xs.remove(1)` takes out the first item equal to `1`",
       "`xs.pop()` takes out the last item and gives it back, so `print(xs.pop())` shows `5`",
       "after those four steps `xs` is `[0, 3, 2]`",
       "`sorted([3, 1, 2])` gives a new list `[1, 2, 3]` and leaves the original alone",
       "`[3, 1, 2].sort()` sorts the list itself and gives back `None`",
       "the common bug is `xs = xs.sort()`: it sets `xs` to `None` and the list is lost"
      ],
      "ab": [
       [
        "write",
        "Change `xs` with `append`, `insert`, `remove` and `pop`"
       ],
       [
        "write",
        "Print what `pop` gave back, then print `xs`"
       ],
       [
        "predict",
        "Predict `5` and `[0, 3, 2]` before you run"
       ],
       [
        "predict",
        "Predict the value of `[3, 1, 2].sort()`"
       ],
       [
        "read",
        "Read a line and say if it changes the list or makes a new one"
       ],
       [
        "fix",
        "Fix `xs = xs.sort()` so the list is kept"
       ],
       [
        "pick",
        "Pick `.sort()` or `sorted(...)` when the original list must stay as it is"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.1 Lists and tuples",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     },
     {
      "id": "PY-24",
      "t": "Tuples and unpacking",
      "y": "make a tuple, say how it differs from a list (it cannot be changed), unpack it into names, swap two values, and return two values from a function.",
      "c": "Let `p = (3, 4)`. Print `p[0]`; try `p[0] = 9` and give the error name; unpack `x, y = p` and print `x + y`. Swap `a = 1` and `b = 2` with `a, b = b, a` and print them on one line. Define `min_max(xs)` returning `min(xs), max(xs)` and print `min_max([4, 9, 2])`.",
      "a": "3; `TypeError`; 7; `2 1`; `(2, 9)` (a function that returns two values returns one tuple).",
      "learn": [
       "a tuple is an ordered group of values in round brackets: `p = (3, 4)`",
       "you reach items by position, as in a list: `p[0]` is `3`",
       "a tuple cannot be changed: `p[0] = 9` raises a `TypeError`",
       "unpacking splits a tuple into names: `x, y = p` gives `x` the value 3 and `y` the value 4",
       "use as many names on the left as there are items in the tuple; then `x + y` is `7`",
       "`a, b = b, a` swaps two values in one line: with `a = 1` and `b = 2`, `print(a, b)` shows `2 1`",
       "a function can return two values: `return min(xs), max(xs)`",
       "they come back as one tuple: `print(min_max([4, 9, 2]))` shows `(2, 9)`",
       "unpack that result into two names: `lo, hi = min_max(xs)`"
      ],
      "ab": [
       [
        "write",
        "Make `p = (3, 4)` and unpack it into `x` and `y`"
       ],
       [
        "write",
        "Swap `a` and `b` with `a, b = b, a`"
       ],
       [
        "write",
        "Write `min_max(xs)` that returns two values"
       ],
       [
        "predict",
        "Predict the `TypeError` from `p[0] = 9`"
       ],
       [
        "predict",
        "Predict `(2, 9)` for `min_max([4, 9, 2])`"
       ],
       [
        "read",
        "Read `lo, hi = min_max(xs)` and say what each name holds"
       ],
       [
        "say",
        "Say how a tuple differs from a list"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.1 Lists and tuples",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     },
     {
      "id": "PY-25",
      "t": "Loop over a list: `enumerate` and `zip`",
      "y": "loop over items together with their position (`enumerate`) and over two lists side by side (`zip`).",
      "c": "Let `names = [\"Ada\", \"Alan\", \"Grace\"]` and `ages = [36, 41, 85]`. With `enumerate`, print `0: Ada`, `1: Alan`, `2: Grace`. With `zip`, print `Ada is 36`, `Alan is 41`, `Grace is 85`.",
      "a": "`0: Ada`, `1: Alan`, `2: Grace`, then `Ada is 36`, `Alan is 41`, `Grace is 85`.",
      "learn": [
       "`enumerate(names)` gives each item together with its position",
       "`for i, name in enumerate(names):` unpacks each pair into `i` and `name`",
       "positions start at 0, so the lines are `0: Ada`, `1: Alan` and `2: Grace`",
       "inside the loop, `print(f\"{i}: {name}\")` builds each line",
       "`enumerate` replaces a hand-made counter such as `i = 0` and `i += 1`",
       "`zip(names, ages)` pairs the lists side by side: first with first, second with second",
       "`for name, age in zip(names, ages):` gives `Ada` and `36`, then `Alan` and `41`, then `Grace` and `85`",
       "the lines are `Ada is 36`, `Alan is 41` and `Grace is 85`",
       "the common slip: swapping the names in the loop header mixes up the name and the age"
      ],
      "ab": [
       [
        "write",
        "Print `0: Ada`, `1: Alan` and `2: Grace` with `enumerate`"
       ],
       [
        "write",
        "Print `Ada is 36` and the next two lines with `zip`"
       ],
       [
        "predict",
        "Predict the first number `enumerate` gives"
       ],
       [
        "read",
        "Read a loop header and say what each name holds"
       ],
       [
        "fix",
        "Fix a loop that mixes up the name and the age"
       ],
       [
        "say",
        "Say what `enumerate` and `zip` each add to a plain `for` loop"
       ],
       [
        "pick",
        "Pick `enumerate` or `zip` for a task about positions or about two lists"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     },
     {
      "id": "PY-26",
      "t": "Two names, one list: aliasing and copying",
      "y": "tell when `b = a` gives a second name to the same list, and make a real copy with `.copy()` or `a[:]`.",
      "c": "Set `a = [1, 2, 3]` and `b = a`; append 4 to `b`; print `a`. Set `c = a.copy()` and append 5 to `c`; print `a` and `c` on one line. Print `a is b` and `a is c` on one line. Last, set `x = 5`, `y = x`, then `y = y + 1`, and print `x`.",
      "a": "`[1, 2, 3, 4]` (appending through `b` changed `a`: one list, two names); `[1, 2, 3, 4] [1, 2, 3, 4, 5]`; `True False`; and 5 (numbers are not changed in place, so no sharing is visible).",
      "o": "the same bug appears later with NumPy arrays (region B of section 4: a slice is a view); this item is its first home (L-31).",
      "learn": [
       "`b = a` does not copy the list: it gives the same list a second name",
       "append 4 through `b` and `a` shows `[1, 2, 3, 4]`: one list, two names",
       "`a.copy()` or `a[:]` makes a new list with the same items",
       "after `c = a.copy()` and `c.append(5)`, `a` is still `[1, 2, 3, 4]` and `c` is `[1, 2, 3, 4, 5]`",
       "`is` asks whether two names point at the same object: `a is b` is `True`",
       "`a is c` is `False`: the items are equal but there are two lists",
       "`x = 5`, `y = x`, `y = y + 1` leaves `x` at `5`: a number is not changed in place",
       "the common slip: thinking `b = a` made a safe copy, then changing `a` by accident",
       "this trap comes back with NumPy arrays, where a slice is a view of the same data"
      ],
      "ab": [
       [
        "write",
        "Set `b = a`, append through `b` and print `a`"
       ],
       [
        "write",
        "Make a real copy with `.copy()` and change only the copy"
       ],
       [
        "predict",
        "Predict `[1, 2, 3, 4]` for `a` after the append through `b`"
       ],
       [
        "predict",
        "Predict `True False` for `a is b` and `a is c`"
       ],
       [
        "read",
        "Read code and say how many lists exist and how many names point at them"
       ],
       [
        "fix",
        "Fix code that changed the original list because it only gave it a second name"
       ],
       [
        "say",
        "Say why `x` stays `5` while the list changed"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.1 Lists and tuples",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      }
     },
     {
      "id": "PY-27",
      "t": "List comprehensions",
      "y": "build a new list in one line from another, with an optional condition.",
      "c": "With one comprehension each, print: the squares of 1 to 6; the even numbers from 1 to 20; the lengths of the words in `[\"tree\", \"sky\", \"mountain\"]`; and the words of that list that are longer than 3 letters, in capitals.",
      "a": "`[1, 4, 9, 16, 25, 36]`, `[2, 4, 6, 8, 10, 12, 14, 16, 18, 20]`, `[4, 3, 8]`, `['TREE', 'MOUNTAIN']`.",
      "learn": [
       "a list comprehension builds a new list from another sequence in one line",
       "the shape is `[expression for name in sequence]`",
       "squares of 1 to 6: `[n * n for n in range(1, 7)]` gives `[1, 4, 9, 16, 25, 36]`",
       "a condition at the end keeps only some items: `[n for n in range(1, 21) if n % 2 == 0]`",
       "that gives the ten even numbers from 2 to 20",
       "the expression can call a function: `[len(w) for w in words]` gives `[4, 3, 8]`",
       "change and filter together: `[w.upper() for w in words if len(w) > 3]` gives `['TREE', 'MOUNTAIN']`",
       "the `if` decides which items go in; the expression at the front is what goes in",
       "a comprehension makes a new list and leaves the source list as it was",
       "the common slip: `range(1, 6)` stops at 5, so use `range(1, 7)` to reach 6"
      ],
      "ab": [
       [
        "write",
        "Write a comprehension for the squares of 1 to 6"
       ],
       [
        "write",
        "Write one with an `if` for the even numbers from 1 to 20"
       ],
       [
        "write",
        "Write one for the lengths of the words in `[\"tree\", \"sky\", \"mountain\"]`"
       ],
       [
        "write",
        "Write one that keeps the words longer than 3 letters, in capitals"
       ],
       [
        "predict",
        "Predict `[4, 3, 8]` before you run"
       ],
       [
        "read",
        "Read a comprehension and say what its `for` and `if` parts do"
       ],
       [
        "say",
        "Say how a comprehension matches a `for` loop that uses `append`"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     }
    ],
    "task": {
     "t": "Class scores",
     "u": "lists, looping, tuples, copying, comprehensions",
     "k": "Let `scores = [72, 88, 91, 65, 79, 95, 58]`. Print, one per line: the mean (sum divided by count) to 2 decimals; the list of scores above the mean; the position of the highest score (find it with a loop and `enumerate`); the scores sorted from highest to lowest; `scores` itself again (it must still be in the original order); and the list of (position, score) pairs for the scores below 70.",
     "a": "`78.29`; `[88, 91, 79, 95]`; 5; `[95, 91, 88, 79, 72, 65, 58]`; `[72, 88, 91, 65, 79, 95, 58]` (`sorted` did not change it); `[(3, 65), (6, 58)]`."
    }
   },
   {
    "key": "python/G",
    "id": "G",
    "n": "Lookups",
    "idea": "finding a value by its key, or asking whether something is there.",
    "needsText": "regions C, D and F (conditions, loops, lists); tuples from PY-24 (the pairs that `.items()` gives).",
    "items": [
     {
      "id": "PY-28",
      "t": "Dictionaries: a value under a key",
      "y": "make a dictionary, read, change, add and delete an entry, ask whether a key is there, use `.get` for a fallback, and say what a missing key does.",
      "c": "Let `ages = {\"Ada\": 36, \"Alan\": 41}`. Print `ages[\"Ada\"]`. Then set `ages[\"Grace\"] = 85`, change `ages[\"Alan\"]` to 42 and delete `\"Ada\"` with `del ages[\"Ada\"]`. Print `ages`, `len(ages)`, `\"Ada\" in ages`, `ages.get(\"Ada\")` and `ages.get(\"Ada\", 0)`, one per line. Then read `ages[\"Ada\"]` and give the error name. Last, try to make a dictionary that uses the list `[1, 2]` as a key and give that error name.",
      "a": "36; `{'Alan': 42, 'Grace': 85}` (Grace added, Alan changed, Ada gone); 2; `False`; `None` (`.get` gives `None` for a missing key instead of an error); 0 (the second argument is what to give back instead); reading `ages[\"Ada\"]` raises a `KeyError`; a list as a key raises a `TypeError` (a key must be a value that cannot change: text, a number, a tuple).",
      "learn": [
       "a dictionary keeps values under keys in curly brackets: `{\"Ada\": 36, \"Alan\": 41}`",
       "read a value by its key: `ages[\"Ada\"]` gives `36`",
       "`ages[\"Grace\"] = 85` adds a new entry and `ages[\"Alan\"] = 42` changes an existing one",
       "`del ages[\"Ada\"]` deletes an entry, which leaves `{'Alan': 42, 'Grace': 85}`",
       "`len(ages)` counts the entries (`2`) and `\"Ada\" in ages` asks about keys, so it is now `False`",
       "`ages.get(\"Ada\")` gives `None` for a missing key; `ages.get(\"Ada\", 0)` gives the fallback `0`",
       "reading `ages[\"Ada\"]` when the key is missing raises a `KeyError`",
       "a key must be a value that cannot change: text, a number or a tuple",
       "a dictionary with the list `[1, 2]` as a key raises a `TypeError`, because a list can change",
       "the common slip: using `ages[key]` for a key that may be missing, when `.get` is safe"
      ],
      "ab": [
       [
        "write",
        "Make `ages`, then add, change and delete entries"
       ],
       [
        "write",
        "Print `len(ages)`, `\"Ada\" in ages` and the two `.get` calls"
       ],
       [
        "predict",
        "Predict `{'Alan': 42, 'Grace': 85}` after the three changes"
       ],
       [
        "predict",
        "Predict `None` and `0` from the two `.get` calls"
       ],
       [
        "read",
        "Read a `KeyError` and name the key that was missing"
       ],
       [
        "fix",
        "Fix a read of a missing key by using `.get` with a fallback"
       ],
       [
        "say",
        "Say why a list cannot be a key but a tuple can"
       ],
       [
        "pick",
        "Pick `ages[key]` or `ages.get(key)` for a key that may be missing"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.2 Dictionaries",
       "tags": [
        "video",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     },
     {
      "id": "PY-29",
      "t": "Loop over a dictionary, and count with one",
      "y": "loop over a dictionary with `.items()`, add its `.values()`, and build a dictionary of counts with `counts[x] = counts.get(x, 0) + 1`.",
      "c": "Let `grades = [\"B\", \"A\", \"C\", \"A\", \"B\", \"A\"]`. Build a dictionary `counts` that says how many times each grade appears (start from `{}` and loop once over `grades`). Print `counts`. Then, with `for grade, n in sorted(counts.items()):`, print one line per grade like `A: 3`. Print the sum of `counts.values()`. Last, print the grade with the highest count (find it with a loop over `counts`).",
      "a": "`{'B': 2, 'A': 3, 'C': 1}` (keys stay in the order they first appeared); then `A: 3`, `B: 2`, `C: 1` (sorted by key); 6 (the counts add up to the number of grades); and `A`.",
      "learn": [
       "`counts = {}` starts empty; each grade in the loop adds 1 to its own entry",
       "`counts[g] = counts.get(g, 0) + 1` works for a new grade (0 + 1) and for one seen before",
       "after the loop `counts` is `{'B': 2, 'A': 3, 'C': 1}`, with keys in the order they first appeared",
       "`counts.items()` gives key and value pairs, so `for grade, n in counts.items():` unpacks each pair",
       "`sorted(counts.items())` puts the pairs in key order, so the lines are `A: 3`, `B: 2` and `C: 1`",
       "`counts.values()` gives just the counts, so `sum(counts.values())` is `6`",
       "6 is the number of grades: the counts add up to the length of the list, a handy check",
       "to find the top grade, keep `best` and `best_n` and replace them when `counts[g] > best_n`; the answer is `A`",
       "reading `counts[g]` before it exists is a `KeyError`, which is why `.get(g, 0)` is used"
      ],
      "ab": [
       [
        "write",
        "Build `counts` from `grades` with one loop and `.get`"
       ],
       [
        "write",
        "Print one line per grade with `sorted(counts.items())`"
       ],
       [
        "write",
        "Print `sum(counts.values())`"
       ],
       [
        "write",
        "Find the grade with the highest count with a loop"
       ],
       [
        "predict",
        "Predict `{'B': 2, 'A': 3, 'C': 1}` before you run"
       ],
       [
        "read",
        "Read `counts.get(g, 0) + 1` and say what it gives for a new grade"
       ],
       [
        "say",
        "Say why the counts add up to 6"
       ],
       [
        "fix",
        "Fix a count that fails with a `KeyError` on a new grade"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.2 Dictionaries",
       "tags": [
        "video",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     },
     {
      "id": "PY-30",
      "t": "Sets: no repeats, no order",
      "y": "make a set (also from a list, to drop repeats), test membership, and combine sets with `|`, `&` and `-`; say why a set is printed through `sorted(...)`, and why `{}` is not an empty set.",
      "c": "Let `a = [3, 1, 2, 3, 1]`. Print `len(a)`, `len(set(a))` and `sorted(set(a))`. Let `x = {1, 2, 3, 4}` and `y = {3, 4, 5}`; print `sorted(x | y)`, `sorted(x & y)`, `sorted(x - y)` and `2 in x`. Print `type({})` and `type(set())` on one line.",
      "a": "5, 3 and `[1, 2, 3]`; then `[1, 2, 3, 4, 5]` (in either), `[3, 4]` (in both), `[1, 2]` (in `x` and not in `y`) and `True`; and `<class 'dict'> <class 'set'>` (`{}` makes an empty dictionary; an empty set is `set()`). A set has no order you can rely on, so print it through `sorted(...)`.",
      "learn": [
       "a set keeps each value once and has no order you can rely on",
       "`set(a)` drops repeats: `a` has 5 items and `set(a)` has 3",
       "`sorted(set(a))` gives the list `[1, 2, 3]`: print a set through `sorted(...)` so the order is steady",
       "`{1, 2, 3, 4}` is a set: curly brackets with values and no keys",
       "`x | y` is everything in either set: `[1, 2, 3, 4, 5]`",
       "`x & y` is what is in both: `[3, 4]`",
       "`x - y` is what is in `x` and not in `y`: `[1, 2]`",
       "`2 in x` tests membership and gives `True`",
       "`{}` makes an empty dictionary, not an empty set: `type({})` shows `<class 'dict'>`",
       "an empty set is `set()`: `type(set())` shows `<class 'set'>`"
      ],
      "ab": [
       [
        "write",
        "Drop repeats from a list with `set` and print `sorted(set(a))`"
       ],
       [
        "write",
        "Print the union, overlap and difference of `x` and `y` with `|`, `&` and `-`"
       ],
       [
        "predict",
        "Predict `5` and `3` for `len(a)` and `len(set(a))`"
       ],
       [
        "predict",
        "Predict `<class 'dict'> <class 'set'>` for the last line"
       ],
       [
        "say",
        "Say what `|`, `&` and `-` each find"
       ],
       [
        "fix",
        "Fix an empty set made with `{}` by using `set()`"
       ],
       [
        "pick",
        "Pick a list or a set when repeats must be dropped"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m2",
       "where": "Module 2 \u00b7 2.3 Sets",
       "tags": [
        "video",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "Python Tutorial: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html",
        "note": "Chapter 5. Lists, tuples, sets, dictionaries, loops."
       }
      ]
     }
    ],
    "task": {
     "t": "Word counter",
     "u": "dictionaries, counting, sets, sorting",
     "k": "Let `text = \"to be or not to be that is the question\"` and `other = \"to see or not to see\"`. Using `.split()`, a dictionary and sets, print: each distinct word of `text` with its count, in alphabetical order, as `be: 2`; on one line the number of distinct words and the total number of words; the words of `text` that occur more than once, as a sorted list; the words that are in both sentences, as a sorted list; the words that are only in `text`, as a sorted list.",
     "a": "`be: 2`, `is: 1`, `not: 1`, `or: 1`, `question: 1`, `that: 1`, `the: 1`, `to: 2`; then `8 10`; `['be', 'to']`; `['not', 'or', 'to']`; `['be', 'is', 'question', 'that', 'the']`."
    }
   },
   {
    "key": "python/H",
    "id": "H",
    "n": "Getting unstuck",
    "idea": "when code is wrong, find where and why.",
    "needsText": "regions A to F (PY-31 to PY-34 use functions, loops, lists, strings and `sorted`); region G is not needed.",
    "items": [
     {
      "id": "PY-31",
      "t": "Read an error message",
      "y": "read an error from the bottom up: its last line names the error and says why, the line number says where, and when the error is inside a function the line above says who called it; and tell a `SyntaxError` (nothing runs) from an error while running.",
      "c": "Save and run each of these four programs, one at a time. For each, say: the error name, the line number it points at, and the first words of its message; for the second, also the line it was called from; for the third, what the program printed before it stopped; for the fourth, whether `start` was printed.\n\n```python\ntotal = 0\nfor n in [4, 5, 6]:\n    total = total + n\nprint(totl)\n```\n\n```python\ndef average(xs):\n    return sum(xs) / len(xs)\n\nscores = [70, \"80\", 90]\nprint(average(scores))\n```\n\n```python\ncolors = [\"red\", \"green\", \"blue\"]\nfor i in range(4):\n    print(colors[i])\n```\n\n```python\nprint(\"start\")\nn = 5\nif n > 3\n    print(\"big\")\n```\n\nThen fix each one so that it runs.",
      "a": "1: `NameError`, line 4, `name 'totl' is not defined` (a typo for `total`). 2: `TypeError` raised on line 2 inside `average`, which was called from line 5, `unsupported operand type(s) for +` (the list holds the text `\"80\"` and `sum` cannot add a number and text). 3: `IndexError`, line 3, `list index out of range`, after `red`, `green` and `blue` were printed (positions 0 to 2 exist; `range(4)` asks for position 3). 4: `SyntaxError`, line 3 (the colon after `if n > 3` is missing); `start` was not printed, because Python reads the whole file before it runs any line. Fixed, they print `15`, `80.0`, `red green blue` (on three lines) and `start` then `big`.",
      "learn": [
       "read an error from the bottom up: the last line names the error and says why",
       "the line number in the message says where Python found the problem",
       "when the error is inside a function, the line above says who called it",
       "program 1: `NameError` on line 4, `name 'totl' is not defined`: a typo for `total`",
       "program 2: `TypeError` on line 2 inside `average`, which line 5 called: `unsupported operand type(s) for +`",
       "it happens because `sum` cannot add the text `\"80\"` to a number",
       "program 3: `IndexError` on line 3, `list index out of range`, after `red`, `green` and `blue` have printed",
       "`range(4)` asks for position 3, but a list of three has positions 0 to 2",
       "program 4: `SyntaxError` on line 3, a missing colon after `if n > 3`: Python reads the whole file first, so `start` is not printed",
       "fixed, they print `15`, `80.0`, `red`, `green`, `blue` on three lines, and `start` then `big`"
      ],
      "ab": [
       [
        "write",
        "Save and run each of the four programs, one at a time"
       ],
       [
        "read",
        "Read each error from the bottom line up"
       ],
       [
        "say",
        "Say the error name, the line number and the first words of each message"
       ],
       [
        "read",
        "Read which line called `average` when the error is inside it"
       ],
       [
        "predict",
        "Predict what program 3 prints before it stops"
       ],
       [
        "say",
        "Say why `start` is not printed in program 4"
       ],
       [
        "pick",
        "Tell a `SyntaxError` from an error that happens while the program runs"
       ],
       [
        "fix",
        "Fix each program so that it runs"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Errors and Exceptions",
        "url": "https://docs.python.org/3/tutorial/errors.html",
        "note": "Chapter 8. Read errors."
       }
      ]
     },
     {
      "id": "PY-32",
      "t": "Look inside with `print` (a bug with no error)",
      "y": "find a bug that raises no error by printing what the program holds at the point you doubt, and show text exactly with `repr(...)`.",
      "c": "Program 1 should print the average of 3, 6 and 9, which is 6.0, but it prints something else and shows no error:\n\n```python\ndef average(xs):\n    total = 0\n    for i in range(1, len(xs)):\n        total = total + xs[i]\n    return total / len(xs)\n\nprint(average([3, 6, 9]))\n```\n\nRun it. Then add one line as the first line inside the loop, `print(\"i =\", i, \"total =\", total)`, and run it again: which lines come before the result, and what is the bug? Fix it so it prints 6.0. Program 2 should print `True` and prints `False`:\n\n```python\nanswer = \"yes \"\nprint(answer == \"yes\")\n```\n\nAdd `print(repr(answer))` before the comparison. What do you see? Fix the comparison without changing the text in `answer`.",
      "a": "program 1 prints `5.0`; with the added line you see `i = 1 total = 0` and `i = 2 total = 6` and then `5.0`: `range(1, len(xs))` starts at position 1, so the first number is never added (with `range(len(xs))` it prints `6.0`). Program 2: `repr` shows `'yes '`, with a space after `yes`, which is why the comparison is `False`; `answer.strip() == \"yes\"` gives `True`.",
      "learn": [
       "a bug with no error runs to the end and gives a wrong answer, so there is no error line to read",
       "find it by printing what the program holds at the point you doubt",
       "program 1 should print `6.0` but prints `5.0`",
       "add `print(\"i =\", i, \"total =\", total)` as the first line inside the loop and run it again",
       "the new lines are `i = 1 total = 0` and `i = 2 total = 6`, then `5.0`: only two rounds ran, not three",
       "the bug: `range(1, len(xs))` starts at position 1, so the first number is never added",
       "fix it with `range(len(xs))` and it prints `6.0`",
       "program 2 prints `False` for `answer == \"yes\"` and shows no error",
       "`print(repr(answer))` shows the text exactly, with quotes: `'yes '` has a space after `yes`",
       "fix it with `answer.strip() == \"yes\"`, which gives `True`; the text in `answer` stays as it was"
      ],
      "ab": [
       [
        "write",
        "Add a `print` line inside the loop to show `i` and `total`"
       ],
       [
        "read",
        "Read the printed `i` and `total` lines and see which round is missing"
       ],
       [
        "say",
        "Say why `range(1, len(xs))` skips the first number"
       ],
       [
        "fix",
        "Fix program 1 so that it prints `6.0`"
       ],
       [
        "predict",
        "Predict what `repr(answer)` shows before you run it"
       ],
       [
        "read",
        "Read `'yes '` and spot the space"
       ],
       [
        "fix",
        "Fix the comparison with `.strip()` without changing `answer`"
       ]
      ]
     },
     {
      "id": "PY-33",
      "t": "Read the documentation",
      "y": "look up what a function does, what it takes and what it gives back, in the documentation (`help(...)` at the `>>>` prompt, or the Python documentation site), and use it without an example to copy.",
      "c": "Use only the documentation (the Python docs pages \"Built-in Functions\" and \"Built-in Types\", or `help(...)`; do not look for an example to copy) to find out what each of these does, and print: `divmod(17, 5)`; `\"7\".zfill(3)`; `\"key=value=x\".partition(\"=\")`; `max([], default=0)`; and, on one line, `round(0.5)`, `round(1.5)` and `round(2.5)`. Then say, from the documentation of `round`, why `round(2.5)` is not 3.",
      "a": "`(3, 2)` (the quotient and the remainder at once); `007` (padded with zeros on the left to width 3); `('key', '=', 'value=x')` (split at the first `=` only, and the separator is kept); `0` (what `max` gives back for an empty list when `default` is set; without it, `ValueError`); and `0 2 2`: when a value is exactly half way, `round` goes to the even neighbour, so 0.5 gives 0, 1.5 gives 2 and 2.5 gives 2.",
      "o": "not machine-verified (L-06): that `help(...)` and the documentation site show these entries, and where on the site they are; the wording of a help page is not quoted because it changes between versions.",
      "learn": [
       "the documentation says what a function does, what it takes and what it gives back",
       "look an entry up with `help(...)` at the `>>>` prompt, or in the Python docs pages \"Built-in Functions\" and \"Built-in Types\"",
       "the aim is to learn from the description alone, with no example to copy",
       "`divmod(17, 5)` gives `(3, 2)`: the quotient and the remainder at once",
       "`\"7\".zfill(3)` gives `007`: padded with zeros on the left to width 3",
       "`\"key=value=x\".partition(\"=\")` gives `('key', '=', 'value=x')`: it splits at the first `=` only and keeps the separator",
       "`max([], default=0)` gives `0`; without `default`, an empty list raises a `ValueError`",
       "`round(0.5)`, `round(1.5)` and `round(2.5)` give `0 2 2`",
       "when a value is exactly half way, `round` goes to the even neighbour, so `round(2.5)` is not 3"
      ],
      "ab": [
       [
        "read",
        "Read the documentation entry for each of the calls"
       ],
       [
        "predict",
        "Predict each result from its description before you run it"
       ],
       [
        "write",
        "Print the five results, with the three `round` values on one line"
       ],
       [
        "say",
        "Say what `divmod` gives back and in what order"
       ],
       [
        "say",
        "Say from the documentation of `round` why `round(2.5)` is not 3"
       ],
       [
        "pick",
        "Pick the call that fits a job, such as `partition` to split at the first `=`"
       ]
      ]
     },
     {
      "id": "PY-34",
      "t": "`assert`: say what must be true",
      "y": "write `assert condition, \"message\"` so that the program stops the moment something you expected is false, read an `AssertionError`, and know that a run with `python -O` skips every assert.",
      "c": "Save this and run it; what does it show?\n\n```python\ndef mean(xs):\n    return sum(xs) / len(xs)\n\nassert mean([2, 4]) == 3\nassert mean([10]) == 10\nassert mean([1, 2, 3, 4]) == 2.5\n```\n\nAdd `assert mean([2, 4]) == 4, \"mean of 2 and 4\"` as the last line and run again: what is the last line the program shows? Then save a second file whose lines are `assert 1 == 2, \"boom\"` and `print(\"still running\")`. Run it normally, then run it with `-O` (`python -O` and the file name). What does each run show?",
      "a": "the first run shows nothing (every assert is true); the second ends with the line `AssertionError: mean of 2 and 4`; the second file, run normally, ends with `AssertionError: boom` and never reaches the `print`; run with `-O` it prints `still running` (asserts are removed, which is why an `assert` is for your own checks and never for checking what a user typed).",
      "o": "`assert` is skill 6's ground (its row names assertions) and is pulled forward here because the Git and pandas items use it (L-31); skill 6's pass skips it.",
      "learn": [
       "`assert condition, \"message\"` stops the program the moment something you expected is false",
       "when the condition is true, `assert` shows nothing and the program goes on",
       "the three asserts on `mean` are all true, so the first run shows nothing",
       "`assert mean([2, 4]) == 4, \"mean of 2 and 4\"` is false, because the mean is 3",
       "the last line shown is `AssertionError: mean of 2 and 4`: the error name, then your message",
       "a second file with `assert 1 == 2, \"boom\"` ends with `AssertionError: boom` and never reaches `print(\"still running\")`",
       "`python -O file.py` skips every assert, so that same file prints `still running`",
       "an `assert` is for your own checks, never for checking what a user typed"
      ],
      "ab": [
       [
        "write",
        "Write three `assert` lines that check `mean` on three inputs"
       ],
       [
        "write",
        "Add `assert mean([2, 4]) == 4, \"mean of 2 and 4\"` as the last line"
       ],
       [
        "predict",
        "Predict that the first run shows nothing and the extra assert fails"
       ],
       [
        "read",
        "Read the last line of an `AssertionError` and name the message"
       ],
       [
        "write",
        "Run the second file normally, then again with `python -O`"
       ],
       [
        "predict",
        "Predict that the `-O` run prints `still running`"
       ],
       [
        "say",
        "Say why an `assert` must not check what a user typed"
       ]
      ]
     }
    ],
    "task": {
     "t": "Fix three bugs",
     "u": "reading errors, `print`, the documentation, `assert`",
     "k": "Save this program and run it. It has three bugs, and each shows itself as an `AssertionError` with its message. Read the message, find the bug (use `print` to look inside, and the documentation if you do not know what something does), fix it and run again; go on until it prints `all checks passed`. Do not change the `assert` lines.\n\n```python\ndef count_vowels(text):\n    n = 0\n    for ch in text:\n        if ch in \"aeiou\":\n            n = n + 1\n    return n\n\n\ndef second_largest(xs):\n    xs.sort()\n    return xs[-2]\n\n\ndef clean_name(raw):\n    return raw.strip().title\n\n\nassert count_vowels(\"Education\") == 5, \"count_vowels\"\ndata = [4, 9, 2, 7]\nassert second_largest(data) == 7, \"second_largest\"\nassert data == [4, 9, 2, 7], \"second_largest changed its input\"\nassert clean_name(\"  ada LOVELACE \") == \"Ada Lovelace\", \"clean_name\"\nprint(\"all checks passed\")\n```",
     "a": "the failures come in this order: `count_vowels` (the capital E is not in `\"aeiou\"`: use `ch.lower()`); `second_largest changed its input` (`.sort()` sorts the caller's list in place: use `sorted(xs)[-2]`); `clean_name` (`.title` without brackets is the method itself, not its result: write `.title()`); then `all checks passed`."
    }
   },
   {
    "key": "python/I",
    "id": "I",
    "n": "Using code you did not write",
    "idea": "your program can use code that is not in its own file: Python ships with a large library, you can split your own code into files, and other people share theirs.",
    "needsText": "regions A to F; the terminal commands of section 3 (make a folder, change into it, copy a file, delete a folder, save a command's output into a file with `>`, run a file). PY-37 and PY-38 need the Python `venv` module and, for `pip`, a network.",
    "items": [
     {
      "id": "PY-35",
      "t": "`import`: use the standard library",
      "y": "bring a module in with `import name` and `from name import thing`, call what it holds with a dot (`math.sqrt`), find the name of the error when a module is not there, and know that the standard library already holds the counting you did by hand in PY-29.",
      "c": "Run a program that imports `math`, `statistics` and, with `from collections import Counter`, the name `Counter`, and prints one per line: `math.sqrt(16)`; `round(math.pi, 4)`; `math.floor(-2.5)`; `math.ceil(2.1)`; `statistics.mean([2, 4, 9])`; `statistics.median([5, 1, 3, 2])`; `Counter(\"banana\")`; `Counter(\"banana\").most_common(1)`. Then run `import mathh` inside a `try` and print the name of the error.",
      "a": "4.0 (`sqrt` always gives a float); 3.1416; -3 (`floor` goes down, as `//` does); 3; 5 (an int: the mean of 2, 4 and 9 is exactly 5); 2.5 (the middle of 2 and 3); `Counter({'a': 3, 'n': 2, 'b': 1})`; `[('a', 3)]`; and `ModuleNotFoundError` for a module that does not exist (a misspelt name gives this error, not a `NameError`).",
      "learn": [
       "`import math` brings in a module; call what it holds with a dot: `math.sqrt(16)`",
       "`from collections import Counter` brings in one name, so you write `Counter(...)` with no dot",
       "`math.sqrt(16)` gives `4.0`: `sqrt` always gives a float; `round(math.pi, 4)` gives `3.1416`",
       "`math.floor(-2.5)` gives `-3`, because `floor` goes down, and `math.ceil(2.1)` gives `3`",
       "`statistics.mean([2, 4, 9])` gives `5` (an int, since the mean is exactly 5)",
       "`statistics.median([5, 1, 3, 2])` gives `2.5`, the middle of 2 and 3",
       "`Counter(\"banana\")` gives `Counter({'a': 3, 'n': 2, 'b': 1})`: the counting you did by hand in PY-29",
       "`Counter(\"banana\").most_common(1)` gives `[('a', 3)]`",
       "`import mathh` in a `try` raises `ModuleNotFoundError`, not a `NameError`",
       "a misspelt module name gives `ModuleNotFoundError`, so check the spelling first"
      ],
      "ab": [
       [
        "write",
        "Import `math`, `statistics` and `Counter` and print the eight results"
       ],
       [
        "write",
        "Run `import mathh` inside a `try` and print the error name"
       ],
       [
        "predict",
        "Predict `4.0`, `3.1416`, `-3` and `3` for the four `math` lines"
       ],
       [
        "predict",
        "Predict `5` and `2.5` from the two `statistics` lines"
       ],
       [
        "read",
        "Read `Counter({'a': 3, 'n': 2, 'b': 1})` and say what the numbers count"
       ],
       [
        "say",
        "Say why `math.floor(-2.5)` is `-3` and not `-2`"
       ],
       [
        "pick",
        "Pick `import math` or `from math import sqrt` and say how each is called"
       ],
       [
        "fix",
        "Fix a misspelt module name after reading the error"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Modules",
        "url": "https://docs.python.org/3/tutorial/modules.html",
        "note": "Chapter 6. import and your own module."
       }
      ]
     },
     {
      "id": "PY-36",
      "t": "Your own module (and the `__main__` guard)",
      "y": "put a function in a file of its own, import it from another file of yours, say why its top-level lines run once when imported and again when the file is run itself, guard them with `if __name__ == \"__main__\":`, and know why a file must not be named after a module you import.",
      "c": "In one new folder save `greet.py` and `main.py`, and run `python main.py` (from inside that folder):\n\n```python\ndef greet(name):\n    return \"Hello, \" + name\n\nprint(\"greet.py ran as\", __name__)\n```\n\n```python\nimport greet\nimport greet\n\nprint(greet.greet(\"Ada\"))\n```\n\nWhat does it show, and how many times does the `greet.py ran as` line appear although `main.py` imports `greet` twice? Run `python greet.py` itself: what does it show? Now change `greet.py` to this and run both again:\n\n```python\ndef greet(name):\n    return \"Hello, \" + name\n\nif __name__ == \"__main__\":\n    print(\"greet.py ran as\", __name__)\n```\n\nLast, in a different new folder, save a file named `random.py` with the next two lines and run it. Give the error name and the words after `has no`. Then delete `random.py` (while it exists, every `import random` in that folder finds your file).\n\n```python\nimport random\nprint(random.randint(1, 6))\n```",
      "a": "the first run shows `greet.py ran as greet` once and then `Hello, Ada` (the second `import greet` finds the module already loaded and does not run the file again); `python greet.py` shows `greet.py ran as __main__` (`__name__` is `__main__` only in the file you run, and the module's own name when it is imported). With the guard, `main.py` shows only `Hello, Ada`, and `python greet.py` still shows `greet.py ran as __main__`. The last file ends in an `AttributeError` whose message holds `has no attribute 'randint'`: Python found your `random.py` first, so `import random` loaded your file, which has no `randint`. Never name a file after a module you import.",
      "o": "the wording after the error name differs between Python versions (3.13 says more than 3.12), so only the error name and `has no attribute 'randint'` are quoted. If you run a file with an editor's Run button, the folder of the file is normally on the import path too; the Guide ran these with `python file.py`, not with `python -I`.",
      "learn": [
       "a module is just a `.py` file: `import greet` loads `greet.py` and `greet.greet(\"Ada\")` calls its function",
       "keep `greet.py` and `main.py` in one folder and run `python main.py` from inside that folder",
       "top-level lines of a module, such as a `print`, run when the module is imported",
       "`__name__` is the module's own name when imported, and `\"__main__\"` in the file you run",
       "so `main.py` shows `greet.py ran as greet` once, then `Hello, Ada`",
       "the second `import greet` finds the module already loaded and does not run the file again",
       "`python greet.py` shows `greet.py ran as __main__`",
       "`if __name__ == \"__main__\":` runs its lines only when the file is run itself, so `main.py` then shows just `Hello, Ada`",
       "a file named `random.py` hides the real module: `import random` loads your file and raises an `AttributeError`",
       "the message holds `has no attribute 'randint'`; never name a file after a module you import, and delete the stray `random.py`"
      ],
      "ab": [
       [
        "write",
        "Save `greet.py` and `main.py` in one folder and run `python main.py`"
       ],
       [
        "write",
        "Add the `if __name__ == \"__main__\":` guard to `greet.py`"
       ],
       [
        "predict",
        "Predict how many times `greet.py ran as` shows when `main.py` imports `greet` twice"
       ],
       [
        "predict",
        "Predict the line that `python greet.py` shows"
       ],
       [
        "read",
        "Read an `AttributeError` and say which file Python found"
       ],
       [
        "say",
        "Say why a top-level line runs again when its file is run itself"
       ],
       [
        "fix",
        "Fix the `random.py` clash by deleting that file"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Modules",
        "url": "https://docs.python.org/3/tutorial/modules.html",
        "note": "Chapter 6. import and your own module."
       }
      ]
     },
     {
      "id": "PY-37",
      "t": "A virtual environment",
      "y": "make a virtual environment with `python -m venv .venv`, turn it on and off, tell from inside a program whether one is on, and delete it.",
      "c": "In a new folder run `python -m venv .venv`. Save a file `where.py` that holds the two lines below. Turn the environment on (Linux and macOS: `source .venv/bin/activate`; Windows: `.venv\\Scripts\\activate`). Run `python where.py`, then `python -m pip list`: is `pip` in the list? Turn it off with `deactivate` and run `python where.py` again. Last, delete the `.venv` folder: is it gone?\n\n```python\nimport sys\nprint(sys.prefix != sys.base_prefix)\n```",
      "a": "with the environment on `where.py` shows `True` and `pip` is in the list (the list is nearly empty: a new environment holds only what it needs to install things); after `deactivate` it shows `False`; after you delete the folder it is gone. An environment is a folder, so you can make one per project and delete it without harm: nothing outside it changed.",
      "o": "not run here (L-06): Windows and macOS; the Linux commands were run for real, with `bash` and `source`. Some Linux systems need a package (usually named `python3-venv`) before `venv` works. The list that `pip list` shows differs between Python versions (3.11 also lists `setuptools`), so only `pip` is asked for. On some Linux and macOS systems the command that makes the environment is `python3 -m venv .venv` (not run here); once the environment is on, `python` is its own Python (this was run). Windows: `py -m venv .venv` works as well as `python -m venv .venv`. In PowerShell, turn the environment on with `.venv\\Scripts\\Activate.ps1`; in Command Prompt with `.venv\\Scripts\\activate.bat`; in Git Bash with `source .venv/Scripts/activate` (the folder is `Scripts`, not `bin`; the last form is from memory, not checked in a document). If PowerShell says running scripts is disabled, Python's own `venv` page gives the fix: run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once, then turn the environment on again (read on the Python 3.8 and 3.9 versions of that page; it is a setting on your own account, so read what it does before you run it). To delete the folder: `Remove-Item -Recurse -Force .venv` in PowerShell, `rm -rf .venv` in Git Bash.",
      "learn": [
       "a virtual environment is a folder that keeps one project's installed packages apart from everything else",
       "make one in a new folder with `python -m venv .venv`",
       "on some Linux and macOS systems the command is `python3 -m venv .venv`; on Windows `py -m venv .venv` works too",
       "turn it on with `source .venv/bin/activate` (Linux, macOS) or `.venv\\Scripts\\activate` (Windows)",
       "with it on, `python where.py` shows `True`: `sys.prefix != sys.base_prefix` is true inside an environment",
       "`python -m pip list` then shows `pip` in a very short list: a new environment holds only what it needs to install things",
       "`deactivate` turns it off, and `python where.py` then shows `False`",
       "delete an environment by deleting the `.venv` folder, for example `rm -rf .venv`",
       "it is only a folder, so make one per project and delete it without harm: nothing outside it changed",
       "if `venv` does not work on Linux, a package usually named `python3-venv` may be needed first"
      ],
      "ab": [
       [
        "write",
        "Make an environment with `python -m venv .venv` in a new folder"
       ],
       [
        "write",
        "Save `where.py` with the two lines that compare `sys.prefix` and `sys.base_prefix`"
       ],
       [
        "write",
        "Turn the environment on and off with `activate` and `deactivate`"
       ],
       [
        "predict",
        "Predict `True` while it is on and `False` after `deactivate`"
       ],
       [
        "read",
        "Read the `pip list` output and find `pip`"
       ],
       [
        "say",
        "Say why it is safe to delete a `.venv` folder"
       ],
       [
        "write",
        "Delete the `.venv` folder and check that it is gone"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Virtual Environments and Packages",
        "url": "https://docs.python.org/3/tutorial/venv.html",
        "note": "Chapter 12. venv and pip."
       }
      ]
     },
     {
      "id": "PY-38",
      "t": "`pip install`, and rebuild an environment from a list",
      "y": "install a package into the environment that is on with `python -m pip install`, see what is installed with `python -m pip freeze`, save that list to `requirements.txt`, and make a second, new environment from the list alone.",
      "c": "Make a new environment (as in PY-37) and turn it on. Run `python -m pip install numpy`. Save `total.py` (below) and run it. Run `python -m pip freeze`: what does its line begin with, and how many lines are there? Save the output with `python -m pip freeze > requirements.txt`. In another new folder make a second environment, copy `total.py` and `requirements.txt` there, run `python -m pip install -r requirements.txt` and run `total.py` again.\n\n```python\nimport numpy as np\nprint(np.arange(5).sum())\n```",
      "a": "the first run of `total.py` shows `10` (0 + 1 + 2 + 3 + 4); `pip freeze` shows one line, which begins `numpy==` and then a version number (the version differs by machine and by day, so it is not quoted); the second environment, built from `requirements.txt` alone, shows `10` again. The list is what makes a project repeatable: someone else, or you next year, can build the same environment from it.",
      "o": "needs a network. The check script installs from PyPI for real, so it fails offline; that is not a bug in the item. `uv` and conda do the same two jobs (make an environment; install from a list). This pass teaches only the two that come with Python and names the others in section 7. Not run here (L-06): Windows. On Windows, run the `pip freeze > requirements.txt` line in Git Bash (L-53): Windows PowerShell 5.1's `>` writes UTF-16 text (from Microsoft's documentation, part 14), which pip may not read back (that last part is from memory, not run). If you use PowerShell anyway, `python -m pip freeze | Out-File -Encoding ascii requirements.txt` writes plain text (from memory, not run). The Guide used `python -m pip` because it installs into the same Python that runs your programs; a bare `pip` can belong to a different Python.",
      "learn": [
       "`python -m pip install numpy` installs a package into the environment that is on, and needs a network",
       "use `python -m pip`, so pip installs into the same Python that runs your programs",
       "`total.py` with `import numpy as np` and `print(np.arange(5).sum())` shows `10` (0 + 1 + 2 + 3 + 4)",
       "`python -m pip freeze` lists what is installed: here one line, which begins `numpy==` and then a version number",
       "the version differs by machine and by day, so do not expect a fixed number",
       "`python -m pip freeze > requirements.txt` saves that list into a file",
       "in a new folder make a second environment and copy in `total.py` and `requirements.txt`",
       "run `python -m pip install -r requirements.txt` there, then `total.py` shows `10` again",
       "the list is what makes a project repeatable: someone else, or you next year, can build the same environment",
       "`uv` and conda do the same two jobs; this item uses the two that come with Python"
      ],
      "ab": [
       [
        "write",
        "Install `numpy` with `python -m pip install numpy` in a new environment"
       ],
       [
        "write",
        "Save the list with `python -m pip freeze > requirements.txt`"
       ],
       [
        "write",
        "Build a second environment from `requirements.txt` alone"
       ],
       [
        "predict",
        "Predict `10` from `total.py` in both environments"
       ],
       [
        "read",
        "Read the `pip freeze` line and say what comes before and after `==`"
       ],
       [
        "say",
        "Say why a `requirements.txt` makes a project repeatable"
       ],
       [
        "pick",
        "Pick `python -m pip` over a bare `pip` to match the Python that runs your code"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Virtual Environments and Packages",
        "url": "https://docs.python.org/3/tutorial/venv.html",
        "note": "Chapter 12. venv and pip."
       }
      ]
     }
    ],
    "task": {
     "t": "Share a project that rebuilds",
     "u": "import, your own module, a virtual environment, `pip install`, `freeze`",
     "k": "Make a folder `proj`, an environment in it, and install NumPy there. In `proj` save these two files and run `python main.py` with the environment on: what does it print?\n\n```python\nimport numpy as np\n\n\ndef rms(xs):\n    return np.sqrt(sum([x * x for x in xs]) / len(xs))\n```\n\n```python\nimport statistics\nfrom mytools import rms\n\nprint(statistics.mean([3, 4, 5]), f\"{rms([3, 4, 5]):.4f}\")\n```\n\nFreeze to `requirements.txt`: how many lines? Then make a second folder `proj2`, copy only `mytools.py`, `main.py` and `requirements.txt` into it, make a new environment there from `requirements.txt` and run `python main.py`. Do you get the same line?",
     "a": "`4 4.0825` (the mean of 3, 4 and 5 is exactly 4; the root of the mean of the squares, 9 + 16 + 25 over 3, is 4.0825 to four places); `requirements.txt` has one line (`numpy==` and a version); the rebuilt environment in `proj2` prints `4 4.0825` again. Only one NumPy call is used here, on one number; arrays come in section 4."
    }
   },
   {
    "key": "python/J",
    "id": "J",
    "n": "Numbers on a computer",
    "idea": "a computer's decimal numbers are close, not exact, so you compare them with a tolerance and you know what `inf` and `nan` are.",
    "needsText": "regions A to F, PY-34 (`assert`) and PY-35 (`import math`). First contact only: how rounding error grows in a long sum, and how to keep a calculation stable, belong to skill 19 and point back here.",
    "items": [
     {
      "id": "PY-39",
      "t": "Decimals are close, not exact",
      "y": "show that `0.1 + 0.2` is not `0.3`, see the number the computer really stores, and know that whole numbers are exact and decimals are not.",
      "c": "Print: `0.1 + 0.2`; `0.1 + 0.2 == 0.3`; `f\"{0.1:.20f}\"`. Start `total = 0.0`, add `0.1` to it ten times in a loop, and print `total` and `total == 1.0`. Then print `2 ** 64 + 1`, and `2.0 ** 53 + 1 == 2.0 ** 53`.",
      "a": "`0.30000000000000004`; `False`; `0.10000000000000000555` (the computer keeps the nearest number it can write in binary, and 0.1 is not one of them, so 0.1 is stored a hair high); after the loop `0.9999999999999999` and `False` (ten tiny errors did not cancel); `18446744073709551617` (a whole number is exact however big); and `True` (from 2 to the power 53 upwards a float cannot hold every whole number, so there adding 1 changes nothing).",
      "o": "use a loop, not `sum([0.1] * 10)`: from Python 3.12 `sum` adds floats with a correction and gives `1.0`, while on 3.11 and older it gives `0.9999999999999999`; a loop gives `0.9999999999999999` on all of them. The check script asserts this for the Python that runs it.",
      "learn": [
       "`0.1 + 0.2` shows `0.30000000000000004`, not `0.3`, so `0.1 + 0.2 == 0.3` is `False`",
       "the computer keeps the nearest number it can write in binary, and 0.1 is not one of them",
       "`f\"{0.1:.20f}\"` shows `0.10000000000000000555`: 0.1 is stored a hair high",
       "start `total = 0.0` and add `0.1` ten times in a loop: `total` is `0.9999999999999999`",
       "`total == 1.0` is `False`: ten tiny errors did not cancel out",
       "whole numbers are exact however big: `2 ** 64 + 1` is `18446744073709551617`",
       "decimals are not exact, and from 2 to the power 53 upwards a float cannot hold every whole number",
       "so `2.0 ** 53 + 1 == 2.0 ** 53` is `True`: adding 1 changes nothing there",
       "use a loop for the test, not `sum([0.1] * 10)`: from Python 3.12 `sum` gives `1.0`, before that `0.9999999999999999`"
      ],
      "ab": [
       [
        "write",
        "Print `0.1 + 0.2` and `0.1 + 0.2 == 0.3`"
       ],
       [
        "write",
        "Print `f\"{0.1:.20f}\"` to see the number the computer really stores"
       ],
       [
        "write",
        "Add `0.1` to `total` ten times in a loop and print `total` and `total == 1.0`"
       ],
       [
        "predict",
        "Predict `0.9999999999999999` and `False` for the loop total"
       ],
       [
        "read",
        "Read `0.10000000000000000555` and say it is a hair above 0.1"
       ],
       [
        "say",
        "Say why whole numbers are exact but decimals are not"
       ],
       [
        "say",
        "Say what changes for a float at 2 to the power 53"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Floating-Point Arithmetic",
        "url": "https://docs.python.org/3/tutorial/floatingpoint.html",
        "note": "Chapter 15. Why decimals are close, not exact."
       }
      ]
     },
     {
      "id": "PY-40",
      "t": "Compare with a tolerance",
      "y": "test whether two decimals are close with `math.isclose` or with `abs(a - b) < tolerance`, know that `math.isclose` measures closeness relative to the numbers unless you give `abs_tol`, and use it inside an `assert`.",
      "c": "Let `a = 0.1 + 0.2`. Print on separate lines: `a == 0.3`; `math.isclose(a, 0.3)`; `abs(a - 0.3) < 1e-9`; `math.isclose(1e-12, 0.0)`; `math.isclose(1e-12, 0.0, abs_tol=1e-9)`; `round(a, 2) == 0.3`. Then run `assert math.isclose(a, 0.3), \"close\"` (what does it show?) and, in a `try`, `assert a == 0.3, \"exact\"` (print the error name, a space and the message).",
      "a": "`False`, `True`, `True`, `False`, `True`, `True`; the first assert shows nothing; the second gives `AssertionError: exact`. `math.isclose(1e-12, 0.0)` is `False` because its default tolerance is relative to the size of the numbers, and nothing is close to 0 in that sense: when one of the numbers can be 0, give `abs_tol`. Compare decimals with a tolerance, never with `==`.",
      "learn": [
       "never compare decimals with `==`: with `a = 0.1 + 0.2`, `a == 0.3` is `False`",
       "`math.isclose(a, 0.3)` is `True`: it tests whether two decimals are close",
       "`abs(a - 0.3) < 1e-9` is `True`: your own tolerance does the same job",
       "`1e-9` means 0.000000001, one billionth",
       "`math.isclose` measures closeness relative to the size of the numbers",
       "so `math.isclose(1e-12, 0.0)` is `False`: nothing is close to 0 in that sense",
       "when one of the numbers can be 0, give `abs_tol`: `math.isclose(1e-12, 0.0, abs_tol=1e-9)` is `True`",
       "`round(a, 2) == 0.3` is `True` as well",
       "`assert math.isclose(a, 0.3), \"close\"` shows nothing, because it passes",
       "`assert a == 0.3, \"exact\"` fails: caught in a `try`, it gives the error name `AssertionError` and the message `exact`"
      ],
      "ab": [
       [
        "write",
        "Print the six comparisons for `a = 0.1 + 0.2`, one per line"
       ],
       [
        "write",
        "Put `math.isclose` inside an `assert`"
       ],
       [
        "predict",
        "Predict `False`, `True`, `True`, `False`, `True`, `True`"
       ],
       [
        "say",
        "Say why `math.isclose(1e-12, 0.0)` is `False`"
       ],
       [
        "pick",
        "Pick `abs_tol` when one of the numbers can be 0"
       ],
       [
        "fix",
        "Fix a check that uses `==` on decimals"
       ],
       [
        "read",
        "Read `1e-9` as 0.000000001"
       ]
      ],
      "src": [
       {
        "title": "Python Tutorial: Floating-Point Arithmetic",
        "url": "https://docs.python.org/3/tutorial/floatingpoint.html",
        "note": "Chapter 15. Why decimals are close, not exact."
       }
      ]
     },
     {
      "id": "PY-41",
      "t": "`inf` and `nan`",
      "y": "make and recognise `inf` and `nan`, know that `nan` is not equal to anything (itself included) so you test it with `math.isnan`, and tell the cases Python stops on (an error) from the cases it carries on with (`inf`, `nan`).",
      "c": "Let `inf = float(\"inf\")` and `nan = float(\"nan\")`. Print, one per line: `inf > 10 ** 100`; `1e308 * 10`; `-inf`; `inf - inf`; `nan == nan`; `nan > 1` and `nan < 1` on one line; `math.isnan(nan)` and `math.isnan(inf)` on one line; `sum([1.0, nan, 3.0])`. Then give the error names that `1 / 0` and `math.sqrt(-1)` raise.",
      "a": "`True`; `inf` (multiplying past the biggest float gives `inf` and no error); `-inf`; `nan` (infinity minus infinity has no answer); `False` (`nan` is not equal to itself); `False False` (every comparison with `nan` is false); `True False`; `nan` (one missing value spoils a whole sum: this is why a missing value in a table is often `nan`); and `ZeroDivisionError` and `ValueError`. So `1 / 0` stops the program while `1e308 * 10` quietly gives `inf`.",
      "learn": [
       "`float(\"inf\")` is infinity and `float(\"nan\")` is \"not a number\": both are values Python carries on with",
       "`inf > 10 ** 100` is `True`, and `-inf` is minus infinity",
       "`1e308 * 10` gives `inf`: going past the biggest float gives `inf` and no error",
       "`inf - inf` gives `nan`, because infinity minus infinity has no answer",
       "`nan == nan` is `False`: `nan` is not equal to anything, itself included",
       "`nan > 1` and `nan < 1` are both `False`: every comparison with `nan` is false",
       "so test for it with `math.isnan`: `math.isnan(nan)` is `True` and `math.isnan(inf)` is `False`",
       "`sum([1.0, nan, 3.0])` gives `nan`: one missing value spoils a whole sum",
       "a missing value in a table is often `nan`",
       "`1 / 0` raises `ZeroDivisionError` and `math.sqrt(-1)` raises `ValueError`: those stop the program, while `inf` and `nan` do not"
      ],
      "ab": [
       [
        "write",
        "Print the eight lines for `inf` and `nan`"
       ],
       [
        "write",
        "Test a value with `math.isnan`"
       ],
       [
        "predict",
        "Predict `inf` for `1e308 * 10` and `nan` for `inf - inf`"
       ],
       [
        "predict",
        "Predict `False` for `nan == nan`"
       ],
       [
        "read",
        "Read a result of `nan` and say where a missing value came in"
       ],
       [
        "say",
        "Say why `nan` needs `math.isnan` and not `==`"
       ],
       [
        "say",
        "Name the errors that `1 / 0` and `math.sqrt(-1)` raise"
       ],
       [
        "pick",
        "Pick which cases stop with an error and which carry on with `inf` or `nan`"
       ]
      ]
     }
    ],
    "task": {
     "t": "Two small number tools",
     "u": "tolerance, `math.isclose`, `nan`, loops, functions",
     "k": "Write `close(a, b)`, which gives `True` when `a` and `b` agree to a relative tolerance of 1e-9 or an absolute tolerance of 1e-12 (use `math.isclose` with `rel_tol` and `abs_tol`). Write `mean_ignoring_nan(xs)`, which gives the mean of the numbers in `xs` that are not `nan`, and `nan` when there are none. Print `close(0.1 + 0.2, 0.3)`, `close(1e-13, 0.0)` and `close(1.0, 1.0000001)` on one line; then print `mean_ignoring_nan([1.0, nan, 3.0])` and `mean_ignoring_nan([nan])`, one per line (let `nan = float(\"nan\")`).",
     "a": "`True True False` (the third pair differs by 1e-7, far more than 1e-9 of their size); `2.0` (the mean of 1.0 and 3.0); `nan` (nothing is left to average)."
    }
   },
   {
    "key": "python/K",
    "id": "K",
    "n": "Randomness",
    "idea": "random numbers on a computer repeat when you fix the seed, and many random trials give a good estimate of a probability.",
    "needsText": "regions A to F (loops, functions, lists) and PY-35 (`import`). Skill 1 is the home of seeds and simulation; the probability items of the first pass point here.",
    "items": [
     {
      "id": "PY-42",
      "t": "The `random` module",
      "y": "draw random whole numbers and decimals, pick from a list, take a sample without repeats, and shuffle a list in place, and know that `randint` includes both ends.",
      "c": "With `import random`, run a program that: makes a list of 1,000 values of `random.randint(1, 6)` and prints its smallest value, its largest and how many different values it holds on one line; prints whether `random.random()` is at least 0 and below 1; prints whether `random.choice(colors)` is in `colors = [\"red\", \"green\", \"blue\"]`; takes `picked = random.sample(range(10), 3)` and prints `len(picked)` and `len(set(picked))` on one line; then, with `cards = [1, 2, 3, 4, 5]`, prints `random.shuffle(cards)` itself and, on the next line, `sorted(cards)`.",
      "a": "`1 6 6` (both ends of `randint` are included, unlike `range`, and 1,000 rolls miss a face with a chance far below one in a trillion); `True`; `True`; `3 3` (a sample has no repeats); `None` (`shuffle` changes the list in place and gives back nothing, like `.sort()`); `[1, 2, 3, 4, 5]` (the same cards, in a new order that you do not see here). Only these properties are checked, because the numbers themselves change on every run.",
      "learn": [
       "`import random` gives the module, and you call its functions with a dot",
       "`random.randint(1, 6)` gives a whole number from 1 to 6: both ends are included, unlike `range`",
       "1,000 rolls print `1 6 6`: smallest 1, largest 6 and 6 different values",
       "a face missing from 1,000 rolls has a chance far below one in a trillion",
       "`random.random()` gives a decimal that is at least 0 and below 1",
       "`random.choice(colors)` picks one item of the list, so it is always in `colors`",
       "`random.sample(range(10), 3)` takes 3 items with no repeats, so `len(set(picked))` is `3`",
       "`random.shuffle(cards)` changes the list in place and gives back `None`, like `.sort()`",
       "`sorted(cards)` after a shuffle is still `[1, 2, 3, 4, 5]`: the same cards in a new order",
       "the numbers change on every run, so check properties such as range and length, not exact values"
      ],
      "ab": [
       [
        "write",
        "Make 1,000 values of `random.randint(1, 6)` and print the smallest, the largest and how many differ"
       ],
       [
        "write",
        "Take a `random.sample` and print `len(picked)` and `len(set(picked))`"
       ],
       [
        "write",
        "Shuffle `cards`, print what `random.shuffle` gives back, then print `sorted(cards)`"
       ],
       [
        "predict",
        "Predict `1 6 6` for the 1,000 rolls"
       ],
       [
        "predict",
        "Predict `None` for `random.shuffle(cards)`"
       ],
       [
        "say",
        "Say how `randint` differs from `range` at the top end"
       ],
       [
        "say",
        "Say why a check looks at properties and not at exact random numbers"
       ],
       [
        "pick",
        "Pick `random.choice` for one item or `random.sample` for several without repeats"
       ]
      ]
     },
     {
      "id": "PY-43",
      "t": "Seeds: make random numbers repeat",
      "y": "fix the generator with `random.seed(n)` so the same program gives the same numbers every time, and tell when you want that (to repeat a result) and when you do not (to get fresh numbers).",
      "c": "Run `random.seed(0)` and then print `random.random()`. Next make a list `a` of five values of `random.randint(1, 100)` after `random.seed(0)`, a list `b` the same way after `random.seed(0)` again, and a list `c` the same way after `random.seed(1)`; print `a == b` and `a == c` on one line. Last, save the two programs below and run each of them twice: do the two runs of each print the same number?\n\n```python\nimport random\nprint(random.random())\n```\n\n```python\nimport random\nrandom.seed(42)\nprint(random.random())\n```",
      "a": "`0.8444218515250481` (the documentation promises that `random()` goes on giving the same sequence for the same seed from one Python version to the next, and this number was the same on Python 3.11, 3.12 and 3.13, so it can be quoted); `True False` (same seed, same numbers; a different seed, different numbers); the first file prints a different number on every run, the second prints the same number every run. Fix a seed when you want to repeat a result (to debug it, or to show it to someone else); leave it alone when you want fresh numbers.",
      "o": "the promise is from the Python documentation's Notes on Reproducibility (read on 8 Nov 2026): the generator's `random()` method will go on producing the same sequence when the compatible seeder is given the same seed, while most other algorithms, such as those behind `randint`, `choice` and `shuffle`, may change between versions. That `random.seed(0)` is that compatible seeder is the Guide's reading (L-06); what was run is that the number is the same on 3.11, 3.12 and 3.13. No exact value of the other functions is quoted anywhere.",
      "learn": [
       "a random generator follows a sequence that depends on its seed",
       "`random.seed(0)` fixes it, so the next `random.random()` is `0.8444218515250481` every time",
       "that number was the same on Python 3.11, 3.12 and 3.13; the exact values of `randint`, `choice` and `shuffle` are not promised across versions",
       "make `a` and `b` as five `random.randint(1, 100)` values, each after `random.seed(0)`: the two lists are equal",
       "make `c` the same way after `random.seed(1)`: it is a different list",
       "so `print(a == b, a == c)` shows `True False`: same seed, same numbers; a different seed, different numbers",
       "a program with no seed prints a different number on every run",
       "a program with `random.seed(42)` prints the same number on every run",
       "fix a seed when you want to repeat a result: to debug it, or to show it to someone else",
       "leave the seed alone when you want fresh numbers"
      ],
      "ab": [
       [
        "write",
        "Print `random.random()` after `random.seed(0)`"
       ],
       [
        "write",
        "Build lists `a`, `b` and `c` after `random.seed(0)` and `random.seed(1)` and print `a == b` and `a == c`"
       ],
       [
        "predict",
        "Predict `True False` before you run"
       ],
       [
        "predict",
        "Predict whether two runs of each saved program print the same number"
       ],
       [
        "read",
        "Read two runs of a program and say whether a seed was set"
       ],
       [
        "say",
        "Say when you want a fixed seed and when you do not"
       ],
       [
        "pick",
        "Pick a seed to repeat a result, or no seed to get fresh numbers"
       ]
      ]
     },
     {
      "id": "PY-44",
      "t": "Estimate a probability by simulation",
      "y": "estimate a probability by running the random event many times and dividing the number of times it happened by the number of trials, and compare the estimate with the exact answer found by counting.",
      "c": "Put `random.seed(2024)` at the top. With 100,000 trials each, estimate (a) the chance that two dice add up to 7 and (b) the chance of at least one six in four throws of one die. Print both as a fraction of the trials, to 3 decimals. Then work out the exact chances by counting: for (a), how many of the 36 pairs of faces add up to 7; for (b), one minus the chance of no six in four throws, (5/6) to the power 4.",
      "a": "your two numbers will differ from the Guide's by a little, and that is right: a simulation is not exact. Exact: (a) 6 of 36 pairs, 0.1667; (b) 1 - (5/6)^4, 0.5177. Each of your estimates must be within 0.008 of its exact value: (a) between 0.159 and 0.175, (b) between 0.510 and 0.526. The Guide ran a correct program with every seed from 0 to 199 and none of the 200 fell outside the band, so a correct program passes whatever the seed. A program that falls outside has a bug: the Guide tried three wrong versions on seeds 0 to 9 (`>=` where `==` was meant, a die numbered 1 to 5, dividing by the wrong number of trials) and 3 of 3 fell outside the band on every seed.",
      "learn": [
       "a simulation runs a random event many times; the estimate is the number of times it happened divided by the trials",
       "put `random.seed(2024)` at the top, so your run repeats",
       "(a) two dice add up to 7: roll two `randint(1, 6)` values 100,000 times and count the sums equal to 7",
       "(b) at least one six in four throws of one die: count a trial when any of its four throws is 6",
       "print each estimate as the count divided by the trials, to 3 decimals, for example `f\"{p:.3f}\"`",
       "exact (a), by counting: 6 of the 36 pairs of faces add up to 7, so the chance is 0.1667",
       "exact (b): one minus the chance of no six in four throws, `1 - (5/6) ** 4`, which is 0.5177",
       "your numbers will differ a little from the exact ones, and that is right: a simulation is not exact",
       "a correct estimate lands within 0.008 of the exact value: (a) 0.159 to 0.175 and (b) 0.510 to 0.526",
       "bugs to watch for: `>=` where `==` was meant, a die numbered 1 to 5, and dividing by the wrong number of trials"
      ],
      "ab": [
       [
        "write",
        "Roll two dice 100,000 times and count the sums equal to 7"
       ],
       [
        "write",
        "Count the trials with at least one six in four throws of one die"
       ],
       [
        "write",
        "Print both estimates as a fraction of the trials to 3 decimals"
       ],
       [
        "write",
        "Work out the exact chances by counting: `6/36` and `1 - (5/6) ** 4`"
       ],
       [
        "predict",
        "Predict that each estimate lands close to, but not exactly on, its exact value"
       ],
       [
        "read",
        "Read two estimates and check each is within 0.008 of its exact value"
       ],
       [
        "fix",
        "Fix a simulation that uses `>=` where `==` was meant"
       ],
       [
        "say",
        "Say why a simulation is not exact"
       ]
      ]
     }
    ],
    "task": {
     "t": "Estimate pi",
     "u": "the `random` module, seeds, loops, functions, estimating by simulation",
     "k": "Write `estimate_pi(n, seed)`: seed the generator with `seed`, throw `n` random points `(x, y)` (each of `x` and `y` from `random.random()`), count the points with `x * x + y * y < 1` (inside the quarter circle of radius 1 in the unit square) and return `4 * inside / n`. Print `abs(estimate_pi(200000, 7) - math.pi) < 0.02` and, on the next line, `estimate_pi(1000, 3) == estimate_pi(1000, 3)`.",
     "a": "`True` and `True`. The quarter circle takes up pi/4 of the unit square (pi/4 = 0.7854), so the fraction of points inside, times 4, estimates pi. With 200,000 points the estimate lands within 0.02 of pi for every seed (the Guide ran seeds 0 to 199: all 200 did), and the same seed gives the same estimate twice because the points are the same.\n<!-- PY:END -->"
    }
   }
  ]
 },
 {
  "id": "numpy",
  "name": "NumPy",
  "code": "NP",
  "regions": [
   {
    "key": "numpy/NP-A",
    "id": "NP-A",
    "n": "Arrays, made and described",
    "idea": "an array is a grid of values of one type, and you can say what one looks like before you look.",
    "needsText": "Python regions A to F and I (running a file, `pip install`); `pip install numpy pandas` once. Run each solution as a file (`np1.py`, ...) with `python np1.py`; no `python -c` one-liners, because the quoting differs between Git Bash, cmd and PowerShell. Windows: `python` (or `py`) after `pip install numpy pandas` [from memory, not run].",
    "items": [
     {
      "id": "NP-1",
      "t": "An array is not a list",
      "y": "say what `+` does to two lists and what it does to two arrays.",
      "c": "Write down, before you run anything, what `[1, 2, 3] + [10, 20, 30]` gives, and what the same sum gives when both lists are turned into arrays with `np.array(...)`. Then run both and compare.",
      "a": "The lists are joined into one longer list: `[1, 2, 3, 10, 20, 30]`. The arrays are added value by value: `[11 22 33]` (an array prints without commas).",
      "learn": [
       "a list and an array look alike but behave differently",
       "`+` on two lists joins them into one longer list: `[1, 2, 3, 10, 20, 30]`",
       "`np.array(...)` turns a list into an array",
       "`+` on two arrays adds value by value: `[11 22 33]`",
       "an array prints without commas",
       "write down your guess before you run anything, then compare",
       "this is why arrays exist: arithmetic on every value without a loop"
      ],
      "ab": [
       [
        "predict",
        "Say what `+` gives for two lists and for two arrays before running"
       ],
       [
        "write",
        "Turn a list into an array with `np.array(...)`"
       ],
       [
        "read",
        "Read `[11 22 33]` and say why it has no commas"
       ],
       [
        "say",
        "Say the difference between joining and adding"
       ],
       [
        "write",
        "Run both sums and compare them with your guess"
       ],
       [
        "fix",
        "Fix code that uses `+` on lists when it should add value by value"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.4 One dimensional NumPy",
       "tags": [
        "video",
        "lab"
       ]
      },
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-2",
      "t": "Describe an array",
      "y": "say an array's `shape`, `ndim`, `size` and `dtype` without guessing.",
      "c": "Take `a = np.array([[1, 2], [3, 4], [5, 6]])`. Write down its shape, its number of dimensions, its size (how many values) and its dtype (the type of the values), then print `a.shape, a.ndim, a.size, a.dtype` and compare.",
      "a": "Three rows and two columns, two dimensions, six values, whole numbers stored as `int64`: the line `(3, 2) 2 6 int64`.",
      "o": "Windows: with NumPy 2 the default whole-number type should also be `int64` (from the release notes, from memory, not run); with NumPy 1 on Windows it was `int32` (from memory).",
      "learn": [
       "`shape` gives the rows and columns: here `(3, 2)`",
       "`ndim` is the number of dimensions: 2",
       "`size` is how many values there are in all: 6",
       "`dtype` is the type of the values: `int64` for whole numbers",
       "print them together with `a.shape, a.ndim, a.size, a.dtype` and get `(3, 2) 2 6 int64`",
       "say them before you print: no guessing",
       "on Windows with NumPy 2 the default whole-number type should also be `int64` (the item notes this from the release notes)"
      ],
      "ab": [
       [
        "write",
        "Print `a.shape, a.ndim, a.size, a.dtype`"
       ],
       [
        "predict",
        "Say the shape, ndim, size and dtype of an array before printing"
       ],
       [
        "read",
        "Read `(3, 2) 2 6 int64` part by part"
       ],
       [
        "say",
        "Say the difference between shape and size"
       ],
       [
        "say",
        "Say what dtype tells you"
       ],
       [
        "pick",
        "Pick `shape`, `ndim`, `size` or `dtype` to answer 'how many values' or 'what type'"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.4 One dimensional NumPy",
       "tags": [
        "video",
        "lab"
       ]
      },
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-3",
      "t": "Make arrays of a given size and range",
      "y": "make arrays with `zeros`, `ones`, `arange` and `linspace`.",
      "c": "Write one line each that makes: ten zeros; the numbers 0, 2, 4, 6, 8 (hint: `arange` stops before its end value); five evenly spaced numbers from 0 to 1 with both ends included (`linspace`); three ones. Print all four.",
      "a": "One way: `np.zeros(10)` prints `[0. 0. 0. 0. 0. 0. 0. 0. 0. 0.]`; `np.arange(0, 10, 2)` prints `[0 2 4 6 8]`; `np.linspace(0, 1, 5)` prints `[0.   0.25 0.5  0.75 1.  ]`; `np.ones(3)` prints `[1. 1. 1.]`. The dot means the values are decimals.",
      "learn": [
       "`np.zeros(10)` makes ten zeros: `[0. 0. 0. 0. 0. 0. 0. 0. 0. 0.]`",
       "the dot after a number means the values are decimal",
       "`np.arange(0, 10, 2)` gives `[0 2 4 6 8]`: it stops before its end value",
       "`np.linspace(0, 1, 5)` gives five evenly spaced numbers with both ends included",
       "`np.ones(3)` gives `[1. 1. 1.]`",
       "`arange` steps by a size; `linspace` asks for how many numbers",
       "other ways to write the same arrays exist: the check accepts any that gives the right values"
      ],
      "ab": [
       [
        "write",
        "Make ten zeros with `np.zeros(10)`"
       ],
       [
        "write",
        "Make 0, 2, 4, 6, 8 with `np.arange`"
       ],
       [
        "write",
        "Make five numbers from 0 to 1 with `np.linspace`"
       ],
       [
        "write",
        "Make three ones with `np.ones(3)`"
       ],
       [
        "pick",
        "Pick `arange` or `linspace` for a given range"
       ],
       [
        "say",
        "Say why `arange` stops before its end value"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.4 One dimensional NumPy",
       "tags": [
        "video",
        "lab"
       ]
      },
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-4",
      "t": "Types and casting",
      "y": "read an array's type and change it with `astype`.",
      "c": "Print the dtype of `np.array([1, 2, 3])` and of `np.array([1, 2.5, 3])`. Then, before you run it, say what `np.array([1.9, -1.9]).astype(int)` gives: does it round or cut off the decimals? Finally turn `[1, 2, 3]` into decimals with `astype(float)`.",
      "a": "Whole numbers give `int64`, one decimal makes the whole array `float64`: `int64 float64`. `astype(int)` cuts off towards zero, it does not round: `[ 1 -1]`. `astype(float)` gives `[1. 2. 3.]`.",
      "learn": [
       "`dtype` shows the type of the values in an array",
       "whole numbers give `int64`; one decimal makes the whole array `float64`",
       "`astype` changes the type of an array",
       "`astype(int)` cuts off towards zero and does not round: `[ 1 -1]`",
       "`astype(float)` turns `[1, 2, 3]` into `[1. 2. 3.]`",
       "guess before you run: round or cut off?",
       "an array holds one type, so one decimal changes every value"
      ],
      "ab": [
       [
        "write",
        "Print the dtype of two arrays"
       ],
       [
        "predict",
        "Say whether `astype(int)` rounds or cuts off"
       ],
       [
        "write",
        "Turn whole numbers into decimals with `astype(float)`"
       ],
       [
        "read",
        "Read `int64 float64` and say why the second one changed"
       ],
       [
        "say",
        "Say what happens to -1.9 when you cast it to int"
       ],
       [
        "predict",
        "Predict `[ 1 -1]` for `np.array([1.9, -1.9]).astype(int)`"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     }
    ],
    "task": {
     "t": "A table of zeros, as whole numbers",
     "u": "NP-2, NP-3, NP-4",
     "k": "Make a 4-by-3 array of zeros (`np.zeros((4, 3))`), turn it into whole numbers with `astype(int)`, and print its shape, ndim, size and dtype on one line.",
     "a": "The line `(4, 3) 2 12 int64`."
    }
   },
   {
    "key": "numpy/NP-B",
    "id": "NP-B",
    "n": "Reaching into arrays",
    "idea": "you pick out parts of an array by position or by a condition, and you know when the original changes.",
    "needsText": "region NP-A.",
    "items": [
     {
      "id": "NP-5",
      "t": "Slices of a one-dimensional array",
      "y": "pick out a run of values, every n-th value and the array reversed with a slice.",
      "c": "With `a = np.arange(10)` (the numbers 0 to 9) get: the values 3, 4, 5; every third value starting at the first; the whole array reversed. Print each.",
      "a": "`a[3:6]` prints `[3 4 5]` (the end of a slice is left out); `a[::3]` prints `[0 3 6 9]`; `a[::-1]` prints `[9 8 7 6 5 4 3 2 1 0]`.",
      "learn": [
       "`a[3:6]` gives `[3 4 5]`: the end of a slice is left out",
       "the length of a slice is stop minus start: `a[3:6]` holds 6 - 3 = 3 values",
       "`a[::3]` gives every third value from the first: `[0 3 6 9]`",
       "`a[::-1]` gives the array reversed: `[9 8 7 6 5 4 3 2 1 0]`",
       "a slice is `start:stop:step`, and each part can be left out",
       "counting starts at 0",
       "a negative step walks backwards"
      ],
      "ab": [
       [
        "write",
        "Get the values 3, 4, 5 with a slice"
       ],
       [
        "write",
        "Get every third value with `a[::3]`"
       ],
       [
        "write",
        "Reverse an array with `a[::-1]`"
       ],
       [
        "predict",
        "Say what a slice gives before you print it"
       ],
       [
        "say",
        "Say why the end of a slice is left out"
       ],
       [
        "read",
        "Read `[0 3 6 9]` and say which positions it came from"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.4 One dimensional NumPy",
       "tags": [
        "video",
        "lab"
       ]
      },
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-6",
      "t": "Two dimensions: rows and columns",
      "y": "pick a value, a row and a column from a two-dimensional array with `a[row, column]`.",
      "c": "Make `g = np.arange(12).reshape(3, 4)` (`reshape` is item NP-12; for now copy that line) and print it. Then get the second column, the last row and the single value 6.",
      "a": "The grid is three rows of four values. `g[:, 1]` is `[1 5 9]`; `g[-1]` is `[ 8  9 10 11]`; `g[1, 2]` is `6`.",
      "learn": [
       "`a[row, column]` picks one value from a two-dimensional array",
       "`np.arange(12).reshape(3, 4)` makes a grid of three rows of four (reshape comes in NP-12)",
       "`g[:, 1]` is the second column: `[1 5 9]`",
       "`g[-1]` is the last row: `[ 8  9 10 11]`",
       "the row comes first and the column second: `g[1, 2]` is row 1, column 2, counting from 0",
       "`g[1, 2]` is the single value `6`",
       "`:` means all of that direction and `-1` means the last one"
      ],
      "ab": [
       [
        "write",
        "Pick the second column with `g[:, 1]`"
       ],
       [
        "write",
        "Pick the last row with `g[-1]`"
       ],
       [
        "write",
        "Pick the value 6 with `g[1, 2]`"
       ],
       [
        "predict",
        "Say what a row and column index give before you print"
       ],
       [
        "say",
        "Say what `:` means inside the brackets"
       ],
       [
        "read",
        "Read `g` and say which value sits in row 1, column 2"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.5 Two dimensional NumPy",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-7",
      "t": "Pick values with a condition",
      "y": "build a true-or-false mask and use it to count, pick and change values.",
      "c": "With `a = np.array([3, 8, 1, 9, 4, 6, 2])`: print `a > 5`; count how many values are above 5; print those values; then set every even value to 0 and print `a`.",
      "a": "`a > 5` is `[False  True False  True False  True False]`; the count is `3` (`(a > 5).sum()`); the values are `[8 9 6]` (`a[a > 5]`); after `a[a % 2 == 0] = 0` the array is `[3 0 1 9 0 0 0]`.",
      "learn": [
       "`a > 5` gives a true-or-false mask the same size as `a`",
       "`(a > 5).sum()` counts the Trues: 3",
       "`a[a > 5]` picks the values where the mask is True: `[8 9 6]`",
       "`a[a % 2 == 0] = 0` changes those values in place: `[3 0 1 9 0 0 0]`",
       "`a % 2 == 0` is itself a mask: it is `True` at the even values 8, 4, 6 and 2",
       "the mask is the condition applied to every value at once",
       "a mask can count, pick and change"
      ],
      "ab": [
       [
        "write",
        "Build a mask with `a > 5`"
       ],
       [
        "write",
        "Count the Trues with `.sum()`"
       ],
       [
        "write",
        "Pick the values above 5 with `a[a > 5]`"
       ],
       [
        "write",
        "Set every even value to 0 with a mask"
       ],
       [
        "read",
        "Read `[False  True False ...]` against the array"
       ],
       [
        "say",
        "Say what a mask is"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-8",
      "t": "View or copy",
      "y": "predict whether changing a picked part changes the original array.",
      "c": "Start each time from `a = np.arange(10)`. (1) `b = a[1:3]`, then `b[0] = 99`: is `a` changed? (2) `c = a[[1, 2]]`, then `c[0] = 77`: is `a` changed? Say yes or no first, then run it and print `a` after each. Finally check with `np.shares_memory(a, b)` and `np.shares_memory(a, c)`.",
      "a": "A slice is a view of the same values: (1) changes `a` to `[ 0 99  2  3  4  5  6  7  8  9]`. Picking by a list of positions makes a copy: (2) leaves `a` as `[0 1 2 3 4 5 6 7 8 9]`. `np.shares_memory` prints `True False`.",
      "learn": [
       "a slice is a view of the same values: changing it changes the original",
       "`b = a[1:3]` then `b[0] = 99` makes `a` read `[ 0 99  2  3  4  5  6  7  8  9]`",
       "picking by a list of positions, `a[[1, 2]]`, makes a copy",
       "`c = a[[1, 2]]` then `c[0] = 77` leaves `a` as `[0 1 2 3 4 5 6 7 8 9]`",
       "`np.shares_memory(a, b)` and `np.shares_memory(a, c)` print `True False`",
       "say yes or no first, then run it",
       "views save memory but can surprise you"
      ],
      "ab": [
       [
        "predict",
        "Say yes or no: does changing `b` change `a`?"
       ],
       [
        "predict",
        "Say yes or no: does changing `c` change `a`?"
       ],
       [
        "write",
        "Run both and print `a` after each"
       ],
       [
        "write",
        "Check with `np.shares_memory`"
       ],
       [
        "say",
        "Say the difference between a view and a copy"
       ],
       [
        "pick",
        "Pick a slice or a list of positions when you want a copy"
       ]
      ]
     }
    ],
    "task": {
     "t": "Draw a frame",
     "u": "NP-3, NP-5, NP-6, NP-7",
     "k": "Make a 5-by-5 array of zeros as whole numbers. Using slices only, set the cells on its border (first and last row, first and last column) to 1. Print the array and the sum of all its values.",
     "a": "The array has ones on the frame and each middle row is `[1 0 0 0 1]`; the sum is `16` (16 border cells). One way: set `g[0] = 1`, `g[-1] = 1`, `g[:, 0] = 1`, `g[:, -1] = 1`."
    }
   },
   {
    "key": "numpy/NP-C",
    "id": "NP-C",
    "n": "Arithmetic on whole arrays",
    "idea": "you compute on every value at once, with no loop, and you know what shape comes out.",
    "needsText": "region NP-B.",
    "items": [
     {
      "id": "NP-9",
      "t": "One operation on every value",
      "y": "do arithmetic on a whole array without a loop and check it against a loop.",
      "c": "Turn the Celsius values `[0, 37, 100, -40]` into Fahrenheit (times 9, divided by 5, plus 32) with array arithmetic and no loop. Print the result. Then compute the same with a loop over a list and check with `np.allclose` that both agree.",
      "a": "The result is `[ 32.   98.6 212.  -40. ]` and `np.allclose` prints `True`. (`allclose` is used for decimals because exact equality of decimals can fail, see Python region J.)",
      "learn": [
       "array arithmetic does one operation on every value with no loop",
       "Celsius to Fahrenheit is times 9, divided by 5, plus 32",
       "`[0, 37, 100, -40]` becomes `[ 32.   98.6 212.  -40. ]`",
       "check by hand: 0 gives 32, 100 gives 212 and -40 gives -40, where the two scales meet",
       "the same thing with a loop over a list, then compare the two",
       "`np.allclose` checks that two arrays of decimals agree: `True`",
       "decimals use `allclose` and not `==`, because exact equality of decimals can fail"
      ],
      "ab": [
       [
        "write",
        "Convert Celsius to Fahrenheit with array arithmetic and no loop"
       ],
       [
        "write",
        "Do the same with a loop over a list"
       ],
       [
        "write",
        "Compare the two with `np.allclose`"
       ],
       [
        "read",
        "Read `[ 32.   98.6 212.  -40. ]`"
       ],
       [
        "say",
        "Say why `allclose` is used for decimals"
       ],
       [
        "predict",
        "Predict that `np.allclose` prints `True`"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.4 One dimensional NumPy",
       "tags": [
        "video",
        "lab"
       ]
      },
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-10",
      "t": "Totals and averages, and `axis`",
      "y": "compute the mean, the standard deviation and sums down columns or along rows, and say what shape comes out.",
      "c": "For `x = np.array([2, 4, 4, 4, 5, 5, 7, 9])` print the mean and the standard deviation (`x.std()`). For `m = np.array([[1, 2, 3], [4, 5, 6]])` write down the shape of `m.sum(axis=0)` and of `m.sum(axis=1)` first, then print both sums and both shapes.",
      "a": "Mean and standard deviation are `5.0 2.0`. `axis=0` adds down the columns: `[5 7 9]`; `axis=1` adds along the rows: `[ 6 15]`; their shapes are `(3,) (2,)`: the axis you name is the one that disappears.",
      "learn": [
       "`x.mean()` and `x.std()` give the mean and the standard deviation: `5.0 2.0`",
       "`axis` says which direction to add along",
       "`m.sum(axis=0)` adds down the columns: `[5 7 9]`, shape `(3,)`",
       "`m.sum(axis=1)` adds along the rows: `[ 6 15]`, shape `(2,)`",
       "the axis you name is the one that disappears",
       "with no `axis`, `m.sum()` adds all six values into one number: `21`",
       "write the two shapes down first, then print"
      ],
      "ab": [
       [
        "write",
        "Print the mean and the standard deviation of an array"
       ],
       [
        "predict",
        "Say the shape of `m.sum(axis=0)` and `m.sum(axis=1)` first"
       ],
       [
        "write",
        "Print both sums and both shapes"
       ],
       [
        "read",
        "Read `[5 7 9]` and `[ 6 15]`"
       ],
       [
        "say",
        "Say which axis disappears and why"
       ],
       [
        "pick",
        "Pick `axis=0` or `axis=1` to get one total per column or one per row"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-11",
      "t": "Broadcasting",
      "y": "combine arrays of different shapes and read the error when they do not fit.",
      "c": "With `m = np.array([[1, 10], [2, 20], [3, 30]])` subtract each column's mean from that column with no loop (`m - m.mean(axis=0)`) and print the result and its column means. Then try `np.ones((3, 2)) + np.ones((3,))` inside `try`/`except ValueError as e` and print the error's name and message.",
      "a": "The centred columns are -1, 0, 1 and -10, 0, 10, and the column means are now `[0. 0.]`: the row of means is stretched down the rows. A `(3,)` array does not fit a `(3, 2)` one: `ValueError operands could not be broadcast together with shapes (3,2) (3,)`.",
      "o": "Shapes are compared from the right; that is why `(3,)` does not fit `(3, 2)` but `(2,)` would. Linear algebra region C (matrices and shapes) uses the same idea.",
      "learn": [
       "broadcasting stretches a smaller array to fit a bigger one",
       "`m - m.mean(axis=0)` subtracts each column's mean from that column with no loop",
       "the centred columns become -1, 0, 1 and -10, 0, 10, and the column means are now `[0. 0.]`",
       "the row of means is stretched down the rows",
       "`np.ones((3, 2)) + np.ones((3,))` fails: a `(3,)` array does not fit a `(3, 2)` one",
       "the error is a `ValueError`: operands could not be broadcast together",
       "shapes are compared from the right, which is why `(3,)` fails and `(2,)` would work",
       "catch the error with `try` and `except ValueError as e`"
      ],
      "ab": [
       [
        "write",
        "Centre the columns with `m - m.mean(axis=0)`"
       ],
       [
        "read",
        "Check that the new column means are 0"
       ],
       [
        "write",
        "Catch the broadcasting error with `try` and `except ValueError as e`"
       ],
       [
        "read",
        "Read the error's name and message"
       ],
       [
        "predict",
        "Predict whether two shapes will broadcast"
       ],
       [
        "say",
        "Say how shapes are compared"
       ]
      ]
     },
     {
      "id": "NP-18",
      "t": "Choose between two values with `where`",
      "y": "pick one of two values for every position of an array with `np.where(condition, if_true, if_false)`.",
      "c": "With `t = np.array([12, 31, 25, 8, 19])` (temperatures) make an array that says `'hot'` where `t > 20` and `'ok'` elsewhere; then an array where every value above 20 is replaced by 20 and the others are kept. Then print how many values are above 20 and what share of all values that is.",
      "a": "`np.where(t > 20, 'hot', 'ok')` prints `['ok' 'hot' 'hot' 'ok' 'ok']`; `np.where(t > 20, 20, t)` prints `[12 20 20  8 19]`; the count and the share are `2 0.4` (`(t > 20).sum()` counts the true values, `.mean()` is their share of all values).",
      "learn": [
       "`np.where(condition, if_true, if_false)` picks one of two values for every position",
       "`np.where(t > 20, 'hot', 'ok')` gives `['ok' 'hot' 'hot' 'ok' 'ok']`",
       "`np.where(t > 20, 20, t)` caps values at 20 and keeps the others: `[12 20 20  8 19]`",
       "the third argument can be the array itself, so the positions where the test is False keep their old value",
       "`(t > 20).sum()` counts the values above 20: 2",
       "`.mean()` of a true-or-false array is the share of Trues: 0.4",
       "True counts as 1 and False as 0"
      ],
      "ab": [
       [
        "write",
        "Label values with `np.where(t > 20, 'hot', 'ok')`"
       ],
       [
        "write",
        "Cap values with `np.where(t > 20, 20, t)`"
       ],
       [
        "write",
        "Count the values above 20 with `.sum()`"
       ],
       [
        "write",
        "Get the share with `.mean()`"
       ],
       [
        "say",
        "Say why the mean of a true-or-false array is a share"
       ],
       [
        "predict",
        "Predict `[12 20 20  8 19]` for `np.where(t > 20, 20, t)`"
       ]
      ]
     },
     {
      "id": "NP-19",
      "t": "A gap in an array: `nan`",
      "y": "say what a mean does when one value is `nan`, and use `np.isnan` and `np.nanmean`.",
      "c": "With `x = np.array([4.0, np.nan, 8.0])` write down what `x.mean()` gives, then print `x.mean()`, `np.nanmean(x)`, `np.isnan(x)` and `np.nan == np.nan`.",
      "a": "One gap makes the whole mean a gap: `nan`. `np.nanmean(x)` skips it: `6.0`. `np.isnan(x)` is `[False  True False]`. `np.nan == np.nan` is `False`, so find gaps with `isnan`, never with `==`.",
      "o": "pandas does the opposite by default: its mean skips gaps (PD-11). A difference to remember when you move between the two libraries.",
      "learn": [
       "`nan` marks a gap in the data: it stands for 'not a number'",
       "one gap makes the whole mean `nan`",
       "a mean that suddenly shows `nan` in your results often means a gap is hiding in the data",
       "`np.nanmean(x)` skips the gap: `6.0`",
       "`np.isnan(x)` gives `[False  True False]`",
       "`np.nan == np.nan` is `False`, so find gaps with `isnan` and never with `==`",
       "pandas does the opposite by default: its mean skips gaps (PD-11), a difference to remember"
      ],
      "ab": [
       [
        "predict",
        "Say what `x.mean()` gives when one value is `nan`"
       ],
       [
        "write",
        "Print `np.nanmean(x)` and `np.isnan(x)`"
       ],
       [
        "read",
        "Read `[False  True False]`"
       ],
       [
        "write",
        "Print `np.nan == np.nan`"
       ],
       [
        "say",
        "Say why you find gaps with `isnan` and not `==`"
       ],
       [
        "say",
        "Say how NumPy and pandas treat gaps differently"
       ]
      ]
     }
    ],
    "task": {
     "t": "Squash each column to 0 to 1",
     "u": "NP-10, NP-11",
     "k": "For `m = np.array([[2, 10], [4, 15], [6, 30]])` rescale each column so its smallest value becomes 0 and its largest 1: (value minus column minimum) divided by (column maximum minus column minimum), with no loop. Print the result.",
     "a": "The first column becomes `0, 0.5, 1` and the second `0, 0.25, 1`: `[[0.   0.  ] [0.5  0.25] [1.   1.  ]]`. One way: `(m - m.min(axis=0)) / (m.max(axis=0) - m.min(axis=0))`."
    }
   },
   {
    "key": "numpy/NP-D",
    "id": "NP-D",
    "n": "Changing shape and order",
    "idea": "the same values get a new layout, are joined with others or are put in order.",
    "needsText": "region NP-C.",
    "items": [
     {
      "id": "NP-12",
      "t": "Reshape and transpose",
      "y": "change an array's shape with `reshape`, flip rows and columns with `.T`, and read the error when the sizes do not fit.",
      "c": "Make `a = np.arange(6)`. Print it as 2 rows of 3 and as 3 rows of 2 (`reshape`). Print the shape of the 2-by-3 version transposed. Then try `a.reshape(4, 2)` inside `try`/`except ValueError as e` and print the error's name and message.",
      "a": "Two by three is `[[0 1 2] [3 4 5]]`, three by two is `[[0 1] [2 3] [4 5]]`; the transposed shape is `(3, 2)`. Six values cannot fill 4 times 2: `ValueError cannot reshape array of size 6 into shape (4,2)`.",
      "learn": [
       "`reshape` gives the same values a new shape: 2 rows of 3, or 3 rows of 2",
       "`reshape` keeps the order of the values: `0 1 2 3 4 5` is read out row by row",
       "`.T` flips rows and columns: the 2-by-3 version becomes `(3, 2)`",
       "the sizes must fit: six values cannot fill 4 times 2",
       "the error is `ValueError cannot reshape array of size 6 into shape (4,2)`",
       "rows times columns must equal the size",
       "catch the error with `try` and `except ValueError as e`"
      ],
      "ab": [
       [
        "write",
        "Print `np.arange(6)` as 2 rows of 3 and as 3 rows of 2"
       ],
       [
        "write",
        "Print the shape of the transposed 2-by-3 array"
       ],
       [
        "write",
        "Catch the reshape error and print its name and message"
       ],
       [
        "predict",
        "Say whether a reshape will fit from the sizes"
       ],
       [
        "say",
        "Say why 4 times 2 cannot hold six values"
       ],
       [
        "predict",
        "Predict a `ValueError` for `a.reshape(4, 2)` from the sizes alone"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-13",
      "t": "Join arrays",
      "y": "put arrays under or beside each other with `np.concatenate` and say the shape first.",
      "c": "For `x = np.array([[1, 2], [3, 4]])` and `y = np.array([[5, 6], [7, 8]])` write down the shape of x stacked under y and of x placed beside y, then print both results with `np.concatenate` (`axis=0`, `axis=1`) and their shapes.",
      "a": "Under: `(4, 2)`, `[[1 2] [3 4] [5 6] [7 8]]`. Beside: `(2, 4)`, `[[1 2 5 6] [3 4 7 8]]`. The axis you name is the one that grows.",
      "learn": [
       "`np.concatenate` joins arrays",
       "the arrays go in one bracket as the first argument: `np.concatenate([x, y], axis=0)`",
       "`axis=0` puts x under y: shape `(4, 2)`",
       "`axis=1` puts x beside y: shape `(2, 4)`",
       "the axis you name is the one that grows",
       "write the shape down first, then print the result and its shape",
       "the other sizes must match: here both arrays are 2 by 2, so they join either way"
      ],
      "ab": [
       [
        "predict",
        "Say the shape of x under y and of x beside y first"
       ],
       [
        "write",
        "Join with `np.concatenate(..., axis=0)`"
       ],
       [
        "write",
        "Join with `np.concatenate(..., axis=1)`"
       ],
       [
        "read",
        "Read `[[1 2 5 6] [3 4 7 8]]`"
       ],
       [
        "say",
        "Say which axis grows in each case"
       ],
       [
        "fix",
        "Fix a join that names the wrong axis by writing the shape down first"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-14",
      "t": "Sort, and find the biggest",
      "y": "find the position of the biggest value with `argmax` and the order of the values with `argsort`.",
      "c": "With `names = np.array(['Ana', 'Ben', 'Cy', 'Dee'])` and `scores = np.array([81, 74, 92, 66])` print the name of the top scorer (use `argmax`) and the names from lowest to highest score (use `argsort`, then reverse for highest first).",
      "a": "`scores.argmax()` is `2`, so the top scorer is `Cy`. `names[np.argsort(scores)]` is `['Dee' 'Ben' 'Ana' 'Cy']` (lowest first); reversed with `[::-1]`: `['Cy' 'Ana' 'Ben' 'Dee']`.",
      "learn": [
       "`argmax` gives the position of the biggest value: 2",
       "use that position to pick the name: `names[2]` is `Cy`",
       "`argsort` gives the positions in order from lowest to highest",
       "`names[np.argsort(scores)]` is `['Dee' 'Ben' 'Ana' 'Cy']`, lowest first",
       "`np.argsort(scores)` is `[3 1 0 2]`: position 3 (66) is lowest, then 1 (74), 0 (81) and 2 (92)",
       "reverse with `[::-1]` for highest first: `['Cy' 'Ana' 'Ben' 'Dee']`",
       "`argmax` and `argsort` return positions, not values"
      ],
      "ab": [
       [
        "write",
        "Find the top scorer with `argmax`"
       ],
       [
        "write",
        "List the names from lowest to highest with `argsort`"
       ],
       [
        "write",
        "Reverse the list with `[::-1]`"
       ],
       [
        "read",
        "Read a position and say which name it points at"
       ],
       [
        "say",
        "Say why these functions give positions and not values"
       ],
       [
        "predict",
        "Predict `Cy` for the name at the position `scores.argmax()` gives"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-20",
      "t": "Make a column, and flatten a grid",
      "y": "turn a one-dimensional array into a column with `np.newaxis` or `reshape(-1, 1)`, and flatten a grid with `flatten`.",
      "c": "With `v = np.array([1, 2, 3])` print `v.shape`, then the shape of `v[:, np.newaxis]` and of `v.reshape(-1, 1)`. Print `np.array([[1, 2], [3, 4]]).flatten()`. Then print `v + v[:, np.newaxis]` and say why it is a 3-by-3 grid.",
      "a": "`(3,)`, then `(3, 1)` twice (a column: three rows, one column; the `-1` in `reshape` means \"work this size out\"). The flat array is `[1 2 3 4]`. `v + v[:, np.newaxis]` is `[[2 3 4] [3 4 5] [4 5 6]]`: a row of shape `(3,)` and a column of shape `(3, 1)` are both stretched (broadcasting, NP-11) to `(3, 3)`.",
      "learn": [
       "`v.shape` is `(3,)`: a flat array",
       "`v[:, np.newaxis]` and `v.reshape(-1, 1)` both give shape `(3, 1)`: a column",
       "the `-1` in `reshape` means 'work this size out'",
       "`flatten()` turns a grid into a flat array: `[1 2 3 4]`",
       "`v + v[:, np.newaxis]` combines a row of shape `(3,)` with a column of shape `(3, 1)`",
       "the result is a 3-by-3 grid: `[[2 3 4] [3 4 5] [4 5 6]]`",
       "the entry in row i, column j of the grid is `v[j] + v[i]`: row 1, column 2 is 3 + 2 = 5"
      ],
      "ab": [
       [
        "write",
        "Make a column with `np.newaxis`"
       ],
       [
        "write",
        "Make a column with `reshape(-1, 1)`"
       ],
       [
        "write",
        "Flatten a grid with `flatten()`"
       ],
       [
        "predict",
        "Say the shape of `v + v[:, np.newaxis]` first"
       ],
       [
        "say",
        "Say what `-1` means in `reshape`"
       ],
       [
        "say",
        "Say why a row plus a column gives a grid"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     }
    ],
    "task": {
     "t": "Same values, two different layouts",
     "u": "NP-12, NP-13",
     "k": "For `a = np.array([[1, 2, 3], [4, 5, 6]])` make `[[1 4] [2 5] [3 6]]` and, separately, `[[1 2] [3 4] [5 6]]`. Say which one is a transpose and which one is a reshape.",
     "a": "`a.T` gives `[[1 4] [2 5] [3 6]]` (rows and columns swapped); `a.reshape(3, 2)` gives `[[1 2] [3 4] [5 6]]` (the same values in the same order, cut into new rows)."
    }
   },
   {
    "key": "numpy/NP-E",
    "id": "NP-E",
    "n": "Random draws and counting",
    "idea": "you draw many random numbers at once and count what came out.",
    "needsText": "region NP-D; Python region K (the `random` module and seeds).",
    "items": [
     {
      "id": "NP-15",
      "t": "A generator and its seed",
      "y": "make a random generator with `np.random.default_rng(seed)` and know what a seed does.",
      "c": "Make two generators with the same seed and draw 20 whole numbers below 1000 from each (`rng.integers(0, 1000, 20)`); are the draws equal (`np.array_equal`)? Do the same with seeds 1 and 2. Then draw 1000 dice throws with `rng.integers(1, 7, 1000)` and print the smallest and the largest.",
      "a": "The same seed gives the same draws: `True`; different seeds give different draws: `False`. Dice throws run from `1` to `6` (`integers` stops before its upper value, like a slice): `1 6`. This guide quotes no exact random values, because they may change between NumPy versions.",
      "learn": [
       "a generator makes random numbers: `np.random.default_rng(seed)`",
       "the seed is a starting number, and the same seed gives the same draws",
       "`rng.integers(0, 1000, 20)` draws 20 whole numbers below 1000",
       "`np.array_equal` says `True` for the same seed and `False` for different seeds",
       "`rng.integers(1, 7, 1000)` throws a die 1000 times: the values run from 1 to 6",
       "`integers` stops before its upper value, like a slice",
       "this guide quotes no exact random values, because they depend on the NumPy version"
      ],
      "ab": [
       [
        "write",
        "Make two generators with the same seed and compare the draws"
       ],
       [
        "write",
        "Make two generators with different seeds and compare"
       ],
       [
        "write",
        "Draw 1000 dice throws with `rng.integers(1, 7, 1000)`"
       ],
       [
        "read",
        "Read the smallest and largest throw"
       ],
       [
        "say",
        "Say what a seed does"
       ],
       [
        "say",
        "Say why 7 is the upper value for a die"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-16",
      "t": "Count with `unique`",
      "y": "count how often each value occurs with `np.unique(..., return_counts=True)`.",
      "c": "For the throws `np.array([3, 1, 4, 1, 5, 2, 6, 5, 3, 5, 1, 6])` print the different values and, next to them, how often each came up. Then check by eye that the counts add up to 12.",
      "a": "The values are `[1 2 3 4 5 6]` and the counts `[3 1 2 1 3 2]`: 1 and 5 came up three times, 3 and 6 twice, 2 and 4 once. 3 + 1 + 2 + 1 + 3 + 2 = 12.",
      "learn": [
       "`np.unique(x, return_counts=True)` gives the different values and how often each came up",
       "`np.unique` also puts the different values in order: `[1 2 3 4 5 6]`",
       "with `return_counts=True` you get two arrays back: the different values and their counts",
       "for the throws the values are `[1 2 3 4 5 6]` and the counts are `[3 1 2 1 3 2]`",
       "1 and 5 came up three times, 3 and 6 twice, 2 and 4 once",
       "the counts add up to 12: 3 + 1 + 2 + 1 + 3 + 2",
       "check the total by eye: the counts must add up to the number of throws"
      ],
      "ab": [
       [
        "write",
        "Count values with `np.unique(..., return_counts=True)`"
       ],
       [
        "read",
        "Read a value and its count side by side"
       ],
       [
        "read",
        "Add the counts and check they give 12"
       ],
       [
        "predict",
        "Predict which values come up most often"
       ],
       [
        "say",
        "Say why the counts must add up to the number of throws"
       ],
       [
        "pick",
        "Pick `return_counts=True` when you need how often a value came up, not only which values"
       ]
      ],
      "src": [
       {
        "title": "NumPy: the absolute basics for beginners",
        "url": "https://numpy.org/doc/stable/user/absolute_beginners.html",
        "note": "Arrays, shape, slicing, reshape, sums, axis."
       }
      ]
     },
     {
      "id": "NP-17",
      "t": "Estimate a probability with arrays",
      "y": "estimate a probability by drawing many random values at once and taking the mean of a true-or-false array.",
      "c": "Throw two dice 100,000 times (`rng.integers(1, 7, 100000)` twice, with seed 7). Compute the share of throws whose sum is 7 as the mean of `(d1 + d2 == 7)`. Is it within 0.01 of 1/6? Print only that true or false.",
      "a": "`True`. The true share of sevens is 6 out of 36, that is 1/6; with 100,000 throws the estimate is off by about 0.001, so 0.01 cannot fail by chance. (The same idea as Python region K, with arrays instead of a loop; probability start region A has the exact count.)",
      "learn": [
       "estimate a probability by drawing many random values at once",
       "throw two dice 100,000 times with seed 7",
       "`rng.integers(1, 7, 100000)` draws whole numbers from 1 to 6: the 7 is left out",
       "`(d1 + d2 == 7)` is a true-or-false array, and its mean is the share of sevens",
       "the true share is 6 out of 36, that is 1/6",
       "with 100,000 throws the estimate is off by about 0.001, so a 0.01 check cannot fail by chance",
       "the same idea as Python region K, with arrays instead of a loop"
      ],
      "ab": [
       [
        "write",
        "Draw two dice 100,000 times with a seeded generator"
       ],
       [
        "write",
        "Take the mean of `(d1 + d2 == 7)`"
       ],
       [
        "write",
        "Compare it with 1/6 within 0.01"
       ],
       [
        "predict",
        "Predict that the estimate is close to 1/6"
       ],
       [
        "say",
        "Say why the mean of a true-or-false array estimates a probability"
       ],
       [
        "fix",
        "Fix a die draw written `rng.integers(1, 6, ...)` that never throws a 6"
       ]
      ]
     },
     {
      "id": "NP-23",
      "t": "Draw from a distribution",
      "y": "draw many values from the normal and the binomial distribution, from 0 up to 1, and a random choice, with a generator.",
      "c": "With `rng = np.random.default_rng(5)` draw 100,000 heights with `rng.normal(170, 10, 100000)` and check that their mean is within 0.2 of 170 and their standard deviation within 0.2 of 10. Draw `rng.binomial(5, 0.5, 100000)` (heads in five fair flips) and check that every value lies from 0 to 5 and that the mean is within 0.05 of 2.5. Draw `rng.random(1000)` and check that it lies from 0 up to but not including 1. Draw `rng.choice(np.array(['a', 'b', 'c']), 5)` and print its shape and whether it only holds those letters. Print the true-or-false results.",
      "a": "`True True` (the normal draws), `True True True` (the binomial draws), `True True` (the uniform draws), then `(5,) True` (five picks). `rng.normal(mean, standard deviation, how many)`, `rng.binomial(n, p, how many)` counts successes in n tries, `rng.random(how many)` is uniform from 0 up to but not including 1, `rng.choice(array, how many)` picks from an array. The slack is about six standard deviations or more, so none of these can fail by chance. Probability start (regions C and D) uses `rng.binomial` and `rng.normal`.",
      "learn": [
       "`rng.normal(mean, standard deviation, how many)` draws from a normal distribution",
       "100,000 heights with mean 170 and standard deviation 10: the draws' mean is within 0.2 of 170 and their standard deviation within 0.2 of 10",
       "`rng.binomial(n, p, how many)` counts successes in n tries, like heads in five fair flips",
       "every binomial value lies from 0 to 5",
       "the generator also draws values from 0 up to 1",
       "it also makes a random choice, and five picks give shape `(5,)`",
       "the check compares each result with a tolerance and prints `True`"
      ],
      "ab": [
       [
        "write",
        "Draw normal values with `rng.normal(170, 10, 100000)`"
       ],
       [
        "write",
        "Draw binomial values with `rng.binomial(5, 0.5, 100000)`"
       ],
       [
        "write",
        "Check the mean and standard deviation within a tolerance"
       ],
       [
        "write",
        "Check that every binomial value lies from 0 to 5"
       ],
       [
        "write",
        "Draw a random choice and check its shape"
       ],
       [
        "say",
        "Say what the three numbers in `rng.normal` mean"
       ]
      ]
     }
    ],
    "task": {
     "t": "Three coin flips",
     "u": "NP-7, NP-10, NP-15, NP-17",
     "k": "Flip three coins 100,000 times at once (`rng.integers(0, 2, (100000, 3))` with seed 3, 1 is heads). Estimate the chance of at least two heads as the mean of `(heads >= 2)`, where `heads` is the sum along `axis=1`. Is it within 0.01 of 0.5? Print true or false.",
     "a": "`True`. Of the 8 equally likely outcomes, 4 have at least two heads, so the exact chance is 0.5."
    }
   },
   {
    "key": "numpy/NP-F",
    "id": "NP-F",
    "n": "Multiplying the way maths does",
    "idea": "* multiplies value by value, @ multiplies the way maths does, and the shapes decide whether @ works.",
    "needsText": "regions NP-C and NP-D (broadcasting, shapes, transpose). Linear algebra start uses `@`: do NP-21 before its item LA-5 and NP-22 before its region C.",
    "items": [
     {
      "id": "NP-21",
      "t": "`*` is not `@`",
      "y": "tell value-by-value multiplication (`*`) from the dot product (`@`) of two vectors.",
      "c": "With `a = np.array([2, 0, -1])` and `b = np.array([3, 5, 4])` print `a * b`, `a @ b` and `(a * b).sum()`. Which one is the dot product, and how does it follow from the other?",
      "a": "`a * b` is `[ 6  0 -4]` (each pair multiplied on its own). `a @ b` is `2`: the dot product, which is those products added up, so `(a * b).sum()` is also `2`. `*` gives an array, `@` gives one number.",
      "learn": [
       "`a * b` multiplies value by value: `[ 6  0 -4]`",
       "`a @ b` is the dot product: `2`",
       "the dot product is those products added up, so `(a * b).sum()` is also `2`",
       "the dot product pairs values by position, so both vectors need the same number of values: here 3 each",
       "`*` gives an array and `@` gives one number",
       "do not mix them up: `*` is not the dot product",
       "with `a = [2, 0, -1]` and `b = [3, 5, 4]` the products are 6, 0 and -4, and 6 + 0 - 4 = 2"
      ],
      "ab": [
       [
        "predict",
        "Say what `a * b` and `a @ b` give before printing"
       ],
       [
        "write",
        "Print `a * b`, `a @ b` and `(a * b).sum()`"
       ],
       [
        "read",
        "Say which one is the dot product"
       ],
       [
        "say",
        "Say how the dot product follows from `a * b`"
       ],
       [
        "pick",
        "Pick `*` or `@` for a given job"
       ],
       [
        "fix",
        "Fix code that uses `*` where one dot-product number was needed"
       ]
      ]
     },
     {
      "id": "NP-22",
      "t": "Matrix times vector, matrix times matrix, and the shapes",
      "y": "predict the shape of `X @ w` and of `X.T @ X`, and whether `w @ X` works.",
      "c": "With `X = np.array([[1, 2], [3, 4], [5, 6]])` (3 rows, 2 columns) and `w = np.array([10, 1])` write down the shapes of `X @ w` and `X.T @ X` and say whether `w @ X` will work. Then print `X @ w` and its shape, `X.T @ X` and its shape, and for `w @ X` use `try`/`except ValueError as e` and print the error's name and its first 6 characters.",
      "a": "`X @ w` is `[12 34 56]` with shape `(3,)` (each row of X times w). `X.T @ X` is `[[35 44] [44 56]]` with shape `(2, 2)` ((2, 3) times (3, 2)). `w @ X` fails: w has 2 values but X has 3 rows: `ValueError matmul`. The inner sizes must agree: (n, k) @ (k, m) gives (n, m).",
      "learn": [
       "X has 3 rows and 2 columns, and w has 2 values",
       "`X @ w` is `[12 34 56]` with shape `(3,)`: each row of X times w",
       "`X.T @ X` is `[[35 44] [44 56]]` with shape `(2, 2)`, from (2, 3) times (3, 2)",
       "`w @ X` fails: w has 2 values but X has 3 rows, and the error is a `ValueError` from `matmul`",
       "the inner sizes must agree",
       "the rule: `(n, k) @ (k, m)` gives `(n, m)`, so the two inner sizes drop out and the outer sizes stay",
       "write the shapes down before you run"
      ],
      "ab": [
       [
        "predict",
        "Say the shapes of `X @ w` and `X.T @ X` first"
       ],
       [
        "predict",
        "Say whether `w @ X` will work"
       ],
       [
        "write",
        "Print `X @ w` and its shape"
       ],
       [
        "write",
        "Print `X.T @ X` and its shape"
       ],
       [
        "read",
        "Read the `ValueError` from `w @ X`"
       ],
       [
        "say",
        "Say which sizes must agree for `@`"
       ]
      ]
     }
    ],
    "task": {
     "t": "Three house prices in one line",
     "u": "NP-9, NP-22",
     "k": "Three houses have a size and a number of rooms: `X = np.array([[50, 2], [80, 3], [120, 4]])`. A price rule gives 2 per unit of size plus 10 per room plus a base of 5. With `w = np.array([2, 10])` compute all three prices with no loop and print them.",
     "a": "`[125 195 285]` (the first house: 50 times 2, plus 2 times 10, plus 5 is 125). One way: `X @ w + 5`.\n<!-- NP:END -->"
    }
   }
  ]
 },
 {
  "id": "pandas",
  "name": "pandas",
  "code": "PD",
  "regions": [
   {
    "key": "pandas/PD-F",
    "id": "PD-F",
    "n": "A table, a column and the array behind them",
    "idea": "a table is named columns of values; you get one in or out as a file, look at it and move to and from arrays.",
    "needsText": "NumPy regions A to C. The data file `tier1_data/players.csv` (12 rows: name, team, age, score, games; two values are missing on purpose; the file is in the pack; copy it next to your program). pandas 3 is used: a text column has the type `str` and several things differ from older pandas (named where it matters). Run each solution as a file (`np1.py`, ...) with `python np1.py`; no `python -c` one-liners, because the quoting differs between Git Bash, cmd and PowerShell. Windows: `python` (or `py`) after `pip install numpy pandas` [from memory, not run].",
    "items": [
     {
      "id": "PD-1",
      "t": "A table and a column",
      "y": "build a small table from a dictionary and say its shape and what one column is.",
      "c": "Build `df = pd.DataFrame({'name': ['Ana', 'Ben'], 'score': [81, 74]})`. Print it, print `df.shape` and print the type of `df['score']` (`type(...).__name__`).",
      "a": "The table has a row number on the left and two columns; the shape is `(2, 2)`; a single column is a `Series` (one column of values with an index), the whole table a `DataFrame`.",
      "learn": [
       "a `DataFrame` is a table of named columns, and `pd.DataFrame({...})` builds one from a dictionary",
       "each dictionary key becomes a column and each list becomes that column's values",
       "printing it shows a row number on the left and the two columns",
       "`df.shape` gives `(2, 2)`: rows first, then columns",
       "a single column is a `Series`: a column of values with an index",
       "the whole table is a `DataFrame`",
       "`type(df['score']).__name__` prints the type's name"
      ],
      "ab": [
       [
        "write",
        "Build a table from a dictionary with `pd.DataFrame`"
       ],
       [
        "read",
        "Read the printed table and name its columns"
       ],
       [
        "write",
        "Print `df.shape`"
       ],
       [
        "write",
        "Print the type of one column"
       ],
       [
        "say",
        "Say the difference between a `Series` and a `DataFrame`"
       ],
       [
        "predict",
        "Predict `(2, 2)` for `df.shape` before you print it"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.3 Pandas",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-2",
      "t": "Read a CSV and look at it",
      "y": "read a CSV file into a table and say its size and the type of each column.",
      "c": "Read `players.csv` with `pd.read_csv`. Print its shape, its first three rows (`head(3)`) and the type of every column (`df.dtypes`). Say why `age` and `score` are decimals although the file shows whole numbers.",
      "a": "The shape is `(12, 5)`. In pandas 3 the two text columns show as `str`; `games` is `int64`; `age` and `score` are `float64` because each has a gap, and a gap (`NaN`) is a decimal-type value, which turns the whole column into decimals.",
      "o": "pandas older than 3 shows `object` for text columns. `read_csv` accepts a path with `/`; on Windows write the path with `/` or put the file next to the program.",
      "learn": [
       "`pd.read_csv('players.csv')` reads a CSV file into a table",
       "`df.shape` is `(12, 5)`: 12 rows and 5 columns",
       "`head(3)` shows the first three rows",
       "`df.dtypes` shows the type of every column",
       "in pandas 3 the text columns show as `str`; older pandas shows `object`",
       "`games` is `int64`",
       "`age` and `score` are `float64` because each has a gap",
       "a gap (`NaN`) is a decimal-type value, so it turns the whole column into decimals"
      ],
      "ab": [
       [
        "write",
        "Read a CSV with `pd.read_csv`"
       ],
       [
        "write",
        "Print the shape, the first three rows and `df.dtypes`"
       ],
       [
        "read",
        "Read each column's type"
       ],
       [
        "say",
        "Say why `age` and `score` are decimals when the file shows whole numbers"
       ],
       [
        "predict",
        "Predict a column's type from whether it has a gap"
       ],
       [
        "say",
        "Say what `NaN` is"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.3 Pandas",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-3",
      "t": "Table to array and back",
      "y": "turn columns of a table into a NumPy array and wrap an array back into a table with column names.",
      "c": "From `players.csv` take the `age` and `score` columns as an array with `df[['age', 'score']].to_numpy()` and print its shape. Then make a new table from its first two rows with `pd.DataFrame(arr[:2], columns=['age', 'score'])` and print it.",
      "a": "The array has shape `(12, 2)`: the table's rows and the two columns you picked. The new table shows the first two rows as decimals: ages `23.0` and `31.0`, scores `81.0` and `74.0`.",
      "learn": [
       "`df[['age', 'score']].to_numpy()` turns chosen columns into a NumPy array",
       "the array has shape `(12, 2)`: the table's rows and the two columns you picked",
       "`pd.DataFrame(arr[:2], columns=['age', 'score'])` wraps an array back into a table with names",
       "`arr[:2]` is the first two rows of the array, so the new table has 2 rows and the columns `age` and `score`",
       "the new table shows the first two rows as decimals: ages 23.0 and 31.0, scores 81.0 and 74.0",
       "an array has no column names, so you give them with `columns=`",
       "the double brackets pick a table of columns, not a single column"
      ],
      "ab": [
       [
        "write",
        "Turn two columns into an array with `to_numpy()`"
       ],
       [
        "read",
        "Read the array's shape"
       ],
       [
        "write",
        "Wrap the first two rows back into a table with `columns=`"
       ],
       [
        "predict",
        "Predict the shape of the array from the table"
       ],
       [
        "say",
        "Say why the new table shows decimals"
       ],
       [
        "fix",
        "Fix a column pick that needs double brackets to give a table of columns"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-23",
      "t": "Write a table to a CSV",
      "y": "save a table with `to_csv` and know why to write `index=False`.",
      "c": "Keep the rows of `players.csv` with a score above 85 and save them with `top.to_csv('top.csv', index=False)`. Read `top.csv` back and print its shape and column names on one line. Save again without `index=False` into `top2.csv`, read that back and print its column names. What is the extra column?",
      "a": "`(3, 5) ['name', 'team', 'age', 'score', 'games']`. Without `index=False` the row numbers are written as a first column and come back with the name `Unnamed: 0`: `['Unnamed: 0', 'name', 'team', 'age', 'score', 'games']`. Windows: the file is written next to the program [from memory, not run].",
      "learn": [
       "`top.to_csv('top.csv', index=False)` saves a table to a CSV file",
       "first keep the rows with a score above 85: that leaves 3 rows",
       "read it back and the shape is `(3, 5)` with the columns `['name', 'team', 'age', 'score', 'games']`",
       "without `index=False` the row numbers are written as a first column",
       "that column comes back with the name `Unnamed: 0`",
       "the second file comes back with six columns, `['Unnamed: 0', 'name', 'team', 'age', 'score', 'games']`, not five",
       "so `index=False` keeps the file free of a useless extra column"
      ],
      "ab": [
       [
        "write",
        "Filter a table and save it with `to_csv`"
       ],
       [
        "write",
        "Read the file back and print its shape and columns"
       ],
       [
        "write",
        "Save again without `index=False`"
       ],
       [
        "read",
        "Find the extra column in the second file"
       ],
       [
        "say",
        "Say why you write `index=False`"
       ],
       [
        "fix",
        "Fix a file that came back with `Unnamed: 0`"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.3 Pandas",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     }
    ],
    "task": {
     "t": "One-line report of a file",
     "u": "PD-2, PD-3",
     "k": "Read `players.csv` and print one line: `12 rows, 5 columns, 3 numeric` built from the table's shape and from `df.select_dtypes('number')`; do not type the numbers in.",
     "a": "The line is `12 rows, 5 columns, 3 numeric` (`age`, `score` and `games` are numeric; `name` and `team` are text)."
    }
   },
   {
    "key": "pandas/PD-G",
    "id": "PD-G",
    "n": "Reaching into a table",
    "idea": "you pick columns, rows and cells out of a table, put them in order and change them.",
    "needsText": "region PD-F.",
    "items": [
     {
      "id": "PD-4",
      "t": "One column or several",
      "y": "pick one column (a Series) or several (a table).",
      "c": "From `players.csv` pick the `score` column and, separately, the two columns `name` and `score`. Print the type of each and the shape of the second.",
      "a": "One name in square brackets gives a `Series`, a list of names gives a `DataFrame`: `Series DataFrame`; the shape of the second is `(12, 2)`.",
      "learn": [
       "one name in square brackets gives a `Series`: `df['score']`",
       "a list of names gives a `DataFrame`: `df[['name', 'score']]`",
       "the type check prints `Series DataFrame`",
       "the shape of the second is `(12, 2)`",
       "picking columns keeps every row: the table of two columns still has all 12 rows",
       "the inner brackets are the list, and the outer ones do the picking",
       "even a list with one name gives a `DataFrame`, because the list asks for a table"
      ],
      "ab": [
       [
        "write",
        "Pick one column as a `Series`"
       ],
       [
        "write",
        "Pick two columns as a `DataFrame`"
       ],
       [
        "read",
        "Print the type of each pick"
       ],
       [
        "predict",
        "Predict whether a pick gives a Series or a DataFrame"
       ],
       [
        "say",
        "Say what the double brackets mean"
       ],
       [
        "fix",
        "Fix a pick that gave a `Series` when a table was needed by adding the inner brackets"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.3 Pandas",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-5",
      "t": "Rows by label and by position",
      "y": "pick a row by its label with `loc` and by its place with `iloc`, and say when they differ.",
      "c": "Keep only the Red team: `red = df[df['team'] == 'Red']`. Its row labels are no longer 0, 1, 2, 3. Print `red.loc[2, 'name']` and `red.iloc[2]['name']`. Which is the third row you can see?",
      "a": "`Cy Gus`: `loc[2]` is the row labelled 2 (Cy), `iloc[2]` is the third row by place, which has the label 6 (Gus). Labels and places agree only while the labels are 0, 1, 2, ...",
      "learn": [
       "`red = df[df['team'] == 'Red']` keeps only the Red rows",
       "their row labels are no longer 0, 1, 2, 3",
       "`loc` picks by label and `iloc` picks by place",
       "`red.loc[2, 'name']` is Cy: the row labelled 2",
       "`red.iloc[2]['name']` is Gus: the third row by place, which has the label 6",
       "`iloc[0]` is always the first row you can see, whatever its label is",
       "labels and places agree only while the labels are 0, 1, 2, and so on"
      ],
      "ab": [
       [
        "write",
        "Keep only the Red rows"
       ],
       [
        "write",
        "Pick a cell with `loc` and with `iloc`"
       ],
       [
        "predict",
        "Say which row `loc[2]` and `iloc[2]` give before running"
       ],
       [
        "read",
        "Find the label of the third visible row"
       ],
       [
        "say",
        "Say when labels and places differ"
       ],
       [
        "pick",
        "Pick `loc` or `iloc` for a label or a place"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.3 Pandas",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-6",
      "t": "Filter rows with a condition",
      "y": "keep the rows that meet a condition and count them.",
      "c": "From `players.csv` keep the players with a score above 80. Print how many there are and their names as a list (`.tolist()`). Which player with a missing score is left out, and why?",
      "a": "Five players: `5` and `['Ana', 'Cy', 'Eli', 'Ivy', 'Kim']`. Gus has no score; a gap is neither above nor below 80, so the condition is false for his row.",
      "learn": [
       "`df[df['score'] > 80]` keeps the rows that meet a condition",
       "the condition inside the brackets is a true-or-false mask",
       "there are 5 such players: `['Ana', 'Cy', 'Eli', 'Ivy', 'Kim']` with `.tolist()`",
       "`len(...)` of the filtered table counts the rows kept: 5",
       "Gus has no score, and a gap is neither above nor below 80",
       "so the condition is false for his row and he is left out",
       "rows with gaps drop out of a filter without a warning"
      ],
      "ab": [
       [
        "write",
        "Filter rows with a condition"
       ],
       [
        "write",
        "Count the rows and list the names with `.tolist()`"
       ],
       [
        "read",
        "Find the player with a missing score"
       ],
       [
        "say",
        "Say why a gap is left out by a condition"
       ],
       [
        "predict",
        "Predict how many rows a filter keeps"
       ],
       [
        "fix",
        "Fix a filter that was expected to keep a player with a missing score"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-7",
      "t": "Sort",
      "y": "order the rows by a column.",
      "c": "Sort `players.csv` by `score`, highest first (`sort_values('score', ascending=False)`), and print the names of the top three.",
      "a": "`['Ivy', 'Cy', 'Eli']` (scores 95, 92, 88). Rows with a missing score are put last.",
      "learn": [
       "`sort_values('score', ascending=False)` orders the rows by a column, highest first",
       "without `ascending=False` the lowest score comes first",
       "the top three names are `['Ivy', 'Cy', 'Eli']` with scores 95, 92 and 88",
       "rows with a missing score are put last",
       "`ascending=False` means highest first",
       "the sort returns a new table and the original stays as it was",
       "take the first three rows of the sorted table to get the top three names"
      ],
      "ab": [
       [
        "write",
        "Sort a table by one column, highest first"
       ],
       [
        "write",
        "Print the names of the top three"
       ],
       [
        "read",
        "Read the scores that go with the names"
       ],
       [
        "predict",
        "Predict where a missing score ends up"
       ],
       [
        "say",
        "Say what `ascending=False` does"
       ],
       [
        "pick",
        "Pick `ascending=True` or `ascending=False` for lowest first or highest first"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-8",
      "t": "Change values safely",
      "y": "change the cells that meet a condition with `loc` and know that chained assignment does not work in pandas 3.",
      "c": "Make `d = pd.DataFrame({'a': [1, 2, 3], 'b': [4, 5, 6]})`. (1) Set `b` to 0 where `a > 1` with `d.loc[d['a'] > 1, 'b'] = 0` and print `d['b'].tolist()`. (2) On a fresh table try `d[d['a'] > 1]['b'] = 0` inside `warnings.catch_warnings(record=True)` (with `warnings.simplefilter('always')`), then print `d['b'].tolist()` and the names of the warning categories.",
      "a": "(1) `[4, 0, 0]`. (2) The table is unchanged, `[4, 5, 6]`, and pandas warns: `['ChainedAssignmentError']`. The first part, `d[d['a'] > 1]`, makes a copy, and the second part changes that copy. Use one `loc` with the condition and the column.",
      "o": "pandas 3 behaviour (copy-on-write); older pandas could change the table or only warn with `SettingWithCopyWarning`. Run here on pandas 3.0.6.",
      "learn": [
       "`d.loc[d['a'] > 1, 'b'] = 0` sets `b` to 0 where `a > 1`: `[4, 0, 0]`",
       "one `loc` with the condition and the column name does the whole change",
       "`d[d['a'] > 1]['b'] = 0` is chained assignment and does not work in pandas 3",
       "the table is unchanged, `[4, 5, 6]`, and pandas warns with a `ChainedAssignmentError`",
       "the first part, `d[d['a'] > 1]`, makes a copy, and the second part changes that copy",
       "`warnings.catch_warnings(record=True)` collects the warning so you can print its name",
       "this is pandas 3 behaviour (copy-on-write); older pandas behaved differently"
      ],
      "ab": [
       [
        "write",
        "Change cells with one `loc` and a condition"
       ],
       [
        "predict",
        "Say whether the chained version changes the table"
       ],
       [
        "write",
        "Collect the warning and print its name"
       ],
       [
        "read",
        "Read `ChainedAssignmentError`"
       ],
       [
        "fix",
        "Rewrite a chained assignment as a single `loc`"
       ],
       [
        "say",
        "Say why the chained version changes a copy"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-13",
      "t": "Rows and columns at once",
      "y": "pick rows by a condition and columns by name in one step with `loc`, and a block by place with `iloc[rows, columns]`.",
      "c": "From `players.csv` print the names and scores of the players with a score above 85 with one `loc` (the condition first, the list of columns second). Then print rows 2 to 4 and columns 0 and 1 with `df.iloc[2:5, 0:2]` (the end of a slice is left out). Last print the shape of the first result.",
      "a": "The first result is three rows: `Cy   92.0`, `Eli   88.0`, `Ivy   95.0` (labels 2, 4 and 8), shape `(3, 2)`. The second is rows 2, 3 and 4 and the first two columns, `name` and `team`: Cy Red, Dee Green, Eli Blue.",
      "learn": [
       "one `loc` takes the rows by a condition first and the columns second",
       "`df.loc[df['score'] > 85, ['name', 'score']]` gives three rows: Cy 92.0, Eli 88.0 and Ivy 95.0",
       "their labels are 2, 4 and 8, and the shape is `(3, 2)`",
       "`df.iloc[2:5, 0:2]` picks a block by place: rows 2 to 4 and columns 0 and 1",
       "the end of a slice is left out",
       "that block is Cy Red, Dee Green and Eli Blue",
       "`loc` works with names and conditions; `iloc` works with numbers"
      ],
      "ab": [
       [
        "write",
        "Pick rows by a condition and columns by name in one `loc`"
       ],
       [
        "write",
        "Pick a block with `iloc[2:5, 0:2]`"
       ],
       [
        "read",
        "Read the three rows and their labels"
       ],
       [
        "predict",
        "Predict the shape of the first result"
       ],
       [
        "say",
        "Say the difference between `loc` and `iloc`"
       ],
       [
        "pick",
        "Pick `loc` for a condition and names, or `iloc` for a block by place"
       ]
      ],
      "via": {
       "path": "coursera/ibm-python/m4",
       "where": "Module 4 \u00b7 4.3 Pandas",
       "tags": [
        "video",
        "reading",
        "lab",
        "quiz"
       ]
      },
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-14",
      "t": "Several conditions, and `isin`",
      "y": "combine conditions with `&` and `|` (each in brackets), use `isin`, and read the error that `and` gives.",
      "c": "In `players.csv` list the names of the Red players with a score above 80; then of the players who are Red or have a score above 90; then print the shape of the rows whose team is in `['Red', 'Blue']` (`isin`). Last, try `df[df['team'] == 'Red' and df['score'] > 80]` inside `try`/`except ValueError as e` and print the error's name and its first 40 characters.",
      "a": "`['Ana', 'Cy']`; then `['Ana', 'Cy', 'Gus', 'Ivy', 'Jon']` (Red: Ana, Cy, Gus, Jon; plus Ivy, who scored 95); then `(8, 5)`; `and` fails: `ValueError The truth value of a Series is ambiguous`. Use `&` and `|` with brackets round each condition, never `and` and `or`.",
      "learn": [
       "combine conditions with `&` for 'and' and `|` for 'or'",
       "each condition goes in its own brackets",
       "Red players with a score above 80: `['Ana', 'Cy']`",
       "Red or a score above 90: Ana, Cy, Gus, Ivy and Jon (the Red players plus Ivy, who scored 95)",
       "`isin(['Red', 'Blue'])` keeps the rows whose team is in the list: shape `(8, 5)`",
       "`and` fails with `ValueError The truth value of a Series is ambiguous`",
       "use `&` and `|` with brackets round each condition"
      ],
      "ab": [
       [
        "write",
        "Combine two conditions with `&`"
       ],
       [
        "write",
        "Combine two conditions with `|`"
       ],
       [
        "write",
        "Filter with `isin`"
       ],
       [
        "read",
        "Read the error that `and` gives"
       ],
       [
        "fix",
        "Fix a condition that used `and` by using `&` and brackets"
       ],
       [
        "say",
        "Say why `and` does not work on a Series"
       ]
      ]
     },
     {
      "id": "PD-15",
      "t": "Sort by two columns",
      "y": "sort by one column and break ties with another, each in its own direction.",
      "c": "Sort `players.csv` by `team` from A to Z and, inside a team, by `score` from highest to lowest: `df.sort_values(['team', 'score'], ascending=[True, False])`. Print `team`, `name` and `score` of the first four rows. Which team comes first and who is its top scorer?",
      "a": "Blue comes first (alphabetical order) and its top scorer is Eli: the four rows are `Blue  Eli   88.0`, Kim 83.0, Ben 74.0 and `Blue  Hal   70.0`.",
      "learn": [
       "`sort_values(['team', 'score'], ascending=[True, False])` sorts by team, then by score",
       "`ascending=[True, False]` lists the directions in the order of the columns: A to Z for `team`, highest first for `score`",
       "each column gets its own direction",
       "the second column breaks ties in the first",
       "Blue comes first, because the teams are in alphabetical order",
       "inside Blue the order is Eli 88.0, Kim 83.0, Ben 74.0 and Hal 70.0",
       "so Eli is the top scorer of the first team"
      ],
      "ab": [
       [
        "write",
        "Sort by two columns, each in its own direction"
       ],
       [
        "write",
        "Print `team`, `name` and `score` of the first four rows"
       ],
       [
        "read",
        "Say which team comes first"
       ],
       [
        "read",
        "Say who its top scorer is"
       ],
       [
        "predict",
        "Predict the first row before you sort"
       ],
       [
        "pick",
        "Pick `True` or `False` in the list for each column's direction"
       ]
      ]
     }
    ],
    "task": {
     "t": "Older than 30, best score first",
     "u": "PD-6, PD-7, PD-5",
     "k": "From `players.csv` list the names of the players older than 30, ordered by score, highest first. Print the list.",
     "a": "`['Lee', 'Ben', 'Dee', 'Jon', 'Gus']` (scores 77, 74, 66, 58, and Gus has none, so he is last). Hal has no age, so he is not in the list."
    }
   },
   {
    "key": "pandas/PD-H",
    "id": "PD-H",
    "n": "New columns and summaries",
    "idea": "you compute from a table: a new column, a summary and a summary per group.",
    "needsText": "region PD-G; NumPy item NP-10 (the standard deviation).",
    "items": [
     {
      "id": "PD-9",
      "t": "A new column from old ones",
      "y": "make a new column by arithmetic on existing columns.",
      "c": "In `players.csv` add a column `per_game` that is `score` divided by `games`. Print the value for Ana (row 0) and for Gus (row 6).",
      "a": "Ana: `81 / 10 = 8.1`. Gus has no score, so his new value is a gap too: `nan`. The line is `8.1 nan`.",
      "learn": [
       "`df['per_game'] = df['score'] / df['games']` makes a new column by arithmetic",
       "the new column joins the same table, so `df` now has one more column, `per_game`",
       "it runs on every row at once, with no loop",
       "Ana: 81 / 10 = 8.1",
       "Gus has no score, so his new value is a gap too: `nan`",
       "a gap in an input makes a gap in the result",
       "the printed line is `8.1 nan`"
      ],
      "ab": [
       [
        "write",
        "Add a column by dividing two columns"
       ],
       [
        "write",
        "Print the value for one row by its number"
       ],
       [
        "predict",
        "Predict that a missing score gives a missing result"
       ],
       [
        "read",
        "Read `8.1 nan`"
       ],
       [
        "say",
        "Say why the new value for Gus is a gap"
       ],
       [
        "predict",
        "Predict `8.1` for Ana from 81 divided by 10"
       ]
      ]
     },
     {
      "id": "PD-10",
      "t": "Summary statistics, and a trap",
      "y": "get the mean and standard deviation of a column and know that NumPy and pandas divide differently.",
      "c": "For the numbers `[2, 4, 4, 4, 5, 5, 7, 9]` print `np.std(...)`, then the same numbers as a `pd.Series` with `.std()`, then `.std(ddof=0)`. Why do the first two differ?",
      "a": "NumPy: `numpy 2.0`. pandas: `pandas 2.138...`. pandas with `ddof=0`: `pandas ddof=0 2.0`. NumPy divides by n by default (as for a whole population), pandas by n - 1 (as for a sample); `ddof` is the number subtracted from n. Probability start region C has the variance.",
      "o": "A real trap when you move between the two libraries; the two numbers are the same data and both are right.",
      "learn": [
       "NumPy and pandas divide differently when they compute a standard deviation",
       "`np.std` on 2, 4, 4, 4, 5, 5, 7, 9 gives 2.0",
       "the same numbers as a `pd.Series` with `.std()` give 2.138...",
       "`.std(ddof=0)` gives 2.0 again",
       "NumPy divides by n by default, as for a whole population",
       "pandas divides by n - 1, as for a sample",
       "`ddof` is the number subtracted from n",
       "this is a real trap when you move between the two libraries"
      ],
      "ab": [
       [
        "write",
        "Print the standard deviation with NumPy and with pandas"
       ],
       [
        "write",
        "Print it with `ddof=0`"
       ],
       [
        "read",
        "Compare the three numbers"
       ],
       [
        "say",
        "Say why the first two differ"
       ],
       [
        "say",
        "Say what `ddof` means"
       ],
       [
        "pick",
        "Pick the right setting for a population or a sample"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-11",
      "t": "A summary per group",
      "y": "compute a summary for each group with `groupby`.",
      "c": "In `players.csv` compute the mean `score` of each `team` (`df.groupby('team')['score'].mean()`). Print the result. How many rows does it have, and what did pandas do with the missing score?",
      "a": "Three rows, one per team: Blue `78.75`, Green `79.25`, Red `77.0`. Gus (Red) has no score; the mean skips gaps, so Red is the mean of three players, (81 + 92 + 58) / 3.",
      "learn": [
       "`df.groupby('team')['score'].mean()` computes the mean score of each team",
       "the result has three rows, one per team: Blue 78.75, Green 79.25 and Red 77.0",
       "Gus is in Red and has no score",
       "the mean skips gaps",
       "NumPy's `mean` gives `nan` for a gap but pandas skips it: a difference to remember (NP-19)",
       "so Red is the mean of three players: (81 + 92 + 58) / 3",
       "groupby gives one result per group"
      ],
      "ab": [
       [
        "write",
        "Compute a summary per group with `groupby`"
       ],
       [
        "read",
        "Count the rows of the result"
       ],
       [
        "read",
        "Say what pandas did with the missing score"
       ],
       [
        "predict",
        "Predict how many rows `groupby` returns"
       ],
       [
        "say",
        "Say why Red's mean uses only three players"
       ],
       [
        "pick",
        "Pick `groupby` when you need one result per group, not one for the whole column"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-22",
      "t": "A new column from your own rule: `map`",
      "y": "make a column from another by a dictionary or by a function with `map`, and know what `map` does to a gap.",
      "c": "Print the first three values of `df['team'].map({'Red': 'R', 'Blue': 'B', 'Green': 'G'})` as a list. Then make `verdict = df['score'].map(lambda s: 'pass' if s >= 70 else 'low')` and print the verdicts of Gus (row 6, who has no score) and of Ana (row 0) on one line. Is Gus's verdict a gap? Then repeat the map with `na_action='ignore'` and print Gus's verdict.",
      "a": "`['R', 'B', 'R']`. Then `low pass`: the function is called on the gap too, and `nan >= 70` is false, so Gus gets `low`, not a gap: a quiet mistake. With `na_action='ignore'` the gap stays: `nan`.",
      "learn": [
       "`map` makes a column from another one, with a dictionary or a function",
       "`df['team'].map({'Red': 'R', 'Blue': 'B', 'Green': 'G'})` gives `['R', 'B', 'R']` for the first three",
       "`df['score'].map(lambda s: 'pass' if s >= 70 else 'low')` builds a verdict",
       "the function is called on the gap too, and `nan >= 70` is false",
       "Gus (row 6, no score) gets `low` and Ana (row 0) gets `pass`, so the line is `low pass`",
       "so Gus gets `low` and not a gap, which is a quiet mistake",
       "with `na_action='ignore'` the gap stays: `nan`"
      ],
      "ab": [
       [
        "write",
        "Map a column with a dictionary"
       ],
       [
        "write",
        "Map a column with a function"
       ],
       [
        "read",
        "Read the verdicts of Gus and Ana"
       ],
       [
        "fix",
        "Keep the gap with `na_action='ignore'`"
       ],
       [
        "say",
        "Say why Gus gets `low`"
       ],
       [
        "predict",
        "Predict whether Gus's verdict is a gap before you run it"
       ]
      ]
     }
    ],
    "task": {
     "t": "Which team is best",
     "u": "PD-11",
     "k": "From `players.csv` print the team with the highest mean score and that mean, on one line, taken from the table (`idxmax()` and `max()`), not typed in.",
     "a": "`Green 79.25`."
    }
   },
   {
    "key": "pandas/PD-I",
    "id": "PD-I",
    "n": "Summaries: what is in a column",
    "idea": "one call tells you what a column or a group holds: a summary table, a count of each value, several summaries at once.",
    "needsText": "regions PD-G and PD-H.",
    "items": [
     {
      "id": "PD-16",
      "t": "Describe a column",
      "y": "read the summary table of `describe` and see how many values a column really has.",
      "c": "Print `df['score'].describe()` for `players.csv`. Then print the `count` row of `df.describe()` and say why the count for `score` is 11 and not 12.",
      "a": "`describe` gives the count, mean, standard deviation, smallest value, the quartiles and the largest value; for `score` it starts `count    11.000000` and `mean     78.454545`. The `count` row of the whole table is `age      11.0`, `score    11.0` and `games    12.0`: the count skips gaps, and age and score each have one.",
      "learn": [
       "`describe()` gives the count, mean, standard deviation, smallest value, quartiles and largest value",
       "for `score` it starts `count    11.000000` and `mean     78.454545`",
       "`count` is how many real values the column has: 11, not 12",
       "one score is a gap, and the count skips gaps",
       "the `count` row of the whole table shows `age      11.0` as well",
       "`df.describe()` on the whole table gives `games` a count of 12.0, since nobody has a gap there",
       "so `describe` is a quick way to see how many values are really there"
      ],
      "ab": [
       [
        "write",
        "Print `df['score'].describe()`"
       ],
       [
        "write",
        "Print the `count` row of `df.describe()`"
       ],
       [
        "read",
        "Read the count, the mean and the quartiles"
       ],
       [
        "say",
        "Say why the count for `score` is 11 and not 12"
       ],
       [
        "predict",
        "Predict a column's count from its gaps"
       ],
       [
        "pick",
        "Pick `describe` when you need the count, mean and spread of a column in one call"
       ]
      ]
     },
     {
      "id": "PD-17",
      "t": "Count each value: `value_counts`, `unique`, `nunique`",
      "y": "count how often each value occurs in a column and list its different values.",
      "c": "Make `colour = pd.Series(['red', 'blue', 'red', 'green', 'red', 'blue'])`. Print `colour.value_counts()`, `colour.unique().tolist()` and `colour.nunique()`. Then print `df['team'].nunique()` and `df['age'].nunique()` for `players.csv` on one line, and say why age gives 11 although the table has 12 rows.",
      "a": "`red      3`, `blue     2`, `green    1` (the most common first); `['red', 'blue', 'green']`; `3`. Then `3 11`: the three teams, and 11 different ages, because `nunique` skips the one gap and all other ages are different.",
      "learn": [
       "`value_counts()` counts each value, most common first: red 3, blue 2, green 1",
       "`unique().tolist()` lists the different values: `['red', 'blue', 'green']`",
       "`nunique()` counts the different values: 3",
       "the counts 3, 2 and 1 add up to the 6 colours in the series",
       "for `players.csv`, `df['team'].nunique()` is 3 and `df['age'].nunique()` is 11",
       "age gives 11 although the table has 12 rows",
       "`nunique` skips the one gap and all the other ages are different"
      ],
      "ab": [
       [
        "write",
        "Count each value with `value_counts()`"
       ],
       [
        "write",
        "List the different values with `unique()`"
       ],
       [
        "write",
        "Count them with `nunique()`"
       ],
       [
        "read",
        "Read the counts, most common first"
       ],
       [
        "say",
        "Say why `age` gives 11 and not 12"
       ],
       [
        "predict",
        "Predict `3` for `colour.nunique()` before you run"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-18",
      "t": "Several summaries per group: `agg`",
      "y": "get one table of several summaries for each group with `groupby(...).agg(...)`.",
      "c": "For `players.csv` make one table with, for each `team`, the number of players, the mean `score` and the highest `age`: `df.groupby('team').agg(players=('name', 'count'), mean_score=('score', 'mean'), oldest=('age', 'max'))`. Print it. Which team has the oldest player?",
      "a": "Blue: 4 players, mean `78.75`, oldest `31.0`; Green: 4, `79.25`, `38.0`; Red: 4, `77.00`, `41.0`. Red has the oldest player (41, Gus). The oldest ages are decimals because `age` has a gap.",
      "learn": [
       "`agg` gives several summaries per group in one table",
       "`df.groupby('team').agg(players=('name', 'count'), mean_score=('score', 'mean'), oldest=('age', 'max'))`",
       "each keyword becomes a new column and takes a (column, function) pair",
       "Blue: 4 players, mean 78.75, oldest 31.0",
       "Green: 4 players, mean 79.25, oldest 38.0; Red: 4 players, mean 77.00, oldest 41.0",
       "Red has the oldest player: 41, Gus",
       "the oldest ages are decimals because `age` has a gap"
      ],
      "ab": [
       [
        "write",
        "Make one table of several summaries per team with `agg`"
       ],
       [
        "write",
        "Name each summary column with a keyword"
       ],
       [
        "read",
        "Say which team has the oldest player"
       ],
       [
        "predict",
        "Predict how many rows the result has"
       ],
       [
        "say",
        "Say why the ages come out as decimals"
       ],
       [
        "pick",
        "Pick `count`, `mean` or `max` for each summary column"
       ]
      ]
     }
    ],
    "task": {
     "t": "Which team has most high scorers",
     "u": "PD-6, PD-17",
     "k": "From `players.csv` keep the players with a score above 75, count them per team with `value_counts` and print the team with the most and its count on one line, taken from the result.",
     "a": "`Green 3` (Fay, Ivy and Lee; Red and Blue have two each)."
    }
   },
   {
    "key": "pandas/PD-J",
    "id": "PD-J",
    "n": "Gaps, types and names",
    "idea": "you make a table fit to use: find its gaps, drop or fill them, give a column the right type and a clear name.",
    "needsText": "regions PD-G and PD-H. Which fix is right for real data (and duplicates, odd values, typos) is cleaning: skill 23, Tier 2.",
    "items": [
     {
      "id": "PD-12",
      "t": "Where are the gaps",
      "y": "count the missing values in each column.",
      "c": "Count the missing values in each column of `players.csv` with `df.isna().sum()` and print the result. Which two cells are missing? (Filling them is cleaning: skill 23, Tier 2.)",
      "a": "The output shows `age      1` and `score    1` and a 0 for the other three columns: Hal has no age, Gus has no score.",
      "learn": [
       "`df.isna().sum()` counts the missing values in each column",
       "`df.isna()` is a whole table of True and False with the same shape as `df`",
       "`isna()` gives True where a value is missing, and `sum()` counts the Trues",
       "the output shows `age      1` and `score    1` and 0 for the other three columns",
       "a `0` in the output means the column has no gaps: `name`, `team` and `games` are complete",
       "Hal has no age and Gus has no score",
       "filling the gaps is cleaning, which is skill 23 in Tier 2"
      ],
      "ab": [
       [
        "write",
        "Count the missing values with `df.isna().sum()`"
       ],
       [
        "read",
        "Read the count for each column"
       ],
       [
        "read",
        "Name the two cells that are missing"
       ],
       [
        "predict",
        "Predict which columns have gaps from the dtypes"
       ],
       [
        "say",
        "Say why this item only finds gaps and does not fill them"
       ],
       [
        "pick",
        "Pick `df.isna().sum()` to count gaps and `df.isna()` to see where they are"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-19",
      "t": "Drop or fill gaps",
      "y": "drop the rows with gaps (`dropna`) or fill a gap with a value (`fillna`), and say what each costs.",
      "c": "On `players.csv` print the shape after `df.dropna()` and after `df.dropna(subset=['score'])`. Then fill the gap in `score` with the mean score: `filled = df['score'].fillna(df['score'].mean())`. Print Gus's filled score (row 6) rounded to 2 decimals, then the number of gaps in `score` before and after on one line.",
      "a": "`(10, 5)` (two rows have a gap, Gus and Hal), then `(11, 5)` (only Gus has no score). Gus's filled score is `78.45`, and the gaps go from 1 to 0: `1 0`. Dropping loses rows; filling invents a value; which is right depends on the data (Tier 2).",
      "learn": [
       "`df.dropna()` drops every row that has a gap: the shape becomes `(10, 5)`",
       "`df.dropna(subset=['score'])` drops only the rows with no score: `(11, 5)`",
       "`df['score'].fillna(df['score'].mean())` fills the gap with the mean score",
       "Gus's filled score is `78.45`",
       "the gaps in `score` go from 1 to 0",
       "dropping loses rows, and filling invents a value",
       "which one is right depends on the data"
      ],
      "ab": [
       [
        "write",
        "Drop the rows with any gap"
       ],
       [
        "write",
        "Drop only the rows with no score using `subset`"
       ],
       [
        "write",
        "Fill a gap with the mean using `fillna`"
       ],
       [
        "read",
        "Read the shapes before and after"
       ],
       [
        "say",
        "Say what dropping costs"
       ],
       [
        "say",
        "Say what filling costs"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-20",
      "t": "Change a column's type: `astype`",
      "y": "change a column's type with `astype` and read the error that a gap causes.",
      "c": "Try `df['age'].astype(int)` on `players.csv` inside `try`/`except ValueError as e` and print the error's class name. Then drop the rows without an age (`dropna(subset=['age'])`), turn `age` into whole numbers and print its dtype and its first four values on one line. Last print the dtype of `df['games'].astype(float)`.",
      "a": "`IntCastingNaNError`: a gap cannot become a whole number (this is why `age` is `float64`, PD-2). After dropping the gap: `int64 [23, 31, 27, 35]`. Then `float64`.",
      "o": "`IntCastingNaNError` is the class name on pandas 3.0.6 (a kind of `ValueError`); another pandas may name it differently.",
      "learn": [
       "`df['age'].astype(int)` fails because the column has a gap",
       "the error is `IntCastingNaNError`: a gap cannot become a whole number",
       "that is why `age` is `float64` (PD-2)",
       "drop the rows without an age with `dropna(subset=['age'])`, then `astype(int)` works",
       "the result prints `int64 [23, 31, 27, 35]`",
       "`dropna(subset=['age'])` looks only at `age`, so a row with a gap in another column, like Gus's score, stays",
       "`IntCastingNaNError` is a kind of `ValueError`"
      ],
      "ab": [
       [
        "write",
        "Try `astype(int)` inside `try` and `except ValueError as e`"
       ],
       [
        "read",
        "Read the error's class name"
       ],
       [
        "write",
        "Drop the gap and cast the column to whole numbers"
       ],
       [
        "read",
        "Print the dtype and the first four values"
       ],
       [
        "say",
        "Say why a gap blocks a whole-number cast"
       ],
       [
        "fix",
        "Fix a cast to whole numbers that failed by removing the gap first"
       ]
      ]
     },
     {
      "id": "PD-21",
      "t": "Rename columns",
      "y": "rename columns with `rename(columns={...})` and know that it returns a new table.",
      "c": "In `players.csv` make `d2 = df.rename(columns={'score': 'points'})`. Print the column names of `d2` and then of `df`. Is `df` changed?",
      "a": "`['name', 'team', 'age', 'points', 'games']` for `d2` and `['name', 'team', 'age', 'score', 'games']` for `df`: `df` is not changed. `rename` returns a new table, so keep it with `df = df.rename(...)`.",
      "learn": [
       "`df.rename(columns={'score': 'points'})` renames a column",
       "`columns={'score': 'points'}` is a dictionary from the old name to the new name",
       "the new table `d2` has `points` where `df` has `score`",
       "`df` is not changed",
       "`rename` returns a new table",
       "keep the change with `df = df.rename(...)`",
       "the other columns keep their names: `['name', 'team', 'age', 'points', 'games']`"
      ],
      "ab": [
       [
        "write",
        "Rename a column with `rename(columns={...})`"
       ],
       [
        "read",
        "Compare the column names of `d2` and `df`"
       ],
       [
        "predict",
        "Predict that `df` is unchanged"
       ],
       [
        "fix",
        "Keep a rename by assigning the result back"
       ],
       [
        "say",
        "Say what `rename` returns"
       ],
       [
        "pick",
        "Pick `d2 = df.rename(...)` to keep the old table or `df = df.rename(...)` to replace it"
       ]
      ]
     }
    ],
    "task": {
     "t": "A table with no gaps and clearer names",
     "u": "PD-12, PD-19, PD-20, PD-21",
     "k": "From `players.csv` drop every row that has a gap, turn `age` into whole numbers, rename `games` to `played`, and print the shape, the column names and the dtype of `age` on three lines.",
     "a": "`(10, 5)`, then `['name', 'team', 'age', 'score', 'played']`, then `int64`."
    }
   },
   {
    "key": "pandas/PD-K",
    "id": "PD-K",
    "n": "Combining tables",
    "idea": "two tables become one: stacked one under the other, or side by side along a shared column.",
    "needsText": "regions PD-G and PD-J.",
    "items": [
     {
      "id": "PD-24",
      "t": "Stack tables: `concat`",
      "y": "put tables under each other with `pd.concat` and fix the row labels with `ignore_index=True`.",
      "c": "With `a = df.iloc[:2][['name', 'score']]` and `b = pd.DataFrame({'name': ['Zed', 'Yan'], 'score': [50, 60]})` print the row labels and the shape of `pd.concat([a, b])` on one line, then the row labels of `pd.concat([a, b], ignore_index=True)`.",
      "a": "`[0, 1, 0, 1] (4, 2)`: the labels repeat, because each table brings its own. With `ignore_index=True` they are numbered again: `[0, 1, 2, 3]`.",
      "learn": [
       "`pd.concat([a, b])` puts tables under each other",
       "the tables go in a list, `[a, b]`, and their order is the order of the rows",
       "the row labels repeat: `[0, 1, 0, 1]` with shape `(4, 2)`",
       "they repeat because each table brings its own labels",
       "`ignore_index=True` numbers them again: `[0, 1, 2, 3]`",
       "the columns line up by name, so both tables need the same column names",
       "`a` is the first two rows of two columns, and `b` is a new two-row table with the same two column names"
      ],
      "ab": [
       [
        "write",
        "Stack two tables with `pd.concat`"
       ],
       [
        "read",
        "Read the repeated row labels"
       ],
       [
        "write",
        "Number the rows again with `ignore_index=True`"
       ],
       [
        "predict",
        "Predict the shape of the stacked table"
       ],
       [
        "say",
        "Say why the labels repeat"
       ],
       [
        "fix",
        "Fix repeated row labels by adding `ignore_index=True`"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     },
     {
      "id": "PD-25",
      "t": "Join tables on a column: `merge`",
      "y": "add columns from a second table along a shared column with `merge`, and predict how many rows each `how` keeps.",
      "c": "With `teams = pd.DataFrame({'team': ['Red', 'Blue', 'Gold'], 'city': ['Oslo', 'Rome', 'Lima']})` write down how many rows `df.merge(teams, on='team', how=...)` has for `'inner'`, `'left'` and `'outer'`. Then print the three row counts, and whether the city of every Green player is missing in the left merge.",
      "a": "`8` (inner keeps only teams in both tables: Red 4 and Blue 4), `12` (left keeps every player, Green has no city), `13` (outer keeps all twelve players and the Gold row, which has no player), then `True`.",
      "learn": [
       "`merge` adds columns from a second table along a shared column, here `on='team'`",
       "`how='inner'` keeps only the teams that are in both tables: Red 4 and Blue 4, so 8 rows",
       "`how='left'` keeps every player: 12 rows",
       "Green has no city, so every Green player's city is missing in the left merge",
       "the counts follow from each other: left is inner plus the 4 Green players (8 + 4 = 12) and outer adds Gold (13)",
       "`how='outer'` keeps all 12 players and the Gold row, which has no player: 13 rows",
       "write the three row counts down before you run"
      ],
      "ab": [
       [
        "predict",
        "Say how many rows inner, left and outer keep before running"
       ],
       [
        "write",
        "Merge two tables with `merge(..., on='team', how=...)`"
       ],
       [
        "read",
        "Read the three row counts"
       ],
       [
        "read",
        "Check that Green players have no city in the left merge"
       ],
       [
        "say",
        "Say what each `how` keeps"
       ],
       [
        "pick",
        "Pick inner, left or outer for a given job"
       ]
      ],
      "src": [
       {
        "title": "10 minutes to pandas",
        "url": "https://pandas.pydata.org/docs/user_guide/10min.html",
        "note": "Tables, selection, gaps, groups, merge, CSV."
       }
      ]
     }
    ],
    "task": {
     "t": "Which players have no city",
     "u": "PD-12, PD-25",
     "k": "With the same `teams` table, merge it onto `players.csv` keeping every player, and print how many players have no city and the team of those players as a list, both taken from the result.",
     "a": "`4 ['Green']`.\n<!-- PD:END -->"
    }
   }
  ]
 },
 {
  "id": "terminal",
  "name": "Terminal",
  "code": "TM",
  "regions": [
   {
    "key": "terminal/TA",
    "id": "TA",
    "n": "Where you are and what is there",
    "idea": "a terminal is always inside one folder; you ask where that is, make a place to work in, move through folders and look at what is in them.",
    "needsText": "nothing but a terminal (TM-1 opens one).",
    "items": [
     {
      "id": "TM-1",
      "t": "Open a terminal and say where you are",
      "y": "open a terminal, read which folder it is in with `pwd`, and print text with `echo`.",
      "c": "Open a terminal (Linux or macOS: the Terminal app; Windows: Git Bash, which comes with Git; PowerShell also works for this item). Type `pwd` and press Enter. Type `echo hello terminal`. Type `cd ~` and then `pwd` again. Write down the path the first `pwd` showed and say whether the last `pwd` showed the same.",
      "a": "`pwd` (\"print working directory\") shows the folder the terminal is in, as a path: folder names joined by `/`. A new terminal starts in your home folder, so the last `pwd` shows the same path as the first: here `/home/you` (yours is `/home/` and your user name on Linux, `/Users/` and your user name on macOS). `echo hello terminal` shows `hello terminal`. `cd ~` takes you to your home folder from wherever you are and prints nothing.",
      "o": "every transcript in this section was run for real with bash on Linux; the `$ ` at the start of a line stands for your prompt, so do not type it. **Windows (your system): use Git Bash**, the bash that comes with Git for Windows (checked on the pages of Atlassian and of Git for Windows, 8 Nov 2026): open it from the Start menu and the commands in this section work as written; its `pwd` shows a path like `/c/Users/you` rather than `C:\\Users\\you` [from memory, not run]. PowerShell uses the same words for many commands because it has aliases for them (`pwd`, `cd`, `ls`, `mkdir`, `mv`, `rm` and `echo` are in Microsoft's alias table; `cp` and `cat` are from memory), with the differences named in each item. macOS's Terminal (zsh) behaves the same as the transcripts [from memory, not run]. Nothing on Windows or macOS was run: the transcripts are Linux. Tab finishes a name you have started and the Up arrow brings back the last command [from memory, not run].",
      "learn": [
       "a terminal is always inside one folder, and you can ask which one",
       "how to open one: the Terminal app on Linux or macOS, Git Bash on Windows (PowerShell also works for this item)",
       "`pwd` means 'print working directory': it shows the folder you are in",
       "a path is folder names joined by `/`, like `/home/you`",
       "`echo hello terminal` prints the text you give it",
       "`cd ~` goes to your home folder, and `~` is the short name for it",
       "a new terminal starts in your home folder, so the last `pwd` shows the same path as the first",
       "the `$ ` at the start of a line in examples is your prompt: you do not type it",
       "how the check proves it: write down the first path and compare it with the last"
      ],
      "ab": [
       [
        "write",
        "Open a terminal and run `pwd`"
       ],
       [
        "read",
        "Read the path and say which folder it is"
       ],
       [
        "write",
        "Print text with `echo hello terminal`"
       ],
       [
        "write",
        "Go home with `cd ~` and run `pwd` again"
       ],
       [
        "predict",
        "Predict that the last `pwd` matches the first"
       ],
       [
        "say",
        "Say what a path is and what the `/` does in it"
       ]
      ]
     },
     {
      "id": "TM-2",
      "t": "Make a folder and move around",
      "y": "make a folder with `mkdir`, go into it with `cd`, go up one level with `cd ..`, and tell a full path from one that starts where you are.",
      "c": "From your home folder run, one after the other: `mkdir sandbox`, `cd sandbox`, `pwd`, `cd ..`, `pwd`. Then `cd sandbox`, `mkdir -p a/b`, `cd a/b`, `pwd`, `cd ../..`, `pwd`. Then go to the folder `a` with its full path (your home path from TM-1, then `/sandbox/a`), run `pwd`, and finish with `cd ~` and `pwd`. What do the `pwd` lines show? What happens if you type `cd nowhere`, and where are you afterwards?",
      "a": "In order: `/home/you/sandbox`; `/home/you`; `/home/you/sandbox/a/b`; `/home/you/sandbox`; `/home/you/sandbox/a`; `/home/you` (yours start with your own home path). `mkdir`, `cd` and `cd ..` print nothing when they work. `cd a/b` starts where you are (a *relative* path); `cd /home/you/sandbox/a` starts at the very top, `/`, and works from any folder (a *full*, or *absolute*, path). `mkdir -p` also makes the folders in between: without it `mkdir x/y` fails when `x` does not exist. `cd nowhere` prints an error that says there is no such file or directory (bash writes `No such file or directory`) and you stay in the folder you were in.",
      "o": "Windows: in Git Bash exactly as written. In PowerShell a full path starts with a drive letter and uses backslashes, like `C:\\Users\\you\\sandbox\\a` [from memory, not run], and `mkdir -p` is a bash flag: use Git Bash for this item.",
      "learn": [
       "`mkdir sandbox` makes a folder, and it prints nothing when it works",
       "`cd sandbox` goes into it and `cd ..` goes up one level",
       "run `pwd` after each move to see where you are",
       "`mkdir -p a/b` makes a folder and the one inside it in one go (`-p` makes the missing parents)",
       "a relative path starts where you are, like `cd a/b`",
       "a full path starts from the top: your home path, then `/sandbox/a`",
       "`cd ../..` goes up two levels",
       "`cd ~` takes you home from anywhere",
       "`cd nowhere` fails with an error, because that folder is not there",
       "on Windows use Git Bash exactly as written; in PowerShell a full path starts with a drive letter and uses backslashes"
      ],
      "ab": [
       [
        "write",
        "Make a folder with `mkdir sandbox` and go into it with `cd`"
       ],
       [
        "write",
        "Make nested folders with `mkdir -p a/b`"
       ],
       [
        "read",
        "Read each `pwd` line and say where you are"
       ],
       [
        "write",
        "Go up with `cd ..` and `cd ../..`"
       ],
       [
        "write",
        "Go to `a` by its full path"
       ],
       [
        "say",
        "Say the difference between a relative path and a full path"
       ],
       [
        "fix",
        "Read the error from `cd nowhere` and say what went wrong"
       ]
      ]
     },
     {
      "id": "TM-3",
      "t": "Make empty files and list a folder",
      "y": "make empty files with `touch`, list a folder with `ls`, list another folder without going into it, and show hidden names with `ls -a`.",
      "c": "Make a folder `work` and go into it. Run `touch a.txt b.txt` (it makes two empty files), `mkdir .venv`, `mkdir sub` and `touch sub/c.txt`. Run `ls`, then `ls sub`, then `ls -a`. Which name does `ls` leave out that `ls -a` shows, and which two names that begin with a dot does `ls -a` add to that?",
      "a": "`ls` shows `a.txt`, `b.txt` and `sub`; names that begin with a dot are hidden, so `.venv` is left out. `ls sub` shows `c.txt` without going into `sub`. `ls -a` shows all six names: `.venv` and also `.` (this folder) and `..` (the folder above, which is why `cd ..` works), besides the three above. The order can differ on your system. Hidden folders matter later: the `.git` folder of the Git items and the `.venv` folder of PY-37 are hidden.",
      "o": "Windows: in Git Bash as written. PowerShell has no `touch`: `New-Item a.txt` makes an empty file (Microsoft's documentation of `New-Item`, with `-ItemType File`), and `ls` has no `-a`: `ls -Force` shows hidden items (Microsoft's documentation: `Get-ChildItem` leaves hidden items out unless you use `-Force`). Whether PowerShell also lists `.` and `..` is not known to me; it was not run.",
      "learn": [
       "`touch a.txt b.txt` makes two empty files",
       "`mkdir .venv` and `mkdir sub` make folders, and `touch sub/c.txt` makes a file inside `sub`",
       "`ls` lists what is in the current folder: `a.txt`, `b.txt` and `sub`",
       "names that begin with a dot are hidden, so `.venv` is left out",
       "`ls sub` lists another folder without going into it",
       "`ls -a` shows every name, hidden ones too",
       "`ls -a` also adds `.` (this folder) and `..` (the folder above)",
       "that is why `cd ..` works: `..` is a real name for the folder above",
       "on Windows use Git Bash as written; PowerShell has no `touch`, and `New-Item a.txt` makes an empty file"
      ],
      "ab": [
       [
        "write",
        "Make empty files with `touch a.txt b.txt`"
       ],
       [
        "write",
        "Make a folder inside `work` and a file inside that folder"
       ],
       [
        "read",
        "Read `ls` and name what it leaves out"
       ],
       [
        "write",
        "List another folder with `ls sub`"
       ],
       [
        "read",
        "Read `ls -a` and name the two extra dot names"
       ],
       [
        "say",
        "Say what `.` and `..` stand for"
       ],
       [
        "predict",
        "Predict which names `ls` will show before you run it"
       ]
      ]
     }
    ],
    "task": {
     "t": "Build a small project tree and walk through it",
     "u": "`mkdir`, `touch`, `cd`, `pwd`, `ls`",
     "k": "From your home folder, using only the terminal (no file manager), make a folder `proj` with two folders inside it, `src` and `docs`, with one command (`mkdir -p` takes several names). Make an empty `main.py` in `src` and an empty `notes.txt` in `docs` with one `touch`. Go into `src` with one `cd` and run `pwd`. Go to `docs` with one `cd` that starts with `..` and run `pwd` and `ls`. Go back to your home folder with one `cd` that uses `..` twice, run `pwd`, and list the folder `proj` without going into it.",
     "a": "The `pwd` lines show `/home/you/proj/src`, `/home/you/proj/docs` and `/home/you` (yours begin with your own home path); the `ls` in `docs` shows `notes.txt`; `ls proj` shows `docs` and `src`. One way: `mkdir -p proj/src proj/docs`, `touch proj/src/main.py proj/docs/notes.txt`, `cd proj/src`, `pwd`, `cd ../docs`, `pwd`, `ls`, `cd ../..`, `pwd`, `ls proj`."
    }
   },
   {
    "key": "terminal/TB",
    "id": "TB",
    "n": "Writing, copying, deleting and running",
    "idea": "change files from the prompt (write, copy, move, delete) and run a Python file from it.",
    "needsText": "region TA (`mkdir`, `cd`, `ls`); TM-7 also needs Python installed (PY-1). On Windows, Git Bash for all items. A text editor is the other way to make a file: the items that use `echo` to make one work the same with an editor.",
    "items": [
     {
      "id": "TM-4",
      "t": "Put text in a file and read it",
      "y": "write text into a file with `echo ... > file`, add a line to it with `>>`, read a file with `cat`, and know that a single `>` replaces what was there.",
      "c": "Make a folder `notes` and go into it. Run `echo one > a.txt` and `cat a.txt`; then `echo two >> a.txt` and `cat a.txt`; then `echo three > a.txt` and `cat a.txt`; then `echo \"hello world\" > b.txt` and `cat a.txt b.txt`. What does each `cat` show?",
      "a": "`one`; then `one` and `two` on two lines (`>>` adds to the end); then only `three` (a single `>` replaces the whole file and does not ask first); then `three` and `hello world` (`cat` with two names shows the files one after the other). `>` saves what any command prints, not only `echo`: PY-38 saves the output of `pip freeze` this way.",
      "o": "Windows: in Git Bash as written, and the files are plain text Python can read. In Windows PowerShell 5.1 the operators `>` and `>>` write UTF-16 text (Microsoft's page about_Character_Encoding, read 8 Nov 2026); `cat` still shows it, but Python reads source files as UTF-8 and will not accept such a file [from memory, not run], so there make Python files in a text editor and save them as UTF-8. PowerShell 7 writes UTF-8 without a byte-order mark (stated by a secondary source that quotes the same page; not checked on the page itself).",
      "learn": [
       "`echo one > a.txt` writes the text `one` into the file `a.txt`",
       "`cat a.txt` shows what is inside a file",
       "a single `>` replaces the whole file and does not ask first",
       "`>>` adds a line to the end instead",
       "`cat a.txt b.txt` shows the files one after the other",
       "`echo \"hello world\" > b.txt`: the quotes keep two words together as one piece of text",
       "`>` sends what a command prints into a file instead of the screen",
       "the check: the four `cat` lines show `one`, then `one` and `two`, then `three`, then `three` and `hello world`",
       "on Windows use Git Bash as written; PowerShell 5.1 has its own differences with these operators"
      ],
      "ab": [
       [
        "write",
        "Write a line into a file with `echo one > a.txt`"
       ],
       [
        "write",
        "Add a second line with `echo two >> a.txt`"
       ],
       [
        "read",
        "Read a file back with `cat`"
       ],
       [
        "predict",
        "Predict what `cat a.txt` shows after a single `>` replaces the file"
       ],
       [
        "write",
        "Show two files in one go with `cat a.txt b.txt`"
       ],
       [
        "say",
        "Say the difference between `>` and `>>`"
       ],
       [
        "fix",
        "Spot the line that overwrote your file by mistake"
       ]
      ]
     },
     {
      "id": "TM-5",
      "t": "Copy and move files and folders",
      "y": "copy a file with `cp`, copy a folder with `cp -r`, rename or move with `mv`, and know that copying onto a name that exists replaces it.",
      "c": "Make a folder `work` and go into it. Run `echo one > a.txt`, `cp a.txt b.txt`, `mkdir d` and `cp a.txt d`. Try `cp d d2` and read the message. Run `cp -r d d2` and `ls d2`. Run `mv b.txt c.txt` and `mv c.txt d`, then `ls` and `ls d`. Last run `echo two > e.txt`, `cp e.txt a.txt` and `cat a.txt`. What does each `ls` show, what does `cp d d2` say, and what does the last `cat` show?",
      "a": "`ls d2` shows `a.txt` (the copy of the folder has the file in it). `cp d d2` refuses and says `cp: -r not specified; omitting directory 'd'` (Linux wording; macOS words it differently): a folder needs `-r` (\"recursive\"), which copies what is inside it too. Then `ls` shows `a.txt`, `d` and `d2` (`b.txt` was renamed `c.txt`, then moved into `d`), and `ls d` shows `a.txt` and `c.txt`. The last `cat` shows `two`: `cp` onto a name that exists replaces that file without asking, and so does `mv`.",
      "o": "Windows: in Git Bash as written. In PowerShell `mv` is an alias of `Move-Item` (Microsoft's alias table; `cp` for `Copy-Item` is from memory), and a folder is copied with the flag `-Recurse`; what PowerShell says when you leave it out was not run, so the message quoted above does not apply there.",
      "learn": [
       "`cp a.txt b.txt` copies a file",
       "`cp a.txt d` copies a file into the folder `d`",
       "`cp d d2` refuses, because a folder needs `-r` ('recursive'), which copies what is inside it too",
       "the refusal reads `cp: -r not specified; omitting directory 'd'` (Linux wording; macOS words it differently)",
       "`cp -r d d2` copies the folder, and `ls d2` shows `a.txt`",
       "`mv b.txt c.txt` renames a file, and `mv c.txt d` moves it into `d`",
       "the same `mv` renames or moves, depending on the target",
       "`cp e.txt a.txt` onto a name that exists replaces it, with no question asked",
       "so the last `cat a.txt` shows `two`",
       "on Windows use Git Bash as written; in PowerShell `mv` is an alias of `Move-Item`"
      ],
      "ab": [
       [
        "write",
        "Copy a file with `cp` and a folder with `cp -r`"
       ],
       [
        "read",
        "Read the `cp: -r not specified` message and say what it asks for"
       ],
       [
        "write",
        "Rename a file with `mv b.txt c.txt`"
       ],
       [
        "write",
        "Move a file into a folder with `mv c.txt d`"
       ],
       [
        "predict",
        "Predict what `ls` and `ls d` show after the moves"
       ],
       [
        "say",
        "Say what copying onto an existing name does"
       ],
       [
        "pick",
        "Pick `cp` or `mv` when the original should stay or go"
       ]
      ]
     },
     {
      "id": "TM-6",
      "t": "Delete, with care",
      "y": "delete a file with `rm` and a folder with `rm -r`, say why there is no undo, and check where you are and what is there before you delete.",
      "c": "Make a folder `work` and go into it. Run `touch a.txt`, `mkdir d` and `touch d/x.txt`. Before deleting anything run `pwd` and `ls`. Then run `rm a.txt` and `ls`; run `rm a.txt` again; run `rm d` and read the message; run `rm -r d` and `ls`. What does each step show?",
      "a": "`pwd` shows `/home/you/work` and `ls` shows `a.txt` and `d`. After `rm a.txt` the `ls` shows only `d`. The second `rm a.txt` fails with `rm: cannot remove 'a.txt': No such file or directory`. `rm d` fails with `rm: cannot remove 'd': Is a directory` (Linux wording): a folder needs `rm -r`, which deletes the folder and everything inside it, and then the last `ls` shows nothing. There is no recycle bin behind `rm`: what it deletes is gone [general knowledge; a transcript cannot show it]. So: run `pwd` and `ls` first, type the name yourself, and do not paste an `rm -r` line you do not understand; `rm -r` does not ask.",
      "o": "Windows: in Git Bash as written. In PowerShell `rm` is an alias of `Remove-Item` (Microsoft's alias table) and the folder flag is `-Recurse` (Microsoft's documentation of `Remove-Item`): `rm -Recurse d`. The care is the same, and so are the missing undo and the missing question [from memory, not run].",
      "learn": [
       "before you delete, run `pwd` and `ls` to check where you are and what is there",
       "`rm a.txt` deletes a file, and there is no undo: no trash, no bin",
       "run the same `rm a.txt` again and it fails with `rm: cannot remove 'a.txt': No such file or directory`",
       "`rm d` fails with `rm: cannot remove 'd': Is a directory` (Linux wording)",
       "`rm -r d` deletes the folder and everything inside it",
       "`-r` in the wrong folder is how people lose work, so check `pwd` first",
       "after the deletes, `ls` shows only what is left",
       "on Windows use Git Bash as written; in PowerShell `rm` is an alias of `Remove-Item`"
      ],
      "ab": [
       [
        "read",
        "Run `pwd` and `ls` before every delete"
       ],
       [
        "write",
        "Delete a file with `rm a.txt`"
       ],
       [
        "read",
        "Read the 'No such file or directory' error"
       ],
       [
        "read",
        "Read the 'Is a directory' error and say what it asks for"
       ],
       [
        "write",
        "Delete a folder with `rm -r d`"
       ],
       [
        "say",
        "Say why a deleted file cannot be brought back"
       ],
       [
        "predict",
        "Predict what `ls` shows after each step"
       ]
      ]
     },
     {
      "id": "TM-7",
      "t": "Run a Python file and save what it prints",
      "y": "run a Python file with `python3 file.py`, save what it prints into a file with `>`, and know that an error message still shows on the screen.",
      "c": "Make a folder `work` and go into it. Make `hello.py` with the one line `print(\"hello from a file\")` (for example `echo 'print(\"hello from a file\")' > hello.py`, or in a text editor) and run `python3 hello.py` (on Windows usually `python hello.py`). Run `python3 hello.py > out.txt` and then `cat out.txt`. Make `bad.py` with two lines, `print(\"before\")` and `1 / 0`, run `python3 bad.py > out2.txt` and then `cat out2.txt`. What shows on the screen at each step?",
      "a": "The first run prints `hello from a file`. After `> out.txt` nothing shows on the screen and `cat out.txt` shows `hello from a file`: `>` sends what the program prints into the file. `bad.py` prints `before` into `out2.txt`, but its error message still appears on the screen (Python sends error messages to a different place than printing; the Guide shortens the middle of the traceback to `...`) and ends with `ZeroDivisionError: division by zero`; `cat out2.txt` shows only `before`.",
      "o": "Windows: in Git Bash the command is usually `python`, not `python3` [from memory, not run]. If typing `python` opens the Microsoft Store, Python is not installed or its Store shortcut is in the way [from memory, not run]. Windows also has the launcher `py`: `py hello.py` [from memory, not run]. The `>` redirection works the same; the error message still shows on the screen [from memory, not run].",
      "learn": [
       "`python3 hello.py` runs a Python file (on Windows usually `python hello.py`)",
       "you can make the file with `echo 'print(\"hello from a file\")' > hello.py` or in a text editor",
       "`python3 hello.py > out.txt` sends what the program prints into a file, so nothing shows on the screen",
       "`cat out.txt` shows `hello from a file`",
       "`bad.py` prints `before` and then fails on `1 / 0`",
       "`before` goes into `out2.txt`, but the error message still shows on the screen",
       "errors travel a different way from normal output, so `>` does not catch them",
       "on Windows in Git Bash the command is usually `python`, not `python3` (the item says this is from memory, not run)"
      ],
      "ab": [
       [
        "write",
        "Make `hello.py` and run it with `python3 hello.py`"
       ],
       [
        "write",
        "Save the output with `python3 hello.py > out.txt`"
       ],
       [
        "read",
        "Read the saved text with `cat out.txt`"
       ],
       [
        "write",
        "Run `bad.py` with `>` and watch what still shows on the screen"
       ],
       [
        "predict",
        "Predict that the error message is not saved in the file"
       ],
       [
        "say",
        "Say why `>` does not catch the error message"
       ]
      ]
     }
    ],
    "task": {
     "t": "Write, copy, run, save and clean up",
     "u": "`mkdir`, `echo` with `>` and `>>`, `cp`, `python3`, `cat`, `rm`, `ls`",
     "k": "In a new folder `lab`, make `add.py` with two lines, `a = 2` and `print(a + 3)`, using `echo` with `>` for the first line and `>>` for the second. Copy it to `add2.py`. Run both files. Run `add.py` again and save what it prints in `result.txt`, then show `result.txt`. Delete `add2.py` and list the folder.",
     "a": "Each run prints `5`; `cat result.txt` shows `5`; the last `ls` shows `add.py` and `result.txt`. One way: `mkdir lab`, `cd lab`, `echo 'a = 2' > add.py`, `echo 'print(a + 3)' >> add.py`, `cp add.py add2.py`, `python3 add.py`, `python3 add2.py`, `python3 add.py > result.txt`, `cat result.txt`, `rm add2.py`, `ls`.\n<!-- TERM:END -->"
    }
   }
  ]
 },
 {
  "id": "git",
  "name": "Git",
  "code": "GT",
  "regions": [
   {
    "key": "git/A",
    "id": "A",
    "n": "Local snapshots",
    "idea": "a repository is a folder with a history, and a commit is a snapshot you choose to save.",
    "needsText": "",
    "items": [
     {
      "id": "GT-1",
      "t": "Install Git and say who you are",
      "y": "check that Git is installed, and set your name, email and the name of the default branch.",
      "c": "run `git --version`. Then set `user.name`, `user.email` and `init.defaultBranch` (to `main`) with `git config --global`, and read each of the three back with `git config --global <name>`.",
      "a": "the version line starts with \"git version 2.\" (any 2.x works; the checks ran on 2.43.0); each read-back prints exactly what you set; `init.defaultBranch` reads back `main`.",
      "learn": [
       "what Git is: a tool that keeps a history of your files, and it has to be installed before anything else",
       "how to check the install with `git --version`",
       "how to read the version line: it starts with `git version 2.` and any 2.x works",
       "that `git config --global` writes a setting once, for every repository on this computer",
       "the three settings to make first: `user.name`, `user.email` and `init.defaultBranch`",
       "why your name and email matter: Git stamps them on every commit you make",
       "why `init.defaultBranch` is set to `main`: new repositories start on a branch with that name",
       "how to read a setting back with `git config --global <name>`",
       "how the check proves it: each read-back prints exactly what you set"
      ],
      "ab": [
       [
        "read",
        "Read the version line and say the major version is 2"
       ],
       [
        "write",
        "Set your name with `git config --global user.name`"
       ],
       [
        "write",
        "Set your email with `git config --global user.email`"
       ],
       [
        "write",
        "Set the default branch to `main` with `git config --global init.defaultBranch main`"
       ],
       [
        "read",
        "Read each of the three settings back with `git config --global <name>`"
       ],
       [
        "say",
        "Explain why Git needs your name and email before the first commit"
       ],
       [
        "pick",
        "Pick `--global` when a setting should apply to every repository"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: First-Time Git Setup",
        "url": "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup",
        "note": "Chapter 1.6. Name, email and settings."
       }
      ]
     },
     {
      "id": "GT-2",
      "t": "Start a repository and read its status",
      "y": "turn a folder into a repository and read what `git status` says about it.",
      "c": "make an empty folder and run `git init`, then `git status`. Create `notes.txt` with one line in it and run `git status` again. Is there a `.git` folder inside (it is hidden by default)?",
      "a": "`git init` prints \"Initialized empty Git repository\" and the path; the first status says \"On branch main\", \"No commits yet\" and \"nothing to commit\"; the `.git` folder exists; after you create `notes.txt`, status lists it under \"Untracked files\".",
      "learn": [
       "a repository is an ordinary folder plus a hidden `.git` folder that holds the history",
       "`git init` turns the current folder into a repository",
       "what `git init` prints: 'Initialized empty Git repository' and the path",
       "`git status` is the command you will run most: it says where you are and what has changed",
       "what the first status says: 'On branch main', 'No commits yet' and 'nothing to commit'",
       "a new file is untracked: Git can see it but is not recording it yet",
       "after you create `notes.txt`, status lists it under 'Untracked files'",
       "why `.git` is hidden by default, and how to check that it exists",
       "the history lives only in `.git`, so the folder must stay"
      ],
      "ab": [
       [
        "write",
        "Make an empty folder and run `git init` in it"
       ],
       [
        "read",
        "Read the 'Initialized empty Git repository' message and the path"
       ],
       [
        "read",
        "Read the first `git status` and name the branch and the commit state"
       ],
       [
        "write",
        "Create `notes.txt` with one line in it"
       ],
       [
        "predict",
        "Predict that `notes.txt` will show as untracked before you run status"
       ],
       [
        "read",
        "Find the hidden `.git` folder inside the repository"
       ],
       [
        "say",
        "Say what the `.git` folder holds and why it must stay"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Getting a Git Repository",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository",
        "note": "Chapter 2.1. Start a repository or clone one."
       }
      ]
     },
     {
      "id": "GT-3",
      "t": "The three places: folder, staging area, history",
      "y": "say which of the three places a change is in, and move it from one to the next (`git add`, then `git commit`).",
      "c": "in a repository, create `notes.txt` with \"first line\", run `git add notes.txt`, then `git status`. Run `git commit -m \"Add notes\"`, then `git status`. Add a second line to the file and run `git status`. Add and commit that as \"Add second line\".",
      "a": "after `add`, status shows \"Changes to be committed\" with `new file:   notes.txt`; after the commit, \"nothing to commit, working tree clean\"; after the edit, \"Changes not staged for commit\" with `modified:   notes.txt`; the history now holds two commits, newest first: \"Add second line\", then \"Add notes\".",
      "learn": [
       "the three places a change can be: your folder, the staging area, and the history",
       "the folder is where you edit; the staging area is where you choose what goes in the next snapshot; the history is the saved snapshots",
       "`git add notes.txt` moves a change from the folder to the staging area",
       "`git commit -m \"Add notes\"` moves the staged change into the history as a new commit",
       "`-m` gives the commit message on the command line",
       "status after add: 'Changes to be committed' with `new file:   notes.txt`",
       "status after commit: 'nothing to commit, working tree clean'",
       "status after a new edit: 'Changes not staged for commit' with `modified:   notes.txt`",
       "the history is newest first: 'Add second line', then 'Add notes'",
       "why the staging area exists: you pick which changes go into each commit"
      ],
      "ab": [
       [
        "predict",
        "Say which of the three places a change is in before you run status"
       ],
       [
        "write",
        "Stage a file with `git add notes.txt`"
       ],
       [
        "write",
        "Commit it with `git commit -m \"Add notes\"`"
       ],
       [
        "read",
        "Tell `new file` from `modified` in the status output"
       ],
       [
        "read",
        "Tell 'Changes to be committed' from 'Changes not staged for commit'"
       ],
       [
        "write",
        "Edit the file, then add and commit it as 'Add second line'"
       ],
       [
        "say",
        "Explain in one sentence why add and commit are two steps"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Recording Changes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",
        "note": "Chapter 2.2. Status, add, commit, diff, ignore files."
       }
      ]
     },
     {
      "id": "GT-4",
      "t": "Read the history: log and show",
      "y": "list the commits, and look at what one commit changed.",
      "c": "in a repository where `notes.txt` has grown one line per commit (\"line 1\", then \"line 2\", then \"line 3\"; commits \"Add notes\", \"Add second line\", \"Add third line\"), run `git log --oneline` and then `git show HEAD~1`.",
      "a": "three lines, newest first, one per commit, each starting with a short commit id (a 7-character id in a small repository; a large one can need more); `git show HEAD~1` shows the \"Add second line\" commit and its change, including a line that begins `+line 2`.",
      "learn": [
       "`git log --oneline` lists the commits, one line each, newest first",
       "each line starts with a short commit id (7 characters in a small repository; a large one can need more)",
       "the commit message follows the id",
       "`HEAD` means the commit you are on now",
       "`HEAD~1` means one commit before it, `HEAD~2` two before",
       "`git show HEAD~1` shows that one commit: author, date, message and the change",
       "in a change, a line that starts with `+` was added and one that starts with `-` was removed",
       "why the second commit shows a line that begins `+line 2`",
       "log is for the list; show is for the details of one commit"
      ],
      "ab": [
       [
        "read",
        "Read `git log --oneline` and count the commits"
       ],
       [
        "read",
        "Find the short id and the message on each line"
       ],
       [
        "predict",
        "Predict which commit `HEAD~1` points at"
       ],
       [
        "write",
        "Run `git show HEAD~1`"
       ],
       [
        "read",
        "Find the `+line 2` line in the output"
       ],
       [
        "say",
        "Say the difference between `git log` and `git show`"
       ],
       [
        "pick",
        "Pick `HEAD`, `HEAD~1` or `HEAD~2` to point at a given commit"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Viewing the Commit History",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History",
        "note": "Chapter 2.3. Read the log."
       }
      ]
     },
     {
      "id": "GT-5",
      "t": "See what changed: diff",
      "y": "see a change before you commit it, in the folder and in the staging area.",
      "c": "in the repository of GT-4 add \"line 4\" to `notes.txt` and run `git diff`. Run `git add notes.txt`, then `git diff` again, then `git diff --staged`.",
      "a": "the first `git diff` shows a line that begins `+line 4`; after `git add` the plain `git diff` prints nothing, because the change has moved to the staging area; `git diff --staged` now shows the `+line 4` line.",
      "learn": [
       "`git diff` shows changes in the folder that are not staged yet",
       "a line that starts with `+` is a new line and one that starts with `-` is a removed line",
       "after you add 'line 4', `git diff` shows `+line 4`",
       "after `git add notes.txt`, the plain `git diff` prints nothing",
       "why it goes quiet: the change moved from the folder to the staging area",
       "`git diff --staged` shows what is in the staging area, ready for the next commit",
       "run diff before you commit, so you see exactly what you are about to save",
       "empty output from `git diff` does not mean nothing changed: it can mean everything is staged"
      ],
      "ab": [
       [
        "write",
        "Add 'line 4' to `notes.txt` and run `git diff`"
       ],
       [
        "read",
        "Find the `+line 4` line in the diff"
       ],
       [
        "predict",
        "Predict that `git diff` is empty after `git add`"
       ],
       [
        "write",
        "Run `git diff --staged` and find the change there"
       ],
       [
        "say",
        "Explain why plain `git diff` goes quiet after `git add`"
       ],
       [
        "pick",
        "Pick `git diff` or `git diff --staged` to see a given change"
       ],
       [
        "read",
        "Read a diff and say what you are about to commit"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Recording Changes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",
        "note": "Chapter 2.2. Status, add, commit, diff, ignore files."
       }
      ]
     },
     {
      "id": "GT-6",
      "t": "Keep files out: .gitignore",
      "y": "stop Git from listing files you never want in the history, and say what an ignore rule does not do.",
      "c": "in a repository with `main.py` (`print(\"hello\")`) and `data/old.csv` already committed, create `.venv/bin/python` (empty), `data/big.csv` and `__pycache__/m.pyc`. Create `.gitignore` with the three lines `.venv/`, `data/*.csv` and `__pycache__/`. Run `git status --short`, commit `.gitignore`, run `git check-ignore -v data/big.csv`. Then change `data/old.csv` and run `git status --short`. Last, run `git rm --cached data/old.csv`: is the file still on disk?",
      "a": "`git status --short` lists only `?? .gitignore`; after the commit status says \"nothing to commit, working tree clean\"; `check-ignore -v` prints the rule that matched, the one containing `data/*.csv`; the already-committed `data/old.csv` is still tracked despite the rule, so after the change it shows ` M data/old.csv`; `git rm --cached` takes it out of Git's list (`git ls-files`) and leaves the file on disk.",
      "learn": [
       "some files should never be in the history: virtual environments, big data files, cache folders",
       "`.gitignore` is a text file in the repository with one rule per line",
       "`.venv/` ignores a whole folder (the slash at the end means folder)",
       "`data/*.csv` ignores every `.csv` file inside `data`",
       "`__pycache__/` ignores Python's cache folders",
       "after the rules, `git status --short` lists only `?? .gitignore`: the ignored files are gone from the list",
       "`.gitignore` is a normal file: commit it so the rules travel with the repository",
       "`git check-ignore -v data/big.csv` prints the rule that matched, so you can debug a rule",
       "an ignore rule does not touch files that are already tracked: `data/old.csv` stays tracked",
       "`git rm --cached` stops tracking a file but keeps it in the folder"
      ],
      "ab": [
       [
        "write",
        "Create a `.gitignore` with the three rules"
       ],
       [
        "read",
        "Read `git status --short` and see only `?? .gitignore`"
       ],
       [
        "write",
        "Commit `.gitignore`"
       ],
       [
        "read",
        "Use `git check-ignore -v` to find the rule that matched a file"
       ],
       [
        "predict",
        "Predict that an already committed file stays tracked despite a rule"
       ],
       [
        "fix",
        "Stop tracking a committed file with `git rm --cached` and keep it on disk"
       ],
       [
        "say",
        "Say what an ignore rule does not do"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Recording Changes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository",
        "note": "Chapter 2.2. Status, add, commit, diff, ignore files."
       }
      ]
     }
    ],
    "task": {
     "t": "The first four commits of a tiny project",
     "u": "init, add, commit, status, log, .gitignore",
     "k": "in a new folder, make `main.py` with `print(\"hello\")` and commit it as \"Add main.py\". Change it to `print(sum(range(1, 11)))`, run it, and commit as \"Print the sum of 1 to 10\". Add `README.md` containing `# mini` and commit as \"Add README\". Create `data/x.csv`, then a `.gitignore` with the lines `__pycache__/` and `data/*.csv`, and commit it as \"Add .gitignore\". End with `git status`, `git log --oneline` and `git ls-files`.",
     "a": "`python main.py` prints hello after the first commit and 55 after the second; the log, newest first, reads \"Add .gitignore\", \"Add README\", \"Print the sum of 1 to 10\", \"Add main.py\"; status says \"nothing to commit, working tree clean\"; `git ls-files` lists exactly three files: `.gitignore`, `README.md` and `main.py` (`data/x.csv` is ignored)."
    }
   },
   {
    "key": "git/B",
    "id": "B",
    "n": "Undoing your own mistakes",
    "idea": "how to undo, chosen by how far the mistake has gone (folder, staging area, last commit, an older commit).",
    "needsText": "",
    "items": [
     {
      "id": "GT-7",
      "t": "Throw away a change in the folder: restore",
      "y": "bring a file back to its last committed text. (This discards the change for good: Git has no copy of an uncommitted edit.)",
      "c": "in a repository with `main.py` committed as `print(\"hello\")`, ruin the file by deleting the closing bracket. Run `python main.py`. Then run `git restore main.py`, run the file again and run `git status`.",
      "a": "the ruined file fails (a SyntaxError and no \"hello\"); after the restore it prints hello and status says \"nothing to commit, working tree clean\".",
      "learn": [
       "`git restore main.py` brings a file back to its last committed text",
       "it throws the change away for good: Git has no copy of an edit you never committed",
       "before the restore, a deleted closing bracket gives a SyntaxError and no 'hello'",
       "`python main.py` shows the break",
       "after the restore, the file prints hello again",
       "`git status` then says 'nothing to commit, working tree clean'",
       "restore works on the folder; a change you already staged is undone in the next item",
       "check status first so you know which file you are about to throw away",
       "the safe habit: commit often, because only committed work can come back"
      ],
      "ab": [
       [
        "write",
        "Break `main.py` on purpose by deleting the closing bracket"
       ],
       [
        "read",
        "Read the SyntaxError from `python main.py`"
       ],
       [
        "write",
        "Run `git restore main.py`"
       ],
       [
        "predict",
        "Predict that the file prints hello again after the restore"
       ],
       [
        "read",
        "Read `git status` and confirm 'working tree clean'"
       ],
       [
        "say",
        "Say why a thrown-away edit cannot be brought back"
       ],
       [
        "pick",
        "Pick restore (throw away) or commit (keep) for an edit you are unsure about"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Undoing Things",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things",
        "note": "Chapter 2.4. Restore, unstage, amend."
       }
      ]
     },
     {
      "id": "GT-8",
      "t": "Take a file out of the staging area",
      "y": "undo a `git add` without touching the file.",
      "c": "create `secret.txt` containing \"pw\", run `git add secret.txt` and `git status`. Then run `git restore --staged secret.txt` and `git status` again. Is the file still there?",
      "a": "the first status lists `new file:   secret.txt` under \"Changes to be committed\"; after the restore it is under \"Untracked files\" again, and the file is still in the folder.",
      "learn": [
       "`git add` puts a change in the staging area; it does not lock it in",
       "`git restore --staged secret.txt` takes a file back out of the staging area",
       "the file itself is untouched and stays in the folder",
       "before: status lists `new file:   secret.txt` under 'Changes to be committed'",
       "after: the file is under 'Untracked files' again",
       "why you would do this: you staged something by mistake, such as a file with a password in it",
       "unstaging is not deleting: check the file is still there",
       "two restores: plain `git restore` changes the file, `--staged` only changes the staging area"
      ],
      "ab": [
       [
        "write",
        "Create `secret.txt`, add it and read the status"
       ],
       [
        "write",
        "Run `git restore --staged secret.txt`"
       ],
       [
        "read",
        "Find the file under 'Untracked files' again"
       ],
       [
        "predict",
        "Predict that the file is still in the folder"
       ],
       [
        "say",
        "Say the difference between `git restore` and `git restore --staged`"
       ],
       [
        "pick",
        "Pick the command that undoes a mistaken `git add`"
       ],
       [
        "fix",
        "Fix a mistaken `git add` before it reaches a commit"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Undoing Things",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things",
        "note": "Chapter 2.4. Restore, unstage, amend."
       }
      ]
     },
     {
      "id": "GT-9",
      "t": "Fix the last commit: amend",
      "y": "change the message of the last commit, or add a forgotten file to it, without adding a new commit. (Only do this to a commit you have not shared: amend replaces the commit. That rule is a rule of thumb from me, not something a script ran.)",
      "c": "in a repository with `main.py` committed (\"Add main.py\"), commit `notes.txt` with the typo message \"Ad notes\". Create `todo.txt` and `git add` it. Run `git commit --amend -m \"Add notes\"`, then `git log --oneline` and `git show --stat HEAD`.",
      "a": "the number of commits did not go up; the log reads \"Add notes\", then \"Add main.py\"; the last commit contains both `notes.txt` and `todo.txt`.",
      "learn": [
       "`git commit --amend` replaces the last commit instead of adding a new one",
       "`git commit --amend -m \"Add notes\"` gives the last commit a new message, which fixes the typo 'Ad notes'",
       "a forgotten file can be staged first with `git add todo.txt`, and then amend puts it in the same commit",
       "the number of commits does not go up",
       "the log reads 'Add notes', then 'Add main.py'",
       "`git show --stat HEAD` lists the files in the last commit: `notes.txt` and `todo.txt`",
       "amend replaces the commit, so use it only on a commit you have not shared",
       "that rule is a rule of thumb, not something a script ran"
      ],
      "ab": [
       [
        "write",
        "Commit with a typo message, then fix it with `git commit --amend -m`"
       ],
       [
        "write",
        "Stage a forgotten file and fold it into the last commit with amend"
       ],
       [
        "read",
        "Count the commits and see that the number did not go up"
       ],
       [
        "read",
        "Read `git log --oneline` for the corrected message"
       ],
       [
        "read",
        "Read `git show --stat HEAD` and see both files in the last commit"
       ],
       [
        "say",
        "Say why amend is only for commits you have not shared"
       ],
       [
        "fix",
        "Fix a typo message and a missing file without a new commit"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Undoing Things",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things",
        "note": "Chapter 2.4. Restore, unstage, amend."
       }
      ]
     },
     {
      "id": "GT-10",
      "t": "Undo an older commit by adding a new one: revert",
      "y": "undo a commit that is already in the history, keeping the history honest.",
      "c": "in the repository of GT-9 note what `main.py` says. Delete its closing bracket and commit that as \"Break main.py\". Run `git revert --no-edit HEAD`. Compare `main.py` with what you noted, and look at the log. (`--no-edit` stops Git opening an editor for the message.)",
      "a": "the commit count goes up by exactly one; `main.py` has its earlier text back; the newest message is `Revert \"Break main.py\"` and \"Break main.py\" is still in the history.",
      "learn": [
       "`git revert` undoes an older commit by adding a new commit that does the opposite",
       "the history stays honest: the bad commit is still there, followed by its undo",
       "`--no-edit` stops Git from opening an editor for the message",
       "the newest message becomes `Revert \"Break main.py\"`",
       "the commit count goes up by exactly one",
       "`main.py` gets its earlier text back",
       "revert is for commits already in the history; amend is only for the last commit",
       "how to prove it: compare the file with the text you noted before you broke it"
      ],
      "ab": [
       [
        "write",
        "Note what `main.py` says, then break it and commit as 'Break main.py'"
       ],
       [
        "write",
        "Undo it with `git revert --no-edit HEAD`"
       ],
       [
        "read",
        "Compare `main.py` with the text you noted"
       ],
       [
        "read",
        "Read the log and find the new Revert commit"
       ],
       [
        "predict",
        "Predict that the commit count goes up by one"
       ],
       [
        "say",
        "Say why revert keeps the history honest"
       ],
       [
        "pick",
        "Pick revert, amend or restore for a given mistake"
       ]
      ]
     }
    ],
    "task": {
     "t": "Four mistakes, four rescues",
     "u": "restore, restore --staged, amend, revert",
     "k": "start with `main.py` (`print(\"hello\")`, commit \"Add main.py\") and `README.md` (`# Rescue`, commit \"Add README\"). Then make four mistakes and undo each with the right command: (1) ruin `main.py` in the folder and bring it back without any commit; (2) `git add` a file `junk.tmp` by mistake and take it out of the staging area; (3) change the README to `# Rescue kit` and commit it with the typo \"Updte readme\", then correct the message; (4) commit a broken `main.py` as \"Break main.py\" and undo that commit with a new one.",
     "a": "five commits, newest first: `Revert \"Break main.py\"`, \"Break main.py\", \"Update readme\", \"Add README\", \"Add main.py\"; `git status --short` shows only `?? junk.tmp`, and `python main.py` prints hello."
    }
   },
   {
    "key": "git/C",
    "id": "C",
    "n": "Branches",
    "idea": "a branch is a movable name for a line of commits, and a merge joins two lines.",
    "needsText": "",
    "items": [
     {
      "id": "GT-11",
      "t": "Make a branch and switch between branches",
      "y": "create a branch, commit on it, and move between branches, seeing your folder change to match.",
      "c": "in a repository with `a.txt` (\"one\") committed as \"Add a.txt\", run `git switch -c feature`. Make `a.txt` two lines (\"one\", \"two\") and commit as \"Add line two\". Run `git switch main` and look at `a.txt` and the log. Run `git switch feature` and `git branch --list`.",
      "a": "on `main` the history is only \"Add a.txt\" and `a.txt` has one line; on `feature` the history has \"Add line two\" on top; the list shows both `main` and `feature`, with a star on the current one.",
      "learn": [
       "a branch is a movable name for a line of commits",
       "`git switch -c feature` creates a branch called `feature` and moves you onto it",
       "commits you make go onto the branch you are on",
       "`git switch main` moves you back, and your folder changes to match",
       "on `main`, `a.txt` has one line; on `feature` it has two",
       "`git branch --list` shows all branches, with a star on the current one",
       "the history on `main` is only 'Add a.txt'; `feature` has 'Add line two' on top",
       "the star shows where your next commit will go"
      ],
      "ab": [
       [
        "write",
        "Create a branch with `git switch -c feature`"
       ],
       [
        "write",
        "Commit a change on the new branch"
       ],
       [
        "write",
        "Switch back with `git switch main` and watch the file change"
       ],
       [
        "read",
        "Read the log on each branch and compare them"
       ],
       [
        "read",
        "Read `git branch --list` and find the star"
       ],
       [
        "predict",
        "Predict what `a.txt` looks like on each branch"
       ],
       [
        "say",
        "Say what a branch is in your own words"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Branches in a Nutshell",
        "url": "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
        "note": "Chapter 3.1. What a branch is, switching."
       }
      ]
     },
     {
      "id": "GT-12",
      "t": "Merge when nothing diverged: fast-forward",
      "y": "bring a branch's commits into `main` when `main` has not moved, and say what Git did.",
      "c": "continue from GT-11: on `main`, run `git merge feature`, then look at the log.",
      "a": "the output says \"Fast-forward\"; `main` now has the commit \"Add line two\", so two commits, and no new commit was made (Git only moved the name `main` up, so the latest commit still has one parent).",
      "learn": [
       "`git merge feature` brings the commits of `feature` into the branch you are on",
       "run it while you are on `main`",
       "if `main` has not moved since the branch was made, nothing has diverged",
       "Git then only moves the name `main` up, and the output says 'Fast-forward'",
       "no new commit is made: the latest commit still has one parent",
       "`main` now has 'Add line two', so it holds two commits",
       "how to check it: look at the log after the merge"
      ],
      "ab": [
       [
        "write",
        "Run `git merge feature` while on `main`"
       ],
       [
        "read",
        "Find the word 'Fast-forward' in the output"
       ],
       [
        "read",
        "Read the log and count the commits on `main`"
       ],
       [
        "predict",
        "Predict that no merge commit will appear"
       ],
       [
        "say",
        "Say what Git did when it fast-forwarded"
       ],
       [
        "pick",
        "Tell a fast-forward merge from one that needs a new commit"
       ]
      ]
     },
     {
      "id": "GT-13",
      "t": "Merge when both sides changed: the merge commit",
      "y": "merge two branches that each have their own new commits, and read the shape in the graph.",
      "c": "in a repository with `a.txt` committed, create branch `b1` and commit `b1.txt` there (\"Add b1.txt\"). Go back to `main` and commit `m.txt` (\"Add m.txt\"). Run `git merge --no-edit b1`, then `git log --graph --oneline`.",
      "a": "Git makes a new merge commit with two parents; the graph shows two lines of commits joining again (a diamond), and the top commit's message starts \"Merge branch\".",
      "learn": [
       "sometimes both branches have new commits: they have diverged",
       "here `b1` adds `b1.txt` and `main` adds `m.txt`",
       "`git merge --no-edit b1` joins them (`--no-edit` skips the message editor)",
       "Git makes a new merge commit with two parents",
       "its message starts 'Merge branch'",
       "`git log --graph --oneline` draws the commits as lines",
       "the graph shows a diamond: two lines of commits that join again",
       "a fast-forward is not possible here, because `main` moved too"
      ],
      "ab": [
       [
        "write",
        "Make `b1.txt` on branch `b1` and `m.txt` on `main`, each in its own commit"
       ],
       [
        "write",
        "Merge with `git merge --no-edit b1`"
       ],
       [
        "read",
        "Read `git log --graph --oneline` and find the diamond"
       ],
       [
        "read",
        "Find the message that starts 'Merge branch'"
       ],
       [
        "predict",
        "Predict that the merge makes a commit with two parents"
       ],
       [
        "say",
        "Say why this merge could not be a fast-forward"
       ]
      ]
     },
     {
      "id": "GT-14",
      "t": "Merge conflict",
      "y": "read the markers Git puts in a file, decide the final text, and finish the merge.",
      "c": "commit `greeting.txt` containing \"hello\". On a branch `feature` change it to \"hey\" and commit (\"Say hey\"); on `main` change it to \"hi\" and commit (\"Say hi\"). Run `git merge feature`. Open the file. Make it say \"hi there\", then `git add greeting.txt` and `git commit --no-edit`. Search the folder for leftover marker lines.",
      "a": "the merge stops with \"CONFLICT (content): Merge conflict in greeting.txt\"; the file holds three kinds of marker line, starting with `<<<<<<<`, `=======` and `>>>>>>>`; after you finish, no marker is left anywhere, status says \"nothing to commit, working tree clean\", and the last commit has two parents.",
      "learn": [
       "a conflict happens when both branches changed the same lines",
       "here `main` says 'hi' and `feature` says 'hey' in `greeting.txt`",
       "the merge stops with 'CONFLICT (content): Merge conflict in greeting.txt'",
       "Git writes marker lines into the file: `<<<<<<<`, `=======` and `>>>>>>>`",
       "between the markers Git shows both versions, so you can see what each side wrote",
       "you decide the final text (here 'hi there') and delete every marker line",
       "`git add greeting.txt` then `git commit --no-edit` finish the merge",
       "search the folder for leftover markers: none may be left",
       "the finished merge commit has two parents and status says 'nothing to commit, working tree clean'"
      ],
      "ab": [
       [
        "write",
        "Change the same line on two branches and run the merge"
       ],
       [
        "read",
        "Read the CONFLICT message and name the file"
       ],
       [
        "read",
        "Find the three kinds of marker line in the file"
       ],
       [
        "fix",
        "Edit the file to the final text and remove every marker"
       ],
       [
        "write",
        "Finish with `git add greeting.txt` and `git commit --no-edit`"
       ],
       [
        "read",
        "Search the folder to prove no marker is left"
       ],
       [
        "say",
        "Say why Git cannot choose between 'hi' and 'hey' itself"
       ]
      ]
     },
     {
      "id": "GT-15",
      "t": "Tidy up branches",
      "y": "list which branches are already merged and delete them, and understand why Git refuses to delete one that is not.",
      "c": "in a repository with `a.txt` committed: branch `feature`, commit `f.txt` (\"Add f.txt\"), merge it into `main`. Then create a branch `idea`, commit `i.txt` there (\"Add i.txt\") and return to `main`. Run `git branch --merged`, then `git branch -d feature`, then `git branch -d idea`.",
      "a": "the merged list contains `feature` and not `idea`; the first delete prints \"Deleted branch feature\"; the second is refused with \"is not fully merged\" (the commit on `idea` exists nowhere else, so Git protects it).",
      "learn": [
       "merged branches clutter the list, so delete them when you are done",
       "`git branch --merged` lists the branches whose commits are already in the current branch",
       "`git branch -d feature` deletes a merged branch and prints 'Deleted branch feature'",
       "`git branch -d idea` is refused with 'is not fully merged'",
       "why: the commit on `idea` exists nowhere else, so Git protects it",
       "`-d` is the safe delete: it refuses when work would be lost",
       "`feature` appears in the merged list and `idea` does not"
      ],
      "ab": [
       [
        "write",
        "Run `git branch --merged` and read the list"
       ],
       [
        "write",
        "Delete a merged branch with `git branch -d feature`"
       ],
       [
        "read",
        "Read the 'is not fully merged' refusal"
       ],
       [
        "predict",
        "Predict which branch Git will refuse to delete"
       ],
       [
        "say",
        "Say why Git protects the commit on `idea`"
       ],
       [
        "pick",
        "Pick which branches are safe to delete"
       ]
      ]
     }
    ],
    "task": {
     "t": "Edit a story on two branches",
     "u": "branches, fast-forward, conflict, tidy up",
     "k": "commit `story.txt` with three lines, \"Chapter 1\", \"Chapter 2\", \"Chapter 3\" (\"Add story\"). On branch `edit-1` change line 1 to \"Chapter 1: Beginnings\" (\"Retitle chapter 1\") and merge it into `main`. From `main` make branch `edit-3` and change line 3 to \"Chapter 3: Endings\" (\"Retitle chapter 3\"). Back on `main` change line 3 to \"Chapter 3: The End\" (\"Rename chapter 3\"). Merge `edit-3`, settle the conflict by keeping \"Chapter 3: Endings\", and delete both edit branches.",
     "a": "the first merge says \"Fast-forward\"; the second stops with a conflict; the final `story.txt` reads \"Chapter 1: Beginnings\", \"Chapter 2\", \"Chapter 3: Endings\"; the history has five commits and the latest is a merge commit; `git branch` lists only `main`; status says \"nothing to commit, working tree clean\"."
    }
   },
   {
    "key": "git/D",
    "id": "D",
    "n": "Working with a shared copy",
    "idea": "a remote is a shared copy of the repository: you clone it, push commits to it, pull new ones from it and read why a push is refused.",
    "needsText": "",
    "items": [
     {
      "id": "GT-16",
      "t": "Clone",
      "y": "copy a repository with its whole history, and say where the copy came from.",
      "c": "make a repository `demo` with two commits (\"Add a.txt\", \"Add line two\"). Run `git clone demo demo-copy`. In `demo-copy` run `git log --oneline` and `git remote -v`.",
      "a": "the copy has the same two commits in the same order; `git remote -v` lists `origin`, pointing at the folder `demo`.",
      "learn": [
       "`git clone demo demo-copy` copies a repository together with its whole history",
       "the copy has the same commits in the same order",
       "inside the copy, `git log --oneline` shows them",
       "`git log --oneline` lists the newest commit first: `Add line two` is on top and `Add a.txt` is below it",
       "`git remote -v` lists the remotes of the copy",
       "`git remote -v` shows `origin` twice, once marked `(fetch)` and once marked `(push)`",
       "a clone sets up `origin`, pointing at where it came from (here the folder `demo`)",
       "a remote is just another copy of the repository that you can send to or fetch from"
      ],
      "ab": [
       [
        "write",
        "Clone a repository with `git clone demo demo-copy`"
       ],
       [
        "read",
        "Compare `git log --oneline` in both copies"
       ],
       [
        "read",
        "Read `git remote -v` and find `origin`"
       ],
       [
        "predict",
        "Predict that both copies have the same two commits"
       ],
       [
        "say",
        "Say what `origin` points at after a clone"
       ],
       [
        "say",
        "Say what a remote is"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Getting a Git Repository",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository",
        "note": "Chapter 2.1. Start a repository or clone one."
       }
      ]
     },
     {
      "id": "GT-17",
      "t": "Push to a remote",
      "y": "send your commits to a remote and see that both sides agree.",
      "c": "make the empty shared copy with `git init --bare remote.git`. In `demo` run `git remote add origin <the path to remote.git>` and `git push -u origin main`. Count the commits on each side (`git rev-list --count HEAD` in `demo`, `git rev-list --count main` in `remote.git`). Run `git status` in `demo`.",
      "a": "both counts are 2; status says \"Your branch is up to date with 'origin/main'.\"",
      "learn": [
       "a remote is a shared copy; `git init --bare remote.git` makes an empty one with no working folder",
       "`git remote add origin <path>` gives the remote the name `origin`",
       "`git push -u origin main` sends your commits and remembers the link (`-u`)",
       "count the commits on each side with `git rev-list --count HEAD` and `git rev-list --count main`",
       "both counts are 2: the two sides agree",
       "before the push, `git status` has no 'up to date' line, because `main` is not linked to a remote yet",
       "`git status` then says 'Your branch is up to date with 'origin/main''"
      ],
      "ab": [
       [
        "write",
        "Make the shared copy with `git init --bare remote.git`"
       ],
       [
        "write",
        "Add it with `git remote add origin <path>`"
       ],
       [
        "write",
        "Send your commits with `git push -u origin main`"
       ],
       [
        "read",
        "Compare the commit counts on both sides"
       ],
       [
        "read",
        "Read the 'up to date with origin/main' line in status"
       ],
       [
        "say",
        "Say what `-u` does on the first push"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Working with Remotes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes",
        "note": "Chapter 2.5. Push, fetch and pull."
       }
      ]
     },
     {
      "id": "GT-18",
      "t": "Fetch and pull",
      "y": "see that the remote has something new before you take it, and then take it.",
      "c": "with an empty `remote.git`, clone it as `A`. In `A` commit `plan.txt` (\"Add plan\"; lines \"Plan\", \"Budget: 100\", \"Owner: team\") and run `git push -u origin main`. Now clone `remote.git` again as `B`. In `A` commit `a2.txt` (\"Add a2\") and push. In `B` run `git fetch` and `git status`, then `git pull` and `git status`.",
      "a": "after the fetch, `B`'s status says \"Your branch is behind 'origin/main' by 1 commit\" and \"Add a2\" is not in `B`'s log yet; after the pull it is, and status says up to date.",
      "learn": [
       "two people, A and B, each have a clone of the same remote",
       "A commits `a2.txt` and pushes",
       "`git fetch` in B downloads the new commits but does not change B's files or branch",
       "B's status then says 'Your branch is behind 'origin/main' by 1 commit'",
       "'Add a2' is not in B's log yet",
       "`git pull` then takes the commits in: the log shows 'Add a2' and status says up to date",
       "fetch is look first; pull is fetch plus bring the commits in"
      ],
      "ab": [
       [
        "write",
        "Clone the remote twice, as `A` and as `B`"
       ],
       [
        "write",
        "Commit and push in `A`"
       ],
       [
        "write",
        "Run `git fetch` in `B`"
       ],
       [
        "read",
        "Read the 'behind by 1 commit' line in `B`'s status"
       ],
       [
        "write",
        "Run `git pull` in `B`"
       ],
       [
        "say",
        "Say the difference between fetch and pull"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Working with Remotes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes",
        "note": "Chapter 2.5. Push, fetch and pull."
       }
      ]
     },
     {
      "id": "GT-19",
      "t": "A rejected push",
      "y": "read why a push was refused, and fix it by bringing the other side's commits in first.",
      "c": "with `A` and `B` in sync (GT-18), commit `fromA.txt` in `A` (\"Add fromA\") and push. In `B`, without pulling, commit `fromB.txt` (\"Add fromB\") and run `git push`. Then run a plain `git pull`. Then run `git pull --no-rebase --no-edit`, then `git push`, and finally `git pull --no-rebase --no-edit` in `A`.",
      "a": "the push from `B` is refused: the output has \"! [rejected]\" and \"fetch first\"; on Git 2.43.0 with no settings the plain `git pull` stops with \"Need to specify how to reconcile divergent branches\" (newer or configured Git may behave differently); the pull with `--no-rebase` merges and makes a commit with two parents; then the push goes through, and `A`, `B` and `remote.git` all show the same history.",
      "learn": [
       "B commits without pulling while A has already pushed, so the two histories diverge",
       "`git push` from B is refused: the output has '! [rejected]' and 'fetch first'",
       "Git refuses so it never overwrites A's commits",
       "on Git 2.43.0 with no settings, a plain `git pull` stops with 'Need to specify how to reconcile divergent branches' (other versions may differ)",
       "`git pull --no-rebase --no-edit` merges the two and makes a commit",
       "after that, `git push` works",
       "A pulls to get B's commit, and both sides agree again",
       "the fix is always the same: bring their commits in first, then push"
      ],
      "ab": [
       [
        "write",
        "Make `A` and `B` push different commits, so `B`'s push is refused"
       ],
       [
        "read",
        "Read '! [rejected]' and 'fetch first' in the output"
       ],
       [
        "read",
        "Read why the plain `git pull` stops"
       ],
       [
        "fix",
        "Fix it with `git pull --no-rebase --no-edit`, then `git push`"
       ],
       [
        "write",
        "Pull in `A` so both sides agree again"
       ],
       [
        "say",
        "Say why Git refuses to overwrite the other side's commits"
       ]
      ]
     },
     {
      "id": "GT-20",
      "t": "Push a branch and pick it up",
      "y": "publish a branch and fetch someone else's branch.",
      "c": "in `A` run `git switch -c feat`, commit `feat.txt` (\"Add feat\") and `git push -u origin feat`. In `B` run `git fetch`, then `git branch -r`, and look for `feat.txt` in `B`'s folder. Then run `git switch feat` in `B`.",
      "a": "`B`'s remote list shows `origin/feat`, and `feat.txt` is not in `B`'s folder yet; after `git switch feat` there is a local `feat` branch whose history includes \"Add feat\", and `feat.txt` is in the folder.",
      "learn": [
       "`git switch -c feat` makes a branch and `feat.txt` is committed on it",
       "`git push -u origin feat` publishes the branch to the remote",
       "in B, `git fetch` downloads it, and `git branch -r` lists remote branches such as `origin/feat`",
       "fetching does not put `feat.txt` in B's folder yet",
       "`git switch feat` in B makes a local `feat` branch whose history includes 'Add feat'",
       "then `feat.txt` is in the folder",
       "a remote branch is only a pointer to the other side; a local branch is yours to work on"
      ],
      "ab": [
       [
        "write",
        "Push a new branch with `git push -u origin feat`"
       ],
       [
        "write",
        "Run `git fetch` in the other copy"
       ],
       [
        "read",
        "Find `origin/feat` in `git branch -r`"
       ],
       [
        "predict",
        "Predict that `feat.txt` is not in the folder yet"
       ],
       [
        "write",
        "Run `git switch feat` and see the file appear"
       ],
       [
        "say",
        "Say the difference between a remote branch and a local branch"
       ]
      ],
      "src": [
       {
        "title": "Pro Git: Working with Remotes",
        "url": "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes",
        "note": "Chapter 2.5. Push, fetch and pull."
       }
      ]
     }
    ],
    "task": {
     "t": "Two clones, one remote, one conflict",
     "u": "clone, push, fetch and pull, a rejected push, a conflict",
     "k": "make an empty `remote.git`. `A` clones it, commits `plan.txt` (lines \"Plan\", \"Budget: 100\", \"Owner: team\") as \"Add plan\" and pushes; then `B` clones it. `A` changes the budget line to 120 (\"Raise budget\") and pushes. `B` changes the same line to 90 (\"Cut budget\") and tries to push. Then `B` runs `git pull --no-rebase --no-edit`, settles the conflict by writing \"Budget: 105\", commits and pushes; `A` pulls.",
     "a": "`B`'s push shows \"! [rejected]\"; `B`'s pull stops with \"CONFLICT (content): Merge conflict in plan.txt\"; at the end `A`, `B` and `remote.git` have the same history of four commits, and `plan.txt` reads \"Plan\", \"Budget: 105\", \"Owner: team\" in both clones."
    }
   }
  ]
 },
 {
  "id": "la",
  "name": "Linear algebra",
  "code": "LA",
  "regions": [
   {
    "key": "la/A",
    "id": "A",
    "n": "Vectors as points and arrows",
    "idea": "a vector is a list of numbers that you can add, scale and measure.",
    "needsText": "",
    "items": [
     {
      "id": "LA-1",
      "t": "A vector is a list of numbers",
      "y": "write a point, or the arrow between two points, as a list of numbers and say how many numbers it has (its dimension).",
      "c": "P = (1, 2) and Q = (4, 6). Write the vector from P to Q and the vector from Q to P. What is the dimension of (2, 0, -1, 5)?",
      "a": "the vector from P to Q is (3, 4); from Q to P it is (-3, -4); the dimension of (2, 0, -1, 5) is 4.",
      "learn": [
       "a vector is a list of numbers, and it can stand for a point or an arrow",
       "the vector from P to Q is Q minus P, entry by entry",
       "with P = (1, 2) and Q = (4, 6) the vector from P to Q is (3, 4)",
       "the vector from Q to P is (-3, -4): the same numbers with the signs flipped",
       "the dimension is how many numbers the list has",
       "(2, 0, -1, 5) has dimension 4",
       "order matters: (3, 4) and (4, 3) are different vectors",
       "how the check proves it: write both vectors and the dimension"
      ],
      "ab": [
       [
        "write",
        "Write the vector from one point to another by subtracting"
       ],
       [
        "write",
        "Write the reverse vector and flip every sign"
       ],
       [
        "say",
        "Say how many numbers a vector has"
       ],
       [
        "read",
        "Read a list like (2, 0, -1, 5) and give its dimension"
       ],
       [
        "predict",
        "Predict the signs of the vector before you subtract"
       ],
       [
        "pick",
        "Pick which way an arrow points from the order of its two points"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-2",
      "t": "Adding vectors and multiplying by a number",
      "y": "add two vectors, scale one, and combine the two.",
      "c": "a = (2, -1, 3) and b = (0, 4, -2). Compute a + b, 3a and 2a - b by hand.",
      "a": "a + b = (2, 3, 1); 3a = (6, -3, 9); 2a - b = (4, -6, 8).",
      "learn": [
       "adding two vectors adds matching entries: a + b = (2, 3, 1)",
       "both vectors must have the same number of entries",
       "multiplying by a number multiplies every entry: 3a = (6, -3, 9)",
       "subtracting is adding with a minus: take away b entry by entry",
       "combining: 2a - b = (4, -6, 8), so scale first, then subtract",
       "work entry by entry and check each position",
       "negative entries need care: -1 times 3 and 4 minus 4 are where slips happen"
      ],
      "ab": [
       [
        "write",
        "Add two vectors entry by entry"
       ],
       [
        "write",
        "Multiply a vector by a number"
       ],
       [
        "write",
        "Compute a combination like 2a - b"
       ],
       [
        "read",
        "Check each position of the answer against the two inputs"
       ],
       [
        "predict",
        "Predict the length of the result before you compute"
       ],
       [
        "fix",
        "Find a sign slip in a worked vector sum"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-3",
      "t": "Length of a vector and unit vectors",
      "y": "compute a vector's length, scale it to length 1, and say why lengths do not add.",
      "c": "find the length of (3, 4) and of (1, 2, 2). Divide (1, 2, 2) by its length. Then take a = (1, 0) and b = (0, 1) and compare the length of a + b with the length of a plus the length of b.",
      "a": "the lengths are 5 and 3; the unit vector is (1/3, 2/3, 2/3); the length of a + b is 1.414, which is less than 2, so lengths do not add.",
      "learn": [
       "the length of (3, 4) is 5: square each entry, add them, take the square root",
       "the length of (1, 2, 2) is 3",
       "a unit vector has length 1",
       "divide a vector by its length to make a unit vector: (1/3, 2/3, 2/3)",
       "a unit vector keeps the direction and drops the size",
       "lengths do not add: for a = (1, 0) and b = (0, 1), the length of a + b is 1.414, not 2",
       "the length of a sum is less than the sum of the lengths here, because the arrows point different ways"
      ],
      "ab": [
       [
        "write",
        "Compute the length of a vector with a square root"
       ],
       [
        "write",
        "Divide a vector by its length to get a unit vector"
       ],
       [
        "read",
        "Check that the unit vector has length 1"
       ],
       [
        "predict",
        "Predict that a + b is shorter than the two lengths added"
       ],
       [
        "say",
        "Say why lengths do not add"
       ],
       [
        "say",
        "Say what a unit vector keeps and what it drops"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-4",
      "t": "Distance between two vectors",
      "y": "compute how far apart two points are as the length of their difference.",
      "c": "A = (1, 2, 3), B = (4, 6, 3), C = (2, 2, 5). Which of B and C is closer to A, and by how much? On a number line, what is the distance between 3 and -2?",
      "a": "the distance A to B is 5; the distance A to C is 2.236 (C is closer); the distance between 3 and -2 is 5.",
      "learn": [
       "the distance between two points is the length of their difference",
       "the length: square each number of the difference, add them and take the square root, as in 9 + 16 + 0 = 25, root 5",
       "A = (1, 2, 3) and B = (4, 6, 3): the difference is (3, 4, 0) and the distance is 5",
       "A to C = (2, 2, 5): the difference is (1, 0, 2) and the distance is 2.236",
       "so C is closer to A than B is",
       "on a number line the distance between 3 and -2 is 5: the same idea in one dimension",
       "which way you subtract does not matter: the length is the same"
      ],
      "ab": [
       [
        "write",
        "Subtract two points to get their difference vector"
       ],
       [
        "write",
        "Take the length of the difference to get the distance"
       ],
       [
        "pick",
        "Pick which of two points is closer to a third"
       ],
       [
        "say",
        "Say how far apart 3 and -2 are on a number line"
       ],
       [
        "predict",
        "Predict which point is closer before you compute"
       ],
       [
        "say",
        "Say why the order of the subtraction does not matter"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "The nearest house",
     "u": "vector as a list of numbers, subtraction, length, distance",
     "k": "four houses are described by (size in square metres, rooms): H1 = (50, 1), H2 = (52, 3), H3 = (80, 2), H4 = (55, 2). A buyer wants (53, 2). Compute the distance from the buyer's vector to each house and list the houses nearest first. Then say in one sentence why H3 is far away although it has the buyer's number of rooms.",
     "a": "H1 3.162, H2 1.414, H3 27, H4 2. Nearest first: H2, H4, H1, H3. (H3 has the same room count, so its whole distance is the size gap of 27: one feature on a large scale decides the result.)"
    }
   },
   {
    "key": "la/B",
    "id": "B",
    "n": "The dot product",
    "idea": "multiply matching entries and add; what that single number measures.",
    "needsText": "",
    "items": [
     {
      "id": "LA-5",
      "t": "Computing a dot product",
      "y": "compute a\u00b7b for two vectors by hand and with NumPy (`a @ b`).",
      "c": "a = (1, 2, 3) and b = (4, -5, 6). Compute a\u00b7b and a\u00b7a.",
      "a": "a\u00b7b = 12 and a\u00b7a = 14 (a\u00b7a is the squared length of a).",
      "learn": [
       "the dot product multiplies matching entries and adds them up",
       "a = (1, 2, 3) and b = (4, -5, 6): 4 - 10 + 18 = 12",
       "a\u00b7a = 14, which is the squared length of a",
       "the result is one number, not a vector",
       "in NumPy it is `a @ b`",
       "both vectors must have the same number of entries",
       "check by hand first and then with `a @ b`"
      ],
      "ab": [
       [
        "write",
        "Compute a dot product by hand"
       ],
       [
        "write",
        "Compute the same thing with `a @ b`"
       ],
       [
        "read",
        "Check that a\u00b7a gives the squared length"
       ],
       [
        "predict",
        "Predict the sign of the answer from the entries"
       ],
       [
        "say",
        "Say that a dot product is one number"
       ],
       [
        "fix",
        "Find the entry you paired wrongly in a bad dot product"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-6",
      "t": "What the sign of a dot product tells you",
      "y": "read a dot product's sign as \"along\", \"at a right angle\" or \"against\", and use a zero dot product to test for a right angle.",
      "c": "u = (1, 0). Compute u\u00b7(2, 3), u\u00b7(0, 5) and u\u00b7(-1, 1) and say what each says. Find k so that (3, k) is perpendicular to (4, -6). Find the angle between (1, 1) and (1, 0).",
      "a": "2 (along u), 0 (right angle), -1 (against u); k = 2; the angle is 45 degrees.",
      "learn": [
       "the sign of a dot product tells you how two vectors relate: positive is along, zero is a right angle, negative is against",
       "u = (1, 0): u\u00b7(2, 3) = 2, so along u",
       "u\u00b7(0, 5) = 0, so a right angle",
       "u\u00b7(-1, 1) = -1, so against u",
       "a zero dot product is the test for perpendicular",
       "to find k so that (3, k) is perpendicular to (4, -6): 12 - 6k = 0, so k = 2",
       "the angle between (1, 1) and (1, 0) is 45 degrees"
      ],
      "ab": [
       [
        "read",
        "Read a dot product's sign as along, right angle or against"
       ],
       [
        "write",
        "Test for a right angle with a zero dot product"
       ],
       [
        "write",
        "Solve for k that makes two vectors perpendicular"
       ],
       [
        "write",
        "Find the angle between two vectors"
       ],
       [
        "predict",
        "Predict the sign before you compute"
       ],
       [
        "say",
        "Say what a zero dot product means"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-7",
      "t": "Cosine similarity",
      "y": "compute cos = (x\u00b7y) / (length of x times length of y), say what 1, 0 and -1 mean, and say why it is not the same as distance.",
      "c": "x = (1, 2, 0) and y = (2, 4, 0): compute cos(x, y), x\u00b7y and x\u00b7x. Then cos(x, z) for z = (0, 0, 3) and cos(x, -y) for -y = (-2, -4, 0). Then, for (3, 4) against (4, 3) and against (30, 40), compute both the cosine and the distance.",
      "a": "cos(x, y) = 1, and x\u00b7y and x\u00b7x are 10 and 5; cos(x, z) = 0; cos(x, -y) = -1. (3, 4) against (4, 3): cosine 0.96, distance 1.414. (3, 4) against (30, 40): cosine 1, distance 45. Cosine ignores length; distance does not.",
      "learn": [
       "cosine similarity is (x\u00b7y) divided by (the length of x times the length of y)",
       "1 means the same direction, 0 means a right angle, -1 means opposite",
       "x = (1, 2, 0) and y = (2, 4, 0): cosine 1, with x\u00b7y = 10 and x\u00b7x = 5",
       "x with z = (0, 0, 3): cosine 0",
       "x with -y = (-2, -4, 0): cosine -1",
       "(3, 4) against (4, 3): cosine 0.96, distance 1.414",
       "(3, 4) against (30, 40): cosine 1, distance 45",
       "cosine ignores length and distance does not, so they answer different questions"
      ],
      "ab": [
       [
        "write",
        "Compute cosine similarity from a dot product and two lengths"
       ],
       [
        "read",
        "Say what 1, 0 and -1 mean"
       ],
       [
        "write",
        "Compute the cosine and the distance for the same pair"
       ],
       [
        "predict",
        "Predict a cosine of 1 when one vector is a multiple of the other"
       ],
       [
        "say",
        "Say why cosine is not the same as distance"
       ],
       [
        "pick",
        "Pick cosine or distance for a given question"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-8",
      "t": "The dot product as a weighted score",
      "y": "score an item as a dot product of its features with a weight vector, and change a weight and predict what happens.",
      "c": "movie 1 = (action, romance, humour) = (0.9, 0.1, 0.5), movie 2 = (0.2, 0.9, 0.7); a viewer's weights are w = (3, -1, 2). Score both movies. Then change the romance weight from -1 to 3 and score both again: which movie wins?",
      "a": "movie 1 scores 3.6 and movie 2 scores 1.1; with the romance weight 3 they score 4.0 and 4.7, so movie 2 wins.",
      "learn": [
       "a score is the dot product of an item's features with a weight vector",
       "movie 1 = (0.9, 0.1, 0.5) with w = (3, -1, 2): 2.7 - 0.1 + 1.0 = 3.6",
       "movie 2 = (0.2, 0.9, 0.7): 0.6 - 0.9 + 1.4 = 1.1",
       "a positive weight rewards a feature and a negative weight punishes it",
       "change the romance weight from -1 to 3 and the scores become 4.0 and 4.7",
       "now movie 2 wins: one weight can flip the ranking",
       "predict the change before you compute it"
      ],
      "ab": [
       [
        "write",
        "Score an item as a dot product with a weight vector"
       ],
       [
        "write",
        "Change one weight and score again"
       ],
       [
        "read",
        "Say which item wins and by how much"
       ],
       [
        "predict",
        "Predict which movie wins after the weight change"
       ],
       [
        "say",
        "Say what a negative weight does"
       ],
       [
        "say",
        "Say why one weight can flip the ranking"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "Rank documents against a query",
     "u": "dot product, sign and size, cosine similarity",
     "k": "three documents are word-count vectors over four words: D1 = (3, 0, 1, 2), D2 = (0, 2, 0, 1), D3 = (6, 0, 2, 4). The query is (1, 0, 0, 1). Rank the documents by dot product with the query, then by cosine similarity. Say why D1 and D3 differ in one ranking and tie in the other (D3 is D1 written twice as long).",
     "a": "dot products 5, 1, 10, so the ranking by dot product is D3, D1, D2. Cosine: D1 and D3 are both 0.945 (a tie) and D2 is 0.316."
    }
   },
   {
    "key": "la/C",
    "id": "C",
    "n": "Matrices and shapes",
    "idea": "a matrix is a table of numbers, and its shape decides what you may multiply.",
    "needsText": "",
    "items": [
     {
      "id": "LA-9",
      "t": "A matrix is a table: shape and position",
      "y": "give a matrix's shape as (rows, columns), find an entry by row and column, and take a column out as a vector. (Maths counts from 1; NumPy counts from 0.)",
      "c": "M = [[1, 2, 3], [4, 5, 6]]. Give its shape. Name the entry in row 2, column 3 and the index NumPy needs for it. Write column 2 as a vector. What shape is a table of 100 houses with 4 features each?",
      "a": "the shape is (2, 3); the entry is 6, NumPy index M[1, 2]; column 2 is (2, 5); 100 houses with 4 features have shape (100, 4).",
      "learn": [
       "a matrix is a table of numbers, and its shape is (rows, columns)",
       "M = [[1, 2, 3], [4, 5, 6]] has shape (2, 3)",
       "you find an entry by row and then column: row 2, column 3 is 6",
       "maths counts from 1 and NumPy counts from 0, so that entry is `M[1, 2]`",
       "you can take a column out as a vector: column 2 is (2, 5)",
       "100 houses with 4 features each have shape (100, 4)",
       "rows are examples and columns are features"
      ],
      "ab": [
       [
        "read",
        "Give a matrix's shape as (rows, columns)"
       ],
       [
        "read",
        "Find an entry by row and column"
       ],
       [
        "write",
        "Write the NumPy index for an entry, counting from 0"
       ],
       [
        "write",
        "Take a column out as a vector"
       ],
       [
        "predict",
        "Predict the shape of a table of examples and features"
       ],
       [
        "say",
        "Say the difference between maths counting and NumPy counting"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-10",
      "t": "Transpose",
      "y": "write the transpose and say how the shape changes.",
      "c": "write the transpose of M from LA-9 and give its shape; transpose it again.",
      "a": "[[1, 4], [2, 5], [3, 6]], shape (3, 2); transposing twice gives M back.",
      "learn": [
       "the transpose swaps rows and columns",
       "M transposes to [[1, 4], [2, 5], [3, 6]]",
       "the first row `[1, 2, 3]` of M becomes the first column of the transpose",
       "the shape (2, 3) becomes (3, 2)",
       "transposing twice gives M back",
       "the entry in row i, column j moves to row j, column i",
       "in NumPy the transpose is `M.T`"
      ],
      "ab": [
       [
        "write",
        "Write the transpose of a matrix"
       ],
       [
        "read",
        "Give the new shape after a transpose"
       ],
       [
        "write",
        "Transpose twice and check you get the original"
       ],
       [
        "predict",
        "Predict the shape of the transpose before you write it"
       ],
       [
        "say",
        "Say what happens to the entry in row i, column j"
       ],
       [
        "pick",
        "Pick `M` or `M.T` when rows and columns must swap"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-11",
      "t": "Matrix times vector",
      "y": "compute A x, where each entry is a dot product of a row of A with x.",
      "c": "A = [[1, 0, 2], [0, 3, -1]] and x = (2, 1, 3). Compute A x by hand and give its shape.",
      "a": "A x = (8, 0), a vector with 2 entries (shape (2,)).",
      "learn": [
       "A x gives a vector in which each entry is the dot product of a row of A with x",
       "A = [[1, 0, 2], [0, 3, -1]] and x = (2, 1, 3)",
       "row 1: 2 + 0 + 6 = 8",
       "row 2: 0 + 3 - 3 = 0",
       "the result is (8, 0): 2 entries, shape (2,)",
       "A has 2 rows, so the result has 2 entries",
       "the columns of A must match the entries of x"
      ],
      "ab": [
       [
        "write",
        "Compute A x one row at a time"
       ],
       [
        "write",
        "Give the shape of the result"
       ],
       [
        "read",
        "Say which row gave which entry"
       ],
       [
        "predict",
        "Predict the number of entries from the rows of A"
       ],
       [
        "say",
        "Say what must match for A x to exist"
       ],
       [
        "fix",
        "Find the row you dotted with the wrong vector"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-12",
      "t": "Matrix times matrix: the shape rule",
      "y": "multiply two small matrices, and say from the shapes alone whether a product exists and what shape it has.",
      "c": "A = [[1, 2, 0], [-1, 3, 1]] (2 by 3) and B = [[2, 1], [0, 1], [4, 0]] (3 by 2). Compute AB. What shape is BA? For shapes (4, 3) and (3, 5), what shape is the product? Is (4, 3) times (4, 3) defined? What shape does (1, 3) times (3, 1) give?",
      "a": "AB = [[2, 3], [2, 2]]; BA has shape (3, 3); the product of (4, 3) and (3, 5) has shape (4, 5); (4, 3) times (4, 3) is undefined (the inner sizes 3 and 4 differ); (1, 3) times (3, 1) has shape (1, 1).",
      "learn": [
       "each entry of AB is a row of A dotted with a column of B",
       "A is 2 by 3 and B is 3 by 2, so AB = [[2, 3], [2, 2]]",
       "the inner sizes must match: 3 and 3",
       "the result has the outer sizes: 2 by 2",
       "BA has shape (3, 3): a different shape, so AB and BA are not the same",
       "(4, 3) times (3, 5) gives (4, 5)",
       "(4, 3) times (4, 3) is undefined, because the inner sizes 3 and 4 differ",
       "(1, 3) times (3, 1) gives (1, 1)"
      ],
      "ab": [
       [
        "write",
        "Multiply two small matrices by hand"
       ],
       [
        "predict",
        "Say from the shapes alone whether a product exists"
       ],
       [
        "predict",
        "Give the shape of a product from the two shapes"
       ],
       [
        "read",
        "Compare the shapes of AB and BA"
       ],
       [
        "say",
        "Say which sizes must match and which sizes remain"
       ],
       [
        "fix",
        "Spot the product that is undefined and say why"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "LA-13",
      "t": "Shapes in ML code",
      "y": "predict the shape of X @ w, w @ X and X.T @ y for a feature matrix X, and read NumPy's shape error.",
      "c": "X has 100 rows (examples) and 3 columns (features), w has 3 weights, y has 100 targets. Predict the shapes of X @ w and X.T @ y, and predict whether w @ X works. Then run all three in NumPy and read the message.",
      "a": "X @ w has shape (100,); X.T @ y has shape (3,); w @ X raises a ValueError. The message from NumPy 2.5.4 is \"matmul: Input operand 1 has a mismatch in its core dimension 0, with gufunc signature (n?,k),(k,m?)->(n?,m?) (size 100 is different from 3)\". Other NumPy versions word it differently; the point is to find the two sizes, 100 and 3, in it.",
      "learn": [
       "in ML code X holds examples as rows and features as columns: here 100 by 3",
       "w has 3 weights and y has 100 targets",
       "X @ w has shape (100,): one score per example",
       "X.T @ y has shape (3,): one number per feature",
       "w @ X fails with a ValueError, because the inner sizes are 3 and 100",
       "NumPy 2.5.4 says 'matmul: Input operand 1 has a mismatch in its core dimension 0' and ends '(size 100 is different from 3)'",
       "other NumPy versions may word the message differently",
       "check the shapes first, before you run the code"
      ],
      "ab": [
       [
        "predict",
        "Predict the shape of `X @ w` before you run it"
       ],
       [
        "predict",
        "Predict the shape of `X.T @ y`"
       ],
       [
        "predict",
        "Predict whether `w @ X` works"
       ],
       [
        "write",
        "Run all three in NumPy"
       ],
       [
        "read",
        "Read the ValueError and find the sizes that clash"
       ],
       [
        "fix",
        "Fix a shape error by swapping the order or transposing"
       ],
       [
        "say",
        "Say what each shape means in terms of examples and features"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c1",
       "where": "Course 1 \u00b7 about 34 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "A two-layer network on paper",
     "u": "shapes, matrix times matrix, the order of products",
     "k": "X is 4 examples by 3 features, [[1, 2, 0], [0, 1, 1], [2, 0, 1], [1, 1, 1]]; W1 = [[1, -1], [0, 2], [1, 0]] (3 by 2); W2 = [[2], [1]] (2 by 1). (a) Give the shape of X W1 and compute it. (b) Compute the output (X W1) W2. (c) Compute W1 W2 and show that X (W1 W2) gives the same output. (d) Count the multiplications for (X W1) W2 and for X (W1 W2).",
     "a": "X W1 has shape (4, 2) and is [[1, 3], [1, 2], [3, -2], [2, 1]]; the output column is (5, 4, 4, 5); W1 W2 = [[1], [2], [2]]; the two orders give equal results; (X W1) W2 takes 32 multiplications and X (W1 W2) takes 18. (There is no nonlinearity here, so the two layers collapse into one matrix, which is why a real network puts a nonlinearity between its layers: a later item.)"
    }
   }
  ]
 },
 {
  "id": "prob",
  "name": "Probability",
  "code": "PB",
  "regions": [
   {
    "key": "prob/A",
    "id": "A",
    "n": "Events and counting",
    "idea": "the probability of an event, found by counting outcomes.",
    "needsText": "",
    "items": [
     {
      "id": "PB-1",
      "t": "Probability by counting equally likely outcomes",
      "y": "list the outcomes, count those that fit the event, and divide.",
      "c": "one fair die: P(even), P(at least 5), P(not a 6). Two fair dice: how many outcomes are there, and what are P(sum = 7) and P(sum = 8)? Write the pairs out.",
      "a": "P(even) = 1/2, P(at least 5) = 1/3, P(not a 6) = 5/6; two dice have 36 outcomes; P(sum = 7) = 1/6 and P(sum = 8) = 5/36.",
      "learn": [
       "probability by counting: list the outcomes, count the ones that fit the event, and divide by the total",
       "this only works when every outcome is equally likely, like a fair die or a fair coin",
       "one fair die has 6 outcomes: 1 to 6",
       "P(even) = 3 of 6 = 1/2",
       "P(at least 5) = 2 of 6 = 1/3, because only 5 and 6 fit",
       "P(not a 6) = 5/6",
       "two fair dice have 36 outcomes (6 times 6), best written as pairs",
       "P(sum = 7) = 6 of 36 = 1/6 and P(sum = 8) = 5 of 36",
       "writing the pairs out lets you see the 6 pairs that make 7 and the 5 that make 8"
      ],
      "ab": [
       [
        "write",
        "List the outcomes of a fair die and count the ones that fit an event"
       ],
       [
        "write",
        "Divide the fitting outcomes by the total"
       ],
       [
        "write",
        "Write out all 36 pairs for two dice"
       ],
       [
        "read",
        "Count the pairs that make a sum of 7 and of 8"
       ],
       [
        "predict",
        "Predict which sum is more likely before you count"
       ],
       [
        "say",
        "Say why counting needs equally likely outcomes"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-2",
      "t": "\"Or\" and \"not\"",
      "y": "add probabilities for \"or\" without counting an overlap twice, and use \"1 minus\" for \"not\".",
      "c": "draw one card from a standard 52-card deck. What is P(heart or king)? (The king of hearts must not be counted twice.) What is P(not a heart)?",
      "a": "P(heart or king) = 16/52 = 4/13 (0.3077); P(not a heart) = 3/4.",
      "learn": [
       "'or' means add the two probabilities, then take away the overlap so it is not counted twice",
       "a standard deck has 52 cards: 13 hearts and 4 kings",
       "the king of hearts is in both groups",
       "P(heart or king) = 13/52 + 4/52 - 1/52 = 16/52 = 4/13 (0.3077)",
       "adding 13/52 + 4/52 with no subtraction gives 17/52, which counts the king of hearts twice",
       "'not' means 1 minus: P(not a heart) = 1 - 1/4 = 3/4",
       "count the 16 different cards as a check on the sum"
      ],
      "ab": [
       [
        "write",
        "Add two probabilities and take away the overlap"
       ],
       [
        "write",
        "Use '1 minus' for 'not'"
       ],
       [
        "read",
        "Find the card that sits in both groups"
       ],
       [
        "predict",
        "Predict that the answer is less than 13/52 + 4/52"
       ],
       [
        "say",
        "Say why the king of hearts must not be counted twice"
       ],
       [
        "fix",
        "Spot the double count in a wrong 'or' sum"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-3",
      "t": "\"And\" for independent events, and \"at least one\"",
      "y": "multiply probabilities for independent events, and get \"at least one\" as 1 minus the chance of none.",
      "c": "what is P(three heads in a row) with a fair coin? What is P(at least one six in 4 rolls of a die), using \"1 minus the chance of no six\"? Confirm it by listing all 1296 outcomes of 4 rolls with a short loop.",
      "a": "P(HHH) = 1/8; P(at least one six in 4 rolls) = 671/1296 = 0.5177; the loop finds 671 of the 1296 outcomes with a six.",
      "learn": [
       "'and' for independent events means multiply the probabilities",
       "independent means one result does not change the chance of the other",
       "P(HHH) with a fair coin = 1/2 times 1/2 times 1/2 = 1/8",
       "'at least one' is easier as 1 minus the chance of none",
       "no six in 4 rolls has chance (5/6) to the power 4, so P(at least one six) = 1 - 625/1296 = 671/1296 = 0.5177",
       "confirm it by listing all 1296 outcomes (6 to the power 4) with a short loop: 671 of them have a six",
       "a loop counts what is too long to list by hand"
      ],
      "ab": [
       [
        "write",
        "Multiply the probabilities of independent events"
       ],
       [
        "write",
        "Get 'at least one' as 1 minus the chance of none"
       ],
       [
        "write",
        "Write a short loop that counts outcomes"
       ],
       [
        "read",
        "Check that the loop finds 671 of the 1296 outcomes"
       ],
       [
        "predict",
        "Predict that 4 rolls give a better than even chance of a six"
       ],
       [
        "say",
        "Say what independent means"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-4",
      "t": "Counting choices: combinations",
      "y": "compute \"n choose k\" and use it to count the ways an event can happen.",
      "c": "compute C(5, 2) and C(10, 3) (`math.comb`). Then find P(exactly 2 heads in 4 fair flips) by counting the ways.",
      "a": "C(5, 2) = 10 and C(10, 3) = 120; exactly 2 heads in 4 flips can happen in 6 ways out of 16, so 6/16 = 0.375.",
      "learn": [
       "C(n, k) is 'n choose k': the number of ways to pick k things from n when order does not matter",
       "C(5, 2) = 10 and C(10, 3) = 120",
       "in Python it is `math.comb(n, k)`",
       "exactly 2 heads in 4 flips can happen in C(4, 2) = 6 ways",
       "4 flips have 2 to the power 4 = 16 equally likely sequences",
       "P(exactly 2 heads) = 6/16 = 0.375",
       "the method: count the ways the event can happen, then divide by all the outcomes"
      ],
      "ab": [
       [
        "write",
        "Compute C(5, 2) and C(10, 3) with `math.comb`"
       ],
       [
        "write",
        "Count the ways an event can happen with n choose k"
       ],
       [
        "write",
        "Divide the ways by all the outcomes"
       ],
       [
        "predict",
        "Predict that the middle count (2 heads) is the biggest in 4 flips"
       ],
       [
        "say",
        "Say what 'n choose k' counts"
       ],
       [
        "pick",
        "Pick combinations when order does not matter"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "The birthday problem",
     "u": "complement, \"and\" for independent events, counting, a short loop",
     "k": "in a room of n people (365 equally likely birthdays, no 29 February), find the probability that at least two share a birthday. Do n = 3 by hand: the chance that all three differ is 365/365 x 364/365 x 363/365. Then write a loop and find the probability for n = 10, 23, 40 and 60, and the smallest n where it passes one half.",
     "a": "n = 3: P(all differ) = 0.9918, so P(some two share) = 0.0082; n = 10: 0.1169; n = 23: 0.5073; n = 40: 0.8912; n = 60: 0.9941. The smallest n above one half is 23. (The counting form 365 x 364 x 363 / 365^3 and the running product are equal.)"
    }
   },
   {
    "key": "prob/B",
    "id": "B",
    "n": "Conditional probability and Bayes' rule",
    "idea": "probability given what you already know, and turning it around.",
    "needsText": "",
    "items": [
     {
      "id": "PB-5",
      "t": "Conditional probability from a table",
      "y": "read P(A | B) off a table of counts, and tell P(A | B) from P(B | A).",
      "c": "200 students: studied and passed 90, studied and failed 10, did not study and passed 40, did not study and failed 60. Find P(pass), P(pass | studied) and P(studied | passed). Are \"studied\" and \"pass\" independent?",
      "a": "the table totals 200; P(pass) = 130/200 = 0.65; P(pass | studied) = 90/100 = 0.9; P(studied | passed) = 90/130 = 0.6923; they are not independent (0.9 is not 0.65).",
      "learn": [
       "start from a table of counts: studied and passed 90, studied and failed 10, did not study and passed 40, did not study and failed 60",
       "the table totals 200 students",
       "P(pass) = 130/200 = 0.65",
       "P(A | B) means 'the chance of A given B': look only at the B group",
       "P(pass | studied) = 90/100 = 0.9",
       "P(studied | passed) = 90/130 = 0.6923",
       "P(A | B) and P(B | A) are different numbers",
       "independent would mean P(pass | studied) equals P(pass): 0.9 is not 0.65, so they are not independent"
      ],
      "ab": [
       [
        "read",
        "Read P(A | B) off a table of counts"
       ],
       [
        "write",
        "Compute P(pass), P(pass | studied) and P(studied | passed)"
       ],
       [
        "read",
        "Say which group each division uses"
       ],
       [
        "predict",
        "Predict that studying changes the pass chance"
       ],
       [
        "say",
        "Say why P(A | B) is not P(B | A)"
       ],
       [
        "say",
        "Say how you can tell two events are not independent"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-6",
      "t": "Draws without replacement",
      "y": "chain probabilities when each draw changes what is left.",
      "c": "a bag holds 4 red and 6 blue marbles; draw two without putting the first back. Find P(both red), P(one of each colour) and P(both blue), and check that they add up to 1.",
      "a": "P(both red) = 12/90 = 2/15 = 0.1333; P(one of each) = 48/90 = 8/15 = 0.5333; P(both blue) = 30/90 = 1/3; the three add up to 1.",
      "learn": [
       "draws without replacement change what is left, so the chances change after each draw",
       "a bag has 4 red and 6 blue marbles",
       "P(first red) = 4/10 and then P(second red) = 3/9",
       "P(both red) = 12/90 = 2/15 = 0.1333",
       "P(both blue) = 30/90 = 1/3",
       "P(one of each) = 48/90 = 8/15 = 0.5333, from red then blue plus blue then red",
       "the three answers must add up to 1, which is a check on your work"
      ],
      "ab": [
       [
        "write",
        "Chain probabilities for two draws without replacement"
       ],
       [
        "write",
        "Add the two orders for 'one of each colour'"
       ],
       [
        "read",
        "Check that the three answers add up to 1"
       ],
       [
        "predict",
        "Predict that both red is less likely than one of each"
       ],
       [
        "say",
        "Say why the second draw uses 9 and not 10"
       ],
       [
        "fix",
        "Fix a chain that forgot to remove the first marble"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-7",
      "t": "Bayes' rule",
      "y": "turn P(evidence | cause) into P(cause | evidence), with the formula and with a table of counts.",
      "c": "a disease affects 1% of people. A test is positive for 90% of sick people and for 5% of healthy people. A person tests positive: what is P(disease | positive)? Work it out twice: with the formula, and with a table of 10,000 people.",
      "a": "P(disease | positive) = 0.009 / 0.0585 = 0.1538. In the table of 10,000 people, 100 are sick and 90 of them test positive; 9,900 are healthy and 495 of them test positive: 90 / (90 + 495).",
      "learn": [
       "Bayes' rule turns P(evidence | cause) into P(cause | evidence)",
       "1% of people are sick; the test is positive for 90% of sick people and 5% of healthy people",
       "sick and positive: 0.01 times 0.90 = 0.009",
       "healthy and positive: 0.99 times 0.05 = 0.0495",
       "all positives together: 0.009 + 0.0495 = 0.0585",
       "P(disease | positive) = 0.009 / 0.0585 = 0.1538",
       "the same with a table of 10,000 people: 100 sick (90 test positive) and 9,900 healthy (495 test positive)",
       "so the answer is 90 / (90 + 495)",
       "it is only about 15% because most people are healthy, so false positives outnumber true ones"
      ],
      "ab": [
       [
        "write",
        "Work out P(disease | positive) with the formula"
       ],
       [
        "write",
        "Work it out again with a table of 10,000 people"
       ],
       [
        "read",
        "Find the true positives and the false positives in the table"
       ],
       [
        "predict",
        "Predict that a positive test is far from certain here"
       ],
       [
        "say",
        "Say why the answer is only about 15%"
       ],
       [
        "say",
        "Say how P(positive | disease) differs from P(disease | positive)"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-8",
      "t": "Updating with new evidence",
      "y": "use yesterday's answer as today's starting probability.",
      "c": "the same person takes the same test again and tests positive again (the two tests err independently). Use the answer of PB-7 as the new starting probability. What is P(disease | two positives)?",
      "a": "0.7660.",
      "learn": [
       "updating means yesterday's answer becomes today's starting probability",
       "start from P(disease) = 0.1538 instead of 1%",
       "the same person tests positive again, and the two tests err independently",
       "apply Bayes' rule again with the new starting probability",
       "P(disease | two positives) = 0.7660",
       "evidence stacks: a second positive moves about 15% to about 77%",
       "the starting probability is the only thing that changed between the two rounds"
      ],
      "ab": [
       [
        "write",
        "Use the answer of the first test as the new starting probability"
       ],
       [
        "write",
        "Apply Bayes' rule a second time"
       ],
       [
        "read",
        "Compare 0.1538 with 0.7660"
       ],
       [
        "predict",
        "Predict that a second positive raises the chance a lot"
       ],
       [
        "say",
        "Say why independent errors let you chain the tests"
       ],
       [
        "say",
        "Say what the starting probability means"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "Spam by hand (naive Bayes)",
     "u": "conditional probability, Bayes' rule, updating",
     "k": "40% of mail is spam. The word \"free\" appears in 60% of spam and 5% of other mail; the word \"meeting\" appears in 10% of spam and 50% of other mail. Assume the words appear independently inside each class. For an email containing both words, compute the unnormalised score for spam and for not spam, then P(spam | free and meeting). Then compute P(spam | meeting only).",
     "a": "spam score 0.4 x 0.6 x 0.1 = 0.024; other-mail score 0.6 x 0.05 x 0.5 = 0.015; P(spam | free and meeting) = 0.6154; P(spam | meeting only) = 0.1176."
    }
   },
   {
    "key": "prob/C",
    "id": "C",
    "n": "Random variables: expectation, variance and the binomial",
    "idea": "summarising a random number by its table, its average and its spread.",
    "needsText": "",
    "items": [
     {
      "id": "PB-9",
      "t": "A random variable and its distribution table",
      "y": "write the table of values and probabilities for a simple random variable and check that it adds up to 1.",
      "c": "X is the number of heads in 3 fair flips. Write its table and check the probabilities add up to 1. What is P(X >= 2)?",
      "a": "P(X = 0, 1, 2, 3) = 1/8, 3/8, 3/8, 1/8, which add up to 1; P(X >= 2) = 1/2.",
      "learn": [
       "a random variable is a number that comes from a chance event",
       "X is the number of heads in 3 fair flips",
       "its table: P(X = 0, 1, 2, 3) = 1/8, 3/8, 3/8, 1/8",
       "3 flips have 8 equally likely outcomes, and 0, 1, 2 and 3 heads occur in 1, 3, 3 and 1 of them",
       "the probabilities in a table must add up to 1",
       "P(X >= 2) = 3/8 + 1/8 = 1/2",
       "'>= 2' means add the rows for 2 and for 3"
      ],
      "ab": [
       [
        "write",
        "Write the table of values and probabilities for 3 flips"
       ],
       [
        "write",
        "Check that the probabilities add up to 1"
       ],
       [
        "write",
        "Add the right rows for P(X >= 2)"
       ],
       [
        "read",
        "Read a probability off the table"
       ],
       [
        "predict",
        "Predict which value of X is most likely"
       ],
       [
        "say",
        "Say what a random variable is"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-10",
      "t": "Expected value",
      "y": "compute an average weighted by probabilities and use it to judge a bet.",
      "c": "what is E[X] for one fair die? A raffle ticket costs 10; 1% of tickets win 500 and 5% win 50. What are the expected prize and the expected profit per ticket?",
      "a": "E[X] for a fair die is 3.5; the expected prize is 7.5 and the expected profit is -2.5 per ticket.",
      "learn": [
       "expected value is each value times its probability, added up",
       "for a fair die E[X] = 3.5, which the die can never show",
       "the weights are the probabilities: each face of a fair die has 1/6, so E[X] = (1 + 2 + 3 + 4 + 5 + 6) / 6 = 21/6 = 3.5",
       "a raffle ticket costs 10; 1% of tickets win 500 and 5% win 50",
       "expected prize = 0.01 times 500 + 0.05 times 50 = 5 + 2.5 = 7.5",
       "expected profit = 7.5 - 10 = -2.5 per ticket",
       "a negative expected profit means you lose money on average"
      ],
      "ab": [
       [
        "write",
        "Compute E[X] for one fair die"
       ],
       [
        "write",
        "Compute the expected prize of the raffle"
       ],
       [
        "write",
        "Subtract the price to get the expected profit"
       ],
       [
        "predict",
        "Predict whether a bet is worth taking from its expected profit"
       ],
       [
        "say",
        "Say what the expected value means"
       ],
       [
        "pick",
        "Pick the better bet from two expected profits"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-11",
      "t": "Variance and standard deviation",
      "y": "compute the spread of a random variable and say what it tells you that the average does not.",
      "c": "for one fair die compute E[X^2], then Var(X) = E[X^2] minus E[X] squared, then the standard deviation. Then compare a quantity that is 0 or 10 with equal probability against one that is 4 or 6 with equal probability (both average 5).",
      "a": "E[X^2] = 91/6; Var(X) = 35/12 = 2.9167; the standard deviation is 1.7078. The two quantities average 5 each, but their variances are 25 and 1.",
      "learn": [
       "variance measures spread: Var(X) = E[X^2] minus E[X] squared",
       "for a fair die E[X^2] = 91/6",
       "Var(X) = 91/6 - 3.5 squared = 35/12 = 2.9167",
       "the standard deviation is the square root of the variance: 1.7078",
       "the standard deviation is in the same units as X",
       "two quantities can both average 5: one is 0 or 10, the other is 4 or 6",
       "their variances are 25 and 1",
       "the average hides the spread, and the variance shows it"
      ],
      "ab": [
       [
        "write",
        "Compute E[X^2] for one fair die"
       ],
       [
        "write",
        "Compute the variance and the standard deviation"
       ],
       [
        "read",
        "Compare the variances of the 0-or-10 and the 4-or-6 quantities"
       ],
       [
        "predict",
        "Predict which quantity is more spread out"
       ],
       [
        "say",
        "Say what the variance tells you that the average does not"
       ],
       [
        "pick",
        "Pick the steadier quantity from two variances"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-12",
      "t": "The binomial distribution",
      "y": "use C(n, k) p^k (1-p)^(n-k) for \"k successes in n independent tries\", and its mean and variance.",
      "c": "a machine makes 10 parts and each is defective with probability 0.02, independently. Find P(no defects), P(at least one defect) and P(exactly 2 defects). What are the mean and the variance of the number of defects (n p and n p (1-p))?",
      "a": "P(no defects) = 0.8171; P(at least one defect) = 0.1829; P(exactly 2 defects) = 0.0153; the mean and variance are 0.2 and 0.196.",
      "learn": [
       "the binomial counts k successes in n independent tries, each with probability p",
       "P(k) = C(n, k) times p to the power k times (1-p) to the power (n-k)",
       "10 parts, each defective with probability 0.02, independently",
       "P(no defects) = 0.98 to the power 10 = 0.8171",
       "P(at least one defect) = 1 - 0.8171 = 0.1829",
       "P(exactly 2 defects) = C(10, 2) times 0.02 squared times 0.98 to the power 8 = 0.0153",
       "mean = n p = 0.2 and variance = n p (1-p) = 0.196",
       "'independently' is what lets you multiply the chances"
      ],
      "ab": [
       [
        "write",
        "Use the binomial formula for 'exactly k'"
       ],
       [
        "write",
        "Get 'at least one' as 1 minus 'none'"
       ],
       [
        "write",
        "Compute the mean and the variance with n p and n p (1-p)"
       ],
       [
        "read",
        "Say what n, k and p stand for in a problem"
       ],
       [
        "predict",
        "Predict that two defects in 10 parts is rare"
       ],
       [
        "say",
        "Say when the binomial is the right model"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "Simulate it and compare",
     "u": "the distribution table, expectation, the binomial; NumPy's random generator",
     "k": "with `rng = np.random.default_rng(seed)` draw 100,000 values of \"heads in 5 fair flips\" (`rng.binomial(5, 0.5, size=100_000)`). Compare each value's frequency with the exact table C(5, k)/32 and the mean with 2.5. Pass if every frequency is within 0.01 of the exact one and the mean is within 0.02 of 2.5. Then change the heads probability to 0.3 and say, before you run it, which outcome will be the most frequent and how likely it is.",
     "a": "the pass holds for every seed from 0 to 199 (0 failures of 200), so a failure means a bug, not bad luck. With probability 0.3 the most frequent outcome and its probability are 1 and 0.360 (exactly 0.36015)."
    }
   },
   {
    "key": "prob/D",
    "id": "D",
    "n": "Continuous distributions and the normal",
    "idea": "probability as area under a curve.",
    "needsText": "",
    "items": [
     {
      "id": "PB-13",
      "t": "Density and area",
      "y": "read a probability as the area under a density, with no calculus.",
      "c": "X is uniform on [0, 10]: find P(2 <= X <= 5) and P(X <= 7). A density is f(x) = 2x on [0, 1] (a triangle of height 2 at x = 1): confirm the total area is 1, and find P(X <= 0.5) as the area of a triangle.",
      "a": "P(2 <= X <= 5) = 0.3 and P(X <= 7) = 0.7; the triangle has base 1 and height 2, so its area is 1; P(X <= 0.5) = 0.25.",
      "learn": [
       "for a continuous variable, probability is the area under the density, not its height",
       "uniform on [0, 10]: the density is flat, so area is width times height (1/10)",
       "P(2 <= X <= 5) = 3/10 = 0.3 and P(X <= 7) = 0.7",
       "f(x) = 2x on [0, 1] is a triangle of height 2 at x = 1",
       "its total area is 1/2 times 1 times 2 = 1",
       "P(X <= 0.5) is a smaller triangle with base 0.5 and height 1: area 0.25",
       "no calculus is needed: shapes and area formulas are enough"
      ],
      "ab": [
       [
        "write",
        "Find a probability on a uniform density as width times height"
       ],
       [
        "write",
        "Check that the area under a density is 1"
       ],
       [
        "write",
        "Find P(X <= 0.5) as the area of a triangle"
       ],
       [
        "predict",
        "Predict a probability from the width of the interval"
       ],
       [
        "say",
        "Say why probability is area and not height"
       ],
       [
        "pick",
        "Pick the area formula that fits the shape under the density"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-14",
      "t": "The normal distribution and the 68-95-99.7 rule",
      "y": "get normal probabilities from a mean and a standard deviation (`statistics.NormalDist`), and say how much lies within 1, 2 and 3 standard deviations.",
      "c": "heights are normal with mean 170 and standard deviation 10 (cm). Find P(160 <= X <= 180), P(150 <= X <= 190), P(X > 190) and P(X > 170).",
      "a": "P(160 <= X <= 180) = 0.6827; P(150 <= X <= 190) = 0.9545; P(X > 190) = 0.0228; P(X > 170) = 0.5.",
      "learn": [
       "the normal distribution is fixed by its mean and its standard deviation",
       "in Python, `statistics.NormalDist` gives normal probabilities",
       "heights are normal with mean 170 cm and standard deviation 10 cm",
       "within 1 standard deviation (160 to 180): 0.6827",
       "within 2 standard deviations (150 to 190): 0.9545",
       "P(X > 190) = 0.0228",
       "P(X > 170) = 0.5, because half the curve lies above the mean",
       "the 68-95-99.7 rule: about 68% within 1 standard deviation, 95% within 2 and 99.7% within 3"
      ],
      "ab": [
       [
        "write",
        "Build a normal distribution with `statistics.NormalDist`"
       ],
       [
        "write",
        "Find a probability between two values"
       ],
       [
        "write",
        "Find a tail probability like P(X > 190)"
       ],
       [
        "read",
        "Say how much lies within 1, 2 and 3 standard deviations"
       ],
       [
        "predict",
        "Predict that P(X > mean) is 0.5"
       ],
       [
        "say",
        "Say what the mean and the standard deviation control"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     },
     {
      "id": "PB-15",
      "t": "Z-scores",
      "y": "turn a value into \"how many standard deviations from the mean\" and compare values from different scales.",
      "c": "exam A: you scored 78, the class mean is 70 and the standard deviation is 8. Exam B: you scored 130, the mean is 110 and the standard deviation is 25. Compute each z-score and say which result is better relative to its class. If scores are normal, what is the chance of beating you in each exam?",
      "a": "exam A z = 1.0 and exam B z = 0.8, so exam A is better relative to its class; P(Z > 1) = 0.1587 and P(Z > 0.8) = 0.2119.",
      "learn": [
       "a z-score is (value minus mean) divided by the standard deviation: how many standard deviations from the mean",
       "exam A: (78 - 70) / 8 = 1.0",
       "exam B: (130 - 110) / 25 = 0.8",
       "exam A is better relative to its class, even though 130 is a bigger number than 78",
       "z-scores put different scales onto one scale",
       "P(Z > 1) = 0.1587 and P(Z > 0.8) = 0.2119: the chance of beating you",
       "those chances only hold if the scores are normal"
      ],
      "ab": [
       [
        "write",
        "Compute a z-score from a value, a mean and a standard deviation"
       ],
       [
        "write",
        "Compare two z-scores from different exams"
       ],
       [
        "pick",
        "Pick the better result relative to its class"
       ],
       [
        "write",
        "Find the chance of beating a score from its z-score"
       ],
       [
        "predict",
        "Predict which exam has fewer people ahead of you"
       ],
       [
        "say",
        "Say what a z-score of 1.0 means"
       ]
      ],
      "via": {
       "path": "coursera/math-ml/c3",
       "where": "Course 3 \u00b7 about 33 h \u00b7 module not checked",
       "tags": []
      }
     }
    ],
    "task": {
     "t": "100,000 simulated heights",
     "u": "the normal distribution, z-scores, simulation",
     "k": "draw 100,000 heights with `rng.normal(170, 10, size=100_000)`. Compute the fraction within 1, 2 and 3 standard deviations of the mean and the fraction above 190, and the z-score of 190. Pass if the three fractions are within 0.006 of the exact values and the fraction above 190 is within 0.003 of 0.0228.",
     "a": "the exact fractions within 1, 2 and 3 standard deviations are 0.6827, 0.9545, 0.9973; the z-score of 190 cm is 2.0; the pass held for every seed from 0 to 199 (0 failures of 200)."
    }
   }
  ]
 }
]

// The page of each course, by the path of the course in the catalogue (DRAFT, from the layout page).
export const COURSE_LINKS: Readonly<Record<string, CourseLink>> = {
 "coursera/ibm-python": {
  "name": "IBM Python for Data Science, AI & Development",
  "url": "https://www.coursera.org/learn/python-for-applied-data-science-ai"
 },
 "coursera/math-ml/c1": {
  "name": "Linear Algebra for Machine Learning and Data Science",
  "url": "https://www.coursera.org/learn/machine-learning-linear-algebra"
 },
 "coursera/math-ml/c3": {
  "name": "Probability & Statistics for Machine Learning and Data Science",
  "url": "https://www.coursera.org/learn/machine-learning-probability-and-statistics"
 }
}

// AB:LEARN.TIER1-DATA:END
