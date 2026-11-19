// Alle Inhalte der Website an einer Stelle. Änderungen hier → `node build.mjs` → fertig.

export const club = {
  name: "DJK Spvgg Herten 07 e.V.",
  short: "DJK Spvgg Herten",
  founded: "1907",
  colors: "rot-grün-weiß",
  ground: "Kampfbahn Katzenbusch",
  address: ["Sportanlage Katzenbusch", "Katzenbuschstr. 1–3", "45699 Herten"],
  post: ["Postfach 1936", "45677 Herten"],
  mail: {
    info: "info@djkspvggherten.de",
    gv: "gv@djkspvggherten.de",
    jugend: "jugend@djkspvggherten.de",
    turner: "turner@djkspvggherten.de",
    fanshop: "fanshop@djkspvggherten.de",
  },
  register: "Amtsgericht Recklinghausen, VR 2157",
  tax: "359/5731/3012",
  represented: "Norbert van Gemmern (1. Vorsitzender)",
  maps: "https://www.openstreetmap.org/search?query=Katzenbuschstra%C3%9Fe%201%2C%2045699%20Herten",
  results: "https://www.fussball.de/suche/-/text/DJK%20Spvgg%20Herten",
  social: [
    { label: "Instagram Jugend", handle: "@djkjugend", url: "https://www.instagram.com/djkjugend" },
    { label: "Instagram Katzenbuschladies", handle: "@katzenbuschladies", url: "https://www.instagram.com/katzenbuschladies" },
    { label: "Facebook Verein", handle: "djkspvggherten1907ev", url: "https://www.facebook.com/djkspvggherten1907ev" },
    { label: "Facebook Katzenbuschladies", handle: "katzenbuschladies", url: "https://www.facebook.com/katzenbuschladies" },
    { label: "Facebook Turnabteilung", handle: "Turnabteilung", url: "https://www.facebook.com/profile.php?id=100064556265727" },
  ],
};

export const board = [
  { role: "1. Vorsitzender", names: ["Norbert van Gemmern"] },
  { role: "2. Vorsitzender", names: ["Frank Franiczek"] },
  { role: "Geschäftsführung", names: ["Yvonne Kemke", "Manuel Becker"] },
  { role: "Kassiererin", names: ["Nadine Karrasch"] },
  { role: "Beisitzer", names: ["Markus Jahn", "Dominik Karrasch"] },
];

export const departments = [
  { id: "jugend", title: "Jugend", text: "Junioren und Juniorinnen von den Bambini bis zur B-Jugend.", href: "jugend.html", img: "t_e3" },
  { id: "damen", title: "Katzenbuschladies", text: "Drei Frauenteams, die erste spielt Landesliga.", href: "damen.html", img: "d_2" },
  { id: "senioren", title: "Herren & Alte Herren", text: "Zwei Herrenteams, Ü32, Ü50 und Gehfußball.", href: "senioren.html", img: "h_1" },
  { id: "turnen", title: "Turnen", text: "Eltern-Kind-Turnen ab 1½ Jahren, Kinderturnen und eine Wettkampfgruppe im Gerätturnen.", href: "turnen.html", img: "tu_g1" },
];

