// Schützt Statistik-Dashboard und Statistik-API. Nur angemeldete Admins kommen durch.
import { isAdmin, json } from "./_lib.js";

const PROTECTED_PAGES = [/^\/admin\/statistik(\.html)?\/?$/, /^\/admin\/?$/, /^\/admin\/index\.html$/];

export async function onRequest(context) {
  const { request, env, next } = context;
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/api/stats")) {
    if (!(await isAdmin(request, env))) return json({ error: "Nicht angemeldet" }, { status: 401 });
  } else if (PROTECTED_PAGES.some((r) => r.test(pathname))) {
    if (!(await isAdmin(request, env))) return Response.redirect(new URL("/admin/login.html", request.url).toString(), 302);
  }
  const res = await next();
  if (pathname.startsWith("/admin")) {
    const r = new Response(res.body, res);
    r.headers.set("Cache-Control", "no-store");
    r.headers.set("X-Robots-Tag", "noindex, nofollow");
    return r;
  }
  return res;
}
