import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { clientIp, rateLimit, readJsonBody } from "@/lib/http";
import { notifyNewAppointment } from "@/lib/sms";
import { pushNewAppointment } from "@/lib/push";
import {
  ALLOWED_STATUSES,
  MAX_ACTIVE_PER_PHONE,
  checkPublicSlot,
  phoneKey,
  sanitizeExtraIds,
  validateCustomerFields,
  withBookingLock,
  type CustomerFields,
} from "@/lib/booking";
import {
  computeAppointmentDurationMin,
  parseExtraServiceIds,
} from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const admin = await isAdmin();

    // Public formda IP başına saatlik sınır (spam / SMS maliyeti)
    if (!admin) {
      const ip = clientIp(req);
      if (ip !== "unknown") {
        const rl = rateLimit(`book:${ip}`, 10, 60 * 60 * 1000);
        if (!rl.ok) {
          return NextResponse.json(
            { error: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin." },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
          );
        }
      }
    }

    const body = await readJsonBody(req);
    if (!body) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }
    const { serviceId, date, status } = body;

    if (typeof serviceId !== "string" || !serviceId || typeof date !== "string") {
      return NextResponse.json(
        { error: "Eksik bilgi gönderildi." },
        { status: 400 }
      );
    }

    const fields = validateCustomerFields(body);
    if (!fields.ok) {
      return NextResponse.json({ error: fields.error }, { status: 400 });
    }
    const customer = fields.data as CustomerFields;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service || (!admin && !service.active)) {
      return NextResponse.json(
        { error: "Hizmet bulunamadı." },
        { status: 404 }
      );
    }

    // Validate extra services if provided
    const extras = sanitizeExtraIds(body.extraServiceIds, serviceId);
    if (!extras) {
      return NextResponse.json(
        { error: "Çok fazla ek hizmet seçildi." },
        { status: 400 }
      );
    }
    let extrasDurationTotal = 0;
    if (extras.length > 0) {
      const found = await prisma.service.findMany({
        where: { id: { in: extras }, ...(admin ? {} : { active: true }) },
        select: { id: true, durationMin: true },
      });
      if (found.length !== extras.length) {
        return NextResponse.json(
          { error: "Bir veya daha fazla ek hizmet bulunamadı." },
          { status: 404 }
        );
      }
      extrasDurationTotal = found.reduce(
        (sum, s) => sum + (s.durationMin || 0),
        0
      );
    }

    const target = new Date(date);
    if (Number.isNaN(target.getTime())) {
      return NextResponse.json(
        { error: "Geçersiz tarih." },
        { status: 400 }
      );
    }

    // Yeni randevunun bitiş zamanı: primary + extras toplam süresi
    const newDuration = (service.durationMin || 30) + extrasDurationTotal;
    const targetEnd = new Date(target.getTime() + newDuration * 60 * 1000);

    // Admin geçmişe / mesai dışına ekleyebilir; public sadece açık saatlere
    if (!admin) {
      const slotError = checkPublicSlot(target, newDuration);
      if (slotError) {
        return NextResponse.json({ error: slotError }, { status: 400 });
      }
    }

    // Admin can set custom status; public defaults to pending
    const finalStatus =
      admin && typeof status === "string" && ALLOWED_STATUSES.includes(status)
        ? status
        : "pending";

    // Çakışma kontrolü + kayıt atomik olsun: aynı anda gelen iki istek aynı
    // saati alamasın.
    return await withBookingLock(async () => {
      // Bu güne ait pending/confirmed randevuları çek, sürelerine göre overlap kontrolü yap
      const dayStart = new Date(target);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(target);
      dayEnd.setHours(23, 59, 59, 999);

      const sameDay = await prisma.appointment.findMany({
        where: {
          date: { gte: dayStart, lte: dayEnd },
          status: { in: ["pending", "confirmed"] },
        },
        include: { service: true },
      });

      // Çakışan günün diğer randevularının extras sürelerini de hesaba kat
      const otherExtraIds = new Set<string>();
      for (const a of sameDay) {
        for (const id of parseExtraServiceIds(a.extraServices)) {
          otherExtraIds.add(id);
        }
      }
      const otherExtraServices =
        otherExtraIds.size > 0
          ? await prisma.service.findMany({
              where: { id: { in: Array.from(otherExtraIds) } },
              select: { id: true, durationMin: true },
            })
          : [];
      const durationByServiceId = new Map<string, number>(
        otherExtraServices.map((s) => [s.id, s.durationMin])
      );

      const conflict = sameDay.find((a) => {
        const aStart = new Date(a.date).getTime();
        const aDur =
          computeAppointmentDurationMin(
            a.service.durationMin || 0,
            a.extraServices,
            durationByServiceId
          ) || 30;
        const aEnd = aStart + aDur * 60 * 1000;
        return target.getTime() < aEnd && targetEnd.getTime() > aStart;
      });

      if (conflict) {
        // Diğer müşterinin bilgileri (KVKK) sadece admin'e gösterilir
        return NextResponse.json(
          {
            error: "Bu saat dolu, lütfen başka bir saat seçin.",
            ...(admin && {
              conflict: {
                id: conflict.id,
                customerName: conflict.customerName,
                date: conflict.date,
                service: conflict.service.name,
              },
            }),
          },
          { status: 409 }
        );
      }

      // Mola / kapalı saat kontrolü — randevunun süresiyle birlikte herhangi
      // bir BlockedSlot aralığına denk düşüyorsa engelle.
      const blocked = await prisma.blockedSlot.findFirst({
        where: {
          startAt: { lt: targetEnd },
          endAt: { gt: target },
        },
      });
      if (blocked) {
        return NextResponse.json(
          {
            error:
              blocked.type === "off"
                ? "Bu saat kapalı (off). Lütfen başka bir saat seçin."
                : "Bu saat mola olarak işaretli. Lütfen başka bir saat seçin.",
            ...(admin && {
              blocked: {
                id: blocked.id,
                startAt: blocked.startAt,
                endAt: blocked.endAt,
                type: blocked.type,
                reason: blocked.reason,
              },
            }),
          },
          { status: 409 }
        );
      }

      // Aynı numarayla sınırsız ileri tarihli randevu açılmasın
      if (!admin) {
        const key = phoneKey(customer.phone);
        const upcoming = await prisma.appointment.findMany({
          where: {
            date: { gte: new Date() },
            status: { in: ["pending", "confirmed"] },
          },
          select: { phone: true },
        });
        const active = upcoming.filter((a) => phoneKey(a.phone) === key).length;
        if (active >= MAX_ACTIVE_PER_PHONE) {
          return NextResponse.json(
            {
              error:
                "Bu telefon numarasıyla çok sayıda aktif randevu var. Değişiklik için lütfen bizi arayın.",
            },
            { status: 429 }
          );
        }
      }

      const appointment = await prisma.appointment.create({
        data: {
          serviceId,
          extraServices: extras.length > 0 ? JSON.stringify(extras) : null,
          date: target,
          customerName: customer.customerName,
          phone: customer.phone,
          email: customer.email ?? null,
          note: customer.note ?? null,
          status: finalStatus,
        },
        include: { service: true },
      });

      // SMS bildirimi — yanıtı bloklamasın diye hatayı yutuyoruz, sadece logluyoruz.
      notifyNewAppointment(appointment).catch((err) =>
        console.error("[sms] notifyNewAppointment failed", err)
      );
      // OneSignal push bildirimi (berberin telefonu/masaüstü)
      pushNewAppointment(appointment).catch((err) =>
        console.error("[push] pushNewAppointment failed", err)
      );

      return NextResponse.json({ appointment }, { status: 201 });
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Randevu oluşturulamadı." },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    orderBy: { date: "desc" },
    include: { service: true },
  });
  return NextResponse.json({ appointments });
}
