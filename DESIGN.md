---
version: alpha
name: DJK-Spvgg-Herten
description: |
  Vereinsseite eines Amateur-Sportvereins aus Herten (Fußball und Turnen, seit 1907). Grüne Vereins-Kopfzeile mit dem Streifen Rot, Grün, Weiß, darunter ruhige, helle Seiten mit großen echten Vereinsfotos. Schmale, kräftige Archivo-Überschriften wie auf einer Anzeigetafel, gut lesbare Figtree-Texte. Rot ist Handlungsfarbe, Grün ist Vereinsfarbe und Fläche, Blau gehört der Turnabteilung, Gold markiert „Mein Team“. Für Eltern am Spielfeldrand gebaut: schnell, groß antippbar, ohne Schnickschnack.

colors:
  primary: "#c3132f"
  on-primary: "#ffffff"
  club-green: "#0d4a2c"
  club-green-deep: "#08311d"
  on-green: "#f2f7f3"
  on-green-muted: "#b9cfc0"
  stripe-green: "#1d7a4b"
  stripe-white: "#ffffff"
  paper: "#f5f7f3"
  surface: "#ffffff"
  ink: "#13211a"
  muted: "#4c5c53"
  line: "#d5ddd6"
  chip: "#e5eee7"
  accent: "#17663f"
  gym: "#1f5fa8"
  gym-soft: "#e3edf9"
  star: "#e8a400"
  live: "#19a463"
  notice: "#fff4d6"
  on-notice: "#5a4100"
  chart-1: "#1a8a50"
  chart-2: "#2563b8"
  dark-paper: "#0b1510"
  dark-surface: "#12211a"
  dark-ink: "#e6eee8"
  dark-accent: "#6fcf9a"

typography:
  display-hero:
    fontFamily: Archivo
    fontSize: 102px
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: -0.005em
    fontVariation: "'wdth' 72"
  display-lg:
    fontFamily: Archivo
    fontSize: 86px
    fontWeight: 800
    lineHeight: 1.02
    fontVariation: "'wdth' 78"
  heading-lg:
    fontFamily: Archivo
    fontSize: 54px
    fontWeight: 800
    lineHeight: 1.02
    fontVariation: "'wdth' 78"
  heading-md:
    fontFamily: Archivo
    fontSize: 35px
    fontWeight: 800
    lineHeight: 1.05
    fontVariation: "'wdth' 78"
  heading-sm:
    fontFamily: Archivo
    fontSize: 21px
    fontWeight: 760
    lineHeight: 1.15
    fontVariation: "'wdth' 88"
  team-name:
    fontFamily: Archivo
    fontSize: 26px
    fontWeight: 800
    lineHeight: 1.05
    fontVariation: "'wdth' 75"
  score-number:
    fontFamily: Archivo
    fontSize: 20px
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "'tnum' 1"
    fontVariation: "'wdth' 80"
  body-md:
    fontFamily: Figtree
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
  body-strong:
    fontFamily: Figtree
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.6
  caption:
    fontFamily: Figtree
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
  label-chip:
    fontFamily: Figtree
    fontSize: 13px
    fontWeight: 800
    lineHeight: 1.3

rounded:
  none: 0px
  sm: 4px
  md: 6px
  lg: 10px
  full: 999px

spacing:
  xs: 4px
  sm: 8px
  ms: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  section: 88px
  section-mobile: 48px
  gutter: 32px
  gutter-mobile: 16px
  tap: 46px
  content-max: 1184px

