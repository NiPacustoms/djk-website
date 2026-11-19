# DJK Spvgg Herten – Website

Statische Website ohne Datenbank, ohne Cookies, ohne externe Dienste.

## Inhalte ändern
1. `data.mjs` bearbeiten (Teams, Trainer, Vorstände, News, Produkte, Sponsoren).
2. `node build.mjs` ausführen (Node 18+).
3. Den Ordner `dist/` hochladen. Fertig.

Neue Bilder als .webp nach `assets/img/` legen und Breite/Höhe in `sizes.json` eintragen.

## Hosting
`dist/` läuft auf jedem Webspace. Mitgeliefert:
- `_redirects` für Netlify / Cloudflare Pages (leitet alle alten Wix-Adressen um)
- `.htaccess` für Apache-Webspace (gleiche Weiterleitungen)
- `sitemap.xml`, `robots.txt`

## Vor dem Livegang
- Datenschutz: Hosting-Anbieter eintragen (markierte Stelle in build.mjs, Abschnitt Datenschutz).
- Ergebnis-Link: fussball.de-Vereinsseite in `data.mjs` → `club.results` eintragen.
- Fanshop läuft jetzt per Mail-Bestellung statt Online-Kasse (keine AGB/Widerruf mehr nötig).
