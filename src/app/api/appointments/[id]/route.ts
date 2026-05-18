import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import {
  computeAppointmentDurationMin,
  parseExtraServiceIds,
} from "@/lib/utils";

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

function requireAdmin() {
  const auth = cookies().get("admin-auth")?.value;
  return auth === "ok";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  if (body.status && !ALLOWED_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.customerName === "string") data.customerName = body.customerName.trim();
  if (typeof body.phone === "string") data.phone = body.phone.trim();
  if (body.email !== undefined) data.email = body.email || null;
  if (body.note !== undefined) data.note = body.note || null;
  if (typeof body.serviceId === "string") data.serviceId = body.serviceId;
  if (body.status) data.status = body.status;

  if (Array.isArray(body.extraServiceIds)) {
    const extras = body.extraServiceIds.filter(
      (id: unknown) => typeof id === "string" && id !== body.serviceId
    );
    data.extraServices = extras.length > 0 ? JSON.stringify(extras) : null;
  }

  let newDate: Date | null = null;
  if (body.date) {
    newDate = new Date(body.date);
    if (Number.isNaN(newDate.getTime())) {
      return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
    }
    data.date = newDate;
  }

  // Tarih VEYA hizmet(ler) değişiyorsa, gerçek süreye göre çakışma kontrolü yap
  const dateChanged = !!newDate;
  const serviceChanged = typeof body.serviceId === "string";
  const extrasChanged = Array.isArray(body.extraServiceIds);

  if (dateChanged || serviceChanged || extrasChanged) {
    const current = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { service: true },
    });
    if (!current) {
      return NextResponse.json(
        { error: "Randevu bulunamadı." },
        { status: 404 }
      );
    }

    const effectiveDate = newDate ?? current.date;
    const effectiveServiceId = serviceChanged
      ? (body.serviceId as string)
      : current.serviceId;
    const effectiveExtras = extrasChanged
      ? (body.extraServiceIds as unknown[]).filter(
          (id): id is string =>
            typeof id === "string" && id !== effectiveServiceId
        )
      : parseExtraServiceIds(current.extraServices);

    // Yeni süreyi hesapla (primary + extras)
    const neededIds = new Set<string>([effectiveServiceId, ...effectiveExtras]);
    const services = await prisma.service.findMany({
      where: { id: { in: Array.from(neededIds) } },
      select: { id: true, durationMin: true },
    });
    const durByIdLocal = new Map<string, number>(
      services.map((s) => [s.id, s.durationMin])
    );
    const primaryDur = durByIdLocal.get(effectiveServiceId) || 0;
    if (!primaryDur && serviceChanged) {
      return NextResponse.json(
        { error: "Hizmet bulunamadı." },
        { status: 404 }
      );
    }
    const newDur =
      primaryDur +
      effectiveExtras.reduce(
        (sum, id) => sum + (durByIdLocal.get(id) || 0),
        0
      );
    const newStart = effectiveDate.getTime();
    const newEnd = newStart + newDur * 60 * 1000;

    // Aynı günün diğer randevularını çek
    const dayStart = new Date(effectiveDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(effectiveDate);
    dayEnd.setHours(23, 59, 59, 999);
    const others = await prisma.appointment.findMany({
      where: {
        id: { not: params.id },
        date: { gte: dayStart, lte: dayEnd },
        status: { in: ["pending", "confirmed"] },
      },
      include: { service: true },
    });

    // Diğer randevuların extras sürelerini de yükle
    const otherExtraIds = new Set<string>();
    for (const a of others) {
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
    const durByIdOther = new Map<string, number>(
      otherExtraServices.map((s) => [s.id, s.durationMin])
    );

    const conflict = others.find((a) => {
      const aStart = new Date(a.date).getTime();
      const aDur =
        computeAppointmentDurationMin(
          a.service.durationMin || 0,
          a.extraServices,
          durByIdOther
        ) || 30;
      const aEnd = aStart + aDur * 60 * 1000;
      return newStart < aEnd && newEnd > aStart;
    });

    if (conflict) {
      return NextResponse.json(
        {
          error: "Bu saat dolu, çakışma var.",
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
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data,
    include: { service: true },
  });
  return NextResponse.json({ appointment: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
