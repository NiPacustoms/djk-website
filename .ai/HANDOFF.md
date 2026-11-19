# DJK Spvgg Herten – Website: Zielarchitektur „modernste Amateur-Vereinsseite“

Stand heute: eigener statischer Generator (`build.mjs` + `data.mjs` + `style.css` + `main.js`), Ausgabe `dist/` (Produktion) und `preview/` (Vorschau). Alle Inhalte, Design und Funktionen sind fertig und gelten als Referenz. Sie dürfen bei der Migration nicht verloren gehen.

## Ziele
1. **Astro 5** (statisch, `output: 'static'`) statt Eigenbau. Inhalte als **Content Collections** (JSON/Markdown) statt `data.mjs`.
2. **Sveltia CMS** unter `/admin` (Git-basiert, kostenlos), damit Vorstand und Trainer Inhalte ohne Code pflegen.
3. **Spielbetrieb-Modul**: Spielpläne aller Teams automatisch von fussball.de (öffentliche Daten), Startseiten-Modul „Nächste Spiele / Letzte Spiele“, Heimspiele am Katzenbusch, eigene Spielplan-Seite, Spiele pro Team.
4. **Team-Seiten**: eine Seite pro Mannschaft/Turngruppe.
5. **Platzstatus / Trainingsausfall** als im CMS pflegbarer Hinweis-Banner.
6. **Qualität**: Playwright-Tests, axe-Barrierefreiheit, Lighthouse-Budget, Linkcheck, GitHub Actions (Build, Tests, Datenaktualisierung, Deploy).
7. Kostenlos betreibbar (Cloudflare Pages oder GitHub Pages), keine Cookies, keine Drittanbieter-Einbindungen.

## Feste Entscheidungen
- Sprache Deutsch, Du/Ihr-Ansprache wie bisher. Design (Tokens, Schriften Archivo + Figtree, Farben, Layout) 1:1 übernehmen.
- Vereinsname exakt „DJK Spvgg Herten“ / „DJK Spvgg Herten 07 e.V.“, Platz „Kampfbahn Katzenbusch“, Vereinsfarben-Streifen immer Rot, Grün, Weiß.
- Keine Formulare, kein WhatsApp. Kontakt über Mail/Telefon.
- **Ergebnisse von fussball.de**: fussball.de verschleiert Torzahlen per Schrift-Obfuskation. Das wird **nicht** entschlüsselt oder umgangen. `score` bleibt `null`, es wird „Ergebnis auf fussball.de“ verlinkt. Ergebnisse können optional manuell/über CMS oder später über die DFBnet-Automation des Vereins in `src/data/ergebnisse.json` nachgetragen werden (Schlüssel = fussball.de-Spiel-ID).
- Datenabruf: höflich (max. 1 Anfrage/Sekunde, eigener User-Agent mit Kontakt `info@djkspvggherten.de`), 2× täglich per GitHub Action, Ergebnis wird als JSON committet. Fällt der Abruf aus, bleibt der letzte Stand stehen.

## fussball.de
- Verein: `00ES8GN8QS00005PVV0AG08LVUPGND5I`
- Endpunkte (HTML-Fragmente): `https://www.fussball.de/ajax.team.next.games/-/mode/PAGE/team-id/<ID>` und `.../ajax.team.prev.games/-/mode/PAGE/team-id/<ID>`; vereinsweit `ajax.club.next.games/-/id/<VEREIN>/mode/PAGE`, `ajax.club.prev.games/...`. Beispiel-Antworten: `.ai/samples/next.html`, `.ai/samples/prev.html`.
- Zuordnung unsere Team-ID → fussball.de team-id:
  - g1 01DTTGIQP0000000VV0AG811VTA8FO8N · g2 02GSSG9B5O000000VS5489B2VVGDJV1G
  - f1 011MIDFOMK000000VTVG0001VTR8C1K7 · f2 027MARR3AC000000VS5489B2VSOPA3SJ
  - e1 011MICSFPS000000VTVG0001VTR8C1K7 · e2 02BBGIML30000000VS5489B2VVDBHQQ7 · e3 02RTDQFJAO000000VS5489B2VUMH0DRF · (E4 02TL425KSO000000VS5489BSVSKABKDB, auf der Website noch nicht gelistet)
  - d1 02EV3TDT3O000000VS5489B1VT0RKM5V · (D2 02M6696OOK000000VS5489B2VUHJA7LU, noch nicht gelistet)
  - c1 02PNTF93IC000000VS5489B2VT4FEOV2 · c2 02ROSFJKAG000000VS5489B1VVTMGKD4 · b 02VJ83SDI8000000VS5489BSVSKQNNOC
  - u9 (F-Juniorinnen) 02PVSC93K4000000VS5489B1VTF0A3SN · u11 (E-Juniorinnen) 02O7HBSHVG000000VS5489B2VU92J92M · u13 (D-Juniorinnen) 02PVSA03SK000000VS5489B1VTF0A3SN · u15 (C-Juniorinnen) 02TL40RILK000000VS5489BSVSKABKDB
  - Frauen I 011MIBLQC8000000VTVG0001VTR8C1K7 (Landesliga Staffel 2) · Frauen II 02T6GQ5D04000000VS5489BSVTHE6UUT (Bezirksliga Staffel 5) · Frauen III 0319G6M39S000000VS5489BRVVNAT1LG (Kreisliga A HER/GE/RE)
  - Herren 1 011MI9HS44000000VTVG0001VTR8C1K7 (Kreisliga B Staffel 2) · Herren 2 02BMJEMP20000000VS5489B1VT2I63QP (Kreisliga C Staffel 2)
  - Ü32 01A1HP2H44000000VV0AG811VSDJU768 · Ü50 (SG mit Spvgg Erkenschwick) 02GUQL9L4K000000VS5489B1VUD17SPI
