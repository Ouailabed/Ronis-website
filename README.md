# Fresh from Roni's — website concept

A complete website concept for **Roni's Bagel Bakery** (North London, since 1989): a cinematic 3D bagel hero with a scroll-driven "food commercial", plus the practical pages people actually need — menu, locations with live opening status, ordering, catering and cakes.

Built with **Vite + React + TypeScript + React Router + Three.js**. No backend: it's a static site that links to Roni's real ordering destinations.

---

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev            # local dev server → http://localhost:5173
npm run build          # type-check + production build → dist/
npm run preview        # serve the production build → http://localhost:4173
npm run test:e2e       # end-to-end + axe accessibility checks against the build (needs Chromium)
npm run render:assets  # re-render the 3D food illustrations into public/renders
```

`test:e2e` and `render:assets` use Chromium through `playwright-core`. If Chromium isn't at `/opt/pw-browsers/chromium`, set `CHROMIUM_PATH=/path/to/chrome`.

## What's on the site

| Page | What it does |
| --- | --- |
| **Home** (`/`) | 3D bagel hero (headline + *Order now* / *Find your Roni's* visible instantly) → scroll story where the bagel opens and the cream cheese and smoked salmon go on → product showcase → story → catering → bakery finder → interactive finale. |
| **Menu** (`/menu`) | Filter by category (synced to `?category=`), search, Roni's favourites highlighted. |
| **Locations** (`/locations`, `/locations/:slug`) | Live *Open now / Closed · opens 7am* (London time), schematic map, directions (Google/Apple Maps), call, order options per shop. |
| **Catering** (`/catering`) | 48-hour lead time explained, live "earliest collection" time, platter planner (guests → platters → guide price). |
| **Cakes**, **About**, **Contact** | Verified copy only; contact is by phone per shop (no fake forms). |
| **Order now** (header, mobile bar, everywhere) | A dialog that asks *which Roni's* first, then shows that shop's real options: Roni's online ordering, that shop's own Deliveroo listing (where one exists), its phone number, and catering. |

## Editing business details

**All facts live in [`src/data/business.ts`](src/data/business.ts)** — locations, hours, phone numbers, ordering links, menu, catering and story. Pages, the order dialog, structured data (SEO) and "Open now" badges all read from it.

- Hours use 24-hour times: `{ days: "Mon-Sun", open: "07:00", close: "20:00" }`. `close: "24:00"` means midnight.
- Leave `hours: []` if a shop's hours aren't confirmed — the site says "please call" instead of guessing.
- `deliveroo: ""` hides the delivery option for that shop.
- `approx` coordinates are only for the schematic map, never for navigation.

[`VERIFICATION.md`](VERIFICATION.md) lists where each fact came from and what still needs confirming.

## Images

There are no Roni's photographs in this repo. Every food image is a **digital illustration rendered from the site's own 3D models** and is labelled "Illustration" on the page. See [`ASSETS.md`](ASSETS.md) for the full list and exactly where to drop in real photography.

## How the 3D works

- `src/three/bagel.ts` — procedural bagel: lumpy, flat-bottomed ring; crust colour/normal/gloss maps; sesame or poppy seeds; splits into halves with a crumb face.
- `src/three/ingredients.ts`, `bakes.ts` — cream cheese, folded smoked salmon, challah, carrot cake, platter.
- `src/three/BagelShow.ts` — the hero/scroll scene. The **`TIMELINE`** at the top controls when the bagel opens and when each ingredient lands.
- `src/components/BagelShow.tsx` — shows a still image instantly, lazy-loads three.js after first paint, generates textures in a Web Worker, then crossfades to the live scene. Pauses when off-screen; follows the pointer on desktop and sways gently on touch screens.
- **Fallbacks:** reduced motion → a short sequence of still images; no WebGL → still images. The page is fully usable either way, and a *Skip the bagel* link jumps past the scene.

## Deploying

It's a static single-page app.

- **Netlify:** build `npm run build`, publish `dist` (`public/_redirects` handles routes).
- **Vercel:** import the repo; `vercel.json` handles routes.
- Set **`VITE_SITE_URL`** (e.g. `https://www.ronisonline.co.uk`) at build time so social previews and canonical URLs are absolute.
- Structured data (schema.org `Bakery`) for every shop is written into the static HTML at build time. For the best SEO, consider pre-rendering routes once the content is final.

## Project layout

```
src/data/business.ts        ← every business fact (edit here)
src/data/renders.json       ← generated sizes of the rendered images
src/pages/                  ← Home, Menu, Locations, LocationDetail, Catering, Cakes, About, Contact
src/components/             ← Header, Footer, OrderDialog, BagelShow, LocationFinder, BagelToss…
src/three/                  ← 3D models, textures (worker), scenes, offline "studio"
src/styles/                 ← base tokens, layout, home, pages
scripts/render-assets.mjs   ← renders the 3D models to public/renders/*.webp
tests/e2e.mjs               ← end-to-end checks
```

## Credits

Fonts: Fraunces and Instrument Sans (SIL Open Font Licence), self-hosted via Fontsource. 3D: three.js (MIT). All food illustrations are original renders made for this project.