components:
  site-header:
    backgroundColor: "{colors.club-green}"
    textColor: "{colors.on-green}"
    height: 68px
  club-stripe:
    backgroundColor: "{colors.primary}"
    height: 12px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 13px 20px
    height: "{spacing.tap}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: 13px 20px
  button-on-green:
    backgroundColor: "{colors.club-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.md}"
  filter-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label-chip}"
    rounded: "{rounded.full}"
    height: "{spacing.tap}"
  filter-chip-active:
    backgroundColor: "{colors.club-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.full}"
  year-chip:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink}"
    typography: "{typography.score-number}"
    rounded: "{rounded.sm}"
  team-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 20px
  team-card-title:
    textColor: "{colors.ink}"
    typography: "{typography.team-name}"
  match-row:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: 12px 0
  match-meta:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
  badge-home:
    backgroundColor: "{colors.club-green}"
    textColor: "{colors.on-green}"
    typography: "{typography.label-chip}"
    rounded: "{rounded.full}"
  badge-away:
    backgroundColor: "{colors.chip}"
    textColor: "{colors.ink}"
    typography: "{typography.label-chip}"
    rounded: "{rounded.full}"
  next-match-card:
    backgroundColor: "{colors.club-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.md}"
    padding: 22px
  my-team-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 20px
  my-team-star:
    textColor: "{colors.star}"
    size: "{spacing.tap}"
  gym-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.gym}"
    rounded: "{rounded.md}"
  gym-slot:
    backgroundColor: "{colors.gym-soft}"
    textColor: "{colors.gym}"
    rounded: "{rounded.sm}"
  live-indicator:
    textColor: "{colors.live}"
  status-banner-info:
    backgroundColor: "{colors.notice}"
    textColor: "{colors.on-notice}"
  status-banner-warn:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
  tabbar:
    backgroundColor: "{colors.club-green-deep}"
    textColor: "{colors.on-green-muted}"
    height: 64px
  footer:
    backgroundColor: "{colors.club-green-deep}"
    textColor: "{colors.on-green}"
  chart-visitors:
    textColor: "{colors.chart-1}"
  chart-views:
    textColor: "{colors.chart-2}"
  hero-headline:
    textColor: "{colors.stripe-white}"
    typography: "{typography.display-hero}"
  divider:
    backgroundColor: "{colors.line}"
    height: 1px
  page-dark:
    backgroundColor: "{colors.dark-paper}"
    textColor: "{colors.dark-ink}"
  card-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-accent}"
  stripe-middle:
    backgroundColor: "{colors.stripe-green}"
    height: 4px
---

## Overview

Die Website der DJK Spvgg Herten 07 e.V. ist das digitale Vereinsheim am Katzenbusch. Sie richtet sich zuerst an Eltern, die schnell wissen wollen, wann und wo ihr Kind trainiert oder spielt. Danach kommen Mitglieder, Fans und Sponsoren. Alles folgt einer Idee: **Vereinsidentität oben, Klarheit darunter.** Die grüne Kopfzeile mit dem Streifen Rot, Grün, Weiß wirkt wie ein Trikot und erscheint auf jeder Seite. Darunter liegt eine ruhige, helle Fläche (`{colors.paper}`), auf der echte Vereinsfotos und die Inhalte wirken.

**Kennzeichen:**
- Grüne Kopfzeile (`{components.site-header}`) mit dem Streifen in fester Reihenfolge **Rot, Grün, Weiß** von oben nach unten
- Das historische Katzenbusch-Tor als Aufmacherbild der Startseite
- Schmale, kräftige Archivo-Überschriften (Breite 72–88 %) wie auf einer Anzeigetafel, Texte in Figtree
- Rot (`{colors.primary}`) nur für die wichtigste Handlung je Bildschirm: „Fußball oder Turnen finden“, „Trainer anrufen“, „Anmelden“
- Blau (`{colors.gym}`) gehört ausschließlich der Turnabteilung, Gold (`{colors.star}`) ausschließlich „Mein Team“
- Hell und dunkel gleichwertig, keine Cookies, keine Drittanbieter-Inhalte

## Colors

