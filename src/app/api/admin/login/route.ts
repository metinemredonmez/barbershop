import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "Sunucu ayarlanmamış (ADMIN_PASSWORD eksik)." },
      { status: 500 }
    );
  }

  if (password !== expected) {
    return NextResponse.json(
      { error: "Şifre hatalı." },
      { status: 401 }
    );
  }

  cookies().set("admin-auth", "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 saat
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  cookies().delete("admin-auth");
  return NextResponse.json({ ok: true });
}
