import type { NextRequest } from "next/server";

// İstemci IP'si. LiteSpeed/nginx arkasında X-Forwarded-For'un SON elemanı
// proxy'nin gördüğü gerçek adrestir; baştaki elemanlar istemci tarafından
// uydurulabilir.
export function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// Basit, bellek içi sabit pencere sayacı. Tek süreçli (pm2 fork) dağıtım için
// yeterli; birden fazla instance çalışırsa her biri kendi sayacını tutar.
type Bucket = { count: number; resetAt: number };
const globalForRl = global as unknown as { rateLimitBuckets?: Map<string, Bucket> };
const buckets = (globalForRl.rateLimitBuckets ??= new Map<string, Bucket>());

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 10_000) {
    buckets.forEach((b, k) => {
      if (b.resetAt <= now) buckets.delete(k);
    });
  }
  let b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count++;
  return {
    ok: b.count <= limit,
    retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
  };
}

export function resetRateLimit(key: string) {
  buckets.delete(key);
}

// Gövdeyi boyut sınırıyla okur; geçersiz/çok büyük gövdede null döner.
export async function readJsonBody(
  req: Request,
  maxBytes = 10_000
): Promise<Record<string, unknown> | null> {
  const len = Number(req.headers.get("content-length") || 0);
  if (len > maxBytes) return null;
  const text = await req.text().catch(() => "");
  if (!text || text.length > maxBytes) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}
