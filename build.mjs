// Statischer Generator für die DJK-Website. Aufruf: node build.mjs
// Erzeugt dist/ (fertige Website zum Hochladen) und preview/ (Vorschau-Variante).
import fs from "node:fs";
import path from "node:path";
import * as D from "./data.mjs";
import { writeAdmin } from "./admin.mjs";
import sharp from "sharp";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SIZES = JSON.parse(fs.readFileSync(path.join(ROOT, "sizes.json"), "utf8"));
// CMS-Uploads (content/uploads) automatisch als WebP in passender Größe aufbereiten
const upKey = (name) => "up-" + name.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
{
  const upDir = path.join(ROOT, "content/uploads");
  if (fs.existsSync(upDir)) for (const f of fs.readdirSync(upDir)) {
    if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(f)) continue;
    const key = upKey(f), target = path.join(ROOT, "assets/img", key + ".webp");
    if (!fs.existsSync(target) || fs.statSync(target).mtimeMs < fs.statSync(path.join(upDir, f)).mtimeMs) {
      await sharp(path.join(upDir, f)).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 74 }).toFile(target);
    }
    const m = await sharp(target).metadata();
    SIZES[key] = [m.width, m.height];
  }
}
const CSS = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
const JS = fs.readFileSync(path.join(ROOT, "main.js"), "utf8");
const SITE_URL = "https://www.djkspvggherten.de";
let SEARCH_JSON = "[]";
const { club } = D;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tel = (p) => "tel:+49" + p.replace(/\D/g, "").replace(/^0/, "");
const telA = (p) => (p ? `<a class="tel" href="${tel(p)}">${esc(p)}</a>` : "");
const mailA = (m) => `<a href="mailto:${esc(m)}">${esc(m)}</a>`;
const yearText = (t) => (t.years[0] === t.years[1] ? `Jg. ${t.years[0]}` : `Jg. ${t.years[0]}–${t.years[1]}`);
const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

function img(key, alt, { cls = "", eager = false, sizes = "" } = {}) {
  if (key && /[\/.]/.test(key)) key = upKey(path.basename(key));
  const s = SIZES[key];
  if (!s) throw new Error("Bild fehlt: " + key);
  return `<img src="assets/img/${key}.webp" width="${s[0]}" height="${s[1]}" alt="${esc(alt)}"${cls ? ` class="${cls}"` : ""}${eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}${sizes ? ` sizes="${sizes}"` : ""}>`;
}

