echo "--- BUILD ---"
npm run build
echo "--- CHECK-TAGS ---"
node scripts/check-tags.mjs
echo "--- GIT ---"
git add src/components/AppMenu.tsx src/menu.css
git commit -m "Menu colours: blood red"
git push
echo "--- SHOW ---"
git show --stat HEAD
