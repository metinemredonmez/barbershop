import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { TrustBar } from "@/components/site/trust-bar";
import { Services } from "@/components/site/services";
import { About } from "@/components/site/about";
import { Gallery } from "@/components/site/gallery";
import { Booking } from "@/components/site/booking";
import { Reviews } from "@/components/site/reviews";
import { WorkingHours } from "@/components/site/working-hours";
import { Contact } from "@/components/site/contact";
import { FAQ } from "@/components/site/faq";
import { Footer } from "@/components/site/footer";
import { StickyCTA } from "@/components/site/sticky-cta";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Services services={services} />
        <About />
        <Gallery />
        <Booking services={services} />
        <Reviews />
        <WorkingHours />
        <Contact />
        <FAQ />
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