// Jahrgänge: years = [von, bis] Geburtsjahr
export const youthTeams = [
  { id: "g2", name: "G2-Jugend", label: "Bambini", years: [2021, 2021], img: null,
    coaches: [["Nicklas Karrasch"], ["Fynn Kampmann"], ["Julian Wessel"]],
    extra: [["Betreuerin", "Nadine Karrasch", "0152 08872011"]],
    training: "Fr 17:00–18:00" },
  { id: "g1", name: "G1-Jugend", label: "Bambini", years: [2020, 2020], img: "t_g1",
    coaches: [["Sebastian Szymanek", "0160 97971538"], ["Patrick Schleu", "0151 24198161"]],
    training: "Mi + Fr 17:00–18:30" },
  { id: "f2", name: "F2-Jugend", years: [2019, 2019], img: null,
    coaches: [["Thorsten Gringel", "0170 9601008"], ["Christos Argiriu", "0178 1590748"], ["Marvin Rothe", "01573 4297050"]],
    training: "Mi + Fr 17:00–18:30" },
  { id: "f1", name: "F1-Jugend", years: [2018, 2018], img: null,
    coaches: [["Detlef Gerigk", "01573 3105346"], ["Christian Bernhardt", "0174 9965738"], ["Kemal Maden"], ["Oktay Güngor"], ["Ferat"]],
    training: "Mi + Fr 17:00–18:30" },
  { id: "e3", name: "E3-Jugend", years: [2017, 2017], img: "t_e3",
    coaches: [["Christian Zak", "0179 5722427"], ["Melanie Hemmerich", "0152 24878865"], ["Patrick Schmidt", "0157 72605924"], ["Pascal Scheer", "0176 64980662"]],
    training: "Mo + Do 17:15–18:45" },
  { id: "e2", name: "E2-Jugend", years: [2016, 2016], img: null,
    coaches: [["Marcel Lange", "0177 2761291"], ["Manuel Zachau", "0173 1599992"]],
    training: "Di + Do 17:15–18:45" },
  { id: "e1", name: "E1-Jugend", years: [2016, 2016], img: "t_e1",
    coaches: [["Marc Isselhorst", "0157 73197145"], ["Daniel Maaß", "01573 1306965"], ["Daniel Brama", "0157 30651854"], ["Michel Ritterswürden"], ["Jana Isselhorst"]],
    training: "Di + Do 17:15–18:45" },
  { id: "d1", name: "D1-Jugend", years: [2015, 2015], img: null,
    coaches: [["Dirk Kuberski", "0175 4817892"], ["Moussa Abdalla", "0172 9688391"], ["Rebecca Isselhorst"], ["Marcel Isselhorst", "0157 87441991"]],
    training: "Di + Do 17:15–18:45" },
  { id: "c2", name: "C2-Jugend", years: [2013, 2013], img: "t_c2",
    coaches: [["Nadine Karrasch", "0152 08872011"], ["Mike Jeschmund", "0176 22714657"], ["Mohamed Abdalla", "0160 1890117"], ["Justin Karrasch", "0157 37757017"]],
    training: "Mo, Mi + Fr 17:00–18:30" },
  { id: "c1", name: "C1-Jugend", years: [2012, 2012], img: "t_c1",
    coaches: [["Marc Sukowski", "0179 6049451"], ["Barto Raniewicz", "0172 5324778"], ["Lakshan Fernando"]],
    training: "Mo, Di + Do 17:30–19:00" },
  { id: "b", name: "B-Jugend", years: [2010, 2011], img: null,
    coaches: [["Dominik Karrasch", "0152 08871936"], ["Ben Sandrock"], ["Loel Mau"], ["Vasilios Ragkos"]],
    training: "Mo, Mi + Fr 17:30–19:00" },
];

export const girlsTeams = [
  { id: "u9", name: "U9-Juniorinnen", label: "F-Jugend", years: [2018, 2019], img: "t_u9",
    coaches: [["Raphael Wloka", "0177 3222955"], ["Michelle Grochala", "0176 15195663"], ["Pascal Scheer", "0176 64980662"]],
    training: "Di + Fr 17:15–18:45" },
  { id: "u11", name: "U11-Juniorinnen", label: "E-Jugend", years: [2016, 2017], img: "t_u11",
    coaches: [["Jessy Dubielzek", "0176 46082208"], ["Chiara Bacher", "0176 23931368"], ["Maren Kampmann"], ["Nadine Karrasch", "0152 08872011"]],
    training: "Di + Fr 17:15–18:45" },
  { id: "u13", name: "U13-Juniorinnen", label: "D-Jugend", years: [2014, 2015], img: "t_u13",
    coaches: [["Sebastian Berg", "0173 7021295"], ["Muhamed Ismailovski", "0157 55750746"], ["Sascha Bacher", "01573 8215854"]],
    training: "Di + Fr 17:15–18:45" },
  { id: "u15", name: "U15-Juniorinnen", label: "C-Jugend", years: [2012, 2013], img: null,
    coaches: [["Marcel Isselhorst", "0157 87441991"], ["Lena Tekce", "0176 22599682"], ["Tufan Kethüda"], ["Kay Thiele"], ["Jana Isselhorst"]],
    training: "Di + Fr 17:15–18:45" },
];

