/**
 * Builds a relative-path copy of the site in dist-preview/ for sharing as a single
 * preview link (hash routes, e.g. #/menu). The page file is written as a fragment
 * (no <html>/<head>/<body>) because the preview host adds its own document skeleton.
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

execSync("npx vite build --outDir dist-preview --emptyOutDir", { stdio: "inherit", env: { ...process.env, VITE_ARTIFACT: "1" } });

const html = readFileSync("dist-preview/index.html", "utf8");
const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const title = "<title>Roni's Bagel Bakery</title>"; // the preview's name in the gallery
const keep = head
  .replace(/<title>[\s\S]*?<\/title>/, "")
  .replace(/<meta charset[^>]*>/, "")
  .replace(/<meta name="viewport"[^>]*>/, "")
  .trim();
writeFileSync("dist-preview/index.html", `${title}\n${keep}\n${body.trim()}\n`);
console.log("✓ dist-preview/index.html (fragment)");
