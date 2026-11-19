// Admin-Login: Passwort prüfen, signiertes Sitzungs-Cookie setzen. Max. 5 Versuche pro 15 Minuten und Anschluss.
import { verifyPassword, createSession, sessionCookie, sha256hex, SESSION_HOURS } from "../_lib.js";

const back = (url, params) => {
  const u = new URL("/admin/login.html", url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return Response.redirect(u.toString(), 303);
};

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) return back(request.url, { fehler: "einrichtung" });
  const ipKey = (await sha256hex("login|" + (request.headers.get("CF-Connecting-IP") || ""))).slice(0, 16);
  const since = Date.now() - 15 * 60 * 1000;
  if (env.DB) {
    const row = await env.DB.prepare("SELECT COUNT(*) AS n FROM login_attempts WHERE ip = ? AND ts > ?").bind(ipKey, since).first();
    if (row && row.n >= 5) return back(request.url, { fehler: "gesperrt" });
  }
  const form = await request.formData();
  const ok = await verifyPassword(String(form.get("passwort") || ""), env.ADMIN_PASSWORD_HASH);
  if (!ok) {
    if (env.DB) await env.DB.prepare("INSERT INTO login_attempts (ip, ts) VALUES (?, ?)").bind(ipKey, Date.now()).run();
    return back(request.url, { fehler: "passwort" });
  }
  const res = new Response(null, { status: 303, headers: { Location: "/admin/statistik.html" } });
  res.headers.append("Set-Cookie", sessionCookie(await createSession(env), SESSION_HOURS * 3600));
  return res;
}
