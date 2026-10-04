# ASHBORN TAGGING RULES

Purpose: any part of the app can be found and changed without reading or scanning the code. Every part of the code carries a TAG. CODE_MAP.md lists every tag in plain words. A tag is found by searching for it. The command `node scripts/check-tags.mjs` checks that the code and the map agree.

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

## How to find a part
1. Open CODE_MAP.md and find the part in plain words.
2. Search the whole project for the tag followed by `:START`, for example `AB:LOGIN.BG:START`.
3. Change only the lines between START and END.

## Rules for every packet (the planner follows these when writing packets)
1. The planner decides every tag name. The agent copies tags from the packet. The agent never invents, renames or deletes a tag.
2. A packet that creates or edits code contains: the tag comment lines inside the file contents; the exact edit of CODE_MAP.md (new row, changed row or removed row); a step that runs `node scripts/check-tags.mjs`; and the done-check "it prints TAGS OK".
3. NEW THING on an existing page: pick a part name, add the tag lines around its code in each file, add one row to that page's table in CODE_MAP.md.
4. NEW PAGE: add one row to "Page codes" in CODE_MAP.md, add a table for the page, tag every part as in rule 3. Update the page list in the handoff.
5. CHANGING an existing thing: the packet names the tag and the file and says "search for the tag followed by :START, change only between START and END". If the change moves, splits, renames or removes code, the markers and the map are fixed in the same packet.
6. LIBRARY components (installed React Bits source, shadcn files) are never edited. To change how one looks or moves, change its props where it is used. If a packet must edit a library file, the packet says so and the file gets a row in the map section "Library components".
7. Files that cannot hold comments (images, JSON, lock files) are not tagged. They are named in the map section "Untagged files".
8. The map and the code change in the same packet. A packet is not done until `node scripts/check-tags.mjs` prints TAGS OK.

## Tiny changes straight to the agent (a value change only)
For changing one value, paste this into the agent chat with the blanks filled in:
```
Open CODE_MAP.md and find the tag for <THING>. Search the project for that tag followed by :START. Change <WHAT> to <VALUE>. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. Decide nothing else. If anything fails, stop and tell me.
```
Example: Open CODE_MAP.md and find the tag for the front page background animation. Search the project for that tag followed by :START. Change speed to 1.2. Edit only between the START and END lines. Then run npm run build and node scripts/check-tags.mjs. Decide nothing else. If anything fails, stop and tell me.

Anything bigger than a value change (swap an animation, new feature, new page) goes to the planner chat, which writes a packet.

## The checker
`node scripts/check-tags.mjs` (run from the project root) reads src and CODE_MAP.md and reports:
- a tag line that is malformed
- a tag with no START or no END, or more than one of either, in a file
- a tag in the code that is not in the map, or in the map but not in the code (also checks the file names)
- a tag listed twice in the map
It prints TAGS OK and the counts when everything agrees. Otherwise it prints the problems and stops with an error. If it fails, STOP and report the full output.
