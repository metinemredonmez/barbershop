import { LegalPage } from "@/components/site/legal-page";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: `İptal Politikası — ${siteConfig.brand}`,
  description: "Randevu iptal ve değişiklik kuralları.",
};

export default function IptalPage() {
  return (
    <LegalPage title="İptal & Değişiklik Politikası" updated="10 Mayıs 2026">
      <h2>1. Genel İlke</h2>
      <p>
        Müşterilerimize hızlı ve kaliteli hizmet sunabilmek için randevu
        süreçlerimizi titizlikle planlıyoruz. Geç bildirilen iptaller ve
        gelmeme durumları, hem işletmemiz hem de diğer müşterilerimiz için
        zaman kaybına neden olmaktadır. Bu politika, herkes için adil bir
        düzen sağlamak amacıyla hazırlanmıştır.
      </p>

      <h2>2. İptal Süreleri</h2>
      <ul>
        <li>
          <strong>2 saat öncesine kadar:</strong> Randevunuzu ücretsiz olarak
          iptal edebilir veya yeniden planlayabilirsiniz.
        </li>
        <li>
          <strong>2 saatten kısa sürede iptal:</strong> Geç iptal olarak
          değerlendirilir ve gelecek randevularınız için kapora talep
          edilebilir.
        </li>
        <li>
          <strong>Hiç bildirilmeden gelmeme:</strong> &quot;Gelmedi&quot;
          olarak kaydedilir.
        </li>
      </ul>

      <h2>3. Tekrarlayan Gelmeme Durumu</h2>
      <p>
        Aynı müşterinin kısa sürede birden fazla kez gelmediği durumlarda
        işletmemiz aşağıdaki haklara sahiptir:
      </p>
      <ul>
        <li>
          <strong>2 kez gelmeme:</strong> Bir sonraki randevu için kapora
          istenmesi
        </li>
        <li>
          <strong>3 kez gelmeme:</strong> Online randevu hakkının askıya
          alınması; randevuların yalnızca telefonla ve kapora ile
          alınabilmesi
        </li>
        <li>
          <strong>Sürekli gelmeme:</strong> Hizmet verme reddedilebilir
        </li>
      </ul>

      <h2>4. Kapora Sistemi</h2>
      <p>
        Aşağıdaki durumlarda hizmet öncesi kapora talep edilebilir:
      </p>
      <ul>
        <li>Damat Tıraşı paketi (1.500 ₺ ve üzeri hizmetler)</li>
        <li>VIP Paket (1.900 ₺)</li>
        <li>Saç Boyama (uzun süre alan uygulamalar)</li>
        <li>Daha önce gelmediği kayıt altına alınmış müşteriler</li>
      </ul>
      <p>
        <strong>Kapora şartları:</strong>
      </p>
      <ul>
        <li>
          Kapora tutarı, hizmet bedelinin %30&apos;una kadar olabilir.
        </li>
        <li>
          Hizmet bedeli ödendiğinde, kapora tutarı toplam bedelden düşülür.
        </li>
        <li>
          Randevu, en az 2 saat önceden iptal edilirse{" "}
          <strong>kapora iade edilir</strong>.
        </li>
        <li>
          Geç iptal veya gelmeme durumunda kapora{" "}
          <strong>iade edilmez</strong>.
        </li>
      </ul>

      <h2>5. İptal/Değişiklik Nasıl Yapılır?</h2>
      <p>Aşağıdaki kanallardan iptal veya değişiklik yapabilirsiniz:</p>
      <ul>
        <li>
          <strong>Telefon:</strong>{" "}
          <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
            {siteConfig.phone}
          </a>
        </li>
        <li>
          <strong>WhatsApp:</strong>{" "}
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp&apos;tan yaz
          </a>
        </li>
        <li>
          <strong>Yerinde:</strong> {siteConfig.address}
        </li>
      </ul>
      <p>
        E-posta üzerinden yapılan iptaller, çalışma saatleri içinde
        görülmemiş olabileceğinden tercih edilmez. <strong>En hızlı yöntem
        WhatsApp veya telefondur.</strong>
      </p>

      <h2>6. İşletme Kaynaklı İptaller</h2>
      <p>
        Aşağıdaki nedenlerle işletmemiz randevuyu iptal etmek zorunda
        kalabilir:
      </p>
      <ul>
        <li>Berberin sağlık durumu (hastalık, acil durum)</li>
        <li>Mekânda teknik sorun (su/elektrik kesintisi)</li>
        <li>Mücbir sebepler (doğal afet, salgın vb.)</li>
      </ul>
      <p>Böyle durumlarda:</p>
      <ul>
        <li>Sizinle en kısa sürede iletişime geçilir</li>
        <li>Yeni randevu için öncelikli planlama yapılır</li>
        <li>Ödenmiş kapora tam olarak iade edilir</li>
      </ul>

      <h2>7. Geç Geliş</h2>
      <ul>
        <li>
          Randevu saatinden <strong>15 dakika</strong> sonrasına kadar olan
          gecikmeler tolere edilir.
        </li>
        <li>
          15 dakikadan fazla gecikmelerde randevu süresi kısaltılabilir veya
          başka bir saate ertelenebilir.
        </li>
        <li>
          30 dakikadan fazla geç gelinmesi durumunda randevu iptal edilmiş
          sayılır.
        </li>
      </ul>

      <h2>8. İade Talepleri</h2>
      <p>
        Hizmet verildikten sonra ücret iadesi yapılmamaktadır. Hizmet
        kalitesinden memnun olmadığınız durumlarda lütfen mekânı terk etmeden
        önce işletme sahibine bildirin; mümkün olan en kısa sürede
        düzeltilmeye çalışılır.
      </p>

      <h2>9. İletişim</h2>
      <ul>
        <li>
          <strong>{siteConfig.brand}</strong>
        </li>
        <li>{siteConfig.address}</li>
        <li>Telefon: {siteConfig.phone}</li>
        <li>WhatsApp: {siteConfig.phone}</li>
      </ul>
    </LegalPage>
  );
}
