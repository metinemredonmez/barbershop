// SMS gönderim katmanı.
//
// Desteklenen sağlayıcılar (env'e göre otomatik seçilir):
//   - SMS_PROVIDER=twilio   → TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
//   - SMS_PROVIDER=netgsm   → NETGSM_USERNAME, NETGSM_PASSWORD, NETGSM_HEADER
//   - (boş/undefined)       → console.log (geliştirme için no-op)
//
// Bildirim hedefi:
//   - SMS_BARBER_TO          → işletme sahibi/berber telefonu (zorunlu, virgülle çoklu)
//   - SMS_NOTIFY_CUSTOMER=1  → müşteriye de onay SMS'i gönder

import { format } from "date-fns";
import { tr } from "date-fns/locale";

export type SendSmsArgs = {
  to: string;
  body: string;
};

type SmsResult = { ok: boolean; provider: string; error?: string };

async function sendViaTwilio({ to, body }: SendSmsArgs): Promise<SmsResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) {
    return { ok: false, provider: "twilio", error: "Twilio env eksik" };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, provider: "twilio", error: text };
    }
    return { ok: true, provider: "twilio" };
  } catch (e) {
    return {
      ok: false,
      provider: "twilio",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function sendViaNetgsm({ to, body }: SendSmsArgs): Promise<SmsResult> {
  const usercode = process.env.NETGSM_USERNAME;
  const password = process.env.NETGSM_PASSWORD;
  const msgheader = process.env.NETGSM_HEADER;
  if (!usercode || !password || !msgheader) {
    return { ok: false, provider: "netgsm", error: "Netgsm env eksik" };
  }
  // Netgsm 0090 yerine 90 ile başlayan format ister (örn: 905521170161)
  const gsmno = to.replace(/^\+/, "").replace(/\D/g, "");
  const url = "https://api.netgsm.com.tr/sms/send/get";
  const qs = new URLSearchParams({
    usercode,
    password,
    gsmno,
    message: body,
    msgheader,
  });
  try {
    const res = await fetch(`${url}?${qs.toString()}`, { method: "GET" });
    const text = await res.text();
    // Netgsm "00 ..." ile başlarsa OK
    if (!res.ok || !text.startsWith("00")) {
      return { ok: false, provider: "netgsm", error: text };
    }
    return { ok: true, provider: "netgsm" };
  } catch (e) {
    return {
      ok: false,
      provider: "netgsm",
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function sendSms(args: SendSmsArgs): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER || "").toLowerCase();
  if (provider === "twilio") return sendViaTwilio(args);
  if (provider === "netgsm") return sendViaNetgsm(args);
  // No provider configured — log so dev can still see what would have been sent
  console.log("[sms:noop]", args.to, "→", args.body);
  return { ok: true, provider: "noop" };
}

type AppointmentForSms = {
  customerName: string;
  phone: string;
  date: Date | string;
  service: { name: string };
};

function fmtDate(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return format(dt, "d MMMM yyyy EEEE HH:mm", { locale: tr });
}

export async function notifyNewAppointment(appt: AppointmentForSms) {
  const brand = process.env.NEXT_PUBLIC_BARBER_BRAND || "Berber";
  const barberTo = process.env.SMS_BARBER_TO;
  const results: SmsResult[] = [];

  if (barberTo) {
    const targets = barberTo
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const body = `${brand} - Yeni Randevu\n${appt.customerName}\nTel: ${appt.phone}\nHizmet: ${appt.service.name}\n${fmtDate(appt.date)}`;
    for (const to of targets) {
      results.push(await sendSms({ to, body }));
    }
  }

  if (process.env.SMS_NOTIFY_CUSTOMER === "1" && appt.phone) {
    const body = `${brand}: Randevunuz alındı. ${appt.service.name} - ${fmtDate(appt.date)}. Görüşmek üzere!`;
    results.push(await sendSms({ to: appt.phone, body }));
  }

  return results;
}
