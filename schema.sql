-- Datenbank für die Besucherstatistik (Cloudflare D1)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,          -- Zeitpunkt (ms)
  day TEXT NOT NULL,            -- Tag (Europe/Berlin), JJJJ-MM-TT
  type TEXT NOT NULL,           -- view, finder, calendar, contact, search, outbound, install, share
  path TEXT NOT NULL,
  ref TEXT NOT NULL DEFAULT '', -- nur Domain der Herkunftsseite
  device TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT '',
  visitor TEXT NOT NULL,        -- Tages-Hash, nach 2 Tagen nicht mehr zuordenbar
  label TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_events_day_type ON events (day, type);
CREATE INDEX IF NOT EXISTS idx_events_ts ON events (ts);
CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT NOT NULL, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts (ip, ts);
