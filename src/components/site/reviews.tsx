import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "./section-heading";
import { siteConfig } from "@/lib/site-config";

export function Reviews() {
  return (
    <section
      id="yorumlar"
      className="py-20 md:py-28 bg-gradient-to-b from-secondary/20 via-background to-background"
    >
      <div className="container-narrow">
        <SectionHeading
          eyebrow="Müşteri Yorumları"
          title="Gerçek Müşteri, Gerçek Deneyim"
          description="Google'da 25+ değerlendirme, ortalama 5.0 puan."
        />

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {siteConfig.reviews.map((r, i) => (
            <Card
              key={i}
              className="p-6 relative hover:border-gold/30 transition-colors"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-gold/10" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="h-4 w-4 fill-gold text-gold"
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                &ldquo;{r.text}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.service}
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold">
                  {r.name.charAt(0)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
