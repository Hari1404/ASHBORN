# PACKET 03B: PHONE SPEED (LITE MODE)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. Copy every text character for character.
- Install nothing. Create or edit ONLY these 8 files: `src/lib/lite.ts` (new), `src/App.tsx`, `src/components/LoginCard.tsx`, `src/components/LoginBrand.tsx`, `src/login.css`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do not edit any other file, including this packet file.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 9 is allowed.
- For every FIND and REPLACE: the FIND text must appear EXACTLY ONCE in that file at the moment you apply it. If it appears zero times or more than once: **STOP** and report the file and the edit number. Do not guess.
- For the 3 files that are replaced as a whole (Step 2): replace the ENTIRE contents of the file with the text given, nothing kept from the old content.
- If any step fails, or the build fails, or the checker fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.**

## WHAT THIS BUILDS
The login page is very laggy on a real phone (the owner tried it through the Vercel link). It runs fine on a laptop. This packet adds LITE MODE, a lighter way to draw the page that is switched on for touch screens.
1. On a touch screen (every phone and tablet) the page runs in lite mode, level 1: the glass card becomes a plain dark box (no glass effect, no blur behind it); the moving background is drawn at half size and scaled back up by the css, so the phone draws a quarter of the pixels (it looks the same, slightly softer edges); the ASHBORN name in the corner is drawn 30 times a second instead of 60.
2. On a laptop with a mouse nothing changes: the full look stays exactly as it is.
3. The page address can force a level, so the owner can compare on the same phone without a new deploy: add `?lite=0` (full look), `?lite=1` (lite) or `?lite=2` (lite, and the background stands still after its 2 second intro). Example: `https://<the-vercel-link>/?lite=2`
4. New tag `AB:LOGIN.LITE`, new file `src/lib/lite.ts`, new connections C21 and C22 in `CONNECTIONS.md`. The checker must print the two lines of Step 7.
5. At the end the packet commits ONLY the 8 files named in Step 9 and pushes to GitHub (Vercel then builds the new version by itself).

---

## STEP 0: Check what this packet needs
Check that all of these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/App.tsx`, `src/login.css`, `src/components/LoginCard.tsx`, `src/components/LoginBrand.tsx`, `src/lib/supabase.ts`.
- If `src/lib/supabase.ts` is missing, Packet 03A has not been run: **STOP** and report "Packet 03A has not been run."
- If any other file is missing: **STOP** and report which.
- If `src/lib/lite.ts` already exists: **STOP** and report "Packet 03B has already been run."

Check that these three files contain the given text (a read-only check, so that Step 2 does not wipe out something unknown). If one does not, **STOP** and report which:
- `src/App.tsx` contains `AB:AUTH.GATE:START`
- `src/components/LoginCard.tsx` contains `signInWithPassword`
- `src/components/LoginBrand.tsx` contains `fuzzRange={30}`

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 13 tags, 21 places
CONNECTIONS OK: 20 connections, 59 anchors, 19 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run these read-only commands, one by one. Do NOT stop on their results and do NOT fix anything. Just copy the RAW output of each under its number (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -6`
3. `Select-String -Path src/login.css -Pattern "Phone text is bigger"`
4. `Get-ChildItem -Force | Select-Object Name, Length`
5. `git ls-files | Select-String -Pattern "\.env"`
6. `git check-ignore -v .env`

## STEP 1: Create `src/lib/lite.ts`
Create the file `src/lib/lite.ts` with exactly this content:
```ts
// AB:LOGIN.LITE:START
// Lite mode: a lighter way to draw the front page, made for phones.
// Level 0 = the full look (laptop). Level 1 = lite: a plain dark card instead of the glass, the background drawn at half size, the name at 30 frames per second.
// Level 2 = level 1, and the background stands still after its short intro.
// A touch screen gets level 1. The page address can force a level: add ?lite=0, ?lite=1 or ?lite=2 to it.
// The level is read once, when the page loads. See CONNECTIONS.md C22 for the places that use it.
export type LiteLevel = 0 | 1 | 2

function readLiteLevel(): LiteLevel {
  if (typeof window === "undefined") return 0
  const forced = new URLSearchParams(window.location.search).get("lite")
  if (forced === "0") return 0
  if (forced === "1") return 1
  if (forced === "2") return 2
  return window.matchMedia("(pointer: coarse)").matches ? 1 : 0
}

export const LITE_LEVEL: LiteLevel = readLiteLevel()
// AB:LOGIN.LITE:END
```
## STEP 2: Replace the ENTIRE contents of three files
Each of the three files below gets completely new contents. Do them in this order.

