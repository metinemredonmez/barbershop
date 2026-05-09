import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Çerez Politikası — ${siteConfig.brand}`,
  description:
    "Web sitemizde kullanılan çerezler ve çerez tercihleri hakkında bilgilendirme.",
};

export default function CerezPage() {
  return (
    <LegalPage title="Çerez Politikası" updated="10 Mayıs 2026">
      <h2>1. Çerez Nedir?</h2>
      <p>
        Çerezler (cookies), ziyaret ettiğiniz internet siteleri tarafından
        tarayıcınız aracılığıyla cihazınıza (bilgisayar, telefon, tablet)
        kaydedilen küçük metin dosyalarıdır. Bu dosyalar, siteyi yeniden ziyaret
        ettiğinizde tercihlerinizin hatırlanmasını ve daha iyi bir kullanıcı
        deneyimi sunulmasını sağlar.
      </p>

      <h2>2. Hangi Çerezleri Kullanıyoruz?</h2>

      <h3>2.1. Zorunlu Çerezler</h3>
      <p>
        Sitenin temel işlevlerinin çalışması için gerekli olan çerezlerdir.
        Onayınız aranmaksızın kullanılır ve devre dışı bırakılamazlar.
      </p>
      <ul>
        <li>
          <strong>admin-auth:</strong> Yönetim panelinde oturum yönetimi için
          (yalnızca admin girişinde, 8 saat sonra otomatik silinir)
        </li>
        <li>
          <strong>cookie-consent:</strong> Çerez tercihinizi hatırlamak için
          (1 yıl)
        </li>
      </ul>

      <h3>2.2. İşlevsel Çerezler</h3>
      <p>
        Site üzerindeki tercihlerinizi (örn. son seçtiğiniz hizmet, randevu
        formu durumu) hatırlamak için kullanılır. Bunları reddedebilirsiniz.
      </p>

      <h3>2.3. Analitik / Performans Çerezleri</h3>
      <p>
        Ziyaretçilerin siteyi nasıl kullandığını anlamak ve siteyi
        iyileştirmek için kullanılır. Bu çerezler kişisel verilerinizi
        toplamaz, anonim istatistikler üretir.
      </p>

      <h3>2.4. Üçüncü Taraf Çerezleri</h3>
      <p>
        Sitemizde gömülü olarak yer alan üçüncü taraf hizmetler aşağıdaki
        çerezleri yerleştirebilir:
      </p>
      <ul>
        <li>
          <strong>Google Maps:</strong> Konum gösterimi için (Google&apos;ın
          gizlilik politikasına tabidir)
        </li>
        <li>
          <strong>Instagram:</strong> Profil bağlantıları için (yalnızca
          tıklandığında)
        </li>
        <li>
          <strong>Unsplash:</strong> Galeri görselleri için (yalnızca CDN
          kullanılır, çerez yerleştirmez)
        </li>
      </ul>

      <h2>3. Çerez Tercihlerinizi Nasıl Yönetebilirsiniz?</h2>

      <h3>3.1. Site Üzerinden</h3>
      <p>
        Sitemizi ilk ziyaretinizde alt kısımda görünen <strong>Çerez Bildirimi</strong>{" "}
        üzerinden &quot;Kabul Et&quot; veya &quot;Sadece Zorunlu&quot;
        seçeneklerinden birini seçebilirsiniz. Tercihinizi daha sonra
        değiştirmek için tarayıcı verilerini temizlemeniz yeterlidir.
      </p>

      <h3>3.2. Tarayıcınız Üzerinden</h3>
      <p>
        Tüm modern tarayıcılar çerezleri yönetmenize, görüntülemenize ve
        silmenize olanak tanır. Aşağıdaki bağlantılardan tarayıcınızın çerez
        ayarlarına erişebilirsiniz:
      </p>
      <ul>
        <li>
          <strong>Google Chrome:</strong>{" "}
          <a
            href="https://support.google.com/chrome/answer/95647"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.google.com/chrome
          </a>
        </li>
        <li>
          <strong>Mozilla Firefox:</strong>{" "}
          <a
            href="https://support.mozilla.org/tr/kb/cerezleri-silme-web-sitelerinin-bilgilerini-kald"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.mozilla.org
          </a>
        </li>
        <li>
          <strong>Safari:</strong>{" "}
          <a
            href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.apple.com
          </a>
        </li>
        <li>
          <strong>Microsoft Edge:</strong>{" "}
          <a
            href="https://support.microsoft.com/tr-tr/microsoft-edge"
            target="_blank"
            rel="noopener noreferrer"
          >
            support.microsoft.com
          </a>
        </li>
      </ul>

      <h2>4. Çerez Saklama Süreleri</h2>
      <ul>
        <li>
          <strong>Oturum çerezleri:</strong> Tarayıcınızı kapattığınızda silinir
        </li>
        <li>
          <strong>Kalıcı çerezler:</strong> Tanımlı sürelerine göre saklanır
          (genellikle 1 ay – 1 yıl)
        </li>
      </ul>

      <h2>5. Veri Sorumlusu ve İletişim</h2>
      <p>
        Çerez kullanımı hakkında her türlü soru için bizimle iletişime
        geçebilirsiniz:
      </p>
      <ul>
        <li>
          <strong>{siteConfig.brand}</strong>
        </li>
        <li>{siteConfig.address}</li>
        <li>Telefon: {siteConfig.phone}</li>
        <li>E-posta: donmezemre02@gmail.com</li>
      </ul>

      <h2>6. Politika Güncellemeleri</h2>
      <p>
        Bu çerez politikası, mevzuat veya hizmet değişiklikleri nedeniyle
        güncellenebilir. Güncel versiyon her zaman bu sayfada yayınlanır.
      </p>
    </LegalPage>
  );
}
