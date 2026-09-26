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
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const h1 = await page.locator("h1").first().innerText();
    ok(h1.length > 0 && !/hole in it/.test(h1), `${route} renders (h1: “${h1.replace(/\s+/g, " ")}”)`);
    const title = await page.title();
    ok(/Roni's/.test(title), `${route} has a page title (${title})`);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    ok(!!desc && desc.length > 50, `${route} has a meta description`);
    // scroll through so lazy images load
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 700) await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(1400); // let scroll-reveal transitions finish
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
    ok(!/hole in it/.test(h1), `internal link ${link} resolves`);
  }
  for (const link of external) ok(ALLOWED_EXTERNAL.some((re) => re.test(link)), `external link is a verified destination: ${link}`);
  await page.goto(BASE + "/not-a-page", { waitUntil: "networkidle" });
  ok(/hole in it/.test(await page.locator("h1").innerText()), "unknown routes show the 404 page");

  /* ------------------------------------------------ order flow with the keyboard */
  await page.goto(BASE + "/menu", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  ok((await page.evaluate(() => document.activeElement?.textContent)) === "Skip to content", "first Tab reaches the skip link");
  const orderBtn = page.locator(".header-actions .btn");
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
  const all = await page.locator(".menu-items li").count();
  await page.getByRole("button", { name: "Platters", exact: true }).click();
  await page.waitForURL("**category=platters");
  await page.waitForTimeout(200);
  const platters = await page.locator(".menu-items li").count();
  ok(platters > 0 && platters < all && page.url().includes("category=platters"), `category filter works (${all} → ${platters}) and updates the URL`);
  await page.getByRole("button", { name: "Everything" }).click();
  await page.getByRole("searchbox").fill("salmon");
  const salmon = await page.locator(".menu-items li").count();
  ok(salmon >= 1 && salmon < all, `search narrows the menu (“salmon” → ${salmon})`);
  await page.getByRole("searchbox").fill("zzzz");
  ok(await page.getByText("Show the whole menu").isVisible(), "no-results state offers a way back");

  /* ------------------------------------------------ catering tools */
  await page.goto(BASE + "/catering", { waitUntil: "networkidle" });
  // keyboard on the slider: 30 guests + 14 steps of 5 = 100 guests → 200 minis → 8 platters of 25
  await page.locator("#guests").focus();
  for (let i = 0; i < 14; i += 1) await page.keyboard.press("ArrowRight");
  ok(/^8 mini bagel platters/.test(await page.locator(".planner-result").innerText()), "platter planner (keyboard): 100 guests × 2 minis = 8 platters");
  ok((await page.locator(".lead-card-date").innerText()).length > 5, "earliest collection date is shown");
  await page.close();

  /* ------------------------------------------------ home hero: buttons immediately, 3D loads */
  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await home.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  ok(await home.getByRole("button", { name: "Order now" }).nth(1).isVisible(), "hero “Order now” is visible straight away");
  ok(await home.getByRole("link", { name: "Find your Roni's" }).first().isVisible(), "hero “Find your Roni's” is visible straight away");
  await home.waitForSelector(".show.is-ready", { timeout: 30000 }).catch(() => null);
  ok((await home.locator(".show.is-ready canvas").count()) === 1, "3D scene loads and takes over from the still image");
  await home.close();

  /* ------------------------------------------------ reduced motion */
  const rm = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  await rm.goto(BASE + "/", { waitUntil: "networkidle" });
  ok((await rm.locator(".show.is-static").count()) === 1 && (await rm.locator(".show canvas").count()) === 0, "reduced motion: no 3D scroll scene, static sequence instead");
  ok((await rm.locator(".show-sequence img").count()) === 3, "reduced motion: the bagel story is shown as three stills");
  await rm.close();

  /* ------------------------------------------------ mobile */
  const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto(BASE + "/", { waitUntil: "networkidle" });
  ok(await m.locator(".mobile-bar").isVisible(), "mobile: sticky Order / Find bar is visible");
  await m.locator(".menu-toggle").click();
  ok(await m.locator("#mobile-menu").isVisible(), "mobile: menu button opens navigation");
  await m.locator("#mobile-menu a", { hasText: "Locations" }).click();
  await m.waitForURL("**/locations");
  await m.waitForTimeout(300);
  ok(!(await m.locator("#mobile-menu").isVisible()), "mobile: navigating closes the menu");
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 0, `mobile: no horizontal overflow (${overflow}px)`);
  await m.close();
} finally {
  await browser.close();
}

/* ------------------------------------------------ no WebGL: still images */
const noGl = await chromium.launch({ executablePath: EXE, args: ["--disable-webgl", "--disable-3d-apis"] });
try {
  const p = await noGl.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  ok((await p.locator(".show.is-static").count()) === 1, "no WebGL: falls back to the static scene");
  ok(await p.locator(".show-still").isVisible(), "no WebGL: hero still image is shown");
  ok(errors.length === 0, "no WebGL: no page errors");
} finally {
  await noGl.close();
  process.kill(-server.pid);
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
