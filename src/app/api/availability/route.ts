import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  computeAppointmentDurationMin,
  parseExtraServiceIds,
} from "@/lib/utils";

const DEFAULT_DURATION = 30;
const SHOP_OPEN = "09:30";
const SHOP_CLOSE = "21:00"; // randevu bu saatten sonra bitmemeli
const GRID_MIN = 30; // standart slot aralığı (dk) — boş zamanlarda görülen aralık

function toHM(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ available: [], busy: [] });
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

  // Çoklu hizmet (extras) sürelerini de hesaplayabilmek için id->dakika map
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

  // Gün için açılış/kapanış zamanları
  const openAt = (() => {
    const [oh, om] = SHOP_OPEN.split(":").map(Number);
    const d = new Date(start);
    d.setHours(oh, om, 0, 0);
    return d.getTime();
  })();
  const closeAt = (() => {
    const [ch, cm] = SHOP_CLOSE.split(":").map(Number);
    const d = new Date(start);
    d.setHours(ch, cm, 0, 0);
    return d.getTime();
  })();

  const now = Date.now();

  // 1) Standart 30dk grid'inde aday başlangıç saatleri
  const candidateSet = new Set<number>();
  for (let t = openAt; t <= closeAt; t += GRID_MIN * 60 * 1000) {
    candidateSet.add(t);
  }

  // 2) Her mevcut randevunun bitiş saatini de aday olarak ekle —
  //    böylece "Saç+Sakal 45dk" gibi randevular bittiği an (örn 12:15)
  //    yeni slot beliriyor, yarım saat kayıp yok.
  const apptRanges: { start: number; end: number }[] = [];
  for (const a of appts) {
    const aStart = new Date(a.date).getTime();
    const aDur =
      computeAppointmentDurationMin(
        a.service?.durationMin || 0,
        a.extraServices,
        durationByServiceId
      ) || DEFAULT_DURATION;
    const aEnd = aStart + aDur * 60 * 1000;
    apptRanges.push({ start: aStart, end: aEnd });
    if (aEnd >= openAt && aEnd <= closeAt) candidateSet.add(aEnd);
  }

  // 3) Blocked slot'ların bitiş saatlerini de aday olarak ekle
  //    (mola bittiği an yeni slot)
  const blockRanges: { start: number; end: number }[] = [];
  for (const b of blocks) {
    const bs = new Date(b.startAt).getTime();
    const be = new Date(b.endAt).getTime();
    blockRanges.push({ start: bs, end: be });
    if (be >= openAt && be <= closeAt) candidateSet.add(be);
  }

  const candidates = Array.from(candidateSet).sort((a, b) => a - b);

  const available: string[] = [];
  for (const slotStart of candidates) {
    const slotEnd = slotStart + newDuration * 60 * 1000;

    // Geçmiş zaman
    if (slotStart <= now) continue;
    // Kapanıştan sonra bitmemeli
    if (slotEnd > closeAt) continue;
    // Açılıştan önce başlamamalı
    if (slotStart < openAt) continue;

    // Mevcut randevuyla çakışıyor mu
    const collidesAppt = apptRanges.some(
      (r) => slotStart < r.end && slotEnd > r.start
    );
    if (collidesAppt) continue;

    // Mola / kapalı saat ile çakışıyor mu
    const collidesBlock = blockRanges.some(
      (r) => slotStart < r.end && slotEnd > r.start
    );
    if (collidesBlock) continue;

    available.push(toHM(slotStart));
  }

  // Aynı dakikaya iki aday düşmüşse dedupe
  const unique = Array.from(new Set(available));

  // Geriye dönük uyumluluk için boş bir `busy` da döndürüyoruz —
  // yeni client `available` kullanıyor.
  return NextResponse.json({ available: unique, busy: [] });
}
