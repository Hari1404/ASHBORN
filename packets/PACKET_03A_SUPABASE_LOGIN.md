# PACKET 03A: CONNECT TO SUPABASE AND MAKE SIGN IN REAL

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order. Copy every text character for character.
- ONE install is allowed, and ONLY this one: `npm install @supabase/supabase-js` (Step 2). Install nothing else.
- Edit ONLY the files named in this packet. Do not edit anything in `src/components` other than `LoginCard.tsx` (edit) and `SignedInStub.tsx` (new). Never edit `BlurText.tsx`, `GlassSurface.tsx`, `PatternWaves.tsx`, `FuzzyText.tsx`, `LoginBrand.tsx`, `LoginHero.tsx`, `src/index.css`, `src/main.tsx` or any config file.
- For every FIND and REPLACE: the FIND text must appear EXACTLY ONCE in that file. If it appears zero times or more than once: **STOP** and report the file and the edit number. Do not guess.
- NEVER write a key, a password or a real address into any file. The file `.env` in Step 7 holds only the three placeholder lines shown there. Do not fill them in. Do not open the Supabase dashboard. Do not create users or tables. Do not run `npm run dev`.
- If any step fails, asks for a login or a payment, or asks a question not covered here, or the build fails, or the checker fails: **STOP and report the COMPLETE output. Do not try to fix it yourself.**

## WHAT THIS BUILDS
1. The app gets its connection to the owner's Supabase project (settings come from the file `.env`, which git ignores).
2. The Sign in button really signs in. The typed User ID is turned into an email by a fixed rule (the form is in `.env`), and Supabase checks the password. A wrong password shows a red line under the fields.
3. After a sign in the app shows a TEMPORARY black screen with the word Signed in, the email and a Sign out button. Reloading the page keeps the person signed in. Sign out returns to the front page. This screen is thrown away when the real app shell is built.
4. New tags: `AB:AUTH.CLIENT`, `AB:AUTH.SESSION`, `AB:AUTH.GATE`, `AB:AUTH.STUB`. New connections C17 to C20. `CODE_MAP.md` and `CONNECTIONS.md` are updated and the checker must pass.
5. The look of the front page does not change.

---

## STEP 0: Check what this packet needs
Check that all of these exist: `CODE_MAP.md`, `CONNECTIONS.md`, `TAGGING_RULES.md`, `AGENTS.md`, `PROGRESS.md`, `scripts/check-tags.mjs`, `src/App.tsx`, `src/login.css`, `src/components/LoginCard.tsx`, `src/components/LoginBrand.tsx`. If any is missing: **STOP** and report which.
Check that NONE of these exist yet: `.env`, `src/env.d.ts`, `src/lib/supabase.ts`, `src/lib/useSession.ts`, `src/components/SignedInStub.tsx`, `src/auth.css`. If any exists: **STOP** and report which (this packet may already have been run).

Run `node scripts/check-tags.mjs`. It must print exactly:
```
TAGS OK: 9 tags, 16 places
CONNECTIONS OK: 16 connections, 44 anchors, 13 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output.

Then run `git status --short` and `git log --oneline -3`. Do NOT stop and do NOT fix anything. Just report both outputs.

## STEP 1: Check that git ignores `.env`
Run:
```
git check-ignore .env
```
It must print exactly `.env`. If it prints nothing: **STOP** and report "git does not ignore .env". Do not edit `.gitignore`.

## STEP 2: Install the Supabase library
Run:
```
npm install @supabase/supabase-js
```
Then run:
```
git diff package.json
```
`package.json` must now list `@supabase/supabase-js` under `dependencies`, and no other package may have been added. If not: **STOP** and report the COMPLETE output. Note the installed version for the report.

## STEP 3: Create the new files
Create each of these 5 NEW files with exactly the content shown. Create the folder `src/lib` first (it does not exist).

### Create `src/env.d.ts` with exactly this content
```ts
/// <reference types="vite/client" />
```

### Create `src/lib/supabase.ts` with exactly this content
```ts
import { createClient } from "@supabase/supabase-js"

// AB:AUTH.CLIENT:START
// The one connection to Supabase. The three settings come from the file .env (it is never committed to git).
// The rule that turns a User ID into an email is linked to the user created in the Supabase dashboard (see CONNECTIONS.md).
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
const emailTemplate = import.meta.env.VITE_LOGIN_EMAIL_TEMPLATE as string | undefined

export const authReady = Boolean(
  url &&
    url.startsWith("https://") &&
    key &&
    !key.includes("PASTE") &&
    emailTemplate &&
    emailTemplate.includes("{id}") &&
    emailTemplate.includes("@")
)

