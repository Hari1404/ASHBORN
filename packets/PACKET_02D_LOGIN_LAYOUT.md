# PACKET 02D: LOGIN LAYOUT (card on the right, animated text on the left)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Create and edit ONLY the files listed below, with EXACTLY the content given. Copy it character for character.
- Do not install any package. Do not run `npx shadcn`. Do not edit `src/index.css`, `src/components/PatternWaves.tsx`, `src/components/BlurText.tsx`, `package.json`, or any config file.
- Do not add login logic, a database, routing, or extra screens. The form does nothing yet.
- If any step fails, or the build fails: **STOP and report the COMPLETE error text. Do not try to fix it yourself.**

## WHAT THIS BUILDS
Same black Pattern Waves background as before. On a wide screen (desktop/laptop): animated white text on the LEFT, the login card on the RIGHT. On a narrow screen (phone): the text sits above the card. The card is now solid pure white (no see-through frosted layer). The Email field becomes a User ID field. The left text is one line picked at random from a list each time the page loads, revealed word by word with the React Bits BlurText animation.

---

## STEP 1: Create `src/loginLines.ts` with exactly this content
```ts
export const LOGIN_LINES: string[] = [
  "Show up. Every day.",
  "Small steps. Big streak.",
  "Earn today.",
  "Do the work. Own the day.",
  "Focus first. Everything else later.",
  "Be better than yesterday.",
]
```

## STEP 2: Create `src/components/LoginHero.tsx` with exactly this content
```tsx
import { useState } from "react"
import BlurText from "@/components/BlurText"
import { LOGIN_LINES } from "@/loginLines"
import "../login.css"

export default function LoginHero() {
  const [line] = useState(
    () => LOGIN_LINES[Math.floor(Math.random() * LOGIN_LINES.length)]
  )

  return (
    <div className="ab-hero">
      <BlurText
        text={line}
        delay={150}
        animateBy="words"
        direction="top"
        className="ab-hero-text"
      />
    </div>
  )
}
```

## STEP 3: Replace the ENTIRE contents of `src/login.css` with exactly this
```css
/* Card style adapted from Uiverse.io by dylanharriscameron */
/* Input and button styles adapted from Uiverse.io by Praashoo7 */
.ab-screen {
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

.ab-card {
  position: relative;
  isolation: isolate;
  width: min(100%, 440px);
  border-radius: 22px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18), 0 30px 80px rgba(0, 0, 0, 0.7);
}

.ab-blob {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background-color: #000;
  opacity: 1;
  filter: blur(20px);
  transform: translate(-100%, -100%);
  animation: ab-blob-bounce 5s infinite ease;
}

@keyframes ab-blob-bounce {
  0% {
    transform: translate(-100%, -100%) translate3d(0, 0, 0);
  }
  25% {
    transform: translate(-100%, -100%) translate3d(100%, 0, 0);
  }
  50% {
    transform: translate(-100%, -100%) translate3d(100%, 100%, 0);
  }
  75% {
    transform: translate(-100%, -100%) translate3d(0, 100%, 0);
  }
  100% {
    transform: translate(-100%, -100%) translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab-blob {
    animation: none;
  }
}

.ab-glass {
  position: absolute;
  z-index: 2;
  inset: 6px;
  border-radius: 16px;
  background: #fff;
  outline: 2px solid #fff;
}

.ab-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 48px 40px 40px;
  color: #0a0a0a;
}

.ab-title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.32em;
  text-align: center;
}

.ab-subtitle {
  margin: -8px 0 8px;
  font-size: 14px;
  text-align: center;
  color: #525252;
}

.ab-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ab-label {
  font-size: 13px;
  font-weight: 600;
}

.ab-input {
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  font-size: 16px;
  color: #0a0a0a;
  background: #f5f5f5;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  transition: 0.4s ease-in-out;
}

@media (hover: hover) {
  .ab-input:hover {
    box-shadow: 4px 4px 0 #969696;
  }
}

.ab-input:focus {
  outline: 2px solid #000;
  outline-offset: 1px;
  border-color: #000;
  background: #fff;
  box-shadow: inset 2px 5px 10px rgba(0, 0, 0, 0.3);
}

.ab-button {
  margin-top: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: #000;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.4s ease-in-out;
  box-shadow: rgba(0, 0, 0, 0.4) 1px 1px 1px;
}

@media (hover: hover) {
  .ab-button:hover {
    background: #1f1f1f;
    box-shadow: 4px 4px 0 #969696;
    transform: translate(-3px, -3px);
  }
}

.ab-button:active {
  transition: 0.2s;
  transform: none;
  box-shadow: none;
}

.ab-button:focus-visible {
  outline: 2px solid #000;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .ab-input,
  .ab-button {
    transition: none;
  }
}
```

