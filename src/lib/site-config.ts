export const siteConfig = {
  name: process.env.NEXT_PUBLIC_BARBER_NAME || "Ali Usta",
  brand: process.env.NEXT_PUBLIC_BARBER_BRAND || "ALI BARBER",
  tagline:
    process.env.NEXT_PUBLIC_BARBER_TAGLINE || "Premium Erkek Bakımı",
  phone: process.env.NEXT_PUBLIC_BARBER_PHONE || "+90 555 123 45 67",
  whatsapp: process.env.NEXT_PUBLIC_BARBER_WHATSAPP || "905551234567",
  instagram: process.env.NEXT_PUBLIC_BARBER_INSTAGRAM || "alibarber",
  address:
    process.env.NEXT_PUBLIC_BARBER_ADDRESS ||
    "Bağdat Caddesi No:123, Kadıköy / İstanbul",
  mapUrl:
    process.env.NEXT_PUBLIC_BARBER_MAP ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12039.408!2d29.0263!3d40.9659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650b33ddcd%3A0x1!2sKad%C4%B1k%C3%B6y!5e0!3m2!1str!2str!4v1700000000000",
  workingHours: [
    { day: "Pazartesi", hours: "09:30 — 21:00" },
    { day: "Salı", hours: "09:30 — 21:00" },
    { day: "Çarşamba", hours: "09:30 — 21:00" },
    { day: "Perşembe", hours: "09:30 — 21:00" },
    { day: "Cuma", hours: "09:30 — 21:00" },
    { day: "Cumartesi", hours: "09:30 — 21:00" },
    { day: "Pazar", hours: "Kapalı", closed: true },
  ],
  stats: [
    { label: "Google Puanı", value: "5.0" },
    { label: "Google Yorumu", value: "25+" },
    { label: "Maltepe", value: "İstanbul" },
    { label: "Online Randevu", value: "7/24" },
  ],
  reviews: [
    {
      name: "Mehmet K.",
      service: "Anatomik Saç Kesimi",
      rating: 5,
      text: "Maltepe'de bu kalitede berber bulmak zor. Oğulcan usta yüz şeklime göre kesim önerdi, anlatmama bile gerek kalmadı. Modern berber kültürü ne demek burada anladım.",
    },
    {
      name: "Burak T.",
      service: "Saç + Sakal",
      rating: 5,
      text: "Saç kesimi keskin ve dengeli, sakal tasarımı çok temiz. Randevu saatinde başladı, ortam tertemiz, ilgi profesyonel. Artık sürekli müşteriyim.",
    },
    {
      name: "Cem Y.",
      service: "Damat Tıraşı",
      rating: 5,
      text: "Düğünüm için Oğulcan Ateş Barber's Club'ı tercih ettim. Cilt bakımı, sakal, saç hepsi tek elden, profesyonel. Eşim ve yakınlarım da çok beğendi. Tavsiye ederim.",
    },
    {
      name: "Onur D.",
      service: "Klasik Ustura Tıraşı",
      rating: 5,
      text: "Sıcak havlu ve usturayla tıraş başka bir his. Modern berber teknikleriyle klasik ritüeli birleştiriyor. Maltepe'nin en iyilerinden, fiyat performans çok iyi.",
    },
    {
      name: "Kaan S.",
      service: "Saç Kesimi",
      rating: 5,
      text: "İşinin gerçekten ehli. Modern ve klasik aynı anda. Online randevu da çok pratik, telefondan 30 saniyede aldım. Mekânın atmosferi de bir o kadar güzel.",
    },
  ],
  faqs: [
    {
      q: "Randevusuz gelebilir miyim?",
      a: "Yoğunluk sebebiyle randevusuz hizmet veremiyoruz. Online randevu almanız 30 saniye sürmektedir.",
    },
    {
      q: "Randevu iptali nasıl yapılır?",
      a: "Randevunuzu iptal etmek için en az 2 saat önceden bizi aramanız gerekmektedir. Aksi halde gelmeme sayılır.",
    },
    {
      q: "Saç + sakal işlemi ne kadar sürer?",
      a: "Saç + sakal ortalama 45 dakika, damat tıraşı paketi ise 90 dakika sürmektedir.",
    },
    {
      q: "Çocuk tıraşı yapıyor musunuz?",
      a: "Evet, çocuklara özel sabırlı ve nazik bir kesim sunuyoruz. 25 dakika ortalama süresi vardır.",
    },
    {
      q: "Damat tıraşı için özel paket var mı?",
      a: "Evet, damat paketimiz cilt bakımı, sakal tasarımı, saç kesimi ve sıcak havlu tıraşını kapsar.",
    },
    {
      q: "Kapora gerekiyor mu?",
      a: "Standart hizmetlerde kapora alınmamaktadır. Damat tıraşı gibi özel paketler için ön ödeme talep edilebilir.",
    },
    {
      q: "Hangi ödeme yöntemleri kabul ediliyor?",
      a: "Nakit, kredi kartı, banka kartı ve havale/EFT kabul edilmektedir.",
    },
  ],
  gallery: [
    { id: 1, label: "Anatomik Kesim", style: "classic" },
    { id: 2, label: "Klasik Kesim", style: "classic" },
    { id: 3, label: "Modern Sakal", style: "beard" },
    { id: 4, label: "Pompadour", style: "classic" },
    { id: 5, label: "Marjinal Kesim", style: "classic" },
    { id: 6, label: "Damat Paketi", style: "groom" },
    { id: 7, label: "Çocuk Kesimi", style: "kids" },
    { id: 8, label: "Ustura Tıraşı", style: "shave" },
  ],
};

export type SiteConfig = typeof siteConfig;
