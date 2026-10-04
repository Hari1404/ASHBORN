# ASHBORN TAGGING RULES

Purpose: any part of the app can be found and changed without reading or scanning the code. Every part of the code carries a TAG. CODE_MAP.md lists every tag in plain words. A tag is found by searching for it. CONNECTIONS.md lists which parts are tied to which other parts, so a change does not break a part nobody was looking at. The command `node scripts/check-tags.mjs` checks that the code, the map and the connections agree.

## The tag
Format: `AB:<PAGE>.<PART>`   Example: `AB:LOGIN.BG`
- PAGE is the page or area, in capital letters. The codes in use are in CODE_MAP.md, section "Page codes". Tags are grouped by page, not by build phase, because a page stays while phases end.
- PART says what the thing is, in capital letters, digits and hyphens: BG, HERO, BUTTON, HOVER-GLOW. A part name describes the thing. It never contains a value (a colour, a number) or an order number.
- A tag marks a block with two comment lines. The first one ends with `:START`, the last one with `:END`.
- One tag can appear in several files (for example the markup in a .tsx file and the look in a .css file). In each file it appears exactly once as START and once as END.
- Blocks do not overlap and do not nest.
- Comment forms:
  - in .ts and .tsx code: `// AB:LOGIN.BG:START`
  - inside JSX markup: `{/* AB:LOGIN.BG:START */}`
  - in .css: `/* AB:LOGIN.BG:START */`

## Names we use in code
Our own CSS class names start with `ab-` (example `ab-button`), our own CSS variables with `--ab-` (example `--ab-glass-tint`), and the ids of our own elements with `ab-` (example `ab-userid`). The checker only watches names that start this way. Utility classes of a library or of Tailwind are not watched.

## How to find a part
1. Open CODE_MAP.md and find the part in plain words.
2. Search the whole project for the tag followed by `:START`, for example `AB:LOGIN.BG:START`.
3. Change only the lines between START and END.

## Rules for every packet (the planner follows these when writing packets)
1. The planner decides every tag name. The agent copies tags from the packet. The agent never invents, renames or deletes a tag.
2. A packet that creates or edits code contains: the tag comment lines inside the file contents; the exact edit of CODE_MAP.md (new row, changed row or removed row); the exact edit of CONNECTIONS.md when the change touches a connection (see "Connections" below); a step that runs `node scripts/check-tags.mjs`; and the done-check "it prints TAGS OK and CONNECTIONS OK".
3. NEW THING on an existing page: pick a part name, add the tag lines around its code in each file, add one row to that page's table in CODE_MAP.md.
4. NEW PAGE: add one row to "Page codes" in CODE_MAP.md, add a table for the page, tag every part as in rule 3. Update the page list in the handoff.
5. CHANGING an existing thing: the packet names the tag and the file and says "search for the tag followed by :START, change only between START and END". If the change moves, splits, renames or removes code, the markers and the map are fixed in the same packet.
6. LIBRARY components (installed React Bits source, shadcn files) are never edited. To change how one looks or moves, change its props where it is used. If a packet must edit a library file, the packet says so and the file gets a row in the map section "Library components".
7. Files that cannot hold comments (images, JSON, lock files) are not tagged. They are named in the map section "Untagged files".
8. The map, the connections and the code change in the same packet. A packet is not done until `node scripts/check-tags.mjs` prints TAGS OK and CONNECTIONS OK.
9. Before the planner writes a packet that changes code, it reads every connection in CONNECTIONS.md that names the tags involved. The packet changes ALL linked places together, in the same packet, and says so.
10. A NEW connection is added the moment two places become dependent on each other (a value written twice, a class name shared by a .tsx and a .css file, a line outside a tag that a tagged block relies on, a setting of one part that another part is built around).

## Connections
CONNECTIONS.md is one file. It has one entry per connection: a heading `### C01: <title>` and then these lines, in this order:
```
### C01: <what is tied together, in plain words>
- Tags: `AB:PAGE.PART`, `AB:PAGE.PART`
- If you change: <what someone might change>
- Then also: <the other places that must change together or be re-checked>
- If you forget: <what breaks, in plain words>
- Anchor: `AB:PAGE.PART @ src/file.tsx = exact text that must stay in that tag block`
- Anchor: `src/file.tsx = exact text that must stay somewhere in that file`
```
- The Tags line names every tag that the entry involves. Every tag named must exist in the code.
- An Anchor is a piece of text copied exactly from the code. The first form must be found between the START and END lines of that tag in that file. The second form (no tag) is only for a linked line that sits outside every tag, and is found anywhere in that file.
- An entry that cannot be checked by text uses `- Check by hand: <what to look at>` instead of Anchor lines.
- Pin names and values that are LINKED (a number written in two places, a class name, a function name). Do not pin a value that is safe to change alone (a speed, a blur, a darkness): pinning it would make every harmless tweak fail.
- An anchor is copied from the code character for character. It never contains the character | or a backtick.
- A connection can only be discovered by the planner. The checker only guards the connections already written down.

## Tiny changes straight to the agent (a value change only)
For changing one value, paste this into the agent chat with the blanks filled in:
```
Open CODE_MAP.md and find the tag for <THING>. Search the project for that tag followed by :START. Change <WHAT> to <VALUE>. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. It must print TAGS OK and CONNECTIONS OK. Decide nothing else. If anything fails, stop and tell me.
```
Example: Open CODE_MAP.md and find the tag for the front page background animation. Search the project for that tag followed by :START. Change speed to 1.2. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. It must print TAGS OK and CONNECTIONS OK. Decide nothing else. If anything fails, stop and tell me.

Before you paste it: search CONNECTIONS.md (Ctrl+F) for the same tag. If an "If you change" line there matches what you want to change, it is NOT a tiny change: it goes to the planner chat. If you paste it anyway, the checker will print CONNECTIONS FAILED and the agent will stop.

Anything bigger than a value change (swap an animation, new feature, new page) goes to the planner chat, which writes a packet.

## The checker
`node scripts/check-tags.mjs` (run from the project root) reads src, CODE_MAP.md and CONNECTIONS.md. It reports:
- a tag line that is malformed
- a tag with no START or no END, or more than one of either, in a file
- a tag in the code that is not in the map, or in the map but not in the code (also checks the file names)
- a tag listed twice in the map
- a connection that has no Tags, If you change, Then also or If you forget line, or that has neither an Anchor nor a Check by hand line
- a connection that names a tag that is not in the code, or an Anchor whose text is not found where it should be (a linked place was changed on its own)
- an `ab-` class used in a .tsx file but defined in no .css file, or defined in css but used in no .tsx file
- a `--ab-` css variable used but not defined, or defined but not used
- a label (htmlFor) that points to an id that does not exist in its file, or an id used twice in a file
It prints two lines when everything agrees: `TAGS OK` with its counts, and `CONNECTIONS OK` with its counts. Otherwise it prints the problems and stops with an error. If it fails, STOP and report the full output. Do not fix it yourself.
