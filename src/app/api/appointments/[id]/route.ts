import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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

  // If date is changing, check conflicts (skip own appointment)
  if (newDate) {
    const startWindow = new Date(newDate.getTime() - 30 * 60 * 1000);
    const endWindow = new Date(newDate.getTime() + 30 * 60 * 1000);
    const conflict = await prisma.appointment.findFirst({
      where: {
        id: { not: params.id },
        date: { gte: startWindow, lte: endWindow },
        status: { in: ["pending", "confirmed"] },
      },
      include: { service: true },
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
