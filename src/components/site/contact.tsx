import { MapPin, Phone, MessageCircle, Instagram, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { siteConfig } from "@/lib/site-config";

export function Contact() {
  return (
    <section id="iletisim" className="py-20 md:py-28">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Konum & İletişim"
          title="Bizi Bulun"
          description="Bağdat Caddesi'nin kalbinde, kolay ulaşılabilir bir lokasyondayız."
        />

        <div className="mt-16 grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden p-0 aspect-[16/10] lg:aspect-auto relative">
            <iframe
              src={siteConfig.mapUrl}
              className="absolute inset-0 w-full h-full grayscale-[40%] contrast-110"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Konum"
            />
          </Card>

          <div className="space-y-3">
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Adres
                  </div>
                  <div className="text-sm font-medium leading-relaxed">
                    {siteConfig.address}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                asChild
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    siteConfig.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="h-3.5 w-3.5 mr-2" />
                  Yol Tarifi Al
                </a>
              </Button>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Telefon
                  </div>
                  <a
                    href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                    className="text-sm font-medium hover:text-gold transition-colors"
                  >
                    {siteConfig.phone}
                  </a>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-md bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-gold" />
                </div>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    WhatsApp / Instagram
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://wa.me/${siteConfig.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://instagram.com/${siteConfig.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
