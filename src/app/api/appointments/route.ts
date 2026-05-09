import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, date, customerName, phone, email, note } = body;

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

    const target = new Date(date);
    if (Number.isNaN(target.getTime())) {
      return NextResponse.json(
        { error: "Geçersiz tarih." },
        { status: 400 }
      );
    }

    if (target < new Date()) {
      return NextResponse.json(
        { error: "Geçmiş bir tarihe randevu alamazsınız." },
        { status: 400 }
      );
    }

    const startWindow = new Date(target.getTime() - 60 * 60 * 1000);
    const endWindow = new Date(target.getTime() + 60 * 60 * 1000);
    const conflict = await prisma.appointment.findFirst({
      where: {
        date: { gte: startWindow, lte: endWindow },
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (
      conflict &&
      Math.abs(conflict.date.getTime() - target.getTime()) < 30 * 60 * 1000
    ) {
      return NextResponse.json(
        { error: "Bu saat dolu, lütfen başka bir saat seçin." },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        serviceId,
        date: target,
        customerName,
        phone,
        email: email || null,
        note: note || null,
        status: "pending",
      },
      include: { service: true },
    });

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
