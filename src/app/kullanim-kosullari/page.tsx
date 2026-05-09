import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `Kullanım Koşulları — ${siteConfig.brand}`,
  description: "Web sitemizin ve hizmetlerimizin kullanım koşulları.",
};

export default function KullanimPage() {
  return (
    <LegalPage title="Kullanım Koşulları" updated="10 Mayıs 2026">
      <h2>1. Genel Hükümler</h2>
      <p>
        İşbu Kullanım Koşulları, <strong>{siteConfig.brand}</strong>{" "}
        (&quot;<strong>İşletme</strong>&quot;, &quot;<strong>biz</strong>&quot;)
        tarafından işletilen <strong>https://ogulcanates.com</strong>{" "}
        (&quot;<strong>Site</strong>&quot;) üzerinden sunulan online randevu ve
        bilgilendirme hizmetlerinin kullanımına ilişkin kuralları
        düzenlemektedir.
      </p>
      <p>
        Siteyi kullanarak veya online randevu oluşturarak, bu koşulları
        okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. Koşulları
        kabul etmiyorsanız siteyi kullanmamanız gerekmektedir.
      </p>

      <h2>2. Hizmetlerin Kapsamı</h2>
      <p>Site üzerinden aşağıdaki hizmetler sunulmaktadır:</p>
      <ul>
        <li>İşletme hakkında bilgilendirme (hizmetler, fiyatlar, konum)</li>
        <li>Online randevu oluşturma</li>
        <li>Randevu durum sorgulama (admin panel ile)</li>
        <li>İletişim kanallarına yönlendirme (telefon, WhatsApp, Instagram)</li>
      </ul>
      <p>
        Sitede yer alan fiyatlar, çalışma saatleri ve hizmet detayları
        bilgilendirme amaçlıdır ve önceden bildirim yapılmaksızın
        değiştirilebilir. Güncel fiyatlar her zaman site üzerindeki bilgilerdir.
      </p>

      <h2>3. Randevu Kuralları</h2>

      <h3>3.1. Randevu Oluşturma</h3>
      <ul>
        <li>
          Randevu oluşturmak için 18 yaşını doldurmuş olmanız (veya yasal
          temsilcinizin onayı ile) gerekir.
        </li>
        <li>
          Randevu formunda verdiğiniz bilgilerin (ad, soyad, telefon)
          doğruluğundan siz sorumlusunuz.
        </li>
        <li>
          Aynı saate birden fazla randevu oluşturulamaz; sistem çakışma
          kontrolü yapar.
        </li>
        <li>
          Randevu oluşturulduğunda otomatik olarak &quot;Bekliyor&quot;
          durumuna alınır; işletme onayı sonrasında &quot;Onaylı&quot;
          durumuna geçer.
        </li>
      </ul>

      <h3>3.2. İptal ve Değişiklik</h3>
      <ul>
        <li>
          Randevunuzu en az <strong>2 saat öncesinden</strong> iptal etmeniz
          veya değiştirmeniz beklenir.
        </li>
        <li>
          Bu süreden sonra yapılan iptaller veya gelmeme durumları{" "}
          <strong>&quot;Gelmedi&quot;</strong> olarak işaretlenir.
        </li>
        <li>
          Tekrarlayan gelmeme durumlarında, gelecek randevular için{" "}
          <strong>kapora</strong> talep edilebilir veya hizmet verme
          reddedilebilir.
        </li>
        <li>
          İptal/değişiklik için telefon ({siteConfig.phone}) veya WhatsApp
          üzerinden iletişime geçebilirsiniz.
        </li>
      </ul>

      <h3>3.3. Randevuya Geliş</h3>
      <ul>
        <li>
          Randevu saatinizde mekânımıza gelmeniz beklenir. 15 dakikadan fazla
          gecikmelerde, randevu süresi kısaltılabilir veya iptal edilebilir.
        </li>
        <li>
          VIP Paket gibi özel hizmetler için zamanında geliş özellikle
          önemlidir.
        </li>
      </ul>

      <h2>4. Ödeme Koşulları</h2>
      <ul>
        <li>
          Hizmet bedeli, hizmet sonunda nakit, kredi kartı, banka kartı veya
          havale/EFT yoluyla ödenebilir.
        </li>
        <li>Site üzerinden online ödeme alınmamaktadır.</li>
        <li>Damat tıraşı vb. özel paketler için ön ödeme talep edilebilir.</li>
        <li>
          Sitede gösterilen fiyatlar belirleyicidir; fiyat değişikliği
          durumunda hizmet anında yürürlükte olan fiyat geçerlidir.
        </li>
      </ul>

      <h2>5. Fikri Mülkiyet</h2>
      <p>
        Sitede yer alan tüm marka, logo, görsel, metin ve içerikler{" "}
        <strong>{siteConfig.brand}</strong>&apos;a aittir veya kullanım
        hakları lisans yoluyla alınmıştır. İzinsiz kopyalanması, çoğaltılması
        veya başka bir mecrada yayınlanması yasaktır.
      </p>

      <h2>6. Sorumluluk Sınırlandırması</h2>
      <ul>
        <li>
          Site, &quot;olduğu gibi&quot; sunulmaktadır. Kesintisiz veya hatasız
          çalışacağı garanti edilmez.
        </li>
        <li>
          Site üzerindeki üçüncü taraf bağlantılarının (Google Maps,
          Instagram, WhatsApp vb.) içeriklerinden işletmemiz sorumlu değildir.
        </li>
        <li>
          Mücbir sebepler (doğal afet, salgın, elektrik kesintisi vb.)
          nedeniyle hizmet verilememesi durumunda, randevu yeniden planlanır;
          tazminat talebi söz konusu olamaz.
        </li>
      </ul>

      <h2>7. Hizmet Verme Hakkı</h2>
      <p>
        İşletmemiz aşağıdaki durumlarda hizmet verme hakkını saklı tutar:
      </p>
      <ul>
        <li>Müşterinin saygı sınırlarını aşan davranışı</li>
        <li>Tekrarlayan gelmeme durumları</li>
        <li>Bulaşıcı hastalık şüphesi (sağlık güvenliği için)</li>
        <li>Alkol/uyuşturucu etkisi altında geliş</li>
      </ul>

      <h2>8. Kişisel Veriler</h2>
      <p>
        Kişisel verilerinizin işlenmesi ile ilgili detaylı bilgi için lütfen{" "}
        <a href="/kvkk">KVKK Aydınlatma Metni</a>&apos;mizi inceleyin. Site
        üzerindeki çerez kullanımı için{" "}
        <a href="/cerez-politikasi">Çerez Politikası</a> sayfasına bakabilirsiniz.
      </p>

      <h2>9. Değişiklikler</h2>
      <p>
        İşletmemiz, bu Kullanım Koşullarını önceden bildirim yapmaksızın
        değiştirme hakkını saklı tutar. Güncel sürüm her zaman bu sayfada
        yayınlanır. Değişikliklerden sonra siteyi kullanmaya devam etmeniz,
        güncel koşulları kabul ettiğiniz anlamına gelir.
      </p>

      <h2>10. Uyuşmazlık Çözümü</h2>
      <p>
        İşbu koşullarla ilgili her türlü uyuşmazlığın çözümünde Türkiye
        Cumhuriyeti kanunları uygulanır ve İstanbul (Anadolu) Mahkemeleri ile
        İcra Daireleri yetkilidir.
      </p>

      <h2>11. İletişim</h2>
      <ul>
        <li>
          <strong>{siteConfig.brand}</strong>
        </li>
        <li>{siteConfig.address}</li>
        <li>Telefon: {siteConfig.phone}</li>
        <li>E-posta: donmezemre02@gmail.com</li>
      </ul>
    </LegalPage>
  );
}
