// Randevu kuralları ve girdi doğrulama — public form ve admin API'leri ortak kullanır.
// Saatler sunucunun yerel saat dilimine göredir (availability ile aynı).

export const SHOP_OPEN = "09:30";
export const SHOP_CLOSE = "21:00"; // randevu bu saatten sonra bitmemeli
export const CLOSED_WEEKDAYS = [0]; // Pazar
export const MAX_ADVANCE_DAYS = 30;
export const MAX_ACTIVE_PER_PHONE = 3;
export const MAX_EXTRA_SERVICES = 10;

export const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

export function atTime(day: Date, hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

// Public randevu için zaman kontrolü; hata mesajı veya null döner.
export function checkPublicSlot(start: Date, durationMin: number): string | null {
  const now = Date.now();
  const s = start.getTime();
  if (s < now) return "Geçmiş bir tarihe randevu alamazsınız.";
  if (s > now + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000) {
    return `En fazla ${MAX_ADVANCE_DAYS} gün sonrasına randevu alınabilir.`;
  }
  if (CLOSED_WEEKDAYS.includes(start.getDay())) {
    return "Bu gün kapalıyız, lütfen başka bir gün seçin.";
  }
  const end = s + durationMin * 60 * 1000;
  if (s < atTime(start, SHOP_OPEN) || end > atTime(start, SHOP_CLOSE)) {
    return "Seçilen saat çalışma saatleri dışında.";
  }
  return null;
}

// Telefonları karşılaştırmak için son 10 hane: 0552…, +90552…, 552… aynı sayılır
export function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

export type CustomerFields = {
  customerName: string;
  phone: string;
  email: string | null;
  note: string | null;
};

type FieldsResult =
  | { ok: true; data: Partial<CustomerFields> }
  | { ok: false; error: string };

// Müşteri alanlarını doğrular ve normalize eder. partial=true ise sadece
// gövdede bulunan alanlar kontrol edilir (admin PATCH için).
export function validateCustomerFields(
  body: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {}
): FieldsResult {
  const data: Partial<CustomerFields> = {};
  const has = (k: string) => !partial || body[k] !== undefined;

  if (has("customerName")) {
    const v =
      typeof body.customerName === "string"
        ? body.customerName.replace(/[\s\u0000-\u001f\u007f]+/g, " ").trim()
        : "";
    if (v.length < 2 || v.length > 80) {
      return { ok: false, error: "Ad soyad 2-80 karakter olmalı." };
    }
    data.customerName = v;
  }

  if (has("phone")) {
    const v = typeof body.phone === "string" ? body.phone.trim() : "";
    const digits = v.replace(/\D/g, "");
    if (!/^\+?[\d\s().-]+$/.test(v) || digits.length < 10 || digits.length > 15) {
      return { ok: false, error: "Geçerli bir telefon numarası girin." };
    }
    data.phone = v;
  }

  if (body.email !== undefined) {
    const v = typeof body.email === "string" ? body.email.trim() : "";
    if (v && (v.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) {
      return { ok: false, error: "Geçerli bir e-posta adresi girin." };
    }
    data.email = v || null;
  }

  if (body.note !== undefined) {
    const v =
      typeof body.note === "string"
        ? body.note.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim()
        : "";
    if (v.length > 500) {
      return { ok: false, error: "Not en fazla 500 karakter olabilir." };
    }
    data.note = v || null;
  }

  return { ok: true, data };
}

// Ek hizmet id listesini temizler: sadece string, tekrarsız, primary hariç.
export function sanitizeExtraIds(
  value: unknown,
  primaryId: string
): string[] | null {
  if (!Array.isArray(value)) return [];
  const ids = Array.from(
    new Set(
      value.filter(
        (id): id is string =>
          typeof id === "string" && id.length <= 64 && id !== primaryId
      )
    )
  );
  return ids.length > MAX_EXTRA_SERVICES ? null : ids;
}

// Çakışma kontrolü ile kayıt arasına başka bir istek girmesin diye randevu
// yazımlarını sıraya sokar (tek süreçli pm2 dağıtımı için yeterli).
const globalForLock = global as unknown as { bookingQueue?: Promise<unknown> };

export function withBookingLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = globalForLock.bookingQueue ?? Promise.resolve();
  const run = prev.then(fn);
  globalForLock.bookingQueue = run.catch(() => {});
  return run;
}
