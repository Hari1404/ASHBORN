# PACKET 04E: DARK VEIL ON THE PAGE AFTER LOGIN

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Edit ONLY these files: `src/components/SignedInStub.tsx`, `src/auth.css`, `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`. Do NOT edit `src/App.tsx` or `src/login.css` (the login page must not change at all). Do NOT edit `src/components/DarkVeil.tsx` or `src/components/PatternWaves.tsx`. Do not edit this packet file.
- Do not install or remove any package.
- NEVER open, print, copy, edit or delete the file `.env` or the file named `-files .env`. NEVER run `git add .` or `git add -A` in this packet. Only the exact `git add` line in Step 7 is allowed.
- Every "replace" below says where to look. The old text must be found EXACTLY ONCE. If it is found zero times or more than once: **STOP** and report which one. Do not guess.
- If any step fails, asks for a login, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**
- Your final reply MUST contain the raw outputs listed in WHEN DONE. A reply that only says PASS is a FAILED packet.

## WHAT THIS DOES
The login page keeps its Pattern Waves animation and is NOT touched. Dark Veil goes on the page that shows AFTER a sign in (today that is the temporary screen with "Signed in" and the Sign out button). It uses the settings from the owner's link: speed 0.8, noiseIntensity 0.11, scanlineFrequency 0.5, warpAmount 5. It reuses the same half-size lite box as the login page, so a phone stays light. It also updates the code map and the connections list so the checker stays happy.

---

