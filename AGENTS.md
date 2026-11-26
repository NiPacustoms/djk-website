# Arbeitsanleitung für KI-Werkzeuge (Claude, Codex, Cursor …)

Diese Website der DJK Spvgg Herten wird mit einem eigenen statischen Generator gebaut.

- **Aussehen:** Immer zuerst `DESIGN.md` lesen und nur deren Farben, Schriften, Abstände und Komponenten verwenden.
- **Inhalte:** liegen in `content/` (JSON, News als Markdown). Nicht in `build.mjs` hart eintragen.
- **Bauen:** `npm run build` → `dist/` (Website) und `preview/` (Vorschau).
- **Prüfen vor jeder Übergabe:** `npm test` (DESIGN.md-Prüfung, Links, Bilder, Überschriften, JS-Fehler, Handy-Layout) und `npm run test:tap` (Tippflächen ≥ 46 px) bei laufendem lokalen Server.
- **Spielplan:** `npm run matches` holt die öffentlichen Spielpläne von fussball.de. Torzahlen dort sind absichtlich verschleiert und werden nicht ausgelesen.
- **Backend:** `functions/` (Cloudflare Pages Functions, D1). Keine Cookies für Besucher, keine IP-Speicherung.
- **Sprache:** Deutsch, Ansprache „ihr/euch“. Vereinsname exakt „DJK Spvgg Herten“.
- **Grenzen:** Keine Formulare für Anmeldungen, kein WhatsApp, keine Drittanbieter-Einbindungen, keine fremden Marken-Designs.
