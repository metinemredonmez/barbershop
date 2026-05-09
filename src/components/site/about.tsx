import { Award, MapPin, Sparkles, Instagram } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const expertise = [
  { icon: Sparkles, label: "Anatomik Kesim" },
  { icon: Sparkles, label: "Sakal Tasarımı" },
  { icon: Sparkles, label: "Klasik Tıraş" },
  { icon: Sparkles, label: "Damat Bakımı" },
];

export function About() {
  return (
    <section
      id="hakkimda"
      className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative"
    >
      <div className="container-narrow grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[3/4] max-w-md w-full mx-auto lg:mx-0">
          <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-gold/20 via-transparent to-gold/5 blur-2xl" />
          <div className="relative h-full rounded-2xl overflow-hidden border border-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&q=80&auto=format&fit=crop"
              alt={`${siteConfig.name} - ${siteConfig.brand}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="font-display text-2xl font-bold tracking-wider text-white">
                {siteConfig.name.toUpperCase()}
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold/80 mt-1">
                Master Hair Artist
              </div>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 hidden md:block bg-card border border-gold/30 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-2 text-gold mb-1">
              <Award className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest">Google 5.0</span>
            </div>
            <div className="text-sm font-medium">25+ Yorum</div>
          </div>
        </div>

        <div>
          <SectionHeading
            align="left"
            eyebrow="Ustanı Tanı"
            title={
              <>
                Tıraş değil, <span className="text-gold-gradient">stil</span>{" "}
                yaratıyoruz.
              </>
            }
          />
          <div className="mt-8 space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Ben{" "}
              <span className="text-foreground font-medium">
                {siteConfig.name}
              </span>
              . Erkek anatomik saç ve sakal kesimi, marjinal kadın saç kesimi
              ve özel bakım hizmetleri sunuyorum. Amacım sadece tıraş yapmak
              değil; yüz şekline, tarzına ve günlük hayatına uygun bir görünüm
              oluşturmak.
            </p>
            <p>
              Modern berber kültürünü geleneksel tıraş ritüeliyle
              birleştiriyorum. &ldquo;Her saç bir projedir; her kesim bir
              imza bırakır.&rdquo;
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {expertise.map((e) => (
              <div
                key={e.label}
                className="flex items-center gap-3 p-3 rounded-md border border-border/60 bg-secondary/30"
              >
                <e.icon className="h-4 w-4 text-gold shrink-0" />
                <span className="text-sm font-medium">{e.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              {siteConfig.address}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a
                href={`https://instagram.com/${siteConfig.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4 mr-2" />@{siteConfig.instagram}
              </a>
            </Button>
            <Button variant="gold" asChild>
              <a href="#randevu">Randevu Al</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
