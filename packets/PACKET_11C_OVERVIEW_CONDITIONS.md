# PACKET 11C: THE CONDITIONS OF THE OVERVIEW (a RECORD of work that is already done: the Overview background look is chosen by a condition of the day instead of at random; no SQL, no new package)

> **THIS IS A RECORD, NOT AN AGENT PACKET (read this first).** The work below was built in a chat session on 2026-10-21 and handed over as a patch. The agent runs NOTHING from this file. The number **11C** is the writer's guess (the packet after 11B); rename the file if the owner's plan says otherwise.

Kind: build, no SQL, no change in Supabase.

## GOAL
The owner wants four **conditions** that each bring one of the four looks of the Overview background (Gradient ASCII), instead of the random pick:

| Owner's word | Name in the code | Look |
|---|---|---|
| dont know | `unknown` | Atmosphere |
| not sufficient | `notEnough` | Rose |
| okok | `okay` | Corona |
| good | `good` | Lagoon (the "pinch" shape) |

For now the condition comes from **how much time was spent today**, with hardcoded numbers. The owner said this will change later to something dynamic, so the pieces are kept apart.

## THE PIECES (so that the later, dynamic source changes one of them)
1. **The look of each condition**: `OVERVIEW_CONDITION_PRESET` in `src/lib/overviewCondition.ts`, a `Record`, so a new condition fails the type check until it has a look.
2. **The rule**: `conditionFromMinutes(minutes)` in the same file. The numbers are `CONDITION_MINUTES` (okay from 120, good from 240).
3. **The number**: `readTodayMinutes()` in `src/components/OverviewBackground.tsx`, the credited minutes of today from `timerDayScore` (the same number the screen shows as the day number).
4. **The prop**: `OverviewBackground` takes an optional `condition`. A caller that knows the condition itself passes it and nothing is read.

## DEFAULTS CHOSEN BY THE WRITER (the owner did not say; easy to change)
- A day with no time at all, or minutes that could not be read, is **unknown** ("nothing to judge yet"), not notEnough.
- Under 120 minutes is notEnough, from 120 okay, from 240 good.
- The condition is read **once** when the Overview opens. Nothing is drawn until it is known (so the picture and the sound start together), at most 1.5 seconds (`CONDITION_WAIT_MS`), then it opens as unknown. A late answer changes nothing.

## WHAT CHANGED
- `src/lib/overviewCondition.ts` (new, tag `AB:OVERVIEW.CONDITION`).
- `src/lib/overviewLook.ts`: `pickOverviewPreset` and its tests removed (nothing is random any more).
- `src/components/OverviewBackground.tsx`: the condition (prop, or read from the day score), the wait, `data-condition` on the box.
- Tests: `overviewCondition.test.ts` (new), `overviewLook.test.ts`, `OverviewBackground.test.tsx`.
- Docs: `CODE_MAP.md`, `CONNECTIONS.md` (C59 updated, C64 new), `PROGRESS.md`.

## KNOWN
- The Overview now asks `timerDayScore` twice when it opens (the condition and the HUD). Not shared on purpose; see C64 (5).
- Checked: `npx tsc -b`, `npx vitest run` (all pass), `node scripts/check-tags.mjs`. NOT seen in a browser: the owner looks at the four looks (see C64 "Check by hand").
