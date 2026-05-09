import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();

const prisma = new PrismaClient();

const services = [
  {
    slug: "profesyonel-sac-kesimi",
    name: "Profesyonel Saç Kesimi",
    description: "Kişiye özel anatomik saç kesimi. Yüz şekline ve tarza özel.",
    durationMin: 30,
    price: 600,
    order: 1,
  },
  {
    slug: "profesyonel-sakal-kesimi",
    name: "Profesyonel Sakal Kesimi",
    description: "Yüz hatlarına göre keskin, ölçülü sakal tasarımı.",
    durationMin: 20,
    price: 300,
    order: 2,
  },
  {
    slug: "cocuk-sac-kesimi",
    name: "Çocuk Saç Kesimi",
    description: "Sabırlı ve nazik, çocuklara özel saç kesimi.",
    durationMin: 25,
    price: 500,
    order: 3,
  },
  {
    slug: "kas-alimi",
    name: "Kaş Alımı",
    description: "Yüz hatlarına uygun, kişiye özel kaş tasarımı.",
    durationMin: 15,
    price: 200,
    order: 4,
  },
  {
    slug: "agda",
    name: "Ağda",
    description: "Yüz ve boyun için temizlik ve şekillendirme ağdası.",
    durationMin: 15,
    price: 200,
    order: 5,
  },
  {
    slug: "keratin-bakimi",
    name: "Keratin · Saç Bakımı",
    description:
      "Saç kalitesine göre keratin ve onarıcı bakım. Fiyat saç boyuna göre değişir (500–800 ₺).",
    durationMin: 60,
    price: 500,
    order: 6,
  },
  {
    slug: "profesyonel-cilt-bakimi",
    name: "Profesyonel Cilt Bakımı",
    description: "Maske, peeling ve nemlendirme ile premium cilt bakımı.",
    durationMin: 40,
    price: 500,
    order: 7,
  },
  {
    slug: "cilt-bakimi",
    name: "Cilt Bakımı",
    description: "Standart yüz temizliği ve nemlendirme bakımı.",
    durationMin: 25,
    price: 200,
    order: 8,
  },
  {
    slug: "brezilya-fonu",
    name: "Brezilya Fönü",
    description: "Saçı uzun süreli düzleştiren ve parlatan profesyonel uygulama.",
    durationMin: 90,
    price: 800,
    order: 9,
  },
  {
    slug: "sac-boyama",
    name: "Saç Boyama",
    description:
      "Profesyonel saç boyama. Fiyat saç boyu ve teknik bağlı (800–1300 ₺).",
    durationMin: 75,
    price: 800,
    order: 10,
  },
  {
    slug: "vip-paket",
    name: "VIP Paket",
    description:
      "Teknik saç & sakal kesimi + cilt ve keratin bakımı + kaş tasarımı. 75 dakika premium deneyim.",
    durationMin: 75,
    price: 1900,
    order: 11,
  },
];

async function main() {
  // Eski hizmetleri temizle (yeni fiyat listesine geçiyoruz)
  await prisma.service.deleteMany({
    where: { slug: { notIn: services.map((s) => s.slug) } },
  });

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log(`${services.length} hizmet güncellendi.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
