// Lädt alle Inhalte aus content/ (vom CMS bearbeitbar) und stellt sie dem Generator bereit.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const C = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, "content", n + ".json"), "utf8"));
const tuple = (c) => [c.name, c.phone || null, c.role || null, c.mail || null];

const verein = C("verein"), jugend = C("jugend"), damen = C("damen"), senioren = C("senioren"), turnen = C("turnen");

export const club = verein.club;
export const board = verein.board;
export const departments = verein.departments;
export const history = verein.history.map((h) => [h.year, h.text]);
export const historyNotes = verein.historyNotes;

const team = (t) => ({ ...t, years: [t.yearFrom, t.yearTo], img: t.img || null, coaches: t.coaches.map(tuple), extra: (t.extra || []).map((e) => [e.role, e.name, e.phone || null]) });
export const youthTeams = jugend.youthTeams.map(team);
export const girlsTeams = jugend.girlsTeams.map(team);
export const youthBoard = jugend.youthBoard;
export const youthSponsors = jugend.youthSponsors;

export const ladies = { ...damen, teams: damen.teams.map((t) => ({ ...t, img: t.img || null, coaches: t.coaches.map(tuple) })), milestones: damen.milestones.map((m) => [m.year, m.text]) };
export const seniors = senioren.groups.map((g) => ({ ...g, lead: g.lead.map((l) => [l.role, l.name, l.phone || null, l.mail || null]), teams: g.teams.map((t) => ({ ...t, img: t.img || null, coaches: t.coaches.map(tuple) })) }));

export const gym = {
  ...turnen,
  halls: Object.fromEntries(turnen.halls.map((h) => [h.id, h])),
  groups: turnen.groups.map((g) => ({ ...g, ages: [g.ageFrom, g.ageTo], sessions: g.sessions.map((s) => [s.day, s.from, s.to, s.hall, s.focus]) })),
  results2023: turnen.results2023.map((r) => [r.name, r.year, r.points, r.place]),
};
export const fees = C("beitraege").fees.map((f) => ({ ...f, rows: f.rows.map((r) => [r.label, r.month, r.half, r.year]) }));
export const products = C("shop").products;
export const sponsors = C("sponsoren").sponsors;
const vh = C("vereinsheim");
export const clubhouse = { ...vh, rooms: vh.rooms.map((r) => [r.title, r.text]) };
export const status = C("status");
export const events = C("termine").events || [];
export const matches = fs.existsSync(path.join(ROOT, "content/spiele.json")) ? C("spiele") : { updated: null, games: [] };
export const results = fs.existsSync(path.join(ROOT, "content/ergebnisse.json")) ? Object.fromEntries((C("ergebnisse").list || []).map((r) => [r.id, r])) : {};

// News: content/news/*.md mit Kopfzeilen (title, date, tag, image), Absätze durch Leerzeilen getrennt
export const news = fs.readdirSync(path.join(ROOT, "content/news")).filter((f) => f.endsWith(".md")).map((f) => {
  const raw = fs.readFileSync(path.join(ROOT, "content/news", f), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("News ohne Kopfbereich: " + f);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":"); if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if (v.startsWith('"')) v = JSON.parse(v);
    meta[line.slice(0, i).trim()] = v;
  }
  const slug = f.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return { slug, date: String(meta.date).slice(0, 10), title: meta.title, tag: meta.tag, img: meta.image, body: m[2].trim().split(/\n\s*\n/).map((p) => p.replace(/\n/g, " ").trim()) };
});
