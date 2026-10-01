// Admin oturumu: HMAC imzalı, süreli cookie.
//
// Eskiden cookie değeri sabit "ok" idi; tarayıcıda elle set eden herkes admin
// oluyordu. Artık token = "<bitiş>.<nonce>.<imza>" ve imza sunucudaki sırla
// doğrulanıyor.
//
// İmza anahtarı ADMIN_SESSION_SECRET (yoksa ADMIN_PASSWORD) üzerinden türetilir;
// şifre/sır değişince açık tüm oturumlar otomatik geçersiz olur.

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const SESSION_TTL_SEC = 60 * 60 * 8; // 8 saat

function signingKey(): Buffer | null {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return createHash("sha256").update(`admin-session:${secret}`).digest();
}

function sign(payload: string, key: Buffer) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

// Uzunluktan bağımsız, sabit süreli karşılaştırma
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkAdminPassword(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof input !== "string") return false;
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD tanımlı değil");
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SEC;
  const payload = `${exp}.${randomBytes(16).toString("base64url")}`;
  return `${payload}.${sign(payload, key)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const key = signingKey();
  if (!key) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  if (!safeEqual(sig, sign(`${expStr}.${nonce}`, key))) return false;
  const exp = Number(expStr);
  return Number.isInteger(exp) && exp > Date.now() / 1000;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