// ---------- Trainingskalender (.ics) ----------
const DAYMAP = { Mo: "MO", Di: "TU", Mi: "WE", Do: "TH", Fr: "FR", Sa: "SA", So: "SU" };
const DAYIDX = { MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6, SU: 0 };
function parseTraining(s) {
  const m = s.match(/^(.*?)\s+(\d{1,2}):(\d{2})–(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const days = m[1].split(/[,+]/).map((x) => DAYMAP[x.trim()]).filter((x) => x !== undefined);
  if (!days.length) return null;
  return { days, start: [+m[2], +m[3]], end: [+m[4], +m[5]] };
}
const slugOf = (name) => name.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const icsText = (s) => String(s).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
const pad = (n) => String(n).padStart(2, "0");
const CALS = {}; // id -> ics-Inhalt
const KATZENBUSCH = "Sportanlage Katzenbusch, Katzenbuschstr. 1–3, 45699 Herten";
// Alle Trainingseinheiten des Vereins (für Kalender und „Heute am Katzenbusch“)
const SESSIONS = [];
function calendarFor(id, team, url) {
  const t = parseTraining(team.training);
  if (!t) return null;
  const contacts = team.coaches.map(([n, p, role]) => `${n}${role ? " (" + role + ")" : ""}${p ? " " + p : ""}`).join("\n");
  const ev = t.days.map((d) => ({ d, start: t.start, end: t.end, loc: KATZENBUSCH }));
  ev.forEach((e) => SESSIONS.push({ n: team.name, u: url || "", k: "Fußball", d: DAYIDX[e.d], s: e.start[0] * 60 + e.start[1], e: e.end[0] * 60 + e.end[1], p: "Katzenbusch" }));
  return buildIcs(id, team.name, ev, "DJK Spvgg Herten\n" + contacts + "\nIm Winter können die Zeiten abweichen.");
}
function gymCalendar(g) {
  const hm = (s) => s.split(":").map(Number);
  const ev = g.sessions.map(([day, a, b, hall, focus]) => {
    const H = D.gym.halls[hall];
    SESSIONS.push({ n: g.name, u: teamUrl(g.id), k: "Turnen", d: DAYIDX[DAYMAP[day]], s: hm(a)[0] * 60 + hm(a)[1], e: hm(b)[0] * 60 + hm(b)[1], p: H.name.replace("Turnhalle der ", "") + ", " + H.area });
    return { d: DAYMAP[day], start: hm(a), end: hm(b), loc: `${H.name}, ${H.area}`, focus };
  });
  return buildIcs(g.id, g.name, ev, `DJK Spvgg Herten, Turnabteilung\nLeitung: ${g.lead}\n${D.club.mail.turner}`);
}
function buildIcs(id, name, evs, desc) {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const events = evs.map((e) => {
    const d = e.d;
    const dt = new Date(now); dt.setDate(dt.getDate() + ((DAYIDX[d] - dt.getDay() + 7) % 7 || 7));
    const day = `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}`;
    return ["BEGIN:VEVENT", `UID:${id}-${d}@djkspvggherten.de`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=Europe/Berlin:${day}T${pad(e.start[0])}${pad(e.start[1])}00`,
      `DTEND;TZID=Europe/Berlin:${day}T${pad(e.end[0])}${pad(e.end[1])}00`,
      `RRULE:FREQ=WEEKLY`, `SUMMARY:${icsText("Training " + name + (e.focus ? " (" + e.focus + ")" : ""))}`,
      `LOCATION:${icsText(e.loc)}`,
      `DESCRIPTION:${icsText(desc)}`,
      "END:VEVENT"].join("\r\n");
  });
  CALS[id] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DJK Spvgg Herten//Training//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsText("Training " + name)}`, "X-WR-TIMEZONE:Europe/Berlin",
    "BEGIN:VTIMEZONE", "TZID:Europe/Berlin",
    "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
    "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
    "END:VTIMEZONE", ...events, "END:VCALENDAR"].join("\r\n").split("\r\n").map((l) => { const out = []; let rest = l; while (rest.length > 70) { out.push(rest.slice(0, 70)); rest = rest.slice(70); } out.push(rest); return out.join("\r\n "); }).join("\r\n") + "\r\n";
  return `assets/kalender/${id}.ics`;
}
const calLink = (href) => (href ? `<a class="cal" href="${href}"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2" d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg>Trainingszeiten in den Kalender</a>` : "");

// ---------- Symbole ----------
const ICON = {
  search: `<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  theme: `<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>`,
  home: `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  ball: `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z" fill="currentColor"/></svg>`,
  news: `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  cal: `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="15" r="2" fill="currentColor"/></svg>`,
  mail: `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M3 6h18v12H3zM3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
};

ICON.star = `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="var(--star-fill, none)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`;
const favBtn = (id, name, small = false) => `<button type="button" class="fav${small ? " fav-sm" : ""}" data-fav="${id}" data-fav-name="${esc(name)}" data-fav-url="${teamUrl(id)}" aria-pressed="false" title="Als „Mein Team“ merken">${ICON.star}<span>${small ? "" : "Als Mein Team merken"}</span></button>`;

const NAV = [
  ["index.html", "Start"],
  ["verein.html", "Verein"],
  ["jugend.html", "Jugend"],
  ["damen.html", "Damen"],
  ["senioren.html", "Herren"],
  ["turnen.html", "Turnen"],
  ["spielplan.html", "Spielplan"],
  ["news.html", "News"],
  ["fanshop.html", "Fanshop"],
  ["kontakt.html", "Kontakt"],
];

function header(current) {
  const links = NAV.filter(([h]) => h !== "index.html")
    .map(([h, l]) => `<a href="${h}"${h === current ? ' aria-current="page"' : ""}>${l}</a>`).join("");
  return `<a class="skip" href="#main">Zum Inhalt springen</a>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="DJK Spvgg Herten, Startseite">
      <img src="assets/icon-512.png" width="46" height="46" alt="">
      <span>DJK Spvgg Herten<small>seit 1907 am Katzenbusch</small></span>
    </a>
    <nav class="nav" id="nav" aria-label="Hauptmenü">${links}<a class="nav-cta" href="jugend.html#probetraining">Probetraining</a></nav>
    <div class="tools">
      <button class="icon-btn search-open" type="button" aria-label="Suchen (Strg+K)" title="Suchen (Strg+K)">${ICON.search}<span class="kbd">Suchen</span></button>
      <button class="icon-btn theme-btn" type="button" aria-label="Darstellung: automatisch" title="Hell, dunkel oder automatisch">${ICON.theme}</button>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menü</button>
    </div>
  </div>
  <span class="stripe" aria-hidden="true"></span>
</header>
${statusBanner()}
<dialog class="search" id="search" aria-label="Suche">
  <form method="dialog" class="search-box" role="search">
    ${ICON.search}
    <input id="search-q" type="search" placeholder="Team, Trainer, Jahrgang oder Thema" autocomplete="off" aria-controls="search-results" aria-describedby="search-help">
    <button type="submit" class="search-close" value="close">Schließen</button>
  </form>
  <ul id="search-results" class="search-results" role="listbox" aria-label="Treffer"></ul>
  <p id="search-help" class="search-help">Zum Beispiel „E1“, „2016“, „Isselhorst“ oder „Vereinsheim“. Pfeiltasten wählen, Enter öffnet.</p>
</dialog>`;
}

function tabbar(current) {
  const t = [["index.html", "Start", ICON.home], ["spielplan.html", "Spiele", ICON.cal], ["index.html#probetraining", "Finden", ICON.ball], [null, "Suche", ICON.search], ["news.html", "News", ICON.news]];
  return `<nav class="tabbar" aria-label="Schnellzugriff">${t.map(([h, l, i]) => h ? `<a${l === "Finden" ? ' class="tab-find"' : ""} href="${h}"${!h.includes("#") && h === current ? ' aria-current="page"' : ""}>${i}<span>${l}</span></a>` : `<button type="button" class="search-open">${i}<span>${l}</span></button>`).join("")}</nav>`;
}

function footer() {
  return `<footer class="site-foot">
  <span class="stripe" aria-hidden="true"></span>
  <div class="wrap foot-grid">
    <div class="foot-brand"><img src="assets/icon-512.png" width="72" height="72" alt=""><p>DJK Spvgg Herten 07 e.V.<br>Wir sind ein Team.</p></div>
    <div><h2>Anschrift</h2><address>${club.address.join("<br>")}</address><p style="margin-top:.6rem"><a href="${club.maps}" rel="noopener">Auf der Karte zeigen</a></p></div>
    <div><h2>Post</h2><address>${esc(club.name)}<br>${club.post.join("<br>")}</address><p style="margin-top:.6rem">${mailA(club.mail.info)}</p></div>
    <div><h2>Verein</h2><ul><li><a href="spielplan.html">Spielplan</a></li><li><a href="termine.html">Termine</a></li><li><a href="faq.html">Fragen und Antworten</a></li><li><a href="sponsoren.html">Sponsoren</a></li><li><a href="vereinsheim.html">Vereinsheim</a></li><li><a href="mitgliedschaft.html">Mitglied werden</a></li></ul></div>
    <div><h2>Folgt uns</h2><ul>${club.social.map((s) => `<li><a href="${s.url}" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul></div>
  </div>
  <div class="wrap foot-legal">
    <span>© ${new Date().getFullYear()} ${esc(club.name)}</span>
    <a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a><a href="kinderschutz.html">Kinder- und Jugendschutz</a><a href="mitgliedschaft.html">Mitglied werden</a>
  </div>
</footer>`;
}

function page({ file, title, desc, body, current, home = false, jsonld = "" }, mode) {
  const fullTitle = home ? `${club.short} 07 e.V. – Fußball und Turnen in Herten` : `${title} – ${club.short}`;
  const fonts = mode === "preview"
    ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Figtree:wght@400..800&display=swap">`
    : `<link rel="preload" href="assets/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>`;
  const style = mode === "preview" ? `<style>${CSS}</style>` : `<link rel="stylesheet" href="assets/site.css">`;
  const script = (mode === "preview" ? `<script>${JS}</script>` : `<script src="assets/main.js" defer></script>`)
    + (mode === "dist" ? `\n<script>if("serviceWorker" in navigator)addEventListener("load",function(){navigator.serviceWorker.register("sw.js")})</script>` : "");
  const themeInit = `<script>try{var t=localStorage.getItem("djk-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>`;
  const url = `${SITE_URL}/${home ? "" : file}`;
  const headInner = `${file === "404.html" && mode === "dist" ? '<base href="/">' : ""}<title>${esc(fullTitle)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0d4a2c">
<meta property="og:type" content="website"><meta property="og:locale" content="de_DE">
<meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${SITE_URL}/assets/og.jpg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
${mode === "dist" ? `<link rel="manifest" href="manifest.webmanifest">` : ""}
${themeInit}
${fonts}
${style}
${jsonld}`;
  const bodyInner = `${header(current ?? file)}
<main id="main">
${body.replace("__SESSIONS__", JSON.stringify(SESSIONS).replace(/</g, "\\u003c")).replace("__MYTEAM__", MYTEAM_JSON)}
</main>
${footer()}
${tabbar(current ?? file)}
<script type="application/json" id="search-data">${SEARCH_JSON}</script>
${script}`;
  // Vorschau: Startseite ohne eigenes Dokumentgerüst (wird beim Veröffentlichen ergänzt)
  if (mode === "preview" && home) return `${headInner}\n${bodyInner}\n`;
  return `<!doctype html>
<html lang="de"${mode === "dist" ? ' data-analytics="on"' : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${headInner}
</head>
<body>
${bodyInner}
</body>
</html>
`;
}

// ---------- Bausteine ----------
const roles = (list) => `<dl class="roles">${list.map((r) => `<div><dt>${esc(r.role)}</dt><dd>${r.names.map(esc).join(", ")}${r.phone ? `<small>${telA(r.phone)}</small>` : ""}${r.mail ? `<small>${mailA(r.mail)}</small>` : ""}</dd></div>`).join("")}</dl>`;

function teamCard(t) {
  const people = t.coaches.map(([n, p, role, mail]) => `<li><span>${esc(n)}${role ? ` <span class="role">${esc(role)}</span>` : ""}</span>${p ? telA(p) : mail ? mailA(mail) : ""}</li>`).join("");
  const extra = (t.extra || []).map(([r, n, p]) => `<li><span>${esc(n)} <span class="role">${esc(r)}</span></span>${telA(p)}</li>`).join("");
  return `<article class="team" id="${t.id}">
  <div class="team-top"><h3>${esc(t.name)}</h3><span class="year">${yearText(t)}</span>${favBtn(t.id, t.name, true)}</div>
  <div class="training">${esc(t.training)} <span>Uhr</span></div>
  <ul class="people">${people}${extra}</ul>
  ${calLink(calendarFor(t.id, t, teamUrl(t.id)))}
  <a class="team-link" href="${teamUrl(t.id)}">Zur Teamseite mit Spielen</a>
</article>`;
}

function featureTeam(t, base = "") {
  const people = t.coaches.map(([n, p, role, mail]) => `<li><span>${esc(n)}${role ? ` <span class="role">${esc(role)}</span>` : ""}</span>${p ? telA(p) : mail ? mailA(mail) : ""}</li>`).join("");
  const id = slugOf(t.name);
  return `<div class="team-feature" id="${id}">
  ${t.img ? img(t.img, `Mannschaftsfoto ${t.name}`) : ""}
  <div class="info">
    <div><h3>${esc(t.name)}</h3>${t.league ? `<p class="league">${esc(t.league)}</p>` : ""}</div>
    ${favBtn(id, t.name)}
    <div class="training">Training ${esc(t.training)} <span>Uhr</span></div>
    <ul class="people">${people}</ul>
    ${calLink(calendarFor(id, t, teamUrl(id)))}
    <a class="team-link" href="${teamUrl(id)}">Zur Teamseite mit Spielen</a>
  </div>
</div>`;
}

function finder(base) {
  const all = [...D.youthTeams, ...D.girlsTeams];
  const data = {
    boys: D.youthTeams.map(({ id, name, years, training, coaches }) => ({ id, name, years, training, coaches, cal: `assets/kalender/${id}.ics` })),
    girls: D.girlsTeams.map(({ id, name, years, training, coaches }) => ({ id, name, years, training, coaches, cal: `assets/kalender/${id}.ics` })),
    maxYear: Math.max(...all.map((t) => t.years[1])),
    minYear: Math.min(...all.map((t) => t.years[0])),
    mail: club.mail.jugend,
    links: { damen: "damen.html", herren: "senioren.html" },
    gym: D.gym.groups.map((g) => ({ id: g.id, name: g.name, ages: g.ages, ageText: g.ageText, lead: g.lead,
      times: g.sessions.map(([d, a, b, h]) => `${d} ${a}–${b}, ${D.gym.halls[h].name.replace("Turnhalle der ", "")}`) })),
    gymStop: D.gym.stop, gymMail: club.mail.turner,
  };
  return `<section class="band" id="probetraining" aria-labelledby="finder-title">
  <div class="wrap section finder">
    <div>
      <h2 id="finder-title">Was passt zu eurem Kind?</h2>
      <p style="margin-top:1rem;color:var(--on-green-muted);font-size:1.1rem">Geburtsjahr eingeben, und ihr seht alle passenden Fußballteams und Turngruppen mit Trainingszeiten und Ansprechpartnern. Fußball ist für Jungen und Mädchen offen, dazu gibt es eigene Juniorinnen-Teams.</p>
      <div class="finder-input">
        <label for="jahrgang">Geburtsjahr des Kindes</label>
        <div class="year-row">
          <input id="jahrgang" name="jahrgang" type="number" inputmode="numeric" min="2005" max="2025" value="2019" aria-describedby="finder-hint">
          <div class="step-btns"><button type="button" data-step="1" aria-label="Ein Jahr jünger">+</button><button type="button" data-step="-1" aria-label="Ein Jahr älter">−</button></div>
        </div>
        <p class="finder-hint" id="finder-hint">Trainingszeiten gelten für den Sommer, im Winter können sie abweichen. Mit dem Stern merkt sich die Seite das Team eures Kindes.</p>
      </div>
    </div>
    <div class="results" id="finder-results" data-base="${base}" aria-live="polite"></div>
  </div>
  <script type="application/json" id="teams-data">${JSON.stringify(data)}</script>
</section>`;
}

function pageHead(title, lead, crumb = true) {
  return `<div class="wrap page-head">
  ${crumb ? `<p class="crumb"><a href="index.html">Start</a> / ${esc(title)}</p>` : ""}
  <h1>${esc(title)}</h1>
  ${lead ? `<p class="lead">${lead}</p>` : ""}
</div>`;
}

const newsItems = [...D.news].sort((a, b) => b.date.localeCompare(a.date));

// ---------- Spielbetrieb ----------
const NOW = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date()).replace(" ", "T");
const FLAG = { "o.E.": "ohne Ergebnis", W: "Wertung", w: "Wertung", Absetzung: "Abgesetzt", "Nichtantritt GAST": "Nichtantritt Gast", "Nichtantritt HEIM": "Nichtantritt Heim", Annuliert: "Annulliert", Ausfall: "Ausfall", Abbruch: "Abgebrochen" };
const YOUTH_IDS = new Set(D.youthTeams.map((t) => t.id)), GIRL_IDS = new Set(D.girlsTeams.map((t) => t.id)), LADY_IDS = new Set(D.ladies.teams.map((t) => slugOf(t.name)));
const deptOf = (id) => (YOUTH_IDS.has(id) ? "jugend" : GIRL_IDS.has(id) ? "juniorinnen" : LADY_IDS.has(id) ? "damen" : "herren");
const DEPT_LABEL = { jugend: "Junioren", juniorinnen: "Juniorinnen", damen: "Damen", herren: "Herren" };
const teamUrl = (id) => `team-${id}.html`;
const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const dayLabel = (d) => { const x = new Date(d.slice(0, 10) + "T12:00:00Z"); return `${WD[x.getUTCDay()]}, ${d.slice(8, 10)}.${d.slice(5, 7)}.`; };
const GAMES = (D.matches.games || []).map((g) => {
  const festivalHost = /kinderfestival|spielfest|festival/i.test(g.opponent) ? g.opponent.replace(/\s*-\s*(kinder)?festival.*$/i, "").trim() : null;
  const ownFestival = festivalHost && /DJK Spvgg/i.test(festivalHost);
  const label = festivalHost ? (ownFestival ? "Spielfest am Katzenbusch" : `Spielfest bei ${festivalHost}`) : g.opponent;
  const home = g.isHome || ownFestival;
  const res = D.results[g.id];
  return { ...g, label, home, festival: !!festivalHost, past: g.date < NOW, dept: deptOf(g.team), flagText: g.flag ? FLAG[g.flag] || g.flag : null, score: res ? `${res.home}:${res.away}` : null };
});
const upcoming = GAMES.filter((g) => !g.past);
const played = GAMES.filter((g) => g.past).reverse();
const matchesUpdated = D.matches.updated ? new Date(D.matches.updated).toLocaleString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : null;

function matchRow(g, showTeam = true) {
  const side = g.flagText ? `<span class="m-flag">${esc(g.flagText)}</span>`
    : g.score ? `<span class="m-score tnum">${esc(g.score)}</span>`
    : g.past ? (g.url ? `<a class="m-link" href="${esc(g.url)}" rel="noopener">Ergebnis</a>` : "")
    : g.home ? `<span class="m-home">Heim</span>` : `<span class="m-away">Auswärts</span>`;
  const vs = g.festival ? `<b>${esc(g.label)}</b>` : `${g.isHome ? "gegen" : "bei"} <b>${esc(g.label)}</b>`;
  return `<li class="match${g.past ? " past" : ""}" data-date="${g.date}" data-dept="${g.dept}" data-team="${g.team}" data-home="${g.home ? 1 : 0}">
  <time class="m-date tnum" datetime="${g.date}"><span class="m-day">${dayLabel(g.date)}</span><b>${g.date.slice(11, 16)}</b></time>
  <div class="m-main">${showTeam ? `<a class="m-team" href="${teamUrl(g.team)}">${esc(g.teamName)}</a>` : ""}<span class="m-vs">${vs}</span><span class="m-comp">${esc(g.competition)}</span></div>
  <div class="m-side">${side}</div>
</li>`;
}

function matchIcs(id, name, games) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ev = games.map((g) => {
    const start = g.date.replace(/[-:]/g, "") + "00";
    const endD = new Date(g.date + ":00Z"); endD.setUTCMinutes(endD.getUTCMinutes() + (g.dept === "jugend" || g.dept === "juniorinnen" ? 90 : 120));
    const end = endD.toISOString().slice(0, 16).replace(/[-:]/g, "") + "00";
    const title = g.festival ? `${g.teamName}: ${g.label}` : g.isHome ? `${g.teamName} – ${g.label}` : `${g.label} – ${g.teamName}`;
    return ["BEGIN:VEVENT", `UID:${g.id}-${g.team}@djkspvggherten.de`, `DTSTAMP:${now}`, `DTSTART;TZID=Europe/Berlin:${start}`, `DTEND;TZID=Europe/Berlin:${end}`,
      `SUMMARY:${icsText(title)}`, `LOCATION:${icsText(g.home ? KATZENBUSCH : "Auswärts")}`, `DESCRIPTION:${icsText(g.competition + (g.url ? "\n" + g.url : ""))}`, "END:VEVENT"].join("\r\n");
  });
  CALS[id] = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DJK Spvgg Herten//Spiele//DE", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${icsText(name)}`, "X-WR-TIMEZONE:Europe/Berlin", ...ev, "END:VCALENDAR"]
    .join("\r\n").split("\r\n").map((l) => { const o = []; let r = l; while (r.length > 70) { o.push(r.slice(0, 70)); r = r.slice(70); } o.push(r); return o.join("\r\n "); }).join("\r\n") + "\r\n";
  return `assets/kalender/${id}.ics`;
}
const homeGamesCal = matchIcs("heimspiele", "Heimspiele DJK Spvgg Herten", GAMES.filter((g) => g.home));

function flagship(name) {
  const t = [...D.ladies.teams, ...D.seniors.flatMap((g) => g.teams)].find((x) => x.name === name);
  const id = slugOf(name);
  const g = upcoming.find((x) => x.team === id);
  if (!g) return "";
  return `<a class="flag-card" href="${teamUrl(id)}" data-kickoff="${g.date}">
  <span class="fc-team">${esc(name.replace("mannschaft", ""))}${t && t.league ? ` · ${esc(t.league)}` : ""}</span>
  <span class="fc-when tnum">${dayLabel(g.date)} ${g.date.slice(11, 16)} Uhr <em class="countdown"></em></span>
  <span class="fc-match"><b>${g.isHome ? "DJK Spvgg Herten" : esc(g.label)}</b><i>:</i><b>${g.isHome ? esc(g.label) : "DJK Spvgg Herten"}</b></span>
  <span class="fc-where">${g.home ? "Kampfbahn Katzenbusch" : "Auswärtsspiel"}</span>
</a>`;
}

function matchesBlock() {
  if (!GAMES.length) return "";
  return `<section class="wrap section" id="spiele" aria-labelledby="games-title">
  <div class="section-head news-head"><div><h2 id="games-title">Spiele</h2><p>${matchesUpdated ? `Stand ${matchesUpdated} Uhr, Daten von fussball.de.` : ""}</p></div>
    <div class="slider-nav"><a class="more" href="spielplan.html">Ganzer Spielplan</a><a class="more" href="${homeGamesCal}">Heimspiele abonnieren</a></div></div>
  <div class="flag-cards">${flagship("1. Herrenmannschaft")}${flagship("Frauen I")}</div>
  <div class="games-cols">
    <div><h3>Als Nächstes</h3><ol class="matches">${upcoming.slice(0, 7).map((g) => matchRow(g)).join("")}</ol></div>
    <div><h3>Zuletzt gespielt</h3><ol class="matches">${played.slice(0, 7).map((g) => matchRow(g)).join("")}</ol></div>
  </div>
</section>`;
}

function statusBanner() {
  const s = D.status;
  if (!s || !s.active) return "";
  if (s.until && s.until < NOW.slice(0, 10)) return "";
  return `<div class="status-banner status-${esc(s.level || "info")}" role="status"><div class="wrap"><b>${esc(s.title || "Hinweis")}</b>${s.text ? `<span>${esc(s.text)}</span>` : ""}${s.until ? `<small>gilt bis ${esc(s.until.split("-").reverse().join("."))}</small>` : ""}</div></div>`;
}

// ---------- Seiten ----------
const pages = [];

// Startseite
{
  const jsonld = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "SportsClub", name: club.name, alternateName: club.short,
    url: SITE_URL + "/", logo: SITE_URL + "/assets/icon-512.png", email: club.mail.info, foundingDate: "1907",
    address: { "@type": "PostalAddress", streetAddress: "Katzenbuschstraße 1–3", postalCode: "45699", addressLocality: "Herten", addressCountry: "DE" },
    sameAs: club.social.map((s) => s.url),
  })}</script>`;
  pages.push({
    file: "index.html", home: true, current: "index.html", jsonld,
    desc: "Fußball von den Bambini bis zu den Gehfußballern, Frauenfußball und Turnen: die DJK Spvgg Herten 07 e.V. an der Kampfbahn Katzenbusch in Herten.",
    body: `<section class="hero">
  ${img("tor", "Das historische Eingangstor der Kampfbahn Katzenbusch", { eager: true })}
  <div class="wrap">
    <h1 class="hero-title"><span>Seit 1907</span> <span>am Katzenbusch.</span></h1>
    <p class="hero-sub">Fußball und Turnen in Herten-Süd. Für Kinder ab 1½ Jahren bis zu den Gehfußballern Ü50.</p>
    <div class="btn-row hero-cta">
      <a class="btn btn-red" href="#probetraining">Fußball oder Turnen finden</a>
      <a class="btn btn-ghost" href="#heute">Wer trainiert heute?</a>
    </div>
    <dl class="hero-facts">
      <div><dt>Gegründet</dt><dd data-count="1907">1907</dd></div>
      <div><dt>Jugendteams im Fußball</dt><dd data-count="${D.youthTeams.length + D.girlsTeams.length}">${D.youthTeams.length + D.girlsTeams.length}</dd></div>
      <div><dt>Frauenteams</dt><dd data-count="${D.ladies.teams.length}">${D.ladies.teams.length}</dd></div>
      <div><dt>Turngruppen</dt><dd data-count="${D.gym.groups.length}">${D.gym.groups.length}</dd></div>
    </dl>
  </div>