export const youthBoard = [
  { role: "Jugendleiter", names: ["Christian Zak"], phone: "0179 5722427", mail: "zak@djkspvggherten.de" },
  { role: "Stellv. Jugendleiter", names: ["Achilleas Bettas"] },
  { role: "Jugendgeschäftsführerin", names: ["Yvonne Kemke"], mail: "jugend@djkspvggherten.de" },
  { role: "Kassiererin", names: ["Nadine Karrasch"] },
  { role: "Stellv. Kassiererin", names: ["Jennifer Maaß"] },
  { role: "Sportliche Leitung", names: ["Marc Isselhorst", "Marcel Isselhorst", "Marcel Lange", "Marc Sukowski", "Lena Tekce", "Jessy Dubielzek"] },
  { role: "Beisitzerin Sponsoring", names: ["Melanie Hemmerich"] },
];

export const youthSponsors = [
  { name: "Paulberger Limo", img: "paulberger",
    text: "Paulberger Limo hat der Jugendabteilung 550 Dosen gespendet. Wir verkaufen sie bei unseren Veranstaltungen, und der gesamte Erlös fließt direkt in die Förderung unserer Kinder und Jugendlichen." },
  { name: "Elektro Abdalla", img: null,
    text: "Elektro Abdalla unterstützt uns seit Jahren: mit Trikots für unsere Mannschaften, vielen Sachspenden und tatkräftiger Hilfe bei Arbeiten rund um den Verein. Der Inhaber engagiert sich darüber hinaus selbst als Jugendtrainer." },
];

export const ladies = {
  board: [
    { role: "Abteilungsleiter", names: ["Thorsten Hohoff"], phone: "0176 23489289" },
    { role: "Stellv. Abteilungsleiterin", names: ["Manuela Schönfeld"] },
    { role: "Geschäftsführer", names: ["Rick Dembowski"], phone: "01575 1292412", mail: "rick.dembowski@djkspvggherten.de" },
    { role: "Kassiererin", names: ["Katharina Engsterhold"] },
    { role: "Stellv. Kassiererin", names: ["Lena Marquardt"] },
    { role: "Kassenprüferinnen", names: ["Leni Möller", "Marie Burghave"] },
  ],
  teams: [
    { name: "Frauen I", league: "Landesliga 2", img: "d_1",
      coaches: [["Markus Schubert", "0163 4625554", "Trainer"], ["Detlef Kastner", null, "Co-Trainer"], ["Marie Burghave", null, "Betreuerin"], ["Lisa Szulc", null, "Betreuerin"], ["Timo Kulak", null, "Torwarttraining"]],
      training: "Mo + Mi 19:00–21:00" },
    { name: "Frauen II", league: "Bezirksliga Staffel 5", img: "d_2",
      coaches: [["Rick Dembowski", "01575 1292412", "Trainer"], ["Timo Kulak", null, "Torwarttraining"]],
      training: "Mi + Fr 19:00–20:30" },
    { name: "Frauen III", league: "Kreisliga A HER/GE/RE", img: null,
      coaches: [["Thomas Krause", "0172 8014451", "Trainer"], ["Alina Krause", null, "Co-Trainerin"], ["Timo Kulak", null, "Torwarttraining"]],
      training: "Mi + Fr 19:00–20:30" },
  ],
  milestones: [
    ["2004", "Gründung der Frauenmannschaft"],
    ["2014/15", "Aufstieg in die Bezirksliga – ungeschlagen, 28 Siege aus 28 Spielen"],
    ["2018", "Hallen-Kreismeisterinnen"],
    ["2021/22", "Bezirksliga-Meisterschaft mit 20 Siegen, einem Remis und einer Niederlage, Aufstieg in die Landesliga"],
    ["2022/23", "Debütsaison in der Landesliga auf Platz 5"],
    ["2025/26", "Start einer dritten Mannschaft in der Kreisliga"],
  ],
};