## STEP 0: Check the starting state
Check that these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/components/SignedInStub.tsx`, `src/auth.css`, `src/lib/lite.ts`, `src/components/DarkVeil.tsx`. If `src/components/DarkVeil.tsx` is missing: **STOP** and report "Dark Veil is not installed." If any other file is missing: **STOP** and report which.

Run:
```
Select-String -Path src/components/SignedInStub.tsx -Pattern "DarkVeil"
```
It must print NOTHING. If it prints a line: **STOP** and report "Dark Veil is already on the signed-in screen."

Run `git status --short`. Lines that start with `??` are fine. If ANY line shows a changed tracked file: **STOP** and report the COMPLETE output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 22 connections, 72 anchors, 20 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run these read-only commands. Do NOT stop on their results. Copy the RAW output of each (write EMPTY if nothing prints):
1. `git status --short`
2. `git log --oneline -3`
3. `git ls-files | Select-String -Pattern "\.env"`

## STEP 1: Replace `src/components/SignedInStub.tsx`
First check: the file must contain the text `Temporary screen. The real app comes next.` exactly once. If not: **STOP** and report.
Then replace the ENTIRE contents of `src/components/SignedInStub.tsx` with exactly this:
```tsx
import DarkVeil from "@/components/DarkVeil"
import { supabase } from "@/lib/supabase"
import { LITE_LEVEL } from "@/lib/lite"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
// The background is Dark Veil. It sits in the same ab-bg box, with the same lite mode, as the front page. See CONNECTIONS.md C23.
export default function SignedInStub({ email }: { email: string }) {
  return (
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
      <p className="ab-stub-title">Signed in</p>
      <p className="ab-stub-line">{email}</p>
      <p className="ab-stub-note">Temporary screen. The real app comes next.</p>
      <button
        className="ab-stub-button"
        type="button"
        onClick={() => void supabase?.auth.signOut()}
      >
        Sign out
      </button>
    </main>
  )
}
// AB:AUTH.STUB:END
```

## STEP 2: Edit `src/auth.css`
Find the line `/* AB:AUTH.STUB:END */` (it is the last line of the file). KEEP that line. Directly ABOVE it, add one empty line and then exactly these lines:
```css
/* The Dark Veil background is the div with the class ab-bg. login.css places and sizes it (CONNECTIONS.md C23). The rule below lifts the text and the button above it. */
.ab-stub > :not(.ab-bg) {
  position: relative;
  z-index: 1;
}
```
Change nothing else in the file.

## STEP 3: Edit `CODE_MAP.md`
Two changes. Change nothing else in the file.

**3a.** Replace this whole line (in the AUTH table):
```
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button | `src/components/SignedInStub.tsx`, `src/auth.css` | thrown away when the real app shell is built |
```
with this whole line:
```
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button, on a Dark Veil background | `src/components/SignedInStub.tsx`, `src/auth.css` | the Dark Veil props: speed, noiseIntensity, warpAmount, hueShift, scanlineIntensity, scanlineFrequency (resolutionScale must stay 1 and lightMode must stay false, see CONNECTIONS.md C23); the screen itself is thrown away when the real app shell is built |
```

**3b.** Directly UNDER this line (in the "Library components" table), add the new line below it. Do not change the old line:
```
| Pattern Waves (moving background) | `src/components/PatternWaves.tsx` | `AB:LOGIN.BG` |
```
New line to add:
```
| Dark Veil (moving background of the signed-in screen) | `src/components/DarkVeil.tsx` | `AB:AUTH.STUB` |
```

## STEP 4: Edit `CONNECTIONS.md`
Four changes. Change nothing else in the file.

**4a.** Replace this heading line:
```
### C22: Lite mode is one switch that three files read
```
with:
```
### C22: Lite mode is one switch that four files read
```

**4b.** Replace this text (it is inside entry C22, in the "Then also" line):
```
LITE_LEVEL is read in three files. App.tsx (BG):
```
with:
```
LITE_LEVEL is read in four files. SignedInStub.tsx (STUB): the Dark Veil background of the signed-in screen, in the same half-size box, with speed 0 at level 2 (see C23). App.tsx (BG):
```

**4c.** In entry C22, directly UNDER this line, add the new line below it. Do not change the old line:
```
- Anchor: `src/components/LoginBrand.tsx = import { LITE_LEVEL } from "@/lib/lite"`
```
New line to add:
```
- Anchor: `src/components/SignedInStub.tsx = import { LITE_LEVEL } from "@/lib/lite"`
```

**4d.** Add a NEW entry C23. Find the line `## Things to know (no check is possible)`. Directly ABOVE it, add exactly this (it ends with one empty line, so there is an empty line between the new entry and that heading):
```markdown
### C23: The signed-in screen draws Dark Veil in the same half size box as the front page
- Tags: `AB:AUTH.STUB`, `AB:LOGIN.LAYOUT`, `AB:LOGIN.LITE`
- If you change: the Dark Veil settings or the wrapper line in STUB, the `.ab-bg` rules in LAYOUT (login.css), or the lite levels in `src/lib/lite.ts`
- Then also: the background of the signed-in screen is a div with the class ab-bg and the attribute data-lite, the SAME class and attribute as the front page (C11, C21). It gets its place behind the content and its half-size lite box from the `.ab-bg` rules in login.css; those rules are loaded because App.tsx imports login.css. If `.ab-bg` is renamed, or login.css stops being loaded, the background of the signed-in screen loses its place. The text and the button sit above it because of the rule `.ab-stub > :not(.ab-bg)` in auth.css. resolutionScale must stay 1 and lightMode must stay false (see C03 and C21).
- If you forget: the background shows as a small box, covers the text, or stays full size on a phone.
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = className="ab-bg"`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = data-lite={`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = resolutionScale={1}`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = lightMode={false}`
- Anchor: `AB:AUTH.STUB @ src/auth.css = .ab-stub > :not(.ab-bg) {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg {`
- Anchor: `AB:LOGIN.LAYOUT @ src/login.css = .ab-bg[data-lite] {`
- Anchor: `AB:LOGIN.LITE @ src/lib/lite.ts = export const LITE_LEVEL`
- Check by hand: after any change sign in, then look at the signed-in screen on a laptop with ?lite=0 and with ?lite=1 in the page address. The picture must fill the whole screen with no band at the edges, and the text and the Sign out button must be readable.
```

## STEP 5: Check the files, the checker and the build
Run:
```
Select-String -Path src/App.tsx -Pattern "DarkVeil"
```
It must print NOTHING (the login page must not use Dark Veil). If it prints a line: **STOP** and report it.

Run:
```
Select-String -Path src/components/SignedInStub.tsx -Pattern "DarkVeil"
```
It must print exactly 2 lines (the import and the `<DarkVeil` tag). Copy the RAW output.

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 14 tags, 22 places
CONNECTIONS OK: 23 connections, 81 anchors, 20 classes, 1 css variables, 2 label links
```
(23 connections and 81 anchors: the new entry C23 and its anchors. That is correct.) If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

Run:
```
npm run build
```
It must finish with no errors. (A warning that some chunks are larger than 500 kB is expected and harmless.) If it fails: **STOP** and report the COMPLETE output.

Run these two and copy the RAW output of each:
1. `git diff --stat`
2. `git status --short`

`git diff --stat` must list ONLY `CODE_MAP.md`, `CONNECTIONS.md`, `src/auth.css` and `src/components/SignedInStub.tsx`. If ANY other file is changed: **STOP** and report the COMPLETE output. Do not commit. (Untracked `??` entries do not count.)

## STEP 6: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 04E: Dark Veil is the background of the page after login (the temporary signed-in screen). The login page is unchanged.
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 7: Check that no secret file is tracked, then commit
Run:
```
git ls-files | Select-String -Pattern "\.env"
```
It must print NOTHING. If it prints any line: **STOP** and report it. Do not commit and do not push.

Then run these two lines, exactly as written. Do NOT use `git add .`:
```
git add src/components/SignedInStub.tsx src/auth.css CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 04E: Dark Veil on the signed-in screen"
```
(Line-ending warnings from git are harmless. Ignore them.)
Then run `git status --short` and copy its raw output. Files that were not part of this packet may still show as untracked (`??`). Leave them alone.

## STEP 8: Push
Run:
```
git push
```
If `git push` fails, asks for a login, or says there is no upstream branch: **STOP** and report the COMPLETE output (the commit stays; nothing is lost). Do not try another push command.
Then run `git status -sb` and copy its first line.

---

## DONE-CHECKS (all must pass)
1. At the start, `node scripts/check-tags.mjs` printed the two lines of Step 0 (72 anchors).
2. `Select-String -Path src/App.tsx -Pattern "DarkVeil"` printed nothing, and `src/App.tsx`, `src/login.css`, `src/components/DarkVeil.tsx` and `src/components/PatternWaves.tsx` were not edited.
3. `node scripts/check-tags.mjs` printed the two lines of Step 5 (23 connections, 81 anchors).
4. `npm run build` finished with no errors.
5. `git show --stat HEAD` lists only `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `src/auth.css` and `src/components/SignedInStub.tsx`.
6. The first line of `git log --oneline` ends with `Packet 04E: Dark Veil on the signed-in screen`.
7. `git ls-files | Select-String -Pattern "\.env"` prints nothing.
8. `git push` finished without an error.

## WHEN DONE
Reply with the raw outputs below, not only PASS or FAIL:
- PASS or FAIL for each of the 8 done-checks
- the RAW outputs of the 3 commands of Step 0
- the RAW outputs of the two `Select-String` commands of Step 5
- the exact output of `node scripts/check-tags.mjs` from Step 5
- the last 5 lines of the output of `npm run build`
- the RAW outputs of `git diff --stat` and `git status --short` from Step 5
- the RAW output of `git ls-files | Select-String -Pattern "\.env"` and the exact output of `git show --stat HEAD`
- the exact output of `git log --oneline -3`
- the exact output of `git push`, and the first line of `git status -sb`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. The owner will look at the page himself.
