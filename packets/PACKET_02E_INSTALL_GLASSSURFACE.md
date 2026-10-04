# PACKET 02E: INSTALL GLASS SURFACE (install and report only)

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Do NOT use the component anywhere. Do NOT edit `src/App.tsx`, `src/main.tsx`, `src/login.css`, `src/components/LoginCard.tsx`, `src/components/LoginHero.tsx` or any page. This packet only installs and reports.
- Do not install any package other than what the command below installs by itself.
- If any step fails, asks for a license key, a login, a payment, or asks any question not covered here: **STOP and report the exact message. Do not try to fix it yourself.**

---

## STEP 0: Record the starting state
Run:
```
git log --oneline
git status --short
```
Copy both outputs into your final report. If `git status --short` is not empty, do NOT stop and do NOT fix anything. Just report it.

## STEP 1: Install the component
Run:
```
npx shadcn@latest add @react-bits/GlassSurface-TS-TW --yes
```
- If it asks for a license key, an account, or says the component is paid/Pro: **STOP and report.**
- If it asks whether to overwrite any existing file: answer **no**, then STOP and report which file.
- If it says the component or registry was not found: STOP and report the exact message.
- If it installs an extra npm package: report its name and version in Step 2. (None is expected.)

## STEP 2: Find out what was installed
Run:
```
git status --short
git diff package.json
```
Note the full path of every NEW file the command created.

## STEP 3: Print the installed component
Open the main installed component file (the `.tsx` file whose name contains `GlassSurface`).
Copy its ENTIRE contents, top to bottom, exactly as written, without changing, shortening or summarising anything. This copy goes into your final report.
If the install also created another file next to it (for example a `.css` file), copy that file's entire contents too.

## STEP 4: Check the build
Run:
```
npm run build
```
It must finish with no errors. If it fails: STOP and report the COMPLETE output.

## STEP 5: Update `PROGRESS.md`
Open `PROGRESS.md` and make exactly these two additions. Change nothing else in the file.
1. At the end of the list under the heading `## Locked decisions`, add this line:
```
- Login card: dark smoked glass using React Bits GlassSurface (owner's choice; applied in the next packet)
```
2. At the end of the list under the heading `## Done`, add this line:
```
- Packet 02E: GlassSurface installed (not used yet)
```

## STEP 6: Git
Run:
```
git add .
git commit -m "Packet 02E: install GlassSurface"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. The install command finished without asking for a key, account or payment.
2. `npm run build` finishes with no errors.
3. The first line of `git log --oneline` ends with `Packet 02E: install GlassSurface`.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 3 done-checks
- the output of `git log --oneline` and `git status --short` from Step 0 (before the install)
- the output of `git status --short` from Step 2 (before the commit)
- the output of `git diff package.json` from Step 2
- the full path of the main component file
- the ENTIRE contents of the component file (and of any extra file from Step 3), exactly as written
- the exact output of `git log --oneline` after the commit
- any warning messages, copied exactly

Do not suggest next steps. Do not start another packet.
