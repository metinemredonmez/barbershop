// OneSignal REST API ile push bildirimi gönderir.
//
// Env:
//   NEXT_PUBLIC_ONESIGNAL_APP_ID  (zaten public/init için lazım)
//   ONESIGNAL_REST_API_KEY         (server-side, REST API key)
//
// REST API key OneSignal dashboard > Settings > Keys & IDs altından alınır.

import { format } from "date-fns";
import { tr } from "date-fns/locale";

type AppointmentForPush = {
  customerName: string;
  phone: string;
  date: Date | string;
  service: { name: string };
};

export async function sendPush(opts: {
  title: string;
  message: string;
  url?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const appId =
    process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ||
    "fc33c671-fc2e-42cc-a313-29abcc5cbe22";
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!apiKey) {
    console.log("[push:noop]", opts.title, "—", opts.message);
    return { ok: true };
  }

  try {
    const body: Record<string, unknown> = {
      app_id: appId,
      headings: { en: opts.title, tr: opts.title },
      contents: { en: opts.message, tr: opts.message },
      // Tüm abonelere gönder (berber kendi telefonunu/cihazını abone yapacak)
      included_segments: ["Subscribed Users"],
    };
    if (opts.url) body.url = opts.url;

    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[push] OneSignal error:", text);
      return { ok: false, error: text };
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
