// Erzeugt den Passwort-Hash für den Admin-Login.
// Aufruf: npm run admin:hash -- "MeinSicheresPasswort"
// Ausgabe als Cloudflare-Secret ADMIN_PASSWORD_HASH hinterlegen.
import { webcrypto as crypto } from "node:crypto";
const pw = process.argv[2];
if (!pw || pw.length < 12) { console.error("Bitte ein Passwort mit mindestens 12 Zeichen angeben."); process.exit(1); }
const salt = crypto.getRandomValues(new Uint8Array(16));
const iterations = 100000;
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
const b64 = (a) => Buffer.from(a).toString("base64");
console.log(`pbkdf2$${iterations}$${b64(salt)}$${b64(new Uint8Array(bits))}`);
