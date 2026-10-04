# PACKET 02A: INSTALL PATTERN WAVES (install and report only)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Do NOT use the component anywhere. Do NOT edit `src/App.tsx`, `src/main.tsx` or any page. This packet only installs and reports.
- Do not install any package other than what the command below installs by itself.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**

---

## STEP 1: Install the component
Run:
```
npx shadcn@latest add @react-bits/PatternWaves-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP and report.**
- If it asks whether to overwrite any existing file: answer **no**, then STOP and report which file.
- If it says the component or registry was not found: STOP and report the exact message.

## STEP 2: Find out what was installed
Run:
```
git status --short
git diff package.json
```
Note the full path of every NEW file the command created.

## STEP 3: Read the installed component
Open the main installed component file (the `.tsx` file whose name contains `PatternWaves`).
Copy, EXACTLY and without changing anything, these three things:
1. The full list of props: the `interface` or `type` that defines them, including each prop's name, type, and default value if one is written.
2. The `export` line(s) at the bottom (default export or named export).
3. Any `import` line that points to a package (not a local file), for example `three`, `ogl`, `gsap`.

## STEP 4: Check the build
Run:
```
npm run build
```
It must finish with no errors. If it fails: STOP and report the COMPLETE output.

## STEP 5: Update `PROGRESS.md`
Replace the entire contents of `PROGRESS.md` with exactly this:
```
# ASHBORN PROGRESS

## Locked decisions
- Stack: Vite + React + TypeScript + Tailwind v4 + shadcn/ui
- React Bits components install as the TS-TW variant
- Menu: overlay menu, hamburger top-right (Overview, Pro Timer, Calendar, Guide)
- Login/main background: React Bits Pattern Waves

## Done
- Packet 01: project setup
- Packet 01b: build fixed
- Packet 02A: Pattern Waves installed (not used yet)

## Next
- Packet 02B: login screen using Pattern Waves
```

## STEP 6: Git
Run:
```
git add .
git commit -m "Packet 02A: install Pattern Waves"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. The install command finished without asking for a key, account or payment.
2. `npm run build` finishes with no errors.
3. `git log --oneline` shows 4 commits.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 3 done-checks
- the output of `git status --short` from Step 2 (before the commit)
- the output of `git diff package.json` from Step 2
- the full path of the main component file
- the three things copied in Step 3, exactly as written in the file
- the exact output of `git log --oneline`
- any warning messages, copied exactly

Do not suggest next steps. Do not start Packet 02B.
