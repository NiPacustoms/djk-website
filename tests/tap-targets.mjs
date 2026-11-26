// Misst auf dem Handy alle Bedienelemente kleiner als 44 × 44 px.
// Ausgenommen: Links im Fließtext (WCAG-Ausnahme „inline“). Gestreckte Links zählen mit ihrer echten Trefferfläche.
// Aufruf: node tests/tap-targets.mjs [basis-url]
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.argv[2] || "http://localhost:8768/";
const PAGES = ["index.html", "spielplan.html", "team-e2.html", "jugend.html", "turnen.html", "kontakt.html", "faq.html"];

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
let total = 0;
for (const f of PAGES) {
  await page.goto(BASE + f);
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelectorAll("details.foot-col").forEach((d) => (d.open = true)));
  const small = await page.evaluate(() => {
    const out = {};
    document.querySelectorAll("a, button, summary, select, label.plan-check").forEach((el) => {
      if (el.closest("[hidden]")) return;
      let r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // Links im Fließtext sind ausgenommen
      if (el.tagName === "A" && el.parentElement.closest("p:not(.crumb):not(.more), .prose li, .faq p, .lead, .stop, .result-note, .mt-status") && getComputedStyle(el).display === "inline") return;
      // Gestreckter Link: Trefferfläche ist das umgebende Element
      const after = getComputedStyle(el, "::after");
      if (after.content !== "none" && after.position === "absolute" && after.inset === "0px") {
        let p = el.parentElement; while (p && getComputedStyle(p).position === "static") p = p.parentElement;
        if (p) r = p.getBoundingClientRect();
      }
      if (r.height < 43.5 || r.width < 43.5) {
        const k = `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} ${Math.round(r.width)}×${Math.round(r.height)} „${(el.textContent || "").trim().slice(0, 24)}“`;
        out[k] = (out[k] || 0) + 1;
      }
    });
    return out;
  });
  const n = Object.values(small).reduce((a, b) => a + b, 0);
  total += n;
  console.log(`${f}: ${n} zu klein`);
  for (const [k, v] of Object.entries(small)) console.log(`   ${v}× ${k}`);
}
await browser.close();
console.log(`Gesamt: ${total}`);
process.exit(total ? 1 : 0);
