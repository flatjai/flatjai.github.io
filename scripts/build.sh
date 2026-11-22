#!/usr/bin/env bash
# Build the showcase: FlatJai's web app at the commit in FLATJAI_REF, with the overlay laid on top,
# exported as a static site into out/.
#
#   scripts/build.sh                 fetch flatjai/flatjai at FLATJAI_REF and build
#   FLATJAI_SRC=../flatjai scripts/build.sh   build from a local clone instead (same commit)
set -euo pipefail
cd "$(dirname "$0")/.."
root=$PWD
ref=$(tr -d '[:space:]' < FLATJAI_REF)
build=$root/.build

rm -rf "$build" out
mkdir -p "$build"
if [ -n "${FLATJAI_SRC:-}" ]; then
  git -C "$FLATJAI_SRC" archive "$ref" web | tar -x -C "$build"
else
  git clone -q --filter=blob:none --no-checkout https://github.com/flatjai/flatjai.git "$build/src"
  git -C "$build/src" archive "$ref" web | tar -x -C "$build"
  rm -rf "$build/src"
fi
echo "FlatJai web app at ${ref:0:7}"

web=$build/web
cp overlay/next.config.ts "$web/next.config.ts"
cp -R overlay/src/. "$web/src/"                 # layout, the guide, the icons
cat overlay/showcase.css >> "$web/src/app/globals.css"
rm -rf "$web/src/app/runs"                       # the run inspector needs the API
mkdir -p "$web/public"
cp -R overlay/public/. "$web/public/"
touch "$web/public/.nojekyll"

cd "$web"
pnpm install --frozen-lockfile --silent
NEXT_PUBLIC_API_URL=https://api.flatjai.invalid NEXT_PUBLIC_METRICS_URL=https://github.com/flatjai/flatjai \
  NEXT_TELEMETRY_DISABLED=1 pnpm exec next build
mv out "$root/out"
echo "Built into out/ ($(du -sh "$root/out" | cut -f1))"
