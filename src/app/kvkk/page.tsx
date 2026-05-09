import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `KVKK Aydınlatma Metni — ${siteConfig.brand}`,
  description:
    "Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      updated="10 Mayıs 2026"
    >
      <h2>1. Veri Sorumlusu</h2>
      <p>
        İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&quot;<strong>KVKK</strong>&quot;) ve ilgili mevzuat kapsamında, veri
        sorumlusu sıfatıyla{" "}
        <strong>{siteConfig.brand} (Oğulcan Ateş Barber&apos;s Club)</strong>{" "}
        tarafından, kişisel verilerinizin işlenme süreçleri hakkında sizi
        bilgilendirmek amacıyla hazırlanmıştır.
      </p>
      <ul>
        <li>
          <strong>Unvan:</strong> {siteConfig.brand} (Oğulcan Ateş Barber&apos;s
          Club)
        </li>
        <li>
          <strong>Adres:</strong> {siteConfig.address}
        </li>
        <li>
          <strong>Telefon:</strong> {siteConfig.phone}
        </li>
        <li>
          <strong>E-posta:</strong> donmezemre02@gmail.com
        </li>
        <li>
          <strong>İnternet Sitesi:</strong> https://ogulcanates.com
        </li>
      </ul>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <p>
        Hizmetlerimizden faydalanmanız sırasında aşağıdaki kişisel verileriniz
        işlenmektedir:
      </p>
      <ul>
        <li>
          <strong>Kimlik Bilgisi:</strong> Ad, soyad
        </li>
        <li>
          <strong>İletişim Bilgisi:</strong> Telefon numarası, e-posta adresi
        </li>
        <li>
          <strong>Müşteri İşlem Bilgisi:</strong> Randevu tarihi, saati,
          seçilen hizmet, randevu notu, randevu durumu
        </li>
        <li>
          <strong>İşlem Güvenliği Bilgisi:</strong> IP adresi, çerez kayıtları,
          giriş ve çıkış zamanı (yalnızca güvenlik ve site iyileştirme amacıyla)
        </li>
      </ul>

      <h2>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <p>
        Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen
        kişisel veri işleme şartları kapsamında aşağıdaki amaçlarla
        işlenmektedir:
      </p>
      <ul>
        <li>Randevu oluşturulması, iletilmesi ve takibi</li>
        <li>
          Sunulan hizmetlerin gerçekleştirilmesi ve hizmet kalitesinin
          artırılması
        </li>
        <li>Randevu hatırlatmaları, iptal ve değişiklik bildirimleri</li>
        <li>Müşteri memnuniyeti ölçümü ve şikayet yönetimi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li>Hukuki uyuşmazlıklarda delil olarak kullanılması</li>
        <li>İşletme güvenliğinin sağlanması</li>
      </ul>

      <h2>4. Kişisel Verilerin Aktarılması</h2>
      <p>
        Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi
        ile sınırlı olmak kaydıyla aşağıdaki taraflara aktarılabilir:
      </p>
      <ul>
        <li>
          <strong>Yetkili kamu kurum ve kuruluşları:</strong> Yasal
          yükümlülükler çerçevesinde (mahkeme kararı, talep vb.)
        </li>
        <li>
          <strong>İletişim hizmet sağlayıcıları:</strong> SMS / WhatsApp /
          e-posta hatırlatması göndermek için (yalnızca ad ve telefon)
        </li>
        <li>
          <strong>Hosting hizmet sağlayıcıları:</strong> Sunucu altyapısı için
          (verileriniz şifrelenmiş ve erişim sınırlı şekilde tutulur)
        </li>
      </ul>
      <p>
        Kişisel verileriniz, açık rızanız olmaksızın yurt dışına
        aktarılmamaktadır.
      </p>

      <h2>5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
      <p>
        Kişisel verileriniz; web sitemiz üzerinden online randevu formunu
        doldurmanız, telefonla aramanız, WhatsApp üzerinden iletişime geçmeniz
        veya işletmemizi ziyaret etmeniz gibi otomatik veya kısmen otomatik
        yöntemlerle toplanmaktadır.
      </p>
      <p>
        Verileriniz; KVKK madde 5/2-c (sözleşmenin kurulması ve ifası), 5/2-ç
        (hukuki yükümlülüğün yerine getirilmesi), 5/2-e (bir hakkın tesisi,
        kullanılması veya korunması) ve 5/2-f (meşru menfaat) hukuki
        sebeplerine dayalı olarak işlenmektedir. Pazarlama amaçlı iletişim için{" "}
        <strong>açık rızanız</strong> aranır.
      </p>

      <h2>6. Kişisel Verilerin Saklama Süresi</h2>
      <p>
        Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili
        mevzuatın öngördüğü zamanaşımı süreleri kadar saklanır. Saklama süresi
        sona erdiğinde veriler silinir, yok edilir veya anonim hale getirilir.
      </p>
      <ul>
        <li>
          <strong>Müşteri kayıtları:</strong> Son hizmet tarihinden itibaren 10
          yıl (Türk Borçlar Kanunu zamanaşımı)
        </li>
        <li>
          <strong>Pazarlama izinleri:</strong> Geri alınana kadar
        </li>
        <li>
          <strong>Çerezler:</strong> Çerez Politikası&apos;nda belirtilen
          süreler
        </li>
      </ul>

      <h2>7. Kişisel Veri Sahibinin Hakları (KVKK Madde 11)</h2>
      <p>
        KVKK&apos;nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki
        haklara sahipsiniz:
      </p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>
          Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
        </li>
        <li>
          Eksik veya yanlış işlenmişse düzeltilmesini, silinmesini veya yok
          edilmesini isteme
        </li>
        <li>
          KVKK&apos;ya aykırı işlenme nedeniyle zarara uğramanız halinde
          zararın giderilmesini talep etme
        </li>
      </ul>

      <h2>8. Başvuru Yöntemi</h2>
      <p>
        KVKK&apos;nın 11. maddesindeki haklarınızı kullanmak için aşağıdaki
        kanallardan bize ulaşabilirsiniz:
      </p>
      <ul>
        <li>
          <strong>Yazılı başvuru:</strong> {siteConfig.address}
        </li>
        <li>
          <strong>E-posta:</strong> donmezemre02@gmail.com (kayıtlı e-posta
          adresinizden)
        </li>
        <li>
          <strong>Telefon:</strong> {siteConfig.phone}
        </li>
      </ul>
      <p>
        Başvurunuz, talebin niteliğine göre en geç <strong>30 gün içinde</strong>{" "}
        ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet
        gerektirmesi halinde, KVK Kurulu&apos;nun belirlediği tarife üzerinden
        ücret talep edilebilir.
      </p>

      <h2>9. Değişiklikler</h2>
      <p>
        İşbu aydınlatma metni, mevzuat değişiklikleri veya hizmetlerimizdeki
        güncellemeler doğrultusunda zaman zaman güncellenebilir. Güncel sürüm
        her zaman bu sayfada yayınlanmaktadır.
      </p>
    </LegalPage>
  );
}