### File 1 of 3: `src/App.tsx`
Replace the ENTIRE contents of `src/App.tsx` with exactly this:
```tsx
import PatternWaves from "@/components/PatternWaves"
import LoginCard from "@/components/LoginCard"
import LoginHero from "@/components/LoginHero"
import LoginBrand from "@/components/LoginBrand"
import "./login.css"
import SignedInStub from "@/components/SignedInStub"
import { useSession } from "@/lib/useSession"
import { LITE_LEVEL } from "@/lib/lite"

// AB:AUTH.GATE:START
// Chooses the screen: blank while the saved sign-in is read, the front page when nobody is signed in, the temporary signed-in screen otherwise.
export default function App() {
  const session = useSession()
  if (session === "loading") return <main className="ab-screen" />
  if (session) return <SignedInStub email={session.user.email ?? ""} />
  return <LoginScreen />
}
// AB:AUTH.GATE:END

function LoginScreen() {
  return (
    <main className="ab-screen">
      {/* AB:LOGIN.BG:START */}
      {/* Lite mode (src/lib/lite.ts): the animation is drawn at half size and the css scales it back up. That is why spacing and scale have a second, lite value: half of the full value. See CONNECTIONS.md C21. */}
      <div className="ab-bg" data-lite={LITE_LEVEL > 0 ? "on" : undefined}>
        <PatternWaves
          color="#ffffff"
          backgroundColor="#000000"
          pattern="square"
          wave="silk"
          characters=".:-=+*#%@"
          spacing={LITE_LEVEL > 0 ? 4 : 8}
          markSize={0.9}
          depth={1.05}
          light={0}
          shine={0.5}
          contrast={1.25}
          speed={0.7}
          scale={LITE_LEVEL > 0 ? 0.575 : 1.15}
          direction={33}
          fade="none"
          fadeSize={0.35}
          opacity={1}
          interactive={false}
          cursorSize={50}
          cursorStrength={0.6}
          intro={true}
          paused={LITE_LEVEL === 2}
        />
      </div>
      {/* AB:LOGIN.BG:END */}
      {/* AB:LOGIN.BRAND:START */}
      <LoginBrand />
      {/* AB:LOGIN.BRAND:END */}
      {/* AB:LOGIN.LAYOUT:START */}
      <div className="ab-center">
        <LoginHero />
        <LoginCard />
      </div>
      {/* AB:LOGIN.LAYOUT:END */}
    </main>
  )
}
```

