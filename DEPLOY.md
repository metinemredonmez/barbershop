# Deploy

Sunucuda proje `/var/www/barbershop` klasöründe, pm2'de `ogulcanates-web` adıyla çalışıyor.

## Tek seferlik hazırlık (bu sürümden önce bir kez)

Bu sürümde Next.js 15'e geçildi ve admin girişi yenilendi. İlk deploy'dan önce:

1. **Admin şifresini değiştir.** `.env` içindeki `ADMIN_PASSWORD` en az 12 karakter olsun. `change-me` ise production'da giriş reddedilir.
2. **Oturum sırrı ekle.** Rastgele bir değer üret:
   ```bash
   openssl rand -hex 32
   ```
   Çıkan değeri `.env` dosyasına `ADMIN_SESSION_SECRET="..."` olarak yaz.
3. **Saat dilimini kontrol et.** Çıktı `Europe/Istanbul` olmalı:
   ```bash
   timedatectl show -p Timezone --value
   ```
   Değilse:
   ```bash
   timedatectl set-timezone Europe/Istanbul
   ```
4. **Paket yöneticisi artık npm.** `package-lock.json` kullanılıyor; eski `yarn.lock` dosyasını sil:
   ```bash
   rm -f /var/www/barbershop/yarn.lock
   ```

Admin'ler deploy sonrası bir kez yeniden giriş yapmak zorunda (eski cookie geçersiz).

## Deploy komutları

```bash
cd /var/www/barbershop
git pull
npm ci
npx prisma migrate deploy
npm run seed
npm run build
pm2 restart ogulcanates-web --update-env
```

- `npm run seed` hizmetleri ve **fiyatları** `prisma/seed.ts` dosyasındaki değerlere günceller.
- Bu ilk deploy'dan sonra aynı adımların hepsini tek komutla çalıştırabilirsin:
  ```bash
  cd /var/www/barbershop && npm run deploy
  ```

## Deploy sonrası kontrol

```bash
pm2 logs ogulcanates-web --lines 30 --nostream
```

```bash
curl -sI https://ogulcanates.com | grep -i x-frame-options
```
Çıktı `X-Frame-Options: DENY` olmalı.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -H 'Cookie: admin-auth=ok' https://ogulcanates.com/api/appointments
```
Çıktı `401` olmalı (eski sahte cookie artık işe yaramıyor).

Sitede randevu penceresini aç; fiyatlar Saç 700 ₺, Sakal 350 ₺, Saç Sakal Total 1.000 ₺ görünmeli. Admin paneline giriş yapıp randevuların listelendiğini kontrol et.

## Geri alma

Bir sorun çıkarsa önceki sürüme dön:

```bash
cd /var/www/barbershop
git checkout 87cd60c
npm ci
npm run build
pm2 restart ogulcanates-web --update-env
```

Sonra tekrar güncel sürüme geçmek için: `git checkout main`.