export const seniors = [
  { group: "Herren", lead: [["Abteilungsleiter Herren 1 + 2", "Thorsten Gringel", "0170 9601008", "thorsten.gringel@djkspvggherten.de"]],
    teams: [
      { name: "1. Herrenmannschaft", img: "h_1", coaches: [["Andre Marcussen", "01520 6353535"], ["Karl Englich", "0176 72907632"]], training: "Mi + Fr 19:00–20:30" },
      { name: "2. Herrenmannschaft", img: "h_2", coaches: [["Murat Engin", "0176 80825892"]], training: "Di + Do 19:00–20:30" },
    ] },
  { group: "Alte Herren", lead: [],
    teams: [
      { name: "Alte Herren Ü32", img: null, coaches: [["Michael Bärwolf", "0152 26165685"]], training: "Mi 18:30–20:30" },
      { name: "Alte Herren Ü50", img: "h_u50", coaches: [["Michael Bärwolf", "0152 26165685"]], training: "Mo 18:30–20:30" },
    ] },
  { group: "Gehfußball", lead: [["Abteilungsleiter", "Frank Franiczek", null, "f.franiczek@djkspvggherten.de"], ["Stellv. Abteilungsleiter", "Peter Walberg"], ["Kassierer", "Dietmar Primus"]],
    teams: [
      { name: "Gehfußballer Ü50", img: "h_geh",
        coaches: [["Helmut Chilla", null, "Trainer"], ["Andre Tietz", null, "Ansprechpartner", "Tietz-Recklinghausen@t-online.de"], ["Manfred Demuth", null, "Ansprechpartner", "ma-demuht@t-online.de"]],
        training: "Mo 17:00–18:30" },
    ] },
];

export const gym = {
  team: [
    { name: "Stefanie Szarzynski", role: "Abteilungsleitung, Übungsleitung Kindergarten- und Grundschulturnen", img: "tu_stef" },
    { name: "Joana van den Bosch", role: "Stellv. Abteilungsleitung, Leitung Wettkampfgruppe", img: "tu_joana" },
    { name: "Kathrin Mikloweit", role: "Jugendwartin, Leitung Eltern-Kind-Gruppe", img: "tu_kath" },
    { name: "Marie Szarzynski", role: "Öffentlichkeitsarbeit, Übungsleitung Kinder- und Eltern-Kind-Turnen", img: "tu_marie" },
    { name: "Yaseen Ben Mechri", role: "Gruppenhelfer Kindergarten- und Grundschulturnen", img: "tu_yaseen" },
    { name: "Pia Szarzynski", role: "Gruppenhelferin Kindergarten- und Grundschulturnen", img: "tu_pia" },
  ],
  // Gruppen: ages = Alter in Jahren [von, bis], sessions = [Tag, von, bis, Halle-ID, Schwerpunkt]
  groups: [
    { id: "eltern-kind", name: "Eltern-Kind-Turnen", ages: [1.5, 4], ageText: "1½ bis 4 Jahre, mit Mama, Papa oder einer anderen Begleitperson",
      text: "Klettern, balancieren, rollen und toben: Die Kleinsten entdecken mit ihren Eltern die Turnhalle.",
      lead: "Kathrin Mikloweit", img: "tu_g3",
      sessions: [["Mi", "16:00", "17:30", "waldschule"], ["Fr", "16:00", "17:30", "augustaschule"]] },
    { id: "kindergarten", name: "Kindergartenturnen", ages: [3, 6], ageText: "Kinder im Kindergartenalter",
      text: "Breitensport mit viel Spaß und Spiel. Bewegungslandschaften, Fangspiele und erste Turnelemente.",
      lead: "Stefanie Szarzynski", img: "tu_g2",
      sessions: [["Mo", "16:00", "17:00", "augustaschule"]] },
    { id: "grundschule", name: "Grundschulturnen", ages: [6, 10], ageText: "Kinder im Grundschulalter",
      text: "Breitensport mit Spaß und Spiel, dazu Geräte wie Bock, Reck und Balken.",
      lead: "Stefanie Szarzynski", img: "tu_g4",
      sessions: [["Mo", "17:15", "18:30", "augustaschule"]] },
    { id: "wettkampf", name: "Wettkampfgruppe", ages: [7, 18], ageText: "Schulkinder und Jugendliche im Gerätturnen",
      text: "Training an Sprung, Reck, Schwebebalken und Boden, dazu Ausdauer und Kraft. Die Gruppe startet bei Stadt- und Bezirksmeisterschaften.",
      lead: "Joana van den Bosch", img: "tu_g1",
      sessions: [["Di", "17:00", "18:30", "augustaschule", "Ausdauer und Krafttraining"], ["Do", "17:15", "19:15", "augustaschule", "Gerätturnen"]] },
  ],
  halls: {
    augustaschule: { name: "Turnhalle der Augustaschule", area: "Herten-Süd", map: "https://www.openstreetmap.org/search?query=Augustaschule%20Herten" },
    waldschule: { name: "Turnhalle der Waldschule", area: "Herten-Langenbochum", map: "https://www.openstreetmap.org/search?query=Waldschule%20Herten" },
  },
  schedule: [
    ["Montag", "16:00–17:00", "Kindergartenturnen", "Breitensport, Spaß und Spiel", "Augustaschule, Herten-Süd"],
    ["Montag", "17:15–18:30", "Grundschulturnen", "Breitensport, Spaß und Spiel", "Augustaschule, Herten-Süd"],
    ["Dienstag", "17:00–18:30", "Wettkampfgruppe", "Ausdauer und Krafttraining", "Augustaschule, Herten-Süd"],
    ["Mittwoch", "16:00–17:30", "Eltern-Kind-Turnen", "Kinder von 1½ bis 4 Jahren", "Waldschule, Herten-Langenbochum"],
    ["Donnerstag", "17:15–19:15", "Wettkampfgruppe", "Gerätturnen", "Augustaschule, Herten-Süd"],
    ["Freitag", "16:00–17:30", "Eltern-Kind-Turnen", "Kinder von 1½ bis 4 Jahren", "Augustaschule, Herten-Süd"],
  ],
  stop: true,
  results2023: [
    ["Lia Michelle Schuler", "2009", "45,6", "2."],
    ["Mira Wiegand", "2010", "45,3", "3."],
    ["Soi Sakellariou", "2010", "53,6", "2."],
    ["Luise Jurick", "2011", "49,9", "3."],
    ["Alina Tschirne", "2012", "50,0", "9."],
    ["Estella Kiefer", "2014", "48,8", "2."],
  ],
  gallery: ["tu_g1", "tu_g2", "tu_g3", "tu_g4", "tu_g5", "tu_g6"],
};