</section>
<section class="wrap my-team" id="mein-team" aria-labelledby="mt-title" hidden>
  <div class="mt-head"><h2 id="mt-title">Mein Team</h2><p class="crumb">Nur auf diesem Gerät gespeichert.</p></div>
  <div class="mt-cards" id="mt-cards"></div>
</section>
<script type="application/json" id="myteam-data">__MYTEAM__</script>
<div class="ticker" aria-hidden="true"><div class="ticker-track">${Array(2).fill(["Bambini bis B-Jugend", "Juniorinnen U9 bis U15", "Katzenbuschladies", "Eltern-Kind-Turnen ab 1½", "Wettkampfturnen", "Herren 1 + 2", "Alte Herren Ü32 + Ü50", "Gehfußball", "Seit 1907 am Katzenbusch"].map((t) => `<span>${t}</span>`).join("")).join("")}</div></div>
${finder("jugend.html")}
${matchesBlock()}
<section class="wrap section" id="heute" aria-labelledby="today-title">
  <div class="today">
    <div class="today-head">
      <h2 id="today-title">Heute im Verein</h2>
      <p class="today-clock" id="today-clock">Trainingsplan dieser Woche</p>
      <div class="day-tabs" role="tablist" aria-label="Wochentag wählen">${["Mo", "Di", "Mi", "Do", "Fr"].map((d, i) => `<button type="button" role="tab" data-day="${i + 1}" aria-selected="false">${d}</button>`).join("")}</div>
      <p class="crumb">Sommerzeiten, im Winter kann es Abweichungen geben.</p>
    </div>
    <ol class="today-list" id="today-list" aria-live="polite"></ol>
  </div>
  <script type="application/json" id="today-data">__SESSIONS__</script>
</section>
<section class="wrap section" aria-labelledby="dept-title">
  <div class="section-head"><h2 id="dept-title">Unsere Abteilungen</h2></div>
  <div class="depts">
    ${D.departments.map((d) => `<a class="dept" href="${d.href}">${img(d.img, "")}<div class="dept-body"><h3>${esc(d.title)}</h3><p>${esc(d.text)}</p></div></a>`).join("\n    ")}
  </div>
</section>
<section class="gym-band" aria-labelledby="gym-title">
  <div class="wrap section">
    <div class="section-head"><h2 id="gym-title">Turnen bei der DJK</h2><p>Vier Gruppen in zwei Hallen, von den Kleinsten mit Eltern bis zur Wettkampfgruppe im Gerätturnen.</p><a class="more" href="turnen.html">Zur Turnabteilung</a></div>
    <div class="gym-cards">
      ${D.gym.groups.map((g) => `<a class="gym-card" href="${teamUrl(g.id)}">${img(g.img, "")}<div><h3>${esc(g.name)}</h3><p class="age">${esc(g.ageText)}</p><p class="when">${g.sessions.map(([d, a, b]) => `${d} ${a}–${b}`).join(" · ")}</p></div></a>`).join("\n      ")}
    </div>
  </div>
</section>
<section class="section" aria-labelledby="news-title">
  <div class="wrap section-head news-head"><h2 id="news-title">Neuigkeiten</h2><div class="slider-nav"><button type="button" class="slide-btn" data-dir="-1" aria-label="Zurück">‹</button><button type="button" class="slide-btn" data-dir="1" aria-label="Weiter">›</button><a class="more" href="news.html">Alle Beiträge</a></div></div>
  <div class="slider" id="news-slider" tabindex="0" aria-label="Neuigkeiten, seitlich wischen">
    ${newsItems.slice(0, 8).map((n) => `<a class="slide" href="news.html#${n.slug}">${img(n.img, "")}<div class="dateline"><time datetime="${n.date}">${fmtDate(n.date)}</time><span class="tag">${esc(n.tag)}</span></div><h3>${esc(n.title)}</h3></a>`).join("\n    ")}
  </div>
</section>
<section class="band-surface">
  <div class="wrap section">
    <div class="contacts">
      <div class="contact"><h3>Mitglied werden</h3><p>So läuft die Anmeldung, das kosten die Beiträge.</p><a href="mitgliedschaft.html">Zur Mitgliedschaft</a></div>
      <div class="contact"><h3>Vereinsheim mieten</h3><p>Für Feiern und Sitzungen mit bis zu ${D.clubhouse.capacity} Personen.</p><a href="vereinsheim.html">Zum Vereinsheim</a></div>
      <div class="contact"><h3>Kinder- und Jugendschutz</h3><p>Unser Schutzkonzept und wie wir es im Alltag leben.</p><a href="kinderschutz.html">Zum Schutzkonzept</a></div>
      <div class="contact"><h3>Spiele und Ergebnisse</h3><p>Alle Partien, Tabellen und Ergebnisse unserer Teams.</p><a href="${club.results}" rel="noopener">Auf fussball.de</a></div>
    </div>
  </div>
</section>
<section class="wrap section" aria-labelledby="sp-title">
  <div class="section-head"><h2 id="sp-title">Danke an unsere Sponsoren</h2><a class="more" href="sponsoren.html">Sponsor werden</a></div>
  <div class="logos">${D.sponsors.map((s) => `<div>${img(s.img, s.name)}</div>`).join("")}</div>
</section>`,
  });
}

// Jugend
pages.push({
  file: "jugend.html", title: "Jugendabteilung",
  desc: "Alle Jugendmannschaften der DJK Spvgg Herten von der G- bis zur B-Jugend und die Juniorinnen-Teams, mit Trainingszeiten und Ansprechpartnern für ein Probetraining.",
  body: `${pageHead("Jugendabteilung", "Von den Bambini bis zur B-Jugend, dazu vier Juniorinnen-Teams. Ihr wollt mitmachen? Ruft den Trainer der passenden Mannschaft an oder schreibt an " + mailA(club.mail.jugend) + " und nennt das Geburtsjahr eures Kindes.")}
<div class="wrap">${img("img3238", "Jugendspieler der DJK in grünen Trainingsanzügen auf dem Rasen am Katzenbusch", { cls: "feature-img", eager: true })}</div>
<div style="margin-top:clamp(2.5rem,6vw,4rem)">${finder("jugend.html")}</div>
<section class="wrap section" aria-labelledby="jun-title">
  <div class="section-head"><h2 id="jun-title">Junioren, Saison 2026/27</h2><p>Trainingszeiten im Sommer, im Winter können sie abweichen. Mail für alle Teams: ${mailA(club.mail.jugend)}</p></div>
  <div class="teams">${D.youthTeams.map(teamCard).join("\n")}</div>
</section>
<section class="wrap section" aria-labelledby="girls-title">
  <div class="section-head"><h2 id="girls-title">Juniorinnen</h2><p>Eigene Mädchenteams von der U9 bis zur U15.</p></div>
  <div class="teams">${D.girlsTeams.map(teamCard).join("\n")}</div>
</section>
<section class="wrap section" aria-labelledby="pics-title">
  <div class="section-head"><h2 id="pics-title">Teamfotos</h2></div>
  <div class="gallery">${[...D.youthTeams, ...D.girlsTeams].filter((t) => t.img).map((t) => `<figure>${img(t.img, "Mannschaftsfoto " + t.name)}<figcaption>${esc(t.name)}</figcaption></figure>`).join("")}<figure>${img("teams2627", "Übersicht aller Jugendmannschaften der Saison 2026/27")}<figcaption>Alle Teams 2026/27 auf einen Blick</figcaption></figure></div>