- Korrektur gegenüber alten Texten: Die 1. Herren spielt aktuell **Kreisliga B** (nicht A).

## Seitenstruktur (Ziel)
`/` Start · `/verein/` · `/jugend/` · `/damen/` · `/senioren/` · `/turnen/` · `/teams/<id>/` (alle Fußballteams + Turngruppen) · `/spielplan/` · `/news/` + `/news/<slug>/` · `/termine/` · `/fanshop/` · `/sponsoren/` · `/kontakt/` · `/mitgliedschaft/` · `/vereinsheim/` · `/kinderschutz/` · `/faq/` · `/impressum/` · `/datenschutz/` · `/404` · `/admin/` (CMS)
Alte `.html`-Adressen und alte Wix-Adressen per `_redirects` weiterleiten.

## Admin-Bereich mit Statistik (eigene Lösung, kein Google Analytics)
- Hosting-Ziel deshalb: **Cloudflare Pages** (kostenlos) mit **Pages Functions** und **D1** (kostenlose SQLite-Datenbank). GitHub Pages bleibt nur als Fallback ohne Statistik.
- **Erfassung (first-party, ohne Cookies, ohne Einwilligungsbanner):** winziges Skript sendet per `navigator.sendBeacon` an `/api/hit` (gleiche Domain): Pfad, Referrer-Domain, Gerätetyp (mobil/desktop aus Viewport-Breite), Sprache, Zeit. **Keine IP-Speicherung, keine Cookies, kein localStorage-Tracking.** Eindeutige Besucher nur als Tages-Hash aus IP + User-Agent + täglich wechselndem Salt (Salt in D1, wird täglich ersetzt, alte Salts gelöscht). Bots per User-Agent filtern. `Do Not Track` / `Sec-GPC` respektieren (dann nichts erfassen).
- **Vereinsspezifische Ereignisse** (genauso anonym): Teamfinder-Suche (Geburtsjahr, Treffer Fußball/Turnen), Klick auf Kalender-Download (welches Team), Klick auf Telefon/Mail-Link (welche Abteilung, keine Nummer), Suchbegriffe der Schnellsuche (auf 40 Zeichen gekürzt), Klick auf fussball.de-Links, Installation als App.
- **Dashboard `/admin/statistik/`** (eigene Seite im Vereinsdesign): Besucher und Seitenaufrufe (heute, 7 Tage, 30 Tage, Verlauf als Diagramm), Top-Seiten, Top-Team-Seiten, Herkunft (Referrer: Google, Instagram, Facebook, direkt …), Geräte, **Nachfrage nach Jahrgängen** aus dem Teamfinder (Balkendiagramm Geburtsjahr), beliebteste Kalender, Top-Suchbegriffe und Suchen ohne Treffer, Live-Zähler „gerade auf der Seite“ (letzte 5 Minuten). Zeitraumwahl, CSV-Export.
- **Zugang:** Login-Seite `/admin/login/`, Passwort-Hash (PBKDF2/Web Crypto) als Cloudflare-Secret `ADMIN_PASSWORD_HASH`, Session als signiertes, HttpOnly-, Secure-, SameSite=Strict-Cookie (technisch notwendig, nur für Admins), 12 h gültig, Rate-Limit auf Login-Versuche. Middleware schützt `/admin/statistik/*` und `/api/stats/*`. Skript `npm run admin:hash` erzeugt den Hash. Optional zusätzlich Cloudflare Access davorschalten (Doku).
- Aufbewahrung: Rohereignisse 13 Monate, danach nur Tagesaggregate. Cron-Trigger oder Bereinigung beim Schreiben.
- Ohne Backend (Vorschau/lokal) zeigt das Dashboard deutlich gekennzeichnete **Beispieldaten**.
- Datenschutzerklärung entsprechend ergänzen (Reichweitenmessung, Art. 6 Abs. 1 lit. f DSGVO, § 25 Abs. 2 TDDDG: kein Zugriff auf Endgerät, daher keine Einwilligung nötig; keine IP-Speicherung; Löschfristen).
- `/admin/` wird Einstiegsseite: Kacheln „Statistik“ und „Inhalte bearbeiten (CMS)“.

## Log
- (Codex trägt hier knapp ein, was erledigt ist und was offen bleibt.)
