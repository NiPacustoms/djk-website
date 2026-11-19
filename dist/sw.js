// Offline-Unterstützung: Seiten zuerst aus dem Netz, Dateien zuerst aus dem Cache.
const C = "djk-v1795089231826";
const PRE = ["./","index.html","jugend.html","damen.html","senioren.html","turnen.html","verein.html","mitgliedschaft.html","vereinsheim.html","kinderschutz.html","news.html","fanshop.html","sponsoren.html","kontakt.html","impressum.html","datenschutz.html","spielplan.html","termine.html","faq.html","404.html","assets/site.css","assets/main.js","assets/icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const u = new URL(r.url); if (u.pathname.startsWith("/api/") || u.pathname.startsWith("/admin")) return;
  if (r.mode === "navigate") { e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res; }).catch(() => caches.match(r).then((m) => m || caches.match("index.html")))); return; }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })));
});
