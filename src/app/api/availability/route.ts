import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeAppointmentDurationMin,
  parseExtraServiceIds,
} from "@/lib/utils";

const TIME_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
  "19:30", "20:00", "20:30",
];

const DEFAULT_DURATION = 30;
const SHOP_CLOSE = "21:00"; // randevu bu saatten sonra bitmemeli

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ busy: [] });
  }

  const durationParam = Number(req.nextUrl.searchParams.get("duration"));
  const newDuration =
    Number.isFinite(durationParam) && durationParam > 0
      ? durationParam
      : DEFAULT_DURATION;

  const start = new Date(`${dateStr}T00:00:00.000`);
  const end = new Date(`${dateStr}T23:59:59.999`);

  const [appts, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ["pending", "confirmed"] },
      },
      include: { service: { select: { durationMin: true } } },
    }),
    prisma.blockedSlot.findMany({
      where: {
        OR: [
          { startAt: { gte: start, lte: end } },
          { endAt: { gte: start, lte: end } },
          { AND: [{ startAt: { lte: start } }, { endAt: { gte: end } }] },
        ],
      },
    }),
  ]);

  // Bu randevulara ait extra service id'lerini topla — saç+sakal gibi çoklu
  // hizmet seçimlerinde toplam süre primary + extras olarak hesaplanmalı.
  const extraIds = new Set<string>();
  for (const a of appts) {
    for (const id of parseExtraServiceIds(a.extraServices)) {
      extraIds.add(id);
    }
  }
  const extraServices =
    extraIds.size > 0
      ? await prisma.service.findMany({
          where: { id: { in: Array.from(extraIds) } },
          select: { id: true, durationMin: true },
        })
      : [];
  const durationByServiceId = new Map<string, number>(
    extraServices.map((s) => [s.id, s.durationMin])
  );

  const closeAt = (() => {
    const [ch, cm] = SHOP_CLOSE.split(":").map(Number);
    const d = new Date(start);
    d.setHours(ch, cm, 0, 0);
    return d.getTime();
  })();

  const busy = new Set<string>();

  for (const t of TIME_SLOTS) {
    const [h, m] = t.split(":").map(Number);
    const slot = new Date(start);
    slot.setHours(h, m, 0, 0);
    const slotStart = slot.getTime();
    const slotEnd = slotStart + newDuration * 60 * 1000;

    // Shop kapanışından sonra bitiyorsa seçilemez
    if (slotEnd > closeAt) {
      busy.add(t);
      continue;
    }

    // Mevcut randevulardan biriyle çakışıyor mu? (extras dahil toplam süre)
    const collidesAppt = appts.some((a) => {
      const aStart = new Date(a.date).getTime();
      const aDur =
        computeAppointmentDurationMin(
          a.service?.durationMin || 0,
          a.extraServices,
          durationByServiceId
        ) || DEFAULT_DURATION;
      const aEnd = aStart + aDur * 60 * 1000;
      return slotStart < aEnd && slotEnd > aStart;
    });
    if (collidesAppt) {
      busy.add(t);
      continue;
    }

    // Mola / kapalı saat ile çakışıyor mu?
    const collidesBlock = blocks.some((b) => {
      const bs = new Date(b.startAt).getTime();
      const be = new Date(b.endAt).getTime();
      return slotStart < be && slotEnd > bs;
    });
    if (collidesBlock) busy.add(t);
  }

  return NextResponse.json({ busy: Array.from(busy) });
}
