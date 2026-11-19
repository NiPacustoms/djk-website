// Offline-Unterstützung: Seiten zuerst aus dem Netz, Dateien zuerst aus dem Cache.
const C = "djk-v1795088661705";
const PRE = ["./","index.html","jugend.html","damen.html","senioren.html","turnen.html","verein.html","mitgliedschaft.html","vereinsheim.html","kinderschutz.html","news.html","fanshop.html","sponsoren.html","kontakt.html","impressum.html","datenschutz.html","spielplan.html","team-g2.html","team-g1.html","team-f2.html","team-f1.html","team-e3.html","team-e2.html","team-e1.html","team-d1.html","team-c2.html","team-c1.html","team-b.html","team-u9.html","team-u11.html","team-u13.html","team-u15.html","team-frauen-i.html","team-frauen-ii.html","team-frauen-iii.html","team-1-herrenmannschaft.html","team-2-herrenmannschaft.html","team-alte-herren-ue32.html","team-alte-herren-ue50.html","team-gehfussballer-ue50.html","team-eltern-kind.html","team-kindergarten.html","team-grundschule.html","team-wettkampf.html","termine.html","faq.html","404.html","assets/site.css","assets/main.js","assets/icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(PRE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  if (r.mode === "navigate") { e.respondWith(fetch(r).then((res) => { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); return res; }).catch(() => caches.match(r).then((m) => m || caches.match("index.html")))); return; }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })));
});
