# DJK Spvgg Herten – Website

Vereinswebsite mit automatischem Spielplan, Teamseiten, Redaktionssystem und eigener, datenschutzfreundlicher Statistik.
Läuft kostenlos auf Cloudflare Pages.

## Was drin ist
- **Inhalte** in `content/` (JSON und Markdown), bearbeitbar über das Redaktionssystem unter `/admin/cms/`.
- **Spielplan** aller Teams, zweimal täglich automatisch von fussball.de (`scripts/fetch-matches.mjs` → `content/spiele.json`).
  Torzahlen verschleiert fussball.de absichtlich, sie werden nicht ausgelesen. Ergebnisse können im CMS unter „Ergebnisse“ nachgetragen werden.
- **Teamseiten** für alle Fußballteams und Turngruppen mit Training, Trainern, Spielen und Kalender-Abos (.ics).
- **Platzstatus**: Hinweis-Banner („Platz gesperrt“) im CMS ein- und ausschalten.
- **Admin-Bereich** `/admin/`: Login, Statistik-Dashboard, Zugang zum CMS.
- **Statistik** ohne Cookies und ohne IP-Speicherung (`functions/`), Daten in Cloudflare D1.
- **Qualitätsprüfung** (`npm test`): Links, Bilder, Überschriften, Formularbeschriftungen, JS-Fehler, Handy-Layout.

## Design und KI-Werkzeuge
- `DESIGN.md` beschreibt Farben, Schriften, Abstände, Komponenten und Regeln im Google-DESIGN.md-Format. KI-Werkzeuge bauen damit neue Seiten im DJK-Look. Geprüft mit `npm run design:lint` (Teil von `npm test`), inklusive Kontrastprüfung.
- `AGENTS.md` erklärt KI-Werkzeugen, wie das Projekt gebaut und geprüft wird.

## Lokal arbeiten
```bash
npm install
npm run matches     # Spielplan holen (optional)
npm run build       # erzeugt dist/
npm test            # prüft dist/
npm run dev         # Website mit Backend und lokaler Datenbank auf http://localhost:8788
```
Für `npm run dev` einmalig: `npx wrangler d1 execute djk-statistik --local --file=schema.sql` und eine Datei `.dev.vars` mit `ADMIN_PASSWORD_HASH=…` und `SESSION_SECRET=…` anlegen.

## Einmalige Einrichtung (ca. 30 Minuten)

### 1. GitHub
1. Repository anlegen (z. B. `NiPacustoms/djk-website`) und diesen Ordner hochladen.
2. In `admin/config.yml` unter `backend.repo` den Repository-Namen eintragen, falls er anders heißt.

### 2. Cloudflare (kostenloses Konto)
1. Pages-Projekt anlegen: `npx wrangler pages project create djk-spvgg-herten --production-branch=main`
2. Datenbank anlegen: `npx wrangler d1 create djk-statistik` und die ausgegebene `database_id` in `wrangler.toml` eintragen.
3. Tabellen anlegen: `npx wrangler d1 execute djk-statistik --remote --file=schema.sql`
4. Datenbank mit dem Pages-Projekt verbinden: Cloudflare-Dashboard → Workers & Pages → djk-spvgg-herten → Einstellungen → Bindungen → D1, Name `DB`, Datenbank `djk-statistik`.
5. Admin-Passwort festlegen:
   ```bash
   npm run admin:hash -- "EuerLangesPasswortMitMindestens12Zeichen"
   npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name=djk-spvgg-herten   # Ausgabe von oben einfügen
   npx wrangler pages secret put SESSION_SECRET --project-name=djk-spvgg-herten        # beliebige lange Zufallszeichenfolge, z. B. openssl rand -hex 32
   ```
6. Eigene Domain: Pages-Projekt → Benutzerdefinierte Domains → `www.djkspvggherten.de` hinzufügen und die angezeigten DNS-Einträge beim Domain-Anbieter setzen.

### 3. Automatische Veröffentlichung
In GitHub unter Settings → Secrets and variables → Actions hinterlegen:
- `CLOUDFLARE_API_TOKEN` (Cloudflare → Mein Profil → API-Token → Vorlage „Cloudflare Pages bearbeiten“)
- `CLOUDFLARE_ACCOUNT_ID` (steht im Cloudflare-Dashboard rechts)

Danach baut und veröffentlicht `.github/workflows/website.yml` die Seite bei jeder Änderung und zweimal täglich mit neuem Spielplan.

### 4. Redaktionssystem (CMS)
`/admin/cms/` öffnen und „Mit Token anmelden“ wählen. Dafür in GitHub einen Fine-grained Personal Access Token mit Zugriff auf das Repository (Contents: Read and write) erstellen.
Jede gespeicherte Änderung landet als Commit im Repository und ist nach etwa zwei Minuten live.
Für mehrere Redakteure ohne eigene Tokens kann später ein GitHub-Login über einen kostenlosen Cloudflare Worker (`sveltia-cms-auth`) ergänzt werden.

## Vor dem Livegang prüfen
- Datenschutzerklärung: Hosting-Anbieter eintragen (gelb markierte Stelle; bei Cloudflare: Cloudflare, Inc., mit Auftragsverarbeitungsvertrag im Dashboard).
- Zuordnung der fussball.de-Teams in `content/jugend.json` (Feld `fd`) einmal kontrollieren, vor allem E1–E3.
- Weiterleitungen alter Adressen stehen in `dist/_redirects`.

## Ordner
| Ordner/Datei | Inhalt |
|---|---|
| `content/` | alle Inhalte (CMS) |
| `content/uploads/` | Bilder aus dem CMS, werden beim Bauen automatisch verkleinert |
| `assets/` | Bilder, Schriften, PDFs, Icons |
| `build.mjs`, `data.mjs`, `admin.mjs` | Generator |
| `style.css`, `main.js` | Design und Funktionen der Website |
| `admin/` | Statistik-Dashboard und CMS-Konfiguration |
| `functions/` | Backend: Statistik, Login (Cloudflare Pages Functions) |
| `scripts/` | Spielplan-Abruf, Passwort-Hash |
| `tests/` | Qualitätsprüfung |
