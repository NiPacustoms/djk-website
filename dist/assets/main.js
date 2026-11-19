(function () {
  // Anonyme Statistik (nur auf der echten Website, ohne Cookies, respektiert "Do Not Track")
  var ANALYTICS = document.documentElement.getAttribute("data-analytics") === "on" && navigator.doNotTrack !== "1" && !navigator.globalPrivacyControl;
  var track = window.djkTrack = function (type, label, value) {
    if (!ANALYTICS) return;
    var body = JSON.stringify({ t: type, p: location.pathname, r: type === "view" ? document.referrer : "", w: window.innerWidth, l: label || "", v: value == null ? "" : String(value) });
    try { if (!navigator.sendBeacon || !navigator.sendBeacon("/api/hit", new Blob([body], { type: "application/json" }))) fetch("/api/hit", { method: "POST", body: body, keepalive: true }); } catch (e) {}
  };
  track("view");
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]"); if (!a) return;
    var h = a.getAttribute("href");
    if (/\.ics$/.test(h)) track("calendar", h.split("/").pop().replace(".ics", ""));
    else if (/^tel:/.test(h)) track("contact", "Telefon");
    else if (/^mailto:/.test(h)) track("contact", "Mail " + h.slice(7).split("?")[0].split("@")[0]);
    else if (/^https?:/.test(h) && a.hostname !== location.hostname) track("outbound", a.hostname.replace(/^www\./, ""));
  });
  window.addEventListener("appinstalled", function () { track("install"); });

  // Footer: auf dem Handy eingeklappt, am Laptop offen
  var footMq = window.matchMedia ? matchMedia("(max-width: 760px)") : null;
  var setFoot = function () { var small = footMq && footMq.matches; document.querySelectorAll(".foot-col").forEach(function (d) { d.open = !small; }); };
  setFoot(); if (footMq && footMq.addEventListener) footMq.addEventListener("change", setFoot);

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
    var searchTimer;
    q.addEventListener("input", function () {
      run();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { var v = q.value.trim(); if (v.length >= 2) track("search", v.slice(0, 40), hits.length); }, 1500);
    });
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
      track("share", url.split("#")[1] || "");
      if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { done("Link kopiert"); }, function () { done(url); });
      else done(url);
    });
  });

  // Mein Team: Auswahl wird nur auf diesem Gerät gespeichert
  var FAV_KEY = "djk-myteams", STAR = '<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="var(--star-fill, none)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  var getFavs = function () { try { var a = JSON.parse(localStorage.getItem(FAV_KEY)); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  var setFavs = function (a) { try { localStorage.setItem(FAV_KEY, JSON.stringify(a)); } catch (e) {} };
  var escT = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var toastEl;
  var toast = function (msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  };
  window.djkSyncFavs = function () {
    var favs = getFavs(), ids = favs.map(function (f) { return f.id; });
    document.querySelectorAll("[data-fav]").forEach(function (b) {
      var on = ids.indexOf(b.dataset.fav) > -1;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.title = on ? "Aus „Mein Team“ entfernen" : "Als „Mein Team“ merken";
      var sp = b.querySelector("span"); if (sp && !b.classList.contains("fav-sm")) sp.textContent = on ? "Mein Team" : "Als Mein Team merken";
    });
    var tab = document.querySelector(".tabbar .tab-find");
    if (tab) {
      if (!tab.dataset.orig) tab.dataset.orig = tab.innerHTML + "|" + tab.getAttribute("href");
      if (favs.length) { tab.setAttribute("href", favs.length === 1 ? favs[0].url : "index.html#mein-team"); tab.innerHTML = STAR + "<span>Mein Team</span>"; tab.classList.add("is-fav"); }
      else { var o = tab.dataset.orig.split("|"); tab.innerHTML = o[0]; tab.setAttribute("href", o[1]); tab.classList.remove("is-fav"); }
    }
    renderMyTeam(favs);
  };
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-fav]"); if (!b) return;
    e.preventDefault();
    var favs = getFavs(), id = b.dataset.fav, i = favs.map(function (f) { return f.id; }).indexOf(id);
    if (i > -1) { favs.splice(i, 1); toast(b.dataset.favName + " ist nicht mehr dein Team."); }
    else {
      if (favs.length >= 3) favs.shift();
      favs.push({ id: id, name: b.dataset.favName, url: b.dataset.favUrl });
      toast(b.dataset.favName + " gemerkt. Die Startseite zeigt es jetzt ganz oben.");
      if (window.djkTrack) window.djkTrack("myteam", id);
    }
    setFavs(favs); window.djkSyncFavs();
  });

  // Karte(n) „Mein Team“ auf der Startseite
  var mtData = document.getElementById("myteam-data"), mtBox = document.getElementById("mt-cards"), mtSec = document.getElementById("mein-team");
  var MT = null; try { MT = mtData ? JSON.parse(mtData.textContent) : null; } catch (e) {}
  function renderMyTeam(favs) {
    if (!MT || !mtBox || !mtSec) return;
    var list = favs.filter(function (f) { return MT.teams[f.id]; });
    mtSec.hidden = !list.length;
    if (!list.length) { mtBox.innerHTML = ""; return; }
    var hero = document.querySelector(".hero");
    if (hero && mtSec.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_PRECEDING) {
      var atTop = window.scrollY < 40;
      hero.parentNode.insertBefore(mtSec, hero);
      if (atTop && !location.hash) window.scrollTo(0, 0);
    }
    var now = new Date(), p2 = function (n) { return String(n).padStart(2, "0"); };
    var nowStr = now.getFullYear() + "-" + p2(now.getMonth() + 1) + "-" + p2(now.getDate()) + "T" + p2(now.getHours()) + ":" + p2(now.getMinutes());
    var WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], WDL = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    var hm = function (m) { return Math.floor(m / 60) + ":" + p2(m % 60); };
    var rel = function (date) {
      var diff = Math.round((date - now) / 60000);
      if (diff < 60) return "in " + Math.max(1, diff) + " Min.";
      var dDay = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
      return dDay === 0 ? "heute" : dDay === 1 ? "morgen" : "in " + dDay + " Tagen";
    };
    var mins = now.getHours() * 60 + now.getMinutes();
    var html = MT.status ? '<p class="mt-status' + (MT.status.level === "warn" ? " warn" : "") + '"><b>' + escT(MT.status.title || "Hinweis") + "</b> " + escT(MT.status.text || "") + "</p>" : "";
    html += list.map(function (f) {
      var t = MT.teams[f.id];
      var g = MT.games.filter(function (x) { return x.t === f.id && x.d >= nowStr; })[0];
      var game = '<div class="mt-row"><span>Nächstes Spiel</span><b>Gerade kein Spiel angesetzt</b></div>';
      if (g) {
        var p = g.d.split(/[-T:]/).map(Number), gd = new Date(p[0], p[1] - 1, p[2], p[3], p[4]);
        game = '<div class="mt-row"><span>Nächstes Spiel <em>' + rel(gd) + '</em></span><b>' + WD[gd.getDay()] + ", " + p2(p[2]) + "." + p2(p[1]) + ". · " + p2(p[3]) + ":" + p2(p[4]) + " Uhr</b><small>" +
          (g.f ? escT(g.o) : (g.h ? "gegen " : "bei ") + escT(g.o)) + " · " + (g.h ? "Heimspiel am Katzenbusch" : "Auswärts") + (g.x ? " · " + escT(g.x) : "") + "</small></div>";
      }
      var next = null;
      for (var k = 0; k < 8 && !next; k++) {
        var day = (now.getDay() + k) % 7;
        t.sessions.filter(function (s) { return s.d === day && (k > 0 || s.e > mins); }).sort(function (a, b) { return a.s - b.s; }).slice(0, 1).forEach(function (s) { next = { s: s, k: k, live: k === 0 && s.s <= mins }; });
      }
      var train = '<div class="mt-row"><span>Nächstes Training</span><b>Zeiten auf der Teamseite</b></div>';
      if (next) {
        var when = next.live ? '<em class="live">läuft gerade</em>' : "<em>" + (next.k === 0 ? "heute" : next.k === 1 ? "morgen" : "") + "</em>";
        train = '<div class="mt-row"><span>Nächstes Training ' + when + "</span><b>" + WDL[(now.getDay() + next.k) % 7] + " · " + hm(next.s.s) + "–" + hm(next.s.e) + " Uhr</b><small>" + escT(next.s.p) + "</small></div>";
      }
      var call = t.coach ? '<a class="btn btn-red" href="tel:+49' + t.coach.phone.replace(/\D/g, "").replace(/^0/, "") + '">' + escT(t.coach.name.split(" ")[0]) + " anrufen</a>"
        : t.mail ? '<a class="btn btn-red" href="mailto:' + t.mail + '">Mail an die Abteilung</a>' : "";
      return '<article class="mt-card"><div class="mt-top"><a href="' + t.url + '"><h3>' + escT(t.name) + "</h3></a>" +
        '<button type="button" class="fav fav-sm" data-fav="' + f.id + '" data-fav-name="' + escT(t.name) + '" data-fav-url="' + t.url + '" aria-pressed="true" title="Aus „Mein Team“ entfernen">' + STAR + "<span></span></button></div>" +
        (t.stop ? '<p class="mt-stop">Zurzeit Aufnahmestopp</p>' : "") +
        '<div class="mt-rows">' + (t.gym ? "" : game) + train + (t.gym && t.lead ? '<div class="mt-row"><span>Leitung</span><b>' + escT(t.lead) + "</b></div>" : "") + "</div>" +
        '<div class="mt-actions">' + call + '<a href="' + t.url + '">Teamseite</a><a href="' + t.url + '#kalender">Kalender abonnieren</a></div></article>';
    }).join("");
    mtBox.innerHTML = html;
  }
  window.djkSyncFavs();
  setInterval(function () { renderMyTeam(getFavs()); }, 60000);

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

  // Countdown bis zum Anpfiff
  document.querySelectorAll("[data-kickoff]").forEach(function (c) {
    var el = c.querySelector(".countdown"); if (!el) return;
    var tick = function () {
      var p = c.dataset.kickoff.split(/[-T:]/).map(Number);
      var k = new Date(p[0], p[1] - 1, p[2], p[3], p[4]);
      var diff = Math.round((k - new Date()) / 60000);
      if (diff <= 0) { el.textContent = diff > -120 ? "läuft" : ""; return; }
      var d = Math.floor(diff / 1440), h = Math.floor((diff % 1440) / 60), m = diff % 60;
      el.textContent = "in " + (d ? d + (d === 1 ? " Tag " : " Tagen ") : "") + (d < 2 ? h + " Std. " : "") + (d === 0 ? m + " Min." : "");
    };
    tick(); setInterval(tick, 30000);
  });

  // Spielplan: Filter
  var plan = document.getElementById("plan-next");
  if (plan) {
    var state = { when: "next", dept: "alle", team: "", home: false };
    var lists = { next: plan, past: document.getElementById("plan-past") };
    var empty = document.getElementById("plan-empty");
    var nowStr = function () { var d = new Date(); var p = function (n) { return String(n).padStart(2, "0"); }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes()); };
    var applyPlan = function () {
      var now = nowStr(), shown = 0;
      Object.keys(lists).forEach(function (k) { lists[k].hidden = k !== state.when; });
      document.querySelectorAll(".game-day").forEach(function (day) {
        var any = 0;
        day.querySelectorAll(".match").forEach(function (m) {
          var ok = (state.dept === "alle" || m.dataset.dept === state.dept) && (!state.team || m.dataset.team === state.team) && (!state.home || m.dataset.home === "1");
          var inList = day.parentNode.id === "plan-next" ? m.dataset.date >= now : true;
          m.hidden = !(ok && inList); if (!m.hidden) any++;
        });
        day.hidden = !any;
        if (any && day.parentNode === lists[state.when]) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    document.querySelectorAll(".seg [data-when]").forEach(function (b) { b.addEventListener("click", function () { state.when = b.dataset.when; document.querySelectorAll(".seg [data-when]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); }); applyPlan(); }); });
    document.querySelectorAll(".plan-tools [data-dept]").forEach(function (b) { b.addEventListener("click", function () { state.dept = b.dataset.dept; document.querySelectorAll(".plan-tools [data-dept]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); applyPlan(); }); });
    var sel = document.getElementById("plan-team"); if (sel) sel.addEventListener("change", function () { state.team = sel.value; applyPlan(); });
    var chk = document.getElementById("plan-home"); if (chk) chk.addEventListener("change", function () { state.home = chk.checked; applyPlan(); });
    var qs = location.hash.slice(1); if (qs && sel && sel.querySelector('option[value="' + qs + '"]')) { sel.value = qs; state.team = qs; }
    applyPlan();
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
    return '<article class="result' + (girls ? " girls" : "") + '" style="--i:' + (n++) + '"><div class="result-top"><h3>' + esc(t.name) + '</h3><span class="result-k"><span class="k k-foot">Fußball</span>' + favHtml(t.id, t.name) + '</span></div>' +
      '<div class="meta"><span><b>' + yr(t) + "</b></span><span>Training " + esc(t.training) + "</span></div>" +
      "<div>Ansprechpartner: " + contact + "</div>" +
      '<div class="result-links"><a href="team-' + t.id + '.html">Teamseite mit Spielen</a><a href="team-' + t.id + '.html#kalender">Training abonnieren</a></div></article>';
  }
  function gymCard(g) {
    return '<article class="result gym" style="--i:' + (n++) + '"><div class="result-top"><h3>' + esc(g.name) + '</h3><span class="result-k"><span class="k k-gym">Turnen</span>' + favHtml(g.id, g.name) + '</span></div>' +
      '<div class="meta"><span><b>' + esc(g.ageText) + "</b></span></div>" +
      "<div>" + g.times.map(esc).join("<br>") + "</div>" +
      (D.gymStop ? '<div class="stop">Zurzeit Aufnahmestopp. Fragt nach freien Plätzen unter <a href="mailto:' + D.gymMail + '">' + D.gymMail + "</a>.</div>" : "") +
      '<div class="result-links"><a href="team-' + g.id + '.html">Zur Gruppe</a><a href="team-' + g.id + '.html#kalender">Termine abonnieren</a></div></article>';
  }
  function favHtml(id, name) { return '<button type="button" class="fav fav-sm" data-fav="' + id + '" data-fav-name="' + esc(name) + '" data-fav-url="team-' + id + '.html" aria-pressed="false" title="Als „Mein Team“ merken">' + STAR + "<span></span></button>"; }
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
    if (window.djkSyncFavs) window.djkSyncFavs();
    clearTimeout(finderTimer);
    if (finderTouched) finderTimer = setTimeout(function () { track("finder", String(y), (boys.length + girls.length) + " Fußball, " + gym.length + " Turnen"); }, 1200);
  }
  var finderTimer, finderTouched = false;
  input.addEventListener("input", function () { finderTouched = true; render(); });
  document.querySelectorAll("[data-step]").forEach(function (b) {
    b.addEventListener("click", function () { finderTouched = true; input.value = (parseInt(input.value, 10) || 2018) + parseInt(b.dataset.step, 10); render(); });
  });
  render();
})();