### Vereinsfarben
- **Vereinsrot** (`{colors.primary}` – #c3132f): Handlungsfarbe. Primärknöpfe, Streifen oben, Countdown-Marken, Fokusrahmen.
- **Vereinsgrün** (`{colors.club-green}` – #0d4a2c): Kopfzeile, grüne Bänder (Teamfinder, Spielstätte), aktive Filter, Heimspiel-Marke.
- **Tiefgrün** (`{colors.club-green-deep}` – #08311d): Footer, Tab-Leiste, Hintergrund hinter Fotos.
- **Streifengrün** (`{colors.stripe-green}` – #1d7a4b): nur der mittlere Streifen und die Juniorinnen-Kennung.

### Flächen und Text
- **Papier** (`{colors.paper}` – #f5f7f3): Seitenhintergrund, leicht grünlich statt reinweiß.
- **Fläche** (`{colors.surface}` – #ffffff): Karten, Tabellen, Menüs.
- **Tinte** (`{colors.ink}` – #13211a): Fließtext und Überschriften.
- **Gedämpft** (`{colors.muted}` – #4c5c53): Metadaten wie Wettbewerb, Datum, Rollen.
- **Linie** (`{colors.line}` – #d5ddd6) und **Chip** (`{colors.chip}` – #e5eee7): Trenner, Jahrgangs- und Themen-Marken.
- **Link** (`{colors.accent}` – #17663f): unterstrichene Textlinks.

### Bedeutungsfarben
- **Turnen** (`{colors.gym}` / `{colors.gym-soft}`): Turngruppen, Wochenplan, Turnen-Marken.
- **Mein Team** (`{colors.star}` – #e8a400): Stern, Kartenkante, Tab-Symbol. Nie für etwas anderes.
- **Läuft gerade** (`{colors.live}` – #19a463): pulsierender Punkt bei laufendem Training und in der Live-Statistik.
- **Hinweis** (`{colors.notice}` / `{colors.on-notice}`): Aufnahmestopp, Platzstatus „Hinweis“, Beispieldaten.
- **Diagramme** (`{colors.chart-1}` Grün, `{colors.chart-2}` Blau): auf Farbfehlsichtigkeit geprüft. Rot und Grün werden in Diagrammen nie gemeinsam verwendet.

### Dunkle Darstellung
Eigene Werte statt Umkehrung: `{colors.dark-paper}`, `{colors.dark-surface}`, `{colors.dark-ink}`, Links in `{colors.dark-accent}`. Kopfzeile, Footer und grüne Bänder bleiben in beiden Darstellungen grün. Alle Farben sind in `style.css` als Variablen auf `:root` definiert und werden für dunkel nur umdefiniert.

## Typography

- **Archivo** (variable Breite): alle Überschriften, Teamnamen, Zahlen, Uhrzeiten. Schmal (72–88 %), Gewicht 760–800, enger Zeilenabstand. `{typography.display-hero}` nur für die Startseiten-Überschrift.
- **Figtree**: Fließtext, Knöpfe, Formulare, Navigation. 17 px Grundgröße, Zeilenabstand 1,6, Textbreite höchstens 65 Zeichen.
- Uhrzeiten, Ergebnisse und Tabellenzahlen immer mit gleich breiten Ziffern (`tnum`).
- Überschriften im Satzbau (nicht in Großbuchstaben), mit `text-wrap: balance`.
- Schriften liegen selbst gehostet auf dem eigenen Server (keine Google-Fonts-Verbindung).

| Token | Einsatz |
|---|---|
| `{typography.display-hero}` | „Seit 1907 am Katzenbusch.“ |
| `{typography.display-lg}` | Seitentitel (h1) |
| `{typography.heading-lg}` | Abschnittstitel (h2) |
| `{typography.heading-md}` | große Kartentitel, News-Titel |
| `{typography.heading-sm}` | Kartentitel (h3) |
| `{typography.team-name}` | Teamnamen in Karten |
| `{typography.score-number}` | Uhrzeiten, Jahrgänge, Ergebnisse |
| `{typography.body-md}` | Fließtext |
| `{typography.caption}` | Metadaten, Hinweise |
| `{typography.label-chip}` | Marken wie „Heim“, „Turnen“, „Fußball“ |

## Layout

- Inhaltsbreite höchstens `{spacing.content-max}`, linksbündig, Seitenrand `{spacing.gutter}` (Handy `{spacing.gutter-mobile}`).
- **Abstandsstufen:** nur `{spacing.xs}` (4), `{spacing.sm}` (8), `{spacing.ms}` (12), `{spacing.md}` (16), `{spacing.lg}` (24), `{spacing.xl}` (32), `{spacing.2xl}` (48). Im CSS als `var(--s-xs)` bis `var(--s-2xl)`, keine freien Werte bei `gap`. Abschnitte im Abstand `{spacing.section}`, auf dem Handy `{spacing.section-mobile}`.
- Abstände zwischen Geschwistern mit `gap` in Flex oder Grid, keine Einzel-Ränder.
- Karten-Raster passen sich an (`auto-fill`/`auto-fit`), auf dem Handy eine Spalte.
- **Tippflächen** mindestens `{spacing.tap}` hoch und breit (Telefonnummern, Sterne, Filter, Abo-Menü, Footer-Links). Ganze Spielzeilen und Trainingszeilen sind über einen gestreckten Link antippbar.
- Wischbare Leisten (News, Spieltage) zeigen auf dem Handy etwa 1,2 Karten, damit erkennbar ist, dass man wischen kann.

## Elevation & Depth

Fast flach. Karten setzen sich durch eine 1-px-Linie (`{colors.line}`) und weiße Fläche ab, nicht durch Schatten. Schatten gibt es nur bei schwebenden Elementen: Suchfenster, Abo-Menü, Tooltip im Diagramm, Bestätigungs-Hinweis. Tiefe entsteht durch Fotos mit dunklem Verlauf von unten (Aufmacher, Abteilungs-Kacheln, Teamseiten-Kopf).

## Shapes

| Token | Einsatz |
|---|---|
| `{rounded.sm}` | Jahrgangs-Marke, Termin-Slots, kleine Hinweise |
| `{rounded.md}` | Standard: Knöpfe, Karten, Bilder, Eingabefelder |
| `{rounded.lg}` | Suchfenster, Login-Karte |
| `{rounded.full}` | Filter-Chips, Heim/Auswärts-Marken, Teilen-Knopf, runde Symbolknöpfe |

Die Ecke rechts oben der grünen Spielkarte trägt einen schräg angeschnittenen Streifen in Rot, Grün, Weiß (18 % Deckkraft). Das ist das einzige dekorative Element im System.

## Components

- **Kopfzeile** (`{components.site-header}`): Logo, Vereinsname mit „seit 1907 am Katzenbusch“, Navigation, roter Knopf „Probetraining“, Suche, Darstellung. Darunter immer `{components.club-stripe}`.
- **Primärknopf** (`{components.button-primary}`): höchstens einer je Bildschirmbereich.
- **Teamkarte** (`{components.team-card}`): Teamname, Jahrgangs-Marke (`{components.year-chip}`), Stern, Trainingszeit, Trainer mit antippbaren Telefonnummern, Abo-Menü, Link zur Teamseite.
- **Spielzeile** (`{components.match-row}`): Datum und Uhrzeit links, Team und Gegner Mitte, rechts Marke `{components.badge-home}` / `{components.badge-away}` oder „Ergebnis“-Link. Die ganze Zeile führt zur Teamseite.
- **Nächstes Spiel** (`{components.next-match-card}`): für 1. Herren und Frauen I auf der Startseite, mit Countdown.
- **Mein Team** (`{components.my-team-card}`): goldene Oberkante, nächstes Spiel, nächstes Training mit „läuft gerade“, Knopf „Trainer anrufen“. Steht über dem Aufmacher, sobald ein Team gemerkt ist.
- **Turnen** (`{components.gym-card}`, `{components.gym-slot}`): blaue Oberkante bzw. blaue Termin-Slots im Wochenplan.
- **Platzstatus** (`{components.status-banner-info}`, `{components.status-banner-warn}`): direkt unter der Kopfzeile, im CMS schaltbar.
- **Tab-Leiste** (`{components.tabbar}`): nur Handy. Start, Spiele, Finden bzw. Mein Team, Suche, News.
- **Footer** (`{components.footer}`): auf dem Handy einklappbar, Impressum und Datenschutz immer sichtbar.

## Do's and Don'ts

### Do
- Streifen immer in der Reihenfolge **Rot, Grün, Weiß**.
- Vereinsname exakt „DJK Spvgg Herten“ bzw. „DJK Spvgg Herten 07 e.V.“, Platz „Kampfbahn Katzenbusch“.
- Echte Vereinsfotos verwenden. Fotos von Kindern nur mit Einverständnis.
- Telefonnummern, Uhrzeiten und Adressen immer als echte, antippbare Links (`tel:`, Kalender-Abo, Karte).
- Jede neue Farbe zuerst als Token hier eintragen, dann in `style.css` als Variable für hell und dunkel.
- Bewegung nur mit Ruhezustand sichtbar und bei „reduzierte Bewegung“ abschalten.
- Vor jeder Veröffentlichung `npm test` (Links, Bilder, Überschriften, Tippflächen, DESIGN.md-Prüfung).

### Don't
- Kein fremdes Marken-Design übernehmen, keine Stockfotos, keine Emojis als Gestaltungselement.
- Rot nicht als Flächenfarbe für Inhalte, Blau nicht außerhalb der Turnabteilung, Gold nicht außerhalb von „Mein Team“.
- Keine Torzahlen von fussball.de auslesen (dort absichtlich verschleiert). Ergebnisse nur aus dem CMS oder der DFBnet-Automation.
- Keine Formulare für Anmeldungen, kein WhatsApp. Kontakt über Telefon und Mail.
- Keine Cookies, kein Tracking von Drittanbietern, keine eingebetteten Karten oder Videos.
- Keine Tippfläche kleiner als `{spacing.tap}`.
- Keine Großbuchstaben-Überschriften, keine nummerierten Marker (01/02/03), wenn es keine echte Reihenfolge ist.
