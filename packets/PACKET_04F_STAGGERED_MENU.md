# PACKET 04F: THE MENU (Staggered Menu on the signed-in screen)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Create or edit ONLY these files: `src/lib/screens.ts` (new), `src/menu.css` (new), `src/components/AppMenu.tsx` (new), `src/components/SignedInStub.tsx`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. The install command in Step 1 also creates `src/components/StaggeredMenu.tsx` and changes `package.json` and `package-lock.json`. Nothing else.
- Do NOT edit `src/App.tsx`, `src/login.css`, `src/auth.css`, `src/components/DarkVeil.tsx`, `src/components/PatternWaves.tsx`, or `src/components/StaggeredMenu.tsx` (a library file: never edited, not even to fix an error). Do not edit this packet file.
- Do not install or remove any package other than what the command in Step 1 installs by itself.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 10 is allowed.
- Every "replace" below says where to look. The old text must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The owner chose the React Bits "Staggered Menu" as the menu. This packet installs it and puts it on the temporary signed-in screen: a button in the top right corner (the word Menu and a plus) opens a dark panel with four items: Overview, Pro Timer, Calendar, Guide. A tap on an item changes the title of the screen (the four screens are empty placeholders for now) and closes the panel. The choice lives in the page address (for example `#timer`). The panel is solid dark with the blur switched off, so a phone stays light. The login page is not touched. It also updates the code map and the connections list so the checker stays happy.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `package.json`, `package-lock.json`, `src/auth.css`, `src/lib/lite.ts`, `src/components/SignedInStub.tsx`, `src/components/DarkVeil.tsx`. If any is missing: **STOP** and report which.

Check that these do NOT exist: `src/components/StaggeredMenu.tsx`, `src/components/AppMenu.tsx`, `src/lib/screens.ts`, `src/menu.css`. If any exists: **STOP** and report which.

Run:
```
Select-String -Path src/components/SignedInStub.tsx -Pattern "DarkVeil"
```
It must print exactly 2 lines. If it prints nothing: **STOP** and report "Packet 04E has not been run."

Run `git log --oneline -3`. The FIRST line must end with `Packet 04E: Dark Veil on the signed-in screen`. If it does not: **STOP** and report the COMPLETE output.

