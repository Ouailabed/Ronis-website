# Design notes

Roni's = London bagel institution × editorial food magazine × modern web. The site is built like a campaign: big food photography, poster type, one question per scene.

## Audit (what was kept)

- **Kept:** `src/data/business.ts` (every fact), `src/data/photos.ts` + `public/photos`, hours/open-now, nearest shop, order drawer logic, catering planners, SEO plugin, router, GSAP, the e2e suite.
- **Replaced:** every visual component, all CSS, the fonts, the navigation, the home page composition.
- **Not shipped:** three.js — used offline only to render the food images (`src/three/photo.ts`).

## System

- **Colour:** crust-paper `#efe7d8`, espresso black `#16110d`, one accent — Roni's awning blue `#1f3f94`. No gradients.
- **Type:** Archivo (variable width) set condensed, heavy and upper-case for poster headlines; Fraunces italic for the editorial voice ("done properly", "having?"); Archivo at normal width for reading.
- **Shapes:** square blocks. Buttons are solid slabs whose fill wipes across on hover; no pills, no cards, photos run to the viewport edges.

## Home, scene by scene

| # | Scene | Motion (all off with reduced motion) |
| --- | --- | --- |
| 01 | Campaign hero: "Roni's Bagels, *done properly.*", Order now | Photo rises like a curtain and settles; type lines rise; pointer drift (desktop); on scroll the photo pulls in at the edges onto the paper |
| 02 | SINCE 1989 set across the page; photo + story + dates | The two words slide together; photo and text travel at different speeds |
| 03 | The bagels: numbered list + one big photo, name/description/price beneath | New photo wipes up over the last one; phones get a swipe strip of names above the photo |
| 04 | Food moment: one huge photo, "Fresh. *Simple.* Roni's." | Photo settles from a close crop; each word drifts at its own pace |
| 05 | "What are you *having?*" — one enormous Order button + Collect / Delivery / Platters | Headline reveal only |
| 06 | Visit: blue poster map, pick a bakery, address/today/hours/call, Get directions | Detail fades in on change |
| 07 | "See you at Roni's." over a table of bagels | Photo settles as it scrolls in |

Navigation: wordmark, Menu / About / Location, and an Order block that never leaves — the bar tucks away while reading down and an Order tab stays in the corner. Phones get a designed full-screen menu.

## ThreeUI references (open-source repo; threeui.com itself is blocked here, Kairo/Aurello are not in the repo)

| Need | Reference | What was taken |
| --- | --- | --- |
| Hero | **Kage** hero (mask-line reveal), **Sylva** hero (per-word delayed rise) | Curtain reveal + staggered line rise |
| Hero | **Kairo** (culinary: product photography first, pinned editorial feel) | Food as the dominant visual, photo contracting on scroll instead of pinning |
| Editorial layout | **Complete Shelf** (editorial header + index nav) | Numbered labels, index-style lists |
| Editorial layout | **Meng To Sketchbook** (large "plates") | Full-bleed photographs as whole scenes |
| Image transition | Kage `clip-path` reveals | Photo uncovering in the hero and bagels list |
| Image transition | **Gallery** render loop discipline | Effects pause/revert cleanly; nothing runs off-screen |
| Navigation | Kage nav | Minimal bar, one strong action |
| Product interaction | **Bestsellers** (menu layer + detail panel) | Bagels list → big photo + detail |
| Scroll interaction | **Aurello** (scroll-choreographed product, stills as fallback) | Scroll-linked scale/drift in 02, 04, 07; the stills are the whole experience |

Rejected: shaders, particle wordmarks, glass/gradient CTAs, preloaders, custom cursors, live 3D.
