import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TIME_SLOTS = [
  "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00",
  "19:30", "20:00", "20:30",
];

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ busy: [] });
  }
  const start = new Date(`${dateStr}T00:00:00.000`);
  const end = new Date(`${dateStr}T23:59:59.999`);

  const [appts, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
        status: { in: ["pending", "confirmed"] },
      },
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

  const busy = new Set<string>();

  for (const a of appts) {
    const d = new Date(a.date);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    busy.add(`${h}:${m}`);
  }

  // Bir TIME_SLOT, herhangi bir BlockedSlot aralığına denk düşüyorsa busy say.
  for (const b of blocks) {
    const bs = new Date(b.startAt).getTime();
    const be = new Date(b.endAt).getTime();
    for (const t of TIME_SLOTS) {
      const [h, m] = t.split(":").map(Number);
      const slot = new Date(start);
      slot.setHours(h, m, 0, 0);
      const ms = slot.getTime();
      if (ms >= bs && ms < be) busy.add(t);
    }
  }

  return NextResponse.json({ busy: Array.from(busy) });
}
