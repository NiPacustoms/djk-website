// Holt die öffentlichen Spielpläne aller Teams von fussball.de und schreibt content/spiele.json.
// Torzahlen werden NICHT ausgelesen: fussball.de verschleiert sie absichtlich, das wird respektiert.
// Aufruf: node scripts/fetch-matches.mjs   (läuft 2× täglich per GitHub Action)
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", n + ".json"), "utf8"));
const UA = "DJK-Spvgg-Herten-Website/1.0 (+https://www.djkspvggherten.de; info@djkspvggherten.de)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Unsere Teams mit fussball.de-ID und Zielseite
const teams = [];
const j = read("jugend"), d = read("damen"), s = read("senioren");
for (const t of [...j.youthTeams, ...j.girlsTeams]) if (t.fd) teams.push({ id: t.id, name: t.name, fd: t.fd });
for (const t of d.teams) if (t.fd) teams.push({ id: slug(t.name), name: t.name, fd: t.fd });
for (const g of s.groups) for (const t of g.teams) if (t.fd) teams.push({ id: slug(t.name), name: t.name, fd: t.fd });
function slug(n) { return n.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const strip = (s) => decode(s.replace(/<[^>]+>/g, " "));

export function parse(html) {
  const games = [];
  const rows = html.split(/<tr\b/).slice(1);
  let head = null;
  for (const r of rows) {
    if (/class="row-headline/.test(r)) {
      const t = strip(r.slice(r.indexOf(">") + 1));
      const m = t.match(/(\d{2})\.(\d{2})\.(\d{4})\s*-\s*(\d{2}):(\d{2})\s*Uhr\s*\|\s*(.+)$/);
      const parts = m ? m[6].split("|").map((x) => x.trim()) : [];
      head = m ? { date: `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`, ageClass: parts.length > 1 ? parts[0] : null, competition: parts[parts.length - 1] } : null;
      continue;
    }
    if (!head || !/column-club/.test(r)) continue;
    const clubs = [...r.matchAll(/<td class="column-club[^"]*">\s*(?:<a href="([^"]*)"[^>]*>)?([\s\S]*?)<\/td>/g)].map((m) => ({
      teamId: (m[1] || "").match(/team-id\/([A-Z0-9]+)/)?.[1] || null,
      name: strip(m[2].replace(/<span[^>]*data-alt[^>]*><\/span>/g, "")),
    }));
    if (clubs.length < 2) continue;
    const link = r.match(/href="(https:\/\/www\.fussball\.de\/spiel\/[^"]+)"/)?.[1] || null;
    const groupLink = r.match(/href="(https:\/\/www\.fussball\.de\/(?:spieltagsuebersicht|staffel)[^"]+)"/)?.[1] || null;
    const scoreCell = r.match(/<td class="column-score">([\s\S]*?)<\/td>/)?.[1] || "";
    const hasScore = /score-left/.test(scoreCell);
    const flag = strip(scoreCell.replace(/<span[^>]*score-(left|right)[^>]*>[\s\S]*?<\/span>/g, "").replace(/:/g, "")).replace(/[^\p{L}\p{N} .-]/gu, "").trim() || null;
    games.push({
      id: link ? link.match(/spiel\/([A-Z0-9]+)$/)?.[1] || link : `${head.date}-${clubs[0].name}-${clubs[1].name}`,
      date: head.date, ageClass: head.ageClass, competition: head.competition,
      home: clubs[0].name, homeId: clubs[0].teamId, away: clubs[1].name, awayId: clubs[1].teamId,
      url: link || groupLink, hasScore, flag: flag && flag.length < 30 ? flag : null,
    });
  }
  return games;
}

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" } });
      if (res.ok) return await res.text();
    } catch {}
    await sleep(2000 * (attempt + 1));
  }
  return null;
}

async function main() {
  const out = new Map();
  let ok = 0;
  for (const t of teams) {
    for (const kind of ["next", "prev"]) {
      const html = await get(`https://www.fussball.de/ajax.team.${kind}.games/-/mode/PAGE/team-id/${t.fd}`);
      await sleep(1100);
      if (!html) continue;
      ok++;
      for (const g of parse(html)) {
        const isHome = g.homeId === t.fd;
        if (!isHome && g.awayId !== t.fd) continue;
        out.set(g.id + t.id, { ...g, team: t.id, teamName: t.name, isHome, opponent: isHome ? g.away : g.home });
      }
    }
  }
  if (!ok) { console.error("fussball.de nicht erreichbar, alter Stand bleibt."); process.exit(0); }
  const games = [...out.values()].sort((a, b) => a.date.localeCompare(b.date));
  const file = path.join(ROOT, "content/spiele.json");
  fs.writeFileSync(file, JSON.stringify({ updated: new Date().toISOString(), source: "fussball.de", games }, null, 2) + "\n");
  console.log(`${games.length} Spiele für ${teams.length} Teams gespeichert (${ok} Abrufe).`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) main();
