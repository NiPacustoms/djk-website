// Prüft DESIGN.md mit dem offiziellen Google-Werkzeug. Schlägt bei Fehlern UND Warnungen fehl (z. B. zu wenig Kontrast).
import { execFileSync } from "node:child_process";
let out;
try { out = execFileSync("npx", ["--no-install", "design.md", "lint", "DESIGN.md"], { encoding: "utf8" }); }
catch (e) { out = e.stdout || ""; }
const r = JSON.parse(out);
const bad = r.findings.filter((f) => f.severity !== "info");
for (const f of bad) console.error(`✗ ${f.severity} ${f.rule}: ${f.message}`);
if (bad.length) process.exit(1);
console.log(`✓ DESIGN.md: ${r.findings.find((f) => f.rule === "token-summary")?.message || "ok"}`);
