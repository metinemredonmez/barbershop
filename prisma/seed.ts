import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  {
    slug: "sac-kesimi",
    name: "Saç Kesimi",
    description: "Yüz şekline uygun, kişiye özel modern saç kesimi.",
    durationMin: 30,
    price: 400,
    order: 1,
  },
  {
    slug: "sakal-tasarimi",
    name: "Sakal Tasarımı",
    description: "Yüz hatlarına göre keskin, ölçülü sakal tasarımı.",
    durationMin: 20,
    price: 250,
    order: 2,
  },
  {
    slug: "sac-sakal",
    name: "Saç + Sakal",
    description: "Komple bakım: saç kesimi ve sakal tasarımı bir arada.",
    durationMin: 45,
    price: 600,
    order: 3,
  },
  {
    slug: "klasik-tras",
    name: "Klasik Ustura Tıraşı",
    description: "Sıcak havlu, köpük ve usturayla geleneksel tıraş ritüeli.",
    durationMin: 30,
    price: 350,
    order: 5,
  },
  {
    slug: "damat-trasi",
    name: "Damat Tıraşı",
    description: "Düğün gününüz için VIP komple bakım paketi.",
    durationMin: 90,
    price: 1500,
    order: 6,
  },
  {
    slug: "cocuk-trasi",
    name: "Çocuk Tıraşı",
    description: "Sabırlı ve nazik, çocuklar için özel saç kesimi.",
    durationMin: 25,
    price: 300,
    order: 7,
  },
  {
    slug: "cilt-bakimi",
    name: "Cilt Bakımı",
    description: "Maske, peeling ve nemlendirme ile yüz bakımı.",
    durationMin: 40,
    price: 700,
    order: 8,
  },
];

async function main() {
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log("Hizmetler eklendi.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
