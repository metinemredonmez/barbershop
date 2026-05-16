import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

function requireAdmin() {
  return cookies().get("admin-auth")?.value === "ok";
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  try {
    await prisma.blockedSlot.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
  }
}
