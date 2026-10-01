// OneSignal REST API ile push bildirimi gönderir.
//
// Bildirim SADECE berberin cihaz(lar)ına gider: cihaz, admin panelinde
// "Bildirimleri Aç" denince gizli bir external_id ile OneSignal'e bağlanır.
// Bu id sunucu sırrından türetilir; dışarıdan tahmin edilip müşteri bilgisi
// içeren bildirimlere abone olunamaz.
//
// Env:
//   NEXT_PUBLIC_ONESIGNAL_APP_ID  (SDK init için public)
//   ONESIGNAL_REST_API_KEY         (server-side; OneSignal > Settings > Keys & IDs)

import { createHmac } from "node:crypto";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export const ONESIGNAL_APP_ID =
  process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ||
  "fc33c671-fc2e-42cc-a313-29abcc5cbe22";

type AppointmentForPush = {
  customerName: string;
  phone: string;
  date: Date | string;
  service: { name: string };
};

export function barberPushId(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  const digest = createHmac("sha256", secret)
    .update("onesignal-barber")
    .digest("hex");
  return `barber-${digest.slice(0, 32)}`;
}

export async function sendPush(opts: {
  title: string;
  message: string;
  url?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const externalId = barberPushId();

  if (!apiKey || !externalId) {
    console.log("[push:noop]", opts.title, "—", opts.message);
    return { ok: true, skipped: true };
  }

  try {
    const body: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      target_channel: "push",
      include_aliases: { external_id: [externalId] },
      headings: { en: opts.title, tr: opts.title },
      contents: { en: opts.message, tr: opts.message },
      priority: 10,
    };
    if (opts.url) body.url = opts.url;

    const send = (scheme: string) =>
      fetch("https://api.onesignal.com/notifications?c=push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `${scheme} ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

    // Yeni anahtarlar (os_v2_…) "Key", eski REST anahtarları "Basic" ister;
    // anahtar biçimi tutmazsa diğer yöntemi de dene
    const first = apiKey.startsWith("os_v2_") ? "Key" : "Basic";
    let res = await send(first);
    if (res.status === 401 || res.status === 403) {
      res = await send(first === "Key" ? "Basic" : "Key");
    }

    const text = await res.text();
    if (!res.ok) {
      console.error("[push] OneSignal error:", text);
      return { ok: false, error: text };
    }
    // Cihaz bağlı değilse OneSignal 200 döner ama kimseye gitmez
    if (text.includes("All included players are not subscribed")) {
      return { ok: false, error: "Bildirim açık cihaz bulunamadı." };
    }
    return { ok: true };
  } catch (e) {
    console.error("[push] fetch failed:", e);
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function fmtDate(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return format(dt, "d MMM EEEE HH:mm", { locale: tr });
}

export async function pushNewAppointment(appt: AppointmentForPush) {
  const brand = process.env.NEXT_PUBLIC_BARBER_BRAND || "Berber";
  return sendPush({
    title: `${brand} — Yeni Randevu`,
    message: `${appt.customerName} · ${appt.service.name} · ${fmtDate(appt.date)} · ${appt.phone}`,
    url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
      : undefined,
  });
}
