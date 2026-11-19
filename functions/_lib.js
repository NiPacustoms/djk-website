// Gemeinsame Helfer für Statistik und Admin-Login (Cloudflare Pages Functions, Web Crypto).
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (buf) => b64(buf).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function sha256hex(text) {
  const h = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Passwort-Hash im Format pbkdf2$<iterationen>$<salt-b64>$<hash-b64>
export async function verifyPassword(password, stored) {
  if (!stored || !password) return false;
  const [algo, iter, salt, hash] = stored.split("$");
  if (algo !== "pbkdf2") return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unb64(salt), iterations: Number(iter) }, key, 256);
  const a = new Uint8Array(bits), b = unb64(hash);
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export const SESSION_COOKIE = "djk_admin";
export const SESSION_HOURS = 12;

export async function createSession(env) {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `admin.${exp}`;
  return `${payload}.${await hmac(env.SESSION_SECRET, payload)}`;
}

export async function isAdmin(request, env) {
  if (!env.SESSION_SECRET) return false;
  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  if (!m) return false;
  const parts = m[1].split(".");
  if (parts.length !== 3) return false;
  const [who, exp, sig] = parts;
  if (Number(exp) < Date.now()) return false;
  return sig === (await hmac(env.SESSION_SECRET, `${who}.${exp}`));
}

export const sessionCookie = (value, maxAge) =>
  `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...(init.headers || {}) } });

export const berlinDay = (d = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
