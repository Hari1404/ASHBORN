# PACKET 02F: DARK GLASS LOGIN (card on the right is now dark glass, built with React Bits GlassSurface)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Create and edit ONLY the files listed below, with EXACTLY the content given. Copy it character for character.
- Do not install any package. Do not run `npx shadcn`. Do not edit `src/index.css`, `src/App.tsx`, `src/components/PatternWaves.tsx`, `src/components/BlurText.tsx`, `src/components/GlassSurface.tsx`, `src/components/LoginHero.tsx`, `src/loginLines.ts`, `package.json`, or any config file.
- Do not add login logic, a database, routing, or extra screens. The form does nothing yet.
- If any step fails, or the build fails: **STOP and report the COMPLETE error text. Do not try to fix it yourself.**

## WHAT THIS BUILDS
The login card (on the right, with the animated text on the left, as before) changes from a solid white card to DARK SMOKED GLASS. The card is the React Bits `GlassSurface` component: the Pattern Waves behind it are refracted at the card's edges and softened inside it, under a dark tint. Text is white, the fields are see-through with a thin light border, and the Sign in button is solid white with black text. The moving black blob is removed.

---

## STEP 0: Check what this packet needs
Check that all of these files exist:
- `src/components/GlassSurface.tsx`
- `src/components/LoginHero.tsx`
- `src/loginLines.ts`
- `src/App.tsx`
- `src/login.css`
- `src/components/LoginCard.tsx`

If any one is missing: **STOP** and report which.

## STEP 1: Replace the ENTIRE contents of `src/login.css` with exactly this
```css
/* Dark glass login for ASHBORN. */
/* The darkness of the glass is the value --ab-glass-tint right below. Raise the last number to make it darker. */
/* All other glass settings live in the GLASS object at the top of src/components/LoginCard.tsx. */
/* Input and button ideas adapted from Uiverse.io by Praashoo7 */
.ab-screen {
  --ab-glass-tint: rgba(0, 0, 0, 0.55);

  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background: #000;
}

.ab-bg {
  position: fixed;
  inset: 0;
}

.ab-center {
  position: relative;
  z-index: 1;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 1fr;
  align-content: center;
  justify-items: center;
  gap: 28px;
  padding: 24px;
}

.ab-hero {
  width: min(100%, 440px);
}

.ab-hero-text {
  margin: 0;
  font-size: clamp(34px, 9vw, 44px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.9), 0 0 3px rgba(0, 0, 0, 0.8);
}

@media (min-width: 900px) {
  .ab-center {
    grid-template-columns: 1fr minmax(0, 440px);
    justify-items: stretch;
    align-items: center;
    gap: 64px;
    padding: 48px 8vw;
  }

  .ab-hero {
    width: auto;
    max-width: 640px;
  }

  .ab-hero-text {
    font-size: clamp(48px, 6vw, 88px);
  }
}

/* The GlassSurface component sets its own background, border and shadow from the viewer's light/dark setting. */
/* These !important lines make the glass dark for everyone. */
.ab-glass {
  background: var(--ab-glass-tint) !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 30px 80px rgba(0, 0, 0, 0.6) !important;
}

.ab-content {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 40px 32px 32px;
  color: #fff;
}

.ab-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.32em;
  text-align: center;
  color: #fff;
  text-shadow: 0 1px 14px rgba(0, 0, 0, 0.5);
}

.ab-subtitle {
  margin: -8px 0 8px;
  font-size: 14px;
  text-align: center;
  color: rgba(255, 255, 255, 0.72);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.ab-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ab-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.5);
}

.ab-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  font-size: 16px;
  color: #fff;
  caret-color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

@media (hover: hover) {
  .ab-input:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.ab-input:focus {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
}

.ab-input:-webkit-autofill,
.ab-input:-webkit-autofill:hover,
.ab-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  caret-color: #fff;
  transition: background-color 5000s ease-in-out 0s;
}

.ab-button {
  margin-top: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #000;
  background: #fff;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
}

@media (hover: hover) {
  .ab-button:hover {
    background: #e8e8e8;
    box-shadow: 0 8px 28px rgba(255, 255, 255, 0.22);
    transform: translateY(-2px);
  }
}

.ab-button:active {
  transition-duration: 0.1s;
  transform: none;
  box-shadow: none;
}

.ab-button:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .ab-input,
  .ab-button {
    transition: none;
  }
}
```

## STEP 2: Replace the ENTIRE contents of `src/components/LoginCard.tsx` with exactly this
```tsx
import type { FormEvent } from "react"
import GlassSurface from "@/components/GlassSurface"
import "../login.css"

// All glass settings are here, in one place. The darkness is --ab-glass-tint in src/login.css.
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

export default function LoginCard() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <GlassSurface {...GLASS} className="ab-glass">
      <form className="ab-content" onSubmit={handleSubmit}>
        <h1 className="ab-title">ASHBORN</h1>
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
        <button className="ab-button" type="submit">
          Sign in
        </button>
      </form>
    </GlassSurface>
  )
}
```

## STEP 3: Check the build
Run:
```
npm run build
```
It must finish with no errors.
If it fails with a message about a prop on `GlassSurface` (for example "Property ... does not exist" or "not assignable"): **STOP.** Report the complete error. Do not change anything yourself.

## STEP 4: Check that it starts
Run `npm run dev`. It must print a local address (usually `http://localhost:5173`) and show no red error text. Then stop the server.

## STEP 5: Update `PROGRESS.md`
Replace the entire contents of `PROGRESS.md` with exactly this:
```
# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves (black background, white pattern, stays)
- Login card: dark smoked glass using React Bits GlassSurface, on the RIGHT side of the screen
- Glass settings live in the GLASS object at the top of src/components/LoginCard.tsx; the darkness is --ab-glass-tint at the top of .ab-screen in src/login.css
- Login button: solid white with black text
- Login field: User ID instead of email (look only for now)
- Login left side: animated text using React Bits BlurText, one line picked at random each time the screen loads (list lives in src/loginLines.ts)

## Done
- Packet 01: project setup
- Packet 01b: build fixed
- Packet 02A: Pattern Waves installed
- Packet 02B: login screen (look only, no real login)
- Packet 02C: BlurText installed
- Packet 02D: login layout (card right, text left, User ID field)
- Packet 02E: GlassSurface installed
- Packet 02F: dark glass login card (replaces the white card)

## Next
- Owner checks the login screen by eye (desktop and phone)
- Then: deploy, then real login and database
```

## STEP 6: Git
Run:
```
git add .
git commit -m "Packet 02F: dark glass login"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `npm run dev` starts with no red error text.
3. These files exist: `src/login.css`, `src/components/LoginCard.tsx`.
4. The first line of `git log --oneline` ends with `Packet 02F: dark glass login`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 4 done-checks
- the exact output of `git log --oneline`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