export const supabase = authReady ? createClient(url as string, key as string) : null

export function userIdToEmail(userId: string): string | null {
  const id = userId.trim().toLowerCase()
  if (!/^[a-z0-9]{2,20}$/.test(id)) return null
  if (!emailTemplate) return null
  return emailTemplate.replace("{id}", id)
}
// AB:AUTH.CLIENT:END
```

### Create `src/lib/useSession.ts` with exactly this content
```ts
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// AB:AUTH.SESSION:START
// Gives the saved sign-in: "loading" while it is being read, null when nobody is signed in, or the session.
export type SessionState = Session | null | "loading"

export function useSession(): SessionState {
  const [session, setSession] = useState<SessionState>(supabase ? "loading" : null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  return session
}
// AB:AUTH.SESSION:END
```

### Create `src/components/SignedInStub.tsx` with exactly this content
```tsx
import { supabase } from "@/lib/supabase"
import "../auth.css"

// AB:AUTH.STUB:START
// TEMPORARY screen shown after a sign in. It is thrown away when the real app shell is built.
export default function SignedInStub({ email }: { email: string }) {
  return (
    <main className="ab-stub">
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

### Create `src/auth.css` with exactly this content
```css
/* Styles of the temporary signed-in screen. Tag: see CODE_MAP.md in the project root. */

/* AB:AUTH.STUB:START */
.ab-stub {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  box-sizing: border-box;
  background: #000;
  color: #fff;
  text-align: center;
}

.ab-stub-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.ab-stub-line {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.72);
  overflow-wrap: anywhere;
}

.ab-stub-note {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.ab-stub-button {
  margin-top: 12px;
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  background: #fff;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
}
/* AB:AUTH.STUB:END */
```

## STEP 4: Edit the existing files
Make these edits. Change nothing else in any file. Each FIND must appear exactly once.

### Edits in `src/App.tsx`
**Edit 1. FIND (this exact text, it must appear exactly once in the file):**
```tsx
import "./login.css"
```
**REPLACE WITH (this exact text):**
```tsx
import "./login.css"
import SignedInStub from "@/components/SignedInStub"
import { useSession } from "@/lib/useSession"
```

**Edit 2. FIND (this exact text, it must appear exactly once in the file):**
```tsx
export default function App() {
```
**REPLACE WITH (this exact text):**
```tsx
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
```

### Edits in `src/components/LoginCard.tsx`
**Edit 3. FIND (this exact text, it must appear exactly once in the file):**
```tsx
import type { FormEvent } from "react"
```
**REPLACE WITH (this exact text):**
```tsx
import { useState } from "react"
import type { FormEvent } from "react"
import { supabase, userIdToEmail } from "@/lib/supabase"
```

**Edit 4. FIND (this exact text, it must appear exactly once in the file):**
```tsx
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }
```
**REPLACE WITH (this exact text):**
```tsx
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
```

**Edit 5. FIND (this exact text, it must appear exactly once in the file):**
```tsx
        {/* AB:LOGIN.FORM:END */}
```
**REPLACE WITH (this exact text):**
```tsx
        {message ? (
          <p className="ab-error" role="alert">
            {message}
          </p>
        ) : null}
        {/* AB:LOGIN.FORM:END */}
```

**Edit 6. FIND (this exact text, it must appear exactly once in the file):**
```tsx
<button className="ab-button" type="submit">
```
**REPLACE WITH (this exact text):**
```tsx
<button className="ab-button" type="submit" disabled={busy}>
```

### Edits in `src/login.css`
**Edit 7. FIND (this exact text, it must appear exactly once in the file):**
```css
/* AB:LOGIN.FORM:END */
```
**REPLACE WITH (this exact text):**
```css
/* The red line under the fields: wrong password, not connected, and so on. Text comes from handleSubmit in LoginCard.tsx. */
.ab-error {
  margin: -4px 0 0;
  font-size: 14px;
  line-height: 1.4;
  color: #ffb4b4;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}
/* AB:LOGIN.FORM:END */
```

**Edit 8. FIND (this exact text, it must appear exactly once in the file):**
```css
.ab-button:active {
```
**REPLACE WITH (this exact text):**
```css
.ab-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.ab-button:active {
```

## STEP 5: Update `CODE_MAP.md`
Make these edits. Each FIND must appear exactly once.

**Map edit 1. FIND:**
```md
| SHARED | Things used on several pages, such as theme settings (not built yet) |
```
**REPLACE WITH:**
```md
| SHARED | Things used on several pages, such as theme settings (not built yet) |
| AUTH | Sign-in plumbing: the Supabase connection, the saved sign-in, the choice of screen, the temporary signed-in screen |
```

**Map edit 2. FIND:**
```md
| `AB:LOGIN.SUBMIT` | What happens when the form is submitted (nothing yet) | `src/components/LoginCard.tsx` | real login goes here later |
```
**REPLACE WITH:**
```md
| `AB:LOGIN.SUBMIT` | What happens when the form is submitted: real sign in with Supabase, the busy state, the red error text (shown in FORM) | `src/components/LoginCard.tsx` | the wording of the messages |
```

**Map edit 3. FIND:**
```md
## Library components (installed React Bits source: not tagged, never edited)
```
**REPLACE WITH:**
```md
## AUTH (sign-in plumbing)
| Tag | What it is | Files | What you can change there |
|---|---|---|---|
| `AB:AUTH.CLIENT` | The one connection to Supabase, and the rule that turns a User ID into an email | `src/lib/supabase.ts` | what a User ID may contain; the three settings themselves are in the file .env |
| `AB:AUTH.SESSION` | Reads the saved sign-in and follows sign in and sign out | `src/lib/useSession.ts` | nothing yet |
| `AB:AUTH.GATE` | Chooses the screen: blank while loading, the front page, or the signed-in screen | `src/App.tsx` | which screen follows a sign in (the real app later) |
| `AB:AUTH.STUB` | The temporary signed-in screen with a Sign out button | `src/components/SignedInStub.tsx`, `src/auth.css` | thrown away when the real app shell is built |

## Library components (installed React Bits source: not tagged, never edited)
```

**Map edit 4. FIND:**
```md
Setup and config files (package.json, vite and tsconfig files, index.html),
```
**REPLACE WITH:**
```md
Setup and config files (package.json, vite and tsconfig files, index.html, src/env.d.ts, the file .env which is never committed),
```

## STEP 6: Update `CONNECTIONS.md`
Make these edits. Each FIND must appear exactly once.

**Connections edit 1. FIND:**
```md
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = name="password"`
```
**REPLACE WITH:**
```md
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = name="password"`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = form.get("username")`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = form.get("password")`
```

**Connections edit 2. FIND:**
```md
## Things to know (no check is possible)
```
**REPLACE WITH:**
```md
## Connections on the AUTH plumbing

### C17: The email form is written in three places: .env, the code rule and the Supabase user
- Tags: `AB:AUTH.CLIENT`, `AB:LOGIN.SUBMIT`
- If you change: the line VITE_LOGIN_EMAIL_TEMPLATE in .env, the User ID rule inside userIdToEmail, or the name userIdToEmail
- Then also: SUBMIT turns the typed User ID into an email with userIdToEmail, and Supabase knows each user only by that exact email. If the form changes, every user in the Supabase dashboard must get the matching new email (or be created again). A user created again is a NEW user: data tied to the old one is not reachable from it. After any change to .env, stop and restart `npm run dev`.
- If you forget: "User ID or password is wrong" with a correct password.
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = export function userIdToEmail`
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = VITE_LOGIN_EMAIL_TEMPLATE`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = userIdToEmail(userId)`
- Check by hand: the checker does NOT read .env and does NOT see the Supabase dashboard. After any change, sign in once to prove the three places still agree.

### C18: The names of the three settings in .env and in the code
- Tags: `AB:AUTH.CLIENT`
- If you change: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in supabase.ts, or the same names in .env
- Then also: .env must use exactly the same names. Only names that start with VITE_ reach the browser. The secret key (or the old service_role key) must NEVER be written into .env or any file, with or without a VITE_ name.
- If you forget: the Sign in button shows "Not connected" because the code finds no setting.
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = import.meta.env.VITE_SUPABASE_URL`
- Anchor: `AB:AUTH.CLIENT @ src/lib/supabase.ts = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY`

### C19: Which screen is shown comes from the saved sign-in
- Tags: `AB:AUTH.GATE`, `AB:AUTH.SESSION`, `AB:AUTH.STUB`
- If you change: the name useSession, the three states it gives (loading, null, a session), or the SignedInStub screen
- Then also: App (GATE) shows nothing while the state is loading, the front page when it is null, and the signed-in screen when it is a session. The Sign out button lives in AUTH.STUB. When the real app shell replaces the stub, the gate and the sign out button move with it.
- If you forget: the front page flashes before the app, a signed-in person is stuck on the front page, or there is no way to sign out.
- Anchor: `AB:AUTH.GATE @ src/App.tsx = const session = useSession()`
- Anchor: `AB:AUTH.GATE @ src/App.tsx = <SignedInStub`
- Anchor: `AB:AUTH.SESSION @ src/lib/useSession.ts = export function useSession`
- Anchor: `AB:AUTH.STUB @ src/components/SignedInStub.tsx = auth.signOut()`

### C20: The red message and the busy state are made in SUBMIT and shown in FORM and BUTTON
- Tags: `AB:LOGIN.SUBMIT`, `AB:LOGIN.FORM`, `AB:LOGIN.BUTTON`
- If you change: the names message or busy, the red line under the fields (FORM), or the disabled setting of the button (BUTTON)
- Then also: handleSubmit (SUBMIT) holds the state. FORM shows `message`, BUTTON is switched off with `busy` while the sign in runs, so a double tap cannot send two requests. Rename in all three places.
- If you forget: errors never show, or the button never switches back on after a wrong password.
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = const [message, setMessage] = useState("")`
- Anchor: `AB:LOGIN.SUBMIT @ src/components/LoginCard.tsx = const [busy, setBusy] = useState(false)`
- Anchor: `AB:LOGIN.FORM @ src/components/LoginCard.tsx = {message ? (`
- Anchor: `AB:LOGIN.BUTTON @ src/components/LoginCard.tsx = disabled={busy}`

## Things to know (no check is possible)
- The Project URL and the publishable key are meant to be in the browser app: row-level security (not yet written, there are no tables) is what protects data. The secret key must never be in the project. .env is ignored by git (Packet 03A checks this before it creates the file).
- Sign-ups are OFF in the Supabase dashboard. Users are created there by hand, with "Auto Confirm User" ticked.
```

## STEP 7: Create the `.env` file with placeholders
Create the NEW file `.env` in the project root with exactly these 3 lines and nothing else:
```
VITE_SUPABASE_URL=PASTE_PROJECT_URL_HERE
VITE_SUPABASE_PUBLISHABLE_KEY=PASTE_PUBLISHABLE_KEY_HERE
VITE_LOGIN_EMAIL_TEMPLATE=PASTE_EMAIL_FORM_HERE
```
Do NOT replace the words after the equals signs. The owner fills them in himself.
Then run `git status --short`. The file `.env` must NOT be listed. If it is listed: **STOP** and report.

## STEP 8: Check the build
Run:
```
npm run build
```
It must finish with no errors. (With the placeholder `.env` the app is simply "not connected"; that is expected.) If it fails: **STOP** and report the COMPLETE output.

## STEP 9: Run the checker
Run:
```
node scripts/check-tags.mjs
```
It must print exactly these two lines and nothing else:
```
TAGS OK: 13 tags, 21 places
CONNECTIONS OK: 20 connections, 59 anchors, 19 classes, 1 css variables, 2 label links
```
If it prints anything else: **STOP** and report the COMPLETE output. Do not fix it.

## STEP 10: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly this one change. Change nothing else in the file.
At the end of the list under the heading `## Done`, add this line:
```
- Packet 03A: Supabase connected (settings in .env, never committed), real sign in with User ID and password, temporary signed-in screen with Sign out; owner still has to fill .env and create his user in the Supabase dashboard
```
If the heading `## Done` is not found: **STOP** and report.

## STEP 11: Git
Run:
```
git add .
git status --short
```
The file `.env` must NOT be listed. If it is listed: **STOP** and report. Then run:
```
git commit -m "Packet 03A: Supabase connection and real sign in"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `node scripts/check-tags.mjs` prints exactly the two lines of Step 9.
3. `git ls-files .env` prints nothing (the file is not tracked).
4. `git show --stat HEAD` lists these 13 files: `CODE_MAP.md`, `CONNECTIONS.md`, `PROGRESS.md`, `package-lock.json`, `package.json`, `src/App.tsx`, `src/auth.css`, `src/components/LoginCard.tsx`, `src/components/SignedInStub.tsx`, `src/env.d.ts`, `src/lib/supabase.ts`, `src/lib/useSession.ts`, `src/login.css`. (The packet file itself may also appear. Any other file, and especially `.env`, means FAIL.)
5. The first line of `git log --oneline` ends with `Packet 03A: Supabase connection and real sign in`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 5 done-checks
- the exact output of `git log --oneline`
- the exact output of `node scripts/check-tags.mjs`
- the outputs you were asked to report in Step 0, and the installed version of `@supabase/supabase-js`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet. Do not run the app.
