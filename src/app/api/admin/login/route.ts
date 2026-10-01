import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_TTL_SEC,
  checkAdminPassword,
  createSessionToken,
} from "@/lib/auth";
import { clientIp, rateLimit, readJsonBody, resetRateLimit } from "@/lib/http";

// .env.example'daki örnek şifre production'da kabul edilmez
const PLACEHOLDER_PASSWORDS = ["change-me"];

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: "Sunucu ayarlanmamış (ADMIN_PASSWORD eksik)." },
      { status: 500 }
    );
  }
  if (
    process.env.NODE_ENV === "production" &&
    PLACEHOLDER_PASSWORDS.includes(expected)
  ) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD varsayılan değerde; .env'de güçlü bir şifre belirleyin." },
      { status: 500 }
    );
  }

  // Kaba kuvvet denemelerine karşı IP başına 15 dakikada 10 deneme
  const rlKey = `login:${clientIp(req)}`;
  const rl = rateLimit(rlKey, 10, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Çok fazla deneme. ${Math.ceil(rl.retryAfterSec / 60)} dakika sonra tekrar deneyin.`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const body = await readJsonBody(req, 2_000);
  if (!checkAdminPassword(body?.password)) {
    return NextResponse.json(
      { error: "Şifre hatalı." },
      { status: 401 }
    );
  }
  resetRateLimit(rlKey);

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  });
  // Eski sürümün imzasız cookie'si
  store.delete("admin-auth");

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  store.delete("admin-auth");
  return NextResponse.json({ ok: true });
}