</section>
<section class="wrap section" aria-labelledby="jv-title">
  <div class="split wide-left">
    <div class="prose"><h2 id="jv-title">Jugendvorstand</h2>${roles(D.youthBoard)}</div>
    <figure style="margin:0;display:grid;gap:.5rem">${img("jugendvorstand", "Der Jugendvorstand der DJK Spvgg Herten")}<figcaption class="crumb">Hinten von links: Nadine Karrasch, Marc Sukowski, Achilleas Bettas, Marc Isselhorst, Marcel Isselhorst. Vorne von links: Melanie Hemmerich, Jenny Maaß, Lena Tekce, Marcel Lange, Christian Zak. Es fehlen Yvonne Kemke und Jessy Dubielzek.</figcaption></figure>
  </div>
</section>
<section class="wrap section" aria-labelledby="js-title">
  <div class="section-head"><h2 id="js-title">Danke an die Sponsoren der Jugend</h2><p>Mit ihrer Hilfe fördern wir Kinder- und Jugendsport und den Zusammenhalt im Verein.</p></div>
  <div class="split">${D.youthSponsors.map((s) => `<div class="prose">${s.img ? `<div style="max-width:9rem">${img(s.img, s.name + " Logo")}</div>` : ""}<h3>${esc(s.name)}</h3><p>${esc(s.text)}</p></div>`).join("")}</div>
</section>`,
});

// Damen
pages.push({
  file: "damen.html", title: "Katzenbuschladies",
  desc: "Die Katzenbuschladies: Frauenfußball bei der DJK Spvgg Herten mit drei Mannschaften von der Landesliga bis zur Kreisliga A.",
  body: `${pageHead("Katzenbuschladies", "Frauenfußball bei der DJK seit 2004. Drei Mannschaften, die erste spielt in der Landesliga. Du spielst mit Herz und Teamgeist? Komm vorbei.")}
<section class="wrap section" style="padding-top:0" aria-label="Mannschaften">
  ${D.ladies.teams.map((t) => featureTeam(t, "damen.html")).join("\n")}
</section>
<section class="wrap section" aria-labelledby="ms-title">
  <div class="split">
    <div class="prose"><h2 id="ms-title">Unser Weg</h2><p>Seit der Saison 2022/23 sind die Katzenbuschladies in der Landesliga zu Hause und haben immer die Klasse gehalten. Ziel: weiter als Team wachsen und früh den Klassenerhalt sichern.</p><p><a href="https://www.instagram.com/katzenbuschladies" rel="noopener">Folgt uns auf Instagram: @katzenbuschladies</a></p></div>
    <ol class="timeline">${D.ladies.milestones.map(([y, t]) => `<li><b>${esc(y)}</b><span>${esc(t)}</span></li>`).join("")}</ol>
  </div>
</section>
<section class="wrap section" aria-labelledby="lb-title">
  <div class="section-head"><h2 id="lb-title">Vorstand Damenabteilung</h2></div>
  ${roles(D.ladies.board)}
</section>`,
});

// Senioren
pages.push({
  file: "senioren.html", title: "Herren, Alte Herren und Gehfußball",
  desc: "Herrenfußball bei der DJK Spvgg Herten: 1. und 2. Mannschaft, Alte Herren Ü32 und Ü50 sowie Gehfußball.",
  body: `${pageHead("Herren, Alte Herren und Gehfußball", "Zwei Herrenmannschaften, Alte Herren Ü32 und Ü50 und unsere Gehfußballer. Fragen und Probetraining direkt bei den Ansprechpartnern.")}
${D.seniors.map((g) => `<section class="wrap section" style="padding-top:0" aria-label="${esc(g.group)}">
  <div class="section-head"><h2>${esc(g.group)}</h2>${g.lead.length ? `<p>${g.lead.map(([r, n, p, m]) => `${esc(r)}: <b>${esc(n)}</b>${p ? ", " + telA(p) : ""}${m ? ", " + mailA(m) : ""}`).join("<br>")}</p>` : ""}</div>
  ${g.teams.map((t) => featureTeam(t, "senioren.html")).join("\n")}
</section>`).join("\n")}`,
});

// Turnen
pages.push({
  file: "turnen.html", title: "Turnabteilung",
  desc: "Eltern-Kind-Turnen, Kinderturnen und Wettkampfturnen bei der DJK Spvgg Herten: Trainingszeiten, Hallen, Trainerinnen und Erfolge.",
  body: `<section class="page-hero">
  ${img("tu_g1", "Turnerinnen der Wettkampfgruppe in der Halle", { eager: true })}
  <div class="wrap">
    <p class="crumb"><a href="index.html">Start</a> / Turnabteilung</p>
    <h1>Turnen bei der DJK</h1>
    <p class="lead">Eltern-Kind-Turnen ab 1½ Jahren, Kindergarten- und Grundschulturnen und eine Wettkampfgruppe im Gerätturnen. Vier Gruppen, zwei Hallen, sechs Trainingszeiten pro Woche.</p>
  </div>
</section>
<div class="wrap" style="padding-top:2rem">
  ${D.gym.stop ? `<p class="note">Zurzeit gilt in allen Gruppen ein Aufnahmestopp. Fragt gern unter ${mailA(club.mail.turner)} nach, ob wieder Plätze frei sind.</p>` : ""}
