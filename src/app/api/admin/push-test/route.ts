import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sendPush } from "@/lib/push";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const result = await sendPush({
    title: "Test bildirimi",
    message: "Randevu bildirimleri bu cihaza gelecek.",
  });
  if (result.skipped) {
    return NextResponse.json(
      { error: "Sunucuda ONESIGNAL_REST_API_KEY tanımlı değil." },
      { status: 503 }
    );
  }
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || "Bildirim gönderilemedi." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
