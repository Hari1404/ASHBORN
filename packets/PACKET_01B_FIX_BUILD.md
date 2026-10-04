# PACKET 01B: FIX THE BUILD

## RULES FOR THE AGENT (read first)
- You decide NOTHING. Do exactly the steps below, in order.
- Change only what is listed. Add no files, packages or features.
- If any step fails, prints an error not covered here, or `npm run build` still fails: **STOP and report the exact, complete error text. Do not try to fix it yourself.**

## WHY
Packet 01 added a `baseUrl` setting that the current TypeScript version rejects (error TS5101), so `npm run build` failed. The `vite.config.ts` also used `__dirname`, which gives a warning. Both are fixed below.

---

## STEP 1: Remove `baseUrl` from both tsconfig files
In `tsconfig.json`: delete the line `"baseUrl": ".",` (it may have no trailing comma; delete the whole line either way).
In `tsconfig.app.json`: delete the same `"baseUrl"` line.

Keep the `"paths"` line in both files exactly as it is:
```
"paths": { "@/*": ["./src/*"] }
```
Make sure the JSON is still valid (no leftover or missing commas). If a `"baseUrl"` line exists in any other tsconfig file, delete it there too, and report which file it was.

## STEP 2: Replace the contents of `vite.config.ts` with exactly this
```ts
import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
```

## STEP 3: Git
Run:
```
git add .
git commit -m "Packet 01b: fix build"
```
(Line-ending warnings from git are harmless. Ignore them.)

---

## DONE-CHECKS (all must pass)
1. `npm run build` finishes with **no errors**.
2. `npm run dev` starts and prints a local address. Then stop the server.
3. `git log --oneline` shows 3 commits.

## WHEN DONE
Reply with only:
- PASS or FAIL for each of the 3 done-checks
- the exact output of `git log --oneline`
- any warning messages, copied exactly
- if check 1 failed: the COMPLETE build output

Do not suggest next steps. Do not start Packet 02.