### File 2 of 3: `src/components/LoginCard.tsx`
Replace the ENTIRE contents of `src/components/LoginCard.tsx` with exactly this:
```tsx
import { useState } from "react"
import type { FormEvent } from "react"
import { supabase, userIdToEmail } from "@/lib/supabase"
import { LITE_LEVEL } from "@/lib/lite"
import GlassSurface from "@/components/GlassSurface"
import "../login.css"

// AB:LOGIN.GLASS:START
// All glass settings are here, in one place. The darkness is --ab-glass-tint in src/login.css.
// In lite mode (src/lib/lite.ts) the card is a plain dark box and GlassSurface is not used; the box takes its width and corner radius from this same object.
const GLASS = {
  width: "min(100%, 440px)",
  height: "auto",
  borderRadius: 22,
  borderWidth: 0.07,
  brightness: 50,
  opacity: 0.93,
  blur: 11,
  displace: 4,
  backgroundOpacity: 0,
  saturation: 1,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 0,
  blueOffset: 0,
}
// AB:LOGIN.GLASS:END

export default function LoginCard() {
  // AB:LOGIN.SUBMIT:START
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const userId = String(form.get("username") ?? "")
    const password = String(form.get("password") ?? "")
    if (!supabase) {
      setMessage("Not connected. The .env file is missing or not filled in.")
      return
    }
    const email = userIdToEmail(userId)
    if (!email) {
      setMessage("User ID: use 2 to 20 letters or digits.")
      return
    }
    if (password === "") {
      setMessage("Enter your password.")
      return
    }
    setBusy(true)
    setMessage("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.code === "invalid_credentials") {
        setMessage("User ID or password is wrong.")
      } else if (error.code === "email_not_confirmed") {
        setMessage("This account is not confirmed yet. Confirm it in the Supabase dashboard.")
      } else {
        setMessage("Could not sign in. Check the internet and try again.")
      }
      setBusy(false)
    }
  }
  // AB:LOGIN.SUBMIT:END

  const form = (
    <form className="ab-content" onSubmit={handleSubmit}>
      {/* AB:LOGIN.FORM:START */}
      <p className="ab-subtitle">Sign in to continue</p>
      <div className="ab-field">
        <label className="ab-label" htmlFor="ab-userid">
          User ID
        </label>
        <input
          className="ab-input"
          id="ab-userid"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>
      <div className="ab-field">
        <label className="ab-label" htmlFor="ab-password">
          Password
        </label>
        <input
          className="ab-input"
          id="ab-password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
      </div>
      {message ? (
        <p className="ab-error" role="alert">
          {message}
        </p>
      ) : null}
      {/* AB:LOGIN.FORM:END */}
      {/* AB:LOGIN.BUTTON:START */}
      <button className="ab-button" type="submit" disabled={busy}>
        Sign in
      </button>
      {/* AB:LOGIN.BUTTON:END */}
    </form>
  )

  if (LITE_LEVEL > 0) {
    return (
      <div className="ab-glass ab-glass-lite" style={{ width: GLASS.width, borderRadius: GLASS.borderRadius }}>
        {form}
      </div>
    )
  }

  return (
    <GlassSurface {...GLASS} className="ab-glass">
      {form}
    </GlassSurface>
  )
}
```

### File 3 of 3: `src/components/LoginBrand.tsx`
Replace the ENTIRE contents of `src/components/LoginBrand.tsx` with exactly this:
```tsx
import FuzzyText from "@/components/FuzzyText"
import { LITE_LEVEL } from "@/lib/lite"
import "../login.css"

// AB:LOGIN.BRAND:START
// The ASHBORN name in the top left corner. All Fuzzy Text settings are here, in one place.
// fuzzRange is linked to margin-left in src/login.css (see CONNECTIONS.md).
export default function LoginBrand() {
  return (
    <div className="ab-brand" role="img" aria-label="ASHBORN">
      <FuzzyText
        fontSize={30}
        fontWeight={800}
        fontFamily='"Syne Variable", sans-serif'
        color="#fff"
        enableHover={true}
        baseIntensity={0.2}
        hoverIntensity={0.5}
        fuzzRange={30}
        fps={LITE_LEVEL > 0 ? 30 : 60}
        direction="horizontal"
        transitionDuration={0}
        clickEffect={true}
        glitchMode={true}
        glitchInterval={2000}
        glitchDuration={200}
        letterSpacing={-1}
      >
        ASHBORN
      </FuzzyText>
    </div>
  )
}
// AB:LOGIN.BRAND:END
```

## STEP 3: Edit `src/login.css`
Make these 2 edits, in this order. Change nothing else in the file.

