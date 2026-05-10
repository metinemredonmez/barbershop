# Oğulcan Ateş Barber's Club

Premium dark theme berber web sitesi + online randevu sistemi + admin paneli.

**Live:**
- https://ogulcanates.com
- https://randevu.ogulcanates.com (alias)

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui (premium dark + altın aksan)
- Prisma + SQLite
- PM2 process manager + LiteSpeed (CyberPanel) reverse proxy
- Let's Encrypt SSL

## Özellikler

### Public site (`/`)
- Dark theme premium UI
- Hero, hizmetler (12 hizmet), hakkımda, galeri, yorumlar, çalışma saatleri, harita, FAQ
- Online randevu — popup tabanlı (#randevu hash ile auto-open, QR'a uygun)
- Çoklu hizmet seçimi (saç + ağda + kaş gibi kombine)
- Sticky toplam (fiyat + süre)
- Çakışma kontrolü (30 dk pencere)
- Cookie banner + KVKK/Çerez/Kullanım/İptal sayfaları

### Admin (`/admin`)
- Şifre korumalı giriş (env'de `ADMIN_PASSWORD`)
- 4 metrik dashboard (toplam, bugün, bekleyen, aylık ciro)
- **Takvim**: ay görünümü + gün popup (her gün için randevular, ciro, tamamlanan sayısı)
- **Tablo**: arama, durum filtresi, hızlı durum değiştirme, satıra tıkla → düzenle
- **Yeni Randevu** butonu — admin manuel ekleyebilir
- **Edit dialog**: tüm alan değişimi + çakışma uyarısı (sarı warning UI) + delete
- Çoklu hizmet desteği — primary + extras (+N rozeti)

## Kurulum (local)

```bash
git clone https://github.com/metinemredonmez/barbershop.git
cd barbershop
yarn install     # postinstall otomatik prisma generate çalıştırır
cp .env.example .env
# .env içindeki ADMIN_PASSWORD'u değiştir
npx prisma migrate dev
yarn seed
yarn dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Production deploy

İlk kurulum:
```bash
mkdir -p /var/www/ogulcanates && cd /var/www/ogulcanates
git clone https://github.com/metinemredonmez/barbershop.git web
cd web
yarn install
cp .env.example .env && nano .env   # ADMIN_PASSWORD ayarla
npx prisma migrate deploy
yarn seed
yarn build
pm2 start ecosystem.config.js
pm2 save
```

Sonraki güncelleme (tek komut):
```bash
yarn deploy
```

Bu şunu yapar:
1. `git pull`
2. `yarn install` (postinstall ile prisma generate)
3. `prisma migrate deploy`
4. `prisma generate` (idempotent)
5. `yarn seed` (yeni hizmet vs.)
6. `yarn build`
7. `pm2 restart ogulcanates-web --update-env`

## Sayfalar
- `/` — Landing + popup booking
- `/kvkk` — KVKK aydınlatma metni
- `/cerez-politikasi` — Çerez politikası
- `/kullanim-kosullari` — Kullanım koşulları
- `/iptal-politikasi` — İptal & kapora kuralları
- `/admin/login` — Admin girişi
- `/admin` — Yönetim paneli

## API
- `POST /api/appointments` — Yeni randevu (public, çakışma 409 + conflict detail)
- `GET  /api/availability?date=YYYY-MM-DD` — Dolu saatler
- `PATCH /api/appointments/:id` — Güncelle (admin, tarih değişirse çakışma kontrol)
- `DELETE /api/appointments/:id` — Sil (admin)
- `POST /api/admin/login` — Giriş (cookie tabanlı, 8 saat)
- `DELETE /api/admin/login` — Çıkış

## Hizmet ekleme/düzenleme
`prisma/seed.ts` dosyasını güncelle, sonra `yarn seed`.

Yeni hizmet eklerken `order` alanını sıralı tut (DB'den eski sıralama korunur, sadece içerikler güncellenir).

## Yapı
```
src/
├── app/
│   ├── page.tsx          # Landing
│   ├── layout.tsx        # Root layout + cookie banner
│   ├── globals.css       # Tailwind + shadcn variables
│   ├── kvkk/             # Yasal sayfalar
│   ├── cerez-politikasi/
│   ├── kullanim-kosullari/
│   ├── iptal-politikasi/
│   ├── admin/
│   │   ├── login/
│   │   └── page.tsx      # Dashboard
│   └── api/
│       ├── appointments/
│       ├── availability/
│       └── admin/login/
├── components/
│   ├── site/             # Public site components
│   │   ├── navbar, hero, services, about, gallery, reviews,
│   │   ├── working-hours, contact, faq, footer, sticky-cta,
│   │   ├── booking, cookie-banner, legal-page, section-heading
│   ├── admin/
│   │   ├── dashboard, calendar, create-appointment, edit-appointment
│   └── ui/               # shadcn primitives
│       ├── button, card, input, label, select, dialog, badge, textarea
├── lib/
│   ├── prisma.ts         # Prisma singleton
│   ├── site-config.ts    # Brand/contact/hours/reviews/faqs/gallery
│   └── utils.ts          # cn, formatPrice, formatDate, parseExtraServiceIds, getAppointmentTotals
└── prisma/
    ├── schema.prisma     # Service, Appointment models
    ├── seed.ts           # 12 hizmet
    └── migrations/

public/
├── about.jpg             # Berber gerçek fotoğraf
├── fiyat-listesi.pdf     # PDF fiyat listesi
├── logo-mark-gold.png    # Logo (sadece sembol, altın)
├── logo-gold.png         # Logo (tam, altın)
└── logo-white.png        # Logo (tam, beyaz)
```

## Environment Variables
```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="..."
NEXT_PUBLIC_BARBER_NAME="Oğulcan Ateş"
NEXT_PUBLIC_BARBER_BRAND="OĞULCAN ATEŞ"
NEXT_PUBLIC_BARBER_TAGLINE="Barber's Club"
NEXT_PUBLIC_BARBER_PHONE="0552 117 01 61"
NEXT_PUBLIC_BARBER_WHATSAPP="905521170161"
NEXT_PUBLIC_BARBER_INSTAGRAM="ogulcanatesofficial"
NEXT_PUBLIC_BARBER_ADDRESS="Feyzullah Mah. 34843, Maltepe / İstanbul"
NEXT_PUBLIC_BARBER_MAP="..."
```

## QR Kod
QR kodu için URL: `https://ogulcanates.com/#randevu` — popup direkt açılır.

UTM tracking için: `https://ogulcanates.com/?utm_source=qr#randevu`

QR oluşturmak için: https://qrcode-monkey.com (renk önerisi: kod altın `#C89B3C`, arka siyah `#0a0a0a`)
