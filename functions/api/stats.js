// Liefert die Auswertungen für das Statistik-Dashboard (nur für angemeldete Admins, siehe _middleware.js).
// GET /api/stats?days=30            → JSON
// GET /api/stats?days=30&format=csv → Tageswerte als CSV
import { json, berlinDay } from "../_lib.js";

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "Keine Datenbank verbunden" }, { status: 503 });
  const url = new URL(request.url);
  const days = Math.min(400, Math.max(1, parseInt(url.searchParams.get("days") || "30", 10)));
  const from = berlinDay(new Date(Date.now() - (days - 1) * 864e5));
  const prevFrom = berlinDay(new Date(Date.now() - (2 * days - 1) * 864e5));
  const db = env.DB;
  const q = (sql, ...args) => db.prepare(sql).bind(...args);

  const [series, totals, prev, pages, refs, devices, finder, calendars, searches, noHits, contacts, outbound, live, installs, myteams] = await db.batch([
    q("SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM events WHERE type = 'view' AND day >= ? GROUP BY day ORDER BY day", from),
    q("SELECT COUNT(*) AS views, COUNT(DISTINCT day || visitor) AS visitors FROM events WHERE type = 'view' AND day >= ?", from),
    q("SELECT COUNT(*) AS views, COUNT(DISTINCT day || visitor) AS visitors FROM events WHERE type = 'view' AND day >= ? AND day < ?", prevFrom, from),
    q("SELECT path AS label, COUNT(*) AS n FROM events WHERE type = 'view' AND day >= ? GROUP BY path ORDER BY n DESC LIMIT 15", from),
    q("SELECT CASE WHEN ref = '' THEN 'direkt' ELSE ref END AS label, COUNT(DISTINCT day || visitor) AS n FROM events WHERE type = 'view' AND day >= ? GROUP BY label ORDER BY n DESC LIMIT 10", from),
    q("SELECT device AS label, COUNT(DISTINCT day || visitor) AS n FROM events WHERE type = 'view' AND day >= ? GROUP BY device ORDER BY n DESC", from),
    q("SELECT label, COUNT(*) AS n FROM events WHERE type = 'finder' AND day >= ? GROUP BY label ORDER BY label DESC", from),
    q("SELECT label, COUNT(*) AS n FROM events WHERE type = 'calendar' AND day >= ? GROUP BY label ORDER BY n DESC LIMIT 15", from),
    q("SELECT lower(label) AS label, COUNT(*) AS n FROM events WHERE type = 'search' AND day >= ? AND value != '0' GROUP BY lower(label) ORDER BY n DESC LIMIT 15", from),
    q("SELECT lower(label) AS label, COUNT(*) AS n FROM events WHERE type = 'search' AND day >= ? AND value = '0' GROUP BY lower(label) ORDER BY n DESC LIMIT 10", from),
    q("SELECT label || ' · ' || path AS label, COUNT(*) AS n FROM events WHERE type = 'contact' AND day >= ? GROUP BY label, path ORDER BY n DESC LIMIT 10", from),
    q("SELECT label, COUNT(*) AS n FROM events WHERE type = 'outbound' AND day >= ? GROUP BY label ORDER BY n DESC LIMIT 10", from),
    q("SELECT COUNT(DISTINCT visitor) AS n FROM events WHERE ts > ?", Date.now() - 5 * 60 * 1000),
    q("SELECT COUNT(*) AS n FROM events WHERE type = 'install' AND day >= ?", from),
    q("SELECT label, COUNT(*) AS n FROM events WHERE type = 'myteam' AND day >= ? GROUP BY label ORDER BY n DESC LIMIT 15", from),
  ]);

  if (url.searchParams.get("format") === "csv") {
    const rows = [["Tag", "Besucher", "Seitenaufrufe"], ...series.results.map((r) => [r.day, r.visitors, r.views])];
    return new Response(rows.map((r) => r.join(";")).join("\n"), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="djk-statistik-${days}-tage.csv"`, "Cache-Control": "no-store" },
    });
  }

  return json({
    days, from, generated: new Date().toISOString(),
    totals: totals.results[0], previous: prev.results[0], live: live.results[0].n, installs: installs.results[0].n,
    series: series.results, pages: pages.results, refs: refs.results, devices: devices.results,
    finder: finder.results, calendars: calendars.results, searches: searches.results, noHits: noHits.results,
    contacts: contacts.results, outbound: outbound.results, myteams: myteams.results,
  });
}