export const fees = [
  { group: "Fußballjugend", rows: [["1. Kind", "10,00 €", "60,00 €", "120,00 €"], ["2. Kind", "7,00 €", "42,00 €", "84,00 €"], ["Passiv", "7,00 €", "42,00 €", "84,00 €"]], fee: "10,00 €" },
  { group: "Senioren / Seniorinnen", rows: [["Aktive", "10,00 €", "60,00 €", "120,00 €"], ["Passiv", "7,00 €", "42,00 €", "84,00 €"]], fee: "10,00 €" },
  { group: "Alte Herren / Gehfußball", rows: [["Aktive", "10,00 €", "60,00 €", "120,00 €"], ["Passiv", "7,00 €", "42,00 €", "84,00 €"]], fee: "10,00 €" },
  { group: "Kinderturnen", rows: [["1. Kind", "8,00 €", "48,00 €", "96,00 €"], ["2. Kind", "4,00 €", "24,00 €", "48,00 €"], ["Jedes weitere Kind", "2,00 €", "12,00 €", "24,00 €"]], fee: "5,00 € pro Person" },
  { group: "Wettkampfturnen", rows: [["1. Kind", "11,50 €", "69,00 €", "138,00 €"], ["2. Kind", "7,50 €", "45,00 €", "90,00 €"], ["Jedes weitere Kind", "4,00 €", "24,00 €", "48,00 €"]], fee: "5,00 € pro Person" },
  { group: "Eltern-Kind-Turnen", rows: [["2 Erwachsene + bis zu 2 Kinder", "12,00 €", "72,00 €", "144,00 €"], ["Jedes weitere Kind", "4,00 €", "24,00 €", "48,00 €"]], fee: "5,00 € pro Person" },
];

