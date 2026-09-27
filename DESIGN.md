# Design notes

The brief: Roni's should look like an established London food brand — part editorial food magazine, part contemporary bakery. Food is the hero; every section has to answer *what is Roni's, why care, what do I eat, where, when is it open, how do I order*.

## System

- **Colour:** paper `#f2ede3`, deep black `#141210`, and one accent — Roni's awning blue `#22418f` — used for ordering, the closing band, map pins and the years in the story. No gradients.
- **Type:** Instrument Serif (headlines, item names, big numbers) and Instrument Sans (everything else). Small tracked capitals for labels.
- **Grid:** 12 columns, hairline rules, numbered section labels (`01 — Since 1989`). Headlines are large only where they carry meaning (the hero, section heads, the closing line).
- **Page rhythm (home):** dark photographic hero → paper (story, menu) → black (signature bagel) → paper (visit) → blue (order) → black footer.

## Motion

Restrained, native scrolling, and optional:

| Effect | Where | Fallback |
| --- | --- | --- |
| Photo uncovers from the centre and settles from a slight zoom; headline rises line by line | Home hero, on load (CSS) | Reduced motion: shown straight away |
| Hero photo drifts slower than the page | Home hero, desktop only (GSAP) | Off on phones and with reduced motion |
| Headlines rise out of a mask; photos uncover upward | Section heads and some photos, on scroll (CSS + IntersectionObserver) | Reduced motion / no JS: shown straight away |
| Hovering (or focusing) a menu item swaps the large photo | Home menu, desktop | Phones: every item has its own photo |
| Framed photo opens out to full width and settles as you scroll | Home signature bagel (GSAP scrub) | Reduced motion: full width, static |
| Page change: short fade-up | Every route | Reduced motion: none |

The scroll test in `tests/e2e.mjs` checks the signature transition, the menu swap, reduced motion, mobile and no-WebGL behaviour. Scrolling was measured at a median 16.7 ms per frame.

## WebGL: used offline, not on the page

The food images are rendered with three.js (`src/three/photo.ts`) — but offline, into ordinary WebP files. The live site ships **no WebGL**: the earlier real-time 3D hero looked like a tech demo, added hundreds of kilobytes of JavaScript, and was behind most of the scrolling problems reported on the previous version. Photographs (and, until Roni's supplies them, photo-like renders) do the job better. The site is identical with WebGL disabled.

## ThreeUI — what was taken, what wasn't

threeui.com itself was not reachable from the build environment, and the two culinary/product templates named in the brief (**Kairo**, **Aurello**) are not in the open-source repository ([MengTo/threeui](https://github.com/MengTo/threeui)), so those were studied from their published descriptions; everything else from the repo's source.

| ThreeUI piece | What makes it good | Fits Roni's? | What happened |
| --- | --- | --- | --- |
| **Kage / Complete Shelf** landing pages: `mask-line` and `word-reveal` headline reveals, `data-rv="up"` fades, `cubic-bezier(.16,1,.3,1)` easing | Type that feels printed, arriving calmly | Yes | Adapted as `.reveal-lines` / `.reveal` in `base.css`, same easing |
| **Kairo** (culinary product page): pinned editorial sections, remote product photography, ScrollTrigger reveals | Photography first; one product given the whole screen | Yes | The signature-bagel section: the photo opens to full width as you scroll. No pinning (it fights mobile scrolling) and no Lenis (it caused jank earlier) |
| **Aurello**: a product travels through the page; original stills as the no-WebGL fallback | Stills that stand on their own | Partly | Kept the idea that the stills are the real experience; dropped the real-time 3D journey |
| **Gallery** (rotating image cylinder) | Good render loop: pauses off-screen, one frame for reduced motion | Pattern yes, effect no | A spinning gallery says "tech demo". Its render-loop discipline informed the scroll code |
| **Article Headings**: numbered entries with an index and meta line | Editorial list rhythm | Yes | The numbered home menu (`01 Smoked salmon & cream cheese…`) and the numbered shop list. Its text-scramble effect was left out |
| **Newsletter footer** giant wordmark | Strong sign-off | No | Replaced by a minimal footer; the "Hungry? Come get your bagel." band is the sign-off |
| Shaders, particle wordmarks, glass/gradient CTAs, preloaders, custom cursors | — | No | A bakery site shouldn't make you wait or look like a SaaS product |
