import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/auth";
import { readJsonBody } from "@/lib/http";
import {
  ALLOWED_STATUSES,
  sanitizeExtraIds,
  validateCustomerFields,
  withBookingLock,
} from "@/lib/booking";
import {
  computeAppointmentDurationMin,
  parseExtraServiceIds,
} from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

function isNotFound(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  const body = await readJsonBody(req);
  if (!body) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (
    body.status !== undefined &&
    (typeof body.status !== "string" || !ALLOWED_STATUSES.includes(body.status))
  ) {
    return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
  }

  const fields = validateCustomerFields(body, { partial: true });
  if (!fields.ok) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }
  const data: Record<string, unknown> = { ...fields.data };
  if (typeof body.serviceId === "string") data.serviceId = body.serviceId;
  if (body.status) data.status = body.status;

  let extrasInput: string[] | null = null;
  if (Array.isArray(body.extraServiceIds)) {
    extrasInput = sanitizeExtraIds(
      body.extraServiceIds,
      typeof body.serviceId === "string" ? body.serviceId : ""
    );
    if (!extrasInput) {
      return NextResponse.json(
        { error: "Çok fazla ek hizmet seçildi." },
        { status: 400 }
      );
    }
    data.extraServices =
      extrasInput.length > 0 ? JSON.stringify(extrasInput) : null;
  }

  let newDate: Date | null = null;
  if (body.date) {
    newDate = new Date(body.date as string);
    if (Number.isNaN(newDate.getTime())) {
      return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
    }
    data.date = newDate;
  }

  // Tarih VEYA hizmet(ler) değişiyorsa, gerçek süreye göre çakışma kontrolü yap
  const dateChanged = !!newDate;
  const serviceChanged = typeof body.serviceId === "string";
  const extrasChanged = Array.isArray(body.extraServiceIds);

  return withBookingLock(async () => {
    if (dateChanged || serviceChanged || extrasChanged) {
      const current = await prisma.appointment.findUnique({
        where: { id },
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
      const effectiveExtras = (
        extrasInput ?? parseExtraServiceIds(current.extraServices)
      ).filter((x) => x !== effectiveServiceId);

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
          id: { not: id },
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

    try {
      const updated = await prisma.appointment.update({
        where: { id },
        data,
        include: { service: true },
      });
      return NextResponse.json({ appointment: updated });
    } catch (e) {
      if (isNotFound(e)) {
        return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
      }
      throw e;
    }
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.appointment.delete({ where: { id } });
  } catch (e) {
    if (isNotFound(e)) {
      return NextResponse.json({ error: "Randevu bulunamadı." }, { status: 404 });
    }
    throw e;
  }
  return NextResponse.json({ ok: true });
}
