// Qualitätsprüfung vor jeder Veröffentlichung: Links, Bilder, Barrierefreiheit-Grundlagen, Layout auf dem Handy, JS-Fehler.
// Aufruf: npm test   (nach npm run build)
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DIST = path.join(ROOT, "dist");
const problems = [];
const fail = (f, msg) => problems.push(`${f}: ${msg}`);
const htmlFiles = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : p.endsWith(".html") && htmlFiles.push(p); } })(DIST);

// 1. Statische Prüfungen
for (const file of htmlFiles) {
  const rel = path.relative(DIST, file);
  const html = fs.readFileSync(file, "utf8");
  if (!/<html lang="de"/.test(html)) fail(rel, "lang=de fehlt");
  if (!/<title>[^<]{3,}<\/title>/.test(html)) fail(rel, "Titel fehlt");
  if (!rel.startsWith("admin/cms")) {
    const h1 = (html.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) fail(rel, `${h1} Hauptüberschriften statt 1`);
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt="/.test(m[0])) fail(rel, "Bild ohne alt: " + m[0].slice(0, 80));
  for (const m of html.matchAll(/<input\b[^>]*id="([^"]+)"[^>]*>/g)) {
    if (/type="(hidden|checkbox)"/.test(m[0]) && !/type="checkbox"/.test(m[0])) continue;
    if (!new RegExp(`for="${m[1]}"|aria-label`).test(html) && !/aria-label/.test(m[0]) && !/<label[^>]*>\s*<input[^>]*id="${m[1]}"/.test(html)) fail(rel, "Eingabefeld ohne Beschriftung: " + m[1]);
  }
  const base = /<base href="\/">/.test(html) ? DIST : path.dirname(file);
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:|\/\/|\/api\/)/.test(u) || u === "") continue;
    const target = u.startsWith("/") ? path.join(DIST, u) : path.join(base, u);
    const ok = fs.existsSync(target) || fs.existsSync(target + ".html") || fs.existsSync(path.join(target, "index.html"));
    if (!ok) fail(rel, "Link ins Leere: " + u);
  }
}

// 2. Browser-Prüfung (Handy-Breite): JS-Fehler und seitliches Scrollen
let chromium;
try { chromium = createRequire(import.meta.url)("playwright").chromium; } catch {}
if (chromium) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    let f = path.join(DIST, p.endsWith("/") ? p + "index.html" : p);
    if (!fs.existsSync(f) && fs.existsSync(f + ".html")) f += ".html";
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    const type = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ".ics": "text/calendar" }[path.extname(f)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type }); fs.createReadStream(f).pipe(res);
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  let current = "";
  page.on("pageerror", (e) => fail(current, "JS-Fehler: " + e.message));
  const pages = htmlFiles.map((f) => path.relative(DIST, f)).filter((f) => !f.startsWith("admin/cms"));
  for (const rel of pages) {
    current = rel;
    await page.goto(`http://localhost:${port}/${rel}`, { waitUntil: "load" });
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) fail(rel, "seitliches Scrollen auf dem Handy");
  }
  await browser.close(); server.close();
} else {
  console.log("Hinweis: Playwright nicht gefunden, Browser-Prüfung übersprungen.");
}

if (problems.length) { console.error(`✗ ${problems.length} Probleme:\n` + problems.map((p) => "  - " + p).join("\n")); process.exit(1); }
console.log(`✓ ${htmlFiles.length} Seiten geprüft, keine Probleme.`);
