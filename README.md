# Oğulcan Ateş Barber's Club

Premium dark theme berber web sitesi + online randevu sistemi + admin paneli.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (premium dark + altın aksan)
- Prisma + SQLite (prod'da Postgres'e geçilebilir)

## Kurulum

```bash
npm install
cp .env.example .env
# .env içindeki ADMIN_PASSWORD ve berber bilgilerini düzenle
npx prisma migrate dev
npm run seed
npm run dev
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin/login

## Sayfalar
- `/` — Landing (hero, hizmetler, hakkımda, galeri, randevu, yorumlar, çalışma saatleri, harita, FAQ)
- `/admin/login` — Şifreyle giriş (`.env` → `ADMIN_PASSWORD`)
- `/admin` — Randevu yönetimi (durum değiştir, sil, arama, filtreleme)

## API
- `POST /api/appointments` — Yeni randevu (public)
- `GET  /api/availability?date=YYYY-MM-DD` — Dolu saatler
- `PATCH /api/appointments/:id` — Durum güncelle (admin)
- `DELETE /api/appointments/:id` — Sil (admin)
- `POST /api/admin/login` — Giriş

## Hizmet ekleme/düzenleme
`prisma/seed.ts` dosyasını güncelle, sonra:
```bash
npm run seed
```

## Production
Vercel için Postgres gerekir (SQLite read-only fs'de çalışmaz). Railway/VPS kullanırsan SQLite ile devam edebilirsin.