</div>
<section class="wrap section" aria-labelledby="grp-title">
  <div class="section-head"><h2 id="grp-title">Unsere Gruppen</h2></div>
  <div class="groups">
    ${D.gym.groups.map((g) => { const cal = gymCalendar(g); return `<article class="group" id="${g.id}">
      ${img(g.img, "")}
      <div class="group-body">
        <div class="team-top"><h3>${esc(g.name)}</h3>${favBtn(g.id, g.name, true)}</div>
        <p class="age">${esc(g.ageText)}</p>
        <p>${esc(g.text)}</p>
        <ul class="people">${g.sessions.map(([d, a, b, h, f]) => `<li><span><b>${({ Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag" })[d]}</b> <span class="tnum">${a}–${b}</span>${f ? ` <span class="role">${esc(f)}</span>` : ""}</span><a href="${D.gym.halls[h].map}" rel="noopener">${esc(D.gym.halls[h].name.replace("Turnhalle der ", ""))}</a></li>`).join("")}</ul>
        <p class="crumb">Leitung: ${esc(g.lead)}</p>
        ${calLink(cal)}
      </div>
    </article>`; }).join("\n    ")}
  </div>
</section>
<section class="wrap section" aria-labelledby="plan-title">
  <div class="section-head"><h2 id="plan-title">Wochenplan</h2></div>
  <div class="week">${["Mo", "Di", "Mi", "Do", "Fr"].map((d) => `<div class="week-day"><h3>${({ Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag" })[d]}</h3>${D.gym.groups.flatMap((g) => g.sessions.filter((s) => s[0] === d).map((s) => [g, s])).sort((x, y) => x[1][1].localeCompare(y[1][1])).map(([g, [, a, b, h]]) => `<a class="slot slot-${g.id}" href="#${g.id}"><span class="tnum">${a}–${b}</span><b>${esc(g.name)}</b><small>${esc(D.gym.halls[h].area)}</small></a>`).join("")}</div>`).join("")}</div>
</section>
<section class="wrap section" aria-labelledby="hall-title">
  <div class="section-head"><h2 id="hall-title">Unsere Hallen</h2></div>
  <div class="contacts">${Object.values(D.gym.halls).map((h) => `<div class="contact"><h3>${esc(h.name)}</h3><p>${esc(h.area)}</p><a href="${h.map}" rel="noopener">Auf der Karte zeigen</a></div>`).join("")}
    <div class="contact"><h3>Beiträge Turnen</h3><p>Kinderturnen ab 8 € im Monat, Eltern-Kind-Turnen 12 € für zwei Erwachsene und bis zu zwei Kinder.</p><a href="mitgliedschaft.html">Alle Beiträge</a></div>
  </div>
</section>
<section class="wrap section" aria-labelledby="gt-title">
  <div class="section-head"><h2 id="gt-title">Eure Trainerinnen und Helfer</h2></div>
  <div class="portraits">${D.gym.team.map((p) => `<figure>${img(p.img, "Porträt " + p.name)}<figcaption><b>${esc(p.name)}</b><span>${esc(p.role)}</span></figcaption></figure>`).join("")}</div>
</section>
<section class="wrap section" aria-labelledby="er-title">
  <div class="split">
    <div class="prose">
      <h2 id="er-title">Erfolge im Wettkampfturnen</h2>
      <h3>Stadtmeisterschaften 2023</h3>
      <p>Am 25.02.2023 turnten unsere Turnerinnen bei der Stadtmeisterschaft in Herten an Bock, Reck, Balken und Boden. Alle erturnten tolle Plätze, viele standen bei der Siegerehrung auf dem Treppchen.</p>
      <h3>Mannschafts-Bezirksmeisterschaften 2023</h3>
      <p>In Dorsten traten wir mit drei Mannschaften an Sprung, Reck, Schwebebalken und Boden an. Für fünf Turnerinnen war es nach nur zwei Monaten Gerätturnen der allererste Wettkampf. „Ihre strahlenden Augen zu sehen, als sie ihre erste Medaille in der Hand hielten, das war das allerschönste“, sagt Trainerin Joana van den Bosch.</p>
      <ul><li>Wettkampfklasse 8 (Jg. 2014–2016): Celina Fiona Rudolph, Esma Bilgin, Hira-Nur Acikgöz, Platz 10</li><li>Wettkampfklasse 5: Estella Kiefer, Justina Herdt, Leni Reschke, Platz 10</li><li>Wettkampfklasse 5: Alina Tschirne, Luise Jurick, Soi Sakellariou, Allegra Kiefer, Platz 4</li></ul>
    </div>
    <div class="table-wrap"><table>
      <caption>Stadtmeisterschaften 2023</caption>
      <thead><tr><th scope="col">Turnerin</th><th scope="col">Jg.</th><th scope="col" class="num">Punkte</th><th scope="col" class="num">Platz</th></tr></thead>
      <tbody>${D.gym.results2023.map(([n, j, p, r]) => `<tr><td>${esc(n)}</td><td>${j}</td><td class="num">${p}</td><td class="num">${r}</td></tr>`).join("")}</tbody>
    </table></div>
  </div>
</section>
<section class="wrap section" aria-labelledby="ga-title">
  <div class="section-head"><h2 id="ga-title">Aus der Turnabteilung</h2><a class="more" href="news.html#turnen">Alle Turnen-News</a></div>
  <div class="news-cards">${newsItems.filter((n) => n.tag === "Turnen").map((n) => `<a class="slide" href="news.html#${n.slug}">${img(n.img, "")}<div class="dateline"><time datetime="${n.date}">${fmtDate(n.date)}</time><span class="tag">${esc(n.tag)}</span></div><h3>${esc(n.title)}</h3></a>`).join("")}</div>
</section>
<section class="band">
  <div class="wrap section split">
    <div class="prose"><h2>Kontakt zur Turnabteilung</h2><p>Abteilungsleitung: Stefanie Szarzynski. Fragen zu Gruppen, freien Plätzen und Wettkämpfen per Mail.</p>
      <div class="btn-row"><a class="btn btn-red" href="mailto:${club.mail.turner}">${club.mail.turner}</a><a class="btn btn-ghost" href="https://www.facebook.com/profile.php?id=100064556265727" rel="noopener">Turnabteilung auf Facebook</a></div></div>
    <address class="prose" style="font-style:normal">Post: ${esc(club.name)}<br>Abteilung Turnen<br>${club.post.join("<br>")}</address>
  </div>
</section>`,
});

// Verein
pages.push({
  file: "verein.html", title: "Der Verein",
  desc: "Vorstand, Geschichte und Spielstätte der DJK Spvgg Herten 07 e.V.: Wurzeln bis 1907, Gauliga, Regionalliga West und neun deutsche Rollhockey-Meisterschaften.",
  body: `${pageHead("Der Verein", "Unsere Wurzeln reichen bis 1907. Seit der Fusion im Jahr 2000 sind wir die DJK Spvgg Herten 07, zu Hause an der Kampfbahn Katzenbusch.")}
<section class="wrap section" style="padding-top:0" aria-labelledby="vs-title">
  <div class="split">
    <div class="prose"><h2 id="vs-title">Vorstand</h2>${roles(D.board)}</div>
    <div class="prose"><h2>Steckbrief</h2>
      <dl class="roles">
        <div><dt>Wurzeln</dt><dd>1907 (DJK Rot-Weiß Herten)</dd></div>
        <div><dt>Heutiger Verein</dt><dd>seit 1. Juli 2000</dd></div>
        <div><dt>Vereinsfarben</dt><dd>Rot, Grün, Weiß</dd></div>
        <div><dt>Sportarten</dt><dd>Fußball, Turnen</dd></div>
        <div><dt>Abteilungen</dt><dd>Jugend (Junioren und Juniorinnen), Damen, Herren 1 + 2, Alte Herren Ü32 + Ü50, Gehfußball, Turnen</dd></div>
        <div><dt>Vereinsregister</dt><dd>${esc(club.register)}</dd></div>
      </dl>
    </div>
  </div>
</section>
<section class="wrap section" aria-labelledby="hi-title">
  <div class="split">
    <div class="prose" style="position:sticky;top:7rem">
      <h2 id="hi-title">Geschichte</h2>
      ${img("hist1930", "Historisches Mannschaftsfoto vor dem Tor der Kampfbahn Katzenbusch")}
      ${D.historyNotes.map((t) => `<p>${esc(t)}</p>`).join("")}
    </div>
    <ol class="timeline">${D.history.map(([y, t]) => `<li><b>${esc(y)}</b><span>${esc(t)}</span></li>`).join("")}</ol>
  </div>
</section>
<section class="band" id="spielstaette" aria-labelledby="ss-title">
  <div class="wrap section split">
    <div class="prose">
      <h2 id="ss-title">Kampfbahn Katzenbusch</h2>
      <p>Hier spielte schon die Spvgg in der Gauliga gegen Schalke 04. Heute trainieren und spielen alle unsere Fußballteams am Katzenbusch, das Vereinsheim liegt direkt an der Anlage.</p>
      <address style="font-style:normal">${club.address.join("<br>")}</address>
      <div class="btn-row"><a class="btn btn-red" href="${club.maps}" rel="noopener">Route planen</a><a class="btn btn-ghost" href="vereinsheim.html">Zum Vereinsheim</a></div>
    </div>
    ${img("tor", "Eingangstor der Kampfbahn Katzenbusch", { cls: "feature-img" })}
  </div>
</section>
<section class="wrap section" aria-labelledby="doc-title">
  <div class="section-head"><h2 id="doc-title">Dokumente</h2></div>
  <div class="contacts">
    <div class="contact"><h3>Vereinssatzung</h3><p>Verabschiedet am 26.11.2021.</p><a href="assets/docs/satzung.pdf">Satzung als PDF</a></div>
    <div class="contact"><h3>Beitragsordnung</h3><p>Beiträge aller Abteilungen.</p><a href="assets/docs/beitragsordnung.pdf">Beitragsordnung als PDF</a></div>
    <div class="contact"><h3>Kinderschutzkonzept</h3><p>Prävention und Verantwortung im Verein.</p><a href="assets/docs/kinderschutzkonzept.pdf">Schutzkonzept als PDF</a></div>
  </div>
</section>`,
});

// Mitgliedschaft
pages.push({
  file: "mitgliedschaft.html", title: "Mitglied werden",
  desc: "So werdet ihr Mitglied bei der DJK Spvgg Herten: Probetraining, Anmeldebogen, Beiträge aller Abteilungen und Kündigungsfristen.",
  body: `${pageHead("Mitglied werden", "Ihr möchtet euch oder euer Kind anmelden? So läuft es ab.")}
<section class="wrap section" style="padding-top:0" aria-label="Ablauf">
  <ol class="steps">
    <li><b>Probetraining vereinbaren</b><span>Meldet euch beim Trainer der passenden <a href="jugend.html#probetraining">Jugendmannschaft</a> oder bei der <a href="turnen.html">Turnabteilung</a>.</span></li>
    <li><b>Zwei- bis dreimal mittrainieren</b><span>Danach gibt euch der Trainer den Anmeldebogen.</span></li>
    <li><b>Anmeldebogen abgeben</b><span>Vollständig ausgefüllt und mit einer Kopie der Geburtsurkunde beim Trainer abgeben.</span></li>
    <li><b>Versichert und spielberechtigt</b><span>Erst mit dem vollständigen Bogen ist euer Kind versichert und darf am Spielbetrieb teilnehmen.</span></li>
  </ol>
</section>
<section class="wrap section" aria-labelledby="fee-title">
  <div class="section-head"><h2 id="fee-title">Beiträge</h2><p>Laut Beitragsordnung. Ehrenamtlich Aktive können beitragsfrei gestellt werden, Rabatte gibt es nur innerhalb einer Abteilung. <a href="assets/docs/beitragsordnung.pdf">Beitragsordnung als PDF</a></p></div>
  <div class="fee-grid">${D.fees.map((f) => `<div class="table-wrap"><table><caption>${esc(f.group)}</caption><thead><tr><th scope="col"></th><th scope="col" class="num">Monat</th><th scope="col" class="num">Halbjahr</th><th scope="col" class="num">Jahr</th></tr></thead><tbody>${f.rows.map((r) => `<tr><td>${esc(r[0])}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join("")}</tbody></table><p>Anmeldegebühr ${esc(f.fee)}</p></div>`).join("")}</div>
</section>
<section class="wrap section" aria-labelledby="k-title">
  <div class="split">
    <div class="prose"><h2 id="k-title">Kündigung</h2>
      <p><b>Fußball:</b> nur schriftlich zum Jahresende. Die Kündigung muss dem Vorstand bis zum 1. Oktober vorliegen.</p>
      <p><b>Turnen:</b> nur schriftlich zum 30.06. oder 31.12. Sie muss bis zum 1. April bzw. 1. Oktober vorliegen.</p>
      <p>Bei einem Vereinswechsel aktiver Sportlerinnen und Sportler gelten zusätzlich die Wechselbestimmungen der Verbände.</p>
    </div>
    <div class="contact"><h3>Kündigung an</h3><address style="font-style:normal">${esc(club.name)}<br>${club.post.join("<br>")}</address><p>Fragen: ${mailA(club.mail.gv)}</p></div>
  </div>
</section>`,
});

// Vereinsheim
pages.push({
  file: "vereinsheim.html", title: "Vereinsheim",
  desc: "Das renovierte Vereinsheim der DJK Spvgg Herten am Katzenbusch: Raum für bis zu 60 Personen, Küche, Außenbereich. Miete für Mitglieder.",
  body: `${pageHead("Vereinsheim", "Neu renoviert, direkt an der Sportanlage. Für Besprechungen, Sitzungen und Feiern.")}
<section class="wrap section" style="padding-top:0">
  <div class="split wide-left">
    ${img("vh_1", "Der geschmückte Raum im Vereinsheim mit Stehtischen", { cls: "feature-img", eager: true })}
    <div class="prose">
      <h2>Mieten</h2>
      <dl class="roles">
        <div><dt>Miete</dt><dd>${D.clubhouse.price}</dd></div>
        <div><dt>Kaution</dt><dd>${D.clubhouse.deposit}</dd></div>
        <div><dt>Personen</dt><dd>bis ${D.clubhouse.capacity}</dd></div>
        <div><dt>Wer darf mieten?</dt><dd>Vereinsmitglieder</dd></div>
      </dl>
      <p>Bitte behandelt Räume und Einrichtung sorgfältig und hinterlasst alles so, wie ihr es vorgefunden habt.</p>
      <p>Anfragen an den Vorstand: ${mailA(club.mail.gv)}</p>
    </div>
  </div>
</section>
<section class="wrap section" aria-labelledby="r-title">
  <div class="section-head"><h2 id="r-title">Was euch erwartet</h2></div>
  <div class="contacts">${D.clubhouse.rooms.map(([t, x]) => `<div class="contact"><h3>${esc(t)}</h3><p>${esc(x)}</p></div>`).join("")}</div>
</section>`,
});

// Kinderschutz
pages.push({
  file: "kinderschutz.html", title: "Kinder- und Jugendschutz",
  desc: "Das Kinder- und Jugendschutzkonzept der DJK Spvgg Herten: Prävention, regelmäßige Schulungen und ein respektvoller Umgang.",
  body: `${pageHead("Kinder- und Jugendschutz", "Kinderschutz hat bei uns höchste Priorität.")}
<section class="wrap section" style="padding-top:0">
  <div class="split">
    <div class="prose">
      <p>Wir wollen Kindern und Jugendlichen einen Ort bieten, an dem sie sich sicher, respektiert und wertgeschätzt fühlen. Deshalb haben wir ein Schutzkonzept, das wir aktiv leben und nicht nur auf dem Papier stehen haben.</p>
      <p>Unsere Trainerinnen, Trainer und alle weiteren Verantwortlichen werden regelmäßig geschult. So entsteht ein gemeinsames Verständnis für Prävention, Verantwortung und einen respektvollen Umgang, und junge Menschen können sich sportlich und persönlich sicher entwickeln.</p>
      <div class="btn-row"><a class="btn btn-red" href="assets/docs/kinderschutzkonzept.pdf">Schutzkonzept als PDF</a></div>
      <p>Ansprechpartner: ${mailA(club.mail.gv)}</p>
    </div>
    ${img("schutz", "Für ein sicheres Miteinander: Kinder- und Jugendschutz bei der DJK Spvgg Herten")}
  </div>
</section>`,
});

// News
pages.push({
  file: "news.html", title: "Neuigkeiten",
  desc: "Neuigkeiten aus der DJK Spvgg Herten: Ehrungen, Versammlungen, Mitternachtscup und Termine aus Jugend, Damen und Herren.",
  body: `${pageHead("Neuigkeiten", "Was im Verein passiert. Aktuelles aus der Jugend gibt es auch auf Instagram unter <a href=\"https://www.instagram.com/djkjugend\" rel=\"noopener\">@djkjugend</a>.")}
<section class="wrap" style="padding-bottom:2rem">
  <div class="filters" role="group" aria-label="Nach Thema filtern">${["Alle", ...new Set(newsItems.map((n) => n.tag))].map((t, i) => `<button type="button" data-tag="${t}" aria-pressed="${i === 0}">${t}</button>`).join("")}</div>
  ${newsItems.map((n) => `<article class="article" id="${n.slug}" data-tag="${esc(n.tag)}">
    ${img(n.img, n.title)}
    <div class="body"><div class="dateline"><time datetime="${n.date}">${fmtDate(n.date)}</time><span class="tag">${esc(n.tag)}</span></div><h2>${esc(n.title)}</h2>${n.body.map((p) => `<p>${esc(p)}</p>`).join("")}<p><button type="button" class="share" data-url="${SITE_URL}/news.html#${n.slug}" data-title="${esc(n.title)}">Beitrag teilen</button></p></div>
  </article>`).join("\n")}
</section>`,
});

// Fanshop
pages.push({
  file: "fanshop.html", title: "Fanshop",
  desc: "Fanartikel der DJK Spvgg Herten: Tassen, Trinkflasche, Schlüsselbänder und mehr im Vereinslook.",
  body: `${pageHead("Fanshop", "Alles im DJK-Look. Bestellt per Mail an " + mailA(club.mail.fanshop) + " oder telefonisch unter " + telA("0179 5722427") + ". Wir melden uns mit allen Details zu Bezahlung und Übergabe.")}
<section class="wrap section" style="padding-top:0">
  <div class="products">${D.products.map((p) => `<article class="product"><div class="pic">${img(p.img, p.name)}</div><div class="txt"><h3>${esc(p.name)}</h3><small>${esc(p.desc)}</small><span class="price tnum">${p.price}</span><small>inkl. MwSt.</small><a href="mailto:${club.mail.fanshop}?subject=${encodeURIComponent("Bestellung: " + p.name)}">Per Mail bestellen</a></div></article>`).join("")}</div>
</section>`,
});

// Sponsoren
pages.push({
  file: "sponsoren.html", title: "Sponsoren",
  desc: "Sponsor der DJK Spvgg Herten werden: Trikot-, Banner-, Banden- und Onlinewerbung im Kreis Recklinghausen.",
  body: `${pageHead("Sponsoren", "Ohne Sponsoren geht es nicht. Von eurer Unterstützung profitieren die Kinder, die Mannschaften und der ganze Verein.")}
<section class="wrap section" style="padding-top:0">
  <div class="split">
    <div class="prose">
      <h2>Partner werden</h2>
      <p>Mit Trikot-, Banner-, Banden- oder Onlinewerbung macht ihr euer Unternehmen im ganzen Kreis Recklinghausen bekannt. Dazu kommen Begegnungen mit Freunden, Geschäftspartnern und Bekannten, zum Beispiel beim Mitternachtscup.</p>
      <p>Wir arbeiten mit allen Verantwortlichen daran, den Verein sportlich voranzubringen. Unterstützt uns dabei als Sponsor und Partner der DJK Spvgg Herten 07 e.V.</p>
      <div class="btn-row"><a class="btn btn-red" href="mailto:${club.mail.info}?subject=Sponsoring">Sponsoring anfragen</a></div>
      <p class="crumb">${mailA(club.mail.info)}</p>
    </div>
    <div class="logos">${D.sponsors.map((s) => `<div>${img(s.img, s.name)}</div>`).join("")}<div class="slot">Hier könnte euer Logo stehen</div></div>
  </div>
</section>`,
});

// Kontakt
pages.push({
  file: "kontakt.html", title: "Kontakt",
  desc: "Kontakt zur DJK Spvgg Herten 07 e.V.: Anschrift, Postanschrift und die richtigen Ansprechpartner für Jugend, Damen, Herren, Turnen und Fanshop.",
  body: `${pageHead("Kontakt", "Ihr habt Fragen oder wollt Teil der DJK-Familie werden? Hier erreicht ihr die richtigen Leute.")}
<section class="wrap section" style="padding-top:0">
  <div class="contacts">
    <div class="contact"><h3>Allgemein</h3>${mailA(club.mail.info)}</div>
    <div class="contact"><h3>Vorstand und Mitgliedschaft</h3>${mailA(club.mail.gv)}<p>An- und Abmeldung, Vereinsheim, Kinderschutz</p></div>
    <div class="contact"><h3>Jugend und Probetraining</h3>${mailA(club.mail.jugend)}<p>Jugendleiter Christian Zak, ${telA("0179 5722427")}</p></div>
    <div class="contact"><h3>Katzenbuschladies</h3>${mailA("rick.dembowski@djkspvggherten.de")}<p>Rick Dembowski, ${telA("01575 1292412")}</p></div>
    <div class="contact"><h3>Herren</h3>${mailA("thorsten.gringel@djkspvggherten.de")}<p>Thorsten Gringel, ${telA("0170 9601008")}</p></div>
    <div class="contact"><h3>Gehfußball</h3>${mailA("f.franiczek@djkspvggherten.de")}<p>Frank Franiczek</p></div>
    <div class="contact"><h3>Turnen</h3>${mailA(club.mail.turner)}</div>
    <div class="contact"><h3>Fanshop</h3>${mailA(club.mail.fanshop)}</div>
  </div>
</section>
<section class="wrap section">
  <div class="split">
    <div class="prose"><h2>Anschrift</h2><address style="font-style:normal">${esc(club.name)}<br>${club.address.join("<br>")}</address><a href="${club.maps}" rel="noopener">Auf der Karte zeigen</a></div>
    <div class="prose"><h2>Postanschrift</h2><address style="font-style:normal">${esc(club.name)}<br>${club.post.join("<br>")}</address></div>
  </div>
</section>`,
});

// Impressum
pages.push({
  file: "impressum.html", title: "Impressum",
  desc: "Impressum der DJK Spvgg Herten 07 e.V.",
  body: `${pageHead("Impressum", "")}
<section class="wrap section prose" style="padding-top:0">
  <h2>Angaben gemäß § 5 DDG</h2>
  <p>${esc(club.name)}<br>${club.address.slice(1).join("<br>")}</p>
  <p>Postanschrift: ${club.post.join(", ")}</p>
  <h3>Vertreten durch den Vorstand</h3>
  <p>Norbert van Gemmern (1. Vorsitzender), Frank Franiczek (2. Vorsitzender)</p>
  <h3>Kontakt</h3>
  <p>E-Mail: ${mailA(club.mail.gv)}</p>
  <h3>Registereintrag</h3>
  <p>Registergericht: Amtsgericht Recklinghausen<br>Vereinsregister: VR 2157</p>
  <h3>Steuernummer</h3>
  <p>359/5731/3012</p>
  <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
  <p>Norbert van Gemmern, Anschrift wie oben</p>
  <h2 style="margin-top:1.5rem">Haftung für Inhalte</h2>
  <p>Wir erstellen die Inhalte dieser Seiten mit größter Sorgfalt. Für Richtigkeit, Vollständigkeit und Aktualität können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir für eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Wir sind nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen. Sobald wir von einer Rechtsverletzung erfahren, entfernen wir die betreffenden Inhalte umgehend.</p>
  <h2>Haftung für Links</h2>
  <p>Unsere Seiten enthalten Links zu externen Websites, auf deren Inhalte wir keinen Einfluss haben. Für diese Inhalte ist der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche Links umgehend.</p>
  <h2>Urheberrecht</h2>
  <p>Die Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung. Fotos von Mannschaften und Personen veröffentlichen wir mit Einverständnis der Abgebildeten bzw. ihrer Erziehungsberechtigten.</p>
</section>`,
});

// Datenschutz
pages.push({
  file: "datenschutz.html", title: "Datenschutz",
  desc: "Datenschutzerklärung der DJK Spvgg Herten 07 e.V.",
  body: `${pageHead("Datenschutzerklärung", "Diese Website setzt bei Besuchern keine Cookies, nutzt keine Analyse- oder Werbedienste von Drittanbietern und speichert keine IP-Adressen. Schriften und Bilder liegen auf unserem eigenen Server.")}
<section class="wrap section prose" style="padding-top:0">
  <h2>1. Verantwortlicher</h2>
  <p>${esc(club.name)}, ${club.address.slice(1).join(", ")}<br>vertreten durch den Vorstand<br>E-Mail: ${mailA(club.mail.gv)}</p>
  <h2>2. Aufruf der Website und Hosting</h2>
  <p>Beim Aufruf unserer Seiten verarbeitet der Webserver automatisch Zugriffsdaten: IP-Adresse, Datum und Uhrzeit, aufgerufene Datei, übertragene Datenmenge, Browser und Betriebssystem sowie die zuvor besuchte Seite. Das ist technisch nötig, um die Website auszuliefern und ihre Sicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Die Daten werden nicht mit anderen Daten zusammengeführt und spätestens nach sieben Tagen gelöscht, sofern sie nicht zur Aufklärung eines Sicherheitsvorfalls benötigt werden.</p>
  <p>Die Website wird bei einem externen Dienstleister gehostet, mit dem wir einen Vertrag zur Auftragsverarbeitung nach Art. 28 DSGVO geschlossen haben. <span class="note" style="display:inline;padding:.1rem .4rem">Vor Veröffentlichung Name und Sitz des Hosting-Anbieters ergänzen.</span></p>
  <h2>3. Keine Cookies, keine Drittanbieter</h2>
  <p>Wir setzen bei Besuchern keine Cookies, keine Analyse- oder Werbedienste von Drittanbietern und keine eingebetteten Inhalte von Drittanbietern (z. B. Karten, Videos, Social-Media-Plugins) ein. Nur für angemeldete Administratoren der Website wird ein technisch notwendiges Sitzungs-Cookie gesetzt.</p>
  <h2>4. Eigene, anonyme Reichweitenmessung</h2>
  <p>Um zu verstehen, welche Inhalte gebraucht werden, zählen wir Seitenaufrufe mit einer eigenen Lösung auf unserem Server. Erfasst werden: aufgerufene Seite, Zeitpunkt, die Domain der zuvor besuchten Website, Gerätetyp (Handy, Tablet, Computer) und Browsersprache sowie anonyme Nutzungsereignisse (z. B. im Teamfinder eingegebenes Geburtsjahr, Suchbegriffe der Website-Suche, Klick auf einen Kalender- oder Kontaktlink, ohne die Nummer oder Adresse selbst).</p>
  <p>Es werden <b>keine Cookies</b> gesetzt, keine Daten auf eurem Gerät gespeichert und <b>keine IP-Adressen gespeichert</b>. Um Besucher eines Tages zählen zu können, wird aus IP-Adresse, Browserkennung und einem täglich neu erzeugten Zufallswert ein Prüfwert (Hash) gebildet. Der Zufallswert wird nach spätestens zwei Tagen gelöscht, danach kann niemand mehr einen Bezug zu einer Person herstellen. Ist in eurem Browser „Do Not Track“ oder „Global Privacy Control“ aktiviert, erfassen wir nichts.</p>
  <p>Rechtsgrundlage ist unser berechtigtes Interesse an einer bedarfsgerechten Website (Art. 6 Abs. 1 lit. f DSGVO). Da nicht auf euer Endgerät zugegriffen wird, ist keine Einwilligung nach § 25 TDDDG nötig. Die Ereignisse werden nach 13 Monaten gelöscht. Die Auswertung sehen nur die Administratoren des Vereins.</p>
  <h2>5. Kontakt per E-Mail oder Telefon</h2>
  <p>Wenn ihr uns per E-Mail oder Telefon kontaktiert, verarbeiten wir eure Angaben zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Wir löschen sie, wenn die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
  <h2>6. Links zu sozialen Netzwerken</h2>
  <p>Wir verlinken auf unsere Auftritte bei Instagram und Facebook. Erst wenn ihr einem Link folgt, werden Daten an den jeweiligen Anbieter (Meta Platforms Ireland Ltd.) übertragen. Für den Betrieb unserer Facebook-Seiten sind wir gemeinsam mit Meta verantwortlich (Art. 26 DSGVO). Informationen dazu: <a href="https://www.facebook.com/privacy/policy/" rel="noopener">Datenschutzrichtlinie von Meta</a>.</p>
  <h2>7. Fotos</h2>
  <p>Mannschafts- und Veranstaltungsfotos veröffentlichen wir auf Grundlage der Einwilligung der Abgebildeten bzw. ihrer Erziehungsberechtigten (Art. 6 Abs. 1 lit. a DSGVO). Die Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden, eine Mail an ${mailA(club.mail.gv)} genügt.</p>
  <h2>8. Eure Rechte</h2>
  <p>Ihr habt das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 15–21 DSGVO). Außerdem könnt ihr euch bei einer Aufsichtsbehörde beschweren, in NRW bei der Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestr. 2–4, 40213 Düsseldorf.</p>
  <p class="crumb">Stand: ${new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}</p>
</section>`,
});

// ---------- Spielplan ----------
{
  const teamsWithGames = [...new Map(GAMES.map((g) => [g.team, g.teamName])).entries()];
  const byDay = (list) => { const m = new Map(); for (const g of list) { const k = g.date.slice(0, 10); if (!m.has(k)) m.set(k, []); m.get(k).push(g); } return [...m.entries()]; };
  const dayBlock = ([d, list]) => `<li class="game-day" data-day="${d}"><h3>${(() => { const x = new Date(d + "T12:00:00Z"); return x.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }); })()}</h3><ol class="matches">${list.map((g) => matchRow(g)).join("")}</ol></li>`;
  pages.push({
    file: "spielplan.html", title: "Spielplan",
    desc: "Alle Spiele der DJK Spvgg Herten: Junioren, Juniorinnen, Damen und Herren. Termine, Gegner und Heimspiele am Katzenbusch, täglich aktualisiert.",
    body: `${pageHead("Spielplan", `Alle Spiele unserer ${teamsWithGames.length} Teams, zweimal täglich von fussball.de aktualisiert${matchesUpdated ? ` (Stand ${matchesUpdated} Uhr)` : ""}. Ergebnisse stehen auf fussball.de.`)}
<section class="wrap" style="padding-bottom:3rem">
  <div class="plan-tools">
    <div class="seg" role="tablist" aria-label="Zeitraum"><button type="button" role="tab" data-when="next" aria-selected="true">Kommende Spiele</button><button type="button" role="tab" data-when="past" aria-selected="false">Gespielt</button></div>
    <div class="filters" role="group" aria-label="Abteilung">${["alle", "jugend", "juniorinnen", "damen", "herren"].map((d, i) => `<button type="button" data-dept="${d}" aria-pressed="${i === 0}">${d === "alle" ? "Alle" : DEPT_LABEL[d]}</button>`).join("")}</div>
    <label class="plan-select"><span>Team</span><select id="plan-team"><option value="">Alle Teams</option>${teamsWithGames.map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join("")}</select></label>
    <label class="plan-check"><input type="checkbox" id="plan-home"> Nur Heimspiele</label>
    <a class="cal" href="${homeGamesCal}">${"Heimspiele abonnieren"}</a>
  </div>
  <p class="plan-empty" id="plan-empty" hidden>Für diese Auswahl gibt es gerade keine Spiele.</p>
  <ol class="game-days" id="plan-next">${byDay(upcoming).map(dayBlock).join("")}</ol>
  <ol class="game-days" id="plan-past" hidden>${byDay(played.slice().reverse()).reverse().map(([d, l]) => dayBlock([d, l.slice().reverse()])).join("")}</ol>
  <p class="crumb" style="margin-top:2rem">Quelle: <a href="${club.results}" rel="noopener">fussball.de</a>. Alle Angaben ohne Gewähr, kurzfristige Änderungen sind möglich.</p>
</section>`,
  });
}

// ---------- Teamseiten ----------
{
  const all = [
    ...D.youthTeams.map((t) => ({ t, id: t.id, dept: "Junioren", back: ["jugend.html", "Jugendabteilung"], meta: yearText(t).replace("Jg.", "Jahrgang") })),
    ...D.girlsTeams.map((t) => ({ t, id: t.id, dept: "Juniorinnen", back: ["jugend.html", "Jugendabteilung"], meta: yearText(t).replace("Jg.", "Jahrgang") })),
    ...D.ladies.teams.map((t) => ({ t, id: slugOf(t.name), dept: "Katzenbuschladies", back: ["damen.html", "Katzenbuschladies"], meta: t.league })),
    ...D.seniors.flatMap((g) => g.teams.map((t) => ({ t, id: slugOf(t.name), dept: g.group, back: ["senioren.html", "Herren"], meta: t.league }))),
  ];
  for (const { t, id, dept, back, meta } of all) {
    const next = upcoming.filter((g) => g.team === id), last = played.filter((g) => g.team === id);
    const gamesCal = GAMES.some((g) => g.team === id) ? matchIcs(`spiele-${id}`, `Spiele ${t.name}`, GAMES.filter((g) => g.team === id)) : null;
    const people = t.coaches.map(([n, p, role, mail]) => `<li><span>${esc(n)}${role ? ` <span class="role">${esc(role)}</span>` : ""}</span>${p ? telA(p) : mail ? mailA(mail) : ""}</li>`).join("")
      + (t.extra || []).map(([r, n, p]) => `<li><span>${esc(n)} <span class="role">${esc(r)}</span></span>${telA(p)}</li>`).join("");
    pages.push({
      file: teamUrl(id), title: t.name, current: back[0],
      desc: `${t.name} der DJK Spvgg Herten: Trainingszeiten, Trainer, Ansprechpartner und alle Spiele${meta ? " (" + meta + ")" : ""}.`,
      body: `<section class="team-hero${t.img ? "" : " no-img"}">
  ${t.img ? img(t.img, `Mannschaftsfoto ${t.name}`, { eager: true }) : ""}
  <div class="wrap">
    <p class="crumb"><a href="index.html">Start</a> / <a href="${back[0]}">${esc(back[1])}</a> / ${esc(t.name)}</p>
    <p class="th-dept">${esc(dept)}</p>
    <h1>${esc(t.name)}</h1>
    <div>${favBtn(id, t.name)}</div>
    ${meta ? `<p class="lead">${esc(meta)}</p>` : ""}
  </div>
</section>
<section class="wrap section">
  <div class="team-grid">
    <aside class="team-facts">
      <div class="fact"><span>Training</span><b>${esc(t.training)} Uhr</b><small>Kampfbahn Katzenbusch</small></div>
      <div class="fact"><span>Ansprechpartner</span><ul class="people">${people}</ul></div>
      <div class="fact"><span>Kalender</span>${calLink(`assets/kalender/${id}.ics`).replace("Trainingszeiten in den Kalender", "Training abonnieren")}${gamesCal ? calLink(gamesCal).replace("Trainingszeiten in den Kalender", "Spiele abonnieren") : ""}</div>
      ${t.fd ? `<div class="fact"><span>fussball.de</span><a href="https://www.fussball.de/mannschaft/-/saison/2627/team-id/${t.fd}" rel="noopener">Tabelle und Ergebnisse</a></div>` : ""}
    </aside>
    <div class="team-games">
      <h2>Nächste Spiele</h2>
      ${next.length ? `<ol class="matches">${next.slice(0, 8).map((g) => matchRow(g, false)).join("")}</ol>` : `<p class="plan-empty">Gerade sind keine Spiele angesetzt.</p>`}
      <h2 style="margin-top:2.5rem">Zuletzt gespielt</h2>
      ${last.length ? `<ol class="matches">${last.slice(0, 8).map((g) => matchRow(g, false)).join("")}</ol>` : `<p class="plan-empty">Noch keine Spiele in dieser Saison.</p>`}
    </div>
  </div>
</section>`,
    });
  }
  for (const g of D.gym.groups) {
    pages.push({
      file: teamUrl(g.id), title: g.name, current: "turnen.html",
      desc: `${g.name} bei der DJK Spvgg Herten: ${g.ageText}. Zeiten, Halle und Ansprechpartner.`,
      body: `<section class="team-hero gym">
  ${img(g.img, g.name, { eager: true })}
  <div class="wrap">
    <p class="crumb"><a href="index.html">Start</a> / <a href="turnen.html">Turnabteilung</a> / ${esc(g.name)}</p>
    <p class="th-dept">Turnen</p>
    <h1>${esc(g.name)}</h1>
    <div>${favBtn(g.id, g.name)}</div>
    <p class="lead">${esc(g.ageText)}</p>
  </div>
</section>
<section class="wrap section">
  ${D.gym.stop ? `<p class="note" style="margin-bottom:2rem">Zurzeit gilt ein Aufnahmestopp. Fragt gern unter ${mailA(club.mail.turner)} nach, ob wieder Plätze frei sind.</p>` : ""}
  <div class="team-grid">
    <aside class="team-facts">
      ${g.sessions.map(([d, a, b, h, f]) => `<div class="fact"><span>${({ Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag" })[d]}${f ? " · " + esc(f) : ""}</span><b class="tnum">${a}–${b} Uhr</b><a href="${D.gym.halls[h].map}" rel="noopener">${esc(D.gym.halls[h].name)}, ${esc(D.gym.halls[h].area)}</a></div>`).join("")}
      <div class="fact"><span>Leitung</span><b>${esc(g.lead)}</b>${mailA(club.mail.turner)}</div>
      <div class="fact"><span>Kalender</span>${calLink(`assets/kalender/${g.id}.ics`).replace("Trainingszeiten in den Kalender", "Termine abonnieren")}</div>
    </aside>
    <div class="prose"><h2>Was wir machen</h2><p>${esc(g.text)}</p><p><a href="turnen.html">Alle Gruppen der Turnabteilung</a> · <a href="mitgliedschaft.html">Beiträge</a></p></div>
  </div>
</section>`,
    });
  }
}

// ---------- Termine ----------
{
  const evs = D.events.filter((e) => (e.end || e.date) >= NOW.slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date));
  const homeSoon = upcoming.filter((g) => g.home).slice(0, 12);
  pages.push({
    file: "termine.html", title: "Termine",
    desc: "Veranstaltungen, Versammlungen und die nächsten Heimspiele der DJK Spvgg Herten am Katzenbusch.",
    body: `${pageHead("Termine", "Veranstaltungen im Verein und die nächsten Heimspiele am Katzenbusch.")}
<section class="wrap section" style="padding-top:0">
  <div class="split">
    <div class="prose"><h2>Veranstaltungen</h2>
      ${evs.length ? `<ol class="events">${evs.map((e) => `<li><time class="tnum" datetime="${e.date}">${dayLabel(e.date + "T00:00")}</time><div><b>${esc(e.title)}</b>${e.time ? `<span class="tnum">${esc(e.time)} Uhr</span>` : ""}${e.place ? `<span>${esc(e.place)}</span>` : ""}${e.text ? `<p>${esc(e.text)}</p>` : ""}</div></li>`).join("")}</ol>` : `<p class="plan-empty">Gerade sind keine besonderen Termine eingetragen. Neues erfahrt ihr unter <a href="news.html">News</a> und auf Instagram.</p>`}
    </div>
    <div class="prose"><h2>Nächste Heimspiele</h2>
      ${homeSoon.length ? `<ol class="matches">${homeSoon.map((g) => matchRow(g)).join("")}</ol>` : `<p class="plan-empty">Gerade sind keine Heimspiele angesetzt.</p>`}
      <p><a class="cal" href="${homeGamesCal}">Alle Heimspiele abonnieren</a></p>
    </div>
  </div>
</section>`,
  });
}

// ---------- Fragen und Antworten ----------
{
  const minY = Math.max(...[...D.youthTeams, ...D.girlsTeams].map((t) => t.years[1]));
  const kid = D.fees.find((f) => f.group === "Fußballjugend");
  const FAQ = [
    ["Wie kann mein Kind ein Probetraining machen?", `Sucht im <a href="index.html#probetraining">Teamfinder</a> das passende Team und ruft den Trainer an oder schreibt an ${mailA(club.mail.jugend)}. Euer Kind darf zwei- bis dreimal kostenlos mittrainieren.`],
    ["Ab welchem Alter geht es los?", `Beim Eltern-Kind-Turnen ab 1½ Jahren. Fußball spielen bei uns Kinder ab Jahrgang ${minY} in den Bambini.`],
    ["Gibt es Fußball für Mädchen?", `Ja. Mädchen können in allen Junioren-Teams mitspielen, und wir haben eigene Juniorinnen-Teams von der U9 bis zur U15. Danach geht es bei den <a href="damen.html">Katzenbuschladies</a> weiter.`],
    ["Was kostet die Mitgliedschaft?", `Für das erste Kind im Fußball ${kid ? kid.rows[0][1] : "10,00 €"} im Monat, für Geschwister weniger. Alle Beiträge stehen unter <a href="mitgliedschaft.html">Mitglied werden</a>.`],
    ["Wann ist mein Kind versichert?", "Erst wenn der vollständig ausgefüllte Anmeldebogen mit einer Kopie der Geburtsurkunde beim Trainer abgegeben ist. Dann darf es auch am Spielbetrieb teilnehmen."],
    ["Wo finden Training und Spiele statt?", `Fußball an der Kampfbahn Katzenbusch, ${club.address[1]}, ${club.address[2]}. Geturnt wird in den Turnhallen der Augustaschule (Herten-Süd) und der Waldschule (Herten-Langenbochum).`],
    ["Ändern sich die Trainingszeiten im Winter?", "Die angegebenen Zeiten gelten für den Sommer, im Winter kann es Abweichungen geben. Platzsperren und Ausfälle zeigen wir oben auf der Website an, Details gibt es beim Trainer."],
    ["Wo finde ich Spiele und Ergebnisse?", `Im <a href="spielplan.html">Spielplan</a> stehen alle Spiele unserer Teams. Ergebnisse und Tabellen findet ihr auf fussball.de, verlinkt bei jedem Spiel.`],
    ["Wie kündige ich?", "Schriftlich an den Vorstand: im Fußball zum Jahresende (bis 1. Oktober), im Turnen zum 30.06. oder 31.12. (bis 1. April bzw. 1. Oktober). Details unter Mitglied werden."],
    ["Kann ich das Vereinsheim mieten?", `Ja, als Mitglied für ${D.clubhouse.price} plus ${D.clubhouse.deposit} Kaution, für bis zu ${D.clubhouse.capacity} Personen. Anfragen an ${mailA(club.mail.gv)}.`],
    ["Wie schützt ihr Kinder im Verein?", `Mit einem Kinderschutzkonzept und regelmäßigen Schulungen für alle Trainer. Mehr unter <a href="kinderschutz.html">Kinder- und Jugendschutz</a>.`],
    ["Wie kann ich den Verein unterstützen?", `Als Trainer, Helfer, Sponsor oder Mitglied. Schreibt an ${mailA(club.mail.info)}, wir freuen uns über jede Unterstützung.`],
  ];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) };
  pages.push({
    file: "faq.html", title: "Fragen und Antworten",
    desc: "Häufige Fragen von Eltern und Mitgliedern: Probetraining, Alter, Mädchenfußball, Beiträge, Versicherung, Trainingsorte und Kündigung.",
    jsonld: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`,
    body: `${pageHead("Fragen und Antworten", "Das Wichtigste für Eltern, neue Mitglieder und alle, die mitmachen wollen.")}
<section class="wrap section" style="padding-top:0">
  <div class="faq">${FAQ.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${a}</p></details>`).join("")}</div>
  <p style="margin-top:2rem">Eure Frage ist nicht dabei? Schreibt an ${mailA(club.mail.info)}.</p>
</section>`,
  });
}

// ---------- 404 ----------
pages.push({
  file: "404.html", title: "Seite nicht gefunden",
  desc: "Diese Seite gibt es nicht (mehr).",
  body: `<section class="wrap section not-found">
  <p class="nf-code tnum" aria-hidden="true">404</p>
  <h1>Abseits.</h1>
  <p class="lead">Diese Seite gibt es nicht oder nicht mehr. Vielleicht hilft die Suche weiter.</p>
  <div class="btn-row"><button type="button" class="btn btn-red search-open">Website durchsuchen</button><a class="btn btn-ghost" href="index.html">Zur Startseite</a></div>
  <ul class="nf-links"><li><a href="spielplan.html">Spielplan</a></li><li><a href="jugend.html">Jugend</a></li><li><a href="turnen.html">Turnen</a></li><li><a href="kontakt.html">Kontakt</a></li></ul>
</section>`,
});

// ---------- Daten für „Mein Team“ ----------
let MYTEAM_JSON = "{}";
{
  const teams = {};
  const coachOf = (list) => { const c = list.find((x) => x[1]); return c ? { name: c[0], phone: c[1] } : null; };
  const add = (id, name, coaches, extra = {}) => {
    teams[id] = { name, url: teamUrl(id), cal: `assets/kalender/${id}.ics`, gamesCal: GAMES.some((g) => g.team === id) ? `assets/kalender/spiele-${id}.ics` : null,
      sessions: SESSIONS.filter((x) => x.u === teamUrl(id)).map((x) => ({ d: x.d, s: x.s, e: x.e, p: x.p })), coach: coachOf(coaches), ...extra };
  };
  for (const t of [...D.youthTeams, ...D.girlsTeams]) add(t.id, t.name, [...t.coaches, ...(t.extra || []).map((e) => [e[1], e[2]])]);
  for (const t of [...D.ladies.teams, ...D.seniors.flatMap((g) => g.teams)]) add(slugOf(t.name), t.name, t.coaches);
  for (const g of D.gym.groups) add(g.id, g.name, [], { mail: club.mail.turner, stop: D.gym.stop, gym: true, lead: g.lead });
  const games = upcoming.map((g) => ({ t: g.team, d: g.date, o: g.label, h: g.home ? 1 : 0, f: g.festival ? 1 : 0, c: g.competition, x: g.flagText || "" }));
  const st = D.status && D.status.active && !(D.status.until && D.status.until < NOW.slice(0, 10)) ? { title: D.status.title, text: D.status.text, level: D.status.level } : null;
  MYTEAM_JSON = JSON.stringify({ teams, games, status: st }).replace(/</g, "\\u003c");
}

// ---------- Ausgabe ----------
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, f.name), d = path.join(dst, f.name);
    f.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
const FONT_CSS = `@font-face{font-family:"Archivo Variable";font-style:normal;font-display:swap;font-weight:100 900;font-stretch:62% 125%;src:url(fonts/archivo-latin-wdth-normal.woff2) format("woff2-variations")}
@font-face{font-family:"Figtree Variable";font-style:normal;font-display:swap;font-weight:300 900;src:url(fonts/figtree-latin-wght-normal.woff2) format("woff2-variations")}
`;

// ---------- Suchindex ----------
{
  const S = [];
  const add = (t, s, u, k, g) => S.push({ t, s, u, g, k: (t + " " + s + " " + (k || "")).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") });
  for (const p of pages) add(p.home ? "Startseite" : p.title, p.desc, p.file, "", "Seite");
  for (const t of [...D.youthTeams, ...D.girlsTeams]) {
    const yrs = []; for (let y = t.years[0]; y <= t.years[1]; y++) yrs.push(y);
    add(t.name, `${yearText(t)} · Training ${t.training}`, teamUrl(t.id), `${t.id} ${t.label || ""} ${yrs.join(" ")} jugend probetraining ${t.coaches.map((c) => c[0]).join(" ")}`, "Team");
    for (const [n, p] of t.coaches) add(n, `${t.name}${p ? " · " + p : ""}`, teamUrl(t.id), "trainer", "Person");
  }
  const feat = [...D.ladies.teams.map((t) => [t, "damen.html", "katzenbuschladies frauen damen"]), ...D.seniors.flatMap((g) => g.teams.map((t) => [t, "senioren.html", "herren " + g.group]))];
  for (const [t, f, k] of feat) {
    add(t.name, `${t.league ? t.league + " · " : ""}Training ${t.training}`, teamUrl(slugOf(t.name)), `${k} ${t.coaches.map((c) => c[0]).join(" ")}`, "Team");
    for (const [n, p, r] of t.coaches) add(n, `${r || "Trainer"} ${t.name}${p ? " · " + p : ""}`, teamUrl(slugOf(t.name)), "", "Person");
  }
  const boards = [[D.board, "verein.html", "Vorstand"], [D.youthBoard, "jugend.html", "Jugendvorstand"], [D.ladies.board, "damen.html", "Damenabteilung"]];
  for (const [list, f, label] of boards) for (const r of list) for (const n of r.names) add(n, `${r.role}, ${label}${r.phone ? " · " + r.phone : ""}`, f, "", "Person");
  const yNow = new Date().getFullYear();
  for (const g of D.gym.groups) {
    const yrs = []; for (let y = Math.floor(yNow - g.ages[1]); y <= Math.ceil(yNow - g.ages[0]); y++) yrs.push(y);
    add(g.name, `Turnen · ${g.ageText} · ${g.sessions.map(([d, a, b]) => d + " " + a + "–" + b).join(", ")}`, teamUrl(g.id), `turnen turngruppe ${yrs.join(" ")} ${g.lead} ${g.sessions.map((x) => x[3]).join(" ")}`, "Turnen");
  }
  for (const p of D.gym.team) add(p.name, `Turnen · ${p.role}`, "turnen.html", "turnen", "Person");
  for (const n of newsItems) add(n.title, fmtDate(n.date), `news.html#${n.slug}`, n.tag + " " + n.body.join(" "), "News");
  // doppelte Personen-Treffer zusammenfassen
  const seen = new Set();
  SEARCH_JSON = JSON.stringify(S.filter((x) => { const key = x.t + "|" + x.s; if (seen.has(key)) return false; seen.add(key); return true; })).replace(/</g, "\\u003c");
}

const MANIFEST = JSON.stringify({
  name: "DJK Spvgg Herten 07 e.V.", short_name: "DJK Herten", lang: "de", start_url: "./index.html", scope: "./",
  display: "standalone", background_color: "#f5f7f3", theme_color: "#0d4a2c",
  icons: [{ src: "assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" }, { src: "assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  shortcuts: [{ name: "Mannschaft finden", url: "./jugend.html#probetraining" }, { name: "Neuigkeiten", url: "./news.html" }],
}, null, 2);
const SW = `// Offline-Unterstützung: Seiten zuerst aus dem Netz, Dateien zuerst aus dem Cache.
const C = "djk-v${Date.now()}";
const PRE = ${JSON.stringify(["./", "index.html", ...pages.map((p) => p.file).filter((f) => f !== "index.html" && !f.startsWith("team-")), "assets/site.css", "assets/main.js", "assets/icon-512.png"])};
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const u = new URL(r.url); if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/admin")) return;
  if (r.mode === "navigate") { e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res; }).catch(() => caches.match(r).then((m) => m || caches.match("index.html")))); return; }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })));
});
`;

for (const mode of ["dist", "preview"]) {
  const out = path.join(ROOT, mode);
  fs.rmSync(out, { recursive: true, force: true });
  copyDir(path.join(ROOT, "assets"), path.join(out, "assets"));
  fs.mkdirSync(path.join(out, "assets/kalender"), { recursive: true });
  for (const [id, ics] of Object.entries(CALS)) fs.writeFileSync(path.join(out, `assets/kalender/${id}.ics`), ics);
  if (mode === "dist") {
    fs.writeFileSync(path.join(out, "manifest.webmanifest"), MANIFEST);
    fs.writeFileSync(path.join(out, "sw.js"), SW);
  }
  if (mode === "dist") {
    fs.writeFileSync(path.join(out, "assets/site.css"), FONT_CSS + CSS);
    fs.writeFileSync(path.join(out, "assets/main.js"), JS);
  } else {
    fs.rmSync(path.join(out, "assets/fonts"), { recursive: true, force: true });
  }
  for (const p of pages) fs.writeFileSync(path.join(out, p.file), page(p, mode));
  const teamNames = Object.fromEntries([...D.youthTeams.map((t) => [t.id, t.name]), ...D.girlsTeams.map((t) => [t.id, t.name]), ...D.ladies.teams.map((t) => [slugOf(t.name), t.name]), ...D.seniors.flatMap((g) => g.teams.map((t) => [slugOf(t.name), t.name])), ...D.gym.groups.map((g) => [g.id, g.name])]);
  writeAdmin(out, mode, { CSS, pages, teams: teamNames, esc });
  if (mode === "dist") {
    const today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((p) => p.file !== "404.html").map((p) => `  <url><loc>${SITE_URL}/${p.home ? "" : p.file}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
    fs.writeFileSync(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    // Sicherheits-Header für Cloudflare Pages
    fs.writeFileSync(path.join(out, "_headers"), [
      "/*",
      "  X-Content-Type-Options: nosniff",
      "  Referrer-Policy: strict-origin-when-cross-origin",
      "  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()",
      "  Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "  X-Frame-Options: DENY",
      "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      "/admin/cms/*",
      "  ! Content-Security-Policy",
      "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: blob: https://*.githubusercontent.com https://avatars.githubusercontent.com; font-src 'self' data: https://unpkg.com; connect-src 'self' https://api.github.com https://github.com https://unpkg.com https://*.githubusercontent.com; frame-ancestors 'none'",
      "/assets/*",
      "  Cache-Control: public, max-age=604800",
      "/assets/kalender/*",
      "  Content-Type: text/calendar; charset=utf-8",
      "  Cache-Control: public, max-age=3600",
      "",
    ].join("\n"));
    // Weiterleitungen der alten Wix-Adressen (Netlify / Cloudflare Pages)
    const R = [["/verein", "/verein.html"], ["/an-undabmeldung", "/mitgliedschaft.html"], ["/vereinsheim", "/vereinsheim.html"], ["/spielst%C3%A4tte", "/verein.html#spielstaette"], ["/spielstätte", "/verein.html#spielstaette"], ["/kinder-jugendschutzkonzept", "/kinderschutz.html"], ["/jugendabteilung", "/jugend.html"], ["/katzenbuschladies", "/damen.html"], ["/senioren", "/senioren.html"], ["/turner", "/turnen.html"], ["/fanshop", "/fanshop.html"], ["/fanartikel", "/fanshop.html"], ["/trainingszubeh%C3%B6r", "/fanshop.html"], ["/trainingszubehör", "/fanshop.html"], ["/sale", "/fanshop.html"], ["/sponsoren", "/sponsoren.html"], ["/kontakt", "/kontakt.html"], ["/impressum", "/impressum.html"], ["/datenschutz", "/datenschutz.html"], ["/blank-2", "/fanshop.html"], ["/wiederrufsrecht", "/fanshop.html"], ["/blog", "/news.html"], ["/post/*", "/news.html"]];
    fs.writeFileSync(path.join(out, "_redirects"), R.map(([a, b]) => `${a} ${b} 301`).join("\n") + "\n");
    fs.writeFileSync(path.join(out, ".htaccess"), "RewriteEngine On\n" + R.filter(([a]) => !/[äö*]/.test(a)).map(([a, b]) => `RewriteRule ^${a.slice(1).replace(/%/g, "\\%")}/?$ ${b.replace("#", "\\#")} [R=301,L,NE]`).join("\n") + "\nRewriteRule ^post/ /news.html [R=301,L]\nErrorDocument 404 /index.html\n");
  }
}
console.log("Seiten:", pages.map((p) => p.file).join(", "));
