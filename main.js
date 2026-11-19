(function () {
  // Mobiles Menü
  var btn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Schließen" : "Menü";
    });
  }

  // Hell / Dunkel / automatisch
  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme-btn");
  var THEMES = [null, "light", "dark"], LABEL = { null: "automatisch", light: "hell", dark: "dunkel" };
  function setThemeLabel() {
    if (!themeBtn) return;
    var cur = root.getAttribute("data-theme");
    themeBtn.setAttribute("aria-label", "Darstellung: " + LABEL[cur] + ". Klicken zum Wechseln");
    themeBtn.dataset.mode = cur || "auto";
  }
  if (themeBtn) {
    setThemeLabel();
    themeBtn.addEventListener("click", function () {
      var cur = root.getAttribute("data-theme");
      var next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
      if (next) root.setAttribute("data-theme", next); else root.removeAttribute("data-theme");
      try { next ? localStorage.setItem("djk-theme", next) : localStorage.removeItem("djk-theme"); } catch (e) {}
      setThemeLabel();
    });
  }

  // Suche
  var dlg = document.getElementById("search");
  var q = document.getElementById("search-q");
  var list = document.getElementById("search-results");
  var sdata = document.getElementById("search-data");
  if (dlg && q && list && sdata) {
    var IDX = JSON.parse(sdata.textContent);
    var sel = 0, hits = [];
    var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
    var escH = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var openSearch = function () {
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
      q.select(); run();
    };
    var run = function () {
      var terms = norm(q.value.trim()).split(/\s+/).filter(Boolean);
      if (!terms.length) { hits = IDX.filter(function (x) { return x.g === "Team"; }).slice(0, 8); }
      else {
        hits = IDX.filter(function (x) { return terms.every(function (t) { return x.k.indexOf(t) > -1; }); })
          .map(function (x) { var t = norm(x.t); return [x, (t.indexOf(terms[0]) === 0 ? 0 : t.indexOf(terms[0]) > -1 ? 1 : 2) + (x.g === "Team" ? 0 : 0.5)]; })
          .sort(function (a, b) { return a[1] - b[1]; }).map(function (a) { return a[0]; }).slice(0, 12);
      }
      sel = 0;
      list.innerHTML = hits.length ? hits.map(function (x, i) {
        return '<li role="option" id="sr-' + i + '" aria-selected="' + (i === sel) + '"><a href="' + x.u + '"><span class="sr-g">' + x.g + '</span><b>' + escH(x.t) + '</b><small>' + escH(x.s) + "</small></a></li>";
      }).join("") : '<li class="sr-empty">Nichts gefunden. Versucht es mit einem Teamnamen, Jahrgang oder Nachnamen.</li>';
      q.setAttribute("aria-activedescendant", hits.length ? "sr-0" : "");
    };
    var move = function (d) {
      if (!hits.length) return;
      sel = (sel + d + hits.length) % hits.length;
      list.querySelectorAll("[role=option]").forEach(function (li, i) { li.setAttribute("aria-selected", i === sel ? "true" : "false"); });
      var cur = document.getElementById("sr-" + sel); if (cur) cur.scrollIntoView({ block: "nearest" });
      q.setAttribute("aria-activedescendant", "sr-" + sel);
    };
    q.addEventListener("input", run);
    q.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter" && hits[sel]) { e.preventDefault(); dlg.close(); location.href = hits[sel].u; }
    });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    document.querySelectorAll(".search-open").forEach(function (b) { b.addEventListener("click", openSearch); });
    document.addEventListener("keydown", function (e) {
      var typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || "");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) { e.preventDefault(); openSearch(); }
    });
  }

  // Beiträge teilen
  document.querySelectorAll(".share").forEach(function (b) {
    b.addEventListener("click", function () {
      var url = b.dataset.url, title = b.dataset.title;
      var done = function (t) { b.textContent = t; setTimeout(function () { b.textContent = "Beitrag teilen"; }, 2200); };
      if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { done("Link kopiert"); }, function () { done(url); });
      else done(url);
    });
  });

  // News-Filter
  var filters = document.querySelector(".filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var t = b.dataset.tag;
      document.querySelectorAll(".article").forEach(function (a) { a.hidden = t !== "Alle" && a.dataset.tag !== t; });
    });
  }

  // Hochzählende Kennzahlen im Aufmacher
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseInt(el.dataset.count, 10); if (!(target > 0) || target > 500) return;
    var t0 = null, dur = 900 + target * 25;
    el.textContent = "0";
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    });
  });

  // News-Slider
  var slider = document.getElementById("news-slider");
  document.querySelectorAll(".slide-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      if (!slider) return;
      var card = slider.querySelector(".slide"); var w = card ? card.getBoundingClientRect().width + 16 : 300;
      slider.scrollBy({ left: w * parseInt(b.dataset.dir, 10), behavior: reduce ? "auto" : "smooth" });
    });
  });

  // Heute im Verein: Trainings des gewählten Tages mit Live-Status
  var todayEl = document.getElementById("today-list");
  var todayData = document.getElementById("today-data");
  if (todayEl && todayData) {
    var S = JSON.parse(todayData.textContent);
    var DAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    var tabs = document.querySelectorAll(".day-tabs button");
    var clock = document.getElementById("today-clock");
    var hm = function (m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); };
    var now = new Date(), today = now.getDay();
    var shown = today >= 1 && today <= 5 ? today : 1;
    var drawToday = function () {
      now = new Date();
      var mins = now.getHours() * 60 + now.getMinutes();
      var isToday = shown === now.getDay();
      tabs.forEach(function (t) { t.setAttribute("aria-selected", +t.dataset.day === shown ? "true" : "false"); t.classList.toggle("is-today", +t.dataset.day === now.getDay()); });
      var running = 0;
      var list = S.filter(function (x) { return x.d === shown; }).sort(function (a, b) { return a.s - b.s || a.n.localeCompare(b.n); });
      todayEl.innerHTML = list.map(function (x, i) {
        var st = "", label = "";
        if (isToday) {
          if (mins >= x.s && mins < x.e) { st = "live"; label = "Läuft gerade, noch " + (x.e - mins) + " Min."; running++; }
          else if (mins < x.s && x.s - mins <= 90) { st = "soon"; label = "Beginnt in " + (x.s - mins) + " Min."; }
          else if (mins >= x.e) { st = "done"; label = "Vorbei"; }
        }
        return '<li class="' + st + '" style="--i:' + i + '"><span class="t tnum">' + hm(x.s) + "–" + hm(x.e) + '</span><a href="' + x.u + '">' + x.n + '</a><span class="k k-' + (x.k === "Turnen" ? "gym" : "foot") + '">' + x.k + '</span><span class="p">' + x.p + "</span>" + (label ? '<span class="st">' + label + "</span>" : "") + "</li>";
      }).join("") || '<li class="done"><span>Heute kein Training.</span></li>';
      if (clock) clock.textContent = isToday
        ? (running ? running + (running === 1 ? " Gruppe trainiert" : " Gruppen trainieren") + " gerade, " + DAYS[shown] + " " + hm(mins) + " Uhr" : DAYS[shown] + ", " + list.length + " Trainingseinheiten")
        : DAYS[shown] + ", " + list.length + " Trainingseinheiten";
    };
    tabs.forEach(function (t) { t.addEventListener("click", function () { shown = +t.dataset.day; drawToday(); }); });
    drawToday();
    setInterval(drawToday, 60000);
  }

  // News: Filter per Adresse (#turnen)
  var hashTag = decodeURIComponent((location.hash || "").slice(1));
  if (filters && hashTag) {
    var hb = Array.prototype.filter.call(filters.querySelectorAll("button"), function (b) { return b.dataset.tag.toLowerCase() === hashTag.toLowerCase(); })[0];
    if (hb) hb.click();
  }

  // Finder: Fußball und Turnen
  var input = document.getElementById("jahrgang");
  var out = document.getElementById("finder-results");
  var dataEl = document.getElementById("teams-data");
  if (!input || !out || !dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  var base = out.dataset.base || "jugend.html";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function tel(p) { return "tel:+49" + p.replace(/\D/g, "").replace(/^0/, ""); }
  function yr(t) { return t.years[0] === t.years[1] ? "Jahrgang " + t.years[0] : "Jahrgang " + t.years[0] + "–" + t.years[1]; }
  var n = 0;
  function card(t, girls) {
    var c = t.coaches.filter(function (x) { return x[1]; })[0] || t.coaches[0];
    var contact = c[1] ? esc(c[0]) + ', <a class="tel" href="' + tel(c[1]) + '">' + esc(c[1]) + "</a>" : esc(c[0]);
    return '<article class="result' + (girls ? " girls" : "") + '" style="--i:' + (n++) + '"><div class="result-top"><h3>' + esc(t.name) + '</h3><span class="k k-foot">Fußball</span></div>' +
      '<div class="meta"><span><b>' + yr(t) + "</b></span><span>Training " + esc(t.training) + "</span></div>" +
      "<div>Ansprechpartner: " + contact + "</div>" +
      '<div class="result-links"><a href="' + base + "#" + t.id + '">Alle Trainer und Infos</a><a href="' + t.cal + '">In den Kalender</a></div></article>';
  }
  function gymCard(g) {
    return '<article class="result gym" style="--i:' + (n++) + '"><div class="result-top"><h3>' + esc(g.name) + '</h3><span class="k k-gym">Turnen</span></div>' +
      '<div class="meta"><span><b>' + esc(g.ageText) + "</b></span></div>" +
      "<div>" + g.times.map(esc).join("<br>") + "</div>" +
      (D.gymStop ? '<div class="stop">Zurzeit Aufnahmestopp. Fragt nach freien Plätzen unter <a href="mailto:' + D.gymMail + '">' + D.gymMail + "</a>.</div>" : "") +
      '<div class="result-links"><a href="turnen.html#' + g.id + '">Zur Gruppe</a><a href="assets/kalender/' + g.id + '.ics">In den Kalender</a></div></article>';
  }
  function note(html) { return '<div class="result-note" style="--i:' + (n++) + '">' + html + "</div>"; }

  function render() {
    n = 0;
    var y = parseInt(input.value, 10);
    if (!y || y < 1900 || y > 2100) { out.innerHTML = note("Gebt ein Geburtsjahr ein, zum Beispiel 2018."); return; }
    var age = new Date().getFullYear() - y;
    var boys = D.boys.filter(function (t) { return y >= t.years[0] && y <= t.years[1]; });
    var girls = D.girls.filter(function (t) { return y >= t.years[0] && y <= t.years[1]; });
    var gym = D.gym.filter(function (g) { return age >= Math.floor(g.ages[0]) && age <= g.ages[1]; });
    var html = "";
    boys.forEach(function (t) { html += card(t, false); });
    girls.forEach(function (t) { html += card(t, true); });
    gym.forEach(function (g) { html += gymCard(g); });
    if (y > D.maxYear && age >= 0) html += note("Fußball geht bei uns mit Jahrgang " + D.maxYear + " los. Schreibt an " + '<a href="mailto:' + D.mail + '">' + D.mail + "</a>, dann melden wir uns, sobald es für Jahrgang " + y + " losgeht.");
    else if (y < D.minYear) html += note("Unsere Fußballjugend geht bis zur B-Jugend. Danach geht es bei den <a href=\"" + D.links.damen + "\">Katzenbuschladies</a> oder den <a href=\"" + D.links.herren + "\">Herren</a> weiter.");
    else if (!boys.length) html += note("Für Jahrgang " + y + " ist bei den Junioren gerade kein Team gelistet. Schreibt an " + '<a href="mailto:' + D.mail + '">' + D.mail + "</a>, wir finden eine Lösung.");
    if (!html) html = note("Für dieses Alter haben wir gerade kein passendes Angebot. Schreibt uns trotzdem gern.");
    out.innerHTML = html;
  }
  input.addEventListener("input", render);
  document.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () { input.value = (parseInt(input.value, 10) || 2018) + parseInt(b.dataset.step, 10); render(); });
  });
  render();
})();
