# PACKET 01: PROJECT SETUP

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Do not add any file, package, feature or setting that is not listed here.
- Do not create any screen or page content. That is a later packet.
- If any step fails, prints an error, or asks a question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**

## LOCKED STACK
Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui

## BEFORE YOU START
The current folder may contain ONLY these: files whose names start with `PACKET_`, `AGENTS.md`, and a `.agents` folder. If anything else is in it: STOP and report.
Never delete any of those files.

---

## STEP 1: Create the Vite project (no questions, via a temporary subfolder)
Run:
```
npm create vite@latest ashborn-temp -- --template react-ts --no-interactive
```
Check that the folder `ashborn-temp` now exists and contains `package.json`. If not: STOP and report.

Move everything from it up into the current folder. In PowerShell run:
```
Get-ChildItem -Force ashborn-temp | Move-Item -Destination .
Remove-Item ashborn-temp
```
If the move reports a name conflict: STOP and report. Do not overwrite anything.

Open `package.json` and change the `"name"` value from `"ashborn-temp"` to `"ashborn"`. Change nothing else in that file.

Then run:
```
npm install
```

## STEP 2: Install Tailwind
Run:
```
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node
```

## STEP 3: Replace the contents of `src/index.css`
Delete everything in `src/index.css` and put exactly this one line:
```
@import "tailwindcss";
```

## STEP 4: Path alias (needed by shadcn)
Open `tsconfig.json`. Inside `"compilerOptions"` add:
```
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```
(If `tsconfig.json` has no `"compilerOptions"`, add the whole block: `"compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } }`)

Open `tsconfig.app.json`. Inside `"compilerOptions"` add the same two lines:
```
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

## STEP 5: Replace the contents of `vite.config.ts` with exactly this
```ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## STEP 6: Initialise shadcn
Run:
```
npx shadcn@latest init
```
If it asks for a base colour, choose **Neutral**. For any other choice, take the default.
If it asks something you cannot answer from this file: STOP and report.
When finished, the file `components.json` must exist in the project root.

## STEP 7: Git
Run:
```
git init
```
Open `.gitignore` and add these lines at the bottom (if not already present):
```
.env
.env.*
```
Then run:
```
git add .
git commit -m "Packet 01: project setup"
```

## STEP 8: Create `PROGRESS.md` in the project root with exactly this content
```
# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves

## Done
- Packet 01: project setup

## Next
- Packet 02: login screen with Pattern Waves background
```
Then run:
```
git add .
git commit -m "Add PROGRESS.md"
```

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with no errors.
2. `npm run dev` starts and prints a local address (usually `http://localhost:5173`). Open it: the default Vite + React page shows. Then stop the server.
3. These exist: `components.json`, `vite.config.ts`, `PROGRESS.md`, `.git` folder.
4. `git log` shows 2 commits.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 4 done-checks
- the exact output of `git log --oneline`
- any warning messages you saw

Do not suggest next steps. Do not start Packet 02.