export const history = [
  ["1907", "Gründung der DJK Rot-Weiß Herten."],
  ["1912", "Gründung des SpV Herten 12, Vorgänger der Spvgg Herten."],
  ["1926", "Gründung von Teutonia Herten-Süd."],
  ["1929 + 1932", "Der SpV wird Westfalenmeister und spielt um die Westdeutsche Meisterschaft."],
  ["1933", "Aufnahme in die neu gegründete Gauliga Westfalen. 1934/35 und 1936/37 jeweils Platz vier, dreimal Remis gegen das „unschlagbare“ Schalke 04."],
  ["1947", "Fusion mit Concordia Herten zur Spvgg Herten 07/12."],
  ["1949", "Qualifikation für die II. Division. 1954/55 fehlt als Vierter nur ein Punkt zur Oberliga."],
  ["1963", "Platz drei in der II. Division und Qualifikation für die neue Regionalliga West."],
  ["1964", "Abstieg am letzten Spieltag durch einen Handelfmeter in der Schlussminute beim VfB Bottrop."],
  ["1971", "Die DJK Rot-Weiß Herten und Teutonia Herten-Süd fusionieren zur DJK 07/26 Herten."],
  ["1981", "Die Spvgg wird nach dem Wiederaufstieg Dritter der Landesliga."],
  ["2000", "Am 1. Juli fusionieren Spvgg Herten und DJK 07/26 zur DJK Spvgg Herten 07. Der neue Verein übernimmt den Platz in der Kreisliga A."],
  ["2004", "Aufstieg in die Bezirksliga."],
  ["2008", "Erneuter Aufstieg in die Bezirksliga."],
  ["2017", "Abstieg in die Kreisliga A, in der die erste Mannschaft seitdem spielt."],
];

export const historyNotes = [
  "Rudi Assauer spielte in den frühen 1960er-Jahren für die Spvgg Herten. Später organisierte er ein Freundschaftsspiel gegen Schalke 04, das den Verein aus finanziellen Problemen holte.",
  "Mit Phil Neumann brachte die DJK Spvgg einen späteren Profi hervor.",
  "Die Rollhockeyabteilung der Spvgg spielte viele Jahre in der Bundesliga und wurde neunmal Deutscher Meister: 1951, 1955, 1956, 1957, 1961, 1964, 1965, 1970 und 1979. Heute spielt sie eigenständig als Rollsport Spielvereinigung Herten.",
];

export const products = [
  { name: "Trinkflasche Alu", desc: "Mit DJK-Logo und Schraubverschluss", price: "6,95 €", img: "p_flasche", cat: "Training" },
  { name: "Tasse", desc: "Kaffee- oder Teetasse", price: "11,95 €", img: "p_tasse", cat: "Fanartikel" },
  { name: "Tasse mit Streifen", desc: "Mit Logo und Vereinsstreifen", price: "11,95 €", img: "p_tasse2", cat: "Fanartikel" },
  { name: "Schlüsselband schwarz", desc: "Mit roten Streifen", price: "2,00 €", img: "p_sb1", cat: "Fanartikel" },
  { name: "Schlüsselband Platzmotiv", desc: "Mit Motiv der Kampfbahn", price: "2,00 €", img: "p_sb2", cat: "Fanartikel" },
  { name: "Schlüsselband grün", desc: "Mit Platzmotiv", price: "2,00 €", img: "p_sb3", cat: "Fanartikel" },
  { name: "Feuerzeug", desc: "Im DJK-Look", price: "2,20 €", img: "p_feuer", cat: "Fanartikel" },
];

export const sponsors = [
  { name: "Staffel Group – Makler & Consults", img: "s_staffel" },
  { name: "Gutachterbüro Raabe", img: "s_raabe" },
  { name: "Hertener Stadtwerke", img: "s_stadtwerke" },
  { name: "Automobile Engbert", img: "s_engbert" },
  { name: "Bürgertraber Herten e.V.", img: "s_traber" },
];

export const clubhouse = {
  price: "200 €", deposit: "100 €", capacity: "60",
  rooms: [
    ["Großer Raum", "Rund 40 m² mit Beamer, Leinwand, Tischen und Stühlen. Passt für Seminare, Sitzungen und Feiern mit bis zu 60 Personen."],
    ["Küche", "Kochfeld, Herd, Kühlschrank, Spüle und Gläser sind da. Besteck und Geschirr bringt ihr selbst mit."],
    ["Sanitär- und Waschräume", "Neu gefliest und modernisiert."],
    ["Überdachter Außenbereich", "Mit eigenem Ein- und Ausgang. Hier darf geraucht werden, im Vereinsheim nicht."],
  ],
};

