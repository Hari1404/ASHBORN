echo "--- BUILD ---"
npm run build
echo "--- CHECK-TAGS ---"
node scripts/check-tags.mjs
echo "--- GIT ---"
git add src/components/SignedInStub.tsx src/components/AppMenu.tsx src/menu.css
git commit -m "Purple: menu and Dark Veil"
git push
echo "--- SHOW ---"
git show --stat HEAD
