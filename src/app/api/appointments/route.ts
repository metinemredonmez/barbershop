import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { notifyNewAppointment } from "@/lib/sms";
import { pushNewAppointment } from "@/lib/push";
import {
  computeAppointmentDurationMin,
  parseExtraServiceIds,
} from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      serviceId,
      extraServiceIds,
      date,
      customerName,
      phone,
      email,
      note,
      status,
    } = body;

    if (!serviceId || !date || !customerName || !phone) {
      return NextResponse.json(
        { error: "Eksik bilgi gönderildi." },
        { status: 400 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      return NextResponse.json(
        { error: "Hizmet bulunamadı." },
        { status: 404 }
      );
    }

    // Validate extra services if provided
    let extras: string[] = [];
    let extrasDurationTotal = 0;
    if (Array.isArray(extraServiceIds) && extraServiceIds.length > 0) {
      extras = extraServiceIds.filter(
        (id) => typeof id === "string" && id !== serviceId
      );
      if (extras.length > 0) {
        const found = await prisma.service.findMany({
          where: { id: { in: extras } },
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
    }

    const target = new Date(date);
    if (Number.isNaN(target.getTime())) {
      return NextResponse.json(
        { error: "Geçersiz tarih." },
        { status: 400 }
      );
    }

    // Admin can backdate; public POST cannot
    const isAdmin = cookies().get("admin-auth")?.value === "ok";
    if (!isAdmin && target < new Date()) {
      return NextResponse.json(
        { error: "Geçmiş bir tarihe randevu alamazsınız." },
        { status: 400 }
      );
    }

    // Yeni randevunun bitiş zamanı: primary + extras toplam süresi
    const newDuration = (service.durationMin || 30) + extrasDurationTotal;
    const targetEnd = new Date(target.getTime() + newDuration * 60 * 1000);

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
      return NextResponse.json(
        {
          error: "Bu saat dolu, lütfen başka bir saat seçin.",
          conflict: {
            id: conflict.id,
            customerName: conflict.customerName,
            date: conflict.date,
            service: conflict.service.name,
          },
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
          blocked: {
            id: blocked.id,
            startAt: blocked.startAt,
            endAt: blocked.endAt,
            type: blocked.type,
            reason: blocked.reason,
          },
        },
        { status: 409 }
      );
    }

    // Admin can set custom status; public defaults to pending
    const finalStatus =
      isAdmin && typeof status === "string" ? status : "pending";

    const appointment = await prisma.appointment.create({
      data: {
        serviceId,
        extraServices: extras.length > 0 ? JSON.stringify(extras) : null,
        date: target,
        customerName,
        phone,
        email: email || null,
        note: note || null,
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
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Randevu oluşturulamadı." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const auth = cookies().get("admin-auth")?.value;
  if (!auth || auth !== "ok") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    orderBy: { date: "desc" },
    include: { service: true },
  });
  return NextResponse.json({ appointments });
}