// News: neueste zuerst. date = ISO, body = Absätze
export const news = [
  { slug: "ehrung-25-jahre", date: "2026-03-13", title: "Ehrung für 25 Jahre Mitgliedschaft", img: "n_ehrung25", tag: "Verein",
    body: ["Bei der letzten Hauptversammlung mit Neuwahl des Hauptvorstands haben wir rund 40 Mitglieder für 25 Jahre Treue zum Verein geehrt.", "25 Jahre sind eine lange Zeit, und besser kann man Vereinsliebe kaum zeigen. Danke für eure Treue, auf die nächsten 25 Jahre in der DJK Spvgg Herten!"] },
  { slug: "hauptvorstand-gewaehlt", date: "2026-03-13", title: "Hauptvorstand gewählt: Van Gemmern bleibt Vorsitzender", img: "n_vorstand", tag: "Verein",
    body: ["Auf der Jahreshauptversammlung im Vereinsheim am Katzenbusch stand die alle zwei Jahre fällige Vorstandswahl an.", "Bestätigt wurden Norbert van Gemmern (1. Vorsitzender), Frank Franiczek (2. Vorsitzender) sowie Yvonne Kemke und Manuel Becker in der Geschäftsführung. Neu im Vorstand sind Nadine Karrasch als Kassiererin und Markus Jahn (vorher Kassierer) und Dominik Karrasch als Beisitzer.", "Bei der Jubilarehrung wurden 38 Mitglieder für 25 Jahre im Verein ausgezeichnet. Besonders hervorgehoben wurden Hubert Bottermann (seit 1961 bei der DJK) und Helmut Roggow (seit 1963 bei der Spvgg)."] },
  { slug: "senioren-trainerwechsel", date: "2026-02-17", title: "Seniorenabteilung: Trainerwechsel zur Saison 2026/27", img: "n_senioren", tag: "Herren",
    body: ["Die Seniorenabteilung gibt einen Trainerwechsel zur kommenden Saison 2026/27 bekannt. Alle Details stehen in der Pressemitteilung vom 16.02.2026."] },
  { slug: "jhv-2026", date: "2026-02-17", title: "Einladung zur Jahreshauptversammlung", img: "n_jhv26", tag: "Verein",
    body: ["Der Hauptvorstand lädt am Freitag, 06.03.2026, um 19:00 Uhr zur Jahreshauptversammlung ein. Wir freuen uns über eine rege Teilnahme."] },
  { slug: "tag-des-maedchenfussballs-2026", date: "2026-01-27", title: "Tag des Mädchenfußballs 2026", img: "n_maedchen", tag: "Jugend",
    body: ["Ihr habt Lust auf Bewegung, Action und gute Stimmung? Dann kommt zum Tag des Mädchenfußballs der DJK Spvgg Herten. Egal ob ihr zum ersten Mal gegen den Ball tretet oder schon richtig kicken könnt: Bei uns zählt der Spaß am Spiel.", "Euch erwarten Stationen, Teamspiele und zum Abschluss ein kleines Turnier. Unsere Trainerinnen und Trainer und die Mädchen aus der D- und C-Jugend begleiten euch durch den Tag und zeigen euch Tricks.", "Die Teilnahme ist kostenlos, und für alle Kinder gibt es ein kleines Mittagessen.", "Wann: Sonntag, 15.03.2026, 11:00–15:00 Uhr. Wo: Sportplatz Katzenbusch. Anmeldung an jugend@djkspvggherten.de."] },
  { slug: "junges-ehrenamt", date: "2026-01-27", title: "Ehrung für vorbildliches junges Ehrenamt", img: "n_ehrenamt", tag: "Jugend",
    body: ["Am 16.01.2026 wurden Achilleas Bettas und Justin Karrasch in Datteln für ihr Engagement im „jungen Ehrenamt“ ausgezeichnet. Beide gehören seit vielen Jahren fest zur DJK-Familie.", "Achilleas Bettas ist Co-Trainer der C-Jugend, seit 2023 Beisitzer im Jugendvorstand und seit Juli 2025 stellvertretender Jugendleiter. Er ist zur Stelle, wo Hilfe gebraucht wird.", "Justin Karrasch trainiert die D-Jugend. Über seine Eltern kam er zur DJK, erst als Spieler, dann als Trainer.", "Danke euch beiden für euren Einsatz. Macht genau so weiter!"] },
  { slug: "mitternachtscup-2025", date: "2025-12-08", title: "18. Mitternachtscup", img: "n_cup", tag: "Event",
    body: ["Hallenfußball der Extraklasse: Unser Mitternachtscup ging in die 18. Auflage.", "Samstag, 27.12.2025, Einlass 17:00 Uhr, Beginn 18:00 Uhr, Rosa-Parks-Schule, Fritz-Erler-Str. 2, 45699 Herten.", "Neben dem Turnier gab es Essen, kalte Getränke und ein Rahmenprogramm. Tickets im Vorverkauf und an der Abendkasse."] },
  { slug: "jhv-2025", date: "2025-06-12", title: "Jahreshauptversammlung 2025", img: "n_jhv25", tag: "Verein",
    body: ["Wir laden alle Mitglieder zur Jahreshauptversammlung des Hauptvorstands ein: Mittwoch, 02.07.2025, 19:00 Uhr im Vereinsheim an der Sportanlage Katzenbusch. Tagesordnung und Details stehen in der Einladung."] },
  { slug: "jhv-jugend-2025", date: "2025-06-04", title: "Einladung Jahreshauptversammlung der Jugendabteilung", img: "n_jhvjugend", tag: "Jugend",
    body: ["Die Jugendabteilung lädt zu ihrer Jahreshauptversammlung 2025 ein. Alle Details stehen in der Einladung."] },
  { slug: "halloween-turnabteilung-2024", date: "2024-11-02", title: "Halloween-Party der Turnabteilung", img: "tu_g5", tag: "Turnen",
    body: ["Die Turnabteilung hat am 2. November 2024 von 15 bis 20 Uhr alle Abteilungsmitglieder und ihre Familien ins Vereinsheim am Katzenbusch eingeladen. Angemeldet wurde über die Turngruppen, kindgerechte Verkleidung war erwünscht.", "Auf dem Programm standen Candy Bar, Tanz der kleinen Monster, Grillen, Musik und Tanz, Feuerschale, Kürbissuche, Fühlboxen, Geisterbowlen, Gespenster abwerfen und eine Nachtwanderung durch den Busch mit Taschenlampen und Laternen.", "Der Eintritt kostete 5 €, Wertmarken im Wert von 2,50 € gab es gratis dazu."] },
  { slug: "turnen-stadtmeisterschaften-2023", date: "2023-02-25", title: "Treppchenplätze bei den Stadtmeisterschaften", img: "tu_g4", tag: "Turnen",
    body: ["Unsere Wettkampfturnerinnen haben bei der Stadtmeisterschaft in Herten an Bock, Reck, Balken und Boden tolle Ergebnisse erturnt. Viele standen bei der Siegerehrung auf dem Treppchen.", "Zweite Plätze für Lia Michelle Schuler (45,6 Punkte), Soi Sakellariou (53,6) und Estella Kiefer (48,8), dritte Plätze für Mira Wiegand (45,3) und Luise Jurick (49,9). Alina Tschirne wurde mit 50,0 Punkten Neunte.", "Die ganze Turnabteilung und besonders Trainerin Joana van den Bosch sind sehr stolz auf euch!"] },
  { slug: "saisonabschluss-2025", date: "2025-06-04", title: "Saisonabschlussfeier der Jugendabteilung", img: "n_abschluss", tag: "Jugend",
    body: ["Am Samstag, 14.06.2025, ab 17:00 Uhr feiern wir unseren gemeinsamen Saisonabschluss mit Grillen, Nachtwanderung und Zelten im Katzenbusch.", "Der Vorstand spendiert Grillgut und Softdrinks, für den Rest seid ihr gefragt."] },
];
