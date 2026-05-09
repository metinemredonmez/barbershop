import { Button } from "@/components/ui/button";
import { Scissors, Star, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/10 via-background to-background pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      <div
        className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-gold/5 blur-3xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-gold/5 blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className="container-narrow relative z-10 grid lg:grid-cols-2 gap-12 items-center py-16">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-gold">
            <Scissors className="h-3.5 w-3.5" />
            Premium Hair Artist
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
            <span className="block">Premium</span>
            <span className="block text-gold-gradient">Erkek Bakımı</span>
            <span className="block text-foreground/80">&amp; Modern Tıraş</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Anatomik saç kesimi, sakal tasarımı, klasik ustura tıraşı ve
            kişiye özel bakım hizmetleri.{" "}
            <span className="text-foreground/90">
              Online randevunu al, sıra bekleme.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="xl" variant="gold" asChild>
              <a href="#randevu">Randevu Al</a>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <a href="#hizmetler">Hizmetleri Gör</a>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-gold text-gold"
                  />
                ))}
              </div>
              <span className="text-foreground/80">5.0 / 5.0</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              <span>Maltepe / İstanbul</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/5] max-w-md mx-auto lg:ml-auto w-full">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/20 via-transparent to-gold/5 blur-2xl" />
          <div className="relative h-full rounded-2xl overflow-hidden border border-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/about.jpg"
              alt={`${siteConfig.brand} - Premium Hair Artist`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-gold/30 text-[10px] uppercase tracking-[0.2em] text-gold">
              {siteConfig.brand}
            </div>
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-black/60 backdrop-blur-md border border-gold/20">
              <div className="text-xs uppercase tracking-widest text-gold/80 mb-1">
                Çalışma Saatleri
              </div>
              <div className="text-sm font-medium">Pzt — Cmt · 09:30 — 21:00</div>
            </div>
          </div>
        </div>
      </div>

      <a
        href="#hizmetler"
        aria-label="Aşağı kaydır"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block animate-bounce text-muted-foreground hover:text-gold transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14m0 0l-7-7m7 7l7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </section>
  );
}