## STEP 4: Replace the ENTIRE contents of `src/components/LoginCard.tsx` with exactly this
```tsx
import type { FormEvent } from "react"
import "../login.css"

export default function LoginCard() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className="ab-card">
      <div className="ab-blob" />
      <div className="ab-glass" />
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
    </div>
  )
}
```

## STEP 5: Replace the ENTIRE contents of `src/App.tsx` with exactly this
```tsx
import PatternWaves from "@/components/PatternWaves"
import LoginCard from "@/components/LoginCard"
import LoginHero from "@/components/LoginHero"
import "./login.css"

export default function App() {
  return (
    <main className="ab-screen">
      <div className="ab-bg">
        <PatternWaves
          color="#ffffff"
          backgroundColor="#000000"
          pattern="square"
          wave="silk"
          characters=".:-=+*#%@"
          spacing={8}
          markSize={0.9}
          depth={1.05}
          light={0}
          shine={0.5}
          contrast={1.25}
          speed={0.7}
          scale={1.15}
          direction={33}
          fade="none"
          fadeSize={0.35}
          opacity={1}
          interactive={false}
          cursorSize={50}
          cursorStrength={0.6}
          intro={true}
          paused={false}
        />
      </div>
      <div className="ab-center">
        <LoginHero />
        <LoginCard />
      </div>
    </main>
  )
}
```

## STEP 6: Check the build
Run:
```
npm run build
```
It must finish with no errors.
If it fails with a message about a prop on `BlurText` (for example "Property ... does not exist" or "not assignable"): **STOP.** Open `src/components/BlurText.tsx`, copy the full `BlurTextProps` type and the full function signature (the line where the component's props are destructured, with their default values), and report them together with the complete error. Do not change anything yourself.

## STEP 7: Check that it starts
Run `npm run dev`. It must print a local address (usually `http://localhost:5173`) and show no red error text. Then stop the server.

## STEP 8: Update `PROGRESS.md`
Replace the entire contents of `PROGRESS.md` with exactly this:
```
# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves (black background, white pattern, stays)
- Login card: pure solid white, on the RIGHT side of the screen, black blob moving along its edge
- Login field: User ID instead of email (look only for now)
- Login left side: animated text using React Bits BlurText, one line picked at random each time the screen loads (list lives in src/loginLines.ts)

## Done
- Packet 01: project setup
- Packet 01b: build fixed
- Packet 02A: Pattern Waves installed
- Packet 02B: login screen (look only, no real login)
- Packet 02C: BlurText installed
- Packet 02D: login layout (card right, text left, pure white card, User ID field)

## Next
- Owner checks the login screen by eye (desktop and phone)
- Then: deploy, then real login and database
```

## STEP 9: Git
Run:
```
git add .
git commit -m "Packet 02D: login layout"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `npm run dev` starts with no red error text.
3. These files exist: `src/loginLines.ts`, `src/components/LoginHero.tsx`, `src/login.css`, `src/components/LoginCard.tsx`.
4. `git log --oneline` shows 7 commits.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 4 done-checks
- the exact output of `git log --oneline`
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
