# flatjai.github.io

The website of [FlatJai (揾樓仔)](https://github.com/flatjai/flatjai), an AI agent that finds students
a home in Hong Kong: **https://flatjai.github.io**

The site is FlatJai's own landing page, built from the real web app, as a static preview. Anything a
visitor does (send a brief, try an example, open a menu) opens a short guide to running FlatJai on
their own machine, with a link to the repository.

## How it is built

Nothing here copies the app. `scripts/build.sh` takes `web/` from flatjai/flatjai at the commit in
`FLATJAI_REF`, lays a few small files over it and exports a static site into `out/`:

| File | Does |
|---|---|
| `overlay/next.config.ts` | Static export: no server, no redirects |
| `overlay/src/app/layout.tsx` | Page title, description and link preview; adds the guide; answers the app's API calls with an empty list, so the page never contacts a backend |
| `overlay/src/app/icon.svg`, `apple-icon.png`, `favicon.ico` | Jai as the tab and home-screen icon |
| `overlay/src/components/Showcase.tsx` | The "Preview" pill and the guide that opens on any action |
| `overlay/public/` | Jai jumping (`jai-jump.mp4`, still `jai-poster.png`) and the HKUST logo for the guide; the link preview (`og.png`), app icons and `manifest.webmanifest` |
| `overlay/showcase.css` | The guide's motion and safe-area spacing, appended to the app's stylesheet |

The run inspector (`/runs/[id]`) is left out: it needs the API.

## Update the page

When the landing page changes in flatjai/flatjai, put the new commit in `FLATJAI_REF` and push.
The Publish workflow builds and deploys on every push to `main`, or by hand from the Actions tab.

## Build it locally

Needs Node.js 20.9+ and pnpm.

```bash
scripts/build.sh                          # fetches flatjai/flatjai at FLATJAI_REF
FLATJAI_SRC=../flatjai scripts/build.sh   # or from a local clone (it must have that commit)
python3 -m http.server 4173 -d out        # then open http://localhost:4173
```

Made by Zhang Sihan, Nuttapat Naothaworn and Bhanu Pratap Rana for CSIT6000V Advanced AI Computing
and Systems at HKUST, Fall 2026-27.
