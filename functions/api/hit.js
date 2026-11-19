// Nimmt anonyme Seitenaufrufe und Ereignisse entgegen. Keine Cookies, keine IP-Speicherung.
// Besucher werden nur über einen Tages-Hash (IP + Browser + täglich neuer Zufallswert) gezählt,
// der Zufallswert wird nach zwei Tagen gelöscht. Danach ist keine Zuordnung mehr möglich.
import { sha256hex, berlinDay } from "../_lib.js";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch/i;
const TYPES = new Set(["view", "finder", "calendar", "contact", "search", "outbound", "install", "share", "myteam"]);
const clip = (v, n) => String(v ?? "").slice(0, n);

function refDomain(ref, host) {
  try {
    const u = new URL(ref);
    if (u.hostname === host) return "";
    return u.hostname.replace(/^www\.|^m\.|^l\./, "");
  } catch { return ""; }
}

async function daySalt(db, day) {
  const row = await db.prepare("SELECT salt FROM salts WHERE day = ?").bind(day).first();
  if (row) return row.salt;
  const salt = crypto.randomUUID() + crypto.randomUUID();
  await db.prepare("INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)").bind(day, salt).run();
  const again = await db.prepare("SELECT salt FROM salts WHERE day = ?").bind(day).first();
  return again.salt;
}

export async function onRequestPost({ request, env, waitUntil }) {
  const ok = new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (!env.DB) return ok;
  const ua = request.headers.get("User-Agent") || "";
  if (BOT.test(ua) || request.headers.get("DNT") === "1" || request.headers.get("Sec-GPC") === "1") return ok;

  let body;
  try { body = JSON.parse(await request.text()); } catch { return ok; }
  const type = TYPES.has(body.t) ? body.t : null;
  if (!type) return ok;

  const host = new URL(request.url).hostname;
  const path = (clip(body.p, 200).split("?")[0].split("#")[0] || "/").replace(/\.html$/, "").replace(/\/index$/, "/") || "/";
  const day = berlinDay();
  const salt = await daySalt(env.DB, day);
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const visitor = (await sha256hex(`${salt}|${ip}|${ua}`)).slice(0, 16);
  const width = Number(body.w) || 0;
  const device = width && width < 760 ? "mobil" : width && width < 1100 ? "tablet" : "desktop";
  const lang = clip((request.headers.get("Accept-Language") || "").split(",")[0].split("-")[0], 5);

  await env.DB.prepare(
    "INSERT INTO events (ts, day, type, path, ref, device, lang, visitor, label, value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(Date.now(), day, type, path, type === "view" ? refDomain(body.r, host) : "", device, lang, visitor, clip(body.l, 60), clip(body.v, 40)).run();

  // Gelegentlich aufräumen: Zufallswerte nach 2 Tagen, Rohdaten nach 13 Monaten löschen
  if (Math.random() < 0.02) {
    waitUntil(env.DB.batch([
      env.DB.prepare("DELETE FROM salts WHERE day < ?").bind(berlinDay(new Date(Date.now() - 2 * 864e5))),
      env.DB.prepare("DELETE FROM events WHERE ts < ?").bind(Date.now() - 400 * 864e5),
      env.DB.prepare("DELETE FROM login_attempts WHERE ts < ?").bind(Date.now() - 864e5),
    ]));
  }
  return ok;
}
