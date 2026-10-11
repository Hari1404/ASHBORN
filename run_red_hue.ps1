echo "--- BUILD ---"
npm run build
echo "--- CHECK-TAGS ---"
node scripts/check-tags.mjs
echo "--- GIT ---"
git add src/components/SignedInStub.tsx
git commit -m "Dark Veil: red (hueShift 278)"
git push
echo "--- SHOW ---"
git show --stat HEAD
