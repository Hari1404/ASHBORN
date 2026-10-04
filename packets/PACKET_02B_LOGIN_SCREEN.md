# PACKET 02B: LOGIN SCREEN (look only, no real login)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Create and edit ONLY the files listed below, with EXACTLY the content given. Copy it character for character.
- Do not install any package. Do not run `npx shadcn`. Do not edit `src/index.css`, `src/components/PatternWaves.tsx`, `package.json`, or any config file.
- Do not add login logic, a database, routing, or extra screens. The form does nothing yet.
- If any step fails, or the build fails: **STOP and report the COMPLETE error text. Do not try to fix it yourself.**

## WHAT THIS BUILDS
One screen: the Pattern Waves animation fills the whole screen (black background, white pattern). In the middle sits a big white card. Behind the card's frosted white glass layer, a black blob moves around continuously (5-second loop, same keyframes as the Uiverse original). The card holds the title ASHBORN, an email field, a password field and a Sign in button. Fields and button have hard offset shadows on hover (mouse devices only), an inset shadow when a field is focused, and the button presses down when clicked.

---

## STEP 1: Create `src/login.css` with exactly this content
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
  place-items: center;
  padding: 24px;
}

.ab-card {
  position: relative;
  isolation: isolate;
  width: min(100%, 440px);
  border-radius: 22px;
  overflow: hidden;
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
  background: rgba(255, 255, 255, 0.88);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
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

## STEP 2: Create `src/components/LoginCard.tsx` with exactly this content
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
          <label className="ab-label" htmlFor="ab-email">
            Email
          </label>
          <input
            className="ab-input"
            id="ab-email"
            name="email"
            type="email"
            autoComplete="email"
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

## STEP 3: Replace the ENTIRE contents of `src/App.tsx` with exactly this
```tsx
import PatternWaves from "@/components/PatternWaves"
import LoginCard from "@/components/LoginCard"
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
        <LoginCard />
      </div>
    </main>
  )
}
```

## STEP 4: Check the build
Run:
```
npm run build
```
It must finish with no errors.
If it fails with a message saying `"square"` (or `"silk"`) is not assignable to a type: **STOP.** Open `src/components/PatternWaves.tsx`, copy the exact definitions of `PatternKind` and `WaveKind`, and report them together with the complete error. Do not change the value yourself.

## STEP 5: Check that it starts
Run `npm run dev`. It must print a local address (usually `http://localhost:5173`) and show no red error text. Then stop the server.

## STEP 6: Update `PROGRESS.md`
Replace the entire contents of `PROGRESS.md` with exactly this:
```
# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves
- Login card: big white card, frosted glass layer, black blob moving behind it

## Done
- Packet 01: project setup
- Packet 01b: build fixed
- Packet 02A: Pattern Waves installed
- Packet 02B: login screen (look only, no real login)

## Next
- Owner checks the login screen by eye (desktop and phone)
- Then: deploy, then real login and database
```

## STEP 7: Git
Run:
```
git add .
git commit -m "Packet 02B: login screen"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `npm run dev` starts with no red error text.
3. These files exist: `src/login.css`, `src/components/LoginCard.tsx`.
4. `git log --oneline` shows 5 commits.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 4 done-checks
- the exact output of `git log --oneline`
- the full definitions of `PatternKind` and `WaveKind` from `src/components/PatternWaves.tsx`, copied exactly
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
