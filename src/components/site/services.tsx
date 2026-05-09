import { Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { formatPrice } from "@/lib/utils";

type Service = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
};

export function Services({ services }: { services: Service[] }) {
  return (
    <section id="hizmetler" className="py-20 md:py-28 relative">
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Hizmetler"
          title="Klasiğin ve Modernin Buluştuğu Yer"
          description="Her hizmet özenle uygulanır. Fiyat ve süre net, sürpriz yok."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s) => (
            <Card
              key={s.id}
              className="group relative overflow-hidden p-6 hover:border-gold/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl group-hover:bg-gold/10 transition-colors" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    {s.name}
                  </h3>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-gold group-hover:rotate-45 transition-all" />
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 min-h-[60px]">
                    {s.description}
                  </p>
                )}
                <div className="flex items-end justify-between pt-4 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{s.durationMin} dk</span>
                  </div>
                  <div className="font-display text-2xl font-bold text-gold">
                    {formatPrice(s.price)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button size="lg" variant="gold" asChild>
            <a href="#randevu">Hemen Randevu Al</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
