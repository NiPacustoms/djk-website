// Admin-Bereich: Einstieg, Login, Statistik-Dashboard und CMS. Wird von build.mjs aufgerufen.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);

export function writeAdmin(out, mode, { CSS, pages, teams, esc }) {
  const dir = path.join(out, "admin");
  fs.mkdirSync(path.join(dir, "cms"), { recursive: true });
  const style = mode === "preview" ? `<style>${CSS}</style>` : `<link rel="stylesheet" href="../assets/site.css">`;
  const fonts = mode === "preview"
    ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Figtree:wght@400..800&display=swap">` : "";
  const doc = (title, body, extra = "") => `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} – DJK Admin</title>
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
<script>try{var t=localStorage.getItem("djk-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
${fonts}
${style}
</head>
<body class="admin">
<header class="site-head admin-head">
  <div class="wrap">
    <a class="brand" href="index.html"><img src="../assets/icon-512.png" width="40" height="40" alt=""><span>DJK Admin<small>Website-Verwaltung</small></span></a>
    <nav class="admin-nav" aria-label="Admin"><a href="statistik.html">Statistik</a><a href="cms/">Inhalte</a><a href="../index.html">Zur Website</a><a href="/api/logout">Abmelden</a></nav>
  </div>
  <span class="stripe" aria-hidden="true"></span>
</header>
<main id="main">
${body}
</main>
${extra}
</body>
</html>
`;

  // Einstieg
  fs.writeFileSync(path.join(dir, "index.html"), doc("Übersicht", `<section class="wrap section">
  <h1>Website-Verwaltung</h1>
  <p class="lead" style="margin-top:.8rem;color:var(--muted)">Alles für die Pflege der Vereinswebsite an einem Ort.</p>
  <div class="admin-tiles">
    <a class="admin-tile" href="statistik.html"><h2>Statistik</h2><p>Besucher, beliebte Seiten, Herkunft, Nachfrage nach Jahrgängen, Suchbegriffe und Kalender-Abos.</p></a>
    <a class="admin-tile" href="cms/"><h2>Inhalte bearbeiten</h2><p>News, Teams, Trainer, Trainingszeiten, Termine, Sponsoren und den Platzstatus pflegen.</p></a>
    <a class="admin-tile" href="cms/#/collections/einstellungen/entries/status"><h2>Platzstatus setzen</h2><p>„Platz gesperrt“ oder „Training fällt aus“ als Hinweis oben auf jeder Seite.</p></a>
    <a class="admin-tile" href="../spielplan.html"><h2>Spielplan prüfen</h2><p>Wird zweimal täglich automatisch von fussball.de aktualisiert.</p></a>
  </div>
</section>`));

  // Login
  fs.writeFileSync(path.join(dir, "login.html"), doc("Anmelden", `<section class="wrap section login-wrap">
  <form class="login" method="post" action="/api/login">
    <h1>Anmelden</h1>
    <p id="login-msg" class="login-msg" role="alert" hidden></p>
    <label for="passwort">Passwort</label>
    <input id="passwort" name="passwort" type="password" autocomplete="current-password" required minlength="12">
    <button class="btn btn-red" type="submit">Anmelden</button>
    <p class="crumb">Nur für die Website-Verwaltung des Vereins. Die Anmeldung gilt 12 Stunden.</p>
  </form>
</section>`, `<script>
(function(){var p=new URLSearchParams(location.search),m=document.getElementById("login-msg"),t={passwort:"Das Passwort stimmt nicht. Bitte noch einmal versuchen.",gesperrt:"Zu viele Versuche. Bitte in 15 Minuten erneut versuchen.",einrichtung:"Der Login ist noch nicht eingerichtet: ADMIN_PASSWORD_HASH und SESSION_SECRET fehlen in Cloudflare."};
var k=p.get("fehler");if(k&&t[k]){m.textContent=t[k];m.hidden=false}if(p.get("abgemeldet")){m.textContent="Du bist abgemeldet.";m.hidden=false;m.classList.add("ok")}})();
</script>`));

  // Statistik
  const meta = { pages: Object.fromEntries(pages.map((p) => [p.file, p.home ? "Startseite" : p.title])), teams };
  const js = fs.readFileSync(path.join(ROOT, "admin/dashboard.js"), "utf8");
  fs.writeFileSync(path.join(dir, "statistik.html"), doc("Statistik", `<section class="wrap section dash">
  <div class="dash-head">
    <div><h1>Statistik</h1><p id="range-text" class="crumb">Lädt …</p></div>
    <div class="dash-tools">
      <div class="seg" role="group" aria-label="Zeitraum">${[7, 30, 90, 365].map((d) => `<button type="button" data-days="${d}" aria-pressed="${d === 30}">${d === 365 ? "1 Jahr" : d + " Tage"}</button>`).join("")}</div>
      <a id="csv" class="btn btn-ghost" href="#" hidden>CSV herunterladen</a>
    </div>
  </div>
  <p id="demo-note" class="note" hidden>Beispieldaten zur Ansicht. Die echte Statistik erscheint hier, sobald die Website auf Cloudflare läuft und die Datenbank verbunden ist.</p>
  <div id="kpis" class="kpis"></div>
  <div class="panel wide">
    <div class="panel-head"><h2>Besucher und Seitenaufrufe pro Tag</h2><button type="button" id="toggle-table" class="link-btn">Als Tabelle zeigen</button></div>
    <div id="trend" class="trend"></div>
    <div id="trend-table" class="table-wrap" hidden></div>
  </div>
  <div class="panels">
    <div class="panel"><h2>Beliebteste Seiten</h2><div id="pages"></div></div>
    <div class="panel"><h2>Woher die Besucher kommen</h2><div id="refs"></div></div>
    <div class="panel"><h2>Geräte</h2><div id="devices"></div></div>
    <div class="panel wide"><h2>Nachfrage nach Jahrgängen</h2><p class="crumb">Geburtsjahre, die Eltern im Teamfinder eingegeben haben. Zeigt, wo neue Kinder dazukommen wollen.</p><div id="years"></div></div>
    <div class="panel"><h2>Suchbegriffe</h2><div id="searches"></div></div>
    <div class="panel"><h2>Suchen ohne Treffer</h2><p class="crumb">Hinweis auf fehlende Inhalte.</p><div id="nohits"></div></div>
    <div class="panel"><h2>Kalender-Abos</h2><div id="calendars"></div></div>
    <div class="panel"><h2>Als „Mein Team“ gemerkt</h2><p class="crumb">Wie oft Besucher ein Team mit dem Stern gespeichert haben.</p><div id="myteams"></div></div>
    <div class="panel"><h2>Kontaktaufnahmen</h2><div id="contacts"></div></div>
    <div class="panel"><h2>Klicks auf andere Websites</h2><div id="outbound"></div></div>
  </div>
  <p class="crumb" style="margin-top:2rem">Gezählt wird ohne Cookies und ohne Speicherung von IP-Adressen. Besucher mit „Do Not Track“ werden nicht erfasst.</p>
</section>
<script type="application/json" id="admin-meta">${JSON.stringify(meta).replace(/</g, "\\u003c")}</script>`, `<script>${js}</script>`));

  // CMS (Sveltia, Git-basiert)
  fs.writeFileSync(path.join(dir, "cms/index.html"), `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Inhalte bearbeiten – DJK Admin</title>
<link href="config.yml" type="application/yaml" rel="cms-config-url"></head>
<body><script src="https://unpkg.com/@sveltia/cms@0.256.1/dist/sveltia-cms.js"></script></body>
</html>
`);
  fs.copyFileSync(path.join(ROOT, "admin/config.yml"), path.join(dir, "cms/config.yml"));
}