Run `git status --short`. Lines that start with `??` are fine. If ANY line shows a changed tracked file: **STOP** and report the COMPLETE output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 23 connections, 81 anchors, 20 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run these read-only commands. Do NOT stop on their results. Copy the RAW output of each (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -3`
3. `git ls-files | Select-String -Pattern "\.env"`

## STEP 1: Install the library component
Run:
```
npx shadcn@latest add @react-bits/StaggeredMenu-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP and report.**
- If it asks whether to overwrite any existing file: answer **no**, then STOP and report which file.
- If it says the component or registry was not found: STOP and report the exact message.
- The package `gsap` is expected to be added. Report its version in Step 3.

Check that the file `src/components/StaggeredMenu.tsx` now exists. If it does not: **STOP** and report the COMPLETE output of the command and where the file was created (run `git status --short`).

Run this ONE command and copy the RAW output:
```
foreach ($p in @("export default StaggeredMenu","closeOnClickAway","isFixed","logoUrl","sm-panel-item","sm-toggle","staggered-menu-panel","from 'gsap'")) { "$p : " + @(Select-String -Path src/components/StaggeredMenu.tsx -SimpleMatch -Pattern $p).Count }
```
Every line must end with a number that is 1 or higher. If any line ends with 0: **STOP** and report the RAW output ("the installed library file is not the one this packet was written for"). Do not edit the file.

Run `git status --short` and `git diff --stat`. The changed tracked files must be ONLY `package.json` and `package-lock.json`. The only new file must be `src/components/StaggeredMenu.tsx` (the untracked entries `-files .env` and `packets/...` do not count). If ANY other file is new or changed: **STOP** and report the COMPLETE output. Do not commit.

## STEP 2: Create `src/lib/screens.ts`
Create the file `src/lib/screens.ts` with exactly this content:
```ts
import { useEffect, useState } from "react"

// AB:MENU.NAV:START
// The four screens of the app, and how the page address (for example #timer) chooses one of them.
// The menu (see MENU in CODE_MAP.md) builds its items from SCREENS. See CONNECTIONS.md C24.
export type ScreenId = "overview" | "timer" | "calendar" | "guide"

export const SCREENS: { id: ScreenId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "timer", label: "Pro Timer" },
  { id: "calendar", label: "Calendar" },
  { id: "guide", label: "Guide" },
]

function readScreen(): ScreenId {
  const wanted = window.location.hash.replace("#", "")
  return SCREENS.find((s) => s.id === wanted)?.id ?? "overview"
}

export function useScreen(): ScreenId {
  const [screen, setScreen] = useState<ScreenId>(readScreen)
  useEffect(() => {
    const onChange = () => setScreen(readScreen())
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return screen
}
// AB:MENU.NAV:END
```

## STEP 3: Create `src/menu.css`
Create the file `src/menu.css` with exactly this content:
```css
/* Styles of the menu. Tag: see CODE_MAP.md in the project root. */

/* AB:MENU.LOOK:START */
/* The library component Staggered Menu draws a white panel with black text and has its own css inside the component. Every rule below starts with .ab-menu and the library class .sm-scope, so it is more specific than the library css and wins without editing the library file. If the library file is installed again in a newer version and a class is renamed, the look quietly goes back to white: see CONNECTIONS.md C25. */

/* The box that holds the menu: fixed over the whole screen, and it lets every tap through. Only the button and the panel take taps again (the library does that). */
.ab-menu {
  position: fixed;
  inset: 0;
  z-index: 40;
  overflow: hidden;
  pointer-events: none;
}

/* The library always draws a logo. We have none here, so it is hidden, and the button goes to the right. */
.ab-menu .sm-scope .sm-logo {
  display: none;
}

.ab-menu .sm-scope .staggered-menu-header {
  justify-content: flex-end;
  padding: 20px 24px;
}

.ab-menu .sm-scope .sm-toggle {
  font-size: 18px;
  padding: 6px 0;
}

/* The panel: solid dark. The blur is switched off with !important on purpose: the library sets it inline on the panel, and a blur over the moving background made the front page laggy on the phone (CONNECTIONS.md C22, C25). */
.ab-menu .sm-scope .staggered-menu-panel {
  background: #050505;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* The items: white text, smaller on a phone so that "PRO TIMER" fits on one row. */
.ab-menu .sm-scope .sm-panel-item {
  color: #fff;
  font-size: clamp(2.4rem, 12vw, 3.5rem);
  padding-right: 0;
}

.ab-menu .sm-scope .sm-panel-item:hover {
  color: rgba(255, 255, 255, 0.55);
}
/* AB:MENU.LOOK:END */
```

## STEP 4: Create `src/components/AppMenu.tsx`
Create the file `src/components/AppMenu.tsx` with exactly this content:
```tsx
import type { MouseEvent } from "react"
import StaggeredMenu from "@/components/StaggeredMenu"
import { SCREENS } from "@/lib/screens"
import "../menu.css"

// AB:MENU.PANEL:START
// The menu: a button in the top right corner that opens a panel with the four screens.
// It is the library component Staggered Menu (src/components/StaggeredMenu.tsx, never edited). Only its settings are here.
// The library always draws a logo and does not close the panel when an item is tapped. So: the logo is a 1 pixel see-through picture (hidden in menu.css), and a tap on an item also presses the menu button once, which closes the panel. See CONNECTIONS.md C24 and C25.
const NO_LOGO = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="

const ITEMS = SCREENS.map((s) => ({
  label: s.label,
  ariaLabel: "Go to " + s.label,
  link: "#" + s.id,
}))

export default function AppMenu() {
  function closeAfterItemTap(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest(".sm-panel-item")) {
      e.currentTarget.querySelector<HTMLButtonElement>(".sm-toggle")?.click()
    }
  }
  return (
    <div className="ab-menu" onClick={closeAfterItemTap}>
      <StaggeredMenu
        isFixed={false}
        position="right"
        colors={["#16161a", "#26262d"]}
        items={ITEMS}
        displaySocials={false}
        displayItemNumbering={false}
        logoUrl={NO_LOGO}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#ffffff"
        changeMenuColorOnOpen={false}
        accentColor="#ffffff"
        closeOnClickAway={true}
      />
    </div>
  )
}
// AB:MENU.PANEL:END
```

## STEP 5: Replace `src/components/SignedInStub.tsx`
First check: the file must contain the text `Temporary screen. The real app comes next.` exactly once. If not: **STOP** and report.
Then replace the ENTIRE contents of `src/components/SignedInStub.tsx` with exactly this:
```tsx
import AppMenu from "@/components/AppMenu"
import DarkVeil from "@/components/DarkVeil"
import { supabase } from "@/lib/supabase"
import { LITE_LEVEL } from "@/lib/lite"
import { SCREENS, useScreen } from "@/lib/screens"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
// The background is Dark Veil. It sits in the same ab-bg box, with the same lite mode, as the front page. See CONNECTIONS.md C23.
// The title is the name of the screen chosen in the menu (the list is in src/lib/screens.ts). The four screens are empty placeholders for now. The menu (AppMenu) sits BESIDE the main element, not inside it, see CONNECTIONS.md C25.
export default function SignedInStub({ email }: { email: string }) {
  const screen = useScreen()
  const title = SCREENS.find((s) => s.id === screen)?.label ?? ""
  return (
    <>
      <main className="ab-stub">
        <div className="ab-bg" data-lite={LITE_LEVEL > 0 ? "on" : undefined}>
          <DarkVeil
            hueShift={0}
            noiseIntensity={0.11}
            scanlineIntensity={0}
            speed={LITE_LEVEL === 2 ? 0 : 0.8}
            scanlineFrequency={0.5}
            warpAmount={5}
            resolutionScale={1}
            lightMode={false}
          />
        </div>
        <p className="ab-stub-title">{title}</p>
        <p className="ab-stub-line">{email}</p>
        <p className="ab-stub-note">Temporary placeholder. The real screen comes later.</p>
        <button
          className="ab-stub-button"
          type="button"
          onClick={() => void supabase?.auth.signOut()}
        >
          Sign out
        </button>
      </main>
      <AppMenu />
    </>
  )
}
// AB:AUTH.STUB:END
```

## STEP 6: Edit `CODE_MAP.md`
Four changes. Change nothing else in the file.

**6a.** Replace this whole line (in the "Page codes" table):
```
| MENU | Overlay menu with the hamburger button (not built yet) |
```
with this whole line:
```
| MENU | The menu: a button in the top right corner that opens a panel with the four screens |
```

**6b.** Replace this whole line (in the AUTH table):
```
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button, on a Dark Veil background | `src/components/SignedInStub.tsx`, `src/auth.css` | the Dark Veil props: speed, noiseIntensity, warpAmount, hueShift, scanlineIntensity, scanlineFrequency (resolutionScale must stay 1 and lightMode must stay false, see CONNECTIONS.md C23); the screen itself is thrown away when the real app shell is built |
```
with this whole line:
```
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button, on a Dark Veil background; its title is the name of the screen chosen in the menu | `src/components/SignedInStub.tsx`, `src/auth.css` | the Dark Veil props: speed, noiseIntensity, warpAmount, hueShift, scanlineIntensity, scanlineFrequency (resolutionScale must stay 1 and lightMode must stay false, see CONNECTIONS.md C23); the screen itself is thrown away when the real app shell is built |
```

**6c.** Find the line `## Library components (installed React Bits source: not tagged, never edited)`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new section and that heading):
```markdown
## MENU (the menu)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:MENU.NAV` | The list of the four screens (id and name) and the reading of the page address (#timer) that chooses one | `src/lib/screens.ts` | the names of the screens; a new screen needs a new line here (see CONNECTIONS.md C24) |
| `AB:MENU.PANEL` | The menu itself: the Staggered Menu with its settings (side, layer colours, button colour, items) | `src/components/AppMenu.tsx` | the side it opens from (position), the colours of the sliding layers (colors); isFixed and displayItemNumbering must stay as they are (see CONNECTIONS.md C25) |
| `AB:MENU.LOOK` | The dark look of the menu: panel colour, text size, button size, the box that holds it | `src/menu.css` | colours and sizes; the blur must stay switched off (see CONNECTIONS.md C25) |

```

**6d.** Directly UNDER this line (in the "Library components" table), add the new line below it. Do not change the old line:
```
| FuzzyText (the ASHBORN name) | `src/components/FuzzyText.tsx` | `AB:LOGIN.BRAND` |
```
New line to add:
```
| Staggered Menu (the menu) | `src/components/StaggeredMenu.tsx` | `AB:MENU.PANEL` |
```

## STEP 7: Edit `CONNECTIONS.md`
Add TWO new entries, C24 and C25. Change nothing else in the file. Find the line `## Things to know (no check is possible)`. KEEP that line. Directly ABOVE it add exactly this (it ends with one empty line, so there is an empty line between the new entries and that heading):
```markdown
### C24: The menu items and the screens come from one list, and the page address (#timer) joins them
- Tags: `AB:MENU.NAV`, `AB:MENU.PANEL`, `AB:AUTH.STUB`
- If you change: the list SCREENS (an id or a name), the way the address is read (NAV), the item link in PANEL, or the title in STUB
- Then also: PANEL builds its four items from SCREENS, and the link of each item is the sign # followed by the id (for example #timer). The library draws each item as a normal link, so a tap changes the address, and NAV (useScreen) reads it again through the hashchange event. STUB shows the name of the chosen screen as its title. A new screen needs a new id in SCREENS (the id is also the text in the page address) and later its own screen. A tap on an item also presses the menu button once so the panel closes (closeAfterItemTap in PANEL): that relies on the library class names sm-panel-item and sm-toggle (see C25).
- If you forget: an item that changes nothing, a title that does not follow the menu, or a panel that stays open after a tap.
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = export const SCREENS`
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = window.location.hash`
- Anchor: `AB:MENU.NAV @ src/lib/screens.ts = "hashchange"`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = SCREENS.map(`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = link: "#" + s.id,`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = closest(".sm-panel-item")`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = querySelector<HTMLButtonElement>(".sm-toggle")`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = useScreen()`
- Anchor: `src/components/SignedInStub.tsx = import { SCREENS, useScreen } from "@/lib/screens"`

### C25: The menu look is css written against the class names of the library file
- Tags: `AB:MENU.PANEL`, `AB:MENU.LOOK`, `AB:AUTH.STUB`
- If you change: the box class ab-menu (PANEL and LOOK), any rule of LOOK, the settings isFixed or displayItemNumbering in PANEL, the place of AppMenu in STUB, or the library file StaggeredMenu.tsx (installed again, or a newer version)
- Then also: the library draws a white panel with black text and has its own css inside the component. LOOK turns it dark with rules that start with .ab-menu and .sm-scope; they are more specific than the library rules, so they win without editing the library file. The blur is switched off with !important on purpose: the library sets the blur inline on the panel, an inline value loses only to !important, and a blur over the moving background is the kind of effect that made the front page laggy on the phone (see C22). The library always draws a logo: PANEL gives it a 1 pixel see-through picture (so no file is requested) and LOOK hides it. The box .ab-menu is fixed over the whole screen and lets taps through (pointer-events: none); only the button and the panel take taps again. The stub rule .ab-stub > :not(.ab-bg) (C23) would make the box relative and break it, so AppMenu stays BESIDE the main element in STUB, never inside it. isFixed stays false because the box .ab-menu is the fixed part. displayItemNumbering stays false because the number would sit on top of the text at the smaller text size.
- If you forget: a white panel with black text, a blurred panel that makes the phone lag, taps on the page not reaching the Sign out button, or the menu button in the wrong place.
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = className="ab-menu"`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = isFixed={false}`
- Anchor: `AB:MENU.PANEL @ src/components/AppMenu.tsx = displayItemNumbering={false}`
- Anchor: `AB:MENU.LOOK @ src/menu.css = .ab-menu {`
- Anchor: `AB:MENU.LOOK @ src/menu.css = pointer-events: none;`
- Anchor: `AB:MENU.LOOK @ src/menu.css = .ab-menu .sm-scope .staggered-menu-panel {`
- Anchor: `AB:MENU.LOOK @ src/menu.css = backdrop-filter: none !important;`
- Anchor: `AB:MENU.LOOK @ src/menu.css = -webkit-backdrop-filter: none !important;`
- Anchor: `AB:MENU.LOOK @ src/menu.css = .ab-menu .sm-scope .sm-panel-item {`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = <AppMenu />`
- Check by hand: after any change open the signed-in screen on a laptop and on the phone. The menu button (the word Menu and a plus) is in the top right corner. A tap opens a dark panel (the full width on a phone, a column on the right on a laptop) with Overview, Pro Timer, Calendar and Guide. A tap on an item changes the title of the screen and closes the panel. The Sign out button still works when the panel is closed. The checker does not see how it looks.

```

## STEP 8: Check the files, the checker and the build
Run:
```
Select-String -Path src/components/SignedInStub.tsx -Pattern "AppMenu"
```
It must print exactly 2 lines (the import and the `<AppMenu />` tag). Copy the RAW output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 17 tags, 25 places
CONNECTIONS OK: 25 connections, 100 anchors, 21 classes, 1 css variables, 2 label links
```
(17 tags, 25 places: three new tags. 25 connections, 100 anchors, 21 classes: the new entries C24 and C25 and the new class ab-menu. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless. A warning that a module level directive "use client" was ignored is also harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list ONLY `CODE_MAP.md`, `CONNECTIONS.md`, `package-lock.json`, `package.json` and `src/components/SignedInStub.tsx`. If ANY other tracked file is changed: **STOP** and report the COMPLETE output. Do not commit. (Untracked `??` entries do not count.)

## STEP 9: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 04F: the menu (Staggered Menu) is on the signed-in screen, with four placeholder screens: Overview, Pro Timer, Calendar, Guide.
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 10: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add package.json package-lock.json src/components/StaggeredMenu.tsx src/components/AppMenu.tsx src/lib/screens.ts src/menu.css src/components/SignedInStub.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 04F: menu (Staggered Menu) on the signed-in screen"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git status --short` and copy its raw output. Files that were not part of this packet may still show as untracked (`??`). Leave them alone.

## STEP 11: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, the first line of `git log --oneline -3` ended with `Packet 04E: Dark Veil on the signed-in screen`, and `node scripts/check-tags.mjs` printed the two lines of Step 0 (81 anchors).
2. The install command finished without asking for a key, account or payment, and every line of the marker check in Step 1 ended with 1 or higher.
3. `src/App.tsx`, `src/login.css`, `src/auth.css`, `src/components/DarkVeil.tsx`, `src/components/PatternWaves.tsx` and `src/components/StaggeredMenu.tsx` were not edited by hand.
4. `node scripts/check-tags.mjs` printed the two lines of Step 8 (25 connections, 100 anchors).
5. `npm run build` finished with no errors.
6. `git show --stat HEAD` lists only `package.json`, `package-lock.json`, `src/components/StaggeredMenu.tsx`, `src/components/AppMenu.tsx`, `src/lib/screens.ts`, `src/menu.css`, `src/components/SignedInStub.tsx`, `CODE_MAP.md`, `CONNECTIONS.md` and `PROGRESS.md`.
7. The first line of `git log --oneline` ends with `Packet 04F: menu (Staggered Menu) on the signed-in screen`.
8. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
9. `git push` finished without an error.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 9 done-checks
- the RAW outputs of the 3 commands of Step 0
- the RAW output of the marker check of Step 1, and of `git diff package.json` (the line for gsap with its version)
- the RAW output of the `Select-String` command of Step 8
- the exact output of `node scripts/check-tags.mjs` from Step 8
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 8
- the RAW output of `git ls-files | Select-String -Pattern "\.env"` and the exact output of `git show --stat HEAD`
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the page himself.
