import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function requireAdmin() {
  return cookies().get("admin-auth")?.value === "ok";
}

// GET — public, müsaitlik için kullanılır.
// ?date=YYYY-MM-DD verilirse sadece o güne ait kayıtlar döner.
export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");

  if (dateStr) {
    const start = new Date(`${dateStr}T00:00:00.000`);
    const end = new Date(`${dateStr}T23:59:59.999`);
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
    }
    const list = await prisma.blockedSlot.findMany({
      where: {
        OR: [
          { startAt: { gte: start, lte: end } },
          { endAt: { gte: start, lte: end } },
          { AND: [{ startAt: { lte: start } }, { endAt: { gte: end } }] },
        ],
      },
      orderBy: { startAt: "asc" },
    });
    return NextResponse.json({ blockedSlots: list });
  }

  // Tüm liste — sadece admin
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const list = await prisma.blockedSlot.findMany({
    orderBy: { startAt: "desc" },
  });
  return NextResponse.json({ blockedSlots: list });
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { startAt, endAt, type, reason } = body;

    if (!startAt || !endAt) {
      return NextResponse.json(
        { error: "Başlangıç ve bitiş zamanı gerekli." },
        { status: 400 }
      );
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Geçersiz tarih." }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json(
        { error: "Bitiş, başlangıçtan sonra olmalı." },
        { status: 400 }
      );
    }

    const validType = type === "off" ? "off" : "break";

    const slot = await prisma.blockedSlot.create({
      data: {
        startAt: start,
        endAt: end,
        type: validType,
        reason: typeof reason === "string" && reason.trim() ? reason.trim() : null,
      },
    });

    return NextResponse.json({ blockedSlot: slot }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Kayıt oluşturulamadı." },
      { status: 500 }
    );
  }
}
