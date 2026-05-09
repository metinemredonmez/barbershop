import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ busy: [] });
  }
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);

  const list = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
      status: { in: ["pending", "confirmed"] },
    },
  });

  const busy = list.map((a) => {
    const d = new Date(a.date);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  });

  return NextResponse.json({ busy });
}
