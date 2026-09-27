/**
 * End-to-end checks against the production build.
 *   npm run build && npm run test:e2e
 * Uses Chromium via playwright-core (set CHROMIUM_PATH if it isn't at /opt/pw-browsers/chromium).
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const AXE = readFileSync(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");

const PORT = 4190;
const BASE = `http://localhost:${PORT}`;
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const ROUTES = ["/", "/menu", "/locations", "/locations/west-hampstead", "/locations/belsize-village", "/locations/hampstead", "/locations/swains-lane", "/locations/muswell-hill", "/locations/brent-cross", "/catering", "/cakes", "/about", "/contact"];
// every external destination must be one of these verified hosts/pages
const ALLOWED_EXTERNAL = [
  /^https:\/\/www\.ronisonline\.co\.uk\/(online-ordering|catering|order-for-any-occasion|review|menu\?menu=platters)$/,
  /^https:\/\/deliveroo\.co\.uk\/menu\/london\/(west-hampstead\/ronis-bakery|belsize-park\/ronis-belsize|hampstead\/ronis-hampstead|muswell-hill\/ronis)$/,
  /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/,
  /^https:\/\/maps\.apple\.com\/\?q=/,
  /^https:\/\/www\.instagram\.com\/ronisbb\/$/,
  /^https:\/\/www\.facebook\.com\/Ronisbakery\/$/,
];

let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) failures += 1;
};

const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], { stdio: "ignore", detached: true });
for (let i = 0; i < 100; i += 1) {
  try {
    if ((await fetch(BASE)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 200));
}

const browser = await chromium.launch({ executablePath: EXE, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  /* ------------------------------------------------ every page renders, no errors, no broken images */
  const internal = new Set();
  const external = new Set();
  for (const route of ROUTES) {
    // reduced motion: no smooth-scroll lag or mid-animation fades, so content checks and the
    // accessibility audit see the page's settled state
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const h1 = await page.locator("h1").first().innerText();
    ok(h1.length > 0 && !/hole in it/i.test(h1), `${route} renders (h1: “${h1.replace(/\s+/g, " ")}”)`);
    const title = await page.title();
    ok(/Roni's/.test(title), `${route} has a page title (${title})`);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    ok(!!desc && desc.length > 50, `${route} has a meta description`);
    // scroll through so lazy images load
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 700) await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(2500); // let smooth scroll and reveal transitions finish
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    ok(broken.length === 0, `${route} has no broken images${broken.length ? `: ${broken.join(", ")}` : ""}`);
    const noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute("alt")).length);
    ok(noAlt === 0, `${route} images all have alt attributes`);
    const links = await page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")));
    links.forEach((l) => (l.startsWith("/") ? internal.add(l.split("#")[0]) : l.startsWith("http") ? external.add(l) : null));
    const tel = links.filter((l) => l.startsWith("tel:"));
    ok(tel.every((t) => /^tel:\+44\d{10}$/.test(t)), `${route} phone links are well-formed (${tel.length})`);
    ok(errors.length === 0, `${route} has no console errors${errors.length ? `: ${errors.join(" | ")}` : ""}`);
    // automated accessibility audit (WCAG 2 A/AA + best practices)
    await page.addScriptTag({ content: AXE });
    const violations = await page.evaluate(async () =>
      (await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "best-practice"] })).violations.map((v) => `${v.id} (${v.nodes.length})`),
    );
    ok(violations.length === 0, `${route} passes axe accessibility checks${violations.length ? `: ${violations.join(", ")}` : ""}`);
    await page.close();
  }

  /* ------------------------------------------------ internal links all resolve to real pages */
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  for (const link of internal) {
    await page.goto(BASE + link, { waitUntil: "networkidle" });
    const h1 = await page.locator("h1").first().innerText();
    ok(!/hole in it/i.test(h1), `internal link ${link} resolves`);
  }
  for (const link of external) ok(ALLOWED_EXTERNAL.some((re) => re.test(link)), `external link is a verified destination: ${link}`);
  await page.goto(BASE + "/not-a-page", { waitUntil: "networkidle" });
  ok(/hole in it/i.test(await page.locator("h1").innerText()), "unknown routes show the 404 page");

  /* ------------------------------------------------ order flow with the keyboard */
  await page.goto(BASE + "/menu", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  ok((await page.evaluate(() => document.activeElement?.textContent)) === "Skip to content", "first Tab reaches the skip link");
  const orderBtn = page.locator(".header-nav .btn");
  await orderBtn.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  ok(await page.locator("dialog.order-dialog[open]").isVisible(), "Enter on “Order now” opens the order dialog");
  ok(await page.evaluate(() => !!document.activeElement?.closest("dialog")), "focus moves into the dialog");
  await page.getByRole("button", { name: /Muswell Hill/ }).focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  const optionHrefs = await page.locator(".order-options a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(optionHrefs.includes("https://www.ronisonline.co.uk/online-ordering"), "shop options include Roni's official online ordering");
  ok(optionHrefs.includes("https://deliveroo.co.uk/menu/london/muswell-hill/ronis"), "Muswell Hill shows its own Deliveroo listing");
  ok(optionHrefs.includes("tel:+442088294999"), "Muswell Hill shows its phone number");
  await page.getByRole("button", { name: "Choose a different shop" }).click();
  await page.getByRole("button", { name: /Swains Lane/ }).click();
  const swains = await page.locator(".order-options a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  ok(!swains.some((h) => h.includes("deliveroo")), "Swains Lane (no Deliveroo listing) shows no delivery option");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  ok(!(await page.locator("dialog.order-dialog[open]").count()), "Escape closes the dialog");

  /* ------------------------------------------------ menu filtering */
  await page.goto(BASE + "/menu", { waitUntil: "networkidle" });
  const all = await page.locator(".menu-list li:not(.menu-list-note)").count();
  await page.getByRole("button", { name: "Platters", exact: true }).click();
  await page.waitForURL("**category=platters");
  await page.waitForTimeout(200);
  const platters = await page.locator(".menu-list li:not(.menu-list-note)").count();
  ok(platters > 0 && platters < all && page.url().includes("category=platters"), `category filter works (${all} → ${platters}) and updates the URL`);
  await page.getByRole("button", { name: "Everything" }).click();
  await page.getByRole("searchbox").fill("salmon");
  const salmon = await page.locator(".menu-list li:not(.menu-list-note)").count();
  ok(salmon >= 1 && salmon < all, `search narrows the menu (“salmon” → ${salmon})`);
  await page.getByRole("searchbox").fill("zzzz");
  ok(await page.getByText("Show the whole menu").isVisible(), "no-results state offers a way back");

  /* ------------------------------------------------ catering tools */
  await page.goto(BASE + "/catering", { waitUntil: "networkidle" });
  // keyboard on the slider: 30 guests + 14 steps of 5 = 100 guests → 200 minis → 8 platters of 25
  await page.locator("#guests").focus();
  for (let i = 0; i < 14; i += 1) await page.keyboard.press("ArrowRight");
  ok(/^8 platters/.test(await page.locator(".planner-result").innerText()), "platter planner (keyboard): 100 guests × 2 minis = 8 platters");
  ok(/Place your order by/i.test(await page.locator(".ep-result").innerText()), "event planner shows an order-by deadline");
  await page.locator("#ep-date").fill(new Date().toISOString().slice(0, 10));
  ok(/less than 48 hours/i.test(await page.locator(".ep-result").innerText()), "event planner warns when the event is under 48 hours away");
  await page.close();

  /* ------------------------------------------------ home: hero, menu hover, signature scroll */
  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await home.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  ok(await home.locator(".hero").getByRole("button", { name: "Order now" }).isVisible(), "hero “Order now” is visible straight away");
  ok(await home.locator(".hero").getByRole("link", { name: "View menu" }).isVisible(), "hero “View menu” is visible straight away");
  await home.waitForLoadState("networkidle");
  ok(await home.locator(".hero-photo img").evaluate((i) => i.complete && i.naturalWidth > 0 && i.loading === "eager"), "hero photograph loads eagerly");
  ok(/open now|closed right now/i.test(await home.locator(".hero-live").innerText()), "hero shows live opening status");
  await home.locator("#menu").scrollIntoViewIfNeeded();
  await home.locator(".menu-row").nth(2).hover();
  await home.waitForTimeout(300);
  ok((await home.locator(".menu-stage-photo").nth(2).getAttribute("class")).includes("is-active"), "hovering a menu item swaps the large photograph");
  ok(/03 \/ 06/.test(await home.locator(".menu-stage-caption").innerText()), "menu photo caption follows the hovered item");
  const clipAt = async () => home.locator(".sig-frame").evaluate((el) => getComputedStyle(el).clipPath);
  await home.evaluate(() => window.scrollTo(0, document.querySelector(".sig-stage").getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.8));
  await home.waitForTimeout(900);
  const clipStart = await clipAt();
  await home.evaluate(() => window.scrollTo(0, document.querySelector(".sig-stage").getBoundingClientRect().top + window.scrollY - 40));
  await home.waitForTimeout(1500);
  const clipEnd = await clipAt();
  ok(clipStart !== clipEnd && /^inset\(0(px|%)?( 0(px|%)?)*\)$/.test(clipEnd), `signature photo opens to full width on scroll (${clipStart} → ${clipEnd})`);
  ok((await home.locator("canvas").count()) === 0, "no WebGL canvas on the page (photography only)");
  await home.close();

  /* ------------------------------------------------ reduced motion */
  const rm = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  await rm.goto(BASE + "/", { waitUntil: "networkidle" });
  ok((await rm.locator(".sig-frame").evaluate((el) => getComputedStyle(el).clipPath)) === "none", "reduced motion: signature photo is simply full width");
  ok((await rm.locator(".timeline li").first().evaluate((el) => getComputedStyle(el).opacity)) === "1", "reduced motion: content is visible without scroll animations");
  ok((await rm.locator(".hero-photo").evaluate((el) => getComputedStyle(el).animationName)) === "none", "reduced motion: no hero intro animation");
  await rm.close();

  /* ------------------------------------------------ mobile */
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(await m.locator(".header-nav").getByRole("link", { name: "Menu" }).isVisible(), "mobile: header shows Menu");
  ok(await m.locator(".header-nav").getByRole("button", { name: "Order" }).isVisible(), "mobile: header shows Order");
  ok(!(await m.locator(".header-nav .nav-wide").first().isVisible()), "mobile: no crowded navigation");
  const heroSrc = await m.locator(".hero-photo img").evaluate((i) => i.currentSrc);
  ok(/hero-tall/.test(heroSrc), "mobile: hero uses the tall crop");
  await m.locator(".menu-row").first().scrollIntoViewIfNeeded();
  ok(await m.locator(".menu-row-photo").first().isVisible(), "mobile: each menu item shows its own photo");
  ok(!(await m.locator(".menu-stage").isVisible()), "mobile: desktop hover stage is hidden");
  const btnHeights = await m.locator(".btn").evaluateAll((bs) => bs.filter((b) => b.offsetParent).map((b) => b.getBoundingClientRect().height));
  ok(btnHeights.every((hh) => hh >= 38), `mobile: buttons are comfortably tappable (min ${Math.min(...btnHeights).toFixed(0)}px)`);
  await m.close();

  /* ------------------------------------------------ no horizontal overflow at any size */
  for (const w of [375, 390, 430, 768, 1024, 1440, 1920]) {
    const pg = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
    const wide = [];
    for (const route of ["/", "/menu", "/locations", "/locations/west-hampstead", "/catering", "/cakes", "/about", "/contact"]) {
      await pg.goto(BASE + route, { waitUntil: "networkidle" });
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 0) wide.push(`${route} +${over}px`);
    }
    ok(wide.length === 0, `${w}px: no horizontal overflow${wide.length ? ` (${wide.join(", ")})` : ""}`);
    await pg.close();
  }
} finally {
  await browser.close();
}

/* ------------------------------------------------ no WebGL at all: nothing changes */
const noGl = await chromium.launch({ executablePath: EXE, args: ["--disable-webgl", "--disable-3d-apis"] });
try {
  const p = await noGl.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(await p.locator(".hero-photo img").isVisible(), "no WebGL: hero photograph is shown");
  ok(errors.length === 0, "no WebGL: no page errors");
} finally {
  await noGl.close();
  process.kill(-server.pid);
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