### Edit 1 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
.ab-bg {
```

**REPLACE WITH (this exact text):**
```css
/* Lite mode (src/lib/lite.ts): the animation is drawn at half size and scaled back up, so a phone draws a quarter of the pixels. This rule is more specific than .ab-bg below, so it wins. The 50%, the scale(2) and the lite values of spacing and scale in App.tsx are linked, see CONNECTIONS.md C21. */
.ab-bg[data-lite] {
  inset: auto;
  top: 0;
  left: 0;
  width: calc(50% + 1px);
  height: calc(50% + 1px);
  transform: scale(2);
  transform-origin: 0 0;
}

.ab-bg {
```

### Edit 2 in `src/login.css`

**FIND (this exact text, it must appear exactly once in the file):**
```css
/* AB:LOGIN.GLASS:END */
```

**REPLACE WITH (this exact text):**
```css
/* Lite mode (phones, see src/lib/lite.ts): the card is a plain dark box and GlassSurface is not used. Nothing blurs the animation behind it, so it is darker than the glass. The 8px padding is what GlassSurface adds around its content. This rule must stay below .ab-glass: it replaces the tint set there. */
.ab-glass-lite {
  --ab-glass-tint: rgba(0, 0, 0, 0.82);
  box-sizing: border-box;
  padding: 8px;
}
/* AB:LOGIN.GLASS:END */
```

## STEP 4: Edit `CODE_MAP.md`
Make these 3 edits, in this order. Change nothing else in the file.

### Edit 1 in `CODE_MAP.md`

**FIND (this exact text, it must appear exactly once in the file):**
```md
| `AB:LOGIN.BG` | The moving background (Pattern Waves) | `src/App.tsx` | its props, for example speed, scale, direction, colours, wave style |
```

**REPLACE WITH (this exact text):**
```md
| `AB:LOGIN.BG` | The moving background (Pattern Waves) | `src/App.tsx` | its props, for example speed, scale, direction, colours, wave style (spacing and scale have a second, lite value, see CONNECTIONS.md C21) |
```

### Edit 2 in `CODE_MAP.md`

**FIND (this exact text, it must appear exactly once in the file):**
```md
The dark glass card: frost, edge refraction, size, darkness
```

**REPLACE WITH (this exact text):**
```md
The dark glass card: frost, edge refraction, size, darkness. In lite mode (phones) it is a plain dark box instead of the glass
```

### Edit 3 in `CODE_MAP.md`

**FIND (this exact text, it must appear exactly once in the file):**
```md
| `AB:LOGIN.BUTTON` | The Sign in button and its hover effect | `src/components/LoginCard.tsx`, `src/login.css` | wording; colours, glow and speed in the css |
```

**REPLACE WITH (this exact text):**
```md
| `AB:LOGIN.BUTTON` | The Sign in button and its hover effect | `src/components/LoginCard.tsx`, `src/login.css` | wording; colours, glow and speed in the css |
| `AB:LOGIN.LITE` | Lite mode: decides if the front page is drawn the light way (phones) or the full way (laptop); the page address can force a level with ?lite=0, ?lite=1 or ?lite=2 | `src/lib/lite.ts` | which devices get lite (the touch-screen test); what each level means is written in the comment at the top of the file |
```

## STEP 5: Edit `CONNECTIONS.md`
Make these 3 edits, in this order. Change nothing else in the file.

### Edit 1 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```md
## Connections on the AUTH plumbing
```

**REPLACE WITH (this exact text):**
```md
### C21: The lite background is drawn at half size and scaled back up
- Tags: `AB:LOGIN.BG`, `AB:LOGIN.LAYOUT`
- If you change: spacing or scale of the background in BG, or the size or scale lines of `.ab-bg[data-lite]` in LAYOUT
- Then also: in lite mode the animation is drawn in a box of half the size (50% wide and high, plus 1px) and the css scales it up by 2 (scale(2)). A phone then draws a quarter of the pixels. So the lite value of spacing must be half of the full value (now 4 and 8) and the lite value of scale must be half of the full value (now 0.575 and 1.15); otherwise the dots and waves look twice as big or small in lite mode. Spacing cannot go below 4 (the component's own limit), so with a full spacing of 8 the box cannot be shrunk by more than 2. The attribute data-lite in App.tsx and the css selector `.ab-bg[data-lite]` are linked by that name.
- If you forget: lite mode shows the wrong dot size or wave size, or the background stays full size and the phone stays slow (a misspelled data-lite is not an error anywhere).
- Anchor: `AB:LOGIN.BG @ src/App.tsx = spacing={LITE_LEVEL > 0 ? 4 : 8}`
- Anchor: `AB:LOGIN.BG @ src/App.tsx = scale={LITE_LEVEL > 0 ? 0.575 : 1.15}`
- Anchor: `AB:LOGIN.BG @ src/App.tsx = data-lite={`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg[data-lite] {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = width: calc(50% + 1px);`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = height: calc(50% + 1px);`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = transform: scale(2);`
- Check by hand: after any change look at the page on a laptop with ?lite=0 and with ?lite=1 in the page address. The dots and the waves must look the same size in both.

### C22: Lite mode is one switch that three files read
- Tags: `AB:LOGIN.LITE`, `AB:LOGIN.BG`, `AB:LOGIN.BRAND`, `AB:LOGIN.GLASS`
- If you change: how lite is decided or what its levels mean (the file src/lib/lite.ts), or add or remove a lite effect
- Then also: LITE_LEVEL is read in three files. App.tsx (BG): half-size background with its own spacing and scale (see C21), and a still background at level 2. LoginCard.tsx: at level 1 and 2 the card is a plain dark box with the classes ab-glass and ab-glass-lite instead of GlassSurface; the box takes its width and corner radius from the GLASS object, so it adds no new place for the card width in C01. LoginBrand.tsx (BRAND): 30 frames per second instead of 60. The css of the plain box is `.ab-glass-lite` in GLASS (login.css); it must stay below `.ab-glass` because it replaces the tint set there. The page address can force a level: ?lite=0 full look, ?lite=1 lite, ?lite=2 lite with a still background.
- If you forget: a phone gets the heavy glass again, or a laptop gets the lite look; a lite effect that is not listed here is forgotten the next time somebody changes lite mode.
- Anchor: `AB:LOGIN.LITE @ src/lib/lite.ts = export const LITE_LEVEL`
- Anchor: `src/App.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/LoginCard.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/LoginBrand.tsx = import { LITE_LEVEL } from "@/lib/lite"`
- Anchor: `src/components/LoginCard.tsx = className="ab-glass ab-glass-lite"`
- Anchor: `AB:LOGIN.GLASS @ src/login.css = .ab-glass-lite {`
- Check by hand: after any change look at the card on a laptop with ?lite=0 (glass) and ?lite=1 (plain dark box), then on the phone. The checker does not see how it looks or how smooth it is.

## Connections on the AUTH plumbing
```

### Edit 2 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```md
- The glass card redraws what is behind it while the background animates. Phone speed and battery with both together have NOT been tested. If a phone feels slow, the background speed (BG) and the glass settings (GLASS) are the first two things to look at.
```

**REPLACE WITH (this exact text):**
```md
- The glass card redraws what is behind it while the background animates. On a real phone (the Vercel link, 2026-10-05) the full look was very laggy and not smooth. The cause was reasoned, not measured: on Chrome the glass runs a displacement filter over the moving background on every frame, and the background is drawn at the full phone resolution. Lite mode (AB:LOGIN.LITE, C21, C22) was added for this. Whether lite is smooth on the phone has NOT been reported yet.
```

### Edit 3 in `CONNECTIONS.md`

**FIND (this exact text, it must appear exactly once in the file):**
```md
- The name in the corner (BRAND) is drawn on a canvas 60 times a second, on top of the moving background and the glass card. Phone speed and battery with all three together have NOT been tested. If a phone feels slow, lower fps in LoginBrand.tsx first.
```

**REPLACE WITH (this exact text):**
```md
- The name in the corner (BRAND) is drawn on a canvas 60 times a second on a laptop and 30 times a second in lite mode (LoginBrand.tsx). It sits on top of the moving background and the card.
```

## STEP 6: Check the build
Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

## STEP 7: Run the checker
Run:
```
node scripts/check-tags.mjs
```
It must print exactly these two lines and nothing else:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 22 connections, 72 anchors, 20 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

## STEP 8: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 03B: phone speed, lite mode on touch screens (plain dark card, half-size background, name at 30 frames per second); page address ?lite=0, ?lite=1 or ?lite=2 forces a level
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 9: Git commit (only the 8 named files)
Run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/lib/lite.ts src/App.tsx src/components/LoginCard.tsx src/components/LoginBrand.tsx src/login.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 03B: phone speed, lite mode"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git status --short` and copy its raw output. Files that were not part of this packet may still show as untracked (`??`). Leave them alone.

## STEP 10: Safety check, then push
First run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do NOT push.
If it printed nothing, run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit from Step 9 stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `node scripts/check-tags.mjs` prints exactly the two lines of Step 7.
3. `src/lib/lite.ts` exists and contains `AB:LOGIN.LITE:START` and `AB:LOGIN.LITE:END`.
4. `git show --stat HEAD` lists exactly 8 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/App.tsx`, `src/components/LoginBrand.tsx`, `src/components/LoginCard.tsx`, `src/lib/lite.ts`, `src/login.css`.
5. The first line of `git log --oneline` ends with `Packet 03B: phone speed, lite mode`.
6. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
7. `git push` finished without an error.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 7 done-checks
- the RAW outputs of the 6 read-only commands of Step 0
- the exact output of `git log --oneline -3`
- the exact output of `node scripts/check-tags.mjs`
- the exact output of `git show --stat HEAD`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
