echo "--- STEP 8 SELECT-STRING ---"
Select-String -Path src/components/SignedInStub.tsx -Pattern "AppMenu"
echo "--- STEP 8 CHECK-TAGS ---"
node scripts/check-tags.mjs
echo "--- STEP 8 BUILD ---"
npm run build
echo "--- STEP 8 DIFF ---"
git diff --stat
echo "--- STEP 8 STATUS ---"
git status --short
echo "--- STEP 10 ENV CHECK ---"
git ls-files | Select-String -Pattern "\.env"
echo "--- STEP 10 COMMIT ---"
git add package.json package-lock.json src/components/StaggeredMenu.tsx src/components/AppMenu.tsx src/lib/screens.ts src/menu.css src/components/SignedInStub.tsx CODE_MAP.md CONNECTIONS.md PROGRESS.md
git commit -m "Packet 04F: menu (Staggered Menu) on the signed-in screen"
git status --short
echo "--- STEP 11 PUSH ---"
git push
git status -sb
echo "--- POST-CHECK ---"
git show --stat HEAD
git log --oneline -3
