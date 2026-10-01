import { NextResponse, type NextRequest } from "next/server";

// Tarayıcılar başka bir siteden tetiklenen isteklerde Sec-Fetch-Site: cross-site
// gönderir. Veri değiştiren API çağrılarını bu durumda reddediyoruz; böylece başka
// bir sayfaya gömülü form ziyaretçi adına sahte randevu açamaz (CSRF).
export function middleware(req: NextRequest) {
  if (
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    req.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return NextResponse.json(
      { error: "Geçersiz istek kaynağı." },
      { status: 403 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
