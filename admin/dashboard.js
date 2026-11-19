// Statistik-Dashboard der DJK-Website. Lädt /api/stats; ohne Server werden gekennzeichnete Beispieldaten gezeigt.
(function () {
  var META = JSON.parse(document.getElementById("admin-meta").textContent);
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var nf = new Intl.NumberFormat("de-DE");
  var days = 30, demo = false, data = null;

  // ---------- Beispieldaten (nur wenn kein Server erreichbar ist) ----------
  function rnd(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }
  function demoData(n) {
    var series = [], today = new Date();
    for (var i = n - 1; i >= 0; i--) {
      var d = new Date(today); d.setDate(d.getDate() - i);
      var wd = d.getDay(), base = 42 + (wd === 0 || wd === 6 ? 30 : 0) + Math.round(rnd(i + n) * 25);
      series.push({ day: d.toISOString().slice(0, 10), visitors: base, views: Math.round(base * (2.3 + rnd(i) * 0.8)) });
    }
    var v = series.reduce(function (a, r) { return a + r.visitors; }, 0), w = series.reduce(function (a, r) { return a + r.views; }, 0);
    var pages = [["/", 0.24], ["/spielplan.html", 0.15], ["/jugend.html", 0.11], ["/team-1-herrenmannschaft.html", 0.07], ["/turnen.html", 0.06], ["/team-frauen-i.html", 0.05], ["/news.html", 0.05], ["/team-e1.html", 0.03], ["/kontakt.html", 0.03], ["/mitgliedschaft.html", 0.03]];
    var years = []; for (var y = 2023; y >= 2010; y--) years.push({ label: String(y), n: Math.round((y >= 2016 && y <= 2020 ? 18 : 6) * (0.6 + rnd(y) * 0.8)) });
    return {
      days: n, demo: true, totals: { visitors: v, views: w }, previous: { visitors: Math.round(v * 0.88), views: Math.round(w * 0.9) }, live: 3, installs: Math.round(n / 6),
      series: series,
      pages: pages.map(function (p) { return { label: p[0], n: Math.round(w * p[1]) }; }),
      refs: [{ label: "direkt", n: Math.round(v * 0.41) }, { label: "google.com", n: Math.round(v * 0.29) }, { label: "instagram.com", n: Math.round(v * 0.17) }, { label: "facebook.com", n: Math.round(v * 0.08) }, { label: "fussball.de", n: Math.round(v * 0.05) }],
      devices: [{ label: "mobil", n: Math.round(v * 0.71) }, { label: "desktop", n: Math.round(v * 0.22) }, { label: "tablet", n: Math.round(v * 0.07) }],
      finder: years,
      calendars: [{ label: "heimspiele", n: 21 }, { label: "e1", n: 14 }, { label: "spiele-1-herrenmannschaft", n: 12 }, { label: "u11", n: 9 }, { label: "g1", n: 7 }],
      searches: [{ label: "e1", n: 18 }, { label: "probetraining", n: 11 }, { label: "isselhorst", n: 7 }, { label: "vereinsheim", n: 5 }, { label: "2016", n: 4 }],
      noHits: [{ label: "a-jugend", n: 6 }, { label: "schiedsrichter", n: 3 }, { label: "trikot", n: 2 }],
      contacts: [{ label: "Telefon · /team-e1.html", n: 9 }, { label: "Mail jugend · /jugend.html", n: 7 }, { label: "Mail turner · /turnen.html", n: 4 }],
      myteams: [{ label: "e2", n: 11 }, { label: "f1", n: 9 }, { label: "eltern-kind", n: 7 }, { label: "u11", n: 6 }, { label: "frauen-i", n: 4 }],
      outbound: [{ label: "fussball.de", n: 64 }, { label: "instagram.com", n: 22 }, { label: "openstreetmap.org", n: 9 }],
    };
  }

  // ---------- Beschriftungen ----------
  var pageName = function (p) { var k = p.replace(/^\//, "").replace(/\/$/, "") || "index.html"; return META.pages[k] || META.pages[k + ".html"] || p; };
  var calName = function (id) { return id === "heimspiele" ? "Alle Heimspiele" : id.indexOf("spiele-") === 0 ? "Spiele " + (META.teams[id.slice(7)] || id.slice(7)) : "Training " + (META.teams[id] || id); };

  // ---------- Kennzahlen ----------
  function kpis(d) {
    var t = d.totals, p = d.previous || {};
    var change = function (a, b) { if (!b) return ""; var c = Math.round((a - b) / b * 100); return '<span class="delta ' + (c >= 0 ? "up" : "down") + '">' + (c >= 0 ? "+" : "−") + Math.abs(c) + " % zum Vorzeitraum</span>"; };
    var per = t.visitors ? (t.views / t.visitors).toFixed(1).replace(".", ",") : "0";
    $("#kpis").innerHTML =
      '<div class="kpi"><span>Besucher</span><b>' + nf.format(t.visitors) + "</b>" + change(t.visitors, p.visitors) + "</div>" +
      '<div class="kpi"><span>Seitenaufrufe</span><b>' + nf.format(t.views) + "</b>" + change(t.views, p.views) + "</div>" +
      '<div class="kpi"><span>Seiten pro Besuch</span><b>' + per + "</b></div>" +
      '<div class="kpi live"><span>Gerade auf der Seite</span><b>' + nf.format(d.live || 0) + '</b><span class="hint">letzte 5 Minuten</span></div>' +
      '<div class="kpi"><span>Als App installiert</span><b>' + nf.format(d.installs || 0) + "</b></div>";
  }

  // ---------- Verlauf (Linien, eine Achse) ----------
  function lineChart(rows) {
    var box = $("#trend"), W = box.clientWidth || 800, H = 280, m = { t: 16, r: 92, b: 28, l: 44 };
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var max = Math.max.apply(null, rows.map(function (r) { return r.views; }).concat([4]));
    var step = Math.pow(10, Math.floor(Math.log10(max))); var nice = Math.ceil(max / step) * step; if (nice / step > 5 && step >= 10) nice = Math.ceil(max / (step / 2)) * (step / 2);
    var x = function (i) { return m.l + (rows.length < 2 ? iw / 2 : i * iw / (rows.length - 1)); };
    var y = function (v) { return m.t + ih - v / nice * ih; };
    var path = function (k) { return rows.map(function (r, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(r[k]).toFixed(1); }).join(" "); };
    var ticks = [0, 0.25, 0.5, 0.75, 1].map(function (f) { return Math.round(nice * f); });
    var every = Math.ceil(rows.length / 7);
    var dLabel = function (d) { return d.slice(8, 10) + "." + d.slice(5, 7) + "."; };
    var last = rows[rows.length - 1] || { views: 0, visitors: 0 };
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" height="' + H + '" role="img" aria-label="Besucher und Seitenaufrufe pro Tag">' +
      ticks.map(function (t) { return '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(t) + '" y2="' + y(t) + '" class="grid"/><text x="' + (m.l - 8) + '" y="' + (y(t) + 4) + '" class="tick" text-anchor="end">' + nf.format(t) + "</text>"; }).join("") +
      rows.map(function (r, i) { return i % every === 0 ? '<text x="' + x(i) + '" y="' + (H - 6) + '" class="tick" text-anchor="middle">' + dLabel(r.day) + "</text>" : ""; }).join("") +
      '<path d="' + path("views") + '" class="ln views"/><path d="' + path("visitors") + '" class="ln visitors"/>' +
      '<circle cx="' + x(rows.length - 1) + '" cy="' + y(last.views) + '" r="4" class="dot views"/><circle cx="' + x(rows.length - 1) + '" cy="' + y(last.visitors) + '" r="4" class="dot visitors"/>' +
      '<text x="' + (x(rows.length - 1) + 10) + '" y="' + (y(last.views) + 4) + '" class="dl">Aufrufe</text>' +
      '<text x="' + (x(rows.length - 1) + 10) + '" y="' + (Math.max(y(last.visitors), y(last.views) + 16) + 4) + '" class="dl">Besucher</text>' +
      '<line class="cross" x1="0" x2="0" y1="' + m.t + '" y2="' + (m.t + ih) + '" hidden/>' +
      '<rect class="hit" x="' + m.l + '" y="' + m.t + '" width="' + iw + '" height="' + ih + '" fill="transparent"/></svg>';
    box.innerHTML = svg + '<div class="tip" hidden></div>';
    var hit = box.querySelector(".hit"), cross = box.querySelector(".cross"), tip = box.querySelector(".tip");
    var show = function (cx) {
      var rect = box.querySelector("svg").getBoundingClientRect(), scale = W / rect.width;
      var px = (cx - rect.left) * scale; var i = Math.round((px - m.l) / (iw / Math.max(1, rows.length - 1)));
      i = Math.max(0, Math.min(rows.length - 1, i)); var r = rows[i];
      cross.setAttribute("x1", x(i)); cross.setAttribute("x2", x(i)); cross.hidden = false;
      tip.hidden = false; tip.innerHTML = "<b>" + new Date(r.day + "T12:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long" }) + '</b><span><i class="sw visitors"></i>Besucher ' + nf.format(r.visitors) + '</span><span><i class="sw views"></i>Aufrufe ' + nf.format(r.views) + "</span>";
      var left = x(i) / scale; tip.style.left = Math.min(rect.width - 170, Math.max(0, left + 12)) + "px";
    };
    hit.addEventListener("pointermove", function (e) { show(e.clientX); });
    hit.addEventListener("pointerleave", function () { cross.hidden = true; tip.hidden = true; });
    $("#trend-table").innerHTML = "<table><thead><tr><th>Tag</th><th class=num>Besucher</th><th class=num>Aufrufe</th></tr></thead><tbody>" +
      rows.slice().reverse().map(function (r) { return "<tr><td>" + dLabel(r.day) + r.day.slice(0, 4) + '</td><td class="num">' + nf.format(r.visitors) + '</td><td class="num">' + nf.format(r.views) + "</td></tr>"; }).join("") + "</tbody></table>";
  }

  // ---------- Balkenlisten ----------
  function bars(sel, rows, label, unit) {
    var el = $(sel); if (!el) return;
    if (!rows || !rows.length) { el.innerHTML = '<p class="empty">Noch keine Daten im gewählten Zeitraum.</p>'; return; }
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; }));
    el.innerHTML = '<ol class="hbars">' + rows.map(function (r) {
      var name = label ? label(r.label) : r.label;
      return '<li title="' + esc(name) + ": " + nf.format(r.n) + " " + unit + '"><span class="hb-label">' + esc(name) + '</span><span class="hb-track"><span class="hb-bar" style="width:' + Math.max(2, r.n / max * 100) + '%"></span></span><span class="hb-n">' + nf.format(r.n) + "</span></li>";
    }).join("") + "</ol>";
  }

  // ---------- Jahrgänge (Säulen) ----------
  function years(rows) {
    var el = $("#years");
    if (!rows.length) { el.innerHTML = '<p class="empty">Noch keine Suchen im Teamfinder.</p>'; return; }
    rows = rows.slice().sort(function (a, b) { return +a.label - +b.label; });
    var max = Math.max.apply(null, rows.map(function (r) { return r.n; }));
    el.innerHTML = '<div class="vbars" style="--n:' + rows.length + '">' + rows.map(function (r) {
      return '<div class="vb" title="Jahrgang ' + esc(r.label) + ": " + nf.format(r.n) + ' Suchen"><span class="vb-n">' + nf.format(r.n) + '</span><span class="vb-bar" style="height:' + Math.max(3, r.n / max * 100) + '%"></span><span class="vb-y">' + esc(r.label) + "</span></div>";
    }).join("") + "</div>";
  }

  // Tage ohne Aufrufe mit 0 auffüllen, damit der Verlauf lückenlos ist
  function fillDays(d) {
    var map = {}; (d.series || []).forEach(function (r) { map[r.day] = r; });
    var out = [], today = new Date();
    for (var i = d.days - 1; i >= 0; i--) {
      var x = new Date(today); x.setDate(x.getDate() - i);
      var k = x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
      out.push(map[k] || { day: k, views: 0, visitors: 0 });
    }
    d.series = out; return d;
  }

  function render(d) {
    d = fillDays(d);
    data = d;
    $("#demo-note").hidden = !demo;
    $("#range-text").textContent = "Letzte " + d.days + " Tage" + (demo ? " (Beispieldaten)" : "");
    kpis(d);
    lineChart(d.series);
    bars("#pages", d.pages, pageName, "Aufrufe");
    bars("#refs", d.refs, null, "Besucher");
    bars("#devices", d.devices, function (l) { return { mobil: "Handy", desktop: "Computer", tablet: "Tablet" }[l] || l; }, "Besucher");
    years(d.finder || []);
    bars("#calendars", d.calendars, calName, "Downloads");
    bars("#searches", d.searches, null, "Suchen");
    bars("#nohits", d.noHits, null, "Suchen");
    bars("#contacts", d.contacts, function (l) { var p = l.split(" · "); return p[0] + " auf " + pageName(p[1] || ""); }, "Klicks");
    bars("#outbound", d.outbound, null, "Klicks");
    bars("#myteams", d.myteams, function (id) { return META.teams[id] || id; }, "Mal gemerkt");
    $("#csv").href = "/api/stats?days=" + d.days + "&format=csv";
    $("#csv").hidden = demo;
  }

  function load() {
    $("#range-text").textContent = "Lädt …";
    fetch("/api/stats?days=" + days, { credentials: "same-origin", headers: { Accept: "application/json" } })
      .then(function (r) {
        if (r.status === 401) { location.href = "login.html"; throw new Error("auth"); }
        if (!r.ok || !(r.headers.get("Content-Type") || "").includes("json")) throw new Error("offline");
        return r.json();
      })
      .then(function (d) { demo = false; render(d); })
      .catch(function (e) { if (e.message === "auth") return; demo = true; render(demoData(days)); });
  }

  document.querySelectorAll("[data-days]").forEach(function (b) {
    b.addEventListener("click", function () {
      days = +b.dataset.days;
      document.querySelectorAll("[data-days]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      load();
    });
  });
  var tt = $("#toggle-table");
  if (tt) tt.addEventListener("click", function () { var t = $("#trend-table"); t.hidden = !t.hidden; tt.textContent = t.hidden ? "Als Tabelle zeigen" : "Tabelle ausblenden"; });
  var rz; window.addEventListener("resize", function () { clearTimeout(rz); rz = setTimeout(function () { if (data) lineChart(data.series); }, 150); });
  load();
  setInterval(function () { if (!demo && document.visibilityState === "visible") load(); }, 120000);
})();
